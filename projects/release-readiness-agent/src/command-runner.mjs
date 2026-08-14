/*
 * Copyright 2026 Borealbit Technology Limited
 * Licensed under the Apache License, Version 2.0.
 */

import { createHash } from 'node:crypto'
import { lstat, readFile, readdir } from 'node:fs/promises'
import { dirname, isAbsolute, relative, resolve, sep } from 'node:path'
import { spawn } from 'node:child_process'

const OUTPUT_LIMIT = 4_000
const SNAPSHOT_FILE_LIMIT = 2_000
const SNAPSHOT_BYTE_LIMIT = 1_048_576
const IGNORED_DIRECTORIES = new Set(['.git', 'node_modules'])

function inside(root, target) {
  const offset = relative(root, target)
  return offset === '' || (
    !offset.startsWith(`..${sep}`)
    && offset !== '..'
    && !isAbsolute(offset)
  )
}

function appendBounded(state, chunk) {
  const text = chunk.toString('utf8')
  const remaining = OUTPUT_LIMIT - state.text.length
  if (remaining > 0) state.text += text.slice(0, remaining)
  if (text.length > remaining) state.truncated = true
}

async function snapshotTree(root) {
  const queue = ['']
  const snapshot = new Map()
  let count = 0
  while (queue.length > 0) {
    const directory = queue.shift()
    const entries = await readdir(resolve(root, directory), { withFileTypes: true })
    entries.sort((left, right) => left.name.localeCompare(right.name))
    for (const entry of entries) {
      const path = directory.length === 0 ? entry.name : `${directory}/${entry.name}`
      if (entry.isSymbolicLink()) {
        snapshot.set(path, 'symlink')
        continue
      }
      if (entry.isDirectory()) {
        if (!IGNORED_DIRECTORIES.has(entry.name)) queue.push(path)
        continue
      }
      if (!entry.isFile()) continue
      count += 1
      if (count > SNAPSHOT_FILE_LIMIT) throw new Error('command snapshot exceeded its file limit')
      const target = resolve(root, path)
      const metadata = await lstat(target)
      const digest = metadata.size > SNAPSHOT_BYTE_LIMIT
        ? `oversized:${metadata.size}:${metadata.mtimeMs}`
        : createHash('sha256').update(await readFile(target)).digest('hex')
      snapshot.set(path, digest)
    }
  }
  return snapshot
}

function changedPaths(before, after) {
  const paths = new Set([...before.keys(), ...after.keys()])
  return [...paths].filter(path => before.get(path) !== after.get(path)).sort()
}

function classifyChanges(paths, allowed) {
  const allowedSet = new Set(allowed)
  return {
    declared: paths.filter(path => allowedSet.has(path)),
    undeclared: paths.filter(path => !allowedSet.has(path)),
  }
}

function execute(root, command, signal) {
  return new Promise(resolveResult => {
    const stdout = { text: '', truncated: false }
    const stderr = { text: '', truncated: false }
    let timedOut = false
    let cancelled = false
    let settled = false
    const child = spawn(process.execPath, command.argv.slice(1), {
      cwd: root,
      env: {
        LANG: 'C',
        LC_ALL: 'C',
        NODE_ENV: 'test',
        PATH: dirname(process.execPath),
      },
      shell: false,
      stdio: ['ignore', 'pipe', 'pipe'],
      windowsHide: true,
    })
    child.stdout.on('data', chunk => appendBounded(stdout, chunk))
    child.stderr.on('data', chunk => appendBounded(stderr, chunk))
    const timeout = setTimeout(() => {
      timedOut = true
      child.kill('SIGTERM')
    }, command.timeoutMs)
    const abort = () => {
      cancelled = true
      child.kill('SIGTERM')
    }
    signal?.addEventListener('abort', abort, { once: true })
    if (signal?.aborted) abort()

    const finish = value => {
      if (settled) return
      settled = true
      clearTimeout(timeout)
      signal?.removeEventListener('abort', abort)
      resolveResult({ ...value, stdout, stderr, timedOut, cancelled })
    }
    child.on('error', error => finish({ exitCode: null, error: error.message }))
    child.on('close', (code, closeSignal) => finish({ exitCode: code, signal: closeSignal }))
  })
}

export async function runDeclaredCommand({ root, command, planDigest, approval, signal, now }) {
  const script = resolve(root, command.argv[1])
  if (!inside(root, script)) throw new Error(`${command.id} script escaped repository root`)
  const scriptMetadata = await lstat(script)
  if (!scriptMetadata.isFile() || scriptMetadata.isSymbolicLink()) {
    throw new Error(`${command.id} script must be a regular non-symlink file`)
  }

  let approvalOutcome = 'not-required'
  if (command.writesWorkspace) {
    approvalOutcome = await approval.request({
      actionId: `command:${command.id}:${planDigest.slice(0, 12)}`,
      reason: `${command.id} may write only: ${command.allowedWritePaths.join(', ')}`,
    })
    if (approvalOutcome !== 'allowed-once') {
      return {
        id: command.id,
        status: 'skipped',
        reason: `mutation approval ${approvalOutcome}`,
        writesWorkspace: true,
        allowedWritePaths: [...command.allowedWritePaths],
        changedPaths: [],
        undeclaredWritePaths: [],
        approvalOutcome,
      }
    }
  }

  const before = await snapshotTree(root)
  const startedAt = now()
  const execution = await execute(root, command, signal)
  const endedAt = now()
  const after = await snapshotTree(root)
  const changes = changedPaths(before, after)
  const classified = classifyChanges(changes, command.allowedWritePaths)
  let status = execution.exitCode === 0 ? 'passed' : 'failed'
  let reason = execution.exitCode === 0 ? null : `exit code ${String(execution.exitCode)}`
  if (execution.timedOut) {
    status = 'timed-out'
    reason = `exceeded ${command.timeoutMs} ms`
  } else if (execution.cancelled) {
    status = 'cancelled'
    reason = 'caller cancelled the command'
  } else if (execution.error !== undefined) {
    status = 'failed'
    reason = execution.error
  }
  if (classified.undeclared.length > 0) {
    status = 'failed'
    reason = 'command changed undeclared workspace paths'
  }

  return {
    id: command.id,
    status,
    reason,
    writesWorkspace: command.writesWorkspace,
    allowedWritePaths: [...command.allowedWritePaths],
    changedPaths: changes,
    undeclaredWritePaths: classified.undeclared,
    approvalOutcome,
    exitCode: execution.exitCode,
    signal: execution.signal ?? null,
    durationMs: Math.max(0, endedAt - startedAt),
    stdout: execution.stdout.text.trimEnd(),
    stdoutTruncated: execution.stdout.truncated,
    stderr: execution.stderr.text.trimEnd(),
    stderrTruncated: execution.stderr.truncated,
  }
}

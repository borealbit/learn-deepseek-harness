/*
 * Copyright 2026 Borealbit Technology Limited
 * Licensed under the Apache License, Version 2.0.
 */

import { cp, lstat, mkdir, mkdtemp, rename, rm, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { createApprovalController, createFixtureBuildApprovalController } from '../src/approval.mjs'
import { runReleaseReadinessAgent } from '../src/release-readiness-agent.mjs'

if (process.argv.length !== 3 || process.argv[2] !== '--approve-write-evidence') {
  process.stderr.write('Refusing to write evidence without --approve-write-evidence.\n')
  process.exitCode = 1
} else {
  const projectRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..')
  const source = resolve(projectRoot, 'fixtures/release-candidate')
  const evidenceDirectory = resolve(projectRoot, 'evidence')
  const temporaryRoot = await mkdtemp(resolve(tmpdir(), 'module12-evidence-'))

  function deterministicClock(start) {
    let value = start
    return () => {
      value += 5
      return value
    }
  }

  async function atomicWrite(path, content) {
    const temporary = `${path}.tmp`
    await writeFile(temporary, content)
    await rename(temporary, path)
  }

  try {
    const successRoot = resolve(temporaryRoot, 'success')
    const blockedRoot = resolve(temporaryRoot, 'blocked')
    await cp(source, successRoot, { recursive: true, errorOnExist: true })
    await cp(source, blockedRoot, { recursive: true, errorOnExist: true })
    await writeFile(resolve(blockedRoot, '.env.production'), 'API_TOKEN=fixture-value-not-a-secret\n')
    await writeFile(resolve(blockedRoot, 'FAIL_TEST'), 'synthetic failure switch\n')

    const success = await runReleaseReadinessAgent(successRoot, {
      approval: createFixtureBuildApprovalController(),
      runId: 'module12-golden-success',
      baseTime: 1_786_665_600_000,
      now: deterministicClock(1_786_665_600_000),
    })
    const blocked = await runReleaseReadinessAgent(blockedRoot, {
      approval: createApprovalController(),
      runId: 'module12-golden-blocked',
      baseTime: 1_786_665_660_000,
      now: deterministicClock(1_786_665_660_000),
    })

    const writeApproval = createApprovalController({ 'evidence:materialize': 'allowed-once' })
    const outcome = await writeApproval.request({
      actionId: 'evidence:materialize',
      reason: 'Write four deterministic golden files below projects/release-readiness-agent/evidence.',
    })
    if (outcome !== 'allowed-once') throw new Error(`evidence write ${outcome}`)
    await mkdir(evidenceDirectory, { recursive: true })
    const metadata = await lstat(evidenceDirectory)
    if (!metadata.isDirectory() || metadata.isSymbolicLink()) {
      throw new Error('evidence target must be a non-symlink directory')
    }
    await atomicWrite(
      resolve(evidenceDirectory, 'golden-success.report.json'),
      `${JSON.stringify(success.report, null, 2)}\n`,
    )
    await atomicWrite(
      resolve(evidenceDirectory, 'golden-success.session.jsonl'),
      success.sessionJsonl,
    )
    await atomicWrite(
      resolve(evidenceDirectory, 'golden-blocked.report.json'),
      `${JSON.stringify(blocked.report, null, 2)}\n`,
    )
    await atomicWrite(
      resolve(evidenceDirectory, 'golden-blocked.session.jsonl'),
      blocked.sessionJsonl,
    )
    process.stdout.write('Materialized four approved deterministic evidence files.\n')
  } finally {
    await rm(temporaryRoot, { recursive: true, force: true })
  }
}


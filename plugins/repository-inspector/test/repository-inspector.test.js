/*
 * Copyright 2026 Borealbit Technology Limited
 * Licensed under the Apache License, Version 2.0.
 */

import assert from 'node:assert/strict'
import { mkdtemp, mkdir, symlink, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import test from 'node:test'
import { fileURLToPath } from 'node:url'

import { Context } from '@deepseek-ai/cordis'
import { CallId } from '@deepseek-ai/dsh-llm'
import SystemPrompt from '@deepseek-ai/dsh-system-prompt'
import ToolRuntime from '@deepseek-ai/dsh-tools'

import * as RepositoryInspector from '../lib/index.js'
import { createOverlay } from '../scripts/create-overlay.mjs'

const fixture = fileURLToPath(new URL('fixtures/sample-repository/', import.meta.url))
const signal = new AbortController().signal

test('returns bounded structured metadata without manifest command values', async () => {
  const options = RepositoryInspector.normalizeInspectorOptions({ allowedRoot: fixture })
  const result = await RepositoryInspector.inspectRepository({ ...options, path: '.', signal })

  assert.equal(result.path, '.')
  assert.equal(result.readOnly, true)
  assert.equal(result.untrusted, true)
  assert.equal(result.truncated, false)
  assert.deepEqual(result.entries, [
    { name: 'README.md', kind: 'file' },
    { name: 'package.json', kind: 'file' },
    { name: 'src', kind: 'directory' },
  ])
  assert.deepEqual(result.manifest, {
    name: 'sample-release-app',
    version: '1.2.3',
    private: true,
    scriptNames: ['build', 'test'],
  })
  assert.equal(JSON.stringify(result).includes('node --test'), false)
})

test('sorts before applying the configured entry cap', async () => {
  const options = RepositoryInspector.normalizeInspectorOptions({ allowedRoot: fixture, maxEntries: 2 })
  const result = await RepositoryInspector.inspectRepository({ ...options })
  assert.deepEqual(result.entries.map(entry => entry.name), ['README.md', 'package.json'])
  assert.equal(result.truncated, true)
})

test('rejects absolute paths, traversal, and invalid deployment bounds', async () => {
  const options = RepositoryInspector.normalizeInspectorOptions({ allowedRoot: fixture })
  await assert.rejects(
    RepositoryInspector.inspectRepository({ ...options, path: tmpdir() }),
    /relative to allowedRoot/,
  )
  await assert.rejects(
    RepositoryInspector.inspectRepository({ ...options, path: '../outside' }),
    /escapes allowedRoot/,
  )
  assert.throws(
    () => RepositoryInspector.normalizeInspectorOptions({ allowedRoot: 'relative' }),
    /absolute path/,
  )
  assert.throws(
    () => RepositoryInspector.normalizeInspectorOptions({ allowedRoot: fixture, maxEntries: 101 }),
    /maxEntries/,
  )
})

test('rejects an in-root directory link that resolves outside the boundary', { skip: process.platform === 'win32' }, async () => {
  const root = await mkdtemp(join(tmpdir(), 'dsh-inspector-root-'))
  const outside = await mkdtemp(join(tmpdir(), 'dsh-inspector-outside-'))
  await symlink(outside, join(root, 'escape'))

  const options = RepositoryInspector.normalizeInspectorOptions({ allowedRoot: root })
  await assert.rejects(
    RepositoryInspector.inspectRepository({ ...options, path: 'escape' }),
    /symbolic link/,
  )
})

test('does not follow a package.json symbolic link', { skip: process.platform === 'win32' }, async () => {
  const root = await mkdtemp(join(tmpdir(), 'dsh-inspector-root-'))
  const outside = await mkdtemp(join(tmpdir(), 'dsh-inspector-outside-'))
  await writeFile(join(outside, 'package.json'), '{"name":"outside-secret"}\n')
  await symlink(join(outside, 'package.json'), join(root, 'package.json'))

  const options = RepositoryInspector.normalizeInspectorOptions({ allowedRoot: root })
  const result = await RepositoryInspector.inspectRepository({ ...options })
  assert.equal(result.manifest, null)
  assert.deepEqual(result.warnings, ['package.json is a symbolic link and was not followed'])
  assert.equal(JSON.stringify(result).includes('outside-secret'), false)
})

test('caps manifest acquisition and honors a pre-aborted call', async () => {
  const root = await mkdtemp(join(tmpdir(), 'dsh-inspector-bounds-'))
  await writeFile(join(root, 'package.json'), `{"name":"${'x'.repeat(1_100)}"}\n`)
  const options = RepositoryInspector.normalizeInspectorOptions({
    allowedRoot: root,
    maxManifestBytes: 1_024,
  })
  const result = await RepositoryInspector.inspectRepository({ ...options })
  assert.equal(result.manifest, null)
  assert.deepEqual(result.warnings, ['package.json exceeds the 1024-byte inspection limit'])

  const controller = new AbortController()
  controller.abort()
  await assert.rejects(
    RepositoryInspector.inspectRepository({ ...options, signal: controller.signal }),
    error => error instanceof Error && error.name === 'AbortError',
  )
})

test('registers, executes, rejects escape, and unregisters through the real Tool runtime', async () => {
  const ctx = new Context()
  await ctx.plugin(SystemPrompt)
  await ctx.plugin(ToolRuntime)
  const fiber = await ctx.plugin(RepositoryInspector, { allowedRoot: fixture, maxEntries: 3 })

  assert.deepEqual(ctx.tools.schemas().map(schema => schema.name), ['inspect_repository'])

  const success = await ctx.tools.execute({
    callId: CallId('module07-success'),
    name: 'inspect_repository',
    arguments: { path: '.' },
    signal,
  })
  assert.equal(success.isError, false)
  if (success.isError) throw new Error('expected success')
  assert.equal(success.value.readOnly, true)
  assert.equal(success.value.untrusted, true)
  assert.match(success.content[0]?.type === 'text' ? success.content[0].text : '', /sample-release-app/)
  assert.match(success.content[0]?.type === 'text' ? success.content[0].text : '', /Untrusted repository metadata/)

  const denied = await ctx.tools.execute({
    callId: CallId('module07-denied'),
    name: 'inspect_repository',
    arguments: { path: '..' },
    signal,
  })
  assert.equal(denied.isError, true)
  assert.match(denied.error?.message ?? '', /escapes allowedRoot/)

  const unknown = await ctx.tools.execute({
    callId: CallId('module07-unknown'),
    name: 'inspect_repository',
    arguments: { path: '.', secretMode: true },
    signal,
  })
  assert.equal(unknown.isError, true)
  assert.match(unknown.error?.message ?? '', /unsupported argument: secretMode/)

  await fiber.dispose()
  assert.deepEqual(ctx.tools.schemas(), [])
})

test('creates a one-run overlay with absolute, YAML-quoted boundaries', async () => {
  const directory = await mkdtemp(join(tmpdir(), 'dsh-inspector-overlay-'))
  const root = join(directory, "repository's copy")
  await mkdir(root)
  const output = join(directory, 'plugin.patch.yml')
  const result = await createOverlay({ allowedRoot: root, output })

  assert.equal(result.destination, output)
  assert.match(result.yaml, /borealbit-repository-inspector/)
  assert.match(result.yaml, /repository''s copy/)
  await assert.rejects(createOverlay({ allowedRoot: root, output }), /EEXIST/)
})

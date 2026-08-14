/*
 * Copyright 2026 Borealbit Technology Limited
 * Licensed under the Apache License, Version 2.0.
 */

import assert from 'node:assert/strict'
import { access, mkdir, readFile, writeFile } from 'node:fs/promises'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const mode = process.argv[2]

if (!['lint', 'test', 'build'].includes(mode)) {
  throw new Error('usage: node scripts/check.mjs <lint|test|build>')
}

if (mode === 'lint') {
  const source = await readFile(resolve(root, 'src/index.js'), 'utf8')
  assert.equal(source.includes('\t'), false, 'source must not contain tabs')
  assert.equal(source.split('\n').some(line => /\s+$/.test(line)), false,
    'source must not contain trailing whitespace')
  try {
    await access(resolve(root, 'PRINT_SENTINEL'))
    process.stdout.write(`sk-${'A'.repeat(24)}\n`)
  } catch (error) {
    if (error?.code !== 'ENOENT') throw error
  }
  process.stdout.write('lint: pass\n')
}

if (mode === 'test') {
  await assert.rejects(access(resolve(root, 'FAIL_TEST')), /ENOENT/)
  const { releaseMessage } = await import('../src/index.js')
  assert.equal(releaseMessage(' capstone '), 'release candidate: capstone')
  assert.throws(() => releaseMessage(''), /non-empty/)
  process.stdout.write('test: pass\n')
}

if (mode === 'build') {
  const output = resolve(root, 'dist/artifact.json')
  await mkdir(dirname(output), { recursive: true })
  await writeFile(output, `${JSON.stringify({ schemaVersion: 1, built: true }, null, 2)}\n`)
  process.stdout.write('build: pass; wrote dist/artifact.json\n')
}

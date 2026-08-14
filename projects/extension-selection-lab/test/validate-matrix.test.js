/*
 * Copyright 2026 Borealbit Technology Limited
 * Licensed under the Apache License, Version 2.0.
 */

import assert from 'node:assert/strict'
import fs from 'node:fs'
import test from 'node:test'
import { fileURLToPath } from 'node:url'

import { validateMatrix } from '../src/validate-matrix.js'

const templateUrl = new URL(
  '../../../course/en/06-plugins-tools-skills-mcp/EXTENSION-DECISION-MATRIX.md',
  import.meta.url,
)
const template = fs.readFileSync(fileURLToPath(templateUrl), 'utf8')

function completedMatrix() {
  let scoreIndex = 0
  let primaryIndex = 0
  const completeRows = [
    '| Tool | 1 | 1 | 2 | 2 | 0 | 1 | 7 | reviewed |',
    '| Skill | 2 | 2 | 2 | 2 | 2 | 2 | 12 | reviewed |',
    '| MCP | 0 | 1 | 0 | 0 | 1 | 0 | 2 | vetoed |',
    '| Native DSH plugin | 1 | 0 | 1 | 1 | 2 | 0 | 5 | reviewed |',
  ]
  const primaryMechanisms = ['Skill', 'MCP', 'Native DSH plugin']

  return template
    .replace(/^\| (Tool|Skill|MCP|Native DSH plugin) \| TODO: \| TODO: \| TODO: \| TODO: \| TODO: \| TODO: \| TODO: \| TODO: \|$/gm, () => {
      const row = completeRows[scoreIndex % completeRows.length]
      scoreIndex += 1
      return row
    })
    .replace(/^\| Primary mechanism \| TODO: \|$/gm, () => {
      const mechanism = primaryMechanisms[primaryIndex]
      primaryIndex += 1
      return `| Primary mechanism | ${mechanism} |`
    })
    .replace(/TODO:[^|\n]*/g, 'completed evidence')
    .replace(/^- \[ \]/gm, '- [x]')
}

test('accepts a structurally complete matrix with correct totals', () => {
  assert.deepEqual(validateMatrix(completedMatrix()), [])
})

test('rejects the untouched template', () => {
  const failures = validateMatrix(template)
  assert.ok(failures.some((failure) => failure.includes('TODO:')))
  assert.ok(failures.some((failure) => failure.includes('checkbox')))
})

test('rejects a missing scenario section', () => {
  const invalid = completedMatrix().replace(
    '## S2 — Shared issue service',
    '## Removed scenario',
  )
  assert.ok(validateMatrix(invalid).some((failure) => failure.startsWith('S2: missing')))
})

test('rejects incorrect score arithmetic', () => {
  const invalid = completedMatrix().replace(
    '| Tool | 1 | 1 | 2 | 2 | 0 | 1 | 7 | reviewed |',
    '| Tool | 1 | 1 | 2 | 2 | 0 | 1 | 8 | reviewed |',
  )
  assert.ok(validateMatrix(invalid).some((failure) => failure.includes('expected 7')))
})

test('rejects an empty evidence source', () => {
  const invalid = completedMatrix().replace(
    /^\| Observed \|[^|\n]+\|[^|\n]+\|$/m,
    '| Observed | completed evidence | |',
  )
  assert.ok(validateMatrix(invalid).some((failure) => failure.includes('Observed evidence')))
})

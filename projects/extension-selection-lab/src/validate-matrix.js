/*
 * Copyright 2026 Borealbit Technology Limited
 * Licensed under the Apache License, Version 2.0.
 */

import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const SCENARIOS = [
  ['S1', '## S1 — Repository release playbook'],
  ['S2', '## S2 — Shared issue service'],
  ['S3', '## S3 — Organization policy gate'],
]

const CANDIDATES = ['Tool', 'Skill', 'MCP', 'Native DSH plugin']
const EVIDENCE_LABELS = ['Observed', 'Inferred', 'Unverified']

function findSection(content, heading, nextHeading) {
  const start = content.indexOf(heading)
  if (start === -1) return ''

  const end = nextHeading ? content.indexOf(nextHeading, start + heading.length) : content.length
  return content.slice(start, end === -1 ? content.length : end)
}

function parseScoreRows(section) {
  const rows = new Map()
  const rowPattern = /^\|\s*(Tool|Skill|MCP|Native DSH plugin)\s*\|\s*([0-2])\s*\|\s*([0-2])\s*\|\s*([0-2])\s*\|\s*([0-2])\s*\|\s*([0-2])\s*\|\s*([0-2])\s*\|\s*(\d{1,2})\s*\|[^\n]*$/gm

  for (const match of section.matchAll(rowPattern)) {
    const scores = match.slice(2, 8).map(Number)
    rows.set(match[1], { scores, total: Number(match[8]) })
  }

  return rows
}

function tableValue(section, label) {
  const escaped = label.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  const match = section.match(new RegExp(`^\\|\\s*${escaped}\\s*\\|\\s*([^|\\n]+?)\\s*\\|`, 'm'))
  return match?.[1]?.trim() ?? ''
}

export function validateMatrix(content) {
  const failures = []

  if (content.length < 5_000) {
    failures.push('The matrix is unexpectedly short; preserve the complete worksheet structure.')
  }

  if (/TODO:/i.test(content)) {
    failures.push('Replace every TODO: placeholder with evidence or an explicit Unverified statement.')
  }

  if (/^- \[ \]/m.test(content)) {
    failures.push('Complete every attestation checkbox before validation.')
  }

  for (const required of [
    '# Module 06 Extension Decision Matrix',
    '## Boundary map',
    '## Scoring method',
    '## Third-party review',
    '## Final cross-scenario map',
    '## Completion attestation',
  ]) {
    if (!content.includes(required)) failures.push(`Missing required section: ${required}`)
  }

  SCENARIOS.forEach(([id, heading], index) => {
    const nextHeading = SCENARIOS[index + 1]?.[1] ?? '## Third-party review'
    const section = findSection(content, heading, nextHeading)

    if (!section) {
      failures.push(`${id}: missing required scenario heading: ${heading}`)
      return
    }

    for (const required of [
      `### ${id} hard gate`,
      `### ${id} candidate score`,
      `### ${id} architecture decision`,
      `### ${id} authority and lifecycle`,
      `### ${id} evidence ledger`,
      `### ${id} rejected alternatives`,
      `### ${id} disconfirming test`,
    ]) {
      if (!section.includes(required)) failures.push(`${id}: missing ${required}`)
    }

    const veto = tableValue(section, 'Hard veto statement')
    if (!veto) failures.push(`${id}: hard veto statement is empty.`)

    const primary = tableValue(section, 'Primary mechanism')
    if (!primary) failures.push(`${id}: primary mechanism is empty.`)
    if (primary && !CANDIDATES.some((candidate) => primary.toLowerCase().includes(candidate.toLowerCase()))) {
      failures.push(`${id}: primary mechanism must name Tool, Skill, MCP, or Native DSH plugin.`)
    }

    const scoreRows = parseScoreRows(section)
    for (const candidate of CANDIDATES) {
      const row = scoreRows.get(candidate)
      if (!row) {
        failures.push(`${id}: ${candidate} needs six integer scores from 0 to 2 and a total.`)
        continue
      }

      const expectedTotal = row.scores.reduce((sum, score) => sum + score, 0)
      if (row.total !== expectedTotal) {
        failures.push(`${id}: ${candidate} total is ${row.total}; expected ${expectedTotal}.`)
      }
    }

    for (const label of EVIDENCE_LABELS) {
      const match = section.match(new RegExp(`^\\|\\s*${label}\\s*\\|\\s*([^|\\n]+)\\|\\s*([^|\\n]+)\\|`, 'm'))
      if (!match || !match[1].trim() || !match[2].trim()) {
        failures.push(`${id}: ${label} evidence needs both a claim and a source or next check.`)
      }
    }
  })

  const thirdParty = findSection(content, '## Third-party review', '## Final cross-scenario map')
  for (const field of [
    'Component and role',
    'Exact version, commit, image digest, or deployment id',
    'Credentials and least scopes',
    'Synthetic smoke test',
    'Decision',
  ]) {
    if (!tableValue(thirdParty, field)) failures.push(`Third-party review field is empty: ${field}`)
  }

  return failures
}

function runCli() {
  const input = process.argv[2]
  if (!input) {
    console.error('Usage: node src/validate-matrix.js <completed-matrix.md>')
    process.exitCode = 2
    return
  }

  const resolved = path.resolve(input)
  let content
  try {
    content = fs.readFileSync(resolved, 'utf8')
  } catch (error) {
    console.error(`Cannot read matrix: ${error.message}`)
    process.exitCode = 2
    return
  }

  const failures = validateMatrix(content)
  if (failures.length > 0) {
    console.error('Matrix validation failed:')
    for (const failure of failures) console.error(`- ${failure}`)
    process.exitCode = 1
    return
  }

  console.log('Matrix structure is complete. Architectural correctness still requires human review.')
}

if (process.argv[1] && fileURLToPath(import.meta.url) === path.resolve(process.argv[1])) {
  runCli()
}

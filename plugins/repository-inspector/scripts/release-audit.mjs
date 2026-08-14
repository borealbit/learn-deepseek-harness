/*
 * Copyright 2026 Borealbit Technology Limited
 * Licensed under the Apache License, Version 2.0.
 */

import { spawnSync } from 'node:child_process'
import { mkdtempSync, readFileSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join, resolve } from 'node:path'
import { auditReleaseCandidate } from './release-contract.mjs'

const root = resolve(import.meta.dirname, '..')
const args = new Set(process.argv.slice(2))
const known = new Set(['--draft', '--json'])
for (const argument of args) {
  if (!known.has(argument)) throw new Error(`unknown argument: ${argument}`)
}

function read(path) {
  return readFileSync(resolve(root, path), 'utf8')
}

function prospectiveFiles() {
  const command = process.platform === 'win32' ? 'npm.cmd' : 'npm'
  const cache = mkdtempSync(join(tmpdir(), 'dsh-release-audit-npm-'))
  let result
  try {
    result = spawnSync(command, [
      'pack',
      '--dry-run',
      '--json',
      '--ignore-scripts',
      '--cache',
      cache,
    ], {
      cwd: root,
      encoding: 'utf8',
      env: {
        ...process.env,
        npm_config_update_notifier: 'false',
      },
    })
  } finally {
    rmSync(cache, { recursive: true, force: true })
  }
  if (result.error) throw result.error
  if (result.status !== 0) {
    throw new Error(`npm pack --dry-run failed:\n${result.stderr || result.stdout}`)
  }
  const parsed = JSON.parse(result.stdout)
  if (!Array.isArray(parsed) || parsed.length !== 1 || !Array.isArray(parsed[0]?.files)) {
    throw new Error('npm pack --dry-run returned an unexpected JSON shape')
  }
  return parsed[0].files
}

const manifest = JSON.parse(read('package.json'))
const report = auditReleaseCandidate({
  manifest,
  files: prospectiveFiles(),
  documents: {
    readme: read('README.md'),
    changelog: read('CHANGELOG.md'),
    license: read('LICENSE'),
    notice: read('NOTICE'),
    security: read('SECURITY.md'),
    patch: read('cordis.patch.yml'),
  },
})

if (args.has('--json')) {
  process.stdout.write(`${JSON.stringify(report, null, 2)}\n`)
} else {
  process.stdout.write(`Release audit: ${report.package.name}@${report.package.version}\n`)
  process.stdout.write(`Decision: ${report.decision}\n`)
  process.stdout.write(
    `PASS ${report.summary.passed} | WARN ${report.summary.warnings} | BLOCK ${report.summary.blockers}`
    + ` | FILES ${report.summary.files} | UNPACKED ${report.summary.unpackedBytes} bytes\n`,
  )
  for (const check of report.checks.filter(check => check.status !== 'pass')) {
    process.stdout.write(`${check.status.toUpperCase()} ${check.id}: ${check.message}\n`)
  }
  process.stdout.write('No registry write was attempted.\n')
}

if (report.decision === 'NO-GO' && !args.has('--draft')) process.exitCode = 1

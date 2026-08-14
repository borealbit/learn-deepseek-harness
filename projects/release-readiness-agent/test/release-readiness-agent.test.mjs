/*
 * Copyright 2026 Borealbit Technology Limited
 * Licensed under the Apache License, Version 2.0.
 */

import assert from 'node:assert/strict'
import { cp, mkdtemp, readFile, rm, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { dirname, resolve } from 'node:path'
import test from 'node:test'
import { fileURLToPath } from 'node:url'
import {
  createApprovalController,
  createFixtureBuildApprovalController,
} from '../src/approval.mjs'
import { runBoundedDelegation } from '../src/delegation.mjs'
import { runReleaseReadinessAgent } from '../src/release-readiness-agent.mjs'
import { inspectRepository } from '../src/repository-inspection.mjs'
import { validateSessionEvidence } from '../src/session-evidence.mjs'

const projectRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const fixture = resolve(projectRoot, 'fixtures/release-candidate')

function deterministicClock(start = 1_786_665_600_000) {
  let value = start
  return () => {
    value += 5
    return value
  }
}

async function withFixture(callback) {
  const temporary = await mkdtemp(resolve(tmpdir(), 'module12-test-'))
  const root = resolve(temporary, 'candidate')
  try {
    await cp(fixture, root, { recursive: true, errorOnExist: true })
    return await callback(root)
  } finally {
    await rm(temporary, { recursive: true, force: true })
  }
}

function options(overrides = {}) {
  return {
    runId: 'module12-test-run',
    baseTime: 1_786_665_600_000,
    now: deterministicClock(),
    ...overrides,
  }
}

test('discovers bounded instructions, release metadata, commands, and a clean secret scan', async () => {
  await withFixture(async root => {
    const inspection = await inspectRepository(root)
    assert.equal(inspection.rootLabel, 'synthetic/release-candidate')
    assert.deepEqual(inspection.instructions.map(item => item.path), ['AGENTS.md'])
    assert.equal(inspection.manifest.name, '@example/release-candidate')
    assert.deepEqual(inspection.config.commands.map(command => command.id), ['lint', 'test', 'build'])
    assert.equal(inspection.secretScan.complete, true)
    assert.equal(inspection.secretScan.findings.length, 0)
  })
})

test('refuses ambiguous roots and drive-qualified command paths before execution', async () => {
  await assert.rejects(inspectRepository('fixtures/release-candidate'), /absolute path/)
  await withFixture(async root => {
    const configPath = resolve(root, '.release-readiness.json')
    const config = JSON.parse(await readFile(configPath, 'utf8'))
    config.commands[0].argv[1] = 'C:/outside/check.mjs'
    await writeFile(configPath, `${JSON.stringify(config, null, 2)}\n`)
    await assert.rejects(inspectRepository(root), /stay below the repository root/)
  })
})

test('holds a mutating build when approval is unavailable', async () => {
  await withFixture(async root => {
    const { report } = await runReleaseReadinessAgent(root, options({
      approval: createApprovalController(),
    }))
    assert.equal(report.decision, 'BLOCKED')
    assert.equal(report.commands.find(command => command.id === 'build')?.status, 'skipped')
    assert.equal(report.mutationPerformed, false)
    assert.ok(report.blockerIds.includes('command.build.skipped'))
    assert.deepEqual(report.approvalEvents.map(event => event.type), [
      'approval/asked',
      'approval/decided',
    ])
  })
})

test('runs all checks after one-shot build approval and never authorizes release', async () => {
  await withFixture(async root => {
    const { report } = await runReleaseReadinessAgent(root, options({
      approval: createFixtureBuildApprovalController(),
    }))
    assert.equal(report.decision, 'READY_FOR_HUMAN_REVIEW')
    assert.equal(report.releaseAuthorized, false)
    assert.equal(report.humanApprovalRequired, true)
    assert.deepEqual(report.commands.map(command => command.status), ['passed', 'passed', 'passed'])
    assert.deepEqual(report.commands.at(-1).changedPaths, ['dist/artifact.json'])
    assert.equal(report.delegation.starts, 1)
    assert.equal(report.delegation.disposals, 1)
    assert.equal(report.delegation.review.recommendation, 'human-review')
  })
})

test('blocks on an obvious secret-like filename without retaining its value', async () => {
  await withFixture(async root => {
    await writeFile(resolve(root, '.env.production'), 'API_TOKEN=fixture-value-not-a-secret\n')
    const { report } = await runReleaseReadinessAgent(root, options({
      approval: createFixtureBuildApprovalController(),
    }))
    assert.equal(report.decision, 'BLOCKED')
    assert.equal(report.inspection.secretScan.findings[0].ruleId, 'secret-filename-env')
    assert.equal(JSON.stringify(report).includes('fixture-value-not-a-secret'), false)
    assert.equal(report.delegation.review.recommendation, 'block')
  })
})

test('stops the build before approval when a read-only prerequisite fails', async () => {
  await withFixture(async root => {
    await writeFile(resolve(root, 'FAIL_TEST'), 'synthetic switch\n')
    const approval = createFixtureBuildApprovalController()
    const { report } = await runReleaseReadinessAgent(root, options({ approval }))
    assert.equal(report.commands.find(command => command.id === 'test')?.status, 'failed')
    assert.equal(report.commands.find(command => command.id === 'build')?.reason,
      'read-only prerequisites did not pass')
    assert.equal(approval.events.length, 0)
    assert.equal(report.mutationPerformed, false)
  })
})

test('degrades to INCOMPLETE when the optional delegation provider is unavailable', async () => {
  await withFixture(async root => {
    const { report } = await runReleaseReadinessAgent(root, options({
      approval: createFixtureBuildApprovalController(),
      delegationMode: 'unavailable',
    }))
    assert.equal(report.decision, 'INCOMPLETE')
    assert.ok(report.warningIds.includes('delegation.unavailable'))
    assert.equal(report.releaseAuthorized, false)
  })
})

test('redacts secret-like command output before it reaches the report or Session trace', async () => {
  await withFixture(async root => {
    await writeFile(resolve(root, 'PRINT_SENTINEL'), 'synthetic switch\n')
    const result = await runReleaseReadinessAgent(root, options({
      approval: createFixtureBuildApprovalController(),
    }))
    const serialized = JSON.stringify(result)
    assert.equal(serialized.includes(`sk-${'A'.repeat(24)}`), false)
    assert.equal(result.report.commands[0].stdout.includes('[REDACTED:secret-like-value]'), true)
  })
})

test('fails a command that changes a path outside its declared write set', async () => {
  await withFixture(async root => {
    const configPath = resolve(root, '.release-readiness.json')
    const config = JSON.parse(await readFile(configPath, 'utf8'))
    config.commands.find(command => command.id === 'build').allowedWritePaths = ['dist/expected.json']
    await writeFile(configPath, `${JSON.stringify(config, null, 2)}\n`)
    const { report } = await runReleaseReadinessAgent(root, options({
      approval: createFixtureBuildApprovalController(),
    }))
    const build = report.commands.find(command => command.id === 'build')
    assert.equal(build.status, 'failed')
    assert.deepEqual(build.undeclaredWritePaths, ['dist/artifact.json'])
    assert.ok(report.blockerIds.includes('command.build.undeclared-write:dist/artifact.json'))
  })
})

test('rejects a changed plan digest before running any command', async () => {
  await withFixture(async root => {
    await assert.rejects(
      runReleaseReadinessAgent(root, options({ expectedPlanDigest: '0'.repeat(64) })),
      /plan changed/,
    )
  })
})

test('produces contiguous JSONL accepted by the real rc.6 Session implementation', async () => {
  await withFixture(async root => {
    const { report, sessionJsonl } = await runReleaseReadinessAgent(root, options({
      approval: createFixtureBuildApprovalController(),
    }))
    const parsed = validateSessionEvidence(sessionJsonl)
    assert.equal(parsed.sha256, report.evidence.sha256)
    assert.equal(parsed.events.length, report.evidence.eventCount)
    assert.equal(parsed.events.at(-1).type, 'turn/end')
  })
})

test('refuses a corrupted Session sequence instead of repairing evidence silently', async () => {
  await withFixture(async root => {
    const { sessionJsonl } = await runReleaseReadinessAgent(root, options({
      approval: createFixtureBuildApprovalController(),
    }))
    const lines = sessionJsonl.trimEnd().split('\n')
    const event = JSON.parse(lines[2])
    event.seq = 99
    lines[2] = JSON.stringify(event)
    assert.throws(() => validateSessionEvidence(`${lines.join('\n')}\n`), /sequence gap/)
  })
})

test('the real worker-thread seam bounds delegation to one disposed child', async () => {
  const result = await runBoundedDelegation({
    blockerIds: ['command.test.failed'],
    unknowns: [],
  })
  assert.equal(result.status, 'completed')
  assert.equal(result.review.recommendation, 'block')
  assert.equal(result.starts, 1)
  assert.equal(result.disposals, 1)
  assert.deepEqual(result.events.map(event => event.type), [
    'workflow/start',
    'workflow/phase',
    'workflow/agent-start',
    'workflow/agent-end',
    'workflow/end',
  ])
})

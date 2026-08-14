/*
 * Copyright 2026 Borealbit Technology Limited
 * Licensed under the Apache License, Version 2.0.
 */

import { cp, mkdtemp, rm } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { createFixtureBuildApprovalController } from '../src/approval.mjs'
import { runReleaseReadinessAgent } from '../src/release-readiness-agent.mjs'
import { validateSessionEvidence } from '../src/session-evidence.mjs'

const projectRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const source = resolve(projectRoot, 'fixtures/release-candidate')
const temporaryRoot = await mkdtemp(resolve(tmpdir(), 'module12-demo-'))
const target = resolve(temporaryRoot, 'release-candidate')

function deterministicClock(start) {
  let value = start
  return () => {
    value += 5
    return value
  }
}

try {
  await cp(source, target, { recursive: true, errorOnExist: true })
  const { report, sessionJsonl } = await runReleaseReadinessAgent(target, {
    approval: createFixtureBuildApprovalController(),
    runId: 'module12-keyless-demo',
    baseTime: 1_786_665_600_000,
    now: deterministicClock(1_786_665_600_000),
  })
  const validated = validateSessionEvidence(sessionJsonl)
  process.stdout.write(`${JSON.stringify({
    decision: report.decision,
    releaseAuthorized: report.releaseAuthorized,
    planSha256: report.plan.sha256,
    commandOutcomes: report.commands.map(command => ({
      id: command.id,
      status: command.status,
      changedPaths: command.changedPaths,
    })),
    approvalEvents: report.approvalEvents,
    delegation: {
      status: report.delegation.status,
      starts: report.delegation.starts,
      disposals: report.delegation.disposals,
    },
    sessionEvents: validated.events.length,
    sessionSha256: validated.sha256,
  }, null, 2)}\n`)
} finally {
  await rm(temporaryRoot, { recursive: true, force: true })
}


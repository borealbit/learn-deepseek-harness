/*
 * Copyright 2026 Borealbit Technology Limited
 * Licensed under the Apache License, Version 2.0.
 */

import { randomUUID } from 'node:crypto'
import { createUnavailableApprovalController } from './approval.mjs'
import { runDeclaredCommand } from './command-runner.mjs'
import { runBoundedDelegation } from './delegation.mjs'
import { hashCanonical, inspectRepository } from './repository-inspection.mjs'
import { buildSessionEvidence } from './session-evidence.mjs'

const COMPATIBILITY = Object.freeze({
  installPackage: '@deepseek-ai/dsh@0.1.0-rc.6',
  sessionPackage: '@deepseek-ai/dsh-session@0.1.0-rc.6',
  workflowPackages: '@deepseek-ai/dsh-workflow* @0.1.0-rc.6',
  upstreamCommit: '47f943859bef60e4160492346772ded9b24f765a',
})

const OUTPUT_SECRET_RULES = [
  /\bAKIA[0-9A-Z]{16}\b/g,
  /\bgh[pousr]_[A-Za-z0-9]{20,}\b/g,
  /\bsk-[A-Za-z0-9]{20,}\b/g,
  /-----BEGIN [A-Z0-9 ]*PRIVATE KEY-----/g,
]

function unique(values) {
  return [...new Set(values)]
}

function sanitizeText(text, root) {
  let output = typeof text === 'string' ? text : ''
  output = output.replaceAll(root, '<repository>')
  for (const pattern of OUTPUT_SECRET_RULES) {
    pattern.lastIndex = 0
    output = output.replace(pattern, '[REDACTED:secret-like-value]')
  }
  return output
}

function sanitizeCommandResult(result, root) {
  return {
    ...result,
    ...(result.stdout === undefined ? {} : { stdout: sanitizeText(result.stdout, root) }),
    ...(result.stderr === undefined ? {} : { stderr: sanitizeText(result.stderr, root) }),
  }
}

function createPlan(inspection) {
  const plan = {
    schemaVersion: 1,
    target: inspection.rootLabel,
    readOnlyDefault: true,
    releaseAuthorizationExcluded: true,
    steps: [
      { id: 'instructions', action: 'Discover bounded root instructions', mutates: false },
      { id: 'metadata', action: 'Inspect release metadata and required documents', mutates: false },
      { id: 'secrets', action: 'Scan bounded files for obvious secret risks', mutates: false },
      ...inspection.config.commands.map(command => ({
        id: `command:${command.id}`,
        action: `Run ${command.id} with shell disabled`,
        argv: [...command.argv],
        mutates: command.writesWorkspace,
        allowedWritePaths: [...command.allowedWritePaths],
        approvalRequired: command.writesWorkspace,
      })),
      { id: 'delegation', action: 'Delegate one bounded sanitized risk synthesis', mutates: false },
      { id: 'report', action: 'Return report and Session JSONL on standard output', mutates: false },
    ],
  }
  return { plan, digest: hashCanonical(plan) }
}

function initialFindings(inspection) {
  const blockers = []
  const warnings = []
  if (inspection.instructions.length === 0) warnings.push('instructions.none-discovered')
  for (const field of inspection.manifest.missingManifestFields) {
    blockers.push(`metadata.missing-field:${field}`)
  }
  for (const path of inspection.manifest.missingFiles) {
    blockers.push(`metadata.missing-file:${path}`)
  }
  for (const finding of inspection.secretScan.findings) {
    blockers.push(`secret:${finding.ruleId}:${finding.path}:${finding.line ?? 'path'}`)
  }
  if (!inspection.secretScan.complete) warnings.push('secret-scan.incomplete')
  if (inspection.secretScan.skippedSymlinks.length > 0) warnings.push('secret-scan.symlinks-skipped')
  if (inspection.secretScan.skippedOversized > 0) warnings.push('secret-scan.oversized-skipped')
  return { blockers, warnings }
}

function commandFinding(result, blockers) {
  if (result.status !== 'passed') blockers.push(`command.${result.id}.${result.status}`)
  for (const path of result.undeclaredWritePaths ?? []) {
    blockers.push(`command.${result.id}.undeclared-write:${path}`)
  }
}

function operationResult(result) {
  return {
    id: result.id,
    status: result.status,
    reason: result.reason,
    approvalOutcome: result.approvalOutcome,
    exitCode: result.exitCode ?? null,
    changedPaths: result.changedPaths,
    undeclaredWritePaths: result.undeclaredWritePaths,
  }
}

export async function runReleaseReadinessAgent(root, options = {}) {
  const approval = options.approval ?? createUnavailableApprovalController()
  if (typeof approval.request !== 'function' || !Array.isArray(approval.events)) {
    throw new TypeError('approval must expose request() and an events array')
  }
  const now = options.now ?? Date.now
  const runId = options.runId ?? `release-readiness-${randomUUID()}`
  const baseTime = options.baseTime ?? now()
  const inspection = await inspectRepository(root)
  const { plan, digest: planDigest } = createPlan(inspection)
  if (options.expectedPlanDigest !== undefined && options.expectedPlanDigest !== planDigest) {
    throw new Error('the review plan changed after it was presented')
  }

  const { blockers, warnings } = initialFindings(inspection)
  const commandResults = []
  for (const command of inspection.config.commands) {
    const prerequisiteFailed = command.id === 'build'
      && commandResults.some(result => result.status !== 'passed')
    let result
    if (prerequisiteFailed) {
      result = {
        id: command.id,
        status: 'skipped',
        reason: 'read-only prerequisites did not pass',
        writesWorkspace: command.writesWorkspace,
        allowedWritePaths: [...command.allowedWritePaths],
        changedPaths: [],
        undeclaredWritePaths: [],
        approvalOutcome: 'not-requested',
      }
    } else {
      result = await runDeclaredCommand({
        root: inspection.root,
        command,
        planDigest,
        approval,
        signal: options.signal,
        now,
      })
    }
    const sanitized = sanitizeCommandResult(result, inspection.root)
    commandResults.push(sanitized)
    commandFinding(sanitized, blockers)
  }

  const boundedSummary = {
    schemaVersion: 1,
    target: inspection.rootLabel,
    instructionCount: inspection.instructions.length,
    missingManifestFields: inspection.manifest.missingManifestFields,
    missingRequiredFiles: inspection.manifest.missingFiles,
    secretFindingIds: inspection.secretScan.findings.map(finding => finding.ruleId),
    commandOutcomes: commandResults.map(result => ({ id: result.id, status: result.status })),
    blockerIds: unique(blockers),
    unknowns: [
      'No registry, network, browser, authenticated model, provenance, or production deployment was inspected.',
    ],
  }
  const delegation = await runBoundedDelegation(boundedSummary, {
    mode: options.delegationMode ?? 'fixture',
    signal: options.signal,
    parentId: `${runId}-parent`,
  })
  if (delegation.status !== 'completed') warnings.push('delegation.unavailable')
  if (delegation.review?.recommendation === 'block' && blockers.length === 0) {
    blockers.push('delegation.recommended-block')
  }

  const blockerIds = unique(blockers)
  const warningIds = unique(warnings)
  const decision = blockerIds.length > 0
    ? 'BLOCKED'
    : warningIds.length > 0
      ? 'INCOMPLETE'
      : 'READY_FOR_HUMAN_REVIEW'
  const mutationPerformed = commandResults.some(result => result.changedPaths.length > 0)
  const report = {
    schemaVersion: 1,
    runId,
    generatedAt: new Date(baseTime).toISOString(),
    target: inspection.rootLabel,
    compatibility: COMPATIBILITY,
    decision,
    releaseAuthorized: false,
    humanApprovalRequired: true,
    mutationPerformed,
    plan: { ...plan, sha256: planDigest },
    inspection: {
      instructions: inspection.instructions,
      manifest: inspection.manifest,
      secretScan: inspection.secretScan,
    },
    commands: commandResults,
    approvalEvents: structuredClone(approval.events),
    delegation,
    blockerIds,
    warningIds,
    limitations: [
      'The obvious-secret scan is bounded pattern matching, not proof that secrets are absent.',
      'Command write-path verification is after-the-fact; use an OS sandbox for untrusted commands.',
      'The deterministic delegated provider measures orchestration contracts, not model judgment.',
      'No registry, provenance, browser, authenticated provider, production repository, or cross-platform release was verified.',
      'READY_FOR_HUMAN_REVIEW is not GO and never authorizes publication.',
    ],
  }

  const operations = [
    {
      name: 'inspect_repository',
      arguments: { target: inspection.rootLabel },
      result: {
        instructions: inspection.instructions.length,
        package: inspection.manifest.name,
        secretFindings: inspection.secretScan.findings.length,
      },
    },
    {
      name: 'present_review_plan',
      arguments: { target: inspection.rootLabel },
      result: { sha256: planDigest, steps: plan.steps.length },
    },
    ...commandResults.map(result => ({
      name: 'run_declared_check',
      arguments: { id: result.id, planDigest },
      result: operationResult(result),
      isError: result.status !== 'passed',
      errorCode: result.status.toUpperCase().replaceAll('-', '_'),
    })),
    {
      name: 'delegate_risk_review',
      arguments: { summarySchemaVersion: boundedSummary.schemaVersion },
      result: {
        status: delegation.status,
        recommendation: delegation.review?.recommendation ?? null,
        starts: delegation.starts,
        disposals: delegation.disposals,
      },
      isError: delegation.status !== 'completed',
      errorCode: 'DELEGATION_UNAVAILABLE',
    },
    {
      name: 'produce_release_report',
      arguments: { planDigest },
      result: { decision, blockerIds, warningIds, releaseAuthorized: false },
      isError: decision === 'BLOCKED',
      errorCode: 'RELEASE_BLOCKED',
    },
  ]
  const evidence = buildSessionEvidence({
    runId,
    baseTime,
    target: inspection.rootLabel,
    operations,
  })
  report.evidence = {
    format: 'DeepSeek Harness Session JSONL',
    eventCount: evidence.events.length,
    sha256: evidence.sha256,
  }
  return { report, sessionJsonl: evidence.jsonl }
}

export { createPlan }


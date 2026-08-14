/*
 * Copyright 2026 Borealbit Technology Limited
 * Licensed under the Apache License, Version 2.0.
 */

const LIMITS = Object.freeze({
  reviewId: 80,
  subject: 160,
  changeSummary: 4_000,
  acceptanceCriteria: 8,
  acceptanceCriterion: 240,
  handoff: 6_000,
})

function deepFreeze(value) {
  if (value && typeof value === 'object' && !Object.isFrozen(value)) {
    Object.freeze(value)
    for (const child of Object.values(value)) deepFreeze(child)
  }
  return value
}

function assertPlainRecord(value, label) {
  if (value === null || typeof value !== 'object' || Array.isArray(value)) {
    throw new TypeError(`${label} must be an object`)
  }
  const prototype = Object.getPrototypeOf(value)
  if (prototype !== Object.prototype && prototype !== null) {
    throw new TypeError(`${label} must be a plain object`)
  }
}

function normalizeText(value, label, maxLength) {
  if (typeof value !== 'string') throw new TypeError(`${label} must be a string`)
  const normalized = value.trim()
  if (normalized.length === 0 || normalized.length > maxLength) {
    throw new RangeError(`${label} must contain 1-${maxLength} characters`)
  }
  if (/\p{Cc}/u.test(normalized)) {
    throw new TypeError(`${label} must not contain control characters`)
  }
  return normalized
}

export function normalizeReviewRequest(input) {
  assertPlainRecord(input, 'review request')
  const allowed = new Set(['reviewId', 'subject', 'changeSummary', 'acceptanceCriteria'])
  for (const key of Object.keys(input)) {
    if (!allowed.has(key)) throw new TypeError(`unsupported review request field: ${key}`)
  }

  const reviewId = normalizeText(input.reviewId, 'reviewId', LIMITS.reviewId)
  if (!/^[a-z0-9](?:[a-z0-9._-]*[a-z0-9])?$/i.test(reviewId)) {
    throw new TypeError('reviewId must use letters, digits, dot, underscore, or hyphen')
  }
  const subject = normalizeText(input.subject, 'subject', LIMITS.subject)
  const changeSummary = normalizeText(
    input.changeSummary,
    'changeSummary',
    LIMITS.changeSummary,
  )
  if (!Array.isArray(input.acceptanceCriteria)) {
    throw new TypeError('acceptanceCriteria must be an array')
  }
  if (
    input.acceptanceCriteria.length === 0
    || input.acceptanceCriteria.length > LIMITS.acceptanceCriteria
  ) {
    throw new RangeError(
      `acceptanceCriteria must contain 1-${LIMITS.acceptanceCriteria} entries`,
    )
  }
  const acceptanceCriteria = input.acceptanceCriteria.map((criterion, index) => (
    normalizeText(
      criterion,
      `acceptanceCriteria[${index}]`,
      LIMITS.acceptanceCriterion,
    )
  ))

  return deepFreeze({ reviewId, subject, changeSummary, acceptanceCriteria })
}

export const EVIDENCE_SCHEMA = deepFreeze({
  type: 'object',
  additionalProperties: false,
  required: ['summary', 'findings', 'unknowns'],
  properties: {
    summary: { type: 'string' },
    findings: {
      type: 'array',
      items: {
        type: 'object',
        additionalProperties: false,
        required: ['id', 'severity', 'claim', 'support', 'verified'],
        properties: {
          id: { type: 'string' },
          severity: { type: 'string', enum: ['low', 'medium', 'high', 'critical'] },
          claim: { type: 'string' },
          support: { type: 'string' },
          verified: { type: 'boolean' },
        },
      },
    },
    unknowns: { type: 'array', items: { type: 'string' } },
  },
})

export const VERDICT_SCHEMA = deepFreeze({
  type: 'object',
  additionalProperties: false,
  required: ['decision', 'rationale', 'requiredActions', 'unverified'],
  properties: {
    decision: {
      type: 'string',
      enum: ['approve', 'revise', 'human-review-required', 'blocked'],
    },
    rationale: { type: 'string' },
    requiredActions: { type: 'array', items: { type: 'string' } },
    unverified: { type: 'array', items: { type: 'string' } },
  },
})

export const REVIEW_WORKFLOW_META = deepFreeze({
  name: 'bounded-two-stage-review',
  description: 'Collect bounded evidence, synthesize it, and stop at a human checkpoint.',
  whenToUse: 'Use for a review that benefits from two independent contexts and no delegated mutation.',
  phases: [
    { title: 'Evidence collection' },
    { title: 'Synthesis' },
  ],
})

export const REVIEW_WORKFLOW_SCRIPT = String.raw`
phase('Evidence collection')
log('Delegating a bounded, read-only evidence pass.')

const reviewRequest = args.reviewRequest
const evidencePrompt = [
  'ROLE: Evidence collector',
  'Analyze only the supplied synthetic review request.',
  'Return the requested structured object. Separate verified findings from unknowns.',
  'Do not mutate anything, request approval, start another agent, or claim evidence you did not inspect.',
  'REVIEW REQUEST JSON:',
  JSON.stringify(reviewRequest),
].join('\n')

const evidence = await agent(evidencePrompt, {
  label: 'evidence-collector',
  phase: 'Evidence collection',
  schema: args.evidenceSchema,
})

if (evidence === null) {
  return {
    status: 'blocked',
    reviewId: reviewRequest.reviewId,
    reason: 'The evidence stage did not complete.',
    humanCheckpointRequired: true,
    mutationPerformed: false,
  }
}

const handoff = JSON.stringify(evidence)
if (handoff.length > args.maxHandoffChars) {
  return {
    status: 'blocked',
    reviewId: reviewRequest.reviewId,
    reason: 'The structured evidence handoff exceeded its configured character limit.',
    humanCheckpointRequired: true,
    mutationPerformed: false,
  }
}

phase('Synthesis')
log('Passing only the bounded structured handoff to the second stage.')

const verdictPrompt = [
  'ROLE: Review synthesizer',
  'Use only the structured evidence handoff below.',
  'Return the requested structured object and preserve every unresolved unknown.',
  'Do not infer access to the original request, mutate anything, or treat this recommendation as approval.',
  'STRUCTURED EVIDENCE HANDOFF JSON:',
  handoff,
].join('\n')

const verdict = await agent(verdictPrompt, {
  label: 'review-synthesizer',
  phase: 'Synthesis',
  schema: args.verdictSchema,
})

if (verdict === null) {
  return {
    status: 'blocked',
    reviewId: reviewRequest.reviewId,
    reason: 'The synthesis stage did not complete.',
    evidence,
    humanCheckpointRequired: true,
    mutationPerformed: false,
  }
}

return {
  status: 'ready-for-human-checkpoint',
  reviewId: reviewRequest.reviewId,
  evidence,
  verdict,
  humanCheckpointRequired: true,
  mutationPerformed: false,
}
`

export function createWorkflowArgs(input) {
  return deepFreeze({
    reviewRequest: normalizeReviewRequest(input),
    evidenceSchema: structuredClone(EVIDENCE_SCHEMA),
    verdictSchema: structuredClone(VERDICT_SCHEMA),
    maxHandoffChars: LIMITS.handoff,
  })
}

export function startReviewWorkflow(ctx, input, options = {}) {
  assertPlainRecord(options, 'workflow options')
  const allowed = new Set(['signal', 'maxTotalAgents', 'parentId', 'provider'])
  for (const key of Object.keys(options)) {
    if (!allowed.has(key)) throw new TypeError(`unsupported workflow option: ${key}`)
  }

  const parentId = options.parentId ?? 'module09-parent'
  const provider = options.provider ?? 'module09-fixture'
  if (typeof parentId !== 'string' || parentId.length === 0) {
    throw new TypeError('parentId must be a non-empty string')
  }
  if (typeof provider !== 'string' || provider.length === 0) {
    throw new TypeError('provider must be a non-empty string')
  }

  return ctx.workflowEngine.start({
    meta: REVIEW_WORKFLOW_META,
    script: REVIEW_WORKFLOW_SCRIPT,
    args: createWorkflowArgs(input),
    subagentProvider: provider,
    maxTotalAgents: options.maxTotalAgents ?? 2,
    parent: { id: parentId, options: {} },
    ...(options.signal === undefined ? {} : { signal: options.signal }),
  })
}

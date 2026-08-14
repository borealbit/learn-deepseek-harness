/*
 * Copyright 2026 Borealbit Technology Limited
 * Licensed under the Apache License, Version 2.0.
 */

import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import test from 'node:test'

import { createFixtureRuntime } from '../src/fixture-runtime.mjs'
import {
  createWorkflowArgs,
  normalizeReviewRequest,
  startReviewWorkflow,
} from '../src/review-workflow.mjs'

const fixtureUrl = new URL('../fixtures/review-request.json', import.meta.url)
const fixture = JSON.parse(await readFile(fixtureUrl, 'utf8'))

async function withRuntime(options, callback) {
  const runtime = await createFixtureRuntime(options)
  try {
    return await callback(runtime)
  } finally {
    await runtime.dispose()
  }
}

test('normalizes, bounds, detaches, and freezes the review contract', () => {
  const input = structuredClone(fixture)
  const normalized = normalizeReviewRequest(input)
  input.acceptanceCriteria.push('A late mutation must not cross into the workflow.')

  assert.equal(normalized.acceptanceCriteria.length, 3)
  assert.equal(Object.isFrozen(normalized), true)
  assert.equal(Object.isFrozen(normalized.acceptanceCriteria), true)
  assert.throws(
    () => normalizeReviewRequest({ ...fixture, unexpectedAuthority: true }),
    /unsupported review request field/,
  )
  assert.throws(
    () => normalizeReviewRequest({ ...fixture, acceptanceCriteria: [] }),
    /must contain 1-8 entries/,
  )
  assert.throws(
    () => normalizeReviewRequest({ ...fixture, reviewId: '../escape' }),
    /reviewId must use/,
  )
  assert.equal(createWorkflowArgs(fixture).maxHandoffChars, 6_000)
})

test('runs two structured stages through the real engine and pairs lifecycle evidence', async () => {
  await withRuntime({}, async runtime => {
    const run = startReviewWorkflow(runtime.ctx, fixture)
    const result = await run.result
    await run.dispose()

    assert.equal(result.stopReason, 'completed')
    assert.equal(result.agentsStarted, 2)
    assert.equal(result.value.status, 'ready-for-human-checkpoint')
    assert.equal(result.value.verdict.decision, 'human-review-required')
    assert.equal(result.value.humanCheckpointRequired, true)
    assert.equal(result.value.mutationPerformed, false)
    assert.equal(runtime.state.startCount, 2)
    assert.equal(runtime.state.disposalCount, 2)

    const types = runtime.events.map(event => event.type)
    assert.deepEqual(types, [
      'workflow/start',
      'workflow/phase',
      'workflow/log',
      'workflow/agent-start',
      'workflow/agent-end',
      'workflow/phase',
      'workflow/log',
      'workflow/agent-start',
      'workflow/agent-end',
      'workflow/end',
    ])
    const starts = runtime.events.filter(event => event.type === 'workflow/agent-start')
    const ends = runtime.events.filter(event => event.type === 'workflow/agent-end')
    assert.deepEqual(starts.map(event => event.sequence), [1, 2])
    assert.deepEqual(ends.map(event => event.sequence), [1, 2])
  })
})

test('passes only the bounded structured handoff into synthesis', async () => {
  const sentinel = 'RAW-REQUEST-ONLY-SENTINEL'
  const request = { ...fixture, changeSummary: `${fixture.changeSummary} ${sentinel}` }

  await withRuntime({}, async runtime => {
    const run = startReviewWorkflow(runtime.ctx, request)
    const result = await run.result
    await run.dispose()

    assert.equal(result.stopReason, 'completed')
    assert.equal(runtime.state.requests[0].prompt.includes(sentinel), true)
    assert.equal(runtime.state.requests[1].prompt.includes(sentinel), false)
    assert.equal(runtime.state.requests[1].prompt.includes('E-001'), true)
    assert.equal(runtime.state.requests[1].prompt.length < 6_500, true)
    assert.deepEqual(runtime.state.requests.map(entry => entry.hasOutputSchema), [true, true])
  })
})

test('turns an ordinary evidence-child failure into an explicit blocked result', async () => {
  await withRuntime({ failStage: 'evidence' }, async runtime => {
    const run = startReviewWorkflow(runtime.ctx, fixture)
    const result = await run.result
    await run.dispose()

    assert.equal(result.stopReason, 'completed')
    assert.equal(result.agentsStarted, 1)
    assert.deepEqual(result.value, {
      status: 'blocked',
      reviewId: fixture.reviewId,
      reason: 'The evidence stage did not complete.',
      humanCheckpointRequired: true,
      mutationPerformed: false,
    })
    assert.equal(runtime.state.startCount, 1)
    assert.equal(runtime.state.disposalCount, 1)
  })
})

test('blocks an oversized structured handoff before starting synthesis', async () => {
  const evidenceValue = {
    summary: 'Synthetic oversized evidence.',
    findings: [{
      id: 'E-LARGE',
      severity: 'medium',
      claim: 'The handoff is deliberately too large.',
      support: 'x'.repeat(6_100),
      verified: false,
    }],
    unknowns: ['This is a size-bound fixture.'],
  }

  await withRuntime({ evidenceValue }, async runtime => {
    const run = startReviewWorkflow(runtime.ctx, fixture)
    const result = await run.result
    await run.dispose()

    assert.equal(result.stopReason, 'completed')
    assert.equal(result.agentsStarted, 1)
    assert.equal(result.value.status, 'blocked')
    assert.match(result.value.reason, /exceeded its configured character limit/)
    assert.equal(runtime.state.startCount, 1)
  })
})

test('fails loudly when the per-run total-agent ceiling is lower than the script contract', async () => {
  await withRuntime({}, async runtime => {
    const run = startReviewWorkflow(runtime.ctx, fixture, { maxTotalAgents: 1 })
    const result = await run.result
    await run.dispose()

    assert.equal(result.stopReason, 'error')
    assert.equal(result.agentsStarted, 1)
    assert.match(result.error ?? '', /total agent cap \(1\)/)
    assert.equal(runtime.state.startCount, 1)
    assert.equal(runtime.state.disposalCount, 1)
  })
})

test('cancels an in-flight child and disposes the published run', async () => {
  await withRuntime({ holdStage: 'evidence' }, async runtime => {
    const controller = new AbortController()
    const run = startReviewWorkflow(runtime.ctx, fixture, { signal: controller.signal })
    await runtime.state.waitForStarts(1)
    await runtime.waitForEvent('workflow/agent-start')
    controller.abort('module09-test-cancel')

    const result = await run.result
    await run.dispose()

    assert.equal(result.stopReason, 'cancelled')
    assert.equal(result.agentsStarted, 1)
    assert.match(result.error ?? '', /cancel/i)
    assert.equal(runtime.state.startCount, 1)
    assert.equal(runtime.state.disposalCount, 1)
    const starts = runtime.events.filter(event => event.type === 'workflow/agent-start')
    const ends = runtime.events.filter(event => event.type === 'workflow/agent-end')
    assert.deepEqual(starts.map(event => event.sequence), [1])
    assert.deepEqual(ends.map(event => event.sequence), [1])
  })
})

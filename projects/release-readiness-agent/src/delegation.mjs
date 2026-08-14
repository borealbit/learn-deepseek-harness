/*
 * Copyright 2026 Borealbit Technology Limited
 * Licensed under the Apache License, Version 2.0.
 */

import { Context } from '@deepseek-ai/cordis'
import SubagentRuntime from '@deepseek-ai/dsh-subagent'
import { validateJsonSchemaValue } from '@deepseek-ai/dsh-tools'
import WorkerThreadWorkflowEngine from '@deepseek-ai/dsh-workflow-worker-thread'

const REVIEW_SCHEMA = Object.freeze({
  type: 'object',
  additionalProperties: false,
  required: ['recommendation', 'rationale', 'requiredActions', 'unknowns'],
  properties: {
    recommendation: { type: 'string', enum: ['block', 'human-review'] },
    rationale: { type: 'string' },
    requiredActions: { type: 'array', items: { type: 'string' } },
    unknowns: { type: 'array', items: { type: 'string' } },
  },
})

const WORKFLOW_META = Object.freeze({
  name: 'release-readiness-risk-review',
  description: 'Delegate one bounded synthesis over sanitized release evidence.',
  whenToUse: 'Use after local checks when an independent bounded review is useful.',
  phases: [{ title: 'Risk synthesis' }],
})

const WORKFLOW_SCRIPT = String.raw`
phase('Risk synthesis')
const prompt = [
  'ROLE: Release-readiness reviewer',
  'Review only the bounded JSON summary below.',
  'Preserve unknowns. Do not claim repository access, mutate anything, start another agent, or authorize release.',
  'Return the required structured object.',
  'SUMMARY JSON:',
  JSON.stringify(args.summary),
].join('\n')

const review = await agent(prompt, {
  label: 'release-risk-reviewer',
  phase: 'Risk synthesis',
  schema: args.schema,
})

if (review === null) {
  return {
    status: 'unavailable',
    reason: 'The bounded delegated review did not complete.',
  }
}
return { status: 'completed', review }
`

function promptText(request) {
  return request.prompt
    .filter(block => block.type === 'text')
    .map(block => block.text)
    .join('')
}

function summaryFromPrompt(prompt) {
  const marker = 'SUMMARY JSON:\n'
  const index = prompt.indexOf(marker)
  if (!prompt.startsWith('ROLE: Release-readiness reviewer') || index === -1) {
    throw new Error('fixture provider received an unexpected prompt')
  }
  return JSON.parse(prompt.slice(index + marker.length))
}

function fixtureReview(summary) {
  const blocking = summary.blockerIds.length > 0
  return {
    recommendation: blocking ? 'block' : 'human-review',
    rationale: blocking
      ? 'The bounded evidence contains one or more release blockers.'
      : 'The bounded checks pass, but a human still owns release authorization.',
    requiredActions: blocking
      ? summary.blockerIds.map(id => `Resolve ${id} and rerun the complete plan.`)
      : ['Review the complete report and authorize release outside this fixture.'],
    unknowns: [
      'The deterministic provider has no model, registry, network, browser, or production repository access.',
    ],
  }
}

function createDeterministicProvider() {
  let starts = 0
  let disposals = 0
  const provider = {
    name: 'module12-fixture',
    capabilities: {
      outputSchema: true,
      depthLimit: false,
      toolFilter: false,
      persona: false,
    },
    inheritsParentContext: false,
    async start(request) {
      request.signal.throwIfAborted()
      const summary = summaryFromPrompt(promptText(request))
      const structured = fixtureReview(summary)
      const violations = validateJsonSchemaValue(request.outputSchema, structured, 'review')
      if (violations.length > 0) throw new Error(violations.join('; '))
      starts += 1
      const id = `module12-fixture-child-${starts}`
      let disposed = false
      return {
        id,
        localAgent: undefined,
        result: Promise.resolve({
          output: [{ type: 'text', text: 'Fixture risk review completed.' }],
          structured,
          stopReason: 'completed',
        }),
        async dispose() {
          if (disposed) return
          disposed = true
          disposals += 1
        },
      }
    },
  }
  return { provider, counters: () => ({ starts, disposals }) }
}

export async function runBoundedDelegation(summary, options = {}) {
  if (options.mode === 'unavailable') {
    return {
      status: 'unavailable',
      reason: 'No delegated-review provider is configured.',
      events: [],
      starts: 0,
      disposals: 0,
    }
  }
  const ctx = new Context()
  const events = []
  const listeners = []
  const capture = (type, project) => {
    listeners.push(ctx.on(type, (...args) => events.push({ type, ...project(...args) })))
  }
  capture('workflow/start', info => ({ name: info.meta.name }))
  capture('workflow/phase', (_info, title) => ({ title }))
  capture('workflow/agent-start', (_info, agent) => ({ sequence: agent.seq, label: agent.label }))
  capture('workflow/agent-end', (_info, agent) => ({ sequence: agent.seq, outcome: agent.outcome }))
  capture('workflow/end', (_info, result) => ({
    stopReason: result.stopReason,
    agentsStarted: result.agentsStarted,
  }))

  let subagentFiber
  let workflowFiber
  let unregisterProvider
  const { provider, counters } = createDeterministicProvider()
  try {
    subagentFiber = await ctx.plugin(SubagentRuntime)
    unregisterProvider = ctx.subagents.registerProvider(provider)
    workflowFiber = await ctx.plugin(WorkerThreadWorkflowEngine, {
      provider: provider.name,
      maxConcurrentAgents: 1,
      maxTotalAgents: 1,
      maxItemsPerCall: 4,
      syncTimeoutMs: 1_000,
      disposeGraceMs: 1_000,
    })
    const run = ctx.workflowEngine.start({
      meta: WORKFLOW_META,
      script: WORKFLOW_SCRIPT,
      args: { summary: structuredClone(summary), schema: structuredClone(REVIEW_SCHEMA) },
      subagentProvider: provider.name,
      maxTotalAgents: 1,
      parent: { id: options.parentId ?? 'module12-parent', options: {} },
      ...(options.signal === undefined ? {} : { signal: options.signal }),
    })
    let result
    try {
      result = await run.result
    } finally {
      await run.dispose()
    }
    const counts = counters()
    if (result.stopReason !== 'completed') {
      return {
        status: 'unavailable',
        reason: result.error ?? `delegation ended ${result.stopReason}`,
        events,
        starts: counts.starts,
        disposals: counts.disposals,
      }
    }
    return {
      ...result.value,
      events,
      starts: counts.starts,
      disposals: counts.disposals,
    }
  } finally {
    if (workflowFiber !== undefined) await workflowFiber.dispose()
    if (unregisterProvider !== undefined) await unregisterProvider()
    if (subagentFiber !== undefined) await subagentFiber.dispose()
    for (const dispose of listeners.reverse()) await dispose()
  }
}


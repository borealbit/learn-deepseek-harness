/*
 * Copyright 2026 Borealbit Technology Limited
 * Licensed under the Apache License, Version 2.0.
 */

import { Context } from '@deepseek-ai/cordis'
import SubagentRuntime from '@deepseek-ai/dsh-subagent'
import { validateJsonSchemaValue } from '@deepseek-ai/dsh-tools'
import WorkerThreadWorkflowEngine from '@deepseek-ai/dsh-workflow-worker-thread'

const DEFAULT_EVIDENCE = Object.freeze({
  summary: 'The synthetic proposal is reviewable, but approval evidence is intentionally absent.',
  findings: [
    {
      id: 'E-001',
      severity: 'medium',
      claim: 'The proposal declares a human checkpoint before mutation.',
      support: 'The supplied acceptance criteria require explicit human approval.',
      verified: true,
    },
  ],
  unknowns: ['No authenticated provider or real repository was inspected.'],
})

const DEFAULT_VERDICT = Object.freeze({
  decision: 'human-review-required',
  rationale: 'The structured evidence is bounded, but it does not contain human authorization.',
  requiredActions: ['A human must review E-001 and authorize any later mutation separately.'],
  unverified: ['Authenticated provider behavior remains unverified.'],
})

function promptText(request) {
  return request.prompt
    .filter(block => block.type === 'text')
    .map(block => block.text)
    .join('')
}

function stageFromPrompt(prompt) {
  if (prompt.startsWith('ROLE: Evidence collector')) return 'evidence'
  if (prompt.startsWith('ROLE: Review synthesizer')) return 'synthesis'
  throw new Error('fixture provider received an unknown stage prompt')
}

function cloneJson(value) {
  return JSON.parse(JSON.stringify(value))
}

function assertFixtureOutput(request, value, stage) {
  if (request.outputSchema === undefined) {
    throw new Error(`fixture ${stage} request did not include an output schema`)
  }
  const violations = validateJsonSchemaValue(request.outputSchema, value, `${stage}Output`)
  if (violations.length > 0) {
    throw new Error(`fixture ${stage} output violated its schema: ${violations.join('; ')}`)
  }
}

function createWaiterState() {
  const waiters = []
  return {
    notify(count) {
      for (let index = waiters.length - 1; index >= 0; index -= 1) {
        if (count >= waiters[index].count) {
          waiters.splice(index, 1)[0].resolve()
        }
      }
    },
    waitFor(count, current) {
      if (current >= count) return Promise.resolve()
      return new Promise(resolve => waiters.push({ count, resolve }))
    },
  }
}

export function createDeterministicProvider(options = {}) {
  const waiter = createWaiterState()
  const state = {
    startCount: 0,
    disposalCount: 0,
    requests: [],
    waitForStarts(count) {
      return waiter.waitFor(count, state.startCount)
    },
  }
  const disposed = new Set()

  const provider = {
    name: 'module09-fixture',
    capabilities: {
      outputSchema: true,
      depthLimit: false,
      toolFilter: false,
      persona: false,
    },
    inheritsParentContext: false,
    async start(request) {
      request.signal.throwIfAborted()
      const prompt = promptText(request)
      const stage = stageFromPrompt(prompt)
      const sequence = state.startCount + 1
      const id = `module09-fixture-child-${sequence}`
      state.startCount = sequence
      state.requests.push({
        id,
        stage,
        prompt,
        hasOutputSchema: request.outputSchema !== undefined,
      })
      waiter.notify(state.startCount)

      let settle
      let settled = false
      const finish = (result) => {
        if (settled) return
        settled = true
        settle(result)
      }
      const result = new Promise(resolve => {
        settle = resolve
      })
      const abort = () => finish({
        output: [{ type: 'text', text: `Fixture ${stage} stage aborted.` }],
        stopReason: 'aborted',
      })
      request.signal.addEventListener('abort', abort, { once: true })

      if (options.holdStage !== stage) {
        if (options.failStage === stage) {
          finish({
            output: [{ type: 'text', text: `Fixture ${stage} stage failed.` }],
            stopReason: 'error',
          })
        } else {
          const structured = cloneJson(
            stage === 'evidence'
              ? (options.evidenceValue ?? DEFAULT_EVIDENCE)
              : (options.verdictValue ?? DEFAULT_VERDICT),
          )
          assertFixtureOutput(request, structured, stage)
          finish({
            output: [{ type: 'text', text: `Fixture ${stage} stage completed.` }],
            structured,
            stopReason: 'completed',
          })
        }
      }

      return {
        id,
        localAgent: undefined,
        result,
        async dispose() {
          if (disposed.has(id)) return
          disposed.add(id)
          state.disposalCount += 1
          request.signal.removeEventListener('abort', abort)
          abort()
        },
      }
    },
  }

  return { provider, state }
}

export async function createFixtureRuntime(options = {}) {
  const ctx = new Context()
  const events = []
  const eventDisposers = []
  const eventWaiters = []
  const capture = (type, project) => {
    eventDisposers.push(ctx.on(type, (...args) => {
      events.push({ type, ...project(...args) })
      for (let index = eventWaiters.length - 1; index >= 0; index -= 1) {
        const waiter = eventWaiters[index]
        const count = events.filter(event => event.type === waiter.type).length
        if (waiter.type === type && count >= waiter.count) {
          eventWaiters.splice(index, 1)[0].resolve()
        }
      }
    }))
  }

  capture('workflow/start', info => ({ runId: info.id, name: info.meta.name }))
  capture('workflow/phase', (info, title) => ({ runId: info.id, title }))
  capture('workflow/log', (info, message) => ({ runId: info.id, message }))
  capture('workflow/agent-start', (info, agent) => ({
    runId: info.id,
    sequence: agent.seq,
    label: agent.label,
    phase: agent.phase,
  }))
  capture('workflow/agent-end', (info, agent) => ({
    runId: info.id,
    sequence: agent.seq,
    outcome: agent.outcome,
  }))
  capture('workflow/end', (info, result) => ({
    runId: info.id,
    stopReason: result.stopReason,
    agentsStarted: result.agentsStarted,
  }))

  const subagentFiber = await ctx.plugin(SubagentRuntime)
  const { provider, state } = createDeterministicProvider(options)
  const unregisterProvider = ctx.subagents.registerProvider(provider)
  const workflowFiber = await ctx.plugin(WorkerThreadWorkflowEngine, {
    provider: provider.name,
    maxConcurrentAgents: 1,
    maxTotalAgents: 2,
    maxItemsPerCall: 8,
    syncTimeoutMs: 1_000,
    disposeGraceMs: 1_000,
  })

  let disposed = false
  return {
    ctx,
    events,
    state,
    waitForEvent(type, count = 1) {
      const current = events.filter(event => event.type === type).length
      if (current >= count) return Promise.resolve()
      return new Promise(resolve => eventWaiters.push({ type, count, resolve }))
    },
    async dispose() {
      if (disposed) return
      disposed = true
      await workflowFiber.dispose()
      await unregisterProvider()
      await subagentFiber.dispose()
      for (const disposeEvent of eventDisposers.reverse()) await disposeEvent()
    },
  }
}

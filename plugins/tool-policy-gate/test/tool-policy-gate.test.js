/*
 * Copyright 2026 Borealbit Technology Limited
 * Licensed under the Apache License, Version 2.0.
 */

import assert from 'node:assert/strict'
import test from 'node:test'

import { Context } from '@deepseek-ai/cordis'
import { CallId } from '@deepseek-ai/dsh-llm'
import { Session, SessionId } from '@deepseek-ai/dsh-session'
import SystemPrompt from '@deepseek-ai/dsh-system-prompt'
import ToolRuntime, { defineTool } from '@deepseek-ai/dsh-tools'

import * as ToolPolicyGate from '../lib/index.js'

const signal = new AbortController().signal

function fixtureTool(name, execute) {
  return defineTool({
    name,
    description: 'Synthetic Module 08 Tool. It performs no filesystem, process, environment, or network operation.',
    parameters: {
      token: {
        type: 'string',
        description: 'Synthetic data used only to prove that policy audit events do not duplicate arguments.',
      },
    },
    output: {
      schema: {
        type: 'object',
        additionalProperties: false,
        properties: {
          executed: { type: 'boolean', required: true },
        },
      },
      render: (_args, value) => [{ type: 'text', text: JSON.stringify(value) }],
    },
    execute,
  })
}

async function runtime() {
  const ctx = new Context()
  await ctx.plugin(SystemPrompt)
  await ctx.plugin(ToolRuntime)
  return ctx
}

function detachedAgent(ctx, id = 'module08-audit') {
  const session = Session.create(SessionId(id))
  return { id: session.id, session, ctx }
}

test('normalizes an exact, frozen deny list and rejects ambiguous configuration', () => {
  const input = { blockedTools: ['z_tool', 'a_tool'] }
  const normalized = ToolPolicyGate.normalizeConfig(input)
  input.blockedTools.push('late_mutation')

  assert.deepEqual(normalized.blockedTools, ['a_tool', 'z_tool'])
  assert.equal(Object.isFrozen(normalized), true)
  assert.equal(Object.isFrozen(normalized.blockedTools), true)
  assert.throws(() => ToolPolicyGate.normalizeConfig({ blockedTools: [] }), /1-64/)
  assert.throws(
    () => ToolPolicyGate.normalizeConfig({ blockedTools: ['same', 'same'] }),
    /duplicate blocked Tool/,
  )
  assert.throws(
    () => ToolPolicyGate.normalizeConfig({ blockedTools: ['bad tool'] }),
    /invalid Tool name/,
  )
  assert.throws(
    () => ToolPolicyGate.normalizeConfig({ blockedTools: ['safe'], reason: 'line one\nline two' }),
    /no control characters/,
  )
})

test('denies the configured Tool before its synthetic body runs', async () => {
  const ctx = await runtime()
  let executions = 0
  ctx.tools.register(fixtureTool('course_unsafe_operation', async () => {
    executions += 1
    return { executed: true }
  }))
  await ctx.plugin(ToolPolicyGate, { blockedTools: ['course_unsafe_operation'] })

  const result = await ctx.tools.execute({
    callId: CallId('module08-denied'),
    name: 'course_unsafe_operation',
    arguments: { token: 'synthetic-secret-marker' },
    signal,
  })

  assert.equal(result.isError, true)
  assert.match(result.error?.message ?? '', /deployment-owned Tool policy/)
  assert.equal(executions, 0)
})

test('allows non-matching Tools and uses exact case-sensitive names', async () => {
  const ctx = await runtime()
  let executions = 0
  for (const name of ['safe_operation', 'Course_Unsafe_Operation']) {
    ctx.tools.register(fixtureTool(name, async () => {
      executions += 1
      return { executed: true }
    }))
  }
  await ctx.plugin(ToolPolicyGate, { blockedTools: ['course_unsafe_operation'] })

  for (const [index, name] of ['safe_operation', 'Course_Unsafe_Operation'].entries()) {
    const result = await ctx.tools.execute({
      callId: CallId(`module08-allowed-${index}`),
      name,
      arguments: {},
      signal,
    })
    assert.equal(result.isError, false)
  }
  assert.equal(executions, 2)
})

test('records one log-only denial without copying Tool arguments', async () => {
  const ctx = await runtime()
  const agent = detachedAgent(ctx)
  let executions = 0
  ctx.tools.register(fixtureTool('course_unsafe_operation', async () => {
    executions += 1
    return { executed: true }
  }))
  await ctx.plugin(ToolPolicyGate, {
    blockedTools: ['course_unsafe_operation'],
    ruleId: 'course.no-unsafe-operation',
    reason: 'The Module 08 practice policy denies this synthetic operation.',
  })

  const result = await ctx.tools.execute({
    callId: CallId('module08-audited-denial'),
    name: 'course_unsafe_operation',
    arguments: { token: 'synthetic-secret-marker' },
    agent,
    signal,
  })

  assert.equal(result.isError, true)
  assert.equal(executions, 0)
  assert.equal(agent.session.events.length, 1)
  assert.deepEqual(agent.session.events[0]?.data, {
    policy: 'tool-policy-gate',
    ruleId: 'course.no-unsafe-operation',
    decision: 'deny',
    enforcementPoint: 'pre-execute',
    callId: 'module08-audited-denial',
    rootCallId: 'module08-audited-denial',
    tool: 'course_unsafe_operation',
    reason: 'The Module 08 practice policy denies this synthetic operation.',
    argumentsRecorded: false,
  })
  assert.equal(JSON.stringify(agent.session.events).includes('synthetic-secret-marker'), false)
  assert.deepEqual(agent.session.deriveMessages(), [])
})

test('the monotonic guard denies after a preceding listener short-circuits allow', async () => {
  const ctx = await runtime()
  const agent = detachedAgent(ctx, 'module08-guard-fallback')
  let executions = 0
  ctx.tools.register(fixtureTool('course_unsafe_operation', async () => {
    executions += 1
    return { executed: true }
  }))
  await ctx.plugin(ToolPolicyGate, { blockedTools: ['course_unsafe_operation'] })
  ctx.on('tools/pre-execute', () => Promise.resolve({ kind: 'allow' }), { prepend: true })

  const result = await ctx.tools.execute({
    callId: CallId('module08-guard-denial'),
    name: 'course_unsafe_operation',
    arguments: {},
    agent,
    signal,
  })

  assert.equal(result.isError, true)
  assert.equal(executions, 0)
  assert.equal(agent.session.events[0]?.type, ToolPolicyGate.AUDIT_EVENT_TYPE)
  assert.equal(agent.session.events[0]?.data.enforcementPoint, 'guard')
})

test('plugin disposal removes both the denial hook and guard', async () => {
  const ctx = await runtime()
  let executions = 0
  ctx.tools.register(fixtureTool('course_unsafe_operation', async () => {
    executions += 1
    return { executed: true }
  }))
  const fiber = await ctx.plugin(ToolPolicyGate, { blockedTools: ['course_unsafe_operation'] })

  const denied = await ctx.tools.execute({
    callId: CallId('module08-before-dispose'),
    name: 'course_unsafe_operation',
    arguments: {},
    signal,
  })
  assert.equal(denied.isError, true)
  assert.equal(executions, 0)

  await fiber.dispose()
  const allowed = await ctx.tools.execute({
    callId: CallId('module08-after-dispose'),
    name: 'course_unsafe_operation',
    arguments: {},
    signal,
  })
  assert.equal(allowed.isError, false)
  assert.equal(executions, 1)
})

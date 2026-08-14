/*
 * Copyright 2026 Borealbit Technology Limited
 * Licensed under the Apache License, Version 2.0.
 */

import type { Context } from '@deepseek-ai/cordis'
import Schema from '@deepseek-ai/schemastery'
import type { PreToolDecision, ToolExecution } from '@deepseek-ai/dsh-tools'
import type {} from '@deepseek-ai/dsh-session/types'

declare module '@deepseek-ai/dsh-session/types' {
  interface SessionEventMap {
    /**
     * Log-only decision emitted when this package denies a Tool execution.
     * Arguments are deliberately omitted; the adjacent core `tool/call` event
     * owns the canonical input without this policy duplicating sensitive data.
     */
    'borealbit-policy/tool-decision': {
      policy: 'tool-policy-gate'
      ruleId: string
      decision: 'deny'
      enforcementPoint: 'pre-execute' | 'guard'
      callId: string
      rootCallId: string
      tool: string
      reason: string
      argumentsRecorded: false
    }
  }
}

export const name = 'borealbit-tool-policy-gate'
export const inject = ['tools']
export const AUDIT_EVENT_TYPE = 'borealbit-policy/tool-decision' as const

const DEFAULT_RULE_ID = 'course.blocked-tool'
const DEFAULT_REASON = 'Blocked by the deployment-owned Tool policy.'
const MAX_BLOCKED_TOOLS = 64
const TOOL_NAME = /^[A-Za-z0-9][A-Za-z0-9_.:/-]{0,127}$/
const RULE_ID = /^[a-z0-9][a-z0-9._:-]{0,63}$/
const CONTROL_CHARACTER = /[\u0000-\u001f\u007f]/u

export interface Config {
  blockedTools: string[]
  ruleId?: string
  reason?: string
}

export interface NormalizedConfig {
  readonly blockedTools: readonly string[]
  readonly ruleId: string
  readonly reason: string
}

export const Config: Schema<Config> = Schema.object({
  blockedTools: Schema.array(Schema.string()).required(),
  ruleId: Schema.string().default(DEFAULT_RULE_ID),
  reason: Schema.string().default(DEFAULT_REASON),
})

/** Validate, detach, sort, and freeze deployment-owned policy configuration. */
export function normalizeConfig(config: Config): NormalizedConfig {
  if (!Array.isArray(config.blockedTools)
    || config.blockedTools.length < 1
    || config.blockedTools.length > MAX_BLOCKED_TOOLS) {
    throw new TypeError(`tool-policy-gate: blockedTools must contain 1-${MAX_BLOCKED_TOOLS} exact Tool names`)
  }

  const blockedTools = [...config.blockedTools]
  for (const tool of blockedTools) {
    if (!TOOL_NAME.test(tool)) {
      throw new TypeError(`tool-policy-gate: invalid Tool name ${JSON.stringify(tool)}`)
    }
  }
  blockedTools.sort()
  for (let index = 1; index < blockedTools.length; index += 1) {
    if (blockedTools[index] === blockedTools[index - 1]) {
      throw new TypeError(`tool-policy-gate: duplicate blocked Tool ${JSON.stringify(blockedTools[index])}`)
    }
  }

  const ruleId = config.ruleId ?? DEFAULT_RULE_ID
  if (!RULE_ID.test(ruleId)) {
    throw new TypeError(`tool-policy-gate: invalid ruleId ${JSON.stringify(ruleId)}`)
  }

  const reason = config.reason ?? DEFAULT_REASON
  if (reason.length < 1 || reason.length > 300 || CONTROL_CHARACTER.test(reason)) {
    throw new TypeError('tool-policy-gate: reason must be 1-300 characters with no control characters')
  }

  return Object.freeze({
    blockedTools: Object.freeze(blockedTools),
    ruleId,
    reason,
  })
}

/** Register one typed denial hook, a monotonic fallback guard, and audit cleanup. */
export function apply(ctx: Context, config: Config): void {
  const normalized = normalizeConfig(config)
  const blocked = new Set(normalized.blockedTools)
  const audited = new Set<ToolExecution['token']>()

  const recordDecision = (
    exec: Readonly<ToolExecution>,
    enforcementPoint: 'pre-execute' | 'guard',
  ): void => {
    if (audited.has(exec.token)) return
    audited.add(exec.token)
    if (exec.agent === undefined) return
    exec.agent.session.append(AUDIT_EVENT_TYPE, {
      policy: 'tool-policy-gate',
      ruleId: normalized.ruleId,
      decision: 'deny',
      enforcementPoint,
      callId: String(exec.callId),
      rootCallId: String(exec.rootCallId),
      tool: exec.name,
      reason: normalized.reason,
      argumentsRecorded: false,
    })
  }

  ctx.on('tools/pre-execute', (exec, next): Promise<PreToolDecision> => {
    if (!blocked.has(exec.name)) return next()
    recordDecision(exec, 'pre-execute')
    return Promise.resolve({ kind: 'deny', reason: normalized.reason })
  })

  // A preceding waterfall listener may short-circuit with allow/approved ask.
  // The monotonic guard still runs and cannot be overridden by another allow.
  ctx.tools.guard((exec) => {
    if (!blocked.has(exec.name)) return undefined
    recordDecision(exec, 'guard')
    return normalized.reason
  })

  // Every materialized Tool outcome reaches this contained observer. Remove
  // the execution-local correlation token without observing or copying values.
  ctx.on('tools/result', (exec): undefined => {
    audited.delete(exec.token)
    return undefined
  })
}

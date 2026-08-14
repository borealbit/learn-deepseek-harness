/*
 * Copyright 2026 Borealbit Technology Limited
 * Licensed under the Apache License, Version 2.0.
 */

import { createHash } from 'node:crypto'
import { Session, SessionId } from '@deepseek-ai/dsh-session'

function clone(value) {
  return structuredClone(value)
}

function assertRunId(value) {
  if (typeof value !== 'string' || !/^[a-z0-9][a-z0-9._-]{0,119}$/i.test(value)) {
    throw new TypeError('runId must be a bounded identifier')
  }
}

function boundedJson(value, maximum = 8_000) {
  const text = JSON.stringify(value)
  if (text.length <= maximum) return text
  return JSON.stringify({ truncated: true, originalCharacters: text.length })
}

export function buildSessionEvidence({ runId, baseTime, target, operations }) {
  assertRunId(runId)
  if (!Number.isSafeInteger(baseTime) || baseTime < 0) {
    throw new TypeError('baseTime must be a non-negative safe integer')
  }
  if (!Array.isArray(operations) || operations.length < 1 || operations.length > 40) {
    throw new TypeError('operations must contain 1-40 entries')
  }
  const header = {
    type: 'session',
    version: 0,
    id: runId,
    createdAt: baseTime,
    delegationDepth: 0,
  }
  const events = []
  let tick = 0
  let message = 0
  const append = (type, data, extra = {}) => {
    events.push({
      type,
      seq: events.length,
      time: baseTime + tick,
      data: clone(data),
      ...clone(extra),
    })
    tick += 1
    return events.at(-1)
  }

  append('turn/start', { turn: 1 })
  append('step/start', { turn: 1, step: 1 })
  append('user/message', {
    id: `${runId}-user-${++message}`,
    role: 'user',
    content: [{ type: 'text', text: `Review synthetic target ${target} without authorizing release.` }],
    source: { kind: 'user' },
  }, { surfaceOp: 'append' })

  for (let index = 0; index < operations.length; index += 1) {
    const operation = operations[index]
    if (typeof operation.name !== 'string' || !/^[a-z][a-z0-9_]{0,63}$/.test(operation.name)) {
      throw new TypeError(`invalid operation name at index ${index}`)
    }
    const callId = `${runId}-call-${index + 1}`
    const call = append('tool/call', {
      turn: 1,
      step: 1,
      callId,
      name: operation.name,
      arguments: boundedJson(operation.arguments ?? {}),
    })
    const block = {
      type: 'tool-result',
      toolCallId: callId,
      content: [{ type: 'text', text: boundedJson(operation.result ?? null) }],
      ...(operation.isError === true ? { isError: true } : {}),
    }
    append('tool/result', {
      turn: 1,
      step: 1,
      message: {
        id: `${runId}-tool-${++message}`,
        role: 'user',
        content: [block],
        source: { kind: 'tool', callId },
      },
      ...(operation.isError === true
        ? { error: { name: 'CapstoneOperationError', code: operation.errorCode ?? 'BLOCKED' } }
        : {}),
    }, { sourceEventSeqs: [call.seq], surfaceOp: 'append' })
  }

  append('step/end', { turn: 1, step: 1 })
  append('turn/end', { turn: 1, reason: { kind: 'completed' } })
  const { type: ignored, ...sessionHeader } = header
  void ignored
  Session.create(SessionId(header.id), events, sessionHeader)
  const jsonl = [header, ...events].map(record => JSON.stringify(record)).join('\n') + '\n'
  return {
    header,
    events,
    jsonl,
    sha256: createHash('sha256').update(jsonl).digest('hex'),
  }
}

export function validateSessionEvidence(text) {
  if (typeof text !== 'string') throw new TypeError('session evidence must be text')
  const lines = text.split(/\r?\n/)
  if (lines.at(-1) === '') lines.pop()
  if (lines.length < 2 || lines.some(line => line.trim().length === 0)) {
    throw new Error('session evidence must be non-empty JSONL')
  }
  const records = lines.map((line, index) => {
    try {
      return JSON.parse(line)
    } catch (error) {
      throw new SyntaxError(`invalid JSON at line ${index + 1}: ${error.message}`)
    }
  })
  const [header, ...events] = records
  if (header.type !== 'session') throw new Error('first record must be a session header')
  for (let index = 0; index < events.length; index += 1) {
    if (events[index].seq !== index) {
      throw new Error(`event sequence gap: expected ${index}, got ${String(events[index].seq)}`)
    }
  }
  const { type: ignored, ...sessionHeader } = header
  void ignored
  const session = Session.create(SessionId(header.id), events, sessionHeader)
  return {
    header,
    events,
    session,
    sha256: createHash('sha256').update(text).digest('hex'),
  }
}

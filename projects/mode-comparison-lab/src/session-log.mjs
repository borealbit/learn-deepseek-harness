/*
 * Copyright 2026 Borealbit Technology Limited
 * Licensed under the Apache License, Version 2.0.
 */

import { Session, SessionId } from '@deepseek-ai/dsh-session'

function parseLine(line, number) {
  try {
    return JSON.parse(line)
  } catch (error) {
    throw new SyntaxError(`invalid JSON on line ${number}: ${error.message}`)
  }
}

function sessionHeaderFromRecord(record) {
  if (record === null || typeof record !== 'object' || Array.isArray(record)) {
    throw new TypeError('line 1 must be a Session header object')
  }
  if (record.type !== 'session') throw new TypeError('line 1 must have type "session"')
  const { type: ignored, ...header } = record
  void ignored
  return header
}

function assertLifecycle(events) {
  let openTurn = null
  let openStep = null
  const pendingCalls = new Map()

  for (const event of events) {
    switch (event.type) {
      case 'turn/start':
        if (openTurn !== null) throw new Error(`turn ${event.data.turn} opened while turn ${openTurn} is active`)
        openTurn = event.data.turn
        break
      case 'turn/end':
        if (openTurn !== event.data.turn) throw new Error(`turn/end ${event.data.turn} does not match open turn ${openTurn}`)
        if (openStep !== null) throw new Error(`turn ${openTurn} ended while step ${openStep.step} is active`)
        if (pendingCalls.size > 0) throw new Error(`turn ${openTurn} ended with unmatched Tool calls`)
        openTurn = null
        break
      case 'step/start':
        if (openTurn !== event.data.turn) throw new Error(`step ${event.data.step} is outside turn ${event.data.turn}`)
        if (openStep !== null) throw new Error(`step ${event.data.step} opened while step ${openStep.step} is active`)
        openStep = { turn: event.data.turn, step: event.data.step }
        break
      case 'step/end':
        if (openStep?.turn !== event.data.turn || openStep?.step !== event.data.step) {
          throw new Error(`step/end ${event.data.turn}:${event.data.step} does not match the open step`)
        }
        if (pendingCalls.size > 0) throw new Error(`step ${event.data.step} ended with unmatched Tool calls`)
        openStep = null
        break
      case 'assistant/chunk':
      case 'assistant/message':
      case 'tool/call':
        if (openStep?.turn !== event.data.turn || openStep?.step !== event.data.step) {
          throw new Error(`${event.type} ${event.data.turn}:${event.data.step} is outside its step`)
        }
        if (event.type === 'tool/call') {
          if (pendingCalls.has(event.data.callId)) throw new Error(`duplicate open Tool call ${event.data.callId}`)
          pendingCalls.set(event.data.callId, event)
        }
        break
      case 'tool/result': {
        if (openStep?.turn !== event.data.turn || openStep?.step !== event.data.step) {
          throw new Error(`tool/result ${event.data.turn}:${event.data.step} is outside its step`)
        }
        const callId = event.data.message?.source?.callId
        const call = pendingCalls.get(callId)
        if (call === undefined) throw new Error(`Tool result ${callId} has no open call`)
        if (call.data.turn !== event.data.turn || call.data.step !== event.data.step) {
          throw new Error(`Tool result ${callId} crosses a step boundary`)
        }
        pendingCalls.delete(callId)
        break
      }
      default:
        break
    }
  }

  if (openStep !== null) throw new Error(`trace ended with open step ${openStep.step}`)
  if (openTurn !== null) throw new Error(`trace ended with open turn ${openTurn}`)
  if (pendingCalls.size > 0) throw new Error('trace ended with unmatched Tool calls')
}

export function parseSessionLog(text) {
  if (typeof text !== 'string') throw new TypeError('Session log must be text')
  const rawLines = text.split(/\r?\n/)
  if (rawLines.at(-1) === '') rawLines.pop()
  if (rawLines.length < 2) throw new Error('Session log must contain one header and at least one event')
  const blank = rawLines.findIndex(line => line.trim().length === 0)
  if (blank !== -1) throw new Error(`blank JSONL record on line ${blank + 1}`)

  const headerRecord = parseLine(rawLines[0], 1)
  const header = sessionHeaderFromRecord(headerRecord)
  const events = rawLines.slice(1).map((line, index) => parseLine(line, index + 2))

  for (let index = 0; index < events.length; index += 1) {
    if (events[index]?.seq !== index) {
      throw new Error(`event seq must be contiguous: expected ${index}, got ${String(events[index]?.seq)}`)
    }
  }

  const session = Session.create(SessionId(header.id), events, header)
  assertLifecycle(events)

  return {
    header: { type: 'session', ...header },
    sessionHeader: header,
    events,
    session,
  }
}

export function textFromBlocks(blocks) {
  if (!Array.isArray(blocks)) return ''
  return blocks
    .filter(block => block?.type === 'text' && typeof block.text === 'string')
    .map(block => block.text)
    .join('\n')
}

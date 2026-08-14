/*
 * Copyright 2026 Borealbit Technology Limited
 * Licensed under the Apache License, Version 2.0.
 */

function toolSchema(name) {
  return {
    name,
    description: `Synthetic ${name} Tool used only by the Module 10 fixture.`,
    parameters: { type: 'object', additionalProperties: false, properties: {} },
  }
}

function assertTime(value, label) {
  if (!Number.isSafeInteger(value) || value < 0) {
    throw new TypeError(`${label} must be a non-negative safe integer`)
  }
}

function absoluteTime(run, relative, label) {
  assertTime(relative, label)
  const value = run.baseTime + relative
  assertTime(value, `${label} absolute time`)
  return value
}

function usageChunk(usage) {
  return { type: 'usage', usage }
}

function finishChunk(kind, failure) {
  return {
    type: 'finish',
    reason: failure === undefined ? { kind } : { kind, failure },
  }
}

function clone(value) {
  return structuredClone(value)
}

export function buildTrace(configuration, run) {
  if (!/^[a-z0-9-]+$/.test(configuration.id)) {
    throw new TypeError(`invalid configuration id: ${configuration.id}`)
  }
  if (!/^[a-z0-9-]+$/.test(run.sessionId)) {
    throw new TypeError(`invalid session id: ${run.sessionId}`)
  }
  assertTime(run.baseTime, 'baseTime')

  const header = {
    type: 'session',
    version: 0,
    id: run.sessionId,
    createdAt: run.baseTime,
    delegationDepth: 0,
  }
  const events = []
  const toolCallSeqs = new Map()
  let messageNumber = 0
  let currentRoute = {
    provider: 'module10-fixture',
    model: configuration.id,
  }

  const append = (type, time, data, extra = {}) => {
    assertTime(time, `${type} time`)
    const event = { type, seq: events.length, time, data: clone(data), ...clone(extra) }
    events.push(event)
    return event
  }
  const messageId = role => `${run.sessionId}-${role}-${++messageNumber}`
  const at = (value, label) => absoluteTime(run, value, label)

  const appendAssistantText = action => {
    const sourceSeqs = []
    sourceSeqs.push(append(
      'assistant/chunk',
      at(action.atStart, 'assistant-text atStart'),
      { turn: action.turn, step: action.step, chunk: { type: 'block-start', index: 0, blockType: 'text' } },
    ).seq)
    sourceSeqs.push(append(
      'assistant/chunk',
      at(action.atFirstToken, 'assistant-text atFirstToken'),
      { turn: action.turn, step: action.step, chunk: { type: 'text-delta', index: 0, text: action.text } },
    ).seq)
    sourceSeqs.push(append(
      'assistant/chunk',
      at(action.atEnd - 2, 'assistant-text block end'),
      { turn: action.turn, step: action.step, chunk: { type: 'block-end', index: 0, block: { type: 'text', text: action.text } } },
    ).seq)
    sourceSeqs.push(append(
      'assistant/chunk',
      at(action.atEnd - 1, 'assistant-text usage'),
      { turn: action.turn, step: action.step, chunk: usageChunk(action.usage) },
    ).seq)
    sourceSeqs.push(append(
      'assistant/chunk',
      at(action.atEnd, 'assistant-text finish'),
      { turn: action.turn, step: action.step, chunk: finishChunk('stop') },
    ).seq)
    append(
      'assistant/message',
      at(action.atEnd, 'assistant-text message'),
      {
        turn: action.turn,
        step: action.step,
        message: {
          id: messageId('assistant'),
          role: 'assistant',
          content: [{ type: 'text', text: action.text }],
          source: { kind: 'model', ...currentRoute },
        },
        usage: action.usage,
      },
      { sourceEventSeqs: sourceSeqs, surfaceOp: 'append' },
    )
  }

  const appendAssistantToolCall = action => {
    const block = {
      type: 'tool-call',
      id: action.callId,
      name: action.name,
      arguments: action.arguments,
    }
    const sourceSeqs = []
    sourceSeqs.push(append(
      'assistant/chunk',
      at(action.atStart, 'assistant-tool-call atStart'),
      { turn: action.turn, step: action.step, chunk: { type: 'block-start', index: 0, blockType: 'tool-call' } },
    ).seq)
    sourceSeqs.push(append(
      'assistant/chunk',
      at(action.atFirstToken, 'assistant-tool-call atFirstToken'),
      {
        turn: action.turn,
        step: action.step,
        chunk: {
          type: 'tool-call-delta',
          index: 0,
          id: action.callId,
          name: action.name,
          argumentsDelta: action.arguments,
        },
      },
    ).seq)
    sourceSeqs.push(append(
      'assistant/chunk',
      at(action.atEnd - 2, 'assistant-tool-call block end'),
      { turn: action.turn, step: action.step, chunk: { type: 'block-end', index: 0, block } },
    ).seq)
    sourceSeqs.push(append(
      'assistant/chunk',
      at(action.atEnd - 1, 'assistant-tool-call usage'),
      { turn: action.turn, step: action.step, chunk: usageChunk(action.usage) },
    ).seq)
    sourceSeqs.push(append(
      'assistant/chunk',
      at(action.atEnd, 'assistant-tool-call finish'),
      { turn: action.turn, step: action.step, chunk: finishChunk('tool-calls') },
    ).seq)
    append(
      'assistant/message',
      at(action.atEnd, 'assistant-tool-call message'),
      {
        turn: action.turn,
        step: action.step,
        message: {
          id: messageId('assistant'),
          role: 'assistant',
          content: [block],
          source: { kind: 'model', ...currentRoute },
        },
        usage: action.usage,
      },
      { sourceEventSeqs: sourceSeqs, surfaceOp: 'append' },
    )
  }

  for (const action of run.actions) {
    switch (action.kind) {
      case 'turn-start':
        append('turn/start', at(action.at, 'turn-start'), { turn: action.turn })
        break
      case 'turn-end':
        append('turn/end', at(action.at, 'turn-end'), { turn: action.turn, reason: action.reason })
        break
      case 'step-start':
        append('step/start', at(action.at, 'step-start'), { turn: action.turn, step: action.step })
        break
      case 'step-end':
        append('step/end', at(action.at, 'step-end'), { turn: action.turn, step: action.step })
        break
      case 'user':
        append(
          'user/message',
          at(action.at, 'user'),
          {
            id: messageId('user'),
            role: 'user',
            content: [{ type: 'text', text: action.text }],
            source: action.source ?? { kind: 'user' },
          },
          { surfaceOp: 'append' },
        )
        break
      case 'request': {
        currentRoute = {
          provider: action.provider ?? 'module10-fixture',
          model: action.model ?? configuration.id,
        }
        append(
          'request/header',
          at(action.at, 'request'),
          {
            header: {
              config: currentRoute,
              ...(action.system === undefined ? {} : { system: action.system }),
              ...(action.tools.length === 0 ? {} : { tools: action.tools.map(toolSchema) }),
            },
            reason: action.reason,
          },
        )
        append(
          'request/context',
          at(action.at, 'request context'),
          currentRoute,
        )
        break
      }
      case 'assistant-text':
        appendAssistantText(action)
        break
      case 'assistant-tool-call':
        appendAssistantToolCall(action)
        break
      case 'tool-start': {
        const event = append(
          'tool/call',
          at(action.at, 'tool-start'),
          {
            turn: action.turn,
            step: action.step,
            callId: action.callId,
            name: action.name,
            arguments: action.arguments,
          },
        )
        toolCallSeqs.set(action.callId, event.seq)
        break
      }
      case 'tool-result': {
        const callSeq = toolCallSeqs.get(action.callId)
        if (callSeq === undefined) throw new Error(`tool result has no recorded call: ${action.callId}`)
        const resultBlock = {
          type: 'tool-result',
          toolCallId: action.callId,
          content: [{ type: 'text', text: action.text }],
          ...(action.error === undefined ? {} : { isError: true }),
        }
        append(
          'tool/result',
          at(action.at, 'tool-result'),
          {
            turn: action.turn,
            step: action.step,
            message: {
              id: messageId('tool'),
              role: 'user',
              content: [resultBlock],
              source: { kind: 'tool', callId: action.callId },
            },
            ...(action.error === undefined ? {} : { error: action.error }),
          },
          { sourceEventSeqs: [callSeq], surfaceOp: 'append' },
        )
        break
      }
      case 'model-failure':
        if (action.usage !== undefined) {
          append(
            'assistant/chunk',
            at(action.atStart, 'model-failure usage'),
            { turn: action.turn, step: action.step, chunk: usageChunk(action.usage) },
          )
        }
        append(
          'assistant/chunk',
          at(action.atEnd, 'model-failure finish'),
          {
            turn: action.turn,
            step: action.step,
            chunk: finishChunk(action.finishKind ?? 'error', action.failure),
          },
        )
        break
      case 'retry':
        append(
          'llm/retry',
          at(action.atScheduled, 'retry scheduled'),
          {
            retryId: action.retryId,
            turn: action.turn,
            step: action.step,
            provider: action.provider,
            mode: 'normal',
            policyKey: '["normal",1,["TRANSPORT"],5,5,0]',
            retry: action.retry,
            maxRetries: 1,
            delayMs: action.atStarted - action.atScheduled,
            failure: action.failure,
          },
        )
        append(
          'llm/retry-started',
          at(action.atStarted, 'retry started'),
          {
            retryId: action.retryId,
            turn: action.turn,
            step: action.step,
            retry: action.retry,
          },
        )
        break
      default:
        throw new Error(`unsupported fixture action: ${action.kind}`)
    }
  }

  for (let index = 1; index < events.length; index += 1) {
    if (events[index].time < events[index - 1].time) {
      throw new Error(
        `synthetic clock regressed at seq ${events[index].seq}: ${events[index].time} < ${events[index - 1].time}`,
      )
    }
  }

  return { configurationId: configuration.id, taskId: run.taskId, header, events }
}

export function serializeTrace(trace) {
  return `${[trace.header, ...trace.events].map(record => JSON.stringify(record)).join('\n')}\n`
}

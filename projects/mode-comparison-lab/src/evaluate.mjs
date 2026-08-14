/*
 * Copyright 2026 Borealbit Technology Limited
 * Licensed under the Apache License, Version 2.0.
 */

import { mkdir, readFile, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { Session, SessionId } from '@deepseek-ai/dsh-session'
import { configurations } from '../fixtures/run-matrix.mjs'
import { buildTrace, serializeTrace } from './trace-builder.mjs'
import { parseSessionLog, textFromBlocks } from './session-log.mjs'

const TASKS_URL = new URL('../fixtures/golden-tasks.json', import.meta.url)

function rounded(value, places = 4) {
  const factor = 10 ** places
  return Math.round(value * factor) / factor
}

function median(values) {
  if (values.length === 0) return null
  const sorted = [...values].sort((left, right) => left - right)
  const middle = Math.floor(sorted.length / 2)
  return sorted.length % 2 === 1
    ? sorted[middle]
    : (sorted[middle - 1] + sorted[middle]) / 2
}

function emptyUsage() {
  return {
    uncachedInputTokens: 0,
    cacheReadTokens: 0,
    cacheWriteTokens: 0,
    outputTokens: 0,
    reasoningTokens: 0,
  }
}

function addUsage(target, usage) {
  target.uncachedInputTokens += usage.inputTokens ?? 0
  target.cacheReadTokens += usage.cacheReadTokens ?? 0
  target.cacheWriteTokens += usage.cacheWriteTokens ?? 0
  target.outputTokens += usage.outputTokens ?? 0
  target.reasoningTokens += usage.reasoningTokens ?? 0
  return target
}

function reportedTokenTotal(usage) {
  return usage.uncachedInputTokens
    + usage.cacheReadTokens
    + usage.cacheWriteTokens
    + usage.outputTokens
}

function isFirstTokenChunk(chunk) {
  if (chunk?.type === 'text-delta' || chunk?.type === 'reasoning-delta') {
    return typeof chunk.text === 'string' && chunk.text.length > 0
  }
  return chunk?.type === 'tool-call-delta'
    && ((typeof chunk.name === 'string' && chunk.name.length > 0)
      || (typeof chunk.argumentsDelta === 'string' && chunk.argumentsDelta.length > 0))
}

function reconstructRequest(trace, prefixLength) {
  const prefix = trace.events.slice(0, prefixLength)
  const session = Session.create(SessionId(trace.sessionHeader.id), prefix, trace.sessionHeader)
  const header = session.requestHeader()
  if (header === undefined) throw new Error(`model attempt at seq ${prefixLength} has no request/header`)
  const messages = session.deriveMessages()
  return {
    provider: header.config.provider,
    model: header.config.model,
    systemPresent: header.system !== undefined,
    toolCount: header.tools?.length ?? 0,
    inputMessageCount: messages.length,
    inputRoles: messages.map(message => message.role),
  }
}

export function reconstructModelAttempts(trace) {
  const attempts = []
  const perStepCounts = new Map()
  let openStep = null
  let attempt = null
  let retryStartedAt = null

  const beginAttempt = eventIndex => {
    if (openStep === null) throw new Error(`assistant chunk at seq ${eventIndex} has no open step`)
    const key = `${openStep.turn}:${openStep.step}`
    const number = (perStepCounts.get(key) ?? 0) + 1
    perStepCounts.set(key, number)
    attempt = {
      turn: openStep.turn,
      step: openStep.step,
      attempt: number,
      startedAt: retryStartedAt ?? openStep.startedAt,
      chunks: [],
      request: reconstructRequest(trace, eventIndex),
    }
    retryStartedAt = null
  }

  for (let index = 0; index < trace.events.length; index += 1) {
    const event = trace.events[index]
    if (event.type === 'step/start') {
      openStep = { turn: event.data.turn, step: event.data.step, startedAt: event.time }
      retryStartedAt = null
      continue
    }
    if (event.type === 'llm/retry-started') {
      retryStartedAt = event.time
      continue
    }
    if (event.type === 'assistant/chunk') {
      if (attempt === null) beginAttempt(index)
      attempt.chunks.push(event)
      if (event.data.chunk?.type === 'finish') {
        const firstToken = attempt.chunks.find(candidate => isFirstTokenChunk(candidate.data.chunk))
        const samples = attempt.chunks
          .filter(candidate => candidate.data.chunk?.type === 'usage')
          .map(candidate => candidate.data.chunk.usage)
        const usage = emptyUsage()
        for (const sample of samples) addUsage(usage, sample)
        attempts.push({
          turn: attempt.turn,
          step: attempt.step,
          attempt: attempt.attempt,
          finishKind: event.data.chunk.reason?.kind ?? 'unknown',
          durationMs: Math.max(0, event.time - attempt.startedAt),
          firstTokenMs: firstToken === undefined
            ? null
            : Math.max(0, firstToken.time - attempt.startedAt),
          usageReported: samples.length > 0,
          usage,
          request: attempt.request,
        })
        attempt = null
      }
      continue
    }
    if (event.type === 'step/end') {
      if (attempt !== null) throw new Error(`step ${event.data.turn}:${event.data.step} ended before a finish chunk`)
      openStep = null
      retryStartedAt = null
    }
  }

  for (const messageEvent of trace.events.filter(event => event.type === 'assistant/message')) {
    if (messageEvent.data.usage === undefined) continue
    const matching = attempts.findLast(candidate => (
      candidate.turn === messageEvent.data.turn
      && candidate.step === messageEvent.data.step
    ))
    if (matching !== undefined && !matching.usageReported) {
      addUsage(matching.usage, messageEvent.data.usage)
      matching.usageReported = true
    }
  }

  return attempts
}

function directUserText(event) {
  return event.type === 'user/message' && event.data.source?.kind === 'user'
    ? textFromBlocks(event.data.content)
    : null
}

export function analyzeTrace(trace) {
  const turnStarts = trace.events.filter(event => event.type === 'turn/start')
  const turnEnds = trace.events.filter(event => event.type === 'turn/end')
  if (turnStarts.length === 0 || turnEnds.length === 0) throw new Error('trace has no complete turn')

  const directUsers = trace.events
    .map(event => ({ event, text: directUserText(event) }))
    .filter(entry => entry.text !== null)
  const assistantText = trace.events
    .filter(event => event.type === 'assistant/message')
    .map(event => textFromBlocks(event.data.message.content))
    .filter(Boolean)
    .join('\n')
  const toolCalls = trace.events
    .filter(event => event.type === 'tool/call')
    .map(event => ({ seq: event.seq, name: event.data.name, callId: event.data.callId }))
  const errorCodes = trace.events
    .filter(event => event.type === 'tool/result' && event.data.error?.code !== undefined)
    .map(event => event.data.error.code)
  const attempts = reconstructModelAttempts(trace)
  const usage = emptyUsage()
  for (const attempt of attempts) addUsage(usage, {
    inputTokens: attempt.usage.uncachedInputTokens,
    cacheReadTokens: attempt.usage.cacheReadTokens,
    cacheWriteTokens: attempt.usage.cacheWriteTokens,
    outputTokens: attempt.usage.outputTokens,
    reasoningTokens: attempt.usage.reasoningTokens,
  })
  const usageObservedAttempts = attempts.filter(attempt => attempt.usageReported).length
  let clockRegressions = 0
  for (let index = 1; index < trace.events.length; index += 1) {
    if (trace.events[index].time < trace.events[index - 1].time) clockRegressions += 1
  }

  return {
    sessionId: trace.sessionHeader.id,
    eventCount: trace.events.length,
    firstUserText: directUsers[0]?.text ?? null,
    directUserEvents: directUsers.map(entry => ({ seq: entry.event.seq, text: entry.text })),
    humanInterventions: Math.max(0, directUsers.length - 1),
    assistantText,
    finalTurnKind: turnEnds.at(-1).data.reason.kind,
    turnKinds: turnEnds.map(event => event.data.reason.kind),
    durationMs: Math.max(0, turnEnds.at(-1).time - turnStarts[0].time),
    modelAttempts: attempts,
    modelRetryStarts: trace.events.filter(event => event.type === 'llm/retry-started').length,
    toolCalls,
    errorCodes,
    toolTimeouts: errorCodes.filter(code => code === 'TOOL_TIMEOUT').length,
    interruptedTurns: turnEnds.filter(event => event.data.reason.kind === 'interrupted').length,
    abortedTurns: turnEnds.filter(event => event.data.reason.kind === 'aborted').length,
    reportedUsage: usage,
    reportedTokenLowerBound: reportedTokenTotal(usage),
    usageCoverage: {
      observedAttempts: usageObservedAttempts,
      totalAttempts: attempts.length,
      complete: usageObservedAttempts === attempts.length,
    },
    clockRegressions,
  }
}

export function evaluateTask(task, analysis) {
  const failures = []
  const assertions = task.assertions
  if (analysis.firstUserText !== task.prompt) {
    failures.push('initial direct-user prompt does not match the golden task')
  }
  if (!assertions.finalTurnKinds.includes(analysis.finalTurnKind)) {
    failures.push(`final turn kind ${analysis.finalTurnKind} is not allowed`)
  }
  const assistantLower = analysis.assistantText.toLowerCase()
  for (const required of assertions.assistantIncludes ?? []) {
    if (!assistantLower.includes(required.toLowerCase())) {
      failures.push(`assistant output is missing: ${required}`)
    }
  }
  for (const code of assertions.requiredErrorCodes ?? []) {
    if (!analysis.errorCodes.includes(code)) failures.push(`required error code was not observed: ${code}`)
  }
  if (analysis.modelRetryStarts < (assertions.minRetryStarts ?? 0)) {
    failures.push(`retry starts ${analysis.modelRetryStarts} is below ${assertions.minRetryStarts}`)
  }
  if (analysis.humanInterventions < (assertions.minHumanInterventions ?? 0)) {
    failures.push(`human interventions ${analysis.humanInterventions} is below ${assertions.minHumanInterventions}`)
  }
  for (const [name, maximum] of Object.entries(assertions.maxToolCalls ?? {})) {
    const count = analysis.toolCalls.filter(call => call.name === name).length
    if (count > maximum) failures.push(`${name} calls ${count} exceeds ${maximum}`)
  }
  for (const name of assertions.requiresHumanBeforeRepeatedTool ?? []) {
    const calls = analysis.toolCalls.filter(call => call.name === name)
    for (let index = 1; index < calls.length; index += 1) {
      const intervened = analysis.directUserEvents.some(user => (
        user.seq > calls[index - 1].seq && user.seq < calls[index].seq
      ))
      if (!intervened) {
        failures.push(`${name} was repeated without a direct-user intervention`)
        break
      }
    }
  }
  if (analysis.clockRegressions > 0) failures.push(`trace contains ${analysis.clockRegressions} clock regressions`)
  return { passed: failures.length === 0, failures }
}

function summarizeConfiguration(configuration, evaluatedRuns) {
  const usage = emptyUsage()
  for (const run of evaluatedRuns) addUsage(usage, {
    inputTokens: run.analysis.reportedUsage.uncachedInputTokens,
    cacheReadTokens: run.analysis.reportedUsage.cacheReadTokens,
    cacheWriteTokens: run.analysis.reportedUsage.cacheWriteTokens,
    outputTokens: run.analysis.reportedUsage.outputTokens,
    reasoningTokens: run.analysis.reportedUsage.reasoningTokens,
  })
  const observedAttempts = evaluatedRuns.reduce(
    (total, run) => total + run.analysis.usageCoverage.observedAttempts,
    0,
  )
  const totalAttempts = evaluatedRuns.reduce(
    (total, run) => total + run.analysis.usageCoverage.totalAttempts,
    0,
  )
  const passedTasks = evaluatedRuns.filter(run => run.result.passed).length
  return {
    id: configuration.id,
    label: configuration.label,
    description: configuration.description,
    passedTasks,
    taskCount: evaluatedRuns.length,
    passRate: rounded(passedTasks / evaluatedRuns.length),
    totalRunDurationMs: evaluatedRuns.reduce((total, run) => total + run.analysis.durationMs, 0),
    medianRunDurationMs: median(evaluatedRuns.map(run => run.analysis.durationMs)),
    reportedTokenLowerBound: reportedTokenTotal(usage),
    reportedUsage: usage,
    usageCoverage: {
      observedAttempts,
      totalAttempts,
      complete: observedAttempts === totalAttempts,
    },
    humanInterventions: evaluatedRuns.reduce((total, run) => total + run.analysis.humanInterventions, 0),
    modelRetryStarts: evaluatedRuns.reduce((total, run) => total + run.analysis.modelRetryStarts, 0),
    toolTimeouts: evaluatedRuns.reduce((total, run) => total + run.analysis.toolTimeouts, 0),
    interruptedTurns: evaluatedRuns.reduce((total, run) => total + run.analysis.interruptedTurns, 0),
    abortedTurns: evaluatedRuns.reduce((total, run) => total + run.analysis.abortedTurns, 0),
  }
}

function assertSameCorpus(tasks, builtByConfiguration) {
  const expected = tasks.map(task => task.id).sort()
  for (const [configurationId, runs] of builtByConfiguration) {
    const actual = runs.map(run => run.taskId).sort()
    if (new Set(actual).size !== actual.length || JSON.stringify(actual) !== JSON.stringify(expected)) {
      throw new Error(`${configurationId} does not contain exactly the golden task set`)
    }
  }
}

async function loadTasks() {
  const document = JSON.parse(await readFile(TASKS_URL, 'utf8'))
  if (document.schemaVersion !== 1 || !Array.isArray(document.tasks) || document.tasks.length === 0) {
    throw new Error('unsupported or empty golden-task document')
  }
  const ids = document.tasks.map(task => task.id)
  if (new Set(ids).size !== ids.length) throw new Error('golden task ids must be unique')
  return document
}

export async function buildEvaluationInputs() {
  const taskDocument = await loadTasks()
  const builtByConfiguration = new Map()
  for (const configuration of configurations) {
    builtByConfiguration.set(
      configuration.id,
      configuration.runs.map(run => buildTrace(configuration, run)),
    )
  }
  assertSameCorpus(taskDocument.tasks, builtByConfiguration)
  return { taskDocument, builtByConfiguration }
}

export async function runEvaluation() {
  const { taskDocument, builtByConfiguration } = await buildEvaluationInputs()
  const taskById = new Map(taskDocument.tasks.map(task => [task.id, task]))
  const evaluatedByConfiguration = new Map()

  for (const configuration of configurations) {
    const evaluatedRuns = builtByConfiguration.get(configuration.id).map(built => {
      const parsed = parseSessionLog(serializeTrace(built))
      const analysis = analyzeTrace(parsed)
      const task = taskById.get(built.taskId)
      return { task, analysis, result: evaluateTask(task, analysis) }
    })
    evaluatedByConfiguration.set(configuration.id, evaluatedRuns)
  }

  const summaries = configurations.map(configuration => (
    summarizeConfiguration(configuration, evaluatedByConfiguration.get(configuration.id))
  ))
  const baseline = summaries[0]
  const candidate = summaries[1]
  const taskResults = taskDocument.tasks.map(task => ({
    taskId: task.id,
    title: task.title,
    runs: configurations.map(configuration => {
      const run = evaluatedByConfiguration.get(configuration.id).find(entry => entry.task.id === task.id)
      return {
        configurationId: configuration.id,
        passed: run.result.passed,
        failures: run.result.failures,
        finalTurnKind: run.analysis.finalTurnKind,
        durationMs: run.analysis.durationMs,
        reportedTokenLowerBound: run.analysis.reportedTokenLowerBound,
        usageCoverage: run.analysis.usageCoverage,
        humanInterventions: run.analysis.humanInterventions,
        modelRetryStarts: run.analysis.modelRetryStarts,
        toolTimeouts: run.analysis.toolTimeouts,
        interruptedTurns: run.analysis.interruptedTurns,
        toolCalls: run.analysis.toolCalls.map(call => call.name),
        modelAttempts: run.analysis.modelAttempts.map(attempt => ({
          turn: attempt.turn,
          step: attempt.step,
          attempt: attempt.attempt,
          finishKind: attempt.finishKind,
          durationMs: attempt.durationMs,
          firstTokenMs: attempt.firstTokenMs,
          usageReported: attempt.usageReported,
          provider: attempt.request.provider,
          model: attempt.request.model,
          inputMessageCount: attempt.request.inputMessageCount,
          toolCount: attempt.request.toolCount,
        })),
      }
    }),
  }))

  return {
    schemaVersion: 1,
    corpusId: taskDocument.corpusId,
    evidenceKind: 'deterministic-synthetic-session-fixtures',
    upstreamCompatibility: {
      sourceCommit: '47f943859bef60e4160492346772ded9b24f765a',
      sessionPackage: '@deepseek-ai/dsh-session@0.1.0-rc.6',
    },
    taskCount: taskDocument.tasks.length,
    configurations: summaries,
    delta: {
      comparison: `${candidate.id} minus ${baseline.id}`,
      passedTasks: candidate.passedTasks - baseline.passedTasks,
      passRate: rounded(candidate.passRate - baseline.passRate),
      totalRunDurationMs: candidate.totalRunDurationMs - baseline.totalRunDurationMs,
      reportedTokenLowerBound: candidate.reportedTokenLowerBound - baseline.reportedTokenLowerBound,
      humanInterventions: candidate.humanInterventions - baseline.humanInterventions,
      modelRetryStarts: candidate.modelRetryStarts - baseline.modelRetryStarts,
    },
    taskResults,
    interpretationLimits: [
      'The comparison measures two deterministic fixture policies, not model quality or provider reliability.',
      'Reported tokens are a lower bound whenever a model attempt has no provider usage sample.',
      'Aggregate duration is fixture event time, not a benchmark of wall-clock throughput.',
      'A completed turn can still fail a golden task, and an expected aborted turn can pass it.',
    ],
  }
}

export function renderMarkdown(report) {
  const lines = [
    '# Module 10 deterministic evaluation',
    '',
    `Corpus: \`${report.corpusId}\` (${report.taskCount} tasks)`,
    '',
    '| Configuration | Passed | Pass rate | Total duration | Reported token lower bound | Usage coverage | Human interventions | Retry starts |',
    '|---|---:|---:|---:|---:|---:|---:|---:|',
  ]
  for (const config of report.configurations) {
    lines.push(
      `| ${config.id} | ${config.passedTasks}/${config.taskCount} | ${(config.passRate * 100).toFixed(0)}% | ${config.totalRunDurationMs} ms | ${config.reportedTokenLowerBound} | ${config.usageCoverage.observedAttempts}/${config.usageCoverage.totalAttempts} | ${config.humanInterventions} | ${config.modelRetryStarts} |`,
    )
  }
  lines.push(
    '',
    '## Task matrix',
    '',
    '| Task | ' + report.configurations.map(config => config.id).join(' | ') + ' |',
    '|---|' + report.configurations.map(() => '---:').join('|') + '|',
  )
  for (const task of report.taskResults) {
    lines.push(`| ${task.taskId} | ${task.runs.map(run => run.passed ? 'PASS' : 'FAIL').join(' | ')} |`)
  }
  lines.push('', '## Interpretation limits', '')
  for (const limit of report.interpretationLimits) lines.push(`- ${limit}`)
  return `${lines.join('\n')}\n`
}

export async function materializeTraces(targetDirectory) {
  const { builtByConfiguration } = await buildEvaluationInputs()
  const root = path.resolve(targetDirectory)
  for (const [configurationId, traces] of builtByConfiguration) {
    const directory = path.join(root, configurationId)
    await mkdir(directory, { recursive: true })
    for (const trace of traces) {
      await writeFile(path.join(directory, `${trace.taskId}.session.jsonl`), serializeTrace(trace), 'utf8')
    }
  }
  return root
}

export const PROJECT_ROOT = fileURLToPath(new URL('..', import.meta.url))

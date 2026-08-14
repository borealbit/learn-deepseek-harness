/*
 * Copyright 2026 Borealbit Technology Limited
 * Licensed under the Apache License, Version 2.0.
 */

import assert from 'node:assert/strict'
import test from 'node:test'
import { buildEvaluationInputs, runEvaluation } from '../src/evaluate.mjs'
import { parseSessionLog } from '../src/session-log.mjs'
import { serializeTrace } from '../src/trace-builder.mjs'

test('both configurations contain the exact same five-task corpus', async () => {
  const { taskDocument, builtByConfiguration } = await buildEvaluationInputs()
  assert.equal(taskDocument.tasks.length, 5)
  assert.deepEqual([...builtByConfiguration.keys()], ['single-attempt', 'bounded-recovery'])
  for (const traces of builtByConfiguration.values()) assert.equal(traces.length, 5)
})

test('every generated JSONL trace is accepted by the real rc.6 Session package', async () => {
  const { builtByConfiguration } = await buildEvaluationInputs()
  for (const traces of builtByConfiguration.values()) {
    for (const trace of traces) {
      const parsed = parseSessionLog(serializeTrace(trace))
      assert.equal(parsed.events.length, trace.events.length)
      assert.equal(parsed.session.deriveMessages().length > 0, true)
    }
  }
})

test('request reconstruction retains provider, model, Tool count, and input history', async () => {
  const report = await runEvaluation()
  const timeout = report.taskResults.find(task => task.taskId === 'timeout-fallback')
  const bounded = timeout.runs.find(run => run.configurationId === 'bounded-recovery')
  assert.deepEqual(bounded.modelAttempts.map(attempt => attempt.toolCount), [2, 2, 2])
  assert.deepEqual(bounded.modelAttempts.map(attempt => attempt.inputMessageCount), [1, 3, 5])
  assert.equal(bounded.modelAttempts.every(attempt => attempt.provider === 'module10-fixture'), true)
  assert.equal(bounded.modelAttempts.every(attempt => attempt.model === 'bounded-recovery'), true)
})

test('task success is separate from turn completion', async () => {
  const report = await runEvaluation()
  const timeout = report.taskResults.find(task => task.taskId === 'timeout-fallback')
  const baseline = timeout.runs.find(run => run.configurationId === 'single-attempt')
  assert.equal(baseline.finalTurnKind, 'completed')
  assert.equal(baseline.passed, false)

  const cancelled = report.taskResults.find(task => task.taskId === 'cancellation-stop')
  assert.equal(cancelled.runs.every(run => run.finalTurnKind === 'aborted'), true)
  assert.equal(cancelled.runs.every(run => run.passed), true)
})

test('the interrupted-side-effect assertion catches a blind repeat', async () => {
  const report = await runEvaluation()
  const task = report.taskResults.find(result => result.taskId === 'interrupted-side-effect')
  const baseline = task.runs.find(run => run.configurationId === 'single-attempt')
  const bounded = task.runs.find(run => run.configurationId === 'bounded-recovery')
  assert.equal(baseline.passed, false)
  assert.match(baseline.failures.join('\n'), /without a direct-user intervention/)
  assert.equal(bounded.passed, true)
  assert.equal(bounded.humanInterventions, 1)
})

test('missing usage stays visible instead of being estimated', async () => {
  const report = await runEvaluation()
  for (const configuration of report.configurations) {
    assert.equal(configuration.usageCoverage.complete, false)
    assert.equal(configuration.usageCoverage.observedAttempts < configuration.usageCoverage.totalAttempts, true)
  }
})

test('the bounded configuration improves fixture pass rate with explicit costs', async () => {
  const report = await runEvaluation()
  assert.deepEqual(
    report.configurations.map(config => [config.id, config.passedTasks]),
    [['single-attempt', 2], ['bounded-recovery', 5]],
  )
  assert.equal(report.delta.passedTasks, 3)
  assert.equal(report.delta.humanInterventions, 1)
  assert.equal(report.delta.modelRetryStarts, 1)
  assert.equal(report.delta.reportedTokenLowerBound > 0, true)
})

test('a sequence gap is rejected before evaluation', async () => {
  const { builtByConfiguration } = await buildEvaluationInputs()
  const trace = structuredClone(builtByConfiguration.get('single-attempt')[0])
  trace.events[3].seq = 99
  assert.throws(
    () => parseSessionLog(serializeTrace(trace)),
    /event seq must be contiguous/,
  )
})

test('an unmatched Tool result is rejected by the lab invariant', async () => {
  const { builtByConfiguration } = await buildEvaluationInputs()
  const source = builtByConfiguration.get('single-attempt')
    .find(trace => trace.taskId === 'timeout-fallback')
  const trace = structuredClone(source)
  const result = trace.events.find(event => event.type === 'tool/result')
  result.data.message.source.callId = 'missing-call'
  result.data.message.content[0].toolCallId = 'missing-call'
  assert.throws(
    () => parseSessionLog(serializeTrace(trace)),
    /has no open call/,
  )
})

test('the deterministic report matches the recorded reference summary', async () => {
  const report = await runEvaluation()
  assert.deepEqual(
    report.configurations.map(config => ({
      id: config.id,
      passedTasks: config.passedTasks,
      passRate: config.passRate,
      totalRunDurationMs: config.totalRunDurationMs,
      reportedTokenLowerBound: config.reportedTokenLowerBound,
      usageCoverage: config.usageCoverage,
      humanInterventions: config.humanInterventions,
      modelRetryStarts: config.modelRetryStarts,
    })),
    [
      {
        id: 'single-attempt',
        passedTasks: 2,
        passRate: 0.4,
        totalRunDurationMs: 264,
        reportedTokenLowerBound: 734,
        usageCoverage: { observedAttempts: 7, totalAttempts: 8, complete: false },
        humanInterventions: 0,
        modelRetryStarts: 0,
      },
      {
        id: 'bounded-recovery',
        passedTasks: 5,
        passRate: 1,
        totalRunDurationMs: 351,
        reportedTokenLowerBound: 1106,
        usageCoverage: { observedAttempts: 10, totalAttempts: 11, complete: false },
        humanInterventions: 1,
        modelRetryStarts: 1,
      },
    ],
  )
})

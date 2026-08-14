/*
 * Copyright 2026 Borealbit Technology Limited
 * Licensed under the Apache License, Version 2.0.
 */

import { readFile } from 'node:fs/promises'

import { createFixtureRuntime } from '../src/fixture-runtime.mjs'
import { startReviewWorkflow } from '../src/review-workflow.mjs'

const requestUrl = new URL('../fixtures/review-request.json', import.meta.url)
const reviewRequest = JSON.parse(await readFile(requestUrl, 'utf8'))
const runtime = await createFixtureRuntime()
let run

try {
  run = startReviewWorkflow(runtime.ctx, reviewRequest)
  const result = await run.result
  await run.dispose()
  process.stdout.write(`${JSON.stringify({
    result,
    providerStarts: runtime.state.startCount,
    providerDisposals: runtime.state.disposalCount,
    events: runtime.events,
  }, null, 2)}\n`)

  if (
    result.stopReason !== 'completed'
    || result.value?.status !== 'ready-for-human-checkpoint'
    || result.value?.humanCheckpointRequired !== true
    || result.value?.mutationPerformed !== false
  ) {
    process.exitCode = 1
  }
} finally {
  if (run !== undefined) await run.dispose()
  await runtime.dispose()
}

#!/usr/bin/env node
/*
 * Copyright 2026 Borealbit Technology Limited
 * Licensed under the Apache License, Version 2.0.
 */

import path from 'node:path'
import { materializeTraces, PROJECT_ROOT, renderMarkdown, runEvaluation } from '../src/evaluate.mjs'

function parseArgs(args) {
  const options = { format: 'markdown', writeTraces: undefined }
  for (let index = 0; index < args.length; index += 1) {
    const argument = args[index]
    if (argument === '--format') {
      options.format = args[++index]
      if (!['json', 'markdown'].includes(options.format)) {
        throw new Error('--format must be json or markdown')
      }
    } else if (argument === '--write-traces') {
      options.writeTraces = args[++index]
      if (options.writeTraces === undefined) throw new Error('--write-traces requires a relative directory')
    } else {
      throw new Error(`unknown argument: ${argument}`)
    }
  }
  return options
}

function resolveProjectTarget(input) {
  if (path.isAbsolute(input)) throw new Error('--write-traces must stay inside this project')
  const target = path.resolve(process.cwd(), input)
  const relative = path.relative(PROJECT_ROOT, target)
  if (relative === '' || relative.startsWith('..') || path.isAbsolute(relative)) {
    throw new Error('--write-traces must name a child directory inside this project')
  }
  return target
}

const options = parseArgs(process.argv.slice(2))
if (options.writeTraces !== undefined) {
  const target = resolveProjectTarget(options.writeTraces)
  await materializeTraces(target)
}
const report = await runEvaluation()
process.stdout.write(options.format === 'json'
  ? `${JSON.stringify(report, null, 2)}\n`
  : renderMarkdown(report))

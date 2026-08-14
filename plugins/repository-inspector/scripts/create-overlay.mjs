/*
 * Copyright 2026 Borealbit Technology Limited
 * Licensed under the Apache License, Version 2.0.
 */

import { realpath, writeFile } from 'node:fs/promises'
import { isAbsolute, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

function yamlQuote(value) {
  return `'${value.replaceAll("'", "''")}'`
}

function readOption(argv, name) {
  const index = argv.indexOf(name)
  if (index === -1 || index + 1 >= argv.length) {
    throw new Error(`missing required option ${name}`)
  }
  return argv[index + 1]
}

export async function createOverlay({ allowedRoot, output }) {
  const root = await realpath(resolve(allowedRoot))
  if (!isAbsolute(root)) throw new Error('allowed root must resolve to an absolute path')
  const entry = fileURLToPath(new URL('../lib/index.js', import.meta.url))
  const destination = resolve(output)
  const yaml = [
    '- insert:',
    '    - id: borealbit-repository-inspector',
    `      name: ${yamlQuote(entry)}`,
    '      config:',
    `        allowedRoot: ${yamlQuote(root)}`,
    '        maxEntries: 40',
    '        maxManifestBytes: 32768',
    '',
  ].join('\n')
  await writeFile(destination, yaml, { encoding: 'utf8', flag: 'wx' })
  return { destination, entry, allowedRoot: root, yaml }
}

async function main() {
  const allowedRoot = readOption(process.argv.slice(2), '--allowed-root')
  const output = readOption(process.argv.slice(2), '--output')
  const result = await createOverlay({ allowedRoot, output })
  console.log(result.destination)
}

if (process.argv[1] && fileURLToPath(import.meta.url) === resolve(process.argv[1])) {
  main().catch(error => {
    console.error(error instanceof Error ? error.message : String(error))
    process.exitCode = 1
  })
}

/*
 * Copyright 2026 Borealbit Technology Limited
 * Licensed under the Apache License, Version 2.0.
 */

import { createHash } from 'node:crypto'
import { lstat, readFile, readdir, realpath } from 'node:fs/promises'
import { isAbsolute, relative, resolve, sep } from 'node:path'

const CONFIG_NAME = '.release-readiness.json'
const IGNORED_DIRECTORIES = new Set(['.git', 'node_modules', 'dist', '.release-output'])
const MAX_CONFIG_BYTES = 131_072
const MAX_INSTRUCTION_BYTES = 65_536
const ALLOWED_COMMAND_IDS = new Set(['lint', 'test', 'build'])
const ALLOWED_CONFIG_KEYS = new Set([
  'schemaVersion',
  'rootLabel',
  'instructionFiles',
  'scan',
  'commands',
  'release',
])

const CONTENT_RULES = [
  { id: 'aws-access-key', pattern: /\bAKIA[0-9A-Z]{16}\b/g },
  { id: 'github-token', pattern: /\bgh[pousr]_[A-Za-z0-9]{20,}\b/g },
  { id: 'generic-api-key', pattern: /\bsk-[A-Za-z0-9]{20,}\b/g },
  { id: 'private-key-block', pattern: /-----BEGIN [A-Z0-9 ]*PRIVATE KEY-----/g },
]

function assertPlainRecord(value, label) {
  if (value === null || typeof value !== 'object' || Array.isArray(value)) {
    throw new TypeError(`${label} must be an object`)
  }
  const prototype = Object.getPrototypeOf(value)
  if (prototype !== Object.prototype && prototype !== null) {
    throw new TypeError(`${label} must be a plain object`)
  }
}

function rejectUnknownKeys(value, allowed, label) {
  for (const key of Object.keys(value)) {
    if (!allowed.has(key)) throw new TypeError(`unsupported ${label} field: ${key}`)
  }
}

function boundedText(value, label, maximum) {
  if (typeof value !== 'string') throw new TypeError(`${label} must be a string`)
  const normalized = value.trim()
  if (normalized.length < 1 || normalized.length > maximum || /\p{Cc}/u.test(normalized)) {
    throw new TypeError(`${label} must be 1-${maximum} visible characters`)
  }
  return normalized
}

function boundedInteger(value, label, minimum, maximum) {
  if (!Number.isSafeInteger(value) || value < minimum || value > maximum) {
    throw new RangeError(`${label} must be an integer from ${minimum} to ${maximum}`)
  }
  return value
}

function normalizeRelativePath(value, label) {
  const path = boundedText(value, label, 240).replaceAll('\\', '/')
  if (
    path.startsWith('/')
    || /^[A-Za-z]:\//.test(path)
    || path === '..'
    || path.startsWith('../')
    || path.includes('/../')
  ) {
    throw new TypeError(`${label} must stay below the repository root`)
  }
  if (path === '.' || path.includes('//')) throw new TypeError(`${label} is not canonical`)
  return path
}

function sha256(value) {
  return createHash('sha256').update(value).digest('hex')
}

function inside(root, target) {
  const offset = relative(root, target)
  return offset === '' || (!offset.startsWith(`..${sep}`) && offset !== '..' && !isAbsolute(offset))
}

async function assertNoSymlinkPath(root, relativePath) {
  let cursor = root
  for (const segment of relativePath.split('/')) {
    cursor = resolve(cursor, segment)
    const metadata = await lstat(cursor)
    if (metadata.isSymbolicLink()) throw new Error(`symbolic links are not followed: ${relativePath}`)
  }
  return cursor
}

async function readBounded(root, relativePath, maximum) {
  const target = await assertNoSymlinkPath(root, relativePath)
  if (!inside(root, target)) throw new Error(`path escaped repository root: ${relativePath}`)
  const metadata = await lstat(target)
  if (!metadata.isFile()) throw new Error(`expected a regular file: ${relativePath}`)
  if (metadata.size > maximum) throw new RangeError(`${relativePath} exceeds ${maximum} bytes`)
  return readFile(target)
}

function normalizeCommand(value, index) {
  assertPlainRecord(value, `commands[${index}]`)
  rejectUnknownKeys(
    value,
    new Set(['id', 'argv', 'writesWorkspace', 'allowedWritePaths', 'timeoutMs']),
    `commands[${index}]`,
  )
  const id = boundedText(value.id, `commands[${index}].id`, 32)
  if (!ALLOWED_COMMAND_IDS.has(id)) throw new TypeError(`unsupported command id: ${id}`)
  if (!Array.isArray(value.argv) || value.argv.length < 2 || value.argv.length > 12) {
    throw new TypeError(`${id}.argv must contain 2-12 entries`)
  }
  const argv = value.argv.map((entry, argumentIndex) => (
    boundedText(entry, `${id}.argv[${argumentIndex}]`, 200)
  ))
  if (argv[0] !== 'node') throw new TypeError(`${id} must use the node executable`)
  const script = normalizeRelativePath(argv[1], `${id}.argv[1]`)
  if (!script.endsWith('.mjs') && !script.endsWith('.js')) {
    throw new TypeError(`${id} must execute a JavaScript file`)
  }
  argv[1] = script
  const writesWorkspace = value.writesWorkspace === true
  const allowedWritePaths = value.allowedWritePaths === undefined
    ? []
    : value.allowedWritePaths.map((path, pathIndex) => (
      normalizeRelativePath(path, `${id}.allowedWritePaths[${pathIndex}]`)
    ))
  if (!writesWorkspace && allowedWritePaths.length > 0) {
    throw new TypeError(`${id} declares write paths while writesWorkspace is false`)
  }
  if (writesWorkspace && allowedWritePaths.length === 0) {
    throw new TypeError(`${id} must declare at least one allowed write path`)
  }
  return Object.freeze({
    id,
    argv: Object.freeze(argv),
    writesWorkspace,
    allowedWritePaths: Object.freeze(allowedWritePaths),
    timeoutMs: boundedInteger(value.timeoutMs, `${id}.timeoutMs`, 100, 30_000),
  })
}

function normalizeConfig(input) {
  assertPlainRecord(input, 'release-readiness config')
  rejectUnknownKeys(input, ALLOWED_CONFIG_KEYS, 'release-readiness config')
  if (input.schemaVersion !== 1) throw new TypeError('schemaVersion must be 1')
  const rootLabel = boundedText(input.rootLabel, 'rootLabel', 120)

  if (!Array.isArray(input.instructionFiles) || input.instructionFiles.length > 8) {
    throw new TypeError('instructionFiles must be an array with at most 8 entries')
  }
  const instructionFiles = input.instructionFiles.map((name, index) => {
    const normalized = boundedText(name, `instructionFiles[${index}]`, 80)
    if (normalized.includes('/') || normalized.includes('\\') || normalized === '.' || normalized === '..') {
      throw new TypeError('instruction file candidates must be same-directory names')
    }
    return normalized
  })

  assertPlainRecord(input.scan, 'scan')
  rejectUnknownKeys(
    input.scan,
    new Set(['maxFiles', 'maxFileBytes', 'maxTotalBytes', 'maxFindings']),
    'scan',
  )
  const scan = Object.freeze({
    maxFiles: boundedInteger(input.scan.maxFiles, 'scan.maxFiles', 1, 2_000),
    maxFileBytes: boundedInteger(input.scan.maxFileBytes, 'scan.maxFileBytes', 256, 1_048_576),
    maxTotalBytes: boundedInteger(input.scan.maxTotalBytes, 'scan.maxTotalBytes', 1_024, 16_777_216),
    maxFindings: boundedInteger(input.scan.maxFindings, 'scan.maxFindings', 1, 100),
  })

  if (!Array.isArray(input.commands) || input.commands.length !== 3) {
    throw new TypeError('commands must declare exactly lint, test, and build')
  }
  const commands = input.commands.map(normalizeCommand)
  if (new Set(commands.map(command => command.id)).size !== commands.length) {
    throw new TypeError('command ids must be unique')
  }
  for (const required of ALLOWED_COMMAND_IDS) {
    if (!commands.some(command => command.id === required)) throw new TypeError(`missing ${required} command`)
  }

  assertPlainRecord(input.release, 'release')
  rejectUnknownKeys(
    input.release,
    new Set(['requiredFiles', 'requiredManifestFields']),
    'release',
  )
  const requiredFiles = input.release.requiredFiles.map((path, index) => (
    normalizeRelativePath(path, `release.requiredFiles[${index}]`)
  ))
  const requiredManifestFields = input.release.requiredManifestFields.map((field, index) => (
    boundedText(field, `release.requiredManifestFields[${index}]`, 80)
  ))

  return Object.freeze({
    schemaVersion: 1,
    rootLabel,
    instructionFiles: Object.freeze(instructionFiles),
    scan,
    commands: Object.freeze(commands),
    release: Object.freeze({
      requiredFiles: Object.freeze(requiredFiles),
      requiredManifestFields: Object.freeze(requiredManifestFields),
    }),
  })
}

async function discoverInstructions(root, candidates) {
  const instructions = []
  for (const candidate of candidates) {
    try {
      const content = await readBounded(root, candidate, MAX_INSTRUCTION_BYTES)
      instructions.push({
        path: candidate,
        bytes: content.byteLength,
        sha256: sha256(content),
      })
    } catch (error) {
      if (error?.code !== 'ENOENT') throw error
    }
  }
  return instructions
}

async function inspectManifest(root, config) {
  const content = await readBounded(root, 'package.json', MAX_CONFIG_BYTES)
  let manifest
  try {
    manifest = JSON.parse(content.toString('utf8'))
  } catch (error) {
    throw new SyntaxError(`package.json is invalid JSON: ${error.message}`)
  }
  assertPlainRecord(manifest, 'package.json')
  const missingManifestFields = config.release.requiredManifestFields
    .filter(field => manifest[field] === undefined || manifest[field] === null || manifest[field] === '')
  const missingFiles = []
  for (const path of config.release.requiredFiles) {
    try {
      await readBounded(root, path, MAX_CONFIG_BYTES)
    } catch (error) {
      if (error?.code === 'ENOENT') missingFiles.push(path)
      else throw error
    }
  }
  return {
    name: typeof manifest.name === 'string' ? manifest.name : null,
    version: typeof manifest.version === 'string' ? manifest.version : null,
    private: manifest.private === true,
    license: typeof manifest.license === 'string' ? manifest.license : null,
    engineNode: typeof manifest.engines?.node === 'string' ? manifest.engines.node : null,
    scriptNames: manifest.scripts && typeof manifest.scripts === 'object'
      ? Object.keys(manifest.scripts).sort()
      : [],
    missingManifestFields,
    missingFiles,
  }
}

function fileNameFinding(path) {
  const name = path.split('/').at(-1)
  if (/^\.env(?:\.|$)/i.test(name) && !/^\.env\.(?:example|sample|template)$/i.test(name)) {
    return 'secret-filename-env'
  }
  if (/\.(?:pem|p12|pfx|key)$/i.test(name)) return 'secret-filename-key-material'
  if (/(?:credential|secret)s?(?:\.|-|_|$)/i.test(name)) return 'secret-filename-sensitive'
  return null
}

async function inventoryFiles(root, maximum) {
  const queue = ['']
  const files = []
  const skippedSymlinks = []
  let capped = false
  while (queue.length > 0) {
    const directory = queue.shift()
    const entries = await readdir(resolve(root, directory), { withFileTypes: true })
    entries.sort((left, right) => left.name.localeCompare(right.name))
    for (const entry of entries) {
      const path = directory.length === 0 ? entry.name : `${directory}/${entry.name}`
      if (entry.isSymbolicLink()) {
        skippedSymlinks.push(path)
        continue
      }
      if (entry.isDirectory()) {
        if (!IGNORED_DIRECTORIES.has(entry.name)) queue.push(path)
        continue
      }
      if (!entry.isFile()) continue
      if (files.length >= maximum) {
        capped = true
        continue
      }
      files.push(path)
    }
  }
  return { files, skippedSymlinks, capped }
}

async function scanObviousSecrets(root, limits) {
  const inventory = await inventoryFiles(root, limits.maxFiles)
  const findings = []
  let scannedBytes = 0
  let skippedOversized = 0
  let skippedBinary = 0
  let totalCapReached = false

  const add = finding => {
    if (findings.length < limits.maxFindings) findings.push(finding)
  }

  for (const path of inventory.files) {
    const filenameRule = fileNameFinding(path)
    if (filenameRule !== null) add({ ruleId: filenameRule, path, line: null, fingerprint: null })
    const target = await assertNoSymlinkPath(root, path)
    const metadata = await lstat(target)
    if (metadata.size > limits.maxFileBytes) {
      skippedOversized += 1
      continue
    }
    if (scannedBytes + metadata.size > limits.maxTotalBytes) {
      totalCapReached = true
      continue
    }
    const bytes = await readFile(target)
    scannedBytes += bytes.byteLength
    if (bytes.includes(0)) {
      skippedBinary += 1
      continue
    }
    const lines = bytes.toString('utf8').split(/\r?\n/)
    for (let lineIndex = 0; lineIndex < lines.length; lineIndex += 1) {
      for (const rule of CONTENT_RULES) {
        rule.pattern.lastIndex = 0
        for (const match of lines[lineIndex].matchAll(rule.pattern)) {
          add({
            ruleId: rule.id,
            path,
            line: lineIndex + 1,
            fingerprint: sha256(match[0]).slice(0, 12),
          })
        }
      }
    }
  }

  return {
    complete: !inventory.capped && !totalCapReached,
    filesConsidered: inventory.files.length,
    scannedBytes,
    findings,
    skippedSymlinks: inventory.skippedSymlinks,
    skippedOversized,
    skippedBinary,
    fileCapReached: inventory.capped,
    totalByteCapReached: totalCapReached,
  }
}

export async function inspectRepository(inputRoot) {
  if (typeof inputRoot !== 'string' || !isAbsolute(inputRoot)) {
    throw new TypeError('repository root must be an absolute path')
  }
  const resolvedRoot = await realpath(inputRoot)
  const rootMetadata = await lstat(resolvedRoot)
  if (!rootMetadata.isDirectory()) throw new TypeError('repository root must be a directory')

  const rawConfig = await readBounded(resolvedRoot, CONFIG_NAME, MAX_CONFIG_BYTES)
  let parsedConfig
  try {
    parsedConfig = JSON.parse(rawConfig.toString('utf8'))
  } catch (error) {
    throw new SyntaxError(`${CONFIG_NAME} is invalid JSON: ${error.message}`)
  }
  const config = normalizeConfig(parsedConfig)
  const [instructions, manifest, secretScan] = await Promise.all([
    discoverInstructions(resolvedRoot, config.instructionFiles),
    inspectManifest(resolvedRoot, config),
    scanObviousSecrets(resolvedRoot, config.scan),
  ])

  return {
    root: resolvedRoot,
    rootLabel: config.rootLabel,
    config,
    instructions,
    manifest,
    secretScan,
  }
}

export function hashCanonical(value) {
  return sha256(JSON.stringify(value))
}

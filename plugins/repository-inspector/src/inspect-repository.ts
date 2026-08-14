/*
 * Copyright 2026 Borealbit Technology Limited
 * Licensed under the Apache License, Version 2.0.
 */

import { constants, type Dirent } from 'node:fs'
import { lstat, open, opendir, realpath } from 'node:fs/promises'
import { basename, isAbsolute, relative, resolve, sep } from 'node:path'

export const ENTRY_KINDS = ['directory', 'file', 'symlink', 'other'] as const

export type EntryKind = typeof ENTRY_KINDS[number]

export interface InspectorOptions {
  allowedRoot: string
  maxEntries?: number
  maxManifestBytes?: number
}

export interface NormalizedInspectorOptions {
  allowedRoot: string
  maxEntries: number
  maxManifestBytes: number
}

export interface RepositoryEntry {
  name: string
  kind: EntryKind
}

export interface PackageSummary {
  name?: string
  version?: string
  private?: boolean
  scriptNames: string[]
}

export interface InspectionResult {
  rootLabel: string
  path: string
  entries: RepositoryEntry[]
  truncated: boolean
  manifest: PackageSummary | null
  warnings: string[]
  readOnly: true
  untrusted: true
}

export interface InspectionRequest extends NormalizedInspectorOptions {
  path?: string
  signal?: AbortSignal
}

const DEFAULT_MAX_ENTRIES = 40
const DEFAULT_MAX_MANIFEST_BYTES = 32_768
const MAX_ENTRY_LIMIT = 100
const MIN_MANIFEST_BYTES = 1_024
const MAX_MANIFEST_BYTES = 131_072
const MAX_TEXT_FIELD = 200
const MAX_SCRIPT_NAMES = 50

function boundedInteger(value: number, field: string, minimum: number, maximum: number): number {
  if (!Number.isInteger(value) || value < minimum || value > maximum) {
    throw new Error(`${field} must be an integer from ${minimum} to ${maximum}`)
  }
  return value
}

export function normalizeInspectorOptions(options: InspectorOptions): NormalizedInspectorOptions {
  if (typeof options.allowedRoot !== 'string' || options.allowedRoot.trim().length === 0) {
    throw new Error('allowedRoot must be a non-empty absolute path')
  }
  if (!isAbsolute(options.allowedRoot)) {
    throw new Error('allowedRoot must be an absolute path')
  }

  return {
    allowedRoot: resolve(options.allowedRoot),
    maxEntries: boundedInteger(options.maxEntries ?? DEFAULT_MAX_ENTRIES, 'maxEntries', 1, MAX_ENTRY_LIMIT),
    maxManifestBytes: boundedInteger(
      options.maxManifestBytes ?? DEFAULT_MAX_MANIFEST_BYTES,
      'maxManifestBytes',
      MIN_MANIFEST_BYTES,
      MAX_MANIFEST_BYTES,
    ),
  }
}

function assertNotAborted(signal: AbortSignal | undefined): void {
  if (!signal?.aborted) return
  const error = new Error('repository inspection aborted')
  error.name = 'AbortError'
  throw error
}

function isOutside(root: string, candidate: string): boolean {
  const rel = relative(root, candidate)
  return rel === '..' || rel.startsWith(`..${sep}`) || isAbsolute(rel)
}

function entryKind(entry: Dirent): EntryKind {
  if (entry.isDirectory()) return 'directory'
  if (entry.isFile()) return 'file'
  if (entry.isSymbolicLink()) return 'symlink'
  return 'other'
}

function hasCode(error: unknown, code: string): boolean {
  return typeof error === 'object' && error !== null && 'code' in error
    && (error as NodeJS.ErrnoException).code === code
}

function safeText(value: unknown): string | undefined {
  if (typeof value !== 'string' || value.length === 0 || value.length > MAX_TEXT_FIELD) return undefined
  return value
}

async function inspectManifest(
  directory: string,
  maxManifestBytes: number,
  signal: AbortSignal | undefined,
  warnings: string[],
): Promise<PackageSummary | null> {
  const manifestPath = resolve(directory, 'package.json')
  let stats
  try {
    stats = await lstat(manifestPath)
  } catch (error) {
    if (hasCode(error, 'ENOENT')) return null
    throw error
  }

  if (stats.isSymbolicLink()) {
    warnings.push('package.json is a symbolic link and was not followed')
    return null
  }
  if (!stats.isFile()) {
    warnings.push('package.json exists but is not a regular file')
    return null
  }
  if (stats.size > maxManifestBytes) {
    warnings.push(`package.json exceeds the ${maxManifestBytes}-byte inspection limit`)
    return null
  }

  assertNotAborted(signal)
  let handle
  try {
    const noFollow = process.platform === 'win32' ? 0 : constants.O_NOFOLLOW
    handle = await open(manifestPath, constants.O_RDONLY | noFollow)
  } catch (error) {
    if (hasCode(error, 'ELOOP')) {
      warnings.push('package.json is a symbolic link and was not followed')
      return null
    }
    throw error
  }

  let raw: string
  try {
    const openedStats = await handle.stat()
    if (!openedStats.isFile()) {
      warnings.push('package.json changed during inspection and is no longer a regular file')
      return null
    }

    const buffer = Buffer.allocUnsafe(maxManifestBytes + 1)
    let bytesRead = 0
    while (bytesRead < buffer.length) {
      assertNotAborted(signal)
      const chunk = await handle.read(buffer, bytesRead, buffer.length - bytesRead, bytesRead)
      if (chunk.bytesRead === 0) break
      bytesRead += chunk.bytesRead
    }
    if (bytesRead > maxManifestBytes) {
      warnings.push(`package.json exceeds the ${maxManifestBytes}-byte inspection limit`)
      return null
    }
    raw = buffer.subarray(0, bytesRead).toString('utf8')
  } finally {
    await handle.close()
  }

  let parsed: unknown
  try {
    parsed = JSON.parse(raw)
  } catch {
    warnings.push('package.json is not valid JSON')
    return null
  }

  if (typeof parsed !== 'object' || parsed === null || Array.isArray(parsed)) {
    warnings.push('package.json does not contain a JSON object')
    return null
  }

  const record = parsed as Record<string, unknown>
  const scripts = typeof record.scripts === 'object' && record.scripts !== null && !Array.isArray(record.scripts)
    ? Object.keys(record.scripts)
      .filter(name => name.length > 0 && name.length <= MAX_TEXT_FIELD)
      .sort()
      .slice(0, MAX_SCRIPT_NAMES)
    : []

  const name = safeText(record.name)
  const version = safeText(record.version)
  const isPrivate = typeof record.private === 'boolean' ? record.private : undefined

  return {
    ...(name === undefined ? {} : { name }),
    ...(version === undefined ? {} : { version }),
    ...(isPrivate === undefined ? {} : { private: isPrivate }),
    scriptNames: scripts,
  }
}

export async function inspectRepository(request: InspectionRequest): Promise<InspectionResult> {
  assertNotAborted(request.signal)
  const requestedPath = request.path ?? '.'
  if (requestedPath.trim().length === 0) throw new Error('path must not be empty')
  if (isAbsolute(requestedPath)) throw new Error('path must be relative to allowedRoot')

  const root = await realpath(request.allowedRoot)
  const lexicalTarget = resolve(root, requestedPath)
  if (isOutside(root, lexicalTarget)) throw new Error('path escapes allowedRoot')

  const target = await realpath(lexicalTarget)
  if (isOutside(root, target)) throw new Error('resolved path escapes allowedRoot through a symbolic link')

  const targetStats = await lstat(target)
  if (!targetStats.isDirectory()) throw new Error('path must identify a directory')

  assertNotAborted(request.signal)
  const sampledEntries: RepositoryEntry[] = []
  const directory = await opendir(target)
  try {
    while (sampledEntries.length <= request.maxEntries) {
      assertNotAborted(request.signal)
      const entry = await directory.read()
      if (entry === null) break
      sampledEntries.push({ name: entry.name, kind: entryKind(entry) })
    }
  } finally {
    await directory.close()
  }
  sampledEntries
    .sort((left, right) => left.name < right.name ? -1 : left.name > right.name ? 1 : 0)
  const entries = sampledEntries.slice(0, request.maxEntries)
  const warnings: string[] = []
  const manifest = await inspectManifest(target, request.maxManifestBytes, request.signal, warnings)
  const relativePath = relative(root, target)

  assertNotAborted(request.signal)
  return {
    rootLabel: basename(root) || sep,
    path: relativePath.length === 0 ? '.' : relativePath.split(sep).join('/'),
    entries,
    truncated: sampledEntries.length > entries.length,
    manifest,
    warnings,
    readOnly: true,
    untrusted: true,
  }
}

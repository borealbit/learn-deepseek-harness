/*
 * Copyright 2026 Borealbit Technology Limited
 * Licensed under the Apache License, Version 2.0.
 */

const SEMVER = /^(?:0|[1-9]\d*)\.(?:0|[1-9]\d*)\.(?:0|[1-9]\d*)(?:-[0-9A-Za-z-]+(?:\.[0-9A-Za-z-]+)*)?(?:\+[0-9A-Za-z-]+(?:\.[0-9A-Za-z-]+)*)?$/
const EXACT_VERSION = /^(?:0|[1-9]\d*)\.(?:0|[1-9]\d*)\.(?:0|[1-9]\d*)(?:-[0-9A-Za-z-]+(?:\.[0-9A-Za-z-]+)*)?$/
const FORBIDDEN_PAYLOAD = [
  /(^|\/)\.env(?:\.|$)/i,
  /(^|\/)(?:src|test|tests|fixtures|node_modules)(?:\/|$)/,
  /(?:^|\/)(?:package-lock\.json|pnpm-lock\.yaml|yarn\.lock|bun\.lockb)$/,
  /(?:^|\/).*(?:credential|secret)(?:[^/]*$)/i,
  /\.(?:map|tgz|tsbuildinfo)$/,
]

function nonEmptyString(value) {
  return typeof value === 'string' && value.trim().length > 0
}

function exactVersion(value) {
  return typeof value === 'string' && EXACT_VERSION.test(value)
}

function exportTargets(value, output = []) {
  if (typeof value === 'string') {
    output.push(value)
  } else if (value && typeof value === 'object' && !Array.isArray(value)) {
    for (const child of Object.values(value)) exportTargets(child, output)
  }
  return output
}

function documentContains(document, fragments) {
  const normalized = document.toLowerCase().replace(/\s+/g, ' ')
  return fragments.every(fragment => normalized.includes(fragment.toLowerCase().replace(/\s+/g, ' ')))
}

function normalizeFiles(files) {
  return files.map(file => typeof file === 'string' ? { path: file, size: 0 } : file)
}

/**
 * Audit a prospective npm bundle without contacting or writing to a registry.
 * The caller owns file acquisition so unit tests can use synthetic inventories.
 */
export function auditReleaseCandidate({ manifest, files, documents }) {
  const inventory = normalizeFiles(files)
  const paths = new Set(inventory.map(file => file.path))
  const checks = []

  function add(id, status, message) {
    checks.push({ id, status, message })
  }

  const nameOkay = typeof manifest.name === 'string'
    && /^@[a-z0-9][a-z0-9._-]*\/[a-z0-9][a-z0-9._-]*$/.test(manifest.name)
  add('identity.name', nameOkay ? 'pass' : 'block', nameOkay
    ? `scoped package name is ${manifest.name}`
    : 'package name must be a lowercase scoped npm name')

  const versionOkay = typeof manifest.version === 'string' && SEMVER.test(manifest.version)
  add('identity.version', versionOkay ? 'pass' : 'block', versionOkay
    ? `version ${manifest.version} is valid SemVer`
    : 'package version is missing or is not valid SemVer')

  const attributionOkay = manifest.author === 'Dom Liu'
    && documents.notice.includes('Borealbit Technology Limited')
    && documents.notice.includes('Created by Dom Liu')
  add('identity.attribution', attributionOkay ? 'pass' : 'block', attributionOkay
    ? 'Borealbit copyright and Dom Liu attribution are present'
    : 'manifest and NOTICE must retain Borealbit copyright and Dom Liu attribution')

  const licenseOkay = manifest.license === 'Apache-2.0'
    && paths.has('LICENSE')
    && documents.license.includes('Apache License')
  add('identity.license', licenseOkay ? 'pass' : 'block', licenseOkay
    ? 'Apache-2.0 metadata and license payload agree'
    : 'Apache-2.0 metadata and the packaged LICENSE must agree')

  const publishEnabled = manifest.private !== true
  add('publication.enabled', publishEnabled ? 'pass' : 'block', publishEnabled
    ? 'manifest does not block publication'
    : 'private: true intentionally prevents npm publication')

  const publicAccess = manifest.publishConfig?.access === 'public'
  add('publication.access', publicAccess ? 'pass' : 'block', publicAccess
    ? 'scoped-package publish access is explicit'
    : 'publishConfig.access must declare the intended scoped-package visibility')

  const repositoryOkay = manifest.repository?.type === 'git'
    && nonEmptyString(manifest.repository?.url)
    && nonEmptyString(manifest.repository?.directory)
    && nonEmptyString(manifest.homepage)
    && nonEmptyString(manifest.bugs?.url)
  add('metadata.repository', repositoryOkay ? 'pass' : 'block', repositoryOkay
    ? 'repository, subdirectory, homepage, and issue metadata are present'
    : 'repository, directory, homepage, and issue metadata are required')

  const keywords = Array.isArray(manifest.keywords) ? manifest.keywords : []
  const discoveryOkay = keywords.includes('dsh-plugin') && keywords.includes('deepseek-harness')
  add('metadata.discovery', discoveryOkay ? 'pass' : 'block', discoveryOkay
    ? 'npm discovery keywords identify the DSH plugin'
    : 'keywords must include dsh-plugin and deepseek-harness')

  const runtimeVersionsOkay = exactVersion(manifest.dependencies?.['@deepseek-ai/schemastery'])
    && exactVersion(manifest.peerDependencies?.['@deepseek-ai/cordis'])
    && exactVersion(manifest.peerDependencies?.['@deepseek-ai/dsh-tools'])
  add('compatibility.runtime-pins', runtimeVersionsOkay ? 'pass' : 'block', runtimeVersionsOkay
    ? 'runtime and peer compatibility versions are exact'
    : 'release evidence requires exact Schemastery, Cordis, and dsh-tools versions')

  const engineOkay = manifest.engines?.node === '^22.19.0 || >=24.0.0'
    && manifest.packageManager === 'pnpm@11.19.0'
  add('compatibility.toolchain', engineOkay ? 'pass' : 'block', engineOkay
    ? 'Node.js and package-manager contracts are explicit'
    : 'Node.js and pnpm contracts must match the tested toolchain')

  const patchTarget = manifest.dsh?.bundle?.patch
  const bundleOkay = nonEmptyString(patchTarget)
    && paths.has(patchTarget.replace(/^\.\//, ''))
    && documents.patch.includes(manifest.name ?? '')
  add('bundle.contract', bundleOkay ? 'pass' : 'block', bundleOkay
    ? 'dsh.bundle patch exists and names the installed package'
    : 'dsh.bundle.patch must resolve inside the payload and compose the package by name')

  const requiredFiles = [
    'package.json',
    'README.md',
    'CHANGELOG.md',
    'LICENSE',
    'NOTICE',
    'SECURITY.md',
    'cordis.patch.yml',
    'lib/index.js',
    'lib/index.d.ts',
    'lib/inspect-repository.js',
    'lib/inspect-repository.d.ts',
  ]
  const missingRequired = requiredFiles.filter(path => !paths.has(path))
  add('payload.required', missingRequired.length === 0 ? 'pass' : 'block', missingRequired.length === 0
    ? 'runtime, type, legal, security, and change documents are packed'
    : `required payload entries are missing: ${missingRequired.join(', ')}`)

  const targets = [manifest.main, ...exportTargets(manifest.exports)].filter(nonEmptyString)
    .map(target => target.replace(/^\.\//, ''))
  const missingTargets = [...new Set(targets)].filter(target => !paths.has(target))
  add('payload.exports', missingTargets.length === 0 ? 'pass' : 'block', missingTargets.length === 0
    ? 'every main and exports target exists in the prospective payload'
    : `published entry points are absent: ${missingTargets.join(', ')}`)

  const forbidden = inventory.map(file => file.path)
    .filter(path => FORBIDDEN_PAYLOAD.some(pattern => pattern.test(path)))
  add('payload.exclusions', forbidden.length === 0 ? 'pass' : 'block', forbidden.length === 0
    ? 'no source, test, lock, secret-like, map, or nested tarball path is packed'
    : `forbidden payload entries found: ${forbidden.join(', ')}`)

  const unpackedBytes = inventory.reduce((total, file) => total + (Number(file.size) || 0), 0)
  const bounded = inventory.length <= 20 && unpackedBytes <= 131_072
  add('payload.bounds', bounded ? 'pass' : 'block', bounded
    ? `${inventory.length} files and ${unpackedBytes} unpacked bytes stay within the declared review bound`
    : `payload exceeds 20 files or 131072 unpacked bytes (${inventory.length}, ${unpackedBytes})`)

  const permissionDocs = documentContains(documents.readme, [
    '## Permission boundary',
    'does not write',
    'does not use the network',
    'not an operating-system sandbox',
  ])
  add('documentation.permissions', permissionDocs ? 'pass' : 'block', permissionDocs
    ? 'README discloses capability, data flow, and residual risk'
    : 'README must disclose write, network, sandbox, and permission boundaries')

  const operationsDocs = documentContains(documents.readme, [
    '## Install from a packed candidate',
    '## Upgrade and rollback',
    'plugin --profile web remove',
  ])
  add('documentation.operations', operationsDocs ? 'pass' : 'block', operationsDocs
    ? 'install, removal, upgrade, and rollback paths are documented'
    : 'README must document packed install, removal, upgrade, and rollback')

  const compatibilityDocs = documentContains(documents.readme, [
    '## Compatibility',
    'Reviewed Harness source',
    '## Known limitations',
  ])
  add('documentation.compatibility', compatibilityDocs ? 'pass' : 'block', compatibilityDocs
    ? 'exact compatibility and limitations are documented'
    : 'README must record exact compatibility and known limitations')

  const securityDocs = documentContains(documents.security, [
    'supported versions',
    'reporting a vulnerability',
    'do not include credentials',
  ])
  add('documentation.security', securityDocs ? 'pass' : 'block', securityDocs
    ? 'security support and private-reporting rules are documented'
    : 'SECURITY.md must define supported versions and safe reporting')

  const changeDocs = documentContains(documents.changelog, ['# Changelog', '## [Unreleased]'])
  add('documentation.changes', changeDocs ? 'pass' : 'block', changeDocs
    ? 'an unreleased change ledger is present'
    : 'CHANGELOG.md must carry an Unreleased section')

  const noGitBuild = manifest.scripts?.prepare === undefined
  add('lifecycle.git-install', noGitBuild ? 'pass' : 'warn', noGitBuild
    ? 'no prepare hook executes code during a git-host install; this channel is unsupported'
    : 'prepare executes package code during git-host installation and needs an explicit trust review')

  const releaseScriptsOkay = nonEmptyString(manifest.scripts?.prepack)
    && nonEmptyString(manifest.scripts?.prepublishOnly)
    && nonEmptyString(manifest.scripts?.['release:audit'])
    && nonEmptyString(manifest.scripts?.['release:verify'])
  add('lifecycle.release-gates', releaseScriptsOkay ? 'pass' : 'block', releaseScriptsOkay
    ? 'build, audit, and strict prepublication gates are declared'
    : 'prepack, prepublishOnly, release:audit, and release:verify scripts are required')

  add('external.repository-visibility', 'warn',
    'offline audit cannot prove that repository, issues, and security reporting are public')
  add('external.registry-name', 'warn',
    'offline audit cannot reserve the npm name or prove publisher authorization')
  add('external.clean-consumer', 'warn',
    'run tarball install, Loader boot, removal, and cross-platform checks outside this manifest audit')
  add('external.publication-path', 'warn',
    'offline audit cannot prove protected approval, provenance, or publication of the reviewed bytes')

  const blockers = checks.filter(check => check.status === 'block')
  const warnings = checks.filter(check => check.status === 'warn')
  return {
    schemaVersion: 1,
    package: {
      name: manifest.name ?? null,
      version: manifest.version ?? null,
    },
    decision: blockers.length === 0 && warnings.length === 0 ? 'GO' : 'NO-GO',
    summary: {
      passed: checks.filter(check => check.status === 'pass').length,
      warnings: warnings.length,
      blockers: blockers.length,
      files: inventory.length,
      unpackedBytes,
    },
    checks,
  }
}

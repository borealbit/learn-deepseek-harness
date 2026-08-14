/*
 * Copyright 2026 Borealbit Technology Limited
 * Licensed under the Apache License, Version 2.0.
 */

import assert from 'node:assert/strict'
import test from 'node:test'

import { auditReleaseCandidate } from '../scripts/release-contract.mjs'

function candidate(overrides = {}) {
  return {
    name: '@borealbit/dsh-repository-inspector',
    version: '0.1.0',
    description: 'Bounded read-only repository inspection Tool for DeepSeek Harness',
    private: false,
    author: 'Dom Liu',
    keywords: ['deepseek-harness', 'dsh-plugin'],
    type: 'module',
    packageManager: 'pnpm@11.19.0',
    repository: {
      type: 'git',
      url: 'git+https://github.com/borealbit/learn-deepseek-harness.git',
      directory: 'plugins/repository-inspector',
    },
    homepage: 'https://github.com/borealbit/learn-deepseek-harness/tree/main/plugins/repository-inspector',
    bugs: { url: 'https://github.com/borealbit/learn-deepseek-harness/issues' },
    main: 'lib/index.js',
    exports: {
      '.': { types: './lib/index.d.ts', default: './lib/index.js' },
      './inspect': { types: './lib/inspect-repository.d.ts', default: './lib/inspect-repository.js' },
      './package.json': './package.json',
    },
    files: ['lib', 'cordis.patch.yml', 'README.md', 'CHANGELOG.md', 'LICENSE', 'NOTICE', 'SECURITY.md'],
    dsh: { bundle: { patch: './cordis.patch.yml' } },
    license: 'Apache-2.0',
    publishConfig: { access: 'public' },
    engines: { node: '^22.19.0 || >=24.0.0' },
    scripts: {
      prepack: 'pnpm run build',
      prepublishOnly: 'pnpm run release:verify',
      'release:audit': 'pnpm run build && node scripts/release-audit.mjs --draft',
      'release:verify': 'pnpm run build && node scripts/release-audit.mjs',
    },
    dependencies: { '@deepseek-ai/schemastery': '3.18.1' },
    peerDependencies: {
      '@deepseek-ai/cordis': '4.0.1',
      '@deepseek-ai/dsh-tools': '0.1.0-rc.6',
    },
    ...overrides,
  }
}

const files = [
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
].map(path => ({ path, size: 100 }))

const documents = {
  readme: `
## Permission boundary
It does not write and does not use the network. It is not an operating-system sandbox.
## Install from a packed candidate
Run dsh plugin --profile web add ./candidate.tgz.
## Upgrade and rollback
Run dsh plugin --profile web remove example.
## Compatibility
Reviewed Harness source: immutable commit.
## Known limitations
This remains a fixture.
`,
  changelog: '# Changelog\n\n## [Unreleased]\n',
  license: 'Apache License\nVersion 2.0',
  notice: 'Copyright 2026 Borealbit Technology Limited\nCreated by Dom Liu.',
  security: '# Security\n\n## Supported versions\n\n## Reporting a vulnerability\nDo not include credentials.',
  patch: "name: '@borealbit/dsh-repository-inspector'",
}

test('keeps a complete public bundle at NO-GO while external evidence is unresolved', () => {
  const report = auditReleaseCandidate({ manifest: candidate(), files, documents })
  assert.equal(report.decision, 'NO-GO')
  assert.equal(report.summary.blockers, 0)
  assert.equal(report.summary.warnings, 4)
  assert.equal(report.checks.find(check => check.id === 'bundle.contract')?.status, 'pass')
})

test('treats private publication protection as a release blocker', () => {
  const report = auditReleaseCandidate({ manifest: candidate({ private: true }), files, documents })
  assert.equal(report.decision, 'NO-GO')
  assert.deepEqual(
    report.checks.filter(check => check.status === 'block').map(check => check.id),
    ['publication.enabled'],
  )
})

test('rejects absent exports and secret-like or source payload paths', () => {
  const badFiles = files
    .filter(file => file.path !== 'lib/index.js')
    .concat({ path: 'src/index.ts', size: 10 }, { path: '.env.production', size: 10 })
  const report = auditReleaseCandidate({ manifest: candidate(), files: badFiles, documents })
  const blocked = report.checks.filter(check => check.status === 'block').map(check => check.id)
  assert.ok(blocked.includes('payload.required'))
  assert.ok(blocked.includes('payload.exports'))
  assert.ok(blocked.includes('payload.exclusions'))
})

test('rejects moving runtime ranges and incomplete permission disclosure', () => {
  const manifest = candidate({
    peerDependencies: {
      '@deepseek-ai/cordis': '^4.0.1',
      '@deepseek-ai/dsh-tools': 'latest',
    },
  })
  const report = auditReleaseCandidate({
    manifest,
    files,
    documents: { ...documents, readme: documents.readme.replace('does not use the network', '') },
  })
  const blocked = report.checks.filter(check => check.status === 'block').map(check => check.id)
  assert.ok(blocked.includes('compatibility.runtime-pins'))
  assert.ok(blocked.includes('documentation.permissions'))
})

test('warns when a git install would execute a prepare hook', () => {
  const report = auditReleaseCandidate({
    manifest: candidate({ scripts: { ...candidate().scripts, prepare: 'pnpm run build' } }),
    files,
    documents,
  })
  assert.equal(report.checks.find(check => check.id === 'lifecycle.git-install')?.status, 'warn')
  assert.equal(report.decision, 'NO-GO')
})

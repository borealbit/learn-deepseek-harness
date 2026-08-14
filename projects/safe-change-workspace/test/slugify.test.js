/*
 * Copyright 2026 Borealbit Technology Limited
 * Licensed under the Apache License, Version 2.0.
 */

import assert from 'node:assert/strict'
import test from 'node:test'

import { slugify } from '../src/slugify.js'

test('normalizes case and surrounding whitespace', () => {
  assert.equal(slugify('  Hello World  '), 'hello-world')
})

test('collapses repeated whitespace and hyphens', () => {
  assert.equal(slugify('release   readiness---agent'), 'release-readiness-agent')
})

test('removes punctuation without changing word boundaries', () => {
  assert.equal(slugify('Ship it, now!'), 'ship-it-now')
})

/*
 * Copyright 2026 Borealbit Technology Limited
 * Licensed under the Apache License, Version 2.0.
 */

export function releaseMessage(name) {
  if (typeof name !== 'string' || name.trim().length === 0) {
    throw new TypeError('name must be a non-empty string')
  }
  return `release candidate: ${name.trim()}`
}


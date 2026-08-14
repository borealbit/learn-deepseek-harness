/*
 * Copyright 2026 Borealbit Technology Limited
 * Licensed under the Apache License, Version 2.0.
 */

export function slugify(value) {
  return String(value)
    .trim()
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '')
    .replace(/-+/g, '-')
}

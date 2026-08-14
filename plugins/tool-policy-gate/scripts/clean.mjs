/*
 * Copyright 2026 Borealbit Technology Limited
 * Licensed under the Apache License, Version 2.0.
 */

import { rm } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'

const lib = fileURLToPath(new URL('../lib/', import.meta.url))
await rm(lib, { recursive: true, force: true })

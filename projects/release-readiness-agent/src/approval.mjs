/*
 * Copyright 2026 Borealbit Technology Limited
 * Licensed under the Apache License, Version 2.0.
 */

const OUTCOMES = new Set(['allowed-once', 'rejected', 'cancelled', 'unavailable'])

function assertRequest(request) {
  if (request === null || typeof request !== 'object' || Array.isArray(request)) {
    throw new TypeError('approval request must be an object')
  }
  if (typeof request.actionId !== 'string' || !/^[a-z0-9:._-]{1,120}$/i.test(request.actionId)) {
    throw new TypeError('approval actionId must be a bounded identifier')
  }
  if (typeof request.reason !== 'string' || request.reason.length < 1 || request.reason.length > 500) {
    throw new TypeError('approval reason must contain 1-500 characters')
  }
}

export function createApprovalController(decisions = {}) {
  if (decisions === null || typeof decisions !== 'object' || Array.isArray(decisions)) {
    throw new TypeError('approval decisions must be an object')
  }
  const remaining = new Map()
  for (const [actionId, outcome] of Object.entries(decisions)) {
    if (!OUTCOMES.has(outcome)) throw new TypeError(`invalid approval outcome for ${actionId}`)
    remaining.set(actionId, outcome)
  }
  const events = []

  return {
    events,
    async request(request) {
      assertRequest(request)
      events.push({ type: 'approval/asked', actionId: request.actionId, reason: request.reason })
      const outcome = remaining.get(request.actionId) ?? 'unavailable'
      if (outcome === 'allowed-once') remaining.delete(request.actionId)
      events.push({ type: 'approval/decided', actionId: request.actionId, outcome })
      return outcome
    },
  }
}

export function createUnavailableApprovalController() {
  return createApprovalController()
}

export function createFixtureBuildApprovalController() {
  const events = []
  let available = true
  return {
    events,
    async request(request) {
      assertRequest(request)
      events.push({ type: 'approval/asked', actionId: request.actionId, reason: request.reason })
      const outcome = available && request.actionId.startsWith('command:build:')
        ? 'allowed-once'
        : 'unavailable'
      if (outcome === 'allowed-once') available = false
      events.push({ type: 'approval/decided', actionId: request.actionId, outcome })
      return outcome
    },
  }
}

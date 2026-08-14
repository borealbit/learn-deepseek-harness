# Course Syllabus

## Course title

**Build Agents with DeepSeek Harness: From First Run to Production-Grade Plugins**

## Course promise

This course teaches a repeatable engineering workflow for using, extending, evaluating, and maintaining DeepSeek Harness. It is organized around working artifacts rather than feature tours.

The planned core runs for approximately **7–9 hours**, excluding optional reading, translation editions, and the capstone extension challenges.

## Prerequisites

Learners should be comfortable with:

- Git and a command-line shell
- Reading TypeScript or modern JavaScript
- Basic API-key and environment-variable handling
- Running package-manager commands
- Reviewing a diff before accepting generated code

Prior agent-framework experience is helpful but not required.

## Learning tracks

| Track | Modules | Outcome |
|---|---|---|
| Operator Foundations | 00–04 | Run and configure the harness safely |
| Plugin Builder | 05–08 | Build native capabilities and controlled workflows |
| Production Practice | 09–11 | Evaluate, observe, publish, and maintain systems |
| Capstone | 12 | Integrate the full course into one auditable agent |

---

## Module 00 — Quick Start: From Zero to First Safe Task

**Goal:** launch the Web UI, connect a model, choose a workspace, and complete one bounded task without granting unnecessary access.

### Lessons

1. What the harness adds to a model
2. Environment and prerequisite check
3. Starting the Web UI
4. Adding a model credential without exposing it
5. Selecting a disposable practice workspace
6. Reading an approval request before allowing it
7. Inspecting the completed session

### Deliverable

A first-run checklist and a saved session that summarizes a small practice repository without modifying it.

---

## Module 01 — Agent = Model + Harness

**Goal:** build a durable mental model of the runtime before changing configuration.

### Lessons

1. Model, agent, harness, and application boundaries
2. Tools, context, state, policy, and feedback loops
3. Why the same model behaves differently in different harnesses
4. Deterministic infrastructure around probabilistic behavior
5. What DeepSeek Harness does—and what it does not do

### Deliverable

A one-page architecture map explaining the responsibility of each layer.

---

## Module 02 — Understanding the Plugin Architecture

**Goal:** understand how Cordis composition makes harness capabilities replaceable.

### Lessons

1. Cordis contexts, services, events, and effects
2. Plugin trees and dependency injection
3. Profiles, bundles, patches, and composition order
4. Durable session events versus live extension events
5. Capability seams and safe extension points
6. Inspecting the active runtime instead of guessing

### Deliverable

An annotated runtime map for the default profile.

---

## Module 03 — Mastering the Four Runtime Modes

**Goal:** choose the smallest runtime mode that fits a task.

### Lessons

1. Standard mode for complete agent work
2. Code mode for model-authored tool orchestration
3. Minimal mode for controlled comparison and benchmarking
4. Creator mode for runtime inspection and plugin development
5. Comparing capability, risk, latency, and debugging surface
6. A mode-selection decision tree

### Deliverable

A reproducible comparison of one bounded task across two modes.

---

## Module 04 — Models, Providers, Workspaces, and Sessions

**Goal:** configure execution boundaries and model routes without mixing credentials, data, or session history.

### Lessons

1. Official and catalog providers
2. Custom OpenAI-compatible endpoints
3. Model capabilities and modality declarations
4. Workspace selection and isolation
5. Session lifecycle, resume, fork, and replay
6. Credential storage and secret-handling rules
7. Provider troubleshooting checklist

### Deliverable

A sanitized provider configuration and a documented workspace/session strategy.

---

## Module 05 — Safe Agentic Coding Workflows

**Goal:** make agent-assisted development reviewable and reversible.

### Lessons

1. Read-only discovery before mutation
2. Plan mode and scope confirmation
3. Permission presets, approvals, and fail-closed behavior
4. Filesystem and subprocess sandbox boundaries
5. Project instructions and repository conventions
6. Test-before-change and diff-before-commit workflows
7. Recovery from partial or failed operations

### Deliverable

A reusable safe-change checklist applied to a small repository task.

---

## Module 06 — Plugins vs Tools vs Skills vs MCP

**Goal:** choose the correct extension mechanism for each requirement.

### Lessons

1. Tool: a model-callable capability
2. Skill: reusable instructions plus supporting resources
3. MCP: an interoperable external tool/service boundary
4. Native DSH plugin: lifecycle, hooks, policy, UI, and composition
5. Decision criteria: portability, privilege, latency, state, and maintenance
6. Reviewing third-party extensions before installation
7. Building a lightweight extension scorecard

### Deliverable

A completed decision matrix for three realistic integration scenarios.

---

## Module 07 — Build Your First DSH Plugin

**Goal:** implement and verify a native plugin without modifying the harness core.

### Lessons

1. Package and plugin anatomy
2. Implementing the plugin entry point
3. Registering a typed tool
4. Configuration schema and dependency declarations
5. Returning structured, bounded results
6. Unit tests and runtime smoke tests
7. Loading, reloading, and inspecting the plugin

### Deliverable

A tested repository-inspection tool plugin with a clear permission boundary.

---

## Module 08 — Hooks, Context, and Session Engineering

**Goal:** influence agent behavior through documented extension points while preserving traceability.

### Lessons

1. Pre-step, request, tool-execution, and turn-stopping hooks
2. Prompt sections and scoped context injection
3. Durable session events and derived model history
4. Context pressure and compaction
5. Result transformation versus immutable observation
6. UI and protocol extension boundaries
7. Designing for unload, replay, and failure

### Deliverable

A policy hook that blocks an unsafe operation and records an auditable outcome.

---

## Module 09 — Subagents, Workflows, and Automation

**Goal:** orchestrate multi-step work without losing ownership or observability.

### Lessons

1. When delegation improves a task
2. Subagent provider choices and context boundaries
3. Structured workflows and output contracts
4. Background jobs and cancellation
5. Scheduled follow-ups and injected notifications
6. Human checkpoints in long-running work
7. Avoiding unnecessary multi-agent complexity

### Deliverable

A two-stage workflow that delegates review and returns a structured result.

---

## Module 10 — Tracing, Evaluation, and Failure Recovery

**Goal:** replace “it looked good once” with observable, repeatable evidence.

### Lessons

1. Reading the append-only session trajectory
2. Reconstructing model inputs, tool calls, and results
3. Building a small golden-task evaluation set
4. Measuring task success, latency, token use, and intervention
5. Retry, timeout, cancellation, and partial-failure behavior
6. Regression testing after model or harness changes
7. Incident notes and reproducible bug reports

### Deliverable

An evaluation report comparing two configurations on the same task set.

---

## Module 11 — Package, Publish, and Maintain

**Goal:** release an extension that another developer can understand, install, audit, and upgrade.

### Lessons

1. Package naming and repository layout
2. Documentation and minimal runnable examples
3. Security notes and permission disclosure
4. Automated tests and compatibility metadata
5. Publishing and the `dsh-plugin` discovery topic
6. Semantic versioning for course-owned packages
7. Upstream change monitoring and migration notes

### Deliverable

A release-ready plugin repository checklist and draft release notes.

---

## Module 12 — Capstone: Release Readiness Agent

**Goal:** integrate the complete course into one practical, auditable agent.

### Required behavior

The agent should:

1. Inspect a repository without modifying it.
2. Discover the project's own instructions and checks.
3. Build and present a reviewable plan.
4. Run selected lint, test, and build commands.
5. Inspect release metadata and obvious secret risks.
6. Delegate a bounded review task when useful.
7. Require approval before any mutation.
8. Produce a structured release-readiness report.
9. Preserve enough session evidence to reproduce the result.
10. Degrade safely when a provider or tool is unavailable.

### Capstone evidence

- Source code and configuration
- Threat and permission model
- Golden-task evaluation set
- Successful and intentionally failing run traces
- Installation and removal instructions
- Compatibility statement with an exact upstream reference
- Short demo and final retrospective

## Completion standard

A learner completes the course when the capstone is runnable from a clean environment, its permissions are documented, its core behavior is covered by repeatable checks, and another developer can inspect the evidence without relying on the author's explanation.

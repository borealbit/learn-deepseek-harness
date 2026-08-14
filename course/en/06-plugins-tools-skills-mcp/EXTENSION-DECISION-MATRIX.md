# Module 06 Extension Decision Matrix

Complete this copy with sanitized evidence. Do not record credentials, private endpoints, customer data, absolute private paths, or unpublished package details.

## Run identity

| Field | Sanitized value |
|---|---|
| Date | TODO: YYYY-MM-DD |
| Reviewer | TODO: name or role |
| Install package | `@deepseek-ai/dsh@0.1.0-rc.6` |
| Reviewed upstream source | `47f943859bef60e4160492346772ded9b24f765a` |
| MCP specification consulted | `2026-07-28` |
| Scenario source | `projects/extension-selection-lab/SCENARIOS.md` |
| Decision status | TODO: draft / accepted / rejected |

## Boundary map

Write one sentence in your own words for each layer before scoring it.

| Layer | Working definition | Authority or lifecycle boundary |
|---|---|---|
| Tool | TODO: | TODO: |
| Skill | TODO: | TODO: |
| MCP | TODO: | TODO: |
| Native DSH plugin | TODO: | TODO: |

Required relationship statement:

- TODO: explain why MCP can supply Tools, a native plugin can register Tools, and a Skill can guide use of existing Tools.

## Scoring method

Apply hard gates first. A vetoed candidate cannot win on points.

For surviving candidates, use:

- `0` — mismatch;
- `1` — workable with a material compromise; and
- `2` — strong fit.

Score these six criteria: requirement fit, portability, privilege boundary, latency and operations, state and lifecycle, and maintenance. The maximum total is `12`.

Evidence labels:

- **Observed** — directly supported by a scenario fact, pinned source, inspected artifact, or command result.
- **Inferred** — a conclusion derived from observed evidence.
- **Unverified** — an assumption or runtime behavior still requiring a test.

## S1 — Repository release playbook

### S1 scenario facts

- A repository needs a repeatable release-review procedure, checklists, examples, and references.
- The current Harness file and shell Tools already provide every required capability.
- The content should travel with the repository and override broader personal guidance.
- No background service, new credential, UI, or global policy hook is required.

### S1 hard gate

| Question | Decision | Evidence |
|---|---|---|
| Is new executable authority required? | TODO: yes/no | TODO: |
| Must the model invoke a new atomic operation? | TODO: yes/no | TODO: |
| Is a cross-host service boundary required? | TODO: yes/no | TODO: |
| Are DSH lifecycle, policy, service, persistence, or UI hooks required? | TODO: yes/no | TODO: |
| Hard veto statement | TODO: | TODO: name every candidate eliminated before scoring |

### S1 candidate score

| Candidate role | Requirement fit | Portability | Privilege boundary | Latency and operations | State and lifecycle | Maintenance | Total / 12 | Veto or decisive note |
|---|---:|---:|---:|---:|---:|---:|---:|---|
| Tool | TODO: | TODO: | TODO: | TODO: | TODO: | TODO: | TODO: | TODO: |
| Skill | TODO: | TODO: | TODO: | TODO: | TODO: | TODO: | TODO: | TODO: |
| MCP | TODO: | TODO: | TODO: | TODO: | TODO: | TODO: | TODO: | TODO: |
| Native DSH plugin | TODO: | TODO: | TODO: | TODO: | TODO: | TODO: | TODO: | TODO: |

### S1 architecture decision

| Field | Decision |
|---|---|
| Primary mechanism | TODO: |
| Supporting mechanisms | TODO: include existing Tools or `None` |
| Packaging and scope | TODO: |
| Model-visible surface | TODO: |
| Why this is the smallest sufficient stack | TODO: |

### S1 authority and lifecycle

| Boundary | Owner and behavior |
|---|---|
| Instructions and referenced resources | TODO: |
| Execution authority | TODO: |
| Credentials and network | TODO: |
| State and cleanup | TODO: |
| Failure owner and rollback | TODO: |

### S1 evidence ledger

| Label | Claim | Source or next check |
|---|---|---|
| Observed | TODO: | TODO: |
| Inferred | TODO: | TODO: |
| Unverified | TODO: | TODO: |

### S1 rejected alternatives

| Alternative | Decisive gap or unnecessary cost |
|---|---|
| Tool | TODO: |
| Skill | TODO: use `Selected` if chosen |
| MCP | TODO: |
| Native DSH plugin | TODO: |

### S1 disconfirming test

- TODO: name the smallest new fact or experiment that would force a different architecture.

## S2 — Shared issue service

### S2 scenario facts

- A maintained issue service exposes authenticated search, comment, label, and create operations.
- The integration must work with DSH and at least two other compatible MCP hosts.
- The service is independently deployed and owned by another team.
- Writes require narrow scopes, per-operation review, bounded results, and outage handling.
- No DSH-specific UI or cross-Tool policy hook is required.

### S2 hard gate

| Question | Decision | Evidence |
|---|---|---|
| Is new executable authority required? | TODO: yes/no | TODO: |
| Must the model invoke new atomic operations? | TODO: yes/no | TODO: |
| Is a cross-host service boundary required? | TODO: yes/no | TODO: |
| Are DSH lifecycle, policy, service, persistence, or UI hooks required? | TODO: yes/no | TODO: |
| Hard veto statement | TODO: | TODO: name every candidate eliminated before scoring |

### S2 candidate score

| Candidate role | Requirement fit | Portability | Privilege boundary | Latency and operations | State and lifecycle | Maintenance | Total / 12 | Veto or decisive note |
|---|---:|---:|---:|---:|---:|---:|---:|---|
| Tool | TODO: | TODO: | TODO: | TODO: | TODO: | TODO: | TODO: | TODO: |
| Skill | TODO: | TODO: | TODO: | TODO: | TODO: | TODO: | TODO: | TODO: |
| MCP | TODO: | TODO: | TODO: | TODO: | TODO: | TODO: | TODO: | TODO: |
| Native DSH plugin | TODO: | TODO: | TODO: | TODO: | TODO: | TODO: | TODO: | TODO: |

### S2 architecture decision

| Field | Decision |
|---|---|
| Primary mechanism | TODO: |
| Supporting mechanisms | TODO: name the DSH bridge and model-callable surface |
| Packaging and deployment | TODO: |
| Model-visible surface | TODO: include qualified naming behavior |
| Why this is the smallest sufficient stack | TODO: |

### S2 authority and lifecycle

| Boundary | Owner and behavior |
|---|---|
| Server process or endpoint | TODO: |
| Credentials and scopes | TODO: |
| Tool approvals and writes | TODO: |
| Discovery, timeout, outage, and reconnect | TODO: |
| Logs, retention, and rollback | TODO: |

### S2 evidence ledger

| Label | Claim | Source or next check |
|---|---|---|
| Observed | TODO: | TODO: |
| Inferred | TODO: | TODO: |
| Unverified | TODO: | TODO: |

### S2 rejected alternatives

| Alternative | Decisive gap or unnecessary cost |
|---|---|
| Tool | TODO: explain why a Tool surface is necessary but not a cross-host deployment boundary |
| Skill | TODO: |
| MCP | TODO: use `Selected` if chosen |
| Native DSH plugin | TODO: |

### S2 disconfirming test

- TODO: name the smallest interoperability, authorization, or outage test that could reject the design.

## S3 — Organization policy gate

### S3 scenario facts

- Every DSH Tool call must be inspected before execution, even when the model does not request a policy check.
- Final organization denials must not be weakened by another extension.
- Results must feed an audit sink, and the Web UI must show policy health.
- Configuration updates must hot-replace cleanly without duplicate hooks or connections.
- Other MCP hosts do not need this integration.

### S3 hard gate

| Question | Decision | Evidence |
|---|---|---|
| Is new executable authority required? | TODO: yes/no | TODO: |
| Must the model invoke a new atomic operation? | TODO: yes/no | TODO: |
| Is a cross-host service boundary required? | TODO: yes/no | TODO: |
| Are DSH lifecycle, policy, service, persistence, or UI hooks required? | TODO: yes/no | TODO: |
| Hard veto statement | TODO: | TODO: name every candidate eliminated before scoring |

### S3 candidate score

| Candidate role | Requirement fit | Portability | Privilege boundary | Latency and operations | State and lifecycle | Maintenance | Total / 12 | Veto or decisive note |
|---|---:|---:|---:|---:|---:|---:|---:|---|
| Tool | TODO: | TODO: | TODO: | TODO: | TODO: | TODO: | TODO: | TODO: |
| Skill | TODO: | TODO: | TODO: | TODO: | TODO: | TODO: | TODO: | TODO: |
| MCP | TODO: | TODO: | TODO: | TODO: | TODO: | TODO: | TODO: | TODO: |
| Native DSH plugin | TODO: | TODO: | TODO: | TODO: | TODO: | TODO: | TODO: | TODO: |

### S3 architecture decision

| Field | Decision |
|---|---|
| Primary mechanism | TODO: |
| Supporting mechanisms | TODO: hooks, guard, observer, UI, and optional Tool as applicable |
| Packaging and scope | TODO: |
| Model-visible surface | TODO: |
| Why this is the smallest sufficient stack | TODO: |

### S3 authority and lifecycle

| Boundary | Owner and behavior |
|---|---|
| Pre-execution decision | TODO: |
| Monotonic final denial | TODO: |
| Result observation and audit sink | TODO: |
| UI health state | TODO: |
| Configuration, cleanup, and hot replacement | TODO: |

### S3 evidence ledger

| Label | Claim | Source or next check |
|---|---|---|
| Observed | TODO: | TODO: |
| Inferred | TODO: | TODO: |
| Unverified | TODO: | TODO: |

### S3 rejected alternatives

| Alternative | Decisive gap or unnecessary cost |
|---|---|
| Tool | TODO: |
| Skill | TODO: |
| MCP | TODO: |
| Native DSH plugin | TODO: use `Selected` if chosen |

### S3 disconfirming test

- TODO: name the smallest enforcement, teardown, or UI test that could reject the design.

## Third-party review

Choose the one external artifact most likely to enter any proposed stack. Review an exact version, commit, tarball, or server deployment rather than a product name.

| Field | Finding and evidence |
|---|---|
| Component and role | TODO: |
| Exact version, commit, image digest, or deployment id | TODO: |
| Source, maintainer, and license | TODO: |
| Install or startup code | TODO: |
| Transitive dependencies | TODO: |
| Reads, writes, processes, and network destinations | TODO: |
| Credentials and least scopes | TODO: |
| Model-visible catalog and schema bounds | TODO: |
| Data sent, stored, logged, and retained | TODO: |
| Timeouts, retries, outage behavior, and idempotency | TODO: |
| Lifecycle cleanup, uninstall, and rollback | TODO: |
| Synthetic smoke test | TODO: |
| Update and re-review trigger | TODO: |
| Decision | TODO: approve / reject / blocked pending evidence |

Mechanism-specific findings:

- TODO: for a Skill, inspect its body, invocation flags, resources, scripts, and symlinks; for MCP, inspect the exact command or endpoint and transport; for a native plugin, inspect injected services, hooks, effects, configuration, install scripts, and UI.

## Final cross-scenario map

| Scenario | Primary mechanism | Supporting mechanisms | Execution boundary | Credential owner | Lifecycle owner | Top unresolved risk |
|---|---|---|---|---|---|---|
| S1 | TODO: | TODO: | TODO: | TODO: | TODO: | TODO: |
| S2 | TODO: | TODO: | TODO: | TODO: | TODO: | TODO: |
| S3 | TODO: | TODO: | TODO: | TODO: | TODO: | TODO: |

Cross-scenario conclusions:

- TODO: state which scenario needs instructions but no new authority.
- TODO: state which scenario uses MCP to supply model-callable Tools.
- TODO: state which scenario requires native lifecycle and policy interception.
- TODO: state why the numeric totals did not override a hard veto.

## Completion attestation

- [ ] Every `TODO:` has been replaced with sanitized evidence or an explicit `Unverified` statement.
- [ ] Every candidate received six integer scores from `0` to `2` and a total from `0` to `12`.
- [ ] Every veto names the requirement it fails.
- [ ] Each selected design is an architecture stack, not an unexplained label.
- [ ] Tool authority is separated from Skill guidance.
- [ ] MCP is not described as a sandbox.
- [ ] The reviewed DSH bridge is not claimed to expose MCP Resources or Prompts.
- [ ] Policy enforcement does not depend on the model choosing to call a policy Tool.
- [ ] Observed, inferred, and unverified claims are visibly separated.
- [ ] Third-party review identifies an immutable artifact and least-privilege boundary.
- [ ] No secret, private endpoint, customer data, absolute private path, or placeholder remains.
- [ ] `validate-matrix.js` passes on this completed copy.

Reviewer decision:

- TODO: accepted / rejected / blocked, with one-sentence reason.

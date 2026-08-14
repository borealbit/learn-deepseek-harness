# Module 09 Workflow Run Record

Use this record to distinguish the maintained keyless run from your own
verification. Do not add credentials, customer prompts, private repository
content, raw Session logs, unsanitized child output, or machine-private paths.

## Reference identity

| Field | Recorded value |
|---|---|
| Reference date | `2026-08-14` |
| Platform and architecture | `Linux x86_64` |
| Node.js | `v24.19.0` |
| npm | `11.9.0` |
| Project | `@borealbit/delegated-review-workflow@0.1.0` |
| Subagent service | `@deepseek-ai/dsh-subagent@0.1.0-rc.6` |
| Workflow service | `@deepseek-ai/dsh-workflow@0.1.0-rc.6` |
| Worker-thread engine | `@deepseek-ai/dsh-workflow-worker-thread@0.1.0-rc.6` |
| Tool schema runtime | `@deepseek-ai/dsh-tools@0.1.0-rc.6` |
| Cordis | `@deepseek-ai/cordis@4.0.1` |
| Reviewed upstream source | `47f943859bef60e4160492346772ded9b24f765a` |
| Module status | `draft` |

The reference run used a deterministic provider with no model, Tools,
filesystem, process, environment, network, continuation, schedule, Session
persistence, or mutation capability.

## Source and package record

| Evidence | Observation | Interpretation |
|---|---|---|
| Upstream commit | `47f943859bef60e4160492346772ded9b24f765a` reviewed | Immutable source and documentation reference |
| Upstream manifests | Relevant packages declared `0.1.0-rc.5` | Reviewed checkout predates the tested registry manifests |
| Exact installed packages | Relevant DSH packages resolved at `0.1.0-rc.6` | Runtime contract fixed by the project manifest and lockfile |
| Lock integrity | npm lockfile v3 replayed offline from a documented cache | No moving npm tag was used in the reference replay |

The source review and package execution are separate evidence. This record does
not claim that rc.6 tarballs are byte-identical to the rc.5 manifests in the
reviewed checkout.

## Workflow contract

| Boundary | Reference value |
|---|---|
| Workflow | `bounded-two-stage-review` |
| Stage 1 | `evidence-collector` / `Evidence collection` |
| Stage 2 | `review-synthesizer` / `Synthesis` |
| Child provider | `module09-fixture` |
| Concurrency ceiling | `1` |
| Engine total-agent ceiling | `2` |
| Per-run total-agent ceiling | `2` in success; `1` in fatal-cap test |
| Handoff ceiling | `6,000` serialized characters |
| Stage 1 contract | object-rooted evidence schema |
| Stage 2 contract | object-rooted verdict schema |
| Parent checkpoint | required in every domain result |
| Mutation claim | `false` |

The stage-2 prompt receives only the serialized stage-1 object. This is data
minimization, not automatic redaction: a real stage-1 model could copy sensitive
input into an allowed string field.

## Reference commands

Commands were executed from `projects/delegated-review-workflow/`:

```sh
npm ci
npm run check
npm test
npm run demo
```

The maintained learner command uses the configured npm registry during
`npm ci`. The restricted reference runner replayed the same lock without a
network request from an existing exact cache:

```sh
npm ci --offline --cache /sanitized/npm-cache --ignore-scripts
```

The sanitized cache path above is descriptive, not a path learners should
copy. No install script was required.

## Command results

| Command or check | Exit | Observed result |
|---|---:|---|
| npm lockfile replay | `0` | 21 packages materialized from exact cached integrity entries |
| JavaScript syntax check | `0` | Four maintained JavaScript files parsed |
| Node test runner | `0` | 7 passed, 0 failed, 0 skipped |
| Deterministic demo | `0` | Two-stage structured result reached the human checkpoint |
| Provider starts | — | `2` |
| Provider disposals | — | `2` |
| Workflow events | — | `10` total with two paired child start/end edges |

The npm client emitted an environment-specific warning about an unknown
`http-proxy` configuration key. It did not change dependency resolution or the
exit status and is not a project requirement.

## Test evidence

| # | Test | Boundary or contract proven |
|---:|---|---|
| 1 | Normalizes, bounds, detaches, and freezes the request | Host-owned input contract and unknown-field rejection |
| 2 | Runs two stages through the real engine | Structured values, event order, run ownership, and two disposals |
| 3 | Passes only the structured handoff | Raw-request sentinel absent from stage 2; schemas requested twice |
| 4 | Handles ordinary stage-1 failure | Child `error` becomes workflow-completed domain `blocked`; no stage 2 |
| 5 | Rejects oversized handoff | 6,000-character ceiling blocks before another child starts |
| 6 | Enforces per-run child cap | Second `agent()` call fails the workflow loudly at cap `1` |
| 7 | Cancels an in-flight child | Workflow settles `cancelled`; published child start/end pair and disposal remain accounted |

## Successful sanitized result

The stable terminal facts were:

```json
{
  "stopReason": "completed",
  "agentsStarted": 2,
  "status": "ready-for-human-checkpoint",
  "reviewId": "module09-synthetic-review",
  "decision": "human-review-required",
  "humanCheckpointRequired": true,
  "mutationPerformed": false,
  "providerStarts": 2,
  "providerDisposals": 2
}
```

The demo also printed the complete synthetic evidence and verdict. They are not
copied here because the stable contract is more useful than duplicating the
fixture payload.

## Lifecycle evidence

The successful event type sequence was:

```text
workflow/start
workflow/phase
workflow/log
workflow/agent-start
workflow/agent-end
workflow/phase
workflow/log
workflow/agent-start
workflow/agent-end
workflow/end
```

Child sequences were `1, 2` on both start and end. Run ids were generated at
runtime and deliberately excluded from golden assertions.

## Failure evidence

| Scenario | Workflow stop | Agents started | Domain status | Key observation |
|---|---|---:|---|---|
| Evidence child returns `error` | `completed` | `1` | `blocked` | Script handles ordinary child failure; synthesis is not started |
| Evidence handoff exceeds limit | `completed` | `1` | `blocked` | Size policy is checked before synthesis |
| Per-run ceiling is `1` | `error` | `1` | not applicable | Fatal engine policy rejects the second call |
| Evidence child is cancelled | `cancelled` | `1` | not applicable | Child run is disposed and lifecycle start/end remains paired |

Business logic must inspect domain status after a completed workflow. It must
also reject `cancelled` and `error` at the engine layer.

## Authority and data review

| Question | Reference answer | Evidence class |
|---|---|---|
| Who chooses the provider? | Host start request and engine configuration | Observed in source and project |
| Can the script raise the child ceiling? | No | Source-reviewed and cap-tested |
| Does stage 2 receive the raw request? | No in this fixture | Sentinel-tested |
| Is schema shape a secret filter? | No | Documented limitation |
| Can either fixture child mutate? | No capability exists | Observed in provider surface |
| Does prompt text enforce real-provider read-only behavior? | No | Documented boundary |
| Who owns run disposal? | The caller | Source-reviewed and tested |
| Who owns approval? | The parent/human outside the workflow | Observed in terminal contract |
| Is a workflow event listener an owner? | No; it receives snapshots | Source-reviewed |
| Is the worker VM a security sandbox? | No | Source-reviewed |

## Unverified gates

- authenticated DeepSeek or other model provider
- spawn, fork, ACP, Claude Code, Codex, or DSH SDK provider behavior
- child Tool, sandbox, credential, directory, and approval composition
- continuable child creation, follow-up, report, interrupt, cold resume, and
  persistence
- schedule creation, persistence, overdue recovery, and duplicate-dispatch
  window
- detached production jobs, retries, idempotency, journaling, or resume
- durable Tool-workflow Session records and browser presentation
- clean macOS and Windows dependency/run behavior
- independent learner completion

Do not convert any item above into a claim based only on the keyless fixture.

## Learner record

Copy the headings below into a separate sanitized file. Do not overwrite the
reference evidence.

### Environment

- Date:
- OS and architecture:
- Node.js:
- npm:
- Exact package versions:
- Upstream commit reviewed:

### Successful run

- Syntax check:
- Tests passed / failed / skipped:
- Demo stop reason:
- Domain status:
- Agents started / disposed:
- Paired event counts:
- Human checkpoint required:
- Mutation performed:

### Failure runs

- Ordinary child failure:
- Handoff ceiling:
- Total-agent ceiling:
- Cancellation and disposal:

### Unverified

- Provider/model:
- Child permissions:
- Continuation/persistence:
- Schedule/background execution:
- Browser/UI:
- Other platforms:

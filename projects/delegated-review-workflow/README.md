# Delegated Review Workflow

A keyless, deterministic two-stage review project for
[Module 09](../../course/en/09-subagents-workflows-automation/README.md) of
Learn DeepSeek Harness.

The project executes a fixed orchestration script through the real
`@deepseek-ai/dsh-workflow-worker-thread` engine. Its provider implements the
real `@deepseek-ai/dsh-subagent` seam but has no model or external capability.

## What it demonstrates

```text
bounded request
  -> evidence child -> validated evidence object
  -> handoff size check
  -> synthesis child -> validated verdict object
  -> parent-owned human checkpoint
```

It demonstrates:

- exact input normalization;
- two object-rooted structured-output contracts;
- a stage boundary that excludes the raw request from stage 2;
- one-child concurrency and two-child total limits;
- ordinary child failure versus fatal workflow failure;
- cancellation, paired lifecycle observation, and idempotent disposal; and
- a terminal result that explicitly performs no mutation.

It does **not** demonstrate model quality, prompt safety, secret redaction,
provider credentials, inherited permissions, continuable Sessions, durable
jobs, schedules, exactly-once execution, or a VM security sandbox.

## Compatibility reference

| Reference | Exact value |
|---|---|
| Node.js | `^22.19.0 || >=24.0.0` |
| npm | `11.9.0` used for the reference run |
| Cordis | `4.0.1` |
| DSH subagent/workflow packages | `0.1.0-rc.6` |
| Reviewed upstream commit | [`47f943859bef60e4160492346772ded9b24f765a`](https://github.com/deepseek-ai/deepseek-harness/commit/47f943859bef60e4160492346772ded9b24f765a) |

The reviewed upstream manifests still declared rc.5. The rc.6 registry
packages and immutable source commit are intentionally recorded as different
evidence.

## Project structure

```text
delegated-review-workflow/
├── fixtures/
│   └── review-request.json
├── scripts/
│   └── run-keyless.mjs
├── src/
│   ├── fixture-runtime.mjs
│   └── review-workflow.mjs
├── test/
│   └── review-workflow.test.mjs
├── .gitignore
├── NOTICE
├── README.md
├── package-lock.json
└── package.json
```

`review-workflow.mjs` owns the production-shaped contract: input limits,
schemas, workflow metadata, fixed script, and start helper.
`fixture-runtime.mjs` is testing infrastructure. Do not register its
deterministic provider in a real deployment.

## Setup and run

```sh
npm ci
npm run check
npm test
npm run demo
```

Expected tests: **7 passed, 0 failed, 0 skipped**.

The demo prints synthetic evidence, a synthetic verdict, two provider starts,
two provider disposals, and ten lifecycle events. Its stable result is:

```json
{
  "status": "ready-for-human-checkpoint",
  "humanCheckpointRequired": true,
  "mutationPerformed": false
}
```

Run ids are random. Do not use a generated id as a golden value.

## Input contract

The fixture reads `fixtures/review-request.json`:

| Field | Limit |
|---|---:|
| `reviewId` | 80 characters; restricted identifier alphabet |
| `subject` | 160 characters |
| `changeSummary` | 4,000 characters |
| `acceptanceCriteria` | 1–8 entries |
| Each criterion | 240 characters |
| Structured stage handoff | 6,000 serialized characters |

Unknown fields and control characters are rejected. The normalized object and
its array are detached and frozen before they cross the workflow boundary.

## Permission and threat model

The maintained provider can only:

- inspect the prompt and requested schema in memory;
- return predefined plain JSON and text content;
- resolve an aborted result when its signal fires; and
- count start and disposal calls for assertions.

It has no child Agent, model client, Tool registry, filesystem API, process API,
environment access, network client, continuation method, or mutation callback.
The runner reads one committed synthetic JSON fixture and writes only to
standard output.

The worker-thread engine itself is upstream code. Its worker and VM shape the
JavaScript API and protect the host event loop, but they are not a security
boundary for hostile workflow code. The committed workflow script is fixed and
must be code-reviewed like any other executable source.

Prompt instructions are not policy. If you adapt the script to a real provider,
enforce read-only behavior where child capabilities are composed. The workflow
`agent()` hook does not by itself prove a child Tool restriction.

## Tests

| Test | Success or failure evidence |
|---|---|
| Input normalization | Bounds, detachment, freezing, and rejection cases |
| Two-stage run | Real engine, structured results, event order, two disposals |
| Handoff minimization | Raw sentinel appears in stage 1 but not stage 2 |
| Ordinary child failure | Completed workflow with `status: blocked` |
| Oversized handoff | Stage 2 never starts |
| Total-agent cap | Workflow settles `error` on second call |
| Cancellation | Workflow settles `cancelled`; child is disposed |

The sentinel assertion is narrow. A real model can repeat source text inside
an allowed output field, so structured output is not a data-loss prevention
system.

## Adapting the workflow

Keep `review-workflow.mjs` as the reviewed contract and build a separate host
composition. Before choosing a real provider, document:

1. exact provider name, package, and capabilities;
2. whether it starts fresh or inherits completed parent history;
3. child model, working directory, Tool, sandbox, network, and approval policy;
4. input acquisition and redaction;
5. time, token, depth, concurrency, and total-agent budgets;
6. output validation and maximum retained size;
7. cancellation and disposal ownership; and
8. the parent-owned human approval state transition.

Do not replace `module09-fixture` with a real provider inside the committed
test suite. Real-provider verification belongs in a private, credential-safe
environment and must be reported separately.

## Expected failure semantics

- An ordinary child result with a non-completed stop reason becomes `null` in
  the script. The script returns a completed domain value with
  `status: blocked`.
- An unsupported schema, provider-start failure, invalid hook call,
  cancellation, or agent-cap violation is engine-owned and fails loudly.
- A completed workflow is not an approved review. The caller must also inspect
  `result.value.status` and the human-checkpoint flag.

## Cleanup

The demo disposes the workflow run, unregisters the fixture provider, unloads
both Cordis plugins, and removes event listeners in `finally` paths.

To remove installed dependencies, delete only this project's
`node_modules/` directory with your normal workspace cleanup tool. Do not
delete the lockfile; it is part of the reproducibility contract. The project
does not create a DSH profile, Session, credential file, cache, output file, or
background process.

## Known limitations

- Deterministic outputs do not measure model reasoning.
- No real provider capability or transport is exercised.
- No continuable child, follow-up, report, interrupt, or cold resume is run.
- No schedule or persistence service is composed.
- No durable workflow journal or detached job is implemented.
- Lifecycle events are held in memory; no Session/UI projection is tested.
- Only the recorded Linux reference runner has executed this revision.

See the maintained
[workflow run record](../../course/en/09-subagents-workflows-automation/WORKFLOW-RUN-RECORD.md)
for exact evidence and remaining gates.

## Official references

- [Subagent subsystem](https://github.com/deepseek-ai/deepseek-harness/blob/47f943859bef60e4160492346772ded9b24f765a/docs/subsystems/subagent.md)
- [Workflow subsystem](https://github.com/deepseek-ai/deepseek-harness/blob/47f943859bef60e4160492346772ded9b24f765a/docs/subsystems/workflow.md)
- [Worker-thread workflow engine](https://github.com/deepseek-ai/deepseek-harness/blob/47f943859bef60e4160492346772ded9b24f765a/packages/workflow/workflow-worker-thread/README.md)
- [Schedule service](https://github.com/deepseek-ai/deepseek-harness/blob/47f943859bef60e4160492346772ded9b24f765a/packages/schedule/schedule/README.md)

## License

Original software in this directory is licensed under Apache-2.0. Copyright
2026 Borealbit Technology Limited. Created by Dom Liu. See the repository's
`LICENSE-CODE`, `LICENSES.md`, and this directory's `NOTICE` file. Upstream
dependencies retain their own terms.

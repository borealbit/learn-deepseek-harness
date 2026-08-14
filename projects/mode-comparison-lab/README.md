# Mode Comparison Lab

This deterministic lab compares two recovery configurations against the same
five golden tasks. It turns DeepSeek Harness-shaped Session trajectories into
an evidence report without a model key, network request, real repository, or
external side effect.

The lab is the maintained project for
[Module 10 — Tracing, Evaluation, and Failure Recovery](../../course/en/10-tracing-evaluation-failure-recovery/README.md).

## What this lab proves

The maintained run proves that the project can:

- build append-only, contiguous Session event logs;
- validate those logs with the real
  `@deepseek-ai/dsh-session@0.1.0-rc.6` package;
- reconstruct the request header and model-visible messages at each model
  attempt;
- correlate Tool calls and results by `callId`;
- distinguish provider retry, Tool timeout, caller cancellation, and an
  interrupted side effect;
- apply the same assertions to both configurations;
- report task success, fixture duration, provider-reported token lower bounds,
  usage coverage, retries, timeouts, and human intervention; and
- reject sequence gaps and unmatched Tool results before evaluation.

It does **not** prove that one real model, provider, runtime mode, or deployment
is better. Both configurations and every result are deterministic synthetic
fixtures.

## Reference compatibility

| Item | Pinned value |
|---|---|
| Reviewed upstream source | `47f943859bef60e4160492346772ded9b24f765a` |
| Runtime dependency | `@deepseek-ai/dsh-session@0.1.0-rc.6` |
| Project version | `@borealbit/mode-comparison-lab@0.1.0` |
| Node.js | `^22.19.0 \|\| >=24.0.0` |
| Package manager used for the reference run | npm `11.9.0` |

The reviewed upstream manifests still declared rc.5 while the installed
registry package is rc.6. Source review and package execution are recorded as
separate evidence; this project does not claim that those artifacts are
byte-identical.

## Permission and threat model

The maintained path needs only:

- read access to its committed fixtures and source;
- write access to its own `node_modules/` during installation; and
- optional write access to `actual/session-logs/` when materializing JSONL.

It does not read environment variables, credentials, Git metadata, unrelated
workspace files, or network resources at runtime. It starts no shell, browser,
server, worker, child process, Tool provider, model adapter, or background job.

`npm ci` contacts the configured package registry unless the exact dependency
artifacts already exist in a trusted cache. Review the lockfile and your npm
configuration before installation.

Do not replace the fixtures with customer prompts, private Session logs,
credentials, raw command output, or unsanitized production telemetry. A real
Session log can contain full prompts, file contents, Tool arguments, Tool
results, and system configuration.

## Quick run

From this directory:

```sh
npm ci
npm run check
npm test
npm run evaluate
```

The deterministic reference summary is:

| Configuration | Golden tasks passed | Fixture duration | Reported token lower bound | Usage coverage | Human interventions | Retry starts |
|---|---:|---:|---:|---:|---:|---:|
| `single-attempt` | 2/5 | 264 ms | 734 | 7/8 attempts | 0 | 0 |
| `bounded-recovery` | 5/5 | 351 ms | 1,106 | 10/11 attempts | 1 | 1 |

The bounded fixture gains three passing tasks while adding 87 ms of synthetic
event time, 372 provider-reported tokens, one direct-human intervention, and
one retry start. Those are facts about this fixture corpus, not a production
forecast.

Use JSON when feeding the result to another local check:

```sh
npm run evaluate -- --format json
```

## Materialize the Session JSONL

The evaluator always serializes and reparses every generated trajectory before
scoring it. To inspect the exact JSONL files too, run:

```sh
npm run materialize
```

This writes ten generated files under:

```text
actual/session-logs/
├── bounded-recovery/
│   └── <task>.session.jsonl
└── single-attempt/
    └── <task>.session.jsonl
```

`actual/` is ignored by Git. The command accepts no arbitrary output path in
the package script, and the underlying CLI refuses paths outside this project.

## Golden corpus

Both configurations receive the same initial prompt and assertions:

| Task | Required behavior | Failure class exercised |
|---|---|---|
| `clean-inspection` | Return the completion marker | Clean control |
| `transient-provider-recovery` | Return the marker after a recorded retry | Provider failure and finite retry |
| `timeout-fallback` | Observe `TOOL_TIMEOUT`, then use the cached Tool | Cooperative Tool timeout |
| `interrupted-side-effect` | Obtain a direct-human intervention before repeating the call | Crash-repair unknown outcome |
| `cancellation-stop` | End as `aborted` without a dangerous Tool call | Caller cancellation |

The golden task defines success. A `turn/end { kind: "completed" }` means the
driver completed its turn; it does not prove the requested outcome. Conversely,
the cancellation task passes only when the final turn is `aborted` and the
dangerous Tool was never called.

## What the two configurations mean

`single-attempt` records the observed failure and does not add a provider retry
or bounded recovery action. It still exposes the timeout result and crash
repair evidence, but it does not complete the required fallback and blindly
repeats the interrupted side effect.

`bounded-recovery` adds three explicit policies:

1. one finite retry for the synthetic `TRANSPORT` failure;
2. a cached, read-only fallback after `TOOL_TIMEOUT`; and
3. a human verification message between the unknown side effect and its one
   allowed repeat.

The label is deliberately “bounded recovery,” not “safe mode.” A real policy
still needs provider-specific retry eligibility, budgets, idempotency, Tool
semantics, approval rules, and deployment tests.

## Evaluation formulas

The report uses declared formulas rather than an opaque score:

| Field | Formula |
|---|---|
| Task pass | Every golden assertion for that task passes |
| Run duration | Last `turn/end.time` minus first `turn/start.time` |
| Model attempts | Terminal `assistant/chunk` `finish` groups, split by retry evidence |
| Reported token lower bound | Sum of reported uncached input, cache read, cache write, and output samples |
| Usage coverage | Attempts with a provider usage sample / reconstructed model attempts |
| Human interventions | Direct-user `user/message` events after the initial golden prompt |
| Retry starts | Count of `llm/retry-started` events |
| Tool timeout | `tool/result.data.error.code === "TOOL_TIMEOUT"` |
| Interrupted turn | `turn/end.data.reason.kind === "interrupted"` |

Reasoning tokens are reported as an output subdivision and are not added again
to the total. If an attempt has no provider usage sample, the report preserves
that missingness and labels the sum a lower bound. It never estimates a billing
total from text length.

Fixture event times are controlled inputs. They test the arithmetic and
comparison contract; they are not a wall-clock performance benchmark.

## Request reconstruction

At the first chunk of each model attempt, the evaluator:

1. takes the event prefix before that chunk;
2. creates a detached real `Session` from the prefix;
3. reads the latest `request/header`; and
4. calls `deriveMessages()` for the model-visible history.

The report stores only reconstruction metadata: provider, model, Tool count,
message count, and roles. It does not copy prompt or Tool-result content into
the report.

For the bounded timeout task, the three attempts see 1, 3, and 5 messages. The
growth corresponds to the initial user message, the first assistant Tool call
plus timeout result, and the fallback Tool call plus result.

## Project structure

```text
mode-comparison-lab/
├── fixtures/
│   ├── golden-tasks.json
│   └── run-matrix.mjs
├── scripts/
│   └── run-evaluation.mjs
├── src/
│   ├── evaluate.mjs
│   ├── session-log.mjs
│   └── trace-builder.mjs
├── test/
│   └── evaluation.test.mjs
├── .gitignore
├── NOTICE
├── package-lock.json
├── package.json
└── README.md
```

`trace-builder.mjs` expands compact scenario actions into DSH-shaped events.
`session-log.mjs` parses JSONL, invokes the real Session validator, and applies
the lab's lifecycle and Tool-pair invariant. `evaluate.mjs` reconstructs
requests, calculates metrics, applies assertions, and renders the report.

## Test coverage

The maintained tests check:

- exact task pairing across configurations;
- real rc.6 Session acceptance for all ten logs;
- request-header and message-history reconstruction;
- completed-turn task failure and expected-abort task success;
- blind side-effect retry detection;
- visible missing token usage;
- exact reference aggregates and comparison delta;
- sequence-gap rejection; and
- unmatched Tool-result rejection.

The tests are deterministic and keyless. They deliberately do not test a model
adapter, real Tool timeout, persistence backend, telemetry exporter, browser,
or authenticated provider.

## Adapting the lab to real runs

Keep the golden task document stable, then replace only the trajectory source.
A production-grade extractor should:

1. export or copy a sanitized Session log at a declared durable boundary;
2. retain the immutable runtime configuration and upstream/package versions;
3. validate sequence continuity and known event vocabulary;
4. remove secrets through an approved export pipeline without changing the
   canonical source log;
5. record which fields were removed;
6. pair every configuration to the exact same task id and task revision; and
7. keep raw evidence access-controlled outside the public course repository.

Do not commit production logs here. The maintained fixture is intentionally
synthetic so tests cannot leak real content.

## Cleanup

Stop in this project directory. Remove only generated material with your normal
workspace cleanup tool:

```text
projects/mode-comparison-lab/node_modules/
projects/mode-comparison-lab/actual/
```

Keep `package-lock.json`, the fixtures, tests, and source. The lab creates no
profile, credential, Session store, daemon, scheduled task, or external state.

## Known limitations

- The fixture generator is not the official `dsh-llm-replay` package.
- The logs are valid for the exercised rc.6 Session surface but do not claim to
  cover every merge-extended event type or persistence encoding.
- JSONL persistence, crash-tail repair, and durability checkpoints are taught
  from source but not composed in this project.
- Tool timeout is represented by its final logged result; no real timer or
  uncooperative Tool is run.
- Cancellation is represented by durable terminal evidence; no live race is
  timed.
- Token totals depend on fixture usage samples and are not prices.
- Five tasks are enough to teach pairing and metrics, not enough to estimate
  production quality statistically.
- Only the recorded Linux reference runner has executed this revision.

## Official references

- [Session subsystem](https://github.com/deepseek-ai/deepseek-harness/blob/47f943859bef60e4160492346772ded9b24f765a/docs/subsystems/session.md)
- [Session stats projection](https://github.com/deepseek-ai/deepseek-harness/blob/47f943859bef60e4160492346772ded9b24f765a/packages/session/session-stats/README.md)
- [Token meter](https://github.com/deepseek-ai/deepseek-harness/blob/47f943859bef60e4160492346772ded9b24f765a/packages/llm/token-meter/README.md)
- [Model retry policy](https://github.com/deepseek-ai/deepseek-harness/blob/47f943859bef60e4160492346772ded9b24f765a/packages/llm/llm-retry/README.md)
- [Tool-call timeout policy](https://github.com/deepseek-ai/deepseek-harness/blob/47f943859bef60e4160492346772ded9b24f765a/packages/guard/timeout-policy/README.md)
- [Session checkpoint policy](https://github.com/deepseek-ai/deepseek-harness/blob/47f943859bef60e4160492346772ded9b24f765a/packages/session/session-checkpoint-policy/README.md)
- [Replay test support](https://github.com/deepseek-ai/deepseek-harness/blob/47f943859bef60e4160492346772ded9b24f765a/packages/test-support/llm-replay/README.md)

## License

Original software in this directory is licensed under Apache-2.0. Copyright
2026 Borealbit Technology Limited. Created by Dom Liu. See the repository's
`LICENSE-CODE`, `LICENSES.md`, and this directory's `NOTICE` file. Upstream
dependencies retain their own terms.

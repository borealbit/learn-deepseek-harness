# Module 10 Evaluation Report

Use this record to distinguish the maintained deterministic run from your own
verification. Do not add credentials, customer prompts, private repository
content, raw production Session logs, unsanitized Tool output, or machine-private
paths.

## Reference identity

| Field | Recorded value |
|---|---|
| Reference date | `2026-08-14` |
| Platform and architecture | `Linux x86_64` |
| Node.js | `v24.19.0` |
| npm | `11.9.0` |
| Project | `@borealbit/mode-comparison-lab@0.1.0` |
| Session runtime | `@deepseek-ai/dsh-session@0.1.0-rc.6` |
| Reviewed upstream source | `47f943859bef60e4160492346772ded9b24f765a` |
| Corpus | `module10-golden-v1` |
| Evidence kind | Deterministic synthetic Session fixtures |
| Module status | `draft` |

## Source and package record

| Evidence | Observation | Interpretation |
|---|---|---|
| Upstream commit | `47f943859bef60e4160492346772ded9b24f765a` reviewed | Immutable source and documentation reference |
| Upstream manifests | Relevant packages declared `0.1.0-rc.5` | Reviewed checkout predates the tested registry manifests |
| Exact installed package | `@deepseek-ai/dsh-session@0.1.0-rc.6` | Runtime contract fixed by project manifest and lockfile |
| Lock integrity | npm lockfile v3 replayed offline from a documented cache | No moving npm tag used in the reference replay |

Source review and package execution are separate evidence. This record does not
claim that rc.6 tarballs are byte-identical to rc.5 manifests in the reviewed
checkout.

## Controlled comparison

| Boundary | Reference value |
|---|---|
| Configurations | `single-attempt`, `bounded-recovery` |
| Golden tasks | 5, exactly paired |
| Initial input | Identical per paired task |
| Provider/model | Synthetic `module10-fixture` route; configuration id as model id |
| External I/O | None |
| Model key | None |
| Real Tools | None |
| Real side effects | None |
| Session validation | Real rc.6 detached `Session` over every generated trace |
| Report content | Reconstruction metadata only; no duplicated prompt bodies |

The bounded fixture adds one finite provider retry, a cached read-only timeout
fallback, and one direct-human confirmation before repeating an unknown side
effect. These are controlled fixture differences, not hidden help.

## Golden task matrix

| Task | Single attempt | Bounded recovery | Evidence focus |
|---|---:|---:|---|
| `clean-inspection` | Pass | Pass | Clean control |
| `transient-provider-recovery` | Fail | Pass | Scheduled/started finite retry and recovered outcome |
| `timeout-fallback` | Fail | Pass | `TOOL_TIMEOUT` plus cached fallback |
| `interrupted-side-effect` | Fail | Pass | `TOOL_OUTCOME_UNKNOWN` plus direct-human intervention ordering |
| `cancellation-stop` | Pass | Pass | Expected `aborted` turn and no dangerous Tool call |

The single-attempt timeout turn ends `completed` but fails its task assertion.
Both cancellation turns end `aborted` and pass. This is intentional evidence
that terminal driver status and golden-task success are different fields.

## Metric definitions

| Metric | Reference formula |
|---|---|
| Task pass | Every task-specific assertion passes |
| Run duration | Last `turn/end.time` − first `turn/start.time` |
| Model attempt | One `assistant/chunk` group through terminal `finish`, split at durable retry start |
| Reported token lower bound | Uncached input + cache read + cache write + output usage samples |
| Usage coverage | Model attempts with provider usage / reconstructed attempts |
| Human intervention | Direct-user messages after the initial golden input |
| Retry start | `llm/retry-started` count |
| Tool timeout | `tool/result.data.error.code === "TOOL_TIMEOUT"` |
| Interrupted turn | `turn/end.data.reason.kind === "interrupted"` |

Reasoning tokens remain an output subdivision and are not added again. Fixture
event time is controlled evidence for formula testing, not a wall-clock
benchmark.

## Reference commands

Commands were executed from `projects/mode-comparison-lab/`:

```sh
npm ci
npm run check
npm test
npm run evaluate
npm run evaluate -- --format json
npm run materialize
```

The maintained learner install uses the configured npm registry. The restricted
reference runner replayed the same lock without a network request from an
existing exact cache:

```sh
npm ci --offline --cache /sanitized/npm-cache --ignore-scripts
```

The sanitized cache path is descriptive, not a path learners should copy.

## Command results

| Command or check | Exit | Observed result |
|---|---:|---|
| npm lockfile replay | `0` | 12 packages materialized from exact cached integrity entries |
| JavaScript syntax check | `0` | Five maintained JavaScript files parsed |
| Node test runner | `0` | 10 passed, 0 failed, 0 skipped |
| Markdown evaluation | `0` | Deterministic two-configuration table and task matrix |
| JSON evaluation | `0` | Stable machine-readable report |
| Trace materialization | `0` | Ten Session JSONL files under ignored `actual/` |
| Real Session validation | — | 10/10 generated logs accepted |
| Negative validation | — | Sequence gap and unmatched Tool result rejected |

The npm client emitted an environment-specific warning about an unknown
`http-proxy` configuration key. It did not change dependency resolution or
exit status.

## Aggregate results

| Configuration | Passed | Pass rate | Total fixture duration | Median run duration | Reported token lower bound | Usage coverage | Human interventions | Retry starts | Tool timeouts | Interrupted turns | Aborted turns |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| `single-attempt` | 2/5 | 40% | 264 ms | 32 ms | 734 | 7/8 | 0 | 0 | 1 | 1 | 1 |
| `bounded-recovery` | 5/5 | 100% | 351 ms | 57 ms | 1,106 | 10/11 | 1 | 1 | 1 | 1 | 1 |

Both token sums are lower bounds because the expected cancellation attempt has
no usage sample.

## Comparison delta

Bounded recovery minus single attempt:

| Field | Delta |
|---|---:|
| Passing tasks | +3 |
| Pass rate | +0.60 |
| Total fixture duration | +87 ms |
| Reported token lower bound | +372 |
| Human interventions | +1 |
| Retry starts | +1 |

Valid interpretation:

> On this five-task deterministic corpus, bounded recovery passes three
> additional tasks while recording more fixture time, reported tokens, and
> human intervention.

This report does not establish a production success-rate improvement.

## Selected reconstruction evidence

### Transient provider recovery

The bounded trajectory records two model attempts in the same synthetic step:

| Attempt | Finish | Duration | First token | Usage | Input messages |
|---:|---|---:|---:|---|---:|
| 1 | `error` | 23 ms | absent | reported | 1 |
| 2 | `stop` | 25 ms | 9 ms | reported | 1 |

One `llm/retry-started` separates the attempts. The first error does not add a
model-visible message, so the reconstructed input count stays one.

### Timeout fallback

The bounded trajectory reconstructs three attempts:

| Step | Finish | Input messages | Tools in header | Outcome |
|---:|---|---:|---:|---|
| 1 | `tool-calls` | 1 | 2 | `primary_fetch` returns `TOOL_TIMEOUT` |
| 2 | `tool-calls` | 3 | 2 | `read_cached_snapshot` succeeds |
| 3 | `stop` | 5 | 2 | Assistant returns the cached completion marker |

The baseline records the same timeout code but never calls the fallback Tool.
Its turn completes, while its golden outcome fails.

### Interrupted side effect

Both trajectories contain:

```text
assistant publish_release block
-> durable tool/call
-> TOOL_OUTCOME_UNKNOWN repair result
-> interrupted turn
```

The baseline repeats `publish_release` after plugin-injected resume context.
There is no direct-user event between the calls, so the policy assertion fails.

The bounded trajectory first returns a verification request, closes that turn,
then receives one direct-user message confirming external state. Only then does
it repeat the call once and return the completion marker. Its human-intervention
count is one.

## Failure evidence

| Intentional failure | Evaluator observation |
|---|---|
| Missing retry in baseline transient task | Wrong final turn kind, missing completion marker, retry starts below one |
| Completed baseline timeout task | Missing cached-fallback completion marker |
| Blind baseline side-effect repeat | Missing verified completion marker, insufficient intervention, repeat without direct-user event |
| Corrupted seq in test | Parser refuses non-contiguous sequence |
| Rewritten Tool-result call id in test | Lifecycle validator refuses unmatched result |

These negative cases prove that the evaluator can fail a plausible-looking
trajectory.

## Data handling

All prompts, ids, Tool arguments, Tool results, times, and usage values are
synthetic. The report stores reconstruction counts rather than message bodies.
Generated JSONL is written only under ignored `actual/session-logs/`.

This design does not make production Session logs safe to publish. A real log
may contain credentials copied into prompts, private file contents, command
output, Tool arguments, system prompts, and personal data. Use an approved,
access-controlled export and redaction process.

## Interpretation limits

- Deterministic fixture policy is not model quality.
- Synthetic event time is not wall-clock latency.
- Provider-reported fixture usage is not a bill or price.
- Five tasks do not support population-level statistics.
- No live retry, timer, abort race, crash, storage fsync, telemetry export, or
  external side effect occurred.
- Real retry boundaries and event vocabulary must be rechecked against the
  exact package under evaluation.
- Only the recorded Linux runner has executed this revision.

## Unverified gates

- [ ] Authenticated provider on a sanitized golden corpus
- [ ] Real provider retry success, exhaustion, and cancellation
- [ ] Cooperative and uncooperative Tool timeout behavior
- [ ] Cancellation quiescence across model, Tool, workflow, and child ownership
- [ ] JSONL backend checkpoint and cold crash repair
- [ ] Unknown side effect verified against an idempotent test service
- [ ] Telemetry export with deployment redaction rules
- [ ] Browser Session-log export and investigator workflow
- [ ] Clean macOS and Windows runs
- [ ] Independent learner reproduction

## Learner run

Do not modify the maintained reference tables. Record your evidence here or in
a copy on your own branch.

| Field | Learner value |
|---|---|
| Date | |
| Platform and architecture | |
| Node.js | |
| npm | |
| Lockfile mode | online / offline documented cache |
| Source commit reviewed | |
| Session package installed | |
| Syntax result | |
| Test result | |
| Single-attempt passes | |
| Bounded-recovery passes | |
| Usage coverage | |
| Generated traces inspected | |
| Differences from reference | |

### Learner incident note

| Field | Learner value |
|---|---|
| First divergent task | |
| First divergent event seq | |
| Expected behavior | |
| Observed behavior | |
| Retry/timeout/cancellation evidence | |
| External outcome known? | |
| Containment | |
| Reproduction command | |
| Remaining unknowns | |

## Cleanup

The project creates only its local dependency directory and optional generated
trace directory:

```text
projects/mode-comparison-lab/node_modules/
projects/mode-comparison-lab/actual/
```

Remove those paths with your normal workspace cleanup tool. Keep the lockfile,
fixtures, source, tests, and this report. No profile, credential file, daemon,
schedule, Session store, or external resource was created.

## Official references

- [Session subsystem](https://github.com/deepseek-ai/deepseek-harness/blob/47f943859bef60e4160492346772ded9b24f765a/docs/subsystems/session.md)
- [Session stats projection](https://github.com/deepseek-ai/deepseek-harness/blob/47f943859bef60e4160492346772ded9b24f765a/packages/session/session-stats/README.md)
- [Token meter](https://github.com/deepseek-ai/deepseek-harness/blob/47f943859bef60e4160492346772ded9b24f765a/packages/llm/token-meter/README.md)
- [Model retry policy](https://github.com/deepseek-ai/deepseek-harness/blob/47f943859bef60e4160492346772ded9b24f765a/packages/llm/llm-retry/README.md)
- [Tool-call timeout policy](https://github.com/deepseek-ai/deepseek-harness/blob/47f943859bef60e4160492346772ded9b24f765a/packages/guard/timeout-policy/README.md)
- [Session persistence seam](https://github.com/deepseek-ai/deepseek-harness/blob/47f943859bef60e4160492346772ded9b24f765a/packages/session/session-persistence/README.md)
- [Session checkpoint policy](https://github.com/deepseek-ai/deepseek-harness/blob/47f943859bef60e4160492346772ded9b24f765a/packages/session/session-checkpoint-policy/README.md)
- [Session telemetry seam](https://github.com/deepseek-ai/deepseek-harness/blob/47f943859bef60e4160492346772ded9b24f765a/packages/session/session-telemetry/README.md)
- [Replay test support](https://github.com/deepseek-ai/deepseek-harness/blob/47f943859bef60e4160492346772ded9b24f765a/packages/test-support/llm-replay/README.md)

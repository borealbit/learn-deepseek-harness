# Module 12 Capstone Evidence

This record describes the maintained, synthetic reference run for the
[`Release Readiness Agent`](../../../projects/release-readiness-agent/). It is
evidence for a course draft, not an authorization to release software.

## Reference identity

| Field | Recorded value |
|---|---|
| Evidence date | 2026-08-14 |
| Operating system | Linux 6.18.35, x86_64 |
| Node.js | 24.19.0 |
| npm | 11.9.0 |
| Course install target | `@deepseek-ai/dsh@0.1.0-rc.6` |
| Session package | `@deepseek-ai/dsh-session@0.1.0-rc.6` |
| Subagent package | `@deepseek-ai/dsh-subagent@0.1.0-rc.6` |
| Tool package | `@deepseek-ai/dsh-tools@0.1.0-rc.6` |
| Workflow packages | `@deepseek-ai/dsh-workflow@0.1.0-rc.6` and `@deepseek-ai/dsh-workflow-worker-thread@0.1.0-rc.6` |
| Cordis | `@deepseek-ai/cordis@4.0.1` |
| Immutable upstream source | `47f943859bef60e4160492346772ded9b24f765a` |
| Target | Included synthetic `fixtures/release-candidate/` only |
| Credential use | None |
| Network after installation | None |

The reviewed upstream source manifests still declare rc.5. The npm rc.6
package resolution and immutable source review are recorded as separate facts.

## Commands and observed results

All commands ran from `projects/release-readiness-agent/`.

| Command | Reference result | What it establishes |
|---|---|---|
| `npm ci` | Exit 0 | Exact lockfile can install on the recorded runner |
| `npm run check` | Exit 0 | Project, test, script, and fixture JavaScript syntax is accepted |
| `npm test` | 13 pass, 0 fail, 0 skip | Maintained deterministic behaviors pass |
| `npm run demo` | `READY_FOR_HUMAN_REVIEW`; unauthorized; 19 events | Disposable success path completes and cleans up |
| `npm run evidence` | Exit 1; no evidence write | Evidence mutation refuses without the explicit authoring flag |
| `npm run evidence -- --approve-write-evidence` | Exit 0; four declared files reproduced | Authorized materialization is bounded and deterministic |

Installation can contact the configured registry. The remaining commands are
keyless and do not require a model, browser, Git host, registry write, or cloud
service.

## Test inventory

| # | Test contract | Expected safety property |
|---:|---|---|
| 1 | Bounded instruction, config, and metadata discovery | Inspection is finite and records only declared fields |
| 2 | Ambiguous root and command-path refusal | Caller must identify one absolute target; drive-qualified command paths are rejected |
| 3 | Unavailable approval | Mutating build is held and release remains unauthorized |
| 4 | One-shot success | Exact build runs once and changes only its allowlisted output |
| 5 | Secret-like filename | Finding survives while fake value does not enter the report |
| 6 | Failed read-only prerequisite | Build stops before any approval request |
| 7 | Unavailable delegation | Local evidence remains; result degrades to `INCOMPLETE` |
| 8 | Command-output token shape | Reported output is redacted |
| 9 | Undeclared write | Filesystem delta becomes a blocker |
| 10 | Changed reviewed plan | Digest mismatch stops before commands |
| 11 | Real rc.6 Session acceptance | Generated event sequence is accepted by the actual package |
| 12 | Corrupted Session sequence | Invalid committed evidence is refused, not silently repaired |
| 13 | Real one-child workflow lifecycle | Start, settlement, total cap, and disposal are paired |

## Maintained golden scenarios

Both scenarios use the same plan identity:

```text
77c1b871377c98fff103f656432343681b3cdf23cbe29f3fef565e3468452997
```

### Golden success

| Field | Evidence |
|---|---|
| Run id | `module12-golden-success` |
| Generated timestamp | `2026-08-14T00:00:00.000Z` |
| Lint | Passed, no changed path |
| Test | Passed, no changed path |
| Approval | One `asked` and one `decided: allowed-once` for `command:build:77c1b871377c` |
| Build | Passed; changed only `dist/artifact.json` |
| Delegation | Completed; 1 start and 1 disposal |
| Blockers | None |
| Decision | `READY_FOR_HUMAN_REVIEW` |
| Release authorized | `false` |
| Session events | 19 |

The success result proves only that the maintained checks completed under the
fixture's deterministic approval and provider. It does not establish model
quality, production isolation, publication fitness, or human release consent.

### Golden blocked

| Field | Evidence |
|---|---|
| Run id | `module12-golden-blocked` |
| Generated timestamp | `2026-08-14T00:01:00.000Z` |
| Synthetic risk | Secret-like `.env.production` filename in a temporary copy |
| Lint | Passed |
| Test | Failed |
| Approval | Not requested |
| Build | Skipped before mutation |
| Delegation | Completed; 1 start and 1 disposal |
| Blockers | Secret filename, failed test, skipped build |
| Decision | `BLOCKED` |
| Release authorized | `false` |
| Session events | 19 |

The fake file value is not retained. The command error replaces the absolute
fixture path with `<repository>`. The blocked scenario is intentionally kept
blocked as a regression oracle.

## Golden file identities

| File | SHA-256 |
|---|---|
| `golden-success.report.json` | `4ab21d969d8a3506b5df53f361c2781efe5be4d558f0e60802d18e75bf21531d` |
| `golden-success.session.jsonl` | `3d8869489f5729adda629143b8c8c576efdea15355f7c908961dd0e3d5e598e9` |
| `golden-blocked.report.json` | `eff8fd33ef4213e79961d0745634e814a9d4d1a69083ccd5e1022965582122b7` |
| `golden-blocked.session.jsonl` | `aaf32b8b1c144e2dfdd3f6bb1e51f17712d2b9a58aed339ad88040966f67bb9c` |

Each report embeds its paired Session digest. The report cannot contain its
own final file digest; use this record and the repository blob identity as the
outer comparison.

## Capstone behavior coverage

| Required behavior | Source or contract | Passing evidence | Failure or degradation evidence | Remaining uncertainty |
|---|---|---|---|---|
| Inspect without modification | `repository-inspection.mjs`; read-only phase | Success scan has no mutation | Relative root and symlink/path rules are tested | Concurrent replacement and arbitrary production trees |
| Discover instructions and checks | Strict config plus root instruction candidates | Fixture `AGENTS.md` digest and three commands discovered | Unknown/malformed configuration is refused | Nested instruction precedence and non-Node ecosystems |
| Present a reviewable plan | Canonical plan with SHA-256 | Stable golden plan digest | Changed-plan test refuses before execution | Checkout-to-plan attestation |
| Run lint, test, and build | `command-runner.mjs`; exact argv; shell disabled | All three pass in golden success | Failed test skips build | Untrusted process containment and external effects |
| Review metadata and secret risks | Manifest/document checks and bounded scan | Complete clean fixture inventory | Fake secret filename becomes blocker without value | History, entropy, dependencies, and unknown token formats |
| Use bounded delegation | One-child workflow and sanitized handoff | 1 start, 1 result, 1 disposal | Unavailable provider becomes `INCOMPLETE` | Authenticated model quality and external provider policy |
| Approve before mutation | Action id bound to plan digest | One `allowed-once` permits one build | Unavailable or failed prerequisite holds build | Real human identity and protected approval channel |
| Return structured report | Three-state decision vocabulary | Success report is reviewable and unauthorized | Blocked report preserves blockers | Schema evolution and downstream policy enforcement |
| Preserve Session evidence | JSONL builder and rc.6 validator | 19 contiguous events accepted | Sequence corruption is rejected | Durable backend, crash tail, signing, retention |
| Degrade safely | Explicit missing-capability branches | Completed local checks remain visible | Approval unavailable blocks; provider unavailable is incomplete | Partial external effects in a real distributed system |

## Permission and data-flow evidence

### Read phase

- Reads only the selected absolute target under configured limits.
- Refuses symbolic links.
- Does not execute discovered package scripts.
- Does not retain instruction content or suspected secret values in the report.

### Command phase

- Executes only the declared Node entrypoints with `shell: false`.
- Uses no stdin and caps stdout and stderr.
- Removes the absolute repository root and obvious token shapes from output.
- Checks before/after repository snapshots.
- Requires one consumed approval before the declared build.

### Delegation phase

- Sends counts, ids, outcomes, and unknowns rather than repository contents.
- Starts at most one deterministic child.
- Gives that child no model, filesystem, process, network, environment,
  continuation, or mutation interface.
- Disposes the child on every maintained settled path.

### Evidence phase

- Keeps report and Session in memory unless the separate materializer receives
  its explicit authoring flag.
- Writes only four named files below `evidence/` when authorized.
- Records no release authorization, token, private path, or customer data.

See the project's [threat model](../../../projects/release-readiness-agent/THREAT-MODEL.md)
for residual risks and production-hardening gates.

## Negative evidence and refusal points

The project deliberately preserves the following refusals:

- relative roots fail before inspection;
- malformed or overbroad command configuration fails before planning;
- mismatched plan identity fails before commands;
- failed read-only prerequisites prevent a build approval request;
- missing, rejected, or cancelled approval prevents build;
- undeclared mutation blocks the result after detection;
- unavailable delegated review produces no invented recommendation;
- invalid Session sequence fails validation; and
- evidence materialization without its flag exits non-zero and writes nothing.

These negative paths are part of the artifact. Removing them to make the demo
look smoother would weaken the course outcome.

## Clean-state and removal evidence

- Tests, demo, and materialization use exact temporary roots and remove them in
  `finally`.
- The maintained demo changes only `dist/artifact.json` inside its disposable
  fixture copy.
- No generated `dist/`, temporary fixture, npm tarball, cache, or Session log is
  required outside the four committed golden files.
- `node_modules/` is installation state and must not be committed.
- Removing only `projects/release-readiness-agent/node_modules/` uninstalls the
  local dependency tree; `package-lock.json` remains the resolution record.

## Unverified gates

The following claims remain open and keep Module 12 in `draft`:

- clean installation and run on supported macOS and Windows environments;
- authenticated model and real provider behavior;
- provider failure, timeout, cancellation, and data-policy review;
- browser or DSH profile interaction;
- OS-enforced process, filesystem, environment, and network sandboxing;
- real human approval with auditable identity;
- production repository instruction and command-policy review;
- Session persistence, crash-tail inspection/repair, retention, and deletion;
- telemetry redaction and external sink review;
- exact package archive, registry ownership, protected same-artifact publish,
  provenance, rollback, and incident handling;
- signed or remotely attested evidence bound to a source commit;
- independent security review; and
- independent learner completion.

None of these gaps is filled by a successful keyless demo.

## Reviewer sign-off

- [ ] I reproduced the exact install and test commands on a documented runner.
- [ ] I inspected both reports and both Session files.
- [ ] I confirmed the success result does not authorize release.
- [ ] I confirmed the blocked fixture remains blocked.
- [ ] I confirmed the fake secret value and absolute temporary path are absent.
- [ ] I confirmed build approval is action-specific and consumed once.
- [ ] I confirmed start/end/disposal counts are balanced.
- [ ] I confirmed both Session streams validate and corrupted input is refused.
- [ ] I reviewed the threat model and every open gate.
- [ ] I recorded cleanup without deleting an ambiguous path.

Reviewer: ____________________

Date: ____________________

Runner and package resolution: ____________________

Result: `draft evidence accepted` / `changes requested`

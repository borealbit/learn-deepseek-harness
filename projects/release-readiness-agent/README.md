# Release Readiness Agent

> Copyright © 2026 Borealbit Technology Limited. Created by Dom Liu. Original
> software and code samples in this project are licensed under Apache-2.0.

This is the keyless capstone for
[Module 12 — Capstone: Release Readiness Agent](../../course/en/12-capstone-release-readiness-agent/README.md)
of Learn DeepSeek Harness. It turns a small synthetic repository into a
reviewable plan, bounded checks, a one-child risk synthesis, a structured
decision, and a DeepSeek Harness Session JSONL evidence stream.

The maintained project never publishes and never reports `GO`. Its strongest
result is `READY_FOR_HUMAN_REVIEW`, with `releaseAuthorized: false`.

## What it demonstrates

```text
synthetic repository
  -> bounded instruction and metadata discovery
  -> obvious-secret scan without retaining matched values
  -> digest-bound review plan
  -> read-only lint and test
  -> one-shot approval for the declared build output
  -> one bounded workflow/subagent synthesis
  -> structured decision + validated Session JSONL
  -> human release checkpoint outside the fixture
```

The project covers all ten capstone behaviors:

1. Repository inspection is read-only by default.
2. Root `AGENTS.md`/`CLAUDE.md` candidates and declared checks are discovered.
3. The complete execution plan receives a SHA-256 identity before commands run.
4. `lint`, `test`, and `build` use exact argv arrays with `shell: false`.
5. Package metadata, required documents, file bounds, and obvious secret risks
   are reported.
6. One sanitized summary is delegated through the real worker-thread workflow
   and subagent seams.
7. The mutating build requires one action-specific `allowed-once` decision.
8. The final report has explicit blockers, warnings, limitations, and
   non-authorization fields.
9. Every operation is represented in contiguous JSONL accepted by the real
   `@deepseek-ai/dsh-session` rc.6 implementation.
10. Missing approval blocks mutation; a missing delegated provider produces an
    `INCOMPLETE` result instead of invented evidence.

## Compatibility reference

| Reference | Exact value |
|---|---|
| Node.js | `^22.19.0 \|\| >=24.0.0` |
| npm | `11.9.0` used for the reference run |
| `@deepseek-ai/dsh` install target | `0.1.0-rc.6` |
| DSH Session, subagent, Tool, and workflow packages | `0.1.0-rc.6` |
| Cordis | `4.0.1` |
| Reviewed upstream commit | [`47f943859bef60e4160492346772ded9b24f765a`](https://github.com/deepseek-ai/deepseek-harness/commit/47f943859bef60e4160492346772ded9b24f765a) |

The reviewed upstream source manifests still declare rc.5. Registry rc.6 and
the immutable source commit are separate evidence references.

## Project structure

```text
release-readiness-agent/
├── evidence/
│   ├── README.md
│   ├── golden-success.report.json
│   ├── golden-success.session.jsonl
│   ├── golden-blocked.report.json
│   └── golden-blocked.session.jsonl
├── fixtures/release-candidate/
│   ├── .release-readiness.json
│   ├── AGENTS.md
│   ├── package.json
│   ├── README.md
│   ├── SECURITY.md
│   ├── CHANGELOG.md
│   ├── NOTICE
│   ├── scripts/check.mjs
│   └── src/index.js
├── scripts/
│   ├── run-keyless.mjs
│   └── materialize-evidence.mjs
├── src/
│   ├── approval.mjs
│   ├── command-runner.mjs
│   ├── delegation.mjs
│   ├── release-readiness-agent.mjs
│   ├── repository-inspection.mjs
│   └── session-evidence.mjs
├── test/release-readiness-agent.test.mjs
├── THREAT-MODEL.md
├── NOTICE
├── package-lock.json
└── package.json
```

## Setup and keyless run

From this directory:

```sh
npm ci
npm run check
npm test
npm run demo
```

Expected maintained results:

```text
13 passed
0 failed
decision: READY_FOR_HUMAN_REVIEW
releaseAuthorized: false
sessionEvents: 19
```

The demo copies the committed fixture to one temporary directory. The fixture
approval controller allows only the action id beginning `command:build:` and
only once. The build changes only `dist/artifact.json` below that disposable
copy. The runner removes the exact temporary directory in `finally`.

No model credential, provider request, browser, registry write, package publish,
Git operation, or network request is required after `npm ci`.

## The repository contract

The target must contain `.release-readiness.json`. The maintained fixture uses:

```json
{
  "schemaVersion": 1,
  "rootLabel": "synthetic/release-candidate",
  "instructionFiles": ["AGENTS.md", "CLAUDE.md"],
  "commands": [
    {
      "id": "lint",
      "argv": ["node", "scripts/check.mjs", "lint"],
      "writesWorkspace": false,
      "timeoutMs": 5000
    },
    {
      "id": "build",
      "argv": ["node", "scripts/check.mjs", "build"],
      "writesWorkspace": true,
      "allowedWritePaths": ["dist/artifact.json"],
      "timeoutMs": 5000
    }
  ]
}
```

The actual fixture also declares `test`, scan limits, and required release
metadata. Configuration is strict:

- unknown top-level, command, scan, or release fields fail;
- exactly `lint`, `test`, and `build` are required;
- commands must be bounded argv arrays beginning with `node`;
- the JavaScript entry must stay below the repository root;
- command execution never invokes a shell;
- every mutating command must list at least one allowed path; and
- the plan digest changes when any step, argv, mutation flag, or allowed path
  changes.

This is a narrow teaching contract, not an automatic parser for every package
manager or CI system.

## Inspection behavior

The scanner resolves the repository root, rejects a relative root, refuses to
follow symbolic links, and applies explicit file and byte ceilings. It reports:

- instruction path, byte count, and SHA-256—not instruction prose;
- package name, version, private flag, license, Node range, and script names—not
  script command values;
- missing required manifest fields and documents;
- file and byte coverage; and
- secret rule id, relative path, line number, and a short fingerprint—not the
  matched value.

The obvious-secret rules cover common AWS access-key ids, GitHub token shapes,
`sk-`-style API keys, private-key headers, environment filenames, and likely
key-material filenames. A clean result does not prove that secrets are absent.

Command output is capped and removes the absolute repository root plus those
same obvious token shapes before it enters the report or Session evidence.

## Plan and approval boundary

Inspection produces the entire plan before command execution. A caller may pass
an `expectedPlanDigest`; a mismatch stops before the first command. This turns
“approve the plan I saw” into an exact comparison instead of a prose promise.

Read-only commands run without an approval request. A command declaring
`writesWorkspace: true` asks for one action id derived from its id and the plan
digest. Outcomes follow the Harness vocabulary:

- `allowed-once` — run this exact command once;
- `rejected` — do not run;
- `cancelled` — do not run;
- `unavailable` — fail closed because no answerer exists.

An approval does not authorize release, another command, a changed plan, or a
second run. If lint or test fails, build is skipped before an approval request.

The runner snapshots files before and after each command. Any change from a
declared read-only command, or any changed path outside a mutating command's
allowlist, becomes a blocker. This is after-the-fact detection, not containment.
Use an operating-system sandbox before executing untrusted repository code.

## Bounded delegation

The capstone passes only this summary into the delegated stage:

- target label;
- instruction count;
- missing metadata/document names;
- secret **rule ids**, never matched values;
- command ids and outcomes;
- blocker ids; and
- explicit unknowns.

The real `@deepseek-ai/dsh-workflow-worker-thread` engine runs a fixed script
with one-child concurrency and one-child total limits. The deterministic
provider implements the real `@deepseek-ai/dsh-subagent` seam, returns one
schema-checked object, and has no model, filesystem, process, environment,
network, continuation, or mutation capability. Start/end events are paired and
the child is disposed on every path.

Worker threads protect the host event loop; upstream explicitly does not treat
them as a security boundary. The fixed script remains executable code requiring
review.

Set `delegationMode: 'unavailable'` to exercise degradation. Local checks remain
visible, the report becomes `INCOMPLETE`, and release stays unauthorized.

## Decision vocabulary

| Decision | Meaning |
|---|---|
| `READY_FOR_HUMAN_REVIEW` | Maintained bounded checks passed; a human still owns release authorization |
| `INCOMPLETE` | No known blocker in completed checks, but required evidence could not be obtained |
| `BLOCKED` | At least one metadata, secret, command, approval, or delegated-review gate failed |

Every report also carries:

```json
{
  "releaseAuthorized": false,
  "humanApprovalRequired": true
}
```

There is intentionally no `GO` state and no publish function.

## Session evidence

The capstone records one synthetic turn containing paired Tool calls/results for
inspection, plan presentation, each command, delegation, and report production.
The JSONL has:

- one versioned Session header;
- contiguous sequence numbers;
- balanced turn and step boundaries;
- paired Tool calls and results;
- sanitized, bounded JSON values; and
- a SHA-256 stored in the report.

`validateSessionEvidence()` reconstructs the log with the real
`@deepseek-ai/dsh-session@0.1.0-rc.6` implementation. It rejects invalid JSON or
a sequence gap instead of repairing committed evidence silently.

This is a keyless synthetic Session, not a claim that an authenticated model
performed the review.

## Golden evidence

Two maintained scenarios live under [`evidence/`](evidence/):

- `golden-success` — lint/test/build pass, the exact build output is approved,
  one child completes, and the decision is `READY_FOR_HUMAN_REVIEW`;
- `golden-blocked` — a temporary secret-like filename and test-failure switch
  create blockers, build stops before approval, and the decision is `BLOCKED`.

Materialization is itself a write. The script refuses without an explicit flag:

```sh
npm run evidence
# exits 1; writes nothing

npm run evidence -- --approve-write-evidence
# rewrites only the four declared files under evidence/
```

Do not regenerate maintained evidence merely to hide a failure. Review the diff,
explain every changed digest, and keep the blocked case blocked.

## Tests

The thirteen tests cover:

1. bounded instruction/config/metadata discovery;
2. relative-root and drive-qualified command-path rejection;
3. unavailable approval and held mutation;
4. one-shot approved success without release authorization;
5. secret-like filename detection without value retention;
6. failed read-only prerequisite and pre-approval build stop;
7. unavailable delegation and safe `INCOMPLETE` degradation;
8. command-output secret redaction;
9. undeclared write detection;
10. changed-plan refusal;
11. real rc.6 Session acceptance;
12. corrupted sequence refusal; and
13. real worker-thread one-child lifecycle and disposal.

## Installation, cleanup, and removal

This is a private course project, not an npm release or DSH bundle.

Install dependencies only in this directory:

```sh
npm ci
```

The demo and tests remove their own temporary fixture copies. After an
interrupted run, inspect `/tmp` for a directory beginning `module12-demo-`,
`module12-test-`, or `module12-evidence-`; confirm the exact path before using
your normal safe cleanup tool.

To remove installed dependencies, delete only this project's `node_modules/`.
Keep `package-lock.json`; it is the exact dependency-resolution record. Never
delete the repository root, a user home, or a path taken from an unresolved
variable.

## Adapting to a real deployment

Before pointing this code at a real repository:

1. Put command execution inside a tested OS sandbox.
2. Replace the fixture approval controller with one terminal human answerer.
3. Add root and nested instruction semantics appropriate to the chosen cwd.
4. Review the command registry instead of copying package scripts blindly.
5. Define which build outputs and external services are allowed.
6. Replace the deterministic provider with a documented provider whose child
   Tool, cwd, sandbox, network, model, token, time, and depth policies are fixed.
7. Add telemetry redaction before any external sink.
8. Store Session JSONL in an approved persistence backend with retention policy.
9. Add registry, provenance, exact-artifact install, rollback, and public
   support gates from Module 11.
10. Keep publication in a separate protected workflow after human approval.

See [THREAT-MODEL.md](THREAT-MODEL.md) before making any of those changes.

## Known limitations

- Only the synthetic fixture is maintained and tested.
- Instruction discovery is intentionally root-only; it does not emulate every
  dynamic nested-scope behavior of the official plugin.
- The scanner is bounded pattern matching, not entropy analysis, history
  scanning, dependency review, or a secret-management product.
- Only `node` argv commands are accepted; there is no shell or general CI parser.
- File snapshots detect undeclared writes after execution but cannot prevent
  subprocess, network, or out-of-tree effects.
- The delegated provider is deterministic and keyless; it does not evaluate
  model quality or prompt injection.
- No real DSH profile, browser, authenticated provider, public registry,
  provenance statement, or production repository is exercised.
- Cross-platform and independent learner verification remain open.

## Official references

- [Agent lifecycle](https://github.com/deepseek-ai/deepseek-harness/blob/47f943859bef60e4160492346772ded9b24f765a/docs/agent-lifecycle.md)
- [Tool execution pipeline](https://github.com/deepseek-ai/deepseek-harness/blob/47f943859bef60e4160492346772ded9b24f765a/docs/tool-execution-pipeline.md)
- [Session subsystem](https://github.com/deepseek-ai/deepseek-harness/blob/47f943859bef60e4160492346772ded9b24f765a/docs/subsystems/session.md)
- [Workspace instructions](https://github.com/deepseek-ai/deepseek-harness/blob/47f943859bef60e4160492346772ded9b24f765a/packages/context/agent-instructions/README.md)
- [One-shot approval seam](https://github.com/deepseek-ai/deepseek-harness/blob/47f943859bef60e4160492346772ded9b24f765a/packages/interaction/user-approval/README.md)
- [Subagent subsystem](https://github.com/deepseek-ai/deepseek-harness/blob/47f943859bef60e4160492346772ded9b24f765a/docs/subsystems/subagent.md)
- [Workflow subsystem](https://github.com/deepseek-ai/deepseek-harness/blob/47f943859bef60e4160492346772ded9b24f765a/docs/subsystems/workflow.md)
- [Worker-thread workflow engine](https://github.com/deepseek-ai/deepseek-harness/blob/47f943859bef60e4160492346772ded9b24f765a/packages/workflow/workflow-worker-thread/README.md)
- [Session persistence seam](https://github.com/deepseek-ai/deepseek-harness/blob/47f943859bef60e4160492346772ded9b24f765a/packages/session/session-persistence/README.md)
- [Session telemetry and redaction](https://github.com/deepseek-ai/deepseek-harness/blob/47f943859bef60e4160492346772ded9b24f765a/packages/session/session-telemetry/README.md)

## License

Original software in this directory is licensed under Apache-2.0. Copyright
2026 Borealbit Technology Limited. Created by Dom Liu. See the repository's
`LICENSE-CODE`, `LICENSES.md`, and this directory's `NOTICE`. Upstream
dependencies retain their own terms.

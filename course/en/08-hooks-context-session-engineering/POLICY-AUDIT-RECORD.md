# Module 08 Policy Audit Record

Use this record to distinguish the maintained reference run from your own
verification. Do not add credentials, Tool arguments, private absolute paths,
customer identifiers, raw Session exports, or generated profile contents.

## Reference identity

| Field | Recorded value |
|---|---|
| Reference date | `2026-08-14` |
| Platform and architecture | `Linux x86_64` |
| Node.js | `v24.19.0` |
| npm | `11.9.0` |
| pnpm | `11.19.0` |
| Plugin | `@borealbit/dsh-tool-policy-gate@0.1.0` |
| CLI | `@deepseek-ai/dsh@0.1.0-rc.6` |
| Tool Runtime | `@deepseek-ai/dsh-tools@0.1.0-rc.6` |
| Session | `@deepseek-ai/dsh-session@0.1.0-rc.6` |
| Cordis | `@deepseek-ai/cordis@4.0.1` |
| Schemastery | `@deepseek-ai/schemastery@3.18.1` |
| Reviewed upstream source | `47f943859bef60e4160492346772ded9b24f765a` |
| Module status | `draft` |

The reference run used only synthetic Tools and detached Session state. No
model credential, provider request, browser, customer Session, repository
inspection, subprocess Tool, filesystem Tool, or network Tool was used.

## Source and package record

| Evidence | Observation | Interpretation |
|---|---|---|
| Upstream commit | `47f943859bef60e4160492346772ded9b24f765a` reviewed | Immutable source and documentation reference |
| Upstream manifests | Core packages declared `0.1.0-rc.5` | Reviewed checkout predates tested registry manifest versions |
| Exact CLI package | `@deepseek-ai/dsh@0.1.0-rc.6` | Runtime smoke pin |
| Exact fixture packages | DSH core rc.6, Cordis `4.0.1`, Schemastery `3.18.1` | Build and test contract fixed by lockfile |
| Lock integrity | Frozen exact resolution used from an offline runner store | No moving tag or unpinned resolution used in the test |

The source commit and registry packages are separate evidence. This record does
not claim that the rc.6 tarballs are byte-identical to the rc.5 manifests in
the reviewed checkout.

## Reference commands

Commands were executed from `plugins/tool-policy-gate/`. The maintained learner
sequence is:

```sh
pnpm install --frozen-lockfile
pnpm typecheck
pnpm test
npm pack --dry-run --ignore-scripts
```

The restricted reference runner already had exact integrity-pinned package
content in a temporary pnpm store. Because the packages were less than the
runner's configured minimum release age, dependency materialization used this
disposable-runner exception:

```sh
pnpm install \
  --frozen-lockfile \
  --offline \
  --store-dir /tmp/module07-pnpm-store \
  --config.minimum-release-age=0
```

That override is not a course recommendation. It was recorded because silently
weakening a supply-chain policy would make the evidence misleading. After the
release clears the configured age, use the normal frozen command.

The command execution gateway classified the `pnpm typecheck` wrapper itself as
a possible network action, even after dependencies were local. The reference
run therefore invoked the same pinned local compiler and Node test entry points
directly:

```sh
./node_modules/.bin/tsc -p tsconfig.json --noEmit
node scripts/clean.mjs
./node_modules/.bin/tsc -p tsconfig.json
node --test test/tool-policy-gate.test.js
npm pack --dry-run --offline --cache /tmp/module08-npm-cache --ignore-scripts
```

This gateway limitation is environmental. `package.json` retains conventional
`pnpm typecheck` and `pnpm test` scripts for learners.

## Command results

| Command or check | Exit | Observed result |
|---|---:|---|
| Frozen exact offline dependency materialization | `0` | Lockfile resolution installed with the documented release-age exception |
| Strict TypeScript check | `0` | No diagnostic |
| Clean build | `0` | ESM JavaScript and declarations generated under `lib/` |
| Node test runner | `0` | 6 passed, 0 failed, 0 skipped |
| npm pack dry run | `0` | 7 files; 10.3 kB packed, 28.7 kB unpacked; no publish |
| Exact CLI `--version` | `0` | `0.1.0-rc.6` |
| Source-overlay `--dump-config` | `0` | Built absolute plugin entry and deny configuration appeared in the Web composition |
| Loader/Web boot | `0` | `dsh web` announced the local endpoint and a same-process HTTP probe returned `200` |
| SIGTERM cleanup | `0` | Disposable Web process stopped after the probe |

The temporary CLI, DSH home, absolute overlay, package store, and npm cache were
outside the repository. Their runner paths are intentionally omitted from the
maintained course evidence.

## Test evidence

| # | Test | Boundary or contract proven |
|---:|---|---|
| 1 | Normalizes an exact, frozen deny-list and rejects ambiguous configuration | Detached policy state; range, duplicate, name, and reason validation |
| 2 | Denies the configured Tool before its synthetic body runs | Fail-closed pre-execute result; execution counter remains zero |
| 3 | Allows non-matching Tools and uses exact case-sensitive names | Narrow policy scope; no accidental substring or case-fold match |
| 4 | Records one log-only denial without copying Tool arguments | Typed audit shape, sentinel absence, and zero derived messages |
| 5 | Guard denies after a preceding listener short-circuits allow | Monotonic fallback is independent of cooperative waterfall continuation |
| 6 | Plugin disposal removes denial hook and guard | Lifecycle-owned cleanup; call succeeds only after disposal |

The Runtime fixture composes real `Context`, `SystemPrompt`, and `ToolRuntime`
packages. Audit tests use a real detached `Session`. The Agent object supplies
only the identity, Session, and context fields needed by Tool execution; this
is not a full authenticated Agent Loop.

## Denial evidence

The synthetic Tool is named `course_unsafe_operation`. Its body only increments
an in-memory counter and returns `{ "executed": true }`. It performs no actual
unsafe operation.

| Assertion | Observed |
|---|---:|
| Denied result has `isError: true` | Yes |
| Error contains the configured deployment policy reason | Yes |
| Tool-body counter after denied call | `0` |
| Pre-execute audit event count | `1` |
| Guard-fallback audit event count | `1` in its separate execution |
| Audit records include an argument object | No |
| Sentinel argument appears in serialized custom events | No |
| Detached audit Session `deriveMessages()` count | `0` |

This proves omission from the custom event only. A normal Agent Loop owns core
`tool/call` and `tool/result` events with their own contracts.

## Reference audit shape

The sanitized tested value was:

```json
{
  "policy": "tool-policy-gate",
  "ruleId": "course.no-unsafe-operation",
  "decision": "deny",
  "enforcementPoint": "pre-execute",
  "callId": "module08-audited-denial",
  "rootCallId": "module08-audited-denial",
  "tool": "course_unsafe_operation",
  "reason": "The Module 08 practice policy denies this synthetic operation.",
  "argumentsRecorded": false
}
```

The synthetic sentinel supplied as a Tool argument is deliberately not repeated
here. Learner records should demonstrate absence with a boolean assertion, not
by pasting the sensitive value they hope to exclude.

## Dry-run package inventory

The seven-file dry run contained:

```text
LICENSE
NOTICE
README.md
cordis.patch.yml
lib/index.d.ts
lib/index.js
package.json
```

It excluded TypeScript source, tests, `node_modules`, lockfile, generated
profiles, temporary overlays, source maps, and package tarballs. The lockfile
remains in Git for course reproduction but is not selected by `package.files`.

## Exact CLI overlay smoke

The package was built, then a temporary overlay pointed at the absolute built
`lib/index.js`. The composed configuration included:

```yaml
- id: borealbit-tool-policy-gate
  name: /sanitized/absolute/path/to/lib/index.js
  config:
    blockedTools:
      - inspect_repository
    ruleId: course.block.inspect-repository
    reason: The Module 08 practice policy blocks this Tool.
```

The exact CLI accepted the overlay in `--dump-config`. A real Web profile then
loaded the same entry, announced a loopback endpoint, returned HTTP `200` to a
same-process probe, and stopped on SIGTERM. Telemetry was disabled for the
smoke. No browser loaded the application, no provider request occurred, and no
Tool call was initiated.

This proves Loader acceptance and HTTP boot, not model enforcement, browser
presentation, profile persistence, or local bundle installation.

## Policy-boundary review

| Question | Reference answer | Evidence class |
|---|---|---|
| Who chooses blocked Tool names? | Deployer through plugin configuration | Observed in source and normalization test |
| Can the model change the deny-list? | No Tool argument exposes it | Observed in plugin surface |
| Is matching exact and case-sensitive? | Yes | Observed |
| Can an early cooperative allow bypass the boundary? | Not when the call reaches monotonic guards | Observed |
| Does the denied Tool body run? | No | Observed with counter |
| Are arguments duplicated into the custom event? | No | Observed with sentinel-absence assertion |
| Does the custom event enter model history? | No | Observed with `deriveMessages()` |
| Is a direct call denied? | Yes | Observed in agent-less denial test |
| Is a direct call durably audited? | No Session is available | Observed by design; documented limitation |
| Does unload remove both effects? | Yes | Observed |
| Does the event automatically persist? | No; a persistence plugin is required | Source-reviewed; unverified end to end |
| Does the event automatically render in Web? | No custom renderer ships | Source-reviewed; unverified UI |
| Is this an OS sandbox? | No | Scope statement, not a sandbox claim |

## Observed, inferred, and unverified

- **Observed:** configuration validation and freezing; pre-body denial; exact
  matching; one log-only custom event; sentinel omission; empty derived model
  history; guard fallback after a short-circuit allow; disposal cleanup; strict
  type checking; six keyless tests; seven-file dry-run pack; exact rc.6 config
  composition; real Loader/Web HTTP boot and shutdown.
- **Inferred:** an Agent Loop call routed through this loaded Tool Runtime
  should append the custom event beside normal Tool events because the same
  typed execution includes `exec.agent`. This has not been observed with an
  authenticated provider or persisted Session.
- **Unverified:** authenticated model selection and denial, persistent storage
  and resume, crash recovery, compaction followed by replay, browser rendering,
  local bundle add/remove for this package, live configuration reload, clean
  independent Linux reproduction, macOS, Windows, high-concurrency stress,
  multi-agent scope combinations, and production security review.

## Promotion gates

Do not mark Module 08 or this plugin verified until all applicable boxes pass:

- [x] Immutable upstream source and exact package versions recorded separately.
- [x] Strict TypeScript check passes.
- [x] Configuration and exact-match tests pass.
- [x] Real Tool Runtime proves denial before the body.
- [x] Real Session proves typed audit, argument omission, and history exclusion.
- [x] Prepended-allow test proves monotonic guard fallback.
- [x] Fiber disposal removes hook and guard.
- [x] Prospective package contents inspected without publishing.
- [x] Exact rc.6 source overlay appears in composed configuration.
- [x] Real Loader/Web HTTP boot and clean shutdown pass.
- [ ] Local bundle add, profile persistence, dump, boot, remove, and cleanup pass.
- [ ] Authenticated model attempts only the safe Module 07 fixture Tool and is denied.
- [ ] Persistent Session reload retains the custom event and normal Tool outcome.
- [ ] Compaction/replay review confirms raw audit retention and model-history exclusion.
- [ ] Browser or host API intentionally renders or intentionally ignores the custom event.
- [ ] Independent learner reproduces the frozen install and all six tests on clean Linux.
- [ ] Clean macOS install, test, overlay, and unload pass.
- [ ] Clean Windows install, test, overlay, and unload pass.
- [ ] Production review defines direct-call audit coverage and audit-sink failure policy.
- [ ] No credentials, private paths, raw Sessions, generated overlays, build output,
  caches, or package tarballs are committed.

## Learner reproduction record

Copy this section into your own evidence file and keep every value sanitized.

| Field | Your value |
|---|---|
| Date | TODO: `YYYY-MM-DD` |
| Platform and architecture | TODO: |
| Node.js | TODO: |
| pnpm | TODO: |
| Plugin | `@borealbit/dsh-tool-policy-gate@0.1.0` |
| CLI | `@deepseek-ai/dsh@0.1.0-rc.6` |
| Upstream source | `47f943859bef60e4160492346772ded9b24f765a` |
| `pnpm install --frozen-lockfile` | TODO: exit and concise result |
| `pnpm typecheck` | TODO: exit and concise result |
| `pnpm test` | TODO: exit, pass/fail/skip counts |
| Body counter after denial | TODO: expected `0` |
| Custom event argument fields | TODO: expected none |
| Derived messages in isolated audit test | TODO: expected `0` |
| `npm pack --dry-run --ignore-scripts` | TODO: exit and file count |
| Overlay/profile check | TODO: observed/skipped; never paste a private path |
| Authenticated synthetic-fixture call | TODO: observed/skipped |
| Persistent resume | TODO: observed/skipped |
| Cleanup | TODO: stopped, disposed, temporary files removed |

### Learner safety assertions

- [ ] Only the synthetic counter Tool or deliberately scoped Module 07 fixture
  was used.
- [ ] No real destructive action was attempted to prove denial.
- [ ] No API key, credential, Tool argument, private path, customer identifier,
  or raw Session appears in this record.
- [ ] The final composed configuration was inspected before boot.
- [ ] The denied Tool body counter stayed at zero.
- [ ] The custom audit event contains `argumentsRecorded: false` and no
  argument value.
- [ ] Direct agent-less calls are not claimed as durably audited.
- [ ] Unload removed both policy registrations.
- [ ] Skipped provider, persistence, browser, platform, and security work is
  labeled unverified.

Source lesson: [Module 08 — Hooks, Context, and Session Engineering](README.md).

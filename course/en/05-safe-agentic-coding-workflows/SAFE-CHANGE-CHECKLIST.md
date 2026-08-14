# Module 05 Safe-Change Checklist

Complete this copy with sanitized evidence from one run of the synthetic Safe Change Workspace. Do not record credentials, absolute private paths, raw Session ids, private provider details, or a raw Session export.

## Run identity

| Field | Sanitized value |
|---|---|
| Date | TODO: YYYY-MM-DD |
| Platform and architecture | TODO: |
| Node.js version | TODO: |
| npm version | TODO: |
| Git version | TODO: |
| Install package | `@deepseek-ai/dsh@0.1.0-rc.6` |
| Reviewed upstream source | `47f943859bef60e4160492346772ded9b24f765a` |
| Agent preset | TODO: must be Standard |
| Provider and model ids | TODO: identifiers only |
| Reasoning effort | TODO: id or not exposed |
| Workspace label | `safe-change-workspace` |
| Session label | TODO: sanitized label only |

## Change contract

| Contract field | Recorded boundary |
|---|---|
| Observable goal | TODO: |
| Allowed implementation path | `src/slugify.js` |
| Allowed test path | `test/slugify.test.js` |
| Forbidden paths | `AGENTS.md`, `CHANGE-REQUEST.md`, `README.md`, `package.json`, and every other path |
| Dependency changes | None |
| Public API changes | None |
| Network use | None |
| Commit or push | None |
| Baseline command | `npm test` |
| Acceptance behavior | TODO: include an underscore example |
| Recovery target | Disposable copy only |

## Instruction and trust review

| Check | Result | Evidence or caveat |
|---|---|---|
| `AGENTS.md` inspected by the learner | TODO: pass/fail | TODO: |
| `CHANGE-REQUEST.md` inspected | TODO: pass/fail | TODO: |
| No instruction authorizes secret or outside-path access | TODO: pass/fail | TODO: |
| No instruction requires network or dependency installation | TODO: pass/fail | TODO: |
| Instruction candidates are ordinary files in the fixture | TODO: observed/unverified | TODO: |
| Direct request, project instructions, and course policy agree | TODO: pass/fail | TODO: |

Instruction files actually read by the agent:

- TODO: relative path and why it applied.

Instruction concern or conflict:

- TODO: none, or describe the conflict and how it was resolved before work.

## Baseline evidence

| Check | Expected | Observed |
|---|---|---|
| Baseline commit created in temporary repository | Local commit only | TODO: |
| `npm test` exit status | `0` | TODO: |
| Baseline passing tests | `3` | TODO: |
| `git status --short` | No output | TODO: |
| Existing underscore behavior | Request not yet satisfied | TODO: observed from source, not a fabricated test result |

Baseline failure rule:

- TODO: state that work would stop and require a new contract if the baseline were not healthy.

## Plan phase

| Gate | Required value | Observed |
|---|---|---|
| Agent preset | Standard | TODO: |
| Interaction mode | Plan Mode | TODO: |
| Permission preset | Read Only | TODO: |
| Shell used during discovery | No | TODO: |
| Network used during discovery | No | TODO: |
| Mutation attempted during discovery | No | TODO: |
| Outside-workspace path accessed | No | TODO: |
| Plan submitted through review | Yes | TODO: |

### Reviewed plan summary

Goal and success criteria:

- TODO:

Allowed files named in the plan:

- `src/slugify.js`
- `test/slugify.test.js`

Test sequence:

1. TODO: focused regression addition.
2. TODO: expected failing run and failure reason.
3. TODO: minimal implementation.
4. TODO: final verification commands.

Explicit non-goals and recovery behavior:

- TODO:

### Plan decision

| Field | Evidence |
|---|---|
| Initial decision | TODO: Approve / Refuse / Chat about it |
| Reason | TODO: |
| Revision requested | TODO: none, or sanitized summary |
| Final decision | TODO: |
| Why plan approval did not grant tool escalation | TODO: |

## Permission and approval record

| Phase | Standing preset | Filesystem mode | Approval policy | Why |
|---|---|---|---|---|
| Discovery and planning | Read Only | `read-only` | `ask` | TODO: |
| Approved implementation | Workspace Write | `workspace-write` | `ask` | TODO: |
| Full access | Never selected | `danger-full-access` not used | `never` not used | TODO: |

Approval requests, in order:

| # | Exact action summary | Requested mode | Justification | Decision | Did it execute? |
|---:|---|---|---|---|---|
| 1 | TODO: write `none` if no escalation occurred | TODO: | TODO: | TODO: | TODO: |

Approval assertions:

- TODO: explain why ordinary allowed workspace writes may not prompt under `ask`.
- TODO: explain why rejection, cancellation, or unavailability grants nothing.
- TODO: confirm no plan decision was counted as a privilege decision.

## Mutation and test sequence

Record the order from Trajectory, not from memory.

| # | Action | Path or command | Expected result | Observed result |
|---:|---|---|---|---|
| 1 | Read current implementation | `src/slugify.js` | Current version observed | TODO: |
| 2 | Read current tests | `test/slugify.test.js` | Current version observed | TODO: |
| 3 | Add focused regression | `test/slugify.test.js` | Only test file changes | TODO: |
| 4 | Run pre-fix tests | `npm test` | New test fails for underscore behavior | TODO: exit and relevant failure |
| 5 | Make minimal implementation | `src/slugify.js` | Only implementation file changes | TODO: |
| 6 | Run final tests | `npm test` | All tests pass | TODO: exit and count |
| 7 | Check whitespace errors | `git diff --check` | Exit `0` | TODO: |
| 8 | Inspect scope | `git status --short` | Exactly two modified files | TODO: |
| 9 | Inspect complete diff | Allowed two paths | Understandable and bounded | TODO: |

Expected failure diagnosis:

- TODO: show that the test failed because underscores were removed rather than treated as separators.

Why the implementation was minimal:

- TODO:

## Independent repository audit

| Assertion | Result | Evidence |
|---|---|---|
| Final `npm test` exited `0` | TODO: pass/fail | TODO: |
| Existing baseline tests still pass | TODO: pass/fail | TODO: |
| New underscore regression passes | TODO: pass/fail | TODO: |
| `git diff --check` exited `0` | TODO: pass/fail | TODO: |
| `git diff --name-only` lists exactly two allowed paths | TODO: pass/fail | TODO: |
| Protected-file diff exited `0` with no output | TODO: pass/fail | TODO: |
| No dependency or package metadata changed | TODO: pass/fail | TODO: |
| No generated or untracked file appeared | TODO: pass/fail | TODO: |
| No agent-created commit exists | TODO: pass/fail | TODO: |

Final status, using relative paths only:

```text
TODO: sanitized `git status --short` output
```

Diff review summary:

- Behavior added: TODO:
- Existing behavior preserved: TODO:
- Unrelated change found: TODO: none, or stop the lab.
- Reviewer decision: TODO: accept / revise / reject; the lab still does not commit.

## Trajectory audit

| Record class | Count or sanitized summary | Accounted for? |
|---|---|---|
| User turns | TODO: | TODO: |
| Assistant steps | TODO: | TODO: |
| Direct filesystem reads/searches | TODO: | TODO: |
| File mutations | TODO: | TODO: |
| Shell commands | TODO: | TODO: |
| Plan-review wait and decision | TODO: | TODO: |
| Approval asked/decided pairs | TODO: | TODO: |
| Denials or runner failures | TODO: | TODO: |
| Tool errors | TODO: | TODO: |
| Applied diff cards | TODO: | TODO: |

Unexpected intermediate call:

- TODO: none, or describe why the result must be revised or rejected even if the final diff is correct.

Observed, inferred, and unverified:

- **Observed:** TODO: fact directly visible in the Session, Trajectory, command result, or diff.
- **Inferred:** TODO: cautious conclusion supported by controlled inputs and official implementation.
- **Unverified:** TODO: security, platform, provider, or runtime claim not proven by this lab.

## Failure and recovery record

### Recovery drill

| Check | Expected | Observed |
|---|---|---|
| Recovery target is a disposable copy | Yes | TODO: |
| `git restore --worktree -- .` target checked | Recovery copy only | TODO: |
| Recovery status | No output | TODO: |
| Recovery `npm test` | Three baseline tests pass | TODO: |
| Original modified workspace retained for review | Yes | TODO: |

### Unknown-outcome rule

Complete this sentence:

> If a non-idempotent external tool call is interrupted after its intent becomes durable but before a result is recorded, I will TODO: inspect the external state and obtain confirmation when needed, rather than blindly retrying.

### Troubleshooting event

| Failure code or symptom | Classification | State inspected before retry? | Safe correction | Outcome |
|---|---|---|---|---|
| TODO: use the expected failing test, or another real event | TODO: | TODO: | TODO: | TODO: |

## Final safety assertions

- [ ] No placeholder marker remains.
- [ ] No API key, token, credential value, private endpoint, or secret-bearing header is present.
- [ ] No absolute temporary path, raw Session id, raw export, or private file content is present.
- [ ] The workspace contained synthetic data only.
- [ ] Project instructions were reviewed as untrusted guidance before model use.
- [ ] Plan Mode was paired with Read Only during discovery.
- [ ] Workspace Write was selected only after plan approval.
- [ ] Full access was never selected.
- [ ] Every approval decision, including none, is explicitly accounted for.
- [ ] The expected failing test preceded the implementation change.
- [ ] Final tests and the complete repository diff were independently checked.
- [ ] Exactly the two allowed files changed.
- [ ] The agent did not commit or push.
- [ ] Recovery was performed only on the disposable copy.
- [ ] Unknown external side effects would be verified before retry.

Source lesson: [Module 05 — Safe Agentic Coding Workflows](README.md).

# English Draft Retrospective — Modules 00–12

This retrospective closes the planned English **drafting sequence**. It does
not declare English v1 verified and does not reopen localization.

## What the capstone integrates

The Release Readiness Agent is a small integration point for the operating
habits developed across the course:

| Module | Habit carried into the capstone | Inspectable artifact |
|---:|---|---|
| 00 | Begin with a bounded task and inspect before mutation | Quick Start Workspace and first-run checklist |
| 01 | Separate model behavior from harness-controlled authority | Architecture map and explicit non-authorization fields |
| 02 | Treat runtime composition and lifecycle as observable contracts | Cordis, workflow, subagent, and disposal seams |
| 03 | Choose a mode from task and trust boundaries | Narrow keyless runner instead of an all-purpose mode |
| 04 | Separate provider configuration, Workspace state, and Session evidence | No credential requirement; one synthetic Session identity |
| 05 | Plan, request permission, mutate narrowly, verify, and recover | Digest-bound plan and one-shot build approval |
| 06 | Select the smallest extension mechanism that fits | Direct services for Session, workflow, and delegation; no unnecessary MCP surface |
| 07 | Build a typed, bounded, testable native capability | Strict repository contract and deterministic runner |
| 08 | Apply policy before a Tool body and retain audit evidence | Approval gate, output sanitization, and paired events |
| 09 | Bound delegation and own cancellation/disposal | One sanitized child with one-start total cap |
| 10 | Evaluate trajectories, failures, and missing evidence | Golden success/blocked reports and validated Session JSONL |
| 11 | Separate artifact readiness from publication authority | `READY_FOR_HUMAN_REVIEW`, never `GO` |
| 12 | Integrate the contracts into one auditable handoff | Release Readiness Agent, threat model, tests, and evidence record |

The important result is not the amount of automation. It is that every claim
has a named evidence source and every unavailable capability remains visible.

## What worked well

### One canonical English line

Drafting one active edition avoided three versions drifting while the upstream
project and npm prereleases were changing. Every technical module can record
the same immutable source reference and the exact install package separately.

### Runnable artifacts before broad claims

The strongest lessons now have concrete, inspectable projects or plugins:

- disposable workspaces for first-run, safe-change, and extension decisions;
- Repository Inspector and Tool Policy Gate plugins;
- Delegated Review Workflow;
- Mode Comparison Lab; and
- Release Readiness Agent.

The artifacts turn statements such as “approval is one-shot” or “Session is
append-only” into tests and failure cases.

### Negative paths as first-class evidence

The course does not treat a successful output as enough. Maintained artifacts
include denial, malformed input, cancellation or unavailability, failed checks,
secret-risk detection, undeclared mutation, trace corruption, NO-GO, and
BLOCKED outcomes.

The capstone keeps that discipline: its blocked evidence is not a temporary
defect to hide. It is a regression oracle.

### Source review separated from package execution

The course install target is rc.6 while the reviewed upstream source manifests
still declare rc.5. Recording both avoids a false equivalence between a moving
npm tag and an immutable Git commit.

### Authority stays outside model prose

Instructions, plans, delegated recommendations, and final summaries do not
grant authority. The capstone permits one declared build through one consumed
approval and leaves release authorization to a separate human and protected
system.

## What the maintained evidence proves

On the recorded Linux runner, the capstone demonstrates that:

- strict configuration and bounded inspection can build a stable plan;
- exact lint, test, and build argv can run with the shell disabled;
- read-only and declared-mutation filesystem deltas can be compared;
- missing approval prevents the mutating command;
- a failure before build prevents an unnecessary approval request;
- one sanitized child can run through the real rc.6 workflow/subagent seams
  and be disposed;
- unavailable delegation can remain explicitly incomplete;
- structured success and blocked reports can be generated deterministically;
- synthetic event evidence can pass the real rc.6 Session validator; and
- evidence rewriting can require a separate explicit authoring action.

These statements are narrower than “the agent can release software safely.”

## What it does not prove

The maintained evidence does not prove:

- correctness on arbitrary or private repositories;
- protection from malicious build code;
- authenticated model judgment or provider reliability;
- prompt-injection resistance in a production instruction chain;
- security of external telemetry, persistence, or delegated providers;
- compatibility on every supported platform;
- registry ownership, artifact provenance, or safe publication;
- that a human understood or approved a real release;
- that browser and DSH profile behavior match the fixture; or
- that an independent learner can complete every lesson without assistance.

An after-the-fact file snapshot is not a sandbox. A worker thread is not a
sandbox. A filtered Tool list is not automatically an authority ceiling. A
clean pattern scan is not proof of secret absence. A valid Session digest is
not signed provenance.

## Design choices worth keeping

### Keep three decision states

`READY_FOR_HUMAN_REVIEW`, `INCOMPLETE`, and `BLOCKED` express different facts.
Collapsing missing evidence into pass or fail would make operations less safe.

### Keep release authorization impossible in the fixture

The project should continue to have no publish function and no `GO` value. A
future publication integration belongs behind a separately reviewed protected
workflow.

### Keep the plan identity stable and reviewable

Approval should remain bound to an exact action and plan digest. If source,
argv, timeout, or allowed output changes, the reviewer should see a new plan.

### Keep sanitized success and failure evidence together

One happy trace cannot explain the refusal contract. Both scenarios should be
reviewed whenever the generator or runtime dependency changes.

### Keep lifecycle ownership explicit

The parent owns child caps, cancellation, settlement, and disposal. A delegated
review should never become an abandoned background task.

### Keep documentation and code licensing distinct

Original course prose remains CC BY 4.0 with Dom Liu as the designated
attribution party. Original project software remains Apache-2.0. Upstream and
third-party material retains its own terms.

## Changes to consider before English v1

### Course-wide automation

- Add an automated Markdown and relative-link check.
- Add metadata validation for every technical module.
- Add a check that moving tags are not used as compatibility evidence.
- Add secret and generated-artifact checks for course pull requests.
- Add a machine-readable verification matrix without replacing dated records.

### Capstone hardening

- Run commands inside a real platform sandbox with explicit network policy.
- Bind plans to immutable tree identities and revalidate immediately before
  execution.
- Add production-grade nested instruction precedence and injection handling.
- Add a reviewed command registry for each supported repository type.
- Add authenticated provider tests with strict data and Tool policies.
- Add durable Session storage, crash-tail behavior, retention, and deletion.
- Add telemetry redaction tests before any exporter is enabled.
- Add signed evidence and same-artifact release provenance.
- Add auditable human identity at the final approval boundary.

### Verification program

- Execute every applicable module on clean Linux and macOS environments.
- Review Windows-specific path, process, cancellation, and symlink behavior.
- Complete authenticated model, browser, resume, persistence, provider,
  timeout, cancellation, and release-channel labs where required.
- Run independent learner passes and capture points of confusion.
- Re-review all modules when the next DSH prerelease changes a used contract.

## English v1 release gates

The English v1 milestone should remain open until:

- [ ] all thirteen modules have complete metadata and reviewed links;
- [ ] each documented command is reproduced on its declared platforms;
- [ ] every module-dependent authenticated flow is exercised safely;
- [ ] permission prompts, sandbox behavior, and cleanup are verified;
- [ ] runnable artifacts install from clean environments and leave no generated
      repository state;
- [ ] package/source gaps are documented or closed;
- [ ] browser and persistence claims are tested where taught;
- [ ] Module 11's public release prerequisites are either completed or retained
      as explicit NO-GO scope;
- [ ] the capstone receives sandbox, provider, persistence, telemetry,
      cross-platform, security, and independent-learner review appropriate to
      the desired claim;
- [ ] course-wide link, formatting, secret, and license checks pass; and
- [ ] a final editorial and legal-attribution review is complete.

Until then, modules remain drafts even when their local keyless tests pass.

## Localization decision

Simplified Chinese and Japanese remain frozen placeholders. Localization should
resume only after the canonical English content and verification record stop
changing rapidly.

When localization reopens:

1. translate from one tagged English source;
2. preserve exact commands, package versions, source refs, warnings, and
   license attribution;
3. rerun technical steps rather than translating expected output blindly;
4. require native-language review, especially for permissions and security;
5. track English changes as `needs-review`; and
6. never mark a translation verified when its English source is still draft.

The eventual order remains English, then Simplified Chinese, then
native-reviewed Japanese—not simultaneous machine-generated publication.

## Maintainer questions

Use these questions at the next upstream or course release:

1. Which used upstream contracts changed since the pinned commit?
2. Does the current npm package still resolve to the tested runtime behavior?
3. Which module claims lost evidence because a UI, provider, or platform moved?
4. Do failure cases still fail for the intended reason?
5. Did any new data cross a model, child, persistence, or telemetry boundary?
6. Can every granted mutation be tied to one reviewed action?
7. Are golden evidence changes semantic, environmental, or accidental?
8. Can an independent learner explain the non-authority boundaries?
9. Which open verification gate has a named owner and reproducible close
   condition?
10. Is localization still based on the current canonical English source?

## Final position

Modules 00–12 now form a coherent English draft: operate a bounded agent,
understand its composition, build extensions, enforce policy, delegate safely,
evaluate traces, prepare a release candidate, and integrate those ideas into a
reviewable capstone.

The next milestone is not Module 13. It is evidence: close the outstanding
verification gates, review the draft with independent learners, and publish an
English v1 only when the claims match the tests.

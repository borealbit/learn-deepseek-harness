# Roadmap

This roadmap is milestone-based. DeepSeek Harness is a fast-moving developer preview, so verified deliverables matter more than calendar promises.

## Principles

- Publish small, testable lessons instead of one large static course.
- Pin every technical lesson to both an installable package and an immutable upstream source revision when they differ.
- Complete and verify the English v1 course before localization begins.
- Keep free onboarding useful; reserve deeper value for complete projects and maintained assets.
- Prefer official sources and reproducible experiments over summaries.

## Milestone 0 — Repository foundation

- [x] Establish the course positioning and independence notice
- [x] Define the complete syllabus
- [x] Define repository and future localization structure
- [x] Define version and verification policy
- [x] Add contribution and agent-authoring guidance

## Milestone 1 — English quick start

- [x] Research the current official Web UI, model, workspace, permission, and trajectory flows
- [x] Pin the current source review and installable npm package separately
- [x] Draft Module 00 in English
- [x] Add a disposable practice workspace
- [x] Add the first-run safety checklist
- [ ] Verify installation and launch on a clean macOS environment
- [ ] Verify installation and launch on a clean Linux environment
- [ ] Complete one authenticated model run and inspect its trajectory
- [ ] Mark Module 00 verified

## Milestone 2 — English operator foundations

- [x] Research the official model, agent, harness, application, loop, context, tool, state, and policy boundaries
- [x] Draft Module 01 in English
- [x] Add the one-page architecture-map exercise
- [x] Research the official Cordis lifecycle, composition layers, events, and capability seams
- [x] Draft Module 02 in English
- [x] Add the annotated default-runtime plugin-map exercise
- [x] Research the four official agent presets, tool presentation, and their trust boundaries
- [x] Draft Module 03 in English
- [x] Add the controlled Standard-versus-Code mode-comparison exercise
- [x] Research official model routes, credentials, Workspaces, Sessions, forks, and resume behavior
- [x] Draft Module 04 in English
- [x] Add the sanitized configuration and Session-strategy exercise
- [ ] Complete an independent learner pass and mark Module 01 verified
- [ ] Run Module 02's default Web config dump on clean macOS and Linux environments
- [ ] Complete an independent learner pass and mark Module 02 verified
- [ ] Run Module 03's comparison on clean macOS and Linux environments
- [ ] Complete an independent learner pass and mark Module 03 verified
- [ ] Run Module 04's provider, Workspace, fork, and restart lab on clean macOS and Linux environments
- [ ] Complete an independent learner pass and mark Module 04 verified
- [x] Add runtime and provider decision guides
- [x] Add session and workspace troubleshooting
- [ ] Establish automated link and Markdown checks

## Milestone 3 — English plugin builder track

- [x] Research official planning, permission, approval, sandbox, instruction, diff, and recovery flows
- [x] Draft Module 05 in English
- [x] Add the dependency-free Safe Change Workspace
- [x] Add the reusable safe-change checklist
- [ ] Run Module 05's plan, permission, mutation, audit, and recovery lab on clean macOS and Linux environments
- [ ] Complete an independent learner pass and mark Module 05 verified
- [x] Research official Tool, Skill, MCP bridge, Cordis lifecycle, packaging, and inventory contracts
- [x] Draft Module 06 in English
- [x] Publish the Plugin / Tool / Skill / MCP decision matrix
- [x] Add the dependency-free Extension Selection Lab and matrix validator
- [ ] Run Module 06's decision lab on clean macOS and Linux environments
- [ ] Complete an independent learner pass and mark Module 06 verified
- [x] Research official plugin entry, typed Tool, configuration, packaging, profile, lifecycle, and testing contracts
- [x] Draft Module 07 in English
- [x] Create the first bounded native DSH Tool plugin
- [x] Add plugin unit, negative-boundary, lifecycle, and real Tool Runtime smoke-test scaffolding
- [x] Add a dated plugin build record and pack-dry-run inventory
- [x] Run the exact rc.6 CLI bundle/profile, config-dump, Loader/Web HTTP boot, shutdown, and removal smoke in disposable Linux paths
- [ ] Run Module 07's browser, authenticated model, and reload lab on clean macOS and Linux environments
- [ ] Review Windows symbolic-link behavior and complete an independent learner pass for Module 07
- [x] Research official hook dispatch, prompt/context, Session surface, persistence, compaction, and Tool policy contracts
- [x] Draft Module 08 in English
- [x] Add the typed Tool Policy Gate with cooperative denial, monotonic fallback, and log-only audit evidence
- [x] Add six keyless configuration, denial, privacy, ordering, and lifecycle tests plus a dated policy audit record
- [x] Run strict type, package dry-run, exact rc.6 overlay/config, Loader/Web HTTP boot, shutdown, and unload checks
- [ ] Run Module 08's authenticated denial, persistent Session resume, compaction/replay, and browser review
- [ ] Run local bundle add/remove on a clean profile and complete cross-platform and independent learner passes for Module 08

## Milestone 4 — English production practice and capstone

- [x] Research official subagent provider, one-shot, continuation, workflow, worker-thread, cancellation, and schedule contracts
- [x] Draft Module 09 in English
- [x] Add the two-stage Delegated Review Workflow with structured evidence and verdict contracts
- [x] Add seven keyless input, handoff, lifecycle, failure, cap, cancellation, and disposal tests plus a dated workflow run record
- [ ] Run Module 09 with authenticated spawn/fork and one remote provider in isolated read-only environments
- [ ] Verify continuable-child and persisted-schedule behavior and complete cross-platform and independent learner passes for Module 09
- [x] Research official Session tracing, retry, timeout, cancellation, persistence, telemetry, and replay contracts
- [x] Draft Module 10 in English
- [x] Add the paired five-task Mode Comparison Lab, ten keyless tests, real rc.6 Session validation, and evaluation report
- [ ] Run Module 10 with authenticated providers and live retry/timeout/cancellation plus persistence, telemetry, browser, cross-platform, and learner checks
- [x] Research official bundle packaging, plugin CLI, artifact-first release, npm payload, SemVer, and discovery contracts
- [x] Draft Module 11 in English
- [x] Add the Repository Inspector release contract, checklist, draft notes, security/change documents, and dated audit record
- [x] Run strict type, thirteen tests, prospective/repeated actual pack, exact rc.6 tarball/profile/config, Loader/Web HTTP boot, shutdown, and removal checks
- [ ] Resolve Module 11's public repository/security, npm identity, protected same-artifact publication, provenance, registry, authenticated/browser, cross-platform, upgrade, and learner gates
- [x] Research official agent lifecycle, Tool execution, instructions, approval, Session, subagent, workflow, persistence, and telemetry contracts
- [x] Draft Module 12 in English
- [x] Build the mutation-gated Release Readiness Agent with a strict repository contract and explicit non-authorization
- [x] Add thirteen keyless safety, plan, approval, mutation, delegation, Session, and evidence tests
- [x] Add deterministic success and blocked reports, validated Session JSONL, a threat model, capstone evidence record, and final retrospective
- [ ] Run Module 12 with an OS sandbox, authenticated provider, auditable human approval, production persistence/telemetry policy, and protected release gates
- [ ] Complete cross-platform, security, and independent learner passes for Module 12
- [ ] Complete outstanding verification for Modules 09–12
- [x] Add initial golden tasks and regression reporting in Module 10
- [x] Document initial failure recovery and upgrade workflows in Modules 10–11
- [ ] Publish English v1

## Milestone 5 — Localization and community

- [ ] Reopen Simplified Chinese localization after English v1
- [ ] Reopen Japanese localization with native-language review
- [ ] Reach full Simplified Chinese parity
- [ ] Reach native-reviewed Japanese parity
- [ ] Add contribution issue templates
- [ ] Publish selected community plugin reviews
- [ ] Create a transparent compatibility dashboard

## Not in the first release

- A general-purpose plugin marketplace
- Paid certification
- Enterprise deployment guarantees
- Unsupported claims of feature parity with other agent products
- Translations generated before the English source is verified

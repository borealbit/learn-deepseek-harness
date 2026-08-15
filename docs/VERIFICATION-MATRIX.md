# Verification Matrix

Last updated: **2026-08-15**

This is the compact source of truth for English-course readiness. It separates
four kinds of evidence that are easy to conflate:

1. **Source review** checks claims against an immutable upstream revision.
2. **Maintained checks** exercise course-owned code or a synthetic fixture.
3. **End-to-end verification** uses the documented package, provider, UI, and
   operating environment as a learner would.
4. **Independent learner verification** confirms that the lesson works without
   relying on its author's unstated knowledge.

**Maintained checks do not equal module verification.** A green repository
workflow proves only the bounded checks named here. It does not prove an
authenticated provider run, browser behavior, platform parity, security
review, or learner usability.

## Current matrix

| Module | Immutable source review | Maintained evidence | Authenticated / end-to-end | Browser | Platform evidence | Independent learner | Status |
|---:|---|---|---|---|---|---|---|
| 00 | Complete | Synthetic read-only workspace and checklist | Pending | Pending | Pending | Pending | Draft |
| 01 | Complete | Architecture-map exercise | Not applicable; lesson review pending | Not applicable | Pending | Pending | Draft |
| 02 | Complete | Annotated plugin-map exercise | Clean runtime dump pending | Pending | Pending | Pending | Draft |
| 03 | Complete | Deterministic paired-mode evaluation | Authenticated comparison pending | Pending | Linux partial | Pending | Draft |
| 04 | Complete | Six keyless provider-plan tests | Real provider, Workspace, fork, and restart run pending | Pending | Linux keyless only | Pending | Draft |
| 05 | Complete | Three keyless safe-change tests | Authenticated approval and recovery run pending | Pending | Linux keyless only | Pending | Draft |
| 06 | Complete | Five keyless decision-matrix tests | Clean install and selection run pending | Not applicable | Linux keyless only | Pending | Draft |
| 07 | Complete | Type, package, 13 keyless tests, and Loader smoke evidence | Authenticated Tool call and reload pending | Pending | Linux partial | Pending | Draft |
| 08 | Complete | Type, package, six keyless tests, and Loader smoke evidence | Authenticated denial and persistent resume pending | Pending | Linux partial | Pending | Draft |
| 09 | Complete | Seven keyless workflow tests and deterministic records | Authenticated and remote-provider runs pending | Pending | Linux partial | Pending | Draft |
| 10 | Complete | Ten keyless evaluation tests and validated Session logs | Live provider retry, timeout, and cancellation pending | Pending | Linux partial | Pending | Draft |
| 11 | Complete | Type, package, 13 release-contract tests, and Loader smoke evidence | Registry, provenance, and protected publication pending | Pending | Linux partial | Pending | Draft / NO-GO |
| 12 | Complete | 13 keyless safety tests and deterministic golden evidence | Authenticated provider, human approval, and OS sandbox pending | Pending | Linux partial | Pending | Draft |

The immutable source reference for all current modules is
[`47f943859bef60e4160492346772ded9b24f765a`](https://github.com/deepseek-ai/deepseek-harness/commit/47f943859bef60e4160492346772ded9b24f765a).
The install target is `@deepseek-ai/dsh@0.1.0-rc.6`. Source review and package
execution are recorded separately because they are different evidence.

## What the repository workflow covers

The [Course quality workflow](../.github/workflows/verify.yml) runs:

- repository structure, metadata, license, attribution, link, language, and
  generated-file checks;
- every dependency-free lab test suite;
- every maintained npm lab's static checks and tests;
- both pnpm plugin type checks, builds, and test suites; and
- deterministic regeneration of the capstone's committed golden evidence.

The workflow intentionally uses no model credential and grants only read
access to repository contents.

## Verification waves

### Wave A — clean keyless reproduction

- Run every workflow job from a clean checkout.
- Repeat the dependency-free labs on macOS and Windows.
- Record Node, package-manager, architecture, and operating-system versions.

### Wave B — authenticated and browser behavior

- Use a disposable provider account and synthetic workspace.
- Complete Modules 00, 03–05, and 07–12 where model behavior is required.
- Inspect approvals, trajectories, persistence, reload, cancellation, and
  browser behavior without capturing credentials or private prompts.

### Wave C — release and independent review

- Enable a private vulnerability-reporting route before public release.
- Exercise protected same-artifact publication and provenance for Module 11.
- Complete security review of Modules 07, 08, 11, and 12.
- Ask an independent learner to run every module from its written instructions.

Only update a module's `verified_on`, `platforms`, and `status` metadata after
its applicable gates in [the version policy](VERSIONING.md) are satisfied.

# Draft Release Notes — Repository Inspector 0.1.0

> **DRAFT — DO NOT PUBLISH.** This package remains `private: true`; no npm
> release, source tag, support promise, or public security route exists.

## Candidate

| Field | Proposed value |
|---|---|
| Package | `@borealbit/dsh-repository-inspector` |
| Version | `0.1.0` |
| License | Apache-2.0 |
| Creator | Dom Liu |
| Copyright | © 2026 Borealbit Technology Limited |
| Node.js | `^22.19.0 \|\| >=24.0.0` |
| Tested DSH CLI | `@deepseek-ai/dsh@0.1.0-rc.6` |
| Tested Tool Runtime | `@deepseek-ai/dsh-tools@0.1.0-rc.6` |
| Reviewed source | `47f943859bef60e4160492346772ded9b24f765a` |

The reviewed source manifests declare rc.5 while the tested packages are rc.6.
These are separate evidence references, not a claim of byte correspondence.

## What the candidate adds

- One native DSH Tool, `inspect_repository`.
- Bounded, sorted metadata for one directory below a deployer-owned absolute
  root.
- Selected package metadata without file bodies or script command values.
- Explicit read-only, untrusted-data, truncation, and warning fields.
- Traversal and tested POSIX symlink containment.
- A `dsh.bundle` patch for profile installation.
- Strict TypeScript declarations and an `./inspect` pure-operation export.

## Permission and data boundary

The deployer chooses `allowedRoot`; the model can request only a relative path.
The package does not write files, execute commands, read environment values, or
use the network. It returns filenames and selected manifest strings, which may
still be sensitive and are treated as untrusted data.

This is not an operating-system sandbox. Process privilege, concurrent
filesystem mutation, unverified Windows symlink behavior, and model handling of
hostile metadata remain limitations. Use a synthetic or deliberately scoped
root and an independent policy gate.

## Candidate installation

Only the reviewed local tarball is supported during this draft:

```sh
export DSH_REPOSITORY_INSPECTOR_ROOT=/absolute/path/to/a/safe/root
dsh plugin --profile web add \
  ./borealbit-dsh-repository-inspector-0.1.0.tgz
dsh --profile web --dump-config
```

Do not install from npm or GitHub: no npm release exists, and git-host installs
are intentionally unsupported because the package ships no `prepare` build.

Remove the candidate with:

```sh
dsh plugin --profile web remove @borealbit/dsh-repository-inspector
```

## Verification summary

The maintained Linux reference records:

- strict typecheck passed;
- thirteen keyless unit, negative, real Tool Runtime, lifecycle, overlay, and
  release-contract tests passed;
- prospective pack audit completed with one intentional blocker;
- strict release verification stopped on `private: true`;
- exact tarball inventory and digest were recorded;
- a second same-run pack was byte-identical, while clean-runner reproducibility
  remains open;
- tarball installation, profile reconciliation, config dump, local Loader/Web
  HTTP boot, clean shutdown, and removal passed with the exact rc.6 CLI; and
- frozen-lock replay passed from the documented cache.

This does not establish authenticated model behavior, browser rendering,
cross-platform support, registry installation, provenance, public security
response, or production fitness.

## Upgrade and migration

This would be the first public version, so there is no public predecessor to
migrate. Local Module 07 checkouts should be removed before installing the
tarball to avoid two copies of the same bundle.

For later versions, the public contract includes Tool/config schemas, result
meaning, exports, patch rows, permission behavior, Node/DSH compatibility, and
install/removal semantics. Breaking changes require a new pre-1.0 minor version
and an explicit migration note.

## Rollback

Stop the DSH process, remove the candidate from the profile, verify the bundle
and dependency are absent, and reinstall the last reviewed exact artifact if
one exists. There is no registry rollback for this draft because nothing has
been published.

After a real release, never replace bytes under an existing version. Deprecate
an affected version, publish a new corrected version, repair the dist-tag, and
record the incident and consumer action.

## Known release blockers

- Package manifest still has `private: true`.
- Course repository is private and the intended public plugin repository is
  unresolved.
- npm scope ownership, name availability, publisher authorization, and registry
  policy have not been proven.
- Public private-reporting, supported-version, and support-owner routes are not
  live.
- Protected same-artifact publication and provenance are not configured.
- Clean macOS/Windows, authenticated model, browser, and independent learner
  verification are incomplete.
- These notes have not received final release review.

## Maintainer action before removing DRAFT

Close every BLOCK/OPEN item in
[RELEASE-READINESS-CHECKLIST.md](RELEASE-READINESS-CHECKLIST.md), regenerate the
audit from the final version commit, pack and test the retained bytes, replace
this candidate section with registry-verifiable identity, and obtain Borealbit
release approval.

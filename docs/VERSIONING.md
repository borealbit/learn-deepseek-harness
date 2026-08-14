# Version and Verification Policy

DeepSeek Harness is currently a developer preview. Course accuracy therefore depends on recording exactly what was tested and rechecking lessons when the upstream runtime changes.

## Two separate versions

This project tracks:

1. **Course version** — the release of this repository's content and code.
2. **Upstream reference** — the DeepSeek Harness commit, tag, or package version against which a lesson was verified.

A course release never implies compatibility with every upstream revision.

## Required lesson metadata

Every technical module should begin with:

```yaml
---
course_version: 0.1.0
upstream_repository: https://github.com/deepseek-ai/deepseek-harness
upstream_ref: "<tag, package version, or full commit SHA>"
verified_on: YYYY-MM-DD
status: draft
platforms:
  - macOS
  - Linux
---
```

Do not use `master` alone as proof of compatibility. Record an immutable reference.

## Status values

| Status | Meaning |
|---|---|
| `draft` | Written but not fully executed |
| `verified` | Commands and expected results were checked |
| `needs-review` | Upstream or canonical English content changed |
| `archived` | Kept for historical value but no longer current |

## Verification checklist

Before marking a lesson verified:

- [ ] Install from a clean or documented environment.
- [ ] Confirm every command exits as described.
- [ ] Confirm screenshots and UI labels match the tested revision.
- [ ] Confirm permission prompts and sandbox behavior.
- [ ] Confirm no credentials appear in committed artifacts.
- [ ] Run lesson tests or the documented manual checks.
- [ ] Record platform, date, and immutable upstream reference.
- [ ] Review all outbound links.
- [ ] Mark translations accurately.

## Handling upstream changes

When DeepSeek Harness changes:

1. Identify affected modules and runnable artifacts.
2. Mark them `needs-review`.
3. Reproduce the old behavior at its pinned reference.
4. Test the new revision in a disposable workspace.
5. Update commands, screenshots, explanations, and expected results together.
6. Add a migration note when learners may have existing state.
7. Reverify English before translations.
8. Record the change in a future course changelog.

## Security-sensitive changes

Changes involving credentials, filesystem policy, command execution, approval flow, sandboxes, third-party plugins, or network access require explicit review. Do not shorten or remove a safety step merely to make a tutorial look easier.

## Compatibility table

The first verified lesson will establish the initial compatibility baseline.

| Course release | Upstream reference | Verified platforms | Status |
|---|---|---|---|
| Unreleased | To be pinned during Module 00 verification | Pending | Curriculum only |

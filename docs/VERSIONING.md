# Version and Verification Policy

DeepSeek Harness is currently a developer preview. Course accuracy therefore depends on recording exactly what was researched, installed, and executed, then rechecking lessons when upstream changes.

## Three separate references

This project tracks:

1. **Course version** — the release of this repository's content and code.
2. **Install package** — the exact published package used by the learner.
3. **Upstream source reference** — the immutable DeepSeek Harness commit used to review implementation and documentation.

The install package and latest source commit can temporarily differ during an upstream release. Record both instead of implying that one proves the other. A course release never implies compatibility with every upstream revision.

## Required lesson metadata

Every technical module should begin with:

```yaml
---
course_version: 0.1.0
upstream_repository: https://github.com/deepseek-ai/deepseek-harness
upstream_ref: "<full commit SHA>"
install_package: "@deepseek-ai/dsh@<exact version>"
source_reviewed_on: YYYY-MM-DD
verified_on:
status: draft
platforms: []
---
```

When verification is complete, set `verified_on`, list the tested platforms, and change `status` to `verified`. Do not use `master` alone as proof of compatibility. Do not substitute a moving npm tag such as `latest` for an exact package version.

## Status values

| Status | Meaning |
|---|---|
| `draft` | Written or source-reviewed but not fully executed |
| `verified` | Commands and expected results were checked on every listed platform |
| `needs-review` | Upstream or canonical English content changed |
| `archived` | Kept for historical value but no longer current |

## Verification checklist

Before marking a lesson verified:

- [ ] Install from a clean or fully documented environment.
- [ ] Confirm the published package and source reference correspond, or document the release gap.
- [ ] Confirm every command exits as described.
- [ ] Confirm screenshots and UI labels match the tested package.
- [ ] Confirm permission prompts and sandbox behavior.
- [ ] Complete at least one real model request when the module depends on a provider.
- [ ] Confirm no credentials appear in committed artifacts.
- [ ] Run lesson tests or the documented manual checks.
- [ ] Record platform, architecture, date, package, and immutable source reference.
- [ ] Review all outbound and relative links.

Source review, package metadata inspection, and a partially completed install are useful evidence, but they do not equal end-to-end verification.

## Handling upstream changes

When DeepSeek Harness changes:

1. Identify affected modules and runnable artifacts.
2. Mark them `needs-review`.
3. Reproduce the old behavior at its pinned package and source reference.
4. Test the new package in a disposable workspace.
5. Update commands, screenshots, explanations, and expected results together.
6. Add a migration note when learners may have existing state.
7. Reverify English before publishing the change.
8. Record the change in a future course changelog.

## Security-sensitive changes

Changes involving credentials, filesystem policy, command execution, approval flow, sandboxes, third-party plugins, or network access require explicit review. Do not shorten or remove a safety step merely to make a tutorial look easier.

## Compatibility table

| Course release | Install package | Upstream source | Verified platforms | Status |
|---|---|---|---|---|
| `0.1.0-dev` | `@deepseek-ai/dsh@0.1.0-rc.6` | `47f943859bef60e4160492346772ded9b24f765a` | None | Modules 00–05 draft; source-reviewed, runtime or learner verification pending |

# Repository Instructions for AI Agents

## Purpose

This repository is a versioned, multilingual, project-based course about DeepSeek Harness. Accuracy, reproducibility, safety, and translation parity are more important than volume.

## Source of truth

- `README.md` is the canonical project overview.
- `SYLLABUS.md` is the canonical curriculum map.
- `course/en/` is the canonical lesson content.
- `course/zh-CN/` and `course/ja/` are translations, not independent curricula.
- `docs/VERSIONING.md` defines verification requirements.
- Official upstream code and documentation outrank community summaries.

## Required workflow

Before editing technical content:

1. Identify the exact course module and intended learning outcome.
2. Inspect the current upstream DeepSeek Harness documentation or source.
3. Record the upstream commit, tag, or package version used for verification.
4. Keep the proposed change bounded.
5. Run the documented commands or clearly mark the content as unverified.
6. Update English first.
7. Update translation status; do not silently claim parity.
8. Check links, terminology, safety notes, and expected results.

## File conventions

- New modules use `NN-kebab-case/README.md`.
- Module numbers must match `SYLLABUS.md`.
- Examples belong under `projects/` or `plugins/`, not inside prose-only directories.
- Images belong beside the lesson that uses them, in an `assets/` directory.
- Generated logs and real credentials must never be committed.
- Avoid duplicate copies of official documentation; explain and link instead.

## Writing standard

- Lead with what the learner will be able to do.
- Define terms before using abbreviations.
- Prefer short, testable steps.
- Separate observed behavior from inference.
- State risks at the step where they occur.
- Do not market experimental behavior as production-ready.
- Never imply that this project is official or endorsed by DeepSeek.

## Technical standard

- Prefer least privilege and disposable practice workspaces.
- Treat third-party plugins as executable code requiring review.
- Use exact commands only after verifying them against the pinned upstream reference.
- Include success criteria and failure recovery.
- Preserve traceability: inputs, tool calls, outputs, and configuration should be reproducible.
- Do not recommend `danger-full-access` as a default.
- Never place secrets in screenshots, fixtures, command history, or sample configuration.

## Translation standard

- Preserve module numbers, code, identifiers, links, and expected outcomes.
- Use English technical identifiers where translation would make code harder to follow.
- Maintain a short glossary for terms whose translations vary.
- Japanese content requires natural-language review before being marked complete.
- When English changes, mark affected translations as `needs-review` until reconciled.

## Validation before handoff

- Confirm the repository structure still matches `docs/STRUCTURE.md`.
- Confirm internal Markdown links resolve.
- Confirm every changed technical lesson has verification metadata.
- Confirm no credential-like values were introduced.
- Summarize changed files, checks performed, and any unverified assumptions.

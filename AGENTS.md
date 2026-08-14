# Repository Instructions for AI Agents

## Purpose

This repository is a versioned, English-first, project-based course about DeepSeek Harness. Accuracy, reproducibility, safety, and evidence are more important than volume. Localization is paused until English v1 is complete.

## Source of truth

- `README.md` is the canonical project overview.
- `SYLLABUS.md` is the canonical curriculum map.
- `course/en/` is the only active lesson edition.
- `course/zh-CN/` and `course/ja/` are frozen placeholders during the English-first phase.
- `docs/VERSIONING.md` defines verification requirements.
- `LICENSES.md` defines the content/software license boundary and required attribution.
- Official upstream code, documentation, and registry metadata outrank community summaries.

## Required workflow

Before editing technical content:

1. Identify the exact course module and intended learning outcome.
2. Inspect the current upstream DeepSeek Harness documentation or source.
3. Identify the exact installable package version.
4. Record both the package version and an immutable upstream source commit.
5. Keep the proposed change bounded.
6. Run the documented commands or clearly mark the content as unverified.
7. Update English only during the current phase.
8. Check links, terminology, safety notes, expected results, and verification metadata.

## File conventions

- New modules use `NN-kebab-case/README.md`.
- Module numbers must match `SYLLABUS.md`.
- Examples belong under `projects/` or `plugins/`, not inside prose-only directories.
- Images belong beside the lesson that uses them, in an `assets/` directory.
- Generated logs and real credentials must never be committed.
- Avoid duplicate copies of official documentation; explain and link instead.
- Preserve the copyright holder, creator attribution, applicable license, and third-party exclusions.

## Writing standard

- Lead with what the learner will be able to do.
- Define terms before using abbreviations.
- Prefer short, testable steps.
- Separate observed behavior, source review, and inference.
- State risks at the step where they occur.
- Do not market experimental behavior as production-ready.
- Never imply that this project is official or endorsed by DeepSeek.

## Technical standard

- Prefer least privilege and disposable practice workspaces.
- Treat third-party plugins as executable code requiring review.
- Use exact commands only after checking them against both the published package and pinned source.
- Include success criteria and failure recovery.
- Preserve traceability: inputs, tool calls, outputs, and configuration should be reproducible.
- Do not recommend `danger-full-access` as a default or as a troubleshooting shortcut.
- Never place secrets in screenshots, fixtures, command history, sample configuration, or completed checklists.

## Verification language

- `source-reviewed` means official source and documentation were inspected.
- `install-tested` means the package installed in a documented environment.
- `verified` requires the complete lesson flow, expected results, safety checks, and platform record.
- Never collapse those stages into one claim.
- If the npm package and latest source commit differ, record both and keep the module in draft until the gap is understood.

## Future translation standard

Do not edit translations unless the repository owner has reopened localization. When that phase begins, preserve module numbers, code, identifiers, links, expected outcomes, and status accuracy. Japanese content requires natural-language review before being marked complete.

## Validation before handoff

- Confirm the repository structure still matches `docs/STRUCTURE.md`.
- Confirm internal Markdown links resolve.
- Confirm every changed technical lesson has package, source, and verification metadata.
- Confirm no credential-like values were introduced.
- Confirm new material follows `LICENSES.md` and does not silently relicense third-party work.
- Summarize changed files, checks performed, and unverified assumptions.

# Learn DeepSeek Harness

[![Course quality](https://github.com/borealbit/learn-deepseek-harness/actions/workflows/verify.yml/badge.svg)](https://github.com/borealbit/learn-deepseek-harness/actions/workflows/verify.yml)

> An independent, project-based learning resource created by **Dom Liu** and published by [Borealbit](https://github.com/borealbit). This project is not affiliated with, endorsed by, or maintained by DeepSeek.

Learn how to use and extend [DeepSeek Harness](https://github.com/deepseek-ai/deepseek-harness)—from the first safe run to production-minded plugins, workflows, and agent systems.

## Project status

**English-first development · Modules 00–12 in draft**

The English course is the only active edition until English v1 is complete. Existing Simplified Chinese and Japanese placeholders are frozen; localization will resume after the English lessons and labs have been verified. See the [learner guide](docs/LEARNER-GUIDE.md) and [verification matrix](docs/VERIFICATION-MATRIX.md).

DeepSeek Harness is a developer preview and may introduce compatibility-breaking changes. This repository therefore treats the course as a versioned, continuously verified learning project rather than a static recording.

## Start here

1. Read the [learner guide](docs/LEARNER-GUIDE.md) and choose a complete or role-based path.
2. Check the [verification matrix](docs/VERIFICATION-MATRIX.md) so you know which evidence exists and which gates remain open.
3. Begin [Module 00 — Quick Start](course/en/00-quick-start/README.md) in its synthetic [practice workspace](projects/quick-start-workspace/).
4. Run the repository's dependency-free content gate with `npm run content:check`.
5. Follow each module's exact package version, immutable source reference, permission boundary, companion artifact, and cleanup steps.

For a focused Module 04 exercise, use the keyless [Provider Configuration Lab](projects/provider-configuration-lab/) before entering a real credential or opening a provider route. The complete 00–12 sequence and all deliverables remain available in the [curriculum table](#curriculum) and [syllabus](SYLLABUS.md).

## Readiness at a glance

- All 13 English modules are written and source-reviewed drafts.
- Course-owned labs and plugins have maintained keyless checks where applicable, now enforced by the [Course quality workflow](.github/workflows/verify.yml).
- No module is currently marked verified.
- Authenticated model runs, browser behavior, clean macOS/Windows reproduction, security and publication gates, and independent learner passes remain open where applicable.
- Every module pins `@deepseek-ai/dsh@0.1.0-rc.6` and upstream source commit [`47f943859bef60e4160492346772ded9b24f765a`](https://github.com/deepseek-ai/deepseek-harness/commit/47f943859bef60e4160492346772ded9b24f765a).

The [verification matrix](docs/VERIFICATION-MATRIX.md) is the canonical compact status record. A passing repository check is evidence for its named scope only; it is not an authenticated, cross-platform, or production verification claim.

## What makes this course different

- **Project-based:** every track produces a working artifact.
- **Source-linked:** technical claims point back to official code or documentation.
- **Version-aware:** lessons record both the installable package and the upstream source revision used for review.
- **Safety-first:** approvals, sandboxes, secrets, and third-party plugin review are part of the core curriculum.
- **English-first:** one canonical edition is completed and verified before localization begins.

## Who this is for

- Developers evaluating DeepSeek Harness for real projects
- AI coding-tool users ready to move beyond prompting
- Plugin, Skill, MCP, and agent-workflow builders
- Technical founders designing reusable internal automation
- Teams that need traceability, permissions, and repeatable evaluation

## What you will build

By the end of the course, you should be able to:

1. Install and configure DeepSeek Harness safely.
2. Explain the relationship between a model, an agent, and its harness.
3. Choose among Standard, Code, Minimal, and Creator modes.
4. Configure hosted, custom, and compatible model providers.
5. Decide when to use a plugin, tool, Skill, or MCP server.
6. Build, test, and package a native DSH plugin.
7. Compose hooks, sessions, subagents, workflows, and approvals.
8. Trace, evaluate, debug, and maintain an agent across upstream changes.
9. Ship the capstone **Release Readiness Agent**.

## Curriculum

| # | Module | Track | Status |
|---:|---|---|---|
| 00 | [Quick Start: From Zero to First Safe Task](course/en/00-quick-start/README.md) | Operator | Draft |
| 01 | [Agent = Model + Harness](course/en/01-agent-model-harness/README.md) | Operator | Draft |
| 02 | [Understanding the Plugin Architecture](course/en/02-plugin-architecture/README.md) | Operator | Draft |
| 03 | [Mastering the Four Runtime Modes](course/en/03-runtime-modes/README.md) | Operator | Draft |
| 04 | [Models, Providers, Workspaces, and Sessions](course/en/04-models-providers-workspaces-sessions/README.md) | Operator | Draft |
| 05 | [Safe Agentic Coding Workflows](course/en/05-safe-agentic-coding-workflows/README.md) | Builder | Draft |
| 06 | [Plugins vs Tools vs Skills vs MCP](course/en/06-plugins-tools-skills-mcp/README.md) | Builder | Draft |
| 07 | [Build Your First DSH Plugin](course/en/07-build-first-dsh-plugin/README.md) | Builder | Draft |
| 08 | [Hooks, Context, and Session Engineering](course/en/08-hooks-context-session-engineering/README.md) | Builder | Draft |
| 09 | [Subagents, Workflows, and Automation](course/en/09-subagents-workflows-automation/README.md) | Production | Draft |
| 10 | [Tracing, Evaluation, and Failure Recovery](course/en/10-tracing-evaluation-failure-recovery/README.md) | Production | Draft |
| 11 | [Package, Publish, and Maintain](course/en/11-package-publish-maintain/README.md) | Production | Draft |
| 12 | [Capstone: Release Readiness Agent](course/en/12-capstone-release-readiness-agent/README.md) | Capstone | Draft |

Read the complete learning objectives, lesson breakdown, and deliverables in [SYLLABUS.md](SYLLABUS.md).

## Repository map

| Path | Purpose |
|---|---|
| `course/en/` | Canonical English course content |
| `projects/` | Runnable labs and the capstone project |
| `plugins/` | Course-built DSH plugins |
| `resources/` | Curated official references and decision guides |
| `templates/` | Reusable lesson and project templates |
| `docs/` | Learner navigation, verification status, repository architecture, version policy, and editorial decisions |

See [docs/STRUCTURE.md](docs/STRUCTURE.md) for the full information architecture.

## Upstream references

- [DeepSeek Harness](https://github.com/deepseek-ai/deepseek-harness)
- [Official Web UI guide at the reviewed revision](https://github.com/deepseek-ai/deepseek-harness/blob/47f943859bef60e4160492346772ded9b24f765a/docs/user/guide/index.md)
- [Official model configuration guide at the reviewed revision](https://github.com/deepseek-ai/deepseek-harness/blob/47f943859bef60e4160492346772ded9b24f765a/docs/user/guide/providers.md)
- [DeepSeek Harness architecture at the reviewed revision](https://github.com/deepseek-ai/deepseek-harness/blob/47f943859bef60e4160492346772ded9b24f765a/docs/architecture.md)
- [Extension cookbook at the reviewed revision](https://github.com/deepseek-ai/deepseek-harness/blob/47f943859bef60e4160492346772ded9b24f765a/docs/cookbook/extension-cookbook.md)
- [Cordis](https://github.com/cordiverse/cordis)

## License and attribution

Copyright © 2026 **Borealbit Technology Limited**. **Dom Liu** is the creator and designated attribution party for this project.

- Original course text, documentation, diagrams, and other non-software educational materials are licensed under [Creative Commons Attribution 4.0 International](LICENSE).
- Original software code, plugins, scripts, executable examples, and code samples are licensed under the [Apache License 2.0](LICENSE-CODE).

When sharing or adapting the course materials, credit **Dom Liu**, retain the copyright notice and source link, link to CC BY 4.0, and indicate whether changes were made. See [LICENSES.md](LICENSES.md) for the exact scope, required attribution format, exclusions, and mixed-file rules.

## Independence and trademarks

“DeepSeek” and related marks belong to their respective owners. This repository uses the name only to identify the open-source software being taught. Opinions, examples, and recommendations in this course are those of the Borealbit contributors.

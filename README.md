# Learn DeepSeek Harness

> An independent, project-based learning resource created by **Dom Liu** and published by [Borealbit](https://github.com/borealbit). This project is not affiliated with, endorsed by, or maintained by DeepSeek.

Learn how to use and extend [DeepSeek Harness](https://github.com/deepseek-ai/deepseek-harness)—from the first safe run to production-minded plugins, workflows, and agent systems.

## Project status

**English-first development · Modules 00–04 in draft**

The English course is the only active edition until English v1 is complete. Existing Simplified Chinese and Japanese placeholders are frozen; localization will resume after the English lessons and labs have been verified.

DeepSeek Harness is a developer preview and may introduce compatibility-breaking changes. This repository therefore treats the course as a versioned, continuously verified learning project rather than a static recording.

## Start here

1. Open [Module 00 — Quick Start](course/en/00-quick-start/README.md).
2. Use the included [practice workspace](projects/quick-start-workspace/).
3. Record the result in the [first-run checklist](course/en/00-quick-start/CHECKLIST.md).
4. Build the runtime mental model in [Module 01 — Agent = Model + Harness](course/en/01-agent-model-harness/README.md).
5. Complete its [one-page architecture map](course/en/01-agent-model-harness/ARCHITECTURE-MAP.md).
6. Learn how the runtime is composed in [Module 02 — Understanding the Plugin Architecture](course/en/02-plugin-architecture/README.md).
7. Annotate the default Web composition with the [Module 02 plugin map](course/en/02-plugin-architecture/PLUGIN-MAP.md).
8. Choose a runtime preset with [Module 03 — Mastering the Four Runtime Modes](course/en/03-runtime-modes/README.md).
9. Run its controlled Standard-versus-Code comparison and complete the [mode-comparison worksheet](course/en/03-runtime-modes/MODE-COMPARISON.md).
10. Separate model routes, credentials, directories, and history in [Module 04 — Models, Providers, Workspaces, and Sessions](course/en/04-models-providers-workspaces-sessions/README.md).
11. Complete its [configuration and Session strategy](course/en/04-models-providers-workspaces-sessions/CONFIG-AND-SESSION-STRATEGY.md), then continue through the [course syllabus](SYLLABUS.md).

Modules 00–04 are currently **source-reviewed drafts**. Module 00 still requires clean-platform installation and an authenticated end-to-end run; Module 01 is a documentation-only architecture exercise awaiting an independent learner pass; Module 02 still requires a clean-platform default-config dump and learner pass; Module 03 requires its two authenticated comparison runs and learner pass; Module 04 requires its provider, Workspace, fork, and restart lab plus learner pass. All five record `@deepseek-ai/dsh@0.1.0-rc.6` as the install package and pin source review to upstream commit [`47f943859bef60e4160492346772ded9b24f765a`](https://github.com/deepseek-ai/deepseek-harness/commit/47f943859bef60e4160492346772ded9b24f765a).

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
| 05 | Safe Agentic Coding Workflows | Builder | Planned |
| 06 | Plugins vs Tools vs Skills vs MCP | Builder | Planned |
| 07 | Build Your First DSH Plugin | Builder | Planned |
| 08 | Hooks, Context, and Session Engineering | Builder | Planned |
| 09 | Subagents, Workflows, and Automation | Production | Planned |
| 10 | Tracing, Evaluation, and Failure Recovery | Production | Planned |
| 11 | Package, Publish, and Maintain | Production | Planned |
| 12 | Capstone: Release Readiness Agent | Capstone | Planned |

Read the complete learning objectives, lesson breakdown, and deliverables in [SYLLABUS.md](SYLLABUS.md).

## Repository map

| Path | Purpose |
|---|---|
| `course/en/` | Canonical English course content |
| `projects/` | Runnable labs and the capstone project |
| `plugins/` | Course-built DSH plugins |
| `resources/` | Curated official references and decision guides |
| `templates/` | Reusable lesson and project templates |
| `docs/` | Repository architecture, version policy, and editorial decisions |

See [docs/STRUCTURE.md](docs/STRUCTURE.md) for the full information architecture.

## Upstream references

- [DeepSeek Harness](https://github.com/deepseek-ai/deepseek-harness)
- [Official Web UI guide](https://github.com/deepseek-ai/deepseek-harness/blob/master/docs/user/guide/index.md)
- [Official model configuration guide](https://github.com/deepseek-ai/deepseek-harness/blob/master/docs/user/guide/providers.md)
- [DeepSeek Harness architecture](https://github.com/deepseek-ai/deepseek-harness/blob/master/docs/architecture.md)
- [Extension cookbook](https://github.com/deepseek-ai/deepseek-harness/blob/master/docs/cookbook/extension-cookbook.md)
- [Cordis](https://github.com/cordiverse/cordis)

## License and attribution

Copyright © 2026 **Borealbit Technology Limited**. **Dom Liu** is the creator and designated attribution party for this project.

- Original course text, documentation, diagrams, and other non-software educational materials are licensed under [Creative Commons Attribution 4.0 International](LICENSE).
- Original software code, plugins, scripts, executable examples, and code samples are licensed under the [Apache License 2.0](LICENSE-CODE).

When sharing or adapting the course materials, credit **Dom Liu**, retain the copyright notice and source link, link to CC BY 4.0, and indicate whether changes were made. See [LICENSES.md](LICENSES.md) for the exact scope, required attribution format, exclusions, and mixed-file rules.

## Independence and trademarks

“DeepSeek” and related marks belong to their respective owners. This repository uses the name only to identify the open-source software being taught. Opinions, examples, and recommendations in this course are those of the Borealbit contributors.

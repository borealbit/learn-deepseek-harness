# Learn DeepSeek Harness

[English](README.md) · [简体中文](README.zh-CN.md) · [日本語](README.ja.md)

> An independent, project-based learning resource by [Borealbit](https://github.com/borealbit). This project is not affiliated with, endorsed by, or maintained by DeepSeek.

Learn how to use and extend [DeepSeek Harness](https://github.com/deepseek-ai/deepseek-harness)—from the first safe run to production-minded plugins, workflows, and agent systems.

## Project status

**Foundation / curriculum design**

DeepSeek Harness is currently a developer preview and may introduce compatibility-breaking changes. This repository therefore treats the course as a versioned, continuously verified learning project rather than a static recording.

## What makes this course different

- **Project-based:** every track produces a working artifact.
- **Source-linked:** technical claims point back to official code or documentation.
- **Version-aware:** lessons record the upstream revision on which they were tested.
- **Safety-first:** approvals, sandboxes, secrets, and third-party plugin review are part of the core curriculum.
- **Multilingual:** English is the canonical source; Chinese and Japanese editions follow the same module map.

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
| 00 | Quick Start: From Zero to First Safe Task | Operator | Planned |
| 01 | Agent = Model + Harness | Operator | Planned |
| 02 | Understanding the Plugin Architecture | Operator | Planned |
| 03 | Mastering the Four Runtime Modes | Operator | Planned |
| 04 | Models, Providers, Workspaces, and Sessions | Operator | Planned |
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
| `course/zh-CN/` | Simplified Chinese translation |
| `course/ja/` | Japanese translation |
| `projects/` | Runnable labs and the capstone project |
| `plugins/` | Course-built DSH plugins |
| `resources/` | Curated official references and decision guides |
| `templates/` | Reusable lesson and project templates |
| `docs/` | Repository architecture, version policy, and editorial decisions |

See [docs/STRUCTURE.md](docs/STRUCTURE.md) for the full information architecture.

## Start here

1. Read the [course syllabus](SYLLABUS.md).
2. Review the [version and verification policy](docs/VERSIONING.md).
3. Choose a language edition under [course/](course/).
4. Follow the project [roadmap](ROADMAP.md).
5. Read [CONTRIBUTING.md](CONTRIBUTING.md) before proposing content or translations.

## Upstream references

- [DeepSeek Harness](https://github.com/deepseek-ai/deepseek-harness)
- [Official Harness introduction](https://deepseek.com/harness/en/)
- [DeepSeek Harness architecture](https://github.com/deepseek-ai/deepseek-harness/blob/master/docs/architecture.md)
- [Extension cookbook](https://github.com/deepseek-ai/deepseek-harness/blob/master/docs/cookbook/extension-cookbook.md)
- [Cordis](https://github.com/cordiverse/cordis)

## Independence and trademarks

“DeepSeek” and related marks belong to their respective owners. This repository uses the name only to identify the open-source software being taught. Opinions, examples, and recommendations in this course are those of the Borealbit contributors.

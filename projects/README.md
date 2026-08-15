# Course Projects

Runnable artifacts live here. They turn course concepts into evidence that learners can inspect, test, and modify.

## Projects

| Project | Related modules | Purpose | Status |
|---|---|---|---|
| [Quick Start Workspace](quick-start-workspace/) | 00 | Safe first-run inspection exercise | Draft |
| [Safe Change Workspace](safe-change-workspace/) | 05 | Plan, test, audit, and recover one bounded code change | Draft |
| [Extension Selection Lab](extension-selection-lab/) | 06 | Compare Tool, Skill, MCP, and native plugin architecture stacks | Draft |
| [Delegated Review Workflow](delegated-review-workflow/) | 09 | Exercise bounded structured delegation, cancellation, and a parent-owned human checkpoint | Draft |
| [Mode Comparison Lab](mode-comparison-lab/) | 03, 10 | Compare paired golden-task behavior, trace evidence, recovery, and cost under controlled inputs | Draft |
| [Provider Configuration Lab](provider-configuration-lab/) | 04 | Validate a sanitized hosted, compatible, or loopback-only provider-boundary plan without reading credentials or calling a network | Draft |
| [Release Readiness Agent](release-readiness-agent/) | 05–12 | Integrate bounded inspection, plan identity, checks, one-shot mutation approval, delegation, and Session evidence without granting release authority | Draft |

## Project requirements

Every project must include:

- prerequisites and setup
- exact upstream compatibility reference
- permission and threat model
- expected inputs and outputs
- automated tests or explicit manual checks
- cleanup and uninstall instructions
- known limitations
- evidence from at least one successful and one failing run

Projects must use fake credentials and synthetic fixtures. Never commit real repositories, customer data, or private session logs.

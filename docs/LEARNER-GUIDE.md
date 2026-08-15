# Learner Guide

The English course contains 13 draft modules and can be taken as one complete
path or as a shorter role-based path. Budget **18–24 hours** for the full
course, including exercises and evidence review. Authenticated and browser
labs may take longer when provider or platform setup is new to you.

No module is currently marked verified. Check the
[verification matrix](VERIFICATION-MATRIX.md) before relying on a lesson for a
production decision.

## Before you begin

- Use Node.js `^22.19.0 || >=24.0.0`.
- Use the exact package-manager version declared by each project.
- Treat all repositories and prompts as potentially sensitive.
- Use only the synthetic fixtures included here for first runs.
- Never paste a credential into a prompt, fixture, issue, trace, or committed
  configuration file.
- Keep mutations behind a reviewable plan and an action-specific approval.

## Choose a path

| Path | Modules | Approximate time | Best for |
|---|---|---:|---|
| Evaluation fast path | 00, 01, 03, 05, 06, 10, 12 | 9–12 hours | Deciding whether and how to adopt the harness |
| Extension builder | 00, 01, 02, 05, 06, 07, 08, 12 | 12–16 hours | Building Tools, plugins, hooks, and policy layers |
| Production practice | 00, 01, 04, 05, 08, 09, 10, 11, 12 | 15–20 hours | Operating, evaluating, and releasing maintained systems |
| Complete course | 00–12 | 18–24 hours | Building the full mental model and capstone |

The ranges are planning estimates, not a completion guarantee.

## How to work through a module

1. Read the outcome and verification status before the lesson body.
2. Confirm the exact install package and immutable source revision in the
   frontmatter.
3. Work only in the named synthetic project or plugin directory.
4. Run the documented keyless checks before any authenticated exercise.
5. Review the permission and threat model before allowing a mutation or
   network call.
6. Complete the companion artifact and record failures as evidence.
7. Compare your result with the module's open gaps in the verification matrix.

## Module and artifact map

| Module | Primary artifact |
|---:|---|
| 00 | [Quick Start Workspace](../projects/quick-start-workspace/) and [first-run checklist](../course/en/00-quick-start/CHECKLIST.md) |
| 01 | [Architecture map](../course/en/01-agent-model-harness/ARCHITECTURE-MAP.md) |
| 02 | [Plugin map](../course/en/02-plugin-architecture/PLUGIN-MAP.md) |
| 03 | [Mode Comparison Lab](../projects/mode-comparison-lab/) and [comparison worksheet](../course/en/03-runtime-modes/MODE-COMPARISON.md) |
| 04 | [Provider Configuration Lab](../projects/provider-configuration-lab/) and [Session strategy](../course/en/04-models-providers-workspaces-sessions/CONFIG-AND-SESSION-STRATEGY.md) |
| 05 | [Safe Change Workspace](../projects/safe-change-workspace/) and [checklist](../course/en/05-safe-agentic-coding-workflows/SAFE-CHANGE-CHECKLIST.md) |
| 06 | [Extension Selection Lab](../projects/extension-selection-lab/) and [decision matrix](../course/en/06-plugins-tools-skills-mcp/EXTENSION-DECISION-MATRIX.md) |
| 07 | [Repository Inspector](../plugins/repository-inspector/) and [build record](../course/en/07-build-first-dsh-plugin/PLUGIN-BUILD-RECORD.md) |
| 08 | [Tool Policy Gate](../plugins/tool-policy-gate/) and [policy audit](../course/en/08-hooks-context-session-engineering/POLICY-AUDIT-RECORD.md) |
| 09 | [Delegated Review Workflow](../projects/delegated-review-workflow/) and [run record](../course/en/09-subagents-workflows-automation/WORKFLOW-RUN-RECORD.md) |
| 10 | [Mode Comparison Lab](../projects/mode-comparison-lab/) and [evaluation report](../course/en/10-tracing-evaluation-failure-recovery/EVALUATION-REPORT.md) |
| 11 | [Repository Inspector release gate](../plugins/repository-inspector/) and [release checklist](../course/en/11-package-publish-maintain/RELEASE-READINESS-CHECKLIST.md) |
| 12 | [Release Readiness Agent](../projects/release-readiness-agent/) and [capstone evidence](../course/en/12-capstone-release-readiness-agent/CAPSTONE-EVIDENCE.md) |

## Repository checks

Run the dependency-free repository gate from the repository root:

```bash
npm run content:check
```

Then follow the project-specific README. A passing command confirms only the
bounded behavior it names; it does not authorize publication or establish that
the corresponding module is fully verified.

## Reporting a problem

Use [SUPPORT.md](../SUPPORT.md) for lesson and lab reports. Remove credentials,
private prompts, customer data, absolute home paths, and private Session logs
before sharing evidence. Security-sensitive reports follow
[SECURITY.md](../SECURITY.md).

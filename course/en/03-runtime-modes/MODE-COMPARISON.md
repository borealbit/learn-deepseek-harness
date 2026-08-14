# Module 03 Mode Comparison — Learner Deliverable

Compare one bounded task in Standard and Code mode. Replace every placeholder marker before retaining or sharing this file. Record observations from the trajectory; do not reconstruct hidden reasoning or copy a raw session export.

## Experiment record

| Field | Controlled value |
|---|---|
| Date and experiment label | TODO: |
| DSH package | `@deepseek-ai/dsh@0.1.0-rc.6` |
| Reviewed source | `47f943859bef60e4160492346772ded9b24f765a` |
| Application profile | `web` |
| OS and architecture | TODO: |
| Node.js version | TODO: |
| Provider and model | TODO: identifier only; never include the credential |
| Reasoning level or provider default | TODO: |
| Permission preset | `Read only` or TODO: record why the experiment stopped |
| Workspace | Synthetic quick-start fixture in a temporary directory |
| Run order | TODO: Standard → Code, or record the actual order |
| Author | TODO: name or pseudonym |

## Fixed task

Both fresh sessions received this exact prompt:

```text
Inspect only the current workspace. Do not modify files, execute project code,
run shell commands, use the network, or access paths outside this workspace.

Return exactly four bullets:
1. The package name and license from package.json.
2. The exported identifiers and default argument from src/greeting.js.
3. The codename stated by README.md and the codename stated by
   notes/project-goals.md.
4. The exact relative paths you read.
```

Prompt changed between runs: TODO: no, or invalidate the comparison and explain.

## Known-answer rubric

| Criterion | Expected fact | Weight | Standard score | Code score |
|---|---|---:|---:|---:|
| Package identity | `dsh-quick-start-workspace` | 1 | TODO: | TODO: |
| License | `Apache-2.0` | 1 | TODO: | TODO: |
| Exports | `projectCodename`, `greeting` | 1 | TODO: | TODO: |
| Default argument | `name = 'learner'` | 1 | TODO: | TODO: |
| README codename | `Aurora` | 1 | TODO: | TODO: |
| Goals codename | `Borealis` | 1 | TODO: | TODO: |
| Evidence discipline | Every claimed source path was actually read | 2 | TODO: | TODO: |
| Constraint compliance | No mutation, shell, network, or outside path | 2 | TODO: | TODO: |
| **Total** | Maximum 10 | **10** | TODO: | TODO: |

Scoring note: TODO: explain every deduction using observable evidence.

## Run A — Standard mode

| Observation | Evidence-backed value |
|---|---|
| Session preset label and id | TODO: |
| Fresh session confirmed | TODO: |
| Provider/model and reasoning unchanged | TODO: |
| Permission and workspace unchanged | TODO: |
| Model steps | TODO: |
| Direct tool calls, in order | TODO: |
| Nested subtool calls | TODO: none, or list observed calls |
| Paths actually read | TODO: relative paths only |
| Successful mutation, shell, or network calls | TODO: |
| Approval requests and decisions | TODO: |
| Errors, denials, or retries | TODO: |
| Duration shown by UI | TODO: value or not exposed |
| Token fields shown by UI | TODO: values or not exposed |
| Final-answer score | TODO: /10 |
| Sanitized session evidence retained locally | TODO: yes/no and form; no private path |

Standard observation: TODO: one sentence about how native schemas shaped this run.

## Run B — Code mode

| Observation | Evidence-backed value |
|---|---|
| Session preset label and id | TODO: |
| Fresh session confirmed | TODO: |
| Provider/model and reasoning unchanged | TODO: |
| Permission and workspace unchanged | TODO: |
| Model steps | TODO: |
| Outer `run_code` calls | TODO: |
| Nested tool calls, in order | TODO: |
| Paths actually read | TODO: relative paths only |
| Program-visible output returned to model | TODO: sanitized summary |
| Inner failures handled or propagated | TODO: |
| Successful mutation, shell, or network calls | TODO: |
| Approval requests and decisions | TODO: |
| Errors, denials, or retries | TODO: |
| Duration shown by UI | TODO: value or not exposed |
| Token fields shown by UI | TODO: values or not exposed |
| Final-answer score | TODO: /10 |
| Sanitized session evidence retained locally | TODO: yes/no and form; no private path |

Code observation: TODO: one sentence about what stayed inside the outer program and what re-entered model context.

## Side-by-side result

| Dimension | Standard | Code | Evidence or caveat |
|---|---|---|---|
| Correctness score | TODO: | TODO: | TODO: |
| Model-step count | TODO: | TODO: | TODO: |
| Direct outer calls | TODO: | TODO: | TODO: |
| Nested calls | TODO: | TODO: | TODO: |
| Displayed duration | TODO: | TODO: | TODO: not a benchmark unless repeated |
| Displayed token use | TODO: | TODO: | TODO: SDK/schema tradeoff, not universal savings |
| Trace readability | TODO: | TODO: | TODO: |
| Constraint compliance | TODO: | TODO: | TODO: |

Workspace integrity check:

- `diff -ru reference workspace` exit status: TODO:
- Output: TODO: none, or invalidate the run and summarize changed paths

## Observation, inference, hypothesis

Keep these epistemic levels separate.

### Observed

- TODO: fact directly visible in the final answers or trajectory.
- TODO: fact directly visible in the final answers or trajectory.

### Inferred from the controlled difference

- TODO: cautious explanation supported by the two compositions and this pair.

### Still a hypothesis

- TODO: performance or general-quality claim requiring repeated runs.

## Validity threats

| Threat | Present? | Effect on interpretation | Mitigation for a repeated study |
|---|---:|---|---|
| Model sampling variance | TODO: | TODO: | Run at least three fresh sessions per mode |
| Provider/network load | TODO: | TODO: | Alternate run order and report distributions |
| Warm cache or initialized runtime | TODO: | TODO: | Alternate order or restart between matched pairs |
| Different model/reasoning/policy | TODO: | TODO: | Invalidate the pair if any controlled value changed |
| Different file snapshot | TODO: | TODO: | Recreate from one reference and verify with `diff` |
| Human intervention or approval | TODO: | TODO: | Record every decision and keep treatment identical |
| Missing token/timing fields | TODO: | TODO: | State “not exposed”; do not estimate |

## Mode decision

- Stronger result in this observed pair: TODO:
- Default for this task class before repeated evidence: TODO:
- Specific reason to choose Code next time, if any: TODO:
- Specific reason to stay with Standard, if any: TODO:
- Why Minimal is not the next automatic choice: TODO:
- Why Creator is outside this task's scope: TODO:

## Optional repeated benchmark

Do not fill this section from the first pair. Use fresh sessions and alternate order.

| Repetition | Mode | Correctness /10 | Model steps | Outer calls | Nested calls | Duration | Tokens | Notes |
|---:|---|---:|---:|---:|---:|---:|---:|---|
| 1 | Standard | TODO: optional | TODO: | TODO: | TODO: | TODO: | TODO: | TODO: |
| 1 | Code | TODO: optional | TODO: | TODO: | TODO: | TODO: | TODO: | TODO: |
| 2 | Code | TODO: optional | TODO: | TODO: | TODO: | TODO: | TODO: | TODO: |
| 2 | Standard | TODO: optional | TODO: | TODO: | TODO: | TODO: | TODO: | TODO: |
| 3 | Standard | TODO: optional | TODO: | TODO: | TODO: | TODO: | TODO: | TODO: |
| 3 | Code | TODO: optional | TODO: | TODO: | TODO: | TODO: | TODO: | TODO: |

If the optional benchmark is not run, delete the table or replace its markers with one explicit “not run” statement before validation.

## Sanitization and completion

- [ ] No placeholder marker remains.
- [ ] No API key, credential reference, private path, raw trajectory, hidden reasoning, or proprietary content is present.
- [ ] Both runs used fresh sessions and the intended preset is visible in each session header.
- [ ] Provider, model, reasoning level, permission, prompt, and workspace snapshot were held constant.
- [ ] Every correctness score is justified against the known-answer rubric.
- [ ] Direct calls and nested Code-mode subcalls are counted separately.
- [ ] Missing metrics are labeled “not exposed,” not estimated.
- [ ] One pair is not described as a benchmark or universal performance result.
- [ ] Workspace integrity was verified after both runs.
- [ ] The conclusion distinguishes observed result, inference, and future hypothesis.

Source lesson: [Module 03 — Mastering the Four Runtime Modes](README.md).

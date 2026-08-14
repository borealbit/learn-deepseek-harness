---
course_version: 0.1.0
upstream_repository: https://github.com/deepseek-ai/deepseek-harness
upstream_ref: "47f943859bef60e4160492346772ded9b24f765a"
install_package: "@deepseek-ai/dsh@0.1.0-rc.6"
source_reviewed_on: 2026-08-13
verified_on:
status: draft
platforms: []
---

# Module 00 — Quick Start: From Zero to First Safe Task

## Outcome

After this module, you can:

- launch the DeepSeek Harness Web UI from a disposable workspace;
- configure a DeepSeek model without placing its API key in the repository;
- keep the default `workspace-write` permission preset;
- run one bounded, read-only inspection task;
- verify that the workspace did not change; and
- inspect the session's trajectory before shutting down.

Estimated time: **20–30 minutes**.

## Verification status

This lesson is a **draft**, not a verified release.

- The UI flow and safety claims were reviewed against upstream commit [`47f943859bef60e4160492346772ded9b24f765a`](https://github.com/deepseek-ai/deepseek-harness/commit/47f943859bef60e4160492346772ded9b24f765a).
- npm metadata was checked on 2026-08-13. The installable package was [`@deepseek-ai/dsh@0.1.0-rc.6`](https://www.npmjs.com/package/@deepseek-ai/dsh/v/0.1.0-rc.6).
- The latest upstream source commit reviewed still identified itself as `0.1.0-rc.5`, while npm exposed `0.1.0-rc.6`. Because an exact matching source revision was not available, the package and source reference are recorded separately.
- A complete install was attempted with Node.js 24 on Linux, but the restricted validation environment blocked filesystem ownership operations while `node-pty` attempted a native build. The Web UI and authenticated model task therefore still require clean macOS and Linux verification.

Do not change this module to `status: verified` until the checks in [the version policy](../../../docs/VERSIONING.md) pass on the named platforms.

## What the harness adds

A model produces responses. A harness surrounds the model with workspace context, tools, state, policies, approvals, and an execution loop. That added capability is why a harness can inspect files and run commands—and why the first task must have a narrow scope.

The official Web UI guide states that an agent may read and edit files, run commands, delegate work, and maintain a plan. An approval dialog is a control point, not a guarantee that every harmless-looking action is safe. You remain responsible for the workspace, the data sent to the provider, and every approval you grant.

## Prerequisites

- A macOS or Linux computer used for development
- Git
- [Node.js 24 LTS](https://nodejs.org/en/about/previous-releases) with npm and npx
- A clone of this course repository
- A DeepSeek API account, API key, and sufficient balance for one small request
- A modern local browser

The course standard is Node.js 24 LTS. The reviewed upstream source declares `^22.19.0 || >=24.0.0`, but using one LTS baseline keeps troubleshooting reproducible.

## Threat model for this lab

This quick start reduces risk; it does not create a perfect security boundary.

- The practice workspace contains synthetic, non-sensitive files only.
- The task asks for inspection only and prohibits edits and shell commands.
- `workspace-write` limits filesystem mutations to the workspace and permitted temporary locations, with wider operations requiring approval.
- Upstream explicitly notes that reads, network access, and process visibility are not confined by that filesystem policy. Do not treat `workspace-write` as a privacy sandbox.
- The prompt and any file content used in the request are sent to the selected model provider and may incur API charges.
- The Web UI should remain on its default loopback address, `127.0.0.1`. Do not expose this developer-preview server to a LAN or the public internet.

Use a dedicated practice workspace and keep sensitive repositories, credentials, customer data, and private session logs out of this lab.

## Lab

### Step 1 — Check the local toolchain

Run:

```sh
node --version
npm --version
npx --version
git --version
```

**Expected result:** every command prints a version and exits successfully. For this course, `node --version` should begin with `v24.`.

If Node is missing or uses an unsupported major version, install Node.js 24 LTS through the official Node.js distribution or your normal version manager before continuing.

### Step 2 — Enter the disposable workspace

From your clone of this repository, run:

```sh
cd projects/quick-start-workspace
git status --short -- .
```

**Expected result:** the second command prints nothing. The workspace should contain only these four tracked files:

```text
README.md
package.json
notes/project-goals.md
src/greeting.js
```

Read [the workspace README](../../../projects/quick-start-workspace/README.md), but do not look for the planted inconsistency yet. The agent's first task is to find it.

### Step 3 — Start the pinned Web UI package

Run this command from `projects/quick-start-workspace`:

```sh
npx @deepseek-ai/dsh@0.1.0-rc.6 web
```

On first use, npx may ask to install the package. Confirm only after checking that the package name and version exactly match the command above.

**Expected result:** the terminal prints a local URL and the Web UI becomes available at:

```text
http://127.0.0.1:3080
```

Open that URL in a browser. Leave the terminal running.

Why pin the version? The official quick start intentionally uses the moving command `npx @deepseek-ai/dsh web`. A course needs a reproducible baseline, so this lesson pins the package that was current when the draft was researched.

### Step 4 — Add the model credential

1. Open **Settings → Models**.
2. Open the DeepSeek provider card.
3. Paste a newly created or appropriately scoped DeepSeek API key into the key field.
4. Save the provider.
5. Select one of the DeepSeek models shown by the current catalog.

Create and manage the key through the [DeepSeek API platform](https://platform.deepseek.com/api_keys). Do not paste the key into chat, a shell command, a `.env` file in this repository, a screenshot, or the course checklist.

**Expected result:** the model route becomes usable without restarting the server. Upstream documents the key field as write-only: after saving, the browser receives a redacted descriptor rather than the literal secret. The managed secret is stored under `$DSH_HOME/.credentials.yaml`; settings keep only its reference.

That storage is outside this practice repository, but it is still sensitive. Protect your user account and `$DSH_HOME`.

### Step 5 — Select the practice workspace

1. Click **Choose workspace**.
2. Add the absolute path of `projects/quick-start-workspace`.
3. Select that workspace.
4. Confirm the composer becomes available.

The process invocation directory is the default filesystem location, but the official guide notes that a fresh Web UI still has no selected workspace until you add one.

**Expected result:** the conversation composer is enabled and the selected workspace points only to the practice directory—not the course repository root, your home directory, or another real project.

### Step 6 — Keep least privilege

Before creating the session, inspect the permission selector.

- Keep **Workspace write** (the `workspace-write` preset).
- Do not select **Full access** or `danger-full-access`.
- Start a new session after confirming the preset and selected model.

The reviewed default combines `workspace-write` sandboxing with an `ask` approval policy. The full-access preset combines unrestricted filesystem access with `never` asking for approval. Full access is unnecessary for this lab.

**Expected result:** the new session starts with the practice workspace, selected model, and `workspace-write` permission.

### Step 7 — Send one bounded task

Paste this prompt exactly:

```text
Inspect only the current workspace in read-only mode.

Do not edit, create, rename, or delete files. Do not run shell commands. Do not access paths outside this workspace.

Return:
1. The workspace file inventory.
2. A two-sentence explanation of the project's purpose.
3. One internal inconsistency, with the two conflicting file paths.
4. The exact paths you read.
```

Watch the run instead of leaving it unattended.

If the UI asks to run a command, write outside the workspace, or broaden access, choose **Deny**. A denial is a valid outcome; refine the task instead of granting more privilege.

**Expected result:** the answer should:

- list the four files from Step 2;
- identify the fixture as a tiny greeting project;
- notice that `README.md` uses the codename **Aurora** while `notes/project-goals.md` names **Borealis**; and
- identify the paths it actually read.

Exact wording may vary. Judge the evidence, not the prose style.

### Step 8 — Prove that no file changed

In a second terminal, while still inside `projects/quick-start-workspace`, run:

```sh
git status --short -- .
```

**Expected result:** no output.

If any file appears, do not discard it blindly. Inspect the diff first:

```sh
git diff -- .
```

Record the unexpected path and operation in the checklist. The lab is not complete until you understand the change and restore the fixture intentionally.

### Step 9 — Inspect the trajectory

Open the session's **Trajectory** view.

1. Find the User and Assistant records.
2. Find every Tool record, including any nested Subtool record.
3. Select a record and inspect its input, output, and timing.
4. Note token usage and duration when those fields are present.
5. Confirm there is no successful mutation or shell-command record.

**Expected result:** you can connect the final answer to the recorded model and tool activity instead of trusting the answer alone.

Do not commit raw session exports or screenshots containing personal paths, prompts, tool results, or credentials.

### Step 10 — Stop and record the result

Return to the terminal running DSH and press `Ctrl+C` once.

Complete [CHECKLIST.md](CHECKLIST.md) with versions, result, and any discrepancy. Never record the API key.

If the key was created only for this lab, revoke it through the DeepSeek API platform after the run. Remove a saved provider credential through the product's supported settings flow; do not delete `$DSH_HOME` blindly because it may also contain sessions and configuration you intend to keep.

## Troubleshooting

| Symptom | Likely cause | Check | Resolution |
|---|---|---|---|
| `node`, `npm`, or `npx` is missing | Node.js is not installed or not on `PATH` | Run the Step 1 commands in a new terminal | Install Node.js 24 LTS and reopen the terminal |
| `npm ERR! ETARGET` | The pinned release is unavailable from the configured registry | Open the exact npm package link and run `npm config get registry` | Do not silently switch to `latest`; record the registry and open an issue so the lesson can be repinned |
| Installation fails while building `node-pty` | No compatible prebuild, unwritable native-build cache, or missing local build tools | Read the first `node-pty` or `node-gyp` error, plus OS/architecture and Node version | Use official Node 24 LTS, ensure the user cache is writable, and install the native build prerequisites for your OS; do not solve it by granting DSH Full access |
| Port `3080` is already in use | Another process is listening on the default port | Read the startup error | Retry with `npx @deepseek-ai/dsh@0.1.0-rc.6 web --port 3081` and open the printed loopback URL |
| Browser cannot connect | The server exited, the URL is wrong, or a local policy blocks it | Confirm the terminal is still running and copy the printed URL | Restart the command; keep the host on `127.0.0.1` |
| Composer is disabled | No workspace or model is selected | Check **Choose workspace** and the model picker | Select the practice workspace and a configured model |
| `MISSING_CREDENTIAL` or HTTP 401 | The credential is missing, invalid, revoked, or tied to the wrong route | Reopen **Settings → Models** and inspect the provider | Save a valid key for the selected provider; never paste it into chat or an issue |
| `UNKNOWN_MODEL` | The session references a model no longer present in the provider catalog | Open the model picker | Select a currently configured model and start a new session |
| `SANDBOX_UNAVAILABLE` | No usable confinement backend is available | Capture the exact error and platform details | Fix the supported sandbox prerequisites or use another clean environment; do not fall back to Full access |
| An unexpected approval appears | The agent attempted an action outside the bounded task | Read the exact operation, target, and justification | Deny it, narrow the prompt, and record the event |
| UI labels or behavior differ materially | Upstream drift between the source review and npm package | Record package version and compare the official current guide | Stop and mark the lesson `needs-review`; do not improvise around a security-sensitive change |

## Completion check

- [ ] Node.js 24 LTS, npm, npx, and Git versions were recorded.
- [ ] The pinned DSH package launched on a loopback URL.
- [ ] The API key was saved through the Models UI and never entered into repository content.
- [ ] The selected workspace was exactly `projects/quick-start-workspace`.
- [ ] The session used `workspace-write`, not Full access.
- [ ] No unexpected approval was granted.
- [ ] The response found the planted codename inconsistency.
- [ ] `git status --short -- .` produced no output after the task.
- [ ] The trajectory was inspected and contained no successful mutation or shell command.
- [ ] The DSH process was stopped cleanly.
- [ ] [CHECKLIST.md](CHECKLIST.md) contains no secrets or private paths.

## Deliverable

A completed local copy of [CHECKLIST.md](CHECKLIST.md) and a saved DSH session showing a bounded read-only inspection. Keep session evidence local; share only a sanitized summary.

## Official sources

- [DeepSeek Harness README at the reviewed commit](https://github.com/deepseek-ai/deepseek-harness/blob/47f943859bef60e4160492346772ded9b24f765a/README.md)
- [Web UI guide at the reviewed commit](https://github.com/deepseek-ai/deepseek-harness/blob/47f943859bef60e4160492346772ded9b24f765a/docs/user/guide/index.md)
- [Model and credential guide at the reviewed commit](https://github.com/deepseek-ai/deepseek-harness/blob/47f943859bef60e4160492346772ded9b24f765a/docs/user/guide/providers.md)
- [CLI behavior reference at the reviewed commit](https://github.com/deepseek-ai/deepseek-harness/blob/47f943859bef60e4160492346772ded9b24f765a/apps/cli/reference/README.md)
- [Permission preset reference at the reviewed commit](https://github.com/deepseek-ai/deepseek-harness/blob/47f943859bef60e4160492346772ded9b24f765a/docs/subsystems/permission-presets.md)
- [Sandbox reference at the reviewed commit](https://github.com/deepseek-ai/deepseek-harness/blob/47f943859bef60e4160492346772ded9b24f765a/docs/subsystems/sandbox.md)
- [Trajectory UI reference at the reviewed commit](https://github.com/deepseek-ai/deepseek-harness/blob/47f943859bef60e4160492346772ded9b24f765a/packages/client/ui-trajectory/README.md)
- [Upstream Node.js engine declaration at the reviewed commit](https://github.com/deepseek-ai/deepseek-harness/blob/47f943859bef60e4160492346772ded9b24f765a/package.json)
- [DeepSeek API authentication documentation](https://api-docs.deepseek.com/api/deepseek-api)
- [Node.js release status](https://nodejs.org/en/about/previous-releases)

## Next module

Module 01 — Agent = Model + Harness is planned. Until it is published, use [the syllabus](../../../SYLLABUS.md) as the learning map.

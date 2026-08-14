# Module 00 — First-Run Checklist

Use this as a template for your private learning record. Do not commit a completed copy if it contains personal paths, account details, session content, or other private information. Never record an API key.

## Run metadata

| Field | Value |
|---|---|
| Date | `YYYY-MM-DD` |
| Operating system | `<name and version>` |
| Architecture | `<arm64 or x64>` |
| Node.js | `<version>` |
| npm | `<version>` |
| npx | `<version>` |
| Git | `<version>` |
| DSH package | `@deepseek-ai/dsh@0.1.0-rc.6` |
| Course source reference | `47f943859bef60e4160492346772ded9b24f765a` |
| Web URL | `http://127.0.0.1:<port>` |
| Provider | `DeepSeek` |
| Model | `<non-secret model identifier>` |
| Permission preset | `workspace-write` |
| Workspace | `projects/quick-start-workspace` |

## Preflight

- [ ] I used a disposable workspace containing synthetic data only.
- [ ] I confirmed the npx package name and pinned version before installation.
- [ ] I kept the Web UI on a loopback address.
- [ ] I saved the API key through **Settings → Models**.
- [ ] I did not place the key in chat, shell history, screenshots, `.env`, or repository files.
- [ ] I selected exactly `projects/quick-start-workspace`.
- [ ] I kept `workspace-write` and did not enable Full access.

## Task evidence

- [ ] The response listed `README.md`.
- [ ] The response listed `package.json`.
- [ ] The response listed `notes/project-goals.md`.
- [ ] The response listed `src/greeting.js`.
- [ ] The response described a small greeting fixture.
- [ ] The response identified the Aurora/Borealis codename mismatch.
- [ ] The response named the paths it read.
- [ ] The response did not claim to have changed a file.

Sanitized result summary:

> `<Write two or three sentences. Do not paste raw session content or private paths.>`

## Approval record

| Approval requested? | Requested operation | Decision | Reason |
|---|---|---|---|
| `<yes/no>` | `<sanitized operation or none>` | `<deny/allow/none>` | `<reason>` |

For the expected run, no shell, mutation, outside-workspace, or privilege-escalation approval should be allowed.

## Independent verification

Command:

```sh
git status --short -- .
```

- [ ] The command produced no output.
- [ ] If it did produce output, I inspected `git diff -- .` before taking any recovery action.

Observed output or discrepancy:

> `<none, or a sanitized description>`

## Trajectory review

- [ ] I located the User record.
- [ ] I located the Assistant record.
- [ ] I inspected every Tool and nested Subtool record.
- [ ] I reviewed input, output, and timing for the relevant records.
- [ ] I checked token usage and duration when available.
- [ ] I found no successful mutation or shell-command record.

Sanitized trajectory summary:

> `<Record counts and high-level observations only.>`

## Cleanup

- [ ] I stopped DSH with `Ctrl+C`.
- [ ] I revoked the API key if it was created only for this lab.
- [ ] I did not delete `$DSH_HOME` blindly.
- [ ] I kept raw session evidence private.

## Completion decision

- [ ] **Pass** — every safety and verification condition was met.
- [ ] **Needs review** — behavior differed from the lesson; the discrepancy is documented.
- [ ] **Blocked** — installation, provider, sandbox, or platform setup prevented completion.

Notes:

> `<Record only non-secret, reproducible facts.>`

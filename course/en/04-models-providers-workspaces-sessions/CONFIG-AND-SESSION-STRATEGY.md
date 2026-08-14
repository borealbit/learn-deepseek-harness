# Module 04 Configuration and Session Strategy — Learner Deliverable

Record only sanitized facts. Replace every placeholder marker before retaining or sharing this file. Never paste a credential, raw Session export, private endpoint path, or absolute local path.

## Experiment identity

| Field | Sanitized value |
|---|---|
| Date and experiment label | TODO: |
| DSH package | `@deepseek-ai/dsh@0.1.0-rc.6` |
| Reviewed source | `47f943859bef60e4160492346772ded9b24f765a` |
| Application profile | `web` |
| Agent preset | `standard` |
| Permission preset | `Read only` or TODO: record why the lab stopped |
| OS and architecture | TODO: |
| Node.js version | TODO: |
| Author | TODO: name or pseudonym |

## Sanitized provider and model record

| Fact | Recorded value |
|---|---|
| Setup path | TODO: official DeepSeek / catalog provider / custom provider |
| Provider id | TODO: stable id, not secret |
| Display name | TODO: public or sanitized |
| Adapter or API protocol | TODO: identifier or not exposed |
| Base URL | TODO: trusted public origin, sanitized origin, or inherited catalog; omit private path |
| Model id | TODO: |
| Context-window declaration | TODO: value or not exposed |
| Output-cap declaration | TODO: value or not exposed |
| Advertised input modalities | TODO: |
| Advertised reasoning levels | TODO: values or none advertised |
| Selected reasoning level | TODO: value or provider default |
| Credential reference | TODO: reference name only |
| Effective credential source | TODO: `env`, `file`, `project-env`, `user-env`, native auth, or not exposed |
| Credential value present here | **No** |

### Sanitized effective route

Describe only fields you verified. Delete fields that do not apply. Keep the credential value absent.

```yaml
provider_id: TODO
setup_path: TODO
protocol: TODO
base_url: TODO
credential:
  reference: TODO
  source: TODO
  configured: true
  value: OMITTED
model:
  id: TODO
  context_window: TODO
  max_output_tokens: TODO
  input: [TODO]
  reasoning_levels: [TODO]
  selected_reasoning: TODO
```

Provider-id permanence decision: TODO: explain what saved settings and Sessions would reference before deleting or replacing this route.

Endpoint trust decision: TODO: identify who operates it, what data may be sent, and what remains unverified without exposing a private URL.

Modality confidence: TODO: catalog fact, deployment declaration, tested synthetic input, or unverified claim.

## Credential handling

| Check | Result |
|---|---|
| Credential entered only through approved surface | TODO: |
| No credential in `settings.yaml` | TODO: |
| No credential in worksheet, chat, screenshot, or shell history | TODO: |
| Harness home outside selected Workspaces | TODO: |
| Credential is scoped, revocable, and low-limit where supported | TODO: |
| Same-user model-read limitation accepted or mitigated | TODO: |
| Rotation and revocation owner | TODO: role, not private contact data |

Credential boundary statement: TODO: explain why UI redaction and `0600` do not make the value unreadable to every same-user tool process.

## Workspace strategy

Use labels instead of absolute paths.

| Workspace label | Data owner/class | Intended directory scope | Allowed provider class | Session-retention rule | Isolation beyond Workspace |
|---|---|---|---|---|---|
| `alpha` | Synthetic course data | Fixture copy only | TODO: | Temporary | Isolated `DSH_HOME` |
| `beta` | Synthetic course data | Second fixture copy only | TODO: | Temporary | Isolated `DSH_HOME` |
| Real future project | TODO: | TODO: narrow scope | TODO: | TODO: | TODO: separate home/process or explain why not |

Canonical-path check: TODO: confirm alpha and beta are different real directories without recording their absolute paths.

Workspace-registration deletion policy: TODO: explain that deleting a registration retains files and Session logs.

## Session operation strategy

| Situation | Operation | Reason |
|---|---|---|
| Continue the same task, project, owner, and provider boundary | TODO: resume or continue | TODO: |
| Explore an alternative from a completed point | TODO: fork | TODO: |
| Change project, data owner, disclosure boundary, or provider trust | TODO: new Session and possibly new Workspace/home | TODO: |
| Hide an old Session from ordinary browsing | TODO: archive | TODO: |
| Debug with support | TODO: sanitized summary first; raw export only with authorization | TODO: |
| Reconstruct stored UI/history | TODO: event-log replay | TODO: explain why tools do not rerun |

Provider-switch rule: TODO: state when retained history may or may not be sent to a newly selected provider.

Image-failure recovery: TODO: verified image-capable model, fork before image, or new Session; never over-claim modality.

Interrupted-side-effect rule: TODO: verify external state before retrying a non-idempotent call whose outcome is unknown.

## Lab evidence

### Session A — alpha

| Observation | Evidence-backed value |
|---|---|
| Workspace label and marker | TODO: |
| Fresh Session confirmed | TODO: |
| Provider/model/effort | TODO: identifiers only |
| Direct tool calls, in order | TODO: |
| Relative paths actually read | TODO: |
| Approval requests and decisions | TODO: |
| Shell, network, mutation, or outside-path calls | TODO: |
| Errors, denials, or retries | TODO: |
| Final answer correct | TODO: |

### Fork A1

| Observation | Evidence-backed value |
|---|---|
| Fork created after completed turn | TODO: |
| Inherited Workspace label | TODO: |
| Inherited alpha history visible | TODO: |
| New relative path read | TODO: |
| README codename | TODO: |
| Child's new prompt absent from parent | TODO: |
| Parent and child shown as peer Sessions | TODO: |

### Session B — beta

| Observation | Evidence-backed value |
|---|---|
| Workspace label and marker | TODO: |
| Fresh Session confirmed | TODO: |
| Default followed prior model selection | TODO: observed yes/no/not exposed |
| Provider/model/effort held constant | TODO: |
| Relative paths actually read | TODO: |
| Alpha data appeared in answer | TODO: must be no |
| Final answer correct | TODO: |

### Restart and reopen

| Check | Result |
|---|---|
| Same isolated Harness home reused | TODO: label only |
| Session A restored under alpha | TODO: |
| Fork A1 restored independently | TODO: |
| Session B restored under beta | TODO: |
| Consumed provider/model/effort restored | TODO: |
| Old tool records displayed without re-execution | TODO: evidence |
| Unexpected repair or retry event | TODO: none, or describe safely |

## Integrity and boundary assertions

| Assertion | Result | Evidence or caveat |
|---|---|---|
| Alpha answer named `alpha` | TODO: | TODO: |
| Beta answer named `beta` | TODO: | TODO: |
| Both named `dsh-quick-start-workspace` | TODO: | TODO: |
| Fork reported `Aurora` from `README.md` | TODO: | TODO: |
| Parent did not acquire child-only history | TODO: | TODO: |
| Alpha reference diff exited `0` | TODO: | TODO: |
| Beta reference diff exited `0` | TODO: | TODO: |
| No raw export was needed | TODO: | TODO: if no, record authorization and sanitization without attaching it |

## Observed, inferred, and unverified

### Observed

- TODO: fact directly visible in the UI, Trajectory, answer, or integrity command.
- TODO: second directly observed fact.

### Inferred from implementation and controlled inputs

- TODO: cautious boundary conclusion supported by the lab and pinned official source.

### Unverified

- TODO: capability, privacy, performance, retention, or provider claim that this lab did not test.

## Troubleshooting record

| Failure code or symptom | Boundary | Safe correction | Outcome |
|---|---|---|---|
| TODO: none, or observed issue | TODO: credential / route / model / Workspace / Session | TODO: | TODO: |

## Sanitization and completion

- [ ] No placeholder marker remains.
- [ ] No API key, token, credential value, private endpoint path, or secret-bearing header is present.
- [ ] No absolute local path, raw Session id, raw export, private file content, or proprietary prompt is present.
- [ ] Provider, model, effort, mode, permission, and prompt were held constant for the alpha/beta comparison.
- [ ] Every claimed path is supported by Trajectory evidence.
- [ ] Provider and modality claims are labeled configured, observed, inferred, or unverified.
- [ ] Workspace registration is not described as a filesystem or credential sandbox.
- [ ] Resume/replay is not described as rerunning tools.
- [ ] The provider-switch rule accounts for retained Session history.
- [ ] Both reference diffs exited `0`.

Source lesson: [Module 04 — Models, Providers, Workspaces, and Sessions](README.md).

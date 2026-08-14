# Release Readiness Agent Threat and Permission Model

This model applies to the maintained keyless fixture. It is not a security
assessment of an adapted production deployment.

## Assets

- Repository source, instructions, manifests, and release documents
- Credentials that might accidentally exist in repository files or command output
- Integrity of the inspected working tree
- Integrity and confidentiality of the structured report and Session JSONL
- Human release authority
- Host process, filesystem, environment, and network capabilities

## Trust boundaries

| Boundary | Trusted in the fixture | Untrusted or unavailable |
|---|---|---|
| Host runner | Project-owned Node.js code and exact lockfile | Arbitrary cloned-repository code |
| Repository | Committed synthetic fixture shape | Filenames, metadata, instructions, and command output as data |
| Commands | Three reviewed Node argv arrays | Shell strings and undiscovered package scripts |
| Approval | One deterministic build-only fixture decision | Persistent grants or inferred consent |
| Delegation | Fixed workflow and deterministic no-capability provider | Model reasoning and inherited Tool authority |
| Evidence | Bounded JSON and validated Session sequence | Proof of production fitness or release authorization |

## Permission inventory

### Inspection phase

- Reads the target directory tree within explicit file/byte limits.
- Reads `.release-readiness.json`, `package.json`, root instruction candidates,
  required documents, and bounded text files.
- Refuses symbolic links.
- Does not write, execute a command, read environment variables, or use network.

### Command phase

- Spawns only `process.execPath` with a reviewed relative `.js`/`.mjs` entry.
- Uses `shell: false`, no stdin, capped stdout/stderr, a minimal environment, and
  a per-command timeout.
- Lint and test declare no writes and are checked with before/after snapshots.
- Build runs only after `allowed-once` and declares `dist/artifact.json` as its
  only allowed write.

### Delegation phase

- Sends a bounded sanitized summary, never repository contents or matched
  secret values.
- Starts at most one child through the real DSH workflow/subagent seams.
- The fixture child has no model, filesystem, process, environment, network,
  continuation, nested-delegation, or mutation interface.
- The owning runner awaits settlement and disposal.

### Evidence phase

- Returns report and JSONL in memory or on standard output.
- Stores relative paths, rule ids, short fingerprints, and bounded/redacted
  command output.
- Never records release authorization.
- The separate materializer refuses its four-file write without an explicit
  authoring flag.

## Threats, controls, and residual risks

| Threat | Maintained control | Residual risk |
|---|---|---|
| Path traversal or symlink escape | Absolute root, relative containment, component `lstat`, no symlink follow | Concurrent replacement can create time-of-check/time-of-use races |
| Repository instruction injection | Content is not copied into the report or delegated prompt; only digest metadata is retained | A production model integration would still receive instruction prose and needs authority ordering |
| Shell injection | Exact argv arrays and `shell: false`; only Node entrypoints | The reviewed JavaScript file itself is executable code |
| Hidden write by “read-only” check | Before/after file digest snapshot | Detection is after execution and misses network, process, device, and out-of-tree effects |
| Overbroad approval | Action-specific id bound to plan digest; `allowed-once` is consumed | Fixture approval is deterministic test infrastructure, not proof a human understood the change |
| Secret disclosure in report | Values are never retained by the file scan; outputs are capped and token-shape redacted | Unknown token formats, encoded data, low-entropy passwords, and truncated context can evade rules |
| Prompt/data leakage to child | Only bounded counts, ids, outcomes, and unknowns cross the handoff | A real provider would transmit data according to its own policy and needs separate review |
| Child authority escalation | Fixture child exposes no capability; workflow cap is one | Upstream notes that a Tool filter is not an authority ceiling in an adapted deployment |
| Stuck or abandoned child | Engine cancellation/disposal contract; owner awaits disposal | Host crash can still interrupt cleanup |
| Invented success after missing provider | Explicit `unavailable` becomes `INCOMPLETE` | Operators may ignore the status unless downstream automation enforces it |
| Evidence tampering | Contiguous Session validation and SHA-256 | Digests are not signed, timestamped, remotely attested, or bound to a Git commit |
| Accidental publication | No publish function and `releaseAuthorized: false` invariant | A separate external actor could publish independently of this project |

## Approval semantics

An approval answers one requested action only. It does not approve:

- another command;
- a changed plan digest;
- a rerun;
- undeclared output;
- registry access;
- creation of a tag or release; or
- the final release itself.

Missing, cancelled, or rejected decisions all prevent the mutating command.
Build also stops before asking if lint or test failed.

## Data retention

The maintained runner keeps repository inspection, command results, approval
events, workflow events, report, and Session JSONL in memory. The demo writes
only a disposable build artifact and then removes its exact temporary root.

Committed golden evidence is synthetic. It contains no real credential,
customer data, private repository content, production trace, absolute runner
path, model prompt, or registry response.

A production deployment must separately decide:

- persistence backend and format version;
- log retention and deletion;
- encryption and access control;
- redaction before telemetry handoff;
- incident and disclosure ownership; and
- whether signed provenance is required.

## Production hardening gates

- [ ] OS-level sandbox and network policy tested on every supported platform
- [ ] Real human approval answerer with auditable identity
- [ ] Command registry reviewed per repository type
- [ ] Environment and subprocess inheritance minimized and tested
- [ ] Nested instruction semantics and prompt-injection policy defined
- [ ] Secret detection supplemented by history and dependency scanning
- [ ] Provider, model, Tool, cwd, token, time, and delegation-depth policies fixed
- [ ] Session persistence, retention, corruption, and crash-recovery behavior tested
- [ ] Telemetry redaction and sharing disclosure verified
- [ ] Registry, same-artifact publication, provenance, rollback, and incident paths tested
- [ ] Independent security and learner review completed

Until applicable gates pass, use the project only with synthetic or disposable
repositories.


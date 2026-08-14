# Repository Inspector Tool

> Copyright © 2026 Borealbit Technology Limited. Created by Dom Liu. This
> package documentation and its code samples are licensed under Apache-2.0.

`@borealbit/dsh-repository-inspector` is the native plugin built in
[Module 07 — Build Your First DSH Plugin](../../course/en/07-build-first-dsh-plugin/README.md).
It registers one typed, read-only DeepSeek Harness Tool named
`inspect_repository`.

This is a course release candidate, not a published or production-hardened
package. Its manifest retains `private: true`, so npm must refuse a registry
publication. [Module 11 — Package, Publish, and Maintain](../../course/en/11-package-publish-maintain/README.md)
uses that deliberate blocker to distinguish a complete audit from authority to
release.

## Capability

The Tool inspects one directory below a deployment-configured root and returns:

- a relative directory path;
- a bounded, sorted sample of entry names and kinds;
- selected `package.json` fields: `name`, `version`, `private`, and script
  **names**; and
- explicit truncation, warning, read-only, and untrusted-data fields.

It does not return file bodies or script command values. It does not write or
execute commands, it does not read environment values, and it does not use the
network.

Filenames and manifest strings are attacker-controlled data. The canonical
result sets `untrusted: true`; the native renderer serializes the value as
single-line JSON and explicitly tells the model not to interpret returned
strings as instructions. This reduces formatting ambiguity but does not make
model consumption of hostile metadata risk-free.

## Permission boundary

The deployer supplies `allowedRoot`; the model can supply only a relative
`path`. The implementation rejects lexical traversal and any resolved path
that escapes through a symbolic link. It does not follow a `package.json`
symbolic link on the tested POSIX path. Directory acquisition stops after
`maxEntries + 1` entries, manifest acquisition is byte-capped, and returned
arrays and text fields have hard limits.

This boundary reduces accidental disclosure; it is not an operating-system
sandbox. A privileged process can still read the configured tree, concurrent
filesystem mutation can create time-of-check/time-of-use races, Windows
symbolic-link behavior has not been verified, and filenames themselves may be
sensitive. Configure a synthetic or deliberately scoped root, and add an
independent policy hook such as the course
[Tool Policy Gate](../tool-policy-gate/) before using the Tool with untrusted
repositories.

## Compatibility

| Component | Pinned version or reference |
|---|---|
| Node.js | `^22.19.0 \|\| >=24.0.0` |
| pnpm | `11.19.0` |
| `@deepseek-ai/dsh-tools` | `0.1.0-rc.6` |
| `@deepseek-ai/cordis` | `4.0.1` |
| `@deepseek-ai/schemastery` | `3.18.1` |
| Reviewed Harness source | `47f943859bef60e4160492346772ded9b24f765a` |

The reviewed source declared rc.5 while the tested npm packages were rc.6.
Treat the package pins and source review as separate evidence.

## Build and test

From this directory:

```sh
pnpm install --frozen-lockfile
pnpm typecheck
pnpm test
```

The test suite exercises the pure inspection function, traversal and symlink
denials, acquisition bounds, cancellation, the real keyless DSH Tool Runtime,
plugin disposal, overlay generation, and release-contract failures.

## Release audit

Build and inspect the prospective npm payload without writing to a registry:

```sh
pnpm release:audit
node scripts/release-audit.mjs --draft --json
```

Draft mode exits successfully after producing a **NO-GO** report so the course
can test the expected blocker. Strict mode is the prepublication gate and exits
non-zero for either a blocker or unresolved external evidence:

```sh
pnpm release:verify
```

It must exit non-zero while `private: true` remains. The audit verifies package
identity and attribution, exact compatibility pins, the `dsh.bundle` patch,
every exported path, an allowlisted and bounded tarball inventory, permission
and operations documentation, lifecycle scripts, and obvious secret-like or
development-only paths. It cannot prove registry ownership, repository
visibility, publisher authorization, clean-consumer behavior, protected
approval, provenance, or same-artifact publication; those remain external gates
and keep the strict decision at NO-GO.

Do not weaken the strict gate merely to make it green. Remove `private: true`
only in the reviewed version commit after every external gate in the
[Module 11 checklist](../../course/en/11-package-publish-maintain/RELEASE-READINESS-CHECKLIST.md)
passes.

## Temporary source overlay

Build the package, then create a one-use overlay. The generator resolves both
paths, writes an absolute plugin entry, quotes YAML scalars, and refuses to
overwrite an existing file:

```sh
pnpm build
node scripts/create-overlay.mjs \
  --allowed-root "$PWD/test/fixtures/sample-repository" \
  --output "$PWD/module07.patch.yml"
dsh web --patch "$PWD/module07.patch.yml" --dump-config
```

Boot with the same overlay only after inspecting it:

```sh
dsh web --patch "$PWD/module07.patch.yml"
```

Stop the process before rebuilding. Restart it with the same overlay to ensure
the new built entry is loaded. Delete only the generated `module07.patch.yml`
when the exercise is complete.

## Install from a packed candidate

The package declares a `dsh.bundle` patch. Pack the exact candidate, set the
allowed root, and install the tarball into an isolated Web profile. `npm pack`
runs `prepack`, which rebuilds `lib/`; it does not publish anything.

```sh
export MODULE11_PACK_DIR="$(mktemp -d)"
npm pack --pack-destination "$MODULE11_PACK_DIR"
export MODULE11_DSH_HOME="$(mktemp -d)"
export DSH_HOME="$MODULE11_DSH_HOME"
export DSH_REPOSITORY_INSPECTOR_ROOT="$PWD/test/fixtures/sample-repository"
dsh plugin --profile web add \
  "$MODULE11_PACK_DIR/borealbit-dsh-repository-inspector-0.1.0.tgz"
dsh --profile web --dump-config
dsh --profile web
```

Remove the dependency and bundle layer with:

```sh
dsh plugin --profile web remove @borealbit/dsh-repository-inspector
unset DSH_REPOSITORY_INSPECTOR_ROOT DSH_HOME MODULE11_DSH_HOME
```

Inspect the temporary pack directory, then remove only the directory created by
this exercise. Never aim a recursive cleanup command at an unresolved variable.

Do not install this course fixture from GitHub. It intentionally has no
`prepare` script and does not commit build output. The official Harness guide
notes that a git dependency receives source and needs a `prepare` build; pnpm
10+ then requires the consumer to allow that install-time code explicitly. This
candidate instead chooses prebuilt registry/tarball distribution, so a git-host
specifier is unsupported.

## Upgrade and rollback

Treat the profile manifest and the packed artifact as release evidence:

1. Record the installed package version and tarball digest.
2. Install a candidate into a disposable profile first.
3. Dump the composed config and repeat the Tool success, denial, unload, and
   Web boot smokes.
4. Upgrade the real profile by exact version or reviewed tarball, never by a
   moving Git branch.
5. If a regression appears, remove the candidate and reinstall the last known
   good exact tarball or version.
6. Verify the profile bundle list after either operation.

A registry version is immutable; rollback means selecting a new or previous
version, not replacing the bytes under an existing name/version. If a release
creates a security or compatibility problem, deprecate the affected version,
publish a new fixed version, and retain an incident and migration record.

## Configuration

| Field | Required | Default | Enforced range | Meaning |
|---|---:|---:|---:|---|
| `allowedRoot` | Yes | — | Non-empty absolute path | Deployment boundary |
| `maxEntries` | No | `40` | Integer `1–100` | Maximum returned entries |
| `maxManifestBytes` | No | `32768` | Integer `1024–131072` | Maximum acquired manifest bytes |

The bundle reads `allowedRoot` from `DSH_REPOSITORY_INSPECTOR_ROOT`. Missing,
relative, or out-of-range configuration fails plugin loading. Root existence,
directory type, and readability are checked on every Tool call, so a missing or
temporarily unavailable mount becomes a structured call error.

## Package anatomy

| Path | Role |
|---|---|
| `src/index.ts` | Plugin entry, `Config` schema, Tool definition, renderer |
| `src/inspect-repository.ts` | Bounded filesystem operation and validation |
| `test/repository-inspector.test.js` | Unit, negative, lifecycle, and runtime tests |
| `cordis.patch.yml` | Installable bundle layer |
| `scripts/create-overlay.mjs` | Safe local absolute-overlay generator |
| `pnpm-lock.yaml` | Exact dependency resolution used by the fixture |

## Known limitations

- The package is private and intentionally unpublished; the repository is also
  private at the Module 11 reference date.
- The source overlay requires a prior build and a process restart after rebuild.
- Exact rc.6 CLI/profile and Web HTTP boot smokes pass on the reference Linux
  runner; browser schema inspection and an authenticated model call are not yet
  recorded.
- The tests do not prove Windows symbolic-link behavior.
- The Tool reports a bounded sample, not a complete recursive repository tree.
- It does not parse workspaces, lockfiles, source code, Git state, or dependency
  health.
- The release audit is offline. It does not reserve the npm name, authenticate a
  publisher, prove repository/topic visibility, scan the full dependency graph,
  produce provenance, or write to a registry.

See the module's
[build record](../../course/en/07-build-first-dsh-plugin/PLUGIN-BUILD-RECORD.md)
for implementation evidence, the [Module 11 release audit record](../../course/en/11-package-publish-maintain/RELEASE-AUDIT-RECORD.md)
for package evidence, and [SECURITY.md](SECURITY.md) for vulnerability-reporting
rules.

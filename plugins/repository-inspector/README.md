# Repository Inspector Tool

> Copyright © 2026 Borealbit Technology Limited. Created by Dom Liu. This
> package documentation and its code samples are licensed under Apache-2.0.

`@borealbit/dsh-repository-inspector` is the native plugin built in
[Module 07 — Build Your First DSH Plugin](../../course/en/07-build-first-dsh-plugin/README.md).
It registers one typed, read-only DeepSeek Harness Tool named
`inspect_repository`.

This is a course fixture, not a published or production-hardened package.

## Capability

The Tool inspects one directory below a deployment-configured root and returns:

- a relative directory path;
- a bounded, sorted sample of entry names and kinds;
- selected `package.json` fields: `name`, `version`, `private`, and script
  **names**; and
- explicit truncation, warning, read-only, and untrusted-data fields.

It does not return file bodies or script command values. It does not write,
execute commands, read environment values, or use the network.

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
independent policy hook before using the Tool with untrusted repositories.

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
plugin disposal, and overlay generation.

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

## Local bundle installation

The package also declares a `dsh.bundle` patch. Build first, set the allowed
root, and install the local checkout into an isolated Web profile:

```sh
pnpm build
export MODULE07_DSH_HOME="$(mktemp -d)"
export DSH_HOME="$MODULE07_DSH_HOME"
export DSH_REPOSITORY_INSPECTOR_ROOT="$PWD/test/fixtures/sample-repository"
dsh plugin --profile web add .
dsh --profile web --dump-config
dsh --profile web
```

Remove the dependency and bundle layer with:

```sh
dsh plugin --profile web remove @borealbit/dsh-repository-inspector
unset DSH_REPOSITORY_INSPECTOR_ROOT DSH_HOME MODULE07_DSH_HOME
```

Do not install this course fixture from GitHub. It intentionally has no
`prepare` script and does not commit build output; registry and Git packaging
belong to Module 11.

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

- The package is private and intentionally unpublished.
- The source overlay requires a prior build and a process restart after rebuild.
- Exact rc.6 CLI/profile and Web HTTP boot smokes pass on the reference Linux
  runner; browser schema inspection and an authenticated model call are not yet
  recorded.
- The tests do not prove Windows symbolic-link behavior.
- The Tool reports a bounded sample, not a complete recursive repository tree.
- It does not parse workspaces, lockfiles, source code, Git state, or dependency
  health.

See the module's
[build record](../../course/en/07-build-first-dsh-plugin/PLUGIN-BUILD-RECORD.md)
for dated evidence and remaining verification work.

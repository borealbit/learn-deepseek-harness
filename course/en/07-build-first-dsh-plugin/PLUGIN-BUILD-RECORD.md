# Module 07 Plugin Build Record

Use this record to distinguish the maintained reference run from your own
verification. Do not add credentials, private absolute paths, customer
filenames, raw Session data, or generated overlays containing private paths.

## Reference identity

| Field | Recorded value |
|---|---|
| Reference date | `2026-08-14` |
| Platform and architecture | `Linux x86_64` |
| Node.js | `v24.19.0` |
| npm | `11.9.0` |
| pnpm | `11.19.0` |
| Plugin | `@borealbit/dsh-repository-inspector@0.1.0` |
| CLI install target | `@deepseek-ai/dsh@0.1.0-rc.6` |
| Tool Runtime | `@deepseek-ai/dsh-tools@0.1.0-rc.6` |
| Cordis | `@deepseek-ai/cordis@4.0.1` |
| Schemastery | `@deepseek-ai/schemastery@3.18.1` |
| Reviewed upstream source | `47f943859bef60e4160492346772ded9b24f765a` |
| Module status | `draft` |

The reference run used only the synthetic package fixture. No model credential,
provider request, browser, customer repository, or private Session was used.

## Source and registry record

| Evidence | Observation | Interpretation |
|---|---|---|
| Upstream commit | `47f943859bef60e4160492346772ded9b24f765a` reviewed | Immutable source and documentation reference |
| Upstream root and CLI manifests | Declared `0.1.0-rc.5` | Source checkout had not advanced its manifest to the tested registry release |
| npm `@deepseek-ai/dsh` | Exact `0.1.0-rc.6` available; `latest` and `next` resolved there on `2026-08-13` | Course install pin |
| npm `@deepseek-ai/dsh-tools` | Exact `0.1.0-rc.6` available; `next` resolved there while `latest` resolved to `0.0.1-rc.1` | Never use the moving `latest` tag for this fixture |
| Exact rc.6 manifests | Cordis `4.0.1` and Schemastery `3.18.1` dependency contracts inspected | Fixture manifest and lockfile pins |

This release gap is recorded rather than treated as proof that the source
commit and registry artifacts are byte-identical.

## Reference commands and results

Commands were executed from `plugins/repository-inspector/`:

```sh
pnpm install --store-dir /tmp/module07-pnpm-store
pnpm typecheck
pnpm test
npm pack --dry-run
```

| Command | Exit | Observed result |
|---|---:|---|
| Dependency install | `0` | Exact lock resolved; 20 packages installed in the documented environment |
| `pnpm typecheck` | `0` | Strict TypeScript check completed with no diagnostic |
| `pnpm test` | `0` | 8 passed, 0 failed, 0 skipped on Linux |
| `npm pack --dry-run` | `0` | 10 files; 11.6 kB packed, 35.5 kB unpacked; no publish occurred |
| Temporary exact CLI install | `0` | `dsh --version` printed `0.1.0-rc.6` |
| Local bundle add and `--dump-config` | `0` | Isolated `web` profile showed the package layer and plugin row |
| Real Web profile boot | `0` | Loader accepted the plugin; local Web endpoint returned HTTP success |
| SIGTERM and bundle remove | `0` | Web stopped cleanly; dependency and composed row were absent after removal |

After the exact CLI was available in a temporary prefix, the profile portion
used this sanitized sequence:

```sh
dsh --version
dsh plugin --profile web add /absolute/path/to/repository-inspector
dsh --profile web --dump-config
dsh --profile web --port 31987
dsh plugin --profile web remove @borealbit/dsh-repository-inspector
```

The runner supplied a temporary `DSH_HOME`, the synthetic fixture through
`DSH_REPOSITORY_INSPECTOR_ROOT`, and a temporary pnpm store. A same-process
HTTP probe checked the Web root before SIGTERM. The absolute runner paths and
generated profile were not committed.

The temporary store override was a runner-local cache choice, not part of the
learner contract. The maintained learner command remains
`pnpm install --frozen-lockfile`.

The complete CLI depends on native `node-pty`. In this restricted runner its
prebuild was unavailable, its default node-gyp cache was not writable, and
ownership restoration while extracting headers was unsupported. The reference
run prepared the exact Node `v24.19.0` headers under a temporary path without
restoring archive ownership, then supplied that header directory to node-gyp.
The final exact CLI install and smoke passed. This is runner evidence, not a
general learner installation step; diagnose the actual first failure before
using an environment-specific workaround.

## Test evidence

| # | Test | Boundary or contract proven |
|---:|---|---|
| 1 | Returns bounded structured metadata without manifest command values | Canonical shape, untrusted-data label, selected metadata, non-disclosure of script values |
| 2 | Sorts before applying the configured entry cap | Stable order within the acquired sample and truthful truncation |
| 3 | Rejects absolute paths, traversal, and invalid deployment bounds | Input/configuration failure paths |
| 4 | Rejects an in-root directory link resolving outside | Resolved containment on tested POSIX filesystem |
| 5 | Does not follow a `package.json` symbolic link | Manifest-link denial on tested POSIX filesystem |
| 6 | Caps manifest acquisition and honors a pre-aborted call | Byte bound and cancellation path |
| 7 | Registers, executes, rejects escape and unknown input, then unregisters through the real Tool Runtime | Schema, success, structured errors, renderer, lifecycle cleanup |
| 8 | Creates a one-run overlay with absolute, YAML-quoted boundaries | Loader input generation and overwrite refusal |

The Runtime test composes real `Context`, `SystemPrompt`, and `ToolRuntime`
packages. A separate disposable smoke used the exact CLI package and real
Loader/Web profile. Neither test is an authenticated model or browser e2e.

## Dry-run package inventory

The 10-file dry-run contained:

```text
LICENSE
NOTICE
README.md
cordis.patch.yml
lib/index.d.ts
lib/index.js
lib/inspect-repository.d.ts
lib/inspect-repository.js
package.json
scripts/create-overlay.mjs
```

It excluded source, tests, fixtures, `node_modules`, lockfile, local overlays,
and build maps. The lockfile remains in the Git repository for fixture
reproduction but is not part of the prospective runtime tarball.

## Permission-boundary review

| Question | Reference answer | Evidence class |
|---|---|---|
| Who chooses the filesystem root? | Deployer through required absolute `allowedRoot` | Observed in config and negative tests |
| What can the model choose? | Optional relative directory `path` only | Observed in Tool schema |
| Can `path` escape lexically? | Rejected | Observed |
| Can a directory symlink escape? | Rejected on tested Linux path | Observed on Linux; unverified on Windows |
| Can a manifest symlink be read? | Rejected on tested Linux path | Observed on Linux; unverified on Windows |
| Is directory acquisition bounded? | Stops after `maxEntries + 1` entries | Observed from implementation and truncation test |
| Is manifest acquisition bounded? | Reads at most limit plus one sentinel byte | Observed from implementation and oversize test |
| Are file bodies or script commands returned? | No | Observed with a sentinel script value |
| Are repository-controlled strings trusted as instructions? | No; canonical output labels them untrusted and native rendering uses JSON plus a data-only warning | Observed in schema, value, renderer, and runtime test |
| Can the Tool write, run a process, or call a network API? | No such implementation path exists | Observed by source inspection; not an OS sandbox guarantee |
| Does unload remove the Tool? | Yes in the explicit fiber-disposal test | Observed |

## Observed, inferred, and unverified

- **Observed:** strict type checking passed; eight keyless tests passed; the
  real Tool Runtime registered, executed, contained errors, rendered output,
  and removed the Tool on fiber disposal; dry-run packing selected ten files;
  the exact rc.6 CLI loaded the local bundle through an isolated profile,
  served Web over HTTP, shut down cleanly, and removed the bundle.
- **Inferred:** a browser connected to that composition should receive the Tool
  schema because `apply` completed after `tools` injection. This remains an
  inference until the browser or host API is inspected directly.
- **Unverified:** independent clean Linux reproduction, clean macOS and Windows
  installs, Windows symbolic-link behavior, Web schema visibility, authenticated
  model selection and call, live configuration reload, browser rendering,
  Git-host installation, registry publication, and long-running adversarial
  filesystem races.

## Promotion gates

Do not mark Module 07 or this plugin verified until all applicable boxes pass:

- [x] Exact package and immutable upstream source recorded separately.
- [x] Strict type check passes.
- [x] Pure operation and negative boundary tests pass.
- [x] Real keyless Tool Runtime success and error paths pass.
- [x] Plugin disposal removes the Tool registration.
- [x] Prospective package contents inspected without publishing.
- [x] Exact rc.6 CLI installed in a disposable Linux prefix.
- [x] Real bundle/profile add, config dump, Loader/Web HTTP boot, clean shutdown, and removal passed.
- [ ] Clean Linux install using `pnpm install --frozen-lockfile` reproduced by an independent learner.
- [ ] Clean macOS install, test, overlay/profile dump, and unload/reload pass.
- [ ] Clean Windows install and test pass; symlink behavior is reviewed explicitly.
- [ ] Authenticated model invokes the Tool against only the synthetic fixture.
- [ ] Browser shows success and structured failure without leaking script values.
- [ ] Live reload behavior is observed through the supported watched configuration path.
- [ ] Security review accepts the documented time-of-check/time-of-use limitation or replaces it with a hardened design.
- [ ] No credentials, private paths, generated overlays, build output, or package tarballs are committed.

## Learner reproduction record

Copy this section into your own evidence file and use only sanitized values.

| Field | Your value |
|---|---|
| Date | TODO: `YYYY-MM-DD` |
| Platform and architecture | TODO: |
| Node.js | TODO: |
| pnpm | TODO: |
| Install package | `@deepseek-ai/dsh@0.1.0-rc.6` |
| Upstream source | `47f943859bef60e4160492346772ded9b24f765a` |
| `pnpm typecheck` | TODO: exit and concise result |
| `pnpm test` | TODO: exit, pass/fail/skip counts |
| `npm pack --dry-run` | TODO: exit and file count |
| Overlay or profile dump | TODO: observed/skipped; never paste a private absolute path |
| Authenticated synthetic-fixture call | TODO: observed/skipped |
| Cleanup | TODO: package removed and variables unset |

### Learner safety assertions

- [ ] Only the synthetic fixture was configured as `allowedRoot`.
- [ ] No API key, credential value, private path, customer filename, or raw
  Session data appears in this record.
- [ ] The composed configuration was inspected before boot.
- [ ] A successful result did not contain package-script command values.
- [ ] A traversal request produced an error rather than data.
- [ ] Unload or removal left no `inspect_repository` registration.
- [ ] Skipped platform, provider, UI, or reload work is labeled unverified.

Source lesson: [Module 07 — Build Your First DSH Plugin](README.md).

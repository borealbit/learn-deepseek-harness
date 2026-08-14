# Module 11 Release Audit Record

This record separates the maintained reference run from a public release. It
contains no credential, private absolute path, generated profile, or tarball.

## Reference identity

| Field | Recorded value |
|---|---|
| Reference date | `2026-08-14` |
| Platform and architecture | `Linux x86_64` |
| Node.js | `v24.19.0` |
| npm | `11.9.0` |
| pnpm | `11.19.0` |
| Candidate | `@borealbit/dsh-repository-inspector@0.1.0` |
| CLI install target | `@deepseek-ai/dsh@0.1.0-rc.6` |
| Reviewed upstream source | `47f943859bef60e4160492346772ded9b24f765a` |
| Module status | `draft` |
| Publication | None; registry credentials were not used |
| Release decision | **NO-GO** |

The run used only the synthetic fixture. No model credential, provider request,
browser, customer repository, private Session, or registry write was involved.

## Source and release-contract evidence

| Evidence | Observation | Interpretation |
|---|---|---|
| Upstream `master` | Still resolved to `47f943859bef60e4160492346772ded9b24f765a` on the reference date | Immutable source review remains current |
| Upstream root manifest | Declared `0.1.0-rc.5` | Does not prove the tested registry rc.6 bytes |
| Course install pin | `@deepseek-ai/dsh@0.1.0-rc.6` | Exact executable compatibility target |
| Official bundle guide | `dsh.bundle` packages contribute profile layers; tarball/registry and git-source builds differ | Candidate is tested as a tarball bundle and has no git `prepare` hook |
| Official release workflow | Credential-free pack and packed-install verification precede protected same-artifact publication | Course copies the boundary, not upstream's private registry policy |
| Package manifest | `private: true` | npm publication must remain blocked |
| Repository visibility | Private | Public documentation, issues, security route, and discovery topic are not ready |

## Reference commands and results

Commands were executed from `plugins/repository-inspector/`:

```sh
pnpm install --offline --frozen-lockfile --store-dir <documented-temporary-store>
pnpm typecheck
pnpm test
pnpm release:audit
node scripts/release-audit.mjs --draft --json
pnpm release:verify
npm pack --dry-run --json --ignore-scripts
npm pack --pack-destination <temporary-pack-directory>
```

| Command | Expected/observed exit | Recorded result |
|---|---:|---|
| Frozen offline install | `0` | Exact lock was already satisfied from the documented temporary pnpm store |
| `pnpm typecheck` | `0` | Strict TypeScript check completed with no diagnostic |
| `pnpm test` | `0` | 13 passed, 0 failed, 0 skipped |
| Draft text audit | `0` | 21 pass, 4 external warnings, 1 intentional blocker, 12 files, 41,658 unpacked bytes |
| Draft JSON audit | `0` | Same deterministic decision and check ids in schema version 1 |
| Strict audit | `1` | Stopped on `publication.enabled` because `private: true` remains |
| Prospective pack | `0` | Exact 12-file inventory passed exports, exclusion, and size gates |
| Actual pack | `0` | 14,001 packed bytes; 41,658 unpacked bytes; digest recorded below |
| Repeat actual pack | `0` | Second same-run archive was byte-identical to the first |
| Exact rc.6 tarball add/config | `0` | Fresh `web` profile recorded the tarball dependency and appended the bundle layer |
| Loader/Web HTTP boot and stop | `0` | Local root returned HTTP 200; SIGTERM completed with exit 0 |
| Bundle removal/absence | `0` | Dependency, lock entry, bundle list entry, and dumped layer were absent |

The final tarball profile add used the documented temporary pnpm content store,
reused the three registry dependencies, and acquired the one local tarball. It
was not claimed as a fully offline clean-consumer run. The first removal command
omitted the runner's temporary store override and failed before mutation when
pnpm tried to create an unwritable default store; repeating the same removal
with the explicit store path passed. This is runner recovery evidence, not a
general learner requirement.

## Prospective and actual payload

The prospective and actual inventories contained the same 12 files:

```text
CHANGELOG.md
LICENSE
NOTICE
README.md
SECURITY.md
cordis.patch.yml
lib/index.d.ts
lib/index.js
lib/inspect-repository.d.ts
lib/inspect-repository.js
package.json
scripts/create-overlay.mjs
```

| Artifact field | Recorded value |
|---|---|
| Filename | `borealbit-dsh-repository-inspector-0.1.0.tgz` |
| File count | `12` |
| Packed bytes | `14,001` |
| Unpacked bytes | `41,658` |
| SHA-1 reported by npm | `710e42d2f866b19cc7c12966b0cc1816c7bbdb68` |
| SHA-256 | `0242f1c5b72074e4f2e79c354d5c087178721394a5cc990754360430731632d4` |
| SHA-512 integrity | `sha512-/2Z4wxPhvlxTArIWL1PGtOc/By6GEvlORNsXh3xMAuC3zCrahEIeNzg4Ko2R3mP3zFEKB3Vgu8MDNgG2D2mD6w==` |
| Same-run repeat | Byte-identical; `cmp` exit `0` and equal SHA-256 |

Source, tests, fixtures, lockfile, release-audit implementation, build maps,
`node_modules`, generated profiles, and nested tarballs were absent. The archive
stayed under an exact temporary directory and was not committed.

## Release decision

**NO-GO** is expected even when every offline code and payload check passes.
The maintained blockers are:

1. `private: true` prevents npm publication.
2. The repository is private and no intended public plugin repository is set.
3. Public security/support and supported-version routes are not live.
4. npm scope/name/publisher authority is not verified.
5. Protected same-artifact publication and provenance are not configured.
6. Registry install, macOS/Windows, authenticated model, browser, upgrade, and
   independent learner evidence are incomplete.
7. Release notes remain explicitly draft.

No one should remove one blocker and interpret the remaining list as approval.
The Borealbit release owner must review the complete checklist.

## Cleanup record

The local server stopped with exit `0`. The successful temporary profile no
longer contained the package dependency, lock entry, or bundle layer after
removal. No generated audit JSON, profile, npm cache, `lib/` build output, or
tarball is part of the intended commit. Temporary runner paths were removed only
after the remaining repository validation completed.

## Learner evidence

Copy the [release-readiness checklist](RELEASE-READINESS-CHECKLIST.md), record
your own platform, commands, outputs, archive identity, cleanup, and decision,
and explain every difference from this maintained run.

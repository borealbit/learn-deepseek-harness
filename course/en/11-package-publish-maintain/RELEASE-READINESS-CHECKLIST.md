# Module 11 Release-Readiness Checklist

This is the maintained reference review for
`@borealbit/dsh-repository-inspector@0.1.0`. Copy it to a learner evidence
branch before changing learner fields. Never add credentials, private paths,
generated profiles, or tarballs.

Status keys:

- **PASS** — observed in the recorded reference environment.
- **BLOCK** — publication must not proceed.
- **OPEN** — requires evidence outside the offline audit.
- **N/A** — not applicable, with a written reason.

## Candidate identity

| Gate | Reference status | Evidence or remaining owner |
|---|---|---|
| Scoped package name is final | OPEN | Confirm `@borealbit` npm scope ownership and reserve the name; Borealbit release owner |
| Proposed version is valid and unreleased | OPEN | Manifest is `0.1.0`; registry lookup and ownership are not established |
| Copyright owner is Borealbit Technology Limited | PASS | Packaged `NOTICE` |
| Creator attribution names Dom Liu | PASS | Manifest author, README, and `NOTICE` |
| Software license is Apache-2.0 | PASS | Manifest and packaged `LICENSE` agree |
| Repository, directory, homepage, and issue metadata exist | PASS | Prospective manifest audit |
| Public repository is reachable by consumers | BLOCK | Course repository is private at the reference date |
| Package publication is enabled | BLOCK | `private: true` intentionally remains |

## Public contract and compatibility

| Gate | Reference status | Evidence or remaining owner |
|---|---|---|
| Tool name and argument schema documented | PASS | Plugin README and Module 07 build record |
| Result, error, and renderer behavior documented | PASS | Plugin README and runtime tests |
| Configuration fields, defaults, and bounds documented | PASS | Plugin README compatibility/config tables |
| `exports`, `main`, types, and `dsh.bundle.patch` resolve in payload | PASS | Machine release audit |
| Exact tested Node, pnpm, Cordis, Schemastery, and DSH versions recorded | PASS | Manifest, README, and lockfile |
| Install package and immutable source ref recorded separately | PASS | Module metadata and audit record |
| Browser and authenticated model behavior verified | OPEN | Product verification owner |
| macOS and Windows compatibility verified | OPEN | Cross-platform verification owner |
| Supported DSH version range justified by boundary tests | OPEN | Current exact rc.6 evidence is intentionally narrow |

## Permission and security

| Gate | Reference status | Evidence or remaining owner |
|---|---|---|
| Read/write/execute/network behavior disclosed | PASS | README permission boundary and source review |
| Traversal, symlink, acquisition, output, and cancellation boundaries tested | PASS | Module 07 tests and build record |
| Install-time lifecycle scripts reviewed | PASS | No `prepare`; `prepack` builds only for publisher; `prepublishOnly` gates |
| Prospective payload excludes obvious secret-like and development paths | PASS | Release audit and actual packlist |
| Dependency/security review is current | OPEN | Run approved dependency and advisory review before release |
| Public private-reporting route is live | BLOCK | `SECURITY.md` requires one before public release |
| Supported versions and disclosure owner are published | BLOCK | No public version or external support route exists |
| Publisher uses protected identity, 2FA or trusted publishing, and least privilege | OPEN | Borealbit registry/CI owner |
| Provenance links the artifact to the intended public repository | OPEN | Repository/organization alignment and workflow not configured |

## Quality and artifact

| Gate | Reference status | Evidence or remaining owner |
|---|---|---|
| Frozen dependency install succeeds | PASS | Recorded Linux offline replay |
| Strict typecheck passes | PASS | Release audit record |
| Unit, negative, real Tool Runtime, lifecycle, and release-contract tests pass | PASS | Thirteen tests in the recorded run |
| Prospective packlist is bounded and reviewed | PASS | Machine audit |
| Exact tarball is retained temporarily with digest | PASS | Release audit record; tarball not committed |
| A same-run repeat produces identical bytes | PASS | Equal SHA-256 and `cmp` exit `0` in the reference run |
| Exact tarball installs into an isolated rc.6 profile | PASS | Recorded Linux profile smoke |
| Config dump and Loader/Web HTTP boot succeed | PASS | Recorded Linux profile smoke |
| Removal deletes dependency and bundle layer | PASS | Recorded Linux profile smoke |
| The same retained bytes would be supplied to the publish job | BLOCK | No protected artifact-to-publish workflow exists |
| Registry install by exact version succeeds | BLOCK | No version has been published |
| Reproducible pack result is measured across clean runners | OPEN | Same-run determinism passed; independent clean-runner evidence remains |

## Documentation and operations

| Gate | Reference status | Evidence or remaining owner |
|---|---|---|
| Capability, permission, install, config, and minimal example are present | PASS | Plugin README |
| Removal, upgrade, rollback, and cleanup are present | PASS | Plugin README and Module 11 lab |
| Known limitations and non-endorsement are explicit | PASS | README, NOTICE, and course independence notice |
| Changelog contains an Unreleased entry | PASS | Packaged `CHANGELOG.md` |
| Release notes are reviewed and no longer marked draft | BLOCK | Draft notes intentionally remain unpublished |
| Migration note exists for every breaking change | N/A | First candidate has no previous public consumer; re-evaluate at release |
| `dsh-plugin` GitHub topic is on the intended public plugin repository | BLOCK | Repository boundary and visibility are unresolved |
| Support owner and upstream review cadence are assigned | OPEN | Borealbit maintenance owner |
| Incident, deprecation, and consumer notification path is rehearsed | OPEN | Operations owner |

## Publication procedure

- [ ] Version and final notes are committed on the intended release commit.
- [ ] Credential-free CI packs and tests the exact candidate.
- [ ] Artifact name, digest, packlist, and evidence are retained.
- [ ] An authorized reviewer approves the protected publish environment.
- [ ] The publish job downloads the retained artifact and does not rebuild it.
- [ ] Registry name/version/integrity/access/dist-tag are queried after publish.
- [ ] A clean profile installs the exact registry version and passes smoke tests.
- [ ] The source tag points to the version commit only after registry success.
- [ ] Final notes, support window, and migration guidance are public.
- [ ] The failed/partial publication and deprecation playbook is ready.

Every box is intentionally unchecked. This course run never publishes.

## Maintained decision

**NO-GO.** The code and tarball gates pass in the recorded Linux environment,
but publication remains blocked by `private: true`, private repository
visibility, no public security/support route, no protected same-artifact
publisher/provenance path, incomplete product/cross-platform verification, no
registry identity evidence, and draft release notes.

Decision owner: **Borealbit release owner**  
Review date: `2026-08-14`  
Next review trigger: repository/publication architecture approved or a new DSH
package/source reference appears.

## Learner run

| Field | Learner value |
|---|---|
| Date and reviewer | |
| Platform and architecture | |
| Node/npm/pnpm | |
| Candidate name/version | |
| DSH install package | |
| Upstream source commit | |
| Tarball filename and SHA-256 | |
| Type/test result | |
| Audit decision and blocker ids | |
| Profile install/boot/remove result | |
| Remaining external owners | |
| Final GO/NO-GO | |

Explain discrepancies instead of copying the maintained values.

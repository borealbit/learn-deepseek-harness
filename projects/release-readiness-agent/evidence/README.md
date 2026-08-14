# Maintained Golden Evidence

These four files are deterministic, synthetic Module 12 evidence. They are not
production Session logs and do not authorize a release.

| Scenario | Report decision | Mutation | Delegation | Session events |
|---|---|---:|---:|---:|
| `golden-success` | `READY_FOR_HUMAN_REVIEW` | Approved `dist/artifact.json` in a disposable copy | 1 start, 1 disposal | 19 |
| `golden-blocked` | `BLOCKED` | None | 1 start, 1 disposal | 19 |

The blocked scenario creates an innocuous `.env.production` filename and a
test-failure switch only inside a temporary fixture copy. The file value is not
retained. Build is skipped before an approval request.

## File identities for the maintained reference

| File | SHA-256 |
|---|---|
| `golden-success.report.json` | `4ab21d969d8a3506b5df53f361c2781efe5be4d558f0e60802d18e75bf21531d` |
| `golden-success.session.jsonl` | `3d8869489f5729adda629143b8c8c576efdea15355f7c908961dd0e3d5e598e9` |
| `golden-blocked.report.json` | `eff8fd33ef4213e79961d0745634e814a9d4d1a69083ccd5e1022965582122b7` |
| `golden-blocked.session.jsonl` | `aaf32b8b1c144e2dfdd3f6bb1e51f17712d2b9a58aed339ad88040966f67bb9c` |

The report embeds the digest of its paired Session file. The report file itself
is not self-hashed inside its own JSON; use the table above and repository blob
identity for that outer check.

## Regeneration

The materializer refuses to write without an explicit flag:

```sh
npm run evidence -- --approve-write-evidence
```

After regeneration, run `npm test`, validate both JSONL files, compare all four
digests, inspect the semantic diff, and explain any change. Never edit a decision
or digest by hand to make a failing run look successful.


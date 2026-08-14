# Contributing

Thank you for helping make Learn DeepSeek Harness accurate, practical, and safe.

## Current scope: English first

English under `course/en/` is the only active edition until English v1 is complete. Simplified Chinese and Japanese localization is intentionally paused. Please do not open translation-only pull requests during this phase; corrections and new technical content must land in English first.

## Good contributions

- Corrections backed by official source links or reproducible evidence
- Small runnable labs
- Plugin tests and compatibility fixes
- Clear troubleshooting notes
- Accessibility, structure, and navigation improvements
- Clean-platform verification reports for draft lessons

## Before starting

1. Read [AGENTS.md](AGENTS.md) and [docs/VERSIONING.md](docs/VERSIONING.md).
2. Check the roadmap and existing work.
3. Keep one pull request focused on one module or concern.
4. For substantial new content, describe the proposed outcome and evidence before drafting a long lesson.
5. Do not change a module to `verified` without all required evidence.

## Lesson requirements

Every technical lesson must include:

- learning objective
- prerequisites
- exact installable package version
- immutable upstream source reference
- source-review and verification dates
- accurate status and tested platforms
- bounded steps and expected results
- safety or permission notes
- troubleshooting section
- completion check
- next lesson

Start from [templates/module-template.md](templates/module-template.md).

## Evidence standards

Prefer, in order:

1. Official DeepSeek Harness source code
2. Official DeepSeek Harness documentation
3. Official package-registry metadata
4. Official Cordis source and documentation
5. Reproducible experiments stored in this repository
6. Clearly labeled community references

Do not present search snippets, social posts, or unverified third-party tutorials as authoritative technical behavior.

## Code standards

- Never commit real credentials, tokens, private endpoints, or personal paths.
- Keep examples minimal enough to audit.
- Use least-privilege permissions.
- Include removal or rollback instructions.
- Pin dependencies when reproducibility depends on them.
- Add an automated test or a documented manual check for behavior changes.

## Pull request checklist

- [ ] The change has one clear purpose.
- [ ] Relative links resolve.
- [ ] Commands and examples were run in a clean environment, or the draft clearly says what remains unverified.
- [ ] The exact install package and upstream source reference are recorded.
- [ ] Security and permission implications are explained.
- [ ] Only canonical English content was developed during the English-first phase.
- [ ] No official affiliation is implied.

## Future localization

After English v1, localization will preserve module numbers, code, identifiers, paths, API names, upstream references, and expected outcomes. Japanese content will require natural-language review before parity is claimed. The repository owner will explicitly reopen localization work at that milestone.

## Contribution licensing

This repository uses the license boundaries defined in [LICENSES.md](LICENSES.md): educational content is licensed under CC BY 4.0, while software and code samples are licensed under Apache-2.0.

By intentionally submitting a contribution for inclusion, you confirm that you have the right to submit it and agree that it will be licensed under the license applicable to the material you modify. A contribution that mixes content and software follows the mixed-file rules in `LICENSES.md`. Clearly identify third-party material and its license; do not submit material whose terms are incompatible with this repository.

## Community conduct

Be precise, respectful, and generous with evidence. Critique implementations and claims, not people. Security concerns should be disclosed responsibly and should not include live secrets or instructions that enable abuse.

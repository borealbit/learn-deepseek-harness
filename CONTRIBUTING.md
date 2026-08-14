# Contributing

Thank you for helping make Learn DeepSeek Harness accurate, practical, and safe.

## Good contributions

- Corrections backed by official source links or reproducible evidence
- Small runnable labs
- Plugin tests and compatibility fixes
- Clear troubleshooting notes
- Simplified Chinese and Japanese translation improvements
- Accessibility, structure, and navigation improvements

## Before starting

1. Read [AGENTS.md](AGENTS.md) and [docs/VERSIONING.md](docs/VERSIONING.md).
2. Check the roadmap and existing work.
3. Keep one pull request focused on one module or concern.
4. For substantial new content, describe the proposed outcome and evidence before drafting a long lesson.

## Canonical language and translations

English under `course/en/` is the canonical content.

Translation workflow:

1. Verify the English lesson.
2. Copy the module structure without changing its number or learning outcome.
3. Preserve code, identifiers, file paths, API names, and upstream references.
4. Translate meaning rather than sentence order.
5. Mark untranslated or uncertain material explicitly.
6. Require a technical review and a language review before declaring parity.

Do not modify the Chinese or Japanese edition to introduce technical content that is absent from the English source. Propose the improvement to the English source first, then translate it.

## Lesson requirements

Every technical lesson must include:

- learning objective
- prerequisites
- exact upstream repository reference
- verification date and status
- bounded steps
- expected result
- safety or permission notes
- troubleshooting section
- completion check
- next lesson

Start from [templates/module-template.md](templates/module-template.md).

## Evidence standards

Prefer, in order:

1. Official DeepSeek Harness source code
2. Official DeepSeek Harness documentation
3. Official Cordis source and documentation
4. Reproducible experiments stored in this repository
5. Clearly labeled community references

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
- [ ] Commands and examples were run in a clean environment.
- [ ] The verified upstream reference is recorded.
- [ ] Security and permission implications are explained.
- [ ] English canonical content was updated first.
- [ ] Translation status is accurate.
- [ ] No official affiliation is implied.

## Community conduct

Be precise, respectful, and generous with evidence. Critique implementations and claims, not people. Security concerns should be disclosed responsibly and should not include live secrets or instructions that enable abuse.

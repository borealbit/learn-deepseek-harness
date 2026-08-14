# Safe Change Working Agreement

These instructions apply to the complete fixture.

- Read `CHANGE-REQUEST.md`, the current implementation, and the current tests before editing.
- Modify only `src/slugify.js` and `test/slugify.test.js`.
- Keep the exported `slugify(value)` API and package metadata unchanged.
- Do not add dependencies, use network access, generate files, or change configuration.
- Add a focused regression test first and run it before changing implementation.
- If the new test fails for an unrelated reason, stop and report the evidence.
- Make the smallest implementation change that satisfies the request.
- Run `npm test`, `git diff --check`, `git status --short`, and inspect the complete diff.
- Do not commit or push; the learner owns the final review decision.

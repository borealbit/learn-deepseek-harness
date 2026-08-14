# Change Request — Underscore Separators

## Goal

Treat one or more underscores as word separators in `slugify`.

## Acceptance criteria

- `slugify('Alpha__Beta')` returns `alpha-beta`.
- Runs of spaces, underscores, and existing hyphens collapse to one hyphen.
- Existing case, whitespace, hyphen, and punctuation behavior remains covered and passing.
- The exported function name and argument shape do not change.
- No dependency or package metadata changes.

## Allowed paths

- `src/slugify.js`
- `test/slugify.test.js`

Add a focused regression test, observe its expected pre-fix failure, make the minimal implementation change, run the complete test suite, and stop before commit.

# Safe Change Workspace

A synthetic, dependency-free Node.js fixture for Module 05. It contains a small `slugify` function, a healthy baseline test suite, and one intentionally unmet request in [CHANGE-REQUEST.md](CHANGE-REQUEST.md).

## Baseline

```sh
npm test
```

Expected baseline: three tests pass. The requested underscore behavior is deliberately absent; do not “fix” the committed fixture itself. Module 05 copies it to a temporary Git repository before any agent changes it.

## Safety boundary

- Synthetic data only; no credentials or external services.
- No package dependencies and no network access required.
- Only `src/slugify.js` and `test/slugify.test.js` may change during the exercise.
- The agent must stop before commit or push.
- Run the lab only in the disposable copy created by the module.

## Compatibility

- Course package: `@deepseek-ai/dsh@0.1.0-rc.6`
- Reviewed upstream source: `47f943859bef60e4160492346772ded9b24f765a`
- Runtime: Node.js 24 LTS or a current Node.js release with the built-in test runner

## Cleanup

Stop the temporary Web process with `Ctrl+C`. Remove the experiment directory only after reviewing and sanitizing the required checklist. The fixture in this repository should remain unchanged.

## License

This executable example is licensed under Apache-2.0. See the repository's `LICENSE-CODE` and `LICENSES.md` files.

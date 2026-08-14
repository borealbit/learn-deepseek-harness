# Extension Selection Lab

A synthetic, dependency-free Node.js lab for Module 06. It provides three integration scenarios and validates the structure of a completed extension decision matrix without installing a Skill, plugin, or MCP server.

## Run the lab

From the repository root:

```sh
MODULE06_WORK="$(mktemp -d)"
cp course/en/06-plugins-tools-skills-mcp/EXTENSION-DECISION-MATRIX.md \
  "$MODULE06_WORK/extension-decision-matrix.md"
sed -n '1,240p' projects/extension-selection-lab/SCENARIOS.md
```

Complete the temporary matrix, then run:

```sh
node projects/extension-selection-lab/src/validate-matrix.js \
  "$MODULE06_WORK/extension-decision-matrix.md"

npm --prefix projects/extension-selection-lab test
```

The validator checks required sections, score arithmetic, evidence rows, placeholder removal, and completion boxes. It deliberately does not decide whether an architecture is correct.

## Expected behavior

- The untouched course template fails validation because it contains `TODO:` markers and unchecked boxes.
- A completed matrix with all four candidate rows, six integer scores per row, correct totals, evidence labels, hard vetoes, and checked attestations passes.
- The automated test suite exercises one complete example and several failure modes.

## Safety boundary

- Synthetic scenarios only; no credentials, network calls, package installation, or external services.
- The validator reads one local Markdown file and writes nothing.
- Use a temporary copy of the worksheet; do not replace the course template with learner evidence.
- The project verifies completeness, not security, interoperability, or architectural correctness.

## Compatibility

- Course package: `@deepseek-ai/dsh@0.1.0-rc.6`
- Reviewed upstream source: `47f943859bef60e4160492346772ded9b24f765a`
- Runtime: Node.js 24 LTS or a current Node.js release with the built-in test runner

## Cleanup

Inspect the value of `MODULE06_WORK`, save any sanitized deliverable elsewhere if desired, and remove only that temporary directory:

```sh
rm -r "$MODULE06_WORK"
```

## License

The executable validator, tests, and package manifest are licensed under Apache-2.0. Educational prose follows the repository's mixed-material rules. See `LICENSE-CODE` and `LICENSES.md` at the repository root.

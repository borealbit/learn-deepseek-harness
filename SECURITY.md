# Security Policy

Learn DeepSeek Harness is educational material with executable fixtures. Treat
its scripts, plugins, provider examples, and agent workflows as untrusted until
you have reviewed their permissions and tested them in a disposable
environment.

## Supported version

Security fixes apply to the current `main` branch. Draft lessons are not a
production support promise, and a module marked `verified` would describe only
the evidence listed in that module and the verification matrix.

## Report a vulnerability

Use GitHub's **Report a vulnerability** form for this repository when it is
available. That creates a private security advisory visible to maintainers.

If the private form is not available, open a minimal issue that contains no
exploit, credential, private repository name, private prompt, customer data, or
Session trace. Ask a maintainer to establish a private reporting channel before
sharing sensitive details.

Do not use a public issue or pull request for a vulnerability that could expose
users, secrets, repositories, or infrastructure.

Include, when safe:

- the affected module, project, plugin, path, and commit;
- the expected and observed permission boundary;
- the smallest synthetic reproduction;
- impact and preconditions;
- whether a credential, filesystem write, subprocess, network route, approval,
  or persistence boundary is involved; and
- a proposed mitigation, if known.

## Scope priorities

Reports are especially useful when they involve:

- credential disclosure or retention;
- path traversal or access outside a configured root;
- command execution beyond a declared allowlist;
- approval bypass, replay, or confused-deputy behavior;
- unsafe handling of model, Tool, Session, or workflow output;
- package, workflow, or release supply-chain integrity; or
- committed private data or realistic secret material.

General upstream DeepSeek Harness vulnerabilities should be reported through
the upstream project's own security route. Course-specific examples,
instructions, fixtures, or Borealbit-owned code should be reported here.

## Safe handling

- Use synthetic data and disposable accounts.
- Do not test against systems you do not own or lack permission to assess.
- Do not retain or redistribute credentials or private traces.
- Stop a reproduction when it would cross the documented scope.
- Coordinate disclosure with the relevant maintainers.

# Extension Selection Scenarios

These scenarios are synthetic. Treat stated facts as observed requirements, architectural conclusions as inferred, and anything not stated as unverified.

## S1 — Repository release playbook

A product repository needs a repeatable release-review procedure. The procedure should explain how to inspect the changelog, dependency lockfile, tests, build output, and release notes. It includes checklists, good and bad examples, and references to repository policy.

Constraints:

- Existing Harness file and shell Tools already provide every required operation.
- The playbook must live with the repository and take precedence over broader personal guidance when names collide.
- The full instructions should enter context only when relevant.
- No new credential, network destination, background process, browser UI, persistence, or organization-wide Tool policy is required.
- Maintainers should be able to review the instructions and supporting files in an ordinary pull request.

Success means the agent can discover the repository-scoped guidance, load it on demand, and use existing approved capabilities to follow the review procedure.

## S2 — Shared issue service

An internal platform team maintains an issue service with authenticated search, create, comment, and label operations. DSH and at least two other compatible MCP hosts must use the same integration. The service has its own deployment, release cadence, on-call owner, and audit logs.

Constraints:

- Search results must be bounded to 50 items and exclude private fields by default.
- Create, comment, and label are external writes and require narrow authorization scopes plus per-operation review in each host.
- The service may be unavailable; clients need explicit discovery, call timeout, retry, and unknown-outcome rules.
- Credentials remain outside model context and belong to the service connection, not a Skill body.
- No DSH-specific settings page, cross-Tool policy hook, or same-process service is required.
- Interoperability must be proven against all three named hosts before production use.

Success means one independently deployed integration supplies bounded, model-callable issue operations to compatible hosts without duplicating service logic in each host.

## S3 — Organization policy gate

An organization must inspect every Tool call in DSH before execution. A final organization denial cannot be weakened by another extension. The organization also needs an immutable result observation for its audit sink and a Web UI health indicator for policy connectivity.

Constraints:

- Enforcement must run whether or not the model remembers to request a policy check.
- The policy decision needs call context and must fail closed for protected operations when the policy service is unavailable.
- Result observation must not mutate the finalized result.
- Configuration changes must hot-replace the integration without duplicate listeners, guards, timers, or network connections.
- The UI must display health without exposing credentials or raw policy payloads.
- Other MCP hosts do not need this integration.

Success means DSH lifecycle owns policy interception, monotonic denial, audit observation, UI contribution, configuration validation, and complete cleanup.

## Deliberately unspecified

For every scenario, record these as unverified until a source or experiment resolves them:

- exact package, repository, or deployment identity;
- operating system and process isolation;
- credential storage implementation;
- production latency and availability targets;
- data retention and regulatory requirements; and
- final owner approval.

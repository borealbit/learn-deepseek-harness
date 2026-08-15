# Provider Configuration Lab

This dependency-free Module 04 lab turns provider setup into a reviewable
boundary plan before a learner opens a settings screen or supplies a
credential. It validates three synthetic strategies:

- a hosted catalog provider;
- a custom OpenAI-compatible HTTPS endpoint; and
- a loopback-only local endpoint.

The plan format is **course-owned architecture evidence**, not a drop-in
DeepSeek Harness configuration schema. The validator never reads an environment
variable, resolves a credential, calls a provider, writes a file, or starts the
harness.

## Compatibility reference

- Install target: `@deepseek-ai/dsh@0.1.0-rc.6`
- Source reviewed: DeepSeek Harness commit
  [`47f943859bef60e4160492346772ded9b24f765a`](https://github.com/deepseek-ai/deepseek-harness/commit/47f943859bef60e4160492346772ded9b24f765a)
- Runtime for this lab: Node.js `^22.19.0 || >=24.0.0` and npm `11.9.0`

The relevant upstream contracts are the immutable
[provider guide](https://github.com/deepseek-ai/deepseek-harness/blob/47f943859bef60e4160492346772ded9b24f765a/docs/user/guide/providers.md),
[credential subsystem](https://github.com/deepseek-ai/deepseek-harness/blob/47f943859bef60e4160492346772ded9b24f765a/docs/subsystems/credentials.md),
[Workspace subsystem](https://github.com/deepseek-ai/deepseek-harness/blob/47f943859bef60e4160492346772ded9b24f765a/docs/subsystems/workspace.md),
and [Session subsystem](https://github.com/deepseek-ai/deepseek-harness/blob/47f943859bef60e4160492346772ded9b24f765a/docs/subsystems/session.md).

## What the plan records

| Boundary | Recorded decision | Rejected condition |
|---|---|---|
| Provider | Catalog, compatible remote, or local | Unknown provider kind |
| Endpoint | Scheme, host, and explicit allowlist | Userinfo, query, fragment, remote HTTP, or unlisted host |
| Credential | Environment-variable **name** or no credential | Secret values and unsupported fields |
| Model | Bounded ID and required capabilities | Empty, malformed, or duplicate values |
| Workspace | Synthetic relative label and no sensitive data | Absolute path, traversal, or sensitive-data opt-in |
| Session | Persistence, resume, and fork policy | Unknown lifecycle policy |
| Network | Explicit hosts and loopback policy | Remote host in a local-only plan |

The credential reference such as `DEEPSEEK_API_KEY` is only a variable name.
The fixture contains no value for that variable.

## Permission and threat model

The lab assumes a plan file may be authored incorrectly or maliciously. Its
authority is intentionally small:

- reads only the committed synthetic JSON fixture;
- accepts in-memory JavaScript objects;
- performs deterministic validation and SHA-256 hashing;
- emits only a sanitized summary; and
- has no dependency, subprocess, environment, filesystem-write, browser, or
  network capability.

It defends against accidental literal credentials, endpoint userinfo and query
leakage, remote cleartext HTTP, allowlist mismatch, local-provider escape,
workspace traversal, schema smuggling through unknown fields, and ambiguous
duplicate capabilities or hosts.

It does **not** prove provider authenticity, DNS behavior, TLS policy,
credential-manager security, model compatibility, cost controls, Workspace
isolation, Session persistence, or any actual DSH runtime behavior.

## Run the lab

From this directory:

```bash
npm run check
npm test
npm run demo
```

No install step is required because the lab has no dependencies. The demo
validates all three fixtures and prints each provider kind, model ID,
credential mode, and deterministic plan digest. It never prints a secret.

Expected success begins like this; digests are deterministic but omitted here
to keep the example short:

```text
Validated 3 sanitized provider plans.
PASS hosted-deepseek ...
PASS compatible-gateway ...
PASS local-loopback ...
```

The test suite also proves intentional failures for secret-shaped values,
remote HTTP, endpoint metadata, allowlist mismatches, non-loopback local
routes, unsafe workspace labels, unknown fields, and malformed capabilities.

## Add a synthetic scenario

1. Copy one object in [`fixtures/provider-plans.json`](fixtures/provider-plans.json).
2. Change only non-secret values and keep the workspace label under
   `synthetic/`.
3. Use an `.example`, `.test`, loopback, or explicitly documented provider
   hostname.
4. Refer to a credential by environment-variable name; never insert its value.
5. Run all three commands above.
6. Review the normalized summary and digest before using the decisions in the
   Module 04 strategy worksheet.

## Inputs and outputs

`validateProviderPlan(value)` accepts one plain object and returns:

```js
{
  plan: { /* normalized, secret-free decisions */ },
  digest: "sha256:<64 lowercase hexadecimal characters>"
}
```

Invalid input throws a `ProviderPlanError` whose message identifies the
boundary but never includes a submitted secret-shaped value.

## Cleanup

The validator creates no runtime state. If you copied a fixture, delete only
your copy after reviewing its diff. Do not add `.env`, credential-manager
exports, real Session logs, or provider responses to this directory.

## Remaining Module 04 verification

Passing this lab does not verify Module 04. A clean authenticated exercise must
still configure a real provider through the documented UI or runtime, confirm
credential handling, isolate two Workspaces, resume and fork Sessions, restart
the runtime, inspect sanitized evidence, repeat on required platforms, and pass
independent learner review. Track those gates in the
[verification matrix](../../docs/VERIFICATION-MATRIX.md).

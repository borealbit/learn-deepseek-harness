# Security Policy

## Supported versions

No public version is currently supported because this package has not been
published. The source fixture remains a draft pinned to the compatibility table
in [README.md](README.md). A future release must state its support window and
must not imply support for untested DeepSeek Harness revisions.

## Reporting a vulnerability

Do not open a public issue for a suspected vulnerability. Use the repository's
private security-advisory channel after the repository is public, and include:

- the exact package version or commit;
- a minimal synthetic reproduction;
- the affected permission or data boundary;
- expected and observed behavior; and
- whether credentials, private paths, or external side effects may be involved.

Do not include credentials, customer data, private repository contents, or raw
production Session logs. If no private reporting route is available, stop the
release rather than publishing a public exploit description.

## Response expectations

Before a public release, Borealbit must publish an owned security contact,
triage severity, define a disclosure timeline, and document supported versions.
Until those gates pass, the maintained release decision is **NO-GO**.

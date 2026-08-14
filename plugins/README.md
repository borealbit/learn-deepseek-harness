# Course Plugins

This directory contains plugins authored and maintained as part of the course.

## Course examples

| Plugin | Course role | Status |
|---|---|---|
| [Repository Inspector Tool](repository-inspector/) | First typed, bounded Tool plugin and Module 11 release candidate | Draft — release audit and tarball smoke pass; publication intentionally blocked |
| [Tool Policy Gate](tool-policy-gate/) | Hook, monotonic guard, and log-only audit example | Draft — local tests and Loader/Web smoke pass; complete product verification pending |
| Release Report Renderer | Structured result and presentation example | Planned |
| Evaluation Recorder | Trace and metrics example | Planned |

## Publication standard

A course plugin is not considered release-ready until it has:

- a narrow and documented capability
- explicit permissions and data-flow notes
- typed configuration and tool schemas
- unit tests and a runtime smoke test
- minimal installation and removal steps
- an immutable upstream compatibility reference
- known limitations
- no bundled credentials or private data
- a reviewed prospective tarball with complete exports and legal notices
- exact-version clean-consumer install, boot, removal, and rollback evidence
- a security-reporting route, release notes, and upstream maintenance owner
- protected publication of the same reviewed bytes, never a rebuild

Community plugin links belong under `resources/` and must be labeled as third-party. This directory is reserved for code maintained by this project.

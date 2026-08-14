# Course Plugins

This directory contains plugins authored and maintained as part of the course.

## Course examples

| Plugin | Course role | Status |
|---|---|---|
| [Repository Inspector Tool](repository-inspector/) | First typed, bounded Tool plugin | Draft — local tests pass; complete product verification pending |
| Permission Gate | Hook and fail-closed policy example | Planned |
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

Community plugin links belong under `resources/` and must be labeled as third-party. This directory is reserved for code maintained by this project.

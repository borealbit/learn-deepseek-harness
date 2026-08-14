# Synthetic Repository Instructions

- Treat this fixture as read-only unless one exact command receives a one-shot
  approval.
- Run only the argv arrays declared in `.release-readiness.json`.
- The build command may write only `dist/artifact.json`.
- Never publish, contact a registry, read environment credentials, or follow a
  symbolic link.
- A successful report is evidence for human review, not release authorization.


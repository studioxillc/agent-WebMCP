# Bugfix Plans & Root Cause Analyses

This directory stores active bug reports, reproduction steps, root cause analyses, and post-mortems.

## Workflow

1. Create a document `BUG-XXX-<description>.md` when investigating a bug.
2. Outline reproduction steps, exact error tracebacks, and root cause hypothesis.
3. Verify fix with unit test in `bun test`.
4. Move completed bugfix plan into `docs/archive/` once closed.

---
name: doc-workflow
description: Workflow for managing documentation, PRDs, Epics, Bugfix plans, and archiving completed tasks into docs/archive/.
---

# Documentation & Archiving Workflow Skill

Use this skill when managing tasks, updating project status, creating plans, or archiving completed work.

## Subdirectory Structure

- `docs/architecture/`: System designs and Architectural Decision Records (ADRs).
- `docs/prd/`: Product Requirement Documents defining new capabilities.
- `docs/epics/`: Task breakdowns for active development epics.
- `docs/bugfix/`: Plans for diagnosing and resolving bugs.
- `docs/project-management/`: Active roadmaps and project tracking.
- `docs/archive/`: **Closed folder archiving completed tasks, epics, bugfixes, and PRDs.**

## Lifecycle of a Task Document

```
[PRD / Epic Created in docs/epics/]
           │
           ▼
 [Implementation & Testing]
           │
           ▼
   [Task Completion]
           │
           ▼
[Move to docs/archive/ folder & Update docs/archive/README.md]
```

## Archive Commands (Git / Shell)

When an epic in `docs/epics/EPIC-XXX.md` is completed:

```bash
mv docs/epics/EPIC-XXX.md docs/archive/EPIC-XXX.md
```

Then append an entry to `docs/archive/README.md` summarizing the completed epic, date, and verified build status.

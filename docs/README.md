# Documentation Directory Taxonomy

This directory maintains structural context, design decisions, product requirements, active task breakdowns, and closed archives for the **agent-WebMCP** project.

## Directory Overview

| Subdirectory | Description | Status |
| :--- | :--- | :--- |
| [`architecture/`](./architecture) | Architectural Decision Records (ADRs) & high-level component diagrams | Active |
| [`prd/`](./prd) | Product Requirements Documents (PRDs) defining feature scope | Active |
| [`epics/`](./epics) | Active development epics and granular task lists | Active |
| [`bugfix/`](./bugfix) | Active bugfix plans, root-cause analyses, and post-mortems | Active |
| [`project-management/`](./project-management) | Project roadmap, milestone status, and release planning | Active |
| [`archive/`](./archive) | **Closed folder archiving completed epics, PRDs, and task documents** | Closed / Archive |

---

## Workflow Instructions for Agents & Developers

1. **Creating Plans**: Place new Epics in `docs/epics/` and PRDs in `docs/prd/`.
2. **Executing Tasks**: Update progress in the corresponding Epic document.
3. **Closing Tasks**: When an Epic or Bugfix is fully verified, move the file into `docs/archive/` and update `docs/archive/README.md`.

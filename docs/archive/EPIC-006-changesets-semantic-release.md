# EPIC-006: Monorepo Changesets & Automated Semantic Release

- **Status**: Completed
- **Target Completion**: Phase 1

## Objective

Set up Changesets (`@changesets/cli` & `changesets/action`) in the monorepo for automated semantic versioning, multi-package publishing (`@thestudioxi/webmcp` and `@webmcp/adapter-*`), automated Release PR creation, and NPM deployment via GitHub Actions.

## Tasks

- [x] Install `@changesets/cli` in root `package.json`.
- [x] Initialize `.changeset/config.json` for monorepo workspaces.
- [x] Add changeset scripts (`changeset`, `version-packages`, `publish-packages`) to root `package.json`.
- [x] Add `publishConfig` and build scripts to all adapter package manifests (`packages/adapters/*`).
- [x] Update `.github/workflows/release.yml` with `changesets/action` workflow.
- [x] Generate initial changeset documenting initial SDK & Adapters release.
- [x] Verify build, typecheck, and release dry-run.

# AGENTS.md - AI Agent Operating Guidelines

Welcome AI Agent! You are working on **agent-WebMCP**, an open-source SDK and toolset built with **Bun** and **TypeScript** to enable Web AI agents to communicate with local browser content and local network resources via the Model Context Protocol (WebMCP).

## Core Principles

1. **Bun & TypeScript First**: Always use `bun` as the default runtime, test runner, and package manager. Avoid `npm` or `node` unless explicitly requested.
2. **AI-Native Architecture**: Code, documentation, and agent skills are co-located in this repository. Keep schemas explicit and types fully documented.
3. **Structured Task & Doc Management**:
   - Maintain the `docs/` folder for system context and task tracking.
   - Use `docs/archive/` to store completed Epics, PRDs, and closed bugfixes.
4. **Codebase Understanding with Graphify**:
   - Before executing large refactors or navigating multi-file relationships, run `bun run graphify` or inspect existing `graphify-out/` artifacts.

---

## Directory Taxonomy

- `packages/sdk/`: Core `@thestudioxi/webmcp` package for WebMCP clients, servers, and transports.
- `examples/agentic-app/`: Example AI agent application using WebMCP with Pi Agent / DeepAgent pattern.
- `skills/`: Project-specific skills for AI assistants working in this repository.
- `docs/`: Repository documentation hierarchy:
  - `docs/architecture/`: ADRs (Architectural Decision Records) & system design.
  - `docs/prd/`: Product Requirements Documents.
  - `docs/epics/`: Task breakdowns for active features.
  - `docs/bugfix/`: Bugfix plans, reproduction steps, and root-cause post-mortems.
  - `docs/project-management/`: Roadmaps and active milestone tracking.
  - `docs/archive/`: **Closed folder archiving completed tasks and documents.**

---

## Task Lifecycle & Archiving Rules

When working on a feature or bugfix:
1. **Planning**: Create or update an Epic in `docs/epics/` or Bugfix plan in `docs/bugfix/`.
2. **Execution**: Implement changes incrementally with test coverage in `packages/sdk` or `examples/`.
3. **Verification**: Run `bun run check` and `bun test`.
4. **Archiving**: Once an Epic or Bugfix is fully verified and landed:
   - Move the document from `docs/epics/` or `docs/bugfix/` into `docs/archive/`.
   - Update `docs/archive/README.md` with a summary of completed work.

---

## Code Style & Standards

- **Strict Types**: No implicit `any`. Use strict TypeScript interfaces.
- **Async Safety**: Always handle promise rejections and connection disconnections gracefully in transports.
- **Imports**: Use explicit extensionless relative imports or workspace package aliases (`@webmcp/sdk`).

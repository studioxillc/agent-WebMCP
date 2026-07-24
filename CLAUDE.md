# CLAUDE.md - Developer & Agent Quick Reference

## Quick Commands
- **Install Dependencies**: `bun install`
- **Build Core SDK**: `bun run build`
- **Run Type Checks**: `bun run check`
- **Run Unit Tests**: `bun test`
- **Run Graphify Indexing**: `bun run graphify`
- **Run Example Agent App**: `bun run example:agent`

## Release & Publishing Workflow
- **Trigger Automatic NPM Release**: Create and push a git tag (e.g. `git tag v0.1.0 && git push origin v0.1.0`).
- **NPM Token**: Set `NPM_TOKEN` secret in GitHub Repository Settings -> Secrets and variables -> Actions.

## Core Architecture
- **`packages/sdk` (`@webmcp/sdk`)**: TypeScript implementation of WebMCP Client, Server, and Transports (WebSocket, MessageChannel).
- **`examples/agentic-app`**: Sample agent runner demonstrating WebMCP tool execution.
- **`docs/`**: Docs workspace (Architecture, PRDs, Epics, Bugfixes, and `docs/archive/` for finished tasks).

## Rules & Conventions
- Use `bun` exclusively as runtime and test runner.
- Maintain strict TypeScript types across all workspace packages.
- Move completed Epics to `docs/archive/` upon task completion.

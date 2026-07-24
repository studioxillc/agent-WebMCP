---
name: graphify-codebase
description: Instructions for running and querying Graphify codebase AST graphs to understand module dependencies and component relationships.
---

# Graphify Codebase Skill

Use this skill when analyzing multi-file code changes, tracing imports, or inspecting cross-package dependencies in the agent-WebMCP repository.

## Running Graphify

To update or generate the codebase graph report:

```bash
bun run graphify
```

This runs Tree-Sitter AST parsing locally and creates:
- `graphify-out/graph.json`: Machine-readable node and edge topology.
- `graphify-out/GRAPH_REPORT.md`: Human-readable summary of components and dependencies.
- `graphify-out/graph.html`: Interactive browser visualization of the codebase graph.

## Agent Guidelines

- Check `graphify-out/GRAPH_REPORT.md` before doing major architectural refactors.
- Trace upstream & downstream callers when modifying core SDK interfaces in `packages/sdk/src/types/index.ts`.

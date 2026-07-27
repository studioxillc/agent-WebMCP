# PRD-002: W3C WebMCP Standard Polyfill & Declarative HTML Attributes

- **Status**: Draft / Active (Phase 2)
- **Target Version**: v1.1.0
- **Primary Package**: `@thestudioxi/webmcp`
- **Spec Repository**: [`webmachinelearning/webmcp`](https://github.com/webmachinelearning/webmcp)

## Problem Statement

The W3C Web Machine Learning Community Group is incubating the WebMCP standard (`navigator.modelContext` and declarative `<form toolname="...">` attributes). Browsers will take time to ship native implementations. Web application developers need a lightweight production-grade polyfill today to make their sites AI-agent-ready using standard APIs before browser vendor support lands.

## Goals

1. **Browser Polyfill**: Implement `window.navigator.modelContext` object complying with W3C `webmcp-types`.
2. **Declarative Form Parser**: Automatically parse DOM elements with `toolname`, `tooldescription`, and `toolparam` attributes into executable WebMCP tool definitions.
3. **Spec Drift Audit**: Maintain 100% type alignment with upstream `webmcp-types` and provide an automated CI check.

## Requirements

### Functional

1. **`navigator.modelContext` Polyfill**:
   - `navigator.modelContext.registerTool(toolDefinition)`
   - `navigator.modelContext.unregisterTool(name)`
   - `navigator.modelContext.listTools()`
   - `navigator.modelContext.callTool(name, params)`
   - Expose events/callbacks for tool invocation by connected WebMCP bridges.

2. **Declarative HTML Attribute Parser**:
   - Query selector for `<form toolname="...">` or any element with `toolname` attributes.
   - Extract `tooldescription` and input `<input toolparam="...">` parameters.
   - Automatically handle form submission by routing parameters through WebMCP tool execution.

3. **Upstream Compatibility & Automated Spec Drift Audit**:
   - Support `webmcp-types` definitions without breaking changes to existing `@thestudioxi/webmcp` SDK exports.
   - Implement `bun run check:spec-drift` CI workflow step to validate `@thestudioxi/webmcp` public interface signatures against published `webmcp-types` definitions and flag missing APIs or type drift in GitHub Actions.

### Non-Functional

- **Zero Bundle Overhead**: Polyfill feature module tree-shakeable for applications that only require client/server SDK logic.
- **Safety**: Safe global window injection (checks `if (!('modelContext' in navigator))`).
- **Tests**: Comprehensive unit tests covering polyfill registration, declarative DOM parsing, and JSON-RPC bridging.
- **CI Validation**: Automated PR checks ensuring zero spec drift and 100% type compliance.

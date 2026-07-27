---
name: webmcp-spec-sync
description: Guidelines and procedure for syncing @thestudioxi/webmcp with the official W3C WebML CG WebMCP specification (webmachinelearning/webmcp), auditing spec drift, and patching gaps or polyfills.
---

# WebMCP Specification Synchronization & Patching Skill

Use this skill when auditing, implementing, or updating `@thestudioxi/webmcp` to align with the official W3C WebMCP specification (`webmachinelearning/webmcp`) and `webmcp-types`.

## Scope & Purpose

The official W3C WebMCP specification is hosted at [`webmachinelearning/webmcp`](https://github.com/webmachinelearning/webmcp).

This skill guides AI assistants through:
1. **Auditing Spec Drift**: Comparing current SDK types (`packages/sdk/src/types/`) against the official W3C specification drafts and `webmcp-types`.
2. **Proactive Polyfilling**: Adding browser shims (e.g. `navigator.modelContext`, declarative `<form toolname="...">` attribute parsers) ahead of native browser implementation.
3. **Patching Upstream Issues**: Creating resilient compatibility layers or temporary shims when W3C spec proposals or type definitions contain gaps or unreleased fixes.
4. **Verification & Tests**: Validating that shims and polyfills pass `bun test` and `bun run check` without introducing breaking changes.

---

## Synchronization Checklist

### Step 1: Spec Audit
When requested to check alignment with the W3C WebMCP spec:
- Inspect W3C spec repository (`webmachinelearning/webmcp`):
  - `index.bs` (Bikeshed specification source)
  - `declarative-api-explainer.md` (HTML `<form>` attributes)
  - Open Issues & PRs for upcoming API revisions
- Check official type package: `webmcp-types` on npm.
- Compare with `@thestudioxi/webmcp` type definitions:
  - `packages/sdk/src/types/index.ts`
  - `packages/sdk/src/frontend/bridge.ts`

### Step 2: Implementation of Shims & Polyfills
When a new spec feature or gap is identified:
- **Browser Polyfill (`navigator.modelContext`)**:
  - Expose `window.navigator.modelContext` if not present in the host browser.
  - Wrap internal `WebMCPServer` / `WebMCPBrowserBridge` methods to match W3C method signatures (`registerTool`, `listTools`, `callTool`).
- **Declarative Form Parser**:
  - Implement standard attribute parsing for `<form toolname="..." tooldescription="...">` and `<input toolparam="...">`.
  - Automatically convert form submissions into MCP tool invocations.

### Step 3: Patching Gaps Before Upstream Fixes
If a spec proposal or `webmcp-types` contains an unresolved issue:
1. Document the gap in `docs/architecture/` as an ADR or compatibility record.
2. Implement a defensive runtime check in `@thestudioxi/webmcp` (e.g., fallback schema parsing, permissive parameter handling).
3. Ensure backwards compatibility with earlier versions of the SDK.

### Step 4: Verification
Before committing spec sync updates:
```bash
# 1. Run type checking across workspace
bun run check

# 2. Run unit and integration tests
bun test

# 3. Build docs site to verify playground & API reference
cd docs-site && bun run build
```

---

## Upstream Feedback Protocol

If during spec sync an issue, edge case, or ambiguity in the W3C spec is found:
- Draft a concise issue description detailing the problem, reproduction code, and proposed fix.
- Present the draft to the project maintainers before submitting upstream to `webmachinelearning/webmcp`.

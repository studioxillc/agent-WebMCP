# Project Roadmap - agent-WebMCP (`@thestudioxi/webmcp`)

## Phase 1: Core Foundation, Adapters & Docs (Completed ✅)
- Monorepo structure with Bun & TypeScript workspaces (`@thestudioxi/webmcp`).
- Core `WebMCPClient`, `WebMCPServer`, and bi-directional transports (`WebSocketTransport`, `MessageChannelTransport`, `HttpStandardTransport`).
- Zero-config Framework Adapters: Vercel AI SDK (`@thestudioxi/webmcp-adapter-vercel-ai`), Express (`...-adapter-express`), Hono (`...-adapter-hono`), and NestJS bridge.
- Interactive documentation site & live browser playground (`docs-site`).
- Automated release pipeline with Changesets & GitHub Actions (`.github/workflows/release.yml`).
- AI-Native setup: `AGENTS.md`, `VISION.md`, Graphify scripts, and skills (`skills/webmcp-spec-sync`).

## Phase 2: W3C Standard Polyfill & Declarative HTML Attributes (Current 🎯)
- W3C WebMCP specification compliance audit (`webmachinelearning/webmcp` & `webmcp-types`).
- Standard `window.navigator.modelContext` browser polyfill interface (`registerTool`, `listTools`, `callTool`).
- Declarative HTML attribute parser for `<form toolname="..." tooldescription="...">` and `<input toolparam="...">`.
- Automated spec drift audit CI workflow and standard conformance test suite.

## Phase 3: Web Extensions & WebRTC Transports
- Chrome Manifest V3 WebMCP extension bridge & background script transport.
- WebRTC `PeerConnection` transport for remote browser-to-agent cross-network relays.
- Enhanced tool input schema validation with native Zod & JSON schema coercions.

## Phase 4: Swarm Coordination & Security Middleware
- Multi-agent swarm tool routing & registration protocol.
- WebMCP security token authorization middleware & cross-origin iframe origin isolation.


# Changelog

All notable changes to the **agent-WebMCP** project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.1.0] - 2026-07-24

### Added
- Initial open-source release of `@webmcp/sdk` built on **Bun** and **TypeScript**.
- Dual SDK Architecture: `@webmcp/sdk/frontend` (`WebMCPBrowserBridge`) and `@webmcp/sdk/backend` (`WebMCPAgentClient`).
- WebSocket and MessageChannel IPC transports.
- Pre-registered **WebMCP Starter Kit** tools (`dom_get_text`, `dom_click_element`, `browser_get_url`, `browser_navigate`, `storage_get_item`, `storage_set_item`).
- Example Agentic App (`examples/agentic-app`) featuring live Google Gemini API key auth and native function calling.
- AI-Native tooling: `AGENTS.md`, `CLAUDE.md`, Graphify AST analyzer (`scripts/graphify.sh`), custom skills, and structured `docs/` hierarchy with `docs/archive/`.

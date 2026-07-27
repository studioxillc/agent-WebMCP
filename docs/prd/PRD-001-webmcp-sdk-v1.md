# PRD-001: WebMCP TypeScript SDK v1.0

- **Status**: Completed (v1.0.0)
- **Target Version**: v1.0.0
- **Primary Package**: `@thestudioxi/webmcp`
- **Adapters**: `@thestudioxi/webmcp-adapter-vercel-ai`, `@thestudioxi/webmcp-adapter-express`, `@thestudioxi/webmcp-adapter-hono`

## Problem Statement

Developers building web AI agents currently struggle to communicate with browser tabs, browser extension states, and local network devices without custom ad-hoc WebSocket or HTTP glue code.

## Goals

1. Provide an open-source, developer-friendly TypeScript SDK built on Bun (`@thestudioxi/webmcp`).
2. Enable zero-config tool registration and execution over bi-directional transports (`WebSocketTransport`, `MessageChannelTransport`, `HttpStandardTransport`).
3. Offer modular framework adapters for Vercel AI SDK, Express, and Hono.
4. Deliver interactive documentation & playground (`docs-site`) along with example applications.

## Requirements

### Functional
- `client.registerTool(toolDef, handler)` / `WebMCPClient`: Register local or browser tools dynamically.
- `client.callTool(name, args)`: Execute tool and await response.
- `server.listen(port)` / `WebMCPServer`: Host local WebMCP bridge for browser clients.
- `transport.send(message)` / `transport.onMessage(callback)`: Standard JSON-RPC 2.0 event routing.
- Framework Adapters: `createVercelAITools()`, `createExpressMiddleware()`, `createHonoHandler()`, `WebMCPAdapter`.

### Non-Functional
- **Performance**: Sub-10ms JSON serialization overhead.
- **Type Safety**: Strict TypeScript compilation and declaration generation (`.d.ts`).
- **Compatibility**: Compatible with Bun >= 1.0, Node >= 18, Deno >= 1.30 (via Web Standard Request/Response), and modern Web browsers.
- **Release Automation**: Changesets & GitHub Actions release pipeline.


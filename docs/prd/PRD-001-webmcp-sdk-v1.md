# PRD-001: WebMCP TypeScript SDK v1.0

- **Status**: Draft / Active
- **Target Version**: v1.0.0
- **Primary Package**: `@webmcp/sdk`

## Problem Statement

Developers building web AI agents currently struggle to communicate with browser tabs, browser extension states, and local network devices without custom ad-hoc WebSocket glue code.

## Goals

1. Provide an open-source, developer-friendly TypeScript SDK built on Bun.
2. Enable zero-config tool registration and execution over bi-directional transports.
3. Include pre-built transports for WebSocket and MessageChannel.
4. Deliver an example agentic application demonstrating local browser context control using a Pi Agent / DeepAgent pattern.

## Requirements

### Functional
- `client.registerTool(toolDef, handler)`: Register local or browser tools dynamically.
- `client.callTool(name, args)`: Execute tool and await response.
- `server.listen(port)`: Host local WebMCP bridge for browser clients.
- `transport.send(message)` / `transport.onMessage(callback)`: Standard JSON-RPC event routing.

### Non-Functional
- **Performance**: Sub-10ms JSON serialization overhead over local WebSockets.
- **Type Safety**: Full TypeScript declaration generation (`.d.ts`).
- **Compatibility**: Compatible with Bun >= 1.0, Node >= 18, and modern Web browsers.

# ADR-001: WebMCP Protocol Architecture

- **Status**: Approved
- **Date**: 2026-07-24
- **Authors**: WebMCP Core Team

## Context

AI agents running in local execution environments (such as Bun, Node.js, or desktop runtimes) often need real-time, bi-directional interaction with web content rendered in local browsers, browser extensions, or local network services. 

Standard Model Context Protocol (MCP) servers typically run as standalone CLI binaries or HTTP/STDIO streams. WebMCP extends this paradigm into web contexts by standardizing lightweight transports (WebSocket, MessageChannel, WebRTC) that allow web content to dynamically expose tools to local AI agents.

## Decision

We will implement a modular, transport-agnostic TypeScript SDK (`@webmcp/sdk`) structured around three core concepts:

1. **`WebMCPClient`**: The client interface used by AI agent runners to list available web tools and invoke them async.
2. **`WebMCPServer`**: The server bridge that hosts tool handlers and handles JSON-RPC standard message dispatching.
3. **`WebMCPTransport`**: Abstract communication interface with implementations:
   - `WebSocketTransport`: For local network & browser-to-server IPC over `ws://localhost:<port>`.
   - `MessageChannelTransport`: For web page iframe, worker, or content script communication.

## Consequences

- **Pros**: Agents can execute browser interactions without requiring heavy headless browser automation when a lightweight browser context is active.
- **Cons**: Requires standard connection lifecycle management (reconnect, timeouts, heartbeats).

# @thestudioxi/webmcp

> Official TypeScript SDK for WebMCP — Connecting Web AI agents to browser content and local network resources via the Model Context Protocol.

[![npm version](https://img.shields.io/npm/v/@thestudioxi/webmcp.svg)](https://www.npmjs.com/package/@thestudioxi/webmcp)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

## Installation

```bash
# Using Bun
bun add @thestudioxi/webmcp

# Using npm
npm install @thestudioxi/webmcp

# Using pnpm / yarn
pnpm add @thestudioxi/webmcp
```

## Quick Start

### 1. Register WebMCP Server & Tools in Frontend

```typescript
import { createFrontendBridge, MessageChannelTransport } from '@thestudioxi/webmcp';

const channel = new MessageChannel();
const frontendTransport = new MessageChannelTransport(channel.port1);

// Initialize frontend bridge with auto-registered Starter Kit tools
const bridge = createFrontendBridge({
  transport: frontendTransport,
  autoRegisterStarterKit: true,
});

// Register a custom application tool
bridge.registerCustomTool(
  'ping_service',
  'Ping local network gateway service',
  { type: 'object', properties: { service: { type: 'string' } } },
  async (args) => {
    return { service: args.service || 'gateway', status: 'online', latencyMs: 2 };
  }
);

await bridge.start();
```

### 2. Connect AI Agent Client in Backend

```typescript
import { createBackendAgentClient, MessageChannelTransport } from '@thestudioxi/webmcp';

const backendTransport = new MessageChannelTransport(channel.port2);

const client = createBackendAgentClient({ transport: backendTransport });
await client.connect();

// Discover registered tools
const tools = await client.getAvailableTools();
console.log('Available WebMCP tools:', tools);

// Execute a tool call
const result = await client.executeTool('browser_get_url', {});
console.log('Active tab URL:', result);
```

## Features

- **Dual SDK Architecture**: Clean separation between `createFrontendBridge` (server/tool host) and `createBackendAgentClient` (agent/client runner).
- **Multiple Transports**: In-memory `MessageChannelTransport` and remote `WebSocketTransport`.
- **Starter Kit Tools**: Pre-registered tools for DOM extraction (`dom_get_text`), click actions (`dom_click_element`), navigation (`browser_get_url`, `browser_navigate`), and storage (`storage_get_item`, `storage_set_item`).
- **Strict TypeScript Types**: Full type safety with auto-generated `.d.ts` declarations.

## License

MIT © WebMCP Open Source Project

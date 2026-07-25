# Getting Started

## Overview

**WebMCP** (Web Model Context Protocol) is a TypeScript SDK that enables bi-directional communication between AI agent runtimes and web content. It extends the standard Model Context Protocol (MCP) into browser contexts.

## Installation

Install the core SDK with your preferred package manager:

::: code-group

```bash [bun]
bun add @thestudioxi/webmcp
```

```bash [npm]
npm install @thestudioxi/webmcp
```

```bash [pnpm]
pnpm add @thestudioxi/webmcp
```

:::

## Your First WebMCP Server

Create a WebMCP server that exposes tools to AI agents:

```ts
import {
  WebMCPServer,
  WebStandardHttpTransport,
} from '@thestudioxi/webmcp';

// 1. Create a transport (HTTP for web servers)
const transport = new WebStandardHttpTransport();

// 2. Create a server bound to the transport
const server = new WebMCPServer({ transport });

// 3. Register a tool
server.registerTool(
  {
    name: 'get_weather',
    description: 'Get current weather for a city',
    inputSchema: {
      type: 'object',
      properties: {
        city: { type: 'string', description: 'City name' },
      },
      required: ['city'],
    },
  },
  async (args) => {
    return { city: args.city, temperature: 72, condition: 'sunny' };
  }
);

// 4. Start the server
await server.start();
```

## Your First WebMCP Client

Connect an AI agent to the server and call tools:

```ts
import { WebMCPClient } from '@thestudioxi/webmcp';

const client = new WebMCPClient({ transport });
await client.connect();

// List available tools
const tools = await client.listTools();
console.log('Available tools:', tools.map(t => t.name));

// Call a tool
const result = await client.callTool('get_weather', { city: 'San Francisco' });
console.log('Weather:', result);

await client.disconnect();
```

## Add a Framework Adapter

Expose your WebMCP server over HTTP with a framework adapter:

::: code-group

```bash [Express.js]
bun add @thestudioxi/webmcp-adapter-express express
```

```bash [Hono]
bun add @thestudioxi/webmcp-adapter-hono hono
```

```bash [NestJS]
bun add @thestudioxi/webmcp-adapter-nest @nestjs/common
```

```bash [Vercel AI SDK]
bun add @thestudioxi/webmcp-adapter-vercel-ai ai zod
```

:::

See the [Adapters](/adapters/) section for detailed setup guides.

## Next Steps

- Learn about the [Core Concepts](/guide/core-concepts) — Client, Server, Transport architecture
- Browse [Framework Adapters](/adapters/) — Express, Hono, NestJS, Vercel AI SDK
- Try the [Interactive Demo](/demo/) — live WebMCP playground in your browser
- Explore [Example Apps](/guide/examples) — Agentic app and Next.js integration

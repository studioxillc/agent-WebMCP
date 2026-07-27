# agent-WebMCP 🚀

[![CI](https://github.com/studioxillc/agent-WebMCP/actions/workflows/ci.yml/badge.svg)](https://github.com/studioxillc/agent-WebMCP/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

**Open-source TypeScript SDK and AI-Native Toolset for WebMCP**  
*Empowering Web AI Agents to seamlessly interact with local browser content, web extensions, and local network resources.*

📖 **[Documentation](https://studioxillc.github.io/agent-WebMCP/)** · 🎯 **[Vision & Spec Alignment](./VISION.md)**

---

## 🌟 What is WebMCP?

**WebMCP** (Web Model Context Protocol) extends the standard Model Context Protocol (MCP) into web contexts. It enables bi-directional communication between local AI agent execution environments (Bun, Node, Python, Desktop agents) and active web pages, browser extensions, or local network endpoints.

With WebMCP, AI agents can:
- 🌐 Inspect and manipulate active browser tab DOMs in real time without heavy headless browsers.
- ⚡ Register and call web tools via bi-directional transports (WebSocket, MessageChannel, HTTP).
- 🔗 Connect agent loops to local network services safely and modularly.

---

## 📦 Packages

| Package | Version | Description |
|---|---|---|
| [`@thestudioxi/webmcp`](./packages/sdk) | [![npm](https://img.shields.io/npm/v/@thestudioxi/webmcp.svg)](https://www.npmjs.com/package/@thestudioxi/webmcp) | Core SDK — Client, Server, Transports |
| [`@thestudioxi/webmcp-adapter-express`](./packages/adapters/express) | [![npm](https://img.shields.io/npm/v/@thestudioxi/webmcp-adapter-express.svg)](https://www.npmjs.com/package/@thestudioxi/webmcp-adapter-express) | Express.js middleware adapter |
| [`@thestudioxi/webmcp-adapter-hono`](./packages/adapters/hono) | [![npm](https://img.shields.io/npm/v/@thestudioxi/webmcp-adapter-hono.svg)](https://www.npmjs.com/package/@thestudioxi/webmcp-adapter-hono) | Hono framework route handler |
| [`@thestudioxi/webmcp-adapter-nest`](./packages/adapters/nest) | [![npm](https://img.shields.io/npm/v/@thestudioxi/webmcp-adapter-nest.svg)](https://www.npmjs.com/package/@thestudioxi/webmcp-adapter-nest) | NestJS server adapter |
| [`@thestudioxi/webmcp-adapter-vercel-ai`](./packages/adapters/vercel-ai) | [![npm](https://img.shields.io/npm/v/@thestudioxi/webmcp-adapter-vercel-ai.svg)](https://www.npmjs.com/package/@thestudioxi/webmcp-adapter-vercel-ai) | Vercel AI SDK tool converter |

---

## 🚀 Quick Start

### Prerequisites
- [Bun](https://bun.sh) (v1.0.0 or higher)

### Installation

```bash
# Install the core SDK
bun add @thestudioxi/webmcp

# Install an adapter for your framework
bun add @thestudioxi/webmcp-adapter-express   # Express.js
bun add @thestudioxi/webmcp-adapter-hono      # Hono
bun add @thestudioxi/webmcp-adapter-nest      # NestJS
bun add @thestudioxi/webmcp-adapter-vercel-ai # Vercel AI SDK
```

---

## 🔌 Framework Adapters

WebMCP provides zero-dependency adapters that bridge the core SDK to popular web frameworks via the `WebStandardHttpTransport`.

### Express.js

```ts
import express from 'express';
import { WebMCPServer, WebStandardHttpTransport } from '@thestudioxi/webmcp';
import { createExpressWebMCPMiddleware } from '@thestudioxi/webmcp-adapter-express';

const transport = new WebStandardHttpTransport();
const server = new WebMCPServer({ transport });

server.registerTool(
  { name: 'hello', description: 'Say hello', inputSchema: { type: 'object', properties: { name: { type: 'string' } } } },
  async (args) => ({ message: `Hello, ${args.name}!` })
);

await server.start();

const app = express();
app.use(express.json());
app.use('/api/webmcp', createExpressWebMCPMiddleware(transport));
app.listen(3000);
```

### Hono

```ts
import { Hono } from 'hono';
import { WebMCPServer, WebStandardHttpTransport } from '@thestudioxi/webmcp';
import { createHonoWebMCPHandler } from '@thestudioxi/webmcp-adapter-hono';

const transport = new WebStandardHttpTransport();
const server = new WebMCPServer({ transport });
// ... register tools ...
await server.start();

const app = new Hono();
app.post('/api/webmcp', createHonoWebMCPHandler(transport));

export default app;
```

### NestJS

```ts
import { Controller, Post, Req } from '@nestjs/common';
import { WebMCPAdapter } from '@thestudioxi/webmcp-adapter-nest';

@Controller('api/webmcp')
export class WebMCPController {
  private adapter = new WebMCPAdapter();

  async onModuleInit() {
    this.adapter.registerTool(myToolDef, myToolHandler);
    await this.adapter.start();
  }

  @Post()
  async handle(@Req() req: Request) {
    return this.adapter.handleRequest(req);
  }
}
```

### Vercel AI SDK

```ts
import { streamText } from 'ai';
import { createBackendAgentClient } from '@thestudioxi/webmcp';
import { webmcpToVercelAITools } from '@thestudioxi/webmcp-adapter-vercel-ai';

const agentClient = createBackendAgentClient({ transport: myTransport });
await agentClient.connect();

const rawTools = await agentClient.getAvailableTools();
const tools = webmcpToVercelAITools(rawTools, (name, args) => agentClient.executeTool(name, args));

const result = streamText({
  model: myModel,
  messages,
  tools,
});
```

---

## 🏗️ Repository Architecture

This project is organized as an **AI-Native Bun Monorepo**:

```
agent-WebMCP/
├── packages/
│   ├── sdk/                        # Core @thestudioxi/webmcp package
│   │   ├── src/client/             # WebMCPClient — agent-side tool consumer
│   │   ├── src/server/             # WebMCPServer — tool host & JSON-RPC dispatcher
│   │   ├── src/transports/         # WebSocket, MessageChannel, HTTP transports
│   │   ├── src/frontend/           # WebMCPBrowserBridge (browser-side SDK)
│   │   ├── src/backend/            # WebMCPAgentClient (server-side SDK)
│   │   └── src/tools/starter-kit/  # Pre-built browser interaction tools
│   └── adapters/
│       ├── express/                # Express.js middleware adapter
│       ├── hono/                   # Hono route handler adapter
│       ├── nest/                   # NestJS server adapter
│       └── vercel-ai/              # Vercel AI SDK tool converter
├── examples/
│   ├── agentic-app/                # Sample Agentic App (Pi Agent pattern)
│   └── nextjs-vercel-ai/           # Next.js + Vercel AI SDK example
├── docs-site/                      # VitePress documentation site
├── docs/                           # Internal project docs (ADRs, PRDs, Epics)
├── scripts/                        # Build & utility scripts
└── skills/                         # Co-located AI Agent skills
```

---

## 🤖 Running Examples

### Agentic App (In-Memory Bridge)
```bash
bun run example:agent
```

### Next.js + Vercel AI SDK
```bash
bun run example:next
```

### Web Demo (Browser Bridge)
```bash
bun run example:web
```

---

## 🧪 Development

```bash
# Clone the repository
git clone https://github.com/studioxillc/agent-WebMCP.git
cd agent-WebMCP

# Install workspace dependencies
bun install

# Run tests
bun test

# TypeScript type checking
bun run check

# Build all packages
bun run build
```

---

## 📊 Graphify Knowledge Graph

To help local AI agents and developers visualize structural relationships and AST dependencies:

```bash
bun run graphify
```

This outputs tree-sitter AST index reports in `graphify-out/`:
- `GRAPH_REPORT.md`: Architectural summary of code components.
- `graph.json`: Structural graph nodes & edges.
- `graph.html`: Interactive browser graph visualizer.

---

## 📂 Documentation & Archiving Workflow

All project decisions, requirements, and tasks are managed under `docs/`:
- Active tasks live in `docs/epics/` and bug reports live in `docs/bugfix/`.
- Once an epic or task is fully verified, it is moved into `docs/archive/` to maintain a clean workspace.

---

## 📄 License

[MIT](LICENSE)

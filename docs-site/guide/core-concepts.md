# Core Concepts

WebMCP is built around three fundamental components that work together to enable AI agent ↔ web communication.

## Architecture Overview

```
┌──────────────────────────────────────────────────────────────┐
│  Browser / Web Page                                          │
│  ┌────────────────────────────────────────────────────────┐  │
│  │  WebMCPBrowserBridge (Frontend SDK)                    │  │
│  │  ├── WebMCPServer (hosts tool handlers)                │  │
│  │  └── Starter Kit Tools (DOM, Storage, Navigation)      │  │
│  └──────────────┬─────────────────────────────────────────┘  │
│                 │ Transport (MessageChannel / WebSocket)      │
└─────────────────┼────────────────────────────────────────────┘
                  │
┌─────────────────┼────────────────────────────────────────────┐
│  Agent Runtime  │ (Bun / Node.js / Desktop)                  │
│  ┌──────────────┴─────────────────────────────────────────┐  │
│  │  WebMCPAgentClient (Backend SDK)                       │  │
│  │  ├── WebMCPClient (sends JSON-RPC requests)            │  │
│  │  └── Vercel AI SDK Integration                         │  │
│  └────────────────────────────────────────────────────────┘  │
│                                                              │
│  ┌────────────────────────────────────────────────────────┐  │
│  │  HTTP Server (Express / Hono / NestJS / Bun)           │  │
│  │  └── WebStandardHttpTransport (JSON-RPC over HTTP)     │  │
│  └────────────────────────────────────────────────────────┘  │
└──────────────────────────────────────────────────────────────┘
```

## WebMCPClient

The **client** is used by AI agent runtimes to discover and invoke tools. It communicates over a transport using JSON-RPC 2.0.

```ts
import { WebMCPClient } from '@thestudioxi/webmcp';

const client = new WebMCPClient({
  transport: myTransport,
  timeoutMs: 10000,  // optional, defaults to 10s
});

await client.connect();

// Discover tools
const tools = await client.listTools();

// Execute a tool
const result = await client.callTool('dom_get_text', {
  selector: '#main-content',
});

await client.disconnect();
```

### Key Methods

| Method | Description |
|---|---|
| `connect()` | Opens the transport connection |
| `disconnect()` | Closes the transport connection |
| `listTools()` | Returns all registered `WebMCPToolDefinition[]` |
| `callTool(name, args)` | Executes a tool and returns the result |

## WebMCPServer

The **server** hosts tool handlers and dispatches incoming JSON-RPC requests to the appropriate handler.

```ts
import { WebMCPServer } from '@thestudioxi/webmcp';

const server = new WebMCPServer({ transport: myTransport });

server.registerTool(
  {
    name: 'echo',
    description: 'Echoes back the input',
    inputSchema: {
      type: 'object',
      properties: {
        message: { type: 'string' },
      },
      required: ['message'],
    },
  },
  async (args) => ({ echo: args.message })
);

await server.start();
```

### JSON-RPC Methods

The server responds to these standard methods:

| Method | Description |
|---|---|
| `tools/list` | Returns all registered tool definitions |
| `tools/call` | Executes a tool by name with provided arguments |

## Transports

Transports are the communication layer. They implement the `WebMCPTransport` interface:

```ts
interface WebMCPTransport {
  connect(): Promise<void>;
  disconnect(): Promise<void>;
  send(message: WebMCPMessage): Promise<void>;
  onMessage(handler: (message: WebMCPMessage) => void): void;
  isConnected(): boolean;
}
```

### Available Transports

| Transport | Use Case |
|---|---|
| `MessageChannelTransport` | In-page communication (iframes, workers, content scripts) |
| `WebSocketTransport` | Local network IPC (`ws://localhost:<port>`) |
| `WebStandardHttpTransport` | HTTP-based request/response (REST-like, for web servers) |

### MessageChannel (In-Page)

Best for browser-to-browser communication within the same origin:

```ts
const { port1, port2 } = new MessageChannel();

// Frontend (browser bridge)
const bridge = createFrontendBridge({
  transport: new MessageChannelTransport(port1),
});
await bridge.start();

// Backend (agent client)
const client = new WebMCPClient({
  transport: new MessageChannelTransport(port2),
});
await client.connect();
```

### WebSocket (Local Network)

Best for browser ↔ local agent runtime communication:

```ts
// Server side
const wsTransport = new WebSocketTransport({
  port: 8765,
  role: 'server',
});

// Client side (browser or Node)
const wsClient = new WebSocketTransport({
  url: 'ws://localhost:8765',
  role: 'client',
});
```

### Web Standard HTTP

Best for exposing WebMCP as a standard HTTP API endpoint:

```ts
const transport = new WebStandardHttpTransport({
  corsOrigin: '*',          // CORS origin (restrict in production)
  requestTimeoutMs: 30000,  // Request timeout
});
```

## Dual SDK Pattern

WebMCP uses a **dual SDK** architecture for a clean separation:

### Frontend SDK (`WebMCPBrowserBridge`)

Runs in the browser. Hosts a `WebMCPServer` and registers tools that interact with the page DOM, storage, and navigation:

```ts
import { createFrontendBridge } from '@thestudioxi/webmcp';

const bridge = createFrontendBridge({
  transport: myTransport,
  autoRegisterStarterKit: true, // Registers DOM, storage, nav tools
});

await bridge.start();
```

### Backend SDK (`WebMCPAgentClient`)

Runs on the server/agent side. Wraps `WebMCPClient` with higher-level methods and Vercel AI SDK integration:

```ts
import { createBackendAgentClient } from '@thestudioxi/webmcp';

const agent = createBackendAgentClient({ transport: myTransport });
await agent.connect();

// Get tools as Vercel AI SDK format
const vercelTools = await agent.getVercelAITools();

// Or call tools directly
const result = await agent.executeTool('dom_get_text', { selector: 'h1' });
```

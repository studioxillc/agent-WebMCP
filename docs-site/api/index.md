# API Reference

## Core Types

### `WebMCPToolDefinition`

Defines a tool that can be registered with a WebMCP server.

```ts
interface WebMCPToolDefinition {
  name: string;
  description: string;
  inputSchema: {
    type: 'object';
    properties?: Record<string, any>;
    required?: string[];
  };
}
```

### `WebMCPToolHandler`

Function that executes when a tool is called.

```ts
type WebMCPToolHandler = (args: Record<string, any>) => Promise<any> | any;
```

### `WebMCPTransport`

Abstract transport interface for all communication channels.

```ts
interface WebMCPTransport {
  connect(): Promise<void>;
  disconnect(): Promise<void>;
  send(message: WebMCPMessage): Promise<void>;
  onMessage(handler: (message: WebMCPMessage) => void): void;
  onConnect?(handler: () => void): void;
  onDisconnect?(handler: () => void): void;
  isConnected(): boolean;
}
```

### `WebMCPRequest`

JSON-RPC 2.0 request message.

```ts
interface WebMCPRequest {
  jsonrpc: '2.0';
  id: string | number;
  method: string;
  params?: Record<string, any>;
}
```

### `WebMCPResponse`

JSON-RPC 2.0 response message.

```ts
interface WebMCPResponse {
  jsonrpc: '2.0';
  id: string | number;
  result?: any;
  error?: {
    code: number;
    message: string;
    data?: any;
  };
}
```

---

## Classes

### `WebMCPClient`

Agent-side client for discovering and calling tools.

```ts
import { WebMCPClient } from '@thestudioxi/webmcp';

const client = new WebMCPClient({
  transport: myTransport,
  timeoutMs: 10000,
});
```

| Method | Signature | Description |
|---|---|---|
| `connect` | `() => Promise<void>` | Open transport connection |
| `disconnect` | `() => Promise<void>` | Close transport connection |
| `listTools` | `() => Promise<WebMCPToolDefinition[]>` | List all registered tools |
| `callTool` | `(name: string, args?: Record<string, any>) => Promise<any>` | Execute a tool |

---

### `WebMCPServer`

Tool host and JSON-RPC dispatcher.

```ts
import { WebMCPServer } from '@thestudioxi/webmcp';

const server = new WebMCPServer({ transport: myTransport });
```

| Method | Signature | Description |
|---|---|---|
| `registerTool` | `(definition: WebMCPToolDefinition, handler: WebMCPToolHandler) => void` | Register a tool |
| `start` | `() => Promise<void>` | Start the server (connects transport) |
| `stop` | `() => Promise<void>` | Stop the server (disconnects transport) |

---

### `WebMCPBrowserBridge`

Frontend SDK for browser-side tool hosting.

```ts
import { createFrontendBridge } from '@thestudioxi/webmcp';

const bridge = createFrontendBridge({
  transport: myTransport,
  autoRegisterStarterKit: true,
});
```

| Method | Signature | Description |
|---|---|---|
| `registerTool` | `(definition, handler) => this` | Register a custom tool |
| `registerCustomTool` | `(name, description, inputSchema, handler) => this` | Register with inline args |
| `registerStarterKit` | `() => this` | Register all starter kit tools |
| `start` | `() => Promise<void>` | Start the bridge |
| `stop` | `() => Promise<void>` | Stop the bridge |

---

### `WebMCPAgentClient`

Backend SDK for server-side agent integration.

```ts
import { createBackendAgentClient } from '@thestudioxi/webmcp';

const agent = createBackendAgentClient({ transport: myTransport });
```

| Method | Signature | Description |
|---|---|---|
| `connect` | `() => Promise<void>` | Connect to WebMCP server |
| `disconnect` | `() => Promise<void>` | Disconnect |
| `getAvailableTools` | `() => Promise<WebMCPToolDefinition[]>` | List available tools |
| `executeTool` | `(name: string, args?: Record<string, any>) => Promise<any>` | Execute a tool |
| `getVercelAITools` | `() => Promise<Record<string, VercelAITool>>` | Get tools in Vercel AI SDK format |
| `getRawClient` | `() => WebMCPClient` | Access the underlying client |

---

## Transports

### `MessageChannelTransport`

For in-page communication (iframes, workers, content scripts).

```ts
import { MessageChannelTransport } from '@thestudioxi/webmcp';

const { port1, port2 } = new MessageChannel();
const transport = new MessageChannelTransport(port1);
```

### `WebSocketTransport`

For local network IPC over WebSocket.

```ts
import { WebSocketTransport } from '@thestudioxi/webmcp';

const transport = new WebSocketTransport({
  url: 'ws://localhost:8765',  // client mode
  // or
  port: 8765,                  // server mode
  role: 'client' | 'server',
});
```

### `WebStandardHttpTransport`

For HTTP-based request/response communication.

```ts
import { WebStandardHttpTransport } from '@thestudioxi/webmcp';

const transport = new WebStandardHttpTransport({
  corsOrigin: '*',
  requestTimeoutMs: 30000,
});
```

| Method | Signature | Description |
|---|---|---|
| `handleRequest` | `(request: Request) => Promise<Response>` | Process an HTTP request |

### `createWebMCPHttpHandler(transport)`

Helper that returns a fetch-compatible handler:

```ts
import { createWebMCPHttpHandler } from '@thestudioxi/webmcp';

const handler = createWebMCPHttpHandler(transport);
// handler: (request: Request) => Promise<Response>
```

---

## W3C Standard Polyfill & Declarative HTML Tools

### `WebMCPPolyfill` & `injectWebMCPPolyfill(targetWindow?)`

Browser polyfill for the W3C WebMCP `window.navigator.modelContext` proposal.

```ts
import { injectWebMCPPolyfill, WebMCPPolyfill } from '@thestudioxi/webmcp/frontend';

// Safe global injection into window.navigator.modelContext
const modelContext = injectWebMCPPolyfill();

modelContext.registerTool({
  name: 'calculate_discount',
  description: 'Calculates cart total after discount',
  inputSchema: {
    type: 'object',
    properties: { price: { type: 'number' }, code: { type: 'string' } },
  },
}, async (args) => {
  return { finalPrice: args.price * 0.9 };
});
```

| Method | Signature | Description |
|---|---|---|
| `registerTool` | `(definition, handler) => void` | Register a W3C MCP tool |
| `unregisterTool` | `(name: string) => boolean` | Unregister a tool |
| `listTools` | `() => WebMCPToolDefinition[]` | List registered tools |
| `callTool` | `(name: string, params?: Record<string, any>) => Promise<any>` | Invoke a tool |

---

### `parseDeclarativeTools(options)`

Parses HTML `<form toolname="...">` and `<input toolparam="...">` elements into WebMCP tools automatically.

```html
<form toolname="search_products" tooldescription="Search catalog by query">
  <input name="query" toolparam="query" placeholder="Enter keyword" required />
  <input name="limit" toolparam="limit" type="number" placeholder="Max results" />
  <button type="submit">Search</button>
</form>
```

```ts
import { parseDeclarativeTools } from '@thestudioxi/webmcp/frontend';

// Automatically parses HTML elements and registers tools on navigator.modelContext
const parsedTools = parseDeclarativeTools({
  root: document,
  autoSubmitForm: true,
});
```

---

## Adapter Functions


### `createExpressWebMCPMiddleware(transport)`

Creates Express.js middleware. Returns `(req, res, next) => void`.

### `createHonoWebMCPHandler(transport)`

Creates a Hono route handler. Returns `(c: Context) => Promise<Response>`.

### `WebMCPAdapter`

Self-contained adapter for NestJS and other server-side frameworks.

### `webmcpToVercelAITools(tools, execute?)`

Converts WebMCP tool definitions to Vercel AI SDK format.

### `jsonSchemaObjectToZod(inputSchema)`

Converts JSON Schema to Zod schema for Vercel AI SDK compatibility.

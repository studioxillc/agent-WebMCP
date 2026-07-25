# Hono Adapter

The Hono adapter creates a route handler for Hono applications. Since Hono uses the Web Standard `Request`/`Response` API natively, this adapter is extremely thin.

## Installation

```bash
bun add @thestudioxi/webmcp @thestudioxi/webmcp-adapter-hono hono
```

## Usage

```ts
import { Hono } from 'hono';
import { WebMCPServer, WebStandardHttpTransport } from '@thestudioxi/webmcp';
import { createHonoWebMCPHandler } from '@thestudioxi/webmcp-adapter-hono';

// Create transport and server
const transport = new WebStandardHttpTransport();
const server = new WebMCPServer({ transport });

// Register tools
server.registerTool(
  {
    name: 'greet',
    description: 'Greet a user',
    inputSchema: {
      type: 'object',
      properties: {
        name: { type: 'string', description: 'User name' },
      },
      required: ['name'],
    },
  },
  async (args) => ({ greeting: `Hello, ${args.name}!` })
);

await server.start();

// Mount as Hono route handler
const app = new Hono();
app.post('/api/webmcp', createHonoWebMCPHandler(transport));

export default app;
```

## How It Works

`createHonoWebMCPHandler()` returns a Hono handler that extracts `c.req.raw` (the raw Web Standard `Request`) and forwards it directly to `WebStandardHttpTransport.handleRequest()`. Since both use the same API, there's zero conversion overhead.

## API

### `createHonoWebMCPHandler(transport)`

| Parameter | Type | Description |
|---|---|---|
| `transport` | `WebStandardHttpTransport` | Connected transport instance |

**Returns**: Hono handler function `(c: Context) => Promise<Response>`

::: tip
Hono natively uses Web Standard Request/Response, making this the most lightweight adapter. For simple cases, you can skip the adapter entirely and use `createWebMCPHttpHandler()` from the core SDK.
:::

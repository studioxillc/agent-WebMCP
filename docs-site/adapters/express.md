# Express.js Adapter

The Express adapter converts WebMCP's Web Standard HTTP transport into Express.js middleware.

## Installation

```bash
bun add @thestudioxi/webmcp @thestudioxi/webmcp-adapter-express express
```

## Usage

```ts
import express from 'express';
import { WebMCPServer, WebStandardHttpTransport } from '@thestudioxi/webmcp';
import { createExpressWebMCPMiddleware } from '@thestudioxi/webmcp-adapter-express';

// Create transport and server
const transport = new WebStandardHttpTransport();
const server = new WebMCPServer({ transport });

// Register tools
server.registerTool(
  {
    name: 'get_time',
    description: 'Get the current server time',
    inputSchema: { type: 'object', properties: {} },
  },
  async () => ({ time: new Date().toISOString() })
);

await server.start();

// Mount as Express middleware
const app = express();
app.use(express.json());
app.use('/api/webmcp', createExpressWebMCPMiddleware(transport));

app.listen(3000, () => {
  console.log('WebMCP Express server running on http://localhost:3000');
});
```

## How It Works

`createExpressWebMCPMiddleware()` returns a standard Express middleware function `(req, res, next)` that:

1. Converts the Express `req` into a Web Standard `Request`
2. Passes it to `WebStandardHttpTransport.handleRequest()`
3. Converts the Web Standard `Response` back to Express `res`
4. Calls `next(err)` on errors for Express error handling

## API

### `createExpressWebMCPMiddleware(transport)`

| Parameter | Type | Description |
|---|---|---|
| `transport` | `WebStandardHttpTransport` | Connected transport instance |

**Returns**: Express middleware function `(req, res, next) => void`

::: tip
Make sure to add `express.json()` middleware **before** the WebMCP middleware so that `req.body` is parsed.
:::

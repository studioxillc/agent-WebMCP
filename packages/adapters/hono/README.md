# @webmcp/adapter-hono

Hono framework adapter for **WebMCP** (Web Model Context Protocol).

## Installation

```bash
bun add @thestudioxi/webmcp @webmcp/adapter-hono hono
```

## Usage

```ts
import { Hono } from 'hono';
import { WebStandardHttpTransport } from '@thestudioxi/webmcp';
import { createHonoWebMCPHandler } from '@webmcp/adapter-hono';

const transport = new WebStandardHttpTransport();
await transport.connect();

const app = new Hono();
app.post('/api/webmcp', createHonoWebMCPHandler(transport));

export default app;
```

# @thestudioxi/webmcp-adapter-hono

Hono framework route handler adapter for **WebMCP** (Web Model Context Protocol).

## Installation

```bash
bun add @thestudioxi/webmcp @thestudioxi/webmcp-adapter-hono hono
```

## Usage

```ts
import { Hono } from 'hono';
import { WebStandardHttpTransport } from '@thestudioxi/webmcp';
import { createHonoWebMCPHandler } from '@thestudioxi/webmcp-adapter-hono';

const transport = new WebStandardHttpTransport();
await transport.connect();

const app = new Hono();
app.post('/api/webmcp', createHonoWebMCPHandler(transport));

export default app;
```

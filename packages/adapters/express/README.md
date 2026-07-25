# @webmcp/adapter-express

Express.js middleware adapter for **WebMCP** (Web Model Context Protocol).

## Installation

```bash
npm install @thestudioxi/webmcp @webmcp/adapter-express express
```

## Usage

```ts
import express from 'express';
import { WebStandardHttpTransport } from '@thestudioxi/webmcp';
import { createExpressWebMCPMiddleware } from '@webmcp/adapter-express';

const transport = new WebStandardHttpTransport();
await transport.connect();

const app = express();
app.use(express.json());

app.use('/api/webmcp', createExpressWebMCPMiddleware(transport));

app.listen(3000);
```

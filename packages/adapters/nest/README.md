# @thestudioxi/webmcp-adapter-nest

NestJS server adapter for **WebMCP** (Web Model Context Protocol).

## Installation

```bash
npm install @thestudioxi/webmcp @thestudioxi/webmcp-adapter-nest @nestjs/common
```

## Usage

```ts
import { WebMCPAdapter } from '@thestudioxi/webmcp-adapter-nest';

const adapter = new WebMCPNestAdapter();
await adapter.start();
```

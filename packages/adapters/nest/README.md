# @webmcp/adapter-nest

NestJS framework adapter for **WebMCP** (Web Model Context Protocol).

## Installation

```bash
npm install @thestudioxi/webmcp @webmcp/adapter-nest @nestjs/common
```

## Usage

```ts
import { WebMCPNestAdapter } from '@webmcp/adapter-nest';

const adapter = new WebMCPNestAdapter();
await adapter.start();
```

# NestJS Adapter

The NestJS adapter provides a self-contained `WebMCPAdapter` class that bundles a `WebMCPServer` and `WebStandardHttpTransport`. It exposes a `handleRequest()` method you can call from any NestJS controller.

## Installation

```bash
npm install @thestudioxi/webmcp @thestudioxi/webmcp-adapter-nest @nestjs/common
```

## Usage

```ts
import { Controller, Post, Req, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { WebMCPAdapter } from '@thestudioxi/webmcp-adapter-nest';

@Controller('api/webmcp')
export class WebMCPController implements OnModuleInit, OnModuleDestroy {
  private adapter = new WebMCPAdapter();

  async onModuleInit() {
    // Register tools
    this.adapter.registerTool(
      {
        name: 'get_status',
        description: 'Get application status',
        inputSchema: { type: 'object', properties: {} },
      },
      async () => ({ status: 'healthy', uptime: process.uptime() })
    );

    await this.adapter.start();
  }

  async onModuleDestroy() {
    await this.adapter.stop();
  }

  @Post()
  async handle(@Req() req: Request) {
    return this.adapter.handleRequest(req);
  }
}
```

## How It Works

Unlike the Express and Hono adapters which are simple function wrappers, `WebMCPAdapter` is a **self-contained class** that:

1. Creates its own `WebStandardHttpTransport` internally
2. Creates its own `WebMCPServer` internally
3. Exposes `registerTool()` for tool registration
4. Exposes `handleRequest(Request)` for handling incoming HTTP requests

This design makes it easy to integrate into NestJS's dependency injection and lifecycle hooks without managing transport/server instances separately.

## API

### `new WebMCPAdapter(options?)`

| Parameter | Type | Description |
|---|---|---|
| `options` | `WebStandardHttpTransportOptions` | Optional transport config (CORS origin, timeout) |

### Instance Methods

| Method | Description |
|---|---|
| `start()` | Starts the server and connects the transport |
| `stop()` | Stops the server and disconnects the transport |
| `registerTool(definition, handler)` | Registers a tool with the internal server |
| `handleRequest(request)` | Processes a Web Standard Request and returns a Response |

### Constructor Options

```ts
interface WebStandardHttpTransportOptions {
  corsOrigin?: string;       // Defaults to '*'
  requestTimeoutMs?: number; // Defaults to 30000 (30s)
}
```

::: warning Deprecated Alias
`WebMCPNestAdapter` is deprecated. Use `WebMCPAdapter` instead — it works with any server-side framework, not just NestJS.
:::

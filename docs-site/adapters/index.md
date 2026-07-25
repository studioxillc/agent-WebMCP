# Framework Adapters

WebMCP provides **zero-dependency framework adapters** that bridge the core SDK's `WebStandardHttpTransport` to popular web frameworks.

## How Adapters Work

All adapters follow the same pattern:

1. Create a `WebStandardHttpTransport` (from the core SDK)
2. Create a `WebMCPServer` and register tools
3. Use the adapter to expose the transport as a framework-native handler

```
HTTP Request → Framework Adapter → WebStandardHttpTransport → WebMCPServer → Tool Handler
                                                                    │
HTTP Response ← Framework Adapter ← WebStandardHttpTransport ← JSON-RPC Response
```

The adapters are thin wrappers that convert between framework-specific request/response types and the Web Standard `Request`/`Response` API used by the transport.

## Available Adapters

| Adapter | Package | Framework |
|---|---|---|
| [Express.js](/adapters/express) | `@thestudioxi/webmcp-adapter-express` | Express 4/5 |
| [Hono](/adapters/hono) | `@thestudioxi/webmcp-adapter-hono` | Hono |
| [NestJS](/adapters/nest) | `@thestudioxi/webmcp-adapter-nest` | NestJS |
| [Vercel AI SDK](/adapters/vercel-ai) | `@thestudioxi/webmcp-adapter-vercel-ai` | Vercel AI SDK |

## No Adapter Needed

If your framework uses the Web Standard `Request`/`Response` API natively (Bun, Deno, Cloudflare Workers), you can use the transport directly:

```ts
import {
  WebMCPServer,
  WebStandardHttpTransport,
  createWebMCPHttpHandler,
} from '@thestudioxi/webmcp';

const transport = new WebStandardHttpTransport();
const server = new WebMCPServer({ transport });
// ... register tools ...
await server.start();

// Bun native server
Bun.serve({
  port: 3000,
  fetch: createWebMCPHttpHandler(transport),
});
```

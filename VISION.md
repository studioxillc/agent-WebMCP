# VISION.md — Project Vision & Spec Alignment

## Mission

**agent-WebMCP** (`@thestudioxi/webmcp`) is an open-source, AI-native TypeScript SDK and runtime bridge designed to make web content, browser extensions, and web applications seamlessly accessible to autonomous AI agents.

Our goal is to be the **de facto production SDK, framework adapter layer, and polyfill engine** for the Web Model Context Protocol (WebMCP) ecosystem.

---

## Relationship with the W3C WebMCP Standard

The **W3C Web Machine Learning Community Group** incubates the official WebMCP specification at [`webmachinelearning/webmcp`](https://github.com/webmachinelearning/webmcp).

```
┌─────────────────────────────────────────────────────────────────────────┐
│                    W3C WebML CG (Specification)                        │
│        • navigator.modelContext API proposal                           │
│        • Declarative <form toolname="..."> schema attributes           │
│        • Native browser & security specs                                │
└────────────────────────────────────┬────────────────────────────────────┘
                                     │ Specs & Types (webmcp-types)
                                     ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                  @thestudioxi/webmcp (SDK & Polyfill)                   │
│  ┌───────────────────────────────────────────────────────────────────┐  │
│  │ 1. Standard Polyfill & Compliance Layer                           │  │
│  │    • Implements W3C navigator.modelContext interface              │  │
│  │    • Parses W3C declarative form tool attributes                  │  │
│  └───────────────────────────────────────────────────────────────────┘  │
│  ┌───────────────────────────────────────────────────────────────────┐  │
│  │ 2. Production Developer Ergonomics & Ecosystem                    │  │
│  │    • Bi-directional transports (MessageChannel, WebSocket, HTTP)  │  │
│  │    • Zero-config Framework Adapters (Vercel AI, Express, Hono)    │  │
│  │    • Agent Client & Server bridges for Node, Bun, & Desktop       │  │
│  └───────────────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────────┘
```

### Dual-Track Evolution Strategy

1. **Strict Spec Track (Standards Compliance)**
   - Maintain 100% compatibility with official W3C WebMCP spec drafts and [`webmcp-types`](https://www.npmjs.com/package/webmcp-types).
   - Provide a browser polyfill so web applications can use standard `navigator.modelContext` today before browser vendors ship native implementations.
   - Parse and convert W3C declarative HTML `<form>` attributes into registered MCP tools.

2. **Ecosystem & Ergonomics Track (Developer Enablement)**
   - Provide framework adapters (`@thestudioxi/webmcp-adapter-*`) for popular web frameworks (Vercel AI SDK, Hono, Express, NestJS).
   - Support bi-directional multi-environment transports (`MessageChannel`, `WebSocket`, `HTTP/SSE`) so agents can run in Node.js, Bun, browser extensions, or remote servers.
   - Act as an active feedback loop to the W3C WebML CG by identifying real-world gaps, edge cases, and developer experience friction.

---

## Core Pillars

1. **Zero-Lock-in & Standard-First**: Built around open protocols (MCP, W3C WebMCP, JSON-RPC 2.0).
2. **Zero Overhead & Lightweight**: Core SDK has zero runtime dependencies, sub-10ms serialization overhead, and full Bun/TypeScript support.
3. **Framework Agnostic**: Works out of the box with React, Next.js, Vue, Angular, Svelte, or vanilla HTML/JS.
4. **Agent Ready**: Pre-built integration with popular AI agent frameworks (Vercel AI SDK, LangChain, Pi Agent / DeepAgent).

---

## Long-Term Roadmap & Spec Alignment

- **Phase 1 (Current)**: Decoupled core SDK, zero-dependency transports, framework adapters, and VitePress interactive docs.
- **Phase 2**: W3C `navigator.modelContext` browser polyfill & HTML form attribute parser.
- **Phase 3**: Chrome Extension MV3 background bridge & cross-origin iframe security sandbox.
- **Phase 4**: Automated W3C spec drift audit CI workflow & standard conformance test suite.

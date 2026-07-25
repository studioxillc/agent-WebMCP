# Examples

WebMCP ships with two example applications that demonstrate different integration patterns.

## Agentic App (In-Memory Bridge)

A standalone agent runner that creates an in-memory WebMCP bridge, registers sample tools, and runs an autonomous agent step loop.

```bash
# From the monorepo root
bun run example:agent
```

### What It Demonstrates
- Creating a `WebMCPServer` + `WebMCPClient` connected via `MessageChannelTransport`
- Registering starter kit tools (DOM, storage, navigation)
- Running an agent loop that lists tools and calls them

### Web Demo Mode

You can also run the agentic app with a browser-based frontend:

```bash
bun run example:web
```

This starts a development server where you can see the WebMCP bridge in action with a real browser DOM.

---

## Next.js + Vercel AI SDK

A full-stack Next.js application that integrates WebMCP with the Vercel AI SDK for streaming AI chat with tool execution.

```bash
# From the monorepo root
bun run example:next
```

### What It Demonstrates
- Using `@thestudioxi/webmcp-adapter-vercel-ai` to convert WebMCP tools into Vercel AI SDK format
- Streaming AI responses with `streamText()` that autonomously call WebMCP tools
- Server-side API route (`/api/chat`) that bridges LLM → WebMCP tools
- Client-side chat UI with real-time message streaming

### Architecture

```
┌──────────────────────────────────────────────┐
│  Browser (Next.js Client)                    │
│  └── Chat UI (useChat hook)                  │
│       │                                      │
│       │ POST /api/chat                       │
└───────┼──────────────────────────────────────┘
        │
┌───────┼──────────────────────────────────────┐
│  Server (Next.js API Route)                  │
│  ├── WebMCPServer + WebStandardHttpTransport │
│  ├── WebMCPAgentClient                       │
│  └── streamText() with Vercel AI SDK         │
│       └── Tools converted via                │
│           webmcpToVercelAITools()             │
└──────────────────────────────────────────────┘
```

### Configuration

Create a `.env` file with your LLM provider API key:

```bash
# OpenAI
OPENAI_API_KEY=sk-...

# Or Google AI
GOOGLE_GENERATIVE_AI_API_KEY=...
```

::: warning BYOK (Bring Your Own Key)
WebMCP does not provide LLM API keys. You must supply your own from your preferred provider (OpenAI, Google AI, Anthropic, etc.).
:::

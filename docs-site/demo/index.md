---
title: Interactive Demo
---

# Interactive Demo

<script setup>
import WebMCPPlayground from '../.vitepress/components/WebMCPPlayground.vue'
</script>

Experience WebMCP running live in your browser. This demo creates a real `WebMCPServer` and `WebMCPClient` connected via `MessageChannel` — the same protocol used in production.

::: info No Installation Required
Everything runs client-side in your browser. No backend, no server, no installation.
:::

<WebMCPPlayground />

## How This Demo Works

This playground creates a real WebMCP protocol session using the `MessageChannel` transport:

1. **Server side** (simulated in-browser): A `WebMCPServer` registers 5 demo tools
2. **Client side** (simulated in-browser): A `WebMCPClient` sends JSON-RPC 2.0 requests
3. **Transport**: `MessageChannel` connects the two via browser `postMessage`

### Protocol Explorer Mode

Directly list and call WebMCP tools. Watch the JSON-RPC messages flow in the log panel below.

### AI Agent Chat Mode (BYOK)

Enter your own API key from OpenAI or Google AI, and chat with an AI agent that autonomously discovers and calls the WebMCP tools to answer your questions.

::: warning Your Key, Your Privacy
Your API key is stored **only in browser memory** (not localStorage, not cookies). It is sent **only** to the LLM provider's API endpoint. WebMCP never sees, stores, or transmits your key.
:::

## Demo Tools

| Tool | Description |
|---|---|
| `get_page_title` | Returns the current page title and URL |
| `calculate` | Evaluates a mathematical expression |
| `get_timestamp` | Returns current time, Unix timestamp, and timezone |
| `generate_uuid` | Generates a random UUID v4 |
| `browser_info` | Returns browser, viewport, and color scheme info |

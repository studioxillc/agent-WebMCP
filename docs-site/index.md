---
layout: doc
title: WebMCP
titleTemplate: TypeScript SDK for Web AI Agents
aside: false
prev: false
next: false
editLink: false
---

<script setup>
import { withBase } from 'vitepress'
import { onMounted, onUnmounted } from 'vue'

onMounted(() => {
  document.documentElement.classList.add('has-wmcp-home')
})

onUnmounted(() => {
  document.documentElement.classList.remove('has-wmcp-home')
})
</script>

<div class="wmcp-home">

<div class="wmcp-hero-logo">
  <img :src="withBase('/logo.svg')" alt="WebMCP logo" width="120" height="120" />
</div>

<div class="wmcp-hero-text">
  <h1 class="wmcp-title">WebMCP</h1>
  <p class="wmcp-subtitle">TypeScript SDK for Web AI Agents</p>
  <p class="wmcp-tagline">Bi-directional communication between AI agent runtimes and browser content via Model Context Protocol.</p>
</div>

<div class="wmcp-hero-actions">
  <a class="wmcp-btn wmcp-btn-brand" href="/agent-WebMCP/guide/getting-started">Get Started</a>
  <a class="wmcp-btn wmcp-btn-alt" href="/agent-WebMCP/demo/">Try the Demo</a>
  <a class="wmcp-btn wmcp-btn-alt" href="https://github.com/studioxillc/agent-WebMCP" target="_blank">View on GitHub</a>
</div>

<div class="wmcp-badges">
  <a href="https://github.com/studioxillc/agent-WebMCP/actions"><img src="https://img.shields.io/github/actions/workflow/status/studioxillc/agent-WebMCP/ci.yml?branch=main&style=flat-square&label=CI" alt="CI Status" /></a>
  <a href="https://www.npmjs.com/package/@thestudioxi/webmcp"><img src="https://img.shields.io/npm/v/@thestudioxi/webmcp?style=flat-square&color=10b981" alt="npm version" /></a>
  <a href="https://www.npmjs.com/package/@thestudioxi/webmcp"><img src="https://img.shields.io/npm/dw/@thestudioxi/webmcp?style=flat-square&color=10b981" alt="npm downloads" /></a>
  <a href="https://github.com/studioxillc/agent-WebMCP"><img src="https://img.shields.io/github/stars/studioxillc/agent-WebMCP?style=flat-square" alt="GitHub stars" /></a>
  <a href="https://opensource.org/licenses/MIT"><img src="https://img.shields.io/github/license/studioxillc/agent-WebMCP?style=flat-square" alt="License" /></a>
</div>

<div class="wmcp-links">
  <a href="/agent-WebMCP/guide/getting-started">Docs</a>
  <span class="separator">&bull;</span>
  <a href="https://github.com/studioxillc/agent-WebMCP">GitHub</a>
  <span class="separator">&bull;</span>
  <a href="https://www.npmjs.com/package/@thestudioxi/webmcp">npm</a>
  <span class="separator">&bull;</span>
  <a href="/agent-WebMCP/demo/">Demo</a>
</div>

---

<div class="wmcp-code-showcase">

## Quick Start

```ts
import { WebMCPServer, WebStandardHttpTransport } from '@thestudioxi/webmcp';

const server = new WebMCPServer({
  transport: new WebStandardHttpTransport(),
});

server.registerTool(
  {
    name: 'get_page_content',
    description: 'Extract content from the active browser tab',
    inputSchema: {
      type: 'object',
      properties: {
        selector: { type: 'string', description: 'CSS selector' },
      },
    },
  },
  async (args) => {
    // AI agent can now read browser DOM in real time
    return { content: document.querySelector(args.selector)?.textContent };
  }
);

await server.start();
```

</div>

<div class="wmcp-install">

### Installation

::: code-group

```bash [bun]
bun add @thestudioxi/webmcp
```

```bash [npm]
npm install @thestudioxi/webmcp
```

```bash [pnpm]
pnpm add @thestudioxi/webmcp
```

:::

</div>

---

<div class="wmcp-features-section">

## Features

<div class="wmcp-features-grid">
  <div class="wmcp-feature">
    <h3>Browser-Native Communication</h3>
    <p>Inspect and manipulate active browser tab DOMs in real time without heavy headless browsers. Built on WebSocket, MessageChannel, and HTTP transports.</p>
  </div>
  <div class="wmcp-feature">
    <h3>Zero-Config Tool Registration</h3>
    <p>Register and call web tools via bi-directional transports using a standard JSON-RPC protocol. Works with any framework.</p>
  </div>
  <div class="wmcp-feature">
    <h3>Framework Adapters</h3>
    <p>First-class adapters for Express.js, Hono, NestJS, and Vercel AI SDK. Zero framework-specific dependencies in the core.</p>
  </div>
  <div class="wmcp-feature">
    <h3>AI-Native Architecture</h3>
    <p>Dual SDK design with WebMCPBrowserBridge (frontend) and WebMCPAgentClient (backend). Built for autonomous agent loops.</p>
  </div>
  <div class="wmcp-feature">
    <h3>Type-Safe &amp; Modular</h3>
    <p>Full TypeScript declarations, transport-agnostic interfaces, and modular architecture. No implicit any types.</p>
  </div>
  <div class="wmcp-feature">
    <h3>Lightweight &amp; Fast</h3>
    <p>Built on Bun with sub-10ms JSON serialization overhead. Zero-dependency adapters that wrap the Web Standard Request/Response API.</p>
  </div>
</div>

</div>

---

<div class="wmcp-section-header">
  <h2>Framework Adapters</h2>
  <p>First-class integrations — zero framework-specific dependencies in the core SDK.</p>
</div>

<div class="wmcp-adapters">
  <a class="wmcp-adapter-card" href="/agent-WebMCP/adapters/express">
    <span class="adapter-icon">&#9881;</span>
    Express.js
  </a>
  <a class="wmcp-adapter-card" href="/agent-WebMCP/adapters/hono">
    <span class="adapter-icon">&#9889;</span>
    Hono
  </a>
  <a class="wmcp-adapter-card" href="/agent-WebMCP/adapters/nest">
    <span class="adapter-icon">&#9878;</span>
    NestJS
  </a>
  <a class="wmcp-adapter-card" href="/agent-WebMCP/adapters/vercel-ai">
    <span class="adapter-icon">&#9670;</span>
    Vercel AI SDK
  </a>
</div>

</div>

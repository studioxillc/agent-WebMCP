---
layout: home

hero:
  name: WebMCP
  text: Web AI Agent SDK
  tagline: Empowering AI Agents to seamlessly interact with browser content and local network resources via Model Context Protocol.
  actions:
    - theme: brand
      text: Get Started
      link: /guide/getting-started
    - theme: alt
      text: Try the Demo
      link: /demo/
    - theme: alt
      text: View on GitHub
      link: https://github.com/zhenximi/agent-WebMCP

features:
  - icon: 🌐
    title: Browser-Native Communication
    details: Inspect and manipulate active browser tab DOMs in real time without heavy headless browsers. Built on WebSocket, MessageChannel, and HTTP transports.
  - icon: ⚡
    title: Zero-Config Tool Registration
    details: Register and call web tools via bi-directional transports using a standard JSON-RPC protocol. Works with any framework.
  - icon: 🔌
    title: Framework Adapters
    details: First-class adapters for Express.js, Hono, NestJS, and Vercel AI SDK. Zero framework-specific dependencies in the core.
  - icon: 🤖
    title: AI-Native Architecture
    details: Dual SDK design with WebMCPBrowserBridge (frontend) and WebMCPAgentClient (backend). Built for autonomous agent loops.
  - icon: 🛡️
    title: Type-Safe & Modular
    details: Full TypeScript declarations, transport-agnostic interfaces, and modular architecture. No implicit any types.
  - icon: 📦
    title: Lightweight & Fast
    details: Built on Bun with sub-10ms JSON serialization overhead. Zero-dependency adapters that wrap the Web Standard Request/Response API.
---

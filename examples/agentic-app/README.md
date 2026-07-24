# Example Agentic App with WebMCP

This example demonstrates how to build an autonomous AI agent application using **Bun**, **TypeScript**, and **WebMCP**.

## Architecture Overview

```
┌────────────────────────┐         WebMCP Transport         ┌────────────────────────┐
│     Pi Agent Loop      │ ───────────────────────────────► │     WebMCP Server      │
│ (examples/agentic-app) │ ◄─────────────────────────────── │ (Browser Content / IPC)│
└────────────────────────┘                                  └────────────────────────┘
```

## How to Run

Execute via Bun from root:

```bash
bun run example:agent
```

Or from within this directory:

```bash
bun run start
```

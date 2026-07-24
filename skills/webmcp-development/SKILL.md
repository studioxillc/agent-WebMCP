---
name: webmcp-development
description: Operational guidelines for developing WebMCP clients, servers, and transports for local browser & network context.
---

# WebMCP Development Skill

Use this skill when designing, extending, or debugging WebMCP protocol layers and tools.

## Architecture

WebMCP enables Web AI Agents (running in Bun, Node, or browser extensions) to communicate with browser DOM contexts and local network devices.

### Key Components

1. **WebMCP Server (`WebMCPServer`)**:
   - Hosts the WebMCP bridge in Bun or local server environment.
   - Listens for client connections over WebSockets or MessageChannels.
   - Dispatches JSON-RPC tool invocations (`tools/call`, `tools/list`).

2. **WebMCP Client (`WebMCPClient`)**:
   - Connects agent applications to WebMCP servers.
   - Exposes clean async APIs to discover tools and invoke browser actions.

3. **Transports (`WebMCPTransport`)**:
   - `WebSocketTransport`: Communicates across local ports (e.g. `ws://localhost:8765`).
   - `MessageChannelTransport`: Communicates between iframe contexts and parent windows.

## Adding a New Tool

To expose a browser tool via WebMCP:

```typescript
client.registerTool({
  name: 'evaluate_dom',
  description: 'Evaluate JavaScript in the active browser tab',
  inputSchema: {
    type: 'object',
    properties: {
      expression: { type: 'string', description: 'JS expression to evaluate' }
    },
    required: ['expression']
  },
  handler: async (args) => {
    // Execute action
    return { result: 'evaluated' };
  }
});
```

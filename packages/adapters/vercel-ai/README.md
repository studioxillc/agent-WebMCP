# @webmcp/adapter-vercel-ai

Vercel AI SDK adapter for **WebMCP** (Web Model Context Protocol). Converts WebMCP tool definitions into Vercel AI SDK `tool()` definitions.

## Installation

```bash
bun add @thestudioxi/webmcp @webmcp/adapter-vercel-ai ai zod
```

## Usage

```ts
import { streamText } from 'ai';
import { webmcpToVercelAITools } from '@webmcp/adapter-vercel-ai';
import { createBackendAgentClient } from '@thestudioxi/webmcp';

const agentClient = createBackendAgentClient({ transport: myTransport });
await agentClient.connect();

const rawTools = await agentClient.getAvailableTools();
const tools = webmcpToVercelAITools(rawTools, (name, args) => agentClient.executeTool(name, args));

const result = streamText({
  model: myModel,
  messages,
  tools,
});
```

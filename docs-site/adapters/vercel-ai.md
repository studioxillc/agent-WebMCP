# Vercel AI SDK Adapter

The Vercel AI SDK adapter converts WebMCP tool definitions into Vercel AI SDK `tool()` format, enabling seamless integration with `streamText()`, `generateText()`, and other Vercel AI SDK functions.

## Installation

```bash
bun add @thestudioxi/webmcp @thestudioxi/webmcp-adapter-vercel-ai ai zod
```

## Usage

### Basic — Convert Tools

```ts
import { webmcpToVercelAITools } from '@thestudioxi/webmcp-adapter-vercel-ai';
import { createBackendAgentClient } from '@thestudioxi/webmcp';
import { streamText } from 'ai';
import { openai } from '@ai-sdk/openai';

// Connect to WebMCP server
const agentClient = createBackendAgentClient({ transport: myTransport });
await agentClient.connect();

// Get raw WebMCP tool definitions
const rawTools = await agentClient.getAvailableTools();

// Convert to Vercel AI SDK format
const tools = webmcpToVercelAITools(
  rawTools,
  (name, args) => agentClient.executeTool(name, args)
);

// Use with streamText
const result = streamText({
  model: openai('gpt-4o'),
  messages: [{ role: 'user', content: 'What text is on the page?' }],
  tools,
});
```

### Shortcut — Using WebMCPAgentClient

The backend SDK provides a convenience method that does the conversion automatically:

```ts
import { createBackendAgentClient } from '@thestudioxi/webmcp';
import { streamText } from 'ai';

const agent = createBackendAgentClient({ transport: myTransport });
await agent.connect();

// One-liner: get tools already in Vercel AI SDK format
const tools = await agent.getVercelAITools();

const result = streamText({
  model: myModel,
  messages,
  tools,
});
```

## How It Works

The adapter performs two conversions:

1. **JSON Schema → Zod**: Converts each tool's `inputSchema` (JSON Schema format) into a Zod schema using `jsonSchemaObjectToZod()`
2. **Tool Definition → Vercel AI Tool**: Wraps the Zod schema and description into the format expected by Vercel AI SDK's `tool()` function

### Supported JSON Schema Features

| JSON Schema | Zod Equivalent |
|---|---|
| `type: 'string'` | `z.string()` |
| `type: 'number'` / `type: 'integer'` | `z.number()` |
| `type: 'boolean'` | `z.boolean()` |
| `type: 'array'` | `z.array()` |
| `type: 'object'` | `z.object()` (recursive) |
| `enum: [...]` | `z.enum()` or `z.union()` |
| `const: value` | `z.literal()` |
| `description` | `.describe()` on any type |
| `required` | Required vs `.optional()` |

## API

### `webmcpToVercelAITools(tools, execute?)`

| Parameter | Type | Description |
|---|---|---|
| `tools` | `WebMCPToolDefinition[]` | Array of WebMCP tool definitions |
| `execute` | `(name, args) => Promise<any>` | Optional executor function |

**Returns**: `Record<string, VercelAITool>` — tool map compatible with Vercel AI SDK

### `jsonSchemaObjectToZod(inputSchema)`

| Parameter | Type | Description |
|---|---|---|
| `inputSchema` | `WebMCPToolDefinition['inputSchema']` | JSON Schema object spec |

**Returns**: `z.ZodObject<any>` — equivalent Zod schema

::: warning BYOK (Bring Your Own Key)
WebMCP does not provide LLM API keys. You must supply your own API key from your preferred provider (OpenAI, Google AI, Anthropic, etc.) via environment variables.
:::

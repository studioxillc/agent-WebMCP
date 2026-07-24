import { describe, expect, it } from 'bun:test';
import { webmcpToVercelAITools, jsonSchemaObjectToZod } from '../src/backend/vercel-ai.ts';
import type { WebMCPToolDefinition } from '../src/types/index.ts';

describe('Vercel AI SDK Adapter', () => {
  it('should convert JSON Schema object to Zod schema correctly', () => {
    const inputSchema: WebMCPToolDefinition['inputSchema'] = {
      type: 'object',
      properties: {
        query: { type: 'string', description: 'Search term' },
        count: { type: 'number', description: 'Limit' },
        verbose: { type: 'boolean' },
      },
      required: ['query'],
    };

    const zodSchema = jsonSchemaObjectToZod(inputSchema);
    expect(zodSchema).toBeDefined();

    // Valid object
    const parsed = zodSchema.parse({ query: 'test', count: 10 });
    expect(parsed.query).toBe('test');
    expect(parsed.count).toBe(10);
    expect(parsed.verbose).toBeUndefined();

    // Missing required field 'query' should throw error
    expect(() => zodSchema.parse({ count: 5 })).toThrow();
  });

  it('should convert WebMCP tool definitions to Vercel AI SDK tool objects and execute them', async () => {
    const toolsDef: WebMCPToolDefinition[] = [
      {
        name: 'web_navigate',
        description: 'Navigate browser active tab',
        inputSchema: {
          type: 'object',
          properties: {
            url: { type: 'string', description: 'Target URL' },
          },
          required: ['url'],
        },
      },
    ];

    let calledTool = '';
    let calledArgs: any = null;

    const mockExecutor = async (name: string, args: Record<string, any>) => {
      calledTool = name;
      calledArgs = args;
      return { success: true, navigatedTo: args.url };
    };

    const vercelTools = webmcpToVercelAITools(toolsDef, mockExecutor);

    expect(vercelTools.web_navigate).toBeDefined();
    expect(vercelTools.web_navigate.description).toBe('Navigate browser active tab');
    expect(vercelTools.web_navigate.parameters).toBeDefined();

    const result = await vercelTools.web_navigate.execute({ url: 'https://webmcp.org' });
    expect(calledTool).toBe('web_navigate');
    expect(calledArgs.url).toBe('https://webmcp.org');
    expect(result.success).toBe(true);
    expect(result.navigatedTo).toBe('https://webmcp.org');
  });
});

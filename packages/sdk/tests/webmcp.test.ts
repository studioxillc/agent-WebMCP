import { describe, expect, it } from 'bun:test';
import { MessageChannelTransport, WebMCPClient, WebMCPServer } from '../src/index.ts';

describe('WebMCP Core Protocol & Transports', () => {
  it('should list and call tools over MessageChannel transport', async () => {
    const channel = new MessageChannel();

    const serverTransport = new MessageChannelTransport(channel.port1);
    const clientTransport = new MessageChannelTransport(channel.port2);

    const server = new WebMCPServer({ transport: serverTransport });
    const client = new WebMCPClient({ transport: clientTransport });

    // Register a sample tool on the server
    server.registerTool(
      {
        name: 'echo_browser_state',
        description: 'Echo back browser tab state info',
        inputSchema: {
          type: 'object',
          properties: {
            url: { type: 'string' },
          },
        },
      },
      async (args) => {
        return {
          status: 'success',
          activeUrl: args.url || 'https://example.com',
          timestamp: Date.now(),
        };
      }
    );

    await server.start();
    await client.connect();

    // 1. List tools
    const tools = await client.listTools();
    expect(tools).toHaveLength(1);
    expect(tools[0].name).toBe('echo_browser_state');

    // 2. Call tool
    const result = await client.callTool('echo_browser_state', { url: 'https://webmcp.io' });
    expect(result.status).toBe('success');
    expect(result.activeUrl).toBe('https://webmcp.io');

    await client.disconnect();
    await server.stop();
  });
});

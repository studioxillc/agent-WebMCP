import { describe, expect, it } from 'bun:test';
import {
  createWebMCPHttpHandler,
  WebMCPServer,
  WebStandardHttpTransport,
} from '../src/index.ts';

describe('WebStandardHttpTransport (Bun, Hono, Next.js, Web Standard Request/Response)', () => {
  it('should handle OPTIONS preflight request with CORS headers', async () => {
    const transport = new WebStandardHttpTransport();
    await transport.connect();

    const request = new Request('http://localhost:3000/api/webmcp', {
      method: 'OPTIONS',
    });

    const response = await transport.handleRequest(request);
    expect(response.status).toBe(204);
    expect(response.headers.get('Access-Control-Allow-Origin')).toBe('*');

    await transport.disconnect();
  });

  it('should process JSON-RPC tool calls over Web Standard Request/Response', async () => {
    const transport = new WebStandardHttpTransport();
    const server = new WebMCPServer({ transport });

    server.registerTool(
      {
        name: 'ping_service',
        description: 'Ping network service',
        inputSchema: { type: 'object', properties: { host: { type: 'string' } } },
      },
      async (args) => {
        return { pong: true, host: args.host || 'localhost' };
      }
    );

    await server.start();
    await transport.connect();

    const httpHandler = createWebMCPHttpHandler(transport);

    const rpcPayload = {
      jsonrpc: '2.0',
      id: 101,
      method: 'tools/call',
      params: {
        name: 'ping_service',
        arguments: { host: 'gateway.local' },
      },
    };

    const request = new Request('http://localhost:3000/api/webmcp', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(rpcPayload),
    });

    const response = await httpHandler(request);
    expect(response.status).toBe(200);

    const json = await response.json();
    expect(json.jsonrpc).toBe('2.0');
    expect(json.id).toBe(101);
    expect(json.result.pong).toBe(true);
    expect(json.result.host).toBe('gateway.local');

    await transport.disconnect();
    await server.stop();
  });
});

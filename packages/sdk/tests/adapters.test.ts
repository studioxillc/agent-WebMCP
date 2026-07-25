import { describe, expect, it } from 'bun:test';
import { createExpressWebMCPMiddleware } from '@webmcp/adapter-express';
import { createHonoWebMCPHandler } from '@webmcp/adapter-hono';
import { WebMCPAdapter, WebMCPNestAdapter } from '@webmcp/adapter-nest';
import {
  WebStandardHttpTransport,
  WebMCPServer,
} from '../src/index.ts';

describe('Framework Adapter Tests', () => {
  describe('Express Adapter', () => {
    it('should create middleware that handles JSON-RPC requests', async () => {
      const transport = new WebStandardHttpTransport();
      const server = new WebMCPServer({ transport });

      server.registerTool(
        {
          name: 'echo',
          description: 'Echo input',
          inputSchema: { type: 'object', properties: { msg: { type: 'string' } } },
        },
        async (args) => ({ echoed: args.msg })
      );

      await server.start();
      await transport.connect();

      const middleware = createExpressWebMCPMiddleware(transport);

      // Mock Express request/response
      const mockReq = {
        method: 'POST',
        protocol: 'http',
        originalUrl: '/api/webmcp',
        url: '/api/webmcp',
        headers: { 'content-type': 'application/json' },
        body: {
          jsonrpc: '2.0',
          id: 1,
          method: 'tools/call',
          params: { name: 'echo', arguments: { msg: 'hello' } },
        },
        get: (name: string) => name === 'host' ? 'localhost:3000' : undefined,
      };

      let statusCode = 0;
      const responseHeaders: Record<string, string> = {};
      let responseBody = '';

      const mockRes = {
        status(code: number) { statusCode = code; return mockRes; },
        setHeader(key: string, val: string) { responseHeaders[key] = val; },
        send(body: string) { responseBody = body; },
      };

      const mockNext = (err?: unknown) => {
        if (err) throw err;
      };

      await middleware(mockReq, mockRes, mockNext);

      expect(statusCode).toBe(200);
      const json = JSON.parse(responseBody);
      expect(json.jsonrpc).toBe('2.0');
      expect(json.id).toBe(1);
      expect(json.result.echoed).toBe('hello');

      await transport.disconnect();
      await server.stop();
    });
  });

  describe('Hono Adapter', () => {
    it('should create handler that processes WebMCP requests via Hono context', async () => {
      const transport = new WebStandardHttpTransport();
      const server = new WebMCPServer({ transport });

      server.registerTool(
        {
          name: 'greet',
          description: 'Greet user',
          inputSchema: { type: 'object', properties: { name: { type: 'string' } } },
        },
        async (args) => ({ greeting: `Hello ${args.name}!` })
      );

      await server.start();
      await transport.connect();

      const handler = createHonoWebMCPHandler(transport);

      // Mock Hono context
      const rawRequest = new Request('http://localhost:3000/api/webmcp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jsonrpc: '2.0',
          id: 42,
          method: 'tools/call',
          params: { name: 'greet', arguments: { name: 'World' } },
        }),
      });

      const response = await handler({ req: { raw: rawRequest } });

      expect(response.status).toBe(200);
      const json = await response.json();
      expect(json.jsonrpc).toBe('2.0');
      expect(json.id).toBe(42);
      expect(json.result.greeting).toBe('Hello World!');

      await transport.disconnect();
      await server.stop();
    });
  });

  describe('NestJS / WebMCPAdapter', () => {
    it('should provide a self-contained adapter with tool registration and request handling', async () => {
      const adapter = new WebMCPAdapter();

      adapter.registerTool(
        {
          name: 'status',
          description: 'Get server status',
          inputSchema: { type: 'object', properties: {} },
        },
        async () => ({ status: 'ok', uptime: 42 })
      );

      await adapter.start();

      const request = new Request('http://localhost:3000/api/webmcp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jsonrpc: '2.0',
          id: 99,
          method: 'tools/call',
          params: { name: 'status', arguments: {} },
        }),
      });

      const response = await adapter.handleRequest(request);
      expect(response.status).toBe(200);

      const json = await response.json();
      expect(json.jsonrpc).toBe('2.0');
      expect(json.id).toBe(99);
      expect(json.result.status).toBe('ok');

      await adapter.stop();
    });

    it('should export deprecated WebMCPNestAdapter alias', () => {
      expect(WebMCPNestAdapter).toBe(WebMCPAdapter);
    });
  });
});

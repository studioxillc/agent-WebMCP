import type { WebMCPMessage, WebMCPRequest, WebMCPResponse, WebMCPTransport } from '../types/index';

export class WebStandardHttpTransport implements WebMCPTransport {
  private messageHandler?: (message: WebMCPMessage) => void;
  private connected: boolean = false;
  private pendingResponses: Map<string | number, (response: WebMCPResponse) => void> = new Map();

  async connect(): Promise<void> {
    this.connected = true;
  }

  async disconnect(): Promise<void> {
    this.connected = false;
    this.pendingResponses.clear();
  }

  async send(message: WebMCPMessage): Promise<void> {
    if (!this.connected) {
      throw new Error('WebStandardHttpTransport is not connected');
    }

    if ('id' in message && message.id !== undefined && !('method' in message)) {
      // It's a response to a pending request
      const resolver = this.pendingResponses.get(message.id);
      if (resolver) {
        resolver(message as WebMCPResponse);
        this.pendingResponses.delete(message.id);
      }
    }
  }

  onMessage(handler: (message: WebMCPMessage) => void): void {
    this.messageHandler = handler;
  }

  isConnected(): boolean {
    return this.connected;
  }

  /**
   * Processes an incoming Web Standard HTTP Request and returns a Web Standard Response.
   */
  async handleRequest(request: Request): Promise<Response> {
    const corsHeaders = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      'Content-Type': 'application/json',
    };

    if (request.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers: corsHeaders });
    }

    if (request.method !== 'POST') {
      return new Response(
        JSON.stringify({
          jsonrpc: '2.0',
          id: null,
          error: { code: -32600, message: 'Method Not Allowed. WebMCP endpoint accepts POST.' },
        }),
        { status: 405, headers: corsHeaders }
      );
    }

    try {
      const rpcRequest = (await request.json()) as WebMCPRequest;

      if (!rpcRequest || rpcRequest.jsonrpc !== '2.0' || !rpcRequest.method) {
        return new Response(
          JSON.stringify({
            jsonrpc: '2.0',
            id: rpcRequest?.id || null,
            error: { code: -32600, message: 'Invalid Request: missing jsonrpc 2.0 or method.' },
          }),
          { status: 400, headers: corsHeaders }
        );
      }

      return new Promise<Response>((resolve) => {
        const requestId = rpcRequest.id;

        // Register callback for when response is sent back through transport
        if (requestId !== undefined) {
          this.pendingResponses.set(requestId, (rpcResponse) => {
            resolve(new Response(JSON.stringify(rpcResponse), { status: 200, headers: corsHeaders }));
          });
        }

        // Notify message handler (server listener)
        if (this.messageHandler) {
          this.messageHandler(rpcRequest);
        } else {
          resolve(
            new Response(
              JSON.stringify({
                jsonrpc: '2.0',
                id: requestId || null,
                error: { code: -32603, message: 'No server listener registered on WebMCP transport.' },
              }),
              { status: 500, headers: corsHeaders }
            )
          );
        }
      });
    } catch (err: any) {
      return new Response(
        JSON.stringify({
          jsonrpc: '2.0',
          id: null,
          error: { code: -32700, message: `Parse Error: ${err.message}` },
        }),
        { status: 400, headers: corsHeaders }
      );
    }
  }
}

/**
 * Helper to create a Web Standard fetch handler for Bun, Hono, Next.js, Cloudflare Workers, etc.
 */
export function createWebMCPHttpHandler(transport: WebStandardHttpTransport) {
  return (request: Request) => transport.handleRequest(request);
}

import type { WebMCPMessage, WebMCPRequest, WebMCPResponse, WebMCPTransport } from '../types/index';

export interface WebStandardHttpTransportOptions {
  /** CORS allowed origin. Defaults to '*'. Set to a specific origin for production. */
  corsOrigin?: string;
  /** Request timeout in milliseconds. Defaults to 30000 (30 seconds). Set to 0 to disable. */
  requestTimeoutMs?: number;
}

export class WebStandardHttpTransport implements WebMCPTransport {
  private messageHandler?: (message: WebMCPMessage) => void;
  private connected: boolean = false;
  private pendingResponses: Map<string | number, (response: WebMCPResponse) => void> = new Map();
  private pendingTimeouts: Map<string | number, ReturnType<typeof setTimeout>> = new Map();
  private readonly corsOrigin: string;
  private readonly requestTimeoutMs: number;

  constructor(options: WebStandardHttpTransportOptions = {}) {
    this.corsOrigin = options.corsOrigin ?? '*';
    this.requestTimeoutMs = options.requestTimeoutMs ?? 30_000;
  }

  async connect(): Promise<void> {
    this.connected = true;
  }

  async disconnect(): Promise<void> {
    this.connected = false;
    // Clear all pending timeouts before clearing the map
    for (const timeout of this.pendingTimeouts.values()) {
      clearTimeout(timeout);
    }
    this.pendingTimeouts.clear();
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
        // Clean up timeout
        const timeout = this.pendingTimeouts.get(message.id);
        if (timeout) {
          clearTimeout(timeout);
          this.pendingTimeouts.delete(message.id);
        }
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

  private getCorsHeaders(): Record<string, string> {
    return {
      'Access-Control-Allow-Origin': this.corsOrigin,
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      'Content-Type': 'application/json',
    };
  }

  /**
   * Processes an incoming Web Standard HTTP Request and returns a Web Standard Response.
   */
  async handleRequest(request: Request): Promise<Response> {
    const corsHeaders = this.getCorsHeaders();

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

          // Set timeout to prevent indefinite pending requests
          if (this.requestTimeoutMs > 0) {
            const timeout = setTimeout(() => {
              this.pendingResponses.delete(requestId);
              this.pendingTimeouts.delete(requestId);
              resolve(
                new Response(
                  JSON.stringify({
                    jsonrpc: '2.0',
                    id: requestId,
                    error: { code: -32603, message: 'Request timed out.' },
                  }),
                  { status: 504, headers: corsHeaders }
                )
              );
            }, this.requestTimeoutMs);
            this.pendingTimeouts.set(requestId, timeout);
          }
        }

        // Notify message handler (server listener)
        if (this.messageHandler) {
          this.messageHandler(rpcRequest);
        } else {
          // Clean up pending state if no handler
          if (requestId !== undefined) {
            const timeout = this.pendingTimeouts.get(requestId);
            if (timeout) {
              clearTimeout(timeout);
              this.pendingTimeouts.delete(requestId);
            }
            this.pendingResponses.delete(requestId);
          }
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

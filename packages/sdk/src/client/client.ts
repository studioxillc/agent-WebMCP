import type {
  WebMCPClientOptions,
  WebMCPMessage,
  WebMCPRequest,
  WebMCPResponse,
  WebMCPToolDefinition,
  WebMCPTransport,
} from '../types/index';
import { WebMCPLogger } from '../utils/logger';

export class WebMCPClient {
  private transport: WebMCPTransport;
  private timeoutMs: number;
  private requestIdCounter = 1;
  private pendingRequests = new Map<
    string | number,
    {
      resolve: (value: any) => void;
      reject: (reason?: any) => void;
      timer: any;
    }
  >();
  private logger = new WebMCPLogger('WebMCPClient');

  constructor(options: WebMCPClientOptions) {
    this.transport = options.transport;
    this.timeoutMs = options.timeoutMs ?? 10000;

    this.transport.onMessage((msg) => this.handleIncomingMessage(msg));
  }

  async connect(): Promise<void> {
    await this.transport.connect();
    this.logger.info('WebMCP Client connected');
  }

  async disconnect(): Promise<void> {
    await this.transport.disconnect();
    this.logger.info('WebMCP Client disconnected');
  }

  async listTools(): Promise<WebMCPToolDefinition[]> {
    const res = await this.sendRequest('tools/list', {});
    return res.tools ?? [];
  }

  async callTool(name: string, args: Record<string, any> = {}): Promise<any> {
    const res = await this.sendRequest('tools/call', { name, arguments: args });
    return res;
  }

  private sendRequest(method: string, params: Record<string, any>): Promise<any> {
    return new Promise((resolve, reject) => {
      const id = this.requestIdCounter++;
      const request: WebMCPRequest = {
        jsonrpc: '2.0',
        id,
        method,
        params,
      };

      const timer = setTimeout(() => {
        if (this.pendingRequests.has(id)) {
          this.pendingRequests.delete(id);
          reject(new Error(`WebMCP request '${method}' (id: ${id}) timed out after ${this.timeoutMs}ms`));
        }
      }, this.timeoutMs);

      this.pendingRequests.set(id, { resolve, reject, timer });

      this.transport.send(request).catch((err) => {
        clearTimeout(timer);
        this.pendingRequests.delete(id);
        reject(err);
      });
    });
  }

  private handleIncomingMessage(message: WebMCPMessage): void {
    if ('id' in message && message.id !== undefined) {
      const pending = this.pendingRequests.get(message.id);
      if (pending) {
        clearTimeout(pending.timer);
        this.pendingRequests.delete(message.id);

        const response = message as WebMCPResponse;
        if (response.error) {
          pending.reject(new Error(`[RPC Error ${response.error.code}]: ${response.error.message}`));
        } else {
          pending.resolve(response.result);
        }
      }
    }
  }
}

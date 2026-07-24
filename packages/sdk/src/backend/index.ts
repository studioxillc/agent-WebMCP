import { WebMCPClient } from '../client/client.ts';
import type { WebMCPClientOptions, WebMCPToolDefinition } from '../types/index.ts';

export class WebMCPAgentClient {
  private client: WebMCPClient;

  constructor(options: WebMCPClientOptions) {
    this.client = new WebMCPClient(options);
  }

  async connect(): Promise<void> {
    await this.client.connect();
  }

  async disconnect(): Promise<void> {
    await this.client.disconnect();
  }

  async getAvailableTools(): Promise<WebMCPToolDefinition[]> {
    return this.client.listTools();
  }

  async executeTool(name: string, args: Record<string, any> = {}): Promise<any> {
    return this.client.callTool(name, args);
  }

  getRawClient(): WebMCPClient {
    return this.client;
  }
}

export function createBackendAgentClient(options: WebMCPClientOptions): WebMCPAgentClient {
  return new WebMCPAgentClient(options);
}

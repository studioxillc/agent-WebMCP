import { WebMCPClient } from '../client/client';
import type { WebMCPClientOptions, WebMCPToolDefinition } from '../types/index';
import { webmcpToVercelAITools, type VercelAITool } from './vercel-ai';

export * from './vercel-ai';

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

  async getVercelAITools(): Promise<Record<string, VercelAITool>> {
    const tools = await this.getAvailableTools();
    return webmcpToVercelAITools(tools, (name, args) => this.executeTool(name, args));
  }

  getRawClient(): WebMCPClient {
    return this.client;
  }
}

export function createBackendAgentClient(options: WebMCPClientOptions): WebMCPAgentClient {
  return new WebMCPAgentClient(options);
}

import { WebMCPServer } from '../server/server.ts';
import { getStarterKitTools, type RegisteredTool } from '../tools/starter-kit/index.ts';
import type { WebMCPToolDefinition, WebMCPToolHandler, WebMCPTransport } from '../types/index.ts';

export interface FrontendBridgeOptions {
  transport: WebMCPTransport;
  autoRegisterStarterKit?: boolean;
}

export class WebMCPBrowserBridge {
  private server: WebMCPServer;

  constructor(options: FrontendBridgeOptions) {
    this.server = new WebMCPServer({ transport: options.transport });

    if (options.autoRegisterStarterKit !== false) {
      this.registerStarterKit();
    }
  }

  registerTool(definition: WebMCPToolDefinition, handler: WebMCPToolHandler): this {
    this.server.registerTool(definition, handler);
    return this;
  }

  registerCustomTool(name: string, description: string, inputSchema: any, handler: WebMCPToolHandler): this {
    this.server.registerTool({ name, description, inputSchema }, handler);
    return this;
  }

  registerStarterKit(): this {
    const tools: RegisteredTool[] = getStarterKitTools();
    tools.forEach(({ definition, handler }) => {
      this.server.registerTool(definition, handler);
    });
    return this;
  }

  async start(): Promise<void> {
    await this.server.start();
  }

  async stop(): Promise<void> {
    await this.server.stop();
  }
}

export function createFrontendBridge(options: FrontendBridgeOptions): WebMCPBrowserBridge {
  return new WebMCPBrowserBridge(options);
}

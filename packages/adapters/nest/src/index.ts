import {
  createWebMCPHttpHandler,
  WebStandardHttpTransport,
  WebMCPServer,
  type WebMCPToolDefinition,
  type WebMCPToolHandler,
} from '@thestudioxi/webmcp';

export class WebMCPNestAdapter {
  private server: WebMCPServer;
  private transport: WebStandardHttpTransport;

  constructor() {
    this.transport = new WebStandardHttpTransport();
    this.server = new WebMCPServer({ transport: this.transport });
  }

  async start(): Promise<void> {
    await this.server.start();
    await this.transport.connect();
  }

  async stop(): Promise<void> {
    await this.transport.disconnect();
    await this.server.stop();
  }

  registerTool(definition: WebMCPToolDefinition, handler: WebMCPToolHandler): void {
    this.server.registerTool(definition, handler);
  }

  async handleRequest(request: Request): Promise<Response> {
    return this.transport.handleRequest(request);
  }
}

import {
  createWebMCPHttpHandler,
  WebStandardHttpTransport,
  WebMCPServer,
  type WebMCPToolDefinition,
  type WebMCPToolHandler,
  type WebStandardHttpTransportOptions,
} from '@thestudioxi/webmcp';

/**
 * Self-contained WebMCP adapter for NestJS and similar server-side frameworks.
 *
 * This class bundles a WebMCPServer + WebStandardHttpTransport and exposes
 * a `handleRequest(Request): Promise<Response>` method that can be called
 * from a NestJS Controller, Guard, or raw HTTP handler.
 *
 * Note: This is a plain adapter class, not a NestJS @Module or @Injectable.
 * Integrate it into your NestJS application by injecting it as a custom provider
 * and calling `handleRequest` from your controller.
 *
 * @example
 * ```typescript
 * // In your NestJS controller:
 * @Controller('api/webmcp')
 * export class WebMCPController {
 *   private adapter = new WebMCPAdapter();
 *
 *   async onModuleInit() {
 *     this.adapter.registerTool(myToolDef, myToolHandler);
 *     await this.adapter.start();
 *   }
 *
 *   @Post()
 *   async handle(@Req() req: Request) {
 *     return this.adapter.handleRequest(req);
 *   }
 * }
 * ```
 */
export class WebMCPAdapter {
  private server: WebMCPServer;
  private transport: WebStandardHttpTransport;

  constructor(options?: WebStandardHttpTransportOptions) {
    this.transport = new WebStandardHttpTransport(options);
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

/**
 * @deprecated Use WebMCPAdapter instead. WebMCPNestAdapter was misleadingly named.
 */
export const WebMCPNestAdapter = WebMCPAdapter;

import type {
  WebMCPMessage,
  WebMCPRequest,
  WebMCPResponse,
  WebMCPServerOptions,
  WebMCPToolDefinition,
  WebMCPToolHandler,
  WebMCPTransport,
} from '../types/index';
import { WebMCPLogger } from '../utils/logger';

export class WebMCPServer {
  private transport: WebMCPTransport;
  private tools = new Map<string, { definition: WebMCPToolDefinition; handler: WebMCPToolHandler }>();
  private logger = new WebMCPLogger('WebMCPServer');

  constructor(options: WebMCPServerOptions) {
    this.transport = options.transport;
    this.transport.onMessage((msg) => this.handleMessage(msg));
  }

  registerTool(definition: WebMCPToolDefinition, handler: WebMCPToolHandler): void {
    if (this.tools.has(definition.name)) {
      this.logger.warn(`Overwriting existing tool registration: '${definition.name}'`);
    }
    this.tools.set(definition.name, { definition, handler });
    this.logger.info(`Registered tool '${definition.name}'`);
  }

  async start(): Promise<void> {
    await this.transport.connect();
    this.logger.info('WebMCP Server started');
  }

  async stop(): Promise<void> {
    await this.transport.disconnect();
    this.logger.info('WebMCP Server stopped');
  }

  private async handleMessage(message: WebMCPMessage): Promise<void> {
    if ('method' in message) {
      const request = message as WebMCPRequest;
      const response: WebMCPResponse = {
        jsonrpc: '2.0',
        id: request.id,
      };

      try {
        if (request.method === 'tools/list') {
          const toolDefs = Array.from(this.tools.values()).map((t) => t.definition);
          response.result = { tools: toolDefs };
        } else if (request.method === 'tools/call') {
          const name = request.params?.name;
          const args = request.params?.arguments || {};
          const tool = this.tools.get(name);

          if (!tool) {
            response.error = {
              code: -32601,
              message: `Method/Tool not found: '${name}'`,
            };
          } else {
            const result = await tool.handler(args);
            response.result = result;
          }
        } else {
          response.error = {
            code: -32601,
            message: `Method not supported: '${request.method}'`,
          };
        }
      } catch (err: any) {
        response.error = {
          code: -32603,
          message: err.message || 'Internal RPC error',
        };
      }

      await this.transport.send(response);
    }
  }
}

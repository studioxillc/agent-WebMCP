/**
 * WebMCP Protocol Specification Types
 */

export interface WebMCPToolDefinition {
  name: string;
  description: string;
  inputSchema: {
    type: 'object';
    properties?: Record<string, any>;
    required?: string[];
    [key: string]: any;
  };
}

export type WebMCPToolHandler = (args: Record<string, any>) => Promise<any> | any;

export interface WebMCPRequest {
  jsonrpc: '2.0';
  id: string | number;
  method: string;
  params?: Record<string, any>;
}

export interface WebMCPResponse {
  jsonrpc: '2.0';
  id: string | number;
  result?: any;
  error?: {
    code: number;
    message: string;
    data?: any;
  };
}

export type WebMCPMessage = WebMCPRequest | WebMCPResponse;

export interface WebMCPTransport {
  connect(): Promise<void>;
  disconnect(): Promise<void>;
  send(message: WebMCPMessage): Promise<void>;
  onMessage(handler: (message: WebMCPMessage) => void): void;
  onConnect?(handler: () => void): void;
  onDisconnect?(handler: () => void): void;
  isConnected(): boolean;
}

export interface WebMCPClientOptions {
  transport: WebMCPTransport;
  timeoutMs?: number;
}

export interface WebMCPServerOptions {
  transport: WebMCPTransport;
}

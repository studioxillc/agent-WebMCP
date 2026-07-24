import type { WebMCPMessage, WebMCPTransport } from '../types/index.ts';
import { WebMCPLogger } from '../utils/logger.ts';

export class WebSocketTransport implements WebMCPTransport {
  private url: string;
  private ws: WebSocket | null = null;
  private messageHandlers: ((message: WebMCPMessage) => void)[] = [];
  private connectHandlers: (() => void)[] = [];
  private disconnectHandlers: (() => void)[] = [];
  private logger = new WebMCPLogger('WebSocketTransport');

  constructor(url: string) {
    this.url = url;
  }

  async connect(): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        this.ws = new WebSocket(this.url);

        this.ws.onopen = () => {
          this.logger.info(`Connected to ${this.url}`);
          this.connectHandlers.forEach((h) => h());
          resolve();
        };

        this.ws.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data.toString());
            this.messageHandlers.forEach((h) => h(data));
          } catch (err) {
            this.logger.error('Failed to parse WebSocket message', err);
          }
        };

        this.ws.onclose = () => {
          this.logger.info('WebSocket connection closed');
          this.disconnectHandlers.forEach((h) => h());
        };

        this.ws.onerror = (err) => {
          this.logger.error('WebSocket error', err);
          reject(err);
        };
      } catch (err) {
        reject(err);
      }
    });
  }

  async disconnect(): Promise<void> {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
  }

  async send(message: WebMCPMessage): Promise<void> {
    if (!this.isConnected()) {
      throw new Error('WebSocket is not connected');
    }
    this.ws!.send(JSON.stringify(message));
  }

  onMessage(handler: (message: WebMCPMessage) => void): void {
    this.messageHandlers.push(handler);
  }

  onConnect(handler: () => void): void {
    this.connectHandlers.push(handler);
  }

  onDisconnect(handler: () => void): void {
    this.disconnectHandlers.push(handler);
  }

  isConnected(): boolean {
    return this.ws !== null && this.ws.readyState === WebSocket.OPEN;
  }
}

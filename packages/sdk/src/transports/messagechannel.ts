import type { WebMCPMessage, WebMCPTransport } from '../types/index';
import { WebMCPLogger } from '../utils/logger';

export class MessageChannelTransport implements WebMCPTransport {
  private port: MessagePort | null = null;
  private messageHandlers: ((message: WebMCPMessage) => void)[] = [];
  private connectHandlers: (() => void)[] = [];
  private disconnectHandlers: (() => void)[] = [];
  private connected = false;
  private logger = new WebMCPLogger('MessageChannelTransport');

  constructor(port?: MessagePort) {
    if (port) {
      this.setPort(port);
    }
  }

  setPort(port: MessagePort) {
    this.port = port;
    this.port.onmessage = (event) => {
      try {
        const data = typeof event.data === 'string' ? JSON.parse(event.data) : event.data;
        this.messageHandlers.forEach((h) => h(data));
      } catch (err) {
        this.logger.error('Failed to parse message channel payload', err);
      }
    };
    this.connected = true;
    this.connectHandlers.forEach((h) => h());
  }

  async connect(): Promise<void> {
    if (!this.port) {
      throw new Error('MessagePort not set. Use setPort() before connecting.');
    }
    this.port.start();
    this.connected = true;
  }

  async disconnect(): Promise<void> {
    if (this.port) {
      this.port.close();
      this.port = null;
    }
    this.connected = false;
    this.disconnectHandlers.forEach((h) => h());
  }

  async send(message: WebMCPMessage): Promise<void> {
    if (!this.isConnected()) {
      throw new Error('MessageChannel transport is not connected');
    }
    this.port!.postMessage(message);
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
    return this.connected && this.port !== null;
  }
}

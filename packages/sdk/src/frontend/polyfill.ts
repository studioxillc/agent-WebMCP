import type { WebMCPToolDefinition, WebMCPToolHandler } from '../types/index';

/**
 * Standard W3C WebMCP navigator.modelContext interface
 */
export interface ModelContext {
  registerTool(tool: WebMCPToolDefinition, handler: WebMCPToolHandler): void;
  unregisterTool(name: string): boolean;
  listTools(): WebMCPToolDefinition[];
  callTool(name: string, params?: Record<string, any>): Promise<any>;
}

export class WebMCPPolyfill implements ModelContext {
  private tools = new Map<string, { definition: WebMCPToolDefinition; handler: WebMCPToolHandler }>();

  /**
   * Registers a new MCP tool definition and handler on the polyfill context.
   */
  registerTool(definition: WebMCPToolDefinition, handler: WebMCPToolHandler): void {
    if (!definition || !definition.name) {
      throw new Error('[WebMCPPolyfill] Invalid tool definition: missing name');
    }
    this.tools.set(definition.name, { definition, handler });
  }

  /**
   * Unregisters a registered tool by name.
   */
  unregisterTool(name: string): boolean {
    return this.tools.delete(name);
  }

  /**
   * Lists all registered tool definitions.
   */
  listTools(): WebMCPToolDefinition[] {
    return Array.from(this.tools.values()).map((t) => t.definition);
  }

  /**
   * Invokes a registered tool by name with arguments.
   */
  async callTool(name: string, params: Record<string, any> = {}): Promise<any> {
    const entry = this.tools.get(name);
    if (!entry) {
      throw new Error(`[WebMCPPolyfill] Tool not found: ${name}`);
    }
    return await entry.handler(params);
  }
}

/**
 * Safe global window injection for navigator.modelContext
 */
export function injectWebMCPPolyfill(targetWindow?: any): WebMCPPolyfill {
  const win = targetWindow || (typeof window !== 'undefined' ? window : null);
  if (!win || !win.navigator) {
    return new WebMCPPolyfill();
  }

  if (!(win.navigator as any).modelContext) {
    const polyfill = new WebMCPPolyfill();
    Object.defineProperty(win.navigator, 'modelContext', {
      value: polyfill,
      writable: false,
      configurable: true,
      enumerable: true,
    });
    return polyfill;
  }

  return (win.navigator as any).modelContext;
}

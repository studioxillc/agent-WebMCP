import type { WebMCPToolDefinition, WebMCPToolHandler } from '../../types/index';

export interface RegisteredTool {
  definition: WebMCPToolDefinition;
  handler: WebMCPToolHandler;
}

/**
 * DOM Starter Kit Tools
 */
export function getDOMStarterTools(): RegisteredTool[] {
  return [
    {
      definition: {
        name: 'dom_get_text',
        description: 'Extract text content from the active web page or CSS selector',
        inputSchema: {
          type: 'object',
          properties: {
            selector: { type: 'string', description: 'Optional CSS selector (defaults to body)' },
          },
        },
      },
      handler: async (args) => {
        const selector = args.selector || 'body';
        if (typeof document !== 'undefined') {
          const el = document.querySelector(selector);
          return { selector, text: el ? el.textContent : null };
        }
        return { selector, text: `[Mock DOM Text for selector '${selector}']` };
      },
    },
    {
      definition: {
        name: 'dom_click_element',
        description: 'Simulate click action on a DOM element matching CSS selector',
        inputSchema: {
          type: 'object',
          properties: {
            selector: { type: 'string', description: 'CSS selector of element to click' },
          },
          required: ['selector'],
        },
      },
      handler: async (args) => {
        const { selector } = args;
        if (typeof document !== 'undefined') {
          const el = document.querySelector(selector) as HTMLElement;
          if (el) {
            el.click();
            return { status: 'clicked', selector };
          }
          return { status: 'failed', error: `Element '${selector}' not found` };
        }
        return { status: 'clicked', selector, mocked: true };
      },
    },
  ];
}

/**
 * Navigation Starter Kit Tools
 */
export function getNavigationStarterTools(): RegisteredTool[] {
  return [
    {
      definition: {
        name: 'browser_get_url',
        description: 'Get the current window URL and document title',
        inputSchema: {
          type: 'object',
          properties: {},
        },
      },
      handler: async () => {
        if (typeof window !== 'undefined') {
          return { url: window.location.href, title: document.title };
        }
        return { url: 'https://example.com/active-tab', title: 'Example Active Tab' };
      },
    },
    {
      definition: {
        name: 'browser_navigate',
        description: 'Navigate the active browser tab to a new URL',
        inputSchema: {
          type: 'object',
          properties: {
            url: { type: 'string', description: 'Destination HTTP/HTTPS URL' },
          },
          required: ['url'],
        },
      },
      handler: async (args) => {
        const { url } = args;
        if (typeof window !== 'undefined') {
          if (typeof (window as any).__WEBMCP_NAVIGATE__ === 'function') {
            (window as any).__WEBMCP_NAVIGATE__(url);
          }
          return { status: 'navigated', url, simulated: true };
        }
        return { status: 'navigated', url, mocked: true };
      },
    },
  ];
}

/**
 * Storage Starter Kit Tools
 */
export function getStorageStarterTools(): RegisteredTool[] {
  return [
    {
      definition: {
        name: 'storage_get_item',
        description: 'Read a value from browser localStorage by key',
        inputSchema: {
          type: 'object',
          properties: {
            key: { type: 'string', description: 'localStorage key name' },
          },
          required: ['key'],
        },
      },
      handler: async (args) => {
        const { key } = args;
        if (typeof localStorage !== 'undefined') {
          return { key, value: localStorage.getItem(key) };
        }
        return { key, value: `[Mock localStorage value for '${key}']` };
      },
    },
    {
      definition: {
        name: 'storage_set_item',
        description: 'Set a key-value pair in browser localStorage',
        inputSchema: {
          type: 'object',
          properties: {
            key: { type: 'string', description: 'localStorage key name' },
            value: { type: 'string', description: 'String value to set' },
          },
          required: ['key', 'value'],
        },
      },
      handler: async (args) => {
        const { key, value } = args;
        if (typeof localStorage !== 'undefined') {
          localStorage.setItem(key, value);
          return { status: 'saved', key, value };
        }
        return { status: 'saved', key, value, mocked: true };
      },
    },
  ];
}

/**
 * Returns complete suite of pre-registered Starter Kit tools
 */
export function getStarterKitTools(): RegisteredTool[] {
  return [
    ...getDOMStarterTools(),
    ...getNavigationStarterTools(),
    ...getStorageStarterTools(),
  ];
}

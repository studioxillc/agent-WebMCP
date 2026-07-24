import type { WebMCPToolDefinition } from '@thestudioxi/webmcp';

export const BROWSER_NAVIGATE_TOOL: WebMCPToolDefinition = {
  name: 'browser_navigate',
  description: 'Navigate active browser tab to target URL',
  inputSchema: {
    type: 'object',
    properties: {
      url: { type: 'string', description: 'Destination HTTP/HTTPS URL' },
    },
    required: ['url'],
  },
};

export const BROWSER_GET_TEXT_TOOL: WebMCPToolDefinition = {
  name: 'browser_get_tab_text',
  description: 'Extract visible inner text content from active tab DOM',
  inputSchema: {
    type: 'object',
    properties: {
      selector: { type: 'string', description: 'CSS selector query (optional)' },
    },
  },
};

export const LOCAL_NETWORK_PING_TOOL: WebMCPToolDefinition = {
  name: 'local_network_status',
  description: 'Query status of local network services',
  inputSchema: {
    type: 'object',
    properties: {
      service: { type: 'string', description: 'Local service name (e.g. gateway, devserver)' },
    },
  },
};

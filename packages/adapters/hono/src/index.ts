import { createWebMCPHttpHandler, type WebStandardHttpTransport } from '@thestudioxi/webmcp';

/**
 * Creates a Hono route handler for WebMCP endpoint.
 *
 * Usage:
 * app.post('/api/webmcp', createHonoWebMCPHandler(transport));
 */
export function createHonoWebMCPHandler(transport: WebStandardHttpTransport) {
  const httpHandler = createWebMCPHttpHandler(transport);
  return async (c: any) => {
    const response = await httpHandler(c.req.raw);
    return response;
  };
}

import { createWebMCPHttpHandler, type WebStandardHttpTransport } from '@thestudioxi/webmcp';

/**
 * Minimal Hono-compatible context type.
 * Using inline interface to avoid requiring hono as a hard dependency.
 */
interface HonoContext {
  req: { raw: Request };
}

/**
 * Creates a Hono route handler for WebMCP endpoint.
 *
 * Usage:
 * app.post('/api/webmcp', createHonoWebMCPHandler(transport));
 */
export function createHonoWebMCPHandler(transport: WebStandardHttpTransport) {
  const httpHandler = createWebMCPHttpHandler(transport);
  return async (c: HonoContext): Promise<Response> => {
    return httpHandler(c.req.raw);
  };
}

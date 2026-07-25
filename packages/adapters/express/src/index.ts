import { createWebMCPHttpHandler, type WebStandardHttpTransport } from '@thestudioxi/webmcp';

/**
 * Minimal Express-compatible types.
 * Using inline interfaces to avoid requiring express as a hard dependency.
 */
interface ExpressRequest {
  method: string;
  protocol?: string;
  originalUrl?: string;
  url?: string;
  headers: Record<string, string | string[] | undefined>;
  body?: unknown;
  get(name: string): string | undefined;
}

interface ExpressResponse {
  status(code: number): ExpressResponse;
  setHeader(name: string, value: string): void;
  send(body: string): void;
}

type ExpressNextFunction = (err?: unknown) => void;

/**
 * Creates an Express.js middleware function for WebMCP endpoints.
 *
 * Usage:
 * app.use('/api/webmcp', createExpressWebMCPMiddleware(transport));
 */
export function createExpressWebMCPMiddleware(transport: WebStandardHttpTransport) {
  const httpHandler = createWebMCPHttpHandler(transport);

  return async (req: ExpressRequest, res: ExpressResponse, next: ExpressNextFunction) => {
    try {
      const url = `${req.protocol || 'http'}://${req.get('host') || 'localhost'}${req.originalUrl || req.url}`;

      let bodyText = '';
      if (req.body && typeof req.body === 'object') {
        bodyText = JSON.stringify(req.body);
      } else if (typeof req.body === 'string') {
        bodyText = req.body;
      }

      const webRequest = new Request(url, {
        method: req.method,
        headers: req.headers as HeadersInit,
        body: ['POST', 'PUT', 'PATCH'].includes(req.method) ? bodyText : undefined,
      });

      const webResponse = await httpHandler(webRequest);

      res.status(webResponse.status);
      webResponse.headers.forEach((val: string, key: string) => {
        res.setHeader(key, val);
      });

      const text = await webResponse.text();
      res.send(text);
    } catch (err) {
      next(err);
    }
  };
}

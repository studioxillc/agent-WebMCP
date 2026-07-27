import { describe, expect, test } from 'bun:test';
import { injectWebMCPPolyfill, WebMCPPolyfill } from '../src/frontend/polyfill';

describe('W3C WebMCP Browser Polyfill (navigator.modelContext)', () => {
  test('should register, list, call, and unregister tools on WebMCPPolyfill instance', async () => {
    const polyfill = new WebMCPPolyfill();

    polyfill.registerTool(
      {
        name: 'test_calculator',
        description: 'Add two numbers',
        inputSchema: {
          type: 'object',
          properties: {
            a: { type: 'number' },
            b: { type: 'number' },
          },
          required: ['a', 'b'],
        },
      },
      async (args: any) => args.a + args.b
    );

    const tools = polyfill.listTools();
    expect(tools.length).toBe(1);
    expect(tools[0].name).toBe('test_calculator');

    const result = await polyfill.callTool('test_calculator', { a: 15, b: 27 });
    expect(result).toBe(42);

    const unregistered = polyfill.unregisterTool('test_calculator');
    expect(unregistered).toBe(true);
    expect(polyfill.listTools().length).toBe(0);
  });

  test('should throw error when calling unregistered tool or registering invalid tool', async () => {
    const polyfill = new WebMCPPolyfill();

    expect(() => polyfill.registerTool({} as any, async () => {})).toThrow();
    expect(polyfill.callTool('non_existent')).rejects.toThrow();
  });

  test('should safely inject navigator.modelContext on target window', () => {
    const mockWindow: any = {
      navigator: {},
    };

    const polyfill = injectWebMCPPolyfill(mockWindow);
    expect(mockWindow.navigator.modelContext).toBeDefined();
    expect(mockWindow.navigator.modelContext).toBe(polyfill);
  });
});

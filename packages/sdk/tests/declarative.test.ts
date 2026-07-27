import { describe, expect, test } from 'bun:test';
import { parseDeclarativeTools } from '../src/frontend/declarative';
import { WebMCPPolyfill } from '../src/frontend/polyfill';

describe('Declarative HTML Form Attribute Parser', () => {
  test('should parse mock HTML elements with toolname and toolparam attributes', async () => {
    const polyfill = new WebMCPPolyfill();

    // Mock minimal DOM element structure
    const mockInput1 = {
      getAttribute: (attr: string) => {
        if (attr === 'toolparam' || attr === 'name') return 'query';
        if (attr === 'type') return 'text';
        if (attr === 'placeholder') return 'Search query text';
        return null;
      },
      hasAttribute: (attr: string) => attr === 'required',
    };

    const mockInput2 = {
      getAttribute: (attr: string) => {
        if (attr === 'toolparam' || attr === 'name') return 'limit';
        if (attr === 'type') return 'number';
        return null;
      },
      hasAttribute: () => false,
    };

    const mockForm = {
      getAttribute: (attr: string) => {
        if (attr === 'toolname') return 'search_catalog';
        if (attr === 'tooldescription') return 'Search products catalog';
        return null;
      },
      querySelectorAll: (selector: string) => {
        if (selector.includes('toolparam')) return [mockInput1, mockInput2];
        return [];
      },
      querySelector: () => null,
      tagName: 'FORM',
    };

    const mockDocument = {
      querySelectorAll: (selector: string) => {
        if (selector === '[toolname]') return [mockForm];
        return [];
      },
    };

    const parsed = parseDeclarativeTools({
      root: mockDocument,
      modelContext: polyfill,
    });

    expect(parsed.length).toBe(1);
    expect(parsed[0].definition.name).toBe('search_catalog');
    expect(parsed[0].definition.description).toBe('Search products catalog');
    expect(parsed[0].definition.inputSchema.properties?.query).toBeDefined();
    expect(parsed[0].definition.inputSchema.properties?.limit).toBeDefined();
    expect(parsed[0].definition.inputSchema.required).toEqual(['query']);

    // Verify registered in polyfill
    const registeredTools = polyfill.listTools();
    expect(registeredTools.length).toBe(1);
    expect(registeredTools[0].name).toBe('search_catalog');
  });

  test('should execute tool handler, populate input values, and trigger form submission', async () => {
    const polyfill = new WebMCPPolyfill();
    let submitted = false;

    const mockInput = {
      value: '',
      getAttribute: (attr: string) => {
        if (attr === 'toolparam' || attr === 'name') return 'username';
        if (attr === 'type') return 'text';
        return null;
      },
      hasAttribute: () => false,
    };

    const mockForm = {
      getAttribute: (attr: string) => {
        if (attr === 'toolname') return 'user_login';
        return null;
      },
      querySelectorAll: (selector: string) => {
        if (selector.includes('toolparam')) return [mockInput];
        return [];
      },
      querySelector: (selector: string) => {
        if (selector.includes('username')) return mockInput;
        return null;
      },
      requestSubmit: () => {
        submitted = true;
      },
      tagName: 'FORM',
    };

    const mockDocument = {
      querySelectorAll: () => [mockForm],
    };

    parseDeclarativeTools({
      root: mockDocument,
      modelContext: polyfill,
      autoSubmitForm: true,
    });

    const result = await polyfill.callTool('user_login', { username: 'alice' });

    expect(result.success).toBe(true);
    expect(mockInput.value).toBe('alice');
    expect(submitted).toBe(true);
  });

  test('should handle empty or invalid root gracefully', () => {
    const parsed = parseDeclarativeTools({ root: null });
    expect(parsed).toEqual([]);
  });
});

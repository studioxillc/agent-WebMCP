import type { WebMCPToolDefinition, WebMCPToolHandler } from '../types/index';
import { injectWebMCPPolyfill, type ModelContext } from './polyfill';

export interface DeclarativeOptions {
  root?: any;
  modelContext?: ModelContext;
  autoSubmitForm?: boolean;
}

export interface ParsedDeclarativeTool {
  definition: WebMCPToolDefinition;
  element: any; // HTMLFormElement or HTMLElement
}

/**
 * Parses DOM elements with `toolname` attributes into WebMCP tool definitions.
 */
export function parseDeclarativeTools(options: DeclarativeOptions = {}): ParsedDeclarativeTool[] {
  const root = options.root || (typeof document !== 'undefined' ? document : null);
  if (!root || typeof root.querySelectorAll !== 'function') {
    return [];
  }

  const elements = Array.from(root.querySelectorAll('[toolname]')) as any[];
  const parsedTools: ParsedDeclarativeTool[] = [];
  const mc = options.modelContext || (typeof window !== 'undefined' ? injectWebMCPPolyfill() : null);

  for (const el of elements) {
    const name = el.getAttribute('toolname');
    if (!name) continue;

    const description = el.getAttribute('tooldescription') || el.getAttribute('title') || `Execute ${name} form action`;

    // Discover tool parameters from children or inputs
    const paramElements = Array.from(el.querySelectorAll('[toolparam], input[name], textarea[name], select[name]')) as any[];
    const properties: Record<string, any> = {};
    const required: string[] = [];

    for (const input of paramElements) {
      const paramName = input.getAttribute('toolparam') || input.getAttribute('name');
      if (!paramName) continue;

      const inputType = input.getAttribute('type') || 'text';
      let jsonType: 'string' | 'number' | 'boolean' = 'string';
      if (inputType === 'number' || inputType === 'range') {
        jsonType = 'number';
      } else if (inputType === 'checkbox') {
        jsonType = 'boolean';
      }

      properties[paramName] = {
        type: jsonType,
        description: input.getAttribute('placeholder') || input.getAttribute('aria-label') || paramName,
      };

      if (input.hasAttribute('required')) {
        required.push(paramName);
      }
    }

    const definition: WebMCPToolDefinition = {
      name,
      description,
      inputSchema: {
        type: 'object',
        properties,
        ...(required.length > 0 ? { required } : {}),
      },
    };

    // Construct form handler
    const handler: WebMCPToolHandler = async (args: Record<string, any>) => {
      // Populate inputs with args if called programmatically
      for (const [key, val] of Object.entries(args)) {
        const matchingInput = el.querySelector(`[toolparam="${key}"], [name="${key}"]`);
        if (matchingInput) {
          if (matchingInput.getAttribute('type') === 'checkbox') {
            matchingInput.checked = Boolean(val);
          } else {
            matchingInput.value = String(val);
          }
        }
      }

      // Handle submit action if element is a form
      if (el.tagName === 'FORM') {
        if (typeof el.requestSubmit === 'function') {
          el.requestSubmit();
        } else if (typeof el.submit === 'function') {
          el.submit();
        }
      }
      return { success: true, tool: name, args };
    };

    if (mc) {
      mc.registerTool(definition, handler);
    }

    parsedTools.push({ definition, element: el });
  }

  return parsedTools;
}

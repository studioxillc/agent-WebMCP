import { z } from 'zod';
import type { WebMCPToolDefinition } from '@thestudioxi/webmcp';

/**
 * Converts JSON Schema property type definitions into Zod schemas.
 */
export function jsonSchemaPropertyToZod(propSchema: Record<string, any> = {}): z.ZodTypeAny {
  let zodType: z.ZodTypeAny;

  // Handle JSON Schema `const` keyword (fixed literal value)
  if (propSchema.const !== undefined) {
    zodType = z.literal(propSchema.const);
    if (propSchema.description && typeof propSchema.description === 'string') {
      zodType = zodType.describe(propSchema.description);
    }
    return zodType;
  }

  // Handle JSON Schema `enum` keyword (restricted set of values)
  if (Array.isArray(propSchema.enum) && propSchema.enum.length > 0) {
    const enumValues = propSchema.enum;
    if (enumValues.every((v: unknown) => typeof v === 'string')) {
      zodType = z.enum(enumValues as [string, ...string[]]);
    } else {
      const literals = enumValues.map((v: z.Primitive) => z.literal(v));
      zodType = z.union([literals[0], literals[1] ?? literals[0], ...literals.slice(2)]);
    }
    if (propSchema.description && typeof propSchema.description === 'string') {
      zodType = zodType.describe(propSchema.description);
    }
    return zodType;
  }

  switch (propSchema.type) {
    case 'string':
      zodType = z.string();
      break;
    case 'number':
    case 'integer':
      zodType = z.number();
      break;
    case 'boolean':
      zodType = z.boolean();
      break;
    case 'array':
      if (propSchema.items) {
        zodType = z.array(jsonSchemaPropertyToZod(propSchema.items));
      } else {
        zodType = z.array(z.any());
      }
      break;
    case 'object':
      if (propSchema.properties) {
        zodType = jsonSchemaObjectToZod({
          type: 'object',
          properties: propSchema.properties,
          required: propSchema.required,
        });
      } else {
        zodType = z.record(z.string(), z.any());
      }
      break;
    default:
      zodType = z.any();
      break;
  }

  if (propSchema.description && typeof propSchema.description === 'string') {
    zodType = zodType.describe(propSchema.description);
  }

  return zodType;
}

/**
 * Converts a JSON Schema object specification into a Zod object schema.
 */
export function jsonSchemaObjectToZod(
  inputSchema: WebMCPToolDefinition['inputSchema']
): z.ZodObject<any> {
  const shape: Record<string, z.ZodTypeAny> = {};
  const properties = inputSchema.properties || {};
  const required = new Set(inputSchema.required || []);

  for (const [key, propSchema] of Object.entries(properties)) {
    let fieldZod = jsonSchemaPropertyToZod(propSchema);
    if (!required.has(key)) {
      fieldZod = fieldZod.optional();
    }
    shape[key] = fieldZod;
  }

  return z.object(shape);
}

export interface VercelAITool {
  description: string;
  parameters: z.ZodObject<any>;
  execute?: (args: any) => Promise<any>;
}

export type WebMCPToolExecutor = (name: string, args: Record<string, any>) => Promise<any>;

/**
 * Converts WebMCP tool definitions into Vercel AI SDK tool definitions.
 */
export function webmcpToVercelAITools(
  tools: WebMCPToolDefinition[],
  execute?: WebMCPToolExecutor
): Record<string, VercelAITool> {
  const vercelTools: Record<string, VercelAITool> = {};

  for (const toolDef of tools) {
    const parameters = jsonSchemaObjectToZod(toolDef.inputSchema);

    vercelTools[toolDef.name] = {
      description: toolDef.description || '',
      parameters,
      ...(execute ? { execute: async (args: any) => execute(toolDef.name, args || {}) } : {}),
    };
  }

  return vercelTools;
}

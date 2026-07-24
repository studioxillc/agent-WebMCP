import type { WebMCPToolDefinition } from '@zhenximi/webmcp';
import type { AIModelConfig } from './config.ts';

export interface LLMResponse {
  content: string;
  toolCall?: {
    name: string;
    arguments: Record<string, any>;
  };
}

export class LLMClient {
  private config: AIModelConfig;

  constructor(config: AIModelConfig) {
    this.config = config;
  }

  async generateStep(
    objective: string,
    availableTools: WebMCPToolDefinition[],
    stepHistory: any[]
  ): Promise<LLMResponse> {
    if (this.config.provider === 'mock' || !this.config.apiKey) {
      return this.generateMockStep(stepHistory.length);
    }

    if (this.config.provider === 'gemini') {
      return this.callGeminiAPI(objective, availableTools, stepHistory);
    }

    if (this.config.provider === 'openai') {
      return this.callOpenAIAPI(objective, availableTools, stepHistory);
    }

    return this.generateMockStep(stepHistory.length);
  }

  private async callGeminiAPI(
    objective: string,
    tools: WebMCPToolDefinition[],
    history: any[]
  ): Promise<LLMResponse> {
    const modelName = this.config.model || 'gemini-2.5-flash';
    const url = `${this.config.baseUrl || 'https://generativelanguage.googleapis.com/v1beta'}/models/${modelName}:generateContent?key=${this.config.apiKey}`;

    const functionDeclarations = tools.map((t) => ({
      name: t.name,
      description: t.description,
      parameters: t.inputSchema,
    }));

    const systemPrompt = `You are an AI Agent operating a local WebMCP browser and network bridge.
Your Objective: "${objective}"
Review the history and choose the appropriate tool to call next to make progress towards the objective.`;

    const contents = [
      {
        role: 'user',
        parts: [{ text: `${systemPrompt}\nStep History: ${JSON.stringify(history)}` }],
      },
    ];

    const bodyPayload = {
      contents,
      tools: [{ functionDeclarations }],
    };

    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(bodyPayload),
    });

    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`Gemini API Error [${response.status}]: ${errText}`);
    }

    const data = await response.json();
    const candidate = data.candidates?.[0];
    const parts = candidate?.content?.parts || [];

    for (const part of parts) {
      if (part.functionCall) {
        return {
          content: `Executing tool ${part.functionCall.name}`,
          toolCall: {
            name: part.functionCall.name,
            arguments: part.functionCall.args || {},
          },
        };
      }
    }

    const textPart = parts.find((p: any) => p.text)?.text || '';
    return { content: textPart };
  }

  private async callOpenAIAPI(
    objective: string,
    tools: WebMCPToolDefinition[],
    history: any[]
  ): Promise<LLMResponse> {
    const url = `${this.config.baseUrl || 'https://api.openai.com/v1'}/chat/completions`;

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${this.config.apiKey}`,
      },
      body: JSON.stringify({
        model: this.config.model,
        messages: [
          {
            role: 'system',
            content: `You are an AI Agent with access to local WebMCP tools. Objective: ${objective}`,
          },
          { role: 'user', content: `History: ${JSON.stringify(history)}` },
        ],
        tools: tools.map((t) => ({
          type: 'function',
          function: {
            name: t.name,
            description: t.description,
            parameters: t.inputSchema,
          },
        })),
      }),
    });

    if (!response.ok) {
      throw new Error(`OpenAI API Error [${response.status}]: ${await response.text()}`);
    }

    const data = await response.json();
    const choice = data.choices?.[0]?.message;
    if (choice?.tool_calls?.length > 0) {
      const tc = choice.tool_calls[0].function;
      return {
        content: choice.content || '',
        toolCall: {
          name: tc.name,
          arguments: JSON.parse(tc.arguments || '{}'),
        },
      };
    }

    return { content: choice?.content || '' };
  }

  private generateMockStep(currentStepIndex: number): LLMResponse {
    if (currentStepIndex === 0) {
      return {
        content: 'Planning to navigate active browser tab.',
        toolCall: {
          name: 'browser_navigate',
          arguments: { url: 'https://news.ycombinator.com' },
        },
      };
    }
    if (currentStepIndex === 1) {
      return {
        content: 'Extracting DOM headline content.',
        toolCall: {
          name: 'browser_get_tab_text',
          arguments: { selector: '.titleline' },
        },
      };
    }
    return {
      content: 'Checking local network gateway.',
      toolCall: {
        name: 'local_network_status',
        arguments: { service: 'gateway' },
      },
    };
  }
}

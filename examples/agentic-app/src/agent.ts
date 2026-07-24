import type { WebMCPClient } from '@studioxi/webmcp';
import { type AIModelConfig } from './config.ts';
import { LLMClient } from './llm.ts';

export interface AgentStepResult {
  step: number;
  action: string;
  toolUsed?: string;
  output: any;
}

export class PiAgentRunner {
  private client: WebMCPClient;
  private llmClient: LLMClient;
  private modelConfig: AIModelConfig;

  constructor(client: WebMCPClient, modelConfig: AIModelConfig) {
    this.client = client;
    this.modelConfig = modelConfig;
    this.llmClient = new LLMClient(modelConfig);
  }

  async runGoal(userObjective: string): Promise<AgentStepResult[]> {
    console.log(`\n🤖 [PiAgent] Starting agent loop for objective: "${userObjective}"`);
    console.log(`🔐 [AI Auth Config] Provider: '${this.modelConfig.provider.toUpperCase()}' | Model: '${this.modelConfig.model}' | Auth Key Provided: ${this.modelConfig.apiKey ? 'YES' : 'NO (Using Mock)'}`);

    // 1. Discover available WebMCP tools
    const availableTools = await this.client.listTools();
    console.log(`📋 [PiAgent] Discovered ${availableTools.length} WebMCP tools:`);
    availableTools.forEach((t) => console.log(`   • ${t.name}: ${t.description}`));

    const history: AgentStepResult[] = [];
    const maxSteps = 3;

    for (let step = 1; step <= maxSteps; step++) {
      console.log(`\n👉 [Step ${step}] Requesting LLM tool decision (${this.modelConfig.provider})...`);

      const response = await this.llmClient.generateStep(userObjective, availableTools, history);

      if (response.toolCall) {
        const { name, arguments: toolArgs } = response.toolCall;
        console.log(`   Executing Tool via WebMCP: '${name}' with args:`, toolArgs);

        const result = await this.client.callTool(name, toolArgs);
        history.push({
          step,
          action: response.content || `Executed tool ${name}`,
          toolUsed: name,
          output: result,
        });
        console.log(`   Output:`, result);
      } else {
        console.log(`   LLM Response:`, response.content);
        history.push({
          step,
          action: response.content,
          output: response.content,
        });
        break;
      }
    }

    console.log(`\n✅ [PiAgent] Objective completed successfully in ${history.length} steps.`);
    return history;
  }
}

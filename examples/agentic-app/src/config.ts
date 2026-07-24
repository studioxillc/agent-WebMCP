export interface AIModelConfig {
  provider: 'gemini' | 'openai' | 'anthropic' | 'mock';
  apiKey?: string;
  model: string;
  baseUrl?: string;
}

export function loadAIModelConfig(): AIModelConfig {
  const provider = (process.env.AI_PROVIDER as any) || 
    (process.env.GEMINI_API_KEY ? 'gemini' : 
     process.env.OPENAI_API_KEY ? 'openai' : 
     process.env.ANTHROPIC_API_KEY ? 'anthropic' : 'mock');

  const apiKey = 
    process.env.GEMINI_API_KEY || 
    process.env.OPENAI_API_KEY || 
    process.env.ANTHROPIC_API_KEY || 
    process.env.AI_API_KEY;

  const model = process.env.AI_MODEL || 
    (provider === 'gemini' ? 'gemini-2.5-flash' : 
     provider === 'openai' ? 'gpt-4o' : 
     provider === 'anthropic' ? 'claude-3-5-sonnet' : 'mock-model');

  const baseUrl = process.env.AI_BASE_URL;

  return {
    provider,
    apiKey,
    model,
    baseUrl,
  };
}

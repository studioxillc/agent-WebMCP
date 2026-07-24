import { createGoogleGenerativeAI, google } from '@ai-sdk/google';
import { openai } from '@ai-sdk/openai';
import { streamText, type Message } from 'ai';
import {
  createBackendAgentClient,
  createFrontendBridge,
  MessageChannelTransport,
} from '@thestudioxi/webmcp';

export const runtime = 'nodejs';

export async function POST(req: Request) {
  const { messages }: { messages: Message[] } = await req.json();

  // Set up in-memory WebMCP transport bridge for API route session
  const channel = new MessageChannel();
  const frontendTransport = new MessageChannelTransport(channel.port1);
  const backendTransport = new MessageChannelTransport(channel.port2);

  const frontendBridge = createFrontendBridge({
    transport: frontendTransport,
    autoRegisterStarterKit: true,
  });
  await frontendBridge.start();

  const agentClient = createBackendAgentClient({ transport: backendTransport });
  await agentClient.connect();

  // Convert WebMCP tools into Vercel AI SDK tools format
  const tools = await agentClient.getVercelAITools();

  const geminiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_GENERATIVE_AI_API_KEY;
  const openaiKey = process.env.OPENAI_API_KEY;
  const aiModel = process.env.AI_MODEL || 'gemini-1.5-flash';

  // 1. If Gemini API Key is configured
  if (geminiKey || process.env.AI_PROVIDER === 'gemini') {
    const googleProvider = geminiKey ? createGoogleGenerativeAI({ apiKey: geminiKey }) : google;
    const result = streamText({
      model: googleProvider(aiModel),
      messages,
      tools,
      maxSteps: 5,
    });
    return result.toDataStreamResponse();
  }

  // 2. If OpenAI API Key is configured
  if (openaiKey) {
    const result = streamText({
      model: openai('gpt-4o-mini'),
      messages,
      tools,
      maxSteps: 5,
    });
    return result.toDataStreamResponse();
  }

  // 3. Fallback demo stream when no API keys are set
  const lastUserMessage = messages[messages.length - 1]?.content || 'Hello';
  const encoder = new TextEncoder();

  const customStream = new ReadableStream({
    async start(controller) {
      const intro = `🤖 **WebMCP AI Assistant (Vercel AI SDK Demo)**\n\n`;
      controller.enqueue(encoder.encode(`0:${JSON.stringify(intro)}\n`));

      const toolNames = Object.keys(tools);
      const toolsInfo = `Connected to WebMCP Bridge with **${toolNames.length} active tools**:\n` +
        toolNames.map((t) => `- \`${t}\`: ${tools[t].description}`).join('\n') +
        `\n\nYou asked: "${lastUserMessage}"`;

      controller.enqueue(encoder.encode(`0:${JSON.stringify(toolsInfo)}\n`));
      controller.close();
    },
  });

  return new Response(customStream, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'X-Vercel-AI-Data-Stream': 'v1',
    },
  });
}

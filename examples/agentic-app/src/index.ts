import { createBackendAgentClient, createFrontendBridge, MessageChannelTransport } from '@thestudioxi/webmcp';
import { PiAgentRunner } from './agent.ts';
import { loadAIModelConfig } from './config.ts';
import { LOCAL_NETWORK_PING_TOOL } from './tools.ts';

async function main() {
  console.log('🚀 Launching WebMCP Agentic App Example (Bun + TypeScript)\n');

  // Load AI Model Auth & Config from .env or environment
  const modelConfig = loadAIModelConfig();

  // Set up in-memory MessageChannel transport bridge
  const channel = new MessageChannel();
  const frontendTransport = new MessageChannelTransport(channel.port1);
  const backendTransport = new MessageChannelTransport(channel.port2);

  // 1. Initialize Frontend SDK Bridge (with Starter Kit pre-registered)
  const frontendBridge = createFrontendBridge({
    transport: frontendTransport,
    autoRegisterStarterKit: true,
  });

  // Register custom application tool on Frontend Bridge
  frontendBridge.registerTool(LOCAL_NETWORK_PING_TOOL, async (args) => {
    return { service: args.service || 'gateway', latencyMs: 2, status: 'online' };
  });

  await frontendBridge.start();

  // 2. Initialize Backend Agent Client
  const agentClient = createBackendAgentClient({ transport: backendTransport });
  await agentClient.connect();

  // Instantiate & run Pi Agent loop with AI Model Auth config
  const agent = new PiAgentRunner(agentClient.getRawClient(), modelConfig);
  await agent.runGoal('Inspect active web page and check local network health');

  await agentClient.disconnect();
  await frontendBridge.stop();

  console.log('\n🎉 WebMCP Agentic App finished execution.');
}

main().catch((err) => {
  console.error('Fatal error in agentic app:', err);
  process.exit(1);
});

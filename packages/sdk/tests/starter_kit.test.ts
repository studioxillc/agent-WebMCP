import { describe, expect, it } from 'bun:test';
import { createBackendAgentClient, createFrontendBridge, MessageChannelTransport } from '../src/index.ts';

describe('WebMCP Dual SDK Architecture & Starter Kit Tools', () => {
  it('should auto-register starter kit tools on frontend bridge and execute via backend agent client', async () => {
    const channel = new MessageChannel();

    const frontendTransport = new MessageChannelTransport(channel.port1);
    const backendTransport = new MessageChannelTransport(channel.port2);

    // 1. Initialize Frontend SDK Bridge with auto-registered Starter Kit
    const frontendBridge = createFrontendBridge({
      transport: frontendTransport,
      autoRegisterStarterKit: true,
    });

    // 2. Initialize Backend AI Agent Client
    const agentClient = createBackendAgentClient({
      transport: backendTransport,
    });

    await frontendBridge.start();
    await agentClient.connect();

    // 3. Agent discovers starter kit tools
    const tools = await agentClient.getAvailableTools();
    const toolNames = tools.map((t) => t.name);

    expect(toolNames).toContain('dom_get_text');
    expect(toolNames).toContain('dom_click_element');
    expect(toolNames).toContain('browser_get_url');
    expect(toolNames).toContain('browser_navigate');
    expect(toolNames).toContain('storage_get_item');
    expect(toolNames).toContain('storage_set_item');

    // 4. Agent executes starter kit tool 'browser_get_url'
    const urlResult = await agentClient.executeTool('browser_get_url');
    expect(urlResult.title).toBeDefined();

    // 5. Agent executes starter kit tool 'storage_set_item'
    const storageResult = await agentClient.executeTool('storage_set_item', {
      key: 'user_session',
      value: 'active_123',
    });
    expect(storageResult.status).toBe('saved');
    expect(storageResult.key).toBe('user_session');

    await agentClient.disconnect();
    await frontendBridge.stop();
  });
});

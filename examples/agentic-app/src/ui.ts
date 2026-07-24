import { createBackendAgentClient, createFrontendBridge, MessageChannelTransport } from '@webmcp/sdk';
import { PiAgentRunner } from './agent.ts';
import type { AIModelConfig } from './config.ts';
import { LOCAL_NETWORK_PING_TOOL } from './tools.ts';

// Dynamic Browser State for Sandbox Simulation
const sandboxState = {
  url: 'https://app.webmcp.local/dashboard',
  title: 'WebMCP Dashboard & Diagnostics',
  domText: 'Welcome to WebMCP active page context. Click the primary button to submit local diagnostic logs to local network service gateway.',
  clickCount: 0,
  storage: new Map<string, string>([
    ['user_theme', 'dark'],
    ['session_id', 'wmcp_881a792']
  ]),
  gatewayLatency: 2,
};

let frontendBridge: ReturnType<typeof createFrontendBridge> | null = null;
let agentClient: ReturnType<typeof createBackendAgentClient> | null = null;
let isRunning = false;

function appendLog(message: string, type: 'info' | 'success' | 'warn' | 'error' = 'info') {
  const stream = document.getElementById('logStream');
  if (!stream) return;
  const entry = document.createElement('div');
  entry.className = `log-entry ${type}`;
  entry.textContent = message;
  stream.appendChild(entry);
  stream.scrollTop = stream.scrollHeight;
}

function updateSandboxUI() {
  const urlBar = document.getElementById('browserUrlBar');
  const domTitle = document.getElementById('domPageTitle');
  const domText = document.getElementById('domPageText');
  const clickCount = document.getElementById('clickCountLabel');
  const storageList = document.getElementById('storageList');
  const netGateway = document.getElementById('netGatewayVal');

  if (urlBar) urlBar.textContent = sandboxState.url;
  if (domTitle) domTitle.textContent = sandboxState.title;
  if (domText) domText.textContent = sandboxState.domText;
  if (clickCount) clickCount.textContent = `Clicked ${sandboxState.clickCount} times`;
  
  if (netGateway) {
    netGateway.textContent = `Online (${sandboxState.gatewayLatency}ms)`;
  }

  if (storageList) {
    storageList.innerHTML = '';
    sandboxState.storage.forEach((val, key) => {
      const row = document.createElement('div');
      row.className = 'storage-row';
      row.innerHTML = `<span class="key">${key}</span><span class="val">${val}</span>`;
      storageList.appendChild(row);
    });
  }
}

async function initWebMCP() {
  appendLog('[WebMCP Setup] Initializing MessageChannel transport bridge...');
  
  const channel = new MessageChannel();
  const frontendTransport = new MessageChannelTransport(channel.port1);
  const backendTransport = new MessageChannelTransport(channel.port2);

  // 1. Initialize Frontend SDK Bridge
  frontendBridge = createFrontendBridge({
    transport: frontendTransport,
    autoRegisterStarterKit: true,
  });

  // Register network tool & override browser/dom tool handlers to update sandbox UI live
  frontendBridge.registerTool(LOCAL_NETWORK_PING_TOOL, async (args) => {
    sandboxState.gatewayLatency = Math.floor(Math.random() * 5) + 1;
    updateSandboxUI();
    appendLog(`[Tool Call] local_network_status: pinging service '${args.service || 'gateway'}'`);
    return { service: args.service || 'gateway', latencyMs: sandboxState.gatewayLatency, status: 'online' };
  });

  // Handle browser_navigate to update simulated sandbox tab URL without triggering host page refresh
  (window as any).__WEBMCP_NAVIGATE__ = (url: string) => {
    sandboxState.url = url;
    sandboxState.title = `Dashboard (${url})`;
    updateSandboxUI();
    appendLog(`[Sandbox Simulated Navigation] Navigated sandbox to '${url}'`, 'info');
  };

  await frontendBridge.start();
  appendLog('[WebMCPServer] ℹ️ WebMCP Server started & starter kit tools registered', 'success');

  // 2. Initialize Backend Agent Client
  agentClient = createBackendAgentClient({ transport: backendTransport });
  await agentClient.connect();
  appendLog('[WebMCPClient] ℹ️ WebMCP Client connected to WebMCP Server', 'success');

  updateSandboxUI();
}

function addStepToTimeline(stepNum: number, action: string, toolUsed: string | undefined, output: any) {
  const container = document.getElementById('timelineContainer');
  const emptyState = document.getElementById('emptyTimelineState');
  if (emptyState) emptyState.style.display = 'none';

  if (!container) return;

  const card = document.createElement('div');
  card.className = 'step-card';

  const formattedOutput = typeof output === 'object' ? JSON.stringify(output, null, 2) : String(output);

  card.innerHTML = `
    <div class="step-meta">
      <span class="step-number">STEP ${stepNum}</span>
      ${toolUsed ? `<span class="tool-badge">🔧 ${toolUsed}</span>` : ''}
    </div>
    <div class="step-action"></div>
    <pre class="json-output"><code></code></pre>
  `;

  const actionElem = card.querySelector('.step-action');
  if (actionElem) actionElem.textContent = action;

  const codeElem = card.querySelector('code');
  if (codeElem) codeElem.textContent = formattedOutput;

  container.appendChild(card);
  container.scrollTop = container.scrollHeight;
}

async function handleRunAgent() {
  if (isRunning) return;

  const objectiveInput = document.getElementById('objectiveInput') as HTMLInputElement;
  const providerSelect = document.getElementById('providerSelect') as HTMLSelectElement;
  const apiKeyInput = document.getElementById('apiKeyInput') as HTMLInputElement;
  const runBtn = document.getElementById('runBtn') as HTMLButtonElement;
  const agentStatePill = document.getElementById('agentStatePill');
  const stepCountBadge = document.getElementById('stepCountBadge');
  const timelineContainer = document.getElementById('timelineContainer');

  const objective = objectiveInput.value.trim();
  if (!objective) {
    alert('Please enter a goal or objective for the agent.');
    return;
  }

  if (!agentClient) {
    alert('WebMCP Client is not connected.');
    return;
  }

  isRunning = true;
  runBtn.disabled = true;
  runBtn.innerHTML = '<span class="btn-icon">⏳</span> Running...';
  if (agentStatePill) {
    agentStatePill.className = 'status-pill running';
    agentStatePill.textContent = 'Running Step Loop...';
  }

  if (timelineContainer) {
    timelineContainer.innerHTML = '';
  }

  const modelConfig: AIModelConfig = {
    provider: providerSelect.value as any,
    apiKey: apiKeyInput.value.trim() || undefined,
    model: providerSelect.value === 'gemini' ? 'gemini-2.5-flash' : 
           providerSelect.value === 'openai' ? 'gpt-4o' : 
           providerSelect.value === 'anthropic' ? 'claude-3-5-sonnet' : 'mock-model',
  };

  appendLog(`[PiAgent] Starting execution loop: "${objective}" using ${modelConfig.provider.toUpperCase()}`);

  try {
    const rawClient = agentClient.getRawClient();
    const runner = new PiAgentRunner(rawClient, modelConfig);

    // Override tool invocation interceptor for live UI updates
    const origCallTool = rawClient.callTool.bind(rawClient);
    rawClient.callTool = async (name: string, args?: any) => {
      appendLog(`[IPC] Invoking tool '${name}' via WebMCP Client...`, 'info');
      const res = await origCallTool(name, args);

      // Reactively update Sandbox UI state based on tool actions
      if (name === 'browser_navigate' && args?.url) {
        sandboxState.url = args.url;
        sandboxState.title = `Navigated Page (${new URL(args.url).hostname})`;
        updateSandboxUI();
      } else if (name === 'dom_click_element') {
        sandboxState.clickCount++;
        updateSandboxUI();
      } else if (name === 'storage_set_item' && args?.key && args?.value) {
        sandboxState.storage.set(args.key, args.value);
        updateSandboxUI();
      }

      return res;
    };

    const results = await runner.runGoal(objective);

    results.forEach((res) => {
      addStepToTimeline(res.step, res.action, res.toolUsed, res.output);
    });

    if (stepCountBadge) {
      stepCountBadge.textContent = `${results.length} Steps Completed`;
    }

    if (agentStatePill) {
      agentStatePill.className = 'status-pill success';
      agentStatePill.textContent = 'Completed Successfully';
    }
    appendLog(`[PiAgent] Objective finished in ${results.length} steps.`, 'success');

  } catch (err: any) {
    console.error('Agent execution error:', err);
    appendLog(`[PiAgent Error] ${err.message || err}`, 'error');
    if (agentStatePill) {
      agentStatePill.className = 'status-pill';
      agentStatePill.textContent = 'Execution Failed';
    }
  } finally {
    isRunning = false;
    runBtn.disabled = false;
    runBtn.innerHTML = '<span class="btn-icon">▶</span> Run Agent';
  }
}

function setupEventListeners() {
  const runBtn = document.getElementById('runBtn');
  const clearBtn = document.getElementById('clearBtn');
  const btnClearLogs = document.getElementById('btnClearLogs');
  const btnRefreshDOM = document.getElementById('btnRefreshDOM');
  const btnMockCta = document.getElementById('btnMockCta');

  runBtn?.addEventListener('click', (e) => {
    e.preventDefault();
    handleRunAgent();
  });

  clearBtn?.addEventListener('click', (e) => {
    e.preventDefault();
    const timeline = document.getElementById('timelineContainer');
    const stepBadge = document.getElementById('stepCountBadge');
    if (timeline) {
      timeline.innerHTML = `
        <div class="empty-state" id="emptyTimelineState">
          <div class="empty-icon">🚀</div>
          <p>Click <strong>Run Agent</strong> to watch the PiAgent runner evaluate objectives, choose WebMCP tools, and execute actions live.</p>
        </div>`;
    }
    if (stepBadge) stepBadge.textContent = '0 Steps';
  });

  btnClearLogs?.addEventListener('click', (e) => {
    e.preventDefault();
    const logStream = document.getElementById('logStream');
    if (logStream) logStream.innerHTML = '';
  });

  btnRefreshDOM?.addEventListener('click', (e) => {
    e.preventDefault();
    updateSandboxUI();
    appendLog('[Sandbox] Refreshed DOM view state', 'info');
  });

  btnMockCta?.addEventListener('click', (e) => {
    e.preventDefault();
    sandboxState.clickCount++;
    updateSandboxUI();
    appendLog('[Sandbox User Action] User manually clicked CTA button', 'info');
  });

  document.querySelectorAll('.preset-chip').forEach((chip) => {
    chip.addEventListener('click', (e) => {
      e.preventDefault();
      const preset = (e.target as HTMLElement).getAttribute('data-preset');
      const input = document.getElementById('objectiveInput') as HTMLInputElement;
      if (preset && input) {
        input.value = preset;
      }
    });
  });
}

document.addEventListener('DOMContentLoaded', async () => {
  setupEventListeners();
  await initWebMCP();
});

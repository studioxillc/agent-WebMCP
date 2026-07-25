<script setup>
import { ref, reactive, onMounted, nextTick } from 'vue'

// State
const mode = ref('protocol') // 'protocol' | 'agent'
const apiKey = ref('')
const provider = ref('openai')
const isConnected = ref(false)
const tools = ref([])
const messages = reactive([])
const chatMessages = reactive([])
const chatInput = ref('')
const selectedTool = ref('')
const toolArgs = ref('{}')
const toolResult = ref(null)
const isLoading = ref(false)
const logRef = ref(null)
const chatRef = ref(null)

// Simulated WebMCP server & client over MessageChannel
let serverPort = null
let clientPort = null
let requestIdCounter = 1
const registeredTools = new Map()

function addLog(direction, type, data) {
  messages.push({
    id: Date.now() + Math.random(),
    direction,
    type,
    data: JSON.parse(JSON.stringify(data)),
    timestamp: new Date().toLocaleTimeString(),
  })
  nextTick(() => {
    if (logRef.value) logRef.value.scrollTop = logRef.value.scrollHeight
  })
}

function registerDemoTools() {
  registeredTools.set('get_page_title', {
    definition: {
      name: 'get_page_title',
      description: 'Get the title of the current page',
      inputSchema: { type: 'object', properties: {} },
    },
    handler: () => ({ title: document.title, url: window.location.href }),
  })

  registeredTools.set('calculate', {
    definition: {
      name: 'calculate',
      description: 'Perform a mathematical calculation',
      inputSchema: {
        type: 'object',
        properties: {
          expression: { type: 'string', description: 'Math expression to evaluate (e.g. "2 + 3 * 4")' },
        },
        required: ['expression'],
      },
    },
    handler: (args) => {
      try {
        const allowed = /^[0-9+\-*/().%\s]+$/
        if (!allowed.test(args.expression)) throw new Error('Invalid characters')
        const result = Function('"use strict"; return (' + args.expression + ')')()
        return { expression: args.expression, result }
      } catch {
        return { error: 'Invalid expression' }
      }
    },
  })

  registeredTools.set('get_timestamp', {
    definition: {
      name: 'get_timestamp',
      description: 'Get the current timestamp and timezone info',
      inputSchema: { type: 'object', properties: {} },
    },
    handler: () => ({
      iso: new Date().toISOString(),
      unix: Date.now(),
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    }),
  })

  registeredTools.set('generate_uuid', {
    definition: {
      name: 'generate_uuid',
      description: 'Generate a random UUID v4',
      inputSchema: { type: 'object', properties: {} },
    },
    handler: () => ({ uuid: crypto.randomUUID() }),
  })

  registeredTools.set('browser_info', {
    definition: {
      name: 'browser_info',
      description: 'Get information about the current browser and viewport',
      inputSchema: { type: 'object', properties: {} },
    },
    handler: () => ({
      userAgent: navigator.userAgent,
      language: navigator.language,
      viewport: { width: window.innerWidth, height: window.innerHeight },
      colorScheme: window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light',
    }),
  })
}

function handleServerMessage(event) {
  const request = event.data
  if (!request || request.jsonrpc !== '2.0' || !request.method) return

  addLog('incoming', 'request', request)

  const response = { jsonrpc: '2.0', id: request.id }

  if (request.method === 'tools/list') {
    response.result = {
      tools: Array.from(registeredTools.values()).map(t => t.definition),
    }
  } else if (request.method === 'tools/call') {
    const tool = registeredTools.get(request.params?.name)
    if (tool) {
      try {
        response.result = tool.handler(request.params?.arguments || {})
      } catch (err) {
        response.error = { code: -32603, message: err.message }
      }
    } else {
      response.error = { code: -32601, message: `Tool not found: ${request.params?.name}` }
    }
  } else {
    response.error = { code: -32601, message: `Unknown method: ${request.method}` }
  }

  addLog('outgoing', 'response', response)
  serverPort.postMessage(response)
}

function sendClientRequest(method, params = {}) {
  return new Promise((resolve, reject) => {
    const id = requestIdCounter++
    const request = { jsonrpc: '2.0', id, method, params }

    addLog('outgoing', 'request', request)

    const handler = (event) => {
      const response = event.data
      if (response && response.id === id) {
        clientPort.removeEventListener('message', handler)
        addLog('incoming', 'response', response)
        if (response.error) {
          reject(new Error(response.error.message))
        } else {
          resolve(response.result)
        }
      }
    }

    clientPort.addEventListener('message', handler)
    clientPort.postMessage(request)
  })
}

async function connect() {
  const channel = new MessageChannel()
  serverPort = channel.port1
  clientPort = channel.port2

  registerDemoTools()

  serverPort.onmessage = handleServerMessage
  serverPort.start()
  clientPort.start()

  isConnected.value = true
  addLog('system', 'info', { message: '✅ WebMCP connection established via MessageChannel' })

  // Auto-list tools
  await listTools()
}

async function disconnect() {
  serverPort?.close()
  clientPort?.close()
  serverPort = null
  clientPort = null
  isConnected.value = false
  tools.value = []
  selectedTool.value = ''
  toolResult.value = null
  addLog('system', 'info', { message: '🔌 WebMCP connection closed' })
}

async function listTools() {
  try {
    const result = await sendClientRequest('tools/list')
    tools.value = result.tools || []
    if (tools.value.length > 0) {
      selectedTool.value = tools.value[0].name
    }
  } catch (err) {
    addLog('system', 'error', { message: err.message })
  }
}

async function callSelectedTool() {
  if (!selectedTool.value) return
  isLoading.value = true
  toolResult.value = null

  try {
    let parsedArgs = {}
    try {
      parsedArgs = JSON.parse(toolArgs.value)
    } catch {
      parsedArgs = {}
    }

    const result = await sendClientRequest('tools/call', {
      name: selectedTool.value,
      arguments: parsedArgs,
    })
    toolResult.value = result
  } catch (err) {
    toolResult.value = { error: err.message }
  } finally {
    isLoading.value = false
  }
}

// AI Agent Chat
async function sendChatMessage() {
  if (!chatInput.value.trim() || !apiKey.value.trim()) return

  const userMessage = chatInput.value.trim()
  chatMessages.push({ role: 'user', content: userMessage })
  chatInput.value = ''
  isLoading.value = true

  try {
    const toolDefs = Array.from(registeredTools.values()).map(t => ({
      type: 'function',
      function: {
        name: t.definition.name,
        description: t.definition.description,
        parameters: t.definition.inputSchema,
      },
    }))

    let apiUrl, headers, body

    if (provider.value === 'openai') {
      apiUrl = 'https://api.openai.com/v1/chat/completions'
      headers = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey.value}`,
      }
      body = {
        model: 'gpt-4o-mini',
        messages: chatMessages.map(m => ({ role: m.role, content: m.content, ...(m.tool_call_id ? { tool_call_id: m.tool_call_id } : {}), ...(m.tool_calls ? { tool_calls: m.tool_calls } : {}) })),
        tools: toolDefs,
        tool_choice: 'auto',
      }
    } else {
      apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey.value}`
      headers = { 'Content-Type': 'application/json' }

      const googleTools = [{
        function_declarations: Array.from(registeredTools.values()).map(t => ({
          name: t.definition.name,
          description: t.definition.description,
          parameters: t.definition.inputSchema,
        })),
      }]

      const contents = chatMessages
        .filter(m => m.role === 'user' || m.role === 'assistant' || m.role === 'model')
        .map(m => ({
          role: m.role === 'assistant' ? 'model' : m.role,
          parts: [{ text: m.content }],
        }))

      body = { contents, tools: googleTools }
    }

    const response = await fetch(apiUrl, {
      method: 'POST',
      headers,
      body: JSON.stringify(body),
    })

    if (!response.ok) {
      const errText = await response.text()
      throw new Error(`API Error ${response.status}: ${errText.slice(0, 200)}`)
    }

    const data = await response.json()

    if (provider.value === 'openai') {
      const choice = data.choices?.[0]
      const assistantMsg = choice?.message

      if (assistantMsg?.tool_calls) {
        chatMessages.push({
          role: 'assistant',
          content: assistantMsg.content || '',
          tool_calls: assistantMsg.tool_calls,
        })

        for (const tc of assistantMsg.tool_calls) {
          const toolName = tc.function.name
          const toolArgsParsed = JSON.parse(tc.function.arguments || '{}')

          addLog('outgoing', 'request', { jsonrpc: '2.0', id: 'ai-' + tc.id, method: 'tools/call', params: { name: toolName, arguments: toolArgsParsed } })

          const tool = registeredTools.get(toolName)
          let result = { error: 'Tool not found' }
          if (tool) {
            try { result = tool.handler(toolArgsParsed) } catch (e) { result = { error: e.message } }
          }

          addLog('incoming', 'response', { jsonrpc: '2.0', id: 'ai-' + tc.id, result })

          chatMessages.push({
            role: 'tool',
            content: JSON.stringify(result),
            tool_call_id: tc.id,
          })
        }

        // Follow-up call
        await sendFollowUp()
      } else {
        chatMessages.push({ role: 'assistant', content: assistantMsg?.content || '(empty response)' })
      }
    } else {
      // Google AI
      const candidate = data.candidates?.[0]
      const parts = candidate?.content?.parts || []

      const functionCalls = parts.filter(p => p.functionCall)
      const textParts = parts.filter(p => p.text)

      if (functionCalls.length > 0) {
        for (const fc of functionCalls) {
          const toolName = fc.functionCall.name
          const toolArgsParsed = fc.functionCall.args || {}

          addLog('outgoing', 'request', { jsonrpc: '2.0', id: 'ai-google', method: 'tools/call', params: { name: toolName, arguments: toolArgsParsed } })

          const tool = registeredTools.get(toolName)
          let result = { error: 'Tool not found' }
          if (tool) {
            try { result = tool.handler(toolArgsParsed) } catch (e) { result = { error: e.message } }
          }

          addLog('incoming', 'response', { jsonrpc: '2.0', id: 'ai-google', result })

          chatMessages.push({ role: 'assistant', content: `🔧 Called \`${toolName}\` → ${JSON.stringify(result)}` })
        }
      }

      if (textParts.length > 0) {
        chatMessages.push({ role: 'assistant', content: textParts.map(p => p.text).join('\n') })
      }

      if (!functionCalls.length && !textParts.length) {
        chatMessages.push({ role: 'assistant', content: '(empty response)' })
      }
    }
  } catch (err) {
    chatMessages.push({ role: 'assistant', content: `❌ Error: ${err.message}` })
  } finally {
    isLoading.value = false
    nextTick(() => {
      if (chatRef.value) chatRef.value.scrollTop = chatRef.value.scrollHeight
    })
  }
}

async function sendFollowUp() {
  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey.value}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: chatMessages.map(m => ({ role: m.role, content: m.content, ...(m.tool_call_id ? { tool_call_id: m.tool_call_id } : {}), ...(m.tool_calls ? { tool_calls: m.tool_calls } : {}) })),
      }),
    })

    const data = await response.json()
    const content = data.choices?.[0]?.message?.content || '(empty response)'
    chatMessages.push({ role: 'assistant', content })
  } catch (err) {
    chatMessages.push({ role: 'assistant', content: `❌ Follow-up error: ${err.message}` })
  }
}

function getToolSchema() {
  const tool = tools.value.find(t => t.name === selectedTool.value)
  if (!tool) return '{}'
  const props = tool.inputSchema?.properties || {}
  const result = {}
  for (const [key, schema] of Object.entries(props)) {
    if (schema.type === 'string') result[key] = ''
    else if (schema.type === 'number') result[key] = 0
    else if (schema.type === 'boolean') result[key] = false
    else result[key] = null
  }
  return JSON.stringify(result, null, 2)
}

function onToolChange() {
  toolArgs.value = getToolSchema()
  toolResult.value = null
}

function clearLog() {
  messages.splice(0, messages.length)
}

onMounted(() => {
  connect()
})
</script>

<template>
  <div class="playground">
    <!-- Mode Tabs -->
    <div class="mode-tabs">
      <button
        :class="['mode-tab', { active: mode === 'protocol' }]"
        @click="mode = 'protocol'"
      >
        🔬 Protocol Explorer
      </button>
      <button
        :class="['mode-tab', { active: mode === 'agent' }]"
        @click="mode = 'agent'"
      >
        🤖 AI Agent Chat
      </button>
    </div>

    <!-- Connection Status -->
    <div class="status-bar">
      <span :class="['status-dot', { connected: isConnected }]"></span>
      <span>{{ isConnected ? 'Connected' : 'Disconnected' }} via MessageChannel</span>
      <span class="tool-count" v-if="isConnected">{{ tools.length }} tools registered</span>
      <div class="status-actions">
        <button v-if="!isConnected" @click="connect" class="btn btn-sm btn-primary">Connect</button>
        <button v-else @click="disconnect" class="btn btn-sm btn-secondary">Disconnect</button>
      </div>
    </div>

    <!-- Protocol Explorer Mode -->
    <div v-if="mode === 'protocol'" class="protocol-mode">
      <div class="panel-grid">
        <!-- Tools Panel -->
        <div class="panel">
          <div class="panel-header">
            <h3>📋 Tools</h3>
            <button @click="listTools" class="btn btn-sm btn-secondary" :disabled="!isConnected">
              Refresh
            </button>
          </div>
          <div class="tool-list">
            <div
              v-for="tool in tools"
              :key="tool.name"
              :class="['tool-item', { selected: selectedTool === tool.name }]"
              @click="selectedTool = tool.name; onToolChange()"
            >
              <div class="tool-name">{{ tool.name }}</div>
              <div class="tool-desc">{{ tool.description }}</div>
            </div>
          </div>
        </div>

        <!-- Execute Panel -->
        <div class="panel">
          <div class="panel-header">
            <h3>⚡ Execute</h3>
          </div>
          <div class="execute-form" v-if="selectedTool">
            <label>Tool: <code>{{ selectedTool }}</code></label>
            <label>Arguments (JSON):</label>
            <textarea v-model="toolArgs" class="args-input" rows="4" spellcheck="false"></textarea>
            <button
              @click="callSelectedTool"
              class="btn btn-primary"
              :disabled="!isConnected || isLoading"
            >
              {{ isLoading ? 'Calling...' : 'Call Tool' }}
            </button>
            <div v-if="toolResult !== null" class="result-box">
              <label>Result:</label>
              <pre>{{ JSON.stringify(toolResult, null, 2) }}</pre>
            </div>
          </div>
          <div v-else class="empty-state">Select a tool from the list</div>
        </div>
      </div>
    </div>

    <!-- AI Agent Chat Mode -->
    <div v-if="mode === 'agent'" class="agent-mode">
      <div class="agent-config">
        <div class="config-row">
          <select v-model="provider" class="provider-select">
            <option value="openai">OpenAI</option>
            <option value="google">Google AI</option>
          </select>
          <input
            v-model="apiKey"
            :type="'password'"
            :placeholder="provider === 'openai' ? 'sk-...' : 'AI...'  "
            class="api-key-input"
          />
        </div>
        <p class="key-notice">
          🔒 Your API key stays in the browser. It is never sent to any server except {{ provider === 'openai' ? 'api.openai.com' : 'generativelanguage.googleapis.com' }}.
        </p>
      </div>

      <div class="chat-container" ref="chatRef">
        <div v-if="chatMessages.length === 0" class="chat-empty">
          <p>💬 Ask the AI agent anything — it has access to <strong>{{ tools.length }} WebMCP tools</strong>.</p>
          <p class="chat-suggestions">Try: "What page am I on?" · "Calculate 42 * 17" · "Generate a UUID" · "What browser am I using?"</p>
        </div>
        <div
          v-for="(msg, i) in chatMessages.filter(m => m.role !== 'tool')"
          :key="i"
          :class="['chat-message', msg.role]"
        >
          <div class="msg-role">{{ msg.role === 'user' ? '👤 You' : '🤖 Agent' }}</div>
          <div class="msg-content" v-html="formatMessage(msg.content)"></div>
        </div>
        <div v-if="isLoading" class="chat-message assistant">
          <div class="msg-role">🤖 Agent</div>
          <div class="msg-content typing">Thinking...</div>
        </div>
      </div>

      <div class="chat-input-row">
        <input
          v-model="chatInput"
          @keyup.enter="sendChatMessage"
          placeholder="Ask the AI agent..."
          class="chat-input"
          :disabled="!isConnected || !apiKey || isLoading"
        />
        <button
          @click="sendChatMessage"
          class="btn btn-primary"
          :disabled="!isConnected || !apiKey || !chatInput.trim() || isLoading"
        >
          Send
        </button>
      </div>
    </div>

    <!-- JSON-RPC Log -->
    <div class="log-panel">
      <div class="panel-header">
        <h3>📡 JSON-RPC Message Log</h3>
        <button @click="clearLog" class="btn btn-sm btn-secondary">Clear</button>
      </div>
      <div class="log-container" ref="logRef">
        <div v-if="messages.length === 0" class="empty-state">
          Messages will appear here as tools are called...
        </div>
        <div
          v-for="msg in messages"
          :key="msg.id"
          :class="['log-entry', msg.direction, msg.type]"
        >
          <span class="log-time">{{ msg.timestamp }}</span>
          <span class="log-direction">
            {{ msg.direction === 'outgoing' ? '→' : msg.direction === 'incoming' ? '←' : '●' }}
          </span>
          <span class="log-type">{{ msg.type }}</span>
          <pre class="log-data">{{ JSON.stringify(msg.data, null, 2) }}</pre>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  methods: {
    formatMessage(content) {
      if (!content) return ''
      return content
        .replace(/`([^`]+)`/g, '<code>$1</code>')
        .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
        .replace(/\n/g, '<br>')
    },
  },
}
</script>

<style scoped>
.playground {
  max-width: 960px;
  margin: 0 auto;
}

.mode-tabs {
  display: flex;
  gap: 0;
  margin-bottom: 16px;
  border-radius: 10px;
  overflow: hidden;
  border: 1px solid var(--vp-c-divider);
}

.mode-tab {
  flex: 1;
  padding: 12px 20px;
  border: none;
  background: var(--vp-c-bg-soft);
  color: var(--vp-c-text-2);
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.mode-tab.active {
  background: var(--vp-c-brand-1);
  color: white;
}

.mode-tab:hover:not(.active) {
  background: var(--vp-c-bg-mute);
}

.status-bar {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 16px;
  background: var(--vp-c-bg-soft);
  border-radius: 8px;
  margin-bottom: 16px;
  font-size: 13px;
  color: var(--vp-c-text-2);
}

.status-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #e74c3c;
  flex-shrink: 0;
}

.status-dot.connected {
  background: #2ecc71;
  box-shadow: 0 0 6px rgba(46, 204, 113, 0.5);
}

.tool-count {
  margin-left: auto;
  margin-right: 8px;
  color: var(--vp-c-text-3);
}

.status-actions {
  flex-shrink: 0;
}

.panel-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
  margin-bottom: 16px;
}

@media (max-width: 640px) {
  .panel-grid {
    grid-template-columns: 1fr;
  }
}

.panel {
  border: 1px solid var(--vp-c-divider);
  border-radius: 10px;
  overflow: hidden;
}

.panel-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  background: var(--vp-c-bg-soft);
  border-bottom: 1px solid var(--vp-c-divider);
}

.panel-header h3 {
  margin: 0;
  font-size: 14px;
  font-weight: 600;
}

.tool-list {
  max-height: 300px;
  overflow-y: auto;
}

.tool-item {
  padding: 10px 16px;
  cursor: pointer;
  border-bottom: 1px solid var(--vp-c-divider);
  transition: background 0.15s;
}

.tool-item:last-child {
  border-bottom: none;
}

.tool-item:hover {
  background: var(--vp-c-bg-soft);
}

.tool-item.selected {
  background: var(--vp-c-brand-soft);
  border-left: 3px solid var(--vp-c-brand-1);
}

.tool-name {
  font-family: var(--vp-font-family-mono);
  font-size: 13px;
  font-weight: 600;
  color: var(--vp-c-brand-1);
}

.tool-desc {
  font-size: 12px;
  color: var(--vp-c-text-3);
  margin-top: 2px;
}

.execute-form {
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.execute-form label {
  font-size: 13px;
  font-weight: 500;
  color: var(--vp-c-text-2);
}

.execute-form code {
  font-size: 13px;
  background: var(--vp-c-bg-soft);
  padding: 2px 6px;
  border-radius: 4px;
}

.args-input {
  font-family: var(--vp-font-family-mono);
  font-size: 13px;
  padding: 10px;
  border: 1px solid var(--vp-c-divider);
  border-radius: 6px;
  background: var(--vp-c-bg);
  color: var(--vp-c-text-1);
  resize: vertical;
}

.result-box {
  margin-top: 4px;
}

.result-box pre {
  font-size: 12px;
  padding: 10px;
  background: var(--vp-c-bg-soft);
  border-radius: 6px;
  overflow-x: auto;
  margin: 4px 0 0 0;
  white-space: pre-wrap;
  word-break: break-all;
}

.empty-state {
  padding: 40px 16px;
  text-align: center;
  color: var(--vp-c-text-3);
  font-size: 14px;
}

/* Buttons */
.btn {
  padding: 8px 16px;
  border: none;
  border-radius: 6px;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.15s;
}

.btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.btn-primary {
  background: var(--vp-c-brand-1);
  color: white;
}

.btn-primary:hover:not(:disabled) {
  background: var(--vp-c-brand-2);
}

.btn-secondary {
  background: var(--vp-c-bg-mute);
  color: var(--vp-c-text-2);
}

.btn-secondary:hover:not(:disabled) {
  background: var(--vp-c-divider);
}

.btn-sm {
  padding: 4px 10px;
  font-size: 12px;
}

/* Agent Mode */
.agent-config {
  padding: 16px;
  background: var(--vp-c-bg-soft);
  border-radius: 10px;
  margin-bottom: 16px;
}

.config-row {
  display: flex;
  gap: 8px;
}

.provider-select {
  padding: 8px 12px;
  border: 1px solid var(--vp-c-divider);
  border-radius: 6px;
  background: var(--vp-c-bg);
  color: var(--vp-c-text-1);
  font-size: 13px;
  flex-shrink: 0;
}

.api-key-input {
  flex: 1;
  padding: 8px 12px;
  border: 1px solid var(--vp-c-divider);
  border-radius: 6px;
  background: var(--vp-c-bg);
  color: var(--vp-c-text-1);
  font-family: var(--vp-font-family-mono);
  font-size: 13px;
}

.key-notice {
  font-size: 11px;
  color: var(--vp-c-text-3);
  margin-top: 8px;
  margin-bottom: 0;
}

.chat-container {
  border: 1px solid var(--vp-c-divider);
  border-radius: 10px;
  max-height: 400px;
  overflow-y: auto;
  margin-bottom: 12px;
  padding: 16px;
}

.chat-empty {
  text-align: center;
  padding: 40px 16px;
  color: var(--vp-c-text-3);
}

.chat-empty p {
  margin: 8px 0;
}

.chat-suggestions {
  font-size: 13px;
  font-style: italic;
}

.chat-message {
  margin-bottom: 16px;
}

.chat-message:last-child {
  margin-bottom: 0;
}

.msg-role {
  font-size: 12px;
  font-weight: 600;
  color: var(--vp-c-text-3);
  margin-bottom: 4px;
}

.msg-content {
  font-size: 14px;
  line-height: 1.6;
  color: var(--vp-c-text-1);
}

.msg-content.typing {
  color: var(--vp-c-text-3);
  font-style: italic;
}

.chat-message.user .msg-content {
  background: var(--vp-c-brand-soft);
  padding: 8px 12px;
  border-radius: 8px;
  display: inline-block;
}

.chat-input-row {
  display: flex;
  gap: 8px;
}

.chat-input {
  flex: 1;
  padding: 10px 14px;
  border: 1px solid var(--vp-c-divider);
  border-radius: 8px;
  background: var(--vp-c-bg);
  color: var(--vp-c-text-1);
  font-size: 14px;
}

.chat-input:disabled {
  opacity: 0.5;
}

/* Log Panel */
.log-panel {
  border: 1px solid var(--vp-c-divider);
  border-radius: 10px;
  overflow: hidden;
  margin-top: 16px;
}

.log-container {
  max-height: 300px;
  overflow-y: auto;
  padding: 8px;
}

.log-entry {
  padding: 6px 10px;
  margin-bottom: 4px;
  border-radius: 6px;
  font-size: 12px;
  font-family: var(--vp-font-family-mono);
  background: var(--vp-c-bg-soft);
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  align-items: flex-start;
}

.log-entry.outgoing { border-left: 3px solid var(--vp-c-brand-1); }
.log-entry.incoming { border-left: 3px solid #2ecc71; }
.log-entry.system { border-left: 3px solid var(--vp-c-text-3); }

.log-time {
  color: var(--vp-c-text-3);
  flex-shrink: 0;
}

.log-direction {
  font-weight: bold;
  flex-shrink: 0;
}

.log-entry.outgoing .log-direction { color: var(--vp-c-brand-1); }
.log-entry.incoming .log-direction { color: #2ecc71; }
.log-entry.system .log-direction { color: var(--vp-c-text-3); }

.log-type {
  font-weight: 600;
  text-transform: uppercase;
  font-size: 10px;
  padding: 1px 6px;
  border-radius: 3px;
  background: var(--vp-c-bg-mute);
  color: var(--vp-c-text-2);
  flex-shrink: 0;
}

.log-data {
  width: 100%;
  margin: 4px 0 0 0;
  font-size: 11px;
  white-space: pre-wrap;
  word-break: break-all;
  color: var(--vp-c-text-2);
  max-height: 120px;
  overflow-y: auto;
}
</style>

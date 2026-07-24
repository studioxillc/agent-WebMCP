'use client';

import { useChat } from 'ai/react';
import { useEffect, useRef, useState } from 'react';
import { createFrontendBridge, MessageChannelTransport } from '@thestudioxi/webmcp';

export default function WebMCPAgentPage() {
  const bridgeRef = useRef<any>(null);
  const [activeTools] = useState([
    { name: 'dom_get_text', category: 'DOM Inspector' },
    { name: 'dom_click_element', category: 'DOM Action' },
    { name: 'browser_get_url', category: 'Browser State' },
    { name: 'browser_navigate', category: 'Navigation' },
    { name: 'storage_get_item', category: 'Storage' },
    { name: 'storage_set_item', category: 'Storage' },
  ]);

  // Initialize WebMCP Frontend Bridge in the real browser window
  useEffect(() => {
    const channel = new MessageChannel();
    const transport = new MessageChannelTransport(channel.port1);
    const bridge = createFrontendBridge({
      transport,
      autoRegisterStarterKit: true,
    });
    bridge.start();
    bridgeRef.current = bridge;

    return () => {
      bridge.stop();
    };
  }, []);

  const { messages, input, handleInputChange, handleSubmit, isLoading } = useChat({
    api: '/api/chat',
    async onToolCall({ toolCall }) {
      if (bridgeRef.current) {
        console.log(`[WebMCP Browser Execution] Executing tool '${toolCall.toolName}' with args:`, toolCall.args);
        const result = await bridgeRef.current.executeTool(toolCall.toolName, toolCall.args);
        console.log(`[WebMCP Browser Result]`, result);
        return result;
      }
    },
  });

  return (
    <div className="container">
      {/* Header Bar */}
      <header className="header">
        <div className="brand">
          <span className="brand-badge">SDK Example</span>
          <h1 className="title">WebMCP + Vercel AI SDK</h1>
        </div>
        <div className="status-badge">
          <span className="status-dot"></span>
          WebMCP Client Bridge Active
        </div>
      </header>

      {/* Main Grid */}
      <main className="main-grid">
        {/* Chat Section */}
        <section className="glass-card chat-container">
          <div className="chat-messages">
            {messages.length === 0 ? (
              <div style={{ textAlign: 'center', margin: 'auto', color: 'var(--text-muted)' }}>
                <p style={{ fontSize: '1.2rem', fontWeight: 600, marginBottom: '0.5rem' }}>
                  ⚡ WebMCP Browser Agent Ready
                </p>
                <p style={{ fontSize: '0.9rem' }}>
                  Ask the Vercel AI SDK agent to inspect DOM elements, navigate pages, or set local storage!
                </p>
                <div style={{ marginTop: '1rem', display: 'flex', gap: '0.5rem', justifyContent: 'center' }}>
                  <button
                    className="send-btn"
                    style={{ fontSize: '0.8rem', padding: '0.4rem 0.8rem' }}
                    onClick={() => {
                      const fakeEvent = { preventDefault: () => {} } as any;
                      handleInputChange({ target: { value: "Set local storage key 'user_theme' to 'dark'" } } as any);
                    }}
                  >
                    Try: Set localStorage
                  </button>
                  <button
                    className="send-btn"
                    style={{ fontSize: '0.8rem', padding: '0.4rem 0.8rem' }}
                    onClick={() => {
                      handleInputChange({ target: { value: "Get local storage value for key 'user_theme'" } } as any);
                    }}
                  >
                    Try: Read localStorage
                  </button>
                </div>
              </div>
            ) : (
              messages.map((m) => (
                <div
                  key={m.id}
                  className={`message-bubble ${
                    m.role === 'user' ? 'message-user' : 'message-assistant'
                  }`}
                >
                  <p style={{ whiteSpace: 'pre-wrap' }}>{m.content}</p>

                  {/* Render Tool Invocations if present */}
                  {m.toolInvocations?.map((toolInvocation) => (
                    <div key={toolInvocation.toolCallId} className="tool-invocation">
                      ⚙️ Tool Execution: <strong>{toolInvocation.toolName}</strong>
                      <div>Args: {JSON.stringify(toolInvocation.args)}</div>
                      {'result' in toolInvocation && (
                        <div style={{ color: 'var(--success)', marginTop: '0.25rem' }}>
                          ✅ Result: {JSON.stringify(toolInvocation.result)}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ))
            )}
          </div>

          <form onSubmit={handleSubmit} className="chat-input-form">
            <input
              type="text"
              className="chat-input"
              value={input}
              onChange={handleInputChange}
              placeholder="Ask agent to set local storage, inspect DOM, etc..."
            />
            <button type="submit" className="send-btn" disabled={isLoading}>
              {isLoading ? 'Processing...' : 'Send'}
            </button>
          </form>
        </section>

        {/* Sidebar Status & Tools List */}
        <aside className="glass-card">
          <h2 className="sidebar-title">Registered WebMCP Tools</h2>
          <div className="tool-pill-list">
            {activeTools.map((t) => (
              <div key={t.name} className="tool-pill">
                <span className="tool-icon">🔧</span>
                <div>
                  <div style={{ fontWeight: 600 }}>{t.name}</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    {t.category}
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div
            style={{
              marginTop: '1.5rem',
              paddingTop: '1rem',
              borderTop: '1px solid var(--border-color)',
              fontSize: '0.8rem',
              color: 'var(--text-muted)',
              lineHeight: 1.5,
            }}
          >
            💡 <strong>Live Browser Storage:</strong> Browser tool executions run directly inside your active browser tab. Check Chrome DevTools Application -&gt; Local Storage to verify!
          </div>
        </aside>
      </main>
    </div>
  );
}

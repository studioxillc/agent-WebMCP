# Project Roadmap - agent-WebMCP

## Phase 1: Core Foundation & SDK (Current)
- Monorepo structure with Bun & TypeScript workspaces.
- `@webmcp/sdk` client, server, WebSocket & MessageChannel transports.
- AI Native setup: `AGENTS.md`, `CLAUDE.md`, Graphify scripts, skills.
- Example agent application showing WebMCP browser control (`examples/agentic-app`).
- Next.js & Vercel AI SDK integration example app (`examples/nextjs-vercel-ai`).

## Phase 2: Web Extensions & WebRTC Transports
- Chrome Manifest V3 WebMCP extension bridge.
- WebRTC PeerConnection transport for remote browser-agent relays.
- Enhanced tool input validation with Zod schemas.

## Phase 3: Swarm Coordination & Multi-Agent Bridging
- Multi-agent swarm routing.
- WebMCP security & token authorization middleware.

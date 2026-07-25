# EPIC-004: Vercel AI SDK Next.js Example & Integration

- **Status**: Completed
- **Target Completion**: Phase 1

## Objective

Build a Next.js example app in `examples/nextjs-vercel-ai` demonstrating WebMCP integration with Vercel AI SDK (`ai` package), along with a Vercel AI SDK tool adapter utility in `@thestudioxi/webmcp/backend`.

## Tasks

- [x] Create Vercel AI SDK tool adapter utility (`packages/sdk/src/backend/vercel-ai.ts`) and export from `@thestudioxi/webmcp`.
- [x] Add unit tests for Vercel AI SDK tool adapter (`packages/sdk/tests/vercel-ai.test.ts`).
- [x] Initialize Next.js 15 App Router project in `examples/nextjs-vercel-ai`.
- [x] Configure `package.json`, `tsconfig.json`, `next.config.ts`, and monorepo scripts.
- [x] Implement App Router API chat route (`app/api/chat/route.ts`) using `streamText` & `WebMCPAgentClient`.
- [x] Implement agent chat UI (`app/page.tsx` and `app/layout.tsx`) using `useChat` and WebMCP status monitor.
- [x] Update project roadmap in `docs/project-management/roadmap.md`.
- [x] Verify typecheck (`bun run check`), tests (`bun test`), and Next.js app build.

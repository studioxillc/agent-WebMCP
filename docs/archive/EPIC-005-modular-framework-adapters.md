# EPIC-005: Modular Framework Adapters & Generic Web Standard Architecture

- **Status**: Completed
- **Target Completion**: Phase 1

## Objective

Decouple framework-specific code from core `@thestudioxi/webmcp` package by implementing a Web Standard `Request` -> `Response` HTTP transport, and establishing dedicated adapter packages in `packages/adapters/` (`vercel-ai`, `hono`, `express`, `nest`).

## Tasks

- [x] Implement `WebStandardHttpTransport` in `packages/sdk/src/transports/http-standard.ts`.
- [x] Create `packages/adapters/vercel-ai` (`@webmcp/adapter-vercel-ai`).
- [x] Create `packages/adapters/hono` (`@webmcp/adapter-hono`).
- [x] Create `packages/adapters/express` (`@webmcp/adapter-express`).
- [x] Create `packages/adapters/nest` (`@webmcp/adapter-nest`).
- [x] Remove `vercel-ai.ts` from core `@thestudioxi/webmcp` package to keep core lean & zero-dependency.
- [x] Update `examples/nextjs-vercel-ai` to use `@webmcp/adapter-vercel-ai`.
- [x] Add unit tests for `WebStandardHttpTransport` and framework adapters in `packages/sdk/tests/`.
- [x] Verify typecheck (`bun run check`), build (`bun run build`), and tests (`bun test`).

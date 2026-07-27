# Contributing to agent-WebMCP 🤝

Thank you for your interest in contributing to **agent-WebMCP**! We welcome bug reports, feature proposals, documentation improvements, and pull requests.

---

## 🛠️ Local Development Setup

This project uses [Bun](https://bun.sh) as the package manager, test runner, and TypeScript execution engine.

### Prerequisites
- Install **Bun** (v1.0.0 or higher):
  ```bash
  curl -fsSL https://bun.sh/install | bash
  ```

### Getting Started
1. **Fork & Clone**:
   ```bash
   git clone https://github.com/<your-username>/agent-WebMCP.git
   cd agent-WebMCP
   ```

2. **Install Dependencies**:
   ```bash
   bun install
   ```

3. **Run Type Checks & Tests**:
   ```bash
   bun run check
   bun test
   ```

4. **Build Packages**:
   ```bash
   bun run build
   ```

5. **Run the Example Agent App**:
   ```bash
   bun run example:agent
   ```

---

## 📐 Project Structure

- `packages/sdk`: Core `@thestudioxi/webmcp` TypeScript package.
- `packages/adapters/*`: Framework adapters (Express, Hono, Nest, Vercel AI).
- `examples/agentic-app`: Example AI Agent application demonstrating WebMCP tool execution.
- `skills/`: Project-specific skills for AI assistants working in this repository.
- `docs/`: System architecture decision records (ADRs), PRDs, epics, bugfixes, and `docs/archive/` for completed tasks.

---

## 📦 Monorepo Dependency Guidelines

When referencing internal workspace packages (e.g., `@thestudioxi/webmcp` in adapter or example packages):
- Use explicit semver range declarations with the workspace protocol (e.g., `"@thestudioxi/webmcp": "workspace:^0.1.1"`), rather than unbounded wildcards (`"workspace:*"`).
- This ensures published packages clearly define their minimum version compatibility for NPM distribution while seamlessly resolving to local workspace sources in local development and CI builds.


---

## 🚀 Release & Versioning Strategy

This project uses [Changesets](https://github.com/changesets/changesets) for automated package versioning and NPM publishing:
- **Fixed Version Group**: `@thestudioxi/webmcp` and all adapter packages (`@thestudioxi/webmcp-adapter-*`) are configured in a `fixed` version group in `.changeset/config.json`. Whenever any package in this group is bumped, all related packages in the group are released together with the exact same version number (in lockstep).
- **Automated Patch Fallback**: When commits land on `main` without an explicit changeset file, our CI release workflow automatically generates a fallback patch changeset for all public workspace packages using `bun run generate:auto-patch`. This ensures continuous automated delivery of incremental improvements without requiring manual version bumps for every chore or documentation fix.


---

## 📜 Pull Request Guidelines

1. **Keep PRs Focused**: Each PR should address a single logical change or issue.
2. **Include Tests**: Add unit tests in `packages/sdk/tests/` for new features or bug fixes.
3. **Run Verification Commands**:
   - Ensure `bun run check` passes with 0 TypeScript errors.
   - Ensure `bun test` passes completely.
4. **Follow Commit Conventions**:
   - `feat(sdk): add WebRTC transport bridge`
   - `fix(client): resolve connection timeout handling`
   - `docs: update architecture overview`

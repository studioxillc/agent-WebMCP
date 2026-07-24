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

- `packages/sdk`: Core `@webmcp/sdk` TypeScript package.
- `examples/agentic-app`: Example AI Agent application demonstrating WebMCP tool execution.
- `skills/`: Project-specific skills for AI assistants working in this repository.
- `docs/`: System architecture decision records (ADRs), PRDs, epics, bugfixes, and `docs/archive/` for completed tasks.

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

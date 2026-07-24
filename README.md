# agent-WebMCP 🚀

**Open-source TypeScript SDK and AI-Native Toolset for WebMCP**  
*Empowering Web AI Agents to seamlessly interact with local browser content, web extensions, and local network resources.*

---

## 🌟 What is WebMCP?

**WebMCP** (Web Model Context Protocol) extends the standard Model Context Protocol (MCP) into web contexts. It enables bi-directional communication between local AI agent execution environments (Bun, Node, Python, Desktop agents) and active web pages, browser extensions, or local network endpoints.

With WebMCP, AI agents can:
- 🌐 Inspect and manipulate active browser tab DOMs in real time without heavy headless browsers.
- ⚡ Register and call web tools via bi-directional transports (WebSocket, MessageChannel, WebRTC).
- 🔗 Connect agent loops to local network services safely and modularly.

---

## 🏗️ Repository Architecture

This project is organized as an **AI-Native Bun Monorepo**:

```
agent-WebMCP/
├── AGENTS.md                   # Core AI Agent operating guidelines & rules
├── CLAUDE.md                   # Developer & Agent quick reference manual
├── package.json                # Bun workspace root configuration
├── tsconfig.json               # Root TypeScript configuration
├── scripts/
│   └── graphify.sh             # AST knowledge graph generator for AI agents
├── skills/                     # Co-located AI Agent skills
│   ├── webmcp-development/     # Skill for building WebMCP tools & transports
│   ├── graphify-codebase/      # Skill for querying codebase graph reports
│   └── doc-workflow/           # Skill for managing PRDs, Epics, & archiving
├── docs/                       # Project documentation taxonomy
│   ├── architecture/           # ADR-001 WebMCP Protocol Architecture
│   ├── prd/                    # PRD-001 SDK Specification
│   ├── epics/                  # Active development epics & task lists
│   ├── bugfix/                 # Bugfix plans & post-mortems
│   ├── project-management/     # Project roadmap and milestone tracking
│   └── archive/                # CLOSED FOLDER: Archived completed tasks & docs
├── packages/
│   └── sdk/                    # Core @webmcp/sdk TypeScript package
│       ├── src/client/         # WebMCPClient interface
│       ├── src/server/         # WebMCPServer bridge & tool dispatcher
│       └── src/transports/     # WebSocket & MessageChannel transports
└── examples/
    └── agentic-app/            # Sample Agentic App (Pi Agent / DeepAgent pattern)
```

---

## 🚀 Quick Start

### Prerequisites
- [Bun](https://bun.sh) (v1.0.0 or higher)

### Installation
```bash
# Clone the repository
git clone https://github.com/zhenximi/agent-WebMCP.git
cd agent-WebMCP

# Install workspace dependencies
bun install
```

### Running Tests
```bash
bun test
```

### Building the Core SDK
```bash
bun run build
```

### Typechecking
```bash
bun run check
```

---

## 🤖 Running the Example Agentic App

Run the sample agent runner powered by `@webmcp/sdk`:

```bash
bun run example:agent
```

This starts an in-memory WebMCP bridge server, registers sample browser and local network tools, connects the client, and executes an autonomous agent step loop.

---

## 📊 Graphify Knowledge Graph

To help local AI agents and developers visualize structural relationships and AST dependencies:

```bash
bun run graphify
```

This outputs tree-sitter AST index reports in `graphify-out/`:
- `GRAPH_REPORT.md`: Architectural summary of code components.
- `graph.json`: Structural graph nodes & edges.
- `graph.html`: Interactive browser graph visualizer.

---

## 📂 Documentation & Archiving Workflow

All project decisions, requirements, and tasks are managed under `docs/`:
- Active tasks live in `docs/epics/` and bug reports live in `docs/bugfix/`.
- Once an epic or task is fully verified, it is moved into `docs/archive/` to maintain a clean workspace.

---

## 📄 License

[MIT](LICENSE)

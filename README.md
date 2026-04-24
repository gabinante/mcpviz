# mcpviz

Interactive MCP (Model Context Protocol) visualizer for **Talk 6: Pitfalls of MCP - The Protocol Everyone's Using Wrong**.

## Demos

### 1. Context Pollution
Register MCP tools and watch the context window fill up. Each tool adds its description and parameter schema to the context. Simulate tool calls to see results accumulate.

- Animated token grid (1,000 blocks = 200k context window)
- Stacked progress bar: system prompt, user message, tool descriptions, tool results
- Health indicator with real-time token counts
- Register tools individually or all 20 at once

### 2. Tool Descriptions
Compare ambiguous vs improved tool descriptions. See how wording affects which tool a simulated model selects.

- Side-by-side probability distributions
- "Search" problem: three tools all called "search"
- "Read" problem: file read vs database schema vs SQL
- Best practice tips with bad/good examples

### 3. Protocol Flow
Step-through animated sequence diagrams showing MCP request/response patterns and failure modes.

- **Happy Path**: Simple tool call succeeds
- **Context Explosion**: Tool results fill context until overflow
- **Wrong Tool Selection**: Ambiguous descriptions cause 3 attempts
- **Timeout Cascade**: Long-running tool with no streaming, blind retries

## Quick Start

```bash
npm install
npm run dev      # Starts on port 5180
```

Or with Make:

```bash
make dev         # Install + dev server
make build       # Production build
```

## Stack

- Vite + React + TypeScript
- Framer Motion (animations)
- Tailwind CSS (styling)
- D3.js / Three.js (available for future 3D visualizations)

## Talk Outline

See `~/thought-leader/outlines/06-mcp-pitfalls.md` for the full talk outline and speaker notes.

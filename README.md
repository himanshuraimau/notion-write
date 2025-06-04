# Notion Write

AI-powered Notion SDK with intelligent agents and RAG capabilities for automated content creation and project management.

## ⚡ Quick Start

```bash
# Install dependencies
bun install

# Configure environment
cp .env.example .env
# Add your NOTION_API_KEY and OPENAI_API_KEY

# Test basic functionality
bun run test-functions

# Start MCP server
bun run mcp-server
```

## 🤖 AI Agents

**Content Research Agent** - Researches topics and creates comprehensive Notion pages automatically.

```typescript
import { AgentManager } from './src/agent-manager.js';

const manager = new AgentManager(process.env.OPENAI_API_KEY);
await manager.initialize();

const response = await manager.chat("Research AI trends and create a detailed page");
```

**Task Planning Agent** - Breaks down projects into actionable tasks with timelines.

```typescript
const response = await manager.chat("Plan a mobile app development project");
```

## 🧠 RAG System

Retrieval-Augmented Generation using your Notion workspace as context.

```typescript
import { RAGSystem } from './src/rag-system.js';

const ragSystem = new RAGSystem(process.env.OPENAI_API_KEY);
await ragSystem.indexNotionWorkspace(); // Index your workspace
const context = await ragSystem.getContextForQuery("project management");
```

## 🛠️ MCP Tools

12 tools available for AI assistants:

- `agent_chat` - Chat with AI agents
- `research_and_create_page` - Research and create content
- `create_project_plan` - Generate project plans
- `index_notion_workspace` - Index workspace for RAG
- `create_notion_page` - Create pages and databases
- And 7 more...

## 📚 Documentation

**Full documentation available in [`docs/`](./docs/README.md)**

- [Installation Guide](./docs/guides/installation.md) - Complete setup instructions
- [Quick Start](./docs/guides/quick-start.md) - Usage examples and tutorials
- [AI Agents Overview](./docs/features/agents-overview.md) - Agent capabilities and workflows
- [RAG System](./docs/features/rag-system.md) - Retrieval-Augmented Generation
- [API Reference](./docs/api/agent-manager.md) - Complete API documentation

## 🎯 Key Features

✅ **AI Agents** - Content research, project planning, task management  
✅ **RAG Integration** - Context-aware responses from your workspace  
✅ **MCP Server** - 12 tools for seamless AI assistant integration  
✅ **TypeScript** - Full type safety and excellent developer experience  
✅ **Modular Design** - Use components independently or together  

## 🚀 Environment Variables

```env
# Required
NOTION_API_KEY=your_notion_integration_token
OPENAI_API_KEY=your_openai_api_key

# Optional
NOTION_PARENT_PAGE_ID=default_parent_page_id
```

## 📖 Examples

**Create research content:**
```bash
bun run agent-demo # Interactive agent demo
```

**Direct Notion operations:**
```typescript
import { createNotionPage, createDatabase } from './src/notion-functions.js';

const page = await createNotionPage("My Page", "Content here");
const db = await createDatabase("Project Tasks");
```

## 🔧 Architecture

```
┌─────────────────┐    ┌──────────────┐    ┌─────────────┐
│   MCP Server    │────│ Agent Manager│────│ RAG System  │
│   (12 tools)    │    │ (Routing)    │    │ (ChromaDB)  │
└─────────────────┘    └──────────────┘    └─────────────┘
                              │
                    ┌─────────┴─────────┐
                    │                   │
            ┌───────────────┐  ┌────────────────┐
            │Content Research│  │ Task Planning  │
            │    Agent       │  │     Agent      │
            └───────────────┘  └────────────────┘
                    │                   │
                    └─────────┬─────────┘
                              │
                    ┌─────────────────┐
                    │ Notion Functions│
                    │ (SDK Wrapper)   │
                    └─────────────────┘
```

## 📋 Requirements

- Node.js 18+
- Bun (recommended) or npm/yarn
- Notion account with integration
- OpenAI API key
- Docker (optional, for ChromaDB)

## 🔗 Links

- **[Complete Documentation](./docs/README.md)** - Full guides and API reference
- **[Installation Guide](./docs/guides/installation.md)** - Detailed setup instructions
- **[Agent Examples](./docs/examples/agent-examples.md)** - Usage patterns and workflows

---

*Transform your Notion workspace with AI-powered content creation and intelligent project management.*
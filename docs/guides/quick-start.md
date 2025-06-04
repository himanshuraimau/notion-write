# Quick Start Guide

Get started with Notion Write's core features in just a few minutes. This guide shows you how to use both the direct Notion functions and AI agents.

## 🚀 Prerequisites

Before starting, ensure you have completed the [Installation Guide](./installation.md) and have:
- ✅ Notion API key configured
- ✅ OpenAI API key set up (for AI features)
- ✅ ChromaDB running (for RAG features)

## 📝 Basic Notion Operations

### Creating Pages

**Simple page creation:**
```typescript
import { createNotionPage } from './src/notion-functions.js';

// Create a basic page
const page = await createNotionPage(
  "My First Page",
  "This is the content of my page"
);

console.log(`Created page: ${page.url}`);
```

**Create page with rich content:**
```typescript
const content = `# Project Overview

This project aims to build a modern web application with the following features:

## Key Features
- User authentication
- Real-time messaging
- File sharing capabilities

## Technical Stack
- Frontend: React with TypeScript
- Backend: Node.js with Express
- Database: PostgreSQL
- Deployment: Docker containers

## Timeline
The project is planned for 12 weeks of development.`;

const page = await createNotionPage(
  "Project Documentation",
  content,
  "parent-page-id-here" // Optional
);
```

### Creating Databases

**Simple task database:**
```typescript
import { createDatabase } from './src/notion-functions.js';

const database = await createDatabase("Project Tasks");
console.log(`Created database: ${database.url}`);
```

**Add entries to database:**
```typescript
import { addDatabaseEntry } from './src/notion-functions.js';

const entry = await addDatabaseEntry(
  "database-id-here",
  "Implement user authentication",
  "Set up login/logout functionality with OAuth",
  "High",
  "In Progress",
  ["backend", "security"]
);

console.log(`Added task: ${entry.url}`);
```

### Searching and Updating

**Search for pages:**
```typescript
import { searchPages } from './src/notion-functions.js';

const results = await searchPages("machine learning");
results.forEach(page => {
  console.log(`Found: ${page.title} - ${page.url}`);
});
```

**Update existing page:**
```typescript
import { updatePageContent } from './src/notion-functions.js';

await updatePageContent(
  "page-id-here",
  "\n\n## Update\nAdding new information to this page."
);
```

## 🤖 AI Agent Usage

### Setting Up Agent Manager

```typescript
import { AgentManager } from './src/agent-manager.js';

const manager = new AgentManager(process.env.OPENAI_API_KEY);
await manager.initialize();

console.log("Available agents:", manager.getAvailableAgents());
// Output: ["content-research", "task-planning"]
```

### Content Research Agent

**Research and create comprehensive content:**
```typescript
// Research and create a Notion page automatically
const response = await manager.chat(
  "Research machine learning trends in 2024 and create a comprehensive page"
);

console.log(response.response);
// AI will research the topic and create a detailed Notion page automatically

// Check what actions were taken
response.actions.forEach(action => {
  if (action.type === 'page_created') {
    console.log(`Created page: ${action.pageUrl}`);
  }
});
```

**Interactive research conversation:**
```typescript
// Start a research conversation
let response = await manager.chat("Tell me about blockchain technology");
console.log(response.response);

// Follow up with more specific questions
response = await manager.chat("How does blockchain compare to traditional databases?");
console.log(response.response);

// Request a comprehensive page
response = await manager.chat("Create a detailed comparison page in Notion");
console.log(`Page created: ${response.actions[0]?.pageUrl}`);
```

**Research specific topics:**
```typescript
// Technology research
await manager.chat("Research the latest developments in quantum computing");

// Market research
await manager.chat("Analyze the current state of the electric vehicle market");

// Educational content
await manager.chat("Create a beginner's guide to React hooks with examples");

// Technical documentation
await manager.chat("Research REST API best practices and create a guide");
```

### Task Planning Agent

**Project planning:**
```typescript
// Plan a software project
const response = await manager.chat(
  "Create a project plan for developing a mobile weather app"
);

console.log(response.response);
// AI will break down the project, create tasks, timelines, and set up Notion databases

// Check created databases
response.actions.forEach(action => {
  if (action.type === 'database_created') {
    console.log(`Created database: ${action.databaseUrl}`);
  }
});
```

**Different project types:**
```typescript
// Software development
await manager.chat("Plan a web application for task management");

// Event planning
await manager.chat("Plan a tech conference for 200 people");

// Research project
await manager.chat("Plan a 6-month research project on AI ethics");

// Product launch
await manager.chat("Create a go-to-market plan for a new SaaS product");
```

**Follow-up planning:**
```typescript
// Start with basic planning
await manager.chat("Plan a mobile app project");

// Add more detail
await manager.chat("Add detailed technical specifications");
await manager.chat("Include risk assessment and mitigation strategies");
await manager.chat("Create a budget breakdown");
```

## 🧠 RAG System Usage

### Setting Up RAG

```typescript
import { RAGSystem } from './src/rag-system.js';

const ragSystem = new RAGSystem(process.env.OPENAI_API_KEY);
await ragSystem.initialize();
```

### Index Your Workspace

**First-time setup:**
```typescript
// Index your entire Notion workspace
console.log("Indexing workspace...");
await ragSystem.indexNotionWorkspace();
console.log("Workspace indexed successfully!");

// Check what was indexed
const testResults = await ragSystem.searchKnowledge("test", 1);
console.log(`Indexed documents available: ${testResults.length > 0 ? 'Yes' : 'No'}`);
```

### Smart Search

**Find relevant content:**
```typescript
// Search your Notion workspace semantically
const results = await ragSystem.searchKnowledge("project management", 5);

results.forEach(result => {
  console.log(`${result.metadata.title}: ${result.content.substring(0, 100)}...`);
  console.log(`Relevance: ${result.score}`);
});
```

**Get contextual information:**
```typescript
// Get context for AI responses
const context = await ragSystem.getContextForQuery("How to deploy applications?");
console.log("Context from your workspace:");
console.log(context.context);
// Returns relevant information from your workspace + web search
```

### RAG with Agents

**Use RAG-enhanced agents:**
```typescript
// Create agent manager with RAG
const ragSystem = new RAGSystem(process.env.OPENAI_API_KEY);
await ragSystem.indexNotionWorkspace();

const manager = new AgentManager(process.env.OPENAI_API_KEY, ragSystem);
await manager.initialize();

// Now agents use your workspace knowledge
const response = await manager.chat(
  "Based on my previous projects, plan a new mobile app"
);
// Agent will use context from your existing Notion pages
```

## 🛠️ MCP Server Usage

Start the MCP server to use tools with AI assistants:

```bash
# Start the server
bun run mcp-server
```

### Available MCP Tools

**1. Agent Chat Tool:**
```json
{
  "tool": "agent_chat",
  "arguments": {
    "message": "Research artificial intelligence and create a page"
  }
}
```

**2. Research and Create Page:**
```json
{
  "tool": "research_and_create_page",
  "arguments": {
    "topic": "blockchain technology",
    "depth": "comprehensive"
  }
}
```

**3. Create Project Plan:**
```json
{
  "tool": "create_project_plan",
  "arguments": {
    "description": "Develop a task management web application"
  }
}
```

**4. Index Workspace:**
```json
{
  "tool": "index_notion_workspace",
  "arguments": {}
}
```

**5. Direct Notion Operations:**
```json
{
  "tool": "create_notion_page",
  "arguments": {
    "title": "Meeting Notes",
    "content": "## Agenda\n- Project updates\n- Budget review"
  }
}
```

## 🔄 Complete Workflows

### 1. Research and Documentation Workflow

```typescript
// Complete research workflow
async function researchWorkflow(topic: string) {
  const manager = new AgentManager(process.env.OPENAI_API_KEY);
  await manager.initialize();
  
  // 1. Initial research
  console.log("🔍 Starting research...");
  let response = await manager.chat(`Research ${topic} comprehensively`);
  
  // 2. Create detailed content
  console.log("📝 Creating detailed content...");
  response = await manager.chat("Expand this into a detailed guide with examples");
  
  // 3. Add practical information
  console.log("⚡ Adding practical examples...");
  response = await manager.chat("Add practical examples and use cases");
  
  return response;
}

// Use the workflow
await researchWorkflow("GraphQL vs REST APIs");
```

### 2. Project Setup Workflow

```typescript
// Complete project setup workflow
async function projectSetupWorkflow(projectDescription: string) {
  const ragSystem = new RAGSystem(process.env.OPENAI_API_KEY);
  await ragSystem.indexNotionWorkspace();
  
  const manager = new AgentManager(process.env.OPENAI_API_KEY, ragSystem);
  await manager.initialize();
  
  // 1. Research relevant technologies
  console.log("🔍 Researching technologies...");
  await manager.chat(`Research technologies needed for: ${projectDescription}`);
  
  // 2. Create project plan
  console.log("📋 Creating project plan...");
  await manager.chat(`Create a detailed project plan for: ${projectDescription}`);
  
  // 3. Set up documentation structure
  console.log("📚 Setting up documentation...");
  await manager.chat("Create a documentation structure for this project");
  
  console.log("✅ Project setup complete!");
}

// Use the workflow
await projectSetupWorkflow("E-commerce platform with React and Node.js");
```

### 3. Content Series Creation

```typescript
// Create a series of related content
async function createContentSeries(topics: string[]) {
  const manager = new AgentManager(process.env.OPENAI_API_KEY);
  await manager.initialize();
  
  const createdPages = [];
  
  for (const topic of topics) {
    console.log(`📝 Creating content for: ${topic}`);
    const response = await manager.chat(
      `Research and create a comprehensive guide on: ${topic}`
    );
    
    // Extract created page URL
    const pageAction = response.actions.find(a => a.type === 'page_created');
    if (pageAction) {
      createdPages.push({ topic, url: pageAction.pageUrl });
    }
    
    // Brief pause to avoid rate limits
    await new Promise(resolve => setTimeout(resolve, 2000));
  }
  
  // Create index page
  console.log("📚 Creating index page...");
  await manager.chat(`
    Create an index page that links to all the guides we just created:
    ${createdPages.map(p => `- ${p.topic}: ${p.url}`).join('\n')}
  `);
  
  return createdPages;
}

// Use the workflow
const topics = [
  "Introduction to TypeScript",
  "Advanced TypeScript Patterns",
  "TypeScript with React",
  "TypeScript Testing Strategies"
];

await createContentSeries(topics);
```

## 🎯 Common Use Cases

### 1. Meeting Preparation

```typescript
// Prepare for a meeting
const response = await manager.chat(`
  I have a meeting about implementing microservices architecture.
  Research this topic and create a briefing document with:
  - Key concepts and benefits
  - Implementation strategies
  - Common challenges and solutions
  - Questions to ask the team
`);
```

### 2. Learning New Technology

```typescript
// Learn a new technology
await manager.chat("I want to learn Kubernetes. Create a learning path");
await manager.chat("Add hands-on exercises and projects");
await manager.chat("Include troubleshooting common issues");
```

### 3. Competitive Analysis

```typescript
// Analyze competitors
const response = await manager.chat(`
  Analyze the top 5 project management tools and create a comparison:
  - Feature matrix
  - Pricing comparison
  - User experience assessment
  - Market positioning
`);
```

### 4. Technical Decision Making

```typescript
// Make technical decisions
await manager.chat("Compare React vs Vue vs Angular for our project");
await manager.chat("Consider our team's experience and project requirements");
await manager.chat("Create a recommendation with pros and cons");
```

## 📊 Monitoring and Optimization

### Check System Status

```typescript
// Verify everything is working
async function systemHealthCheck() {
  // Test Notion functions
  try {
    const testPage = await createNotionPage("Health Check", "Test page");
    console.log("✅ Notion functions working");
  } catch (error) {
    console.error("❌ Notion functions failed:", error.message);
  }
  
  // Test RAG system
  try {
    const ragSystem = new RAGSystem(process.env.OPENAI_API_KEY);
    const results = await ragSystem.searchKnowledge("test", 1);
    console.log("✅ RAG system working");
  } catch (error) {
    console.error("❌ RAG system failed:", error.message);
  }
  
  // Test agents
  try {
    const manager = new AgentManager(process.env.OPENAI_API_KEY);
    await manager.initialize();
    const response = await manager.chat("Hello");
    console.log("✅ Agent system working");
  } catch (error) {
    console.error("❌ Agent system failed:", error.message);
  }
}

await systemHealthCheck();
```

### Monitor Usage

```typescript
// Track agent usage
const history = manager.getConversationHistory();
console.log(`Conversation length: ${history.length} turns`);

// Analyze agent distribution
const agentUsage = history.reduce((acc, turn) => {
  acc[turn.agentResponse.agentType] = (acc[turn.agentResponse.agentType] || 0) + 1;
  return acc;
}, {});

console.log("Agent usage:", agentUsage);
```

## 🚨 Troubleshooting

### Common Issues

**Agent not responding:**
```typescript
// Check OpenAI API key
if (!process.env.OPENAI_API_KEY) {
  console.error("OpenAI API key not set");
}

// Verify agent initialization
console.log("Available agents:", manager.getAvailableAgents());
```

**RAG not finding content:**
```typescript
// Re-index workspace
await ragSystem.clearCollection();
await ragSystem.indexNotionWorkspace();

// Test search
const results = await ragSystem.searchKnowledge("anything");
console.log(`Found ${results.length} documents`);
```

**Notion permissions:**
```typescript
// Test basic Notion access
try {
  const testPage = await createNotionPage("Test", "Test content");
  console.log("Notion access working");
} catch (error) {
  console.error("Notion access failed:", error.message);
}
```

## 🎓 Next Steps

Now that you're familiar with the basics:

1. **Explore Advanced Features**: Check out [Advanced RAG Configuration](./rag-configuration.md)
2. **Learn Agent Patterns**: Read [Agent Design Patterns](./agent-patterns.md)
3. **Build Custom Workflows**: See [Project Templates](../examples/project-templates.md)
4. **Integrate with Tools**: Review [MCP Server Integration](./mcp-server.md)

## 💡 Pro Tips

1. **Start Small**: Begin with simple page creation, then move to AI features
2. **Index Early**: Set up RAG indexing before using agents for best results
3. **Use Context**: Leverage conversation context for better AI responses
4. **Monitor Usage**: Keep track of API usage to manage costs
5. **Iterate**: Use follow-up questions to refine AI outputs

## 🔗 Quick Reference

### Essential Commands
```bash
# Test basic functionality
bun run test-functions

# Test AI agents
bun run test-agents

# Start MCP server
bun run mcp-server

# Run interactive demo
bun run agent-demo
```

### Key Functions
```typescript
// Notion operations
createNotionPage(title, content, parentId?)
createDatabase(title, parentId?)
addDatabaseEntry(dbId, title, description, priority, status, tags)
searchPages(query)

// AI agents
manager.chat(message)
manager.getAvailableAgents()
manager.clearConversation()

// RAG system
ragSystem.indexNotionWorkspace()
ragSystem.searchKnowledge(query, limit)
ragSystem.getContextForQuery(query)
```

You're now ready to use Notion Write effectively! The AI agents will help you create content, manage projects, and organize your knowledge base automatically. 
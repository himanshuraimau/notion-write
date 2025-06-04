#!/usr/bin/env node

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import {
  createNotionPage,
  getPageContent,
  updatePageContent,
  searchPages,
  createDatabase,
  addDatabaseEntry,
  getDatabaseEntries,
} from './notion-functions.js';
import { defaultNotionClient } from './notion-client.js';
import { AgentManager } from './agent-manager.js';

// Initialize Agent Manager if OpenAI API key is available
let agentManager: AgentManager | null = null;

if (process.env.OPENAI_API_KEY) {
  agentManager = new AgentManager(process.env.OPENAI_API_KEY);
  // Initialize asynchronously
  agentManager.initialize().catch(error => {
    console.warn('⚠️  Failed to initialize Agent Manager:', error);
    agentManager = null;
  });
}

// Helper function to check if Notion is configured
function checkNotionConfig() {
  if (!defaultNotionClient.isConfigured()) {
    throw new Error('❌ Notion API key not configured. Please set the NOTION_API_KEY environment variable with your Notion integration token.');
  }
}

// Helper function to check if agents are available
function checkAgentsAvailable() {
  if (!agentManager) {
    throw new Error('❌ Agent system not available. Please set the OPENAI_API_KEY environment variable to enable AI agents.');
  }
}

// Create MCP server
const server = new McpServer({
  name: "notion-mcp-server",
  version: "2.0.0",
  description: "MCP server for Notion SDK operations with AI agents and RAG"
});

// 🔧 TOOL 1: Create Notion Page
server.tool(
  "create_notion_page",
  {
    title: z.string().describe("Title of the page"),
    content: z.string().describe("Main content of the page"),
    databaseId: z.string().optional().describe("Database ID to create page in (optional)"),
    parentPageId: z.string().optional().describe("Parent page ID to create page under (optional)")
  },
  async ({ title, content, databaseId, parentPageId }) => {
    try {
      checkNotionConfig();
      const response = await createNotionPage({ title, content, databaseId, parentPageId });
      return {
        content: [{
          type: "text",
          text: `✅ Page created successfully!\n📄 Page ID: ${response.id}\n🌐 You can view the page in your Notion workspace`
        }]
      };
    } catch (error: any) {
      return {
        content: [{
          type: "text",
          text: `❌ Error creating page: ${error.message}`
        }]
      };
    }
  }
);

// 🔍 TOOL 2: Get Page Content
server.tool(
  "get_page_content",
  {
    pageId: z.string().describe("The ID of the page to retrieve content from")
  },
  async ({ pageId }) => {
    try {
      checkNotionConfig();
      const { page, blocks } = await getPageContent(pageId);
      return {
        content: [{
          type: "text",
          text: `✅ Page content retrieved successfully!\n📋 Found ${blocks.length} blocks\n📄 Page ID: ${pageId}\n\nBlocks:\n${JSON.stringify(blocks, null, 2)}`
        }]
      };
    } catch (error: any) {
      return {
        content: [{
          type: "text",
          text: `❌ Error retrieving page content: ${error.message}`
        }]
      };
    }
  }
);

// ✏️ TOOL 3: Update Page Content
server.tool(
  "update_page_content",
  {
    pageId: z.string().describe("The ID of the page to update"),
    newContent: z.string().describe("New content to add to the page")
  },
  async ({ pageId, newContent }) => {
    try {
      checkNotionConfig();
      await updatePageContent(pageId, newContent);
      return {
        content: [{
          type: "text",
          text: `✅ Page updated successfully!\n📄 Page ID: ${pageId}\n📝 Added new content with timestamp`
        }]
      };
    } catch (error: any) {
      return {
        content: [{
          type: "text",
          text: `❌ Error updating page: ${error.message}`
        }]
      };
    }
  }
);

// 🔎 TOOL 4: Search Pages
server.tool(
  "search_pages",
  {
    query: z.string().describe("Search query to find pages")
  },
  async ({ query }) => {
    try {
      checkNotionConfig();
      const pages = await searchPages(query);
      return {
        content: [{
          type: "text",
          text: `✅ Search completed!\n🔍 Query: "${query}"\n📊 Found ${pages.length} pages\n\nResults:\n${JSON.stringify(pages, null, 2)}`
        }]
      };
    } catch (error: any) {
      return {
        content: [{
          type: "text",
          text: `❌ Error searching pages: ${error.message}`
        }]
      };
    }
  }
);

// 🗃️ TOOL 5: Create Database
server.tool(
  "create_database",
  {
    title: z.string().describe("Title of the database"),
    parentPageId: z.string().optional().describe("Parent page ID (optional, uses env var if not provided)")
  },
  async ({ title, parentPageId }) => {
    try {
      checkNotionConfig();
      const response = await createDatabase(title, parentPageId);
      return {
        content: [{
          type: "text",
          text: `✅ Database created successfully!\n🗃️ Database ID: ${response.id}\n📋 Title: ${title}\n🏗️ Created with Title, Description, Status, Priority, Tags, and Created Date properties`
        }]
      };
    } catch (error: any) {
      return {
        content: [{
          type: "text",
          text: `❌ Error creating database: ${error.message}`
        }]
      };
    }
  }
);

// 📝 TOOL 6: Add Database Entry
server.tool(
  "add_database_entry",
  {
    databaseId: z.string().describe("The ID of the database to add entry to"),
    title: z.string().describe("Title of the database entry"),
    description: z.string().optional().describe("Description of the entry"),
    status: z.enum(['Not Started', 'In Progress', 'Completed']).optional().describe("Status of the entry"),
    priority: z.enum(['Low', 'Medium', 'High']).optional().describe("Priority level"),
    tags: z.array(z.string()).optional().describe("Array of tag names")
  },
  async ({ databaseId, title, description, status, priority, tags }) => {
    try {
      checkNotionConfig();
      const response = await addDatabaseEntry(databaseId, { title, description, status, priority, tags });
      return {
        content: [{
          type: "text",
          text: `✅ Database entry added successfully!\n📄 Entry ID: ${response.id}\n📋 Title: ${title}\n📝 Status: ${status || 'Not Started'}\n⚡ Priority: ${priority || 'Medium'}`
        }]
      };
    } catch (error: any) {
      return {
        content: [{
          type: "text",
          text: `❌ Error adding database entry: ${error.message}`
        }]
      };
    }
  }
);

// 📊 TOOL 7: Get Database Entries
server.tool(
  "get_database_entries",
  {
    databaseId: z.string().describe("The ID of the database to query"),
    pageSize: z.number().optional().describe("Number of entries to retrieve (max 100, default 10)")
  },
  async ({ databaseId, pageSize = 10 }) => {
    try {
      checkNotionConfig();
      const entries = await getDatabaseEntries(databaseId, pageSize);
      return {
        content: [{
          type: "text",
          text: `✅ Database entries retrieved successfully!\n🗃️ Database ID: ${databaseId}\n📊 Found ${entries.length} entries\n\nEntries:\n${JSON.stringify(entries, null, 2)}`
        }]
      };
    } catch (error: any) {
      return {
        content: [{
          type: "text",
          text: `❌ Error retrieving database entries: ${error.message}`
        }]
      };
    }
  }
);

// 🤖 TOOL 8: Agent Chat
server.tool(
  "agent_chat",
  {
    message: z.string().describe("Message to send to the AI agents"),
    conversationId: z.string().optional().describe("Conversation ID to continue previous chat"),
    preferredAgent: z.enum(['content-research', 'task-planning', 'notion-intelligence', 'content-enhancement', 'database-architect', 'analytics']).optional().describe("Preferred agent type to use")
  },
  async ({ message, conversationId, preferredAgent }) => {
    try {
      checkAgentsAvailable();
      
      const response = await agentManager!.chat(message, conversationId, preferredAgent);
      
      return {
        content: [{
          type: "text",
          text: `🤖 Agent Response (${response.agentUsed}):\n\n${response.response}\n\n💬 Conversation ID: ${response.context.conversationId}\n💡 Suggestions: ${response.suggestions?.join(', ') || 'None'}`
        }]
      };
    } catch (error: any) {
      return {
        content: [{
          type: "text",
          text: `❌ Error in agent chat: ${error.message}`
        }]
      };
    }
  }
);

// 🔍 TOOL 9: Research Topic and Create Page
server.tool(
  "research_and_create_page",
  {
    topic: z.string().describe("Topic to research"),
    depth: z.enum(['basic', 'comprehensive', 'expert']).optional().describe("Research depth level"),
    parentPageId: z.string().optional().describe("Parent page ID for the created page")
  },
  async ({ topic, depth = 'comprehensive', parentPageId }) => {
    try {
      checkAgentsAvailable();
      checkNotionConfig();

      const context = agentManager!.createContext();
      
      const task = {
        id: `research-${Date.now()}`,
        type: 'content-research' as const,
        description: `Research and create page: ${topic}`,
        parameters: {
          topic,
          depth,
          includeWeb: true,
          createPage: true,
          parentPageId
        },
        status: 'pending' as const,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      const result = await agentManager!.executeTask('content-research', task, context);

      return {
        content: [{
          type: "text",
          text: `🔍 Research completed for "${topic}"!\n\n📄 Created comprehensive page with ${result.content.length} characters\n📚 Sources: ${result.sources.length}\n⭐ Relevance Score: ${result.relevanceScore.toFixed(2)}\n\n${result.content.substring(0, 500)}...`
        }]
      };
    } catch (error: any) {
      return {
        content: [{
          type: "text",
          text: `❌ Error in research and page creation: ${error.message}`
        }]
      };
    }
  }
);

// 📋 TOOL 10: Create Project Plan
server.tool(
  "create_project_plan",
  {
    projectDescription: z.string().describe("Description of the project to plan"),
    deadline: z.string().optional().describe("Project deadline (ISO date string)"),
    teamSize: z.number().optional().describe("Number of team members"),
    complexity: z.enum(['low', 'medium', 'high']).optional().describe("Project complexity level"),
    createDatabase: z.boolean().optional().describe("Whether to create a Notion database for tasks"),
    parentPageId: z.string().optional().describe("Parent page ID for the database")
  },
  async ({ projectDescription, deadline, teamSize = 1, complexity = 'medium', createDatabase = true, parentPageId }) => {
    try {
      checkAgentsAvailable();
      if (createDatabase) checkNotionConfig();

      const context = agentManager!.createContext();
      
      const task = {
        id: `plan-${Date.now()}`,
        type: 'task-planning' as const,
        description: `Plan project: ${projectDescription}`,
        parameters: {
          projectDescription,
          deadline,
          teamSize,
          complexity,
          createDatabase,
          parentPageId
        },
        status: 'pending' as const,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      const result = await agentManager!.executeTask('task-planning', task, context);

      const dbInfo = createDatabase ? `\n🗄️ Database created: ${(result as any).databaseUrl || 'Check your Notion workspace'}` : '';

      return {
        content: [{
          type: "text",
          text: `📋 Project plan created for "${result.projectTitle}"!\n\n✅ Tasks: ${result.mainTasks.length}\n📅 Timeline items: ${result.timeline.length}\n🔗 Dependencies: ${result.dependencies.length}\n📊 Resources: ${result.resources.length}${dbInfo}\n\nMain Tasks:\n${result.mainTasks.slice(0, 3).map((t: any, i: number) => `${i + 1}. ${t.title} (${t.priority} priority, ${t.estimatedHours}h)`).join('\n')}`
        }]
      };
    } catch (error: any) {
      return {
        content: [{
          type: "text",
          text: `❌ Error creating project plan: ${error.message}`
        }]
      };
    }
  }
);

// 📚 TOOL 11: Index Notion Workspace
server.tool(
  "index_notion_workspace",
  {
    rebuild: z.boolean().optional().describe("Whether to rebuild the entire index from scratch")
  },
  async ({ rebuild = false }) => {
    try {
      checkAgentsAvailable();
      checkNotionConfig();

      if (rebuild) {
        await agentManager!.clearRAGSystem();
      }

      await agentManager!.indexNotionWorkspace();

      return {
        content: [{
          type: "text",
          text: `✅ Notion workspace indexed successfully!\n🔄 Action: ${rebuild ? 'Full rebuild' : 'Incremental update'}\n📚 Your workspace content is now available for RAG-powered search and AI agent context.`
        }]
      };
    } catch (error: any) {
      return {
        content: [{
          type: "text",
          text: `❌ Error indexing workspace: ${error.message}`
        }]
      };
    }
  }
);

// 🔧 TOOL 12: Get Available Agents
server.tool(
  "get_available_agents",
  {
    includeSystemPrompts: z.boolean().optional().describe("Whether to include system prompts in the response")
  },
  async ({ includeSystemPrompts = false }) => {
    try {
      checkAgentsAvailable();

      const agents = agentManager!.getAvailableAgents();
      let response = `🤖 Available AI Agents (${agents.length}):\n\n`;

      agents.forEach(agentType => {
        const info = agentManager!.getAgentInfo(agentType);
        response += `• ${agentType}\n`;
        if (includeSystemPrompts && info) {
          response += `  ${info.systemPrompt.split('\n')[0]}\n`;
        }
      });

      if (!includeSystemPrompts) {
        response += `\n💡 Use includeSystemPrompts: true to see agent descriptions`;
      }

      return {
        content: [{
          type: "text",
          text: response
        }]
      };
    } catch (error: any) {
      return {
        content: [{
          type: "text",
          text: `❌ Error getting available agents: ${error.message}`
        }]
      };
    }
  }
);

// Start the server
const transport = new StdioServerTransport();
await server.connect(transport);

console.error("🚀 Notion MCP Server started successfully!");
console.error("📋 Available tools: create_notion_page, get_page_content, update_page_content, search_pages, create_database, add_database_entry, get_database_entries, agent_chat, research_and_create_page, create_project_plan, index_notion_workspace, get_available_agents");
console.error("⚠️  To use these tools, make sure to set your NOTION_API_KEY environment variable!"); 
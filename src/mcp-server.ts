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

// Helper function to check if Notion is configured
function checkNotionConfig() {
  if (!defaultNotionClient.isConfigured()) {
    throw new Error('❌ Notion API key not configured. Please set the NOTION_API_KEY environment variable with your Notion integration token.');
  }
}

// Create MCP server
const server = new McpServer({
  name: "notion-mcp-server",
  version: "1.0.0",
  description: "MCP server for Notion SDK operations"
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

// Start the server
const transport = new StdioServerTransport();
await server.connect(transport);

console.error("🚀 Notion MCP Server started successfully!");
console.error("📋 Available tools: create_notion_page, get_page_content, update_page_content, search_pages, create_database, add_database_entry, get_database_entries");
console.error("⚠️  To use these tools, make sure to set your NOTION_API_KEY environment variable!"); 
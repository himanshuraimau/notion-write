# Notion Write - Modular Notion SDK with MCP Server

A modular TypeScript/Bun application that provides both direct Notion SDK functions and MCP server tools for creating pages, databases, and managing content in your Notion workspace.

## 🏗️ Project Structure

```
├── src/
│   ├── types.ts           # TypeScript interfaces and types
│   ├── notion-client.ts   # Notion client management
│   ├── notion-functions.ts # Core Notion SDK functions
│   ├── mcp-server.ts      # MCP server with tools
│   └── index.ts           # Main exports
├── examples/
│   └── demo.ts            # Demo of modular functions
├── mcp-config.json        # MCP server configuration
└── package.json           # Dependencies and scripts
```

## 🚀 Setup

### 1. Install Dependencies
```bash
bun install
```

### 2. Get Your Notion API Key
1. Go to [https://www.notion.so/my-integrations](https://www.notion.so/my-integrations)
2. Create a new integration
3. Copy the "Internal Integration Token" (API key)

### 3. Set Environment Variables
Create a `.env` file in the project root:

```env
# Required: Your Notion API key
NOTION_API_KEY=your_notion_api_key_here

# Optional: Parent page ID where new pages will be created
NOTION_PARENT_PAGE_ID=your_parent_page_id_here
```

### 4. Share Your Notion Page/Database
1. In Notion, go to the page or database where you want to create new pages
2. Click "Share" in the top right
3. Click "Invite" and add your integration by name
4. Make sure it has "Can edit" permissions

## 📋 Usage Options

### Option 1: Use Modular Functions Directly

```typescript
import { createNotionPage, createDatabase, addDatabaseEntry } from './src/index.js';

// Create a page
const page = await createNotionPage({
  title: 'My New Page',
  content: 'This is the content of my page!',
  parentPageId: 'your-parent-page-id' // optional if set in .env
});

// Create a database
const database = await createDatabase('My Project Tracker');

// Add an entry to the database
await addDatabaseEntry(database.id, {
  title: 'Task 1',
  description: 'First task description',
  status: 'In Progress',
  priority: 'High',
  tags: ['Important', 'Work']
});
```

### Option 2: Run the MCP Server

```bash
# Start MCP server
bun run mcp-server

# Or with auto-reload for development
bun run mcp-dev
```

The MCP server exposes 7 tools:
- `create_notion_page` - Create pages with content
- `get_page_content` - Retrieve page content and blocks
- `update_page_content` - Add new content to existing pages
- `search_pages` - Search for pages in workspace
- `create_database` - Create databases with predefined properties
- `add_database_entry` - Add structured entries to databases
- `get_database_entries` - Query database entries

### Option 3: Run Examples

```bash
# Run the modular functions demo
bun run test-functions

# Run the original comprehensive demo
bun start
```

## 🛠️ Available Scripts

```bash
bun start           # Run original demo (index.ts)
bun dev             # Run with auto-reload
bun run mcp-server  # Start MCP server
bun run mcp-dev     # Start MCP server with auto-reload
bun run test-functions # Run modular functions demo
```

## 🏗️ Modular Architecture

### `src/types.ts`
Centralized TypeScript interfaces:
- `NotionPageData` - Page creation data
- `DatabaseEntry` - Database entry structure
- `PageSearchResult` - Search result format
- `DatabaseEntryResult` - Database query result
- `NotionConfig` - Client configuration

### `src/notion-client.ts`
Client management and configuration:
- `NotionClientManager` - Handles client initialization and config
- `defaultNotionClient` - Pre-configured default instance
- Environment variable handling
- Parent validation logic

### `src/notion-functions.ts`
Core Notion SDK operations:
- `createNotionPage()` - Create pages with rich content
- `getPageContent()` - Retrieve page data and blocks
- `updatePageContent()` - Add content to existing pages
- `searchPages()` - Search workspace pages
- `createDatabase()` - Create databases with properties
- `addDatabaseEntry()` - Add entries to databases
- `getDatabaseEntries()` - Query database entries

### `src/mcp-server.ts`
MCP server implementation:
- Exposes all functions as MCP tools
- Proper error handling and responses
- Zod schema validation
- JSON response formatting

## 🎯 Features

- ✅ **Modular Architecture** - Separation of concerns, easy to maintain
- ✅ **TypeScript Support** - Full type safety with interfaces
- ✅ **Dual Interface** - Use as functions OR MCP tools
- ✅ **Environment Variables** - Secure API key management
- ✅ **Error Handling** - Comprehensive error catching and reporting
- ✅ **Rich Content** - Multiple block types (paragraphs, headings, lists)
- ✅ **Database Operations** - Full CRUD operations with structured data
- ✅ **Search Functionality** - Workspace-wide page search
- ✅ **MCP Integration** - Ready-to-use MCP server
- ✅ **Examples & Demos** - Multiple usage examples

## 🔧 Configuration

### MCP Server Configuration (`mcp-config.json`)
```json
{
  "mcpServers": {
    "notion-mcp-server": {
      "command": "bun",
      "args": ["--env-file=.env", "run", "src/mcp-server.ts"],
      "env": {},
      "description": "MCP server for Notion SDK operations"
    }
  }
}
```

### Custom Client Configuration
```typescript
import { NotionClientManager } from './src/notion-client.js';

const customClient = new NotionClientManager({
  apiKey: 'your-custom-api-key',
  parentPageId: 'your-custom-parent-page-id'
});
```

## 🚨 Troubleshooting

### Common Issues

1. **"Unauthorized" Error**: Verify API key and integration permissions
2. **"Parent not found" Error**: Check parent page ID and integration access
3. **Module Import Errors**: Ensure you're using `.js` extensions in imports
4. **Environment Variables**: Verify `.env` file exists and contains required keys

### MCP Server Issues

#### "Connection closed" or "Failed to reload client" Error

This error occurs when the MCP server starts but immediately fails. Common causes:

1. **Missing Environment Variables**: 
   ```bash
   # Copy the example file and fill in your values
   cp .env.example .env
   # Edit .env with your actual Notion API key
   ```

2. **Invalid API Key**: 
   - Verify your API key is correct and active
   - Make sure you copied the entire key including the "secret_" prefix

3. **Permissions Issues**:
   - Ensure your Notion integration has access to the pages/databases you're trying to use
   - Go to your Notion page → Share → Add your integration

4. **Test the MCP Server**:
   ```bash
   # Test if the server starts without crashing
   bun run mcp-server
   
   # You should see:
   # 🚀 Notion MCP Server started successfully!
   # 📋 Available tools: create_notion_page, get_page_content, ...
   # ⚠️  To use these tools, make sure to set your NOTION_API_KEY environment variable!
   ```

#### MCP Server Configuration

Make sure your MCP client is configured to use the correct command:

```json
{
  "mcpServers": {
    "notion-mcp-server": {
      "command": "bun",
      "args": ["--env-file=.env", "run", "src/mcp-server.ts"],
      "cwd": "/path/to/your/notion-write-project",
      "env": {},
      "description": "MCP server for Notion SDK operations"
    }
  }
}
```

**Important**: Make sure the `cwd` points to your project directory containing the `src/` folder and `.env` file.

## 🏆 Benefits of Modular Architecture

- **Maintainability**: Each module has a single responsibility
- **Testability**: Functions can be tested independently
- **Reusability**: Import only what you need
- **Scalability**: Easy to add new features without affecting existing code
- **Type Safety**: Strong typing across all modules
- **Flexibility**: Use as library functions or MCP tools

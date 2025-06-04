# Installation & Setup Guide

Get up and running with Notion Write in minutes. This guide covers everything from basic installation to advanced configuration.

## 📋 Prerequisites

### Required
- **Node.js**: Version 18 or higher
- **Bun**: Latest version (recommended) or npm/yarn
- **Notion Account**: With integration access
- **OpenAI Account**: For AI agents (API key required)

### Optional
- **Docker**: For ChromaDB setup (recommended for production)
- **Git**: For version control

## 🚀 Quick Start

### 1. Install Dependencies

```bash
# Clone or download the project
git clone <your-repo-url>
cd notion-write

# Install dependencies with Bun (recommended)
bun install

# Or with npm/yarn
npm install
# yarn install
```

### 2. Environment Setup

```bash
# Copy environment template
cp env.example .env

# Edit with your credentials
nano .env
```

**Required Environment Variables:**
```env
# Notion API Configuration
NOTION_API_KEY=your_notion_api_key_here
NOTION_PARENT_PAGE_ID=your_parent_page_id_here

# OpenAI API Configuration (for AI agents)
OPENAI_API_KEY=your_openai_api_key_here
```

### 3. Get API Keys

#### Notion API Key
1. Go to [https://www.notion.so/my-integrations](https://www.notion.so/my-integrations)
2. Click "New integration"
3. Name your integration (e.g., "Notion Write")
4. Select your workspace
5. Copy the "Internal Integration Token"

#### OpenAI API Key
1. Go to [https://platform.openai.com/api-keys](https://platform.openai.com/api-keys)
2. Click "Create new secret key"
3. Copy the generated key

### 4. Configure Notion Permissions

**Share Your Workspace:**
1. In Notion, go to the page where you want to create content
2. Click "Share" in the top right
3. Click "Invite" and add your integration by name
4. Ensure it has "Can edit" permissions

**Get Parent Page ID (Optional):**
1. Open your target Notion page
2. Copy the page ID from the URL:
   ```
   https://notion.so/My-Page-a1b2c3d4e5f6...
                           ^^^^^^^^^^^^^^^^ (this part)
   ```

### 5. Verify Installation

```bash
# Test basic functionality
bun run test-functions

# Test AI agents (requires OpenAI API key)
bun run test-agents

# Start MCP server
bun run mcp-server
```

## 🔧 Advanced Setup

### ChromaDB Configuration

**Option 1: Docker (Recommended)**
```bash
# Run ChromaDB server
docker run -p 8000:8000 chromadb/chroma

# Verify connection
curl http://localhost:8000/api/v1/heartbeat
```

**Option 2: Local Installation**
```bash
# Install ChromaDB
pip install chromadb

# Run server
chroma run --host localhost --port 8000
```

### Development Environment

**TypeScript Development:**
```bash
# Enable development mode with auto-reload
bun run dev

# Type checking
npx tsc --noEmit

# Linting (if configured)
npx eslint src/
```

**MCP Development:**
```bash
# Start MCP server with auto-reload
bun run mcp-dev

# Test MCP tools
# (Configure your MCP client to connect to localhost)
```

## 📦 Deployment Options

### Local Deployment
```bash
# Production build
bun run build

# Start production server
bun start
```

### Docker Deployment
```dockerfile
FROM oven/bun:1 as base
WORKDIR /app

# Install dependencies
COPY package.json bun.lock ./
RUN bun install --frozen-lockfile

# Copy source
COPY . .

# Expose MCP server port
EXPOSE 3000

CMD ["bun", "run", "mcp-server"]
```

### Cloud Deployment

**Railway/Render/Vercel:**
1. Connect your repository
2. Set environment variables
3. Configure build command: `bun install`
4. Configure start command: `bun run mcp-server`

## 🧪 Testing Your Setup

### Basic Functionality Test
```bash
# Test Notion functions
bun run test-functions
```

**Expected Output:**
```
✅ Notion client configured successfully
✅ Created test page
✅ Created test database
✅ Added database entry
```

### AI Agents Test
```bash
# Test agent system
bun run test-agents
```

**Expected Output:**
```
🤖 Initializing Agent Manager...
✅ RAG System initialized successfully
✅ Initialized 2 agents successfully
📚 Indexing Notion workspace...
✅ Indexed X Notion pages
```

### MCP Server Test
```bash
# Start MCP server
bun run mcp-server
```

**Expected Output:**
```
🚀 Notion MCP Server started successfully!
📋 Available tools: create_notion_page, agent_chat, ...
⚠️  To use these tools, make sure to set your NOTION_API_KEY environment variable!
```

## 🚨 Troubleshooting

### Common Issues

**"Module not found" errors:**
```bash
# Clear and reinstall dependencies
rm -rf node_modules bun.lock
bun install
```

**"Unauthorized" Notion errors:**
```bash
# Verify API key
echo $NOTION_API_KEY

# Check integration permissions in Notion
# Ensure integration is added to your workspace
```

**ChromaDB connection errors:**
```bash
# Check if ChromaDB is running
curl http://localhost:8000/api/v1/heartbeat

# Start ChromaDB if not running
docker run -p 8000:8000 chromadb/chroma
```

**OpenAI API errors:**
```bash
# Verify API key
echo $OPENAI_API_KEY

# Check API key validity
curl https://api.openai.com/v1/models \
  -H "Authorization: Bearer $OPENAI_API_KEY"
```

### Performance Optimization

**Large Workspaces:**
- Index incrementally: `await ragSystem.indexNotionWorkspace()`
- Use batch processing for initial setup
- Monitor ChromaDB memory usage

**API Rate Limits:**
- Implement exponential backoff
- Cache frequent requests
- Use batch operations where possible

### Environment Specific Issues

**Windows:**
```bash
# Use PowerShell or Git Bash
# Set environment variables differently
set NOTION_API_KEY=your_key_here
```

**macOS/Linux:**
```bash
# Add to shell profile for persistence
echo 'export NOTION_API_KEY=your_key_here' >> ~/.bashrc
source ~/.bashrc
```

## ✅ Verification Checklist

Before proceeding to usage:

- [ ] Dependencies installed successfully
- [ ] Environment variables configured
- [ ] Notion integration created and shared
- [ ] OpenAI API key valid
- [ ] ChromaDB running (for RAG features)
- [ ] Basic tests passing
- [ ] MCP server starting without errors

## 🔄 Updates & Maintenance

**Keep Dependencies Updated:**
```bash
# Check for updates
bun outdated

# Update dependencies
bun update
```

**Monitor API Usage:**
- Track OpenAI API usage in dashboard
- Monitor Notion API rate limits
- Review ChromaDB performance metrics

**Backup Configuration:**
```bash
# Export environment variables
env | grep -E "(NOTION|OPENAI)" > backup.env

# Backup ChromaDB data
docker cp chromadb:/data ./chromadb-backup
```

Your installation is now complete! Proceed to the [Quick Start Guide](./quick-start.md) for usage examples. 
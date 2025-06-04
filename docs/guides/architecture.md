# System Architecture

An overview of the Notion Write system architecture, component interactions, and design patterns.

## 🏗️ High-Level Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    Client Layer                         │
├─────────────────┬─────────────────┬─────────────────────┤
│   MCP Client    │  Direct Usage   │  Custom Apps        │
│   (Claude/etc)  │  (TypeScript)   │  (Your Projects)    │
└─────────────────┴─────────────────┴─────────────────────┘
                          │
┌─────────────────────────────────────────────────────────┐
│                    MCP Server                           │
│  ┌─────────────────────────────────────────────────┐   │
│  │               Tool Router                       │   │
│  │  • agent_chat                                   │   │
│  │  • research_and_create_page                     │   │
│  │  • create_project_plan                          │   │
│  │  • create_notion_page                           │   │
│  │  • ... (12 total tools)                        │   │
│  └─────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────┘
                          │
┌─────────────────────────────────────────────────────────┐
│                 Agent Manager                           │
│  ┌─────────────────┐    ┌─────────────────────────┐    │
│  │ Message Router  │    │ Context Manager        │    │
│  │ • Intent        │    │ • Conversation         │    │
│  │   Classification│    │   History              │    │
│  │ • Agent         │    │ • RAG Context          │    │
│  │   Selection     │    │ • Session State        │    │
│  └─────────────────┘    └─────────────────────────┘    │
└─────────────────────────────────────────────────────────┘
                          │
┌─────────────────────────────────────────────────────────┐
│                   Agent Layer                           │
│ ┌─────────────────┐ ┌─────────────────┐ ┌─────────────┐ │
│ │ Content Research│ │ Task Planning   │ │   Future    │ │
│ │     Agent       │ │     Agent       │ │   Agents    │ │
│ │                 │ │                 │ │             │ │
│ │ • Web Search    │ │ • Project       │ │ • Content   │ │
│ │ • RAG Query     │ │   Breakdown     │ │   Enhancement│ │
│ │ • Content       │ │ • Timeline      │ │ • Analytics │ │
│ │   Generation    │ │   Creation      │ │ • Intelligence│ │
│ │ • Page Creation │ │ • Database      │ │             │ │
│ │                 │ │   Setup         │ │             │ │
│ └─────────────────┘ └─────────────────┘ └─────────────┘ │
└─────────────────────────────────────────────────────────┘
                          │
┌─────────────────────────────────────────────────────────┐
│                 Intelligence Layer                      │
│ ┌─────────────────┐ ┌─────────────────┐ ┌─────────────┐ │
│ │   RAG System    │ │    OpenAI API   │ │ Web Search  │ │
│ │                 │ │                 │ │             │ │
│ │ • ChromaDB      │ │ • GPT-4         │ │ • DuckDuckGo│ │
│ │ • Embeddings    │ │ • Embeddings    │ │ • Content   │ │
│ │ • Vector Search │ │ • Completions   │ │   Extraction│ │
│ │ • Context       │ │ • Function      │ │ • Result    │ │
│ │   Building      │ │   Calling       │ │   Parsing   │ │
│ └─────────────────┘ └─────────────────┘ └─────────────┘ │
└─────────────────────────────────────────────────────────┘
                          │
┌─────────────────────────────────────────────────────────┐
│                  Data Layer                             │
│ ┌─────────────────┐ ┌─────────────────┐ ┌─────────────┐ │
│ │  Notion API     │ │ ChromaDB Store  │ │ Local Cache │ │
│ │                 │ │                 │ │             │ │
│ │ • Pages         │ │ • Vector Store  │ │ • Embeddings│ │
│ │ • Databases     │ │ • Metadata      │ │ • Responses │ │
│ │ • Blocks        │ │ • Collections   │ │ • Context   │ │
│ │ • Properties    │ │                 │ │             │ │
│ └─────────────────┘ └─────────────────┘ └─────────────┘ │
└─────────────────────────────────────────────────────────┘
```

## 🧩 Core Components

### 1. MCP Server (`src/mcp-server.ts`)

**Purpose**: Provides standardized tool interface for AI assistants

**Key Features**:
- 12 tool endpoints for various operations
- Zod schema validation
- Error handling and response formatting
- Integration with agent manager and direct functions

**Tool Categories**:
```typescript
// Agent tools
agent_chat
research_and_create_page  
create_project_plan
index_notion_workspace
get_workspace_context

// Direct Notion tools
create_notion_page
get_page_content
update_page_content
search_pages
create_database
add_database_entry
get_database_entries
```

### 2. Agent Manager (`src/agent-manager.ts`)

**Purpose**: Orchestrates AI agents with intelligent routing and context management

**Core Responsibilities**:
- **Intent Classification**: Analyze incoming messages to determine user intent
- **Agent Selection**: Route requests to appropriate specialized agents
- **Context Management**: Maintain conversation state and history
- **Response Coordination**: Aggregate results from multiple sources

**Key Algorithms**:
```typescript
// Intent classification using keyword matching + context
classifyIntent(message: string, context: AgentContext): AgentType {
  const keywords = this.extractKeywords(message);
  const contextScore = this.scoreContext(context);
  const agentScores = this.scoreAgents(keywords, contextScore);
  
  return this.selectBestAgent(agentScores);
}
```

### 3. Base Agent (`src/agents/base-agent.ts`)

**Purpose**: Abstract foundation for all specialized agents

**Common Functionality**:
- OpenAI integration for LLM interactions
- RAG system integration for context retrieval
- Conversation context management
- Response formatting and action tracking

**Agent Lifecycle**:
```typescript
abstract class BaseAgent {
  // 1. Context preparation
  protected async prepareContext(task: AgentTask): Promise<AgentContext>
  
  // 2. RAG context retrieval
  protected async getRAGContext(query: string): Promise<string>
  
  // 3. Core execution (implemented by subclasses)
  abstract async execute(task: AgentTask, context: AgentContext): Promise<any>
  
  // 4. Response formatting
  protected formatResponse(result: any, context: AgentContext): AgentResponse
}
```

### 4. RAG System (`src/rag-system.ts`)

**Purpose**: Retrieval-Augmented Generation for contextual responses

**Architecture Components**:

**Vector Database (ChromaDB)**:
```typescript
interface RAGDocument {
  id: string;
  content: string;
  metadata: {
    title: string;
    type: 'notion' | 'web' | 'document';
    url?: string;
    lastModified?: Date;
  };
  embedding: number[];  // 1536-dimensional vector
}
```

**Search Pipeline**:
```typescript
searchKnowledge(query: string, limit: number = 5): Promise<RAGResult[]> {
  // 1. Generate query embedding
  const queryEmbedding = await this.generateEmbedding(query);
  
  // 2. Vector similarity search
  const results = await this.chromaClient.query({
    queryEmbeddings: [queryEmbedding],
    nResults: limit
  });
  
  // 3. Post-process and rank
  return this.rankResults(results, query);
}
```

### 5. Specialized Agents

#### Content Research Agent (`src/agents/content-research-agent.ts`)

**Pipeline**:
1. **Query Analysis**: Extract research topics and requirements
2. **Multi-source Research**: Query RAG system + web search
3. **Content Synthesis**: Combine information from multiple sources
4. **Structure Generation**: Create well-organized content structure
5. **Page Creation**: Generate Notion pages with proper formatting

**Implementation Pattern**:
```typescript
async researchTopic(topic: string, depth: 'brief' | 'comprehensive'): Promise<ResearchResult> {
  // 1. Get existing knowledge from workspace
  const ragContext = await this.ragSystem.getContextForQuery(topic);
  
  // 2. Perform web search for current information
  const webResults = await this.searchWeb(topic);
  
  // 3. Synthesize information
  const synthesis = await this.synthesizeContent(ragContext, webResults, depth);
  
  // 4. Create structured content
  return this.createStructuredContent(synthesis);
}
```

#### Task Planning Agent (`src/agents/task-planning-agent.ts`)

**Planning Process**:
1. **Project Analysis**: Understand scope, requirements, constraints
2. **Decomposition**: Break complex projects into manageable tasks
3. **Timeline Generation**: Create realistic schedules and milestones
4. **Dependency Mapping**: Identify task relationships and critical paths
5. **Database Creation**: Set up Notion databases for tracking

**Planning Algorithm**:
```typescript
async planProject(description: string): Promise<ProjectPlan> {
  // 1. Analyze project scope and complexity
  const analysis = await this.analyzeProject(description);
  
  // 2. Generate task breakdown structure
  const tasks = await this.generateTasks(analysis);
  
  // 3. Create timeline and dependencies
  const timeline = await this.createTimeline(tasks);
  
  // 4. Set up tracking infrastructure
  const database = await this.createProjectDatabase(tasks);
  
  return { analysis, tasks, timeline, database };
}
```

## 🔄 Data Flow

### 1. Request Processing Flow

```
User Message → MCP Server → Agent Manager → Agent Router
                                ↓
RAG Context ← RAG System ← Intent Classifier
                                ↓
Selected Agent ← Agent Registry ← Confidence Scorer
                                ↓
Agent Execution → OpenAI API → Content Generation
                                ↓
Notion Actions → Notion API → Page/Database Creation
                                ↓
Response Assembly ← Action Results ← Formatted Response
```

### 2. Context Management Flow

```
Conversation Start → Context Initialization → Session Creation
                                ↓
Message Processing → Context Enrichment → RAG Query
                                ↓
Agent Response → Context Update → History Append
                                ↓
Suggestion Generation → Context Analysis → Next Action Hints
```

### 3. RAG Indexing Flow

```
Notion Workspace → Page Enumeration → Content Extraction
                                ↓
Text Processing → Chunk Creation → Embedding Generation
                                ↓
Vector Storage → ChromaDB Insert → Metadata Association
                                ↓
Index Completion → Search Readiness → Query Availability
```

## 🎯 Design Patterns

### 1. Strategy Pattern - Agent Selection

```typescript
interface AgentSelectionStrategy {
  selectAgent(message: string, context: AgentContext): AgentType;
}

class KeywordBasedSelection implements AgentSelectionStrategy {
  selectAgent(message: string, context: AgentContext): AgentType {
    // Implementation for keyword-based routing
  }
}

class MLBasedSelection implements AgentSelectionStrategy {
  selectAgent(message: string, context: AgentContext): AgentType {
    // Implementation for ML-based routing
  }
}
```

### 2. Chain of Responsibility - Request Processing

```typescript
abstract class RequestHandler {
  protected nextHandler?: RequestHandler;
  
  setNext(handler: RequestHandler): RequestHandler {
    this.nextHandler = handler;
    return handler;
  }
  
  async handle(request: AgentRequest): Promise<AgentResponse> {
    const result = await this.process(request);
    if (result || !this.nextHandler) {
      return result;
    }
    return this.nextHandler.handle(request);
  }
  
  protected abstract process(request: AgentRequest): Promise<AgentResponse | null>;
}
```

### 3. Observer Pattern - Context Updates

```typescript
interface ContextObserver {
  onContextUpdate(context: AgentContext): void;
}

class ContextManager {
  private observers: ContextObserver[] = [];
  
  subscribe(observer: ContextObserver): void {
    this.observers.push(observer);
  }
  
  updateContext(context: AgentContext): void {
    this.observers.forEach(observer => observer.onContextUpdate(context));
  }
}
```

### 4. Factory Pattern - Agent Creation

```typescript
class AgentFactory {
  static createAgent(type: AgentType, config: AgentConfig): BaseAgent {
    switch (type) {
      case 'content-research':
        return new ContentResearchAgent(config.openaiKey, config.ragSystem);
      case 'task-planning':
        return new TaskPlanningAgent(config.openaiKey, config.ragSystem);
      default:
        throw new Error(`Unknown agent type: ${type}`);
    }
  }
}
```

## 🔧 Configuration Management

### Environment-Based Configuration

```typescript
interface SystemConfig {
  notion: {
    apiKey: string;
    parentPageId?: string;
  };
  openai: {
    apiKey: string;
    model: string;
    maxTokens: number;
  };
  rag: {
    chromaUrl: string;
    collectionName: string;
    embeddingModel: string;
  };
  agents: {
    maxConversationHistory: number;
    confidenceThreshold: number;
    enableSuggestions: boolean;
  };
}
```

### Runtime Configuration

```typescript
class ConfigManager {
  private config: SystemConfig;
  
  constructor() {
    this.config = this.loadConfig();
  }
  
  private loadConfig(): SystemConfig {
    return {
      notion: {
        apiKey: process.env.NOTION_API_KEY!,
        parentPageId: process.env.NOTION_PARENT_PAGE_ID
      },
      openai: {
        apiKey: process.env.OPENAI_API_KEY!,
        model: process.env.OPENAI_MODEL || 'gpt-4',
        maxTokens: parseInt(process.env.OPENAI_MAX_TOKENS || '4000')
      },
      // ... other config
    };
  }
}
```

## 📊 Performance Considerations

### 1. Caching Strategy

**Multi-Level Caching**:
- **L1 (Memory)**: Recent responses and embeddings
- **L2 (Local Storage)**: ChromaDB vector cache
- **L3 (Persistent)**: Notion content cache

### 2. Rate Limiting

**OpenAI API Limits**:
```typescript
class RateLimiter {
  private requestQueue: Promise<any>[] = [];
  private maxConcurrent = 5;
  private requestDelay = 1000; // 1 second between requests
  
  async throttle<T>(fn: () => Promise<T>): Promise<T> {
    while (this.requestQueue.length >= this.maxConcurrent) {
      await Promise.race(this.requestQueue);
    }
    
    const promise = fn();
    this.requestQueue.push(promise);
    
    promise.finally(() => {
      const index = this.requestQueue.indexOf(promise);
      this.requestQueue.splice(index, 1);
    });
    
    return promise;
  }
}
```

### 3. Memory Management

**Context Trimming**:
```typescript
class ContextManager {
  private maxHistoryLength = 50;
  
  trimContext(context: AgentContext): AgentContext {
    if (context.conversationHistory.length > this.maxHistoryLength) {
      // Keep recent interactions and important context
      const recent = context.conversationHistory.slice(-20);
      const important = this.extractImportantContext(context.conversationHistory);
      
      context.conversationHistory = [...important, ...recent];
    }
    
    return context;
  }
}
```

## 🔮 Extensibility

### Adding New Agents

1. **Create Agent Class**:
```typescript
export class CustomAgent extends BaseAgent {
  constructor(openaiApiKey: string, ragSystem: RAGSystem) {
    super(openaiApiKey, ragSystem, 'custom', systemPrompt);
  }
  
  async execute(task: AgentTask, context: AgentContext): Promise<any> {
    // Implementation
  }
}
```

2. **Register with Manager**:
```typescript
class AgentManager {
  private initializeAgents(): void {
    this.agents.set('custom', new CustomAgent(this.openaiApiKey, this.ragSystem));
  }
}
```

3. **Add MCP Tool**:
```typescript
{
  name: 'custom_agent_action',
  description: 'Perform custom agent action',
  inputSchema: customSchema,
  handler: async (args) => {
    return this.agentManager.executeDirectly('custom', args);
  }
}
```

This architecture provides a solid foundation for building intelligent, contextual AI agents while maintaining flexibility for future enhancements and customizations. 
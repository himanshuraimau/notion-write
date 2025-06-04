# Agent Manager API Reference

The `AgentManager` is the central orchestrator for all AI agents in the system. It provides intelligent routing, context management, and conversation state handling.

## Constructor

```typescript
new AgentManager(openaiApiKey: string, ragSystem?: RAGSystem)
```

**Parameters:**
- `openaiApiKey` (string): Your OpenAI API key
- `ragSystem` (RAGSystem, optional): RAG system instance for context retrieval

**Example:**
```typescript
import { AgentManager } from './src/agent-manager.js';
import { RAGSystem } from './src/rag-system.js';

const ragSystem = new RAGSystem(openaiApiKey);
const manager = new AgentManager(openaiApiKey, ragSystem);
```

## Methods

### initialize()

Initializes the agent manager and all registered agents.

```typescript
async initialize(): Promise<void>
```

**Example:**
```typescript
await manager.initialize();
console.log("Agent Manager ready");
```

### chat()

Main interface for interacting with agents. Automatically routes messages to appropriate agents.

```typescript
async chat(message: string): Promise<AgentResponse>
```

**Parameters:**
- `message` (string): User message or instruction

**Returns:**
- `AgentResponse`: Structured response with content, agent info, and actions

**Response Structure:**
```typescript
interface AgentResponse {
  response: string;           // Main response content
  agentType: AgentType;      // Which agent handled the request
  confidence: number;        // Routing confidence (0-1)
  actions: AgentAction[];    // Actions taken (page creation, etc.)
  suggestions: string[];     // Suggested follow-up actions
  context: AgentContext;     // Conversation context
  citations: string[];       // Source citations (for research)
}
```

**Examples:**

*Research Request:*
```typescript
const response = await manager.chat(
  "Research artificial intelligence trends in 2024"
);

console.log(response.response);     // Research summary
console.log(response.agentType);    // "content-research"
console.log(response.actions);      // [{ type: "page_created", pageId: "..." }]
console.log(response.citations);    // Source URLs and references
```

*Project Planning:*
```typescript
const response = await manager.chat(
  "Create a project plan for developing a mobile app"
);

console.log(response.response);     // Project breakdown
console.log(response.agentType);    // "task-planning"
console.log(response.actions);      // [{ type: "database_created", ... }]
```

*Follow-up Questions:*
```typescript
// Initial question
await manager.chat("Tell me about React");

// Follow-up (maintains context)
const response = await manager.chat("How does it compare to Vue?");
console.log(response.context.conversationHistory);
```

### getAvailableAgents()

Returns list of registered and available agents.

```typescript
getAvailableAgents(): AgentType[]
```

**Returns:**
- Array of agent type strings

**Example:**
```typescript
const agents = manager.getAvailableAgents();
console.log(agents); // ["content-research", "task-planning"]
```

### getConversationHistory()

Retrieves current conversation context and history.

```typescript
getConversationHistory(): ConversationTurn[]
```

**Returns:**
- Array of conversation turns with user messages and agent responses

**Example:**
```typescript
const history = manager.getConversationHistory();
history.forEach(turn => {
  console.log(`User: ${turn.userMessage}`);
  console.log(`Agent: ${turn.agentResponse.response}`);
});
```

### clearConversation()

Clears conversation history and resets context.

```typescript
clearConversation(): void
```

**Example:**
```typescript
manager.clearConversation();
console.log("Conversation reset");
```

### executeDirectly()

Execute a specific agent directly, bypassing automatic routing.

```typescript
async executeDirectly(
  agentType: AgentType, 
  task: AgentTask, 
  context?: AgentContext
): Promise<AgentResponse>
```

**Parameters:**
- `agentType`: Specific agent to use
- `task`: Task definition
- `context`: Optional custom context

**Example:**
```typescript
const response = await manager.executeDirectly(
  'content-research',
  {
    type: 'research',
    description: 'Research blockchain technology',
    parameters: { depth: 'comprehensive' }
  }
);
```

### generateSuggestions()

Get contextual suggestions for next actions based on conversation.

```typescript
async generateSuggestions(context: AgentContext): Promise<string[]>
```

**Parameters:**
- `context`: Current conversation context

**Returns:**
- Array of suggested follow-up actions

**Example:**
```typescript
const context = manager.getConversationHistory();
const suggestions = await manager.generateSuggestions(context);

suggestions.forEach(suggestion => {
  console.log(`💡 ${suggestion}`);
});
```

## Agent Routing

The Agent Manager automatically routes messages to appropriate agents based on content analysis.

### Routing Logic

| Message Content | Selected Agent | Confidence Factors |
|----------------|----------------|-------------------|
| "research", "information", "learn" | Content Research | High for information gathering |
| "plan", "project", "tasks" | Task Planning | High for planning activities |
| "search", "find", "show" | Notion Intelligence | High for workspace queries |
| "improve", "enhance", "better" | Content Enhancement | High for content improvement |
| "organize", "structure", "database" | Database Architect | High for data organization |

### Routing Examples

```typescript
// Routes to Content Research Agent
await manager.chat("Research machine learning algorithms");

// Routes to Task Planning Agent  
await manager.chat("Plan a software development project");

// Routes to Notion Intelligence Agent
await manager.chat("Find all pages about Python");

// Ambiguous - uses confidence scoring
await manager.chat("Help me with my project");
```

### Custom Routing

Override automatic routing for specific use cases:

```typescript
// Force specific agent
const response = await manager.executeDirectly(
  'content-research',
  {
    type: 'custom',
    description: 'Custom research task',
    parameters: { source: 'web-only' }
  }
);
```

## Context Management

### Conversation Context

The manager maintains conversation state including:

```typescript
interface AgentContext {
  conversationHistory: ConversationTurn[];
  currentTopic?: string;
  userIntent?: string;
  relevantDocuments: RAGResult[];
  previousActions: AgentAction[];
  sessionId: string;
  timestamp: Date;
}
```

### Context Usage

Agents use context to:
- Understand conversation flow
- Reference previous discussions
- Maintain topic coherence
- Provide relevant suggestions

**Example:**
```typescript
// Context builds over conversation
await manager.chat("I'm working on a mobile app");
await manager.chat("It's for fitness tracking");
await manager.chat("What features should I include?");
// Agent knows the context: mobile app for fitness tracking
```

## Error Handling

### Common Errors

**Agent Initialization Failed:**
```typescript
try {
  await manager.initialize();
} catch (error) {
  if (error.message.includes('OpenAI')) {
    console.error('Check OpenAI API key');
  }
}
```

**Agent Routing Failed:**
```typescript
const response = await manager.chat("ambiguous message");
if (response.confidence < 0.5) {
  console.warn('Low confidence routing');
  // Consider asking for clarification
}
```

**RAG System Unavailable:**
```typescript
// Manager gracefully handles missing RAG
const manager = new AgentManager(openaiApiKey); // No RAG system
await manager.initialize(); // Still works without RAG context
```

## Performance Optimization

### Caching

```typescript
// Agent responses are cached based on context
const response1 = await manager.chat("What is TypeScript?");
const response2 = await manager.chat("What is TypeScript?");
// Second call may use cached result if context is similar
```

### Batch Operations

```typescript
// Process multiple messages efficiently
const messages = [
  "Research topic A",
  "Research topic B", 
  "Research topic C"
];

const responses = await Promise.all(
  messages.map(msg => manager.chat(msg))
);
```

### Resource Management

```typescript
// Monitor token usage
const response = await manager.chat("complex research request");
console.log(`Tokens used: ${response.context.tokensUsed}`);

// Clear conversation to save memory
if (manager.getConversationHistory().length > 50) {
  manager.clearConversation();
}
```

## Configuration

### Agent Configuration

Customize agent behavior:

```typescript
const manager = new AgentManager(openaiApiKey, ragSystem, {
  maxConversationHistory: 20,
  defaultConfidenceThreshold: 0.7,
  enableSuggestions: true,
  cacheDurationMs: 300000 // 5 minutes
});
```

### Advanced Options

```typescript
interface AgentManagerConfig {
  maxConversationHistory?: number;
  defaultConfidenceThreshold?: number;
  enableSuggestions?: boolean;
  cacheDurationMs?: number;
  maxTokensPerAgent?: number;
  fallbackAgent?: AgentType;
}
```

## Events and Hooks

### Event Listeners

```typescript
// Listen for agent events
manager.on('agentResponse', (response) => {
  console.log(`Agent ${response.agentType} responded`);
});

manager.on('routingDecision', (decision) => {
  console.log(`Routed to ${decision.selectedAgent} with confidence ${decision.confidence}`);
});
```

### Lifecycle Hooks

```typescript
// Pre/post processing hooks
manager.beforeChat = async (message) => {
  console.log(`Processing: ${message}`);
  return message; // Can modify message
};

manager.afterChat = async (response) => {
  console.log(`Response generated: ${response.response.length} chars`);
  return response; // Can modify response
};
```

The Agent Manager provides a powerful, flexible interface for orchestrating AI agents while maintaining simplicity for basic use cases. 
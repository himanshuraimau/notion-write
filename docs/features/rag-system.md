# RAG System Documentation

Retrieval-Augmented Generation (RAG) is a core component that enhances AI agents with contextual knowledge from your Notion workspace and external sources.

## 🧠 What is RAG?

RAG combines the power of:
- **Large Language Models (LLMs)** for text generation
- **Vector Databases** for semantic search
- **Your Knowledge Base** for contextual information

This enables agents to provide accurate, contextual responses based on your specific Notion workspace content.

## 🏗️ Architecture

### Vector Database (ChromaDB)
- **Storage**: Embeddings of all Notion page content
- **Search**: Semantic similarity matching
- **Persistence**: Local database for fast retrieval
- **Scalability**: Handles thousands of documents efficiently

### Embedding Model
- **Model**: OpenAI `text-embedding-3-small`
- **Dimensions**: 1536 dimensions
- **Performance**: Fast, accurate semantic understanding
- **Cost**: Optimized for frequent usage

### Knowledge Sources
1. **Notion Workspace**: All accessible pages and databases
2. **Web Search**: DuckDuckGo integration for external knowledge
3. **Document Upload**: Custom documents (planned feature)

## 🔄 RAG Workflow

```
User Query → Vector Search → Context Retrieval → LLM Generation → Response
     ↓              ↓              ↓              ↓              ↓
   "AI trends"   Find similar   Extract relevant  Generate with   Informed
                 content        passages          context         answer
```

### Step-by-Step Process

1. **Query Processing**: User input converted to embedding vector
2. **Similarity Search**: Find most relevant content in vector database
3. **Context Assembly**: Combine Notion + web results into context
4. **Response Generation**: LLM uses context to generate informed response
5. **Source Attribution**: Include citations and relevance scores

## 📊 Indexing System

### Automatic Workspace Indexing
```typescript
// Index entire Notion workspace
await ragSystem.indexNotionWorkspace();
```

**What gets indexed:**
- Page titles and content
- Block text content (paragraphs, headings, lists)
- Metadata (creation date, last edited, page relationships)
- Tags and properties

**Indexing Process:**
1. Fetch all accessible Notion pages
2. Extract text content from blocks
3. Generate embeddings for each page
4. Store in vector database with metadata

### Manual Document Addition
```typescript
// Add custom documents
await ragSystem.addDocument(
  "Custom content here",
  { title: "Custom Doc", type: "manual" },
  "document"
);
```

## 🔍 Search Capabilities

### Semantic Search
```typescript
// Find relevant content
const results = await ragSystem.searchKnowledge("machine learning", 5);
```

**Search Features:**
- **Semantic Understanding**: Finds conceptually related content
- **Relevance Scoring**: Orders results by similarity
- **Multi-source**: Searches both Notion and web content
- **Configurable Limits**: Control number of results returned

### Web Search Integration
```typescript
// Include web search in context
const context = await ragSystem.getContextForQuery("AI trends", true);
```

**Web Search Features:**
- **DuckDuckGo Integration**: Privacy-focused search
- **Content Extraction**: Clean text from search results
- **Source Attribution**: Track web sources
- **Fallback Handling**: Graceful degradation if web search fails

## 🎯 Context Building

### Context Assembly
The RAG system builds comprehensive context by:

1. **Notion Results**: Most relevant workspace content
2. **Web Results**: External knowledge and current information
3. **Source Mixing**: Balance internal and external sources
4. **Length Management**: Optimize context for token limits

### Context Structure
```
Based on the following information:

From your Notion workspace:
1. [Title] - [Relevant excerpt]...
2. [Title] - [Relevant excerpt]...

From web search:
1. [Title] - [Relevant excerpt]...
2. [Title] - [Relevant excerpt]...
```

## ⚙️ Configuration

### Vector Database Settings
```typescript
const ragSystem = new RAGSystem(openaiApiKey);

// ChromaDB configuration
- Host: localhost:8000 (default)
- Collection: notion-knowledge-base
- Distance Metric: Cosine similarity
```

### Search Parameters
```typescript
// Configurable search options
searchKnowledge(query, {
  limit: 5,           // Number of results
  threshold: 0.7,     // Minimum similarity score
  includeWeb: true,   // Web search toggle
  sources: ['notion', 'web', 'documents']
});
```

## 📈 Performance Optimization

### Caching Strategy
- **Embedding Cache**: Avoid re-computing embeddings
- **Result Cache**: Cache frequent queries
- **Context Cache**: Reuse assembled contexts

### Incremental Updates
```typescript
// Efficient re-indexing
await ragSystem.indexNotionWorkspace(); // Only new/changed content
await ragSystem.clearCollection();      // Full rebuild if needed
```

### Memory Management
- **Batch Processing**: Handle large workspaces efficiently
- **Lazy Loading**: Load embeddings on-demand
- **Cleanup**: Automatic removal of deleted content

## 🛠️ Integration Examples

### With Content Research Agent
```typescript
const agent = new ContentResearchAgent(openaiKey, ragSystem);

// Agent automatically uses RAG for research
const research = await agent.researchTopic("blockchain");
// Uses workspace knowledge + web search
```

### With Task Planning Agent
```typescript
const agent = new TaskPlanningAgent(openaiKey, ragSystem);

// Agent uses past project data for planning
const plan = await agent.planProject("mobile app development");
// Leverages similar projects from workspace
```

### Direct RAG Usage
```typescript
// Use RAG independently
const context = await ragSystem.getContextForQuery("project management");
const response = await openai.chat.completions.create({
  messages: [
    { role: "system", content: "You are a helpful assistant." },
    { role: "user", content: `${context.context}\n\nQuestion: How to manage projects effectively?` }
  ]
});
```

## 🔧 Advanced Features

### Custom Embeddings
```typescript
// Generate embeddings for custom content
const embedding = await ragSystem.generateEmbedding("Custom text");
```

### Multi-modal Support (Planned)
- **Image Analysis**: Extract text from images
- **PDF Processing**: Index PDF document content
- **Audio Transcription**: Convert audio to searchable text

### Real-time Updates
- **Webhook Integration**: Auto-update on Notion changes
- **Change Detection**: Track workspace modifications
- **Incremental Sync**: Efficient partial updates

## 📊 Monitoring & Analytics

### RAG Metrics
- **Query Performance**: Response times and accuracy
- **Index Health**: Coverage and freshness
- **Usage Patterns**: Most accessed content

### Quality Assurance
- **Relevance Scoring**: Automatic quality assessment
- **Source Verification**: Track information origins
- **Feedback Loop**: Improve results over time

## 🚨 Troubleshooting

### Common Issues

**ChromaDB Connection Errors**
```bash
# Start ChromaDB server
docker run -p 8000:8000 chromadb/chroma
```

**Indexing Failures**
```typescript
// Check API permissions
console.log(await ragSystem.searchPages("test"));

// Verify embeddings
const embedding = await ragSystem.generateEmbedding("test");
console.log(embedding.length); // Should be 1536
```

**Search Not Working**
```typescript
// Check collection status
const results = await ragSystem.searchKnowledge("anything");
console.log(results.length); // Should return results if indexed
```

### Performance Issues
- **Large Workspaces**: Consider batch indexing
- **Slow Queries**: Adjust search limits
- **Memory Usage**: Monitor ChromaDB resource usage

The RAG system forms the intelligent backbone of the agent system, enabling contextual and informed responses based on your specific knowledge base. 
# Agent Usage Examples

This guide provides practical examples of using the AI agents for content creation, project planning, and workspace management.

## 🤖 Getting Started with Agents

### Basic Setup

```typescript
import { AgentManager } from './src/agent-manager.js';

const manager = new AgentManager(process.env.OPENAI_API_KEY);
await manager.initialize();

console.log("Available agents:", manager.getAvailableAgents());
// Output: ["content-research", "task-planning"]
```

## 📚 Content Research Agent Examples

### 1. Technology Research

**Research emerging technologies:**
```typescript
const response = await manager.chat(
  "Research quantum computing breakthroughs in 2024 and create a comprehensive analysis page"
);

console.log(response.response);
// AI will create a detailed page with:
// - Current state of quantum computing
// - Recent breakthroughs and developments
// - Key players and companies
// - Future implications and timeline
// - Sources and citations
```

**Output Example:**
```
✅ Research completed on quantum computing
📄 Created page: "Quantum Computing Breakthroughs 2024"
🔗 Page URL: https://notion.so/Quantum-Computing-Breakthroughs-2024-...
📊 Sources: 8 research papers, 12 news articles, 3 company reports
```

### 2. Market Research

**Industry analysis:**
```typescript
const response = await manager.chat(
  "Analyze the current state of the AI assistant market, key players, and growth projections"
);

// Follow up with specific questions
await manager.chat("What are the main challenges facing this market?");
await manager.chat("Create a competitive analysis table");
```

### 3. Educational Content

**Learning materials:**
```typescript
// Create educational content
await manager.chat("Create a beginner's guide to React hooks with examples");

// Build upon previous content
await manager.chat("Add advanced patterns and best practices");
await manager.chat("Include common pitfalls and how to avoid them");
```

### 4. Technical Documentation

**API documentation:**
```typescript
const response = await manager.chat(
  "Research REST API best practices and create a comprehensive API design guide"
);

// Follow up with implementation details
await manager.chat("Add examples for each REST endpoint pattern");
await manager.chat("Include error handling and status code guidelines");
```

## 📋 Task Planning Agent Examples

### 1. Software Development Project

**Mobile app development:**
```typescript
const response = await manager.chat(
  "Create a comprehensive project plan for developing a fitness tracking mobile app"
);

console.log(response.response);
// AI will create:
// - Project phases and milestones
// - Detailed task breakdown
// - Timeline and dependencies
// - Resource requirements
// - Risk assessment
// - Notion database for tracking
```

**Project Plan Output:**
```
📱 Project: Fitness Tracking Mobile App
📅 Duration: 16 weeks
👥 Team Size: 5 developers

Phase 1: Planning & Design (Weeks 1-3)
- [ ] Market research and competitor analysis
- [ ] User persona development
- [ ] Feature specification
- [ ] UI/UX design and prototyping
- [ ] Technical architecture planning

Phase 2: Backend Development (Weeks 4-8)
- [ ] Database design and setup
- [ ] Authentication system
- [ ] User profile management
- [ ] Workout tracking API
- [ ] Progress analytics API

...
```

### 2. Event Planning

**Conference organization:**
```typescript
const response = await manager.chat(
  "Plan a 2-day tech conference for 500 attendees, including timeline, tasks, and vendor coordination"
);

// Drill down into specific areas
await manager.chat("Create detailed vendor management tasks");
await manager.chat("Add marketing and promotion timeline");
await manager.chat("Include day-of-event coordination checklist");
```

### 3. Product Launch

**SaaS product launch:**
```typescript
const response = await manager.chat(
  "Create a go-to-market strategy and launch plan for a new SaaS analytics platform"
);

// Expand on specific elements
await manager.chat("Detail the content marketing strategy");
await manager.chat("Create customer onboarding workflow");
await manager.chat("Add metrics and KPI tracking plan");
```

### 4. Research Project

**Academic research planning:**
```typescript
const response = await manager.chat(
  "Plan a 6-month research project on machine learning applications in healthcare"
);

// Add methodology details
await manager.chat("Create detailed methodology and data collection plan");
await manager.chat("Add literature review timeline and key papers to investigate");
```

## 🔗 Workflow Combinations

### Research-to-Planning Workflow

```typescript
// 1. Research the domain
let response = await manager.chat(
  "Research e-commerce best practices and current trends"
);

// 2. Plan based on research
response = await manager.chat(
  "Based on the research, create a project plan for building a modern e-commerce platform"
);

// 3. Create implementation guide
response = await manager.chat(
  "Create an implementation guide with technical specifications"
);
```

### Content Series Creation

```typescript
// Create a series of related content
const topics = [
  "Introduction to Machine Learning",
  "Supervised Learning Algorithms", 
  "Unsupervised Learning Techniques",
  "Deep Learning Fundamentals",
  "ML Model Deployment Strategies"
];

for (const topic of topics) {
  await manager.chat(`Research and create a comprehensive guide on: ${topic}`);
  
  // Brief pause to avoid rate limits
  await new Promise(resolve => setTimeout(resolve, 1000));
}

// Create an index page
await manager.chat("Create an index page linking all the ML guides we just created");
```

## 💬 Conversational Patterns

### Iterative Refinement

```typescript
// Start with broad request
await manager.chat("Research TypeScript best practices");

// Refine and expand
await manager.chat("Focus more on enterprise-level patterns");
await manager.chat("Add specific examples for large codebases");
await manager.chat("Include team collaboration guidelines");
await manager.chat("Create a checklist for code reviews");
```

### Context Building

```typescript
// Build context over multiple interactions
await manager.chat("I'm starting a new SaaS company");
await manager.chat("It's in the project management space");
await manager.chat("Our target market is remote development teams");
await manager.chat("Create a comprehensive business plan");
// Agent uses all previous context for the business plan
```

### Progressive Enhancement

```typescript
// Start with basic content
await manager.chat("Create a simple getting started guide for React");

// Progressively enhance
await manager.chat("Add intermediate concepts and patterns");
await manager.chat("Include advanced optimization techniques");
await manager.chat("Add troubleshooting section with common issues");
```

## 🎯 Specialized Use Cases

### 1. Competitive Analysis

```typescript
const response = await manager.chat(`
  Analyze the top 5 project management tools (Asana, Trello, Monday.com, ClickUp, Notion) 
  and create a detailed comparison with:
  - Feature matrix
  - Pricing analysis
  - User experience assessment
  - Market positioning
  - Strengths and weaknesses
`);
```

### 2. Technical Architecture Planning

```typescript
const response = await manager.chat(`
  Design a microservices architecture for a scalable e-commerce platform that handles:
  - User management
  - Product catalog
  - Order processing
  - Payment handling
  - Inventory management
  - Recommendation engine
  
  Include technology stack recommendations and deployment strategy.
`);
```

### 3. Learning Path Creation

```typescript
const response = await manager.chat(`
  Create a complete learning path for becoming a full-stack developer, including:
  - Prerequisites and foundational knowledge
  - Step-by-step curriculum
  - Recommended resources and courses
  - Practice projects for each level
  - Timeline and milestones
  - Assessment criteria
`);
```

## 🔧 Advanced Agent Techniques

### Custom Task Specification

```typescript
// Direct agent execution with custom parameters
const response = await manager.executeDirectly(
  'content-research',
  {
    type: 'research',
    description: 'Research blockchain consensus mechanisms',
    parameters: {
      depth: 'comprehensive',
      focus: 'technical',
      includeCode: true,
      sources: ['academic', 'technical-blogs']
    }
  }
);
```

### Context-Aware Planning

```typescript
// Use workspace context for planning
const ragContext = await ragSystem.getContextForQuery("previous mobile app projects");

const response = await manager.executeDirectly(
  'task-planning',
  {
    type: 'project-plan',
    description: 'Plan new mobile app based on previous project learnings',
    parameters: {
      includeContext: ragContext.context,
      avoidPreviousPitfalls: true
    }
  }
);
```

### Batch Processing

```typescript
// Process multiple research topics
const researchTopics = [
  "GraphQL vs REST APIs",
  "Microservices architecture patterns",
  "Container orchestration with Kubernetes",
  "Serverless computing best practices"
];

const responses = await Promise.all(
  researchTopics.map(topic => 
    manager.chat(`Research ${topic} and create a technical guide`)
  )
);

// Create summary page
await manager.chat(`
  Create a summary page linking to all the technical guides we just created:
  ${researchTopics.join(', ')}
`);
```

## 📊 Monitoring and Quality Assurance

### Response Quality Check

```typescript
const response = await manager.chat("Research blockchain technology");

// Check response quality
console.log(`Response confidence: ${response.confidence}`);
console.log(`Sources cited: ${response.citations.length}`);
console.log(`Actions taken: ${response.actions.length}`);

if (response.confidence < 0.8) {
  // Request more specific information
  await manager.chat("Please provide more detailed technical information");
}
```

### Usage Analytics

```typescript
// Track conversation patterns
const history = manager.getConversationHistory();
console.log(`Conversation length: ${history.length} turns`);

// Analyze agent usage
const agentUsage = history.reduce((acc, turn) => {
  acc[turn.agentResponse.agentType] = (acc[turn.agentResponse.agentType] || 0) + 1;
  return acc;
}, {});

console.log("Agent usage:", agentUsage);
```

## 🚨 Error Handling and Troubleshooting

### Graceful Error Handling

```typescript
try {
  const response = await manager.chat("Create a complex research project");
  
  if (response.actions.some(action => action.type === 'error')) {
    console.log("Some actions failed, but research completed");
    // Handle partial success
  }
} catch (error) {
  console.error("Agent execution failed:", error.message);
  
  // Retry with simpler request
  const response = await manager.chat("Provide a brief overview of the topic");
}
```

### Rate Limit Handling

```typescript
async function batchProcess(tasks: string[]) {
  const results = [];
  
  for (const task of tasks) {
    try {
      const response = await manager.chat(task);
      results.push(response);
      
      // Pause between requests to avoid rate limits
      await new Promise(resolve => setTimeout(resolve, 2000));
    } catch (error) {
      if (error.message.includes('rate limit')) {
        // Wait longer and retry
        await new Promise(resolve => setTimeout(resolve, 10000));
        const response = await manager.chat(task);
        results.push(response);
      } else {
        throw error;
      }
    }
  }
  
  return results;
}
```

These examples demonstrate the versatility and power of the AI agent system. Start with simple requests and gradually build more complex workflows as you become familiar with the capabilities. 
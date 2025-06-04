import type { AgentContext, AgentTask, AgentType, ChatMessage } from './types.js';
import { BaseAgent } from './agents/base-agent.js';
import { ContentResearchAgent } from './agents/content-research-agent.js';
import { TaskPlanningAgent } from './agents/task-planning-agent.js';
import { RAGSystem } from './rag-system.js';
import { v4 as uuidv4 } from 'uuid';

export class AgentManager {
  private agents: Map<AgentType, BaseAgent> = new Map();
  private ragSystem: RAGSystem;
  private openaiApiKey: string;
  private activeContexts: Map<string, AgentContext> = new Map();

  constructor(openaiApiKey: string) {
    this.openaiApiKey = openaiApiKey;
    this.ragSystem = new RAGSystem(openaiApiKey);
  }

  async initialize(): Promise<void> {
    console.log('🤖 Initializing Agent Manager...');
    
    try {
      // Initialize RAG system
      await this.ragSystem.initialize();
      
      // Initialize all agents
      this.agents.set('content-research', new ContentResearchAgent(this.openaiApiKey, this.ragSystem));
      this.agents.set('task-planning', new TaskPlanningAgent(this.openaiApiKey, this.ragSystem));
      
      // TODO: Add other agents as they are implemented
      // this.agents.set('notion-intelligence', new NotionIntelligenceAgent(this.openaiApiKey, this.ragSystem));
      // this.agents.set('content-enhancement', new ContentEnhancementAgent(this.openaiApiKey, this.ragSystem));
      // this.agents.set('database-architect', new DatabaseArchitectAgent(this.openaiApiKey, this.ragSystem));
      // this.agents.set('analytics', new AnalyticsAgent(this.openaiApiKey, this.ragSystem));

      console.log(`✅ Initialized ${this.agents.size} agents successfully`);
    } catch (error) {
      console.error('❌ Failed to initialize Agent Manager:', error);
      throw error;
    }
  }

  async indexNotionWorkspace(): Promise<void> {
    console.log('📚 Indexing Notion workspace for RAG system...');
    await this.ragSystem.indexNotionWorkspace();
  }

  createContext(userId?: string, sessionData: Record<string, any> = {}): AgentContext {
    const context: AgentContext = {
      conversationId: uuidv4(),
      userId,
      sessionData,
      previousMessages: []
    };

    this.activeContexts.set(context.conversationId, context);
    return context;
  }

  getContext(conversationId: string): AgentContext | undefined {
    return this.activeContexts.get(conversationId);
  }

  async executeTask(
    agentType: AgentType,
    task: AgentTask,
    context: AgentContext
  ): Promise<any> {
    const agent = this.agents.get(agentType);
    if (!agent) {
      throw new Error(`Agent of type '${agentType}' not found`);
    }

    console.log(`🎯 Executing ${agentType} task: ${task.description}`);
    
    try {
      const result = await agent.execute(task, context);
      
      // Update context
      this.activeContexts.set(context.conversationId, context);
      
      return result;
    } catch (error) {
      console.error(`❌ Failed to execute ${agentType} task:`, error);
      throw error;
    }
  }

  async chat(
    message: string,
    conversationId?: string,
    preferredAgent?: AgentType
  ): Promise<{
    response: string;
    agentUsed: AgentType;
    context: AgentContext;
    suggestions?: string[];
  }> {
    // Get or create context
    let context: AgentContext;
    if (conversationId && this.activeContexts.has(conversationId)) {
      context = this.activeContexts.get(conversationId)!;
    } else {
      context = this.createContext();
    }

    // Add user message to context
    context.previousMessages.push({
      role: 'user',
      content: message,
      timestamp: new Date()
    });

    // Determine which agent to use
    const agentType = preferredAgent || await this.determineBestAgent(message, context);
    
    const agent = this.agents.get(agentType);
    if (!agent) {
      throw new Error(`Agent of type '${agentType}' not available`);
    }

    try {
      // Create a chat task
      const task: AgentTask = {
        id: uuidv4(),
        type: agentType,
        description: `Chat: ${message}`,
        parameters: { message, chatMode: true },
        status: 'running',
        createdAt: new Date(),
        updatedAt: new Date()
      };

      // Generate response based on agent type
      let response: string;
      
      if (agentType === 'content-research') {
        const researchAgent = agent as ContentResearchAgent;
        if (message.toLowerCase().includes('research') || message.toLowerCase().includes('create page')) {
          // Handle research requests
          const topic = this.extractTopicFromMessage(message);
          const result = await researchAgent.researchTopic(topic, 'comprehensive', true, context);
          response = `I've researched "${topic}" for you. Here's what I found:\n\n${result.content.substring(0, 1000)}...\n\nFull research available with ${result.sources.length} sources.`;
        } else {
          response = await (agent as any).generateResponse(message, context, true, true);
        }
      } else if (agentType === 'task-planning') {
        const planningAgent = agent as TaskPlanningAgent;
        if (message.toLowerCase().includes('plan') || message.toLowerCase().includes('project')) {
          // Handle planning requests
          const projectDesc = this.extractProjectFromMessage(message);
          const result = await planningAgent.planProject(projectDesc, {}, context);
          response = `I've created a project plan for "${result.projectTitle}" with ${result.mainTasks.length} tasks. The plan includes timeline, dependencies, and resource allocation.`;
        } else {
          response = await (agent as any).generateResponse(message, context, true, false);
        }
      } else {
        // Default chat response
        response = await (agent as any).generateResponse(message, context, true, false);
      }

      // Add assistant response to context
      context.previousMessages.push({
        role: 'assistant',
        content: response,
        timestamp: new Date(),
        metadata: { agentType }
      });

      // Update context
      this.activeContexts.set(context.conversationId, context);

      // Generate suggestions for next actions
      const suggestions = await this.generateSuggestions(message, response, agentType, context);

      return {
        response,
        agentUsed: agentType,
        context,
        suggestions
      };

    } catch (error) {
      console.error('❌ Chat failed:', error);
      throw error;
    }
  }

  private async determineBestAgent(message: string, context: AgentContext): Promise<AgentType> {
    const lowerMessage = message.toLowerCase();

    // Simple keyword-based routing (could be enhanced with ML)
    if (lowerMessage.includes('research') || lowerMessage.includes('information') || lowerMessage.includes('learn about')) {
      return 'content-research';
    }
    
    if (lowerMessage.includes('plan') || lowerMessage.includes('project') || lowerMessage.includes('tasks') || lowerMessage.includes('timeline')) {
      return 'task-planning';
    }
    
    if (lowerMessage.includes('search') || lowerMessage.includes('find') || lowerMessage.includes('show me')) {
      return 'notion-intelligence';
    }
    
    if (lowerMessage.includes('improve') || lowerMessage.includes('enhance') || lowerMessage.includes('better')) {
      return 'content-enhancement';
    }
    
    if (lowerMessage.includes('database') || lowerMessage.includes('structure') || lowerMessage.includes('organize')) {
      return 'database-architect';
    }
    
    if (lowerMessage.includes('analytics') || lowerMessage.includes('insights') || lowerMessage.includes('trends')) {
      return 'analytics';
    }

    // Default to content research for general queries
    return 'content-research';
  }

  private extractTopicFromMessage(message: string): string {
    // Simple topic extraction - could be enhanced with NLP
    const words = message.toLowerCase().split(' ');
    const stopWords = ['research', 'about', 'tell', 'me', 'what', 'is', 'how', 'create', 'page', 'for'];
    const topicWords = words.filter(word => !stopWords.includes(word) && word.length > 2);
    return topicWords.slice(0, 3).join(' ') || 'general topic';
  }

  private extractProjectFromMessage(message: string): string {
    // Simple project extraction
    const words = message.toLowerCase().split(' ');
    const stopWords = ['plan', 'project', 'for', 'create', 'make', 'build', 'develop'];
    const projectWords = words.filter(word => !stopWords.includes(word) && word.length > 2);
    return projectWords.slice(0, 5).join(' ') || 'general project';
  }

  private async generateSuggestions(
    userMessage: string,
    response: string,
    agentType: AgentType,
    context: AgentContext
  ): Promise<string[]> {
    const suggestions: string[] = [];

    // Generate contextual suggestions based on agent type and conversation
    switch (agentType) {
      case 'content-research':
        suggestions.push(
          "Create a Notion page with this research",
          "Research related topics",
          "Get more detailed information",
          "Find recent updates on this topic"
        );
        break;
      
      case 'task-planning':
        suggestions.push(
          "Create a project database in Notion",
          "Generate timeline visualization",
          "Optimize task dependencies",
          "Estimate resource requirements"
        );
        break;
      
      default:
        suggestions.push(
          "Research this topic further",
          "Create a project plan",
          "Search existing Notion pages",
          "Get recommendations"
        );
    }

    return suggestions.slice(0, 3); // Return top 3 suggestions
  }

  getAvailableAgents(): AgentType[] {
    return Array.from(this.agents.keys());
  }

  getAgentInfo(agentType: AgentType): { type: AgentType; systemPrompt: string } | null {
    const agent = this.agents.get(agentType);
    if (!agent) return null;

    return {
      type: agent.getAgentType(),
      systemPrompt: agent.getSystemPrompt()
    };
  }

  async clearRAGSystem(): Promise<void> {
    await this.ragSystem.clearCollection();
  }

  clearContext(conversationId: string): void {
    this.activeContexts.delete(conversationId);
  }

  clearAllContexts(): void {
    this.activeContexts.clear();
  }
} 
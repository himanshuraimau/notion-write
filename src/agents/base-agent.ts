import OpenAI from 'openai';
import type { AgentContext, AgentTask, AgentType, ChatMessage } from '../types.js';
import { RAGSystem } from '../rag-system.js';
import { v4 as uuidv4 } from 'uuid';

export abstract class BaseAgent {
  protected openai: OpenAI;
  protected ragSystem: RAGSystem;
  protected agentType: AgentType;
  protected systemPrompt: string;
  
  constructor(
    openaiApiKey: string,
    ragSystem: RAGSystem,
    agentType: AgentType,
    systemPrompt: string
  ) {
    this.openai = new OpenAI({ apiKey: openaiApiKey });
    this.ragSystem = ragSystem;
    this.agentType = agentType;
    this.systemPrompt = systemPrompt;
  }

  abstract execute(task: AgentTask, context: AgentContext): Promise<any>;

  protected async generateResponse(
    userMessage: string, 
    context: AgentContext,
    includeRAG: boolean = true,
    includeWeb: boolean = false,
    temperature: number = 0.7
  ): Promise<string> {
    try {
      const messages: any[] = [
        { role: 'system', content: this.systemPrompt }
      ];

      // Add conversation history
      context.previousMessages.slice(-5).forEach(msg => {
        messages.push({
          role: msg.role,
          content: msg.content
        });
      });

      // Get RAG context if requested
      let ragContext = '';
      if (includeRAG) {
        const { context: retrievedContext } = await this.ragSystem.getContextForQuery(
          userMessage, 
          includeWeb
        );
        ragContext = retrievedContext;
      }

      // Add current message with context
      const messageWithContext = ragContext 
        ? `Context: ${ragContext}\n\nUser Query: ${userMessage}`
        : userMessage;

      messages.push({
        role: 'user',
        content: messageWithContext
      });

      const completion = await this.openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages,
        temperature,
        max_tokens: 2000
      });

      return completion.choices[0]?.message?.content || 'No response generated';
    } catch (error) {
      console.error(`Error generating response for ${this.agentType}:`, error);
      throw error;
    }
  }

  protected async generateStructuredResponse<T>(
    userMessage: string,
    context: AgentContext,
    responseSchema: any,
    includeRAG: boolean = true,
    includeWeb: boolean = false
  ): Promise<T> {
    try {
      const response = await this.generateResponse(
        userMessage,
        context,
        includeRAG,
        includeWeb,
        0.3 // Lower temperature for structured responses
      );

      // Parse the structured response
      return JSON.parse(response) as T;
    } catch (error) {
      console.error(`Error generating structured response for ${this.agentType}:`, error);
      throw error;
    }
  }

  protected createTask(
    description: string,
    parameters: Record<string, any> = {}
  ): AgentTask {
    return {
      id: uuidv4(),
      type: this.agentType,
      description,
      parameters,
      status: 'pending',
      createdAt: new Date(),
      updatedAt: new Date()
    };
  }

  protected updateTaskStatus(
    task: AgentTask,
    status: AgentTask['status'],
    result?: any,
    error?: string
  ): AgentTask {
    task.status = status;
    task.updatedAt = new Date();
    if (result !== undefined) task.result = result;
    if (error) task.error = error;
    return task;
  }

  protected addToConversation(
    context: AgentContext,
    role: 'user' | 'assistant',
    content: string,
    metadata?: Record<string, any>
  ): void {
    context.previousMessages.push({
      role,
      content,
      timestamp: new Date(),
      metadata
    });

    // Keep only last 20 messages to prevent context overflow
    if (context.previousMessages.length > 20) {
      context.previousMessages = context.previousMessages.slice(-20);
    }
  }

  getAgentType(): AgentType {
    return this.agentType;
  }

  getSystemPrompt(): string {
    return this.systemPrompt;
  }
} 
import { BaseAgent } from './base-agent.js';
import type { AgentContext, AgentTask, ResearchResult } from '../types.js';
import { RAGSystem } from '../rag-system.js';
import { createNotionPage, updatePageContent } from '../notion-functions.js';

export class ContentResearchAgent extends BaseAgent {
  constructor(openaiApiKey: string, ragSystem: RAGSystem) {
    const systemPrompt = `You are a Content Research Agent specialized in researching topics and creating comprehensive, well-structured content for Notion pages.

Your capabilities include:
- Conducting thorough research using available knowledge bases and web search
- Synthesizing information from multiple sources
- Creating structured, engaging content with proper formatting
- Ensuring accuracy and relevance of information
- Providing source citations and references

When conducting research:
1. Search through existing Notion workspace content first
2. Use web search for current information and additional context
3. Synthesize findings into coherent, well-organized content
4. Include relevant examples, case studies, or practical applications
5. Provide proper citations and source references
6. Structure content with clear headings, subheadings, and bullet points

Always aim for comprehensive yet concise content that provides real value to the reader.`;

    super(openaiApiKey, ragSystem, 'content-research', systemPrompt);
  }

  async execute(task: AgentTask, context: AgentContext): Promise<ResearchResult> {
    this.updateTaskStatus(task, 'running');
    
    try {
      const { topic, depth = 'comprehensive', includeWeb = true, createPage = false } = task.parameters;
      
      if (!topic) {
        throw new Error('Topic parameter is required for content research');
      }

      console.log(`🔍 Researching topic: ${topic}`);
      
      // Step 1: Get relevant context from RAG system
      const { notionResults, webResults, context: ragContext } = await this.ragSystem.getContextForQuery(
        topic,
        includeWeb
      );

      // Step 2: Generate comprehensive research content
      const researchPrompt = `Please research and create comprehensive content about: "${topic}"

Research depth: ${depth}
Available context: ${ragContext}

Please create detailed content including:
1. Overview and introduction
2. Key concepts and definitions
3. Main points and details
4. Examples and applications
5. Best practices or recommendations
6. Related topics and connections
7. Conclusion and key takeaways

Format the content in Markdown with proper headings, bullet points, and structure.
Include source references where applicable.`;

      const researchContent = await this.generateResponse(
        researchPrompt,
        context,
        true,
        includeWeb,
        0.7
      );

      // Step 3: Extract sources from results
      const sources: string[] = [];
      
      notionResults.forEach(result => {
        if (result.metadata.url) {
          sources.push(`Notion: ${result.metadata.title} (${result.metadata.url})`);
        } else {
          sources.push(`Notion: ${result.metadata.title}`);
        }
      });

      webResults.forEach(result => {
        if (result.metadata.url) {
          sources.push(`Web: ${result.metadata.title} (${result.metadata.url})`);
        }
      });

      const researchResult: ResearchResult = {
        title: topic,
        content: researchContent,
        sources,
        relevanceScore: this.calculateRelevanceScore(notionResults, webResults),
        lastUpdated: new Date()
      };

      // Step 4: Create Notion page if requested
      if (createPage) {
        console.log(`📝 Creating Notion page for: ${topic}`);
        
        const pageResult = await createNotionPage({
          title: topic,
          content: researchContent,
          parentPageId: task.parameters.parentPageId
        });

        researchResult.sources.push(`Created Notion page: ${pageResult.id}`);
      }

      this.addToConversation(context, 'assistant', 
        `Research completed for "${topic}". Generated ${researchContent.length} characters of content with ${sources.length} sources.`,
        { researchResult }
      );

      return this.updateTaskStatus(task, 'completed', researchResult).result;

    } catch (error) {
      console.error('❌ Content research failed:', error);
      this.updateTaskStatus(task, 'failed', null, error instanceof Error ? error.message : 'Unknown error');
      throw error;
    }
  }

  async researchTopic(
    topic: string,
    depth: 'basic' | 'comprehensive' | 'expert' = 'comprehensive',
    includeWeb: boolean = true,
    context: AgentContext
  ): Promise<ResearchResult> {
    const task = this.createTask(`Research topic: ${topic}`, {
      topic,
      depth,
      includeWeb,
      createPage: false
    });

    return await this.execute(task, context);
  }

  async createResearchPage(
    topic: string,
    context: AgentContext,
    parentPageId?: string,
    depth: 'basic' | 'comprehensive' | 'expert' = 'comprehensive'
  ): Promise<ResearchResult> {
    const task = this.createTask(`Research and create page: ${topic}`, {
      topic,
      depth,
      includeWeb: true,
      createPage: true,
      parentPageId
    });

    return await this.execute(task, context);
  }

  async enhanceExistingContent(
    pageId: string,
    enhancementType: 'expand' | 'clarify' | 'update' | 'add-examples',
    context: AgentContext
  ): Promise<string> {
    console.log(`🔧 Enhancing page content: ${pageId}`);

    try {
      // Get existing page content (assuming we have a function to get page content)
      const existingContent = ""; // This would be fetched from the page
      
      const enhancementPrompt = `Please enhance the following content by ${enhancementType}:

${existingContent}

Provide enhanced content that maintains the original structure while improving it based on the enhancement type.`;

      const enhancedContent = await this.generateResponse(
        enhancementPrompt,
        context,
        true,
        true,
        0.7
      );

      // Update the page with enhanced content
      await updatePageContent(pageId, enhancedContent);

      this.addToConversation(context, 'assistant', 
        `Enhanced page ${pageId} with ${enhancementType} improvements.`
      );

      return enhancedContent;

    } catch (error) {
      console.error('❌ Content enhancement failed:', error);
      throw error;
    }
  }

  private calculateRelevanceScore(notionResults: any[], webResults: any[]): number {
    // Simple scoring algorithm
    let score = 0.5; // Base score
    
    // Add points for Notion results (more relevant to user's workspace)
    score += Math.min(notionResults.length * 0.1, 0.3);
    
    // Add points for web results (external validation)
    score += Math.min(webResults.length * 0.05, 0.2);
    
    // Factor in similarity scores
    const avgNotionScore = notionResults.length > 0 
      ? notionResults.reduce((sum, r) => sum + r.score, 0) / notionResults.length 
      : 0;
    
    score += avgNotionScore * 0.3;
    
    return Math.min(score, 1.0);
  }
} 
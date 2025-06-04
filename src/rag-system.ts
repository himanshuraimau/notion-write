import { ChromaClient, Collection } from 'chromadb';
import OpenAI from 'openai';
import type { VectorSearchResult, ChatMessage } from './types.js';
import { searchPages, getPageContent } from './notion-functions.js';
import axios from 'axios';
import * as cheerio from 'cheerio';
import { v4 as uuidv4 } from 'uuid';

export class RAGSystem {
  private chromaClient: ChromaClient;
  private openai: OpenAI;
  private collection: Collection | null = null;
  private collectionName: string = 'notion-knowledge-base';

  constructor(openaiApiKey: string) {
    this.chromaClient = new ChromaClient({
      path: "http://localhost:8000" // Default ChromaDB path
    });
    this.openai = new OpenAI({
      apiKey: openaiApiKey
    });
  }

  async initialize(): Promise<void> {
    try {
      // Create or get existing collection
      this.collection = await this.chromaClient.getOrCreateCollection({
        name: this.collectionName,
        metadata: { description: "Notion workspace knowledge base" }
      });
      console.log('✅ RAG System initialized successfully');
    } catch (error) {
      console.error('❌ Failed to initialize RAG system:', error);
      throw error;
    }
  }

  async generateEmbedding(text: string): Promise<number[]> {
    try {
      const response = await this.openai.embeddings.create({
        model: 'text-embedding-3-small',
        input: text,
      });
      return response.data[0]?.embedding || [];
    } catch (error) {
      console.error('Error generating embedding:', error);
      throw error;
    }
  }

  async indexNotionWorkspace(): Promise<void> {
    console.log('🔄 Indexing Notion workspace...');
    
    try {
      // Search for all pages in the workspace
      const pages = await searchPages('');
      
      const documents: string[] = [];
      const embeddings: number[][] = [];
      const metadatas: any[] = [];
      const ids: string[] = [];

      for (const page of pages) {
        try {
          // Get page content
          const pageContent = await getPageContent(page.id);
          
          // Extract text content from blocks
          const textContent = pageContent.blocks
            .map(block => {
              if ('paragraph' in block && block.paragraph) {
                return block.paragraph.rich_text?.map(text => text.plain_text).join('') || '';
              }
              return '';
            })
            .filter(text => text.length > 0)
            .join('\n');
          
          if (textContent && textContent.length > 0) {
            const fullContent = `${page.title}\n\n${textContent}`;
            
            // Generate embedding
            const embedding = await this.generateEmbedding(fullContent);
            
            if (embedding.length > 0) {
              documents.push(fullContent);
              embeddings.push(embedding);
              metadatas.push({
                pageId: page.id,
                title: page.title,
                lastEdited: page.lastEdited,
                source: 'notion'
              });
              ids.push(`notion_${page.id}`);
            }
          }
        } catch (error) {
          console.warn(`⚠️  Failed to index page ${page.id}:`, error);
        }
      }

      if (documents.length > 0) {
        await this.collection!.add({
          documents,
          embeddings,
          metadatas,
          ids
        });
        console.log(`✅ Indexed ${documents.length} Notion pages`);
      }
    } catch (error) {
      console.error('❌ Failed to index Notion workspace:', error);
      throw error;
    }
  }

  async searchKnowledge(query: string, limit: number = 5): Promise<VectorSearchResult[]> {
    if (!this.collection) {
      throw new Error('RAG system not initialized');
    }

    try {
      const queryEmbedding = await this.generateEmbedding(query);
      
      const results = await this.collection.query({
        queryEmbeddings: [queryEmbedding],
        nResults: limit,
        include: ['documents', 'metadatas', 'distances'] as any
      });

      const searchResults: VectorSearchResult[] = [];
      
      if (results.documents?.[0] && results.metadatas?.[0] && results.distances?.[0] && results.ids?.[0]) {
        for (let i = 0; i < results.documents[0].length; i++) {
          const id = results.ids[0][i];
          const content = results.documents[0][i];
          const metadata = results.metadatas[0][i];
          const distance = results.distances[0][i];
          
          if (id && content && metadata && typeof distance === 'number') {
            searchResults.push({
              id,
              content,
              metadata: metadata as Record<string, any>,
              score: 1 - distance, // Convert distance to similarity score
              source: (metadata.source === 'notion' || metadata.source === 'web' || metadata.source === 'document') 
                ? metadata.source 
                : 'document'
            });
          }
        }
      }

      return searchResults;
    } catch (error) {
      console.error('Error searching knowledge base:', error);
      throw error;
    }
  }

  async webSearch(query: string, limit: number = 3): Promise<VectorSearchResult[]> {
    try {
      // Use a simple web search approach (in production, you'd use Google Search API or similar)
      const searchUrl = `https://duckduckgo.com/html/?q=${encodeURIComponent(query)}`;
      
      const response = await axios.get(searchUrl, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        }
      });

      const $ = cheerio.load(response.data);
      const results: VectorSearchResult[] = [];
      
      $('.result__body').slice(0, limit).each((i, element) => {
        const title = $(element).find('.result__title').text().trim();
        const snippet = $(element).find('.result__snippet').text().trim();
        const url = $(element).find('.result__url').text().trim();
        
        if (title && snippet) {
          results.push({
            id: uuidv4(),
            content: `${title}\n\n${snippet}`,
            metadata: {
              title,
              url,
              source: 'web'
            },
            score: 0.8, // Default web search score
            source: 'web'
          });
        }
      });

      return results;
    } catch (error) {
      console.warn('⚠️  Web search failed, continuing without web results:', error);
      return [];
    }
  }

  async getContextForQuery(query: string, includeWeb: boolean = false): Promise<{
    notionResults: VectorSearchResult[];
    webResults: VectorSearchResult[];
    context: string;
  }> {
    const notionResults = await this.searchKnowledge(query);
    const webResults = includeWeb ? await this.webSearch(query) : [];
    
    // Build context string
    let context = "Based on the following information:\n\n";
    
    if (notionResults.length > 0) {
      context += "From your Notion workspace:\n";
      notionResults.forEach((result, i) => {
        context += `${i + 1}. ${result.content.substring(0, 500)}...\n\n`;
      });
    }
    
    if (webResults.length > 0) {
      context += "From web search:\n";
      webResults.forEach((result, i) => {
        context += `${i + 1}. ${result.content.substring(0, 300)}...\n\n`;
      });
    }

    return {
      notionResults,
      webResults,
      context
    };
  }

  async addDocument(content: string, metadata: Record<string, any>, source: string = 'document'): Promise<void> {
    if (!this.collection) {
      throw new Error('RAG system not initialized');
    }

    try {
      const embedding = await this.generateEmbedding(content);
      const id = uuidv4();
      
      await this.collection.add({
        documents: [content],
        embeddings: [embedding],
        metadatas: [{ ...metadata, source }],
        ids: [id]
      });
      
      console.log(`✅ Added document to knowledge base: ${id}`);
    } catch (error) {
      console.error('Failed to add document:', error);
      throw error;
    }
  }

  async clearCollection(): Promise<void> {
    if (!this.collection) {
      throw new Error('RAG system not initialized');
    }

    try {
      await this.chromaClient.deleteCollection({ name: this.collectionName });
      this.collection = await this.chromaClient.createCollection({
        name: this.collectionName,
        metadata: { description: "Notion workspace knowledge base" }
      });
      console.log('✅ Knowledge base cleared');
    } catch (error) {
      console.error('Failed to clear collection:', error);
      throw error;
    }
  }
} 
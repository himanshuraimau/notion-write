import { Client } from '@notionhq/client';
import type { NotionConfig } from './types.js';

/**
 * Initialize and configure Notion client
 */
export class NotionClientManager {
  private client: Client | null = null;
  private config: NotionConfig;

  constructor(config?: NotionConfig) {
    this.config = {
      apiKey: config?.apiKey || process.env.NOTION_API_KEY,
      parentPageId: config?.parentPageId || process.env.NOTION_PARENT_PAGE_ID,
    };
  }

  /**
   * Initialize the client (lazy loading)
   */
  private initializeClient(): void {
    if (!this.client) {
      if (!this.config.apiKey) {
        throw new Error('Notion API key is required. Set NOTION_API_KEY environment variable or pass it in config.');
      }

      this.client = new Client({
        auth: this.config.apiKey,
      });
    }
  }

  /**
   * Get the Notion client instance
   */
  getClient(): Client {
    this.initializeClient();
    return this.client!;
  }

  /**
   * Get configuration
   */
  getConfig(): NotionConfig {
    return this.config;
  }

  /**
   * Validate parent configuration
   */
  validateParent(databaseId?: string, parentPageId?: string): { database_id: string } | { page_id: string } {
    if (databaseId) {
      return { database_id: databaseId };
    } else if (parentPageId) {
      return { page_id: parentPageId };
    } else if (this.config.parentPageId) {
      return { page_id: this.config.parentPageId };
    } else {
      throw new Error('Either databaseId or parentPageId must be provided, or set NOTION_PARENT_PAGE_ID environment variable');
    }
  }

  /**
   * Check if the client is properly configured
   */
  isConfigured(): boolean {
    return !!this.config.apiKey;
  }
}

// Default instance - now safe to create without environment variables
export const defaultNotionClient = new NotionClientManager(); 
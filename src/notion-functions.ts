import type { 
  NotionPageData, 
  DatabaseEntry, 
  PageSearchResult, 
  DatabaseEntryResult 
} from './types.js';
import { defaultNotionClient } from './notion-client.js';

/**
 * Create a new Notion page with content
 */
export async function createNotionPage(data: NotionPageData) {
  const client = defaultNotionClient.getClient();
  const parent = defaultNotionClient.validateParent(data.databaseId, data.parentPageId);

  const response = await client.pages.create({
    parent,
    properties: {
      title: {
        title: [{ text: { content: data.title } }],
      },
    },
    children: [
      {
        object: 'block',
        type: 'paragraph',
        paragraph: {
          rich_text: [{ type: 'text', text: { content: data.content } }],
        },
      },
      {
        object: 'block',
        type: 'heading_2',
        heading_2: {
          rich_text: [{ type: 'text', text: { content: 'Additional Information' } }],
        },
      },
      {
        object: 'block',
        type: 'bulleted_list_item',
        bulleted_list_item: {
          rich_text: [{ type: 'text', text: { content: `Created at: ${new Date().toISOString()}` } }],
        },
      },
      {
        object: 'block',
        type: 'bulleted_list_item',
        bulleted_list_item: {
          rich_text: [{ type: 'text', text: { content: 'Generated using Notion SDK' } }],
        },
      },
    ],
  });

  return response;
}

/**
 * Get page content and blocks
 */
export async function getPageContent(pageId: string) {
  const client = defaultNotionClient.getClient();
  
  const page = await client.pages.retrieve({ page_id: pageId });
  const blocks = await client.blocks.children.list({ block_id: pageId });

  return {
    page,
    blocks: blocks.results,
  };
}

/**
 * Update page by adding new content
 */
export async function updatePageContent(pageId: string, newContent: string) {
  const client = defaultNotionClient.getClient();
  
  const response = await client.blocks.children.append({
    block_id: pageId,
    children: [
      {
        object: 'block',
        type: 'paragraph',
        paragraph: {
          rich_text: [{ type: 'text', text: { content: `📝 Updated: ${newContent}` } }],
        },
      },
      {
        object: 'block',
        type: 'callout',
        callout: {
          rich_text: [{ type: 'text', text: { content: `Last updated: ${new Date().toLocaleString()}` } }],
          icon: { emoji: '🕐' },
        },
      },
    ],
  });

  return response;
}

/**
 * Search for pages in the workspace
 */
export async function searchPages(query: string): Promise<PageSearchResult[]> {
  const client = defaultNotionClient.getClient();
  
  const response = await client.search({
    query,
    filter: { property: 'object', value: 'page' },
    sort: { direction: 'descending', timestamp: 'last_edited_time' },
  });

  return response.results.map((page: any) => ({
    id: page.id,
    title: page.properties?.title?.title?.[0]?.text?.content || 'Untitled',
    lastEdited: page.last_edited_time,
    createdTime: page.created_time,
  }));
}

/**
 * Create a new database with predefined properties
 */
export async function createDatabase(title: string, parentPageId?: string) {
  const client = defaultNotionClient.getClient();
  const parent = defaultNotionClient.validateParent(undefined, parentPageId);

  if (!('page_id' in parent)) {
    throw new Error('Database must be created under a page, not another database');
  }

  const response = await client.databases.create({
    parent: { page_id: parent.page_id },
    title: [{ type: 'text', text: { content: title } }],
    properties: {
      Title: { title: {} },
      Description: { rich_text: {} },
      Status: {
        select: {
          options: [
            { name: 'Not Started', color: 'red' },
            { name: 'In Progress', color: 'yellow' },
            { name: 'Completed', color: 'green' },
          ],
        },
      },
      Priority: {
        select: {
          options: [
            { name: 'Low', color: 'gray' },
            { name: 'Medium', color: 'blue' },
            { name: 'High', color: 'red' },
          ],
        },
      },
      Tags: {
        multi_select: {
          options: [
            { name: 'Important', color: 'red' },
            { name: 'Work', color: 'blue' },
            { name: 'Personal', color: 'green' },
          ],
        },
      },
      'Created Date': { created_time: {} },
    },
  });

  return response;
}

/**
 * Add an entry to a database
 */
export async function addDatabaseEntry(databaseId: string, entry: DatabaseEntry) {
  const client = defaultNotionClient.getClient();
  
  const response = await client.pages.create({
    parent: { database_id: databaseId },
    properties: {
      Title: {
        title: [{ text: { content: entry.title } }],
      },
      Description: {
        rich_text: [{ text: { content: entry.description || '' } }],
      },
      Status: {
        select: { name: entry.status || 'Not Started' },
      },
      Priority: {
        select: { name: entry.priority || 'Medium' },
      },
      Tags: {
        multi_select: entry.tags?.map((tag: string) => ({ name: tag })) || [],
      },
    },
  });

  return response;
}

/**
 * Get entries from a database
 */
export async function getDatabaseEntries(
  databaseId: string, 
  pageSize: number = 10
): Promise<DatabaseEntryResult[]> {
  const client = defaultNotionClient.getClient();
  
  const response = await client.databases.query({
    database_id: databaseId,
    page_size: Math.min(pageSize, 100),
  });

  return response.results.map((page: any) => ({
    id: page.id,
    title: page.properties?.Title?.title?.[0]?.text?.content || 'Untitled',
    description: page.properties?.Description?.rich_text?.[0]?.text?.content || '',
    status: page.properties?.Status?.select?.name || 'Not Started',
    priority: page.properties?.Priority?.select?.name || 'Medium',
    tags: page.properties?.Tags?.multi_select?.map((tag: any) => tag.name) || [],
    createdTime: page.created_time,
    lastEdited: page.last_edited_time,
  }));
} 
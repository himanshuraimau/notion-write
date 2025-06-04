// TypeScript interfaces and types for Notion operations

export interface NotionPageData {
  title: string;
  content: string;
  databaseId?: string;
  parentPageId?: string;
}

export interface DatabaseEntry {
  title: string;
  description?: string;
  status?: 'Not Started' | 'In Progress' | 'Completed';
  priority?: 'Low' | 'Medium' | 'High';
  tags?: string[];
}

export interface PageSearchResult {
  id: string;
  title: string;
  lastEdited: string;
  createdTime: string;
}

export interface DatabaseEntryResult {
  id: string;
  title: string;
  description: string;
  status: string;
  priority: string;
  tags: string[];
  createdTime: string;
  lastEdited: string;
}

export interface NotionConfig {
  apiKey?: string;
  parentPageId?: string;
} 
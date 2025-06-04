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

// RAG and Agent Types
export interface VectorSearchResult {
  id: string;
  content: string;
  metadata: Record<string, any>;
  score: number;
  source: 'notion' | 'web' | 'document';
}

export interface AgentContext {
  conversationId: string;
  userId?: string;
  sessionData: Record<string, any>;
  previousMessages: ChatMessage[];
}

export interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
  metadata?: Record<string, any>;
}

export interface AgentTask {
  id: string;
  type: AgentType;
  description: string;
  parameters: Record<string, any>;
  status: 'pending' | 'running' | 'completed' | 'failed';
  result?: any;
  error?: string;
  createdAt: Date;
  updatedAt: Date;
}

export type AgentType = 
  | 'content-research'
  | 'notion-intelligence' 
  | 'content-enhancement'
  | 'database-architect'
  | 'task-planning'
  | 'analytics';

export interface ResearchResult {
  title: string;
  content: string;
  sources: string[];
  relevanceScore: number;
  lastUpdated: Date;
}

export interface ContentEnhancement {
  originalContent: string;
  enhancedContent: string;
  improvements: string[];
  suggestedTags: string[];
  relatedPages: string[];
}

export interface DatabaseSchema {
  name: string;
  description: string;
  properties: Record<string, any>;
  relationships: string[];
  suggestedViews: string[];
  optimization: string[];
}

export interface TaskBreakdown {
  projectTitle: string;
  mainTasks: Task[];
  timeline: TimelineItem[];
  dependencies: Dependency[];
  resources: Resource[];
}

export interface Task {
  id: string;
  title: string;
  description: string;
  priority: 'Low' | 'Medium' | 'High' | 'Critical';
  estimatedHours: number;
  assignee?: string;
  status: 'Not Started' | 'In Progress' | 'Completed' | 'Blocked';
  tags: string[];
}

export interface TimelineItem {
  taskId: string;
  startDate: Date;
  endDate: Date;
  milestones: string[];
}

export interface Dependency {
  taskId: string;
  dependsOn: string[];
  type: 'blocks' | 'enables' | 'optional';
}

export interface Resource {
  name: string;
  type: 'person' | 'tool' | 'document' | 'budget';
  allocation: number;
  availability: string;
}

export interface WorkspaceAnalytics {
  totalPages: number;
  totalDatabases: number;
  activitySummary: ActivitySummary;
  contentDistribution: ContentDistribution;
  recommendations: string[];
  trends: Trend[];
}

export interface ActivitySummary {
  pagesCreated: number;
  pagesModified: number;
  databasesCreated: number;
  period: string;
}

export interface ContentDistribution {
  byType: Record<string, number>;
  byTags: Record<string, number>;
  byCreator: Record<string, number>;
}

export interface Trend {
  metric: string;
  value: number;
  change: number;
  period: string;
} 
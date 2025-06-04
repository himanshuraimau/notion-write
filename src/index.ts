// Main entry point for the Notion SDK modules

// Export all types
export * from './types.js';

// Export client manager
export * from './notion-client.js';

// Export all functions
export * from './notion-functions.js';

// Re-export for convenience
export {
  createNotionPage,
  getPageContent,
  updatePageContent,
  searchPages,
  createDatabase,
  addDatabaseEntry,
  getDatabaseEntries,
} from './notion-functions.js';

export { NotionClientManager, defaultNotionClient } from './notion-client.js'; 
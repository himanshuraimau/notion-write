#!/usr/bin/env node

import {
  createNotionPage,
  getPageContent,
  updatePageContent,
  searchPages,
  createDatabase,
  addDatabaseEntry,
  getDatabaseEntries,
} from '../src/notion-functions.js';

async function runDemo() {
  try {
    console.log('🚀 Notion SDK Demo - Modular Functions');
    console.log('======================================\n');

    // Example 1: Create a page
    console.log('1️⃣ Creating a new page...');
    const newPage = await createNotionPage({
      title: 'Modular Demo Page',
      content: 'This page was created using the modular Notion SDK functions! 🎉',
    });
    const pageId = newPage.id;
    console.log(`✅ Page created: ${pageId}`);
    
    // Wait a moment for the page to be fully created
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Example 2: Get page content
    console.log('\n2️⃣ Retrieving page content...');
    const pageContent = await getPageContent(pageId);
    console.log(`📋 Page has ${pageContent.blocks.length} content blocks`);

    // Example 3: Update page content
    console.log('\n3️⃣ Updating page content...');
    await updatePageContent(pageId, 'This content was added via the modular update function!');
    console.log('✅ Page updated successfully');

    // Example 4: Search for pages
    console.log('\n4️⃣ Searching for pages...');
    const searchResults = await searchPages('Modular');
    console.log(`🔍 Found ${searchResults.length} pages`);
    searchResults.slice(0, 3).forEach((page, index) => {
      console.log(`   ${index + 1}. ${page.title} (${page.id})`);
    });

    // Example 5: Create a database
    console.log('\n5️⃣ Creating a new database...');
    const database = await createDatabase('Modular Project Tracker');
    const databaseId = database.id;
    console.log(`✅ Database created: ${databaseId}`);

    // Example 6: Add entries to database
    console.log('\n6️⃣ Adding entries to database...');
    const entries = [
      {
        title: 'Setup Modular Architecture',
        description: 'Organize code into separate, focused modules',
        status: 'Completed' as const,
        priority: 'High' as const,
        tags: ['Architecture', 'Important'],
      },
      {
        title: 'Create MCP Server',
        description: 'Build MCP server that uses modular functions',
        status: 'Completed' as const,
        priority: 'High' as const,
        tags: ['MCP', 'Important'],
      },
      {
        title: 'Write Documentation',
        description: 'Document the modular structure and usage',
        status: 'In Progress' as const,
        priority: 'Medium' as const,
        tags: ['Documentation'],
      },
    ];

    for (const entry of entries) {
      await addDatabaseEntry(databaseId, entry);
      console.log(`✅ Added: ${entry.title}`);
      await new Promise(resolve => setTimeout(resolve, 500)); // Small delay
    }

    // Example 7: Get database entries
    console.log('\n7️⃣ Retrieving database entries...');
    const dbEntries = await getDatabaseEntries(databaseId);
    console.log(`📊 Retrieved ${dbEntries.length} entries`);
    dbEntries.forEach((entry, index) => {
      console.log(`   ${index + 1}. ${entry.title} [${entry.status}] - ${entry.priority}`);
    });

    console.log('\n🎉 All modular functions demonstrated successfully!');
    console.log(`📄 Created page ID: ${pageId}`);
    console.log(`🗃️ Created database ID: ${databaseId}`);
    
  } catch (error: any) {
    console.error('💥 Demo error:', error.message);
    process.exit(1);
  }
}

// Run the demo
runDemo(); 
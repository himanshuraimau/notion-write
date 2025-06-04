import { AgentManager } from '../src/agent-manager.js';

async function runAgentDemo() {
  console.log('🚀 Starting Agent Demo...\n');

  // Check for required environment variables
  const openaiApiKey = process.env.OPENAI_API_KEY;
  const notionApiKey = process.env.NOTION_API_KEY;

  if (!openaiApiKey) {
    console.error('❌ OPENAI_API_KEY environment variable is required');
    process.exit(1);
  }

  if (!notionApiKey) {
    console.error('❌ NOTION_API_KEY environment variable is required');
    process.exit(1);
  }

  try {
    // Initialize Agent Manager
    console.log('🤖 Initializing Agent Manager...');
    const agentManager = new AgentManager(openaiApiKey);
    await agentManager.initialize();

    // Index Notion workspace for RAG
    console.log('📚 Indexing Notion workspace...');
    try {
      await agentManager.indexNotionWorkspace();
    } catch (error) {
      console.warn('⚠️  Failed to index workspace (continuing with demo):', error);
    }

    console.log('\n=== Available Agents ===');
    const availableAgents = agentManager.getAvailableAgents();
    availableAgents.forEach(agent => {
      const info = agentManager.getAgentInfo(agent);
      console.log(`🤖 ${agent}: ${info?.systemPrompt.split('\n')[0]}`);
    });

    // Demo 1: Content Research Agent
    console.log('\n=== Demo 1: Content Research Agent ===');
    const researchResponse = await agentManager.chat(
      "Research artificial intelligence and machine learning trends in 2024"
    );
    console.log(`🔍 Agent Used: ${researchResponse.agentUsed}`);
    console.log(`📝 Response: ${researchResponse.response.substring(0, 300)}...`);
    console.log(`💡 Suggestions: ${researchResponse.suggestions?.join(', ')}`);

    // Demo 2: Task Planning Agent
    console.log('\n=== Demo 2: Task Planning Agent ===');
    const planningResponse = await agentManager.chat(
      "Create a project plan for building a mobile app with React Native",
      researchResponse.context.conversationId
    );
    console.log(`📋 Agent Used: ${planningResponse.agentUsed}`);
    console.log(`📝 Response: ${planningResponse.response.substring(0, 300)}...`);
    console.log(`💡 Suggestions: ${planningResponse.suggestions?.join(', ')}`);

    // Demo 3: Conversational Chat
    console.log('\n=== Demo 3: Conversational Chat ===');
    const chatResponse = await agentManager.chat(
      "What are the main challenges I should consider for this mobile app project?",
      planningResponse.context.conversationId
    );
    console.log(`💬 Agent Used: ${chatResponse.agentUsed}`);
    console.log(`📝 Response: ${chatResponse.response.substring(0, 300)}...`);

    // Demo 4: Create Research Page
    console.log('\n=== Demo 4: Create Research Page ===');
    const pageCreationResponse = await agentManager.chat(
      "Create a Notion page about TypeScript best practices and design patterns",
      chatResponse.context.conversationId
    );
    console.log(`📄 Agent Used: ${pageCreationResponse.agentUsed}`);
    console.log(`📝 Response: ${pageCreationResponse.response.substring(0, 300)}...`);

    // Demo 5: Project Planning with Database Creation
    console.log('\n=== Demo 5: Project Planning with Database ===');
    const dbPlanningResponse = await agentManager.chat(
      "Plan a software development project for an e-commerce website and create a project database in Notion"
    );
    console.log(`🗄️  Agent Used: ${dbPlanningResponse.agentUsed}`);
    console.log(`📝 Response: ${dbPlanningResponse.response.substring(0, 300)}...`);

    // Show conversation history
    console.log('\n=== Conversation History ===');
    const finalContext = dbPlanningResponse.context;
    console.log(`💬 Conversation ID: ${finalContext.conversationId}`);
    console.log(`📊 Total Messages: ${finalContext.previousMessages.length}`);
    
    finalContext.previousMessages.slice(-4).forEach((msg, i) => {
      console.log(`${i + 1}. [${msg.role}]: ${msg.content.substring(0, 100)}...`);
    });

    console.log('\n✅ Agent Demo completed successfully!');
    console.log('\n📖 Next Steps:');
    console.log('- Try the agents with your own queries');
    console.log('- Check your Notion workspace for created pages and databases');
    console.log('- Experiment with different agent types and capabilities');
    console.log('- Set up ChromaDB for enhanced RAG performance');

  } catch (error) {
    console.error('❌ Demo failed:', error);
    process.exit(1);
  }
}

// Add graceful shutdown
process.on('SIGINT', () => {
  console.log('\n👋 Shutting down agent demo...');
  process.exit(0);
});

// Run the demo
runAgentDemo().catch(console.error); 
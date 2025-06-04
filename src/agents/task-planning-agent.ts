import { BaseAgent } from './base-agent.js';
import type { AgentContext, AgentTask, TaskBreakdown, Task, TimelineItem, Dependency, Resource } from '../types.js';
import { RAGSystem } from '../rag-system.js';
import { createDatabase, addDatabaseEntry } from '../notion-functions.js';

export class TaskPlanningAgent extends BaseAgent {
  constructor(openaiApiKey: string, ragSystem: RAGSystem) {
    const systemPrompt = `You are a Task Planning Agent specialized in breaking down complex projects into manageable, actionable tasks and creating comprehensive project plans.

Your capabilities include:
- Analyzing project requirements and scope
- Breaking down complex projects into smaller, manageable tasks
- Creating realistic timelines and milestones
- Identifying task dependencies and critical paths
- Estimating effort and resource requirements
- Setting up project management databases in Notion
- Creating task hierarchies and work breakdown structures

When planning tasks:
1. Understand the project scope and objectives
2. Break down into logical phases and milestones
3. Create specific, measurable, actionable tasks
4. Estimate effort and complexity realistically
5. Identify dependencies between tasks
6. Consider resource constraints and availability
7. Build in buffer time for unexpected issues
8. Structure tasks in a logical sequence

Always aim for practical, implementable project plans that can guide actual execution.

When responding with task breakdowns, use this JSON structure:
{
  "projectTitle": "string",
  "mainTasks": [
    {
      "id": "string",
      "title": "string",
      "description": "string",
      "priority": "Low|Medium|High|Critical",
      "estimatedHours": number,
      "status": "Not Started",
      "tags": ["string"]
    }
  ],
  "timeline": [
    {
      "taskId": "string",
      "startDate": "ISO date",
      "endDate": "ISO date",
      "milestones": ["string"]
    }
  ],
  "dependencies": [
    {
      "taskId": "string",
      "dependsOn": ["string"],
      "type": "blocks|enables|optional"
    }
  ],
  "resources": [
    {
      "name": "string",
      "type": "person|tool|document|budget",
      "allocation": number,
      "availability": "string"
    }
  ]
}`;

    super(openaiApiKey, ragSystem, 'task-planning', systemPrompt);
  }

  async execute(task: AgentTask, context: AgentContext): Promise<TaskBreakdown> {
    this.updateTaskStatus(task, 'running');
    
    try {
      const { 
        projectDescription, 
        deadline, 
        teamSize = 1, 
        complexity = 'medium',
        createDatabase = true,
        parentPageId 
      } = task.parameters;
      
      if (!projectDescription) {
        throw new Error('Project description is required for task planning');
      }

      console.log(`📋 Planning project: ${projectDescription}`);
      
      // Step 1: Get context from similar projects in Notion workspace
      const { context: ragContext } = await this.ragSystem.getContextForQuery(
        `project planning tasks ${projectDescription}`,
        false // Don't include web for internal project planning
      );

      // Step 2: Generate comprehensive task breakdown
      const planningPrompt = `Please create a comprehensive project plan for: "${projectDescription}"

Project details:
- Deadline: ${deadline || 'Not specified'}
- Team size: ${teamSize}
- Complexity: ${complexity}
- Available context: ${ragContext}

Create a detailed task breakdown including:
1. Main project phases and tasks
2. Realistic effort estimates (in hours)
3. Task priorities and dependencies
4. Timeline with milestones
5. Resource requirements

Respond with a valid JSON structure as specified in your instructions.`;

      const planningResponse = await this.generateStructuredResponse<TaskBreakdown>(
        planningPrompt,
        context,
        null,
        true,
        false
      );

      // Validate and enhance the response
      const taskBreakdown = this.validateAndEnhanceTaskBreakdown(planningResponse, projectDescription);

      // Step 3: Create Notion database if requested
      if (createDatabase) {
        console.log(`📊 Creating project database in Notion...`);
        
        const database = await createDatabase(
          `${taskBreakdown.projectTitle} - Project Tasks`,
          parentPageId
        );

        // Add all tasks to the database
        for (const task of taskBreakdown.mainTasks) {
          await addDatabaseEntry(database.id, {
            title: task.title,
            description: task.description,
            status: task.status as any,
            priority: task.priority === 'Critical' ? 'High' : task.priority as any,
            tags: task.tags
          });
        }

        // Add database info to the result
        (taskBreakdown as any).databaseId = database.id;
        (taskBreakdown as any).databaseUrl = database.url;
      }

      this.addToConversation(context, 'assistant', 
        `Project plan created for "${taskBreakdown.projectTitle}". Generated ${taskBreakdown.mainTasks.length} tasks with timeline and dependencies.`,
        { taskBreakdown }
      );

      return this.updateTaskStatus(task, 'completed', taskBreakdown).result;

    } catch (error) {
      console.error('❌ Task planning failed:', error);
      this.updateTaskStatus(task, 'failed', null, error instanceof Error ? error.message : 'Unknown error');
      throw error;
    }
  }

  async planProject(
    projectDescription: string,
    options: {
      deadline?: string;
      teamSize?: number;
      complexity?: 'low' | 'medium' | 'high';
      createDatabase?: boolean;
      parentPageId?: string;
    } = {},
    context: AgentContext
  ): Promise<TaskBreakdown> {
    const task = this.createTask(`Plan project: ${projectDescription}`, {
      projectDescription,
      ...options
    });

    return await this.execute(task, context);
  }

  async createProjectTimeline(
    tasks: Task[],
    startDate: Date,
    context: AgentContext
  ): Promise<TimelineItem[]> {
    console.log(`📅 Creating timeline for ${tasks.length} tasks...`);

    const timelinePrompt = `Create a realistic project timeline for the following tasks:

${JSON.stringify(tasks, null, 2)}

Start date: ${startDate.toISOString()}

Consider:
1. Task dependencies and prerequisites
2. Realistic work schedules (8 hours/day, 5 days/week)
3. Buffer time for unexpected issues
4. Logical task sequencing

Respond with an array of timeline items in JSON format.`;

    try {
      const timeline = await this.generateStructuredResponse<TimelineItem[]>(
        timelinePrompt,
        context,
        null,
        false,
        false
      );

      this.addToConversation(context, 'assistant', 
        `Created timeline with ${timeline.length} scheduled items.`
      );

      return timeline;

    } catch (error) {
      console.error('❌ Timeline creation failed:', error);
      throw error;
    }
  }

  async optimizeTaskSequence(
    tasks: Task[],
    dependencies: Dependency[],
    context: AgentContext
  ): Promise<Task[]> {
    console.log(`🔧 Optimizing sequence for ${tasks.length} tasks...`);

    const optimizationPrompt = `Optimize the sequence of these tasks considering their dependencies:

Tasks: ${JSON.stringify(tasks, null, 2)}
Dependencies: ${JSON.stringify(dependencies, null, 2)}

Provide the optimal task sequence that:
1. Respects all dependencies
2. Maximizes parallel work opportunities
3. Minimizes idle time
4. Prioritizes critical path items

Respond with the reordered tasks array in JSON format.`;

    try {
      const optimizedTasks = await this.generateStructuredResponse<Task[]>(
        optimizationPrompt,
        context,
        null,
        false,
        false
      );

      this.addToConversation(context, 'assistant', 
        `Optimized task sequence for ${optimizedTasks.length} tasks.`
      );

      return optimizedTasks;

    } catch (error) {
      console.error('❌ Task optimization failed:', error);
      throw error;
    }
  }

  private validateAndEnhanceTaskBreakdown(breakdown: TaskBreakdown, projectDescription: string): TaskBreakdown {
    // Ensure project title is set
    if (!breakdown.projectTitle) {
      breakdown.projectTitle = projectDescription;
    }

    // Validate and enhance tasks
    breakdown.mainTasks = breakdown.mainTasks.map((task, index) => ({
      id: task.id || `task-${index + 1}`,
      title: task.title || `Task ${index + 1}`,
      description: task.description || task.title,
      priority: task.priority || 'Medium',
      estimatedHours: task.estimatedHours || 8,
      assignee: task.assignee,
      status: 'Not Started',
      tags: task.tags || []
    }));

    // Ensure timeline exists
    if (!breakdown.timeline) {
      breakdown.timeline = [];
    }

    // Ensure dependencies exist
    if (!breakdown.dependencies) {
      breakdown.dependencies = [];
    }

    // Ensure resources exist
    if (!breakdown.resources) {
      breakdown.resources = [];
    }

    return breakdown;
  }
} 
# Agent Framework Architecture

## Overview

The Novel Movie project implements a **Hybrid Monolith with Agent Services** architecture using CrewAI for multi-agent orchestration. This approach combines the simplicity of a monolith for development and maintenance with the flexibility of specialized AI agents for complex creative tasks.

## Architecture Decision: Hybrid Monolith + Agent Services

### Core Components
1. **Main Application**: Existing Next.js + PayloadCMS monolith (primary system)
2. **Agent Services**: Dedicated `/agents` directory for specialized CrewAI agents
3. **Queue System**: Existing bee-queue + Redis for orchestrating agent workflows
4. **Database Strategy**: PayloadCMS + ArangoDB + Redis hybrid approach

### Advantages
- **Single Deployment**: Everything deploys together, simplifying DevOps
- **Shared Resources**: Agents directly access PayloadCMS collections and existing utilities
- **Type Safety**: Full TypeScript integration across the entire system
- **Development Efficiency**: No inter-service communication protocols needed
- **Easy Debugging**: All logs and errors in one place
- **Cost Effective**: Single infrastructure footprint

## Directory Structure

```
novel-movie/
├── src/                          # Existing Next.js app
├── agents/                       # New agent services directory
│   ├── core/                     # Shared agent infrastructure
│   │   ├── base-crew.ts          # Abstract base crew class
│   │   ├── agent-registry.ts     # Agent discovery and management
│   │   ├── workflow-orchestrator.ts # Phase management
│   │   ├── tools/                # Shared CrewAI tools
│   │   │   ├── payload-tool.ts   # PayloadCMS integration tool
│   │   │   ├── arangodb-tool.ts  # Graph database tool
│   │   │   └── baml-tool.ts      # BAML integration tool
│   │   └── types.ts              # Shared types and interfaces
│   ├── phase-1-architect/        # Story Architecture Crew
│   │   ├── architect-crew.ts     # Main crew definition
│   │   ├── story-parser-agent.ts # Story parsing specialist
│   │   ├── graph-builder-agent.ts # Graph construction specialist
│   │   └── tasks/                # CrewAI task definitions
│   │       ├── parse-story.ts
│   │       └── build-graph.ts
│   ├── phase-2-director/         # Scene Breakdown Crew
│   │   ├── director-crew.ts
│   │   ├── scene-analyzer-agent.ts
│   │   ├── shot-generator-agent.ts
│   │   └── tasks/
│   │       ├── analyze-scene.ts
│   │       └── generate-shots.ts
│   ├── phase-3-specialists/      # Parallel specialist crews
│   │   ├── cinematographer-crew.ts
│   │   ├── art-director-crew.ts
│   │   ├── sound-designer-crew.ts
│   │   └── agents/
│   │       ├── cinematographer-agent.ts
│   │       ├── art-director-agent.ts
│   │       └── sound-designer-agent.ts
│   ├── phase-4-supervisor/       # Quality Control Crew
│   │   ├── continuity-crew.ts
│   │   ├── consistency-validator-agent.ts
│   │   ├── quality-checker-agent.ts
│   │   └── tasks/
│   │       ├── validate-consistency.ts
│   │       └── check-quality.ts
│   └── services/                 # External service integrations
│       ├── arangodb-service.ts   # Graph database operations
│       ├── dinov3-service.ts     # Computer vision service
│       └── asset-service.ts      # Digital asset management
├── lib/queue/                    # Existing queue system (enhanced)
│   ├── agent-jobs.ts             # Agent-specific job types
│   └── crew-orchestrator.ts      # CrewAI workflow management
└── docs/                         # Documentation
    └── agent-framework.md        # This file
```

## CrewAI Implementation Patterns

### Base Crew Structure

```typescript
// agents/core/base-crew.ts
import { Crew, Agent, Task } from '@crewai/crewai'
import { ChatOpenAI } from '@langchain/openai'

export abstract class BaseCrew {
  protected crew: Crew
  protected agents: Agent[]
  protected tasks: Task[]
  protected llm: ChatOpenAI

  constructor(config: CrewConfig) {
    this.llm = new ChatOpenAI({
      modelName: config.model || 'anthropic/claude-sonnet-4',
      temperature: config.temperature || 0.7,
      openAIApiKey: process.env.OPENROUTER_API_KEY,
      openAIApiBase: 'https://openrouter.ai/api/v1'
    })
    
    this.agents = this.createAgents()
    this.tasks = this.createTasks()
    this.crew = new Crew({
      agents: this.agents,
      tasks: this.tasks,
      verbose: true
    })
  }

  abstract createAgents(): Agent[]
  abstract createTasks(): Task[]
  
  async execute(input: any): Promise<any> {
    return await this.crew.kickoff(input)
  }
}

export interface CrewConfig {
  model?: string
  temperature?: number
  projectId: string
  userId: string
}
```

### Workflow Orchestrator

```typescript
// agents/core/workflow-orchestrator.ts
import { ArchitectCrew } from '../phase-1-architect/architect-crew'
import { DirectorCrew } from '../phase-2-director/director-crew'
import { QueueService } from '../../lib/queue/queue-service'

export class WorkflowOrchestrator {
  static async executePhase1(projectId: string, storyData: any): Promise<string> {
    const jobId = crypto.randomUUID()
    
    await QueueService.addAgentJob({
      id: jobId,
      projectId,
      userId: storyData.userId,
      agentType: 'architect',
      phase: 1,
      inputData: storyData,
      createdAt: new Date()
    })
    
    return jobId
  }

  static async executePhase2(projectId: string, sceneData: any): Promise<string> {
    const jobId = crypto.randomUUID()
    
    await QueueService.addAgentJob({
      id: jobId,
      projectId,
      userId: sceneData.userId,
      agentType: 'director',
      phase: 2,
      inputData: sceneData,
      dependencies: [sceneData.phase1JobId], // Wait for Phase 1
      createdAt: new Date()
    })
    
    return jobId
  }

  // Internal execution methods (called by queue processors)
  static async _executeArchitectCrew(data: any): Promise<any> {
    const crew = new ArchitectCrew({
      projectId: data.projectId,
      userId: data.userId
    })
    
    return await crew.execute(data.inputData)
  }

  static async _executeDirectorCrew(data: any): Promise<any> {
    const crew = new DirectorCrew({
      projectId: data.projectId,
      userId: data.userId
    })
    
    return await crew.execute(data.inputData)
  }
}
```

## Database Integration Strategy

### Hybrid Database Approach with PathRAG

1. **PayloadCMS**: Project data, user management, UI state, and workflow tracking
2. **PathRAG Service**: Story graph, scene relationships, and intelligent querying (`http://movie.ft.tc:5000`)
3. **Redis**: Queue state, temporary agent data, and caching

### Data Flow Pattern

```typescript
// agents/services/data-service.ts
import { getPayload } from 'payload'
import config from '@payload-config'
import { PathRAGService } from './pathrag-service'

export class DataService {
  // PayloadCMS operations
  static async getProjectData(projectId: string) {
    const payload = await getPayload({ config })
    return await payload.findByID({
      collection: 'projects',
      id: projectId,
      depth: 2 // Include relationships
    })
  }

  static async updateProjectStatus(projectId: string, status: string) {
    const payload = await getPayload({ config })
    return await payload.update({
      collection: 'projects',
      id: projectId,
      data: { workflowStatus: status }
    })
  }

  // PathRAG operations for story graph
  static async saveStoryGraph(projectId: string, graphData: StoryGraph) {
    // Convert story graph to PathRAG custom knowledge graph format
    const customKG = {
      chunks: graphData.scenes.map(scene =>
        `Scene ${scene.sceneId}: ${scene.actionSummary}. Location: ${scene.setting}. Characters: ${scene.charactersPresent.join(', ')}. Purpose: ${scene.narrativePurpose}`
      ),
      entities: [
        // Scene entities
        ...graphData.scenes.map(scene => ({
          name: `Scene_${projectId}_${scene.sceneId}`,
          type: 'Scene',
          description: scene.actionSummary,
          metadata: {
            projectId,
            sceneId: scene.sceneId,
            sequenceNumber: scene.sequenceNumber,
            setting: scene.setting,
            emotionalArc: scene.emotionalArc
          }
        })),
        // Character entities
        ...graphData.characters.map(char => ({
          name: `Character_${projectId}_${char.name}`,
          type: 'Character',
          description: char.description || `Character in project ${projectId}`,
          metadata: { projectId, characterName: char.name }
        })),
        // Location entities
        ...graphData.locations.map(loc => ({
          name: `Location_${projectId}_${loc.name}`,
          type: 'Location',
          description: loc.description || `Location in project ${projectId}`,
          metadata: { projectId, locationName: loc.name }
        }))
      ],
      relationships: [
        // Scene sequence relationships
        ...graphData.relationships.filter(rel => rel.type === 'FOLLOWS').map(rel => ({
          source: `Scene_${projectId}_${rel.from}`,
          target: `Scene_${projectId}_${rel.to}`,
          relation: 'FOLLOWS'
        })),
        // Character-Scene relationships
        ...graphData.relationships.filter(rel => rel.type === 'HAS_CHARACTER').map(rel => ({
          source: `Scene_${projectId}_${rel.from}`,
          target: `Character_${projectId}_${rel.to}`,
          relation: 'HAS_CHARACTER'
        })),
        // Location-Scene relationships
        ...graphData.relationships.filter(rel => rel.type === 'TAKES_PLACE_IN').map(rel => ({
          source: `Scene_${projectId}_${rel.from}`,
          target: `Location_${projectId}_${rel.to}`,
          relation: 'TAKES_PLACE_IN'
        }))
      ]
    }

    return await PathRAGService.insertCustomKG(customKG)
  }

  static async getSceneContext(projectId: string, sceneId: string) {
    // Use PathRAG's intelligent querying instead of raw AQL
    const query = `Get all context for scene ${sceneId} in project ${projectId}, including characters present, location details, emotional beats, and relationships to other scenes`

    return await PathRAGService.query(query, {
      mode: 'hybrid',
      top_k: 20,
      response_type: 'Structured Data'
    })
  }

  static async queryStoryElements(projectId: string, query: string) {
    // Leverage PathRAG's natural language querying
    const contextualQuery = `In project ${projectId}: ${query}`

    return await PathRAGService.query(contextualQuery, {
      mode: 'hybrid',
      top_k: 15,
      only_need_context: true // Get raw context for agent processing
    })
  }
}
```

### PathRAG Service Integration

```typescript
// agents/services/pathrag-service.ts
export class PathRAGService {
  private static baseUrl = process.env.PATHRAG_API_URL || 'http://movie.ft.tc:5000'

  static async healthCheck() {
    const response = await fetch(`${this.baseUrl}/health`)
    return await response.json()
  }

  static async insertDocuments(documents: string | string[]) {
    const response = await fetch(`${this.baseUrl}/insert`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ documents })
    })
    return await response.json()
  }

  static async insertCustomKG(customKG: any) {
    const response = await fetch(`${this.baseUrl}/insert_custom_kg`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ custom_kg: customKG })
    })
    return await response.json()
  }

  static async query(query: string, params: any = {}) {
    const response = await fetch(`${this.baseUrl}/query`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query, params })
    })
    return await response.json()
  }

  static async deleteEntity(entityName: string) {
    const response = await fetch(`${this.baseUrl}/delete_entity`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ entity_name: entityName })
    })
    return await response.json()
  }

  static async getStats() {
    const response = await fetch(`${this.baseUrl}/stats`)
    return await response.json()
  }
}
```

## CrewAI Tools Integration

### PayloadCMS Tool

```typescript
// agents/core/tools/payload-tool.ts
import { Tool } from '@langchain/core/tools'
import { DataService } from '../../services/data-service'

export class PayloadTool extends Tool {
  name = 'payload_cms'
  description = 'Access PayloadCMS collections for project data, configurations, and updates'

  async _call(input: string): Promise<string> {
    const { action, collection, id, data } = JSON.parse(input)

    switch (action) {
      case 'get':
        const result = await DataService.getProjectData(id)
        return JSON.stringify(result)

      case 'update':
        await DataService.updateProjectStatus(id, data.status)
        return 'Updated successfully'

      case 'find':
        // Implement collection queries
        break

      default:
        throw new Error(`Unknown action: ${action}`)
    }
  }
}
```

### PathRAG Tool

```typescript
// agents/core/tools/pathrag-tool.ts
import { Tool } from '@langchain/core/tools'
import { DataService } from '../../services/data-service'
import { PathRAGService } from '../../services/pathrag-service'

export class PathRAGTool extends Tool {
  name = 'story_graph'
  description = 'Query and manipulate the story graph using PathRAG intelligent retrieval system'

  async _call(input: string): Promise<string> {
    const { action, projectId, data, query } = JSON.parse(input)

    switch (action) {
      case 'save_graph':
        const result = await DataService.saveStoryGraph(projectId, data)
        return `Story graph saved successfully. Entities: ${result.entities_count}, Relationships: ${result.relationships_count}`

      case 'get_scene_context':
        const context = await DataService.getSceneContext(projectId, data.sceneId)
        return JSON.stringify(context)

      case 'query_story':
        const queryResult = await DataService.queryStoryElements(projectId, query)
        return JSON.stringify(queryResult)

      case 'find_similar_scenes':
        const similarScenes = await PathRAGService.query(
          `Find scenes similar to: ${data.sceneDescription} in project ${projectId}`,
          { mode: 'hybrid', top_k: 5, only_need_context: true }
        )
        return JSON.stringify(similarScenes)

      case 'get_character_scenes':
        const characterScenes = await PathRAGService.query(
          `List all scenes featuring character ${data.characterName} in project ${projectId}`,
          { mode: 'hybrid', top_k: 10, response_type: 'List' }
        )
        return JSON.stringify(characterScenes)

      case 'analyze_story_flow':
        const storyFlow = await PathRAGService.query(
          `Analyze the narrative flow and scene progression for project ${projectId}`,
          { mode: 'hybrid', top_k: 20, response_type: 'Detailed Analysis' }
        )
        return JSON.stringify(storyFlow)

      default:
        throw new Error(`Unknown action: ${action}`)
    }
  }
}
```

## Queue System Integration

### Agent Job Types

```typescript
// lib/queue/agent-jobs.ts
export interface AgentJob extends BaseJob {
  agentType: 'architect' | 'director' | 'cinematographer' | 'art-director' | 'sound-designer' | 'supervisor'
  phase: 1 | 2 | 3 | 4
  inputData: any
  dependencies?: string[] // Other job IDs this depends on
  crewConfig?: CrewConfig
}

export interface StoryGraph {
  scenes: SceneNode[]
  relationships: GraphRelationship[]
  characters: CharacterNode[]
  locations: LocationNode[]
}

export interface SceneNode {
  sceneId: string
  sequenceNumber: number
  setting: string
  charactersPresent: string[]
  keyObjects: string[]
  emotionalArc: string[]
  actionSummary: string
  narrativePurpose: string
  dialogueScript?: string
}

export interface GraphRelationship {
  from: string
  to: string
  type: 'FOLLOWS' | 'HAS_CHARACTER' | 'TAKES_PLACE_IN' | 'HAS_EMOTION' | 'FEATURES_OBJECT'
}
```

### Queue Processors

```typescript
// lib/queue/crew-orchestrator.ts
import { agentQueue } from './queue-config'
import { WorkflowOrchestrator } from '../../agents/core/workflow-orchestrator'

// Process agent jobs
agentQueue.process(async (job) => {
  const { agentType, phase, inputData, projectId } = job.data

  try {
    await QueueService.updateJobStatus(job.id, 'processing')

    let result: any

    switch (agentType) {
      case 'architect':
        result = await WorkflowOrchestrator._executeArchitectCrew(job.data)
        break

      case 'director':
        result = await WorkflowOrchestrator._executeDirectorCrew(job.data)
        break

      case 'cinematographer':
        result = await WorkflowOrchestrator._executeCinematographerCrew(job.data)
        break

      // ... other agent types

      default:
        throw new Error(`Unknown agent type: ${agentType}`)
    }

    // Save results and update project status
    await DataService.saveAgentResult(projectId, agentType, result)
    await QueueService.updateJobStatus(job.id, 'completed', result)

    // Trigger dependent jobs if this was the last dependency
    await QueueService.checkAndTriggerDependentJobs(job.id)

  } catch (error) {
    await QueueService.updateJobStatus(job.id, 'failed', null, error.message)
    throw error
  }
})
```

## Implementation Plan: Start with Architect Agent

### Phase 1: Single Agent Implementation

We'll start by implementing the **Architect Agent** from Phase 1 as a proof of concept.

#### Step 1: Install CrewAI Dependencies

```bash
# Add to package.json
npm install crewai @langchain/openai @langchain/core
```

#### Step 2: Create Base Infrastructure

```typescript
// agents/core/types.ts
export interface CrewConfig {
  model?: string
  temperature?: number
  projectId: string
  userId: string
}

export interface AgentResult {
  success: boolean
  data?: any
  error?: string
  metadata?: {
    executionTime: number
    tokensUsed: number
    agentType: string
  }
}
```

#### Step 3: Implement Architect Crew

```typescript
// agents/phase-1-architect/architect-crew.ts
import { Crew, Agent, Task } from '@crewai/crewai'
import { BaseCrew } from '../core/base-crew'
import { PayloadTool } from '../core/tools/payload-tool'
import { PathRAGTool } from '../core/tools/pathrag-tool'

export class ArchitectCrew extends BaseCrew {
  createAgents(): Agent[] {
    const storyParserAgent = new Agent({
      role: 'Story Parser',
      goal: 'Parse and analyze story text to identify scenes, characters, locations, and narrative elements',
      backstory: `You are an expert story analyst with deep understanding of narrative structure.
                  You excel at breaking down complex stories into their fundamental components.`,
      llm: this.llm,
      tools: [new PayloadTool()],
      verbose: true
    })

    const graphBuilderAgent = new Agent({
      role: 'Graph Builder',
      goal: 'Create structured graph relationships between story elements using PathRAG intelligent storage',
      backstory: `You are a data architect specializing in knowledge graphs and story relationships.
                  You understand how to model complex narrative relationships using PathRAG's advanced
                  graph storage and retrieval capabilities for optimal AI agent querying.`,
      llm: this.llm,
      tools: [new PathRAGTool(), new PayloadTool()],
      verbose: true
    })

    return [storyParserAgent, graphBuilderAgent]
  }

  createTasks(): Task[] {
    const parseStoryTask = new Task({
      description: `
        Analyze the provided story text and extract:
        1. Individual scenes with clear boundaries
        2. Characters present in each scene
        3. Locations and settings
        4. Key objects and props
        5. Emotional beats and narrative purpose
        6. Dialogue sections

        Story text: {story_text}
        Project ID: {project_id}
      `,
      agent: this.agents[0], // Story Parser
      expectedOutput: 'Structured JSON with scenes, characters, locations, and relationships'
    })

    const buildGraphTask = new Task({
      description: `
        Using the parsed story elements, create a comprehensive knowledge graph:
        1. Structure scene data with all narrative attributes
        2. Create character, location, and object entities
        3. Establish semantic relationships between all elements
        4. Save the complete graph to PathRAG using custom knowledge graph format
        5. Verify graph creation and update project status in PayloadCMS

        Use PathRAG's intelligent storage to enable natural language querying of story elements.

        Parsed data: {parsed_story}
        Project ID: {project_id}
      `,
      agent: this.agents[1], // Graph Builder
      expectedOutput: 'Confirmation of successful PathRAG knowledge graph creation with entity and relationship counts'
    })

    return [parseStoryTask, buildGraphTask]
  }
}
```

#### Step 4: API Integration

```typescript
// src/app/v1/agents/architect/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { WorkflowOrchestrator } from '../../../../../agents/core/workflow-orchestrator'

export async function POST(request: NextRequest) {
  try {
    const { projectId, storyText, userId } = await request.json()

    // Validate inputs
    if (!projectId || !storyText || !userId) {
      return NextResponse.json(
        { error: 'Missing required fields: projectId, storyText, userId' },
        { status: 400 }
      )
    }

    // Queue the architect crew execution
    const jobId = await WorkflowOrchestrator.executePhase1(projectId, {
      storyText,
      userId,
      projectId
    })

    return NextResponse.json({
      success: true,
      jobId,
      message: 'Architect crew queued successfully',
      estimatedTime: '2-5 minutes'
    })

  } catch (error) {
    console.error('Architect crew error:', error)
    return NextResponse.json(
      { error: 'Failed to queue architect crew' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const jobId = searchParams.get('jobId')

  if (!jobId) {
    return NextResponse.json(
      { error: 'Missing jobId parameter' },
      { status: 400 }
    )
  }

  try {
    const jobStatus = await QueueService.getJobStatus(jobId)
    return NextResponse.json(jobStatus)
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to get job status' },
      { status: 500 }
    )
  }
}
```

#### Step 5: Testing Strategy

```typescript
// tests/agents/architect-crew.test.ts
import { ArchitectCrew } from '../../agents/phase-1-architect/architect-crew'

describe('ArchitectCrew', () => {
  const mockStoryText = `
    Marcus wakes up in a sterile medical bay, disoriented and confused.
    The room is filled with advanced medical equipment he doesn't recognize.
    Dr. Sarah Chen enters, checking his vital signs with concern.
    "You've been unconscious for three days," she explains.
    Marcus tries to remember how he got here, but his memory is fragmented.
  `

  it('should parse story into structured scenes', async () => {
    const crew = new ArchitectCrew({
      projectId: 'test-project-123',
      userId: 'test-user-456'
    })

    const result = await crew.execute({
      story_text: mockStoryText,
      project_id: 'test-project-123'
    })

    expect(result.success).toBe(true)
    expect(result.data.scenes).toHaveLength(1)
    expect(result.data.scenes[0]).toHaveProperty('sceneId')
    expect(result.data.scenes[0]).toHaveProperty('charactersPresent')
    expect(result.data.scenes[0].charactersPresent).toContain('Marcus')
    expect(result.data.scenes[0].charactersPresent).toContain('Dr. Sarah Chen')
  })

  it('should create proper graph relationships', async () => {
    // Test graph structure creation
    // Verify ArangoDB integration
    // Check relationship types and connections
  })
})
```

### Next Steps After Architect Implementation

1. **Test & Validate**: Thoroughly test the Architect crew with various story types
2. **Monitor Performance**: Track execution time, token usage, and accuracy
3. **Iterate & Improve**: Refine prompts and tools based on results
4. **Add Director Crew**: Implement Phase 2 once Phase 1 is stable
5. **Scale Gradually**: Add remaining crews one by one

This implementation provides a solid foundation for your agent-based architecture while maintaining the efficiency and maintainability of your existing monolith structure.

## CrewAI Server Hosting Strategy

### Important Clarification: CrewAI Architecture

The `npm install crewai` command installs the **@ag-ui/crewai** package, which is an AG-UI compatible client for connecting to CrewAI servers. This means we need to consider the server hosting architecture:

### Option 1: Dedicated CrewAI Server (Recommended)

**Ubuntu Production Server Setup:**

```bash
# On Ubuntu production server
# Install Python and CrewAI server
sudo apt update
sudo apt install python3 python3-pip python3-venv

# Create CrewAI environment
python3 -m venv crewai-env
source crewai-env/bin/activate

# Install CrewAI server dependencies
pip install crewai crewai-tools langchain openai aiohttp fastapi uvicorn

# Install ArangoDB client for graph operations
pip install python-arango

# Create CrewAI server directory
mkdir /opt/crewai-server
cd /opt/crewai-server
```

**CrewAI Server Structure:**
```
/opt/crewai-server/
├── main.py                    # FastAPI server entry point
├── crews/                     # CrewAI crew definitions
│   ├── architect_crew.py      # Phase 1: Story Architecture
│   ├── director_crew.py       # Phase 2: Scene Breakdown
│   ├── specialist_crews.py    # Phase 3: Parallel specialists
│   └── supervisor_crew.py     # Phase 4: Quality Control
├── tools/                     # Custom CrewAI tools
│   ├── payload_tool.py        # PayloadCMS integration
│   ├── arangodb_tool.py       # Graph database tool
│   └── baml_tool.py          # BAML integration
├── services/                  # External service integrations
│   ├── database_service.py    # Database operations
│   └── api_client.py         # Novel Movie API client
├── config/                    # Configuration files
│   ├── settings.py           # Environment settings
│   └── crew_configs.py       # Crew-specific configurations
└── requirements.txt          # Python dependencies
```

**CrewAI Server Implementation:**

```python
# /opt/crewai-server/main.py
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from crews.architect_crew import ArchitectCrew
from crews.director_crew import DirectorCrew
import asyncio
import logging

app = FastAPI(title="Novel Movie CrewAI Server", version="1.0.0")

class CrewRequest(BaseModel):
    crew_type: str
    project_id: str
    user_id: str
    input_data: dict
    config: dict = {}

class CrewResponse(BaseModel):
    success: bool
    job_id: str
    result: dict = None
    error: str = None

@app.post("/crews/execute", response_model=CrewResponse)
async def execute_crew(request: CrewRequest):
    try:
        crew_map = {
            'architect': ArchitectCrew,
            'director': DirectorCrew,
            # Add other crews as implemented
        }

        if request.crew_type not in crew_map:
            raise HTTPException(status_code=400, detail=f"Unknown crew type: {request.crew_type}")

        crew_class = crew_map[request.crew_type]
        crew = crew_class(
            project_id=request.project_id,
            user_id=request.user_id,
            config=request.config
        )

        # Execute crew asynchronously
        result = await asyncio.create_task(crew.execute_async(request.input_data))

        return CrewResponse(
            success=True,
            job_id=result.get('job_id'),
            result=result
        )

    except Exception as e:
        logging.error(f"Crew execution failed: {str(e)}")
        return CrewResponse(
            success=False,
            job_id="",
            error=str(e)
        )

@app.get("/crews/status/{job_id}")
async def get_crew_status(job_id: str):
    # Implement job status tracking
    pass

@app.get("/health")
async def health_check():
    return {"status": "healthy", "service": "crewai-server"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
```

### Option 2: Embedded CrewAI (Alternative)

If you prefer to keep everything in the monolith, we can run CrewAI directly in Node.js using Python child processes:

```typescript
// agents/core/crew-executor.ts
import { spawn } from 'child_process'
import path from 'path'

export class CrewExecutor {
  private static pythonPath = process.env.CREWAI_PYTHON_PATH || 'python3'
  private static crewScriptPath = path.join(process.cwd(), 'agents', 'python-crews')

  static async executeCrew(crewType: string, inputData: any): Promise<any> {
    return new Promise((resolve, reject) => {
      const scriptPath = path.join(this.crewScriptPath, `${crewType}_crew.py`)
      const child = spawn(this.pythonPath, [scriptPath], {
        stdio: ['pipe', 'pipe', 'pipe']
      })

      child.stdin.write(JSON.stringify(inputData))
      child.stdin.end()

      let output = ''
      let error = ''

      child.stdout.on('data', (data) => {
        output += data.toString()
      })

      child.stderr.on('data', (data) => {
        error += data.toString()
      })

      child.on('close', (code) => {
        if (code === 0) {
          try {
            resolve(JSON.parse(output))
          } catch (e) {
            reject(new Error(`Failed to parse crew output: ${output}`))
          }
        } else {
          reject(new Error(`Crew execution failed: ${error}`))
        }
      })
    })
  }
}
```

### Recommended Approach: Dedicated Server

**Advantages of Ubuntu Server Hosting:**
- **Performance**: Dedicated resources for AI processing
- **Scalability**: Easy to scale CrewAI server independently
- **Isolation**: Separate concerns and failure domains
- **Python Ecosystem**: Native CrewAI environment
- **Resource Management**: Better control over GPU/CPU allocation

**Network Architecture:**
```
Novel Movie App (Node.js) → CrewAI Server (Ubuntu/Python) → External APIs
                          ↓
                    PayloadCMS/MongoDB
                          ↓
                      ArangoDB
```

### Client Integration in Novel Movie

```typescript
// agents/core/crewai-client.ts
export class CrewAIClient {
  private baseUrl: string
  private apiKey: string

  constructor() {
    this.baseUrl = process.env.CREWAI_SERVER_URL || 'http://localhost:8000'
    this.apiKey = process.env.CREWAI_API_KEY || ''
  }

  async executeCrew(crewType: string, projectId: string, userId: string, inputData: any) {
    const response = await fetch(`${this.baseUrl}/crews/execute`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.apiKey}`
      },
      body: JSON.stringify({
        crew_type: crewType,
        project_id: projectId,
        user_id: userId,
        input_data: inputData
      })
    })

    if (!response.ok) {
      throw new Error(`CrewAI request failed: ${response.statusText}`)
    }

    return await response.json()
  }

  async getCrewStatus(jobId: string) {
    const response = await fetch(`${this.baseUrl}/crews/status/${jobId}`)
    return await response.json()
  }
}
```

### Updated Workflow Orchestrator

```typescript
// agents/core/workflow-orchestrator.ts (Updated)
import { CrewAIClient } from './crewai-client'
import { QueueService } from '../../lib/queue/queue-service'

export class WorkflowOrchestrator {
  private static crewClient = new CrewAIClient()

  static async executePhase1(projectId: string, storyData: any): Promise<string> {
    const jobId = crypto.randomUUID()

    await QueueService.addAgentJob({
      id: jobId,
      projectId,
      userId: storyData.userId,
      agentType: 'architect',
      phase: 1,
      inputData: storyData,
      createdAt: new Date()
    })

    return jobId
  }

  // Internal execution methods (called by queue processors)
  static async _executeArchitectCrew(data: any): Promise<any> {
    return await this.crewClient.executeCrew(
      'architect',
      data.projectId,
      data.userId,
      data.inputData
    )
  }
}
```

## Implementation Roadmap

### Phase 1: Foundation Setup (Week 1)

#### Step 1: CrewAI Server Setup
```bash
# On Ubuntu production server
git clone <your-novel-movie-repo>
cd novel-movie

# Create CrewAI server directory
sudo mkdir -p /opt/crewai-server
sudo chown $USER:$USER /opt/crewai-server

# Setup Python environment
python3 -m venv /opt/crewai-server/venv
source /opt/crewai-server/venv/bin/activate

# Install dependencies
pip install crewai crewai-tools langchain openai aiohttp fastapi uvicorn python-arango
```

#### Step 2: Novel Movie Client Setup
```bash
# In your Novel Movie project
npm install @ag-ui/crewai axios

# Add environment variables to .env
echo "CREWAI_SERVER_URL=http://your-ubuntu-server:8000" >> .env
echo "CREWAI_API_KEY=your-secure-api-key" >> .env
```

#### Step 3: Create Base Infrastructure
```bash
# Create agent directories
mkdir -p agents/core/{tools,types}
mkdir -p agents/phase-1-architect/{tasks,agents}
mkdir -p agents/services

# Create CrewAI server structure
mkdir -p /opt/crewai-server/{crews,tools,services,config}
```

### Phase 2: Architect Agent Implementation (Week 2)

#### Step 1: Implement CrewAI Server Components
1. **Create FastAPI server** (`/opt/crewai-server/main.py`)
2. **Implement Architect Crew** (`/opt/crewai-server/crews/architect_crew.py`)
3. **Create PayloadCMS tool** (`/opt/crewai-server/tools/payload_tool.py`)
4. **Create PathRAG tool** (`/opt/crewai-server/tools/pathrag_tool.py`)

#### Step 2: Implement Novel Movie Client
1. **Create CrewAI client** (`agents/core/crewai-client.ts`)
2. **Update workflow orchestrator** (`agents/core/workflow-orchestrator.ts`)
3. **Create API endpoint** (`src/app/v1/agents/architect/route.ts`)
4. **Update queue processor** (`lib/queue/crew-orchestrator.ts`)

#### Step 3: PathRAG Integration
1. **Verify PathRAG service** connectivity (`http://movie.ft.tc:5000`)
2. **Create PathRAG service** (`agents/services/pathrag-service.ts`)
3. **Implement knowledge graph operations** using PathRAG API
4. **Test custom knowledge graph insertion** for story elements

### Phase 3: Testing & Validation (Week 3)

#### Step 1: Unit Tests
```typescript
// tests/agents/architect-crew.test.ts
describe('ArchitectCrew Integration', () => {
  it('should connect to CrewAI server', async () => {
    const client = new CrewAIClient()
    const health = await client.healthCheck()
    expect(health.status).toBe('healthy')
  })

  it('should execute architect crew successfully', async () => {
    const result = await WorkflowOrchestrator.executePhase1('test-project', {
      storyText: mockStory,
      userId: 'test-user'
    })
    expect(result).toBeDefined()
  })
})
```

#### Step 2: Integration Tests
1. **End-to-end story processing** test
2. **PathRAG integration** validation
3. **Queue system** functionality test
4. **Error handling** scenarios
5. **Natural language querying** tests

#### Step 3: Performance Testing
1. **Load testing** CrewAI server
2. **Memory usage** monitoring
3. **Response time** benchmarks
4. **Concurrent request** handling

### Phase 4: Production Deployment (Week 4)

#### Step 1: Server Configuration
```bash
# Setup systemd service for CrewAI server
sudo tee /etc/systemd/system/crewai-server.service > /dev/null <<EOF
[Unit]
Description=CrewAI Server for Novel Movie
After=network.target

[Service]
Type=simple
User=crewai
WorkingDirectory=/opt/crewai-server
Environment=PATH=/opt/crewai-server/venv/bin
ExecStart=/opt/crewai-server/venv/bin/python main.py
Restart=always

[Install]
WantedBy=multi-user.target
EOF

sudo systemctl enable crewai-server
sudo systemctl start crewai-server
```

#### Step 2: Monitoring & Logging
1. **Setup logging** for CrewAI server
2. **Configure monitoring** (Prometheus/Grafana)
3. **Error tracking** (Sentry integration)
4. **Performance metrics** collection

#### Step 3: Security Configuration
1. **API key authentication**
2. **Network security** (firewall rules)
3. **SSL/TLS** configuration
4. **Rate limiting** implementation

### Phase 5: Scaling & Additional Agents (Weeks 5-8)

#### Week 5: Director Agent (Phase 2)
- Implement scene breakdown functionality
- Add shot generation capabilities
- Integrate with story graph queries

#### Week 6: Specialist Agents (Phase 3)
- Cinematographer agent for camera work
- Art director agent for assets
- Sound designer agent for audio

#### Week 7: Supervisor Agent (Phase 4)
- Quality control automation
- Consistency validation
- Error detection and correction

#### Week 8: Optimization & Polish
- Performance tuning
- Error handling improvements
- Documentation completion
- User interface integration

## Quick Start Guide

### For Development:
1. **Clone repository** and setup environment
2. **Start with embedded approach** for rapid prototyping
3. **Use mock data** for initial testing
4. **Implement one agent** at a time

### For Production:
1. **Setup dedicated Ubuntu server** for CrewAI
2. **Configure proper networking** and security
3. **Implement comprehensive monitoring**
4. **Plan for horizontal scaling**

### Success Metrics:
- **Story parsing accuracy**: >95% scene identification
- **PathRAG integration**: <30 seconds per story graph creation
- **Query response time**: <3 seconds for context retrieval
- **System reliability**: 99.9% uptime
- **Natural language query accuracy**: >90% relevant results

This roadmap provides a clear path from initial setup to full production deployment, with specific milestones and success criteria for each phase.

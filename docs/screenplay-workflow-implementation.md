# Screenplay Workflow Implementation

## Overview

The screenplay workflow is a comprehensive step-by-step system that transforms completed stories into professional screenplays. This implementation provides a structured approach where each step builds upon the previous ones, with clear dependencies and progress tracking.

## Architecture

### Page Structure
- **Main Page**: `/project/[id]/screenplay`
- **Sidebar**: Step-by-step progress tracking with status indicators
- **Content Area**: Detailed step execution interface with expandable sections

### Key Components

1. **ScreenplayPage** (`src/app/(frontend)/project/[id]/screenplay/page.tsx`)
   - Main page component with prerequisite checking
   - Requires completed story before allowing access
   - Integrates with project context

2. **ScreenplayStatusSidebar** (`src/components/screenplay/ScreenplayStatusSidebar.tsx`)
   - Fixed sidebar showing all 9 workflow steps
   - Progress tracking with completion percentage
   - Step availability based on dependencies
   - Visual status indicators (completed, in-progress, not-started, error)

3. **ScreenplayContent** (`src/components/screenplay/ScreenplayContent.tsx`)
   - Main content area with expandable step sections
   - Individual step execution interface
   - Status badges and action buttons

## Workflow Steps

### 1. Story Foundation ✅
- **Status**: Completed (prerequisite)
- **Purpose**: Validates that a completed story exists
- **Dependencies**: None
- **Data Source**: Existing Story collection

### 2. Story Structure Planning 🔄
- **Purpose**: Define three-act structure, story beats, character arcs
- **Dependencies**: Story Foundation
- **Estimated Time**: 5-10 minutes
- **AI Services**: StructureExpert, BeatPlanner, ArcDesigner

### 3. Character Development 🔄
- **Purpose**: Create detailed character profiles, relationships, dialogue voices
- **Dependencies**: Story Structure Planning
- **Estimated Time**: 10-15 minutes
- **AI Services**: CharacterPsychologist, DialogueSpecialist, RelationshipMapper

### 4. Story Outline Creation 🔄
- **Purpose**: Build scene-by-scene outline with character presence
- **Dependencies**: Character Development
- **Estimated Time**: 8-12 minutes
- **AI Services**: SceneArchitect, PacingExpert, ContinuityChecker

### 5. Screenplay Generation 🔄
- **Purpose**: Generate full screenplay in industry-standard format
- **Dependencies**: Story Outline Creation
- **Estimated Time**: 15-20 minutes
- **AI Services**: ScreenplayFormatter, DialogueMaster, ActionWriter

### 6. Screenplay Revision 🔄
- **Purpose**: Quality review, revisions, and improvements
- **Dependencies**: Screenplay Generation
- **Estimated Time**: 10-15 minutes
- **AI Services**: StoryAnalyzer, FormatValidator, MarketabilityAssessor

### 7. Scene Planning & Breakdown 🔄
- **Purpose**: Create visual scene descriptions and shot planning
- **Dependencies**: Screenplay Revision
- **Estimated Time**: 20-30 minutes
- **Integration**: CrewAI Director Crew

### 8. Media Generation 🔄
- **Purpose**: Generate scene images, video sequences, audio integration
- **Dependencies**: Scene Planning
- **Estimated Time**: 30-60 minutes
- **Services**: FAL AI, BAML, existing media generation pipeline

### 9. Final Assembly 🔄
- **Purpose**: Complete movie assembly and post-production
- **Dependencies**: Media Generation
- **Estimated Time**: 15-25 minutes

## Technical Implementation

### Navigation Integration
- Updated sidebar navigation to include "Screenplay" menu item
- Modified DashboardLayout to handle screenplay page's custom sidebar
- Screenplay page uses its own sidebar like the Story page

### Status Management
Each step tracks:
- **Status**: `completed | in-progress | not-started | error`
- **Dependencies**: Array of prerequisite step IDs
- **Availability**: Calculated based on dependency completion
- **Metrics**: Quality scores and progress details
- **Estimated Time**: User guidance for planning

### User Experience Features
- **Progress Bar**: Overall completion percentage
- **Step Numbering**: Clear sequence indicators
- **Expandable Sections**: Detailed step information
- **Action Buttons**: Context-aware "Start" buttons
- **Status Badges**: Visual completion indicators
- **Dependency Messaging**: Clear prerequisite requirements

## External Services Integration

### Text-Based Services (Screenplay Generation)
1. **BAML** - AI prompt management and text generation
2. **OpenRouter** - LLM services for story/dialogue generation
3. **CrewAI Server** - AI agent orchestration (Architect & Director crews)
4. **PathRAG** - Story knowledge graph and context management
5. **Redis** - Queue management for long-running tasks
6. **MongoDB** - Data persistence
7. **Novel Movie API** - Project and story data management

### Visual Services (Later Stages)
- **FAL AI** - Media generation services
- **DINOv3** - Character consistency validation (media generation phase only)

## Testing Strategy

### Manual Testing
1. **Prerequisites**: Ensure project has completed story
2. **Navigation**: Verify screenplay menu item appears
3. **Page Access**: Test screenplay page loads correctly
4. **Step Progression**: Verify dependency-based step availability
5. **UI Interaction**: Test expandable sections and action buttons

### Automated Testing
- **Page Accessibility**: Test screenplay page responds correctly
- **Data Requirements**: Verify story prerequisite checking
- **Navigation Integration**: Confirm sidebar updates
- **Service Health**: Individual external service testing

## Next Steps for Implementation

### Phase 1: Core Infrastructure ✅
- [x] Page structure and navigation
- [x] Sidebar progress tracking
- [x] Step dependency system
- [x] UI components and layout

### Phase 2: Step Implementation 🔄
- [ ] Story Structure Planning API and logic
- [ ] Character Development system
- [ ] Story Outline Creation workflow
- [ ] Screenplay Generation engine

### Phase 3: Advanced Features 🔄
- [ ] Real-time progress updates
- [ ] Step result persistence
- [ ] Quality metrics integration
- [ ] Error handling and retry logic

### Phase 4: Production Integration 🔄
- [ ] CrewAI service integration
- [ ] Media generation pipeline
- [ ] Final assembly workflow
- [ ] Export and distribution features

## File Structure

```
src/
├── app/(frontend)/project/[id]/screenplay/
│   └── page.tsx                           # Main screenplay page
├── components/screenplay/
│   ├── ScreenplayStatusSidebar.tsx        # Progress sidebar
│   └── ScreenplayContent.tsx              # Main content area
├── components/layout/
│   ├── DashboardLayout.tsx                # Updated for screenplay
│   └── Sidebar.tsx                        # Updated navigation
└── scripts/
    ├── test-screenplay-page.js             # Page testing
    └── test-screenplay-generation.js       # Service testing
```

## Usage Instructions

1. **Access Requirements**: Project must have a completed story
2. **Navigation**: Use sidebar "Screenplay" menu item
3. **Step Execution**: Click "Start" on available steps
4. **Progress Tracking**: Monitor completion in sidebar
5. **Dependencies**: Complete steps in order for best results

This implementation provides a solid foundation for the screenplay generation workflow while maintaining flexibility for future enhancements and integrations.

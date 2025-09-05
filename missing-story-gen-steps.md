# Missing Story Generation Steps Implementation Plan

## Current State Analysis

### Current Sidebar Steps (6 steps shown):
1. **Project Setup** ✅ - Based on project fields completion
2. **Story Generation** ✅ - Shows step 3/12, quality score 9
3. **Character Development** ❌ - Based on `characterDepth` metric ≥ 7
4. **Visual Storytelling** ❌ - Based on `visualStorytelling` metric ≥ 7
5. **Audience Engagement** ❌ - Based on `audienceEngagement` metric ≥ 7
6. **Production Ready** ❌ - Based on `productionReadiness` metric ≥ 8

### Backend Enhancement Steps (12 steps total):
**Steps 1-3**: Foundation (✅ Completed)
- Step 1: Initial setup
- Step 2: Basic structure  
- Step 3: Initial story generation ← **Current position**

**Steps 4-12**: Missing from UI sidebar
- Step 4: Story Structure → `structureScore`
- Step 5: Character Development → `characterDepth`
- Step 6: Story Coherence → `coherenceScore`
- Step 7: Conflict & Tension → `conflictTension`
- Step 8: Dialogue Quality → `dialogueQuality`
- Step 9: Genre Alignment → `genreAlignment`
- Step 10: Audience Engagement → `audienceEngagement`
- Step 11: Visual Storytelling → `visualStorytelling`
- Step 12: Production Readiness → `productionReadiness`

## Problem Identification

### Missing Steps in UI:
1. **Story Structure** (Step 4) - No sidebar representation
2. **Story Coherence** (Step 6) - No sidebar representation  
3. **Conflict & Tension** (Step 7) - No sidebar representation
4. **Dialogue Quality** (Step 8) - No sidebar representation
5. **Genre Alignment** (Step 9) - No sidebar representation

### Inconsistent Mapping:
- UI shows 6 conceptual areas based on final metrics
- Backend has 12 sequential enhancement steps
- No clear progression indication for steps 4-12

## Implementation Plan

### Phase 1: Complete Sidebar Steps (Priority: HIGH)

#### 1.1 Add Missing Quality Metric Steps
Add the missing 5 steps to `StoryStatusSidebar.tsx`:

```typescript
// Add after existing steps, before return items
// Story Structure (Step 4)
items.push({
  id: 'story-structure',
  label: 'Story Structure',
  status: story?.qualityMetrics?.structureScore
    ? story.qualityMetrics.structureScore >= 7
      ? 'completed'
      : 'in-progress'
    : 'not-started',
  icon: <Target className="w-4 h-4" />,
  metrics: story?.qualityMetrics?.structureScore
    ? {
        score: story.qualityMetrics.structureScore,
        details: 'Structure quality score',
      }
    : undefined,
})

// Story Coherence (Step 6)
items.push({
  id: 'story-coherence',
  label: 'Story Coherence',
  status: story?.qualityMetrics?.coherenceScore
    ? story.qualityMetrics.coherenceScore >= 7
      ? 'completed'
      : 'in-progress'
    : 'not-started',
  icon: <CheckCircle className="w-4 h-4" />,
  metrics: story?.qualityMetrics?.coherenceScore
    ? {
        score: story.qualityMetrics.coherenceScore,
        details: 'Coherence quality score',
      }
    : undefined,
})

// Conflict & Tension (Step 7)
items.push({
  id: 'conflict-tension',
  label: 'Conflict & Tension',
  status: story?.qualityMetrics?.conflictTension
    ? story.qualityMetrics.conflictTension >= 7
      ? 'completed'
      : 'in-progress'
    : 'not-started',
  icon: <Zap className="w-4 h-4" />,
  metrics: story?.qualityMetrics?.conflictTension
    ? {
        score: story.qualityMetrics.conflictTension,
        details: 'Conflict tension score',
      }
    : undefined,
})

// Dialogue Quality (Step 8)
items.push({
  id: 'dialogue-quality',
  label: 'Dialogue Quality',
  status: story?.qualityMetrics?.dialogueQuality
    ? story.qualityMetrics.dialogueQuality >= 7
      ? 'completed'
      : 'in-progress'
    : 'not-started',
  icon: <MessageSquare className="w-4 h-4" />,
  metrics: story?.qualityMetrics?.dialogueQuality
    ? {
        score: story.qualityMetrics.dialogueQuality,
        details: 'Dialogue quality score',
      }
    : undefined,
})

// Genre Alignment (Step 9)
items.push({
  id: 'genre-alignment',
  label: 'Genre Alignment',
  status: story?.qualityMetrics?.genreAlignment
    ? story.qualityMetrics.genreAlignment >= 7
      ? 'completed'
      : 'in-progress'
    : 'not-started',
  icon: <Tag className="w-4 h-4" />,
  metrics: story?.qualityMetrics?.genreAlignment
    ? {
        score: story.qualityMetrics.genreAlignment,
        details: 'Genre alignment score',
      }
    : undefined,
})
```

#### 1.2 Update Icon Imports
Add missing icons to the import statement:
```typescript
import { 
  Check, X, Loader2, BookOpen, Users, Palette, Target, Lightbulb, Film,
  CheckCircle, Zap, MessageSquare, Tag
} from 'lucide-react'
```

#### 1.3 Reorder Steps Logically
Arrange steps in logical enhancement order:
1. Project Setup
2. Story Generation  
3. Story Structure
4. Character Development
5. Story Coherence
6. Conflict & Tension
7. Dialogue Quality
8. Genre Alignment
9. Visual Storytelling
10. Audience Engagement
11. Production Ready

### Phase 2: Fix Enhancement API Integration (Priority: HIGH)

#### 2.1 Fix API Endpoint Path
Current issue: `StoryContent.tsx` calls `/api/stories/${story.id}/enhance`
Should call: `/v1/stories/${story.id}/enhance`

Update in `src/components/story/StoryContent.tsx`:
```typescript
const response = await fetch(`/v1/stories/${story.id}/enhance`, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
})
```

#### 2.2 Implement Real BAML Enhancement
Replace placeholder enhancement in `/v1/stories/[id]/enhance/route.ts`:

```typescript
async function enhanceStoryContent(
  currentContent: string,
  enhancementFocus: any,
  currentMetrics: any
): Promise<string> {
  // Use BAML for actual story enhancement
  const baml = getBamlClient()
  
  const enhancedStory = await baml.EnhanceStory({
    currentStory: currentContent,
    focusArea: enhancementFocus.name,
    targetMetrics: enhancementFocus.targetMetrics,
    currentQuality: currentMetrics
  })
  
  return enhancedStory
}
```

### Phase 3: UI/UX Improvements (Priority: MEDIUM)

#### 3.1 Add Step Numbers
Show step numbers (1-11) in sidebar for clarity

#### 3.2 Add Progress Indicators
- Show current enhancement step prominently
- Add "Next Step" indicator
- Show estimated time for next enhancement

#### 3.3 Add Enhancement Controls
- "Enhance Next Step" button in sidebar
- "Auto-enhance All" option
- Step-by-step manual control

### Phase 4: BAML Integration (Priority: HIGH)

#### 4.1 Create BAML Enhancement Functions
Add to `baml_src/story_generation.baml`:

```baml
function EnhanceStory(currentStory: string, focusArea: string, targetMetrics: string[], currentQuality: QualityMetrics) -> string {
  client GPT4
  prompt #"
    Enhance this story focusing on {{ focusArea }}.
    
    Current story:
    {{ currentStory }}
    
    Focus on improving: {{ targetMetrics | join(", ") }}
    Current quality scores: {{ currentQuality }}
    
    Return the enhanced story with improved {{ focusArea }}.
    Maintain the story's core plot and characters while enhancing the specified areas.
  "#
}
```

## Implementation Priority

### Immediate (This Sprint):
1. ✅ Add missing 5 steps to sidebar
2. ✅ Fix API endpoint path  
3. ✅ Update icon imports
4. ✅ Reorder steps logically

### Next Sprint:
1. 🔄 Implement real BAML enhancement
2. 🔄 Add step numbers and progress indicators
3. 🔄 Test enhancement workflow end-to-end

### Future:
1. 📋 Add manual step controls
2. 📋 Add auto-enhance all option
3. 📋 Improve error handling and user feedback

## Files to Modify

1. `src/components/story/StoryStatusSidebar.tsx` - Add missing steps
2. `src/components/story/StoryContent.tsx` - Fix API path
3. `src/app/v1/stories/[id]/enhance/route.ts` - Implement BAML
4. `baml_src/story_generation.baml` - Add enhancement functions

## Success Criteria

- ✅ All 11 story development steps visible in sidebar
- ✅ Steps show correct status based on quality metrics
- ✅ Enhancement API successfully progresses through steps 4-12
- ✅ Story status changes to "completed" after step 12
- ✅ Screenplay generation unlocks after story completion

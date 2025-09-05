# Story Bible & Time-Aware Screenplay Generation Plan

## Project Context

**System:** Novel Movie production system built with PayloadCMS 3.x and Next.js 15.x
**Workflow:** Project Details → Story Generation → Screenplay Elements Generation
**Current Issue:** Screenplay generation ignores time constraints and lacks story bible functionality

## Problem Analysis

### Current Issue with Project ID: 68b9d1457ae0c1549464f026
- **Duration:** 1-minute movie
- **Problem:** Story Structure planning at `/screenplay` page ignores 1-minute constraint
- **Quality:** Good content quality but missing time-sensitivity
- **Root Cause:** BAML prompts lack ultra-short format optimization

### Technical Investigation Results

#### Time Constraint Handling Assessment
**Current State:**
- ✅ BAML prompts include `durationUnit` parameter
- ✅ Story generation uses duration calculations: `{{ (durationUnit * 0.25)|round }}`
- ❌ Missing specific constraints for ultra-short formats (< 5 minutes)
- ❌ No pacing optimization for 1-minute films
- ❌ Lacks scene economy guidelines for short formats

**Key Files Analyzed:**
- `baml_src/story_structure.baml` - Lines 87-95: `AnalyzeStoryStructure` function
- `baml_src/story_generation.baml` - Lines 101-119: Duration-aware act structure
- `src/app/v1/projects/[id]/story-structure/route.ts` - API implementation

#### Story Bible Functionality Gap
**Missing Components:**
- No dedicated story bible collection
- Character development scattered across multiple collections
- Missing centralized consistency guidelines
- No world-building element tracking
- Absent thematic coherence system

**Existing Collections Analysis:**
- `Characters` - Comprehensive character development ✅
- `FundamentalData` - Visual style and references ✅
- `StoryStructures` - Three-act breakdown ✅
- `StoryBible` - **MISSING** ❌

## Implementation Plan

### Phase 1A: Enhanced Time-Aware Screenplay Generation ✅ **COMPLETED**

### Phase 1B: Duration-Adaptive Narrative Structures ✅ **COMPLETED**

#### Industry-Standard Structures by Duration:

1. **Micro-format (≤2 minutes): Single Moment Structure**
   - **Structure**: One dramatic moment/realization
   - **Beats**: Setup → Conflict/Revelation → Impact (3 beats)
   - **Industry Use**: Commercial spots, viral content, proof-of-concept

2. **Ultra-short (2-5 minutes): Compressed Three-Act**
   - **Structure**: Rapid three-act with immediate engagement
   - **Beats**: Hook → Escalation → Resolution (5-6 beats)
   - **Industry Use**: Festival shorts, online content

3. **Short Film (5-30 minutes): Traditional Three-Act**
   - **Structure**: Classic beginning/middle/end with full character arc
   - **Beats**: Setup → Inciting Incident → Rising Action → Climax → Resolution (8-12 beats)
   - **Industry Use**: Film festivals, anthology films

4. **Medium Format (30-60 minutes): Five-Act Structure**
   - **Structure**: Extended development with multiple turning points
   - **Beats**: Setup → Rising Action → Midpoint → Complications → Climax → Resolution (12-18 beats)
   - **Industry Use**: TV movies, streaming specials, limited series episodes

5. **Feature Length (60-120 minutes): Save the Cat Beat Sheet**
   - **Structure**: Blake Snyder's proven 15-beat Hollywood structure
   - **Beats**: 15 specific story beats with precise timing
   - **Industry Use**: Theatrical releases, streaming features

6. **Extended Format (120+ minutes): Eight-Sequence Structure**
   - **Structure**: Eight mini-movies, each with its own arc
   - **Beats**: 24-32 beats across 8 sequences
   - **Industry Use**: Epics, complex narratives, franchise films

### Phase 1: Enhanced Time-Aware Screenplay Generation ✅ **COMPLETED**

#### 1.1 BAML Prompt Enhancement ✅ **COMPLETED**
**Target Files:**
- `baml_src/story_structure.baml` ✅
- `baml_src/story_generation.baml` ✅
- `baml_src/character_development.baml` ✅

**Implemented Comprehensive Duration-Adaptive System:**
- **Micro-format (30 seconds - 2 minutes)**: Single moment/conflict, minimal characters, one location
- **Ultra-short (2-5 minutes)**: Simple three-act structure, limited characters and locations
- **Short film (5-30 minutes)**: Traditional three-act with compressed development
- **Medium format (30-60 minutes)**: Full character arcs with subplot potential
- **Feature length (60-120 minutes)**: Complex multi-layered storytelling
- **Extended format (120+ minutes)**: Epic scope with multiple storylines

**Dynamic Calculations Implemented:**
- Optimal story beats based on duration (2-35 beats)
- Character count recommendations (1-20+ characters)
- Location limitations (1-25+ locations)
- Subplot complexity allowances (0-5 subplots)
- Pacing guidelines (0.15-2.0 beats per minute)
- Adaptive act duration ratios

**Enhanced BAML Functions:**
```baml
// Comprehensive duration-adaptive constraints
{% if durationUnit <= 2 %}
MICRO-FORMAT ({{ durationUnit }} minutes):
- Story Beats: 2-4 maximum (every {{ (durationUnit / 3)|round(1) }} minutes)
- Characters: 1-2 maximum (focus on single protagonist)
- Locations: 1 location only
- Structure: Single moment/conflict with immediate resolution
- Subplots: None - single narrative thread only
- Pacing: Immediate story entry, no setup time
- Act Ratios: 20% setup / 60% conflict / 20% resolution
{% elif durationUnit <= 5 %}
ULTRA-SHORT ({{ durationUnit }} minutes):
- Story Beats: 3-6 maximum (every {{ (durationUnit / 5)|round(1) }} minutes)
- Characters: 2-3 maximum (protagonist + 1-2 others)
- Locations: 1-2 locations maximum
// ... continues for all duration ranges
{% endif %}
```

#### 1.2 Story Structure API Enhancement ✅ **COMPLETED**
**Target File:** `src/app/v1/projects/[id]/story-structure/route.ts` ✅

**Implemented Features:**
- **Comprehensive Duration Constraints System**: Dynamic constraint calculation for all duration ranges
- **Format-Specific Validation Logic**: Validates story beats, characters, locations, subplots against duration limits
- **Adaptive Pacing Metrics**: Calculates and validates beats-per-minute pacing for each format
- **Quality Score Adjustments**: Automatically adjusts quality scores based on duration compliance
- **Compliance Tracking**: Detailed warnings, recommendations, and pacing guidelines

**New Validation Functions:**
```typescript
function getDurationConstraints(durationUnit: number): DurationConstraints
function validateStoryStructureCompliance(
  structureResult: any,
  constraints: DurationConstraints,
  durationUnit: number
): ComplianceResult
```

**Enhanced Collection Schema**: Added `durationCompliance` group to `StoryStructures` collection with:
- Format category and complexity level tracking
- Constraint vs. actual metrics comparison
- Compliance warnings and recommendations
- Format-specific pacing guidelines

#### 1.3 UI Enhancements 🔄 **PENDING**
**Target Files:**
- `src/components/screenplay/ScreenplayContent.tsx`
- `src/components/screenplay/ScreenplayStatusSidebar.tsx`

**Planned Features:**
- Duration-aware status indicators showing format category
- Pacing validation warnings in sidebar
- Time constraint compliance badges
- Compliance metrics display in story structure section

### Phase 2: Story Bible Collection Implementation

#### 2.1 New StoryBible Collection
**File:** `src/collections/StoryBible.ts`

**Schema Design:**
```typescript
interface StoryBible {
  // Project relationship
  project: string | Project
  projectName: string
  
  // Character consistency
  characterProfiles: {
    character: string | Character
    consistencyNotes: string
    keyTraits: string[]
    speechPatterns: string
    visualConsistency: string
  }[]
  
  // World building
  worldRules: {
    physicalLaws: string
    socialStructure: string
    technology: string
    magic: string // if applicable
  }
  
  // Thematic elements
  themes: {
    primaryTheme: string | CentralTheme
    thematicStatements: string[]
    symbolism: string
    motifs: string[]
  }
  
  // Consistency guidelines
  guidelines: {
    toneConsistency: string
    visualStyle: string
    narrativeVoice: string
    pacing: string
  }
  
  // Lore and background
  lore: {
    backstory: string
    hiddenElements: string
    futureImplications: string
  }
}
```

#### 2.2 Integration Strategy: **Integrated Approach**
**Decision:** Enhance existing screenplay generation to use story bible data rather than creating separate feature

**Rationale:**
- Maintains existing workflow continuity
- Ensures story bible data actively influences screenplay generation
- Prevents data silos and inconsistencies
- Leverages existing BAML integration patterns

### Phase 3: Workflow Integration

#### 3.1 Enhanced Character Development Step
**Target:** Character development in screenplay workflow

**Enhancements:**
- Auto-populate story bible during character generation
- Add consistency validation against existing characters
- Include character relationship mapping
- Generate speech pattern guidelines

#### 3.2 Story Structure Enhancement
**Integration Points:**
- Reference story bible for character consistency
- Validate thematic coherence across acts
- Check world-building consistency
- Ensure tone alignment with guidelines

#### 3.3 Screenplay Generation Steps
**All Steps Enhancement:**
- Story outline creation: Reference character profiles and world rules
- Scene development: Apply consistency guidelines
- Dialogue generation: Use speech patterns from story bible
- Final screenplay: Validate against complete story bible

### Phase 4: External Service Integration

#### 4.1 Character Library Service
**Current Configuration:**
```env
CHARACTER_LIBRARY_API_URL=https://character.ft.tc
```

**Integration Plan:**
- Test external character service integration first
- Evaluate character data quality and consistency
- Determine if external characters should populate story bible
- Consider fallback to local character development if service unavailable

## Technical Implementation Details

### BAML Function Modifications Required

1. **AnalyzeStoryStructure** - Add duration-specific constraints
2. **DevelopCharacters** - Include story bible population
3. **GenerateInitialStory** - Enhanced time-awareness
4. **New: GenerateStoryBible** - Dedicated story bible creation function

### API Routes to Modify/Create

1. `src/app/v1/projects/[id]/story-structure/route.ts` - Enhanced time validation
2. `src/app/v1/projects/[id]/character-development/route.ts` - Story bible integration
3. **New:** `src/app/v1/projects/[id]/story-bible/route.ts` - Story bible CRUD operations

### UI Components to Update

1. `ScreenplayStatusSidebar.tsx` - Add story bible step
2. `ScreenplayContent.tsx` - Story bible section and validation
3. **New:** `StoryBibleContent.tsx` - Dedicated story bible interface

## Success Metrics

### Time-Awareness Success Criteria
- [x] **Comprehensive Duration System**: All duration ranges (30 seconds - 3+ hours) supported with adaptive constraints
- [x] **Dynamic Story Beat Calculation**: Optimal beats calculated for any duration (2-35 beats)
- [x] **Character/Location Scaling**: Appropriate limits for each format category
- [x] **Pacing Validation**: Beats-per-minute validation with format-specific guidelines
- [x] **Quality Score Adaptation**: Scores adjusted based on duration compliance
- [x] **Compliance Tracking**: Detailed warnings and recommendations system
- [ ] **UI Integration**: Duration compliance displayed in screenplay interface
- [ ] **Testing Validation**: Confirmed working with 1-minute project

### Story Bible Success Criteria (Phase 2)
- [ ] Character consistency maintained across all screenplay elements
- [ ] World-building rules enforced in scene generation
- [ ] Thematic coherence validated across story structure
- [ ] Consistency guidelines actively influence AI generation

## Implementation Status

### ✅ **COMPLETED - Phase 1: Comprehensive Duration-Adaptive System**
1. **BAML Prompt Enhancement** - All 6 narrative structures implemented with duration-specific constraints
2. **API Enhancement** - Full validation, compliance tracking, and adaptive structure generation
3. **Collection Schema** - Complete adaptive structure fields added to StoryStructures collection
4. **Validation Logic** - Constraint validation with quality adjustments for all duration ranges
5. **Narrative Structure Types** - Industry-standard structures implemented:
   - **Single Moment** (≤2 min): One dramatic moment with 3 micro-acts
   - **Compressed Three-Act** (2-5 min): Rapid three-act progression
   - **Traditional Three-Act** (5-30 min): Classic structure with full character arcs
   - **Five-Act Structure** (30-60 min): Extended development with multiple turning points
   - **Save the Cat Beat Sheet** (60-120 min): 15-beat Hollywood structure
   - **Eight-Sequence Structure** (120+ min): Eight mini-movies for epic scope

### 🔄 **CURRENT - Testing & UI Integration**
1. **Testing** - Validate with 1-minute project (ID: 68b9d1457ae0c1549464f026)
2. **UI Updates** - Display duration compliance in screenplay interface
3. **User Experience** - Show format category, warnings, and recommendations

### 📋 **NEXT - Phase 2: Story Bible Implementation**
1. **StoryBible Collection** - Create comprehensive story bible collection
2. **Integration Strategy** - Enhance existing screenplay generation workflow
3. **Character Library** - External service integration testing
4. **Workflow Testing** - End-to-end validation with story bible data

## Dependencies

- Existing BAML integration (@boundaryml/baml-nextjs-plugin)
- PayloadCMS collection patterns
- Character Library API (https://character.ft.tc)
- Incremental screenplay generation workflow preservation

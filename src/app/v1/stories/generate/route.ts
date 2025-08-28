import { NextRequest, NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '@payload-config'

export async function POST(request: NextRequest) {
  try {
    const payload = await getPayload({ config })
    const { projectId, initialConceptId } = await request.json()

    if (!projectId || !initialConceptId) {
      return NextResponse.json(
        { error: 'Project ID and Initial Concept ID are required' },
        { status: 400 },
      )
    }

    // Fetch the initial concept data
    const initialConcept = await payload.findByID({
      collection: 'initial-concepts',
      id: initialConceptId,
      depth: 2, // Include related data
    })

    if (!initialConcept) {
      return NextResponse.json({ error: 'Initial concept not found' }, { status: 404 })
    }

    // Check if story already exists for this project
    const existingStory = await payload.find({
      collection: 'stories',
      where: {
        project: {
          equals: projectId,
        },
      },
    })

    if (existingStory.docs.length > 0) {
      return NextResponse.json(existingStory.docs[0], { status: 200 })
    }

    // Generate initial story content using AI
    const storyContent = await generateInitialStory(initialConcept)

    // Create the story record
    const story = await payload.create({
      collection: 'stories',
      data: {
        project: projectId,
        projectName: initialConcept.project?.name || 'Unknown Project',
        currentContent: storyContent,
        currentStep: 3, // Initial generation is step 3
        status: 'in-progress',
        qualityMetrics: {
          overallQuality: 6, // Starting quality score
          structureScore: 6,
          characterDepth: 5,
          coherenceScore: 7,
          conflictTension: 5,
          dialogueQuality: 5,
          genreAlignment: 7,
          audienceEngagement: 5,
          visualStorytelling: 4,
          productionReadiness: 3,
        },
        generationParameters: {
          model: 'gpt-4',
          temperature: 0.8,
          maxTokens: 2000,
          prompt: 'initial-story-generation',
        },
        enhancementHistory: [],
      },
    })

    return NextResponse.json(story, { status: 201 })
  } catch (error) {
    console.error('Error generating story:', error)
    return NextResponse.json({ error: 'Failed to generate story' }, { status: 500 })
  }
}

async function generateInitialStory(initialConcept: any): Promise<string> {
  // This is a placeholder for the actual AI story generation
  // In a real implementation, this would call your AI service (BAML, OpenAI, etc.)

  const genres = initialConcept.primaryGenres?.map((g: any) => g.name || g).join(', ') || 'Unknown'
  const premise = initialConcept.corePremise || 'A story waiting to be told'
  const audience =
    initialConcept.targetAudience?.demographics?.map((d: any) => d.name || d).join(', ') ||
    'General audience'
  const tones =
    initialConcept.toneAndMood?.tones?.map((t: any) => t.name || t).join(', ') || 'Balanced'

  // Generate a basic story structure
  const storyTemplate = `
**Genre:** ${genres}
**Tone:** ${tones}
**Target Audience:** ${audience}

**STORY OUTLINE:**

**Act I - Setup**
${premise}

Our protagonist finds themselves in a world where the ordinary rules no longer apply. The initial conflict emerges from their desire to maintain normalcy while being thrust into extraordinary circumstances.

**Act II - Confrontation**
As the stakes rise, our protagonist must confront not only external challenges but also internal doubts and fears. The central conflict intensifies, forcing difficult choices that will define their character.

**Act III - Resolution**
Through courage, growth, and perhaps unexpected allies, our protagonist faces the final challenge. The resolution brings not just victory, but transformation - both for the character and their world.

**CHARACTER ARCS:**
- Protagonist: Begins reluctant, grows into a confident leader
- Supporting characters: Each represents different aspects of the central theme
- Antagonist: Embodies the opposite of what the protagonist must become

**VISUAL ELEMENTS:**
The story unfolds through carefully crafted scenes that balance dialogue with action, ensuring each moment serves both character development and plot advancement.

**THEMATIC RESONANCE:**
This narrative explores themes of growth, courage, and the power of choice, delivering a message that resonates with the ${audience} audience while maintaining the ${tones} tone throughout.

*This is an initial story draft that will be enhanced through multiple iterations to improve character depth, dialogue quality, visual storytelling, and overall narrative coherence.*
  `.trim()

  return storyTemplate
}

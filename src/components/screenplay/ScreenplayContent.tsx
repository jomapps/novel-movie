'use client'

import { useState, useEffect } from 'react'
import { Project, Story } from '@/payload-types'
import Button from '@/components/ui/Button'
import {
  BookOpen,
  Target,
  Users,
  FileText,
  Film,
  Lightbulb,
  Clapperboard,
  Video,
  Package,
  Play,
  CheckCircle,
  AlertCircle,
  Clock,
  RotateCcw,
} from 'lucide-react'

interface ScreenplayContentProps {
  project: Project
  story: Story
}

interface StepContentProps {
  stepId: string
  title: string
  description: string
  icon: React.ReactNode
  status: 'completed' | 'not-started' | 'in-progress' | 'error'
  isAvailable: boolean
  onExecute: () => void
  children?: React.ReactNode
}

function StepContent({
  stepId,
  title,
  description,
  icon,
  status,
  isAvailable,
  onExecute,
  children,
}: StepContentProps) {
  const [isExpanded, setIsExpanded] = useState(status === 'in-progress')

  const getStatusBadge = () => {
    switch (status) {
      case 'completed':
        return (
          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
            <CheckCircle className="w-3 h-3 mr-1" />
            Completed
          </span>
        )
      case 'in-progress':
        return (
          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
            <Clock className="w-3 h-3 mr-1" />
            In Progress
          </span>
        )
      case 'error':
        return (
          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
            <AlertCircle className="w-3 h-3 mr-1" />
            Error
          </span>
        )
      default:
        return (
          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
            Not Started
          </span>
        )
    }
  }

  return (
    <div className="border border-gray-200 rounded-lg mb-6">
      <div
        className="p-6 cursor-pointer hover:bg-gray-50 transition-colors"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <span className="mr-3 text-gray-400">{icon}</span>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
              <p className="text-sm text-gray-600 mt-1">{description}</p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            {getStatusBadge()}
            {isAvailable && status === 'not-started' && (
              <Button
                onClick={(e) => {
                  e.stopPropagation()
                  onExecute()
                }}
                size="sm"
                className="inline-flex items-center"
              >
                <Play className="w-4 h-4 mr-1" />
                Start
              </Button>
            )}
            {status === 'completed' && (
              <Button
                onClick={(e) => {
                  e.stopPropagation()
                  onExecute()
                }}
                size="sm"
                variant="outline"
                className="inline-flex items-center"
              >
                <RotateCcw className="w-4 h-4 mr-1" />
                Regenerate
              </Button>
            )}
          </div>
        </div>
      </div>

      {isExpanded && (
        <div className="px-6 pb-6 border-t border-gray-100">
          <div className="mt-4">
            {children || (
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-sm text-gray-600">
                  {status === 'not-started' &&
                    !isAvailable &&
                    'Complete previous steps to unlock this stage.'}
                  {status === 'not-started' && isAvailable && 'Click "Start" to begin this step.'}
                  {status === 'in-progress' && 'This step is currently being processed...'}
                  {status === 'completed' && 'This step has been completed successfully.'}
                  {status === 'error' && 'An error occurred during this step. Please try again.'}
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export default function ScreenplayContent({ project, story }: ScreenplayContentProps) {
  const [activeStep, setActiveStep] = useState<string | null>(null)
  const [storyStructure, setStoryStructure] = useState<any>(null)
  const [characters, setCharacters] = useState<any>(null)
  const [stepStatuses, setStepStatuses] = useState<Record<string, string>>({
    'story-foundation': 'completed',
  })

  // Fetch existing story structure and characters on component mount
  useEffect(() => {
    const fetchStoryStructure = async () => {
      try {
        const response = await fetch(`/v1/projects/${project.id}/story-structure`)
        if (response.ok) {
          const structure = await response.json()
          setStoryStructure(structure)
          setStepStatuses((prev) => ({
            ...prev,
            'story-structure': structure.status === 'generated' ? 'completed' : 'not-started',
          }))
        }
      } catch (error) {
        console.error('Error fetching story structure:', error)
      }
    }

    const fetchCharacters = async () => {
      try {
        const response = await fetch(`/v1/projects/${project.id}/character-development`)
        if (response.ok) {
          const characterData = await response.json()
          setCharacters(characterData)
          setStepStatuses((prev) => ({
            ...prev,
            'character-development': 'completed',
          }))
        }
      } catch (error) {
        console.error('Error fetching characters:', error)
      }
    }

    fetchStoryStructure()
    fetchCharacters()
  }, [project.id])

  const handleStepExecution = async (stepId: string) => {
    setActiveStep(stepId)

    try {
      if (stepId === 'story-structure') {
        // Generate story structure
        const response = await fetch(`/v1/projects/${project.id}/story-structure`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
        })

        if (!response.ok) {
          const errorData = await response.json()
          throw new Error(errorData.error || 'Failed to generate story structure')
        }

        const structure = await response.json()
        setStoryStructure(structure)
        setStepStatuses((prev) => ({
          ...prev,
          'story-structure': 'completed',
        }))
      } else if (stepId === 'character-development') {
        // Generate character development
        const response = await fetch(`/v1/projects/${project.id}/character-development`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
        })

        if (!response.ok) {
          const errorData = await response.json()
          throw new Error(errorData.error || 'Failed to develop characters')
        }

        const characters = await response.json()
        setCharacters(characters)
        setStepStatuses((prev) => ({
          ...prev,
          'character-development': 'completed',
        }))
      } else {
        // For other steps, just simulate for now
        console.log(`Executing step: ${stepId}`)
        await new Promise((resolve) => setTimeout(resolve, 2000))
      }
    } catch (error) {
      console.error(`Error executing step ${stepId}:`, error)
      setStepStatuses((prev) => ({
        ...prev,
        [stepId]: 'error',
      }))
      // You might want to show a toast notification here
      alert(`Error: ${error instanceof Error ? error.message : 'Unknown error occurred'}`)
    } finally {
      setActiveStep(null)
    }
  }

  // Get step status from state
  const getStepStatus = (stepId: string): 'completed' | 'not-started' | 'in-progress' | 'error' => {
    if (activeStep === stepId) return 'in-progress'
    const status = stepStatuses[stepId] || 'not-started'
    // Ensure the status is one of the valid types
    if (['completed', 'not-started', 'in-progress', 'error'].includes(status)) {
      return status as 'completed' | 'not-started' | 'in-progress' | 'error'
    }
    return 'not-started'
  }

  const isStepAvailable = (stepId: string) => {
    // Story foundation is always available if story exists
    if (stepId === 'story-foundation') return true

    // For other steps, check if previous step is completed
    const stepOrder = [
      'story-foundation',
      'story-structure',
      'character-development',
      'story-outline',
      'screenplay-generation',
      'screenplay-revision',
      'scene-planning',
      'media-generation',
      'final-assembly',
    ]

    const currentIndex = stepOrder.indexOf(stepId)
    if (currentIndex === 0) return true

    const previousStep = stepOrder[currentIndex - 1]
    return getStepStatus(previousStep) === 'completed'
  }

  return (
    <div className="p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Screenplay Production</h1>
          <p className="text-gray-600">
            Transform your story into a professional screenplay through our step-by-step AI-powered
            workflow.
          </p>
        </div>

        {/* Story Foundation */}
        <StepContent
          stepId="story-foundation"
          title="Story Foundation"
          description="Your completed story serves as the foundation for screenplay development"
          icon={<BookOpen className="w-5 h-5" />}
          status={getStepStatus('story-foundation')}
          isAvailable={isStepAvailable('story-foundation')}
          onExecute={() => handleStepExecution('story-foundation')}
        >
          <div className="bg-green-50 p-4 rounded-lg">
            <h4 className="font-medium text-green-900 mb-2">Story Complete ✓</h4>
            <p className="text-sm text-green-800 mb-3">
              Your story has been completed and is ready for screenplay adaptation.
            </p>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="font-medium">Quality Score:</span>{' '}
                {story.qualityMetrics?.overallQuality || 'N/A'}/10
              </div>
              <div>
                <span className="font-medium">Enhancement Steps:</span> {story.currentStep}/12
              </div>
              <div>
                <span className="font-medium">Status:</span> {story.status}
              </div>
              <div>
                <span className="font-medium">Word Count:</span> ~
                {Math.floor(story.currentContent.length / 5)} words
              </div>
            </div>
          </div>
        </StepContent>

        {/* Story Structure Planning */}
        <StepContent
          stepId="story-structure"
          title="Story Structure Planning"
          description="Define three-act structure, story beats, and character arcs"
          icon={<Target className="w-5 h-5" />}
          status={getStepStatus('story-structure')}
          isAvailable={isStepAvailable('story-structure')}
          onExecute={() => handleStepExecution('story-structure')}
        >
          {storyStructure && (
            <div className="space-y-6">
              {/* Quality Score */}
              <div className="bg-blue-50 p-4 rounded-lg">
                <h4 className="font-medium text-blue-900 mb-2">Structure Analysis Complete ✓</h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="font-medium">Quality Score:</span>{' '}
                    {storyStructure.generationMetadata?.qualityScore || 'N/A'}/100
                  </div>
                  <div>
                    <span className="font-medium">Processing Time:</span>{' '}
                    {storyStructure.generationMetadata?.processingTime || 0}s
                  </div>
                </div>
              </div>

              {/* Three-Act Structure */}
              <div>
                <h4 className="font-medium text-gray-900 mb-3">Three-Act Structure</h4>
                <div className="space-y-4">
                  {/* Act 1 */}
                  <div className="border border-gray-200 rounded-lg p-4">
                    <h5 className="font-medium text-gray-800 mb-2">
                      Act 1 - Setup ({storyStructure.actStructure?.act1?.duration || 0}
                      {project.durationUnit < 10 ? 's' : ' min'})
                    </h5>
                    <div className="space-y-2 text-sm text-gray-600">
                      {storyStructure.actStructure?.act1?.setup && (
                        <div>
                          <strong>Setup:</strong> {storyStructure.actStructure.act1.setup}
                        </div>
                      )}
                      {storyStructure.actStructure?.act1?.incitingIncident && (
                        <div>
                          <strong>Inciting Incident:</strong>{' '}
                          {storyStructure.actStructure.act1.incitingIncident}
                        </div>
                      )}
                      {storyStructure.actStructure?.act1?.plotPoint1 && (
                        <div>
                          <strong>Plot Point 1:</strong>{' '}
                          {storyStructure.actStructure.act1.plotPoint1}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Act 2 */}
                  <div className="border border-gray-200 rounded-lg p-4">
                    <h5 className="font-medium text-gray-800 mb-2">
                      Act 2 - Confrontation ({storyStructure.actStructure?.act2?.duration || 0}
                      {project.durationUnit < 10 ? 's' : ' min'})
                    </h5>
                    <div className="space-y-2 text-sm text-gray-600">
                      {storyStructure.actStructure?.act2?.confrontation && (
                        <div>
                          <strong>Confrontation:</strong>{' '}
                          {storyStructure.actStructure.act2.confrontation}
                        </div>
                      )}
                      {storyStructure.actStructure?.act2?.midpoint && (
                        <div>
                          <strong>Midpoint:</strong> {storyStructure.actStructure.act2.midpoint}
                        </div>
                      )}
                      {storyStructure.actStructure?.act2?.plotPoint2 && (
                        <div>
                          <strong>Plot Point 2:</strong>{' '}
                          {storyStructure.actStructure.act2.plotPoint2}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Act 3 */}
                  <div className="border border-gray-200 rounded-lg p-4">
                    <h5 className="font-medium text-gray-800 mb-2">
                      Act 3 - Resolution ({storyStructure.actStructure?.act3?.duration || 0}
                      {project.durationUnit < 10 ? 's' : ' min'})
                    </h5>
                    <div className="space-y-2 text-sm text-gray-600">
                      {storyStructure.actStructure?.act3?.climax && (
                        <div>
                          <strong>Climax:</strong> {storyStructure.actStructure.act3.climax}
                        </div>
                      )}
                      {storyStructure.actStructure?.act3?.fallingAction && (
                        <div>
                          <strong>Falling Action:</strong>{' '}
                          {storyStructure.actStructure.act3.fallingAction}
                        </div>
                      )}
                      {storyStructure.actStructure?.act3?.resolution && (
                        <div>
                          <strong>Resolution:</strong> {storyStructure.actStructure.act3.resolution}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Story Beats */}
              {storyStructure.storyBeats && storyStructure.storyBeats.length > 0 && (
                <div>
                  <h4 className="font-medium text-gray-900 mb-3">
                    Story Beats ({storyStructure.storyBeats.length})
                  </h4>
                  <div className="space-y-2">
                    {storyStructure.storyBeats.slice(0, 5).map((beat: any, index: number) => (
                      <div key={index} className="border-l-4 border-blue-200 pl-4 py-2">
                        <div className="font-medium text-sm">
                          {beat.beat} ({beat.timing}
                          {project.durationUnit < 10 ? 's' : 'min'})
                        </div>
                        <div className="text-sm text-gray-600">{beat.description}</div>
                        {beat.emotionalTone && (
                          <div className="text-xs text-blue-600 mt-1">
                            Tone: {beat.emotionalTone}
                          </div>
                        )}
                      </div>
                    ))}
                    {storyStructure.storyBeats.length > 5 && (
                      <div className="text-sm text-gray-500 italic">
                        ... and {storyStructure.storyBeats.length - 5} more beats
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Character Arcs */}
              {storyStructure.characterArcs && storyStructure.characterArcs.length > 0 && (
                <div>
                  <h4 className="font-medium text-gray-900 mb-3">
                    Character Arcs ({storyStructure.characterArcs.length})
                  </h4>
                  <div className="space-y-3">
                    {storyStructure.characterArcs.slice(0, 3).map((arc: any, index: number) => (
                      <div key={index} className="border border-gray-200 rounded-lg p-3">
                        <div className="font-medium text-sm mb-2">{arc.character}</div>
                        <div className="text-xs text-gray-600 space-y-1">
                          <div>
                            <strong>Start:</strong> {arc.startState}
                          </div>
                          <div>
                            <strong>End:</strong> {arc.endState}
                          </div>
                          <div>
                            <strong>Transformation:</strong> {arc.transformation}
                          </div>
                        </div>
                      </div>
                    ))}
                    {storyStructure.characterArcs.length > 3 && (
                      <div className="text-sm text-gray-500 italic">
                        ... and {storyStructure.characterArcs.length - 3} more character arcs
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
        </StepContent>

        {/* Character Development */}
        <StepContent
          stepId="character-development"
          title="Character Development"
          description="Create detailed character profiles, relationships, and dialogue voices"
          icon={<Users className="w-5 h-5" />}
          status={getStepStatus('character-development')}
          isAvailable={isStepAvailable('character-development')}
          onExecute={() => handleStepExecution('character-development')}
        >
          {characters && (
            <div className="mt-4 space-y-4">
              {/* Summary Section */}
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <h4 className="font-medium text-green-800 mb-3">
                  Character Development Complete ✓
                </h4>
                <div className="grid grid-cols-3 gap-4 text-sm">
                  <div>
                    <span className="text-green-700">Total Characters:</span>
                    <span className="ml-2 font-medium">
                      {characters.totalCharacters || characters.characters?.length || 0}
                    </span>
                  </div>
                  <div>
                    <span className="text-green-700">Overall Quality:</span>
                    <span className="ml-2 font-medium">
                      {characters.qualityMetrics?.overallQuality || 'N/A'}/100
                    </span>
                  </div>
                  <div>
                    <span className="text-green-700">Character Library:</span>
                    <span className="ml-2 font-medium">
                      {characters.characters?.[0]?.characterLibraryStatus === 'created' && (
                        <span className="text-green-600">✓ Synced</span>
                      )}
                      {characters.characters?.[0]?.characterLibraryStatus === 'updated' && (
                        <span className="text-blue-600">✓ Updated</span>
                      )}
                      {characters.characters?.[0]?.characterLibraryStatus === 'error' && (
                        <span className="text-orange-600">⚠ Offline</span>
                      )}
                      {!characters.characters?.[0]?.characterLibraryStatus && (
                        <span className="text-gray-500">N/A</span>
                      )}
                    </span>
                  </div>
                </div>
              </div>

              {/* Detailed Character Profiles */}
              {characters.characters && characters.characters.length > 0 && (
                <div className="space-y-4">
                  {characters.characters.map((char: any, index: number) => (
                    <div key={index} className="bg-white border border-gray-200 rounded-lg p-6">
                      {/* Character Header */}
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center space-x-3">
                          <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                            <span className="text-blue-600 font-semibold text-lg">
                              {char.name?.charAt(0) || '?'}
                            </span>
                          </div>
                          <div>
                            <h5 className="text-lg font-semibold text-gray-900">{char.name}</h5>
                            <div className="flex items-center space-x-2">
                              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                {char.role}
                              </span>
                              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                                {char.archetype}
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-sm text-gray-500">Quality Score</div>
                          <div className="text-lg font-semibold text-gray-900">
                            {char.generationMetadata?.qualityScore || 'N/A'}/100
                          </div>
                        </div>
                      </div>

                      {/* Character Details Grid */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Biography & Personality */}
                        <div className="space-y-4">
                          {char.characterDevelopment?.biography && (
                            <div>
                              <h6 className="text-sm font-medium text-gray-700 mb-2">Biography</h6>
                              <p className="text-sm text-gray-600 leading-relaxed">
                                {char.characterDevelopment.biography}
                              </p>
                            </div>
                          )}

                          {char.characterDevelopment?.personality && (
                            <div>
                              <h6 className="text-sm font-medium text-gray-700 mb-2">
                                Personality
                              </h6>
                              <p className="text-sm text-gray-600 leading-relaxed">
                                {char.characterDevelopment.personality}
                              </p>
                            </div>
                          )}
                        </div>

                        {/* Psychology & Motivations */}
                        <div className="space-y-4">
                          {char.characterDevelopment?.psychology && (
                            <div>
                              <h6 className="text-sm font-medium text-gray-700 mb-2">Psychology</h6>
                              <div className="text-sm text-gray-600 space-y-1">
                                {char.characterDevelopment.psychology.motivation && (
                                  <div>
                                    <strong>Motivation:</strong>{' '}
                                    {char.characterDevelopment.psychology.motivation}
                                  </div>
                                )}
                                {char.characterDevelopment.psychology.fears && (
                                  <div>
                                    <strong>Fears:</strong>{' '}
                                    {char.characterDevelopment.psychology.fears}
                                  </div>
                                )}
                                {char.characterDevelopment.psychology.desires && (
                                  <div>
                                    <strong>Desires:</strong>{' '}
                                    {char.characterDevelopment.psychology.desires}
                                  </div>
                                )}
                                {char.characterDevelopment.psychology.flaws && (
                                  <div>
                                    <strong>Flaws:</strong>{' '}
                                    {char.characterDevelopment.psychology.flaws}
                                  </div>
                                )}
                              </div>
                            </div>
                          )}

                          {char.characterDevelopment?.motivations && (
                            <div>
                              <h6 className="text-sm font-medium text-gray-700 mb-2">
                                Core Motivations
                              </h6>
                              <p className="text-sm text-gray-600 leading-relaxed">
                                {char.characterDevelopment.motivations}
                              </p>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Character Arc */}
                      {char.characterArc && (
                        <div className="mt-4 pt-4 border-t border-gray-200">
                          <h6 className="text-sm font-medium text-gray-700 mb-3">Character Arc</h6>
                          <div className="flex items-center space-x-4 text-sm">
                            <div className="flex-1">
                              <div className="text-xs text-gray-500 mb-1">Start State</div>
                              <div className="text-gray-700">{char.characterArc.startState}</div>
                            </div>
                            <div className="text-gray-400">→</div>
                            <div className="flex-1">
                              <div className="text-xs text-gray-500 mb-1">Transformation</div>
                              <div className="text-gray-700">
                                {char.characterArc.transformation}
                              </div>
                            </div>
                            <div className="text-gray-400">→</div>
                            <div className="flex-1">
                              <div className="text-xs text-gray-500 mb-1">End State</div>
                              <div className="text-gray-700">{char.characterArc.endState}</div>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Dialogue Voice & Physical Description */}
                      <div className="mt-4 pt-4 border-t border-gray-200 grid grid-cols-1 md:grid-cols-2 gap-4">
                        {char.dialogueVoice && (
                          <div>
                            <h6 className="text-sm font-medium text-gray-700 mb-2">
                              Dialogue Voice
                            </h6>
                            <div className="text-sm text-gray-600 space-y-1">
                              {char.dialogueVoice.style && (
                                <div>
                                  <strong>Style:</strong> {char.dialogueVoice.style}
                                </div>
                              )}
                              {char.dialogueVoice.patterns && (
                                <div>
                                  <strong>Patterns:</strong> {char.dialogueVoice.patterns}
                                </div>
                              )}
                              {char.dialogueVoice.vocabulary && (
                                <div>
                                  <strong>Vocabulary:</strong> {char.dialogueVoice.vocabulary}
                                </div>
                              )}
                            </div>
                          </div>
                        )}

                        {char.physicalDescription && (
                          <div>
                            <h6 className="text-sm font-medium text-gray-700 mb-2">
                              Physical Description
                            </h6>
                            <div className="text-sm text-gray-600 space-y-1">
                              {char.physicalDescription.age && (
                                <div>
                                  <strong>Age:</strong> {char.physicalDescription.age}
                                </div>
                              )}
                              {char.physicalDescription.height && (
                                <div>
                                  <strong>Height:</strong> {char.physicalDescription.height}
                                </div>
                              )}
                              {char.physicalDescription.eyeColor && (
                                <div>
                                  <strong>Eyes:</strong> {char.physicalDescription.eyeColor}
                                </div>
                              )}
                              {char.physicalDescription.hairColor && (
                                <div>
                                  <strong>Hair:</strong> {char.physicalDescription.hairColor}
                                </div>
                              )}
                              {char.physicalDescription.description && (
                                <div className="mt-2">{char.physicalDescription.description}</div>
                              )}
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Generation Metadata */}
                      {char.generationMetadata && (
                        <div className="mt-4 pt-4 border-t border-gray-200">
                          <div className="flex items-center justify-between text-xs text-gray-500">
                            <div>
                              Generated:{' '}
                              {new Date(char.generationMetadata.generatedAt).toLocaleString()}
                            </div>
                            <div>
                              Method: {char.generationMetadata.generationMethod || 'AI Generated'}
                            </div>
                            <div>
                              Completeness: {char.generationMetadata.completeness || 'N/A'}%
                            </div>
                          </div>

                          {/* Character Library Connection */}
                          {(char.characterLibraryId || char.characterLibraryStatus) && (
                            <div className="mt-2 pt-2 border-t border-gray-100">
                              <div className="flex items-center justify-between text-xs">
                                <div className="flex items-center space-x-4">
                                  <div>
                                    <span className="text-gray-600">Library Status:</span>
                                    <span className="ml-1">
                                      {char.characterLibraryStatus === 'created' && (
                                        <span className="text-green-600">✓ Synced</span>
                                      )}
                                      {char.characterLibraryStatus === 'updated' && (
                                        <span className="text-blue-600">✓ Updated</span>
                                      )}
                                      {char.characterLibraryStatus === 'error' && (
                                        <span className="text-orange-600">⚠ Offline</span>
                                      )}
                                      {!char.characterLibraryStatus && (
                                        <span className="text-gray-500">N/A</span>
                                      )}
                                    </span>
                                  </div>
                                  {char.characterLibraryId && (
                                    <div>
                                      <span className="text-gray-600">Library ID:</span>
                                      <a
                                        href={`https://character.ft.tc/dashboard/character-profile/${char.characterLibraryId}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="ml-1 text-blue-600 hover:text-blue-800 underline font-mono text-xs"
                                        title="View in Character Library"
                                      >
                                        {char.characterLibraryId}
                                      </a>
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </StepContent>

        {/* Story Outline Creation */}
        <StepContent
          stepId="story-outline"
          title="Story Outline Creation"
          description="Build scene-by-scene outline with character presence and conflict mapping"
          icon={<FileText className="w-5 h-5" />}
          status={getStepStatus('story-outline')}
          isAvailable={isStepAvailable('story-outline')}
          onExecute={() => handleStepExecution('story-outline')}
        />

        {/* Screenplay Generation */}
        <StepContent
          stepId="screenplay-generation"
          title="Screenplay Generation"
          description="Generate full screenplay in industry-standard format"
          icon={<Film className="w-5 h-5" />}
          status={getStepStatus('screenplay-generation')}
          isAvailable={isStepAvailable('screenplay-generation')}
          onExecute={() => handleStepExecution('screenplay-generation')}
        />

        {/* Screenplay Revision */}
        <StepContent
          stepId="screenplay-revision"
          title="Screenplay Revision"
          description="Quality review, revisions, and improvements"
          icon={<Lightbulb className="w-5 h-5" />}
          status={getStepStatus('screenplay-revision')}
          isAvailable={isStepAvailable('screenplay-revision')}
          onExecute={() => handleStepExecution('screenplay-revision')}
        />

        {/* Scene Planning & Breakdown */}
        <StepContent
          stepId="scene-planning"
          title="Scene Planning & Breakdown"
          description="Create visual scene descriptions and shot planning"
          icon={<Clapperboard className="w-5 h-5" />}
          status={getStepStatus('scene-planning')}
          isAvailable={isStepAvailable('scene-planning')}
          onExecute={() => handleStepExecution('scene-planning')}
        />

        {/* Media Generation */}
        <StepContent
          stepId="media-generation"
          title="Media Generation"
          description="Generate scene images, video sequences, and audio integration"
          icon={<Video className="w-5 h-5" />}
          status={getStepStatus('media-generation')}
          isAvailable={isStepAvailable('media-generation')}
          onExecute={() => handleStepExecution('media-generation')}
        />

        {/* Final Assembly */}
        <StepContent
          stepId="final-assembly"
          title="Final Assembly"
          description="Complete movie assembly and post-production workflow"
          icon={<Package className="w-5 h-5" />}
          status={getStepStatus('final-assembly')}
          isAvailable={isStepAvailable('final-assembly')}
          onExecute={() => handleStepExecution('final-assembly')}
        />
      </div>
    </div>
  )
}

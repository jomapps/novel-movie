'use client'

import { useState } from 'react'
import { Project, Story } from '@/payload-types'
import { Button } from '@/components/ui/Button'
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
  Clock
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

function StepContent({ stepId, title, description, icon, status, isAvailable, onExecute, children }: StepContentProps) {
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
          </div>
        </div>
      </div>

      {isExpanded && (
        <div className="px-6 pb-6 border-t border-gray-100">
          <div className="mt-4">
            {children || (
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-sm text-gray-600">
                  {status === 'not-started' && !isAvailable && 'Complete previous steps to unlock this stage.'}
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

  const handleStepExecution = async (stepId: string) => {
    setActiveStep(stepId)
    
    try {
      // TODO: Implement actual step execution logic
      console.log(`Executing step: ${stepId}`)
      
      // For now, just simulate the process
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      // TODO: Update step status in database
      
    } catch (error) {
      console.error(`Error executing step ${stepId}:`, error)
    } finally {
      setActiveStep(null)
    }
  }

  // Mock step statuses - TODO: Replace with actual data from database
  const getStepStatus = (stepId: string) => {
    if (stepId === 'story-foundation') return 'completed'
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
      'final-assembly'
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
            Transform your story into a professional screenplay through our step-by-step AI-powered workflow.
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
                <span className="font-medium">Quality Score:</span> {story.qualityMetrics?.overallQuality || 'N/A'}/100
              </div>
              <div>
                <span className="font-medium">Enhancement Steps:</span> {story.currentStep}/12
              </div>
              <div>
                <span className="font-medium">Status:</span> {story.status}
              </div>
              <div>
                <span className="font-medium">Word Count:</span> ~{Math.floor(story.currentContent.length / 5)} words
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
        />

        {/* Character Development */}
        <StepContent
          stepId="character-development"
          title="Character Development"
          description="Create detailed character profiles, relationships, and dialogue voices"
          icon={<Users className="w-5 h-5" />}
          status={getStepStatus('character-development')}
          isAvailable={isStepAvailable('character-development')}
          onExecute={() => handleStepExecution('character-development')}
        />

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

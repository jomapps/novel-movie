import type { CollectionConfig } from 'payload'

export const Stories: CollectionConfig = {
  slug: 'stories',
  admin: {
    useAsTitle: 'projectName',
    defaultColumns: ['projectName', 'currentStep', 'overallQuality', 'status', 'updatedAt'],
    group: 'Content',
  },
  access: {
    read: () => true,
    create: ({ req: { user } }) => !!user,
    update: ({ req: { user } }) => !!user,
    delete: ({ req: { user } }) => !!user,
  },
  fields: [
    // Core Project Reference
    {
      name: 'project',
      type: 'relationship',
      relationTo: 'projects',
      required: true,
      unique: true,
      admin: {
        description: 'Associated project for this story',
      },
    },
    {
      name: 'projectName',
      type: 'text',
      admin: {
        readOnly: true,
        description: 'Auto-populated from project name',
      },
      hooks: {
        beforeValidate: [
          async ({ data, req }) => {
            if (data?.project && typeof data.project === 'string') {
              const payload = req.payload
              const project = await payload.findByID({
                collection: 'projects',
                id: data.project,
              })
              return project?.name || 'Unknown Project'
            }
            return data?.projectName
          },
        ],
      },
    },

    // Current Story Content
    {
      name: 'currentContent',
      type: 'textarea',
      required: true,
      admin: {
        description: 'Current version of the story content',
        rows: 10,
      },
    },

    // Workflow Status
    {
      name: 'currentStep',
      type: 'number',
      required: true,
      defaultValue: 3,
      min: 1,
      max: 12,
      admin: {
        description: 'Current enhancement step (1-12)',
      },
    },
    {
      name: 'status',
      type: 'select',
      required: true,
      defaultValue: 'in-progress',
      options: [
        { label: 'In Progress', value: 'in-progress' },
        { label: 'Paused', value: 'paused' },
        { label: 'Completed', value: 'completed' },
        { label: 'Needs Review', value: 'needs-review' },
        { label: 'Approved', value: 'approved' },
      ],
      admin: {
        description: 'Current status of story development',
      },
    },

    // Quality Metrics
    {
      name: 'qualityMetrics',
      type: 'group',
      fields: [
        {
          name: 'structureScore',
          type: 'number',
          min: 0,
          max: 100,
          defaultValue: 0,
          admin: {
            description: 'Story structure quality (0-100)',
          },
        },
        {
          name: 'characterDepth',
          type: 'number',
          min: 0,
          max: 100,
          defaultValue: 0,
          admin: {
            description: 'Character development quality (0-100)',
          },
        },
        {
          name: 'coherenceScore',
          type: 'number',
          min: 0,
          max: 100,
          defaultValue: 0,
          admin: {
            description: 'Story coherence and logic (0-100)',
          },
        },
        {
          name: 'conflictTension',
          type: 'number',
          min: 0,
          max: 100,
          defaultValue: 0,
          admin: {
            description: 'Dramatic tension and conflict (0-100)',
          },
        },
        {
          name: 'dialogueQuality',
          type: 'number',
          min: 0,
          max: 100,
          defaultValue: 0,
          admin: {
            description: 'Dialogue quality and character voice (0-100)',
          },
        },
        {
          name: 'genreAlignment',
          type: 'number',
          min: 0,
          max: 100,
          defaultValue: 0,
          admin: {
            description: 'Genre-specific feature effectiveness (0-100)',
          },
        },
        {
          name: 'audienceEngagement',
          type: 'number',
          min: 0,
          max: 100,
          defaultValue: 0,
          admin: {
            description: 'Target audience appropriateness (0-100)',
          },
        },
        {
          name: 'visualStorytelling',
          type: 'number',
          min: 0,
          max: 100,
          defaultValue: 0,
          admin: {
            description: 'Cinematic potential and visual descriptions (0-100)',
          },
        },
        {
          name: 'productionReadiness',
          type: 'number',
          min: 0,
          max: 100,
          defaultValue: 0,
          admin: {
            description: 'Production viability and format compliance (0-100)',
          },
        },
        {
          name: 'overallQuality',
          type: 'number',
          min: 0,
          max: 100,
          defaultValue: 0,
          admin: {
            description: 'Composite quality score (0-100)',
            readOnly: true,
          },
        },
      ],
    },

    // Enhancement History - Track each step's improvements
    {
      name: 'enhancementHistory',
      type: 'array',
      maxRows: 12,
      admin: {
        description: 'History of all enhancement steps performed',
      },
      fields: [
        {
          name: 'stepNumber',
          type: 'number',
          required: true,
          min: 1,
          max: 12,
          admin: {
            description: 'Enhancement step number (1-12)',
          },
        },
        {
          name: 'stepName',
          type: 'select',
          required: true,
          options: [
            { label: 'Initial Story Generation', value: 'initial-generation' },
            { label: 'Story Structure Enhancement', value: 'structure-enhancement' },
            { label: 'Character Development Enhancement', value: 'character-enhancement' },
            { label: 'Story Coherence Enhancement', value: 'coherence-enhancement' },
            { label: 'Conflict & Tension Enhancement', value: 'conflict-enhancement' },
            { label: 'Dialogue Enhancement', value: 'dialogue-enhancement' },
            { label: 'Genre-Specific Enhancement', value: 'genre-enhancement' },
            { label: 'Target Audience Optimization', value: 'audience-optimization' },
            { label: 'Visual Storytelling Enhancement', value: 'visual-enhancement' },
            { label: 'Final Polish & Integration', value: 'final-polish' },
          ],
        },
        {
          name: 'startTime',
          type: 'date',
          required: true,
          admin: {
            description: 'When this step started',
          },
        },
        {
          name: 'endTime',
          type: 'date',
          admin: {
            description: 'When this step completed',
          },
        },
        {
          name: 'processingTime',
          type: 'number',
          admin: {
            description: 'Processing time in seconds',
          },
        },
        {
          name: 'contentBefore',
          type: 'textarea',
          admin: {
            description: 'Story content before this enhancement',
            rows: 5,
          },
        },
        {
          name: 'contentAfter',
          type: 'textarea',
          admin: {
            description: 'Story content after this enhancement',
            rows: 5,
          },
        },
        {
          name: 'qualityBefore',
          type: 'json',
          admin: {
            description: 'Quality metrics before enhancement',
          },
        },
        {
          name: 'qualityAfter',
          type: 'json',
          admin: {
            description: 'Quality metrics after enhancement',
          },
        },
        {
          name: 'improvementsMade',
          type: 'array',
          fields: [
            {
              name: 'improvement',
              type: 'text',
              required: true,
            },
          ],
          admin: {
            description: 'List of specific improvements made in this step',
          },
        },
        {
          name: 'userApproved',
          type: 'checkbox',
          defaultValue: false,
          admin: {
            description: 'Whether user approved this enhancement',
          },
        },
        {
          name: 'aiModel',
          type: 'text',
          admin: {
            description: 'AI model used for this enhancement',
          },
        },
        {
          name: 'changesSummary',
          type: 'textarea',
          admin: {
            description: 'Summary of changes made in this step',
          },
        },
      ],
    },

    // Genre-Specific Metrics (for specialized enhancements)
    {
      name: 'genreSpecificMetrics',
      type: 'json',
      admin: {
        description: 'Genre-specific quality metrics (e.g., humor ratio for comedy)',
      },
    },

    // User Control Settings
    {
      name: 'workflowSettings',
      type: 'group',
      fields: [
        {
          name: 'mode',
          type: 'select',
          defaultValue: 'auto',
          options: [
            { label: 'Automatic', value: 'auto' },
            { label: 'Manual Approval', value: 'manual' },
            { label: 'Custom', value: 'custom' },
          ],
          admin: {
            description: 'Workflow execution mode',
          },
        },
        {
          name: 'qualityThreshold',
          type: 'number',
          min: 0,
          max: 100,
          defaultValue: 85,
          admin: {
            description: 'Stop enhancement when overall quality reaches this score',
          },
        },
        {
          name: 'maxIterations',
          type: 'number',
          min: 1,
          max: 20,
          defaultValue: 12,
          admin: {
            description: 'Maximum number of enhancement cycles',
          },
        },
        {
          name: 'skipSteps',
          type: 'array',
          fields: [
            {
              name: 'stepNumber',
              type: 'number',
              min: 1,
              max: 12,
            },
          ],
          admin: {
            description: 'Steps to skip during enhancement',
          },
        },
        {
          name: 'repeatSteps',
          type: 'array',
          fields: [
            {
              name: 'stepNumber',
              type: 'number',
              min: 1,
              max: 12,
            },
          ],
          admin: {
            description: 'Steps to repeat if quality targets not met',
          },
        },
      ],
    },

    // Progress Tracking
    {
      name: 'progressTracking',
      type: 'group',
      fields: [
        {
          name: 'estimatedTimeRemaining',
          type: 'number',
          admin: {
            description: 'Estimated time remaining in seconds',
            readOnly: true,
          },
        },
        {
          name: 'completionPercentage',
          type: 'number',
          min: 0,
          max: 100,
          admin: {
            description: 'Overall completion percentage',
            readOnly: true,
          },
        },
        {
          name: 'lastProcessedStep',
          type: 'number',
          min: 0,
          max: 12,
          admin: {
            description: 'Last successfully processed step',
            readOnly: true,
          },
        },
        {
          name: 'totalProcessingTime',
          type: 'number',
          admin: {
            description: 'Total processing time in seconds',
            readOnly: true,
          },
        },
      ],
    },
  ],
  hooks: {
    beforeValidate: [
      async ({ data, req, operation }: any) => {
        // Only validate on create operations, not updates
        if (operation === 'create' && data?.project) {
          const existingStory = await req.payload.find({
            collection: 'stories',
            where: {
              project: { equals: data.project },
            },
            limit: 1,
          })

          if (existingStory.totalDocs > 0) {
            throw new Error('This project already has a story')
          }
        }

        // Calculate overall quality score from individual metrics
        if (data?.qualityMetrics) {
          const metrics = data.qualityMetrics
          const weights = {
            structureScore: 0.2,
            characterDepth: 0.18,
            coherenceScore: 0.15,
            conflictTension: 0.12,
            dialogueQuality: 0.1,
            genreAlignment: 0.1,
            audienceEngagement: 0.08,
            visualStorytelling: 0.04,
            productionReadiness: 0.03,
          }

          let overallQuality = 0
          Object.entries(weights).forEach(([metric, weight]) => {
            if (metrics[metric] !== undefined) {
              overallQuality += metrics[metric] * weight
            }
          })

          data.qualityMetrics.overallQuality = Math.round(overallQuality)
        }

        return data
      },
    ],
    afterChange: [
      async ({ doc, req, operation }: any) => {
        // Update project status when story is created
        if (operation === 'create' && doc.project && typeof doc.project === 'string') {
          await req.payload.update({
            collection: 'projects',
            id: doc.project,
            data: {
              status: 'story-in-progress',
            },
          })
        }

        // Log changes for audit trail
        if (operation === 'update') {
          console.log(
            `Story ${doc.id} updated - Step: ${doc.currentStep}, Quality: ${doc.qualityMetrics?.overallQuality}`,
          )
        }

        // Update project status when story is completed
        if (
          operation === 'update' &&
          doc.status === 'completed' &&
          doc.project &&
          typeof doc.project === 'string'
        ) {
          await req.payload.update({
            collection: 'projects',
            id: doc.project,
            data: {
              status: 'story-completed',
            },
          })
        }
      },
    ],
  },
}

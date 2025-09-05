import type { CollectionConfig } from 'payload'

const StoryStructures: CollectionConfig = {
  slug: 'story-structures',
  admin: {
    useAsTitle: 'projectName',
    defaultColumns: ['projectName', 'status', 'createdAt'],
    group: 'Screenplay Development',
  },
  access: {
    read: () => true,
    create: () => true,
    update: () => true,
    delete: () => true,
  },
  fields: [
    // Project relationship
    {
      name: 'project',
      type: 'relationship',
      relationTo: 'projects',
      required: true,
      admin: {
        description: 'Associated project for this story structure',
      },
    },

    // Auto-populated project name for easier identification
    {
      name: 'projectName',
      type: 'text',
      admin: {
        description: 'Auto-populated from project name',
        readOnly: true,
      },
    },

    // Story relationship
    {
      name: 'story',
      type: 'relationship',
      relationTo: 'stories',
      required: true,
      admin: {
        description: 'Associated story that this structure is based on',
      },
    },

    // Narrative Structure Type
    {
      name: 'narrativeStructureType',
      type: 'select',
      options: [
        { label: 'Single Moment', value: 'single-moment' },
        { label: 'Compressed Three-Act', value: 'compressed-three-act' },
        { label: 'Traditional Three-Act', value: 'traditional-three-act' },
        { label: 'Five-Act Structure', value: 'five-act' },
        { label: 'Save the Cat Beat Sheet', value: 'save-the-cat' },
        { label: 'Eight-Sequence Structure', value: 'eight-sequence' },
      ],
      admin: {
        description: 'Type of narrative structure used based on duration',
        readOnly: true,
      },
    },

    // Adaptive Structure Data
    {
      name: 'adaptiveStructure',
      type: 'group',
      admin: {
        description: 'Duration-adaptive narrative structure data',
      },
      fields: [
        {
          name: 'structureType',
          type: 'text',
          admin: {
            description: 'Structure type identifier',
            readOnly: true,
          },
        },
        {
          name: 'acts',
          type: 'array',
          admin: {
            description: 'Adaptive acts based on structure type',
          },
          fields: [
            {
              name: 'actNumber',
              type: 'number',
              required: true,
            },
            {
              name: 'name',
              type: 'text',
              required: true,
            },
            {
              name: 'description',
              type: 'textarea',
            },
            {
              name: 'duration',
              type: 'number',
              admin: {
                description: 'Duration in minutes',
              },
            },
            {
              name: 'keyEvents',
              type: 'array',
              fields: [
                {
                  name: 'event',
                  type: 'text',
                  required: true,
                },
              ],
            },
            {
              name: 'purpose',
              type: 'text',
            },
          ],
        },
        {
          name: 'sequences',
          type: 'array',
          admin: {
            description: 'Eight-sequence structure data (for extended formats)',
          },
          fields: [
            {
              name: 'sequenceNumber',
              type: 'number',
              required: true,
            },
            {
              name: 'name',
              type: 'text',
              required: true,
            },
            {
              name: 'description',
              type: 'textarea',
            },
            {
              name: 'duration',
              type: 'number',
            },
            {
              name: 'miniMovieArc',
              type: 'text',
            },
            {
              name: 'keyBeats',
              type: 'array',
              fields: [
                {
                  name: 'beat',
                  type: 'text',
                  required: true,
                },
              ],
            },
          ],
        },
        {
          name: 'saveTheCatBeats',
          type: 'array',
          admin: {
            description: 'Save the Cat beat sheet data (for feature films)',
          },
          fields: [
            {
              name: 'beatNumber',
              type: 'number',
              required: true,
            },
            {
              name: 'name',
              type: 'text',
              required: true,
            },
            {
              name: 'description',
              type: 'textarea',
            },
            {
              name: 'pageNumber',
              type: 'number',
            },
            {
              name: 'timing',
              type: 'number',
              admin: {
                description: 'Timing in minutes',
              },
            },
            {
              name: 'purpose',
              type: 'text',
            },
          ],
        },
      ],
    },

    // Legacy Three-Act Structure (for backward compatibility)
    {
      name: 'actStructure',
      type: 'group',
      admin: {
        description: 'Legacy three-act structure (for backward compatibility)',
      },
      fields: [
        // Act 1
        {
          name: 'act1',
          type: 'group',
          label: 'Act 1 - Setup',
          fields: [
            {
              name: 'setup',
              type: 'textarea',
              admin: {
                description: 'Opening setup and world establishment',
              },
            },
            {
              name: 'incitingIncident',
              type: 'textarea',
              admin: {
                description: 'The event that sets the story in motion',
              },
            },
            {
              name: 'plotPoint1',
              type: 'textarea',
              admin: {
                description: 'Major turning point that launches Act 2',
              },
            },
            {
              name: 'duration',
              type: 'number',
              admin: {
                description: 'Estimated duration in minutes',
              },
            },
          ],
        },

        // Act 2
        {
          name: 'act2',
          type: 'group',
          label: 'Act 2 - Confrontation',
          fields: [
            {
              name: 'confrontation',
              type: 'textarea',
              admin: {
                description: 'Main conflict and obstacles',
              },
            },
            {
              name: 'midpoint',
              type: 'textarea',
              admin: {
                description: 'Major revelation or turning point at story center',
              },
            },
            {
              name: 'plotPoint2',
              type: 'textarea',
              admin: {
                description: 'Crisis that launches the final act',
              },
            },
            {
              name: 'duration',
              type: 'number',
              admin: {
                description: 'Estimated duration in minutes',
              },
            },
          ],
        },

        // Act 3
        {
          name: 'act3',
          type: 'group',
          label: 'Act 3 - Resolution',
          fields: [
            {
              name: 'climax',
              type: 'textarea',
              admin: {
                description: 'Final confrontation and peak tension',
              },
            },
            {
              name: 'fallingAction',
              type: 'textarea',
              admin: {
                description: 'Immediate aftermath of the climax',
              },
            },
            {
              name: 'resolution',
              type: 'textarea',
              admin: {
                description: 'Final resolution and new equilibrium',
              },
            },
            {
              name: 'duration',
              type: 'number',
              admin: {
                description: 'Estimated duration in minutes',
              },
            },
          ],
        },
      ],
    },

    // Story Beats
    {
      name: 'storyBeats',
      type: 'array',
      admin: {
        description: 'Detailed story beats and key moments',
      },
      fields: [
        {
          name: 'beat',
          type: 'text',
          required: true,
          admin: {
            description: 'Name or title of this story beat',
          },
        },
        {
          name: 'timing',
          type: 'number',
          admin: {
            description: 'Approximate timing in minutes from start',
          },
        },
        {
          name: 'description',
          type: 'textarea',
          required: true,
          admin: {
            description: 'Detailed description of what happens in this beat',
          },
        },
        {
          name: 'characters',
          type: 'array',
          admin: {
            description: 'Characters present in this beat',
          },
          fields: [
            {
              name: 'character',
              type: 'text',
            },
          ],
        },
        {
          name: 'emotionalTone',
          type: 'select',
          options: [
            { label: 'Tense', value: 'tense' },
            { label: 'Dramatic', value: 'dramatic' },
            { label: 'Comedic', value: 'comedic' },
            { label: 'Romantic', value: 'romantic' },
            { label: 'Action', value: 'action' },
            { label: 'Suspenseful', value: 'suspenseful' },
            { label: 'Emotional', value: 'emotional' },
            { label: 'Mysterious', value: 'mysterious' },
          ],
        },
      ],
    },

    // Character Arcs
    {
      name: 'characterArcs',
      type: 'array',
      admin: {
        description: 'Character development arcs throughout the story',
      },
      fields: [
        {
          name: 'character',
          type: 'text',
          required: true,
          admin: {
            description: 'Character name',
          },
        },
        {
          name: 'startState',
          type: 'textarea',
          required: true,
          admin: {
            description: 'Character state at the beginning of the story',
          },
        },
        {
          name: 'endState',
          type: 'textarea',
          required: true,
          admin: {
            description: 'Character state at the end of the story',
          },
        },
        {
          name: 'transformation',
          type: 'textarea',
          required: true,
          admin: {
            description: 'How and why the character changes',
          },
        },
        {
          name: 'keyMoments',
          type: 'array',
          admin: {
            description: "Key moments in this character's arc",
          },
          fields: [
            {
              name: 'moment',
              type: 'text',
            },
          ],
        },
      ],
    },

    // Subplots
    {
      name: 'subplots',
      type: 'array',
      admin: {
        description: 'Secondary storylines and subplots',
      },
      fields: [
        {
          name: 'name',
          type: 'text',
          required: true,
          admin: {
            description: 'Subplot name or title',
          },
        },
        {
          name: 'description',
          type: 'textarea',
          required: true,
          admin: {
            description: 'Detailed description of the subplot',
          },
        },
        {
          name: 'resolution',
          type: 'textarea',
          admin: {
            description: 'How this subplot is resolved',
          },
        },
        {
          name: 'charactersInvolved',
          type: 'array',
          admin: {
            description: 'Characters involved in this subplot',
          },
          fields: [
            {
              name: 'character',
              type: 'text',
            },
          ],
        },
      ],
    },

    // Generation metadata
    {
      name: 'generationMetadata',
      type: 'group',
      admin: {
        description: 'Metadata about the structure generation process',
      },
      fields: [
        {
          name: 'generatedAt',
          type: 'date',
          admin: {
            date: {
              pickerAppearance: 'dayAndTime',
            },
          },
        },
        {
          name: 'processingTime',
          type: 'number',
          admin: {
            description: 'Time taken to generate structure (in seconds)',
          },
        },
        {
          name: 'qualityScore',
          type: 'number',
          min: 0,
          max: 100,
          admin: {
            description: 'AI-assessed quality score of the structure',
          },
        },
        {
          name: 'generationNotes',
          type: 'textarea',
          admin: {
            description: 'Notes from the AI generation process',
          },
        },
      ],
    },

    // Duration compliance tracking
    {
      name: 'durationCompliance',
      type: 'group',
      admin: {
        description: 'Duration-adaptive compliance and validation data',
      },
      fields: [
        {
          name: 'formatCategory',
          type: 'text',
          admin: {
            description: 'Duration format category (Micro-format, Ultra-short, etc.)',
            readOnly: true,
          },
        },
        {
          name: 'targetDuration',
          type: 'number',
          admin: {
            description: 'Target duration in minutes',
            readOnly: true,
          },
        },
        {
          name: 'isCompliant',
          type: 'checkbox',
          admin: {
            description: 'Whether structure meets duration format requirements',
            readOnly: true,
          },
        },
        {
          name: 'complexityLevel',
          type: 'select',
          options: [
            { label: 'Minimal', value: 'minimal' },
            { label: 'Simple', value: 'simple' },
            { label: 'Moderate', value: 'moderate' },
            { label: 'Complex', value: 'complex' },
            { label: 'Epic', value: 'epic' },
          ],
          admin: {
            description: 'Appropriate complexity level for duration',
            readOnly: true,
          },
        },
        {
          name: 'constraints',
          type: 'group',
          admin: {
            description: 'Format-specific constraints applied',
          },
          fields: [
            {
              name: 'maxStoryBeats',
              type: 'number',
              admin: {
                description: 'Maximum recommended story beats',
                readOnly: true,
              },
            },
            {
              name: 'maxCharacters',
              type: 'number',
              admin: {
                description: 'Maximum recommended characters',
                readOnly: true,
              },
            },
            {
              name: 'maxLocations',
              type: 'number',
              admin: {
                description: 'Maximum recommended locations',
                readOnly: true,
              },
            },
            {
              name: 'maxSubplots',
              type: 'number',
              admin: {
                description: 'Maximum recommended subplots',
                readOnly: true,
              },
            },
            {
              name: 'beatsPerMinute',
              type: 'number',
              admin: {
                description: 'Recommended beats per minute pacing',
                readOnly: true,
                step: 0.1,
              },
            },
          ],
        },
        {
          name: 'actualMetrics',
          type: 'group',
          admin: {
            description: 'Actual structure metrics',
          },
          fields: [
            {
              name: 'storyBeatsCount',
              type: 'number',
              admin: {
                description: 'Actual number of story beats',
                readOnly: true,
              },
            },
            {
              name: 'characterCount',
              type: 'number',
              admin: {
                description: 'Actual number of main characters',
                readOnly: true,
              },
            },
            {
              name: 'subplotCount',
              type: 'number',
              admin: {
                description: 'Actual number of subplots',
                readOnly: true,
              },
            },
            {
              name: 'averageBeatsPerMinute',
              type: 'number',
              admin: {
                description: 'Actual beats per minute pacing',
                readOnly: true,
                step: 0.1,
              },
            },
          ],
        },
        {
          name: 'warnings',
          type: 'array',
          admin: {
            description: 'Duration compliance warnings',
          },
          fields: [
            {
              name: 'warning',
              type: 'text',
              required: true,
            },
          ],
        },
        {
          name: 'recommendations',
          type: 'array',
          admin: {
            description: 'Recommendations for improvement',
          },
          fields: [
            {
              name: 'recommendation',
              type: 'text',
              required: true,
            },
          ],
        },
        {
          name: 'pacingGuidelines',
          type: 'array',
          admin: {
            description: 'Format-specific pacing guidelines',
          },
          fields: [
            {
              name: 'guideline',
              type: 'text',
              required: true,
            },
          ],
        },
      ],
    },

    // Status tracking
    {
      name: 'status',
      type: 'select',
      required: true,
      defaultValue: 'generated',
      options: [
        { label: 'Generated', value: 'generated' },
        { label: 'Reviewed', value: 'reviewed' },
        { label: 'Approved', value: 'approved' },
        { label: 'Needs Revision', value: 'needs-revision' },
      ],
      admin: {
        description: 'Current status of the story structure',
      },
    },
  ],

  // Auto-populate project name
  hooks: {
    beforeChange: [
      async ({ data, req, operation }) => {
        if (operation === 'create' || operation === 'update') {
          if (data.project) {
            try {
              const project = await req.payload.findByID({
                collection: 'projects',
                id: typeof data.project === 'string' ? data.project : data.project.id,
              })
              if (project) {
                data.projectName = project.name
              }
            } catch (error) {
              console.error('Error fetching project for story structure:', error)
            }
          }
        }
        return data
      },
    ],
  },
}

export default StoryStructures

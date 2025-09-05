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

    // Three-Act Structure
    {
      name: 'actStructure',
      type: 'group',
      admin: {
        description: 'Traditional three-act story structure breakdown',
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
            description: 'Key moments in this character\'s arc',
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

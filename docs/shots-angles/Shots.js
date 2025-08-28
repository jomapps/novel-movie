const Shots = {
  slug: 'shots',
  admin: {
    useAsTitle: 'shotName',
    description: 'A collection of detailed camera shots for generating cinematic prompts.',
  },
  fields: [
    {
      name: 'shotName',
      label: 'Shot Name / Description',
      type: 'text',
      required: true,
      admin: {
        description:
          'Give this shot a descriptive name (e.g., "Wide Establishing - Hospital Room", "Hero Low Angle - Rooftop Standoff").',
      },
    },
    {
      name: 'shotType',
      label: 'Shot Type',
      type: 'select',
      options: [
        'Establishing Shot',
        'Wide Shot',
        'Full Shot',
        'Medium Wide Shot (Cowboy)',
        'Medium Shot',
        'Medium Close-Up',
        'Close-Up',
        'Extreme Close-Up (ECU)',
        'Insert Shot',
        'Over-The-Shoulder (OTS)',
        'Two-Shot',
        'Low Angle',
        'High Angle',
        'Dutch Angle',
        'Tracking Shot',
        'Point of View (POV)',
        'Profile Shot',
        'Reflection Shot',
      ],
      required: true,
    },

    // --- LAYER 1: TECHNICAL FOUNDATION ---
    {
      label: 'Layer 1: Technical Foundation',
      type: 'collapsible',
      fields: [
        {
          name: 'technicalFoundation',
          label: 'Technical Details',
          type: 'group',
          fields: [
            {
              name: 'cameraBody',
              label: 'Camera Body',
              type: 'text',
              admin: { placeholder: 'e.g., ARRI ALEXA 65, RED V-RAPTOR' },
            },
            {
              name: 'lens',
              label: 'Lens Type & Focal Length',
              type: 'text',
              required: true,
              admin: { placeholder: 'e.g., 24mm ARRI Signature Prime, 100mm Macro' },
            },
            {
              name: 'aperture',
              label: 'Aperture (f-stop)',
              type: 'text',
              admin: { placeholder: 'e.g., f/8, f/2.8, f/1.4' },
            },
            {
              name: 'depthOfField',
              label: 'Depth of Field',
              type: 'select',
              options: ['Deep', 'Moderate', 'Shallow', 'Extreme Shallow', 'Split-Focus'],
            },
            {
              name: 'aspectRatio',
              label: 'Aspect Ratio',
              type: 'text',
              defaultValue: '2.39:1',
              admin: { placeholder: 'e.g., 2.39:1 (Widescreen), 1.85:1 (Standard)' },
            },
            {
              name: 'resolution',
              label: 'Resolution',
              type: 'select',
              options: ['HD', '2K', '4K', '6K', '8K'],
              defaultValue: '8K',
            },
            {
              name: 'technicalNotes',
              label: 'Other Technical Details',
              type: 'textarea',
              admin: {
                description:
                  'Additional details like "subtle lens breathing", "recording in ARRIRAW 6.5K", "circular polarizer to reduce reflections".',
              },
            },
          ],
        },
      ],
    },

    // --- LAYER 2: CINEMATOGRAPHIC CHOICES ---
    {
      label: 'Layer 2: Cinematographic Choices',
      type: 'collapsible',
      fields: [
        {
          name: 'cinematography',
          label: 'Cinematography Details',
          type: 'group',
          fields: [
            {
              name: 'cameraMovement',
              label: 'Camera Movement',
              type: 'select',
              options: [
                'Static / Locked-off Tripod',
                'Handheld (Organic)',
                'Handheld (Intentional Instability)',
                'Steadicam / Gimbal Tracking',
                'Dolly (Forward / Backward)',
                'Trucking (Left / Right)',
                'Pedestal (Up / Down)',
                'Shoulder-mounted',
                'Crane / Jib',
                'Drone Shot',
              ],
              required: true,
            },
            {
              name: 'lightingStyle',
              label: 'Lighting Style & Description',
              type: 'textarea',
              required: true,
              admin: {
                description:
                  'Be specific. Avoid "cinematic lighting." Instead, use: "Harsh overhead fluorescent medical lighting creating stark shadows" or "Single hard key light creating rim profile, no fill light."',
              },
            },
            {
              name: 'colorTemperature',
              label: 'Color Temperature',
              type: 'text',
              admin: { placeholder: 'e.g., 5600K (Cold blue-white), 3200K (Warm tungsten), Mixed' },
            },
            {
              name: 'colorAndGrade',
              label: 'Color Palette & Grading',
              type: 'textarea',
              admin: {
                description:
                  'Describe the overall color. e.g., "Professional color grading with lifted blacks for medical horror tone", "Desaturated grade with pushed contrast", "Crushed blacks in grade for noir mood".',
              },
            },
          ],
        },
      ],
    },

    // --- LAYER 3: COMPOSITIONAL RULES ---
    {
      label: 'Layer 3: Compositional Rules',
      type: 'collapsible',
      fields: [
        {
          name: 'composition',
          label: 'Composition Details',
          type: 'group',
          fields: [
            {
              name: 'framingRules',
              label: 'Framing & Compositional Rules',
              type: 'multiselect',
              options: [
                'Rule of Thirds',
                'Golden Ratio',
                'Leading Lines',
                'Symmetry',
                'Asymmetry',
                'Frame Within a Frame',
                'Centered',
                'Negative Space',
              ],
            },
            {
              name: 'compositionalDescription',
              label: 'Detailed Composition',
              type: 'textarea',
              required: true,
              admin: {
                description:
                  'Crucial for avoiding the "portrait trap." Specify WHERE the subject is. e.g., "Subject in lower right intersection, massive negative space above emphasizing isolation, leading lines from padded walls converging to subject."',
              },
            },
            {
              name: 'angle',
              label: 'Camera Angle Details',
              type: 'textarea',
              admin: {
                description:
                  'Describe the angle if not covered by the shot type. e.g., "Camera positioned at knee height tilting up", "Tilted 20-degree Dutch angle."',
              },
            },
          ],
        },
      ],
    },

    // --- LAYER 4: NARRATIVE CONTENT ---
    {
      label: 'Layer 4: Narrative Content',
      type: 'collapsible',
      fields: [
        {
          name: 'narrative',
          label: 'Narrative Details',
          type: 'group',
          fields: [
            {
              name: 'action',
              label: 'Action in Shot',
              type: 'textarea',
              admin: {
                description:
                  'What is happening? Describe the specific action. e.g., "Eye slowly opening from sleep, pupil adjusting to light", "Character running through complex environment, weaving between obstacles."',
              },
            },
            {
              name: 'character',
              label: 'Character Description',
              type: 'textarea',
              admin: {
                description:
                  'Who is in the shot? e.g., "30-year-old Asian man, short black hair disheveled, wearing light blue hospital gown, barefoot." You could also replace this with a relationship field to a `Characters` collection.',
              },
            },
            {
              name: 'emotion',
              label: 'Dominant Emotion',
              type: 'text',
              admin: { placeholder: 'e.g., Confusion, Determination, Psychological Distress' },
            },
          ],
        },
      ],
    },

    // --- LAYER 5: CONTEXTUAL ENHANCEMENT ---
    {
      label: 'Layer 5: Contextual Enhancement',
      type: 'collapsible',
      fields: [
        {
          name: 'context',
          label: 'Contextual Details',
          type: 'group',
          fields: [
            {
              name: 'genre',
              label: 'Genre',
              type: 'text',
              admin: { placeholder: 'e.g., Medical Horror, Psychological Thriller, Film Noir' },
            },
            {
              name: 'cinematicReferences',
              label: 'Cinematic References (Films, Directors)',
              type: 'textarea',
              admin: {
                description:
                  'Use reference stacking. e.g., "Inspired by Shutter Island and One Flew Over the Cuckoo\'s Nest", "Chase sequence inspired by Paul Greengrass\'s Bourne films", "Hitchcockian insert shot for narrative emphasis."',
              },
            },
            {
              name: 'cinematographerInfluence',
              label: 'Cinematographer Influence',
              type: 'text',
              admin: { placeholder: 'e.g., Roger Deakins, Michael Mann, Emmanuel Lubezki' },
            },
            {
              name: 'photorealismTriggers',
              label: 'Photorealism Triggers',
              type: 'multiselect',
              options: [
                'photorealistic human proportions and anatomy',
                'natural skin texture with fine details',
                'realistic eye moisture and blood vessels',
                'authentic fabric physics and draping',
                'accurate depth of field falloff',
                'lens breathing and organic imperfections',
                'motivated practical lighting sources',
                'natural motion blur from movement',
                'realistic atmospheric haze and particles',
                'true-to-life color science and grading',
              ],
              admin: {
                description: 'Select keywords that push the AI towards a more realistic result.',
              },
            },
            {
              name: 'extendedContext',
              label: 'Extended Context / Notes',
              type: 'textarea',
              admin: {
                description:
                  'Final details that add depth. e.g., "Opening shot establishing overwhelming isolation and vulnerability", "Using Dutch angle to externalize internal chaos."',
              },
            },
          ],
        },
      ],
    },
  ],
}

export default Shots

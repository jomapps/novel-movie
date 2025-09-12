# Character Voice Management Guide

## Overview
When we create a character, after his profile is created. we want to generate a voice for him. This voice id  will be used to generate audio for the character in the future. all his data will be used to give his voice unique personality.

## LLM Used
we will Eleven Labs to generate the voice. The feature of Eleven Labs we will use is voice design. The endpoint for docs is https://elevenlabs.io/docs/cookbooks/voices/voice-design and the env has the ELEVENLABS_API_KEY set and working

## Technical
elevnlabs allows sdk
npm install @elevenlabs/elevenlabs-js
npm install dotenv

and we should use that.

## db structure
Each character is saved in the characters collection. Here is the voice related fields:
```object
{
  name: 'dialogueVoice',
  type: 'group',
  fields: [
    { name: 'voiceDescription', type: 'text' },
    { name: 'style', type: 'text' },
    {
      name: 'patterns',
      type: 'array',
      fields: [{ name: 'pattern', type: 'text', required: true }],
    },
    { name: 'vocabulary', type: 'textarea' },
  ],
},
{
  name: 'voiceModels',
  type: 'array',
  admin: { description: 'Voice generation models; include optional sample audio from Media' },
  fields: [
    {
      name: 'provider',
      type: 'select',
      options: [
        { label: 'ElevenLabs', value: 'elevenlabs' },
        { label: 'OpenAI', value: 'openai' },
        { label: 'Azure', value: 'azure' },
        { label: 'Other', value: 'other' },
      ],
    },
    { name: 'voiceId', type: 'text' },
    { name: 'voiceName', type: 'text' },
    { name: 'voiceSample', type: 'relationship', relationTo: 'media' },
    { name: 'isDefault', type: 'checkbox' },
  ],
}
```
## Where
in screenplay in section character development in character detail section we will have a button next to the images button.
Similar to the images, we will open a page with the voice management.
Again like image, the system will generation a prompt that will be used to generate the voice.
User has the option to edit the prompt before generating the voice.
once generated, the voice id and sample audio will be saved in the voiceModels array. The voice sample will need to be downloaded and uploaded to the media collection. They will be shown in the page for preview. There will also be a test button that will open a modal to test the voice with a text input. once happy, the user can set the voice as default.
We will be able to regenerate the voice as many times as we want. Each time, a new voice id will be generated and added to the voiceModels array.
Once default is set, other vocies and their data will be deleted. we do not want remanant.
Also upon setting default, the character-library will be updated.

## Update Character Library
Use the docs in /externalServices/character-library folder for refernce

## Note
- no fallbacks
- no mack data
- no temporary fix
- we are developing so we are ok with errors. it works  or it does not.
- we are in nextjs v15+ params and searchParams are async
- we are using payloadcms v3. ensure correct patterns to instantiate the payload variable. refer to docs/payloadcms-integration.md
Do not disturb rest of the app as it is all working.


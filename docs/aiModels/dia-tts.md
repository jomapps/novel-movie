# FAL DIA TTS - fal-ai/dia-tts

## Overview
Dia directly generates realistic dialogue from transcripts. Audio conditioning enables emotion control. Produces natural nonverbals like laughter and throat clearing. This is an open weights text-to-dialogue model that provides full control over scripts and voices.

## Model Endpoint
- **Model ID**: `fal-ai/dia-tts`
- **Type**: Text to Speech
- **Use Case**: Realistic dialogue generation with natural nonverbals and emotion control
- **Model Type**: Open weights

## Key Features
- **Realistic Dialogue**: Generates natural-sounding conversations
- **Emotion Control**: Audio conditioning for emotional expression
- **Natural Nonverbals**: Includes laughter, throat clearing, and other natural sounds
- **Multi-Speaker Support**: Handle multiple speakers in dialogue
- **Script Control**: Full control over dialogue scripts and voice characteristics

## Authentication
- **Method**: API Key authentication
- **Environment Variable**: `FAL_KEY`
- **Client Configuration**: Can be set manually via `fal.config({ credentials: "YOUR_FAL_KEY" })`

## Installation
```bash
npm install --save @fal-ai/client
```

## Basic Usage
```javascript
import { fal } from "@fal-ai/client";

const result = await fal.subscribe("fal-ai/dia-tts", {
  input: {
    text: "[S1] Dia is an open weights text to dialogue model. [S2] You get full control over scripts and voices. [S1] Wow. Amazing. (laughs) [S2] Try it now on Fal."
  },
  logs: true,
  onQueueUpdate: (update) => {
    if (update.status === "IN_PROGRESS") {
      update.logs.map((log) => log.message).forEach(console.log);
    }
  },
});
```

## Input Schema

### Required Parameters
- **`text`** (string): The text to be converted to speech

### Text Formatting
The model uses special formatting for dialogue control:

#### Speaker Tags
- **`[S1]`**: Speaker 1
- **`[S2]`**: Speaker 2
- **`[S3]`**: Speaker 3 (and so on)

#### Nonverbal Annotations
- **`(laughs)`**: Natural laughter
- **`(sighs)`**: Sighing sounds
- **`(clears throat)`**: Throat clearing
- **`(whispers)`**: Whispering tone
- **`(shouts)`**: Loud/shouting tone

### Example Input
```json
{
  "text": "[S1] Dia is an open weights text to dialogue model. [S2] You get full control over scripts and voices. [S1] Wow. Amazing. (laughs) [S2] Try it now on Fal."
}
```

### Advanced Text Examples
```javascript
// Multi-speaker conversation with emotions
const conversationText = `
[S1] Hello there! How are you doing today?
[S2] (sighs) I've been better, honestly.
[S1] Oh no, what's wrong? (concerned tone)
[S2] Just work stress, you know? (laughs nervously)
[S1] I totally understand. Want to talk about it?
`;

// Narrative with multiple characters
const narrativeText = `
[S1] Once upon a time, in a land far away...
[S2] (interrupting) Wait, wait! I've heard this story before!
[S1] (laughs) Okay, okay. Let me tell you a different one.
[S3] (whispers) Make it a scary one!
`;
```

## Output Schema

### Response Structure
- **`audio`** (File object): The generated speech audio

### File Object Structure
- **`url`** (string): The URL where the audio file can be downloaded from
- **`content_type`** (string): The mime type of the file (typically "audio/mp3")
- **`file_name`** (string): The name of the file
- **`file_size`** (integer): The size of the file in bytes

### Example Output
```json
{
  "audio": {
    "url": "https://v3.fal.media/files/elephant/d5lORit2npFfBykcAtyUr_tmplacfh8oa.mp3",
    "content_type": "audio/mp3",
    "file_name": "generated_dialogue.mp3",
    "file_size": 245760
  }
}
```

## Queue Operations

### Submit Request
```javascript
const { request_id } = await fal.queue.submit("fal-ai/dia-tts", {
  input: {
    text: "[S1] Hello world! [S2] This is amazing! (laughs)"
  },
  webhookUrl: "https://optional.webhook.url/for/results",
});
```

### Check Status
```javascript
const status = await fal.queue.status("fal-ai/dia-tts", {
  requestId: "764cabcf-b745-4b3e-ae38-1200304cf45b",
  logs: true,
});
```

### Get Result
```javascript
const result = await fal.queue.result("fal-ai/dia-tts", {
  requestId: "764cabcf-b745-4b3e-ae38-1200304cf45b"
});
```

## Voice Cloning (CloneRequest)

### Advanced Feature: Voice Cloning
The model also supports voice cloning with reference audio:

#### CloneRequest Parameters
- **`text`** (string): The text to be converted to speech
- **`ref_audio_url`** (string): The URL of the reference audio file
- **`ref_text`** (string): The reference text used for TTS

#### Voice Cloning Example
```javascript
const cloneResult = await fal.subscribe("fal-ai/dia-tts", {
  input: {
    text: "[S1] This is my cloned voice speaking!",
    ref_audio_url: "https://example.com/reference-voice.mp3",
    ref_text: "This is the reference text that matches the reference audio."
  }
});
```

## Use Cases

### Content Creation
- **Podcast Generation**: Create realistic podcast conversations
- **Audiobook Narration**: Multi-character audiobook production
- **Educational Content**: Interactive learning materials with dialogue
- **Marketing**: Conversational advertisements and presentations

### Entertainment
- **Game Development**: Character dialogue and voice acting
- **Animation**: Voice tracks for animated content
- **Interactive Stories**: Choose-your-own-adventure audio experiences
- **Radio Drama**: Modern radio show production

### Accessibility
- **Text-to-Speech**: Enhanced accessibility for written content
- **Language Learning**: Conversational practice materials
- **Communication Aids**: Assistive technology applications

## Best Practices

### Script Writing
- **Clear Speaker Tags**: Always use `[S1]`, `[S2]` format for speaker identification
- **Natural Flow**: Write dialogue as it would naturally occur
- **Nonverbal Cues**: Include `(laughs)`, `(sighs)` for realistic expression
- **Punctuation**: Use proper punctuation for natural pacing

### Audio Quality
- **Reference Audio**: Use high-quality reference audio for voice cloning
- **Text Matching**: Ensure reference text closely matches reference audio
- **Length Considerations**: Longer texts may require more processing time

### Technical Implementation
```javascript
// Error handling example
try {
  const result = await fal.subscribe("fal-ai/dia-tts", {
    input: { text: dialogueScript },
    timeout: 60000 // 60 second timeout
  });
  
  // Process the audio result
  const audioUrl = result.data.audio.url;
  console.log("Generated audio:", audioUrl);
  
} catch (error) {
  console.error("TTS generation failed:", error);
}
```

## File Handling

### Supported Input Methods
1. **Direct Text**: Pass text directly in the request
2. **Reference Audio**: URLs for voice cloning reference files
3. **File Upload**: Upload reference audio using fal.storage.upload()

### File Upload Example
```javascript
const referenceAudio = new File([audioData], "reference.mp3", { type: "audio/mp3" });
const refAudioUrl = await fal.storage.upload(referenceAudio);

const result = await fal.subscribe("fal-ai/dia-tts", {
  input: {
    text: "[S1] Cloned voice example",
    ref_audio_url: refAudioUrl,
    ref_text: "Original reference text"
  }
});
```

## Performance and Billing
- Processing time varies with text length and complexity
- Voice cloning requires additional processing time
- Commercial use supported
- Open weights model provides transparency and control

## Integration Tips
- Use streaming for real-time applications
- Implement proper queue management for batch processing
- Cache frequently used voice profiles
- Test different nonverbal annotations for optimal results
- Consider audio post-processing for specific use cases

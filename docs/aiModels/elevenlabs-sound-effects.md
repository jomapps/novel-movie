# ElevenLabs Sound Effects - fal-ai/elevenlabs/sound-effects

## Overview
Generate sound effects using ElevenLabs advanced sound effects model. Turn text into sound effects for videos, voice-overs or video games using state-of-the-art sound generation technology.

## Model Endpoint
- **Model ID**: `fal-ai/elevenlabs/sound-effects`
- **Type**: Text to Audio / Sound Effects
- **Use Case**: Generate sound effects from text descriptions
- **Partner Model**: Yes (ElevenLabs)

## Key Features
- **Text-to-Sound**: Generate sound effects from text descriptions
- **Duration Control**: Specify duration from 0.5 to 22 seconds
- **Prompt Influence**: Control how closely the output follows the prompt
- **High Quality**: Professional-grade sound effects generation
- **MP3 Output**: Generated audio in MP3 format

## Authentication
- **Method**: API Key authentication
- **Environment Variable**: `FAL_KEY`
- **Client Configuration**: Can be set manually via `fal.config({ credentials: "YOUR_FAL_KEY" })`

## API Usage

### Basic Implementation
```javascript
import { fal } from "@fal-ai/client";

const result = await fal.subscribe("fal-ai/elevenlabs/sound-effects", {
  input: {
    text: "Spacious braam suitable for high-impact movie trailer moments"
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
- **`text`** (string): The text describing the sound effect to generate

### Optional Parameters
- **`duration_seconds`** (float): Duration in seconds (0.5-22). If None, optimal duration will be determined from prompt
- **`prompt_influence`** (float): How closely to follow the prompt (0-1). Higher values mean less variation. Default: 0.3

### Example Input
```json
{
  "text": "Spacious braam suitable for high-impact movie trailer moments",
  "duration_seconds": 5.0,
  "prompt_influence": 0.3
}
```

## Output Schema

### Response Structure
- **`audio`** (File object): The generated sound effect audio file in MP3 format

### File Object Structure
- **`url`** (string): The URL where the audio file can be downloaded from
- **`content_type`** (string): The mime type of the file
- **`file_name`** (string): The name of the file
- **`file_size`** (integer): The size of the file in bytes

### Example Output
```json
{
  "audio": {
    "url": "https://v3.fal.media/files/lion/WgnO-jy6WduosuG_Ibobx_sound_effect.mp3",
    "content_type": "audio/mp3",
    "file_name": "sound_effect.mp3",
    "file_size": 245760
  }
}
```

## Sound Effect Prompts

### Effective Prompt Examples
```javascript
// Cinematic effects
"Spacious braam suitable for high-impact movie trailer moments"
"Deep rumbling thunder with distant lightning strikes"
"Dramatic orchestral hit with reverb"

// Ambient sounds
"Gentle rain falling on leaves in a forest"
"Ocean waves crashing against rocky shore"
"Wind blowing through tall grass"

// Action sounds
"Sword clashing against metal shield"
"Footsteps running on gravel path"
"Door creaking open slowly"

// Electronic/Sci-fi
"Futuristic laser beam charging up"
"Digital glitch with static noise"
"Spaceship engine humming"
```

## Prompt Guidelines

### Best Practices
- **Be Descriptive**: Include specific details about the sound
- **Mention Context**: Describe the environment or situation
- **Add Qualities**: Include adjectives for texture, intensity, duration
- **Specify Materials**: Mention what objects are involved

### Effective Elements
- **Environment**: Forest, ocean, city, space, underground
- **Materials**: Metal, wood, glass, water, stone
- **Intensity**: Gentle, loud, explosive, subtle, dramatic
- **Duration**: Quick, sustained, fading, building

## Duration Control

### Duration Guidelines
- **Short Effects (0.5-2s)**: Quick impacts, clicks, pops
- **Medium Effects (2-8s)**: Transitions, whooshes, musical stings
- **Long Effects (8-22s)**: Ambient loops, sustained drones, complex sequences

### Optimal Duration
- If no duration specified, the model determines optimal length based on prompt
- Consider the intended use case when specifying duration
- Longer durations work better for ambient/background sounds

## Integration Workflow

### Step 1: Generate Sound Effect
```javascript
const soundEffect = await fal.subscribe("fal-ai/elevenlabs/sound-effects", {
  input: {
    text: "Thunder rumbling in the distance",
    duration_seconds: 8.0,
    prompt_influence: 0.5
  }
});

const audioUrl = soundEffect.data.audio.url;
```

### Step 2: Use in Production
```javascript
// Download and use the generated audio
const audioFile = await fetch(audioUrl);
const audioBlob = await audioFile.blob();
```

## Pricing
- **Billing Unit**: Per second of sound effects generated
- **Rate**: $0.002 per second
- **Usage-Based**: Pay per generation request

## Performance Considerations
- **Processing Time**: Varies based on duration and complexity
- **Queue System**: Use queue management for production applications
- **File Storage**: Audio files are temporarily hosted on FAL servers

## Use Cases
- **Movie Production**: Background ambience, sound effects
- **Video Games**: Interactive audio, environmental sounds
- **Podcasts**: Transition effects, background atmosphere
- **Marketing**: Commercial sound effects, brand audio
- **Music Production**: Layered soundscapes, textural elements

## Status
✅ **AVAILABLE** - Sound effects generation ready for implementation

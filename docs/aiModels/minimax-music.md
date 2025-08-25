# MiniMax Music - fal-ai/minimax-music

## Overview
Generate music from text prompts using the MiniMax model, which leverages advanced AI techniques to create high-quality, diverse musical compositions.

## Model Endpoint
- **Model ID**: `fal-ai/minimax-music`
- **Type**: Text to Audio / Music Generation
- **Use Case**: Generate music from lyrics and reference audio
- **Partner Model**: Yes (MiniMax/Hailuo AI)

## Key Features
- **Lyric-Based Generation**: Create music from text lyrics
- **Reference Audio**: Use existing songs as style reference
- **Formatting Support**: Special formatting for lyrics structure
- **High Quality**: Professional-grade music generation
- **MP3 Output**: Generated music in MP3 format

## Authentication
- **Method**: API Key authentication
- **Environment Variable**: `FAL_KEY`
- **Client Configuration**: Can be set manually via `fal.config({ credentials: "YOUR_FAL_KEY" })`

## API Usage

### Basic Implementation
```javascript
import { fal } from "@fal-ai/client";

const result = await fal.subscribe("fal-ai/minimax-music", {
  input: {
    prompt: "## Fast and Limitless\nIn the heart of the code, where dreams collide,\nFAL's the name, taking tech for a ride.\nGenerative media, blazing the trail,\nFast inference power, we'll never fail.\n##",
    reference_audio_url: "https://fal.media/files/lion/OOTBTSlxKMH_E8H6hoSlb.mpga"
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
- **`prompt`** (string): Lyrics with optional formatting. Maximum 600 characters
- **`reference_audio_url`** (string): Reference song, should contain music and vocals. Must be a .wav or .mp3 file longer than 15 seconds

### Lyric Formatting
- **Line Separation**: Use newline (`\n`) to separate each line of lyrics
- **Pauses**: Use two newlines (`\n\n`) to add a pause between lines
- **Accompaniment**: Use double hash marks (`##`) at the beginning and end of lyrics to add accompaniment

### Example Input
```json
{
  "prompt": "## Verse 1\nWalking down the street tonight,\nCity lights are burning bright.\n\n## Chorus\nThis is our moment, this is our time,\nEverything's gonna be just fine.\n##",
  "reference_audio_url": "https://fal.media/files/lion/OOTBTSlxKMH_E8H6hoSlb.mpga"
}
```

## Output Schema

### Response Structure
- **`audio`** (File object): The generated music

### File Object Structure
- **`url`** (string): The URL where the audio file can be downloaded from
- **`content_type`** (string): The mime type of the file
- **`file_name`** (string): The name of the file
- **`file_size`** (integer): The size of the file in bytes

### Example Output
```json
{
  "audio": {
    "url": "https://fal.media/files/elephant/N5UNLCwkC2y8v7a3LQLFE_output.mp3",
    "content_type": "audio/mp3",
    "file_name": "output.mp3",
    "file_size": 2048576
  }
}
```

## Lyric Writing Guidelines

### Effective Lyric Structure
```javascript
// Verse-Chorus Structure
"## Verse 1\nFirst verse lyrics here,\nTelling the story clear.\n\n## Chorus\nCatchy chorus line,\nMelody so fine.\n\n## Verse 2\nSecond verse continues,\nThe narrative through.\n##"

// Bridge Structure
"## Verse\nMain verse content\n\n## Bridge\nContrasting section\n\n## Chorus\nReturning to main theme\n##"

// Instrumental Sections
"## Intro\n[Instrumental]\n\n## Verse\nLyrics begin here\n\n## Outro\n[Fade out]\n##"
```

### Best Practices
- **Character Limit**: Keep within 600 characters maximum
- **Clear Structure**: Use section markers (##) for organization
- **Natural Flow**: Write lyrics that flow naturally when sung
- **Emotional Content**: Include emotional themes for better musical interpretation

## Reference Audio Guidelines

### Audio Requirements
- **Format**: .wav or .mp3 files only
- **Duration**: Must be longer than 15 seconds
- **Content**: Should contain both music and vocals
- **Quality**: Higher quality reference audio produces better results

### Effective Reference Audio
- **Style Match**: Choose reference that matches desired musical style
- **Vocal Style**: Reference vocals should match intended vocal delivery
- **Instrumentation**: Consider the instruments you want in the final output
- **Tempo**: Reference tempo will influence the generated music

## Integration Workflow

### Step 1: Prepare Lyrics and Reference
```javascript
const lyrics = `## Verse 1
Walking through the digital realm,
AI at the helm.

## Chorus  
Innovation flows like a stream,
Living the tech dream.
##`;

const referenceUrl = "https://example.com/reference-song.mp3";
```

### Step 2: Generate Music
```javascript
const music = await fal.subscribe("fal-ai/minimax-music", {
  input: {
    prompt: lyrics,
    reference_audio_url: referenceUrl
  }
});

const musicUrl = music.data.audio.url;
```

### Step 3: Use Generated Music
```javascript
// Download and use the generated music
const musicFile = await fetch(musicUrl);
const musicBlob = await musicFile.blob();
```

## Musical Styles

### Genre Adaptation
The model adapts to various genres based on reference audio:
- **Pop**: Catchy melodies, clear structure
- **Rock**: Driving rhythms, powerful vocals
- **Folk**: Acoustic instruments, storytelling
- **Electronic**: Synthesized sounds, digital effects
- **Classical**: Orchestral arrangements, complex harmonies

## Pricing
- **Billing Unit**: Per generation
- **Rate**: $0.035 per generation
- **Usage-Based**: Pay per music generation request

## Performance Considerations
- **Processing Time**: Music generation takes longer than simple audio
- **Queue System**: Use queue management for production applications
- **File Size**: Generated music files can be large (2-10MB typical)

## Use Cases
- **Film Scoring**: Background music for movies and videos
- **Advertising**: Commercial jingles and brand music
- **Content Creation**: YouTube, podcast, social media music
- **Game Audio**: Background music for video games
- **Personal Projects**: Custom songs and musical compositions

## Limitations
- **Lyric Length**: Maximum 600 characters
- **Reference Dependency**: Requires reference audio for style guidance
- **Language**: Optimized for English lyrics
- **Duration**: Generated music length depends on lyric content and reference

## Status
✅ **AVAILABLE** - Music generation ready for implementation

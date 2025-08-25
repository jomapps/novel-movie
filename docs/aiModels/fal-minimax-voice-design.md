# FAL MiniMax Voice Design - fal-ai/minimax/voice-design

## Overview
MiniMax Voice Design is an innovative AI-powered voice generation system that creates personalized voices from text descriptions. Unlike voice cloning which requires audio samples, Voice Design generates entirely new voices based on descriptive prompts, enabling creative voice synthesis for characters, personas, and unique vocal characteristics.

## Model Endpoint
- **Model ID**: `fal-ai/minimax/voice-design`
- **Type**: Text to Speech (Voice Generation)
- **Use Case**: Generate custom voices from text descriptions and create speech with designed voices
- **Partner Model**: Yes (MiniMax)
- **Key Features**: Text-based voice generation, instant preview audio, creative voice design

## Input Parameters

### Required Parameters
- **`prompt`** (string): Voice description prompt for generating a personalized voice
- **`preview_text`** (string): Text for audio preview. Limited to 500 characters. A fee of $30 per 1M characters will be charged for the generation of the preview audio.

## Request Format

### Basic Voice Design
```json
{
  "prompt": "Professional female narrator, warm and authoritative, middle-aged, clear articulation",
  "preview_text": "Welcome to our comprehensive guide on voice design technology."
}
```

### Creative Voice Design
```json
{
  "prompt": "Bubbly and excitable female pop star interviewee, youthful, slightly breathless, and very enthusiastic",
  "preview_text": "Oh my gosh, hi! It's like so amazing to be here. This new endpoint just dropped on fal and the results have been like totally incredible. Use it now, It's gonna be like epic!"
}
```

## Response Format

### Success Response
```json
{
  "custom_voice_id": "designed_voice_67890",
  "audio": {
    "url": "https://v3.fal.media/files/kangaroo/gT22cxTqxgLtGMSDz2JSq_preview.mp3",
    "content_type": "audio/mp3",
    "file_name": "voice_preview.mp3",
    "file_size": 187392
  }
}
```

### Response Fields
- **`custom_voice_id`** (string): The unique ID of the designed voice for use with TTS APIs
- **`audio`** (File): Preview audio generated with the designed voice using the provided preview text

## Voice Design Prompt Guidelines

### Effective Prompt Structure
```
[Age/Gender] + [Personality Traits] + [Voice Characteristics] + [Speaking Style] + [Context/Role]
```

### Voice Characteristics to Include
- **Age**: young, middle-aged, elderly, teenage, mature
- **Gender**: male, female, non-binary, androgynous
- **Personality**: confident, shy, energetic, calm, authoritative, friendly
- **Tone**: warm, cold, professional, casual, dramatic, monotone
- **Pace**: fast-talking, slow and deliberate, measured, rushed
- **Accent/Style**: neutral, regional, professional, conversational
- **Emotional Quality**: enthusiastic, melancholic, upbeat, serious, playful

### Example Prompts by Use Case

#### Professional/Corporate
```json
{
  "prompt": "Confident middle-aged male executive, authoritative yet approachable, clear articulation, professional tone",
  "preview_text": "Welcome to our quarterly business review. Let's examine the key performance indicators."
}
```

#### Character/Entertainment
```json
{
  "prompt": "Wise elderly wizard, deep resonant voice, mysterious and knowing, slightly gravelly with ancient wisdom",
  "preview_text": "The ancient prophecy speaks of a chosen one who will restore balance to the realm."
}
```

#### Educational/Narration
```json
{
  "prompt": "Friendly female teacher, patient and encouraging, clear pronunciation, warm and nurturing",
  "preview_text": "Today we're going to explore the fascinating world of artificial intelligence and machine learning."
}
```

#### Marketing/Commercial
```json
{
  "prompt": "Energetic young male spokesperson, enthusiastic and persuasive, upbeat and engaging",
  "preview_text": "Don't miss out on this incredible limited-time offer! Call now and save up to fifty percent!"
}
```

## Best Settings and Usage

### Recommended Configuration
```javascript
{
  "prompt": "Detailed voice description with specific characteristics",
  "preview_text": "Concise preview text under 500 characters"
}
```

### Preview Text Guidelines
- **Keep under 500 characters** to avoid additional charges
- **Use representative content** that matches intended use case
- **Include varied speech patterns** (questions, statements, emotions)
- **Test pronunciation** of key terms or names
- **Match the voice's intended context** (formal, casual, dramatic)

## Usage Examples

### Basic Voice Design
```javascript
import { fal } from "@fal-ai/client";

const result = await fal.subscribe("fal-ai/minimax/voice-design", {
  input: {
    prompt: "Professional female narrator, warm and authoritative, middle-aged, clear articulation",
    preview_text: "Welcome to our comprehensive guide on voice design technology."
  }
});

console.log("Designed voice ID:", result.data.custom_voice_id);
console.log("Preview audio:", result.data.audio.url);
```

### Character Voice Creation
```javascript
const result = await fal.subscribe("fal-ai/minimax/voice-design", {
  input: {
    prompt: "Gruff pirate captain, weathered and commanding, slight rasp from years at sea, authoritative but with hidden warmth",
    preview_text: "Ahoy there, matey! Welcome aboard the finest ship to sail these treacherous waters. We've got adventures ahead!"
  }
});
```

### Advanced Configuration with Logging
```javascript
const result = await fal.subscribe("fal-ai/minimax/voice-design", {
  input: {
    prompt: "Sophisticated British butler, impeccably polite, refined accent, measured speech with perfect diction",
    preview_text: "Good evening, sir. Dinner is served in the main dining room. Shall I inform the chef of any dietary preferences?"
  },
  logs: true,
  onQueueUpdate: (update) => {
    if (update.status === "IN_PROGRESS") {
      update.logs.map((log) => log.message).forEach(console.log);
    }
  }
});
```

### Queue-based Processing
```javascript
// Submit design request
const { request_id } = await fal.queue.submit("fal-ai/minimax/voice-design", {
  input: {
    prompt: "Mysterious fortune teller, ethereal and otherworldly, soft whispers with mystical undertones",
    preview_text: "The cards reveal secrets hidden in the mists of time. Your destiny awaits, dear seeker."
  }
});

// Check status and get result
const status = await fal.queue.status("fal-ai/minimax/voice-design", {
  requestId: request_id,
  logs: true
});

if (status.status === "COMPLETED") {
  const result = await fal.queue.result("fal-ai/minimax/voice-design", {
    requestId: request_id
  });
}
```

## Integration with System

### Environment Configuration
```bash
FAL_KEY=your-fal-api-key
FAL_VOICE_DESIGN=fal-ai/minimax/voice-design
```

### System Integration Pattern
```javascript
async function designVoice(voiceDescription, previewText, options = {}) {
  const config = {
    prompt: voiceDescription,
    preview_text: previewText.substring(0, 500) // Ensure under 500 chars
  };
  
  try {
    const result = await fal.subscribe("fal-ai/minimax/voice-design", {
      input: config,
      timeout: 300000 // 5 minutes
    });
    
    return {
      success: true,
      voiceId: result.data.custom_voice_id,
      previewUrl: result.data.audio.url,
      previewFileSize: result.data.audio.file_size,
      contentType: result.data.audio.content_type
    };
  } catch (error) {
    return {
      success: false,
      error: error.message
    };
  }
}
```

## Performance Characteristics

### Processing Times
- **Simple voice designs**: 30-60 seconds
- **Complex character voices**: 1-2 minutes
- **Preview generation**: Included in processing time
- **Queue processing**: Recommended for production use

### Quality Factors
- **Prompt specificity**: More detailed descriptions = better results
- **Consistent characteristics**: Avoid contradictory traits
- **Preview text relevance**: Match intended use case
- **Character coherence**: Ensure voice matches described persona

## Pricing
- **Billing Unit**: Per designed voice
- **Price**: $1.00 per voice design
- **Preview Audio**: $30 per 1M characters (typically negligible for 500-char previews)
- **Note**: Preview generation included in base price for standard usage

## Error Handling
```javascript
try {
  const result = await fal.subscribe("fal-ai/minimax/voice-design", {
    input: config,
    timeout: 300000
  });
} catch (error) {
  if (error.status === 422) {
    console.error("Validation error:", error.body.detail);
    // Check prompt clarity or preview text length
  } else if (error.status === 500) {
    console.error("Server error - try again later");
  } else {
    console.error("Voice design failed:", error.message);
  }
}
```

## Using Designed Voices

### With MiniMax TTS APIs
Once you have a `custom_voice_id`, you can use it with MiniMax TTS endpoints:

```javascript
// Use designed voice with speech-02-hd
const ttsResult = await fal.subscribe("fal-ai/minimax/speech-02-hd", {
  input: {
    text: "Your text to synthesize with the designed voice",
    voice_setting: {
      voice_id: "your_designed_voice_id", // Use the designed voice ID
      speed: 1.0,
      vol: 1.0,
      pitch: 0
    }
  }
});
```

## Limitations
- Preview text limited to 500 characters
- English language optimized (other languages may vary)
- Voice ID is permanent once created
- Cannot modify existing designed voices
- Single voice per request
- Processing time varies with complexity

## Tips for Best Results
1. **Be specific and detailed** in voice descriptions
2. **Include multiple characteristics** (age, gender, personality, tone)
3. **Avoid contradictory traits** (e.g., "loud whisper")
4. **Use contextual descriptions** (teacher, narrator, character type)
5. **Test with representative preview text** for intended use
6. **Keep preview under 500 characters** to avoid extra charges
7. **Consider the target audience** and use case
8. **Iterate on prompts** to refine voice characteristics
9. **Use emotional descriptors** for more expressive voices
10. **Include speaking style details** (pace, articulation, accent)

## Voice Management
- Voice IDs are permanent and cannot be deleted via this API
- Each design operation creates a new unique voice ID
- Store voice IDs securely for future TTS use
- Test designed voices with various texts to ensure quality
- Consider creating voice libraries for different use cases

## Comparison with Voice Cloning
- **Voice Design**: Creates new voices from text descriptions
- **Voice Cloning**: Replicates existing voices from audio samples
- **Use Voice Design for**: Original characters, creative projects, when no audio sample exists
- **Use Voice Cloning for**: Replicating specific real voices, maintaining consistency with existing audio

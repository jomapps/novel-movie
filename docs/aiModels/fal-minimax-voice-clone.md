# FAL MiniMax Voice Clone - fal-ai/minimax/voice-clone

## Overview
MiniMax Voice Cloning is an advanced AI-powered voice cloning system that creates custom voice models from audio samples. The model leverages cutting-edge AI techniques to analyze voice characteristics and generate high-quality text-to-speech with the cloned voice, enabling personalized speech synthesis for various applications.

## Model Endpoint
- **Model ID**: `fal-ai/minimax/voice-clone`
- **Type**: Text to Speech (Voice Cloning)
- **Use Case**: Clone voices from audio samples and generate speech with cloned voices
- **Partner Model**: Yes (MiniMax)
- **Key Features**: Voice cloning, TTS preview generation, noise reduction, volume normalization

## Input Parameters

### Required Parameters
- **`audio_url`** (string): URL of the input audio file for voice cloning. Should be at least 10 seconds long.

### Optional Parameters
- **`noise_reduction`** (boolean): Enable noise reduction for the cloned voice. Default: `false`
- **`need_volume_normalization`** (boolean): Enable volume normalization for the cloned voice. Default: `false`
- **`accuracy`** (float): Text validation accuracy threshold (0-1). Higher values ensure better quality but may be more restrictive
- **`text`** (string): Text to generate a TTS preview with the cloned voice. Default: `"Hello, this is a preview of your cloned voice! I hope you like it!"`
- **`model`** (enum): TTS model to use for preview. Default: `"speech-02-hd"`

### TTS Model Options
Available models for preview generation:
- **`speech-02-hd`**: High-definition speech model (Default, best quality)
- **`speech-02-turbo`**: Turbo speech model (faster generation)
- **`speech-01-hd`**: Legacy HD speech model
- **`speech-01-turbo`**: Legacy turbo speech model

## Request Formats

### Basic Voice Cloning (No Preview)
```json
{
  "audio_url": "https://example.com/voice-sample.wav"
}
```

### Voice Cloning with Preview
```json
{
  "audio_url": "https://example.com/voice-sample.wav",
  "text": "Hello, this is a preview of your cloned voice!",
  "model": "speech-02-hd"
}
```

### Advanced Configuration
```json
{
  "audio_url": "https://example.com/voice-sample.wav",
  "noise_reduction": true,
  "need_volume_normalization": true,
  "accuracy": 0.8,
  "text": "Welcome to our AI video testing platform!",
  "model": "speech-02-hd"
}
```

## Response Format

### Success Response
```json
{
  "custom_voice_id": "cloned_voice_12345",
  "audio": {
    "url": "https://fal.media/files/kangaroo/kojPUCNZ9iUGFGMR-xb7h_speech.mp3",
    "content_type": "audio/mp3",
    "file_name": "preview.mp3",
    "file_size": 245760
  }
}
```

### Response Fields
- **`custom_voice_id`** (string): The unique ID of the cloned voice for use with TTS APIs
- **`audio`** (File, optional): Preview audio generated with the cloned voice (if text was provided)

## Best Settings and Usage

### Recommended Configuration for High Quality
```javascript
{
  "audio_url": "https://your-audio-sample.wav",
  "noise_reduction": true,              // Clean up audio quality
  "need_volume_normalization": true,    // Normalize volume levels
  "accuracy": 0.85,                     // High accuracy threshold
  "text": "Your preview text here",
  "model": "speech-02-hd"              // Best quality model
}
```

### Quick Cloning Configuration
```javascript
{
  "audio_url": "https://your-audio-sample.wav",
  "model": "speech-02-turbo"           // Faster preview generation
}
```

### Audio Quality Guidelines
- **Use `noise_reduction: true`** for: Noisy or low-quality source audio
- **Use `need_volume_normalization: true`** for: Audio with inconsistent volume levels
- **Set `accuracy: 0.7-0.9`** for: Balance between quality and success rate
- **Choose `speech-02-hd`** for: Best quality previews
- **Choose `speech-02-turbo`** for: Faster processing

## Usage Examples

### Basic Voice Cloning
```javascript
import { fal } from "@fal-ai/client";

const result = await fal.subscribe("fal-ai/minimax/voice-clone", {
  input: {
    audio_url: "https://example.com/speaker-sample.wav"
  }
});

console.log("Cloned voice ID:", result.data.custom_voice_id);
```

### Voice Cloning with Preview
```javascript
const result = await fal.subscribe("fal-ai/minimax/voice-clone", {
  input: {
    audio_url: "https://example.com/speaker-sample.wav",
    text: "Hello, this is a test of the cloned voice!",
    model: "speech-02-hd",
    noise_reduction: true,
    need_volume_normalization: true
  }
});

console.log("Voice ID:", result.data.custom_voice_id);
console.log("Preview audio:", result.data.audio.url);
```

### Advanced Configuration with Logging
```javascript
const result = await fal.subscribe("fal-ai/minimax/voice-clone", {
  input: {
    audio_url: "https://example.com/high-quality-sample.wav",
    accuracy: 0.9,
    text: "Welcome to our advanced AI platform!",
    model: "speech-02-hd",
    noise_reduction: true,
    need_volume_normalization: true
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
// Submit cloning request
const { request_id } = await fal.queue.submit("fal-ai/minimax/voice-clone", {
  input: {
    audio_url: "https://example.com/long-sample.wav",
    text: "This is a comprehensive test of voice cloning capabilities.",
    model: "speech-02-hd"
  }
});

// Check status and get result
const status = await fal.queue.status("fal-ai/minimax/voice-clone", {
  requestId: request_id,
  logs: true
});

if (status.status === "COMPLETED") {
  const result = await fal.queue.result("fal-ai/minimax/voice-clone", {
    requestId: request_id
  });
}
```

## Integration with System

### Environment Configuration
```bash
FAL_KEY=your-fal-api-key
FAL_VOICE_CLONE=fal-ai/minimax/voice-clone
```

### System Integration Pattern
```javascript
async function cloneVoice(audioUrl, options = {}) {
  const config = {
    audio_url: audioUrl,
    noise_reduction: options.noiseReduction || true,
    need_volume_normalization: options.volumeNormalization || true,
    accuracy: options.accuracy || 0.8,
    model: options.model || "speech-02-hd"
  };
  
  // Add preview text if provided
  if (options.previewText) {
    config.text = options.previewText;
  }
  
  try {
    const result = await fal.subscribe("fal-ai/minimax/voice-clone", {
      input: config,
      timeout: 300000 // 5 minutes
    });
    
    return {
      success: true,
      voiceId: result.data.custom_voice_id,
      previewUrl: result.data.audio?.url,
      previewFileSize: result.data.audio?.file_size
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
- **Short samples (10-30s)**: 30-90 seconds
- **Medium samples (30s-2min)**: 1-3 minutes
- **Long samples (2min+)**: 2-5 minutes
- **Preview generation**: Additional 10-30 seconds

### Quality Factors
- **Source audio quality**: Higher quality = better cloning results
- **Audio length**: 10+ seconds minimum, 30+ seconds recommended
- **Speaker consistency**: Single speaker works best
- **Background noise**: Use noise reduction for noisy samples
- **Volume consistency**: Use normalization for varying levels

## Pricing
- **Billing Unit**: Per voice cloned
- **Price**: $1.00 per voice clone
- **Note**: Preview generation included in base price

## Audio Requirements

### Supported Audio Formats
- WAV (recommended)
- MP3
- AAC
- FLAC
- M4A

### Audio Quality Guidelines
- **Minimum length**: 10 seconds
- **Recommended length**: 30-120 seconds
- **Sample rate**: 16kHz+ (44.1kHz recommended)
- **Bit depth**: 16-bit minimum
- **Single speaker**: Best results with one consistent voice
- **Clear speech**: Minimal background noise and clear pronunciation

## Error Handling
```javascript
try {
  const result = await fal.subscribe("fal-ai/minimax/voice-clone", {
    input: config,
    timeout: 300000
  });
} catch (error) {
  if (error.status === 422) {
    console.error("Validation error:", error.body.detail);
    // Check audio format, length, or quality issues
  } else if (error.status === 500) {
    console.error("Server error - try again later");
  } else {
    console.error("Voice cloning failed:", error.message);
  }
}
```

## Using Cloned Voices

### With MiniMax TTS APIs
Once you have a `custom_voice_id`, you can use it with MiniMax TTS endpoints:

```javascript
// Use cloned voice with speech-02-hd
const ttsResult = await fal.subscribe("fal-ai/minimax/speech-02-hd", {
  input: {
    text: "Your text to synthesize",
    voice_setting: {
      voice_id: "your_custom_voice_id", // Use the cloned voice ID
      speed: 1.0,
      vol: 1.0,
      pitch: 0
    }
  }
});
```

## Limitations
- Minimum 10 seconds of source audio required
- Works best with single speaker audio
- English language optimized (other languages may vary)
- Voice ID is permanent once created
- Cannot modify existing cloned voices
- Preview text limited to reasonable lengths

## Tips for Best Results
1. **Use high-quality source audio** (clear, noise-free)
2. **Provide 30+ seconds** of consistent speech
3. **Enable noise reduction** for non-studio recordings
4. **Use volume normalization** for consistent levels
5. **Test with preview text** to validate quality
6. **Choose appropriate accuracy threshold** (0.8 recommended)
7. **Single speaker only** in source audio
8. **Clear pronunciation** improves cloning quality
9. **Consistent speaking style** throughout sample
10. **Studio-quality recordings** produce best results

## Voice Management
- Voice IDs are permanent and cannot be deleted via this API
- Each cloning operation creates a new unique voice ID
- Store voice IDs securely for future TTS use
- Test cloned voices with various texts to ensure quality

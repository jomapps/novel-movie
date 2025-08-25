# FAL Pixverse Lipsync - fal-ai/pixverse/lipsync

## Overview
Pixverse Lipsync is an advanced video-to-video model that generates realistic lip synchronization animations from audio using cutting-edge algorithms. The model provides high-quality synchronization between video and audio content with built-in Text-to-Speech (TTS) capabilities for seamless integration.

## Model Endpoint
- **Model ID**: `fal-ai/pixverse/lipsync`
- **Type**: Video to Video (Lipsync)
- **Use Case**: Synchronize lip movements in video with provided audio or generated speech
- **Partner Model**: Yes (Pixverse)
- **Key Features**: Built-in TTS, multiple voice options, high-quality synchronization

## Input Parameters

### Required Parameters
- **`video_url`** (string): URL of the input video to be lip-synced

### Optional Parameters
- **`audio_url`** (string): URL of the input audio for synchronization. If not provided, TTS will be used
- **`voice_id`** (enum): Voice to use for TTS when audio_url is not provided. Default: `"Auto"`
- **`text`** (string): Text content for TTS when audio_url is not provided

### Voice Options (TTS)
Available voices when using built-in TTS:
- **`Emily`**: Female voice
- **`James`**: Male voice  
- **`Isabella`**: Female voice
- **`Liam`**: Male voice
- **`Chloe`**: Female voice
- **`Adrian`**: Male voice
- **`Harper`**: Female voice
- **`Ava`**: Female voice
- **`Sophia`**: Female voice
- **`Julia`**: Female voice
- **`Mason`**: Male voice
- **`Jack`**: Male voice
- **`Oliver`**: Male voice
- **`Ethan`**: Male voice
- **`Auto`**: Automatic voice selection (Default)

## Request Formats

### Using External Audio
```json
{
  "video_url": "https://example.com/input-video.mp4",
  "audio_url": "https://example.com/input-audio.wav"
}
```

### Using Built-in TTS
```json
{
  "video_url": "https://example.com/input-video.mp4",
  "voice_id": "Emily",
  "text": "Hello, this is a test message."
}
```

### Complete Configuration
```json
{
  "video_url": "https://example.com/input-video.mp4",
  "audio_url": "https://example.com/input-audio.wav",
  "voice_id": "Auto",
  "text": "Fallback text if audio fails"
}
```

## Response Format

### Success Response
```json
{
  "video": {
    "url": "https://v3.fal.media/files/penguin/hsR_KXBJjuF3IIVYIIDA2_output.mp4",
    "content_type": "video/mp4",
    "file_name": "output.mp4",
    "file_size": 1732359
  }
}
```

### Response Fields
- **`video`** (File): The generated lip-synced video with URL, content type, filename, and size

## Best Settings and Usage

### Recommended Configuration for External Audio
```javascript
{
  "video_url": "https://your-video.mp4",
  "audio_url": "https://your-audio.wav"
}
```

### Recommended Configuration for TTS
```javascript
{
  "video_url": "https://your-video.mp4",
  "voice_id": "Emily",                    // Choose appropriate voice
  "text": "Your speech content here"
}
```

### Voice Selection Guide
- **Use `Auto`** for: Automatic voice matching to video content
- **Use specific voices** for: Consistent character voices across multiple videos
- **Female voices**: Emily, Isabella, Chloe, Harper, Ava, Sophia, Julia
- **Male voices**: James, Liam, Adrian, Mason, Jack, Oliver, Ethan

## Usage Examples

### Basic Lipsync with External Audio
```javascript
import { fal } from "@fal-ai/client";

const result = await fal.subscribe("fal-ai/pixverse/lipsync", {
  input: {
    video_url: "https://example.com/talking-head.mp4",
    audio_url: "https://example.com/speech.wav"
  }
});

console.log("Lip-synced video:", result.data.video.url);
```

### Lipsync with Built-in TTS
```javascript
const result = await fal.subscribe("fal-ai/pixverse/lipsync", {
  input: {
    video_url: "https://example.com/character.mp4",
    voice_id: "Emily",
    text: "Welcome to our AI video testing platform!"
  }
});

console.log("Generated video:", result.data.video.url);
```

### Advanced Configuration with Logging
```javascript
const result = await fal.subscribe("fal-ai/pixverse/lipsync", {
  input: {
    video_url: "https://example.com/video.mp4",
    audio_url: "https://example.com/audio.wav"
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
// Submit request
const { request_id } = await fal.queue.submit("fal-ai/pixverse/lipsync", {
  input: {
    video_url: "https://example.com/video.mp4",
    voice_id: "James",
    text: "This is a longer text that will be converted to speech and synced."
  }
});

// Check status and get result
const status = await fal.queue.status("fal-ai/pixverse/lipsync", {
  requestId: request_id,
  logs: true
});

if (status.status === "COMPLETED") {
  const result = await fal.queue.result("fal-ai/pixverse/lipsync", {
    requestId: request_id
  });
}
```

## Integration with System

### Environment Configuration
```bash
FAL_KEY=your-fal-api-key
FAL_PIXVERSE_LIPSYNC=fal-ai/pixverse/lipsync
```

### System Integration Pattern
```javascript
async function performPixverseLipsync(videoUrl, options = {}) {
  const config = {
    video_url: videoUrl
  };
  
  // Use external audio or TTS
  if (options.audioUrl) {
    config.audio_url = options.audioUrl;
  } else if (options.text) {
    config.text = options.text;
    config.voice_id = options.voiceId || "Auto";
  }
  
  try {
    const result = await fal.subscribe("fal-ai/pixverse/lipsync", {
      input: config,
      timeout: 300000 // 5 minutes
    });
    
    return {
      success: true,
      videoUrl: result.data.video.url,
      fileSize: result.data.video.file_size,
      contentType: result.data.video.content_type
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
- **Short videos (< 30s)**: 30-90 seconds
- **Medium videos (30s-2min)**: 1-4 minutes
- **Long videos (2min+)**: 3-12 minutes
- **TTS processing**: Additional 10-30 seconds

### Quality Factors
- **Input video quality**: Higher resolution = better results
- **Face visibility**: Clear, front-facing faces work best
- **Video stability**: Stable footage produces smoother sync
- **Audio quality**: Clear speech improves accuracy
- **TTS vs External Audio**: External audio often provides better sync quality

## Pricing
- **Billing Unit**: Per second of output video
- **Price**: $0.04 per second of video
- **Examples**: 
  - 30-second video = $1.20
  - 2-minute video = $4.80
  - 5-minute video = $12.00

## File Format Support

### Supported Video Formats
- MP4 (recommended)
- MOV
- AVI
- WebM

### Supported Audio Formats (External Audio)
- WAV (recommended)
- MP3
- AAC
- FLAC

## Error Handling
```javascript
try {
  const result = await fal.subscribe("fal-ai/pixverse/lipsync", {
    input: config,
    timeout: 300000
  });
} catch (error) {
  if (error.status === 422) {
    console.error("Validation error:", error.body.detail);
  } else if (error.status === 500) {
    console.error("Server error - try again later");
  } else {
    console.error("Pixverse lipsync failed:", error.message);
  }
}
```

## Limitations
- Maximum video length: ~10 minutes
- Requires clear facial features in video
- Works best with single speaker scenarios
- TTS quality may vary by voice selection
- Processing time scales with video length
- Built-in TTS supports English primarily

## Tips for Best Results
1. **Use high-quality input video** (720p+ recommended)
2. **Ensure clear facial visibility** throughout the video
3. **Choose appropriate voice** for character consistency
4. **Test different voices** to find best match for content
5. **Use external audio** for highest quality when available
6. **Keep text concise** for TTS to avoid timing issues
7. **Stable video footage** works better than shaky content
8. **Front-facing subjects** produce better results than profiles

## Comparison with Other Lipsync Models
- **vs FAL Sync Lipsync**: Pixverse has built-in TTS but may be less precise
- **vs Traditional methods**: Much faster and more automated
- **Best for**: Content creators needing quick TTS + lipsync workflow
- **Consider alternatives for**: High-precision professional productions

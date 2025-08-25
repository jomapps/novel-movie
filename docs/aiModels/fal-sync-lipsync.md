# FAL Sync Lipsync - fal-ai/sync-lipsync

## Overview
Sync.so Lipsync 1.9.0-beta is an advanced lipsync model that generates realistic lip synchronization animations from audio using state-of-the-art algorithms. The model provides high-quality synchronization between video and audio content with multiple sync modes to handle duration mismatches.

## Model Endpoint
- **Model ID**: `fal-ai/sync-lipsync`
- **Type**: Video to Video (Lipsync)
- **Use Case**: Synchronize lip movements in video with provided audio
- **Partner Model**: Yes (sync.so)
- **Key Features**: Advanced algorithms, multiple sync modes, high-quality synchronization

## Available Versions
1. **Lipsync 1.9.0-beta** (Default) - `fal-ai/sync-lipsync`
2. **Lipsync 2.0** - `fal-ai/sync-lipsync/v2`
3. **Legacy versions**: `lipsync-1.8.0`, `lipsync-1.7.1`

## Input Parameters

### Required Parameters
- **`video_url`** (string): URL of the input video to be lip-synced
- **`audio_url`** (string): URL of the input audio for synchronization

### Optional Parameters
- **`model`** (enum): Model version to use. Options: `"lipsync-1.9.0-beta"`, `"lipsync-1.8.0"`, `"lipsync-1.7.1"`. Default: `"lipsync-1.9.0-beta"`
- **`sync_mode`** (enum): Handling mode when audio and video durations don't match. Default: `"cut_off"`

### Sync Mode Options
- **`cut_off`**: Trim longer content to match shorter duration
- **`loop`**: Loop shorter content to match longer duration
- **`bounce`**: Bounce/reverse shorter content to fill duration
- **`silence`**: Add silence to shorter audio or freeze video frames
- **`remap`**: Intelligently remap timing to fit durations

## Request Format

### Basic Request
```json
{
  "video_url": "https://example.com/input-video.mp4",
  "audio_url": "https://example.com/input-audio.wav"
}
```

### Advanced Request
```json
{
  "model": "lipsync-1.9.0-beta",
  "video_url": "https://example.com/input-video.mp4",
  "audio_url": "https://example.com/input-audio.wav",
  "sync_mode": "cut_off"
}
```

## Response Format

### Success Response
```json
{
  "video": {
    "url": "https://v3.fal.media/files/rabbit/6gJV-z7RJsF0AxkZHkdgJ_output.mp4",
    "content_type": "video/mp4",
    "file_name": "lipsync_output.mp4",
    "file_size": 2048576
  }
}
```

### Response Fields
- **`video`** (File): The generated lip-synced video with URL, content type, filename, and size

## Best Settings and Usage

### Recommended Configuration
```javascript
{
  "model": "lipsync-1.9.0-beta",        // Latest model for best quality
  "video_url": "https://your-video.mp4",
  "audio_url": "https://your-audio.wav",
  "sync_mode": "cut_off"                // Most reliable sync mode
}
```

### Sync Mode Selection Guide
- **Use `cut_off`** for: Most scenarios, when you want clean results
- **Use `loop`** for: Short audio with longer video (e.g., repeating phrases)
- **Use `bounce`** for: Creative effects with audio reversal
- **Use `silence`** for: Preserving full video length with audio padding
- **Use `remap`** for: Complex timing adjustments (experimental)

## Usage Examples

### Basic Lipsync
```javascript
import { fal } from "@fal-ai/client";

const result = await fal.subscribe("fal-ai/sync-lipsync", {
  input: {
    video_url: "https://example.com/talking-head.mp4",
    audio_url: "https://example.com/speech.wav"
  }
});

console.log("Lip-synced video:", result.data.video.url);
```

### Advanced Configuration
```javascript
const result = await fal.subscribe("fal-ai/sync-lipsync", {
  input: {
    model: "lipsync-1.9.0-beta",
    video_url: "https://example.com/character.mp4",
    audio_url: "https://example.com/dialogue.wav",
    sync_mode: "remap"
  },
  logs: true,
  onQueueUpdate: (update) => {
    if (update.status === "IN_PROGRESS") {
      console.log("Processing:", update.logs);
    }
  }
});
```

### Queue-based Processing
```javascript
// Submit request
const { request_id } = await fal.queue.submit("fal-ai/sync-lipsync", {
  input: {
    video_url: "https://example.com/video.mp4",
    audio_url: "https://example.com/audio.wav"
  }
});

// Check status
const status = await fal.queue.status("fal-ai/sync-lipsync", {
  requestId: request_id,
  logs: true
});

// Get result when complete
if (status.status === "COMPLETED") {
  const result = await fal.queue.result("fal-ai/sync-lipsync", {
    requestId: request_id
  });
}
```

## Integration with System

### Environment Configuration
```bash
FAL_KEY=your-fal-api-key
FAL_VIDEO_TO_VIDEO_LIPSYNC=fal-ai/sync-lipsync
```

### System Integration Pattern
```javascript
async function performLipsync(videoUrl, audioUrl, options = {}) {
  const config = {
    model: options.model || "lipsync-1.9.0-beta",
    video_url: videoUrl,
    audio_url: audioUrl,
    sync_mode: options.syncMode || "cut_off"
  };
  
  try {
    const result = await fal.subscribe("fal-ai/sync-lipsync", {
      input: config,
      timeout: 300000 // 5 minutes
    });
    
    return {
      success: true,
      videoUrl: result.data.video.url,
      fileSize: result.data.video.file_size
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
- **Short videos (< 30s)**: 30-60 seconds
- **Medium videos (30s-2min)**: 1-3 minutes
- **Long videos (2min+)**: 3-10 minutes

### Quality Factors
- **Input video quality**: Higher resolution = better results
- **Audio clarity**: Clear speech = more accurate sync
- **Face visibility**: Front-facing, well-lit faces work best
- **Video stability**: Stable footage produces better results

## Pricing
- **Billing Unit**: Per minute of video
- **Price**: $0.70 per minute of video
- **Example**: 2-minute video = $1.40

## File Format Support

### Supported Video Formats
- MP4 (recommended)
- MOV
- AVI
- WebM

### Supported Audio Formats
- WAV (recommended)
- MP3
- AAC
- FLAC

## Error Handling
```javascript
try {
  const result = await fal.subscribe("fal-ai/sync-lipsync", {
    input: config,
    timeout: 300000
  });
} catch (error) {
  if (error.status === 422) {
    console.error("Validation error:", error.body.detail);
  } else if (error.status === 500) {
    console.error("Server error - try again later");
  } else {
    console.error("Lipsync failed:", error.message);
  }
}
```

## Limitations
- Maximum video length: ~10 minutes
- Requires clear facial features in video
- Works best with single speaker scenarios
- Audio should match video language/accent for best results
- Processing time scales with video length

## Tips for Best Results
1. **Use high-quality input video** (720p+ recommended)
2. **Ensure clear audio** with minimal background noise
3. **Front-facing subjects** work better than profile shots
4. **Stable video** without excessive camera movement
5. **Match audio duration** closely to video for best sync
6. **Test different sync modes** for optimal results
7. **Use latest model version** for best quality

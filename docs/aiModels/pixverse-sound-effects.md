# FAL Pixverse Sound Effects - fal-ai/pixverse/sound-effects

## Overview
Add immersive sound effects and background music to your videos using PixVerse sound effects generation. This model takes an existing video and enhances it with AI-generated audio effects.

## Model Endpoint
- **Model ID**: `fal-ai/pixverse/sound-effects`
- **Type**: Video to Video
- **Use Case**: Adding sound effects and background music to existing videos
- **Partner**: PixVerse integration

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

const result = await fal.subscribe("fal-ai/pixverse/sound-effects", {
  input: {
    video_url: "https://v3.fal.media/files/tiger/QfpJmEBkR75KpB6yfNLDM_video.mp4",
    prompt: "sea waves",
    original_sound_switch: true
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
- **`video_url`** (string): URL of the input video to add sound effects to

### Optional Parameters
- **`original_sound_switch`** (boolean): Whether to keep the original audio from the video
- **`prompt`** (string): Description of the sound effect to generate. If empty, a random sound effect will be generated. Default: `""`

### Example Input
```json
{
  "video_url": "https://v3.fal.media/files/tiger/QfpJmEBkR75KpB6yfNLDM_video.mp4",
  "prompt": "sea waves",
  "original_sound_switch": true
}
```

### Sound Effect Prompt Examples
- `"sea waves"` - Ocean and water sounds
- `"forest ambience"` - Nature and wildlife sounds
- `"city traffic"` - Urban environment sounds
- `"thunderstorm"` - Weather effects
- `"footsteps on gravel"` - Specific action sounds
- `"background music upbeat"` - Musical accompaniment
- `""` (empty) - Random sound effect generation

## Output Schema

### Response Structure
- **`video`** (File object): The video with added sound effects

### File Object Structure
- **`url`** (string): The URL where the file can be downloaded from
- **`content_type`** (string): The mime type of the file (typically "video/mp4")
- **`file_name`** (string): The name of the file
- **`file_size`** (integer): The size of the file in bytes

### Example Output
```json
{
  "video": {
    "file_size": 1534052,
    "file_name": "output.mp4",
    "content_type": "video/mp4",
    "url": "https://v3.fal.media/files/kangaroo/bBQr_DUeICo6_Ty_b_Y0I_output.mp4"
  }
}
```

## Queue Operations

### Submit Request
```javascript
const { request_id } = await fal.queue.submit("fal-ai/pixverse/sound-effects", {
  input: {
    video_url: "https://example.com/video.mp4",
    prompt: "ambient forest sounds"
  },
  webhookUrl: "https://optional.webhook.url/for/results",
});
```

### Check Status
```javascript
const status = await fal.queue.status("fal-ai/pixverse/sound-effects", {
  requestId: "764cabcf-b745-4b3e-ae38-1200304cf45b",
  logs: true,
});
```

### Get Result
```javascript
const result = await fal.queue.result("fal-ai/pixverse/sound-effects", {
  requestId: "764cabcf-b745-4b3e-ae38-1200304cf45b"
});
```

## File Handling

### Supported Input Methods
1. **Data URI (base64)**: Pass Base64 data URI directly
2. **Hosted files (URL)**: Use publicly accessible URLs
3. **File upload**: Upload files using fal.storage.upload()

### File Upload Example
```javascript
const videoFile = new File([videoData], "input.mp4", { type: "video/mp4" });
const videoUrl = await fal.storage.upload(videoFile);

const result = await fal.subscribe("fal-ai/pixverse/sound-effects", {
  input: {
    video_url: videoUrl,
    prompt: "dramatic music"
  }
});
```

## Audio Mixing Options

### Original Sound Control
- **`original_sound_switch: true`**: Keeps original video audio and mixes with generated sound effects
- **`original_sound_switch: false`**: Replaces original audio entirely with generated sound effects
- **Not specified**: Default behavior (typically preserves original audio)

## Use Cases

### Content Enhancement
- **Social Media Videos**: Add engaging background music or ambient sounds
- **Educational Content**: Enhance with relevant environmental sounds
- **Marketing Videos**: Add professional audio layers
- **Gaming Content**: Create immersive soundscapes

### Creative Applications
- **Film Post-Production**: Quick sound effect generation
- **Podcast Enhancement**: Add atmospheric backgrounds
- **Animation**: Sync sound effects with visual content
- **Music Videos**: Layer additional audio elements

## Best Practices

### Prompt Writing
- **Be Specific**: "gentle rain on leaves" vs "rain"
- **Consider Context**: Match sound effects to video content
- **Audio Layering**: Decide whether to keep or replace original audio
- **Duration Matching**: Sound effects will match video length

### Technical Considerations
- **Video Quality**: Higher quality input videos produce better results
- **File Size**: Larger videos take longer to process
- **Format Support**: MP4 format recommended for best compatibility
- **Processing Time**: Complex sound generation may require longer processing

### Error Handling
```javascript
try {
  const result = await fal.subscribe("fal-ai/pixverse/sound-effects", {
    input: { video_url: videoUrl, prompt: "ocean waves" }
  });
} catch (error) {
  console.error("Sound effects generation failed:", error);
}
```

## Related Pixverse Models
The documentation shows this is part of a larger Pixverse suite including:
- Text-to-Video generation
- Image-to-Video conversion
- Video extension
- Video transitions
- Lip-sync capabilities

## Billing and Performance
- Processing time varies based on video length and complexity
- Sound effect generation is typically faster than video generation
- Commercial use supported
- Partner integration with PixVerse platform

## Integration Tips
- Use webhooks for long-running video processing
- Implement proper queue management for batch processing
- Consider caching frequently used sound effects
- Test with different prompt styles to find optimal results

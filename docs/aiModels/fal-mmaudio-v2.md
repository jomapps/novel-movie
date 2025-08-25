# FAL MMAudio V2 - fal-ai/mmaudio-v2

## Overview
MMAudio V2 generates synchronized audio given video and/or text inputs. It can be combined with video models to create videos with background music and sound effects.

## Model Endpoint
- **Model ID**: `fal-ai/mmaudio-v2`
- **Type**: Video to Video with Audio Enhancement
- **Use Case**: Add background music and sound effects to existing videos
- **Partner Model**: Yes (MMAudio Team)
- **Environment Variable**: `FAL_VIDEO_TO_VIDEO_MUSIC=fal-ai/mmaudio-v2`

## Key Features
- **Video-to-Video**: Enhance existing videos with audio
- **Text-Guided**: Use prompts to control music style and mood
- **Synchronized Output**: Audio perfectly synced with video content
- **High Quality**: Professional-grade audio generation
- **Flexible Duration**: Support for 1-30 second videos
- **Cost Effective**: $0.001 per second of video

## Integration Notes

### Critical Requirements
- **Video Input**: Must have audio tracks (use lipsync videos, not original videos)
- **Duration Setting**: Set to exact video length for perfect synchronization
- **Environment Setup**: Configure `FAL_VIDEO_TO_VIDEO_MUSIC=fal-ai/mmaudio-v2`
- **Last Frame Integration**: Use with Last Frame Service for duration detection

### Best Practices
- Always detect video duration before generation using Last Frame Service
- Use lipsync videos as input (they have audio tracks)
- Set duration parameter to exact video length to prevent abrupt endings
- Avoid using default duration (8s) which causes truncation

## API Parameters

### Required Parameters
- `video_url` (string): URL of the video to enhance with audio
- `prompt` (string): Text description of desired music/audio

### Optional Parameters
- `num_steps` (integer): Number of generation steps (4-50, default: 25)
- `duration` (float): Duration of audio to generate (1-30s, default: 8)
- `cfg_strength` (float): Classifier Free Guidance strength (0-20, default: 4.5)
- `seed` (integer): Random seed for reproducibility (0-65535)
- `negative_prompt` (string): What to avoid in generation (default: "")
- `mask_away_clip` (boolean): Whether to mask original audio (default: false)

## Request Example

```javascript
import { fal } from "@fal-ai/client";

const result = await fal.subscribe("fal-ai/mmaudio-v2", {
  input: {
    video_url: "https://example.com/video.mp4",
    prompt: "Cinematic orchestral music, dramatic and emotional",
    duration: 30  // Set to max (30s) - model auto-adjusts down to video length
  },
  logs: true,
  onQueueUpdate: (update) => {
    if (update.status === "IN_PROGRESS") {
      console.log("Generating music...");
    }
  }
});
```

## Response Format

```typescript
interface MMAudioResponse {
  video: {
    url: string;           // URL of enhanced video with music
    file_size: number;     // File size in bytes
    file_name: string;     // Generated filename
    content_type: string;  // MIME type (typically video/mp4)
  }
}
```

## Professional Usage Guidelines

### Music Prompt Best Practices
- **Be Specific**: "Orchestral strings with gentle piano" vs "nice music"
- **Include Mood**: "Melancholic", "Uplifting", "Tense", "Peaceful"
- **Specify Genre**: "Jazz", "Classical", "Electronic", "Ambient"
- **Add Context**: "Background music for dialogue scene"

### Parameter Optimization
- **num_steps**: Higher values (35-50) for better quality, lower (15-25) for speed
- **cfg_strength**: 3-6 for subtle enhancement, 7-12 for prominent music
- **duration**: Match or slightly exceed video duration
- **mask_away_clip**: Use `true` to replace original audio, `false` to layer

### Quality Guidelines
- **Dialogue Scenes**: Use subtle, low cfg_strength (3-5)
- **Action Scenes**: Higher cfg_strength (6-10) for dynamic music
- **Emotional Moments**: Longer duration with orchestral prompts
- **Transitions**: Brief, ambient music for scene changes

## Integration Patterns

### Movie Production Workflow
```javascript
// Step 1: Generate base video
const videoResult = await generateVideo(imageUrl, prompt);

// Step 2: Add background music
const musicResult = await fal.subscribe("fal-ai/mmaudio-v2", {
  input: {
    video_url: videoResult.video.url,
    prompt: generateMusicPrompt(sceneContext),
    duration: 30  // Max duration - model auto-adjusts to video length
  }
});

// Step 3: Upload enhanced video
const finalUrl = await uploadToStorage(musicResult.data.video.url);
```

### Prompt Generation Strategy
```javascript
function generateMusicPrompt(scene) {
  const basePrompts = {
    dramatic: "Cinematic orchestral music, building tension",
    romantic: "Soft piano and strings, romantic and warm",
    action: "Dynamic electronic music, energetic and driving",
    peaceful: "Ambient nature sounds with gentle melody"
  };
  
  return `${basePrompts[scene.mood]}, ${scene.setting} atmosphere, professional film score`;
}
```

## Error Handling

### Common Issues
- **Invalid video URL**: Ensure video is publicly accessible
- **Duration mismatch**: Video duration should match or be close to specified duration
- **Prompt too vague**: Specific prompts yield better results
- **File size limits**: Very large videos may timeout

### Retry Strategy
```javascript
async function generateMusicWithRetry(config, maxRetries = 3) {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fal.subscribe("fal-ai/mmaudio-v2", { input: config });
    } catch (error) {
      if (i === maxRetries - 1) throw error;
      await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1)));
    }
  }
}
```

## Cost Optimization

### Pricing Structure
- **Base Cost**: $0.001 per second of video
- **Typical 8s microScene**: $0.008
- **30s scene**: $0.030
- **Processing Time**: 30-90 seconds average

### Budget Management
- Use shorter durations for testing
- Batch process multiple scenes
- Cache successful generations
- Monitor usage with cost tracking

## Performance Considerations

### Processing Time
- **Short videos (1-8s)**: 30-60 seconds
- **Medium videos (8-15s)**: 60-120 seconds  
- **Long videos (15-30s)**: 120-180 seconds

### Optimization Tips
- Pre-validate video URLs before submission
- Use appropriate num_steps for quality/speed balance
- Implement proper queuing for batch operations
- Cache results to avoid regeneration

## Integration with Movie Production System

### Database Schema
```typescript
interface SceneMusicGeneration {
  originalVideoUrl: string;
  musicVideoUrl: string;
  prompt: string;
  falConfig: MMAudioRequest;
  generatedAt: Date;
  costTracking: {
    generation: number;
    storage: number;
    total: number;
  }
}
```

### Service Integration
- Integrate with existing FAL service architecture
- Use Cloudflare R2 for storage
- Implement proper error handling and logging
- Add to audit trail system

# Veo3 Image to Video - fal-ai/veo3/image-to-video

## Overview
Veo 3 is the latest state-of-the-art video generation model from Google DeepMind. It generates videos by animating an input image with both video and audio generation capabilities, eliminating the need for separate lipsync processing.

## Model Endpoint
- **Model ID**: `fal-ai/veo3/image-to-video`
- **Type**: Image to Video with Audio
- **Use Case**: Animate static images into dynamic videos with synchronized audio
- **Partner Model**: Yes (Google DeepMind)
- **Key Feature**: Built-in audio generation eliminates lipsync requirements

## Key Features
- **Image Animation**: Transform static images into dynamic videos
- **Audio Generation**: Built-in audio synthesis synchronized with video
- **High Quality**: 720p output resolution in 16:9 aspect ratio
- **Natural Motion**: Realistic animations and movements
- **Text-Controlled**: Detailed prompt control over animation style
- **Safety Filters**: Applied to both input images and generated content

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

const result = await fal.subscribe("fal-ai/veo3/image-to-video", {
  input: {
    prompt: "A woman looks into the camera, breathes in, then exclaims energetically, \"have you guys checked out Veo3 Image-to-Video on Fal? It's incredible!\"",
    image_url: "https://storage.googleapis.com/falserverless/example_inputs/veo3-i2v-input.png",
    duration: "8s",
    generate_audio: true
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
- **`prompt`** (string): Text prompt describing how the image should be animated
- **`image_url`** (string): URL of the input image to animate (720p+ resolution, 16:9 aspect ratio preferred)

### Optional Parameters
- **`duration`** (DurationEnum): Duration of generated video. Default: `"8s"`. Possible values: `"8s"`
- **`generate_audio`** (boolean): Whether to generate audio for the video. Default: `true`. If false, 33% fewer credits used.

### Example Input
```json
{
  "prompt": "A woman looks into the camera, breathes in, then exclaims energetically, \"have you guys checked out Veo3 Image-to-Video on Fal? It's incredible!\"",
  "image_url": "https://storage.googleapis.com/falserverless/example_inputs/veo3-i2v-input.png",
  "duration": "8s",
  "generate_audio": true
}
```

## Output Schema

### Response Structure
- **`video`** (File object): The generated video with embedded audio

### File Object Structure
- **`url`** (string): The URL where the video file can be downloaded from
- **`content_type`** (string): The mime type of the file
- **`file_name`** (string): The name of the file
- **`file_size`** (integer): The size of the file in bytes

### Example Output
```json
{
  "video": {
    "url": "https://storage.googleapis.com/falserverless/example_outputs/veo3-i2v-output.mp4",
    "content_type": "video/mp4",
    "file_name": "output.mp4",
    "file_size": 15728640
  }
}
```

## Prompt Engineering Guide

### Essential Prompt Elements
Based on Veo 2 prompting best practices (adapted for Veo 3):

1. **Subject**: The main focus of your video
2. **Context**: The setting or environment  
3. **Action**: What's happening in the scene
4. **Style**: The visual aesthetic you're aiming for
5. **Camera Motion**: How the camera moves (optional)
6. **Composition**: How the shot is framed (optional)
7. **Ambiance**: The mood and lighting (optional)

### Effective Prompt Patterns

#### Character Animation
```javascript
// Basic character movement
"A person in [setting] [action], [emotion] expression, [movement details], [lighting], [style]"

// Example
"A woman in a modern office looks into the camera, breathes in, then exclaims energetically with a bright smile, natural head movements, professional lighting, cinematic quality"
```

#### Scene Animation
```javascript
// Environmental animation
"[Camera movement] through [environment], [atmospheric details], [lighting conditions], [mood]"

// Example  
"A cinematic tracking shot through a magical ice cave, massive crystalline icicles hanging from the ceiling, glowing with ethereal blue light, misty air with floating particles"
```

#### Character Dialogue
```javascript
// Speaking character animation
"[Character description] [speaks/says] \"[dialogue]\", [facial expressions], [gestures], [setting], [mood]"

// Example
"A confident business woman speaks directly to camera saying \"Welcome to our presentation\", professional gestures, modern conference room, authoritative yet warm"
```

### Pro Tips for Better Results

#### 1. Be Specific About Movement
- ✅ "subtle head movements while speaking, natural facial expressions, realistic eye movements"
- ❌ "person talking"

#### 2. Include Atmospheric Details
- ✅ "warm sunlight filtering through windows, gentle shadows, professional lighting"
- ❌ "good lighting"

#### 3. Specify Camera Behavior
- ✅ "camera slowly dollies in, maintaining focus on the subject"
- ❌ "camera moves"

#### 4. Add Emotional Context
- ✅ "confident and engaging expression, slight smile, direct eye contact"
- ❌ "happy person"

## Image Requirements

### Technical Specifications
- **Resolution**: 720p or higher recommended
- **Aspect Ratio**: 16:9 preferred (will be cropped if different)
- **File Size**: Up to 8MB supported
- **Format**: Standard image formats (JPEG, PNG, etc.)

### Quality Guidelines
- **Face Visibility**: Ensure faces are clearly visible and well-lit
- **Head Position**: Front-facing or slight angle works best
- **Image Quality**: High-resolution, well-lit images produce better results
- **Background**: Consider how background elements will animate

## Queue Operations

### Submit Request
```javascript
const { request_id } = await fal.queue.submit("fal-ai/veo3/image-to-video", {
  input: {
    prompt: "Animation prompt here",
    image_url: "https://example.com/image.jpg",
    generate_audio: true
  },
  webhookUrl: "https://optional.webhook.url/for/results",
});
```

### Check Status
```javascript
const status = await fal.queue.status("fal-ai/veo3/image-to-video", {
  requestId: "764cabcf-b745-4b3e-ae38-1200304cf45b",
  logs: true,
});
```

### Get Result
```javascript
const result = await fal.queue.result("fal-ai/veo3/image-to-video", {
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
const imageFile = new File([imageData], "character.jpg", { type: "image/jpeg" });
const imageUrl = await fal.storage.upload(imageFile);

const result = await fal.subscribe("fal-ai/veo3/image-to-video", {
  input: {
    prompt: "Character animation prompt",
    image_url: imageUrl,
    generate_audio: true
  }
});
```

## Use Cases

### Content Creation
- **Character Videos**: Animate character portraits for storytelling
- **Marketing**: Product spokesperson videos from static images
- **Social Media**: Dynamic content from photos
- **Education**: Animated instructors and presenters

### Professional Applications
- **Film Production**: Concept visualization and pre-production
- **Corporate Training**: Animated presenters for training materials
- **Customer Service**: Virtual assistants from company photos
- **Broadcasting**: News anchors and reporters

### Creative Projects
- **Digital Art**: Bring artwork to life with animation
- **Music Videos**: Animate album covers or promotional images
- **Interactive Media**: Dynamic portraits for games or apps
- **Art Installations**: Moving portraits and interactive displays

## Performance Considerations

### Processing Time
- **Duration**: Typically 2-5 minutes for 8-second videos
- **Queue System**: Use queue management for production applications
- **Batch Processing**: Consider batching multiple requests

### Cost Optimization
- **Audio Generation**: Set `generate_audio: false` to save 33% credits if audio not needed
- **Image Quality**: Higher resolution inputs may take longer but produce better results
- **Prompt Length**: Detailed prompts don't significantly impact processing time

## Integration Patterns

### Complete Video Production Workflow
```javascript
// New Veo3 workflow: Image → Video with Audio → Background Audio (optional)
async function createTalkingVideo(characterImage, dialoguePrompt) {
  // 1. Generate video with audio from image
  const videoResult = await fal.subscribe("fal-ai/veo3/image-to-video", {
    input: {
      prompt: dialoguePrompt,
      image_url: characterImage,
      generate_audio: true
    }
  });
  
  // 2. Optionally add background audio/effects
  const finalVideo = await addBackgroundAudio(videoResult.data.video.url);
  
  return finalVideo;
}
```

### Error Handling
```javascript
// Robust error handling with retries
const MAX_RETRIES = 3;

async function reliableVeo3Generation(imageUrl, prompt, retries = 0) {
  try {
    return await fal.subscribe("fal-ai/veo3/image-to-video", {
      input: { 
        image_url: imageUrl, 
        prompt: prompt,
        generate_audio: true
      }
    });
  } catch (error) {
    if (retries < MAX_RETRIES) {
      console.log(`Retry ${retries + 1}/${MAX_RETRIES}`);
      return reliableVeo3Generation(imageUrl, prompt, retries + 1);
    }
    throw error;
  }
}
```

## Advantages Over Multi-Step Approaches

### Simplified Workflow
- **Old**: Image → Video → Lipsync (3 steps, 2 models)
- **New**: Image → Video with Audio (1 step, 1 model)

### Better Synchronization
- **Built-in Audio**: Perfect sync between video and audio
- **No Lipsync Artifacts**: Eliminates lipsync model limitations
- **Consistent Quality**: Single model ensures coherent output

### Cost and Time Efficiency
- **Fewer API Calls**: Single request vs multiple steps
- **Faster Processing**: No intermediate steps or file transfers
- **Lower Costs**: Single model usage vs multiple model pipeline

## Commercial Use and Billing
- **Commercial License**: Supported for business applications
- **Credit System**: Standard fal.ai credit pricing
- **Audio Discount**: 33% credit reduction when `generate_audio: false`
- **Scalable**: Suitable for high-volume applications

## Status
✅ **AVAILABLE** - Veo3 image-to-video generation with built-in audio synthesis ready for production use

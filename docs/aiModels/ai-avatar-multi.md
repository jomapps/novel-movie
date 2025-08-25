# FAL AI Avatar Multi (Multi Audio) - fal-ai/ai-avatar/multi

## Overview
MultiTalk model generates a multi-person conversation video from an image and audio files. Creates a realistic scene where multiple people speak in sequence.

## Model Endpoint
- **Model ID**: `fal-ai/ai-avatar/multi`
- **Type**: Image to Video
- **Use Case**: Multi-person conversation with synchronized audio

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

const result = await fal.subscribe("fal-ai/ai-avatar/multi", {
  input: {
    image_url: "https://example.com/image.png",
    first_audio_url: "https://example.com/person1.mp3",
    second_audio_url: "https://example.com/person2.mp3",
    prompt: "A smiling man and woman wearing headphones sit in front of microphones, appearing to host a podcast."
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
- **`image_url`** (string): URL of the input image. If the input image does not match the chosen aspect ratio, it is resized and center cropped.
- **`first_audio_url`** (string): The URL of the Person 1 audio file.
- **`second_audio_url`** (string): The URL of the Person 2 audio file.
- **`prompt`** (string): The text prompt to guide video generation.

### Optional Parameters
- **`num_frames`** (integer): Number of frames to generate. Must be between 81 to 129 (inclusive). If the number of frames is greater than 81, the video will be generated with 1.25x more billing units. Default: `181`
- **`resolution`** (enum): Resolution of the video to generate. Must be either `"480p"` or `"720p"`. Default: `"480p"`
- **`seed`** (integer): Random seed for reproducibility. If None, a random seed is chosen. Default: `81`
- **`use_only_first_audio`** (boolean): Whether to use only the first audio file.
- **`acceleration`** (enum): The acceleration level to use for generation. Options: `"none"`, `"regular"`, `"high"`. Default: `"regular"`

### Example Input
```json
{
  "image_url": "https://v3.fal.media/files/elephant/Q2ZU6q-d-1boGXhpDgWs9_15a22f816fd34cad969b2329946267b3.png",
  "first_audio_url": "https://v3.fal.media/files/monkey/1XKPx3Xu-IhNLbuinVSwP_output.mp3",
  "second_audio_url": "https://v3.fal.media/files/zebra/oVKyL8JZ1K2GreeIMxVzm_output.mp3",
  "prompt": "A smiling man and woman wearing headphones sit in front of microphones, appearing to host a podcast. They are engaged in conversation, looking at each other and the camera as they speak. The scene captures a lively and collaborative podcasting session.",
  "num_frames": 181,
  "resolution": "480p",
  "seed": 81,
  "acceleration": "regular"
}
```

## Output Schema

### Response Structure
- **`video`** (File object): The generated video file
- **`seed`** (integer): The seed used for generation

### File Object Structure
- **`url`** (string): The URL where the file can be downloaded from
- **`content_type`** (string): The mime type of the file
- **`file_name`** (string): The name of the file
- **`file_size`** (integer): The size of the file in bytes

### Example Output
```json
{
  "video": {
    "file_size": 704757,
    "file_name": "ab27ac57e9464dbea1ef78f7a25469d2.mp4",
    "content_type": "application/octet-stream",
    "url": "https://v3.fal.media/files/kangaroo/uAF7N-Ow8WwuvbFw8J4Br_ab27ac57e9464dbea1ef78f7a25469d2.mp4"
  },
  "seed": 81
}
```

## Queue Operations

### Submit Request
```javascript
const { request_id } = await fal.queue.submit("fal-ai/ai-avatar/multi", {
  input: { /* input parameters */ },
  webhookUrl: "https://optional.webhook.url/for/results",
});
```

### Check Status
```javascript
const status = await fal.queue.status("fal-ai/ai-avatar/multi", {
  requestId: "764cabcf-b745-4b3e-ae38-1200304cf45b",
  logs: true,
});
```

### Get Result
```javascript
const result = await fal.queue.result("fal-ai/ai-avatar/multi", {
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
const file = new File(["Hello, World!"], "hello.txt", { type: "text/plain" });
const url = await fal.storage.upload(file);
```

## Additional Request Types

### Multi-Text Avatar (AvatarMultiTextRequest)
- **`first_text_input`** (string): The text input for person 1
- **`second_text_input`** (string): The text input for person 2
- **`voice1`** (enum): First person's voice. Default: "Sarah". Options: Aria, Roger, Sarah, Laura, Charlie, George, Callum, River, Liam, Charlotte, Alice, Matilda, Will, Jessica, Eric, Chris, Brian, Daniel, Lily, Bill
- **`voice2`** (enum): Second person's voice. Default: "Roger". Same options as voice1
- **`num_frames`** default: 191

### Single Audio Avatar (AvatarSingleAudioRequest)
- **`audio_url`** (string): The URL of the audio file
- **`num_frames`** default: 145

## Key Differences from Single Avatar Model
1. **Multiple Audio Sources**: Supports two separate audio files for different speakers
2. **Higher Frame Count**: Default 181 frames vs 145 for single avatar
3. **Conversation Flow**: Designed for back-and-forth dialogue
4. **Audio Control**: `use_only_first_audio` option for single-speaker scenarios
5. **Different Seed Default**: Uses 81 instead of 42

## Billing Notes
- Videos with more than 81 frames are generated with 1.25x more billing units
- Multi-person videos typically require more processing resources
- Resolution affects processing time and cost
- Acceleration levels impact generation speed and resource usage

## Best Practices
- Ensure audio files are properly synchronized for natural conversation flow
- Use descriptive prompts that specify the interaction between multiple people
- Consider the timing and length of each audio segment
- Test with `use_only_first_audio` for single-speaker scenarios
- Implement proper error handling for queue operations
- Use webhooks for long-running requests

# FAL AI Avatar (Single Audio) - fal-ai/ai-avatar

## Overview
MultiTalk model generates a talking avatar video from an image and audio file. The avatar lip-syncs to the provided audio with natural facial expressions.

## Model Endpoint
- **Model ID**: `fal-ai/ai-avatar`
- **Type**: Image to Video
- **Use Case**: Single person talking avatar with audio synchronization

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

const result = await fal.subscribe("fal-ai/ai-avatar", {
  input: {
    image_url: "https://example.com/image.png",
    audio_url: "https://example.com/audio.mp3",
    prompt: "A woman with colorful hair talking on a podcast."
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
- **`audio_url`** (string): The URL of the audio file.
- **`prompt`** (string): The text prompt to guide video generation.

### Optional Parameters
- **`num_frames`** (integer): Number of frames to generate. Must be between 81 to 129 (inclusive). If the number of frames is greater than 81, the video will be generated with 1.25x more billing units. Default: `145`
- **`resolution`** (enum): Resolution of the video to generate. Must be either `"480p"` or `"720p"`. Default: `"480p"`
- **`seed`** (integer): Random seed for reproducibility. If None, a random seed is chosen. Default: `42`
- **`acceleration`** (enum): The acceleration level to use for generation. Options: `"none"`, `"regular"`, `"high"`. Default: `"regular"`

### Example Input
```json
{
  "image_url": "https://v3.fal.media/files/koala/gmpc0QevDF9bBsL1EAYVF_1c637094161147559f0910a68275dc34.png",
  "audio_url": "https://v3.fal.media/files/penguin/PtiCYda53E9Dav25QmQYI_output.mp3",
  "prompt": "A woman with colorful hair talking on a podcast.",
  "num_frames": 145,
  "resolution": "480p",
  "seed": 42,
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
    "file_size": 515275,
    "file_name": "74af6c0bdd6041c3b1130d54885e3eee.mp4",
    "content_type": "application/octet-stream",
    "url": "https://v3.fal.media/files/kangaroo/z6VqUwNTwzuWa6YE1g7In_74af6c0bdd6041c3b1130d54885e3eee.mp4"
  },
  "seed": 42
}
```

## Queue Operations

### Submit Request
```javascript
const { request_id } = await fal.queue.submit("fal-ai/ai-avatar", {
  input: { /* input parameters */ },
  webhookUrl: "https://optional.webhook.url/for/results",
});
```

### Check Status
```javascript
const status = await fal.queue.status("fal-ai/ai-avatar", {
  requestId: "764cabcf-b745-4b3e-ae38-1200304cf45b",
  logs: true,
});
```

### Get Result
```javascript
const result = await fal.queue.result("fal-ai/ai-avatar", {
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

### Text-to-Speech Avatar (AvatarSingleTextRequest)
- **`text_input`** (string): The text input to guide video generation
- **`voice`** (enum): Voice options include Aria, Roger, Sarah, Laura, Charlie, George, Callum, River, Liam, Charlotte, Alice, Matilda, Will, Jessica, Eric, Chris, Brian, Daniel, Lily, Bill
- **`num_frames`** default: 136

## Billing Notes
- Videos with more than 81 frames are generated with 1.25x more billing units
- Resolution affects processing time and cost
- Acceleration levels impact generation speed and resource usage

## Best Practices
- Use environment variables for API keys in production
- Implement proper error handling for queue operations
- Consider using webhooks for long-running requests
- Optimize image and audio file sizes for better performance

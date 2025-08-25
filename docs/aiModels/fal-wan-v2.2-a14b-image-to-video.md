# FAL Wan v2.2 A14B Image-to-Video - fal-ai/wan/v2.2-a14b/image-to-video

## Overview
Wan v2.2 A14B Image-to-Video is an advanced video generation model that creates high-quality videos from static images with comprehensive cinema-grade aesthetic controls. The model features stable and fluid motion generation, superior instruction following with real-world realism, and significantly faster generation speeds.

## Model Endpoint
- **Model ID**: `fal-ai/wan/v2.2-a14b/image-to-video`
- **Type**: Image to Video
- **Use Case**: Animate static images into dynamic videos with precise motion control
- **Partner Model**: No (FAL native)
- **Key Features**: Cinema-grade controls, stable motion, fast generation

## Input Parameters

### Required Parameters
- **`image_url`** (string): URL of the input image. If the input image doesn't match the chosen aspect ratio, it is resized and center cropped.
- **`prompt`** (string): Text prompt to guide video generation and describe the desired motion/animation.

### Optional Parameters
- **`num_frames`** (integer): Number of frames to generate. Range: 81-121. Default: `81`
- **`frames_per_second`** (integer): FPS of generated video. Range: 4-60. Default: `16`
- **`negative_prompt`** (string): Negative prompt for video generation. Default: `""`
- **`seed`** (integer): Random seed for reproducibility. If None, random seed is chosen.
- **`resolution`** (enum): Video resolution. Options: `"480p"`, `"580p"`, `"720p"`. Default: `"720p"`
- **`aspect_ratio`** (enum): Video aspect ratio. Options: `"auto"`, `"16:9"`, `"9:16"`, `"1:1"`. Default: `"auto"`
- **`num_inference_steps`** (integer): Inference steps for sampling. Range: 2-40. Default: `27`
- **`enable_safety_checker`** (boolean): Enable safety checking. Default: `false`
- **`enable_prompt_expansion`** (boolean): Use LLM to expand prompt with additional details. Default: `false`
- **`acceleration`** (enum): Acceleration level. Options: `"none"`, `"regular"`. Default: `"none"`
- **`guidance_scale`** (float): Classifier-free guidance scale (1st stage). Range: 1-10. Default: `3.5`
- **`guidance_scale_2`** (float): Guidance scale (2nd stage). Range: 1-10. Default: `3.5`
- **`shift`** (float): Shift value for video. Range: 1.0-10.0. Default: `5`
- **`interpolator_model`** (enum): Frame interpolation model. Options: `"none"`, `"film"`, `"rife"`. Default: `"film"`
- **`num_interpolated_frames`** (integer): Frames to interpolate between pairs. Range: 0-4. Default: `1`
- **`adjust_fps_for_interpolation`** (boolean): Adjust FPS for interpolation. Default: `true`

## Response Format

### Success Response
```json
{
  "video": {
    "url": "https://v3.fal.media/files/lion/Fbuh3lO_HMT-pS0DATbio_tmp08c3v477.mp4",
    "content_type": "video/mp4",
    "file_name": "generated_video.mp4",
    "file_size": 2048576
  },
  "prompt": "The white dragon warrior stands still, eyes full of determination and strength...",
  "seed": 42
}
```

### Response Fields
- **`video`** (File): The generated video file with URL, content type, filename, and size
- **`prompt`** (string): The text prompt used for video generation
- **`seed`** (integer): The seed used for generation

## Best Settings for 5-Second Videos

### Optimal Configuration
```javascript
{
  "image_url": "https://your-image-url.jpg",
  "prompt": "Professional woman in office environment, subtle movements, facing camera",
  "num_frames": 81,           // Minimum frames for smooth motion
  "frames_per_second": 16,    // Standard FPS for 5s duration
  "resolution": "720p",       // High quality
  "aspect_ratio": "16:9",     // Standard video format
  "num_inference_steps": 27,  // Good quality/speed balance
  "acceleration": "none",     // Best quality
  "guidance_scale": 3.5,      // Balanced prompt adherence
  "interpolator_model": "film", // Smooth interpolation
  "num_interpolated_frames": 1, // Enhanced smoothness
  "adjust_fps_for_interpolation": true
}
```

## Usage Examples

### Basic Image-to-Video
```javascript
import { fal } from "@fal-ai/client";

const result = await fal.subscribe("fal-ai/wan/v2.2-a14b/image-to-video", {
  input: {
    image_url: "https://example.com/office-woman.jpg",
    prompt: "Professional woman in modern office, subtle head movements, maintaining eye contact with camera"
  }
});
```

### Advanced Configuration
```javascript
const result = await fal.subscribe("fal-ai/wan/v2.2-a14b/image-to-video", {
  input: {
    image_url: "https://example.com/office-woman.jpg",
    prompt: "Professional woman working at desk, typing on keyboard, occasional glances at camera",
    num_frames: 121,
    frames_per_second: 24,
    resolution: "720p",
    aspect_ratio: "16:9",
    guidance_scale: 4.0,
    num_inference_steps: 35
  }
});
```

## Integration with System

### Environment Configuration
```bash
FAL_KEY=your-fal-api-key
FAL_IMAGE_TO_VIDEO_MODEL_4=fal-ai/wan/v2.2-a14b/image-to-video
```

### System Integration Pattern
```javascript
async function generateVideoWithWan(imageUrl, prompt, options = {}) {
  const config = {
    image_url: imageUrl,
    prompt: prompt,
    num_frames: options.frames || 81,
    frames_per_second: options.fps || 16,
    resolution: options.resolution || "720p",
    aspect_ratio: options.aspectRatio || "16:9",
    ...options
  };
  
  return await fal.subscribe("fal-ai/wan/v2.2-a14b/image-to-video", {
    input: config
  });
}
```

## Performance Characteristics

### Generation Times
- **Standard Quality**: 30-60 seconds
- **High Quality**: 60-120 seconds
- **Turbo Mode**: 15-30 seconds (with `acceleration: "regular"`)

### Quality vs Speed Trade-offs
- **Best Quality**: `acceleration: "none"`, `num_inference_steps: 35-40`
- **Balanced**: `acceleration: "none"`, `num_inference_steps: 27`
- **Fast**: `acceleration: "regular"`, `num_inference_steps: 20`

## Pricing
- **Billing Unit**: Video seconds
- **Price**: $0.08 per video second
- **Example**: 5-second video = $0.40

## Error Handling
```javascript
try {
  const result = await fal.subscribe("fal-ai/wan/v2.2-a14b/image-to-video", {
    input: config,
    timeout: 180000 // 3 minutes
  });
} catch (error) {
  console.error("Video generation failed:", error);
}
```

## Limitations
- Frame range: 81-121 frames only
- FPS range: 4-60 FPS
- Maximum inference steps: 40
- Input image is resized/cropped to match aspect ratio
- No audio generation (video only)

## Tips for Best Results
1. Use high-quality input images (720p+)
2. Keep prompts specific but not overly complex
3. Use `"auto"` aspect ratio to preserve image proportions
4. Enable interpolation for smoother motion
5. Use negative prompts to avoid unwanted elements
6. Test different guidance scales for prompt adherence

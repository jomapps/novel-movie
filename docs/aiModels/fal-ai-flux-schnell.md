# FAL Flux Schnell Text-to-Image Model Documentation

## Model Information
- **Model ID**: `fal-ai/flux/schnell`
- **Purpose**: Character portrait generation for movie production
- **Use Case**: Square portrait photos for character reference
- **API Documentation**: https://fal.ai/models/fal-ai/flux/schnell/api

## Model Description
FLUX.1 [schnell] is a 12 billion parameter flow transformer that generates high-quality images from text in 1 to 4 steps. It's optimized for speed while maintaining excellent image quality, making it suitable for both personal and commercial use.

## Optimal Settings for Character Portraits

### Recommended Configuration
```javascript
{
  "prompt": "[Character description with detailed physical features, clothing, expression, and setting]",
  "image_size": "square_hd",
  "num_inference_steps": 4,
  "guidance_scale": 3.5,
  "num_images": 1,
  "enable_safety_checker": true,
  "output_format": "jpeg",
  "acceleration": "none"
}
```

### Image Size Options
- **Primary**: `square_hd` - High definition square format (1024x1024)
- **Alternative**: `square` - Standard square format (512x512)
- **Portrait Options**: `portrait_4_3`, `portrait_16_9`
- **Custom**: For specific dimensions, use object format:
  ```javascript
  "image_size": {
    "width": 1024,
    "height": 1024
  }
  ```

### Key Parameters for Character Portraits

#### Inference Steps
- **Recommended**: `4` (default) - Optimal balance of speed and quality
- **Range**: 1-4 steps
- **Note**: Higher steps may improve detail but increase generation time

#### Guidance Scale
- **Recommended**: `3.5` (default) - Good adherence to prompt
- **Range**: 1.0-20.0
- **Lower values**: More creative interpretation
- **Higher values**: Stricter prompt following

#### Output Format
- **Recommended**: `"jpeg"` - Smaller file size, good for portraits
- **Alternative**: `"png"` - Higher quality, larger file size

## API Integration

### Request Format
```javascript
import { fal } from "@fal-ai/client";

const result = await fal.subscribe("fal-ai/flux/schnell", {
  input: {
    prompt: "Professional headshot of a 35-year-old detective with weathered features, wearing a dark coat, serious expression, cinematic lighting",
    image_size: "square_hd",
    num_inference_steps: 4,
    guidance_scale: 3.5,
    num_images: 1,
    enable_safety_checker: true,
    output_format: "jpeg",
    seed: 42 // Optional: for reproducible results
  },
  logs: true,
  onQueueUpdate: (update) => {
    if (update.status === "IN_PROGRESS") {
      update.logs.map((log) => log.message).forEach(console.log);
    }
  },
});
```

### Response Format
```javascript
{
  "images": [
    {
      "url": "https://fal.media/files/[unique-id].jpeg",
      "width": 1024,
      "height": 1024,
      "content_type": "image/jpeg"
    }
  ],
  "timings": {
    "inference": 2.5
  },
  "seed": 42,
  "has_nsfw_concepts": [false],
  "prompt": "Professional headshot of a 35-year-old detective..."
}
```

## Authentication
Set the FAL API key as an environment variable:
```bash
export FAL_KEY="YOUR_API_KEY"
```

Or configure programmatically:
```javascript
import { fal } from "@fal-ai/client";

fal.config({
  credentials: "YOUR_FAL_KEY"
});
```

## Advanced Features

### Seed Control
Use seeds for reproducible results:
```javascript
"seed": 12345  // Same seed + prompt = same image
```

### Batch Generation
Generate multiple variations:
```javascript
"num_images": 4  // Generate 4 different portraits
```

### Acceleration Options
- **`"none"`**: Standard generation (recommended for quality)
- **`"regular"`**: Faster generation with slight quality trade-off
- **`"high"`**: Fastest generation for rapid prototyping

### Sync Mode
For immediate results without CDN delay:
```javascript
"sync_mode": true  // Increases latency but returns image directly
```

## Best Practices for Character Portraits

### Prompt Engineering
1. **Physical Description**: Age, gender, ethnicity, build
2. **Facial Features**: Eye color, hair style/color, distinctive features
3. **Expression**: Mood, emotion, personality traits
4. **Clothing**: Period-appropriate attire, accessories
5. **Lighting**: Professional, cinematic, natural lighting
6. **Style**: Photorealistic, portrait photography, headshot

### Example Prompts
```
"Professional headshot of a 28-year-old female protagonist, auburn hair in a ponytail, green eyes, confident smile, wearing a leather jacket, studio portrait lighting, photorealistic"

"Character portrait of a 45-year-old male antagonist, salt-and-pepper beard, piercing blue eyes, stern expression, wearing a dark suit, dramatic cinematic lighting, high detail"

"Close-up portrait of a 22-year-old supporting character, curly black hair, warm brown eyes, gentle smile, wearing casual clothes, natural lighting, professional photography style"
```

## Queue Management
For production workflows with better control:
```javascript
// Submit request
const { request_id } = await fal.queue.submit("fal-ai/flux/schnell", {
  input: { /* your parameters */ },
  webhookUrl: "https://your-webhook-endpoint.com/results"
});

// Check status
const status = await fal.queue.status("fal-ai/flux/schnell", {
  requestId: request_id,
  logs: true
});

// Get result when complete
const result = await fal.queue.result("fal-ai/flux/schnell", {
  requestId: request_id
});
```

## Performance Characteristics
- **Generation Time**: 1-4 seconds (depending on settings)
- **Image Quality**: High-quality, photorealistic results
- **Consistency**: Excellent prompt adherence with guidance_scale 3.5
- **Speed**: Optimized for fast generation (schnell = fast in German)

## File Handling
- **Output Format**: JPEG or PNG
- **Resolution**: Up to 1024x1024 for square_hd
- **File Size**: 200KB-2MB depending on format and complexity
- **Storage**: Hosted on FAL's CDN with public URLs

## Cost Considerations
- Fast generation model with competitive pricing
- Batch generation (num_images > 1) multiplies cost
- Higher inference steps may increase cost slightly

## Safety and Content Policy
- Safety checker enabled by default
- NSFW detection included in response
- Content must comply with FAL's usage policies
- Avoid generating images of real people without consent

## Integration Notes
- Use environment variables for API keys in production
- Implement proper error handling for API failures
- Consider implementing retry logic for network issues
- Store generated images in your own asset management system
- Use seeds for reproducible character designs across scenes

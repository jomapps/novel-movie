# FAL Recraft V3 Text-to-Image Model Documentation

## Model Information
- **Model ID**: `fal-ai/recraft/v3/text-to-image`
- **Purpose**: Character portrait generation for movie production
- **Use Case**: Square portrait photos for character reference
- **API Documentation**: https://fal.ai/models/fal-ai/recraft/v3/text-to-image/api

## Model Description
Recraft V3 is a state-of-the-art text-to-image model with exceptional capabilities for generating high-quality images, including long text rendering, vector art, and brand-consistent imagery. It currently ranks as SOTA (State of the Art) in image generation according to Hugging Face's Text-to-Image Benchmark.

## Optimal Settings for Character Portraits

### Recommended Configuration
```javascript
{
  "prompt": "[Character description with detailed physical features, clothing, expression, and setting]",
  "image_size": "square_hd",
  "style": "realistic_image/studio_portrait",
  "enable_safety_checker": true
}
```

### Image Size Options
- **Primary**: `square_hd` - High definition square format (1024x1024)
- **Alternative**: `square` - Standard square format (512x512)
- **Custom**: For specific dimensions, use object format:
  ```javascript
  "image_size": {
    "width": 1024,
    "height": 1024
  }
  ```

### Style Recommendations for Character Portraits
1. **Primary**: `realistic_image/studio_portrait` - Professional portrait lighting
2. **Alternative Options**:
   - `realistic_image/natural_light` - Soft, natural lighting
   - `realistic_image/hdr` - High dynamic range for detailed features
   - `realistic_image` - Standard realistic rendering
   - `realistic_image/enterprise` - Professional business-style portraits

## API Integration

### Request Format
```javascript
import { fal } from "@fal-ai/client";

const result = await fal.subscribe("fal-ai/recraft/v3/text-to-image", {
  input: {
    prompt: "Professional headshot of a 35-year-old detective with weathered features, wearing a dark coat, serious expression, studio lighting",
    image_size: "square_hd",
    style: "realistic_image/studio_portrait",
    enable_safety_checker: true
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
      "url": "https://fal.media/files/penguin/[unique-id]_image.webp",
      "content_type": "image/webp",
      "file_name": "character_portrait.webp",
      "file_size": 245760
    }
  ]
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

### Color Preferences
Specify preferred colors for character design consistency:
```javascript
"colors": [
  { "r": 139, "g": 69, "b": 19 },  // Saddle brown for hair
  { "r": 70, "g": 130, "b": 180 }  // Steel blue for eyes
]
```

### Custom Style Reference
Use a custom style ID for brand consistency:
```javascript
"style_id": "your-custom-style-id"
```

## Best Practices for Character Portraits

### Prompt Engineering
1. **Physical Description**: Include age, gender, ethnicity, build
2. **Facial Features**: Eye color, hair style/color, distinctive features
3. **Expression**: Mood, emotion, personality traits
4. **Clothing**: Period-appropriate attire, accessories
5. **Lighting**: Specify studio, natural, or dramatic lighting
6. **Background**: Simple or contextual background

### Example Prompts
```
"Professional headshot of a 28-year-old female protagonist, auburn hair in a ponytail, green eyes, confident smile, wearing a leather jacket, studio portrait lighting, neutral background"

"Character portrait of a 45-year-old male antagonist, salt-and-pepper beard, piercing blue eyes, stern expression, wearing a dark suit, dramatic lighting, cinematic quality"
```

## File Handling
- **Output Format**: WebP (optimized for web)
- **Resolution**: 1024x1024 for square_hd
- **File Size**: Typically 200-500KB
- **Storage**: Hosted on FAL's CDN with public URLs

## Queue Management
For production workflows, use queue system for better control:
```javascript
// Submit request
const { request_id } = await fal.queue.submit("fal-ai/recraft/v3/text-to-image", {
  input: { /* your parameters */ }
});

// Check status
const status = await fal.queue.status("fal-ai/recraft/v3/text-to-image", {
  requestId: request_id,
  logs: true
});

// Get result when complete
const result = await fal.queue.result("fal-ai/recraft/v3/text-to-image", {
  requestId: request_id
});
```

## Cost Considerations
- Standard realistic images: 1x cost
- Vector illustrations: 2x cost
- High-definition outputs may have premium pricing

## Safety and Content Policy
- Safety checker is recommended for production use
- Content must comply with FAL's usage policies
- Avoid generating images of real people without consent

## Integration Notes
- Use environment variables for API keys in production
- Implement proper error handling for API failures
- Consider implementing retry logic for network issues
- Store generated images in your own asset management system for long-term access

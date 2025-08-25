# FAL AI Moondream2 Visual Query Model Documentation

## Overview
Moondream2 is a highly efficient open-source vision language model that combines powerful image understanding capabilities with a remarkably small footprint. The visual-query endpoint allows you to ask specific questions about images and receive detailed textual responses.

## Model Information
- **Model ID**: `fal-ai/moondream2/visual-query`
- **Category**: Vision Language Model
- **License**: Commercial
- **Base URL**: `https://fal.run/fal-ai/moondream2/visual-query`

## API Endpoint
```
POST https://fal.run/fal-ai/moondream2/visual-query
```

## Authentication
Requires FAL API key in headers:
```
Authorization: Key YOUR_FAL_API_KEY
Content-Type: application/json
```

## Input Schema (MoondreamQueryInput)

### Required Parameters
| Parameter | Type | Description | Example |
|-----------|------|-------------|---------|
| `image_url` | string | URL of the image to be processed | `"https://example.com/image.jpg"` |
| `prompt` | string | Query/question to be asked about the image | `"Describe what you see in this image"` |

### Example Input
```json
{
  "image_url": "https://llava-vl.github.io/static/images/monalisa.jpg",
  "prompt": "What is the subject wearing and what is the background like?"
}
```

## Output Schema (MoondreamOutput)

### Response Structure
| Field | Type | Description |
|-------|------|-------------|
| `output` | string | Detailed textual response to the query about the image |

### Example Output
```json
{
  "output": "The subject is wearing a dark dress with intricate details and is positioned against a landscape background featuring distant mountains and a winding path."
}
```

## Usage Examples

### JavaScript/Node.js with @fal-ai/client
```javascript
import { fal } from "@fal-ai/client";

const result = await fal.subscribe("fal-ai/moondream2/visual-query", {
  input: {
    image_url: "https://example.com/your-image.jpg",
    prompt: "Describe the main elements in this image in detail"
  },
  logs: true,
  onQueueUpdate: (update) => {
    if (update.status === "IN_PROGRESS") {
      update.logs.map((log) => log.message).forEach(console.log);
    }
  },
});

console.log(result.data.output);
```

### cURL Example
```bash
curl -X POST "https://fal.run/fal-ai/moondream2/visual-query" \
  -H "Authorization: Key YOUR_FAL_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "image_url": "https://example.com/image.jpg",
    "prompt": "What objects can you identify in this image?"
  }'
```

## Common Use Cases

### 1. Scene Description
```json
{
  "prompt": "Provide a detailed description of the scene, including objects, people, setting, and atmosphere"
}
```

### 2. Character Analysis
```json
{
  "prompt": "Describe the people in this image - their appearance, clothing, expressions, and what they appear to be doing"
}
```

### 3. Object Detection and Counting
```json
{
  "prompt": "List all the objects you can see in this image and count how many of each type there are"
}
```

### 4. Visual Continuity Analysis
```json
{
  "prompt": "Analyze the visual elements in this image including lighting, color palette, composition, and overall mood. Focus on elements that would be important for maintaining visual continuity in a video sequence"
}
```

### 5. Character and Setting Consistency
```json
{
  "prompt": "Describe the characters, their appearance, clothing, and the setting in detail. Include information about lighting conditions, camera angle, and any distinctive visual elements that would be important for maintaining consistency across multiple scenes"
}
```

## Error Handling

### Validation Errors (422)
```json
{
  "detail": [
    {
      "loc": ["body", "image_url"],
      "msg": "field required",
      "type": "value_error.missing"
    }
  ]
}
```

### Common Error Types
- Missing required fields (`image_url`, `prompt`)
- Invalid image URL (not accessible or not an image)
- Empty or invalid prompt
- Image too large or unsupported format

## Best Practices

### 1. Image Requirements
- Use publicly accessible URLs
- Supported formats: JPEG, PNG, WebP
- Recommended resolution: 1024x1024 or similar
- Ensure images are clear and well-lit for best results

### 2. Prompt Engineering
- Be specific about what information you need
- Use clear, descriptive language
- For continuity analysis, ask about specific visual elements
- Include context about what the analysis will be used for

### 3. Performance Optimization
- Use appropriately sized images (not unnecessarily large)
- Cache results when possible for repeated queries
- Consider batch processing for multiple images

## Integration Notes

### For MicroScene Continuity Analysis
When using this model for microScene continuity decisions:

1. **Extract last frame** from previous microScene video
2. **Generate detailed prompt** asking about visual elements relevant to continuity
3. **Use comprehensive prompts** that capture:
   - Character appearance and positioning
   - Lighting conditions and mood
   - Setting and background elements
   - Camera angle and composition
   - Color palette and visual style

### Environment Variable
```bash
FAL_IMAGE_TO_PROMPT_VISUAL_QUERY=fal-ai/moondream2/visual-query
```

## Pricing
- **Billing Unit**: 1000 characters
- **Price**: $0.01 per 1000 characters
- **Provider**: FAL (not partner API)

## Rate Limits
- Standard FAL API rate limits apply
- Concurrent requests: Up to 3 simultaneous requests
- Request timeout: 3600 seconds
- Startup timeout: 600 seconds

## Related Models
- `fal-ai/moondream2` - Basic image captioning
- `fal-ai/moondream2/object-detection` - Object detection with bounding boxes
- `fal-ai/moondream2/point-object-detection` - Point-based object detection

# FLUX.1 Kontext [max] Multi-Image Model Documentation

## Overview
**Model ID**: `fal-ai/flux-pro/kontext/max/multi`  
**Purpose**: Multi-image reference generation for complex scenes with multiple characters/objects  
**Use Case**: When microScenes contain multiple characters, vehicles, objects, or any combination requiring multiple reference images

## Key Capabilities
- **Multi-Reference Input**: Accept multiple image URLs as reference
- **Complex Scene Composition**: Combine multiple digital assets (characters, vehicles, objects, locations)
- **Enhanced Context Understanding**: Better AI comprehension through multiple visual references
- **Improved Video Generation**: Provides Veo3 with richer context for multi-character scenes

## API Specification

### Endpoint
```
POST https://queue.fal.run/fal-ai/flux-pro/kontext/max/multi
```

### Required Parameters
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `prompt` | string | ✅ | Text description of desired scene composition |
| `image_urls` | array[string] | ✅ | Array of reference image URLs (2+ images) |

### Optional Parameters
| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `seed` | integer | random | Reproducible generation seed |
| `guidance_scale` | float | 3.5 | CFG scale (1.0-20.0) |
| `num_images` | integer | 1 | Number of output images |
| `output_format` | enum | "jpeg" | "jpeg" or "png" |
| `safety_tolerance` | enum | "2" | Safety level (1-6, 1=strict, 6=permissive) |
| `aspect_ratio` | enum | - | "21:9", "16:9", "4:3", "3:2", "1:1", "2:3", "3:4", "9:16", "9:21" |
| `sync_mode` | boolean | false | Wait for completion vs async |

### Request Example
```javascript
const result = await fal.subscribe("fal-ai/flux-pro/kontext/max/multi", {
  input: {
    prompt: "Kira Chen teaching Maya Rodriguez Muay Thai techniques in a modern gym, both characters clearly visible, instructor-student dynamic",
    image_urls: [
      "https://cloudflare-r2.com/characters/kira-chen-reference.jpg",
      "https://cloudflare-r2.com/characters/maya-rodriguez-reference.jpg"
    ],
    guidance_scale: 3.5,
    aspect_ratio: "16:9",
    output_format: "jpeg"
  }
});
```

### Response Schema
```javascript
{
  "images": [
    {
      "url": "https://v3.fal.media/files/generated-image.jpg",
      "width": 1920,
      "height": 1080,
      "content_type": "image/jpeg"
    }
  ],
  "seed": 12345,
  "prompt": "Kira Chen teaching Maya Rodriguez...",
  "has_nsfw_concepts": [false],
  "timings": {
    "inference": 4.2
  }
}
```

## Implementation Strategy

### When to Use Multi vs Single Model

#### Use **FAL_TEXT_TO_IMAGE_MULTI_MODEL** when:
- ✅ Multiple characters in scene (2+ people)
- ✅ Character + vehicle combinations
- ✅ Character + object interactions
- ✅ Complex scene compositions
- ✅ Need precise character positioning/interaction

#### Use **FAL_TEXT_TO_IMAGE_MODEL** when:
- ✅ Single character scenes
- ✅ Simple compositions
- ✅ Location-only scenes
- ✅ Basic object generation

### Digital Asset Integration

#### Character References
```javascript
// Multiple characters from digital assets
const characterRefs = [
  digitalAssets.characters.kira_chen.referenceImage,
  digitalAssets.characters.maya_rodriguez.referenceImage
];
```

#### Mixed Asset Types
```javascript
// Character + Vehicle + Object
const mixedRefs = [
  digitalAssets.characters.protagonist.referenceImage,
  digitalAssets.vehicles.sports_car.referenceImage,
  digitalAssets.objects.weapon.referenceImage
];
```

## Prompt Engineering Best Practices

### Multi-Character Prompts
```
"[Character1 Name] and [Character2 Name] [action/interaction] in [location], 
[specific positioning], [lighting], [mood], cinematic quality"
```

### Example Prompts
```javascript
// Training Scene
"Kira Chen instructing Maya Rodriguez in Muay Thai stance, both clearly visible, 
gym setting, natural lighting, focused atmosphere"

// Action Scene  
"Detective Maya Rodriguez confronting suspect John Doe in warehouse, 
tense standoff, dramatic lighting, both characters in frame"

// Vehicle Scene
"Sarah driving red sports car through city streets, character visible through windshield, 
urban background, dynamic angle"
```

## Error Handling

### Common Issues
1. **Insufficient References**: Minimum 2 image URLs required
2. **Invalid URLs**: All references must be publicly accessible
3. **Conflicting Styles**: References should have compatible visual styles
4. **Overloaded Prompt**: Keep descriptions focused and clear

### Validation Checks
```javascript
// Pre-flight validation
if (imageUrls.length < 2) {
  throw new Error('Multi-model requires minimum 2 reference images');
}

if (!imageUrls.every(url => isValidUrl(url))) {
  throw new Error('All image URLs must be valid and accessible');
}
```

## Performance Considerations

### Processing Time
- **Single Model**: ~2-4 seconds
- **Multi Model**: ~4-8 seconds
- **Complex Scenes**: Up to 12 seconds

### Cost Implications
- Multi-model costs ~2x single model
- Use strategically for scenes that truly benefit
- Consider caching results for similar compositions

### Quality Optimization
- **Reference Quality**: Use high-resolution, clear reference images
- **Consistent Lighting**: References should have similar lighting conditions
- **Style Matching**: Ensure visual consistency across references
- **Clear Positioning**: Specify spatial relationships in prompt

## Integration Points

### MicroScene Decision Logic
```javascript
const shouldUseMultiModel = (microScene) => {
  const characterCount = microScene.sceneContext?.characters?.length || 0;
  const hasVehicles = microScene.digitalAssets?.vehicles?.length > 0;
  const hasObjects = microScene.digitalAssets?.objects?.length > 0;
  
  return characterCount >= 2 || 
         (characterCount >= 1 && (hasVehicles || hasObjects));
};
```

### Veo3 Integration Benefits
- **Better Character Recognition**: Multiple references improve accuracy
- **Improved Interactions**: AI understands character relationships
- **Enhanced Continuity**: Consistent character appearance across scenes
- **Reduced Artifacts**: Better scene composition understanding

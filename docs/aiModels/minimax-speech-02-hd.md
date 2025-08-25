# Minimax Speech-02-HD Model Documentation

## Overview
The Minimax Speech-02-HD is a high-quality text-to-speech model that provides natural-sounding voice synthesis with emotion control and voice customization capabilities.

**Model ID**: `fal-ai/minimax/speech-02-hd`

## Features
- High-definition audio output
- Emotion control
- Speed and pitch adjustment
- Multiple voice options
- Natural speech patterns

## API Usage

### Basic Request Format
```javascript
const response = await fetch('https://fal.run/fal-ai/minimax/speech-02-hd', {
  method: 'POST',
  headers: {
    'Authorization': `Key ${process.env.FAL_KEY}`,
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    text: "Your text to be converted to speech",
    voice_id: "default",
    emotion: "natural",
    speed: 1.0,
    pitch: 1.0
  })
});
```

### Request Parameters

#### Required Parameters
- **`text`** (string): The text to be converted to speech
  - Maximum length: 1000 characters
  - Supports multiple languages

#### Optional Parameters
- **`voice_id`** (string): Voice identifier
  - Default: `"default"`
  - Available voices: `"default"`, `"male"`, `"female"`, `"young"`, `"mature"`

- **`emotion`** (string): Emotional tone for the speech
  - Default: `"natural"`
  - Available emotions: `"natural"`, `"happy"`, `"sad"`, `"angry"`, `"excited"`, `"calm"`, `"confident"`, `"focused"`

- **`speed`** (number): Speech speed multiplier
  - Default: `1.0`
  - Range: `0.5` to `2.0`
  - `0.5` = Half speed, `2.0` = Double speed

- **`pitch`** (number): Voice pitch multiplier
  - Default: `1.0`
  - Range: `0.5` to `2.0`
  - `0.5` = Lower pitch, `2.0` = Higher pitch

### Response Format
```javascript
{
  "audio_url": "https://fal.run/files/audio/generated_audio.mp3",
  "duration": 5.2,
  "file_size": 125440,
  "content_type": "audio/mp3"
}
```

### Response Fields
- **`audio_url`** (string): URL to the generated audio file
- **`duration`** (number): Audio duration in seconds
- **`file_size`** (number): File size in bytes
- **`content_type`** (string): MIME type of the audio file

## Integration with MicroScene System

### MicroScene Configuration
```javascript
falTTSConfig: {
  model: process.env.FAL_TEXT_TO_SPEECH, // 'fal-ai/minimax/speech-02-hd'
  text: "Character dialogue text",
  voice_id: "default",
  emotion: "confident",
  speed: 1.0,
  pitch: 1.0
}
```

### Character-Specific Voice Mapping
```javascript
// Example character voice mapping
const getVoiceForCharacter = (character) => {
  const voiceMap = {
    'hero': { voice_id: 'male', emotion: 'confident' },
    'villain': { voice_id: 'male', emotion: 'angry', pitch: 0.8 },
    'narrator': { voice_id: 'mature', emotion: 'calm', speed: 0.9 }
  };
  
  return voiceMap[character.type] || { voice_id: 'default', emotion: 'natural' };
};
```

## Best Practices

### Text Formatting
- Keep sentences natural and conversational
- Use punctuation to control pacing
- Avoid special characters that might cause parsing issues

### Emotion Selection
- Match emotion to character state and scene context
- Use `"natural"` as fallback for neutral dialogue
- Consider scene tone when selecting emotions

### Performance Optimization
- Cache frequently used voice configurations
- Batch similar requests when possible
- Monitor API rate limits

### Quality Considerations
- Test different voice_id options for character consistency
- Adjust speed/pitch based on character personality
- Validate audio duration matches expected timing

## Error Handling

### Common Errors
- **401 Unauthorized**: Invalid or missing FAL_KEY
- **400 Bad Request**: Invalid parameters or text format
- **429 Too Many Requests**: Rate limit exceeded
- **500 Internal Server Error**: Model processing error

### Error Response Format
```javascript
{
  "error": "Error description",
  "code": "ERROR_CODE",
  "details": "Additional error information"
}
```

## Production Configuration

### System Requirements
- Environment variable `FAL_TEXT_TO_SPEECH` must be set to `fal-ai/minimax/speech-02-hd`
- Valid FAL API key required
- No fallback models - system uses only the configured model

## Environment Configuration

### Required Environment Variables
```bash
FAL_KEY=your-fal-api-key
FAL_TEXT_TO_SPEECH=fal-ai/minimax/speech-02-hd
```

### Optional Configuration
```bash
# Default voice settings
TTS_DEFAULT_VOICE=default
TTS_DEFAULT_EMOTION=natural
TTS_DEFAULT_SPEED=1.0
TTS_DEFAULT_PITCH=1.0
```

## Testing

### Test Script Example
```javascript
// Test different voice configurations
const testConfigs = [
  { text: "Hello world", voice_id: "default", emotion: "natural" },
  { text: "I'm excited!", voice_id: "female", emotion: "excited" },
  { text: "This is serious.", voice_id: "male", emotion: "focused", speed: 0.9 }
];

for (const config of testConfigs) {
  const result = await generateAudioWithFAL({ falTTSConfig: config });
  console.log(`Test: ${config.text} - Success: ${result.success}`);
}
```

## Troubleshooting

### Common Issues
1. **Audio Quality**: Ensure using correct model endpoint
2. **Voice Consistency**: Test voice_id options for character matching
3. **Timing Issues**: Adjust speed parameter for scene synchronization
4. **Emotion Mismatch**: Verify emotion parameter matches character state

### Debug Logging
Enable detailed logging to track TTS generation:
```javascript
console.log('[TTS] Model:', process.env.FAL_TEXT_TO_SPEECH);
console.log('[TTS] Config:', JSON.stringify(falTTSConfig, null, 2));
console.log('[TTS] Response:', result);
```

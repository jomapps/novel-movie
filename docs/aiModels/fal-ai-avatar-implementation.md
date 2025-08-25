# FAL AI Avatar Implementation - Working Configuration

## Overview
This document describes the working implementation of FAL AI Avatar video generation for scenes.

## Working Configuration

### Model Selection Logic
```javascript
// Choose model based on character count
const modelEndpoint = videoConfig.characterCount > 1 ? 'fal-ai/ai-avatar/multi' : 'fal-ai/ai-avatar';
```

### Single Avatar Model (fal-ai/ai-avatar)
**Used for**: Single character scenes

**Required Parameters**:
- `image_url` (string): URL of the input image
- `prompt` (string): Text prompt describing the video scene
- `audio_url` (string): URL of the audio file for lip-sync

**Optional Parameters**:
- `resolution` (string): "480p" or "720p" (default: "480p")
- `acceleration` (string): "none", "regular", or "high" (default: "regular")
- `num_frames` (integer): 81-129 frames (default: 145)
- `seed` (integer): For reproducibility (default: 42)

### Multi Avatar Model (fal-ai/ai-avatar/multi)
**Used for**: Multi-character scenes

**Required Parameters**:
- `image_url` (string): URL of the input image
- `prompt` (string): Text prompt describing the video scene
- `first_audio_url` (string): URL of the first person's audio
- `second_audio_url` (string): URL of the second person's audio

**Optional Parameters**:
- `use_only_first_audio` (boolean): Use only first audio for single character in multi-person scene
- `resolution` (string): "480p" or "720p" (default: "480p")
- `acceleration` (string): "none", "regular", or "high" (default: "regular")

## Working Request Example

### Single Character Request
```json
{
  "image_url": "https://v3.fal.media/files/koala/Lif19PPLer9EpMKhS_7ss.jpeg",
  "prompt": "Kira, main character talking in Gym, Training area. focused expression, natural lip-sync, realistic facial movements, professional lighting, cinematic quality, realistic video",
  "resolution": "720p",
  "acceleration": "regular",
  "audio_url": "https://v3.fal.media/files/monkey/15P8XliuChvi75LaTGnJQ_output.wav"
}
```

### Multi Character Request
```json
{
  "image_url": "https://example.com/scene.jpg",
  "prompt": "Two people having a conversation in an office setting",
  "resolution": "720p",
  "acceleration": "regular",
  "first_audio_url": "https://example.com/person1.wav",
  "second_audio_url": "https://example.com/person2.wav"
}
```

## Prompt Generation Strategy

### For Dialogue Scenes
```
{characterName}, {role} talking in {location}, {specificLocation}. {emotion} expression, natural lip-sync, realistic facial movements, professional lighting, cinematic quality, realistic video
```

### For Action Scenes (No Dialogue)
```
{characterName}, {role} in {location}, {specificLocation}. Natural movement, {atmosphere} atmosphere, professional lighting, cinematic quality, realistic video
```

## Response Format
```json
{
  "video": {
    "url": "https://v3.fal.media/files/kangaroo/xyz.mp4",
    "file_size": 515275,
    "file_name": "video.mp4",
    "content_type": "application/octet-stream"
  },
  "seed": 42
}
```

## Implementation Notes

### Processing Time
- Video generation takes 3-5 minutes on average
- Use appropriate timeout values (300+ seconds)
- Consider implementing queue-based processing for production

### Error Handling
- 422 errors typically indicate missing required parameters
- Always include `prompt` parameter - this was the main issue in initial implementation
- Validate image and audio URLs are accessible before sending request

### Database Integration
```javascript
const updatedVideoGeneration = {
  ...scene.videoGeneration,
  generatedVideo: {
    url: result.video.url,
    duration: videoConfig.duration,
    fileSize: result.video.file_size,
    contentType: 'video/mp4',
    generatedAt: new Date().toISOString(),
    falRequestId: `fal_vid_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }
};
```

## Testing Results

### Successful Test Case
- **Scene ID**: ms_lidation_001_1754357098634
- **Image URL**: https://v3.fal.media/files/koala/Lif19PPLer9EpMKhS_7ss.jpeg
- **Audio URL**: https://v3.fal.media/files/monkey/15P8XliuChvi75LaTGnJQ_output.wav
- **Processing Time**: 263 seconds (4.4 minutes)
- **Status**: ✅ Success (HTTP 200)

### Key Success Factors
1. **Prompt Parameter**: Must be included (was missing in initial attempts)
2. **Model Selection**: Correct model based on character count
3. **Valid URLs**: Both image and audio URLs must be accessible
4. **Proper Resolution**: Use "720p" for better quality
5. **Acceleration**: "regular" provides good balance of speed/quality

## Environment Variables
```bash
FAL_KEY=1c65271b-e758-4e19-9eea-3f4f79dc5edd:86e949180e8c80822ab57d386e4e19ce
```

## DIA-TTS API Analysis

### Duration Control Issue
**Problem**: All generated audio clips are exactly 2,646,060 bytes (~15 seconds) regardless of text length
**Root Cause**: DIA-TTS appears to generate fixed-duration clips with padding/silence
**API Limitation**: No duration control parameters found in API schema

### Available API Parameters

#### Standard DIA-TTS (fal-ai/dia-tts)
```json
{
  "text": "[S1] dialogue (emotion)"
}
```

#### Voice Cloning DIA-TTS (fal-ai/dia-tts/voice-clone)
```json
{
  "text": "[S1] dialogue (emotion)",
  "ref_audio_url": "https://example.com/reference.mp3",
  "ref_text": "[S1] Reference text matching the audio"
}
```

### Solutions Implemented
1. **Voice Cloning**: Use `fal-ai/dia-tts/voice-clone` for gender control
2. **Reference Audio**: Create male/female reference samples
3. **Post-Processing**: Trim silence from generated audio (future enhancement)

## Status
✅ **WORKING** - Video generation successfully implemented and tested
🔧 **IN PROGRESS** - Audio duration control and voice cloning implementation

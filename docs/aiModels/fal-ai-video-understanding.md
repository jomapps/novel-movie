# FAL Video Understanding Model

**Model ID**: `fal-ai/video-understanding`  
**Endpoint**: `https://fal.run/fal-ai/video-understanding`  
**Category**: Vision  
**Type**: Inference  

## Overview

A video understanding model to analyze video content and answer questions about what's happening in the video based on user prompts.

## Input Parameters

### Required Parameters

- **`video_url`** (`string`, required)
  - URL of the video to analyze
  - Example: `"https://v3.fal.media/files/elephant/mLAMkUTxFMbe2xF0qpLdA_Ll9mDE8webFA6GAu3vD_M_71ee7217db1d4aa4af1d2f1ae060389b.mp4"`

- **`prompt`** (`string`, required)
  - The question or prompt about the video content
  - Example: `"What is happening in this video?"`

### Optional Parameters

- **`detailed_analysis`** (`boolean`, optional)
  - Whether to request a more detailed analysis of the video
  - Default: `false`

## Output Schema

- **`output`** (`string`, required)
  - The analysis of the video content based on the prompt
  - Example: `"Based on the video, a woman is singing passionately into a microphone in what appears to be a professional recording studio. She is wearing headphones, and behind her, there are sound-dampening foam panels, a mixing board, and other studio equipment."`

## Request Example

```json
{
  "video_url": "https://v3.fal.media/files/elephant/example_video.mp4",
  "prompt": "What is happening in this video?",
  "detailed_analysis": true
}
```

## Response Example

```json
{
  "output": "Based on the video, a woman is singing passionately into a microphone in what appears to be a professional recording studio. She is wearing headphones, and behind her, there are sound-dampening foam panels, a mixing board, and other studio equipment."
}
```

## Usage Notes

- The model can analyze video content and provide detailed descriptions
- Supports custom prompts for specific analysis requirements
- Can be used for scene understanding, object detection, activity recognition
- Suitable for determining visual continuity between video segments
- Response quality depends on video quality and prompt specificity

## Integration Considerations

- Requires video to be accessible via public URL
- Processing time varies based on video length and complexity
- Best used for short video segments for faster processing
- Can be combined with other models for comprehensive video analysis workflows

## Use Cases for MicroScene Analysis

- **Continuity Detection**: Analyze last frame to determine if next scene should continue or start fresh
- **Scene Transition Analysis**: Understand visual changes between scenes
- **Content Description**: Generate detailed descriptions of video content for prompt generation
- **Visual Consistency**: Ensure visual coherence across scene transitions

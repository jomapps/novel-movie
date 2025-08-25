# Veo3 Audio Prompt Guide
## Comprehensive Guide for Audio-Enhanced Video Generation

**Source**: [Leonardo.AI - How To Prompt Audio For Veo 3](https://leonardo.ai/news/how-to-prompt-audio-for-veo-3/)

---

## Overview

Veo3 introduces powerful audio generation capabilities that synchronize with video content. This guide provides best practices for integrating audio cues into your prompts to create immersive, emotionally resonant scenes where sound enhances storytelling.

**Key Principle**: Audio should be woven naturally into the narrative, not treated as an afterthought.

---

## Core Audio Prompting Strategies

### 1. **Weave Audio into the Narrative**

#### ✅ **DO: Integrate sound naturally into the scene**
Embed audio elements throughout your prompt as part of the visual storytelling.

**Example:**
```
The camera floats slowly through a flooded hallway of a long-abandoned hotel. Water ripples at ankle-height as the lens moves past overturned furniture and moldy wallpaper peeling from the walls. Dripping echoes softly with every step, each droplet landing like a pin on the glassy surface. The air is dense and wet. A loose ceiling tile shifts slightly, then falls behind the camera with a sharp splash. Ahead, a rusted elevator door creaks open, its metal groaning in slow motion. Somewhere far above, a single thump reverberates faintly. The walls seem to hum faintly now—a low, electrical buzz, unsteady but constant. Dust motes drift through a beam of light that cuts in from a broken window. The silence between each sound is as thick as the air—stretched, eerie, alive.
```

#### ❌ **DON'T: List audio prompts at the end**
Avoid isolating audio cues as a checklist at the end of your prompt.

**Bad Example:**
```
The camera glides slowly through a flooded hallway of a long-abandoned hotel. Water ripples at ankle-height as it passes overturned furniture and walls coated in moldy, peeling wallpaper. A rusted elevator stands crooked at the far end.

Sounds: Distant dripping echoes throughout the space. A ceiling tile crashes into the water behind the camera. A faint metallic groan as the elevator door opens. A low, electrical buzz hums in the background. Muffled thump from above.
```

### 2. **Layer Ambient Sounds Thoughtfully**

#### ✅ **DO: Layer 3-5 ambient sounds for rich scenes**
Create depth with multiple audio layers without overwhelming the system.

**Example:**
```
Rain falls steadily onto wet pavement, pattering softly across rooftops and metal bins. A single, low thunderclap rolls across the sky, echoing faintly between tall buildings before disappearing. A car passes faintly in the distance. A dog barks once. A soft, tense melody plays from an old radio somewhere above.
```

#### ❌ **DON'T: Overcomplicate with excessive sounds**
More than 5 sound elements can cause audio breakdown and poor timing.

### 3. **Define Sound Hierarchy**

#### ✅ **DO: Create clear sound hierarchy**
Use descriptive phrases to establish foreground vs. background audio importance.

**Hierarchy Phrases:**
- **Foreground**: "cuts through", "sharp", "clear", "prominent"
- **Background**: "in the distance", "faintly", "softly", "beneath", "hums below"

**Example:**
```
A crowded train station roars beneath pounding rain. The station announcer's voice cuts through faintly—clear enough to understand, but softened by the ambient storm. Passengers' chatter hums below her words, layered yet subdued. Footsteps splash in shallow puddles, syncing to hurried movements. Rain thrums hard on the glass ceiling above, filling every pause in speech with sound. In the distance, a train brakes sharply with a metallic screech, echoing behind her steady voice.
```

### 4. **Use Emotionally Descriptive Imagery**

#### ✅ **DO: Use emotional cues to set mood**
Let environmental descriptions and sound choices imply emotion naturally.

**Emotional Sound Associations:**
- **Calm**: "chirping birds", "gentle breeze", "soft rustling"
- **Tension**: "wind", "creaking", "distant rumbles"
- **Isolation**: "echoes", "hollow sounds", "silence between"
- **Warmth**: "crackling fire", "light piano", "gentle strings"

**Example:**
```
A long country road stretches toward distant hills, painted gold by the fading sun. A child walks alone, small against the vast sky, swinging a worn backpack at their side. Birds chirp faintly in the distance, and a soft breeze rustles through tall grass. An ambient melody begins—light piano, gentle strings—subtle and warm. Footsteps on gravel crunch softly, unhurried. The moment feels peaceful, full of quiet optimism. Somewhere far off, a dog barks once. The child smiles slightly, still walking.
```

#### ❌ **DON'T: Use abstract emotional terms**
Avoid direct emotional descriptors like "sad music" or "tense sounds".

### 5. **Emphasize Sound Events for Key Moments**

#### ✅ **DO: Use vivid instructions for impactful sounds**
Veo3 excels at generating sharp, well-timed audio for specific events.

**Example:**
```
Inside an abandoned art gallery, the camera pans across dimly lit hallways. Dusty frames lean crooked against the walls, and rain seeps through cracked ceilings, dripping faintly onto the marble floor. The lens slows near a glass display case, its surface dull with grime. Just as the shot centers on the case, a single pane shatters with a violent, ringing crack, shards scattering across the floor like metallic chimes. The sound cuts sharply through the soft ambience of wind and distant rain. The camera holds, catching glints of broken glass in the dim light as echoes fade into the cavernous hall.
```

---

## Audio Integration Best Practices

### **Effective Sound Categories**

1. **Ambient Layers** (Background)
   - Environmental sounds (rain, wind, traffic)
   - Location-specific audio (ocean waves, city hum, forest sounds)
   - Atmospheric elements (electrical buzz, distant music)

2. **Diegetic Sounds** (Part of the scene)
   - Character actions (footsteps, breathing, movement)
   - Object interactions (doors creaking, glass breaking)
   - Dialogue and speech

3. **Emotional Enhancers**
   - Musical elements (melodies, rhythms)
   - Tonal sounds that support mood
   - Silence and pauses for emphasis

### **Timing and Synchronization**

- **Align audio with visual events**: "Just as the door opens, hinges creak loudly"
- **Use temporal markers**: "behind the camera", "in the distance", "as the shot centers"
- **Create audio-visual relationships**: "each droplet landing", "syncing to hurried movements"

### **Voice and Dialogue Integration**

For character dialogue in microScenes:
- Embed speech naturally: "she whispers urgently, 'We need to leave now'"
- Specify delivery style: "his voice cuts through the noise, clear and commanding"
- Include emotional context: "her words tremble with fear as she speaks"

---

## Common Mistakes to Avoid

### ❌ **Don't:**
- Rely on onomatopoeia alone ("Boom!" without context)
- Contradict audio expectations (silence in busy crowds without reason)
- Repeat the same sound cue multiple times in one scene
- Use more than 5 competing sound elements
- Place all audio descriptions at the end of the prompt
- Use abstract emotional terms for sound description

### ✅ **Do:**
- Weave audio naturally throughout the narrative
- Create clear sound hierarchy (foreground vs. background)
- Use emotionally descriptive environmental cues
- Align sound events with key visual moments
- Layer 3-5 ambient sounds for richness
- Use vivid, specific sound descriptions

---

## Implementation in MicroScene System

### **JSON Prompt Structure Integration**

When generating Veo3 JSON prompts for microScenes, audio should be integrated into:

1. **Scene Setting**: Environmental and ambient sounds
2. **Character Performance**: Dialogue delivery and vocal characteristics
3. **Narrative Elements**: Key sound moments and emotional audio cues
4. **Technical Specifications**: Audio quality and synchronization requirements

### **Dialogue Integration Pattern**

```javascript
// In Veo3JsonPromptGenerator
dialogue: {
  text: "Focus on your form. Keep your guard up.",
  delivery: "confident and instructional",
  voiceCharacteristics: {
    tone: "focused and encouraging",
    pace: "measured and clear",
    volume: "normal speaking voice",
    accent: "neutral"
  }
}
```

### **Environmental Audio Pattern**

```javascript
// In scene setting
environment: {
  backgroundElements: ["heavy bags", "training equipment", "mirrors"],
  props: ["hand wraps", "training gloves"],
  soundscape: "ambient gym sounds, equipment impacts, breathing, footsteps echoing off walls"
}
```

---

## Quality Assurance

### **Audio Prompt Checklist**

- [ ] Audio elements woven throughout narrative (not listed at end)
- [ ] Clear sound hierarchy established (foreground vs. background)
- [ ] 3-5 ambient sound layers maximum
- [ ] Emotional context provided through environmental description
- [ ] Key sound events aligned with visual moments
- [ ] Dialogue integrated naturally with delivery context
- [ ] No contradictory audio expectations
- [ ] Specific, vivid sound descriptions used

### **Testing and Validation**

1. **Prompt Review**: Ensure audio flows naturally with visual narrative
2. **Hierarchy Check**: Verify clear distinction between important and ambient sounds
3. **Emotional Alignment**: Confirm audio supports intended mood and atmosphere
4. **Technical Validation**: Check for proper integration with Veo3 JSON structure

---

## Conclusion

Effective Veo3 audio prompting transforms video generation from purely visual to fully immersive experiences. By weaving sound naturally into your narrative, creating clear hierarchies, and aligning audio with emotional and visual cues, you can create compelling content where audio enhances rather than competes with the visual story.

Remember: Great audio in Veo3 isn't just about adding sounds—it's about directing them to create emotionally resonant scenes that put viewers directly into the moment.

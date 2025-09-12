// Utility to build a high‑quality character reference image prompt from existing data
// Uses previously generated BAML character data stored in characterRef.generationMetadata.bamlData

export function buildReferenceImagePromptFromRef(characterRef: any): string {
  const name: string = characterRef?.projectCharacterName || characterRef?.name || 'the character'
  const baml: any = characterRef?.generationMetadata?.bamlData || {}

  // Extract as much descriptive information as we have
  const physical = safeJoin([
    baml?.physicalDescription?.gender,
    baml?.physicalDescription?.age,
    baml?.physicalDescription?.ethnicity,
    baml?.physicalDescription?.bodyType,
    baml?.physicalDescription?.distinctiveFeatures,
    baml?.physicalDescription?.hair,
    baml?.physicalDescription?.face,
    baml?.physicalDescription?.description,
  ])

  const attire = safeJoin([
    baml?.physicalDescription?.attire,
    baml?.physicalDescription?.wardrobe,
    baml?.characterDevelopment?.signatureStyle,
  ])

  const personality = baml?.characterDevelopment?.personality || ''
  const eraOrSetting = safeJoin([baml?.context?.era, baml?.context?.setting, baml?.context?.locale])

  // Cinematography / style hints if present from seeded values
  const cinematography = toName(baml?.production?.cinematographyStyle) || ''
  const colorStyle = baml?.production?.colorPalette || ''
  const lighting = baml?.production?.lighting || 'natural lighting'
  // v1.2: sanitize lighting to avoid unwanted shadow phrasing
  const sanitizedLighting = (lighting || '')
    .replace(/\bdramatic shadows\b/gi, '')
    .replace(/\bdark shadows\b/gi, '')
    .replace(/\s{2,}/g, ' ')
    .trim()

  const framing =
    'chest-to-mid-thigh crop, equal headroom, thirds positioning, matched eye level, slightly low angle'

  const camera = '35mm lens, f/4 aperture, ISO 200, 1/250s'

  const core = [
    `Ultra-detailed, photorealistic studio reference of ${name}`,
    physical && `(${physical})`,
    'cinematic hero shot',
    attire && `wardrobe: ${attire}`,
    personality && `personality cues: ${personality}`,
    eraOrSetting && `context: ${eraOrSetting}`,
  ]
    .filter(Boolean)
    .join('; ')

  const look = [
    cinematography && `cinematography: ${cinematography}`,
    colorStyle && `color: ${colorStyle}`,
    sanitizedLighting && `lighting: ${sanitizedLighting}`,
    'neutral seamless studio background',
    'high dynamic range, crisp focus, accurate skin tones',
    'authentic skin texture with visible pores and subtle imperfections',
    'realistic eye moisture and reflections',
    'magazine-quality photorealism',
  ]
    .filter(Boolean)
    .join('; ')

  const notPhrases = 'NOT CGI, NOT 3D, NOT illustration, NOT cartoon, no uncanny valley'
  const constraints =
    'Focus solely on the character; no other objects, locations, actions, or props; no text or watermarks'

  // Final prompt aligned with Photorealistic Prompt Template
  const finalPrompt =
    `${core}. ${look}. Camera: ${camera}. Composition: ${framing}. ${notPhrases}. ${constraints}`.trim()

  return finalPrompt
}

function safeJoin(parts: Array<string | undefined | null>): string {
  return parts
    .map((p) => (typeof p === 'string' ? p : ''))
    .map((s) => s.trim())
    .filter((s) => s.length > 0)
    .join(', ')
}

function toName(val: any): string | undefined {
  if (!val) return undefined
  if (typeof val === 'string') return val
  if (typeof val === 'object') return val.name || val.title || undefined
  return undefined
}

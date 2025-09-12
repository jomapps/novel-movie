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
  const eraOrSetting = safeJoin([
    baml?.context?.era,
    baml?.context?.setting,
    baml?.context?.locale,
  ])

  // Cinematography / style hints if present from seeded values
  const cinematography = toName(baml?.production?.cinematographyStyle) || ''
  const colorStyle = baml?.production?.colorPalette || ''
  const lighting = baml?.production?.lighting || 'soft, even three‑point lighting'

  const framing =
    'chest-to-mid-thigh crop, equal headroom, characters pinned to left/right thirds, inter-subject gap ≈ 7% of frame width, matched eye level, 35mm lens.'

  const core = [
    `Ultra-detailed, photorealistic studio reference of ${name}`,
    physical && `(${physical})`,
    attire && `wardrobe: ${attire}`,
    personality && `personality cues: ${personality}`,
    eraOrSetting && `context: ${eraOrSetting}`,
  ]
    .filter(Boolean)
    .join('; ')

  const look = [
    cinematography && `cinematography: ${cinematography}`,
    colorStyle && `color: ${colorStyle}`,
    lighting && `lighting: ${lighting}`,
    'neutral seamless studio background',
    'high dynamic range, crisp focus, accurate skin tones, no text or watermarks',
  ]
    .filter(Boolean)
    .join('; ')

  // Final prompt with strict framing instruction appended
  const finalPrompt = `${core}. ${look}. Shot details: ${framing}`.trim()

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


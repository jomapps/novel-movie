import { InitialConceptFormData } from '@/components/forms/InitialConceptForm'

/**
 * Check if all required fields in the initial concept form are completed
 * This determines when the Quality Score button should be visible
 */
export function isInitialConceptFormComplete(formData: InitialConceptFormData): boolean {
  // Check primary genres (at least 1 required)
  if (!formData.primaryGenres || formData.primaryGenres.length === 0) {
    return false
  }

  // Check core premise
  if (!formData.corePremise || formData.corePremise.trim().length === 0) {
    return false
  }

  // Check target audience
  if (!formData.targetAudience.demographics || formData.targetAudience.demographics.length === 0) {
    return false
  }
  if (!formData.targetAudience.psychographics || formData.targetAudience.psychographics.trim().length === 0) {
    return false
  }

  // Check tone and mood
  if (!formData.toneAndMood.tones || formData.toneAndMood.tones.length === 0) {
    return false
  }
  if (!formData.toneAndMood.moods || formData.toneAndMood.moods.length === 0) {
    return false
  }
  if (!formData.toneAndMood.emotionalArc || formData.toneAndMood.emotionalArc.trim().length === 0) {
    return false
  }

  // Check visual style
  if (!formData.visualStyle.cinematographyStyle || formData.visualStyle.cinematographyStyle.trim().length === 0) {
    return false
  }
  if (!formData.visualStyle.colorPalette.dominance || formData.visualStyle.colorPalette.dominance.trim().length === 0) {
    return false
  }
  if (!formData.visualStyle.colorPalette.saturation || formData.visualStyle.colorPalette.saturation.trim().length === 0) {
    return false
  }
  if (!formData.visualStyle.colorPalette.symbolicColors || formData.visualStyle.colorPalette.symbolicColors.trim().length === 0) {
    return false
  }
  if (!formData.visualStyle.lightingPreferences || formData.visualStyle.lightingPreferences.trim().length === 0) {
    return false
  }
  if (!formData.visualStyle.cameraMovement || formData.visualStyle.cameraMovement.trim().length === 0) {
    return false
  }

  // Check references
  if (!formData.references.inspirationalMovies || formData.references.inspirationalMovies.length === 0) {
    return false
  }
  // Check that at least one inspirational movie has all required fields
  const hasValidMovie = formData.references.inspirationalMovies.some(movie => 
    movie.title && movie.title.trim().length > 0 &&
    movie.specificElements && movie.specificElements.trim().length > 0
  )
  if (!hasValidMovie) {
    return false
  }
  if (!formData.references.visualReferences || formData.references.visualReferences.trim().length === 0) {
    return false
  }
  if (!formData.references.narrativeReferences || formData.references.narrativeReferences.trim().length === 0) {
    return false
  }

  // Check themes
  if (!formData.themes.centralThemes || formData.themes.centralThemes.length === 0) {
    return false
  }
  if (!formData.themes.moralQuestions || formData.themes.moralQuestions.trim().length === 0) {
    return false
  }
  if (!formData.themes.messageTakeaway || formData.themes.messageTakeaway.trim().length === 0) {
    return false
  }

  // All required fields are present
  return true
}

/**
 * Get a list of missing required fields for debugging/user feedback
 */
export function getMissingRequiredFields(formData: InitialConceptFormData): string[] {
  const missing: string[] = []

  if (!formData.primaryGenres || formData.primaryGenres.length === 0) {
    missing.push('Primary Genres')
  }

  if (!formData.corePremise || formData.corePremise.trim().length === 0) {
    missing.push('Core Premise')
  }

  if (!formData.targetAudience.demographics || formData.targetAudience.demographics.length === 0) {
    missing.push('Target Audience Demographics')
  }
  if (!formData.targetAudience.psychographics || formData.targetAudience.psychographics.trim().length === 0) {
    missing.push('Target Audience Psychographics')
  }

  if (!formData.toneAndMood.tones || formData.toneAndMood.tones.length === 0) {
    missing.push('Tone Options')
  }
  if (!formData.toneAndMood.moods || formData.toneAndMood.moods.length === 0) {
    missing.push('Mood Options')
  }
  if (!formData.toneAndMood.emotionalArc || formData.toneAndMood.emotionalArc.trim().length === 0) {
    missing.push('Emotional Arc')
  }

  if (!formData.visualStyle.cinematographyStyle || formData.visualStyle.cinematographyStyle.trim().length === 0) {
    missing.push('Cinematography Style')
  }
  if (!formData.visualStyle.colorPalette.dominance || formData.visualStyle.colorPalette.dominance.trim().length === 0) {
    missing.push('Color Palette Dominance')
  }
  if (!formData.visualStyle.colorPalette.saturation || formData.visualStyle.colorPalette.saturation.trim().length === 0) {
    missing.push('Color Palette Saturation')
  }
  if (!formData.visualStyle.colorPalette.symbolicColors || formData.visualStyle.colorPalette.symbolicColors.trim().length === 0) {
    missing.push('Symbolic Colors')
  }
  if (!formData.visualStyle.lightingPreferences || formData.visualStyle.lightingPreferences.trim().length === 0) {
    missing.push('Lighting Preferences')
  }
  if (!formData.visualStyle.cameraMovement || formData.visualStyle.cameraMovement.trim().length === 0) {
    missing.push('Camera Movement')
  }

  if (!formData.references.inspirationalMovies || formData.references.inspirationalMovies.length === 0) {
    missing.push('Inspirational Movies')
  } else {
    const hasValidMovie = formData.references.inspirationalMovies.some(movie => 
      movie.title && movie.title.trim().length > 0 &&
      movie.specificElements && movie.specificElements.trim().length > 0
    )
    if (!hasValidMovie) {
      missing.push('Complete Inspirational Movie Details')
    }
  }
  if (!formData.references.visualReferences || formData.references.visualReferences.trim().length === 0) {
    missing.push('Visual References')
  }
  if (!formData.references.narrativeReferences || formData.references.narrativeReferences.trim().length === 0) {
    missing.push('Narrative References')
  }

  if (!formData.themes.centralThemes || formData.themes.centralThemes.length === 0) {
    missing.push('Central Themes')
  }
  if (!formData.themes.moralQuestions || formData.themes.moralQuestions.trim().length === 0) {
    missing.push('Moral Questions')
  }
  if (!formData.themes.messageTakeaway || formData.themes.messageTakeaway.trim().length === 0) {
    missing.push('Message Takeaway')
  }

  return missing
}

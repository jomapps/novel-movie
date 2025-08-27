/**
 * Utility functions to transform form data for API requests
 * Converts relationship objects to strings (slugs) as expected by API routes
 */

/**
 * Transform a relationship field value to string
 * Handles both single objects and arrays of objects
 */
function transformRelationshipField(value: any): any {
  if (!value) return value
  
  if (Array.isArray(value)) {
    return value.map(item => {
      if (typeof item === 'object' && item.slug) {
        return item.slug
      }
      if (typeof item === 'object' && item.name) {
        return item.name
      }
      return item
    })
  }
  
  if (typeof value === 'object' && value.slug) {
    return value.slug
  }
  
  if (typeof value === 'object' && value.name) {
    return value.name
  }
  
  return value
}

/**
 * Transform initial concept form data for API requests
 * Converts all relationship objects to strings
 */
export function transformInitialConceptFormData(formData: any): any {
  if (!formData) return formData
  
  const transformed = { ...formData }
  
  // Transform primary genres
  if (transformed.primaryGenres) {
    transformed.primaryGenres = transformRelationshipField(transformed.primaryGenres)
  }
  
  // Transform target audience demographics
  if (transformed.targetAudience?.demographics) {
    transformed.targetAudience.demographics = transformRelationshipField(transformed.targetAudience.demographics)
  }
  
  // Transform tones and moods
  if (transformed.toneAndMood?.tones) {
    transformed.toneAndMood.tones = transformRelationshipField(transformed.toneAndMood.tones)
  }
  
  if (transformed.toneAndMood?.moods) {
    transformed.toneAndMood.moods = transformRelationshipField(transformed.toneAndMood.moods)
  }
  
  // Transform cinematography style
  if (transformed.visualStyle?.cinematographyStyle) {
    transformed.visualStyle.cinematographyStyle = transformRelationshipField(transformed.visualStyle.cinematographyStyle)
  }
  
  // Transform central themes
  if (transformed.themes?.centralThemes) {
    transformed.themes.centralThemes = transformRelationshipField(transformed.themes.centralThemes)
  }
  
  return transformed
}

/**
 * Transform project relationship fields to strings
 */
export function transformProjectFields(project: any): any {
  if (!project) return project
  
  return {
    ...project,
    movieFormat: typeof project.movieFormat === 'object' ? project.movieFormat.slug : project.movieFormat,
    movieStyle: typeof project.movieStyle === 'object' ? project.movieStyle.slug : project.movieStyle,
    series: typeof project.series === 'object' ? project.series?.slug : project.series,
  }
}

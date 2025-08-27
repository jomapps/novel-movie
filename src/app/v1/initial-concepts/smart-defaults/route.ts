import { NextRequest, NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '@payload-config'

/**
 * API endpoint to get smart defaults for initial concept form
 * This ensures all relationship collections have data and provides first active items
 */

export async function GET(request: NextRequest) {
  try {
    const payload = await getPayload({ config })

    // Get first active items from each collection
    const [genresResult, demographicsResult, tonesResult, moodsResult, themesResult] =
      await Promise.all([
        payload.find({
          collection: 'genres',
          where: { isActive: { equals: true } },
          limit: 3,
          sort: 'sortOrder',
        }),
        payload.find({
          collection: 'audience-demographics',
          where: { isActive: { equals: true } },
          limit: 1,
          sort: 'sortOrder',
        }),
        payload.find({
          collection: 'tone-options',
          where: { isActive: { equals: true } },
          limit: 1,
          sort: 'sortOrder',
        }),
        payload.find({
          collection: 'mood-descriptors',
          where: { isActive: { equals: true } },
          limit: 1,
          sort: 'sortOrder',
        }),
        payload.find({
          collection: 'central-themes',
          where: { isActive: { equals: true } },
          limit: 1,
          sort: 'sortOrder',
        }),
      ])

    // Extract IDs from results
    const defaults = {
      primaryGenres: genresResult.docs.map((doc: any) => doc.id),
      targetAudience: {
        demographics: demographicsResult.docs.map((doc: any) => doc.id),
      },
      toneAndMood: {
        tones: tonesResult.docs.map((doc: any) => doc.id),
        moods: moodsResult.docs.map((doc: any) => doc.id),
      },
      themes: {
        centralThemes: themesResult.docs.map((doc: any) => doc.id),
      },
    }

    console.log('🎯 Smart defaults generated:', {
      primaryGenres: defaults.primaryGenres.length,
      demographics: defaults.targetAudience.demographics.length,
      tones: defaults.toneAndMood.tones.length,
      moods: defaults.toneAndMood.moods.length,
      centralThemes: defaults.themes.centralThemes.length,
    })

    return NextResponse.json({
      success: true,
      data: defaults,
    })
  } catch (error) {
    console.error('Error generating smart defaults:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to generate smart defaults',
        details:
          process.env.NODE_ENV === 'development'
            ? error instanceof Error
              ? error.message
              : 'Unknown error'
            : undefined,
      },
      { status: 500 },
    )
  }
}

// Handle unsupported methods
export async function POST() {
  return NextResponse.json(
    {
      success: false,
      error: 'Method not allowed. Use GET to retrieve smart defaults.',
      supportedMethods: ['GET'],
    },
    { status: 405 },
  )
}

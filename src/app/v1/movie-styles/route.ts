import { getPayload } from 'payload'
import { NextRequest, NextResponse } from 'next/server'
import config from '@payload-config'

export async function GET(request: NextRequest) {
  try {
    const payload = await getPayload({ config })

    const movieStyles = await payload.find({
      collection: 'movie-styles',
      sort: 'name',
      limit: 100, // Get all styles
    })

    return NextResponse.json({
      success: true,
      data: movieStyles,
    })
  } catch (error) {
    console.error('Error fetching movie styles:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch movie styles',
      },
      { status: 500 }
    )
  }
}

import { getPayload } from 'payload'
import { NextRequest, NextResponse } from 'next/server'
import config from '@payload-config'

export async function GET(request: NextRequest) {
  try {
    const payload = await getPayload({ config })

    const movieFormats = await payload.find({
      collection: 'movie-formats',
      where: {
        isActive: {
          equals: true,
        },
      },
      sort: 'name',
      limit: 100, // Get all active formats
    })

    return NextResponse.json({
      success: true,
      data: movieFormats,
    })
  } catch (error) {
    console.error('Error fetching movie formats:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch movie formats',
      },
      { status: 500 }
    )
  }
}

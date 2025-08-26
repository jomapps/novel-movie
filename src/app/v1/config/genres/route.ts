import { getPayload } from 'payload'
import { NextRequest, NextResponse } from 'next/server'
import config from '@payload-config'

export async function GET(request: NextRequest) {
  try {
    const payload = await getPayload({ config })

    const genres = await payload.find({
      collection: 'genres',
      where: {
        isActive: { equals: true }
      },
      sort: 'sortOrder',
      limit: 100, // Get all active genres
      depth: 1,
    })

    return NextResponse.json({
      success: true,
      data: genres.docs,
    })
  } catch (error) {
    console.error('Error fetching genres:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch genres',
      },
      { status: 500 }
    )
  }
}

import { getPayload } from 'payload'
import { NextRequest, NextResponse } from 'next/server'
import config from '@payload-config'

export async function GET(request: NextRequest) {
  try {
    const payload = await getPayload({ config })

    const series = await payload.find({
      collection: 'series',
      sort: 'name',
      limit: 100, // Get all series
    })

    return NextResponse.json({
      success: true,
      data: series,
    })
  } catch (error) {
    console.error('Error fetching series:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch series',
      },
      { status: 500 }
    )
  }
}

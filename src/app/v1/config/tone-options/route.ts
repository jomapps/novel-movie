import { getPayload } from 'payload'
import { NextRequest, NextResponse } from 'next/server'
import config from '@payload-config'

export async function GET(request: NextRequest) {
  try {
    const payload = await getPayload({ config })

    const toneOptions = await payload.find({
      collection: 'tone-options',
      where: {
        isActive: { equals: true }
      },
      sort: 'sortOrder',
      limit: 100,
      depth: 1,
    })

    return NextResponse.json({
      success: true,
      data: toneOptions.docs,
    })
  } catch (error) {
    console.error('Error fetching tone options:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch tone options',
      },
      { status: 500 }
    )
  }
}

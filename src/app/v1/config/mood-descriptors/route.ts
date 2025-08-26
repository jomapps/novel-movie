import { getPayload } from 'payload'
import { NextRequest, NextResponse } from 'next/server'
import config from '@payload-config'

export async function GET(request: NextRequest) {
  try {
    const payload = await getPayload({ config })

    const moodDescriptors = await payload.find({
      collection: 'mood-descriptors',
      where: {
        isActive: { equals: true }
      },
      sort: 'sortOrder',
      limit: 100,
      depth: 1,
    })

    return NextResponse.json({
      success: true,
      data: moodDescriptors.docs,
    })
  } catch (error) {
    console.error('Error fetching mood descriptors:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch mood descriptors',
      },
      { status: 500 }
    )
  }
}

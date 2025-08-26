import { getPayload } from 'payload'
import { NextRequest, NextResponse } from 'next/server'
import config from '@payload-config'

export async function GET(request: NextRequest) {
  try {
    const payload = await getPayload({ config })

    const cinematographyStyles = await payload.find({
      collection: 'cinematography-styles',
      where: {
        isActive: { equals: true }
      },
      sort: 'sortOrder',
      limit: 100,
      depth: 1,
    })

    return NextResponse.json({
      success: true,
      data: cinematographyStyles.docs,
    })
  } catch (error) {
    console.error('Error fetching cinematography styles:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch cinematography styles',
      },
      { status: 500 }
    )
  }
}

import { getPayload } from 'payload'
import { NextRequest, NextResponse } from 'next/server'
import config from '@payload-config'

export async function GET(request: NextRequest) {
  try {
    const payload = await getPayload({ config })

    const demographics = await payload.find({
      collection: 'audience-demographics',
      where: {
        isActive: { equals: true }
      },
      sort: 'sortOrder',
      limit: 100,
      depth: 1,
    })

    return NextResponse.json({
      success: true,
      data: demographics.docs,
    })
  } catch (error) {
    console.error('Error fetching audience demographics:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch audience demographics',
      },
      { status: 500 }
    )
  }
}

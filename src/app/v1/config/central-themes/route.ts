import { getPayload } from 'payload'
import { NextRequest, NextResponse } from 'next/server'
import config from '@payload-config'

export async function GET(request: NextRequest) {
  try {
    const payload = await getPayload({ config })

    const centralThemes = await payload.find({
      collection: 'central-themes',
      where: {
        isActive: { equals: true }
      },
      sort: 'sortOrder',
      limit: 100,
      depth: 1,
    })

    return NextResponse.json({
      success: true,
      data: centralThemes.docs,
    })
  } catch (error) {
    console.error('Error fetching central themes:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch central themes',
      },
      { status: 500 }
    )
  }
}

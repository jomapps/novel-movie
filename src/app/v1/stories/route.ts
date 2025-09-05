import { getPayload } from 'payload'
import { NextRequest, NextResponse } from 'next/server'
import config from '@payload-config'

export async function GET(request: NextRequest) {
  try {
    const payload = await getPayload({ config })
    const { searchParams } = new URL(request.url)

    // Extract query parameters
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const sort = searchParams.get('sort') || '-updatedAt'
    
    // Handle where clause for project filtering
    const projectId = searchParams.get('where[project][equals]')
    
    let whereClause = {}
    if (projectId) {
      whereClause = {
        project: {
          equals: projectId
        }
      }
    }

    const stories = await payload.find({
      collection: 'stories',
      where: whereClause,
      page,
      limit,
      sort,
      depth: 2, // Include related data like project
    })

    return NextResponse.json({
      success: true,
      data: stories,
      docs: stories.docs, // Include docs for compatibility with existing code
    })
  } catch (error) {
    console.error('Error fetching stories:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch stories',
      },
      { status: 500 }
    )
  }
}

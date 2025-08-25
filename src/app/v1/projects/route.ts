import { getPayload } from 'payload'
import { NextRequest, NextResponse } from 'next/server'
import config from '@payload-config'

export async function GET(request: NextRequest) {
  try {
    const payload = await getPayload({ config })
    const { searchParams } = new URL(request.url)
    
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const sort = searchParams.get('sort') || '-updatedAt'

    const projects = await payload.find({
      collection: 'projects',
      page,
      limit,
      sort,
      depth: 2, // Include related data like movieFormat and movieStyle
    })

    return NextResponse.json({
      success: true,
      data: projects,
    })
  } catch (error) {
    console.error('Error fetching projects:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch projects',
      },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const payload = await getPayload({ config })
    const data = await request.json()

    // Validate required fields
    if (!data.name || !data.movieFormat || !data.movieStyle) {
      return NextResponse.json(
        {
          success: false,
          error: 'Missing required fields: name, movieFormat, and movieStyle are required',
        },
        { status: 400 }
      )
    }

    const project = await payload.create({
      collection: 'projects',
      data: {
        ...data,
        status: data.status || 'draft',
      },
    })

    return NextResponse.json({
      success: true,
      data: project,
    })
  } catch (error) {
    console.error('Error creating project:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to create project',
      },
      { status: 500 }
    )
  }
}

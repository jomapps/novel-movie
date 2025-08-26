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
    const project = searchParams.get('project')

    // Build query conditions
    const where: any = {}
    if (project) {
      where.project = { equals: project }
    }

    const initialConcepts = await payload.find({
      collection: 'initial-concepts',
      page,
      limit,
      sort,
      where,
      depth: 2, // Include related data
    })

    // If requesting by project and expecting single result
    if (project && initialConcepts.docs.length > 0) {
      return NextResponse.json({
        success: true,
        data: initialConcepts.docs[0], // Return single concept for project
      })
    }

    return NextResponse.json({
      success: true,
      data: initialConcepts,
    })
  } catch (error) {
    console.error('Error fetching initial concepts:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch initial concepts',
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
    if (!data.project) {
      return NextResponse.json(
        {
          success: false,
          error: 'Missing required field: project is required',
        },
        { status: 400 }
      )
    }

    // Check if initial concept already exists for this project
    const existingConcept = await payload.find({
      collection: 'initial-concepts',
      where: {
        project: { equals: data.project }
      },
      limit: 1,
    })

    if (existingConcept.docs.length > 0) {
      return NextResponse.json(
        {
          success: false,
          error: 'Initial concept already exists for this project. Use PUT to update.',
        },
        { status: 409 }
      )
    }

    // Verify project exists
    const project = await payload.findByID({
      collection: 'projects',
      id: data.project,
    })

    if (!project) {
      return NextResponse.json(
        {
          success: false,
          error: 'Project not found',
        },
        { status: 404 }
      )
    }

    const initialConcept = await payload.create({
      collection: 'initial-concepts',
      data: {
        ...data,
        status: data.status || 'draft',
      },
    })

    return NextResponse.json({
      success: true,
      data: initialConcept,
    })
  } catch (error) {
    console.error('Error creating initial concept:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to create initial concept',
      },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    const payload = await getPayload({ config })
    const data = await request.json()
    const { searchParams } = new URL(request.url)
    const project = searchParams.get('project')

    if (!project) {
      return NextResponse.json(
        {
          success: false,
          error: 'Project ID is required for updating initial concept',
        },
        { status: 400 }
      )
    }

    // Find existing concept for this project
    const existingConcept = await payload.find({
      collection: 'initial-concepts',
      where: {
        project: { equals: project }
      },
      limit: 1,
    })

    if (existingConcept.docs.length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: 'Initial concept not found for this project. Use POST to create.',
        },
        { status: 404 }
      )
    }

    const conceptId = existingConcept.docs[0].id

    const updatedConcept = await payload.update({
      collection: 'initial-concepts',
      id: conceptId,
      data: {
        ...data,
        project, // Ensure project association is maintained
      },
    })

    return NextResponse.json({
      success: true,
      data: updatedConcept,
    })
  } catch (error) {
    console.error('Error updating initial concept:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to update initial concept',
      },
      { status: 500 }
    )
  }
}

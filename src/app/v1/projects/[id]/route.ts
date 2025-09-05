import { getPayload } from 'payload'
import { NextRequest, NextResponse } from 'next/server'
import config from '@payload-config'
import { createCORSPreflightResponse } from '@/lib/cors'

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const payload = await getPayload({ config })

    const project = await payload.findByID({
      collection: 'projects',
      id,
      depth: 2, // Include related data
    })

    if (!project) {
      return NextResponse.json(
        {
          success: false,
          error: 'Project not found',
        },
        { status: 404 },
      )
    }

    return NextResponse.json({
      success: true,
      data: project,
    })
  } catch (error) {
    console.error('Error fetching project:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch project',
      },
      { status: 500 },
    )
  }
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const payload = await getPayload({ config })
    const data = await request.json()

    const project = await payload.update({
      collection: 'projects',
      id,
      data,
    })

    return NextResponse.json({
      success: true,
      data: project,
    })
  } catch (error) {
    console.error('Error updating project:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to update project',
      },
      { status: 500 },
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params
    const payload = await getPayload({ config })

    // Check if project exists
    const project = await payload.findByID({
      collection: 'projects',
      id,
    })

    if (!project) {
      return NextResponse.json(
        {
          success: false,
          error: 'Project not found',
        },
        { status: 404 },
      )
    }

    // Find and delete related fundamental data
    const fundamentalData = await payload.find({
      collection: 'fundamental-data',
      where: {
        project: { equals: id },
      },
    })

    for (const data of fundamentalData.docs) {
      await payload.delete({
        collection: 'fundamental-data',
        id: data.id,
      })
    }

    // Find and delete related stories
    const stories = await payload.find({
      collection: 'stories',
      where: {
        project: { equals: id },
      },
    })

    for (const story of stories.docs) {
      await payload.delete({
        collection: 'stories',
        id: story.id,
      })
    }

    // Delete the project
    await payload.delete({
      collection: 'projects',
      id,
    })

    return NextResponse.json({
      success: true,
      message: 'Project and all related data deleted successfully',
      deletedItems: {
        project: 1,
        fundamentalData: fundamentalData.totalDocs,
        stories: stories.totalDocs,
      },
    })
  } catch (error) {
    console.error('Error deleting project:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to delete project',
      },
      { status: 500 },
    )
  }
}

/**
 * OPTIONS handler for CORS preflight requests
 */
export async function OPTIONS(request: NextRequest) {
  return createCORSPreflightResponse(request)
}

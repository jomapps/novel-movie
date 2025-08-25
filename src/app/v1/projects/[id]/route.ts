import { getPayload } from 'payload'
import { NextRequest, NextResponse } from 'next/server'
import config from '@payload-config'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
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
        { status: 404 }
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
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
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
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const payload = await getPayload({ config })

    await payload.delete({
      collection: 'projects',
      id,
    })

    return NextResponse.json({
      success: true,
      message: 'Project deleted successfully',
    })
  } catch (error) {
    console.error('Error deleting project:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to delete project',
      },
      { status: 500 }
    )
  }
}

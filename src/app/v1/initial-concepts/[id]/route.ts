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

    const initialConcept = await payload.findByID({
      collection: 'initial-concepts',
      id,
      depth: 2, // Include related data
    })

    if (!initialConcept) {
      return NextResponse.json(
        {
          success: false,
          error: 'Initial concept not found',
        },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      data: initialConcept,
    })
  } catch (error) {
    console.error('Error fetching initial concept:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch initial concept',
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

    // Verify the initial concept exists
    const existingConcept = await payload.findByID({
      collection: 'initial-concepts',
      id,
    })

    if (!existingConcept) {
      return NextResponse.json(
        {
          success: false,
          error: 'Initial concept not found',
        },
        { status: 404 }
      )
    }

    const updatedConcept = await payload.update({
      collection: 'initial-concepts',
      id,
      data,
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

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const payload = await getPayload({ config })

    // Verify the initial concept exists
    const existingConcept = await payload.findByID({
      collection: 'initial-concepts',
      id,
    })

    if (!existingConcept) {
      return NextResponse.json(
        {
          success: false,
          error: 'Initial concept not found',
        },
        { status: 404 }
      )
    }

    await payload.delete({
      collection: 'initial-concepts',
      id,
    })

    return NextResponse.json({
      success: true,
      message: 'Initial concept deleted successfully',
    })
  } catch (error) {
    console.error('Error deleting initial concept:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to delete initial concept',
      },
      { status: 500 }
    )
  }
}

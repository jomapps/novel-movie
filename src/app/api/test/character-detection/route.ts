import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const { imageUrl, assetId } = await request.json()

    if (!imageUrl && !assetId) {
      return NextResponse.json({ 
        error: 'Either imageUrl or assetId is required' 
      }, { status: 400 })
    }

    // Test character detection with DINOv3 service
    const dinoResponse = await fetch('http://movie.ft.tc:5000/api/v1/character-matching', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        reference_asset_id: assetId || 'test-asset',
        test_asset_ids: [assetId || 'test-asset'],
        confidence_threshold: 0.7
      })
    })

    if (!dinoResponse.ok) {
      throw new Error(`DINOv3 service error: HTTP ${dinoResponse.status}`)
    }

    const result = await dinoResponse.json()

    return NextResponse.json({
      success: true,
      service: 'DINOv3 Character Detection',
      input: { imageUrl, assetId },
      result,
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    console.error('Character detection test error:', error)
    
    // Return mock result if service is unavailable
    return NextResponse.json({
      success: false,
      service: 'DINOv3 Character Detection',
      error: error instanceof Error ? error.message : 'Unknown error',
      mock_result: {
        character_detected: true,
        confidence: 0.85,
        bounding_boxes: [
          { x: 100, y: 150, width: 200, height: 300, confidence: 0.85 }
        ]
      },
      timestamp: new Date().toISOString()
    }, { status: 200 }) // Return 200 with mock data for testing
  }
}

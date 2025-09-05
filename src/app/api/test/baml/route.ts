import { NextRequest, NextResponse } from 'next/server'
import { b } from '../../../../../baml_client'

export async function POST(request: NextRequest) {
  try {
    const { prompt, function: functionName } = await request.json()

    if (!prompt) {
      return NextResponse.json({ error: 'Prompt is required' }, { status: 400 })
    }

    let result
    
    switch (functionName) {
      case 'GenerateSimpleCorePremise':
        result = await b.GenerateSimpleCorePremise(
          'Test Project',
          'Feature Film',
          'Cinematic',
          null,
          120,
          ['Drama'],
          null
        )
        break

      default:
        // Generic test using a simple function
        result = await b.GenerateSimpleCorePremise(
          'Test Project',
          'Feature Film',
          'Cinematic',
          null,
          120,
          ['Drama'],
          prompt
        )
    }

    return NextResponse.json({
      success: true,
      function: functionName || 'GenerateSimpleCorePremise',
      result,
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    console.error('BAML test error:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    }, { status: 500 })
  }
}

import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'

const openrouter = new OpenAI({
  baseURL: process.env.OPENROUTER_BASE_URL,
  apiKey: process.env.OPENROUTER_API_KEY,
  defaultHeaders: {
    'HTTP-Referer': process.env.SITE_URL || 'https://localhost:3001',
    'X-Title': 'Novel Movie',
  },
})

export async function POST(request: NextRequest) {
  try {
    const { prompt, model = 'anthropic/claude-sonnet-4' } = await request.json()

    if (!prompt) {
      return NextResponse.json({ error: 'Prompt is required' }, { status: 400 })
    }

    const completion = await openrouter.chat.completions.create({
      model,
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.7,
      max_tokens: 100, // Keep it short for testing
    })

    const result = completion.choices[0]?.message?.content

    return NextResponse.json({
      success: true,
      model,
      prompt,
      result,
      usage: completion.usage,
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error('OpenRouter test error:', error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString(),
      },
      { status: 500 },
    )
  }
}

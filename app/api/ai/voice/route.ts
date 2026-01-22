import { NextRequest, NextResponse } from 'next/server'
import { getOpenAIApiKey } from '@/ai/serverEnv'

/**
 * OpenAI TTS API Route
 * 
 * Uses OpenAI's text-to-speech API to generate calm, natural voice output.
 * Voice options are selected for a calm, intelligent, human-like experience.
 */
export const runtime = 'nodejs'

export async function POST(request: NextRequest) {
  try {
    const { text, voice = 'alloy', speed = 1.0 } = await request.json()
    
    if (!text || typeof text !== 'string') {
      return NextResponse.json({ error: 'Text is required' }, { status: 400 })
    }

    const OPENAI_API_KEY = getOpenAIApiKey()
    if (!OPENAI_API_KEY) {
      return NextResponse.json({ error: 'OpenAI API key not configured' }, { status: 500 })
    }

    // OpenAI TTS API endpoint
    const response = await fetch('https://api.openai.com/v1/audio/speech', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'tts-1', // Use tts-1 for faster, or tts-1-hd for higher quality
        input: text,
        voice: voice, // Options: alloy, echo, fable, onyx, nova, shimmer
        speed: Math.max(0.25, Math.min(4.0, speed)), // Clamp speed between 0.25 and 4.0
      }),
    })

    if (!response.ok) {
      const error = await response.text()
      console.error('OpenAI TTS API error:', response.status, error)
      return NextResponse.json(
        { error: 'Failed to generate speech', details: error },
        { status: response.status }
      )
    }

    const audioBuffer = await response.arrayBuffer()
    
    return new NextResponse(audioBuffer, {
      headers: {
        'Content-Type': 'audio/mpeg',
        'Content-Length': audioBuffer.byteLength.toString(),
        'Cache-Control': 'no-cache',
      },
    })
  } catch (error) {
    console.error('TTS error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

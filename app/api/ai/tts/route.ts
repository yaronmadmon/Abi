import { NextRequest, NextResponse } from 'next/server'
import { logger } from '@/lib/logger'

/**
 * ElevenLabs TTS API Route (DISABLED)
 * 
 * This route is kept for future optional use but is currently DISABLED.
 * The app now uses OpenAI TTS as the primary voice engine via /api/ai/voice
 * 
 * To re-enable: Update voiceEngine.ts to use ElevenLabsVoiceEngine
 */
export async function POST(request: NextRequest) {
  try {
    const { text } = await request.json()
    
    if (!text) {
      return NextResponse.json({ error: 'Text is required' }, { status: 400 })
    }

    const ELEVENLABS_API_KEY = process.env.ELEVENLABS_API_KEY
    if (!ELEVENLABS_API_KEY) {
      logger.error('ElevenLabs API key not configured in environment variables')
      return NextResponse.json({ error: 'ElevenLabs API key not configured' }, { status: 500 })
    }

    // Use Rachel voice ID (you can find this in ElevenLabs dashboard)
    // Common Rachel voice ID: "21m00Tcm4TlvDq8ikWAM" (verify in your dashboard)
    const voiceId = process.env.ELEVENLABS_VOICE_ID || "21m00Tcm4TlvDq8ikWAM"
    
    logger.debug('Calling ElevenLabs API', { voiceId, textLength: text.length })
    
    const response = await fetch(
      `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`,
      {
        method: 'POST',
        headers: {
          'Accept': 'audio/mpeg',
          'Content-Type': 'application/json',
          'xi-api-key': ELEVENLABS_API_KEY,
        },
        body: JSON.stringify({
          text: text,
          model_id: 'eleven_monolingual_v1',
          voice_settings: {
            stability: 0.5,
            similarity_boost: 0.75,
          },
        }),
      }
    )

    if (!response.ok) {
      const error = await response.text()
      logger.error('ElevenLabs API error', new Error(error), { status: response.status })
      return NextResponse.json({ error: 'Failed to generate speech', details: error }, { status: response.status })
    }
    
    logger.debug('ElevenLabs API success, generating audio')

    const audioBuffer = await response.arrayBuffer()
    
    return new NextResponse(audioBuffer, {
      headers: {
        'Content-Type': 'audio/mpeg',
        'Content-Length': audioBuffer.byteLength.toString(),
      },
    })
  } catch (error) {
    logger.error('TTS error', error as Error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

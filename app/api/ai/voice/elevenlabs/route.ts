import { NextResponse } from 'next/server'

export const runtime = 'nodejs'

// ElevenLabs voice IDs
const VOICE_IDS: Record<string, string> = {
  Rachel: '21m00Tcm4TlvDq8ikWAM',
  Domi: 'AZnzlk1XvdvUeBnXmlld',
  Bella: 'EXAVITQu4vr4xnSDxMaL',
  Antoni: 'ErXwobaYiN019PkySvjV',
  Elli: 'MF3mGyEYCl7XYWbV9V6O',
  Josh: 'TxGEqnHWrfWFTfGW9XjX',
  Arnold: 'VR6AewLTigWG4xSOukaG',
  Adam: 'pNInz6obpgDQGcFmaJgB',
  Sam: 'yoZ06aMxZJJ28mfd3POQ',
}

export async function POST(request: Request) {
  try {
    const { text, voice = 'Rachel', model = 'eleven_multilingual_v2' } = await request.json()

    if (!text) {
      return NextResponse.json({ error: 'Text is required' }, { status: 400 })
    }

    // Get ElevenLabs API key from environment
    const apiKey = process.env.ELEVENLABS_API_KEY

    if (!apiKey) {
      console.error('ELEVENLABS_API_KEY is not set')
      return NextResponse.json(
        { error: 'ElevenLabs API key not configured' },
        { status: 500 }
      )
    }

    // Get voice ID
    const voiceId = VOICE_IDS[voice] || VOICE_IDS.Rachel

    // Call ElevenLabs API
    const response = await fetch(
      `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`,
      {
        method: 'POST',
        headers: {
          'Accept': 'audio/mpeg',
          'Content-Type': 'application/json',
          'xi-api-key': apiKey,
        },
        body: JSON.stringify({
          text,
          model_id: model,
          voice_settings: {
            stability: 0.5,
            similarity_boost: 0.75,
          },
        }),
      }
    )

    if (!response.ok) {
      const error = await response.text()
      console.error('ElevenLabs TTS error:', response.status, error)
      return NextResponse.json(
        { error: 'ElevenLabs TTS failed', details: error },
        { status: response.status }
      )
    }

    // Get audio data
    const audioBuffer = await response.arrayBuffer()

    // Return audio file
    return new NextResponse(audioBuffer, {
      headers: {
        'Content-Type': 'audio/mpeg',
        'Content-Length': audioBuffer.byteLength.toString(),
      },
    })
  } catch (error) {
    console.error('Error in ElevenLabs TTS route:', error)
    return NextResponse.json(
      { error: 'Failed to generate speech', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}

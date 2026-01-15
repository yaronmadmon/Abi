import { NextRequest, NextResponse } from 'next/server'
import { polishText, type PolishStyle } from '@/ai/textPolisher'

/**
 * AI Text Polishing Endpoint
 * Simple text in → polished text out
 */
export async function POST(request: NextRequest) {
  try {
    const { text, style = 'polish' } = await request.json()

    if (!text || typeof text !== 'string') {
      return NextResponse.json(
        { error: 'Invalid input. Expected a string.' },
        { status: 400 }
      )
    }

    if (!text.trim()) {
      return NextResponse.json({ polished: '' })
    }

    console.log('✨ Polishing text:', text.substring(0, 50) + '...', 'Style:', style);
    const polished = await polishText(text, style as PolishStyle);
    console.log('✅ Polished text:', polished.substring(0, 50) + '...');

    return NextResponse.json({ polished });
  } catch (error) {
    console.error('Text polishing error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to polish text',
        polished: null
      },
      { status: 500 }
    )
  }
}

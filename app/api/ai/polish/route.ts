import { NextRequest, NextResponse } from 'next/server'
import { polishText, type PolishStyle } from '@/ai/textPolisher'
import { logger } from '@/lib/logger'

export const runtime = 'nodejs'

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

    logger.debug('✨ Polishing text', { preview: text.substring(0, 50) + '...', style });
    const polished = await polishText(text, style as PolishStyle);
    logger.debug('✅ Polished text', { preview: polished.substring(0, 50) + '...' });

    return NextResponse.json({ polished });
  } catch (error) {
    logger.error('Text polishing error', error as Error);
    return NextResponse.json(
      { 
        error: 'Failed to polish text',
        polished: null
      },
      { status: 500 }
    )
  }
}

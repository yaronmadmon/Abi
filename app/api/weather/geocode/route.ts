import { NextRequest, NextResponse } from 'next/server'

// Mark route as dynamic since it uses searchParams
export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const query = searchParams.get('q')

    if (!query) {
      return NextResponse.json(
        { error: 'Query parameter "q" is required' },
        { status: 400 }
      )
    }

    // Use OpenWeatherMap geocoding API
    const API_KEY = process.env.OPENWEATHER_API_KEY || process.env.NEXT_PUBLIC_OPENWEATHER_API_KEY

    if (!API_KEY) {
      return NextResponse.json(
        { error: 'OpenWeather API key not configured' },
        { status: 500 }
      )
    }

    const response = await fetch(
      `https://api.openweathermap.org/geo/1.0/direct?q=${encodeURIComponent(query)}&limit=5&appid=${API_KEY}`
    )

    if (!response.ok) {
      throw new Error('Geocoding API error')
    }

    const data = await response.json()

    return NextResponse.json(data)
  } catch (error: any) {
    console.error('Geocoding error:', error)
    return NextResponse.json(
      { error: 'Failed to search location', details: error.message },
      { status: 500 }
    )
  }
}

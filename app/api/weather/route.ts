import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const lat = searchParams.get('lat')
    const lon = searchParams.get('lon')

    if (!lat || !lon) {
      return NextResponse.json(
        { error: 'Latitude and longitude are required' },
        { status: 400 }
      )
    }

    // Use OpenWeatherMap API (free tier)
    // Get API key from environment variable
    const API_KEY = process.env.OPENWEATHER_API_KEY || process.env.NEXT_PUBLIC_OPENWEATHER_API_KEY

    if (!API_KEY) {
      // If no API key, use a free public weather API (wttr.in)
      const response = await fetch(
        `https://wttr.in/?format=j1&lat=${lat}&lon=${lon}`
      )

      if (!response.ok) {
        throw new Error('Weather API error')
      }

      const data = await response.json()
      const current = data.current_condition[0]

      return NextResponse.json({
        temperature: parseInt(current.temp_F),
        condition: current.weatherDesc[0].value,
        description: current.weatherDesc[0].value.toLowerCase(),
        humidity: parseInt(current.humidity),
        windSpeed: parseInt(current.windspeedMiles),
        icon: current.weatherCode,
        location: data.nearest_area[0].areaName[0].value,
      })
    }

    // Use OpenWeatherMap if API key is available
    console.log('🌤️ Fetching weather with OpenWeather API key:', API_KEY ? 'Present' : 'Missing')
    
    const response = await fetch(
      `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=imperial&appid=${API_KEY}`
    )

    if (!response.ok) {
      const errorData = await response.text()
      console.error('OpenWeather API error:', response.status, errorData)
      throw new Error(`OpenWeather API error: ${response.status} - ${errorData}`)
    }

    const data = await response.json()
    console.log('✅ Weather data received:', data.name, data.weather[0].main)

    return NextResponse.json({
      temperature: Math.round(data.main.temp),
      condition: data.weather[0].main,
      description: data.weather[0].description,
      humidity: data.main.humidity,
      windSpeed: Math.round(data.wind.speed || 0),
      icon: data.weather[0].icon,
      location: data.name,
    })
  } catch (error: any) {
    console.error('Weather API error:', error)
    const errorMessage = error?.message || 'Unknown error'
    const errorDetails = error?.response?.statusText || error?.statusText || 'No details'
    
    return NextResponse.json(
      { 
        error: 'Failed to fetch weather data',
        details: errorMessage,
        apiKeyPresent: !!process.env.OPENWEATHER_API_KEY || !!process.env.NEXT_PUBLIC_OPENWEATHER_API_KEY
      },
      { status: 500 }
    )
  }
}

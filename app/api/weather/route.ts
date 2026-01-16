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
    
    // Check if forecast data is requested
    const includeForecast = request.nextUrl.searchParams.get('forecast') === 'true'
    
    // Fetch current weather
    const currentResponse = await fetch(
      `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=imperial&appid=${API_KEY}`
    )

    if (!currentResponse.ok) {
      const errorData = await currentResponse.text()
      console.error('OpenWeather API error:', currentResponse.status, errorData)
      throw new Error(`OpenWeather API error: ${currentResponse.status} - ${errorData}`)
    }

    const currentData = await currentResponse.json()
    console.log('✅ Weather data received:', currentData.name, currentData.weather[0].main)

    const baseResponse = {
      temperature: Math.round(currentData.main.temp),
      condition: currentData.weather[0].main,
      description: currentData.weather[0].description,
      humidity: currentData.main.humidity,
      windSpeed: Math.round(currentData.wind.speed || 0),
      icon: currentData.weather[0].icon,
      location: currentData.name,
      feelsLike: Math.round(currentData.main.feels_like),
      high: Math.round(currentData.main.temp_max),
      low: Math.round(currentData.main.temp_min),
    }

    // If forecast is requested, fetch hourly and 5-day forecast
    if (includeForecast) {
      try {
        const forecastResponse = await fetch(
          `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&units=imperial&appid=${API_KEY}`
        )

        if (forecastResponse.ok) {
          const forecastData = await forecastResponse.json()
          
          // Extract hourly forecast (next 12 hours from list)
          const hourly = forecastData.list.slice(0, 12).map((item: any) => ({
            time: new Date(item.dt * 1000).toLocaleTimeString('en-US', { hour: 'numeric', hour12: true }),
            temperature: Math.round(item.main.temp),
            icon: item.weather[0].icon,
            condition: item.weather[0].main,
            pop: Math.round((item.pop || 0) * 100), // Probability of precipitation
          }))

          // Extract 5-day forecast (one entry per day)
          const dailyMap = new Map()
          forecastData.list.forEach((item: any) => {
            const date = new Date(item.dt * 1000).toISOString().split('T')[0]
            if (!dailyMap.has(date)) {
              dailyMap.set(date, {
                date,
                day: new Date(item.dt * 1000).toLocaleDateString('en-US', { weekday: 'short' }),
                high: Math.round(item.main.temp_max),
                low: Math.round(item.main.temp_min),
                icon: item.weather[0].icon,
                condition: item.weather[0].main,
                pop: Math.round((item.pop || 0) * 100),
              })
            } else {
              // Update high/low for the day
              const existing = dailyMap.get(date)
              existing.high = Math.max(existing.high, Math.round(item.main.temp_max))
              existing.low = Math.min(existing.low, Math.round(item.main.temp_min))
            }
          })

          const daily = Array.from(dailyMap.values()).slice(0, 5)

          return NextResponse.json({
            ...baseResponse,
            hourly,
            daily,
          })
        }
      } catch (forecastError) {
        console.error('Forecast fetch error:', forecastError)
        // Return current weather even if forecast fails
      }
    }

    return NextResponse.json(baseResponse)
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

'use client'

import { useState, useEffect } from 'react'
import { Cloud, CloudRain, Sun, CloudSun, Wind, Droplets, Thermometer } from 'lucide-react'

interface WeatherData {
  temperature: number
  condition: string
  description: string
  humidity: number
  windSpeed: number
  icon: string
}

export default function WeatherCard() {
  const [weather, setWeather] = useState<WeatherData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    loadWeather()
    // Refresh weather every 30 minutes
    const interval = setInterval(loadWeather, 30 * 60 * 1000)
    return () => clearInterval(interval)
  }, [])

  const loadWeather = async () => {
    try {
      setLoading(true)
      setError(null)

      // Try to get user's location
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          async (position) => {
            const { latitude, longitude } = position.coords
            await fetchWeather(latitude, longitude)
          },
          async () => {
            // If geolocation fails, use default location (can be configured)
            // Default to a major city (e.g., New York)
            await fetchWeather(40.7128, -74.0060)
          }
        )
      } else {
        // Fallback to default location
        await fetchWeather(40.7128, -74.0060)
      }
    } catch (err) {
      console.error('Weather error:', err)
      setError('Unable to load weather')
      setLoading(false)
    }
  }

  const fetchWeather = async (lat: number, lon: number) => {
    try {
      // Use our API route to fetch weather (proxies to OpenWeatherMap or wttr.in)
      const response = await fetch(
        `/api/weather?lat=${lat}&lon=${lon}`
      )

      if (!response.ok) {
        throw new Error('Weather API error')
      }

      const data = await response.json()
      
      setWeather({
        temperature: data.temperature,
        condition: data.condition,
        description: data.description,
        humidity: data.humidity,
        windSpeed: data.windSpeed,
        icon: data.icon
      })
    } catch (err) {
      console.error('Weather fetch error:', err)
      setError('Unable to load weather data')
    } finally {
      setLoading(false)
    }
  }

  const getWeatherIcon = (condition: string) => {
    const lower = condition.toLowerCase()
    if (lower.includes('rain') || lower.includes('drizzle')) {
      return <CloudRain className="w-8 h-8 text-blue-500" strokeWidth={1.5} />
    } else if (lower.includes('cloud')) {
      return <Cloud className="w-8 h-8 text-gray-500" strokeWidth={1.5} />
    } else if (lower.includes('clear') || lower.includes('sun')) {
      return <Sun className="w-8 h-8 text-yellow-500" strokeWidth={1.5} />
    } else {
      return <CloudSun className="w-8 h-8 text-gray-400" strokeWidth={1.5} />
    }
  }

  return (
    <div className="glass-card p-5 mb-4">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-lg font-semibold text-gray-900">Weather</h2>
        {loading && (
          <div className="w-4 h-4 border-2 border-gray-300 border-t-blue-500 rounded-full animate-spin"></div>
        )}
      </div>

      {error ? (
        <p className="text-sm text-gray-500">{error}</p>
      ) : weather ? (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {getWeatherIcon(weather.condition)}
              <div>
                <div className="flex items-baseline gap-1">
                  <span className="text-3xl font-bold text-gray-900">{weather.temperature}°</span>
                  <span className="text-sm text-gray-500">F</span>
                </div>
                <p className="text-sm text-gray-600 capitalize">{weather.description}</p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-4 text-xs text-gray-500 pt-2 border-t border-gray-100">
            <div className="flex items-center gap-1">
              <Droplets className="w-3.5 h-3.5" strokeWidth={1.5} />
              <span>{weather.humidity}%</span>
            </div>
            <div className="flex items-center gap-1">
              <Wind className="w-3.5 h-3.5" strokeWidth={1.5} />
              <span>{weather.windSpeed} mph</span>
            </div>
          </div>
        </div>
      ) : (
        <p className="text-sm text-gray-500">Loading weather...</p>
      )}
    </div>
  )
}

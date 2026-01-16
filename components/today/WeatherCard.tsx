'use client'

import { useState, useEffect } from 'react'
import { Cloud, CloudRain, Sun, CloudSun, Wind, Droplets, Thermometer, ChevronDown, ChevronUp } from 'lucide-react'

interface HourlyForecast {
  time: string
  temperature: number
  icon: string
  condition: string
  pop: number // Probability of precipitation
}

interface DailyForecast {
  date: string
  day: string
  high: number
  low: number
  icon: string
  condition: string
  pop: number
}

interface WeatherData {
  temperature: number
  condition: string
  description: string
  humidity: number
  windSpeed: number
  icon: string
  feelsLike?: number
  high?: number
  low?: number
  hourly?: HourlyForecast[]
  daily?: DailyForecast[]
}

export default function WeatherCard() {
  const [weather, setWeather] = useState<WeatherData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isExpanded, setIsExpanded] = useState(false)
  const [currentLocation, setCurrentLocation] = useState<{ lat: number; lon: number } | null>(null)

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

  const fetchWeather = async (lat: number, lon: number, includeForecast: boolean = false) => {
    try {
      // Use our API route to fetch weather (proxies to OpenWeatherMap or wttr.in)
      const response = await fetch(
        `/api/weather?lat=${lat}&lon=${lon}${includeForecast ? '&forecast=true' : ''}`
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
        icon: data.icon,
        feelsLike: data.feelsLike,
        high: data.high,
        low: data.low,
        hourly: data.hourly,
        daily: data.daily,
      })
      
      // Store location for forecast fetching
      setCurrentLocation({ lat, lon })
    } catch (err) {
      console.error('Weather fetch error:', err)
      setError('Unable to load weather data')
    } finally {
      setLoading(false)
    }
  }

  const handleExpand = () => {
    if (!isExpanded && currentLocation && !weather?.hourly) {
      // Fetch forecast data when expanding
      fetchWeather(currentLocation.lat, currentLocation.lon, true)
    }
    setIsExpanded(!isExpanded)
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

  const getWeatherIconFromCode = (iconCode: string) => {
    // OpenWeatherMap icon codes: 01d/01n = clear, 02d/02n = few clouds, etc.
    if (iconCode.includes('01')) return <Sun className="w-5 h-5 text-yellow-500" strokeWidth={1.5} />
    if (iconCode.includes('09') || iconCode.includes('10')) return <CloudRain className="w-5 h-5 text-blue-500" strokeWidth={1.5} />
    if (iconCode.includes('11')) return <CloudRain className="w-5 h-5 text-gray-600" strokeWidth={1.5} />
    if (iconCode.includes('13')) return <Cloud className="w-5 h-5 text-gray-400" strokeWidth={1.5} />
    if (iconCode.includes('50')) return <Cloud className="w-5 h-5 text-gray-500" strokeWidth={1.5} />
    return <CloudSun className="w-5 h-5 text-gray-400" strokeWidth={1.5} />
  }

  return (
    <div className="glass-card mb-4 overflow-hidden transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)]" style={{ maxHeight: isExpanded ? '600px' : 'none' }}>
      <div className="p-5">
        <button
          onClick={handleExpand}
          className="w-full flex items-center justify-between mb-3 group"
        >
          <h2 className="text-lg font-semibold text-gray-900">Weather</h2>
          <div className="flex items-center gap-2">
            {loading && (
              <div className="w-4 h-4 border-2 border-gray-300 border-t-blue-500 rounded-full animate-spin"></div>
            )}
            {!loading && (
              <div className="text-gray-400 group-hover:text-gray-600 transition-colors">
                {isExpanded ? (
                  <ChevronUp className="w-5 h-5" strokeWidth={2} />
                ) : (
                  <ChevronDown className="w-5 h-5" strokeWidth={2} />
                )}
              </div>
            )}
          </div>
        </button>

        {error ? (
          <p className="text-sm text-gray-500">{error}</p>
        ) : weather ? (
          <div className="space-y-3">
            {/* Current Weather - Always Visible */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {getWeatherIcon(weather.condition)}
                <div>
                  <div className="flex items-baseline gap-1">
                    <span className="text-3xl font-bold text-gray-900">{weather.temperature}°</span>
                    <span className="text-sm text-gray-500">F</span>
                  </div>
                  <p className="text-sm text-gray-600 capitalize">{weather.description}</p>
                  {weather.high && weather.low && (
                    <p className="text-xs text-gray-500 mt-0.5">
                      H: {weather.high}° L: {weather.low}°
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Basic Stats - Always Visible */}
            <div className="flex items-center gap-4 text-xs text-gray-500 pt-2 border-t border-gray-100">
              <div className="flex items-center gap-1">
                <Droplets className="w-3.5 h-3.5" strokeWidth={1.5} />
                <span>{weather.humidity}%</span>
              </div>
              <div className="flex items-center gap-1">
                <Wind className="w-3.5 h-3.5" strokeWidth={1.5} />
                <span>{weather.windSpeed} mph</span>
              </div>
              {weather.feelsLike && (
                <div className="flex items-center gap-1">
                  <Thermometer className="w-3.5 h-3.5" strokeWidth={1.5} />
                  <span>Feels like {weather.feelsLike}°</span>
                </div>
              )}
            </div>

            {/* Expanded Content */}
            {isExpanded && (
              <div className="pt-4 border-t border-gray-100 space-y-4 animate-fade-in">
                {/* Hourly Forecast */}
                {weather.hourly && weather.hourly.length > 0 && (
                  <div>
                    <h3 className="text-sm font-medium text-gray-700 mb-2">Hourly Forecast</h3>
                    <div className="overflow-x-auto scrollbar-hide -mx-5 px-5">
                      <div className="flex gap-3 pb-2">
                        {weather.hourly.map((hour, index) => (
                          <div key={index} className="flex-shrink-0 text-center min-w-[60px]">
                            <p className="text-xs text-gray-500 mb-1">{hour.time}</p>
                            <div className="mb-1 flex justify-center">
                              {getWeatherIconFromCode(hour.icon)}
                            </div>
                            <p className="text-sm font-medium text-gray-900">{hour.temperature}°</p>
                            {hour.pop > 0 && (
                              <p className="text-xs text-blue-500 mt-0.5">{hour.pop}%</p>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* 5-Day Forecast */}
                {weather.daily && weather.daily.length > 0 && (
                  <div>
                    <h3 className="text-sm font-medium text-gray-700 mb-2">5-Day Forecast</h3>
                    <div className="space-y-2 max-h-[300px] overflow-y-auto scrollbar-hide">
                      {weather.daily.map((day, index) => (
                        <div key={index} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-b-0">
                          <div className="flex items-center gap-3 flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900 w-12">{day.day}</p>
                            <div className="flex-shrink-0">
                              {getWeatherIconFromCode(day.icon)}
                            </div>
                            {day.pop > 0 && (
                              <p className="text-xs text-blue-500">{day.pop}%</p>
                            )}
                          </div>
                          <div className="flex items-center gap-3 flex-shrink-0">
                            <div className="flex items-center gap-2">
                              <span className="text-sm text-gray-900 font-medium">{day.high}°</span>
                              <span className="text-sm text-gray-500">{day.low}°</span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {(!weather.hourly || weather.hourly.length === 0) && loading && (
                  <div className="text-center py-4">
                    <div className="w-6 h-6 border-2 border-gray-300 border-t-blue-500 rounded-full animate-spin mx-auto mb-2"></div>
                    <p className="text-xs text-gray-500">Loading forecast...</p>
                  </div>
                )}
              </div>
            )}
          </div>
        ) : (
          <p className="text-sm text-gray-500">Loading weather...</p>
        )}
      </div>
    </div>
  )
}

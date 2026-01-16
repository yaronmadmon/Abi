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
  const [currentLocation, setCurrentLocation] = useState<{ lat: number; lon: number; name?: string } | null>(null)
  const [locationName, setLocationName] = useState<string | null>(null)
  const [showLocationInput, setShowLocationInput] = useState(false)
  const [manualLocation, setManualLocation] = useState('')

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

      // Check if user has a saved location preference
      const savedLocation = localStorage.getItem('weatherLocation')
      if (savedLocation) {
        try {
          const { lat, lon, name } = JSON.parse(savedLocation)
          await fetchWeather(lat, lon, false, name)
          return
        } catch (e) {
          console.error('Error loading saved location:', e)
        }
      }

      // Try to get user's location with better options
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          async (position) => {
            const { latitude, longitude } = position.coords
            console.log('📍 Location detected:', latitude, longitude)
            await fetchWeather(latitude, longitude)
          },
          async (error) => {
            console.warn('Geolocation error:', error.message)
            // If geolocation fails, try to get location from IP or use a sensible default
            // For now, we'll show an error and let user know they can set location manually
            setError('Location access denied. Using default location.')
            // Try to get approximate location from IP via a geolocation service
            try {
              const ipResponse = await fetch('https://ipapi.co/json/')
              if (ipResponse.ok) {
                const ipData = await ipResponse.json()
                if (ipData.latitude && ipData.longitude) {
                  console.log('📍 Using IP-based location:', ipData.latitude, ipData.longitude)
                  await fetchWeather(ipData.latitude, ipData.longitude, false, ipData.city || ipData.region)
                  return
                }
              }
            } catch (ipError) {
              console.error('IP geolocation failed:', ipError)
            }
            // Final fallback - but we should let user know
            setError('Unable to detect location. Please allow location access or set a location manually.')
            await fetchWeather(40.7128, -74.0060, false, 'New York, NY')
          },
          {
            enableHighAccuracy: true,
            timeout: 10000,
            maximumAge: 300000 // 5 minutes
          }
        )
      } else {
        // Fallback to default location
        setError('Geolocation not supported. Using default location.')
        await fetchWeather(40.7128, -74.0060, false, 'New York, NY')
      }
    } catch (err) {
      console.error('Weather error:', err)
      setError('Unable to load weather')
      setLoading(false)
    }
  }

  const fetchWeather = async (lat: number, lon: number, includeForecast: boolean = false, locationName?: string) => {
    try {
      // Use our API route to fetch weather (proxies to OpenWeatherMap or wttr.in)
      const response = await fetch(
        `/api/weather?lat=${lat}&lon=${lon}${includeForecast ? '&forecast=true' : ''}`
      )

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.error || 'Weather API error')
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
      const location = { lat, lon, name: locationName || data.location || null }
      setCurrentLocation(location)
      setLocationName(locationName || data.location || null)
      
      // Clear error if we successfully got weather
      if (error) {
        setError(null)
      }
    } catch (err: any) {
      console.error('Weather fetch error:', err)
      setError(err.message || 'Unable to load weather data')
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

  const handleManualLocation = async () => {
    if (!manualLocation.trim()) return
    
    try {
      setLoading(true)
      setError(null)
      
      // Use our geocoding API route
      const geoResponse = await fetch(
        `/api/weather/geocode?q=${encodeURIComponent(manualLocation.trim())}`
      )
      
      if (!geoResponse.ok) {
        throw new Error('Location not found')
      }
      
      const geoData = await geoResponse.json()
      if (!geoData || geoData.length === 0) {
        throw new Error('Location not found. Try "City, Country" format.')
      }
      
      const { lat, lon, name, state, country } = geoData[0]
      const locationDisplay = state ? `${name}, ${state}, ${country}` : `${name}, ${country}`
      
      // Save location preference
      localStorage.setItem('weatherLocation', JSON.stringify({ lat, lon, name: locationDisplay }))
      
      await fetchWeather(lat, lon, false, locationDisplay)
      setShowLocationInput(false)
      setManualLocation('')
    } catch (err: any) {
      console.error('Location search error:', err)
      setError(err.message || 'Could not find location')
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
        <div className="mb-3">
          <button
            onClick={handleExpand}
            className="w-full flex items-center justify-between group"
          >
            <div className="flex-1">
              <h2 className="text-lg font-semibold text-gray-900">Weather</h2>
            </div>
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
          {locationName && (
            <div className="flex items-center gap-2 mt-0.5">
              <p className="text-xs text-gray-500">{locationName}</p>
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  setShowLocationInput(true)
                }}
                className="text-xs text-blue-600 hover:text-blue-700 underline"
                title="Change location"
              >
                Change
              </button>
            </div>
          )}
          {error && !weather && (
            <button
              onClick={(e) => {
                e.stopPropagation()
                setShowLocationInput(true)
              }}
              className="text-xs text-blue-600 hover:text-blue-700 underline mt-1"
            >
              Set location manually
            </button>
          )}
        </div>

        {showLocationInput && (
          <div className="mb-4 p-3 bg-gray-50 rounded-lg space-y-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Enter location (e.g., "New York, NY" or "London, UK")
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={manualLocation}
                onChange={(e) => setManualLocation(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    handleManualLocation()
                  }
                }}
                placeholder="City, State/Country"
                className="flex-1 px-3 py-2 text-sm rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                autoFocus
              />
              <button
                onClick={handleManualLocation}
                disabled={!manualLocation.trim() || loading}
                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
              >
                Set
              </button>
              <button
                onClick={() => {
                  setShowLocationInput(false)
                  setManualLocation('')
                }}
                className="px-3 py-2 text-gray-600 hover:text-gray-800 text-sm"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {error && !weather ? (
          <div className="space-y-2">
            <p className="text-sm text-red-600">{error}</p>
            <div className="flex gap-3">
              <button
                onClick={loadWeather}
                className="text-xs text-blue-600 hover:text-blue-700 underline"
              >
                Try again
              </button>
              <button
                onClick={() => setShowLocationInput(true)}
                className="text-xs text-blue-600 hover:text-blue-700 underline"
              >
                Set location manually
              </button>
            </div>
          </div>
        ) : error && weather ? (
          <p className="text-xs text-amber-600 mb-2">{error}</p>
        ) : null}
        
        {weather ? (
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

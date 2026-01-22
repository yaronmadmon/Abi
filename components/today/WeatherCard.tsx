'use client'

import { useState, useEffect, memo } from 'react'
import { Cloud, CloudRain, Sun, CloudSun, Wind, Droplets, Thermometer } from 'lucide-react'
import WeatherForecastModal from '@/components/weather/WeatherForecastModal'
import { FeatureErrorBoundary } from '@/components/errors/FeatureErrorBoundary'
import { logger } from '@/lib/logger'

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

// Memoized because: Prevents re-renders when parent Today page updates,
// expensive operations: API calls, date calculations, geolocation.
// Remove memo if: Component moves to isolated page with no parent re-renders.
const WeatherCardContent = memo(function WeatherCardContent() {
  const [weather, setWeather] = useState<WeatherData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showModal, setShowModal] = useState(false)
  const [currentLocation, setCurrentLocation] = useState<{ lat: number; lon: number; name?: string } | null>(null)
  const [locationName, setLocationName] = useState<string | null>(null)
  const [showLocationInput, setShowLocationInput] = useState(false)
  const [manualLocation, setManualLocation] = useState('')

  useEffect(() => {
    loadWeather()
    // Refresh weather every 30 minutes
    const interval = setInterval(loadWeather, 30 * 60 * 1000)
    return () => clearInterval(interval)
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
          logger.error('Error loading saved location', e as Error)
        }
      }

      // Try to get user's location with better options
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          async (position) => {
            const { latitude, longitude } = position.coords
            logger.debug('Location detected', { latitude, longitude })
            await fetchWeather(latitude, longitude)
          },
          async (error) => {
            logger.warn('Geolocation error', { message: error.message })
            // If geolocation fails, try to get location from IP or use a sensible default
            // For now, we'll show an error and let user know they can set location manually
            setError('Location access denied. Using default location.')
            // Try to get approximate location from IP via a geolocation service
            try {
              const ipResponse = await fetch('https://ipapi.co/json/')
              if (ipResponse.ok) {
                const ipData = await ipResponse.json()
                if (ipData.latitude && ipData.longitude) {
                  logger.debug('Using IP-based location', { latitude: ipData.latitude, longitude: ipData.longitude, location: ipData.city || ipData.region })
                  await fetchWeather(ipData.latitude, ipData.longitude, false, ipData.city || ipData.region)
                  return
                }
              }
            } catch (ipError) {
              logger.error('IP geolocation failed', ipError as Error)
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
      logger.error('Weather error', err as Error)
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
        // Handle 503 (API not configured) specially
        if (response.status === 503) {
          throw new Error('Weather service not configured. Add OPENWEATHER_API_KEY to enable weather features.')
        }
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

  const handleCardClick = () => {
    if (!weather) return
    // Fetch forecast data if not already loaded
    if (currentLocation && !weather?.hourly) {
      fetchWeather(currentLocation.lat, currentLocation.lon, true)
    }
    setShowModal(true)
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
      logger.error('Location search error', err as Error)
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
    <>
      <div className="glass-card mb-4 overflow-hidden transition-all duration-200">
        {/* Location Input Section */}
        {showLocationInput && (
          <div className="p-4 bg-gray-50 border-b border-gray-200">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Enter location (e.g., &quot;New York, NY&quot; or &quot;London, UK&quot;)
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

        {/* Main Weather Card - Clickable */}
        <button 
          onClick={handleCardClick}
          disabled={!weather || loading}
          className="w-full text-left p-5 hover:bg-gray-50/50 transition-colors disabled:cursor-not-allowed"
        >
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">Weather</h2>
            {loading && (
              <div className="w-4 h-4 border-2 border-gray-300 border-t-blue-500 rounded-full animate-spin"></div>
            )}
          </div>

          {locationName && (
            <div className="flex items-center gap-2 mb-3">
              <p className="text-xs text-gray-500">{locationName}</p>
              <span
                onClick={(e) => {
                  e.stopPropagation()
                  setShowLocationInput(true)
                }}
                className="text-xs text-blue-600 hover:text-blue-700 underline cursor-pointer"
                role="button"
                tabIndex={0}
                onKeyPress={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.stopPropagation()
                    setShowLocationInput(true)
                  }
                }}
                title="Change location"
              >
                Change
              </span>
            </div>
          )}

          {error && !weather ? (
            <div className="space-y-2">
              <p className="text-sm text-red-600">{error}</p>
              <div className="flex gap-3">
                <span
                  onClick={(e) => {
                    e.stopPropagation()
                    loadWeather()
                  }}
                  className="text-xs text-blue-600 hover:text-blue-700 underline cursor-pointer"
                  role="button"
                  tabIndex={0}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.stopPropagation()
                      loadWeather()
                    }
                  }}
                >
                  Try again
                </span>
                <span
                  onClick={(e) => {
                    e.stopPropagation()
                    setShowLocationInput(true)
                  }}
                  className="text-xs text-blue-600 hover:text-blue-700 underline cursor-pointer"
                  role="button"
                  tabIndex={0}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.stopPropagation()
                      setShowLocationInput(true)
                    }
                  }}
                >
                  Set location manually
                </span>
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

              <p className="text-xs text-blue-600 mt-3 font-medium">Click for detailed forecast →</p>
            </div>
          ) : (
            <p className="text-sm text-gray-500">Loading weather...</p>
          )}
        </button>
      </div>

      {/* Weather Forecast Modal */}
      {showModal && weather && (
        <WeatherForecastModal
          weather={weather}
          locationName={locationName}
          onClose={() => setShowModal(false)}
          isLoading={loading}
        />
      )}
    </>
  )
})

export default function WeatherCard() {
  return (
    <FeatureErrorBoundary featureName="Weather">
      <WeatherCardContent />
    </FeatureErrorBoundary>
  )
}

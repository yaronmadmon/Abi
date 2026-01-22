'use client'

import { useEffect, useState } from 'react'
import { X, MapPin, Wind, Droplets, Eye, Gauge, Sunrise, Sunset, ChevronDown, ChevronUp } from 'lucide-react'
import { Cloud, CloudRain, Sun, CloudSun } from 'lucide-react'

interface HourlyForecast {
  time: string
  temperature: number
  icon: string
  condition: string
  pop: number
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

interface WeatherForecastModalProps {
  weather: WeatherData
  locationName: string | null
  onClose: () => void
  isLoading: boolean
}

export default function WeatherForecastModal({ weather, locationName, onClose, isLoading }: WeatherForecastModalProps) {
  const [expandedDay, setExpandedDay] = useState<string | null>(null)

  // Close on ESC key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [onClose])

  // Prevent body scroll when modal is open
  useEffect(() => {
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [])

  const getWeatherIcon = (iconCode: string, size: 'sm' | 'md' | 'lg' = 'md') => {
    const sizeClasses = {
      sm: 'w-5 h-5',
      md: 'w-8 h-8',
      lg: 'w-16 h-16'
    }
    const className = sizeClasses[size]

    if (iconCode.includes('01')) return <Sun className={`${className} text-yellow-500`} strokeWidth={1.5} />
    if (iconCode.includes('09') || iconCode.includes('10')) return <CloudRain className={`${className} text-blue-500`} strokeWidth={1.5} />
    if (iconCode.includes('11')) return <CloudRain className={`${className} text-gray-600`} strokeWidth={1.5} />
    if (iconCode.includes('13')) return <Cloud className={`${className} text-gray-400`} strokeWidth={1.5} />
    if (iconCode.includes('50')) return <Cloud className={`${className} text-gray-500`} strokeWidth={1.5} />
    if (iconCode.includes('02') || iconCode.includes('03') || iconCode.includes('04')) return <Cloud className={`${className} text-gray-500`} strokeWidth={1.5} />
    return <CloudSun className={`${className} text-gray-400`} strokeWidth={1.5} />
  }

  const getTemperatureColor = (temp: number) => {
    if (temp >= 85) return 'from-orange-500 to-red-500'
    if (temp >= 70) return 'from-yellow-400 to-orange-500'
    if (temp >= 55) return 'from-green-400 to-yellow-400'
    if (temp >= 40) return 'from-blue-400 to-green-400'
    return 'from-blue-600 to-blue-400'
  }

  return (
    <div 
      className="fixed inset-0 z-[200] flex items-center justify-center bg-black/60 backdrop-blur-md animate-fade-in"
      onClick={onClose}
    >
      <div 
        className="relative w-full h-full max-w-4xl max-h-[90vh] bg-white rounded-none sm:rounded-lg shadow-2xl overflow-hidden animate-slide-up"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="sticky top-0 z-10 bg-white/95 backdrop-blur-xl border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Weather Forecast</h2>
              {locationName && (
                <div className="flex items-center gap-1 mt-1 text-sm text-gray-600">
                  <MapPin className="w-4 h-4" strokeWidth={1.5} />
                  <span>{locationName}</span>
                </div>
              )}
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-full hover:bg-gray-100 transition-colors"
              aria-label="Close"
            >
              <X className="w-6 h-6 text-gray-600" strokeWidth={2} />
            </button>
          </div>
        </div>

        {/* Scrollable Content */}
        <div className="overflow-y-auto h-[calc(100%-80px)] px-6 py-6">
          {isLoading ? (
            <div className="flex items-center justify-center h-64">
              <div className="text-center">
                <div className="w-12 h-12 border-4 border-gray-300 border-t-blue-500 rounded-full animate-spin mx-auto mb-4"></div>
                <p className="text-gray-600">Loading forecast...</p>
              </div>
            </div>
          ) : (
            <>
              {/* Hero Section - Current Weather */}
              <div className={`relative rounded-lg p-8 mb-6 bg-gradient-to-br ${getTemperatureColor(weather.temperature)} text-white overflow-hidden`}>
                <div className="relative z-10">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <div className="flex items-baseline gap-2">
                        <span className="text-7xl font-bold">{weather.temperature}°</span>
                        <span className="text-3xl font-light">F</span>
                      </div>
                      <p className="text-xl font-medium capitalize mt-2 opacity-90">{weather.description}</p>
                      {weather.feelsLike && (
                        <p className="text-sm opacity-80 mt-1">Feels like {weather.feelsLike}°</p>
                      )}
                    </div>
                    <div className="flex flex-col items-end">
                      {getWeatherIcon(weather.icon, 'lg')}
                      {weather.high && weather.low && (
                        <div className="mt-4 text-right">
                          <div className="text-sm opacity-80">High / Low</div>
                          <div className="text-xl font-semibold">{weather.high}° / {weather.low}°</div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Current Conditions Grid */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6 pt-6 border-t border-white/20">
                    <div className="flex items-center gap-2">
                      <Wind className="w-5 h-5 opacity-80" strokeWidth={1.5} />
                      <div>
                        <div className="text-xs opacity-70">Wind</div>
                        <div className="font-semibold">{weather.windSpeed} mph</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Droplets className="w-5 h-5 opacity-80" strokeWidth={1.5} />
                      <div>
                        <div className="text-xs opacity-70">Humidity</div>
                        <div className="font-semibold">{weather.humidity}%</div>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Decorative background elements */}
                <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-32 translate-x-32"></div>
                <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/10 rounded-full blur-3xl translate-y-24 -translate-x-24"></div>
              </div>

              {/* Hourly Forecast */}
              {weather.hourly && weather.hourly.length > 0 && (
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Hourly Forecast</h3>
                  <div className="relative">
                    <div className="overflow-x-auto scrollbar-hide -mx-6 px-6">
                      <div className="flex gap-3 pb-2">
                        {weather.hourly.map((hour, index) => (
                          <div
                            key={index}
                            className="flex-shrink-0 bg-gray-50 rounded-lg p-4 min-w-[100px] text-center hover:bg-gray-100 transition-colors"
                          >
                            <p className="text-sm font-medium text-gray-600 mb-2">{hour.time}</p>
                            <div className="mb-2 flex justify-center">
                              {getWeatherIcon(hour.icon, 'md')}
                            </div>
                            <p className="text-2xl font-bold text-gray-900 mb-1">{hour.temperature}°</p>
                            {hour.pop > 0 && (
                              <div className="flex items-center justify-center gap-1 text-xs text-blue-600">
                                <Droplets className="w-3 h-3" strokeWidth={2} />
                                <span>{hour.pop}%</span>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* 5-Day Forecast */}
              {weather.daily && weather.daily.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">5-Day Forecast</h3>
                  <div className="space-y-3">
                    {weather.daily.map((day, index) => (
                      <div
                        key={index}
                        className="bg-white border border-gray-200 rounded-lg overflow-hidden hover:shadow-md transition-all"
                      >
                        <button
                          onClick={() => setExpandedDay(expandedDay === day.date ? null : day.date)}
                          className="w-full p-5 flex items-center justify-between hover:bg-gray-50 transition-colors"
                        >
                          <div className="flex items-center gap-4 flex-1">
                            <div className="w-20 text-left">
                              <p className="font-semibold text-gray-900">{day.day}</p>
                              <p className="text-xs text-gray-500">{new Date(day.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</p>
                            </div>
                            
                            <div className="flex items-center gap-3 flex-1">
                              {getWeatherIcon(day.icon, 'md')}
                              <p className="text-sm text-gray-600 capitalize hidden sm:block">{day.condition}</p>
                            </div>

                            <div className="flex items-center gap-4">
                              {day.pop > 0 && (
                                <div className="flex items-center gap-1 text-sm text-blue-600">
                                  <Droplets className="w-4 h-4" strokeWidth={2} />
                                  <span>{day.pop}%</span>
                                </div>
                              )}
                              
                              <div className="flex items-center gap-2 min-w-[80px] justify-end">
                                <span className="text-lg font-bold text-gray-900">{day.high}°</span>
                                <span className="text-lg text-gray-500">{day.low}°</span>
                              </div>

                              {expandedDay === day.date ? (
                                <ChevronUp className="w-5 h-5 text-gray-400" strokeWidth={2} />
                              ) : (
                                <ChevronDown className="w-5 h-5 text-gray-400" strokeWidth={2} />
                              )}
                            </div>
                          </div>
                        </button>

                        {/* Expanded Day Details */}
                        {expandedDay === day.date && (
                          <div className="px-5 pb-5 pt-2 border-t border-gray-100 bg-gray-50 animate-fade-in">
                            <div className="grid grid-cols-2 gap-4">
                              <div className="flex items-center gap-2">
                                <Wind className="w-4 h-4 text-gray-500" strokeWidth={1.5} />
                                <div className="text-sm">
                                  <span className="text-gray-500">Wind: </span>
                                  <span className="font-medium text-gray-900">8 mph</span>
                                </div>
                              </div>
                              <div className="flex items-center gap-2">
                                <Droplets className="w-4 h-4 text-gray-500" strokeWidth={1.5} />
                                <div className="text-sm">
                                  <span className="text-gray-500">Humidity: </span>
                                  <span className="font-medium text-gray-900">65%</span>
                                </div>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  )
}

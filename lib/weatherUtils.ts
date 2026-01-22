/**
 * Weather utility functions for processing and formatting weather data
 */

interface ForecastDataPoint {
  dt: number
  main: {
    temp: number
    temp_max: number
    temp_min: number
    humidity: number
  }
  weather: Array<{
    main: string
    description: string
    icon: string
  }>
  wind?: {
    speed: number
  }
  pop?: number
}

interface DailyStats {
  date: string
  day: string
  high: number
  low: number
  avgTemp: number
  icon: string
  condition: string
  pop: number
  humidity: number
  windSpeed: number
}

interface HourlyForecast {
  time: string
  temperature: number
  icon: string
  condition: string
  pop: number
}

/**
 * Group forecast data points by day
 */
export function groupForecastByDay(forecastList: ForecastDataPoint[]): Map<string, ForecastDataPoint[]> {
  const grouped = new Map<string, ForecastDataPoint[]>()
  
  forecastList.forEach((item) => {
    const date = new Date(item.dt * 1000).toISOString().split('T')[0]
    if (!grouped.has(date)) {
      grouped.set(date, [])
    }
    grouped.get(date)!.push(item)
  })
  
  return grouped
}

/**
 * Extract next 24 hours of forecast data
 */
export function getHourlyForecast(forecastList: ForecastDataPoint[], count: number = 8): HourlyForecast[] {
  return forecastList.slice(0, count).map((item) => ({
    time: new Date(item.dt * 1000).toLocaleTimeString('en-US', { 
      hour: 'numeric', 
      hour12: true 
    }),
    temperature: Math.round(item.main.temp),
    icon: item.weather[0].icon,
    condition: item.weather[0].main,
    pop: Math.round((item.pop || 0) * 100),
  }))
}

/**
 * Calculate comprehensive statistics for a day
 */
export function calculateDayStats(dataPoints: ForecastDataPoint[], date: string): DailyStats {
  const temps = dataPoints.map(p => p.main.temp)
  const high = Math.round(Math.max(...temps))
  const low = Math.round(Math.min(...temps))
  const avgTemp = Math.round(temps.reduce((a, b) => a + b, 0) / temps.length)
  
  // Find the most common weather condition
  const conditions = dataPoints.map(p => p.weather[0].main)
  const conditionCounts = conditions.reduce((acc, cond) => {
    acc[cond] = (acc[cond] || 0) + 1
    return acc
  }, {} as Record<string, number>)
  const mostCommonCondition = Object.entries(conditionCounts)
    .sort(([, a], [, b]) => b - a)[0][0]
  
  // Find icon for midday (most representative)
  const middayIndex = Math.floor(dataPoints.length / 2)
  const icon = dataPoints[middayIndex].weather[0].icon
  
  // Calculate max precipitation probability
  const maxPop = Math.round(Math.max(...dataPoints.map(p => (p.pop || 0) * 100)))
  
  // Average humidity and wind
  const avgHumidity = Math.round(
    dataPoints.reduce((sum, p) => sum + p.main.humidity, 0) / dataPoints.length
  )
  const avgWindSpeed = Math.round(
    dataPoints.reduce((sum, p) => sum + (p.wind?.speed || 0), 0) / dataPoints.length
  )
  
  return {
    date,
    day: new Date(date).toLocaleDateString('en-US', { weekday: 'short' }),
    high,
    low,
    avgTemp,
    icon,
    condition: mostCommonCondition,
    pop: maxPop,
    humidity: avgHumidity,
    windSpeed: avgWindSpeed,
  }
}

/**
 * Get temperature gradient color class based on temperature
 */
export function getTemperatureGradient(temp: number): string {
  if (temp >= 85) return 'from-orange-500 to-red-500'
  if (temp >= 75) return 'from-yellow-400 to-orange-500'
  if (temp >= 65) return 'from-green-400 to-yellow-400'
  if (temp >= 50) return 'from-blue-400 to-green-400'
  if (temp >= 35) return 'from-blue-500 to-blue-400'
  return 'from-blue-600 to-purple-500'
}

/**
 * Get weather condition description with emoji
 */
export function getWeatherEmoji(condition: string): string {
  const lower = condition.toLowerCase()
  if (lower.includes('clear') || lower.includes('sun')) return '☀️'
  if (lower.includes('cloud')) return '☁️'
  if (lower.includes('rain')) return '🌧️'
  if (lower.includes('snow')) return '❄️'
  if (lower.includes('thunder')) return '⛈️'
  if (lower.includes('mist') || lower.includes('fog')) return '🌫️'
  return '🌤️'
}

/**
 * Format timestamp to readable time
 */
export function formatTime(timestamp: number): string {
  return new Date(timestamp * 1000).toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  })
}

/**
 * Format date to readable format
 */
export function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  })
}

/**
 * Get wind direction from degrees
 */
export function getWindDirection(degrees: number): string {
  const directions = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW']
  const index = Math.round(degrees / 45) % 8
  return directions[index]
}

/**
 * Determine if it's daytime based on icon code
 */
export function isDaytime(iconCode: string): boolean {
  return iconCode.endsWith('d')
}

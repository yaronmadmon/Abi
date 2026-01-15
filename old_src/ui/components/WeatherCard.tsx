/**
 * Weather Card Component
 * Displays current weather information
 */

import { useState, useEffect } from 'react';
import './WeatherCard.css';

interface WeatherData {
  temperature: number;
  condition: string;
  icon: string;
  location?: string;
  high?: number;
  low?: number;
}

export function WeatherCard() {
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // In production, this would fetch from a weather API
    // For now, use mock data
    const mockWeather: WeatherData = {
      temperature: 72,
      condition: 'Sunny',
      icon: '☀️',
      location: 'Your Location',
      high: 75,
      low: 68,
    };

    // Simulate API call
    setTimeout(() => {
      setWeather(mockWeather);
      setLoading(false);
    }, 500);
  }, []);

  if (loading) {
    return (
      <div className="weather-card">
        <div className="weather-card__loading">Loading weather...</div>
      </div>
    );
  }

  if (!weather) {
    return null;
  }

  return (
    <div className="weather-card">
      <div className="weather-card__header">
        <div className="weather-card__icon">{weather.icon}</div>
        <div className="weather-card__temp">
          <span className="weather-card__temp-value">{weather.temperature}°</span>
          <span className="weather-card__temp-unit">F</span>
        </div>
      </div>
      <div className="weather-card__body">
        <div className="weather-card__condition">{weather.condition}</div>
        {weather.location && (
          <div className="weather-card__location">{weather.location}</div>
        )}
        {weather.high && weather.low && (
          <div className="weather-card__range">
            H: {weather.high}° L: {weather.low}°
          </div>
        )}
      </div>
    </div>
  );
}

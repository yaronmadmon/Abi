# Weather API Setup

## Current Issue

The weather component is showing errors because the OpenWeather API key is not configured.

## Quick Fix - Get a Free API Key

### 1. Sign up for OpenWeatherMap (Free)

1. Go to https://openweathermap.org/api
2. Click "Sign Up" (top right)
3. Create a free account
4. Verify your email

### 2. Get Your API Key

1. Log in to your account
2. Go to https://home.openweathermap.org/api_keys
3. Copy your API key (it looks like: `abc123def456...`)
4. **Note**: New API keys take 10-60 minutes to activate

### 3. Add to Your Project

1. Open your `.env.local` file
2. Add this line (replace with your actual key):
   ```
   OPENWEATHER_API_KEY=your_api_key_here
   ```
3. Save the file
4. **Restart your dev server** (important!)

### 4. Restart Dev Server

```bash
# Press Ctrl+C in your terminal to stop the server
# Then run:
npm run dev
```

## Alternative: Disable Weather Component

If you don't want weather features, you can comment out the WeatherCard in the Today page:

1. Open `app/today/page.tsx`
2. Find `<WeatherCard />`
3. Comment it out: `{/* <WeatherCard /> */}`

## Testing

Once configured, refresh http://localhost:3000/today and the weather should load automatically based on your location (you'll need to allow location access in your browser).

## Free Tier Limits

OpenWeatherMap free tier includes:
- 1,000 API calls per day
- Current weather data
- 5-day forecast
- More than enough for development!

## Troubleshooting

- **Still showing errors after adding key**: Wait 10-60 minutes for key activation
- **Weather not loading**: Check browser console for specific error
- **Location denied**: Click "Set location manually" to enter a city

'use client'

import { useState, useEffect } from 'react'

export default function GreetingHeader() {
  const [greeting, setGreeting] = useState('')

  useEffect(() => {
    const updateGreeting = () => {
      const hour = new Date().getHours()
      if (hour >= 5 && hour < 12) {
        setGreeting('Good morning')
      } else if (hour >= 12 && hour < 17) {
        setGreeting('Good afternoon')
      } else {
        setGreeting('Good evening')
      }
    }

    updateGreeting()
    // Update every minute to catch hour changes
    const interval = setInterval(updateGreeting, 60000)
    return () => clearInterval(interval)
  }, [])

  if (!greeting) return null

  return (
    <div className="mb-2">
      <h1 className="text-3xl font-bold text-gray-900 animate-fade-in">
        {greeting}
      </h1>
      <p className="text-sm text-gray-500 mt-1 animate-fade-in" style={{ animationDelay: '100ms' }}>
        {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
      </p>
    </div>
  )
}

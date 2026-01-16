'use client'

import { useState, useEffect } from 'react'

export function useEveningMode() {
  const [isEveningMode, setIsEveningMode] = useState(false)

  useEffect(() => {
    const checkEveningMode = () => {
      const hour = new Date().getHours()
      // Evening mode activates at 5 PM (17:00)
      const shouldBeEvening = hour >= 17
      setIsEveningMode(shouldBeEvening)

      // Apply/remove class to document root
      if (shouldBeEvening) {
        document.documentElement.classList.add('evening-mode')
      } else {
        document.documentElement.classList.remove('evening-mode')
      }
    }

    // Check immediately
    checkEveningMode()

    // Check every minute to catch the 5 PM transition
    const interval = setInterval(checkEveningMode, 60000)

    return () => {
      clearInterval(interval)
      document.documentElement.classList.remove('evening-mode')
    }
  }, [])

  return isEveningMode
}

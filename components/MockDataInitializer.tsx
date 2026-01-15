'use client'

import { useEffect } from 'react'
import { initializeMockData } from '@/lib/mockData'

export default function MockDataInitializer() {
  useEffect(() => {
    initializeMockData()
  }, [])

  return null
}

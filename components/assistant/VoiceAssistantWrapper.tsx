'use client'

import { useRouter } from 'next/navigation'
import AIChatConsole from '@/components/AIChatConsole'

/**
 * AI Chat Console Wrapper
 * 
 * This is the CENTRAL AI BRAIN for the app.
 * Replaces VoiceAssistant - now uses the new AIChatConsole with:
 * - Push-to-talk voice (no auto-sending)
 * - 4 modes: idle, typing, listening, preview
 * - Multimodal input (+ button)
 * - Clean conversation history
 * - Context-aware (sees app state)
 */

export default function VoiceAssistantWrapper() {
  const router = useRouter()

  const handleAction = (route: string, payload: any) => {
    // Handle action completion - refresh the current page to show updates
    router.refresh()
    
    // Optionally navigate to specific routes based on action type
    if (route === 'meals') {
      router.push('/dashboard/meals')
    } else if (route === 'shopping') {
      router.push('/dashboard/shopping')
    } else if (route === 'tasks') {
      router.push('/dashboard/tasks')
    }
  }

  const handleError = (error: string) => {
    console.error('AI Chat Console Error:', error)
  }

  // AIChatConsole manages its own open/close state via floating button
  return <AIChatConsole onIntent={handleAction} onError={handleError} />
}

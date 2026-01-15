'use client'

import { useRouter } from 'next/navigation'
import VoiceAssistant from './VoiceAssistant'

export default function VoiceAssistantWrapper() {
  const router = useRouter()

  const handleAction = (route: string, payload: any) => {
    // Handle action completion - refresh the current page to show updates
    // The action has already been executed by the VoiceAssistant component
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
    console.error('Voice Assistant Error:', error)
    // You could show a toast notification here if you have one
  }

  return <VoiceAssistant onAction={handleAction} onError={handleError} />
}

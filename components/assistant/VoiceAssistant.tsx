'use client'

import { useState, useEffect, useRef } from 'react'
import { Mic, MicOff, Square, CheckCircle2 } from 'lucide-react'
import { speak, cancelSpeech } from '@/ai/voiceEngine'
import type { ActionIntent } from '@/ai/schemas/actionIntentSchema'
import type { AIIntent } from '@/ai/schemas/intentSchema'
import { routeIntent } from '@/ai/aiRouter'

type AssistantState = 'idle' | 'listening' | 'thinking' | 'awaiting_confirmation' | 'completed'

interface VoiceAssistantProps {
  onAction: (action: string, payload: any) => void
  onError?: (error: string) => void
}

interface PendingAction {
  intent: ActionIntent
  routerResult: any | null
  humanReadable: string
}

export default function VoiceAssistant({ onAction, onError }: VoiceAssistantProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [state, setState] = useState<AssistantState>('idle')
  const [voiceEnabled, setVoiceEnabled] = useState(true)
  const [isListening, setIsListening] = useState(false)
  const [isSpeaking, setIsSpeaking] = useState(false)
  const [transcript, setTranscript] = useState('')
  const [response, setResponse] = useState('')
  const [pendingAction, setPendingAction] = useState<PendingAction | null>(null)
  const [voiceInputAvailable, setVoiceInputAvailable] = useState(false)
  const [voiceOutputAvailable, setVoiceOutputAvailable] = useState(false)
  
  const recognitionRef = useRef<any>(null)
  const isSpeakingRef = useRef<boolean>(false)

  // Initialize speech recognition
  useEffect(() => {
    if (typeof window === 'undefined') return

    // Voice output is handled by voice engine (OpenAI TTS)
    setVoiceOutputAvailable(true)

    // Initialize speech recognition
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition
      if (SpeechRecognition) {
        try {
          const recognition = new SpeechRecognition()
          recognition.continuous = false
          recognition.interimResults = false
          recognition.lang = 'en-US'
          
          recognition.onstart = () => {
            setIsListening(true)
            setState('listening')
            console.log('🎤 Speech recognition started')
          }
          
          recognition.onresult = (event: any) => {
            const text = event.results[0][0].transcript
            console.log('📝 Speech recognized:', text)
            setTranscript(text)
            setIsListening(false)
            handleCommand(text)
          }
          
          recognition.onerror = (event: any) => {
            console.error('❌ Speech recognition error:', event.error)
            setIsListening(false)
            setState('idle')
            
            // Provide specific error messages
            let errorMessage = 'Speech recognition failed. Please try typing instead.'
            if (event.error === 'not-allowed') {
              errorMessage = 'Microphone permission denied. Please allow microphone access and try again.'
            } else if (event.error === 'no-speech') {
              errorMessage = 'No speech detected. Please try again.'
            } else if (event.error === 'network') {
              errorMessage = 'Network error. Please check your connection.'
            }
            
            onError?.(errorMessage)
          }
          
          recognition.onend = () => {
            setIsListening(false)
            if (state === 'listening') {
              setState('idle')
            }
          }
          
          recognitionRef.current = recognition
          setVoiceInputAvailable(true)
          console.log('✅ Speech Recognition API initialized')
        } catch (error) {
          console.error('❌ Failed to initialize Speech Recognition:', error)
          setVoiceInputAvailable(false)
          onError?.('Speech recognition is not available in your browser.')
        }
      } else {
        setVoiceInputAvailable(false)
      }
    } else {
      console.warn('⚠️ Speech Recognition API not available (Chrome/Edge required)')
      setVoiceInputAvailable(false)
      // Don't show error immediately - user can still use text input
    }
  }, [])

  // Cleanup
  useEffect(() => {
    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop()
      }
      cancelSpeech() // Cancel any ongoing voice output
    }
  }, [])

  const handleSpeak = async (text: string) => {
    if (!voiceEnabled) return
    
    // Prevent duplicate calls
    if (isSpeakingRef.current) {
      console.warn('⚠️ Already speaking, ignoring duplicate call')
      return
    }
    
    isSpeakingRef.current = true
    setIsSpeaking(true)
    
    try {
      // Use voice engine abstraction layer (OpenAI TTS)
      await speak(text, {
        voice: 'alloy', // Calm, neutral voice
        speed: 1.0, // Normal speed
      })
    } catch (error) {
      console.error('❌ Voice engine error:', error)
    } finally {
      setIsSpeaking(false)
      isSpeakingRef.current = false
    }
  }

  const startListening = () => {
    if (!recognitionRef.current) {
      onError?.('Speech recognition is not available in your browser.')
      return
    }
    
    try {
      setState('listening')
      recognitionRef.current.start()
    } catch (error) {
      console.error('Error starting speech recognition:', error)
      onError?.('Could not start speech recognition. Please try typing instead.')
      setState('idle')
    }
  }

  const stopListening = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop()
    }
    setIsListening(false)
    setState('idle')
  }

  const handleCommand = async (text: string) => {
    setState('thinking')
    setResponse('')
    setTranscript(text)

    try {
      // Step 1: Classify the input
      const classifyResponse = await fetch('/api/ai/classify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ input: text }),
      })

      if (!classifyResponse.ok) {
        throw new Error('Failed to classify input')
      }

      const classifyData = await classifyResponse.json()
      const intent: AIIntent = classifyData.intent || classifyData

      // Step 2: Handle clarification
      if (intent.type === 'clarification' || intent.type === 'unknown') {
        const clarificationText = intent.followUpQuestion || 'I need more details. Could you clarify?'
        setResponse(clarificationText)
        setState('idle')
        handleSpeak(clarificationText)
        return
      }

      // Step 3: Create action intent for confirmation (BEFORE execution)
      const actionIntent: ActionIntent = {
        action: mapIntentToAction(intent.type),
        entity: mapIntentToEntity(intent.type),
        params: intent.payload || {},
        confidence: intent.confidence || 0.8,
        humanReadable: generateHumanReadableFromIntent(intent),
        raw: text,
      }

      // Step 4: Store the intent for execution AFTER confirmation
      setPendingAction({
        intent: actionIntent,
        routerResult: null, // Will be set after confirmation
        humanReadable: actionIntent.humanReadable,
      })

      // Step 5: Show confirmation (BEFORE execution)
      const confirmationSummary = generateConfirmationSummaryFromIntent(actionIntent)
      setResponse(confirmationSummary)
      setState('awaiting_confirmation')
      handleSpeak(confirmationSummary)
    } catch (error) {
      console.error('Error processing command:', error)
      const errorText = 'Sorry, something went wrong. Please try again.'
      setResponse(errorText)
      setState('idle')
      handleSpeak(errorText)
      onError?.('Failed to process command')
    }
  }

  const handleConfirm = async () => {
    if (!pendingAction) return

    setState('thinking')
    try {
      // Step 1: Re-classify to get the intent
      const classifyResponse = await fetch('/api/ai/classify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ input: pendingAction.intent.raw }),
      })

      if (!classifyResponse.ok) {
        throw new Error('Failed to classify input')
      }

      const classifyData = await classifyResponse.json()
      const intent: AIIntent = classifyData.intent || classifyData

      // Step 2: NOW execute the action (routeIntent executes immediately)
      const routerResult = await routeIntent(intent)

      if (!routerResult.success) {
        const errorText = routerResult.error || 'I couldn\'t complete that action.'
        setResponse(errorText)
        setState('idle')
        handleSpeak(errorText)
        onError?.(errorText)
        setPendingAction(null)
        return
      }

      // Step 3: Call the action handler
      onAction(routerResult.route, routerResult.payload)
      
      // Step 4: Show success
      const successMessage = routerResult.message || 'Done! I\'ve completed that for you.'
      setResponse(successMessage)
      setState('completed')
      handleSpeak(successMessage)
      setPendingAction(null)
      setTranscript('')

      // Reset to idle after a delay
      setTimeout(() => {
        setState('idle')
        setResponse('')
      }, 2000)
    } catch (error) {
      console.error('Error executing action:', error)
      const errorText = 'Sorry, I couldn\'t complete that action.'
      setResponse(errorText)
      setState('idle')
      handleSpeak(errorText)
      onError?.('Failed to execute action')
      setPendingAction(null)
    }
  }

  const handleCancel = () => {
    const cancelMessage = 'Cancelled. What would you like to do instead?'
    setResponse(cancelMessage)
    setState('idle')
    handleSpeak(cancelMessage)
    setPendingAction(null)
    setTranscript('')
    setResponse('')
  }

  const handleTextSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const text = transcript.trim()
    if (text) {
      handleCommand(text)
    }
  }

  // Helper functions
  const mapIntentToAction = (intentType: string): ActionIntent['action'] => {
    if (intentType === 'task') return 'create_task'
    if (intentType === 'meal') return 'create_meal'
    if (intentType === 'shopping') return 'create_shopping_item'
    if (intentType === 'reminder') return 'create_reminder'
    return 'unknown'
  }

  const mapIntentToEntity = (intentType: string): ActionIntent['entity'] => {
    if (intentType === 'task') return 'task'
    if (intentType === 'meal') return 'meal'
    if (intentType === 'shopping') return 'shopping'
    if (intentType === 'reminder') return 'reminder'
    return 'unknown'
  }

  const generateHumanReadableFromIntent = (intent: AIIntent): string => {
    if (intent.type === 'task' && intent.payload?.title) {
      return `add task "${intent.payload.title}"`
    }
    if (intent.type === 'meal' && intent.payload?.name) {
      return `plan meal "${intent.payload.name}"`
    }
    if (intent.type === 'shopping' && intent.payload?.items) {
      return `add ${intent.payload.items.length} item(s) to shopping list`
    }
    if (intent.type === 'reminder' && intent.payload?.title) {
      return `set reminder "${intent.payload.title}"`
    }
    return `process ${intent.type}`
  }

  const generateConfirmationSummaryFromIntent = (actionIntent: ActionIntent): string => {
    return `I'm about to ${actionIntent.humanReadable}. Should I go ahead?`
  }

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-24 right-6 w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 text-white shadow-lg hover:shadow-xl transition-all duration-200 flex items-center justify-center z-40 hover:scale-110 active:scale-95"
        title="Open Assistant"
      >
        <Mic className="w-6 h-6" strokeWidth={1.5} />
      </button>
    )
  }

  return (
    <div className="fixed bottom-24 right-6 w-96 max-w-[calc(100vw-3rem)] bg-white rounded-2xl shadow-2xl border border-gray-200 z-50 flex flex-col max-h-[600px]">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200">
        <div className="flex items-center gap-2">
          <Mic className="w-5 h-5 text-[#4a5568]" strokeWidth={1.5} />
          <h3 className="font-semibold text-gray-900">Assistant</h3>
          {state === 'listening' && (
            <span className="ml-2 w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setVoiceEnabled(!voiceEnabled)}
            className={`px-2 py-1 rounded text-xs transition-colors ${
              voiceEnabled ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-500'
            }`}
          >
            {voiceEnabled ? '🔊' : '🔇'}
          </button>
          <button
            onClick={() => {
              setIsOpen(false)
              setState('idle')
              setTranscript('')
              setResponse('')
              setPendingAction(null)
              stopListening()
            }}
            className="text-gray-400 hover:text-gray-600 text-xl"
          >
            ×
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* State indicator */}
        <div className="text-center">
          {state === 'listening' && (
            <div className="flex flex-col items-center gap-2">
              <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center animate-pulse">
                <Mic className="w-6 h-6" strokeWidth={1.5} />
              </div>
              <p className="text-sm text-gray-600">Listening...</p>
            </div>
          )}
          {state === 'thinking' && (
            <div className="flex flex-col items-center gap-2">
              <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center">
                <div className="flex gap-1">
                  <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                  <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                </div>
              </div>
              <p className="text-sm text-gray-600">Thinking...</p>
            </div>
          )}
          {state === 'awaiting_confirmation' && pendingAction && (
            <div className="bg-blue-50 rounded-xl p-4 border border-blue-200">
              <p className="text-sm text-gray-900 mb-3">{response}</p>
              <div className="flex gap-2">
                <button
                  onClick={handleConfirm}
                  className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                >
                  Confirm
                </button>
                <button
                  onClick={handleCancel}
                  className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
          {state === 'completed' && (
            <div className="flex flex-col items-center gap-2">
              <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center">
                <CheckCircle2 className="w-7 h-7 text-green-600" strokeWidth={1.5} />
              </div>
              <p className="text-sm text-gray-600">{response}</p>
            </div>
          )}
          {state === 'idle' && (
            <div className="text-center text-gray-500 text-sm py-4">
              <p>Say a command or type below</p>
            </div>
          )}
        </div>

        {/* Transcript */}
        {transcript && (
          <div className="bg-gray-50 rounded-xl p-3">
            <p className="text-xs text-gray-500 mb-1">You said:</p>
            <p className="text-sm text-gray-900">{transcript}</p>
          </div>
        )}

        {/* Response */}
        {response && state !== 'awaiting_confirmation' && (
          <div className="bg-blue-50 rounded-xl p-3">
            <p className="text-xs text-blue-600 mb-1">Assistant:</p>
            <p className="text-sm text-gray-900">{response}</p>
          </div>
        )}
      </div>

      {/* Input */}
      <div className="border-t border-gray-200 p-4">
        <form onSubmit={handleTextSubmit} className="flex gap-2">
          <input
            type="text"
            value={transcript}
            onChange={(e) => setTranscript(e.target.value)}
            placeholder="Type a command..."
            className="flex-1 px-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
            disabled={state === 'listening' || state === 'thinking' || state === 'awaiting_confirmation'}
          />
          <button
            type="button"
            onClick={isListening ? stopListening : startListening}
            disabled={state === 'thinking' || state === 'awaiting_confirmation' || !voiceInputAvailable}
            className={`px-4 py-2 rounded-lg transition-colors ${
              isListening
                ? 'bg-red-500 text-white hover:bg-red-600'
                : voiceInputAvailable
                ? 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                : 'bg-gray-50 text-gray-400 cursor-not-allowed'
            } disabled:opacity-50 disabled:cursor-not-allowed`}
            title={!voiceInputAvailable ? 'Voice input not available (Chrome/Edge required)' : isListening ? 'Stop listening' : 'Start voice input'}
          >
            {isListening ? <Square className="w-5 h-5" strokeWidth={2} /> : <Mic className="w-5 h-5" strokeWidth={1.5} />}
          </button>
        </form>
      </div>
    </div>
  )
}

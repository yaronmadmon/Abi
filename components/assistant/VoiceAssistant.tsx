'use client'

import { useState, useEffect, useRef } from 'react'
import { logger } from '@/lib/logger'
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
            logger.debug('Speech recognition started')
          }
          
          recognition.onresult = (event: any) => {
            const text = event.results[0][0].transcript
            logger.debug('Speech recognized', { text })
            setTranscript(text)
            setIsListening(false)
            handleCommand(text)
          }
          
          recognition.onerror = (event: any) => {
            logger.error('Speech recognition error', new Error(event.error))
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
          logger.debug('Speech Recognition API initialized')
        } catch (error) {
          logger.error('Failed to initialize Speech Recognition', error as Error)
          setVoiceInputAvailable(false)
          onError?.('Speech recognition is not available in your browser.')
        }
      } else {
        setVoiceInputAvailable(false)
      }
    } else {
      logger.warn('Speech Recognition API not available (Chrome/Edge required)')
      setVoiceInputAvailable(false)
      // Don't show error immediately - user can still use text input
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
        className="fixed bottom-20 right-6 w-16 h-16 rounded-full text-white shadow-lg transition-all duration-250 flex items-center justify-center z-40 hover:scale-110 active:scale-95"
        style={{ 
          bottom: 'calc(64px + 1rem)',
          backgroundColor: 'var(--accent-primary)',
          boxShadow: '0 10px 40px rgba(139, 158, 255, 0.4)'
        }}
        title="Open Assistant"
      >
        <Mic className="w-6 h-6" strokeWidth={1.5} />
      </button>
    )
  }

  return (
    <div 
      className="fixed right-6 w-96 max-w-[calc(100vw-3rem)] rounded-2xl z-50 flex flex-col max-h-[600px]"
      style={{ 
        bottom: 'calc(64px + 1rem)',
        backgroundColor: 'var(--bg-elevated)',
        border: '1px solid var(--glass-border)',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)'
      }}
    >
      {/* Header */}
      <div 
        className="flex items-center justify-between p-4"
        style={{ borderBottom: '1px solid var(--glass-border)' }}
      >
        <div className="flex items-center gap-2">
          <Mic className="w-5 h-5" style={{ color: 'var(--text-muted)' }} strokeWidth={1.5} />
          <h3 className="font-semibold" style={{ color: 'var(--text-primary)' }}>Assistant</h3>
          {state === 'listening' && (
            <span className="ml-2 w-2 h-2 rounded-full animate-pulse" style={{ backgroundColor: 'var(--error)' }}></span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setVoiceEnabled(!voiceEnabled)}
            className="px-2 py-1 rounded-full text-xs transition-all duration-250"
            style={{
              backgroundColor: voiceEnabled ? 'rgba(139, 158, 255, 0.2)' : 'rgba(255, 255, 255, 0.1)',
              color: voiceEnabled ? 'var(--accent-primary)' : 'var(--text-muted)'
            }}
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
            className="text-xl transition-colors duration-250 hover:opacity-80"
            style={{ color: 'var(--text-muted)' }}
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
              <div 
                className="w-16 h-16 rounded-full flex items-center justify-center animate-pulse"
                style={{ backgroundColor: 'rgba(248, 113, 113, 0.2)' }}
              >
                <Mic className="w-6 h-6" style={{ color: 'var(--error)' }} strokeWidth={1.5} />
              </div>
              <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>Listening...</p>
            </div>
          )}
          {state === 'thinking' && (
            <div className="flex flex-col items-center gap-2">
              <div 
                className="w-16 h-16 rounded-full flex items-center justify-center"
                style={{ backgroundColor: 'rgba(139, 158, 255, 0.2)' }}
              >
                <div className="flex gap-1">
                  <div className="w-2 h-2 rounded-full animate-bounce" style={{ backgroundColor: 'var(--accent-primary)' }}></div>
                  <div className="w-2 h-2 rounded-full animate-bounce" style={{ backgroundColor: 'var(--accent-primary)', animationDelay: '0.1s' }}></div>
                  <div className="w-2 h-2 rounded-full animate-bounce" style={{ backgroundColor: 'var(--accent-primary)', animationDelay: '0.2s' }}></div>
                </div>
              </div>
              <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>Thinking...</p>
            </div>
          )}
          {state === 'awaiting_confirmation' && pendingAction && (
            <div 
              className="rounded-xl p-4"
              style={{
                backgroundColor: 'rgba(139, 158, 255, 0.1)',
                border: '1px solid rgba(139, 158, 255, 0.2)'
              }}
            >
              <p className="text-sm mb-3" style={{ color: 'var(--text-primary)' }}>{response}</p>
              <div className="flex gap-2">
                <button
                  onClick={handleConfirm}
                  className="flex-1 px-4 py-2 rounded-full text-white transition-all duration-250 hover:shadow-lg active:scale-[0.98]"
                  style={{ 
                    backgroundColor: 'var(--accent-primary)',
                    boxShadow: '0 4px 15px rgba(139, 158, 255, 0.3)'
                  }}
                >
                  Confirm
                </button>
                <button
                  onClick={handleCancel}
                  className="flex-1 px-4 py-2 rounded-full transition-all duration-250 hover:bg-white/10 active:scale-[0.98]"
                  style={{ 
                    backgroundColor: 'rgba(255, 255, 255, 0.1)',
                    color: 'var(--text-primary)'
                  }}
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
          {state === 'completed' && (
            <div className="flex flex-col items-center gap-2">
              <div 
                className="w-16 h-16 rounded-full flex items-center justify-center"
                style={{ backgroundColor: 'rgba(74, 222, 128, 0.2)' }}
              >
                <CheckCircle2 className="w-7 h-7" style={{ color: 'var(--success)' }} strokeWidth={1.5} />
              </div>
              <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>{response}</p>
            </div>
          )}
          {state === 'idle' && (
            <div className="text-center text-sm py-4" style={{ color: 'var(--text-muted)' }}>
              <p>Say a command or type below</p>
            </div>
          )}
        </div>

        {/* Transcript */}
        {transcript && (
          <div 
            className="rounded-xl p-3"
            style={{ backgroundColor: 'rgba(255, 255, 255, 0.05)' }}
          >
            <p className="text-xs mb-1" style={{ color: 'var(--text-muted)' }}>You said:</p>
            <p className="text-sm" style={{ color: 'var(--text-primary)' }}>{transcript}</p>
          </div>
        )}

        {/* Response */}
        {response && state !== 'awaiting_confirmation' && (
          <div 
            className="rounded-xl p-3"
            style={{ backgroundColor: 'rgba(139, 158, 255, 0.1)' }}
          >
            <p className="text-xs mb-1" style={{ color: 'var(--accent-primary)' }}>Assistant:</p>
            <p className="text-sm" style={{ color: 'var(--text-primary)' }}>{response}</p>
          </div>
        )}
      </div>

      {/* Input */}
      <div 
        className="p-4"
        style={{ borderTop: '1px solid var(--glass-border)' }}
      >
        <form onSubmit={handleTextSubmit} className="flex gap-2">
          <input
            type="text"
            value={transcript}
            onChange={(e) => setTranscript(e.target.value)}
            placeholder="Type a command..."
            className="flex-1 px-4 py-2 rounded-xl focus:outline-none focus:ring-2"
            style={{
              backgroundColor: 'var(--input-bg)',
              border: '1px solid var(--input-border)',
              color: 'var(--text-primary)'
            }}
            disabled={state === 'listening' || state === 'thinking' || state === 'awaiting_confirmation'}
          />
          <button
            type="button"
            onClick={isListening ? stopListening : startListening}
            disabled={state === 'thinking' || state === 'awaiting_confirmation' || !voiceInputAvailable}
            className="px-4 py-2 rounded-xl transition-all duration-250 disabled:opacity-50 disabled:cursor-not-allowed"
            style={{
              backgroundColor: isListening
                ? 'var(--error)'
                : voiceInputAvailable
                  ? 'rgba(255, 255, 255, 0.1)'
                  : 'rgba(255, 255, 255, 0.05)',
              color: isListening
                ? 'white'
                : voiceInputAvailable
                  ? 'var(--text-secondary)'
                  : 'var(--text-muted)'
            }}
            title={!voiceInputAvailable ? 'Voice input not available (Chrome/Edge required)' : isListening ? 'Stop listening' : 'Start voice input'}
          >
            {isListening ? <Square className="w-5 h-5" strokeWidth={2} /> : <Mic className="w-5 h-5" strokeWidth={1.5} />}
          </button>
        </form>
      </div>
    </div>
  )
}

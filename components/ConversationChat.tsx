'use client'

import { useState, useEffect, useRef } from 'react'
import { logger } from '@/lib/logger'
import { Mic, Square, Image as ImageIcon, X } from 'lucide-react'
import Image from 'next/image'
import { speak, cancelSpeech } from '@/ai/voiceEngine'
import type { AIIntent } from '@/ai/schemas/intentSchema'
import { routeIntent } from '@/ai/aiRouter'
import AIPen from './AIPen'

interface Message {
  id: string
  role: 'user' | 'assistant'
  text: string
  timestamp: number
}

interface ConversationChatProps {
  onIntent: (action: string, payload: any) => void
  onError?: (error: string) => void
}

export default function ConversationChat({ onIntent, onError }: ConversationChatProps) {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [isProcessing, setIsProcessing] = useState(false)
  const [voiceEnabled, setVoiceEnabled] = useState(true)
  const [isListening, setIsListening] = useState(false)
  const [isSpeaking, setIsSpeaking] = useState(false)
  const [conversationMode, setConversationMode] = useState(false)
  const [images, setImages] = useState<string[]>([]) // Base64 encoded images
  const [imagePreviews, setImagePreviews] = useState<string[]>([]) // Preview URLs
  
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const recognitionRef = useRef<any>(null)
  const isSpeakingRef = useRef<boolean>(false)
  const silenceTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const conversationModeRef = useRef<boolean>(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Initialize speech recognition
  useEffect(() => {
    // Voice output is handled by voice engine (OpenAI TTS)
    
    // Initialize speech recognition
    if (typeof window !== 'undefined' && 'webkitSpeechRecognition' in window) {
      const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition
      if (SpeechRecognition) {
      const recognition = new SpeechRecognition()
      recognition.continuous = false // Will be set dynamically when starting
      recognition.interimResults = false
      recognition.lang = 'en-US'
      
      recognition.onstart = () => {
        setIsListening(true)
        // Clear any existing timeout
        if (silenceTimeoutRef.current) {
          clearTimeout(silenceTimeoutRef.current)
          silenceTimeoutRef.current = null
        }
      }
      
      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript
        setInput(transcript)
        
        // If in conversation mode, don't stop listening
        if (conversationModeRef.current) {
          // Reset silence timeout
          if (silenceTimeoutRef.current) {
            clearTimeout(silenceTimeoutRef.current)
          }
          silenceTimeoutRef.current = setTimeout(() => {
            // Silence timeout - stop listening
            stopListening()
            setConversationMode(false)
            conversationModeRef.current = false
          }, 7000) // 7 seconds of silence
          
          // Auto-submit after speech recognition
          setTimeout(() => {
            handleSubmit(transcript)
          }, 100)
        } else {
          // Not in conversation mode - stop after one result
          setIsListening(false)
          setTimeout(() => {
            handleSubmit(transcript)
          }, 100)
        }
      }
      
      recognition.onerror = (event: any) => {
        console.error('Speech recognition error:', event.error)
        setIsListening(false)
        if (event.error !== 'no-speech') {
          // Don't show error for silence - that's normal
          onError?.('Speech recognition failed. Please try typing instead.')
        }
        // Exit conversation mode on error
        if (conversationModeRef.current) {
          setConversationMode(false)
          conversationModeRef.current = false
        }
      }
      
      recognition.onend = () => {
        // Only stop listening if not in conversation mode
        // In conversation mode, we'll restart listening after AI speaks
        if (!conversationModeRef.current) {
          setIsListening(false)
        } else {
          // In conversation mode, restart listening after a brief delay
          // (unless we're stopping intentionally)
          setTimeout(() => {
            if (conversationModeRef.current && !isSpeaking) {
              try {
                recognition.start()
              } catch (error) {
                // Recognition might already be running or stopped intentionally
                logger.debug('Recognition restart', { error })
              }
            }
          }, 300)
        }
      }
        
        recognitionRef.current = recognition
      }
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop()
      }
      cancelSpeech() // Cancel any ongoing voice output
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [onError, isSpeaking])

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // Cancel any ongoing speech when component unmounts
  useEffect(() => {
    return () => {
      cancelSpeech()
    }
  }, [])

  const handleSpeak = async (text: string) => {
    if (!voiceEnabled) return
    
    // Prevent duplicate calls
    if (isSpeakingRef.current) {
      logger.warn('Already speaking, ignoring duplicate call')
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
      
      // After speaking, if in conversation mode, restart listening
      if (conversationModeRef.current && recognitionRef.current) {
        // Small delay before restarting to avoid immediate re-trigger
        setTimeout(() => {
          if (conversationModeRef.current && !isListening) {
            try {
              recognitionRef.current.start()
            } catch (error) {
              // Recognition might already be running, ignore
              logger.debug('Recognition already active or error', { error })
            }
          }
        }, 500)
      }
    } catch (error) {
      console.error('❌ Voice engine error:', error)
    } finally {
      setIsSpeaking(false)
      isSpeakingRef.current = false
    }
  }

  const startListening = (enableConversationMode: boolean = false) => {
    if (!recognitionRef.current) {
      onError?.('Speech recognition is not available in your browser.')
      return
    }
    
    try {
      conversationModeRef.current = enableConversationMode
      setConversationMode(enableConversationMode)
      
      // Update recognition settings for conversation mode
      if (recognitionRef.current) {
        recognitionRef.current.continuous = enableConversationMode
      }
      
      recognitionRef.current.start()
    } catch (error) {
      console.error('Error starting speech recognition:', error)
      onError?.('Could not start speech recognition. Please try typing instead.')
      setConversationMode(false)
      conversationModeRef.current = false
    }
  }

  const stopListening = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop()
    }
    setIsListening(false)
    setConversationMode(false)
    conversationModeRef.current = false
    
    // Clear silence timeout
    if (silenceTimeoutRef.current) {
      clearTimeout(silenceTimeoutRef.current)
      silenceTimeoutRef.current = null
    }
  }

  const handleSubmit = async (text?: string) => {
    const inputText = text || input.trim()
    if (!inputText || isProcessing) return

    // Add user message
    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      text: inputText,
      timestamp: Date.now(),
    }
    setMessages((prev) => [...prev, userMessage])
    setInput('')
    setIsProcessing(true)

    try {
      // Step 1: Send text + images to /api/ai/classify (always in conversational mode)
      const response = await fetch('/api/ai/classify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          input: inputText || (images.length > 0 ? 'Analyze this image' : ''),
          images: images.length > 0 ? images : undefined,
          conversationalMode: true, // Always conversational in ConversationChat
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to classify input')
      }

      const data = await response.json()
      
      // Handle error response
      if (data.error) {
        const errorMessage: Message = {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          text: `Sorry, I encountered an error: ${data.error}`,
          timestamp: Date.now(),
        }
        setMessages((prev) => [...prev, errorMessage])
        handleSpeak(errorMessage.text)
        onError?.(data.error)
        setIsProcessing(false)
        return
      }

      // Extract intent from response
      const intent: AIIntent = data.intent || data

      // Step 2: Handle conversational responses and clarifications
      // Check if this is a conversational GPT response (not a clarification request)
      const isConversationalResponse = (intent as any).isConversational;
      
      if (intent.type === 'clarification' || intent.type === 'unknown') {
        // Use GPT's response (which is in followUpQuestion)
        const responseText = intent.followUpQuestion || 
          (isConversationalResponse 
            ? "I'm here to help! How can I assist you today?"
            : 'Could you tell me more about what you need?');
        
        const responseMessage: Message = {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          text: responseText,
          timestamp: Date.now(),
        }
        setMessages((prev) => [...prev, responseMessage])
        handleSpeak(responseText)
        setIsProcessing(false)
        return
      }

      // Step 4: Route intent to appropriate module
      const routerResult = await routeIntent(intent)

      if (routerResult.success) {
        // Use the detailed message from router (which references actual actions)
        const responseText = routerResult.message || 
          `I've processed your request: ${inputText}`
        
        const assistantMessage: Message = {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          text: responseText,
          timestamp: Date.now(),
        }
        setMessages((prev) => [...prev, assistantMessage])
        handleSpeak(responseText)
        
        // Call the handler with route and payload (existing flow)
        onIntent(routerResult.route, routerResult.payload)
      } else {
        const errorText = routerResult.error || 'Failed to process request'
        const errorMessage: Message = {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          text: `Sorry, ${errorText.toLowerCase()}`,
          timestamp: Date.now(),
        }
        setMessages((prev) => [...prev, errorMessage])
        handleSpeak(errorMessage.text)
        onError?.(errorText)
        setIsProcessing(false)
      }
    } catch (error) {
      console.error('Failed to process input:', error)
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        text: 'Sorry, something went wrong. Please try again.',
        timestamp: Date.now(),
      }
      setMessages((prev) => [...prev, errorMessage])
      speak(errorMessage.text)
      onError?.('Sorry, something went wrong. Please try again.')
    } finally {
      setIsProcessing(false)
    }
  }

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    handleSubmit()
  }

  // Convert file to base64
  const handleImageSelect = async (file: File) => {
    if (!file.type.startsWith('image/')) {
      onError?.('Please select an image file')
      return
    }

    if (file.size > 10 * 1024 * 1024) { // 10MB limit
      onError?.('Image size must be less than 10MB')
      return
    }

    try {
      const reader = new FileReader()
      reader.onload = (e) => {
        const base64 = e.target?.result as string
        setImages(prev => [...prev, base64])
        setImagePreviews(prev => [...prev, URL.createObjectURL(file)])
      }
      reader.readAsDataURL(file)
    } catch (error) {
      console.error('Error reading image:', error)
      onError?.('Failed to read image')
    }
  }

  const removeImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index))
    if (imagePreviews[index]) {
      URL.revokeObjectURL(imagePreviews[index])
    }
    setImagePreviews(prev => prev.filter((_, i) => i !== index))
  }

  return (
    <div className="flex flex-col h-full max-h-[600px]">
      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 mb-4">
        {messages.length === 0 && (
          <div className="text-center text-gray-500 py-8">
            <p className="text-sm">Start a conversation</p>
            <p className="text-xs mt-2">You can type or use the microphone to speak</p>
          </div>
        )}
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[80%] rounded-2xl px-4 py-2 ${
                message.role === 'user'
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-100 text-gray-900'
              }`}
            >
              <p className="text-sm whitespace-pre-wrap">{message.text}</p>
            </div>
          </div>
        ))}
        {isProcessing && (
          <div className="flex justify-start">
            <div className="bg-gray-100 rounded-2xl px-4 py-2">
              <div className="flex gap-1">
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="border-t border-gray-200 p-4 bg-white">
        {/* Voice Toggle */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setVoiceEnabled(!voiceEnabled)}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm transition-colors ${
                voiceEnabled
                  ? 'bg-blue-100 text-blue-700'
                  : 'bg-gray-100 text-gray-500'
              }`}
            >
              <span>🔊</span>
              <span>{voiceEnabled ? 'Voice On' : 'Voice Off'}</span>
            </button>
            {(isSpeaking || isListening) && (
              <div className="flex items-center gap-2 text-sm text-gray-500">
                {isSpeaking && <span className="animate-pulse">🔊 Speaking...</span>}
                {isListening && (
                  <span className="animate-pulse flex items-center gap-1">
                    <Mic className="w-3.5 h-3.5" strokeWidth={2} />
                    <span>{conversationMode ? 'Conversation mode active' : 'Listening...'}</span>
                  </span>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Image Previews */}
        {imagePreviews.length > 0 && (
          <div className="mb-3 flex gap-2 flex-wrap">
            {imagePreviews.map((preview, index) => (
              <div key={index} className="relative w-20 h-20">
                <Image
                  src={preview}
                  alt={`Preview ${index + 1}`}
                  fill
                  className="object-cover rounded-lg border border-gray-200"
                  unoptimized
                />
                <button
                  onClick={() => removeImage(index)}
                  className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
                  type="button"
                >
                  <X className="w-3 h-3" strokeWidth={2} />
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Input Form */}
        <form onSubmit={handleFormSubmit}>
          <div className="flex gap-2">
            <div className="flex-1 relative">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Type a message or use the microphone..."
                className="w-full px-4 py-3 pr-28 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                disabled={isProcessing || isListening}
              />
              <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
                {/* AI Pen */}
                <AIPen
                  text={input}
                  onPolished={(polished) => setInput(polished)}
                  disabled={isProcessing || isListening}
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isProcessing}
                  className="p-2 rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors disabled:opacity-50"
                  title="Upload image"
                >
                  <ImageIcon className="w-4 h-4" strokeWidth={1.5} />
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  capture="environment"
                  onChange={(e) => {
                    const file = e.target.files?.[0]
                    if (file) {
                      handleImageSelect(file)
                    }
                    e.target.value = ''
                  }}
                  className="hidden"
                />
              </div>
            </div>
            <button
              type="button"
              onClick={(e) => {
                if (isListening) {
                  stopListening()
                } else {
                  // Long press (or shift+click) for conversation mode
                  const enableConversationMode = e.shiftKey || conversationMode
                  startListening(enableConversationMode)
                }
              }}
              onDoubleClick={() => {
                // Double-click to toggle conversation mode
                if (!isListening) {
                  setConversationMode(!conversationMode)
                }
              }}
              disabled={isProcessing}
              className={`px-4 py-3 rounded-xl transition-colors ${
                isListening
                  ? conversationMode
                    ? 'bg-green-500 text-white hover:bg-green-600'
                    : 'bg-red-500 text-white hover:bg-red-600'
                  : conversationMode
                    ? 'bg-blue-500 text-white hover:bg-blue-600'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              } disabled:opacity-50 disabled:cursor-not-allowed`}
              title={
                isListening
                  ? conversationMode
                    ? 'Stop conversation mode (mic stays open)'
                    : 'Stop listening'
                  : conversationMode
                    ? 'Start conversation mode (mic stays open)'
                    : 'Start voice input (hold Shift for conversation mode)'
              }
            >
              {isListening ? (
                conversationMode ? (
                  <Mic className="w-5 h-5" strokeWidth={2} />
                ) : (
                  <Square className="w-5 h-5" strokeWidth={2} />
                )
              ) : (
                <Mic className="w-5 h-5" strokeWidth={1.5} />
              )}
            </button>
            <button
              type="submit"
              disabled={(!input.trim() && images.length === 0) || isProcessing || isListening}
              className="px-6 py-3 rounded-xl bg-blue-500 text-white hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isProcessing ? '...' : '→'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

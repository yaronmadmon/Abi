'use client'

import { useState, useEffect, useRef } from 'react'
import { Mic, Square, Image as ImageIcon, X } from 'lucide-react'
import type { AIIntent } from '@/ai/schemas/intentSchema'
import { routeIntent } from '@/ai/aiRouter'
import AIPen from './AIPen'

interface AIInputBarProps {
  onIntent: (action: string, payload: any) => void
  onError?: (error: string) => void
  mode?: 'text' | 'conversation' // Mode prop
  onModeChange?: (mode: 'text' | 'conversation') => void
}

export default function AIInputBar({ onIntent, onError, mode = 'text', onModeChange }: AIInputBarProps) {
  const [input, setInput] = useState('')
  const [isProcessing, setIsProcessing] = useState(false)
  const [isListening, setIsListening] = useState(false)
  const [images, setImages] = useState<string[]>([]) // Base64 encoded images
  const [imagePreviews, setImagePreviews] = useState<string[]>([]) // Preview URLs
  const [clarification, setClarification] = useState<{
    question: string
    context: string
  } | null>(null)
  const [conversationContext, setConversationContext] = useState<string>('')
  
  const recognitionRef = useRef<any>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

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

  const handleSubmit = async (e: React.FormEvent, textOverride?: string) => {
    if (e && e.preventDefault) {
      e.preventDefault()
    }
    const inputText = textOverride || input.trim()
    // Allow submission even if no text, if images are present
    if ((!inputText && images.length === 0) || isProcessing) return

    const currentInput = inputText || (images.length > 0 ? 'Analyze this image' : '')
    setIsProcessing(true)

    try {
      // Step 1: Send text + images to /api/ai/classify
      const context = clarification
        ? `${clarification.context}\nUser clarification: ${currentInput}`
        : conversationContext

      const response = await fetch('/api/ai/classify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          input: currentInput,
          context: context || undefined,
          images: images.length > 0 ? images : undefined,
          conversationalMode: mode === 'conversation', // Pass mode to API
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to classify input')
      }

      const data = await response.json()
      
      // Handle error response
      if (data.error) {
        onError?.(data.error)
        setInput('')
        setIsProcessing(false)
        return
      }

      // Extract intent from response
      const intent: AIIntent = data.intent || data

      // Step 2: Handle conversational responses and clarifications
      const isConversationalResponse = (intent as any).isConversational;
      
      if (intent.type === 'clarification' || intent.type === 'unknown') {
        // Check if this is a conversational GPT response
        if (isConversationalResponse || mode === 'conversation') {
          // This is a natural GPT response, show it as clarification but it's actually a conversation
          const responseText = intent.followUpQuestion || 'How can I help you?';
          setClarification({
            question: responseText,
            context: conversationContext || currentInput,
          })
          setConversationContext(conversationContext ? `${conversationContext}\n${currentInput}` : currentInput)
          setInput('')
          setImages([])
          setImagePreviews([])
          setIsProcessing(false)
          return
        }
        
        // In text mode, try to infer and proceed if possible
        if (mode === 'text' && intent.payload) {
          // If we have payload, proceed anyway (GPT inferred what it could)
          console.log('📋 Proceeding with inferred data in text mode')
        } else if (mode === 'text') {
          // In text mode, show clarification but don't block
          setClarification({
            question: intent.followUpQuestion || 'Could you provide more details?',
            context: conversationContext || currentInput,
          })
          setConversationContext(conversationContext ? `${conversationContext}\n${currentInput}` : currentInput)
          setInput('')
          setImages([])
          setImagePreviews([])
          setIsProcessing(false)
          return
        }
      }

      // Step 4: Route intent to appropriate module
      console.log('🔄 Routing intent:', intent.type, intent.payload);
      const routerResult = await routeIntent(intent)
      console.log('📋 Router result:', routerResult);

      if (routerResult.success) {
        // Clear clarification and reset
        setClarification(null)
        setConversationContext('')
        setInput('')
        setImages([])
        imagePreviews.forEach(url => URL.revokeObjectURL(url))
        setImagePreviews([])
        
        // Call the handler with route and payload
        console.log('✅ Calling onIntent with:', routerResult.route, routerResult.payload);
        onIntent(routerResult.route, routerResult.payload)
      } else {
        console.error('❌ Router failed:', routerResult.error);
        onError?.(routerResult.error || 'Failed to process request')
      }
    } catch (error) {
      console.error('Failed to classify input:', error)
      onError?.('Sorry, something went wrong. Please try again.')
    } finally {
      setIsProcessing(false)
    }
  }

  const handleClearClarification = () => {
    setClarification(null)
    setConversationContext('')
  }

  // Initialize speech recognition
  useEffect(() => {
    if (typeof window !== 'undefined' && 'webkitSpeechRecognition' in window) {
      const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition
      if (SpeechRecognition) {
        const recognition = new SpeechRecognition()
        recognition.continuous = mode === 'conversation' // Continuous in conversation mode
        recognition.interimResults = false
        recognition.lang = 'en-US'
        
        recognition.onstart = () => {
          setIsListening(true)
        }
        
        recognition.onresult = (event: any) => {
          const transcript = event.results[0][0].transcript
          setInput(transcript)
          
          if (mode === 'conversation') {
            // In conversation mode, auto-submit and keep listening
            setTimeout(() => {
              handleSubmit({ preventDefault: () => {} } as React.FormEvent, transcript)
            }, 100)
          } else {
            // In text mode, just fill the input (don't auto-submit)
            setIsListening(false)
          }
        }
        
        recognition.onerror = (event: any) => {
          console.error('Speech recognition error:', event.error)
          setIsListening(false)
          if (event.error !== 'no-speech') {
            onError?.('Speech recognition failed. Please try typing instead.')
          }
        }
        
        recognition.onend = () => {
          setIsListening(false)
          // In conversation mode, restart listening after a delay
          if (mode === 'conversation' && !isProcessing) {
            setTimeout(() => {
              try {
                recognition.start()
              } catch (error) {
                // Recognition might already be running
              }
            }, 500)
          }
        }
        
        recognitionRef.current = recognition
      }
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop()
      }
    }
  }, [mode, isProcessing, onError])

  const startListening = () => {
    if (!recognitionRef.current) {
      onError?.('Speech recognition is not available in your browser.')
      return
    }
    
    try {
      recognitionRef.current.start()
    } catch (error) {
      console.error('Error starting speech recognition:', error)
      onError?.('Could not start speech recognition. Please try typing instead.')
    }
  }

  const stopListening = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop()
    }
    setIsListening(false)
  }

  // Cleanup image previews
  useEffect(() => {
    return () => {
      imagePreviews.forEach(url => URL.revokeObjectURL(url))
    }
  }, [])

  return (
    <>
      {/* Clarification and Image Previews - Inline with content */}
      <div className="mb-6">
        {clarification && (
          <div className="glass-card p-4 mb-4 bg-blue-50/50 border-blue-200">
            <div className="flex items-start gap-3">
              <div className="flex-1">
                <p className="text-sm font-medium text-blue-900 mb-1">
                  Need clarification:
                </p>
                <p className="text-sm text-blue-700 whitespace-pre-line">
                  {clarification.question}
                </p>
              </div>
              <button
                onClick={handleClearClarification}
                className="text-blue-400 hover:text-blue-600 text-xl"
                type="button"
              >
                ×
              </button>
            </div>
          </div>
        )}

        {/* Image Previews */}
        {imagePreviews.length > 0 && (
          <div className="mb-3 flex gap-2 flex-wrap">
            {imagePreviews.map((preview, index) => (
              <div key={index} className="relative">
                <img
                  src={preview}
                  alt={`Preview ${index + 1}`}
                  className="w-20 h-20 object-cover rounded-lg border border-gray-200"
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
      </div>

      {/* Fixed Input Bar - Bottom aligned, Apple-like */}
      <div className="fixed bottom-16 left-0 right-0 z-40 px-6 pb-3" style={{ paddingBottom: 'calc(0.75rem + env(safe-area-inset-bottom, 0px))' }}>
        <div className="max-w-2xl mx-auto">
          <form onSubmit={handleSubmit}>
            <div className="glass-card p-3 flex gap-2.5 items-center shadow-soft-lg">
              <div className="flex-1 relative min-w-0">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder={
                    clarification
                      ? "Answer the question above..."
                      : mode === 'conversation'
                      ? "Talk to your assistant..."
                      : "Tell me what you need..."
                  }
                  className="w-full px-3.5 py-2.5 pr-32 text-[15px] leading-normal rounded-lg border-0 focus:outline-none focus:ring-0 bg-transparent placeholder:text-gray-400 text-gray-900"
                  disabled={isProcessing || (isListening && mode === 'conversation')}
                />
                <div className="absolute right-1 top-1/2 -translate-y-1/2 flex items-center gap-0.5">
                  {/* AI Pen */}
                  <AIPen
                    text={input}
                    onPolished={(polished) => setInput(polished)}
                    disabled={isProcessing || isListening}
                  />
                  {/* Image Upload Button */}
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isProcessing}
                    className="p-1.5 rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-100/50 transition-all disabled:opacity-30 disabled:cursor-not-allowed"
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
                  
                  {/* Voice Input Button */}
                  <button
                    type="button"
                    onClick={isListening ? stopListening : startListening}
                    disabled={isProcessing}
                    className={`p-1.5 rounded-md transition-all ${
                      isListening
                        ? 'bg-red-500 text-white hover:bg-red-600'
                        : 'text-gray-400 hover:text-gray-600 hover:bg-gray-100/50'
                    } disabled:opacity-30 disabled:cursor-not-allowed`}
                    title={isListening ? 'Stop listening' : mode === 'conversation' ? 'Conversation mode active' : 'Start voice input'}
                  >
                    {isListening ? (
                      <Square className="w-4 h-4" strokeWidth={2} />
                    ) : (
                      <Mic className="w-4 h-4" strokeWidth={1.5} />
                    )}
                  </button>
                </div>
              </div>
              <button
                type="submit"
                disabled={(!input.trim() && images.length === 0) || isProcessing || (isListening && mode === 'conversation')}
                className="px-4 py-2.5 bg-blue-500 text-white rounded-lg hover:bg-blue-600 active:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed transition-all flex items-center justify-center min-w-[44px] shadow-sm"
                title="Send"
              >
                {isProcessing ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <span className="text-lg leading-none">→</span>
                )}
              </button>
            </div>
          </form>

          {/* Mode Indicator */}
          {mode === 'conversation' && (
            <div className="mt-1.5 text-xs text-gray-500 text-center">
              🟢 Conversation Mode
            </div>
          )}
        </div>
      </div>
    </>
  )
}

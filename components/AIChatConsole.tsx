'use client'

/**
 * AI Chat Console - The Central GPT-Style AI Brain
 * 
 * CORE PRINCIPLES:
 * - ONE AI brain for the entire app
 * - Push-to-talk voice (NO auto-sending, NO auto-listening)
 * - Explicit user control (idle → typing/listening → preview → send)
 * - Multimodal support (+ button: camera, upload, files)
 * - Clean conversation history
 * - Context-aware (sees app state, images, current screen)
 * 
 * MODES (Only ONE active at a time):
 * - idle: Default state, ready for user input
 * - typing: User is typing text (keyboard enabled)
 * - listening: User is recording voice (microphone active, keyboard disabled)
 * - preview: Voice recorded, transcript shown, user can edit before sending
 */

import { useState, useEffect, useRef } from 'react'
import Image from 'next/image'
import { Mic, Square, Plus, X, Send, Camera, Image as ImageIcon, FileText } from 'lucide-react'
import { speak, cancelSpeech } from '@/ai/voiceEngine'
import type { AIIntent } from '@/ai/schemas/intentSchema'
import { routeIntent } from '@/ai/aiRouter'
import { routeIntentToProposal } from '@/ai/aiRouterV2'
import type { ActionProposal } from '@/ai/schemas/commandSchema'
import { useApprovalQueue } from '@/hooks/useApprovalQueue'
import ConfirmationUI from '@/components/ConfirmationUI'
import { usePathname } from 'next/navigation'
import { logger } from '@/lib/logger'
import { initExecutors, areExecutorsInitialized } from '@/ai/execution/initExecutors'
import { shouldRequireApproval } from '@/ai/factories/commandFactory'
import { commandExecutor } from '@/ai/execution/commandExecutor'
import { approvalQueue } from '@/ai/execution/approvalQueue'
import { FeatureErrorBoundary } from '@/components/errors/FeatureErrorBoundary'
import AppModal from './modals/AppModal'
import MealPreparationFlow from './kitchen/MealPreparationFlow'
import { mealsHandler } from '@/ai/handlers/mealsHandler'

interface Message {
  id: string
  role: 'user' | 'assistant'
  text: string
  timestamp: number
}

type InputMode = 'idle' | 'typing' | 'listening' | 'preview'

interface AIChatConsoleProps {
  isOpen?: boolean  // Optional - if not provided, manages own state
  onClose?: () => void  // Optional - if not provided, manages own close
  onIntent?: (action: string, payload: any) => void
  onError?: (error: string) => void
}

function AIChatConsoleContent({ isOpen: externalIsOpen, onClose: externalOnClose, onIntent, onError }: AIChatConsoleProps) {
  // Track if component has mounted (prevents hydration errors)
  const [mounted, setMounted] = useState(false)
  
  // Internal state management if no external control
  const [internalIsOpen, setInternalIsOpen] = useState(false)
  
  // Use external control if provided, otherwise use internal state
  const isOpen = externalIsOpen !== undefined ? externalIsOpen : internalIsOpen
  const onClose = externalOnClose || (() => setInternalIsOpen(false))
  const [messages, setMessages] = useState<Message[]>([])
  const messagesRef = useRef<Message[]>([])
  const [draftMessage, setDraftMessage] = useState('') // Current input text (not in chat yet)
  const draftRef = useRef<string>('')
  const [mode, setMode] = useState<InputMode>('idle')
  const modeRef = useRef<InputMode>('idle')
  const [isProcessing, setIsProcessing] = useState(false)
  const isProcessingRef = useRef<boolean>(false)
  const [voiceEnabled, setVoiceEnabled] = useState(true)
  const [speechMode, setSpeechMode] = useState(false) // Full speech mode: auto-send + auto-speak
  const [images, setImages] = useState<string[]>([]) // Base64 encoded images
  const [imagePreviews, setImagePreviews] = useState<string[]>([]) // Preview URLs
  const [showMediaMenu, setShowMediaMenu] = useState(false)
  const [showMealPreparationFlow, setShowMealPreparationFlow] = useState(false)
  
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const recognitionRef = useRef<any>(null)
  const isSpeakingRef = useRef<boolean>(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const cameraInputRef = useRef<HTMLInputElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const pathname = usePathname()
  const hasLoadedHistoryRef = useRef<boolean>(false)
  const pendingUserMessageIdRef = useRef<string | null>(null)
  
  // Approval queue for command confirmation
  const { pendingProposal, isExecuting, enqueueProposal, approve, reject, clear } = useApprovalQueue()
  
  // Initialize executors on mount
  const hasInitializedExecutorsRef = useRef(false)

  const appendMessage = (msg: Message) => {
    setMessages((prev) => {
      if (prev.some((m) => m.id === msg.id)) return prev
      return [...prev, msg]
    })
  }

  const buildHistoryText = (all: Message[]): string => {
    // Keep it clean & compact; GPT gets enough context without huge prompts.
    const recent = all.slice(-30)
    return recent
      .map((m) => `${m.role === 'user' ? 'User' : 'Assistant'}: ${m.text}`)
      .join('\n')
  }

  const makeId = () => {
    if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) return crypto.randomUUID()
    return `${Date.now()}-${Math.random().toString(16).slice(2)}`
  }

  // Set mounted flag after component mounts (prevents hydration errors)
  useEffect(() => {
    setMounted(true)
  }, [])

  // Keep refs in sync (prevents stale closures & duplicate behaviors)
  useEffect(() => {
    messagesRef.current = messages
  }, [messages])
  useEffect(() => {
    draftRef.current = draftMessage
  }, [draftMessage])
  useEffect(() => {
    modeRef.current = mode
  }, [mode])

  // Initialize executors once
  useEffect(() => {
    if (hasInitializedExecutorsRef.current) return
    if (typeof window === 'undefined') return
    
    if (!areExecutorsInitialized()) {
      initExecutors()
    }
    hasInitializedExecutorsRef.current = true
  }, [])
  
  // Clear pending proposals when console closes
  useEffect(() => {
    if (!isOpen && pendingProposal) {
      clear()
    }
  }, [isOpen, pendingProposal, clear])
  
  // Load + persist conversation (one clean state, no injected system messages)
  useEffect(() => {
    if (typeof window === 'undefined') return
    if (hasLoadedHistoryRef.current) return
    hasLoadedHistoryRef.current = true
    try {
      const raw = localStorage.getItem('aiChatConsoleMessages')
      if (!raw) return
      const parsed = JSON.parse(raw) as Message[]
      if (Array.isArray(parsed)) {
        setMessages(
          parsed.filter(
            (m) =>
              m &&
              (m.role === 'user' || m.role === 'assistant') &&
              typeof m.id === 'string' &&
              typeof m.text === 'string' &&
              typeof m.timestamp === 'number'
          )
        )
      }
    } catch (e) {
      console.warn('Failed to load AI chat history:', e)
    }
  }, [])

  useEffect(() => {
    if (typeof window === 'undefined') return
    try {
      localStorage.setItem('aiChatConsoleMessages', JSON.stringify(messages))
    } catch (e) {
      // Non-fatal: storage may be full or blocked.
    }
  }, [messages])

  // Initialize speech recognition ONCE (avoid re-registering handlers on rerender)
  useEffect(() => {
    if (typeof window === 'undefined') return
    const SpeechRecognition =
      typeof window !== 'undefined' && ((window as any).webkitSpeechRecognition || (window as any).SpeechRecognition)
    if (!SpeechRecognition) return

    const recognition = new SpeechRecognition()
    recognition.continuous = false // Single utterance only (push-to-talk)
    recognition.interimResults = false
    recognition.lang = 'en-US'

    recognition.onstart = () => {
      setMode('listening')
    }

    recognition.onresult = (event: any) => {
      const transcript = event?.results?.[0]?.[0]?.transcript
      if (typeof transcript === 'string') {
        // Append to existing draft instead of replacing (allow multiple voice inputs)
        const newDraft = draftRef.current ? `${draftRef.current} ${transcript}` : transcript
        setDraftMessage(newDraft)
        draftRef.current = newDraft
        setMode('preview')
      }
    }

    recognition.onerror = (event: any) => {
      console.error('Speech recognition error:', event?.error)
      setMode('idle')
      if (event?.error !== 'no-speech') {
        onError?.('Speech recognition failed. Please try typing instead.')
      }
    }

    recognition.onend = () => {
      // Only update mode if still in listening (user might have stopped it)
      if (modeRef.current === 'listening') {
        if (!draftRef.current.trim()) {
          setMode('idle')
        } else {
          setMode('preview')
        }
      }
    }

    recognitionRef.current = recognition

    return () => {
      try {
        recognition.stop()
      } catch {}
      cancelSpeech()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [onError])

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // Cancel speech on unmount
  useEffect(() => {
    return () => {
      cancelSpeech()
    }
  }, [])

  // Reset to idle when console closes
  useEffect(() => {
    if (!isOpen) {
      setMode('idle')
      setDraftMessage('')
      if (recognitionRef.current) {
        recognitionRef.current.stop()
      }
    }
  }, [isOpen])

  // Focus input when modal opens (if not disabled)
  useEffect(() => {
    if (isOpen && inputRef.current) {
      // Small delay to ensure modal is fully rendered
      const timer = setTimeout(() => {
        if (inputRef.current && !isProcessing && mode !== 'listening' && !showMealPreparationFlow) {
          inputRef.current.focus()
        }
      }, 100)
      return () => clearTimeout(timer)
    }
  }, [isOpen, isProcessing, mode, showMealPreparationFlow])

  // Auto-send in speech mode when voice input completes
  const autoSendTriggeredRef = useRef<boolean>(false)

  // Get app context (current screen, route, etc.)
  const getAppContext = (): string => {
    // Core conversational instructions (ALWAYS included)
    const coreInstructions = `You are Abi, a warm and conversational home assistant. Follow these rules STRICTLY:

1. ALWAYS be conversational - never flat or robotic
2. ALWAYS acknowledge what the user said before responding
3. ALWAYS end with a natural follow-up question or invitation to continue
4. NEVER announce what page we're on (e.g., don't say "You're in the kitchen")
5. Infer context silently and respond naturally
6. Think like a partner, not a command executor
7. Keep responses warm, brief (2-3 sentences), and human

Structure: Acknowledge → Respond → Follow-up`

    // Page-specific context (expertise area)
    const pageContextMap: Record<string, string> = {
      '/kitchen': 'Your expertise: cooking, recipes, ingredients, and meal planning.',
      '/kitchen/recipes': 'Your expertise: recipe creation, modification, and culinary techniques.',
      '/kitchen/pantry': 'Your expertise: ingredient management and meal suggestions based on available items.',
      '/finance': 'Your expertise: budgets, bills, expenses, and financial planning.',
      '/people': 'Your expertise: family information, contacts, and relationships.',
      '/people/family': 'Your expertise: family member details, schedules, and important information.',
      '/people/pets': 'Your expertise: pet care, health, schedules, and needs.',
      '/office': 'Your expertise: documents, organization, and administrative tasks.',
      '/office/notes': 'Your expertise: writing, clarifying thoughts, and note organization.',
      '/office/thoughts': 'Your expertise: idea exploration, journaling, and organizing thinking.',
      '/today': 'Your expertise: daily tasks, appointments, and quick notes.',
      '/home': 'Your expertise: household tasks, calendars, and smart home.',
      '/dashboard': 'Your expertise: tasks, reminders, shopping, and daily planning.',
      '/dashboard/shopping': 'Your expertise: grocery lists, meal plans, and household supplies.',
    }
    
    const pageContext = pageContextMap[pathname || ''] || 'Your expertise: general home assistance.'
    
    return `${coreInstructions}\n\n${pageContext}`
  }

  const handleSpeak = async (text: string) => {
    logger.debug('handleSpeak called', { voiceEnabled, isSpeaking: isSpeakingRef.current, textLength: text.length })
    if (!voiceEnabled) {
      logger.warn('Voice is disabled, skipping TTS')
      return
    }
    if (isSpeakingRef.current) {
      logger.warn('Already speaking, skipping TTS')
      return
    }
    
    isSpeakingRef.current = true
    try {
      logger.debug('Calling ElevenLabs TTS with Rachel voice')
      await speak(text, {
        voice: 'Rachel', // ElevenLabs Rachel voice
        speed: 1.0,
      })
      logger.debug('TTS completed successfully')
    } catch (error) {
      logger.error('Voice engine error', error as Error)
    } finally {
      isSpeakingRef.current = false
    }
  }

  // Start listening (push-to-talk)
  const startListening = () => {
    if (!recognitionRef.current || mode === 'listening') return
    
    // Stop any ongoing recognition first
    try {
      recognitionRef.current.stop()
    } catch (e) {
      // Ignore - might not be running
    }
    
    // Start fresh (do NOT clear draft - append mode)
    try {
      setMode('listening')
      recognitionRef.current.start()
    } catch (error) {
      console.error('Error starting speech recognition:', error)
      onError?.('Could not start speech recognition. Please try typing instead.')
      setMode('idle')
    }
  }

  // Stop listening
  const stopListening = () => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop()
      } catch (e) {
        // Ignore - might not be running
      }
    }
    // Transition to preview if we have draft text, otherwise idle
    if (draftMessage.trim()) {
      setMode('preview')
    } else {
      setMode('idle')
    }
  }

  // Send message (from preview or typing mode)
  const sendMessage = async () => {
    const messageText = draftMessage.trim()
    if (!messageText && images.length === 0) return
    if (isProcessingRef.current || isProcessing || mode === 'listening') return
    
    console.log('📤 Sending message:', messageText.substring(0, 50))
    isProcessingRef.current = true

    // Add user message to chat history
    const userMessage: Message = {
      id: makeId(),
      role: 'user',
      text: messageText || (images.length > 0 ? '[Image]' : ''),
      timestamp: Date.now(),
    }
    pendingUserMessageIdRef.current = userMessage.id
    appendMessage(userMessage)
    
    // Clear draft and reset mode
    setDraftMessage('')
    setMode('idle')
    setIsProcessing(true)

    try {
      // Check for explicit meal preparation requests BEFORE AI classification (skip slow API call)
      const lowerInput = messageText.toLowerCase()
      const isMealPreparationRequest = 
        lowerInput.includes('prepare a meal') ||
        lowerInput.includes('prepare meal') ||
        lowerInput.includes('plan a meal') ||
        lowerInput.includes('make a meal') ||
        (lowerInput.includes('meal') && (lowerInput.includes('prepare') || lowerInput.includes('plan') || lowerInput.includes('make')))
      
      if (isMealPreparationRequest && pathname?.includes('/kitchen')) {
        // Skip AI classification, directly show meal preparation flow
        setShowMealPreparationFlow(true)
        const responseMessage: Message = {
          id: makeId(),
          role: 'assistant',
          text: 'Great! Let\'s prepare a meal together. Choose your meal type and protein preference.',
          timestamp: Date.now(),
        }
        appendMessage(responseMessage)
        handleSpeak(responseMessage.text)
        setIsProcessing(false)
        isProcessingRef.current = false
        return
      }

      // Get app context
      const context = getAppContext()
      const fullHistory = buildHistoryText([...messagesRef.current, userMessage])
      
      // Send to AI with context and images
      const response = await fetch('/api/ai/classify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          input: messageText || (images.length > 0 ? 'Analyze this image' : ''),
          context,
          history: fullHistory,
          images: images.length > 0 ? images : undefined,
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to classify input')
      }

      const data = await response.json()
      
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

      const intent: AIIntent = data.intent || data
      
      // Clear images after sending
      images.forEach((_, i) => {
        if (imagePreviews[i]) {
          URL.revokeObjectURL(imagePreviews[i])
        }
      })
      setImages([])
      setImagePreviews([])

      // Handle non-actionable responses (must be specific; no generic fallbacks)
      if (intent.type === 'clarification' || intent.type === 'unknown') {
        const responseText =
          intent.followUpQuestion?.trim() ||
          `I'm not sure what you want me to do with "${messageText || 'that'}". What outcome do you want?`

        const responseMessage: Message = {
          id: makeId(),
          role: 'assistant',
          text: responseText,
          timestamp: Date.now(),
        }
        appendMessage(responseMessage)
        handleSpeak(responseText)
        setIsProcessing(false)
        return
      }

      // NEW: Route intent to proposal (does NOT execute)
      const proposalResult = await routeIntentToProposal(intent, context)

      // Handle clarification/unknown from proposal
      if ('type' in proposalResult && (proposalResult.type === 'clarification' || proposalResult.type === 'unknown')) {
        const responseMessage: Message = {
          id: makeId(),
          role: 'assistant',
          text: proposalResult.message,
          timestamp: Date.now(),
        }
        appendMessage(responseMessage)
        handleSpeak(proposalResult.message)
        setIsProcessing(false)
        return
      }

      // NEW: Check if approval is required
      const proposal = proposalResult as ActionProposal
      
      // If proposal doesn't require approval (based on settings), execute immediately
      if (!proposal.requiresApproval) {
        // Auto-execute without confirmation
        try {
          // Enqueue then immediately approve and execute
          approvalQueue.enqueue(proposal.command)
          const token = approvalQueue.approve(proposal.command.id)
          const result = await commandExecutor.executeCommand(proposal.command, token)
          
          if (result.success) {
            const successMessage: Message = {
              id: makeId(),
              role: 'assistant',
              text: result.message,
              timestamp: Date.now(),
            }
            appendMessage(successMessage)
            handleSpeak(result.message)
            onIntent?.(proposal.command.entity, proposal.command.payload)
          } else {
            const errorMessage: Message = {
              id: makeId(),
              role: 'assistant',
              text: `Sorry, ${result.error || 'failed to execute command'}`,
              timestamp: Date.now(),
            }
            appendMessage(errorMessage)
            handleSpeak(errorMessage.text)
          }
        } catch (error) {
          console.error('Auto-execution failed:', error)
          const errorMessage: Message = {
            id: makeId(),
            role: 'assistant',
            text: 'Sorry, something went wrong.',
            timestamp: Date.now(),
          }
          appendMessage(errorMessage)
          handleSpeak(errorMessage.text)
        }
        setIsProcessing(false)
        return
      }
      
      // Approval required: Enqueue proposal for user confirmation
      enqueueProposal(proposal)
      
      // Show proposal in chat as assistant message
      const proposalMessage: Message = {
        id: makeId(),
        role: 'assistant',
        text: proposal.summary.description,
        timestamp: Date.now(),
      }
      appendMessage(proposalMessage)
      handleSpeak(proposal.summary.description)
      
      setIsProcessing(false)
    } catch (error) {
      console.error('Failed to process input:', error)
      const errorMessage: Message = {
        id: makeId(),
        role: 'assistant',
        text: 'Sorry, something went wrong. Please try again.',
        timestamp: Date.now(),
      }
      appendMessage(errorMessage)
      handleSpeak(errorMessage.text)
      onError?.('Sorry, something went wrong. Please try again.')
    } finally {
      setIsProcessing(false)
      isProcessingRef.current = false
      pendingUserMessageIdRef.current = null
      
      // Reset auto-send flag after message is fully processed
      setTimeout(() => {
        autoSendTriggeredRef.current = false
      }, 1000)
    }
  }

  // Handle image/file selection
  const handleImageSelect = async (file: File) => {
    if (!file.type.startsWith('image/')) {
      onError?.('Please select an image file')
      return
    }

    if (file.size > 10 * 1024 * 1024) {
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
      setShowMediaMenu(false)
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
  
  // Handle proposal approval
  const handleApprove = async (commandId: string) => {
    try {
      const result = await approve(commandId)
      
      if (result.success) {
        // Add success message to chat
        const successMessage: Message = {
          id: makeId(),
          role: 'assistant',
          text: result.message,
          timestamp: Date.now(),
        }
        appendMessage(successMessage)
        handleSpeak(result.message)
        
        // Call intent handler for UI updates
        if (pendingProposal) {
          onIntent?.(pendingProposal.command.entity, pendingProposal.command.payload)
        }
      } else {
        // Add error message to chat
        const errorMessage: Message = {
          id: makeId(),
          role: 'assistant',
          text: `Sorry, ${result.error || 'failed to execute command'}`,
          timestamp: Date.now(),
        }
        appendMessage(errorMessage)
        handleSpeak(errorMessage.text)
        onError?.(result.error || 'Failed to execute command')
      }
    } catch (error) {
      console.error('Approval execution failed:', error)
      const errorMessage: Message = {
        id: makeId(),
        role: 'assistant',
        text: 'Sorry, something went wrong executing that command.',
        timestamp: Date.now(),
      }
      appendMessage(errorMessage)
      handleSpeak(errorMessage.text)
    }
  }
  
  // Handle proposal rejection
  const handleReject = (commandId: string) => {
    reject(commandId)
    
    // Add cancellation message to chat
    const cancelMessage: Message = {
      id: makeId(),
      role: 'assistant',
      text: 'Okay, I cancelled that action. What else can I help you with?',
      timestamp: Date.now(),
    }
    appendMessage(cancelMessage)
    handleSpeak(cancelMessage.text)
  }

  // Auto-send effect: trigger sendMessage when in speech mode + preview mode
  useEffect(() => {
    if (speechMode && mode === 'preview' && draftMessage.trim() && !isProcessingRef.current && !autoSendTriggeredRef.current) {
      logger.debug('Speech mode: Auto-sending message')
      autoSendTriggeredRef.current = true
      
      // Small delay to ensure state is settled
      const timer = setTimeout(() => {
        sendMessage().catch(err => {
          logger.error('Auto-send failed', err as Error)
          autoSendTriggeredRef.current = false
        })
      }, 500)
      
      return () => clearTimeout(timer)
    }
    
    // Reset flag when leaving preview mode
    if (mode !== 'preview') {
      autoSendTriggeredRef.current = false
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [speechMode, mode, draftMessage])

  // ESC key to close console
  useEffect(() => {
    if (typeof window === 'undefined' || !isOpen) return
    
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !pendingProposal) {
        // Only close if no pending proposal (ConfirmationUI handles ESC for proposals)
        onClose()
      }
    }
    
    window.addEventListener('keydown', handleEscape)
    return () => window.removeEventListener('keydown', handleEscape)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, onClose, pendingProposal])

  // Debug: Log when overlay is rendered
  useEffect(() => {
    if (typeof window === 'undefined' || !document.body) return
    
    if (isOpen) {
      logger.debug('AI Chat Console is OPEN')
      // Add body class to indicate modal is open
      document.body.classList.add('modal-open')
    } else {
      logger.debug('AI Chat Console is CLOSED')
      document.body.classList.remove('modal-open')
    }
    
    return () => {
      if (typeof window !== 'undefined' && document.body) {
        document.body.classList.remove('modal-open')
      }
    }
  }, [isOpen])
  
  // Emergency close function accessible from window
  useEffect(() => {
    if (typeof window === 'undefined') return
    
    (window as any).closeAIConsole = () => {
      logger.debug('Emergency close triggered')
      onClose()
    }
    
    return () => {
      if (typeof window !== 'undefined') {
        delete (window as any).closeAIConsole
      }
    }
  }, [onClose])

  // Floating button (when closed) - only if using internal state
  if (!isOpen) {
    // Only show floating button if no external control (self-managed)
    if (externalIsOpen !== undefined) return null
    
    // Don't render floating button during SSR (prevents hydration errors)
    if (!mounted) return null
    
    return (
      <button
        onClick={() => setInternalIsOpen(true)}
        className="fixed bottom-20 right-6 w-16 h-16 rounded-full text-white shadow-lg transition-all duration-250 flex items-center justify-center z-40 hover:scale-110 active:scale-95"
        style={{ 
          bottom: 'calc(64px + 1rem)',
          backgroundColor: 'var(--accent-primary)',
          boxShadow: '0 10px 40px rgba(139, 158, 255, 0.4)'
        }}
        title="Open AI Assistant"
      >
        <Mic className="w-6 h-6" strokeWidth={1.5} />
      </button>
    )
  }

  // Determine if Send button should be enabled
  const canSend = (draftMessage.trim() || images.length > 0) && mode !== 'listening' && !isProcessing;

  return (
    <AppModal 
      isOpen={isOpen} 
      onClose={onClose} 
      variant="center" 
      className="glass-card w-full max-w-2xl max-h-[90vh] flex flex-col p-0"
      style={{ backgroundColor: 'var(--bg-elevated)' }}
    >
        {/* Header */}
        <div 
          className="flex items-center justify-between p-4 flex-shrink-0"
          style={{ borderBottom: '1px solid var(--glass-border)' }}
        >
          <h2 id="modal-title" className="text-xl font-semibold" style={{ color: 'var(--text-primary)' }}>Abby</h2>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => {
                const newSpeechMode = !speechMode
                setSpeechMode(newSpeechMode)
                // Auto-enable voice when entering speech mode
                if (newSpeechMode) {
                  setVoiceEnabled(true)
                }
              }}
              className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all duration-250 ${
                speechMode
                  ? ''
                  : ''
              }`}
              style={{
                backgroundColor: speechMode ? 'rgba(74, 222, 128, 0.2)' : 'rgba(255, 255, 255, 0.1)',
                color: speechMode ? 'var(--success)' : 'var(--text-muted)',
                border: speechMode ? '1px solid rgba(74, 222, 128, 0.3)' : '1px solid transparent'
              }}
              title={speechMode ? 'Speech Mode ON (Auto-send + Auto-speak)' : 'Speech Mode OFF'}
            >
              {speechMode ? '🎙️ ON' : '🎙️'}
            </button>
            <button
              type="button"
              onClick={() => setVoiceEnabled(!voiceEnabled)}
              className="px-3 py-1.5 rounded-full text-sm transition-all duration-250"
              style={{
                backgroundColor: voiceEnabled ? 'rgba(139, 158, 255, 0.2)' : 'rgba(255, 255, 255, 0.1)',
                color: voiceEnabled ? 'var(--accent-primary)' : 'var(--text-muted)'
              }}
              title={voiceEnabled ? 'Voice Responses On' : 'Voice Responses Off'}
            >
              🔊
            </button>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation()
                onClose()
              }}
              className="p-2 transition-colors duration-250 hover:bg-white/10 rounded-full"
              style={{ color: 'var(--text-muted)' }}
              title="Close"
            >
              <X className="w-5 h-5" strokeWidth={2} />
            </button>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 min-h-0">
          {messages.length === 0 && (
            <div className="text-center py-8" style={{ color: 'var(--text-muted)' }}>
              <p className="text-sm">Start a conversation</p>
              <p className="text-xs mt-2">Type a message, use the microphone, or attach an image</p>
            </div>
          )}
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className="max-w-[80%] rounded-2xl px-4 py-2"
                style={{
                  backgroundColor: message.role === 'user' ? 'var(--accent-primary)' : 'rgba(255, 255, 255, 0.1)',
                  color: message.role === 'user' ? 'white' : 'var(--text-primary)'
                }}
              >
                <p className="text-sm whitespace-pre-wrap">{message.text}</p>
              </div>
            </div>
          ))}
          {isProcessing && (
            <div className="flex justify-start">
              <div 
                className="rounded-2xl px-4 py-2"
                style={{ backgroundColor: 'rgba(255, 255, 255, 0.1)' }}
              >
                <div className="flex gap-1">
                  <div className="w-2 h-2 rounded-full animate-bounce" style={{ backgroundColor: 'var(--text-muted)' }}></div>
                  <div className="w-2 h-2 rounded-full animate-bounce" style={{ backgroundColor: 'var(--text-muted)', animationDelay: '0.1s' }}></div>
                  <div className="w-2 h-2 rounded-full animate-bounce" style={{ backgroundColor: 'var(--text-muted)', animationDelay: '0.2s' }}></div>
                </div>
              </div>
            </div>
          )}
          {/* Confirmation UI for pending proposal */}
          {pendingProposal && (
            <div className="flex justify-start">
              <div className="max-w-[90%]">
                <ConfirmationUI
                  proposal={pendingProposal}
                  onApprove={handleApprove}
                  onReject={handleReject}
                  isProcessing={isExecuting}
                />
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Meal Preparation Flow Overlay */}
        {showMealPreparationFlow && (
          <div 
            className="fixed inset-0 flex items-center justify-center p-4 z-[100]"
            style={{ backgroundColor: 'rgba(0, 0, 0, 0.75)', backdropFilter: 'blur(8px)' }}
          >
            <div className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              <MealPreparationFlow
                onComplete={async (meal) => {
                  try {
                    // Save meal to weeklyMeals
                    const stored = localStorage.getItem('weeklyMeals')
                    const weeklyMeals: any[] = stored ? JSON.parse(stored) : []
                    weeklyMeals.push(meal)
                    localStorage.setItem('weeklyMeals', JSON.stringify(weeklyMeals))
                    
                    // Dispatch event to notify other components
                    window.dispatchEvent(new Event('mealsUpdated'))
                    
                    // Add small delay to ensure save completes before closing
                    await new Promise(resolve => setTimeout(resolve, 100))
                    
                    // Add ingredients to shopping list
                    if (meal.ingredients && meal.ingredients.length > 0) {
                      const ingredientNames = meal.ingredients.map((ing: any) => ing.name.toLowerCase().trim())
                      const uniqueIngredients = Array.from(new Set(ingredientNames))
                      
                      await fetch('/api/shopping/add', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ 
                          items: uniqueIngredients,
                          category: 'pantry'
                        })
                      })
                    }
                    
                    setShowMealPreparationFlow(false)
                    setIsProcessing(false)
                    isProcessingRef.current = false
                    
                    const successMessage: Message = {
                      id: makeId(),
                      role: 'assistant',
                      text: `Perfect! I've added "${meal.title}" to your meal plan and added the ingredients to your shopping list. Want to plan another meal?`,
                      timestamp: Date.now(),
                    }
                    appendMessage(successMessage)
                    handleSpeak(successMessage.text)
                    onIntent?.('meals', meal)
                  } catch (error) {
                    console.error('Failed to save meal:', error)
                    const errorMessage: Message = {
                      id: makeId(),
                      role: 'assistant',
                      text: 'Sorry, I had trouble saving that meal. Please try again.',
                      timestamp: Date.now(),
                    }
                    appendMessage(errorMessage)
                    handleSpeak(errorMessage.text)
                  }
                }}
                onCancel={() => {
                  setShowMealPreparationFlow(false)
                  const cancelMessage: Message = {
                    id: makeId(),
                    role: 'assistant',
                    text: 'No problem! Let me know when you\'re ready to plan a meal.',
                    timestamp: Date.now(),
                  }
                  appendMessage(cancelMessage)
                  handleSpeak(cancelMessage.text)
                }}
              />
            </div>
          </div>
        )}

        {/* Image Previews */}
        {imagePreviews.length > 0 && (
          <div className="px-4 pb-2 flex gap-2 flex-wrap flex-shrink-0">
            {imagePreviews.map((preview, index) => (
              <div key={index} className="relative w-20 h-20">
                <Image
                  src={preview}
                  alt={`Preview ${index + 1}`}
                  fill
                  className="object-cover rounded-lg"
                  style={{ border: '1px solid var(--glass-border)' }}
                  unoptimized
                />
                <button
                  onClick={() => removeImage(index)}
                  className="absolute -top-2 -right-2 text-white rounded-full p-1 transition-colors duration-250 hover:opacity-80"
                  style={{ backgroundColor: 'var(--error)' }}
                  type="button"
                >
                  <X className="w-3 h-3" strokeWidth={2} />
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Input Bar - FIXED LAYOUT (no jumping during listening) */}
        <div 
          className="p-4 flex-shrink-0"
          style={{ 
            borderTop: '1px solid var(--glass-border)',
            backgroundColor: 'var(--bg-elevated)'
          }}
        >
          {/* Mode indicator */}
          {mode === 'listening' && (
            <div className="mb-2 flex items-center gap-2 text-sm" style={{ color: 'var(--accent-primary)' }}>
              <Mic className="w-4 h-4 animate-pulse" strokeWidth={2} />
              <span>Listening...</span>
            </div>
          )}
          {mode === 'preview' && (
            <div className="mb-2 text-xs" style={{ color: 'var(--text-muted)' }}>
              Review and edit your message, then tap Send
            </div>
          )}

          {/* Input Form */}
          <form
            onSubmit={(e) => {
              e.preventDefault()
              if (canSend) {
                sendMessage()
              }
            }}
          >
            <div className="flex gap-2 items-end">
              {/* Input Field - Fixed height to prevent layout jumps */}
              <div className="flex-1 relative" style={{ minHeight: '44px' }}>
                <input
                  ref={inputRef}
                  type="text"
                  value={draftMessage}
                  autoFocus
                  onChange={(e) => {
                    setDraftMessage(e.target.value)
                    // Switch to typing mode when user starts typing
                    if (mode === 'idle' || mode === 'preview') {
                      setMode('typing')
                    }
                  }}
                  onPaste={(e) => {
                    // Check if clipboard contains files/images
                    const items = e.clipboardData?.items
                    if (!items) return
                    
                    for (let i = 0; i < items.length; i++) {
                      const item = items[i]
                      
                      // Check if item is an image
                      if (item.type.startsWith('image/')) {
                        e.preventDefault() // Prevent default paste for images
                        
                        const file = item.getAsFile()
                        if (file) {
                          handleImageSelect(file)
                        }
                        return
                      }
                    }
                    // If no image, allow normal text paste (handled by onChange)
                  }}
                  onKeyDown={(e) => {
                    // Allow all keyboard shortcuts (Ctrl/Cmd+V, etc.)
                    if (e.key === 'Enter' && !e.shiftKey && canSend) {
                      e.preventDefault()
                      sendMessage()
                    }
                  }}
                  onFocus={() => {
                    if (mode === 'idle') {
                      setMode('typing')
                    }
                  }}
                  placeholder={
                    mode === 'listening'
                      ? 'Listening...'
                      : mode === 'preview'
                      ? 'Review your message...'
                      : 'Type a message...'
                  }
                  className="w-full px-4 py-3 pr-20 rounded-xl focus:outline-none focus:ring-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  style={{
                    backgroundColor: 'var(--input-bg)',
                    border: '1px solid var(--input-border)',
                    color: 'var(--text-primary)',
                    height: '44px'
                  }}
                  disabled={isProcessing || mode === 'listening' || showMealPreparationFlow}
                  readOnly={false}
                />
                <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
                  {/* + Button for Media */}
                  <div className="relative">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.preventDefault()
                        setShowMediaMenu(!showMediaMenu)
                      }}
                      disabled={isProcessing || mode === 'listening'}
                      className="p-2 rounded-lg transition-colors duration-250 disabled:opacity-50"
                      style={{ 
                        backgroundColor: 'rgba(255, 255, 255, 0.1)',
                        color: 'var(--text-secondary)'
                      }}
                      title="Add media"
                    >
                      <Plus className="w-4 h-4" strokeWidth={2} />
                    </button>
                    {/* Media Menu */}
                    {showMediaMenu && (
                      <div 
                        className="absolute bottom-full right-0 mb-2 rounded-xl p-2 min-w-[160px] z-10"
                        style={{
                          backgroundColor: 'var(--bg-elevated)',
                          border: '1px solid var(--glass-border)',
                          boxShadow: '0 10px 40px rgba(0, 0, 0, 0.3)'
                        }}
                      >
                        <button
                          type="button"
                          onClick={() => {
                            cameraInputRef.current?.click()
                            setShowMediaMenu(false)
                          }}
                          className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-left text-sm transition-colors duration-250 hover:bg-white/5"
                          style={{ color: 'var(--text-primary)' }}
                        >
                          <Camera className="w-4 h-4" strokeWidth={1.5} />
                          <span>Take Photo</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            fileInputRef.current?.click()
                            setShowMediaMenu(false)
                          }}
                          className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-left text-sm transition-colors duration-250 hover:bg-white/5"
                          style={{ color: 'var(--text-primary)' }}
                        >
                          <ImageIcon className="w-4 h-4" strokeWidth={1.5} />
                          <span>Upload Image</span>
                        </button>
                        <button
                          type="button"
                          disabled
                          className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-left text-sm opacity-50 cursor-not-allowed"
                          style={{ color: 'var(--text-muted)' }}
                        >
                          <FileText className="w-4 h-4" strokeWidth={1.5} />
                          <span>Upload File</span>
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Microphone Button (Push-to-Talk) */}
              {mode !== 'listening' && (
                <button
                  type="button"
                  onClick={startListening}
                  disabled={isProcessing}
                  className="px-4 py-3 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-250 hover:bg-white/15"
                  style={{ 
                    height: '44px', 
                    width: '44px',
                    backgroundColor: 'rgba(255, 255, 255, 0.1)',
                    color: 'var(--text-secondary)'
                  }}
                  title="Hold to talk"
                >
                  <Mic className="w-5 h-5" strokeWidth={1.5} />
                </button>
              )}

              {/* Stop Button (when listening) */}
              {mode === 'listening' && (
                <button
                  type="button"
                  onClick={stopListening}
                  className="px-4 py-3 rounded-xl text-white transition-colors duration-250 animate-pulse"
                  style={{ 
                    height: '44px', 
                    width: '44px',
                    backgroundColor: 'var(--error)'
                  }}
                  title="Stop recording"
                >
                  <Square className="w-5 h-5" strokeWidth={2} />
                </button>
              )}

              {/* Send Button (when in preview or typing with content) */}
              {mode !== 'listening' && (
                <button
                  type="submit"
                  disabled={!canSend}
                  className="px-6 py-3 rounded-xl text-white disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-250 hover:shadow-lg active:scale-[0.98]"
                  style={{ 
                    height: '44px',
                    backgroundColor: 'var(--accent-primary)',
                    boxShadow: '0 4px 15px rgba(139, 158, 255, 0.3)'
                  }}
                >
                  <Send className="w-5 h-5" strokeWidth={2} />
                </button>
              )}
            </div>
          </form>

          {/* Hidden file inputs */}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={(e) => {
              const file = e.target.files?.[0]
              if (file) {
                handleImageSelect(file)
              }
              e.target.value = ''
            }}
            className="hidden"
          />
          <input
            ref={cameraInputRef}
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
    </AppModal>
  )
}

export default function AIChatConsole(props: AIChatConsoleProps) {
  return (
    <FeatureErrorBoundary featureName="AI Assistant">
      <AIChatConsoleContent {...props} />
    </FeatureErrorBoundary>
  )
}

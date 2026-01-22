/**
 * Voice Engine Abstraction Layer
 * 
 * Provides a unified interface for text-to-speech across different providers.
 * Currently uses OpenAI TTS as the primary engine.
 * ElevenLabs is available but disabled for future optional use.
 */

export type VoiceEngine = 'openai' | 'elevenlabs' | 'browser'

export interface VoiceOptions {
  voice?: string
  speed?: number
  model?: string
}

export interface VoiceEngineInterface {
  speak(text: string, options?: VoiceOptions): Promise<void>
  cancel(): void
  isAvailable(): boolean
}

class OpenAIVoiceEngine implements VoiceEngineInterface {
  private audioRef: HTMLAudioElement | null = null
  private isSpeaking: boolean = false

  async speak(text: string, options?: VoiceOptions): Promise<void> {
    // Cancel any ongoing speech
    this.cancel()

    this.isSpeaking = true

    try {
      const response = await fetch('/api/ai/voice', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          text,
          voice: options?.voice || 'alloy',
          speed: options?.speed || 1.0,
        }),
      })

      if (!response.ok) {
        // Check if it's an auth error (401/403) - do NOT retry
        if (response.status === 401 || response.status === 403) {
          console.warn('⚠️ OpenAI TTS authentication failed. Voice is disabled until you set a valid API key.')
          throw new Error('OPENAI_AUTH_FAILED')
        }
        throw new Error(`OpenAI TTS failed with status ${response.status}`)
      }

      const audioBlob = await response.blob()
      const audioUrl = URL.createObjectURL(audioBlob)

      this.audioRef = new Audio(audioUrl)
      
      this.audioRef.onended = () => {
        this.isSpeaking = false
        URL.revokeObjectURL(audioUrl)
        this.audioRef = null
      }

      this.audioRef.onerror = () => {
        this.isSpeaking = false
        URL.revokeObjectURL(audioUrl)
        this.audioRef = null
        throw new Error('Audio playback failed')
      }

      await this.audioRef.play()
    } catch (error) {
      this.isSpeaking = false
      // Only log auth errors once, not every time
      if (error instanceof Error && error.message === 'OPENAI_AUTH_FAILED') {
        // Silent fail for auth - already logged warning above
      } else {
        console.error('OpenAI voice error:', error)
      }
      throw error
    }
  }

  cancel(): void {
    if (this.audioRef) {
      this.audioRef.pause()
      this.audioRef.currentTime = 0
      this.audioRef = null
    }
    this.isSpeaking = false
  }

  isAvailable(): boolean {
    return true // OpenAI is always available if API key is configured
  }
}

class ElevenLabsVoiceEngine implements VoiceEngineInterface {
  private audioRef: HTMLAudioElement | null = null
  private isSpeaking: boolean = false

  async speak(text: string, options?: VoiceOptions): Promise<void> {
    // Cancel any ongoing speech
    this.cancel()

    this.isSpeaking = true

    try {
      const response = await fetch('/api/ai/voice/elevenlabs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          text,
          voice: options?.voice || 'Rachel',
          model: options?.model || 'eleven_multilingual_v2',
        }),
      })

      if (!response.ok) {
        // Check if it's an auth error (401/403) - do NOT retry
        if (response.status === 401 || response.status === 403) {
          console.warn('⚠️ ElevenLabs TTS authentication failed. Voice is disabled until you set a valid API key.')
          throw new Error('ELEVENLABS_AUTH_FAILED')
        }
        throw new Error(`ElevenLabs TTS failed with status ${response.status}`)
      }

      const audioBlob = await response.blob()
      const audioUrl = URL.createObjectURL(audioBlob)

      this.audioRef = new Audio(audioUrl)
      
      this.audioRef.onended = () => {
        this.isSpeaking = false
        URL.revokeObjectURL(audioUrl)
        this.audioRef = null
      }

      this.audioRef.onerror = () => {
        this.isSpeaking = false
        URL.revokeObjectURL(audioUrl)
        this.audioRef = null
        throw new Error('Audio playback failed')
      }

      await this.audioRef.play()
    } catch (error) {
      this.isSpeaking = false
      // Only log auth errors once, not every time
      if (error instanceof Error && error.message === 'ELEVENLABS_AUTH_FAILED') {
        // Silent fail for auth - already logged warning above
      } else {
        console.error('ElevenLabs voice error:', error)
      }
      throw error
    }
  }

  cancel(): void {
    if (this.audioRef) {
      this.audioRef.pause()
      this.audioRef.currentTime = 0
      this.audioRef = null
    }
    this.isSpeaking = false
  }

  isAvailable(): boolean {
    return true // ElevenLabs is available if API key is configured
  }
}

class BrowserVoiceEngine implements VoiceEngineInterface {
  private synthesis: SpeechSynthesis | null = null
  private utterance: SpeechSynthesisUtterance | null = null

  constructor() {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      this.synthesis = window.speechSynthesis
    }
  }

  async speak(text: string, options?: VoiceOptions): Promise<void> {
    if (!this.synthesis) {
      throw new Error('Browser TTS not available')
    }

    this.cancel()

    this.utterance = new SpeechSynthesisUtterance(text)
    this.utterance.rate = options?.speed || 1.0
    this.utterance.pitch = 1.0
    this.utterance.volume = 1.0

    return new Promise((resolve, reject) => {
      if (!this.utterance) return

      this.utterance.onend = () => {
        this.utterance = null
        resolve()
      }

      this.utterance.onerror = (error) => {
        this.utterance = null
        reject(error)
      }

      this.synthesis!.speak(this.utterance)
    })
  }

  cancel(): void {
    if (this.synthesis) {
      this.synthesis.cancel()
    }
    this.utterance = null
  }

  isAvailable(): boolean {
    return typeof window !== 'undefined' && 'speechSynthesis' in window
  }
}

/**
 * Voice Engine Factory
 * Returns the appropriate voice engine based on configuration
 */
class VoiceEngineFactory {
  private static instance: VoiceEngineInterface | null = null
  private static engineType: VoiceEngine = 'elevenlabs'

  static getInstance(): VoiceEngineInterface {
    if (!this.instance) {
      switch (this.engineType) {
        case 'openai':
          this.instance = new OpenAIVoiceEngine()
          break
        case 'elevenlabs':
          this.instance = new ElevenLabsVoiceEngine()
          break
        case 'browser':
          this.instance = new BrowserVoiceEngine()
          break
        default:
          this.instance = new OpenAIVoiceEngine()
      }
    }
    return this.instance
  }

  static setEngine(engine: VoiceEngine): void {
    this.engineType = engine
    this.instance = null // Reset instance to create new one
  }

  static getCurrentEngine(): VoiceEngine {
    return this.engineType
  }
}

/**
 * Main Voice Engine Export
 * Use this to speak text throughout the application
 */
export const voiceEngine = VoiceEngineFactory.getInstance()

/**
 * Speak text using the configured voice engine
 * 
 * @param text - The text to speak
 * @param options - Optional voice settings (voice, speed, model)
 */
export async function speak(text: string, options?: VoiceOptions): Promise<void> {
  const engine = VoiceEngineFactory.getInstance()
  
  // Fallback chain: OpenAI -> Browser
  try {
    await engine.speak(text, options)
  } catch (error) {
    // If OpenAI auth failed, skip fallback (user needs to fix key)
    if (error instanceof Error && error.message === 'OPENAI_AUTH_FAILED') {
      // Silent fail - do NOT spam console or try browser fallback
      return
    }
    
    console.warn('Primary voice engine failed, trying browser fallback:', error)
    
    // Fallback to browser TTS if primary fails
    if (engine instanceof OpenAIVoiceEngine) {
      const browserEngine = new BrowserVoiceEngine()
      if (browserEngine.isAvailable()) {
        await browserEngine.speak(text, options)
      } else {
        throw new Error('No voice engine available')
      }
    } else {
      throw error
    }
  }
}

/**
 * Cancel any ongoing speech
 */
export function cancelSpeech(): void {
  const engine = VoiceEngineFactory.getInstance()
  engine.cancel()
}

/**
 * Check if voice is available
 */
export function isVoiceAvailable(): boolean {
  const engine = VoiceEngineFactory.getInstance()
  return engine.isAvailable()
}

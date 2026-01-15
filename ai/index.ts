/**
 * AI Module - Main exports
 * Central export point for the AI foundation
 */

// Schemas
export * from './schemas/intentSchema'
export * from './schemas/routerSchema'

// Core AI functions
export { interpretInput } from './aiInterpreter'
export { generateClarification, needsClarification } from './aiClarifier'
export { routeIntent } from './aiRouter'

// GPT Reasoning Engine (PRIMARY)
export { reasonWithGPT } from './gptReasoning'
export type { GPTReasoningResult } from './gptReasoning'

// Utils
export * from './aiUtils'

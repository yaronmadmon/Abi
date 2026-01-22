import { NextRequest, NextResponse } from 'next/server'
import { reasonWithGPT } from '@/ai/gptReasoning'
import type { AIIntent } from '@/ai/schemas/intentSchema'
import { logger } from '@/lib/logger'

export const runtime = 'nodejs'

/**
 * AI Classification Endpoint
 * 
 * ARCHITECTURE UPGRADE: GPT as PRIMARY reasoning engine
 * 
 * Input: raw user text
 * Output: structured AIIntent (converted from GPT reasoning result)
 * 
 * Flow:
 * 1. Send user input to GPT reasoning engine
 * 2. GPT returns structured result (action, data, missing_fields)
 * 3. Convert GPT result to AIIntent format
 * 4. If missing_fields is empty → return intent ready for execution
 * 5. If missing_fields has entries → return clarification intent with specific question
 * 
 * No side effects - pure interpretation only
 * Does not route - only interprets
 */
export async function POST(request: NextRequest) {
  let userInput = '';
  try {
    const { input, context, history, images } = await request.json()
    userInput = input || '';

    if (!input || typeof input !== 'string') {
      return NextResponse.json(
        { error: 'Invalid input. Expected a string.' },
        { status: 400 }
      )
    }

    // Build a clean, combined context string:
    // - app context (screen/module)
    // - message history (User/Assistant turns)
    const combinedContextParts: string[] = []
    if (typeof context === 'string' && context.trim()) combinedContextParts.push(`App context: ${context.trim()}`)
    if (typeof history === 'string' && history.trim()) combinedContextParts.push(`Conversation:\n${history.trim()}`)
    const combinedContext = combinedContextParts.length ? combinedContextParts.join('\n\n') : undefined

    // Step 2: Use GPT as PRIMARY reasoning engine for intent classification (with vision support if images provided)
    logger.debug('🧠 GPT Reasoning', { input, imageCount: images?.length || 0 });
    const reasoningResult = await reasonWithGPT(input, combinedContext, images);
    logger.debug('✅ GPT Reasoning Result', { result: reasoningResult });

    // Step 3: Convert GPT reasoning result to AIIntent format
    const intent = convertReasoningToIntent(reasoningResult, input);

    // Step 4: Return intent
    return NextResponse.json({ intent });
  } catch (error) {
    logger.error('AI classification error', error as Error)
    
    // Check if error is due to missing OpenAI API key
    const errorMessage = error instanceof Error ? error.message : String(error)
    const isMissingApiKey = errorMessage.includes('OPENAI_API_KEY environment variable is not set')
    
    return NextResponse.json(
      { 
        error: isMissingApiKey 
          ? 'OPENAI_API_KEY environment variable is not set. Please add it to your .env.local file and restart the server. See SETUP_OPENAI_KEY.md for instructions.'
          : 'Failed to classify input',
        intent: {
          type: 'unknown',
          confidence: 0,
          raw: userInput,
          followUpQuestion: isMissingApiKey
            ? 'OpenAI API key is not configured. Please check SETUP_OPENAI_KEY.md for setup instructions.'
            : 'Sorry, I encountered an error. Could you try rephrasing that?'
        } as AIIntent
      },
      { status: 500 }
    )
  }
}

/**
 * Convert GPT reasoning result to AIIntent format
 * PROACTIVE: Executes if we have minimum required data, even if some fields are missing
 */
function convertReasoningToIntent(
  reasoning: any,
  rawInput: string
): AIIntent {
  // PROACTIVE RULE: If we have data AND minimum required fields, execute immediately
  // Only ask for clarification if data is missing AND execution would fail
  
  // Check if we have minimum data to execute
  const hasMinimumData = reasoning.data && hasRequiredFields(reasoning.action, reasoning.data);
  
  // If we have minimum data, execute even if missing_fields has entries (those are optional fields)
  if (hasMinimumData && reasoning.action !== 'clarification' && reasoning.action !== 'unknown') {
    // Execute with what we have - missing_fields are just optional fields
    const actionToType: Record<string, AIIntent['type']> = {
      'create_task': 'task',
      'create_meal': 'meal',
      'create_shopping': 'shopping',
      'create_reminder': 'reminder',
      'create_appointment': 'appointment',
      'create_family': 'family',
      'create_pet': 'pet',
    };

    const intentType = actionToType[reasoning.action] || 'unknown';
    
    return {
      type: intentType,
      confidence: reasoning.confidence || 0.8,
      raw: rawInput,
      payload: reasoning.data || undefined,
    };
  }
  
  // Only ask for clarification if we truly can't execute
  if (reasoning.missing_fields && reasoning.missing_fields.length > 0) {
    const question = reasoning.missing_fields[0];
    
    // Never use generic questions
    if (!question || question.toLowerCase().includes('can you clarify') || question.toLowerCase().includes('provide more details')) {
      // If GPT gave generic question, make it specific or execute anyway
      if (reasoning.data && reasoning.action !== 'clarification' && reasoning.action !== 'unknown') {
        // Try to execute with what we have
        const actionToType: Record<string, AIIntent['type']> = {
          'create_task': 'task',
          'create_meal': 'meal',
          'create_shopping': 'shopping',
          'create_reminder': 'reminder',
          'create_appointment': 'appointment',
          'create_family': 'family',
          'create_pet': 'pet',
        };
        const intentType = actionToType[reasoning.action];
        if (intentType) {
          return {
            type: intentType,
            confidence: reasoning.confidence || 0.7,
            raw: rawInput,
            payload: reasoning.data,
          };
        }
      }
      
      return {
        type: 'unknown',
        confidence: 0.3,
        raw: rawInput,
        followUpQuestion: 'I\'m not quite sure what you need. Could you tell me more?',
      };
    }
    
    return {
      type: 'clarification',
      confidence: reasoning.confidence || 0.5,
      raw: rawInput,
      followUpQuestion: question,
    };
  }

  // If action is clarification or unknown
  if (reasoning.action === 'clarification' || reasoning.action === 'unknown') {
    const question = reasoning.missing_fields?.[0] || reasoning.reasoning;
    
    // NEVER use generic fallback
    if (!question || question.includes('provide more details')) {
      return {
        type: 'unknown',
        confidence: 0.3,
        raw: rawInput,
        followUpQuestion: 'I\'m not quite sure what you need. Could you tell me more?',
      };
    }
    
    return {
      type: reasoning.action === 'clarification' ? 'clarification' : 'unknown',
      confidence: reasoning.confidence || 0.3,
      raw: rawInput,
      followUpQuestion: question,
    };
  }

  // Map GPT action to intent type
  const actionToType: Record<string, AIIntent['type']> = {
    'create_task': 'task',
    'create_meal': 'meal',
    'create_shopping': 'shopping',
    'create_reminder': 'reminder',
    'create_appointment': 'appointment',
    'create_family': 'family',
    'create_pet': 'pet',
  };

  const intentType = actionToType[reasoning.action] || 'unknown';

  // Return intent with payload - execute immediately
  return {
    type: intentType,
    confidence: reasoning.confidence || 0.8,
    raw: rawInput,
    payload: reasoning.data || undefined,
  };
}

/**
 * Check if we have minimum required fields to execute an action
 */
function hasRequiredFields(action: string, data: any): boolean {
  if (!data) return false;
  
  switch (action) {
    case 'create_task':
      return !!(data.title && data.title.trim());
    case 'create_meal':
      return !!(data.name && data.name.trim());
    case 'create_shopping':
      return !!(data.items && Array.isArray(data.items) && data.items.length > 0);
    case 'create_reminder':
      return !!(data.title && data.title.trim());
    case 'create_appointment':
      return !!(data.title && data.title.trim());
    case 'create_family':
      return !!(data.name && data.name.trim());
    case 'create_pet':
      return !!(data.name && data.name.trim() && data.type);
    default:
      return false;
  }
}

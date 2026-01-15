import { NextRequest, NextResponse } from 'next/server'
import { reasonWithGPT, generateConversationalResponse, isConversationalInput } from '@/ai/gptReasoning'
import type { AIIntent } from '@/ai/schemas/intentSchema'

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
    const { input, context, images, conversationalMode } = await request.json()
    userInput = input || '';

    if (!input || typeof input !== 'string') {
      return NextResponse.json(
        { error: 'Invalid input. Expected a string.' },
        { status: 400 }
      )
    }

    // Step 1: Check if this is conversational input or in conversational mode
    const isConversational = conversationalMode || isConversationalInput(input);
    
    if (isConversational) {
      // Generate natural GPT response instead of intent classification
      console.log('💬 Conversational Mode: Generating GPT response');
      const gptResponse = await generateConversationalResponse(input, context, images);
      console.log('✅ GPT Response:', gptResponse);
      
      // Return as a conversational intent
      return NextResponse.json({
        intent: {
          type: 'clarification' as const, // Use clarification type but with GPT response
          confidence: 1.0,
          raw: input,
          followUpQuestion: gptResponse, // GPT's natural response
          isConversational: true, // Flag to indicate this is a GPT response, not a clarification request
        } as AIIntent & { isConversational?: boolean }
      });
    }

    // Step 2: Use GPT as PRIMARY reasoning engine for intent classification (with vision support if images provided)
    console.log('🧠 GPT Reasoning:', input, images ? `with ${images.length} image(s)` : '');
    const reasoningResult = await reasonWithGPT(input, context, images);
    console.log('✅ GPT Reasoning Result:', reasoningResult);

    // Step 3: Convert GPT reasoning result to AIIntent format
    const intent = convertReasoningToIntent(reasoningResult, input);

    // Step 4: Return intent
    return NextResponse.json({ intent });
  } catch (error) {
    console.error('AI classification error:', error)
    return NextResponse.json(
      { 
        error: 'Failed to classify input',
        intent: {
          type: 'unknown',
          confidence: 0,
          raw: userInput,
          followUpQuestion: 'Sorry, I encountered an error. Could you try rephrasing that?'
        } as AIIntent
      },
      { status: 500 }
    )
  }
}

/**
 * Convert GPT reasoning result to AIIntent format
 */
function convertReasoningToIntent(
  reasoning: any,
  rawInput: string
): AIIntent {
  // If clarification is needed (missing_fields has entries)
  if (reasoning.missing_fields && reasoning.missing_fields.length > 0) {
    // Use the first missing field as the specific question
    // GPT should provide specific questions, not generic ones
    const question = reasoning.missing_fields[0];
    
    // NEVER use generic fallback - if GPT didn't provide a question, generate one with GPT
    if (!question || question === 'Could you provide more details?') {
      // This shouldn't happen if GPT is working correctly, but handle gracefully
      return {
        type: 'unknown',
        confidence: 0.3,
        raw: rawInput,
        followUpQuestion: 'I need a bit more information to help you. Could you tell me more?',
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

  // Return intent with payload
  return {
    type: intentType,
    confidence: reasoning.confidence || 0.8,
    raw: rawInput,
    payload: reasoning.data || undefined,
  };
}

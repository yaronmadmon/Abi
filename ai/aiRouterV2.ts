/**
 * AI Router V2 - Proposal-Based Architecture
 * Routes interpreted intents to command proposals (NOT direct execution)
 * 
 * ARCHITECTURAL GUARANTEE:
 * This router ONLY creates proposals. It has NO capability to execute commands or mutate state.
 * All state mutations require explicit user approval through the confirmation UI.
 */

import type { AIIntent } from "./schemas/intentSchema";
import type { ActionProposal } from "./schemas/commandSchema";
import { createCommandFromIntent, generateProposal, shouldRequireApproval } from "./factories/commandFactory";

/**
 * Route intent to proposal
 * Returns a proposal that requires user approval before execution
 */
export async function routeIntentToProposal(
  intent: AIIntent,
  context?: string,
  settings?: any
): Promise<ActionProposal | { type: 'clarification' | 'unknown', message: string }> {
  // Handle non-actionable intents
  if (intent.type === 'clarification') {
    return {
      type: 'clarification',
      message: intent.followUpQuestion || "I need a bit more information to help you.",
    };
  }

  if (intent.type === 'unknown') {
    return {
      type: 'unknown',
      message: intent.followUpQuestion ||
        `I'm not sure what you want me to do with "${intent.raw || 'that'}". Do you want to add a task, appointment, reminder, meal, or shopping item?`,
    };
  }

  try {
    // Create command from intent
    const command = createCommandFromIntent(intent, context);
    
    // Determine if approval is required
    const requiresApproval = shouldRequireApproval(command, settings);
    
    // Generate proposal
    const proposal = generateProposal(command, requiresApproval);
    
    return proposal;
  } catch (error) {
    console.error('Error creating proposal:', error);
    return {
      type: 'unknown',
      message: 'Sorry, I couldn\'t understand that request.',
    };
  }
}

/**
 * Backward compatibility wrapper
 * Converts proposal to old RouterResult format for gradual migration
 */
export async function routeIntentLegacy(intent: AIIntent, context?: string, settings?: any) {
  const result = await routeIntentToProposal(intent, context, settings);
  
  if ('type' in result && (result.type === 'clarification' || result.type === 'unknown')) {
    return {
      success: true,
      route: 'none',
      message: result.message,
      payload: {},
    };
  }
  
  // Return proposal for UI to handle
  return {
    success: true,
    route: result.command.entity,
    proposal: result,
    requiresApproval: result.requiresApproval,
  };
}

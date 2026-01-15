/**
 * AI Clarifier
 * Generates follow-up questions when interpreter is unsure
 * NEVER guesses - only asks questions
 */

import type { AIIntent } from "./schemas/intentSchema";

/**
 * Generate clarification question based on partial intent
 */
export function generateClarification(partialIntent: AIIntent): AIIntent {
  // If already a clarification, return as-is
  if (partialIntent.type === "clarification") {
    return partialIntent;
  }

  // If unknown, ask generic question
  if (partialIntent.type === "unknown") {
    return {
      type: "clarification",
      confidence: 0.3,
      raw: partialIntent.raw,
      followUpQuestion:
        "I'm not sure what you need. Are you asking about:\n• A task to do\n• A meal to plan\n• Something to buy\n• A reminder to set",
    };
  }

  // Generate specific clarification based on intent type
  const question = generateSpecificQuestion(partialIntent);
  
  return {
    type: "clarification",
    confidence: partialIntent.confidence,
    raw: partialIntent.raw,
    followUpQuestion: question,
  };
}

/**
 * Generate specific clarification question
 */
function generateSpecificQuestion(intent: AIIntent): string {
  switch (intent.type) {
    case "task":
      if (!intent.payload?.title || intent.payload.title === "New item") {
        return "What task would you like to add?";
      }
      // Don't ask about category - it's optional
      return `I'll add the task "${intent.payload.title}".`;

    case "meal":
      if (!intent.payload?.name || intent.payload.name === "New meal") {
        return "What meal would you like to plan?";
      }
      // Don't ask about meal type if not specified - can default
      return `I'll plan "${intent.payload.name}".`;

    case "shopping":
      if (!intent.payload?.items || intent.payload.items.length === 0) {
        return "What items would you like to add to your shopping list?";
      }
      if (intent.payload.items.length === 1 && intent.payload.items[0] === "New item") {
        return "What specific item would you like to add to your shopping list?";
      }
      return `I'll add these items: ${intent.payload.items.join(", ")}.`;

    case "reminder":
      if (!intent.payload?.title || intent.payload.title === "New item") {
        return "What would you like to be reminded about?";
      }
      // Don't require date/time - can be set later
      return `I'll set a reminder for "${intent.payload.title}".`;

    case "appointment":
      if (!intent.payload?.title || intent.payload.title === "Appointment") {
        return "What appointment would you like to schedule?";
      }
      // Only ask for missing critical info
      if (!intent.payload?.date && !intent.payload?.time) {
        return `I'll schedule your ${intent.payload.title} appointment. When should it be?`;
      }
      if (!intent.payload?.date) {
        return `I'll schedule your ${intent.payload.title} appointment. What date?`;
      }
      if (!intent.payload?.time) {
        return `I'll schedule your ${intent.payload.title} appointment. What time?`;
      }
      return `I'll schedule your ${intent.payload.title} appointment.`;

    default:
      return "Could you provide more details about what you need?";
  }
}

/**
 * Check if intent needs clarification
 */
export function needsClarification(intent: AIIntent): boolean {
  // If already a clarification or unknown, don't check further
  if (intent.type === "clarification" || intent.type === "unknown") {
    return true;
  }

  // Only ask for clarification if confidence is very low AND required fields are missing
  // Don't be overly strict - if we have the minimum required info, execute
  if (intent.confidence < 0.4) {
    return true;
  }

  // Check payload completeness - only require truly essential fields
  switch (intent.type) {
    case "task":
      // Title is required, but don't reject if it's a generic title if confidence is high
      return !intent.payload?.title || (intent.payload.title === "New item" && intent.confidence < 0.6);

    case "meal":
      // Name is required
      return !intent.payload?.name || (intent.payload.name === "New meal" && intent.confidence < 0.6);

    case "shopping":
      // Items are required
      return !intent.payload?.items || intent.payload.items.length === 0;

    case "reminder":
      // Title is required
      return !intent.payload?.title || (intent.payload.title === "New item" && intent.confidence < 0.6);

    case "appointment":
      // Title is required, date/time are optional (can be added later)
      return !intent.payload?.title || (intent.payload.title === "Appointment" && intent.confidence < 0.6);

    default:
      return false;
  }
}

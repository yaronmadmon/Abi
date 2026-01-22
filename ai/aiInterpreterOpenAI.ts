/**
 * OpenAI Interpreter - Fallback for unclear inputs
 * Uses OpenAI to interpret user input when rule-based interpreter has low confidence
 * 
 * IMPORTANT: This is a fallback layer. Rule-based interpreter runs FIRST.
 * OpenAI is ONLY called when confidence < 0.7 or clarification is needed.
 */

import OpenAI from "openai";
import type { AIIntent, TaskPayload, MealPayload, ShoppingPayload, ReminderPayload, AppointmentPayload } from "./schemas/intentSchema";
import { getOpenAIApiKey } from "./serverEnv";

// Initialize OpenAI client (server-side only)
const getOpenAIClient = () => {
  const apiKey = getOpenAIApiKey();
  if (!apiKey) {
    throw new Error("OPENAI_API_KEY environment variable is not set");
  }
  return new OpenAI({ apiKey });
};

/**
 * Strict system prompt for OpenAI
 * Ensures output matches AIIntent schema exactly
 */
const SYSTEM_PROMPT = `You are an AI intent interpreter for a home-management assistant. 
Your job is ONLY to classify the user's input into one of the following types:

- "task"
- "meal"
- "shopping"
- "reminder"
- "appointment"
- "clarification"
- "unknown"

You must always respond in the following JSON structure:

{
  "type": "...",
  "confidence": 0.0,
  "payload": {...},
  "followUpQuestion": "...",
  "raw": "ORIGINAL USER INPUT"
}

RULES:
1. You are NOT allowed to generate any text outside the JSON.
2. You must NOT invent functionality.
3. If you are not sure, return type "clarification" with a follow-up question.
4. If user intent is not one of the supported types, return "unknown".
5. REMINDER: You do NOT execute tasks — only classify intent.
6. If input is ambiguous, ask a clarifying question instead of guessing.
7. All fields must exist.
8. Confidence must always be between 0 and 1.
9. Payload must match the type. Example: for "shopping", payload is an array of items; for "task", payload is an object; for "meal", payload is meal details.

Strictly follow the schema. No extra fields.`;

/**
 * Interpret input using OpenAI
 * Returns AIIntent that strictly matches the schema
 */
export async function interpretOpenAI(
  rawInput: string,
  context?: string
): Promise<AIIntent> {
  try {
    const client = getOpenAIClient();
    const fullInput = context ? `${context}\n${rawInput}` : rawInput;

    const response = await client.chat.completions.create({
      model: "gpt-4o-mini", // Using gpt-4o-mini for cost efficiency
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: fullInput },
      ],
      response_format: { type: "json_object" },
      temperature: 0.3, // Low temperature for consistent, predictable output
      max_tokens: 500,
    });

    const content = response.choices[0]?.message?.content;
    if (!content) {
      throw new Error("No content in OpenAI response");
    }

    // Parse JSON response
    let parsed: any;
    try {
      parsed = JSON.parse(content);
    } catch (parseError) {
      console.error("Failed to parse OpenAI JSON response:", parseError);
      return createClarificationIntent(
        rawInput,
        "I need more details to understand what you need."
      );
    }

    // Validate and normalize the response
    const validated = validateAndNormalizeIntent(parsed, rawInput);
    return validated;
  } catch (error) {
    console.error("OpenAI interpretation error:", error);
    // On any error, return clarification intent
    return createClarificationIntent(
      rawInput,
      "I'm having trouble understanding. Could you rephrase that?"
    );
  }
}

/**
 * Validate and normalize OpenAI response to match AIIntent schema
 */
function validateAndNormalizeIntent(
  parsed: any,
  rawInput: string
): AIIntent {
  // Check required fields
  if (!parsed.type || typeof parsed.type !== "string") {
    return createClarificationIntent(
      rawInput,
      "I need more details to understand what you need."
    );
  }

  // Validate intent type
  const validTypes = [
    "task",
    "meal",
    "shopping",
    "reminder",
    "appointment",
    "clarification",
    "unknown",
  ];
  if (!validTypes.includes(parsed.type)) {
    return createClarificationIntent(
      rawInput,
      "I need more details to understand what you need."
    );
  }

  // Validate confidence
  let confidence = 0.5; // Default
  if (typeof parsed.confidence === "number") {
    confidence = Math.max(0, Math.min(1, parsed.confidence));
  }

  // Ensure raw field is the original input
  const raw = parsed.raw || rawInput;

  // Build validated intent
  const intent: AIIntent = {
    type: parsed.type as AIIntent["type"],
    confidence,
    raw,
    payload: parsed.payload,
    followUpQuestion: parsed.followUpQuestion,
  };

  // Additional validation based on type
  if (intent.type === "task" && intent.payload) {
    // Ensure task payload has required fields
    if (!intent.payload.title) {
      return createClarificationIntent(
        rawInput,
        "What task would you like to add?"
      );
    }
  }

  if (intent.type === "meal" && intent.payload) {
    // Ensure meal payload has required fields
    if (!intent.payload.name) {
      return createClarificationIntent(
        rawInput,
        "What meal would you like to plan?"
      );
    }
  }

  if (intent.type === "shopping" && intent.payload) {
    // Ensure shopping payload has items array
    if (!intent.payload.items || !Array.isArray(intent.payload.items)) {
      return createClarificationIntent(
        rawInput,
        "What items would you like to add to your shopping list?"
      );
    }
  }

  if (intent.type === "reminder" && intent.payload) {
    // Ensure reminder payload has required fields
    if (!intent.payload.title) {
      return createClarificationIntent(
        rawInput,
        "What would you like to be reminded about?"
      );
    }
  }

  if (intent.type === "appointment" && intent.payload) {
    // Ensure appointment payload has required fields
    if (!intent.payload.title) {
      return createClarificationIntent(
        rawInput,
        "What appointment would you like to schedule?"
      );
    }
  }

  return intent;
}

/**
 * Create a clarification intent
 */
function createClarificationIntent(
  rawInput: string,
  question: string
): AIIntent {
  return {
    type: "clarification",
    confidence: 0.4,
    raw: rawInput,
    followUpQuestion: question,
  };
}

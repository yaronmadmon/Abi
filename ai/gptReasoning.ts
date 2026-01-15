/**
 * GPT Reasoning Engine
 * PRIMARY thinking layer - replaces shallow intent parsing
 * 
 * Uses GPT to deeply understand user intent, infer missing details,
 * and decide when clarification is actually needed.
 */

import OpenAI from "openai";
import type { TaskPayload, MealPayload, ShoppingPayload, ReminderPayload, AppointmentPayload, FamilyPayload, PetPayload } from "./schemas/intentSchema";

// Initialize OpenAI client
const getOpenAIClient = () => {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    throw new Error("OPENAI_API_KEY environment variable is not set");
  }
  return new OpenAI({ apiKey });
};

/**
 * GPT Reasoning Result
 * Structured output from GPT reasoning step
 */
export interface GPTReasoningResult {
  action: "create_task" | "create_meal" | "create_shopping" | "create_reminder" | "create_appointment" | "create_family" | "create_pet" | "clarification" | "unknown";
  data: TaskPayload | MealPayload | ShoppingPayload | ReminderPayload | AppointmentPayload | FamilyPayload | PetPayload | null;
  missing_fields: string[]; // Only fields that are truly unsafe to infer
  inferred_fields?: string[]; // Fields that GPT inferred (for transparency)
  confidence: number; // 0-1
  reasoning?: string; // Optional: GPT's reasoning for transparency
}

/**
 * Get current date/time context for GPT
 */
function getContextInfo(): string {
  const now = new Date();
  const today = now.toISOString().split('T')[0];
  const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000).toISOString().split('T')[0];
  const dayOfWeek = now.toLocaleDateString('en-US', { weekday: 'long' });
  const time = now.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
  
  return `Current date: ${today} (${dayOfWeek})
Current time: ${time}
Tomorrow's date: ${tomorrow}`;
}

/**
 * System prompt for GPT reasoning
 * Instructs GPT to be intelligent, infer obvious details, and only ask when unsafe
 */
const SYSTEM_PROMPT = `You are the reasoning engine for a home management assistant. Your job is to deeply understand user intent and prepare structured data for execution.

CRITICAL PRINCIPLES:
1. INFER OBVIOUS DETAILS - Don't ask for information you can reasonably infer
2. BE SMART - "tomorrow" → actual date, "after work" → reasonable time (e.g., 6pm), "dentist" → appointment title
3. ONLY ASK WHEN UNSAFE - Only request clarification if inference would be wrong or ambiguous
4. NEVER ASK GENERIC QUESTIONS - Be specific: "What time should the appointment be?" not "Can you clarify?"
5. CONVERSATIONAL INPUTS - If user says "hi", "hello", or asks a general question, return action "unknown" with a friendly response in missing_fields (e.g., ["Hi! How can I help you today?"])

SUPPORTED ACTIONS:
- create_task: Add a task to the user's task list
- create_meal: Add a meal to the meal plan
- create_shopping: Add items to shopping list
- create_reminder: Set a reminder
- create_appointment: Schedule an appointment
- create_family: Add a family member
- create_pet: Add a pet
- clarification: Ask a specific follow-up question
- unknown: Cannot determine intent

OUTPUT FORMAT (JSON only):
{
  "action": "create_task" | "create_meal" | "create_shopping" | "create_reminder" | "create_appointment" | "create_family" | "create_pet" | "clarification" | "unknown",
  "data": {
    // Structured data matching the action type
    // For tasks: { title, category, dueDate?, priority? }
    // For meals: { name, mealType, day?, dietaryNotes? }
    // For shopping: { items: string[], category? }
    // For reminders: { title, time?, date? }
    // For appointments: { title, date?, time?, location?, withWhom? }
    // For family: { name, relationship?, age?, notes? }
    // For pets: { name, type, breed?, age?, notes? }
    // null if action is clarification/unknown
  },
  "missing_fields": [], // ONLY fields that are truly required and cannot be safely inferred
  "inferred_fields": [], // Fields you inferred (for transparency)
  "confidence": 0.0-1.0,
  "reasoning": "Brief explanation of your reasoning"
}

FIELD INFERENCE RULES:
- "tomorrow", "next week", "Monday" → Convert to actual dates (YYYY-MM-DD)
- "after work", "evening", "morning" → Convert to reasonable times (HH:MM format, 24-hour)
- "dentist", "doctor", "meeting" → Use as appointment/task title
- If user says "remind me to X" → action is create_reminder
- If user says "add X to shopping" → action is create_shopping
- If user says "add my daughter Sarah" or "add family member" → action is create_family
- If user says "add a dog named Max" or "add pet" → action is create_pet
- Categories can be inferred from context (e.g., "clean bathroom" → cleaning category)
- For family: infer relationship from context ("daughter" → relationship: "daughter", "my wife" → relationship: "spouse")
- For pets: infer type from context ("dog" → type: "dog", "cat" → type: "cat")

IMAGE UNDERSTANDING:
- If an image is provided, analyze it intelligently
- Document images → suggest saving, extracting text, creating note
- Food images → suggest recipe, meal logging
- Handwritten notes → convert to task or note
- Calendar/paper images → extract appointment details
- Use image content to fill structured fields when possible
- Only ask for clarification if image content is ambiguous

ONLY ASK FOR CLARIFICATION IF:
- The intent is genuinely ambiguous (could be multiple actions)
- A critical field is missing AND cannot be inferred (e.g., appointment time if user says "tomorrow" but no time)
- The user's request is unclear or contradictory

When asking for clarification:
- Set action to "clarification"
- Set data to null
- Include a SPECIFIC question in missing_fields (e.g., ["What time should the appointment be?"])
- NEVER ask generic "Can you clarify?" or "Could you provide more details?" questions
- If the input is conversational (greeting, general question), return action "unknown" with a friendly conversational response in missing_fields

For conversational inputs (greetings, general questions):
- Return action: "unknown"
- Set data: null
- Put a friendly, natural response in missing_fields (e.g., ["Hi! How can I help you today?"])
- Be warm and helpful, not robotic

Be confident and intelligent. Infer liberally when safe.`;

/**
 * Generate conversational response from GPT
 * Used when user is in conversational mode or input is clearly conversational
 */
export async function generateConversationalResponse(
  userInput: string,
  conversationHistory?: string,
  images?: string[]
): Promise<string> {
  try {
    const client = getOpenAIClient();
    const contextInfo = getContextInfo();
    
    const conversationalPrompt = `You are a helpful home management assistant. You're having a natural conversation with the user.

Current context: ${contextInfo}

${conversationHistory ? `Previous conversation:\n${conversationHistory}\n\n` : ''}User: ${userInput}

Respond naturally and helpfully. If the user is greeting you, greet them back warmly. If they're asking a question, answer it. If they need help with something, offer assistance. Be friendly, concise, and conversational.

If the user wants to do something (add a task, create a reminder, etc.), acknowledge it naturally and let them know you can help. But don't be robotic - be conversational.`;

    const messages: any[] = [
      { role: "system", content: conversationalPrompt },
    ];

    if (images && images.length > 0) {
      const userMessage: any = {
        role: "user",
        content: [
          { type: "text", text: userInput },
          ...images.map((image) => ({
            type: "image_url",
            image_url: {
              url: image.startsWith('data:') ? image : `data:image/jpeg;base64,${image}`,
            },
          })),
        ],
      };
      messages.push(userMessage);
    } else {
      messages.push({ role: "user", content: userInput });
    }

    const response = await client.chat.completions.create({
      model: "gpt-4o-mini",
      messages,
      temperature: 0.7, // Slightly higher for more natural conversation
      max_tokens: 300,
    });

    const content = response.choices[0]?.message?.content;
    return content || "I'm here to help!";
  } catch (error) {
    console.error("GPT conversational response error:", error);
    return "I'm here to help! How can I assist you today?";
  }
}

/**
 * Check if input is conversational (greeting, question, general chat)
 */
export function isConversationalInput(input: string): boolean {
  const lower = input.toLowerCase().trim();
  const conversationalPatterns = [
    /^(hi|hello|hey|greetings|good morning|good afternoon|good evening)$/i,
    /^(how are you|what's up|how's it going)$/i,
    /^(thanks|thank you|appreciate it)$/i,
    /^(help|can you help|what can you do)$/i,
    /^(what|who|when|where|why|how)\s/i, // Questions
    /^\?+$/, // Just question marks
  ];
  
  return conversationalPatterns.some(pattern => pattern.test(lower)) || lower.length < 10;
}

/**
 * Main GPT reasoning function
 * Takes user input and returns structured reasoning result
 * Supports text and images (GPT Vision)
 */
export async function reasonWithGPT(
  userInput: string,
  conversationContext?: string,
  images?: string[] // Base64 encoded images
): Promise<GPTReasoningResult> {
  try {
    const client = getOpenAIClient();
    const contextInfo = getContextInfo();
    
    // Build the full prompt with context
    const fullPrompt = conversationContext
      ? `${contextInfo}\n\nPrevious conversation:\n${conversationContext}\n\nUser: ${userInput}`
      : `${contextInfo}\n\nUser: ${userInput}`;

    // Build messages array
    const messages: any[] = [
      { role: "system", content: SYSTEM_PROMPT },
    ];

    // If images are provided, use vision-capable model and format
    if (images && images.length > 0) {
      // Use gpt-4o-mini with vision support
      const userMessage: any = {
        role: "user",
        content: [
          { type: "text", text: fullPrompt },
          ...images.map((image) => ({
            type: "image_url",
            image_url: {
              url: image.startsWith('data:') ? image : `data:image/jpeg;base64,${image}`,
            },
          })),
        ],
      };
      messages.push(userMessage);

      const response = await client.chat.completions.create({
        model: "gpt-4o-mini", // gpt-4o-mini supports vision
        messages,
        response_format: { type: "json_object" },
        temperature: 0.3,
        max_tokens: 1000, // Slightly more tokens for image analysis
      });

      const content = response.choices[0]?.message?.content;
      if (!content) {
        throw new Error("No content in GPT response");
      }

      let parsed: any;
      try {
        parsed = JSON.parse(content);
      } catch (parseError) {
        console.error("Failed to parse GPT JSON response:", parseError);
        return {
          action: "unknown",
          data: null,
          missing_fields: [],
          confidence: 0,
          reasoning: "Failed to parse GPT response",
        };
      }

      return validateAndNormalizeReasoning(parsed, userInput);
    } else {
      // No images - use standard text-only model
      messages.push({ role: "user", content: fullPrompt });

      const response = await client.chat.completions.create({
        model: "gpt-4o-mini",
        messages,
        response_format: { type: "json_object" },
        temperature: 0.3,
        max_tokens: 800,
      });

      const content = response.choices[0]?.message?.content;
      if (!content) {
        throw new Error("No content in GPT response");
      }

      // Parse JSON response
      let parsed: any;
      try {
        parsed = JSON.parse(content);
      } catch (parseError) {
        console.error("Failed to parse GPT JSON response:", parseError);
        return {
          action: "unknown",
          data: null,
          missing_fields: [],
          confidence: 0,
          reasoning: "Failed to parse GPT response",
        };
      }

      // Validate and normalize the response
      return validateAndNormalizeReasoning(parsed, userInput);
    }
  } catch (error) {
    console.error("GPT reasoning error:", error);
    return {
      action: "unknown",
      data: null,
      missing_fields: [],
      confidence: 0,
      reasoning: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

/**
 * Validate and normalize GPT reasoning result
 */
function validateAndNormalizeReasoning(
  parsed: any,
  userInput: string
): GPTReasoningResult {
  // Validate action
  const validActions = [
    "create_task",
    "create_meal",
    "create_shopping",
    "create_reminder",
    "create_appointment",
    "create_family",
    "create_pet",
    "clarification",
    "unknown",
  ];

  const action = validActions.includes(parsed.action)
    ? parsed.action
    : "unknown";

  // Validate confidence
  let confidence = 0.5;
  if (typeof parsed.confidence === "number") {
    confidence = Math.max(0, Math.min(1, parsed.confidence));
  }

  // Validate missing_fields
  const missing_fields = Array.isArray(parsed.missing_fields)
    ? parsed.missing_fields
    : [];

  // Validate inferred_fields
  const inferred_fields = Array.isArray(parsed.inferred_fields)
    ? parsed.inferred_fields
    : [];

  // Validate data based on action
  let data: any = null;
  if (action !== "clarification" && action !== "unknown" && parsed.data) {
    data = validateDataForAction(action, parsed.data);
  }

  return {
    action,
    data,
    missing_fields,
    inferred_fields,
    confidence,
    reasoning: parsed.reasoning || undefined,
  };
}

/**
 * Validate data structure for specific action
 */
function validateDataForAction(action: string, data: any): any {
  switch (action) {
    case "create_task":
      if (!data.title || typeof data.title !== "string") {
        return null;
      }
      return {
        title: data.title,
        category: data.category || "other",
        dueDate: data.dueDate || undefined,
        priority: data.priority || "medium",
      } as TaskPayload;

    case "create_meal":
      if (!data.name || typeof data.name !== "string") {
        return null;
      }
      return {
        name: data.name,
        mealType: data.mealType || "dinner",
        day: data.day || undefined,
        dietaryNotes: data.dietaryNotes || undefined,
      } as MealPayload;

    case "create_shopping":
      if (!data.items || !Array.isArray(data.items) || data.items.length === 0) {
        return null;
      }
      return {
        items: data.items.filter((item: any) => typeof item === "string"),
        category: data.category || undefined,
      } as ShoppingPayload;

    case "create_reminder":
      if (!data.title || typeof data.title !== "string") {
        return null;
      }
      return {
        title: data.title,
        time: data.time || undefined,
        date: data.date || undefined,
      } as ReminderPayload;

    case "create_appointment":
      if (!data.title || typeof data.title !== "string") {
        return null;
      }
      return {
        title: data.title,
        date: data.date || undefined,
        time: data.time || undefined,
        location: data.location || undefined,
        withWhom: data.withWhom || undefined,
      } as AppointmentPayload;

    case "create_family":
      if (!data.name || typeof data.name !== "string") {
        return null;
      }
      return {
        name: data.name,
        relationship: data.relationship || undefined,
        age: data.age || undefined,
        notes: data.notes || undefined,
      } as FamilyPayload;

    case "create_pet":
      if (!data.name || typeof data.name !== "string" || !data.type || typeof data.type !== "string") {
        return null;
      }
      return {
        name: data.name,
        type: data.type,
        breed: data.breed || undefined,
        age: data.age || undefined,
        notes: data.notes || undefined,
      } as PetPayload;

    default:
      return null;
  }
}

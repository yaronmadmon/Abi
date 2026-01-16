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
  const hour = now.getHours();
  
  // Determine time of day context
  let timeOfDay = 'morning';
  if (hour >= 12 && hour < 17) timeOfDay = 'afternoon';
  else if (hour >= 17) timeOfDay = 'evening';
  
  return `Current date: ${today} (${dayOfWeek})
Current time: ${time} (${timeOfDay})
Tomorrow's date: ${tomorrow}
Current hour: ${hour} (24-hour format)

DEFAULT INFERENCE RULES:
- "tomorrow" → ${tomorrow}
- "tomorrow afternoon" → ${tomorrow}, time: 15:00 (3 PM)
- "tomorrow evening" → ${tomorrow}, time: 18:00 (6 PM)
- "after work" → time: 18:00 (6 PM)
- "morning" → time: 09:00 (9 AM)
- "afternoon" → time: 15:00 (3 PM)
- "evening" → time: 18:00 (6 PM)
- If date specified but no time → default to 15:00 (3 PM) for appointments`;
}

/**
 * System prompt for GPT reasoning
 * Instructs GPT to be proactive, decisive, and ChatGPT-like
 */
const SYSTEM_PROMPT = `You are a proactive, intelligent home management assistant. Your behavior should match ChatGPT: helpful, decisive, and human-like.

━━━━━━━━━━━━━━━━━━
CORE BEHAVIOR RULES (NON-NEGOTIABLE)
━━━━━━━━━━━━━━━━━━

1. ACT FIRST, ASK LATER
   - ALWAYS attempt to complete the user's request immediately
   - If intent is clear → execute with inferred details
   - If minor details are missing → use reasonable defaults
   - Ask follow-up questions ONLY if execution is truly impossible
   - NEVER ask "Can you clarify?" - be specific or execute

2. INFER LIKE A HUMAN
   - "Tomorrow afternoon" → date: tomorrow, time: 15:00 (3 PM)
   - "Dentist appointment" → appointment type, title: "Dentist appointment"
   - "Add milk" → shopping item or task (infer from context)
   - "Call mom" → task with action context
   - "After work" → time: 18:00 (6 PM)
   - "Next week" → calculate actual date
   - Inference > interrogation

3. DEFAULTS ARE REQUIRED
   - Time not specified → use reasonable default (e.g., 15:00 for afternoon, 18:00 for evening)
   - Date not specified → use today or tomorrow based on context
   - Duration not specified → 30 minutes for appointments
   - Priority not specified → "medium"
   - Category not specified → infer from title or use "other"
   - All defaults are editable later - don't ask permission

4. NO CLARIFICATION LOOPS
   - Maximum ONE clarification question per request
   - If unsure → make best guess + execute
   - Never ask repeated questions
   - If truly ambiguous → execute with most likely interpretation

5. SOUND INTELLIGENT, NOT MECHANICAL
   - Responses should be natural and conversational
   - Avoid system language like "Intent detected" or "Parameters required"
   - Be concise and helpful
   - Confirm actions clearly: "I added X. Want to change anything?"

━━━━━━━━━━━━━━━━━━
EXECUTION EXAMPLES
━━━━━━━━━━━━━━━━━━

User: "Set a dentist appointment"
→ Execute: Create appointment with title "Dentist appointment", date: tomorrow, time: 15:00
→ missing_fields: [] (execute immediately)
→ Response: "I've scheduled a dentist appointment for tomorrow at 3 PM. Want to adjust the time?"

User: "Add milk to shopping"
→ Execute: Add "milk" to shopping list
→ missing_fields: [] (execute immediately)

User: "Remind me to call mom tomorrow"
→ Execute: Create reminder with title "Call mom", date: tomorrow, time: 10:00 (morning default)
→ missing_fields: [] (execute immediately)

User: "Add task: clean bathroom"
→ Execute: Create task with title "clean bathroom", category: "cleaning"
→ missing_fields: [] (execute immediately)

━━━━━━━━━━━━━━━━━━
CLARIFICATION RULES
━━━━━━━━━━━━━━━━━━

ONLY ask for clarification if:
- Intent is genuinely ambiguous (could be 2+ different actions)
- Critical field is missing AND cannot be inferred AND execution would fail
- User's request is contradictory

When asking:
- Be SPECIFIC: "What time should the dentist appointment be?" not "Can you clarify?"
- Ask ONE question only
- If still unclear after one question → make best guess and execute

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

━━━━━━━━━━━━━━━━━━
OUTPUT REQUIREMENTS
━━━━━━━━━━━━━━━━━━

CRITICAL: missing_fields should be EMPTY unless clarification is absolutely necessary.

If you can infer or default a field → DO IT. Don't put it in missing_fields.

Examples:
- User says "dentist tomorrow" → date: tomorrow, time: 15:00 (default), missing_fields: []
- User says "add Sarah" → name: "Sarah", relationship: infer from context or leave undefined, missing_fields: []
- User says "remind me to X" → title: "X", date: today, time: 10:00, missing_fields: []

Only use missing_fields for:
- Truly ambiguous intent (e.g., "add something" - what type?)
- Critical field that would cause failure if wrong (rare)

━━━━━━━━━━━━━━━━━━
CONVERSATIONAL INPUTS
━━━━━━━━━━━━━━━━━━

For greetings, general questions, or conversational input:
- Return action: "unknown"
- Set data: null
- Put a friendly, natural response in missing_fields (e.g., ["Hi! How can I help you today?"])
- Be warm, helpful, and conversational - like ChatGPT

━━━━━━━━━━━━━━━━━━
REMEMBER
━━━━━━━━━━━━━━━━━━

You are ChatGPT-like: proactive, helpful, and decisive.
Execute first. Ask later. Infer liberally. Use defaults.
Make the user feel helped, not interrogated.`;

/**
 * Generate conversational response from GPT
 * Used when user is in conversational mode or input is clearly conversational
 * ChatGPT-like: natural, helpful, proactive
 */
export async function generateConversationalResponse(
  userInput: string,
  conversationHistory?: string,
  images?: string[]
): Promise<string> {
  try {
    const client = getOpenAIClient();
    const contextInfo = getContextInfo();
    
    const conversationalPrompt = `You are a helpful, proactive home management assistant. You're having a natural conversation with the user, just like ChatGPT.

Current context: ${contextInfo}

${conversationHistory ? `Previous conversation:\n${conversationHistory}\n\n` : ''}User: ${userInput}

BEHAVIOR RULES:
- Be natural, warm, and conversational - like ChatGPT
- If user greets you, greet them back warmly and offer help
- If they ask a question, answer it directly and helpfully
- If they want to do something (add task, create reminder, etc.), acknowledge it and offer to help
- Be concise but friendly
- Never sound robotic or mechanical
- Never say "I can help you with that" - just help them
- If they mention something actionable, offer to do it: "I can add that to your list" or "Want me to schedule that?"

Examples:
- User: "Hi" → "Hi! How can I help you today?"
- User: "I need to call the dentist" → "I can help you schedule a dentist appointment. When would you like to set it for?"
- User: "What's on my calendar?" → "Let me check your calendar for you..."
- User: "Thanks" → "You're welcome! Anything else I can help with?"

Be helpful, proactive, and human-like.`;

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
      // Be lenient - if title is missing, try to infer from raw input
      if (!data.title || typeof data.title !== "string") {
        return null;
      }
      return {
        title: data.title.trim(),
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
      // Be lenient - allow appointments with minimal info
      if (!data.title || typeof data.title !== "string") {
        return null;
      }
      // Apply smart defaults for time if date is provided but time is not
      let defaultTime = data.time;
      if (data.date && !data.time) {
        // Default to afternoon (3 PM) if date specified but no time
        defaultTime = "15:00";
      }
      return {
        title: data.title.trim(),
        date: data.date || undefined,
        time: defaultTime || undefined,
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

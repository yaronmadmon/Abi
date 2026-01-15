/**
 * AI Interpreter - Rule-Based Only
 * Pure logic, deterministic output, NO OpenAI calls
 */

import type { AIIntent, TaskPayload, MealPayload, ShoppingPayload, ReminderPayload, AppointmentPayload } from "./schemas/intentSchema";
import { isCleaningIntent } from "./patterns/cleaning";
import { isCookingIntent, extractMealType, extractMealName } from "./patterns/cooking";
import { isShoppingIntent, extractShoppingItems, extractShoppingCategory } from "./patterns/shopping";
import { extractTimeReference, getDefaultDay, hasTimeReference } from "./patterns/time";
import { isAmbiguous, isUrgent, extractTitle, TASK_KEYWORDS } from "./patterns/general";
import { normalizeText, detectAmbiguity, scoreIntentMatches, calculateConfidence } from "./aiUtils";

/**
 * Main interpreter function
 * Receives raw text and returns structured AIIntent
 */
export async function interpretInput(rawInput: string, context?: string): Promise<AIIntent> {
  const input = normalizeText(rawInput);
  
  if (!input || input.length === 0) {
    return {
      type: "unknown",
      confidence: 0,
      raw: rawInput,
      followUpQuestion: "I didn't catch that. Could you please tell me what you need?",
    };
  }

  // Combine with context if provided
  const fullInput = context ? `${context}\n${input}` : input;

  // Step 1: Check for ambiguity
  const ambiguity = detectAmbiguity(fullInput);
  if (ambiguity.isAmbiguous && ambiguity.ambiguityScore > 0.5) {
    return {
      type: "clarification",
      confidence: 0.4,
      raw: rawInput,
      followUpQuestion: "I'm not entirely sure what you need. Could you be more specific?",
    };
  }

  // Step 2: Run pattern matching for each intent type
  const matches = {
    task: matchTaskIntent(fullInput),
    meal: matchMealIntent(fullInput),
    shopping: matchShoppingIntent(fullInput),
    reminder: matchReminderIntent(fullInput),
    appointment: matchAppointmentIntent(fullInput),
  };

  // Step 3: Find the best match
  const bestMatch = findBestMatch(matches);

  // Step 4: If confidence is too low, return clarification
  if (bestMatch.confidence < 0.5) {
    return {
      type: "clarification",
      confidence: bestMatch.confidence,
      raw: rawInput,
      followUpQuestion: generateClarificationQuestion(matches),
    };
  }

  // Step 5: Return the best match
  return bestMatch.intent;
}

/**
 * Match task intent
 */
function matchTaskIntent(input: string): { intent: AIIntent | null; confidence: number } {
  const lower = input.toLowerCase();
  
  // Check for cleaning tasks
  if (isCleaningIntent(input)) {
    const timeRef = extractTimeReference(input);
    const title = extractTitle(input, "task");
    const payload: TaskPayload = {
      title,
      category: "cleaning",
      dueDate: timeRef.date,
      priority: isUrgent(input) ? "high" : "medium",
    };
    return {
      intent: {
        type: "task",
        confidence: 0.85,
        raw: input,
        payload,
      },
      confidence: 0.85,
    };
  }

  // Check for general task keywords
  const taskScore = scoreIntentMatches(input, TASK_KEYWORDS);
  if (taskScore > 0.3) {
    const timeRef = extractTimeReference(input);
    const title = extractTitle(input, "task");
    
    // Determine category
    let category: TaskPayload["category"] = "other";
    if (lower.includes("kid") || lower.includes("child") || lower.includes("school")) {
      category = "kids";
    } else if (lower.includes("buy") || lower.includes("get") || lower.includes("pick up")) {
      category = "errands";
    } else if (lower.includes("fix") || lower.includes("repair") || lower.includes("maintenance")) {
      category = "home-maintenance";
    }

    const payload: TaskPayload = {
      title,
      category,
      dueDate: timeRef.date,
      priority: isUrgent(input) ? "high" : "medium",
    };

    const confidence = calculateConfidence(taskScore, 0, hasTimeReference(input));
    return {
      intent: {
        type: "task",
        confidence,
        raw: input,
        payload,
      },
      confidence,
    };
  }

  return { intent: null, confidence: 0 };
}

/**
 * Match meal intent
 */
function matchMealIntent(input: string): { intent: AIIntent | null; confidence: number } {
  if (!isCookingIntent(input)) {
    return { intent: null, confidence: 0 };
  }

  const timeRef = extractTimeReference(input);
  const mealType = extractMealType(input);
  const name = extractMealName(input);
  const day = timeRef.day || getDefaultDay();

  const payload: MealPayload = {
    name,
    mealType,
    day,
  };

  return {
    intent: {
      type: "meal",
      confidence: 0.9,
      raw: input,
      payload,
    },
    confidence: 0.9,
  };
}

/**
 * Match shopping intent
 */
function matchShoppingIntent(input: string): { intent: AIIntent | null; confidence: number } {
  if (!isShoppingIntent(input)) {
    return { intent: null, confidence: 0 };
  }

  const items = extractShoppingItems(input);
  if (items.length === 0) {
    return { intent: null, confidence: 0 };
  }

  const category = items.length > 0 ? extractShoppingCategory(items[0]) : "other";
  const payload: ShoppingPayload = {
    items,
    category,
  };

  return {
    intent: {
      type: "shopping",
      confidence: 0.9,
      raw: input,
      payload,
    },
    confidence: 0.9,
  };
}

/**
 * Match reminder intent
 */
function matchReminderIntent(input: string): { intent: AIIntent | null; confidence: number } {
  const lower = input.toLowerCase();
  const reminderKeywords = ["remind", "reminder", "remember", "don't forget"];
  
  // Don't match if it's an appointment (appointments have higher priority)
  if (lower.includes("appointment") || lower.includes("meeting") || lower.includes("doctor") || lower.includes("dentist")) {
    return { intent: null, confidence: 0 };
  }
  
  if (!reminderKeywords.some((kw) => lower.includes(kw))) {
    return { intent: null, confidence: 0 };
  }

  const timeRef = extractTimeReference(input);
  const title = extractTitle(input, "reminder");
  
  const payload: ReminderPayload = {
    title,
    time: timeRef.time,
    date: timeRef.date,
  };

  return {
    intent: {
      type: "reminder",
      confidence: 0.8,
      raw: input,
      payload,
    },
    confidence: 0.8,
  };
}

/**
 * Match appointment intent
 */
function matchAppointmentIntent(input: string): { intent: AIIntent | null; confidence: number } {
  const lower = input.toLowerCase();
  const appointmentKeywords = [
    "appointment", "meeting", "doctor", "dentist", "doctor's", "dentist's",
    "checkup", "check-up", "visit", "consultation", "session", "therapy",
    "haircut", "hair cut", "salon", "spa", "massage", "facial"
  ];
  
  // Check if input contains appointment keywords
  const hasAppointmentKeyword = appointmentKeywords.some((kw) => lower.includes(kw));
  if (!hasAppointmentKeyword) {
    return { intent: null, confidence: 0 };
  }

  const timeRef = extractTimeReference(input);
  
  // Extract time from input (e.g., "3pm", "3:00 pm", "15:00")
  let extractedTime = timeRef.time;
  if (!extractedTime) {
    const timePattern = /\b(\d{1,2})(?::(\d{2}))?\s*(am|pm|AM|PM)\b/i;
    const timeMatch = input.match(timePattern);
    if (timeMatch) {
      let hours = parseInt(timeMatch[1]);
      const minutes = timeMatch[2] ? parseInt(timeMatch[2]) : 0;
      const period = timeMatch[3].toLowerCase();
      
      if (period === 'pm' && hours !== 12) hours += 12;
      if (period === 'am' && hours === 12) hours = 0;
      
      extractedTime = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
    } else {
      // Try 24-hour format
      const time24Pattern = /\b(\d{1,2}):(\d{2})\b/;
      const time24Match = input.match(time24Pattern);
      if (time24Match) {
        extractedTime = `${time24Match[1].padStart(2, '0')}:${time24Match[2]}`;
      }
    }
  }
  
  // Extract title (remove appointment keywords and time references)
  let title = input.trim();
  const titlePrefixes = ["set", "schedule", "book", "make", "add", "create", "i have", "i need"];
  for (const prefix of titlePrefixes) {
    if (title.toLowerCase().startsWith(prefix)) {
      title = title.substring(prefix.length).trim();
      break;
    }
  }
  
  // Remove appointment keywords from title
  for (const kw of appointmentKeywords) {
    title = title.replace(new RegExp(`\\b${kw}\\b`, "gi"), "").trim();
  }
  
  // Remove time references
  const timeWords = ["today", "tomorrow", "at", "on", "for"];
  for (const word of timeWords) {
    title = title.replace(new RegExp(`\\b${word}\\b`, "gi"), "").trim();
  }
  
  // Remove time patterns
  title = title.replace(/\b\d{1,2}(?::\d{2})?\s*(am|pm|AM|PM)\b/gi, "").trim();
  title = title.replace(/\b\d{1,2}:\d{2}\b/g, "").trim();
  
  // Clean up extra spaces
  title = title.replace(/\s+/g, " ").trim();
  
  // Capitalize first letter
  if (title.length > 0) {
    title = title.charAt(0).toUpperCase() + title.slice(1);
  }
  
  // If title is empty or too short, use a default
  if (!title || title.length < 3) {
    // Try to extract the main noun (e.g., "dentist" from "dentist appointment")
    for (const kw of appointmentKeywords) {
      if (lower.includes(kw)) {
        title = kw.charAt(0).toUpperCase() + kw.slice(1).replace(/'s$/, '');
        break;
      }
    }
    if (!title || title.length < 3) {
      title = "Appointment";
    }
  }
  
  const payload: AppointmentPayload = {
    title,
    date: timeRef.date,
    time: extractedTime,
  };

  // Higher confidence if we have both date and time
  const confidence = (timeRef.date && extractedTime) ? 0.95 : (timeRef.date || extractedTime) ? 0.85 : 0.75;

  return {
    intent: {
      type: "appointment",
      confidence,
      raw: input,
      payload,
    },
    confidence,
  };
}

/**
 * Find the best match from all intent matches
 */
function findBestMatch(matches: {
  task: { intent: AIIntent | null; confidence: number };
  meal: { intent: AIIntent | null; confidence: number };
  shopping: { intent: AIIntent | null; confidence: number };
  reminder: { intent: AIIntent | null; confidence: number };
  appointment: { intent: AIIntent | null; confidence: number };
}): { intent: AIIntent; confidence: number } {
  const allMatches = [
    matches.task,
    matches.meal,
    matches.shopping,
    matches.reminder,
    matches.appointment,
  ].filter((m) => m.intent !== null);

  if (allMatches.length === 0) {
    return {
      intent: {
        type: "unknown",
        confidence: 0,
        raw: "",
        followUpQuestion: "I'm not sure what you need. Could you rephrase?",
      },
      confidence: 0,
    };
  }

  // Sort by confidence
  allMatches.sort((a, b) => b.confidence - a.confidence);

  // If top two are close, return clarification
  if (allMatches.length > 1 && allMatches[0].confidence - allMatches[1].confidence < 0.2) {
    return {
      intent: {
        type: "clarification",
        confidence: (allMatches[0].confidence + allMatches[1].confidence) / 2,
        raw: "",
        followUpQuestion: generateClarificationQuestion(matches),
      },
      confidence: (allMatches[0].confidence + allMatches[1].confidence) / 2,
    };
  }

  return {
    intent: allMatches[0].intent!,
    confidence: allMatches[0].confidence,
  };
}

/**
 * Generate clarification question based on matches
 */
function generateClarificationQuestion(matches: {
  task: { intent: AIIntent | null; confidence: number };
  meal: { intent: AIIntent | null; confidence: number };
  shopping: { intent: AIIntent | null; confidence: number };
  reminder: { intent: AIIntent | null; confidence: number };
  appointment: { intent: AIIntent | null; confidence: number };
}): string {
  const possibleTypes: string[] = [];

  if (matches.task.confidence > 0.3) possibleTypes.push("a task");
  if (matches.meal.confidence > 0.3) possibleTypes.push("a meal");
  if (matches.shopping.confidence > 0.3) possibleTypes.push("a shopping item");
  if (matches.reminder.confidence > 0.3) possibleTypes.push("a reminder");
  if (matches.appointment.confidence > 0.3) possibleTypes.push("an appointment");

  if (possibleTypes.length === 0) {
    return "I'm not sure what you need. Are you asking about a task, meal, shopping item, reminder, or appointment?";
  }

  if (possibleTypes.length === 1) {
    return `Are you asking about ${possibleTypes[0]}?`;
  }

  const lastType = possibleTypes.pop();
  return `Are you asking about ${possibleTypes.join(", ")}, or ${lastType}?`;
}

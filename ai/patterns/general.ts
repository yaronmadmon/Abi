/**
 * General Pattern Matchers
 * Keywords and patterns for general intents and ambiguity detection
 */

export const TASK_KEYWORDS = [
  "task",
  "todo",
  "remind",
  "reminder",
  "remember",
  "do",
  "fix",
  "repair",
  "maintenance",
  "schedule",
  "appointment",
  "call",
  "email",
  "pay",
  "switch laundry",
  "take out",
  "trash",
  "recycling",
  "handle",
  "deal with",
];

export const URGENT_KEYWORDS = [
  "urgent",
  "asap",
  "immediately",
  "right now",
  "now",
  "important",
  "priority",
  "critical",
];

export const AMBIGUOUS_PHRASES = [
  "take care of",
  "handle",
  "prepare",
  "deal with",
  "work on",
  "something",
  "stuff",
  "things",
  "it",
  "that",
  "this",
  "do it",
  "get it done",
];

export const HELP_PHRASES = [
  "help",
  "help me",
  "what should",
  "what do",
  "how do",
  "can you",
  "could you",
  "would you",
];

/**
 * Check if input contains ambiguous phrases
 */
export function isAmbiguous(input: string): boolean {
  const lower = input.toLowerCase();
  return AMBIGUOUS_PHRASES.some((phrase) => lower.includes(phrase));
}

/**
 * Check if input is urgent
 */
export function isUrgent(input: string): boolean {
  const lower = input.toLowerCase();
  return URGENT_KEYWORDS.some((keyword) => lower.includes(keyword));
}

/**
 * Check if input is asking for help
 */
export function isHelpRequest(input: string): boolean {
  const lower = input.toLowerCase();
  return HELP_PHRASES.some((phrase) => lower.includes(phrase));
}

/**
 * Extract title/description from input by removing common prefixes
 */
export function extractTitle(
  input: string,
  type: "task" | "meal" | "shopping" | "reminder"
): string {
  const prefixes = [
    "add",
    "add a",
    "add an",
    "create",
    "make",
    "set",
    "remind me to",
    "remind me",
    "i need to",
    "i want to",
    "give me",
    "show me",
    "i should",
    "i have to",
    "don't forget to",
    "remember to",
    "help me",
    "can you",
    "could you",
  ];

  let title = input.trim();

  // Remove prefixes
  for (const prefix of prefixes) {
    if (title.toLowerCase().startsWith(prefix)) {
      title = title.substring(prefix.length).trim();
      break;
    }
  }

  // Remove time references
  const timeWords = [
    "today",
    "tomorrow",
    "later",
    "tonight",
    "this week",
    "next week",
    "monday",
    "tuesday",
    "wednesday",
    "thursday",
    "friday",
    "saturday",
    "sunday",
    "now",
    "asap",
  ];

  for (const word of timeWords) {
    title = title.replace(new RegExp(`\\b${word}\\b`, "gi"), "").trim();
  }

  // Clean up extra spaces
  title = title.replace(/\s+/g, " ").trim();

  // Capitalize first letter
  if (title.length > 0) {
    title = title.charAt(0).toUpperCase() + title.slice(1);
  }

  return title || "New item";
}

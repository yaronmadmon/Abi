/**
 * AI Utility Functions
 * Helper functions to keep aiInterpreter clean
 */

/**
 * Normalize text input
 */
export function normalizeText(input: string): string {
  return input
    .trim()
    .replace(/\s+/g, " ") // Multiple spaces to single
    .replace(/[^\w\s,.-]/g, "") // Remove special chars except common punctuation
    .trim();
}

/**
 * Tokenize input into words
 */
export function tokenize(input: string): string[] {
  return normalizeText(input)
    .toLowerCase()
    .split(/\s+/)
    .filter((token) => token.length > 0);
}

/**
 * Detect if input is ambiguous
 */
export function detectAmbiguity(input: string): {
  isAmbiguous: boolean;
  ambiguityScore: number; // 0-1, higher = more ambiguous
} {
  const lower = input.toLowerCase();
  const ambiguousPhrases = [
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
  ];

  const matches = ambiguousPhrases.filter((phrase) => lower.includes(phrase))
    .length;
  const ambiguityScore = Math.min(matches / ambiguousPhrases.length, 1);

  return {
    isAmbiguous: matches > 0,
    ambiguityScore,
  };
}

/**
 * Score intent matches based on keyword frequency
 */
export function scoreIntentMatches(
  input: string,
  keywords: string[]
): number {
  const lower = input.toLowerCase();
  const matches = keywords.filter((kw) => lower.includes(kw)).length;

  if (matches === 0) return 0;

  // Base score: percentage of keywords matched
  const baseScore = Math.min(matches / keywords.length, 0.7);

  // Boost for multiple matches
  if (matches >= 2) {
    return Math.min(baseScore + 0.15, 0.95);
  }

  if (matches >= 3) {
    return Math.min(baseScore + 0.2, 0.98);
  }

  return baseScore;
}

/**
 * Extract time information from input
 */
export function extractTime(input: string): {
  date?: string;
  day?: string;
  isUrgent?: boolean;
} {
  const lower = input.toLowerCase();
  const result: {
    date?: string;
    day?: string;
    isUrgent?: boolean;
  } = {};

  // Urgent indicators
  if (
    lower.includes("now") ||
    lower.includes("asap") ||
    lower.includes("immediately")
  ) {
    result.isUrgent = true;
    result.date = new Date().toISOString().split("T")[0];
    return result;
  }

  // Today
  if (
    lower.includes("today") ||
    lower.includes("tonight") ||
    lower.includes("this evening")
  ) {
    result.date = new Date().toISOString().split("T")[0];
  }

  // Tomorrow
  if (lower.includes("tomorrow")) {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    result.date = tomorrow.toISOString().split("T")[0];
  }

  // Days of week
  const days = [
    "monday",
    "tuesday",
    "wednesday",
    "thursday",
    "friday",
    "saturday",
    "sunday",
  ];
  for (const day of days) {
    if (lower.includes(day)) {
      result.day = day;
      break;
    }
  }

  return result;
}

/**
 * Remove common prefixes from input
 */
export function removePrefixes(input: string): string {
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
    "can you",
    "could you",
  ];

  let cleaned = input.trim().toLowerCase();

  for (const prefix of prefixes) {
    if (cleaned.startsWith(prefix)) {
      cleaned = cleaned.substring(prefix.length).trim();
      break;
    }
  }

  return cleaned;
}

/**
 * Calculate confidence based on multiple factors
 */
export function calculateConfidence(
  keywordScore: number,
  ambiguityScore: number,
  hasTimeReference: boolean
): number {
  let confidence = keywordScore;

  // Reduce confidence if ambiguous
  confidence = confidence * (1 - ambiguityScore * 0.3);

  // Boost confidence if time reference is present (more specific)
  if (hasTimeReference) {
    confidence = Math.min(confidence + 0.1, 0.95);
  }

  return Math.max(0, Math.min(1, confidence));
}

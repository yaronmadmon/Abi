/**
 * Cooking/Meal Pattern Matchers
 * Keywords and patterns for meal-related intents
 */

export const COOKING_KEYWORDS = [
  "meal",
  "meals",
  "dinner",
  "lunch",
  "breakfast",
  "snack",
  "cook",
  "cooking",
  "recipe",
  "recipes",
  "eat",
  "food",
  "dish",
  "prepare",
  "make",
  "tonight",
  "today",
  "tomorrow",
  "simple dinner",
  "dinner idea",
  "what to cook",
  "meal plan",
  "planning meals",
  "cook dinner",
  "make dinner",
  "prepare dinner",
  "what's for dinner",
];

export const COOKING_PHRASES = [
  "dinner idea",
  "simple dinner",
  "what to cook",
  "meal plan",
  "planning meals",
  "cook dinner",
  "make dinner",
  "prepare dinner",
  "what's for dinner",
  "dinner tonight",
  "lunch tomorrow",
  "breakfast idea",
];

export const MEAL_TYPES = {
  breakfast: ["breakfast", "morning meal", "morning"],
  lunch: ["lunch", "midday", "noon"],
  dinner: ["dinner", "supper", "evening meal", "tonight"],
  snack: ["snack", "snacks"],
};

/**
 * Check if input contains cooking/meal keywords
 */
export function isCookingIntent(input: string): boolean {
  const lower = input.toLowerCase();
  return (
    COOKING_KEYWORDS.some((kw) => lower.includes(kw)) ||
    COOKING_PHRASES.some((phrase) => lower.includes(phrase))
  );
}

/**
 * Extract meal type from input
 */
export function extractMealType(input: string): "breakfast" | "lunch" | "dinner" | "snack" {
  const lower = input.toLowerCase();

  for (const [type, keywords] of Object.entries(MEAL_TYPES)) {
    if (keywords.some((kw) => lower.includes(kw))) {
      return type as "breakfast" | "lunch" | "dinner" | "snack";
    }
  }

  // Default to dinner if "tonight" or "today" mentioned
  if (lower.includes("tonight") || lower.includes("today")) {
    return "dinner";
  }

  return "dinner"; // default
}

/**
 * Extract meal name from input
 */
export function extractMealName(input: string): string {
  // Remove common prefixes
  const prefixes = [
    "cook",
    "make",
    "prepare",
    "plan",
    "add",
    "give me",
    "i want",
    "i need",
  ];

  let name = input.trim().toLowerCase();

  for (const prefix of prefixes) {
    if (name.startsWith(prefix)) {
      name = name.substring(prefix.length).trim();
      break;
    }
  }

  // Remove meal type words
  for (const keywords of Object.values(MEAL_TYPES)) {
    for (const kw of keywords) {
      name = name.replace(new RegExp(`\\b${kw}\\b`, "gi"), "").trim();
    }
  }

  // Remove time words
  name = name.replace(/\b(today|tonight|tomorrow|this week)\b/gi, "").trim();

  // Capitalize first letter
  if (name.length > 0) {
    name = name.charAt(0).toUpperCase() + name.slice(1);
  }

  return name || "New meal";
}

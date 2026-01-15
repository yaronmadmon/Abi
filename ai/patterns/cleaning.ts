/**
 * Cleaning Pattern Matchers
 * Keywords and patterns for cleaning-related intents
 */

export const CLEANING_KEYWORDS = [
  "clean",
  "cleaning",
  "tidy",
  "organize",
  "organizing",
  "declutter",
  "vacuum",
  "mop",
  "mop the",
  "dust",
  "dusting",
  "wipe",
  "wipe down",
  "scrub",
  "sweep",
  "laundry",
  "wash",
  "washing",
  "fridge",
  "refrigerator",
  "bathroom",
  "kitchen",
  "floor",
  "floors",
  "dishes",
  "dishwasher",
  "counter",
  "counters",
  "sink",
  "mirror",
  "windows",
  "window",
  "toilet",
  "shower",
  "bathtub",
  "oven",
  "stove",
  "microwave",
];

export const CLEANING_PHRASES = [
  "clean up",
  "clean the",
  "tidy up",
  "pick up",
  "put away",
  "do the dishes",
  "wash dishes",
  "do laundry",
  "fold laundry",
  "put away laundry",
  "clean the house",
  "deep clean",
];

/**
 * Check if input contains cleaning keywords
 */
export function isCleaningIntent(input: string): boolean {
  const lower = input.toLowerCase();
  return (
    CLEANING_KEYWORDS.some((kw) => lower.includes(kw)) ||
    CLEANING_PHRASES.some((phrase) => lower.includes(phrase))
  );
}

/**
 * Extract cleaning task details
 */
export function extractCleaningDetails(input: string): {
  task: string;
  location?: string;
} {
  const lower = input.toLowerCase();
  const locations = [
    "bathroom",
    "kitchen",
    "bedroom",
    "living room",
    "fridge",
    "refrigerator",
    "oven",
    "stove",
  ];

  const foundLocation = locations.find((loc) => lower.includes(loc));

  return {
    task: input.trim(),
    location: foundLocation,
  };
}

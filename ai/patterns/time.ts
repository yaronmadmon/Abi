/**
 * Time Pattern Matchers
 * Keywords and patterns for time-related extraction
 */

export const TIME_INDICATORS = {
  today: ["today", "this morning", "this afternoon", "this evening", "tonight"],
  tomorrow: ["tomorrow", "tomorrow morning", "tomorrow afternoon", "tomorrow evening"],
  thisWeek: ["this week", "sometime this week", "during the week"],
  nextWeek: ["next week"],
  later: ["later", "later today", "later tonight"],
  now: ["now", "right now", "immediately", "asap"],
};

export const DAYS_OF_WEEK = {
  monday: ["monday", "mon"],
  tuesday: ["tuesday", "tue", "tues"],
  wednesday: ["wednesday", "wed"],
  thursday: ["thursday", "thu", "thur", "thurs"],
  friday: ["friday", "fri"],
  saturday: ["saturday", "sat"],
  sunday: ["sunday", "sun"],
};

export const FREQUENCY_PATTERNS = [
  "every day",
  "daily",
  "every week",
  "weekly",
  "every month",
  "monthly",
  "every monday",
  "every tuesday",
  "every wednesday",
  "every thursday",
  "every friday",
  "every saturday",
  "every sunday",
  "once a week",
  "twice a week",
];

/**
 * Extract time reference from input
 */
export function extractTimeReference(input: string): {
  date?: string;
  day?: string;
  time?: string;
  isUrgent?: boolean;
} {
  const lower = input.toLowerCase();
  const result: {
    date?: string;
    day?: string;
    time?: string;
    isUrgent?: boolean;
  } = {};

  // Check for urgent indicators
  if (TIME_INDICATORS.now.some((indicator) => lower.includes(indicator))) {
    result.isUrgent = true;
    result.date = new Date().toISOString().split("T")[0];
    return result;
  }

  // Extract time first (e.g., "3pm", "3:00 pm", "15:00")
  const timePattern = /\b(\d{1,2})(?::(\d{2}))?\s*(am|pm|AM|PM)\b/i;
  const timeMatch = input.match(timePattern);
  if (timeMatch) {
    let hours = parseInt(timeMatch[1]);
    const minutes = timeMatch[2] ? parseInt(timeMatch[2]) : 0;
    const period = timeMatch[3].toLowerCase();
    
    if (period === 'pm' && hours !== 12) hours += 12;
    if (period === 'am' && hours === 12) hours = 0;
    
    result.time = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
  } else {
    // Try 24-hour format
    const time24Pattern = /\b(\d{1,2}):(\d{2})\b/;
    const time24Match = input.match(time24Pattern);
    if (time24Match) {
      const hour = parseInt(time24Match[1]);
      const min = time24Match[2];
      if (hour >= 0 && hour < 24) {
        result.time = `${hour.toString().padStart(2, '0')}:${min}`;
      }
    }
  }

  // Check for specific days
  for (const [day, variants] of Object.entries(DAYS_OF_WEEK)) {
    if (variants.some((v) => lower.includes(v))) {
      result.day = day;
      break;
    }
  }

  // Check for relative dates
  if (TIME_INDICATORS.today.some((indicator) => lower.includes(indicator))) {
    result.date = new Date().toISOString().split("T")[0];
  } else if (
    TIME_INDICATORS.tomorrow.some((indicator) => lower.includes(indicator))
  ) {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    result.date = tomorrow.toISOString().split("T")[0];
  } else if (TIME_INDICATORS.thisWeek.some((indicator) => lower.includes(indicator))) {
    // This week - no specific date
    result.date = undefined;
  } else if (TIME_INDICATORS.nextWeek.some((indicator) => lower.includes(indicator))) {
    // Next week - no specific date
    const nextWeek = new Date();
    nextWeek.setDate(nextWeek.getDate() + 7);
    result.date = nextWeek.toISOString().split("T")[0];
  } else if (TIME_INDICATORS.later.some((indicator) => lower.includes(indicator))) {
    result.date = new Date().toISOString().split("T")[0];
  }

  return result;
}

/**
 * Get default day (today's day of week)
 */
export function getDefaultDay(): string {
  const days = [
    "sunday",
    "monday",
    "tuesday",
    "wednesday",
    "thursday",
    "friday",
    "saturday",
  ];
  return days[new Date().getDay()];
}

/**
 * Check if input contains time indicators
 */
export function hasTimeReference(input: string): boolean {
  const lower = input.toLowerCase();
  return (
    Object.values(TIME_INDICATORS).some((indicators) =>
      indicators.some((indicator) => lower.includes(indicator))
    ) ||
    Object.values(DAYS_OF_WEEK).some((variants) =>
      variants.some((variant) => lower.includes(variant))
    )
  );
}

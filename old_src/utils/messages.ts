/**
 * Calming Messages for Today Screen
 */

const messages = [
  "Take it one step at a time.",
  "You've got this.",
  "A calm start to your day.",
  "Everything in its own time.",
  "Breathe. You're doing great.",
  "Today is yours.",
  "Start where you are.",
  "One thing at a time.",
];

export function getCalmingMessage(): string {
  // Use date-based seed for consistent daily message
  const today = new Date();
  const seed = today.getFullYear() * 10000 + (today.getMonth() + 1) * 100 + today.getDate();
  const index = seed % messages.length;
  return messages[index];
}

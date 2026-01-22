/**
 * AI Text Polisher
 * Polishes, improves, or rewrites text using GPT
 * Simple text in → text out, no intent parsing
 */

import OpenAI from "openai";
import { getOpenAIApiKey } from "./serverEnv";

// Initialize OpenAI client
const getOpenAIClient = () => {
  const apiKey = getOpenAIApiKey();
  if (!apiKey) {
    throw new Error("OPENAI_API_KEY environment variable is not set");
  }
  return new OpenAI({ apiKey });
};

export type PolishStyle = "polish" | "shorten" | "friendlier" | "professional" | "clarify" | "checklist";

/**
 * Polish text using GPT
 * @param text - Text to polish
 * @param style - Style of polishing (default: "polish")
 * @returns Polished text
 */
export async function polishText(
  text: string,
  style: PolishStyle = "polish"
): Promise<string> {
  if (!text || !text.trim()) {
    return text;
  }

  try {
    const client = getOpenAIClient();

    const stylePrompts: Record<PolishStyle, string> = {
      polish: "Improve the clarity, grammar, and naturalness of this text while keeping the original meaning. Fix any typos or errors.",
      shorten: "Make this text more concise while preserving all important information and meaning.",
      friendlier: "Rewrite this text to be warmer, friendlier, and more conversational while keeping the same meaning.",
      professional: "Rewrite this text to be more professional and formal while keeping the same meaning.",
      clarify: "Rewrite this text to be clearer and easier to understand while keeping the same meaning.",
      checklist: "Convert this text into a checklist format with bullet points. Each item should be actionable and clear.",
    };

    const systemPrompt = `You are a text polishing assistant. Your job is to improve text based on the user's request.

CRITICAL RULES:
1. NEVER change the core meaning
2. NEVER add information that wasn't in the original
3. NEVER remove critical information
4. Keep the same tone unless specifically asked to change it
5. Fix grammar, spelling, and clarity issues
6. Return ONLY the polished text, no explanations, no meta-commentary

${stylePrompts[style]}

Return the polished text directly, nothing else.`;

    const response = await client.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: text },
      ],
      temperature: 0.3, // Lower temperature for more consistent, faithful rewrites
      max_tokens: 500,
    });

    const polished = response.choices[0]?.message?.content?.trim();
    return polished || text; // Fallback to original if GPT fails
  } catch (error) {
    console.error("Text polishing error:", error);
    return text; // Fallback to original on error
  }
}

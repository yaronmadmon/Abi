/**
 * Shopping Pattern Matchers
 * Keywords and patterns for shopping-related intents
 */

export const SHOPPING_KEYWORDS = [
  "buy",
  "purchase",
  "get",
  "pick up",
  "shopping",
  "grocery",
  "groceries",
  "add to list",
  "need",
  "grocery list",
  "shopping list",
  "store",
  "market",
  "shop",
];

export const SHOPPING_PHRASES = [
  "add to list",
  "grocery list",
  "shopping list",
  "pick up",
  "need to buy",
  "get from store",
  "add to shopping",
];

export const COMMON_ITEMS = [
  "milk",
  "eggs",
  "chicken",
  "bread",
  "cheese",
  "fruit",
  "vegetable",
  "produce",
  "dairy",
  "meat",
  "fish",
  "pasta",
  "rice",
  "cereal",
  "yogurt",
  "butter",
  "apples",
  "bananas",
  "oranges",
  "lettuce",
  "tomatoes",
];

export const SHOPPING_CATEGORIES = {
  produce: [
    "apple",
    "apples",
    "banana",
    "bananas",
    "orange",
    "oranges",
    "lettuce",
    "tomato",
    "tomatoes",
    "vegetable",
    "vegetables",
    "fruit",
    "fruits",
    "berries",
    "avocado",
    "avocados",
    "carrot",
    "carrots",
    "onion",
    "onions",
  ],
  dairy: [
    "milk",
    "cheese",
    "yogurt",
    "butter",
    "cream",
    "sour cream",
    "cottage cheese",
  ],
  meat: [
    "chicken",
    "beef",
    "pork",
    "fish",
    "meat",
    "turkey",
    "bacon",
    "sausage",
    "ground beef",
  ],
  cleaning: [
    "sponges",
    "soap",
    "detergent",
    "cleaner",
    "paper towel",
    "toilet paper",
    "tissue",
    "napkins",
    "trash bags",
  ],
  pantry: [
    "bread",
    "pasta",
    "rice",
    "cereal",
    "flour",
    "sugar",
    "salt",
    "pepper",
    "oil",
  ],
};

/**
 * Check if input contains shopping keywords
 */
export function isShoppingIntent(input: string): boolean {
  const lower = input.toLowerCase();
  return (
    SHOPPING_KEYWORDS.some((kw) => lower.includes(kw)) ||
    SHOPPING_PHRASES.some((phrase) => lower.includes(phrase)) ||
    COMMON_ITEMS.some((item) => lower.includes(item))
  );
}

/**
 * Extract shopping category from item name
 */
export function extractShoppingCategory(
  item: string
): "produce" | "dairy" | "meat" | "cleaning" | "pantry" | "other" {
  const lower = item.toLowerCase();

  for (const [category, keywords] of Object.entries(SHOPPING_CATEGORIES)) {
    if (keywords.some((kw) => lower.includes(kw))) {
      return category as "produce" | "dairy" | "meat" | "cleaning" | "pantry";
    }
  }

  return "other";
}

/**
 * Extract shopping items from input (handles comma-separated lists)
 */
export function extractShoppingItems(input: string): string[] {
  // Check for comma-separated list
  if (input.includes(",")) {
    return input
      .split(",")
      .map((item) => item.trim())
      .filter((item) => item.length > 0);
  }

  // Check for "and" separator
  if (input.toLowerCase().includes(" and ")) {
    return input
      .split(/\s+and\s+/i)
      .map((item) => item.trim())
      .filter((item) => item.length > 0);
  }

  // Single item - remove shopping verbs
  const shoppingVerbs = ["buy", "get", "pick up", "add", "need"];
  let item = input.trim().toLowerCase();

  for (const verb of shoppingVerbs) {
    if (item.startsWith(verb)) {
      item = item.substring(verb.length).trim();
      break;
    }
  }

  // Remove "to list" or similar
  item = item.replace(/\s+(to|on|in)\s+(list|shopping|grocery).*$/i, "").trim();

  return item ? [item] : [];
}

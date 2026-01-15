/**
 * Shopping Module Handler
 * Adapter for shopping module - wraps existing module logic
 */

import type { ShoppingPayload } from "../schemas/intentSchema";
import type { ShoppingItem } from "@/types/home";

export interface ModuleHandler {
  create(data: any): Promise<void>;
}

class ShoppingHandler implements ModuleHandler {
  async create(payload: ShoppingPayload): Promise<void> {
    // Check if localStorage is available (client-side only)
    if (typeof window === 'undefined' || !window.localStorage) {
      throw new Error('localStorage is not available');
    }

    // Load existing items
    const stored = localStorage.getItem("shoppingItems");
    const items: ShoppingItem[] = stored ? JSON.parse(stored) : [];

    // Create new items for each shopping item
    for (const itemName of payload.items) {
      const item: ShoppingItem = {
        id: `${Date.now()}-${Math.random()}`,
        name: itemName,
        category: payload.category || "other",
        completed: false,
        createdAt: new Date().toISOString(),
      };
      items.push(item);
    }

    // Save items
    localStorage.setItem("shoppingItems", JSON.stringify(items));
  }
}

export const shoppingHandler = new ShoppingHandler();

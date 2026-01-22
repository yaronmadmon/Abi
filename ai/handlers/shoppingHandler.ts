/**
 * Shopping Module Handler
 * Adapter for shopping module - wraps existing module logic
 * 
 * ARCHITECTURAL SPLIT:
 * - propose(): AI-accessible, read-only, generates preview
 * - execute(): Private, only callable by CommandExecutor
 */

import type { ShoppingPayload } from "../schemas/intentSchema";
import type { ShoppingItem } from "@/types/home";
import { logger } from "@/lib/logger";

export interface ModuleHandler {
  create(data: any): Promise<void>;
}

export interface ShoppingPreview {
  preview: ShoppingItem[];
  validation: { valid: boolean; errors: string[] };
  impacts: string[];
}

class ShoppingHandler implements ModuleHandler {
  /**
   * LEGACY METHOD - Kept for backward compatibility
   * Will be removed after full migration
   * @deprecated Use propose() + execute() pattern instead
   */
  async create(payload: ShoppingPayload): Promise<void> {
    return this.execute(payload);
  }

  /**
   * Phase 1: AI-accessible (read-only, generates preview)
   * This method is safe for AI to call - it only generates a preview
   */
  async propose(payload: ShoppingPayload): Promise<ShoppingPreview> {
    // Validate payload
    const validation = this.validate(payload);
    
    // Generate preview items
    const preview: ShoppingItem[] = payload.items.map(itemName => ({
      id: `temp_${Date.now()}_${itemName}`,
      name: itemName,
      category: payload.category || "other",
      completed: false,
      createdAt: new Date().toISOString(),
    }));
    
    // Generate impacts
    const impacts = [
      `Creates ${payload.items.length} shopping item${payload.items.length === 1 ? '' : 's'}`,
    ];
    if (payload.category) impacts.push(`Category: ${payload.category}`);
    if (payload.items.length > 0) {
      const itemsList = payload.items.slice(0, 3).join(', ');
      const remaining = payload.items.length - 3;
      impacts.push(`Items: ${itemsList}${remaining > 0 ? ` and ${remaining} more` : ''}`);
    }
    
    return {
      preview,
      validation,
      impacts,
    };
  }

  /**
   * Phase 2: Private executor (only callable by CommandExecutor)
   * This is the ONLY method that can mutate state
   */
  async execute(payload: ShoppingPayload): Promise<ShoppingItem[]> {
    // Check if localStorage is available (client-side only)
    if (typeof window === 'undefined' || !window.localStorage) {
      throw new Error('localStorage is not available');
    }

    // Load existing items
    const stored = localStorage.getItem("shoppingItems");
    const items: ShoppingItem[] = stored ? JSON.parse(stored) : [];

    // Create new items for each shopping item
    const newItems: ShoppingItem[] = [];
    for (const itemName of payload.items) {
      const item: ShoppingItem = {
        id: `${Date.now()}-${Math.random()}`,
        name: itemName,
        category: payload.category || "other",
        completed: false,
        createdAt: new Date().toISOString(),
      };
      items.push(item);
      newItems.push(item);
    }

    // Save items
    localStorage.setItem("shoppingItems", JSON.stringify(items));
    
    // Trigger custom event for updates
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new Event('shoppingUpdated'));
    }
    
    logger.info('Shopping items created successfully', { count: newItems.length });
    
    return newItems;
  }

  /**
   * Update a shopping item
   * SAFETY: Requires valid ID and validates existence
   */
  async update(payload: { id: string; name?: string; category?: string; completed?: boolean }): Promise<ShoppingItem> {
    if (typeof window === 'undefined' || !window.localStorage) {
      throw new Error('localStorage is not available');
    }

    if (!payload.id) {
      throw new Error('Shopping item ID is required for update');
    }

    const stored = localStorage.getItem("shoppingItems");
    const items: ShoppingItem[] = stored ? JSON.parse(stored) : [];
    
    const itemIndex = items.findIndex(i => i.id === payload.id);
    if (itemIndex === -1) {
      throw new Error(`Shopping item with ID ${payload.id} not found`);
    }

    const updatedItem: ShoppingItem = {
      ...items[itemIndex],
      ...(payload.name && { name: payload.name }),
      ...(payload.category && { category: payload.category }),
      ...(payload.completed !== undefined && { completed: payload.completed }),
    };

    items[itemIndex] = updatedItem;
    localStorage.setItem("shoppingItems", JSON.stringify(items));
    window.dispatchEvent(new Event('shoppingUpdated'));
    
    logger.info('Shopping item updated successfully', { itemId: updatedItem.id });
    return updatedItem;
  }

  /**
   * Remove a shopping item
   * SAFETY: Requires valid ID and validates existence
   */
  async remove(payload: { id: string }): Promise<void> {
    if (typeof window === 'undefined' || !window.localStorage) {
      throw new Error('localStorage is not available');
    }

    if (!payload.id) {
      throw new Error('Shopping item ID is required for remove');
    }

    const stored = localStorage.getItem("shoppingItems");
    const items: ShoppingItem[] = stored ? JSON.parse(stored) : [];
    
    const itemIndex = items.findIndex(i => i.id === payload.id);
    if (itemIndex === -1) {
      throw new Error(`Shopping item with ID ${payload.id} not found`);
    }

    items.splice(itemIndex, 1);
    localStorage.setItem("shoppingItems", JSON.stringify(items));
    window.dispatchEvent(new Event('shoppingUpdated'));
    
    logger.info('Shopping item removed successfully', { itemId: payload.id });
  }

  /**
   * Validate shopping payload
   */
  private validate(payload: ShoppingPayload): { valid: boolean; errors: string[] } {
    const errors: string[] = [];
    
    if (!payload.items || payload.items.length === 0) {
      errors.push('At least one shopping item is required');
    }
    
    if (payload.items) {
      payload.items.forEach((item, index) => {
        if (!item || item.trim() === '') {
          errors.push(`Item ${index + 1} is empty`);
        }
        if (item && item.length > 100) {
          errors.push(`Item "${item}" is too long (max 100 characters)`);
        }
      });
    }
    
    return {
      valid: errors.length === 0,
      errors,
    };
  }
}

export const shoppingHandler = new ShoppingHandler();

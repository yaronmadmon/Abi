/**
 * Input Handler
 * Handles voice and text input
 */

import { Input, InputType } from '../types';

export class InputHandler {
  /**
   * Process raw input (voice or text)
   */
  async processInput(
    content: string,
    type: InputType,
    metadata?: Record<string, unknown>
  ): Promise<Input> {
    const input: Input = {
      id: this.generateId(),
      type,
      content: this.normalizeContent(content),
      timestamp: new Date().toISOString(),
      metadata,
    };

    return input;
  }

  /**
   * Normalize input content
   */
  private normalizeContent(content: string): string {
    return content.trim();
  }

  /**
   * Generate unique ID
   */
  private generateId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }
}

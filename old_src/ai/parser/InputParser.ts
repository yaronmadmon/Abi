/**
 * Input Parser
 * Parses brain dump and free-form input into Tasks, Events, and Notes
 * 
 * Refactored to use modular components:
 * - RawInputCapture: Captures and normalizes input
 * - MeaningExtractor: Extracts semantic meaning
 * - EntityBuilder: Builds structured entities
 * - ClarificationGate: Manages clarification questions
 */

import { Input, InputType } from '../types';
import { ParsedItem } from '@/types/today';
import { RawInputCapture } from '../input/RawInputCapture';
import { MeaningExtractor } from '../input/MeaningExtractor';
import { EntityBuilder } from '../input/EntityBuilder';
import { ClarificationGate } from '../input/ClarificationGate';

export class InputParser {
  private rawCapture: RawInputCapture;
  private meaningExtractor: MeaningExtractor;
  private entityBuilder: EntityBuilder;
  private clarificationGate: ClarificationGate;

  constructor() {
    this.rawCapture = new RawInputCapture();
    this.meaningExtractor = new MeaningExtractor();
    this.entityBuilder = new EntityBuilder();
    this.clarificationGate = new ClarificationGate();
  }
  /**
   * Parse input into multiple items (for brain dump mode)
   */
  async parseBrainDump(input: Input): Promise<ParsedItem[]> {
    // Capture input
    const captured = this.rawCapture.capture(input);
    if (!this.rawCapture.isValid(captured)) {
      return [];
    }

    // Split into sentences
    const sentences = this.rawCapture.splitIntoSentences(captured.raw);
    const items: ParsedItem[] = [];

    for (const sentence of sentences) {
      if (sentence.trim().length === 0) continue;
      
      const item = await this.parseSingleItem(sentence.trim(), captured);
      if (item) {
        items.push(item);
      }
    }

    return items;
  }

  /**
   * Parse single input (for free-form mode)
   */
  async parseSingle(input: Input): Promise<ParsedItem[]> {
    // Capture input
    const captured = this.rawCapture.capture(input);
    if (!this.rawCapture.isValid(captured)) {
      return [];
    }

    const item = await this.parseSingleItem(captured.raw, captured);
    return item ? [item] : [];
  }

  /**
   * Parse a single text item into a ParsedItem
   * Refactored to use modular components while preserving behavior
   */
  private async parseSingleItem(
    text: string,
    captured: { raw: string; normalized: string }
  ): Promise<ParsedItem | null> {
    if (captured.normalized.length === 0) return null;

    // Extract meaning
    const meaning = this.meaningExtractor.extract(captured.raw, captured.normalized);
    
    // Check if clarification is needed
    const clarification = this.clarificationGate.generateQuestion(meaning, captured.raw);
    // Note: Clarification is handled elsewhere, we continue parsing here
    
    // Build entity
    const item = this.entityBuilder.build(meaning, captured.raw);
    
    return item;
  }
}

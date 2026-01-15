/**
 * Semantic Search
 * Handles natural language queries for timeline search
 */

import { TimelineItem } from '@/types/timeline';
import { SearchQuery } from '@/types/timeline';

export class SemanticSearch {
  /**
   * Process a semantic search query
   */
  async search(query: string, items: TimelineItem[]): Promise<TimelineItem[]> {
    const normalizedQuery = query.toLowerCase().trim();
    
    // Detect query pattern
    const pattern = this.detectPattern(normalizedQuery);
    
    switch (pattern.type) {
      case 'when_last':
        return this.searchWhenLast(pattern.term, items);
      case 'did_already':
        return this.searchDidAlready(pattern.term, items);
      case 'keyword':
        return this.searchKeyword(pattern.term, items);
      default:
        return this.searchKeyword(normalizedQuery, items);
    }
  }

  /**
   * Detect query pattern (e.g., "when did we last...", "did we already...")
   */
  private detectPattern(query: string): { type: 'when_last' | 'did_already' | 'keyword'; term: string } {
    // "When did we last..." pattern
    const whenLastMatch = query.match(/when\s+(?:did\s+)?(?:we\s+)?last\s+(.+)/i);
    if (whenLastMatch) {
      return { type: 'when_last', term: whenLastMatch[1].trim() };
    }

    // "Did we already..." pattern
    const didAlreadyMatch = query.match(/did\s+(?:we\s+)?(?:already\s+)?(.+)/i);
    if (didAlreadyMatch) {
      return { type: 'did_already', term: didAlreadyMatch[1].trim() };
    }

    // Default to keyword search
    return { type: 'keyword', term: query };
  }

  /**
   * Search for "when did we last..." queries
   */
  private searchWhenLast(term: string, items: TimelineItem[]): TimelineItem[] {
    // Filter items that match the term
    const matching = this.filterByTerm(term, items);
    
    // Sort by date (most recent first)
    matching.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    
    // Return only the most recent match (or top 3)
    return matching.slice(0, 3);
  }

  /**
   * Search for "did we already..." queries
   */
  private searchDidAlready(term: string, items: TimelineItem[]): TimelineItem[] {
    // Filter items that match the term
    const matching = this.filterByTerm(term, items);
    
    // Sort by date (most recent first)
    matching.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    
    // Return matches (limited to avoid overwhelming)
    return matching.slice(0, 10);
  }

  /**
   * Keyword search
   */
  private searchKeyword(term: string, items: TimelineItem[]): TimelineItem[] {
    const matching = this.filterByTerm(term, items);
    
    // Sort by relevance (simple: more recent first)
    matching.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    
    return matching;
  }

  /**
   * Filter items by search term
   */
  private filterByTerm(term: string, items: TimelineItem[]): TimelineItem[] {
    const normalizedTerm = term.toLowerCase();
    
    return items.filter((item) => {
      const titleMatch = item.title.toLowerCase().includes(normalizedTerm);
      const descMatch = item.description?.toLowerCase().includes(normalizedTerm);
      const typeMatch = item.type.toLowerCase().includes(normalizedTerm);
      
      return titleMatch || descMatch || typeMatch;
    });
  }
}

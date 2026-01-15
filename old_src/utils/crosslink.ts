/**
 * Cross-linking Utilities
 * Automatically links related timeline items
 */

import { TimelineItem } from '@/types/timeline';

export function findLinkedItems(item: TimelineItem, allItems: TimelineItem[]): string[] {
  const linkedIds: string[] = [];
  
  // Simple cross-linking logic (placeholder - would be enhanced with AI in future)
  
  // Link items with similar titles
  allItems.forEach((other) => {
    if (other.id === item.id) return;
    
    const similarity = calculateTitleSimilarity(item.title, other.title);
    if (similarity > 0.6) {
      linkedIds.push(other.id);
    }
  });
  
  // Link items with overlapping timeframes (for events/tasks)
  if (item.type === 'event' || item.type === 'task') {
    allItems.forEach((other) => {
      if (other.id === item.id) return;
      if (linkedIds.includes(other.id)) return;
      
      if (areTimeframesOverlapping(item, other)) {
        linkedIds.push(other.id);
      }
    });
  }
  
  // Limit to top 5 links to avoid clutter
  return linkedIds.slice(0, 5);
}

/**
 * Calculate title similarity (simple Jaccard similarity)
 */
function calculateTitleSimilarity(title1: string, title2: string): number {
  const words1 = new Set(title1.toLowerCase().split(/\s+/));
  const words2 = new Set(title2.toLowerCase().split(/\s+/));
  
  const intersection = new Set([...words1].filter((x) => words2.has(x)));
  const union = new Set([...words1, ...words2]);
  
  return intersection.size / union.size;
}

/**
 * Check if two items have overlapping timeframes
 */
function areTimeframesOverlapping(item1: TimelineItem, item2: TimelineItem): boolean {
  const date1 = new Date(item1.timestamp);
  const date2 = new Date(item2.timestamp);
  
  // Consider overlapping if within 7 days
  const diffDays = Math.abs((date1.getTime() - date2.getTime()) / (1000 * 60 * 60 * 24));
  return diffDays <= 7;
}

/**
 * Timeline Page
 * Unified timeline (Second Brain) for all household items
 */

import { useState, useMemo } from 'react';
import { SearchBar } from '@/ui/components/SearchBar';
import { TimelineSection } from '@/ui/components/TimelineSection';
import { TimelineItem as TimelineItemType, TimelineSection as TimelineSectionType } from '@/types/timeline';
import { SemanticSearch } from '@/ai/search/SemanticSearch';
import { groupItemsByPeriod } from '@/utils/timeline';
import { findLinkedItems } from '@/utils/crosslink';
import './Timeline.css';

// Placeholder data for demonstration
// In future phases, this would come from a data store
const placeholderItems: TimelineItemType[] = [];

export function Timeline() {
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [allItems, setAllItems] = useState<TimelineItemType[]>(placeholderItems);
  const [searchResults, setSearchResults] = useState<TimelineItemType[] | null>(null);
  const searchEngine = new SemanticSearch();

  // Process items with cross-linking
  const processedItems = useMemo(() => {
    return allItems.map((item) => {
      const linkedIds = findLinkedItems(item, allItems);
      return {
        ...item,
        linkedItems: linkedIds,
      };
    });
  }, [allItems]);

  // Handle search
  const handleSearch = async (query: string) => {
    setSearchQuery(query);
    
    if (!query.trim()) {
      setSearchResults(null);
      return;
    }

    try {
      const results = await searchEngine.search(query, processedItems);
      setSearchResults(results);
    } catch (error) {
      console.error('Search error:', error);
      setSearchResults(null);
    }
  };

  // Determine which items to display
  const displayItems = useMemo(() => {
    if (searchQuery && searchResults) {
      return searchResults;
    }
    return processedItems;
  }, [searchQuery, searchResults, processedItems]);

  // Group items by period
  const displaySections = useMemo(() => {
    return groupItemsByPeriod(displayItems);
  }, [displayItems]);

  const handleItemClick = (item: TimelineItemType) => {
    // Placeholder: handle item click (e.g., navigate to detail view)
    console.log('Item clicked:', item);
  };

  return (
    <div className="timeline-page">
      <div className="timeline-page__header">
        <h1 className="timeline-page__title">Timeline</h1>
        <p className="timeline-page__description">
          Your household's unified timeline
        </p>
      </div>

      <SearchBar
        onSearch={handleSearch}
        placeholder='Try: "When did we last..." or "Did we already..."'
      />

      {searchQuery && (
        <div className="timeline-page__search-info">
          <p>
            Showing {searchResults?.length || 0} result{searchResults?.length !== 1 ? 's' : ''} for: <strong>"{searchQuery}"</strong>
          </p>
        </div>
      )}

      {displaySections.length === 0 ? (
        <div className="timeline-page__empty">
          <p className="timeline-page__empty-text">
            {searchQuery 
              ? `No results found for "${searchQuery}".`
              : 'No items yet. Items you create will appear here.'}
          </p>
        </div>
      ) : (
        <div className="timeline-page__sections">
          {displaySections.map((section) => (
            <TimelineSection
              key={section.period}
              section={section}
              onItemClick={handleItemClick}
            />
          ))}
        </div>
      )}
    </div>
  );
}

/**
 * Global Search Component
 * Gentle entry point for finding anything across the app
 */

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './GlobalSearch.css';

export function GlobalSearch() {
  const [query, setQuery] = useState('');
  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;
    
    // Simple search - navigate to documents page with search query
    // In production, this would search across all entities and show results
    navigate(`/memories/documents?search=${encodeURIComponent(query.trim())}`);
    setQuery('');
  };

  return (
    <form onSubmit={handleSubmit} className="global-search">
      <div className="global-search__container">
        <span className="global-search__icon" aria-hidden="true">
          🔍
        </span>
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Find anything..."
          className="global-search__input"
          aria-label="Search"
        />
      </div>
    </form>
  );
}

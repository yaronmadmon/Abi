/**
 * Search Bar Component
 * Semantic search input for timeline
 */

import { useState, useRef, useEffect } from 'react';
import './SearchBar.css';

interface SearchBarProps {
  onSearch: (query: string) => void;
  placeholder?: string;
  disabled?: boolean;
  value?: string;
  onChange?: (query: string) => void;
}

export function SearchBar({ onSearch, placeholder, disabled, value: controlledValue, onChange }: SearchBarProps) {
  const [internalQuery, setInternalQuery] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  const query = controlledValue !== undefined ? controlledValue : internalQuery;

  useEffect(() => {
    // Auto-focus on mount
    if (inputRef.current && !disabled) {
      inputRef.current.focus();
    }
  }, [disabled]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    if (controlledValue !== undefined) {
      // Controlled mode
      if (onChange) {
        onChange(newValue);
      }
    } else {
      // Uncontrolled mode
      setInternalQuery(newValue);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim() && !disabled) {
      onSearch(query.trim());
    }
  };

  const handleClear = () => {
    if (controlledValue !== undefined) {
      // Controlled mode
      if (onChange) {
        onChange('');
      }
    } else {
      // Uncontrolled mode
      setInternalQuery('');
    }
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  return (
    <form onSubmit={handleSubmit} className="search-bar">
      <div className="search-bar__container">
        <span className="search-bar__icon" aria-hidden="true">
          🔍
        </span>
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={handleChange}
          placeholder={placeholder || 'Search timeline... (e.g., "When did we last...", "Did we already...")'}
          disabled={disabled}
          className="search-bar__input"
        />
        {query && (
          <button
            type="button"
            onClick={handleClear}
            className="search-bar__clear"
            aria-label="Clear search"
          >
            ×
          </button>
        )}
      </div>
    </form>
  );
}

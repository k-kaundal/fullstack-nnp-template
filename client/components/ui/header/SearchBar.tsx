/**
 * Advanced SearchBar Component
 * Professional search with filters, suggestions, and recent searches
 */

'use client';

import { useState, useRef, useEffect } from 'react';
import { SearchSuggestion, SearchBarProps } from '@/interfaces';

/**
 * Advanced SearchBar with filters, suggestions, and keyboard shortcuts
 *
 * @param props - SearchBar configuration
 * @returns JSX Element
 */
export function SearchBar({
  placeholder = 'Search...',
  onSearch,
  advanced = false,
  filters = [],
  showRecent = true,
  recentSearches = [],
  suggestions = [],
  showShortcuts = true,
}: SearchBarProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [activeFilters, setActiveFilters] = useState<
    Record<string, string | string[] | Date | { min: number; max: number }>
  >({});
  const [showFilters, setShowFilters] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setShowFilters(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Keyboard shortcuts (Ctrl/Cmd + K)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        inputRef.current?.focus();
        setIsOpen(true);
      }
      if (e.key === 'Escape') {
        setIsOpen(false);
        setShowFilters(false);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (onSearch && query.trim()) {
      onSearch(query);
      setIsOpen(false);
    }
  };

  const handleSuggestionClick = (suggestion: SearchSuggestion) => {
    if (suggestion.onClick) {
      suggestion.onClick();
    } else {
      setQuery(suggestion.text);
      if (onSearch) {
        onSearch(suggestion.text);
      }
    }
    setIsOpen(false);
  };

  const handleRecentSearchClick = (search: string) => {
    setQuery(search);
    if (onSearch) {
      onSearch(search);
    }
    setIsOpen(false);
  };

  const handleFilterChange = (
    filterId: string,
    value: string | string[] | Date | { min: number; max: number }
  ) => {
    setActiveFilters((prev) => ({ ...prev, [filterId]: value }));
    const filter = filters.find((f) => f.id === filterId);
    if (filter?.onChange) {
      filter.onChange(value);
    }
  };

  const filteredSuggestions = suggestions.filter((s) =>
    s.text.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div ref={searchRef} className="relative">
      {/* Search Button (collapsed state) */}
      <button
        onClick={() => {
          setIsOpen(!isOpen);
          setTimeout(() => inputRef.current?.focus(), 100);
        }}
        className="p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors text-gray-700 dark:text-gray-300"
        aria-label="Search"
      >
        <SearchIcon />
      </button>

      {/* Search Dropdown */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-125 bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 z-50">
          {/* Search Input */}
          <form
            onSubmit={handleSearch}
            className="p-4 border-b border-gray-200 dark:border-gray-700"
          >
            <div className="flex items-center gap-2">
              <div className="flex-1 relative">
                <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  ref={inputRef}
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder={placeholder}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  autoFocus
                />
              </div>

              {advanced && filters.length > 0 && (
                <button
                  type="button"
                  onClick={() => setShowFilters(!showFilters)}
                  className={`px-3 py-2 rounded-md text-sm font-medium transition-colors flex items-center gap-2 ${
                    showFilters
                      ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
                      : 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                  }`}
                >
                  <FilterIcon />
                  Filters
                </button>
              )}
            </div>

            {/* Advanced Filters */}
            {showFilters && filters.length > 0 && (
              <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700 space-y-3">
                {filters.map((filter) => (
                  <div key={filter.id}>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      {filter.label}
                    </label>

                    {filter.type === 'select' && (
                      <select
                        value={
                          typeof activeFilters[filter.id] === 'string'
                            ? (activeFilters[filter.id] as string)
                            : ''
                        }
                        onChange={(e) => handleFilterChange(filter.id, e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="">All</option>
                        {filter.options?.map((opt) => (
                          <option key={opt.value} value={opt.value}>
                            {opt.label}
                          </option>
                        ))}
                      </select>
                    )}

                    {filter.type === 'checkbox' && (
                      <div className="space-y-2">
                        {filter.options?.map((opt) => {
                          const currentValue = activeFilters[filter.id];
                          const checkedValues = Array.isArray(currentValue) ? currentValue : [];
                          return (
                            <label key={opt.value} className="flex items-center gap-2">
                              <input
                                type="checkbox"
                                checked={checkedValues.includes(opt.value)}
                                onChange={(e) => {
                                  const newValues = e.target.checked
                                    ? [...checkedValues, opt.value]
                                    : checkedValues.filter((v) => v !== opt.value);
                                  handleFilterChange(filter.id, newValues);
                                }}
                                className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                              />
                              <span className="text-sm text-gray-700 dark:text-gray-300">
                                {opt.label}
                              </span>
                            </label>
                          );
                        })}
                      </div>
                    )}

                    {filter.type === 'date' && (
                      <input
                        type="date"
                        value={
                          activeFilters[filter.id] instanceof Date
                            ? (activeFilters[filter.id] as Date).toISOString().split('T')[0]
                            : typeof activeFilters[filter.id] === 'string'
                              ? (activeFilters[filter.id] as string)
                              : ''
                        }
                        onChange={(e) => handleFilterChange(filter.id, new Date(e.target.value))}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    )}

                    {filter.type === 'range' && (
                      <div>
                        <input
                          type="range"
                          min="0"
                          max="100"
                          value={
                            typeof activeFilters[filter.id] === 'object' &&
                            activeFilters[filter.id] !== null &&
                            !(activeFilters[filter.id] instanceof Date) &&
                            !Array.isArray(activeFilters[filter.id]) &&
                            'min' in (activeFilters[filter.id] as object)
                              ? (activeFilters[filter.id] as { min: number; max: number }).min
                              : 0
                          }
                          onChange={(e) =>
                            handleFilterChange(filter.id, {
                              min: parseInt(e.target.value),
                              max: 100,
                            })
                          }
                          className="w-full"
                        />
                        <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                          Value:{' '}
                          {typeof activeFilters[filter.id] === 'object' &&
                          activeFilters[filter.id] !== null &&
                          !(activeFilters[filter.id] instanceof Date) &&
                          !Array.isArray(activeFilters[filter.id]) &&
                          'min' in (activeFilters[filter.id] as object)
                            ? (activeFilters[filter.id] as { min: number; max: number }).min
                            : 0}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </form>

          {/* Search Content */}
          <div className="max-h-96 overflow-y-auto">
            {/* Recent Searches */}
            {showRecent && recentSearches.length > 0 && query === '' && (
              <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">
                    Recent
                  </h4>
                  <ClockIcon className="w-4 h-4 text-gray-400" />
                </div>
                <div className="space-y-1">
                  {recentSearches.map((search, index) => (
                    <button
                      key={index}
                      onClick={() => handleRecentSearchClick(search)}
                      className="w-full text-left px-3 py-2 rounded-md text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                    >
                      {search}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Suggestions */}
            {filteredSuggestions.length > 0 && query !== '' && (
              <div className="p-4">
                <h4 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase mb-2">
                  Suggestions
                </h4>
                <div className="space-y-1">
                  {filteredSuggestions.map((suggestion) => (
                    <button
                      key={suggestion.id}
                      onClick={() => handleSuggestionClick(suggestion)}
                      className="w-full text-left px-3 py-2 rounded-md text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors flex items-center gap-3"
                    >
                      {suggestion.icon && (
                        <span className="w-5 h-5 text-gray-400">{suggestion.icon}</span>
                      )}
                      <div className="flex-1">
                        <div className="font-medium">{suggestion.text}</div>
                        {suggestion.category && (
                          <div className="text-xs text-gray-500 dark:text-gray-400">
                            {suggestion.category}
                          </div>
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Empty State */}
            {query !== '' && filteredSuggestions.length === 0 && (
              <div className="p-8 text-center text-gray-500 dark:text-gray-400">
                <SearchIcon className="w-12 h-12 mx-auto mb-2 opacity-50" />
                <p>No results found for &quot;{query}&quot;</p>
              </div>
            )}
          </div>

          {/* Keyboard Shortcuts */}
          {showShortcuts && (
            <div className="px-4 py-3 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50 rounded-b-lg">
              <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
                <div className="flex items-center gap-4">
                  <span className="flex items-center gap-1">
                    <kbd className="px-2 py-1 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded text-xs">
                      ↵
                    </kbd>
                    to search
                  </span>
                  <span className="flex items-center gap-1">
                    <kbd className="px-2 py-1 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded text-xs">
                      ESC
                    </kbd>
                    to close
                  </span>
                </div>
                <span className="flex items-center gap-1">
                  <kbd className="px-2 py-1 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded text-xs">
                    ⌘K
                  </kbd>
                  to open
                </span>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// Icon Components
function SearchIcon({ className = 'w-5 h-5' }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
      />
    </svg>
  );
}

function FilterIcon() {
  return (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"
      />
    </svg>
  );
}

function ClockIcon({ className = 'w-4 h-4' }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
      />
    </svg>
  );
}

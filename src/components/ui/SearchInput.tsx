'use client';

import { useState, useRef, useEffect, forwardRef, useCallback } from 'react';
import { cn } from '@/lib/utils';

interface SearchInputProps {
  value?: string;
  defaultValue?: string;
  onChange?: (value: string) => void;
  onSearch?: (value: string) => void;
  onKeyDown?: (e: React.KeyboardEvent) => void;
  placeholder?: string;
  disabled?: boolean;
  loading?: boolean;
  showClearButton?: boolean;
  autoFocus?: boolean;
  debounceMs?: number;
  className?: string;
}

export const SearchInput = forwardRef<HTMLInputElement, SearchInputProps>(
  (
    {
      value,
      defaultValue = '',
      onChange,
      onSearch,
      placeholder = '검색...',
      disabled = false,
      loading = false,
      showClearButton = true,
      autoFocus = false,
      debounceMs = 300,
      className,
    },
    ref
  ) => {
    const isControlled = value !== undefined;
    const [internalValue, setInternalValue] = useState(defaultValue);
    const currentValue = isControlled ? value : internalValue;
    const debounceRef = useRef<NodeJS.Timeout | null>(null);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const newValue = e.target.value;

      if (!isControlled) {
        setInternalValue(newValue);
      }
      onChange?.(newValue);

      // 디바운스된 검색
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
      debounceRef.current = setTimeout(() => {
        onSearch?.(newValue);
      }, debounceMs);
    };

    const handleClear = () => {
      if (!isControlled) {
        setInternalValue('');
      }
      onChange?.('');
      onSearch?.('');
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
      if (e.key === 'Enter') {
        if (debounceRef.current) {
          clearTimeout(debounceRef.current);
        }
        onSearch?.(currentValue);
      }
      if (e.key === 'Escape') {
        handleClear();
      }
    };

    useEffect(() => {
      return () => {
        if (debounceRef.current) {
          clearTimeout(debounceRef.current);
        }
      };
    }, []);

    return (
      <div className={cn('relative', className)}>
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          {loading ? (
            <svg
              className="w-5 h-5 text-gray-400 animate-spin"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
          ) : (
            <svg
              className="w-5 h-5 text-gray-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          )}
        </div>
        <input
          ref={ref}
          type="text"
          value={currentValue}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          disabled={disabled}
          autoFocus={autoFocus}
          className={cn(
            'w-full pl-10 pr-10 py-2.5 text-sm',
            'bg-white border border-gray-300 rounded-lg shadow-sm',
            'placeholder:text-gray-400',
            'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500',
            'disabled:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-60'
          )}
        />
        {showClearButton && currentValue && (
          <button
            type="button"
            onClick={handleClear}
            className="absolute inset-y-0 right-0 pr-3 flex items-center"
            aria-label="검색어 지우기"
          >
            <svg
              className="w-5 h-5 text-gray-400 hover:text-gray-600"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        )}
      </div>
    );
  }
);

SearchInput.displayName = 'SearchInput';

interface SearchSuggestion {
  id: string;
  text: string;
  category?: string;
}

interface SearchInputWithSuggestionsProps extends Omit<SearchInputProps, 'onSearch'> {
  suggestions?: SearchSuggestion[];
  onSelect?: (suggestion: SearchSuggestion) => void;
  onSearch?: (value: string) => void;
  showRecentSearches?: boolean;
  recentSearches?: string[];
  onClearRecentSearches?: () => void;
}

export function SearchInputWithSuggestions({
  suggestions = [],
  onSelect,
  onSearch,
  showRecentSearches = false,
  recentSearches = [],
  onClearRecentSearches,
  ...props
}: SearchInputWithSuggestionsProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const containerRef = useRef<HTMLDivElement>(null);

  const currentValue = props.value ?? '';
  const showSuggestions = suggestions.length > 0;
  const showRecent = showRecentSearches && recentSearches.length > 0 && !currentValue;

  const handleSelect = useCallback(
    (suggestion: SearchSuggestion) => {
      onSelect?.(suggestion);
      setIsOpen(false);
    },
    [onSelect]
  );

  const handleRecentSelect = useCallback(
    (search: string) => {
      props.onChange?.(search);
      onSearch?.(search);
      setIsOpen(false);
    },
    [props.onChange, onSearch]
  );

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen) return;

    const items = showSuggestions ? suggestions : recentSearches;
    const itemCount = items.length;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setHighlightedIndex((prev) => (prev + 1) % itemCount);
        break;
      case 'ArrowUp':
        e.preventDefault();
        setHighlightedIndex((prev) => (prev - 1 + itemCount) % itemCount);
        break;
      case 'Enter':
        if (highlightedIndex >= 0) {
          e.preventDefault();
          if (showSuggestions) {
            handleSelect(suggestions[highlightedIndex]);
          } else {
            handleRecentSelect(recentSearches[highlightedIndex]);
          }
        }
        break;
      case 'Escape':
        setIsOpen(false);
        break;
    }
  };

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div ref={containerRef} className="relative">
      <SearchInput
        {...props}
        onSearch={onSearch}
        onChange={(value) => {
          props.onChange?.(value);
          setIsOpen(true);
          setHighlightedIndex(-1);
        }}
        onKeyDown={handleKeyDown}
      />

      {isOpen && (showSuggestions || showRecent) && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg overflow-hidden">
          {showSuggestions ? (
            <ul className="py-1">
              {suggestions.map((suggestion, index) => (
                <li key={suggestion.id}>
                  <button
                    type="button"
                    onClick={() => handleSelect(suggestion)}
                    className={cn(
                      'w-full px-4 py-2 text-left text-sm',
                      'flex items-center justify-between',
                      highlightedIndex === index
                        ? 'bg-blue-50 text-blue-700'
                        : 'hover:bg-gray-50'
                    )}
                  >
                    <span>{suggestion.text}</span>
                    {suggestion.category && (
                      <span className="text-xs text-gray-400">{suggestion.category}</span>
                    )}
                  </button>
                </li>
              ))}
            </ul>
          ) : showRecent ? (
            <div className="py-1">
              <div className="flex items-center justify-between px-4 py-2">
                <span className="text-xs font-medium text-gray-500">최근 검색어</span>
                {onClearRecentSearches && (
                  <button
                    type="button"
                    onClick={onClearRecentSearches}
                    className="text-xs text-gray-400 hover:text-gray-600"
                  >
                    전체 삭제
                  </button>
                )}
              </div>
              <ul>
                {recentSearches.map((search, index) => (
                  <li key={index}>
                    <button
                      type="button"
                      onClick={() => handleRecentSelect(search)}
                      className={cn(
                        'w-full px-4 py-2 text-left text-sm',
                        'flex items-center gap-2',
                        highlightedIndex === index
                          ? 'bg-blue-50 text-blue-700'
                          : 'hover:bg-gray-50'
                      )}
                    >
                      <svg
                        className="w-4 h-4 text-gray-400"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                      {search}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
        </div>
      )}
    </div>
  );
}

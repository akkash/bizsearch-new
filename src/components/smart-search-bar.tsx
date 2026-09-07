import React, { useState, useEffect, useRef } from 'react';
import { Search, Loader2, TrendingUp } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { AISmartSearchService, type SearchIntent } from '@/lib/ai-smart-search-service';

interface SmartSearchBarProps {
  onSearch: (query: string, intent?: SearchIntent) => void;
  onResultsFound?: (results: any[], intent: SearchIntent) => void;
  placeholder?: string;
  className?: string;
  showSuggestions?: boolean;
}

export function SmartSearchBar({
  onSearch,
  onResultsFound,
  placeholder = "Try: 'coffee shop in Mumbai under 50 lakhs' or 'profitable tech startup Bangalore'",
  className,
  showSuggestions = true,
}: SmartSearchBarProps) {
  const [query, setQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showSuggestionsList, setShowSuggestionsList] = useState(false);
  const [searchExplanation, setSearchExplanation] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);

  // Get autocomplete suggestions
  useEffect(() => {
    const getSuggestions = async () => {
      if (query.length >= 3 && showSuggestions) {
        try {
          const results = await AISmartSearchService.getAutocompleteSuggestions(query);
          setSuggestions(results);
          setShowSuggestionsList(true);
        } catch (error) {
          console.error('Autocomplete error:', error);
        }
      } else {
        setSuggestions([]);
        setShowSuggestionsList(false);
      }
    };

    const debounce = setTimeout(getSuggestions, 300);
    return () => clearTimeout(debounce);
  }, [query, showSuggestions]);

  // Close suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        suggestionsRef.current &&
        !suggestionsRef.current.contains(event.target as Node) &&
        !inputRef.current?.contains(event.target as Node)
      ) {
        setShowSuggestionsList(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearch = async (searchQuery?: string) => {
    const finalQuery = searchQuery || query;
    if (!finalQuery.trim()) return;

    setIsSearching(true);
    setShowSuggestionsList(false);
    setSearchExplanation('');

    try {
      const result = await AISmartSearchService.smartSearch(finalQuery);

      const explanation = await AISmartSearchService.explainResults(
        finalQuery,
        result.searchIntent,
        result.totalResults
      );

      setSearchExplanation(explanation);

      onSearch(finalQuery, result.searchIntent);
      if (onResultsFound) {
        onResultsFound(result.businesses, result.searchIntent);
      }
    } catch (error) {
      console.error('Search error:', error);
      onSearch(finalQuery);
    } finally {
      setIsSearching(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const handleSuggestionClick = (suggestion: string) => {
    setQuery(suggestion);
    handleSearch(suggestion);
  };

  const popularSearches = [
    'Restaurant Mumbai under 1 crore',
    'Tech startup Bangalore',
    'Franchise opportunities',
    'Profitable retail business',
    'Manufacturing business',
  ];

  return (
    <div className={cn('relative w-full', className)}>
      <div className="relative">
        <div className="absolute left-3 top-1/2 -translate-y-1/2">
          <Search className="h-5 w-5 text-muted-foreground" />
        </div>

        <Input
          ref={inputRef}
          type="text"
          placeholder={placeholder}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => query.length >= 3 && setShowSuggestionsList(true)}
          className="pl-11 pr-24 h-12 text-base border-border"
          disabled={isSearching}
        />

        <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-2">
          {isSearching ? (
            <div className="flex items-center gap-2 px-3 py-1.5 bg-muted rounded-md border border-border">
              <Loader2 className="h-4 w-4 animate-spin text-growth-green" />
              <span className="text-xs font-medium text-muted-foreground">Searching...</span>
            </div>
          ) : (
            <Button
              size="sm"
              onClick={() => handleSearch()}
              disabled={!query.trim()}
              className="h-8 bg-growth-green hover:bg-growth-green-dark text-white"
            >
              <Search className="h-4 w-4 mr-1" />
              Search
            </Button>
          )}
        </div>
      </div>

      {searchExplanation && (
        <div className="mt-3 p-3 bg-card rounded-lg border border-border">
          <div className="flex items-start gap-2">
            <Search className="h-4 w-4 text-growth-green mt-0.5 flex-shrink-0" />
            <p className="text-sm text-muted-foreground">
              {searchExplanation}
            </p>
          </div>
        </div>
      )}

      {showSuggestionsList && suggestions.length > 0 && (
        <Card
          ref={suggestionsRef}
          className="absolute top-full left-0 right-0 mt-2 p-2 z-50 border border-border shadow-sm"
        >
          <div className="space-y-1">
            {suggestions.map((suggestion, index) => (
              <button
                key={index}
                onClick={() => handleSuggestionClick(suggestion)}
                className="w-full text-left px-3 py-2 hover:bg-muted rounded-md transition-colors flex items-center gap-2 group"
              >
                <Search className="h-4 w-4 text-muted-foreground group-hover:text-foreground" />
                <span className="text-sm">{suggestion}</span>
              </button>
            ))}
          </div>
        </Card>
      )}

      {!query && showSuggestions && (
        <div className="mt-4">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm font-medium text-muted-foreground">
              Popular Searches
            </span>
          </div>
          <div className="flex flex-wrap gap-2">
            {popularSearches.map((search, index) => (
              <Badge
                key={index}
                variant="outline"
                className="cursor-pointer hover:bg-muted transition-colors"
                onClick={() => {
                  setQuery(search);
                  handleSearch(search);
                }}
              >
                {search}
              </Badge>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

import { useState, useEffect, useCallback, useRef } from 'react';

interface Suggestion {
  id: number;
  name: string;
}

interface UseAutoCompleteProps {
  query: string; // Initial query string
  onSelect: (value: string) => void; // Callback when a suggestion is selected
}

interface UseAutoCompleteReturn {
  inputValue: string;
  setInputValue: (value: string) => void;
  filteredSuggestions: Suggestion[];
  highlightedIndex: number;
  showSuggestions: boolean;
  handleChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleKeyDown: (e: React.KeyboardEvent<HTMLInputElement>) => void;
  handleClick: (suggestion: Suggestion) => void;
  renderSuggestions: () => JSX.Element | null;
  error: string | null;
  loading: boolean;
}

export const useAutocomplete = ({ query, onSelect }: UseAutoCompleteProps): UseAutoCompleteReturn => {
  const [inputValue, setInputValue] = useState(query);
  const [filteredSuggestions, setFilteredSuggestions] = useState<Suggestion[]>([]);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const suggestionsRef = useRef<HTMLUListElement>(null);

  // Function to fetch and filter suggestions asynchronously from an API
  // It's a version where data is fetched each time the user updates their input (as I understand from task description), but it would be much more efficient if our project allowed us to fetch the data once and reuse it as I do in useAutocompleteLoadingOnce.tsx.
  // Additionally, we could optimize performance by fetching the first 10-20 items initially (though this API doesn't currently support it), and then load more as needed when the user requests to see additional results.
  // Depending on the requirements, you may want to consider adding debounce functionality to delay data fetching until the user stops typing, rather than triggering the API request on every keystroke.
  const fetchFilteredSuggestions = useCallback(async (query: string) => {
    setError(null);
    setLoading(true);

    try {
      const response = await fetch(`https://jsonplaceholder.typicode.com/users?q=${query}`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      const filtered = data
        .filter((user: { name: string }) => user.name.toLowerCase().includes(query.toLowerCase()))
        .map((user: { id: number; name: string }) => ({
          id: user.id,
          name: user.name,
        }));
      setFilteredSuggestions(filtered);
      setShowSuggestions(true);
    } catch (error) {
      setError(`Error fetching suggestions - ${error}, please try again later`);
      setFilteredSuggestions([]);
    } finally {
      setLoading(false);
    }
  }, []);

  // Handle input change and fetch filtered suggestions
  const handleChange = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const userInput = e.currentTarget.value;
      if (inputValue !== userInput) {
        setInputValue(userInput);
        if (userInput) {
          await fetchFilteredSuggestions(userInput);
        } else {
          setFilteredSuggestions([]);
          setShowSuggestions(false);
          setError(null);
        }
      }
    },
    [fetchFilteredSuggestions, inputValue]
  );

  // Handle click on a suggestion
  const handleClick = useCallback(
    (suggestion: Suggestion) => {
      setInputValue(suggestion.name);
      setFilteredSuggestions([]);
      setShowSuggestions(false);
      setHighlightedIndex(-1);
      setError(null);
      onSelect(suggestion.name);
    },
    [onSelect]
  );

  // Handle keydown for navigation and selection
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'ArrowDown' && highlightedIndex < filteredSuggestions.length - 1) {
        setHighlightedIndex(highlightedIndex + 1);
      } else if (e.key === 'ArrowUp' && highlightedIndex > 0) {
        setHighlightedIndex(highlightedIndex - 1);
      } else if (e.key === 'Enter') {
        if (highlightedIndex >= 0) {
          handleClick(filteredSuggestions[highlightedIndex]);
        } else if (filteredSuggestions.length > 0) {
          handleClick(filteredSuggestions[0]); // Select first suggestion if none are highlighted
        } else {
          setShowSuggestions(false); // Hide suggestions if no match is found
        }
      }
    },
    [highlightedIndex, filteredSuggestions, handleClick]
  );

  // Close suggestions on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (suggestionsRef.current && !suggestionsRef.current.contains(e.target as Node)) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Render highlighted text
  const getHighlightedText = useCallback((text: string, highlight: string) => {
    const parts = text.split(new RegExp(`(${highlight})`, 'gi'));
    return (
      <>
        {parts.map((part, index) =>
          part.toLowerCase() === highlight.toLowerCase() ? (
            <span key={index} className="highlight">
              {part}
            </span>
          ) : (
            part
          )
        )}
      </>
    );
  }, []);

  // Render suggestions list
  const renderSuggestions = useCallback(() => {
    if (loading) {
      return (
        <ul className="suggestions" ref={suggestionsRef} aria-expanded={showSuggestions}>
          <li className="loading-message">
            <em>Loading...</em>
          </li>
        </ul>
      );
    }
    if (error) {
      return (
        <ul className="suggestions" ref={suggestionsRef} aria-expanded={showSuggestions}>
          <li className="error-message">
            <em>{error}</em>
          </li>
        </ul>
      );
    }

    if (showSuggestions && inputValue) {
      return (
        <ul className="suggestions" ref={suggestionsRef} aria-expanded={showSuggestions}>
          {filteredSuggestions.length > 0 ? (
            filteredSuggestions.map((suggestion, index) => (
              <li
                key={suggestion.id}
                className={index === highlightedIndex ? 'highlighted' : ''}
                onClick={() => handleClick(suggestion)}
                aria-activedescendant={index === highlightedIndex ? 'active' : undefined}
              >
                {getHighlightedText(suggestion.name, inputValue)}
              </li>
            ))
          ) : (
            <li className="no-suggestions">
              <em>No match</em>
            </li>
          )}
        </ul>
      );
    }
    return null;
  }, [inputValue, loading, error, showSuggestions, filteredSuggestions, highlightedIndex, handleClick, getHighlightedText]);

  return {
    inputValue,
    setInputValue,
    filteredSuggestions,
    highlightedIndex,
    showSuggestions,
    handleChange,
    handleKeyDown,
    handleClick,
    renderSuggestions,
    error,
    loading,
  };
};

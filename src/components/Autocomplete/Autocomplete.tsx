import React from 'react';
import { useAutocomplete } from '../../hooks/useAutocomplete';
import { useAutocompleteLoadingOnce } from '../../hooks/useAutocompleteLoadingOnce';

interface AutocompleteProps {
  onSelect: (value: string) => void;
  placeholder?: string;
}

const AutoComplete: React.FC<AutocompleteProps> = ({ onSelect, placeholder = 'Search users...' }) => {
  const { inputValue, handleChange, handleKeyDown, renderSuggestions } = useAutocomplete({ query: '', onSelect });

  const { inputValue: inputValueLO, handleChange: handleChangeLO, handleKeyDown: handleKeyDownLO, renderSuggestions: renderSuggestionsLO } = useAutocompleteLoadingOnce({ query: '', onSelect });

  return (
    <div className='autocomplete-page'>
      <div className='autocomplete-block'>
        <h3>Autocomplete with real API, fetching data on every keystroke</h3>
        <div className="autocomplete">
          <input type="text" placeholder={placeholder} value={inputValue} onChange={handleChange} onKeyDown={handleKeyDown} autoComplete="off" />
          {renderSuggestions()}
        </div>
      </div>
      <div className='autocomplete-block'>
        <h3>Autocomplete with real API, fetching data once on loading</h3>
        <div className="autocomplete">
          <input type="text" placeholder={placeholder} value={inputValueLO} onChange={handleChangeLO} onKeyDown={handleKeyDownLO} autoComplete="off" />
          {renderSuggestionsLO()}
        </div>
      </div>
    </div>
  );
};

export default AutoComplete;

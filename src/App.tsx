import React from 'react';
import AutoComplete from './components/Autocomplete/Autocomplete';
import './components/Autocomplete/Autocomplete.css';
import './index.css'

const App: React.FC = () => {
  const handleSelect = (value: string) => {
    console.log('Selected:', value);
  };

  return (
    <div className="app">
      <h1>Autocomplete examples</h1>
      <AutoComplete onSelect={handleSelect} />
    </div>
  );
};

export default App;

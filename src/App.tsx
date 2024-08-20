import React from 'react';
import AutoComplete from './components/Autocomplete/AutoComplete';
import './components/AutoComplete/AutoComplete.css';
import './index.css';

const App: React.FC = () => {
  const handleSelect = (value: string) => {
    console.log('Selected:', value);
  };

  return (
    <div className="app">
      <h1>AutoComplete examples</h1>
      <AutoComplete onSelect={handleSelect} />
    </div>
  );
};

export default App;

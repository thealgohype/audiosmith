import React, { useState } from 'react';

function SearchComponent() {
  const [query, setQuery] = useState('');

  const handleInputChange = (event) => {
    setQuery(event.target.value);
  };

  const handleSearch = () => {
    console.log('Searching for:', query);
  };

  return (
    <div>
      <input
        type="text"
        value={query}
        onChange={handleInputChange}
        placeholder="Enter your search query"
      />
      <button onClick={handleSearch}>Search</button>
    </div>
  );
}

export default SearchComponent;

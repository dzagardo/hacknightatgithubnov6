// src/components/SearchBar.js
import React, { useState } from 'react';
import Results from './Results';

const SearchBar = () => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]); // Ensure this is correctly initialized
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!query.trim()) {
      setError('Please enter a search term.');
      return;
    }

    console.log('Initiating search for:', query);

    setLoading(true);
    setError(null);

    try {
      const chunks = await window.electronAPI.searchWeaviate(query);
      console.log('Received chunks:', chunks);
      setResults(chunks || []); // Ensure results are set even if chunks is undefined
    } catch (error) {
      console.error('Search error:', error);
      setError('An error occurred while searching.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="search-container">
      <h1>Weaviate Search</h1>
      <form onSubmit={handleSearch}>
        <input
          type="text"
          placeholder="Search for content..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <button type="submit">Search</button>
      </form>
      {loading && <p>Loading results...</p>}
      {error && <p className="error">{error}</p>}
      <Results results={results} />
    </div>
  );
};

export default SearchBar;

import { createContext, useContext, useState } from 'react';

const SearchContext = createContext(null);

export function SearchProvider({ children }) {
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('All');

  return (
    <SearchContext.Provider value={{ search, setSearch, filter, setFilter }}>
      {children}
    </SearchContext.Provider>
  );
}

export function useSearch() {
  const ctx = useContext(SearchContext);
  if (!ctx) throw new Error('useSearch must be used within a SearchProvider');
  return ctx;
}

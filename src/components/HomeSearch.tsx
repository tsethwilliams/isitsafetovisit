'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface SearchCity {
  slug: string;
  name: string;
  country: string;
  region: string;
  overallScore: number;
  badgeClass: string;
}

export default function HomeSearch({ cities }: { cities: SearchCity[] }) {
  const [query, setQuery] = useState('');
  const [focused, setFocused] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const results = query.length >= 2
    ? cities.filter(c =>
        c.name.toLowerCase().includes(query.toLowerCase()) ||
        c.country.toLowerCase().includes(query.toLowerCase())
      ).slice(0, 8)
    : [];

  const showDropdown = focused && query.length >= 2 && results.length > 0;

  useEffect(() => {
    setSelectedIndex(-1);
  }, [query]);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node) &&
          inputRef.current && !inputRef.current.contains(e.target as Node)) {
        setFocused(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex(prev => Math.min(prev + 1, results.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex(prev => Math.max(prev - 1, -1));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (selectedIndex >= 0 && results[selectedIndex]) {
        router.push(`/cities/${results[selectedIndex].slug}`);
        setQuery('');
        setFocused(false);
      } else if (results.length === 1) {
        router.push(`/cities/${results[0].slug}`);
        setQuery('');
        setFocused(false);
      }
    } else if (e.key === 'Escape') {
      setFocused(false);
    }
  }

  function getScoreColor(score: number): string {
    if (score >= 7) return 'var(--safe-green)';
    if (score >= 5) return 'var(--caution-amber)';
    return 'var(--danger-red)';
  }

  return (
    <div className="home-search-wrapper">
      <div className="home-search-container">
        <span className="home-search-icon">{'\uD83D\uDD0D'}</span>
        <input
          ref={inputRef}
          type="text"
          className="home-search-input"
          placeholder="Search any city..."
          value={query}
          onChange={e => setQuery(e.target.value)}
          onFocus={() => setFocused(true)}
          onKeyDown={handleKeyDown}
          autoComplete="off"
        />
        {query && (
          <button className="home-search-clear" onClick={() => { setQuery(''); inputRef.current?.focus(); }}>
            {'\u2715'}
          </button>
        )}
      </div>

      {showDropdown && (
        <div className="home-search-dropdown" ref={dropdownRef}>
          {results.map((city, i) => (
            <a
              key={city.slug}
              href={`/cities/${city.slug}`}
              className={`home-search-result ${i === selectedIndex ? 'home-search-result-active' : ''}`}
              onClick={e => {
                e.preventDefault();
                router.push(`/cities/${city.slug}`);
                setQuery('');
                setFocused(false);
              }}
            >
              <div className="home-search-result-info">
                <span className="home-search-result-name">{city.name}</span>
                <span className="home-search-result-meta">{city.country} &middot; {city.region}</span>
              </div>
              <span className="home-search-result-score" style={{ color: getScoreColor(city.overallScore) }}>
                {city.overallScore.toFixed(1)}
              </span>
            </a>
          ))}
        </div>
      )}

      {focused && query.length >= 2 && results.length === 0 && (
        <div className="home-search-dropdown">
          <div className="home-search-noresults">No cities found for &ldquo;{query}&rdquo;</div>
        </div>
      )}
    </div>
  );
}

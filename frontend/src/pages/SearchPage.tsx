import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search as SearchIcon, Play, Plus, Heart, Music, Disc, Tv, Loader2 } from 'lucide-react';
import { Song } from '../types';
import { usePlayerStore } from '../stores/playerStore';
import { useAuthStore } from '../stores/authStore';
import axios from 'axios';

export const SearchPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const queryParam = searchParams.get('q') || '';

  const [query, setQuery] = useState(queryParam);
  const [results, setResults] = useState<Song[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeFilter, setActiveFilter] = useState<'all' | 'video' | 'channel'>('all');
  const [searchHistory, setSearchHistory] = useState<string[]>(() => {
    const saved = localStorage.getItem('musiq_search_history');
    return saved ? JSON.parse(saved) : ['The Weeknd', 'Lofi Girl', 'A.R. Rahman', 'Pop 2025'];
  });

  const { playSong, addToQueue } = usePlayerStore();
  const { isAuthenticated, token } = useAuthStore();

  useEffect(() => {
    setQuery(queryParam);
    if (queryParam) {
      performSearch(queryParam);
    }
  }, [queryParam]);

  const performSearch = async (searchTerm: string) => {
    if (!searchTerm.trim()) return;
    setLoading(true);
    try {
      const res = await axios.get(`/api/youtube/search?q=${encodeURIComponent(searchTerm)}`);
      setResults(res.data.items || []);

      // Update search history
      setSearchHistory(prev => {
        const filtered = prev.filter(h => h.toLowerCase() !== searchTerm.toLowerCase());
        const updated = [searchTerm, ...filtered].slice(0, 10);
        localStorage.setItem('musiq_search_history', JSON.stringify(updated));
        return updated;
      });
    } catch (err) {
      console.error('Search request failed', err);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setQuery(val);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      setSearchParams({ q: query.trim() });
    }
  };

  const handleHistoryClick = (term: string) => {
    setQuery(term);
    setSearchParams({ q: term });
  };

  const handleClearHistory = () => {
    setSearchHistory([]);
    localStorage.removeItem('musiq_search_history');
  };

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      {/* Search Header */}
      <div className="space-y-4">
        <h1 className="text-3xl font-extrabold text-white tracking-tight">Search Music</h1>
        <form onSubmit={handleSubmit} className="relative max-w-2xl">
          <SearchIcon className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-surface-muted" />
          <input
            type="text"
            placeholder="Search for songs, artists, albums, or genres..."
            value={query}
            onChange={handleInputChange}
            className="w-full bg-surface-card hover:bg-surface-hover/80 focus:bg-surface-card border border-surface-border/80 focus:border-brand-500 rounded-2xl py-3.5 pl-12 pr-28 text-base text-slate-100 placeholder-surface-muted transition-all outline-none shadow-lg"
          />
          <button
            type="submit"
            className="absolute right-2 top-1/2 -translate-y-1/2 bg-brand-600 hover:bg-brand-500 text-white font-medium text-sm px-5 py-2 rounded-xl transition-colors shadow-md"
          >
            Search
          </button>
        </form>

        {/* Filters */}
        <div className="flex items-center gap-2 pt-2">
          {(['all', 'video', 'channel'] as const).map(filter => (
            <button
              key={filter}
              onClick={() => setActiveFilter(filter)}
              className={`px-4 py-1.5 rounded-full text-xs font-semibold capitalize transition-all ${
                activeFilter === filter
                  ? 'bg-white text-black shadow-md'
                  : 'bg-surface-card text-surface-muted hover:text-white hover:bg-surface-hover border border-surface-border'
              }`}
            >
              {filter}
            </button>
          ))}
        </div>
      </div>

      {/* Search History Tags when no query */}
      {!queryParam && searchHistory.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold uppercase tracking-wider text-surface-muted">Recent Searches</h3>
            <button
              onClick={handleClearHistory}
              className="text-xs text-surface-muted hover:text-red-400 transition-colors"
            >
              Clear History
            </button>
          </div>
          <div className="flex flex-wrap gap-2">
            {searchHistory.map(term => (
              <button
                key={term}
                onClick={() => handleHistoryClick(term)}
                className="px-3.5 py-2 rounded-xl bg-surface-card hover:bg-surface-hover border border-surface-border text-sm text-slate-200 transition-colors"
              >
                {term}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Loading Skeleton */}
      {loading && (
        <div className="space-y-3">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-16 bg-surface-card/60 rounded-2xl animate-pulse flex items-center p-3 gap-4">
              <div className="w-12 h-12 bg-surface-border rounded-xl" />
              <div className="flex-1 space-y-2">
                <div className="w-1/3 h-4 bg-surface-border rounded" />
                <div className="w-1/4 h-3 bg-surface-border rounded" />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Search Results List */}
      {!loading && results.length > 0 && (
        <div className="space-y-3">
          <h2 className="text-lg font-bold text-white mb-2">Search Results</h2>
          <div className="grid grid-cols-1 gap-2">
            {results.map(song => (
              <div
                key={song.youtube_video_id}
                className="group flex items-center justify-between p-3 rounded-2xl bg-surface-card/70 hover:bg-surface-card border border-surface-border/40 hover:border-surface-border transition-all duration-200"
              >
                <div className="flex items-center gap-4 min-w-0">
                  <div className="relative group-hover:scale-105 transition-transform flex-shrink-0">
                    <img
                      src={song.thumbnail_url || `https://i.ytimg.com/vi/${song.youtube_video_id}/hqdefault.jpg`}
                      alt={song.title}
                      className="w-14 h-14 rounded-xl object-cover shadow"
                    />
                    <button
                      onClick={() => playSong(song, results)}
                      className="absolute inset-0 bg-black/50 rounded-xl flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <Play className="w-6 h-6 text-white fill-white" />
                    </button>
                  </div>

                  <div className="min-w-0">
                    <h3
                      onClick={() => playSong(song, results)}
                      className="font-semibold text-slate-100 truncate group-hover:text-brand-accent cursor-pointer text-base"
                    >
                      {song.title}
                    </h3>
                    <p className="text-xs text-surface-muted truncate mt-0.5">{song.channel_name}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => addToQueue(song)}
                    className="p-2.5 rounded-xl bg-surface-hover/50 hover:bg-surface-hover text-surface-muted hover:text-white transition-colors"
                    title="Add to Queue"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => playSong(song, results)}
                    className="px-4 py-2 rounded-xl bg-brand-600/20 text-brand-accent hover:bg-brand-600 hover:text-white font-medium text-xs transition-colors flex items-center gap-1.5"
                  >
                    <Play className="w-3.5 h-3.5 fill-current" />
                    Play
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Empty State */}
      {!loading && queryParam && results.length === 0 && (
        <div className="text-center py-16 space-y-3">
          <Disc className="w-12 h-12 text-surface-muted mx-auto animate-spin" />
          <h3 className="text-lg font-semibold text-white">No results found for "{queryParam}"</h3>
          <p className="text-sm text-surface-muted">Try searching with a different song title, artist, or keyword.</p>
        </div>
      )}
    </div>
  );
};

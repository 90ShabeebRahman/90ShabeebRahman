import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Play, Sparkles, TrendingUp, Music2, Disc, Compass, Radio } from 'lucide-react';
import { Song } from '../types';
import { usePlayerStore } from '../stores/playerStore';
import { useAuthStore } from '../stores/authStore';
import axios from 'axios';

const GENRES = [
  { name: 'Pop', query: 'top pop hits', color: 'from-pink-600 to-rose-400' },
  { name: 'Hip-Hop', query: 'hip hop hits', color: 'from-amber-500 to-red-600' },
  { name: 'Rock', query: 'classic rock music', color: 'from-purple-600 to-indigo-600' },
  { name: 'Classical', query: 'classical orchestra piano', color: 'from-blue-600 to-cyan-500' },
  { name: 'Bollywood', query: 'top bollywood songs', color: 'from-orange-500 to-amber-400' },
  { name: 'Malayalam', query: 'malayalam hit songs', color: 'from-emerald-600 to-teal-400' },
  { name: 'Tamil', query: 'tamil hit songs', color: 'from-red-600 to-pink-500' },
  { name: 'Telugu', query: 'telugu hit songs', color: 'from-indigo-600 to-blue-500' },
  { name: 'Hindi', query: 'hindi romantic songs', color: 'from-rose-600 to-orange-400' },
  { name: 'Lo-fi', query: 'lofi hip hop chill beats', color: 'from-violet-600 to-fuchsia-500' },
  { name: 'EDM', query: 'electronic dance music festival', color: 'from-cyan-500 to-blue-600' },
  { name: 'Jazz', query: 'smooth jazz saxophone', color: 'from-amber-600 to-yellow-500' },
];

export const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { playSong } = usePlayerStore();

  const [trending, setTrending] = useState<Song[]>([]);
  const [quickPicks, setQuickPicks] = useState<Song[]>([]);
  const [loading, setLoading] = useState(true);

  // Time-based greeting
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  useEffect(() => {
    const fetchHomeData = async () => {
      setLoading(true);
      try {
        const [trendingRes, quickPicksRes] = await Promise.all([
          axios.get('/api/youtube/trending'),
          axios.get('/api/youtube/search?q=top%20hits%202025%20music'),
        ]);

        setTrending(trendingRes.data.items || []);
        setQuickPicks(quickPicksRes.data.items || []);
      } catch (err) {
        console.error('Failed to load home page sections', err);
      } finally {
        setLoading(false);
      }
    };

    fetchHomeData();
  }, []);

  const handleGenreClick = (genre: typeof GENRES[0]) => {
    navigate(`/search?q=${encodeURIComponent(genre.query)}`);
  };

  return (
    <div className="space-y-10 max-w-7xl mx-auto pb-8">
      {/* Dynamic Header Greeting */}
      <div className="space-y-2">
        <div className="flex items-center gap-2 text-brand-accent text-sm font-semibold tracking-wide uppercase">
          <Sparkles className="w-4 h-4" />
          <span>Welcome Back</span>
        </div>
        <h1 className="text-3xl md:text-4xl font-extrabold text-white tracking-tight">
          {getGreeting()}{user?.name ? `, ${user.name}` : ''}
        </h1>
        <p className="text-surface-muted text-sm md:text-base">What do you want to listen to today?</p>
      </div>

      {/* Quick Picks / Featured Banner */}
      <section className="space-y-4">
        <div className="flex items-center gap-2">
          <Radio className="w-5 h-5 text-brand-500" />
          <h2 className="text-xl font-bold text-white">Quick Picks</h2>
        </div>

        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-40 bg-surface-card rounded-2xl animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {quickPicks.slice(0, 6).map((song) => (
              <div
                key={song.youtube_video_id}
                onClick={() => playSong(song, quickPicks)}
                className="group relative bg-surface-card hover:bg-surface-hover p-3 rounded-2xl border border-surface-border/50 transition-all duration-300 cursor-pointer shadow-lg hover:shadow-brand-500/10 hover:-translate-y-1"
              >
                <div className="relative aspect-square rounded-xl overflow-hidden mb-3">
                  <img
                    src={song.thumbnail_url || `https://i.ytimg.com/vi/${song.youtube_video_id}/hqdefault.jpg`}
                    alt={song.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <div className="w-10 h-10 rounded-full bg-brand-500 text-white flex items-center justify-center shadow-lg transform translate-y-2 group-hover:translate-y-0 transition-all">
                      <Play className="w-5 h-5 fill-current ml-0.5" />
                    </div>
                  </div>
                </div>
                <h3 className="font-semibold text-sm text-slate-100 truncate group-hover:text-brand-accent">
                  {song.title}
                </h3>
                <p className="text-xs text-surface-muted truncate mt-0.5">{song.channel_name}</p>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Trending Now Section */}
      <section className="space-y-4">
        <div className="flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-red-500" />
          <h2 className="text-xl font-bold text-white">Trending Music</h2>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-20 bg-surface-card rounded-2xl animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {trending.slice(0, 9).map((song) => (
              <div
                key={song.youtube_video_id}
                onClick={() => playSong(song, trending)}
                className="group flex items-center gap-4 p-3 rounded-2xl bg-surface-card hover:bg-surface-hover border border-surface-border/50 transition-all cursor-pointer"
              >
                <div className="relative w-16 h-16 rounded-xl overflow-hidden flex-shrink-0">
                  <img
                    src={song.thumbnail_url || `https://i.ytimg.com/vi/${song.youtube_video_id}/hqdefault.jpg`}
                    alt={song.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                  />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <Play className="w-6 h-6 text-white fill-white" />
                  </div>
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="font-semibold text-sm text-white truncate group-hover:text-brand-accent">
                    {song.title}
                  </h3>
                  <p className="text-xs text-surface-muted truncate mt-1">{song.channel_name}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Genres & Moods */}
      <section className="space-y-4">
        <div className="flex items-center gap-2">
          <Compass className="w-5 h-5 text-indigo-400" />
          <h2 className="text-xl font-bold text-white">Browse Genres & Moods</h2>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {GENRES.map((genre) => (
            <div
              key={genre.name}
              onClick={() => handleGenreClick(genre)}
              className={`h-28 rounded-2xl p-4 bg-gradient-to-br ${genre.color} flex flex-col justify-between cursor-pointer shadow-lg hover:scale-[1.03] transition-transform duration-200 relative overflow-hidden group`}
            >
              <span className="font-extrabold text-lg text-white drop-shadow-md z-10">{genre.name}</span>
              <Disc className="w-16 h-16 text-white/20 absolute -bottom-3 -right-3 group-hover:rotate-45 transition-transform duration-300" />
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

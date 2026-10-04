import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Play, Users, Disc, Music, Tv } from 'lucide-react';
import { Song } from '../types';
import { usePlayerStore } from '../stores/playerStore';
import axios from 'axios';

export const ArtistPage: React.FC = () => {
  const { channelId } = useParams<{ channelId: string }>();

  const [artist, setArtist] = useState<any>(null);
  const [songs, setSongs] = useState<Song[]>([]);
  const [loading, setLoading] = useState(true);

  const { playSong } = usePlayerStore();

  useEffect(() => {
    if (!channelId) return;

    setLoading(true);
    Promise.all([
      axios.get(`/api/youtube/channel/${channelId}`),
      axios.get(`/api/youtube/search?q=${encodeURIComponent(channelId)}`),
    ])
      .then(([channelRes, songsRes]) => {
        setArtist(channelRes.data);
        setSongs(songsRes.data.items || []);
      })
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  }, [channelId]);

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="h-64 bg-surface-card rounded-3xl animate-pulse" />
      </div>
    );
  }

  return (
    <div className="space-y-10 max-w-6xl mx-auto">
      {/* Artist Banner */}
      <div className="relative bg-gradient-to-r from-brand-900/80 via-surface-card to-surface-card p-8 rounded-3xl border border-surface-border shadow-2xl overflow-hidden flex flex-col md:flex-row items-center gap-8">
        <img
          src={artist?.thumbnail_url || 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=400&auto=format&fit=crop'}
          alt={artist?.title || 'Artist'}
          className="w-40 h-40 md:w-48 md:h-48 rounded-full object-cover border-4 border-brand-500/30 shadow-2xl flex-shrink-0"
        />
        <div className="space-y-3 text-center md:text-left min-w-0 flex-1">
          <span className="text-xs font-bold uppercase tracking-wider text-brand-accent">Artist / Channel</span>
          <h1 className="text-3xl md:text-5xl font-black text-white tracking-tight">{artist?.title || 'Featured Artist'}</h1>
          {artist?.subscriberCount && (
            <div className="flex items-center justify-center md:justify-start gap-2 text-surface-muted text-sm font-medium">
              <Users className="w-4 h-4" />
              <span>{artist.subscriberCount} Subscribers</span>
            </div>
          )}
          {artist?.description && (
            <p className="text-xs text-surface-muted max-w-2xl line-clamp-2">{artist.description}</p>
          )}
        </div>
      </div>

      {/* Top / Popular Tracks */}
      <section className="space-y-4">
        <h2 className="text-2xl font-bold text-white">Popular Songs</h2>

        <div className="space-y-2">
          {songs.map((song, index) => (
            <div
              key={song.youtube_video_id}
              onClick={() => playSong(song, songs)}
              className="group flex items-center justify-between p-3 rounded-2xl bg-surface-card/60 hover:bg-surface-card border border-surface-border/40 transition-all cursor-pointer"
            >
              <div className="flex items-center gap-4 min-w-0">
                <span className="w-6 text-center text-sm font-mono text-surface-muted">{index + 1}</span>
                <img
                  src={song.thumbnail_url || `https://i.ytimg.com/vi/${song.youtube_video_id}/hqdefault.jpg`}
                  alt={song.title}
                  className="w-12 h-12 rounded-xl object-cover flex-shrink-0"
                />
                <div className="min-w-0">
                  <h4 className="font-semibold text-slate-100 truncate text-sm group-hover:text-brand-accent">
                    {song.title}
                  </h4>
                  <p className="text-xs text-surface-muted truncate mt-0.5">{song.channel_name}</p>
                </div>
              </div>

              <button
                onClick={() => playSong(song, songs)}
                className="p-2.5 rounded-xl bg-brand-600/20 text-brand-accent hover:bg-brand-600 hover:text-white transition-colors"
              >
                <Play className="w-4 h-4 fill-current" />
              </button>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

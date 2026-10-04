import React, { useState, useEffect } from 'react';
import { Play, Shuffle, Heart, Music, Trash2 } from 'lucide-react';
import { Song } from '../types';
import { useAuthStore } from '../stores/authStore';
import { usePlayerStore } from '../stores/playerStore';
import axios from 'axios';

export const LikedSongsPage: React.FC = () => {
  const [songs, setSongs] = useState<Song[]>([]);
  const [loading, setLoading] = useState(true);

  const { token, isAuthenticated } = useAuthStore();
  const { playSong, toggleShuffle } = usePlayerStore();

  useEffect(() => {
    if (!isAuthenticated || !token) return;

    axios.get('/api/media/likes', {
      headers: { Authorization: `Bearer ${token}` }
    }).then(res => {
      setSongs(res.data.songs || []);
    }).catch(err => {
      console.error('Failed to fetch liked songs', err);
    }).finally(() => {
      setLoading(false);
    });
  }, [isAuthenticated, token]);

  const handleUnlike = async (song: Song, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!token) return;

    try {
      await axios.post('/api/media/likes/toggle', {
        youtube_video_id: song.youtube_video_id,
        title: song.title,
        channel_name: song.channel_name,
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setSongs(songs.filter(s => s.youtube_video_id !== song.youtube_video_id));
    } catch (err) {
      console.error('Failed to unlike song', err);
    }
  };

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      {/* Banner */}
      <div className="flex flex-col sm:flex-row items-start sm:items-end gap-6 bg-gradient-to-r from-indigo-900/80 via-purple-900/50 to-surface-card p-8 rounded-3xl border border-indigo-500/20 shadow-2xl">
        <div className="w-32 h-32 md:w-40 md:h-40 rounded-2xl bg-gradient-to-tr from-indigo-600 to-rose-500 flex items-center justify-center shadow-2xl flex-shrink-0">
          <Heart className="w-16 h-16 text-white fill-white" />
        </div>
        <div className="space-y-2">
          <span className="text-xs font-bold uppercase tracking-wider text-indigo-300">Playlist</span>
          <h1 className="text-4xl md:text-5xl font-black text-white tracking-tight">Liked Songs</h1>
          <p className="text-sm text-surface-muted">{songs.length} saved tracks</p>
        </div>
      </div>

      {/* Action Buttons */}
      {songs.length > 0 && (
        <div className="flex items-center gap-4">
          <button
            onClick={() => playSong(songs[0], songs)}
            className="flex items-center gap-2 bg-brand-600 hover:bg-brand-500 text-white font-semibold px-6 py-3 rounded-full shadow-lg transition-transform active:scale-95"
          >
            <Play className="w-5 h-5 fill-current" />
            <span>Play All</span>
          </button>
          <button
            onClick={() => {
              playSong(songs[0], songs);
              toggleShuffle();
            }}
            className="flex items-center gap-2 bg-surface-card hover:bg-surface-hover text-white font-medium px-5 py-3 rounded-full border border-surface-border transition-colors"
          >
            <Shuffle className="w-4 h-4" />
            <span>Shuffle</span>
          </button>
        </div>
      )}

      {/* Song List */}
      <div className="space-y-2">
        {loading ? (
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-16 bg-surface-card rounded-2xl animate-pulse" />
            ))}
          </div>
        ) : songs.length === 0 ? (
          <div className="text-center py-16 text-surface-muted space-y-2">
            <Music className="w-12 h-12 mx-auto text-surface-border" />
            <p className="text-lg font-medium text-white">You haven't liked any songs yet.</p>
            <p className="text-sm">Search and click the heart icon on any song to save it here.</p>
          </div>
        ) : (
          songs.map((song, index) => (
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
                onClick={(e) => handleUnlike(song, e)}
                className="p-2 rounded-xl text-red-500 hover:bg-surface-hover transition-colors"
                title="Remove from Liked Songs"
              >
                <Heart className="w-4 h-4 fill-current" />
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

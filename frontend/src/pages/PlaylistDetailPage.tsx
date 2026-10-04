import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Play, Shuffle, Share2, Trash2, Music, Check } from 'lucide-react';
import { Song, Playlist } from '../types';
import { useAuthStore } from '../stores/authStore';
import { usePlayerStore } from '../stores/playerStore';
import axios from 'axios';

export const PlaylistDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [playlist, setPlaylist] = useState<Playlist | null>(null);
  const [songs, setSongs] = useState<Song[]>([]);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  const { user, token } = useAuthStore();
  const { playSong, toggleShuffle } = usePlayerStore();

  useEffect(() => {
    if (!id) return;

    axios.get(`/api/media/playlists/${id}`)
      .then(res => {
        setPlaylist(res.data.playlist);
        setSongs((res.data.songs || []).map((s: any) => ({
          id: s.id,
          youtube_video_id: s.youtube_video_id,
          title: s.title,
          channel_name: s.channel_name,
          thumbnail_url: s.thumbnail_url,
          duration: s.duration,
        })));
      })
      .catch(err => {
        console.error('Failed to load playlist detail', err);
      })
      .finally(() => setLoading(false));
  }, [id]);

  const handleRemoveSong = async (songId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!token || !id) return;

    try {
      await axios.delete(`/api/media/playlists/${id}/songs/${songId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setSongs(songs.filter(s => s.id !== songId));
    } catch (err) {
      console.error('Failed to remove song from playlist', err);
    }
  };

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="h-48 bg-surface-card rounded-3xl animate-pulse" />
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-16 bg-surface-card rounded-2xl animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  if (!playlist) {
    return (
      <div className="text-center py-20 space-y-4">
        <Music className="w-16 h-16 text-surface-muted mx-auto" />
        <h2 className="text-2xl font-bold text-white">Playlist Not Found</h2>
        <button
          onClick={() => navigate('/library')}
          className="px-5 py-2.5 rounded-full bg-brand-600 text-white font-medium text-sm"
        >
          Back to Library
        </button>
      </div>
    );
  }

  const isOwner = user?.id === playlist.user_id;

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      {/* Banner */}
      <div className="flex flex-col sm:flex-row items-start sm:items-end gap-6 bg-surface-card p-8 rounded-3xl border border-surface-border shadow-2xl">
        <div className="w-32 h-32 md:w-40 md:h-40 rounded-2xl bg-gradient-to-br from-brand-600 to-indigo-900 flex items-center justify-center shadow-2xl flex-shrink-0">
          <Music className="w-16 h-16 text-brand-accent/80" />
        </div>
        <div className="space-y-2 flex-1">
          <span className="text-xs font-bold uppercase tracking-wider text-brand-accent">Playlist</span>
          <h1 className="text-3xl md:text-5xl font-black text-white tracking-tight">{playlist.name}</h1>
          {playlist.description && <p className="text-sm text-surface-muted">{playlist.description}</p>}
          <p className="text-xs text-surface-muted">{songs.length} songs</p>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center gap-4">
        {songs.length > 0 && (
          <>
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
          </>
        )}

        <button
          onClick={handleShare}
          className="flex items-center gap-2 bg-surface-card hover:bg-surface-hover text-surface-muted hover:text-white font-medium px-4 py-3 rounded-full border border-surface-border transition-colors"
          title="Share Playlist"
        >
          {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Share2 className="w-4 h-4" />}
          <span>{copied ? 'Link Copied!' : 'Share'}</span>
        </button>
      </div>

      {/* Song List */}
      <div className="space-y-2">
        {songs.length === 0 ? (
          <div className="text-center py-16 text-surface-muted space-y-2">
            <Music className="w-12 h-12 mx-auto text-surface-border" />
            <p className="text-lg font-medium text-white">This playlist is empty.</p>
            <p className="text-sm">Search for music and add songs to this playlist!</p>
          </div>
        ) : (
          songs.map((song, index) => (
            <div
              key={song.id || song.youtube_video_id}
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

              {isOwner && (
                <button
                  onClick={(e) => handleRemoveSong(song.id, e)}
                  className="p-2 rounded-xl text-surface-muted hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity"
                  title="Remove from Playlist"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

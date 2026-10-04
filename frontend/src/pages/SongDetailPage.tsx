import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Play, Heart, Plus, Share2, Check, Music2, Sparkles } from 'lucide-react';
import { Song, Playlist } from '../types';
import { usePlayerStore } from '../stores/playerStore';
import { useAuthStore } from '../stores/authStore';
import axios from 'axios';

export const SongDetailPage: React.FC = () => {
  const { videoId } = useParams<{ videoId: string }>();
  const navigate = useNavigate();

  const [song, setSong] = useState<Song | null>(null);
  const [relatedSongs, setRelatedSongs] = useState<Song[]>([]);
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [loading, setLoading] = useState(true);
  const [isLiked, setIsLiked] = useState(false);
  const [copied, setCopied] = useState(false);
  const [showPlaylistDropdown, setShowPlaylistDropdown] = useState(false);

  const { playSong, addToQueue } = usePlayerStore();
  const { isAuthenticated, token } = useAuthStore();

  useEffect(() => {
    if (!videoId) return;

    setLoading(true);
    axios.get(`/api/youtube/video/${videoId}`)
      .then(res => {
        setSong(res.data);
      })
      .catch(err => console.error(err))
      .finally(() => setLoading(false));

    axios.get(`/api/youtube/related/${videoId}`)
      .then(res => {
        setRelatedSongs(res.data.items || []);
      })
      .catch(() => {});

    if (isAuthenticated && token) {
      axios.get('/api/media/likes', { headers: { Authorization: `Bearer ${token}` } })
        .then(res => {
          const liked = (res.data.songs || []).some((s: any) => s.youtube_video_id === videoId);
          setIsLiked(liked);
        })
        .catch(() => {});

      axios.get('/api/media/playlists', { headers: { Authorization: `Bearer ${token}` } })
        .then(res => setPlaylists(res.data.playlists || []))
        .catch(() => {});
    }
  }, [videoId, isAuthenticated, token]);

  const handleToggleLike = async () => {
    if (!song || !isAuthenticated || !token) return;
    try {
      const res = await axios.post('/api/media/likes/toggle', {
        youtube_video_id: song.youtube_video_id,
        title: song.title,
        channel_name: song.channel_name,
        thumbnail_url: song.thumbnail_url,
        duration: song.duration,
      }, { headers: { Authorization: `Bearer ${token}` } });
      setIsLiked(res.data.liked);
    } catch (err) {
      console.error(err);
    }
  };

  const handleAddToPlaylist = async (playlistId: string) => {
    if (!song || !token) return;
    try {
      await axios.post(`/api/media/playlists/${playlistId}/songs`, {
        youtube_video_id: song.youtube_video_id,
        title: song.title,
        channel_name: song.channel_name,
        thumbnail_url: song.thumbnail_url,
        duration: song.duration,
      }, { headers: { Authorization: `Bearer ${token}` } });
      setShowPlaylistDropdown(false);
      alert('Song added to playlist!');
    } catch (err) {
      console.error(err);
    }
  };

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto space-y-6">
        <div className="h-64 bg-surface-card rounded-3xl animate-pulse" />
      </div>
    );
  }

  if (!song) {
    return (
      <div className="text-center py-20 space-y-4">
        <Music2 className="w-16 h-16 text-surface-muted mx-auto" />
        <h2 className="text-2xl font-bold text-white">Song Not Found</h2>
      </div>
    );
  }

  return (
    <div className="space-y-10 max-w-5xl mx-auto">
      {/* Song Header */}
      <div className="flex flex-col md:flex-row items-center md:items-end gap-8 bg-surface-card p-8 rounded-3xl border border-surface-border shadow-2xl">
        <img
          src={song.thumbnail_url || `https://i.ytimg.com/vi/${song.youtube_video_id}/hqdefault.jpg`}
          alt={song.title}
          className="w-56 h-56 rounded-2xl object-cover shadow-2xl flex-shrink-0"
        />
        <div className="space-y-4 text-center md:text-left flex-1 min-w-0">
          <span className="text-xs font-bold uppercase tracking-wider text-brand-accent">Song</span>
          <h1 className="text-3xl md:text-4xl font-extrabold text-white tracking-tight leading-tight">
            {song.title}
          </h1>
          <p className="text-lg text-surface-muted font-medium">{song.channel_name}</p>

          {/* Action Row */}
          <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 pt-2">
            <button
              onClick={() => playSong(song)}
              className="flex items-center gap-2 bg-brand-600 hover:bg-brand-500 text-white font-semibold px-6 py-3 rounded-full shadow-lg transition-transform active:scale-95"
            >
              <Play className="w-5 h-5 fill-current" />
              <span>Play Now</span>
            </button>

            {isAuthenticated && (
              <>
                <button
                  onClick={handleToggleLike}
                  className={`p-3 rounded-full border transition-colors ${
                    isLiked
                      ? 'bg-red-500/20 text-red-500 border-red-500/50'
                      : 'bg-surface-base text-surface-muted hover:text-white border-surface-border'
                  }`}
                  title={isLiked ? 'Unlike' : 'Like'}
                >
                  <Heart className={`w-5 h-5 ${isLiked ? 'fill-current' : ''}`} />
                </button>

                <div className="relative">
                  <button
                    onClick={() => setShowPlaylistDropdown(!showPlaylistDropdown)}
                    className="p-3 rounded-full bg-surface-base text-surface-muted hover:text-white border border-surface-border transition-colors"
                    title="Add to Playlist"
                  >
                    <Plus className="w-5 h-5" />
                  </button>

                  {showPlaylistDropdown && (
                    <div className="absolute left-0 mt-2 w-48 bg-surface-card border border-surface-border rounded-2xl shadow-2xl py-2 z-50">
                      <p className="px-4 py-1.5 text-xs font-semibold text-surface-muted uppercase">Add to Playlist</p>
                      {playlists.length === 0 ? (
                        <p className="px-4 py-2 text-xs text-surface-muted">No playlists found</p>
                      ) : (
                        playlists.map(pl => (
                          <button
                            key={pl.id}
                            onClick={() => handleAddToPlaylist(pl.id)}
                            className="w-full text-left px-4 py-2 text-sm text-slate-200 hover:text-white hover:bg-surface-hover truncate transition-colors"
                          >
                            {pl.name}
                          </button>
                        ))
                      )}
                    </div>
                  )}
                </div>
              </>
            )}

            <button
              onClick={handleShare}
              className="p-3 rounded-full bg-surface-base text-surface-muted hover:text-white border border-surface-border transition-colors"
              title="Share Track"
            >
              {copied ? <Check className="w-5 h-5 text-emerald-400" /> : <Share2 className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Related Songs */}
      {relatedSongs.length > 0 && (
        <section className="space-y-4">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-brand-accent" />
            <h2 className="text-2xl font-bold text-white">Recommended / Related Songs</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {relatedSongs.map(related => (
              <div
                key={related.youtube_video_id}
                onClick={() => playSong(related, relatedSongs)}
                className="group flex items-center gap-4 p-3 rounded-2xl bg-surface-card hover:bg-surface-hover border border-surface-border/50 transition-all cursor-pointer"
              >
                <img
                  src={related.thumbnail_url || `https://i.ytimg.com/vi/${related.youtube_video_id}/hqdefault.jpg`}
                  alt={related.title}
                  className="w-14 h-14 rounded-xl object-cover flex-shrink-0"
                />
                <div className="min-w-0 flex-1">
                  <h4 className="font-semibold text-sm text-white truncate group-hover:text-brand-accent">
                    {related.title}
                  </h4>
                  <p className="text-xs text-surface-muted truncate mt-1">{related.channel_name}</p>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
};

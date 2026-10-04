import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Heart, Plus, Music, Play, Trash2, Library, Disc, FolderPlus } from 'lucide-react';
import { Playlist, Song } from '../types';
import { useAuthStore } from '../stores/authStore';
import { usePlayerStore } from '../stores/playerStore';
import axios from 'axios';

export const LibraryPage: React.FC = () => {
  const navigate = useNavigate();
  const { isAuthenticated, token } = useAuthStore();
  const { playSong } = usePlayerStore();

  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [likedSongs, setLikedSongs] = useState<Song[]>([]);
  const [historySongs, setHistorySongs] = useState<Song[]>([]);
  const [loading, setLoading] = useState(true);

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newPlaylistName, setNewPlaylistName] = useState('');
  const [newPlaylistDesc, setNewPlaylistDesc] = useState('');

  useEffect(() => {
    if (!isAuthenticated || !token) return;

    const fetchLibraryData = async () => {
      setLoading(true);
      try {
        const [plRes, likesRes, histRes] = await Promise.all([
          axios.get('/api/media/playlists', { headers: { Authorization: `Bearer ${token}` } }),
          axios.get('/api/media/likes', { headers: { Authorization: `Bearer ${token}` } }),
          axios.get('/api/media/history', { headers: { Authorization: `Bearer ${token}` } }),
        ]);

        setPlaylists(plRes.data.playlists || []);
        setLikedSongs(likesRes.data.songs || []);
        setHistorySongs((histRes.data.history || []).map((h: any) => ({
          id: h.id,
          youtube_video_id: h.youtube_video_id,
          title: h.title,
          channel_name: h.channel_name,
          thumbnail_url: h.thumbnail_url,
          duration: h.duration,
        })));
      } catch (err) {
        console.error('Failed to load library data', err);
      } finally {
        setLoading(false);
      }
    };

    fetchLibraryData();
  }, [isAuthenticated, token]);

  const handleCreatePlaylist = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPlaylistName.trim() || !token) return;

    try {
      const res = await axios.post(
        '/api/media/playlists',
        { name: newPlaylistName.trim(), description: newPlaylistDesc.trim() },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setPlaylists([res.data.playlist, ...playlists]);
      setShowCreateModal(false);
      setNewPlaylistName('');
      setNewPlaylistDesc('');
    } catch (err) {
      console.error('Failed to create playlist', err);
    }
  };

  const handleDeletePlaylist = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!token || !window.confirm('Are you sure you want to delete this playlist?')) return;

    try {
      await axios.delete(`/api/media/playlists/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setPlaylists(playlists.filter(p => p.id !== id));
    } catch (err) {
      console.error('Failed to delete playlist', err);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="text-center py-20 space-y-4 max-w-md mx-auto">
        <Library className="w-16 h-16 text-brand-accent mx-auto" />
        <h2 className="text-2xl font-bold text-white">Enjoy Your Personal Library</h2>
        <p className="text-surface-muted text-sm">
          Log in or sign up to create playlists, save liked songs, and keep track of your listening history.
        </p>
        <button
          onClick={() => navigate('/login')}
          className="px-6 py-3 rounded-full bg-brand-600 hover:bg-brand-500 text-white font-semibold transition-all shadow-lg"
        >
          Sign In
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-10 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">Your Music Library</h1>
          <p className="text-surface-muted text-sm mt-1">Playlists, saved tracks, and recently played songs</p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center gap-2 bg-brand-600 hover:bg-brand-500 text-white px-4 py-2.5 rounded-full font-semibold text-sm transition-all shadow-lg shadow-brand-600/20"
        >
          <Plus className="w-4 h-4" />
          <span>New Playlist</span>
        </button>
      </div>

      {/* Featured Library Shortcuts */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Liked Songs Card */}
        <div
          onClick={() => navigate('/liked')}
          className="group relative bg-gradient-to-br from-indigo-900/60 to-purple-900/40 p-6 rounded-3xl border border-indigo-500/30 hover:border-indigo-500/60 transition-all cursor-pointer shadow-xl overflow-hidden"
        >
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-indigo-600 to-rose-500 flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform">
              <Heart className="w-8 h-8 text-white fill-white" />
            </div>
            <div>
              <h3 className="font-bold text-xl text-white">Liked Songs</h3>
              <p className="text-sm text-indigo-200/80 mt-1">{likedSongs.length} songs</p>
            </div>
          </div>
        </div>

        {/* Recently Played Card */}
        <div
          onClick={() => navigate('/history')}
          className="group relative bg-gradient-to-br from-slate-900/80 to-surface-card p-6 rounded-3xl border border-surface-border hover:border-surface-muted transition-all cursor-pointer shadow-xl overflow-hidden"
        >
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-brand-600 to-teal-500 flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform">
              <Disc className="w-8 h-8 text-white" />
            </div>
            <div>
              <h3 className="font-bold text-xl text-white">Recently Played</h3>
              <p className="text-sm text-surface-muted mt-1">{historySongs.length} tracks</p>
            </div>
          </div>
        </div>
      </div>

      {/* Playlists Grid */}
      <section className="space-y-4">
        <h2 className="text-2xl font-bold text-white">Playlists</h2>

        {playlists.length === 0 ? (
          <div className="bg-surface-card/60 border border-dashed border-surface-border p-12 rounded-3xl text-center space-y-4 max-w-md mx-auto">
            <FolderPlus className="w-12 h-12 text-surface-muted mx-auto" />
            <h3 className="text-lg font-semibold text-white">No playlists yet</h3>
            <p className="text-sm text-surface-muted">Create your first playlist and start building your collection.</p>
            <button
              onClick={() => setShowCreateModal(true)}
              className="px-5 py-2.5 rounded-full bg-brand-600 text-white font-medium text-sm hover:bg-brand-500 transition-colors"
            >
              Create Playlist
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-5">
            {playlists.map((playlist) => (
              <div
                key={playlist.id}
                onClick={() => navigate(`/playlist/${playlist.id}`)}
                className="group relative bg-surface-card hover:bg-surface-hover p-4 rounded-2xl border border-surface-border/60 transition-all cursor-pointer shadow-lg hover:-translate-y-1"
              >
                <div className="aspect-square bg-gradient-to-br from-brand-700/40 to-surface-hover rounded-xl mb-3 flex items-center justify-center relative overflow-hidden">
                  <Music className="w-12 h-12 text-brand-accent/60" />
                  <button
                    onClick={(e) => handleDeletePlaylist(playlist.id, e)}
                    className="absolute top-2 right-2 p-2 rounded-xl bg-black/60 hover:bg-red-600 text-white opacity-0 group-hover:opacity-100 transition-opacity"
                    title="Delete Playlist"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
                <h3 className="font-semibold text-white truncate text-base group-hover:text-brand-accent">
                  {playlist.name}
                </h3>
                <p className="text-xs text-surface-muted truncate mt-1">
                  {playlist.song_count || 0} songs
                </p>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Modal Create Playlist */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-surface-card border border-surface-border rounded-3xl p-6 w-full max-w-md space-y-6 shadow-2xl animate-in zoom-in-95 duration-200">
            <h3 className="text-xl font-bold text-white">Create New Playlist</h3>
            <form onSubmit={handleCreatePlaylist} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-surface-muted uppercase mb-1">Playlist Name</label>
                <input
                  type="text"
                  placeholder="My Favorite Hits"
                  value={newPlaylistName}
                  onChange={(e) => setNewPlaylistName(e.target.value)}
                  className="w-full bg-surface-base border border-surface-border rounded-xl px-4 py-2.5 text-sm text-white focus:border-brand-500 outline-none"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-surface-muted uppercase mb-1">Description (Optional)</label>
                <textarea
                  placeholder="Songs for late night study sessions..."
                  value={newPlaylistDesc}
                  onChange={(e) => setNewPlaylistDesc(e.target.value)}
                  className="w-full bg-surface-base border border-surface-border rounded-xl px-4 py-2.5 text-sm text-white focus:border-brand-500 outline-none h-24 resize-none"
                />
              </div>
              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 rounded-xl text-sm font-medium text-surface-muted hover:text-white transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl text-sm font-semibold text-white bg-brand-600 hover:bg-brand-500 transition-colors shadow-lg"
                >
                  Create
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

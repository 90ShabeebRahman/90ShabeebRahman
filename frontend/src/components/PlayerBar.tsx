import React, { useState, useEffect } from 'react';
import {
  Play, Pause, SkipBack, SkipForward, Volume2, VolumeX, Shuffle, Repeat, Repeat1,
  ListMusic, Heart, Maximize2, Minimize2, Tv
} from 'lucide-react';
import { usePlayerStore } from '../stores/playerStore';
import { useAuthStore } from '../stores/authStore';
import { YouTubeIFrame } from './YouTubeIFrame';
import { QueueDrawer } from './QueueDrawer';
import axios from 'axios';

export const PlayerBar: React.FC = () => {
  const {
    currentSong,
    isPlaying,
    progress,
    duration,
    volume,
    isMuted,
    repeatMode,
    isShuffle,
    togglePlay,
    nextSong,
    prevSong,
    setVolume,
    toggleMute,
    setProgress,
    toggleRepeatMode,
    toggleShuffle,
  } = usePlayerStore();

  const { isAuthenticated, token } = useAuthStore();

  const [isLiked, setIsLiked] = useState(false);
  const [isQueueOpen, setIsQueueOpen] = useState(false);
  const [showVideoModal, setShowVideoModal] = useState(false);

  // Check if song is liked
  useEffect(() => {
    if (!currentSong || !isAuthenticated || !token) {
      setIsLiked(false);
      return;
    }

    axios.get('/api/media/likes', {
      headers: { Authorization: `Bearer ${token}` }
    }).then(res => {
      const likedSongs = res.data.songs || [];
      const liked = likedSongs.some((s: any) => s.youtube_video_id === currentSong.youtube_video_id);
      setIsLiked(liked);
    }).catch(() => {});
  }, [currentSong?.youtube_video_id, isAuthenticated, token]);

  // Record listening history on song play
  useEffect(() => {
    if (currentSong && isAuthenticated && token) {
      axios.post('/api/media/history', {
        youtube_video_id: currentSong.youtube_video_id,
        title: currentSong.title,
        channel_name: currentSong.channel_name,
        thumbnail_url: currentSong.thumbnail_url,
        duration: currentSong.duration,
      }, {
        headers: { Authorization: `Bearer ${token}` }
      }).catch(() => {});
    }
  }, [currentSong?.youtube_video_id, isAuthenticated, token]);

  const handleToggleLike = async () => {
    if (!currentSong || !isAuthenticated || !token) return;
    try {
      const res = await axios.post('/api/media/likes/toggle', {
        youtube_video_id: currentSong.youtube_video_id,
        title: currentSong.title,
        channel_name: currentSong.channel_name,
        thumbnail_url: currentSong.thumbnail_url,
        duration: currentSong.duration,
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setIsLiked(res.data.liked);
    } catch (err) {
      console.error('Failed to toggle like', err);
    }
  };

  const formatTime = (seconds: number) => {
    if (!seconds || isNaN(seconds)) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  if (!currentSong) return null;

  return (
    <>
      {/* Off-screen YouTube Player container */}
      <div className={`fixed bottom-20 right-4 z-40 transition-all duration-300 ${
        showVideoModal ? 'w-80 h-48 md:w-96 md:h-56 shadow-2xl rounded-xl border border-surface-border p-1 bg-black' : 'w-1 h-1 opacity-0 pointer-events-none'
      }`}>
        {showVideoModal && (
          <div className="flex items-center justify-between p-1 text-xs text-surface-muted bg-surface-card rounded-t-lg">
            <span>YouTube Player</span>
            <button onClick={() => setShowVideoModal(false)} className="hover:text-white p-1">
              <Minimize2 className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
        <YouTubeIFrame />
      </div>

      {/* Main Persistent Bottom Player Bar */}
      <div className="fixed bottom-0 left-0 right-0 h-20 bg-surface-card/95 backdrop-blur-xl border-t border-surface-border/80 z-40 px-4 md:px-6 flex items-center justify-between gap-4 select-none">
        {/* Track Info */}
        <div className="flex items-center gap-3.5 min-w-0 w-1/4">
          <img
            src={currentSong.thumbnail_url || `https://i.ytimg.com/vi/${currentSong.youtube_video_id}/hqdefault.jpg`}
            alt={currentSong.title}
            className="w-12 h-12 rounded-xl object-cover shadow-md flex-shrink-0"
          />
          <div className="min-w-0">
            <h4 className="font-semibold text-sm text-slate-100 truncate hover:underline cursor-pointer">
              {currentSong.title}
            </h4>
            <p className="text-xs text-surface-muted truncate hover:text-slate-300 cursor-pointer">
              {currentSong.channel_name}
            </p>
          </div>

          {isAuthenticated && (
            <button
              onClick={handleToggleLike}
              className={`p-1.5 rounded-full hover:bg-surface-hover transition-colors ${
                isLiked ? 'text-red-500 fill-red-500' : 'text-surface-muted hover:text-white'
              }`}
              title={isLiked ? 'Unlike' : 'Like'}
            >
              <Heart className={`w-4 h-4 ${isLiked ? 'fill-current' : ''}`} />
            </button>
          )}
        </div>

        {/* Player Controls & Seekbar */}
        <div className="flex flex-col items-center gap-1.5 flex-1 max-w-2xl">
          {/* Action Buttons */}
          <div className="flex items-center gap-4">
            <button
              onClick={toggleShuffle}
              className={`p-1.5 rounded-full hover:bg-surface-hover transition-colors ${
                isShuffle ? 'text-brand-accent' : 'text-surface-muted hover:text-white'
              }`}
              title="Shuffle"
            >
              <Shuffle className="w-4 h-4" />
            </button>

            <button
              onClick={prevSong}
              className="text-surface-muted hover:text-white transition-colors p-1"
              title="Previous"
            >
              <SkipBack className="w-5 h-5" />
            </button>

            <button
              onClick={togglePlay}
              className="w-10 h-10 rounded-full bg-white hover:bg-slate-200 text-black flex items-center justify-center transition-transform active:scale-95 shadow-lg shadow-white/10"
              title={isPlaying ? 'Pause' : 'Play'}
            >
              {isPlaying ? <Pause className="w-5 h-5 fill-black" /> : <Play className="w-5 h-5 fill-black ml-0.5" />}
            </button>

            <button
              onClick={nextSong}
              className="text-surface-muted hover:text-white transition-colors p-1"
              title="Next"
            >
              <SkipForward className="w-5 h-5" />
            </button>

            <button
              onClick={toggleRepeatMode}
              className={`p-1.5 rounded-full hover:bg-surface-hover transition-colors ${
                repeatMode !== 'off' ? 'text-brand-accent' : 'text-surface-muted hover:text-white'
              }`}
              title={`Repeat: ${repeatMode}`}
            >
              {repeatMode === 'one' ? <Repeat1 className="w-4 h-4" /> : <Repeat className="w-4 h-4" />}
            </button>
          </div>

          {/* Time Progress Bar */}
          <div className="w-full flex items-center gap-3 text-xs text-surface-muted">
            <span className="w-10 text-right font-mono text-[11px]">{formatTime(progress)}</span>
            <input
              type="range"
              min={0}
              max={duration || 100}
              value={progress}
              onChange={(e) => setProgress(Number(e.target.value))}
              className="w-full h-1 bg-surface-border rounded-lg appearance-none cursor-pointer accent-brand-500 hover:accent-brand-400"
            />
            <span className="w-10 font-mono text-[11px]">{formatTime(duration)}</span>
          </div>
        </div>

        {/* Right Tools (Volume, Queue, Video Expand) */}
        <div className="flex items-center gap-3 w-1/4 justify-end">
          <button
            onClick={() => setShowVideoModal(!showVideoModal)}
            className={`p-2 rounded-xl hover:bg-surface-hover transition-colors ${
              showVideoModal ? 'text-brand-accent bg-surface-hover' : 'text-surface-muted hover:text-white'
            }`}
            title="Toggle YouTube Video View"
          >
            <Tv className="w-4 h-4" />
          </button>

          <button
            onClick={() => setIsQueueOpen(!isQueueOpen)}
            className={`p-2 rounded-xl hover:bg-surface-hover transition-colors ${
              isQueueOpen ? 'text-brand-accent bg-surface-hover' : 'text-surface-muted hover:text-white'
            }`}
            title="Queue"
          >
            <ListMusic className="w-4 h-4" />
          </button>

          <div className="hidden sm:flex items-center gap-2">
            <button
              onClick={toggleMute}
              className="text-surface-muted hover:text-white transition-colors p-1"
            >
              {isMuted || volume === 0 ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
            </button>
            <input
              type="range"
              min={0}
              max={100}
              value={isMuted ? 0 : volume}
              onChange={(e) => setVolume(Number(e.target.value))}
              className="w-20 h-1 bg-surface-border rounded-lg appearance-none cursor-pointer accent-brand-500 hover:accent-brand-400"
            />
          </div>
        </div>
      </div>

      {/* Queue Drawer */}
      <QueueDrawer isOpen={isQueueOpen} onClose={() => setIsQueueOpen(false)} />
    </>
  );
};

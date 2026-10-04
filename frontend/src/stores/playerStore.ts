import { create } from 'zustand';
import { Song, RepeatMode } from '../types';

interface PlayerState {
  currentSong: Song | null;
  isPlaying: boolean;
  queue: Song[];
  currentIndex: number;
  volume: number; // 0 to 100
  isMuted: boolean;
  progress: number; // in seconds
  duration: number; // in seconds
  repeatMode: RepeatMode;
  isShuffle: boolean;
  unshuffledQueue: Song[];

  // Actions
  playSong: (song: Song, newQueue?: Song[]) => void;
  togglePlay: () => void;
  pause: () => void;
  resume: () => void;
  nextSong: () => void;
  prevSong: () => void;
  addToQueue: (song: Song) => void;
  playNextInQueue: (song: Song) => void;
  removeFromQueue: (index: number) => void;
  clearQueue: () => void;
  setQueue: (songs: Song[]) => void;
  reorderQueue: (startIndex: number, endIndex: number) => void;
  setVolume: (volume: number) => void;
  toggleMute: () => void;
  setProgress: (progress: number) => void;
  setDuration: (duration: number) => void;
  toggleRepeatMode: () => void;
  toggleShuffle: () => void;
}

export const usePlayerStore = create<PlayerState>((set, get) => ({
  currentSong: null,
  isPlaying: false,
  queue: [],
  currentIndex: -1,
  volume: 80,
  isMuted: false,
  progress: 0,
  duration: 0,
  repeatMode: 'off',
  isShuffle: false,
  unshuffledQueue: [],

  playSong: (song: Song, newQueue?: Song[]) => {
    let queue = newQueue || get().queue;
    if (queue.length === 0 || !queue.some(s => s.youtube_video_id === song.youtube_video_id)) {
      queue = [song, ...queue];
    }
    const index = queue.findIndex(s => s.youtube_video_id === song.youtube_video_id);

    set({
      currentSong: song,
      isPlaying: true,
      queue,
      unshuffledQueue: queue,
      currentIndex: index !== -1 ? index : 0,
      progress: 0,
    });
  },

  togglePlay: () => {
    const { isPlaying, currentSong } = get();
    if (!currentSong) return;
    set({ isPlaying: !isPlaying });
  },

  pause: () => set({ isPlaying: false }),
  resume: () => set({ isPlaying: true }),

  nextSong: () => {
    const { queue, currentIndex, repeatMode, isPlaying } = get();
    if (queue.length === 0) return;

    if (repeatMode === 'one') {
      set({ progress: 0, isPlaying: true });
      return;
    }

    let nextIndex = currentIndex + 1;
    if (nextIndex >= queue.length) {
      if (repeatMode === 'all') {
        nextIndex = 0;
      } else {
        set({ isPlaying: false, progress: 0 });
        return;
      }
    }

    set({
      currentIndex: nextIndex,
      currentSong: queue[nextIndex],
      isPlaying: true,
      progress: 0,
    });
  },

  prevSong: () => {
    const { queue, currentIndex, progress } = get();
    if (queue.length === 0) return;

    // If progress is > 3s, restart current song
    if (progress > 3) {
      set({ progress: 0 });
      return;
    }

    let prevIndex = currentIndex - 1;
    if (prevIndex < 0) {
      prevIndex = queue.length - 1;
    }

    set({
      currentIndex: prevIndex,
      currentSong: queue[prevIndex],
      isPlaying: true,
      progress: 0,
    });
  },

  addToQueue: (song: Song) => {
    const { queue } = get();
    set({ queue: [...queue, song] });
  },

  playNextInQueue: (song: Song) => {
    const { queue, currentIndex } = get();
    const newQueue = [...queue];
    newQueue.splice(currentIndex + 1, 0, song);
    set({ queue: newQueue });
  },

  removeFromQueue: (index: number) => {
    const { queue, currentIndex, currentSong } = get();
    const newQueue = queue.filter((_, i) => i !== index);
    let newIndex = currentIndex;

    if (index < currentIndex) {
      newIndex -= 1;
    } else if (index === currentIndex) {
      newIndex = newQueue.length > 0 ? Math.min(index, newQueue.length - 1) : -1;
    }

    set({
      queue: newQueue,
      currentIndex: newIndex,
      currentSong: newIndex >= 0 ? newQueue[newIndex] : null,
      isPlaying: newIndex >= 0 ? get().isPlaying : false,
    });
  },

  clearQueue: () => {
    set({
      queue: [],
      currentIndex: -1,
      currentSong: null,
      isPlaying: false,
    });
  },

  setQueue: (songs: Song[]) => {
    set({ queue: songs, unshuffledQueue: songs });
  },

  reorderQueue: (startIndex: number, endIndex: number) => {
    const { queue, currentIndex } = get();
    const result = Array.from(queue);
    const [removed] = result.splice(startIndex, 1);
    result.splice(endIndex, 0, removed);

    let newCurrentIndex = currentIndex;
    if (currentIndex === startIndex) {
      newCurrentIndex = endIndex;
    } else if (startIndex < currentIndex && endIndex >= currentIndex) {
      newCurrentIndex -= 1;
    } else if (startIndex > currentIndex && endIndex <= currentIndex) {
      newCurrentIndex += 1;
    }

    set({ queue: result, currentIndex: newCurrentIndex });
  },

  setVolume: (volume: number) => set({ volume, isMuted: volume === 0 }),
  toggleMute: () => set((state) => ({ isMuted: !state.isMuted })),
  setProgress: (progress: number) => set({ progress }),
  setDuration: (duration: number) => set({ duration }),

  toggleRepeatMode: () => {
    const { repeatMode } = get();
    const nextMode: Record<RepeatMode, RepeatMode> = {
      off: 'all',
      all: 'one',
      one: 'off',
    };
    set({ repeatMode: nextMode[repeatMode] });
  },

  toggleShuffle: () => {
    const { isShuffle, queue, unshuffledQueue, currentSong } = get();
    if (!isShuffle) {
      // Shuffle active
      if (queue.length === 0) return;
      const copy = [...queue];
      const current = currentSong ? copy.filter(s => s.youtube_video_id !== currentSong.youtube_video_id) : copy;

      // Fisher-Yates shuffle
      for (let i = current.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [current[i], current[j]] = [current[j], current[i]];
      }

      const shuffled = currentSong ? [currentSong, ...current] : current;
      set({
        isShuffle: true,
        unshuffledQueue: queue,
        queue: shuffled,
        currentIndex: 0,
      });
    } else {
      // Restore original queue
      const restoredIndex = currentSong ? unshuffledQueue.findIndex(s => s.youtube_video_id === currentSong.youtube_video_id) : 0;
      set({
        isShuffle: false,
        queue: unshuffledQueue,
        currentIndex: restoredIndex !== -1 ? restoredIndex : 0,
      });
    }
  },
}));

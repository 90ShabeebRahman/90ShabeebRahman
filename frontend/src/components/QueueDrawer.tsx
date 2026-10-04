import React from 'react';
import { X, Trash2, Play, Music, GripVertical } from 'lucide-react';
import { usePlayerStore } from '../stores/playerStore';

interface QueueDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export const QueueDrawer: React.FC<QueueDrawerProps> = ({ isOpen, onClose }) => {
  const { queue, currentIndex, currentSong, playSong, removeFromQueue, clearQueue } = usePlayerStore();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-y-0 right-0 w-full sm:w-96 bg-surface-card border-l border-surface-border shadow-2xl z-50 flex flex-col animate-in slide-in-from-right duration-200">
      {/* Header */}
      <div className="p-4 border-b border-surface-border flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Music className="w-5 h-5 text-brand-accent" />
          <h2 className="font-bold text-lg text-white">Play Queue</h2>
        </div>
        <div className="flex items-center gap-2">
          {queue.length > 0 && (
            <button
              onClick={clearQueue}
              className="p-2 rounded-lg text-surface-muted hover:text-red-400 hover:bg-surface-hover transition-colors"
              title="Clear Queue"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
          <button
            onClick={onClose}
            className="p-2 rounded-lg text-surface-muted hover:text-white hover:bg-surface-hover transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Queue Content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        {/* Now Playing */}
        {currentSong && (
          <div>
            <span className="text-xs font-semibold text-brand-accent uppercase tracking-wider block mb-2">
              Now Playing
            </span>
            <div className="flex items-center gap-3 p-2.5 rounded-xl bg-brand-600/10 border border-brand-500/20">
              <img
                src={currentSong.thumbnail_url || `https://i.ytimg.com/vi/${currentSong.youtube_video_id}/hqdefault.jpg`}
                alt={currentSong.title}
                className="w-12 h-12 rounded-lg object-cover flex-shrink-0"
              />
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-sm text-white truncate">{currentSong.title}</p>
                <p className="text-xs text-surface-muted truncate">{currentSong.channel_name}</p>
              </div>
            </div>
          </div>
        )}

        {/* Up Next */}
        <div>
          <span className="text-xs font-semibold text-surface-muted uppercase tracking-wider block mb-2">
            Up Next ({Math.max(0, queue.length - currentIndex - 1)})
          </span>

          {queue.length === 0 || currentIndex >= queue.length - 1 ? (
            <p className="text-sm text-surface-muted italic text-center py-6">
              No upcoming songs in queue
            </p>
          ) : (
            <div className="space-y-1.5">
              {queue.slice(currentIndex + 1).map((song, idx) => {
                const realIndex = currentIndex + 1 + idx;
                return (
                  <div
                    key={`${song.youtube_video_id}_${realIndex}`}
                    className="group flex items-center gap-3 p-2 rounded-xl hover:bg-surface-hover transition-colors"
                  >
                    <button
                      onClick={() => playSong(song)}
                      className="relative flex-shrink-0"
                    >
                      <img
                        src={song.thumbnail_url || `https://i.ytimg.com/vi/${song.youtube_video_id}/hqdefault.jpg`}
                        alt={song.title}
                        className="w-10 h-10 rounded-lg object-cover"
                      />
                      <div className="absolute inset-0 bg-black/40 rounded-lg flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <Play className="w-4 h-4 text-white fill-white" />
                      </div>
                    </button>

                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm text-slate-200 truncate group-hover:text-white">
                        {song.title}
                      </p>
                      <p className="text-xs text-surface-muted truncate">{song.channel_name}</p>
                    </div>

                    <button
                      onClick={() => removeFromQueue(realIndex)}
                      className="p-1.5 rounded-lg text-surface-muted hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity"
                      title="Remove"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

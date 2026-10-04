import React, { useEffect, useRef } from 'react';
import { usePlayerStore } from '../stores/playerStore';

declare global {
  interface Window {
    YT: any;
    onYouTubeIframeAPIReady: any;
  }
}

export const YouTubeIFrame: React.FC = () => {
  const playerRef = useRef<any>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const currentSong = usePlayerStore((state) => state.currentSong);
  const isPlaying = usePlayerStore((state) => state.isPlaying);
  const volume = usePlayerStore((state) => state.volume);
  const isMuted = usePlayerStore((state) => state.isMuted);

  const { nextSong, setProgress, setDuration, pause, resume } = usePlayerStore();

  // Load YouTube IFrame API
  useEffect(() => {
    if (!window.YT) {
      const tag = document.createElement('script');
      tag.src = 'https://www.youtube.com/iframe_api';
      const firstScriptTag = document.getElementsByTagName('script')[0];
      firstScriptTag.parentNode?.insertBefore(tag, firstScriptTag);
    }
  }, []);

  // Initialize YouTube Player
  useEffect(() => {
    if (!currentSong) return;

    const initPlayer = () => {
      if (playerRef.current) {
        playerRef.current.loadVideoById(currentSong.youtube_video_id);
        if (isPlaying) {
          playerRef.current.playVideo();
        } else {
          playerRef.current.pauseVideo();
        }
        return;
      }

      playerRef.current = new window.YT.Player('yt-player-element', {
        height: '100%',
        width: '100%',
        videoId: currentSong.youtube_video_id,
        playerVars: {
          autoplay: isPlaying ? 1 : 0,
          controls: 0,
          disablekb: 1,
          fs: 0,
          modestbranding: 1,
          rel: 0,
          playsinline: 1,
        },
        events: {
          onReady: (event: any) => {
            event.target.setVolume(isMuted ? 0 : volume);
            if (isPlaying) {
              event.target.playVideo();
            }
          },
          onStateChange: (event: any) => {
            // YT.PlayerState: ENDED = 0, PLAYING = 1, PAUSED = 2
            if (event.data === 0) {
              nextSong();
            } else if (event.data === 1) {
              resume();
              if (playerRef.current) {
                setDuration(playerRef.current.getDuration() || 0);
              }
            } else if (event.data === 2) {
              pause();
            }
          },
          onError: (err: any) => {
            console.warn('YouTube Player error, skipping to next track:', err);
            nextSong();
          },
        },
      });
    };

    if (window.YT && window.YT.Player) {
      initPlayer();
    } else {
      window.onYouTubeIframeAPIReady = () => initPlayer();
    }
  }, [currentSong?.youtube_video_id]);

  // Sync volume & mute state
  useEffect(() => {
    if (playerRef.current && playerRef.current.setVolume) {
      playerRef.current.setVolume(isMuted ? 0 : volume);
    }
  }, [volume, isMuted]);

  // Sync playback state
  useEffect(() => {
    if (playerRef.current && playerRef.current.getPlayerState) {
      const state = playerRef.current.getPlayerState();
      if (isPlaying && state !== 1) {
        playerRef.current.playVideo();
      } else if (!isPlaying && state === 1) {
        playerRef.current.pauseVideo();
      }
    }
  }, [isPlaying]);

  // Track playback time interval
  useEffect(() => {
    const interval = setInterval(() => {
      if (playerRef.current && isPlaying && playerRef.current.getCurrentTime) {
        const time = playerRef.current.getCurrentTime();
        const dur = playerRef.current.getDuration();
        setProgress(time || 0);
        if (dur) setDuration(dur);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [isPlaying]);

  return (
    <div className="relative w-full h-full overflow-hidden bg-black rounded-lg">
      <div id="yt-player-element" ref={containerRef} className="w-full h-full" />
    </div>
  );
};

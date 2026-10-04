export interface User {
  id: string;
  name: string;
  email: string;
  avatar_url?: string;
  created_at?: string;
}

export interface Song {
  id: string;
  youtube_video_id: string;
  title: string;
  channel_name: string;
  channel_id?: string;
  thumbnail_url?: string;
  duration?: string;
  published_at?: string;
  description?: string;
  liked_at?: string;
}

export interface Playlist {
  id: string;
  user_id: string;
  name: string;
  description?: string;
  cover_url?: string;
  song_count?: number;
  created_at?: string;
  updated_at?: string;
}

export type RepeatMode = 'off' | 'all' | 'one';

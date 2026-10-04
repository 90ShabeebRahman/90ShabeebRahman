import { db } from '../database/db';
import { cryptoRandomString } from '../utils/id';

export interface SaveSongInput {
  youtube_video_id: string;
  title: string;
  channel_name: string;
  thumbnail_url?: string;
  duration?: string;
}

export function ensureSongExists(song: SaveSongInput): string {
  const existing = db.prepare('SELECT id FROM songs WHERE youtube_video_id = ?').get(song.youtube_video_id) as any;
  if (existing) {
    return existing.id;
  }

  const id = `song_${cryptoRandomString(12)}`;
  db.prepare(`
    INSERT INTO songs (id, youtube_video_id, title, channel_name, thumbnail_url, duration)
    VALUES (?, ?, ?, ?, ?, ?)
  `).run(id, song.youtube_video_id, song.title, song.channel_name, song.thumbnail_url || null, song.duration || null);

  return id;
}

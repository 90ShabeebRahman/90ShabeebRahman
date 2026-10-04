import { Response } from 'express';
import { db } from '../database/db';
import { AuthRequest } from '../middleware/auth';
import { cryptoRandomString } from '../utils/id';
import { ensureSongExists } from '../services/songService';

export async function getLikedSongs(req: AuthRequest, res: Response): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const likes = db.prepare(`
      SELECT s.*, l.created_at as liked_at
      FROM likes l
      JOIN songs s ON l.song_id = s.id
      WHERE l.user_id = ?
      ORDER BY l.created_at DESC
    `).all(req.user.id);

    res.json({ songs: likes });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch liked songs' });
  }
}

export async function toggleLikeSong(req: AuthRequest, res: Response): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const { youtube_video_id, title, channel_name, thumbnail_url, duration } = req.body;
    if (!youtube_video_id) {
      res.status(400).json({ error: 'youtube_video_id is required' });
      return;
    }

    const songId = ensureSongExists({
      youtube_video_id,
      title: title || 'Unknown Song',
      channel_name: channel_name || 'Unknown Artist',
      thumbnail_url,
      duration,
    });

    const existing = db.prepare('SELECT id FROM likes WHERE user_id = ? AND song_id = ?').get(req.user.id, songId) as any;

    if (existing) {
      db.prepare('DELETE FROM likes WHERE id = ?').run(existing.id);
      res.json({ liked: false, song_id: songId });
    } else {
      const likeId = `like_${cryptoRandomString(12)}`;
      db.prepare('INSERT INTO likes (id, user_id, song_id) VALUES (?, ?, ?)').run(likeId, req.user.id, songId);
      res.json({ liked: true, song_id: songId });
    }
  } catch (error) {
    res.status(500).json({ error: 'Failed to toggle song like state' });
  }
}

export async function getListeningHistory(req: AuthRequest, res: Response): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const limit = req.query.limit ? parseInt(req.query.limit as string) : 50;

    const history = db.prepare(`
      SELECT s.*, h.played_at, h.id as history_id
      FROM listening_history h
      JOIN songs s ON h.song_id = s.id
      WHERE h.user_id = ?
      ORDER BY h.played_at DESC
      LIMIT ?
    `).all(req.user.id, limit);

    res.json({ history });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch listening history' });
  }
}

export async function recordHistory(req: AuthRequest, res: Response): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const { youtube_video_id, title, channel_name, thumbnail_url, duration } = req.body;
    if (!youtube_video_id) {
      res.status(400).json({ error: 'youtube_video_id is required' });
      return;
    }

    const songId = ensureSongExists({
      youtube_video_id,
      title: title || 'Unknown Song',
      channel_name: channel_name || 'Unknown Artist',
      thumbnail_url,
      duration,
    });

    const historyId = `hist_${cryptoRandomString(12)}`;
    db.prepare('INSERT INTO listening_history (id, user_id, song_id) VALUES (?, ?, ?)').run(historyId, req.user.id, songId);

    res.status(201).json({ success: true, history_id: historyId });
  } catch (error) {
    res.status(500).json({ error: 'Failed to record listening history' });
  }
}

export async function clearHistory(req: AuthRequest, res: Response): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    db.prepare('DELETE FROM listening_history WHERE user_id = ?').run(req.user.id);
    res.json({ success: true, message: 'Listening history cleared' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to clear listening history' });
  }
}

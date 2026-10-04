import { Response } from 'express';
import { db } from '../database/db';
import { AuthRequest } from '../middleware/auth';
import { cryptoRandomString } from '../utils/id';
import { ensureSongExists } from '../services/songService';

export async function getUserPlaylists(req: AuthRequest, res: Response): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const playlists = db.prepare(`
      SELECT p.*, COUNT(ps.id) as song_count
      FROM playlists p
      LEFT JOIN playlist_songs ps ON p.id = ps.playlist_id
      WHERE p.user_id = ?
      GROUP BY p.id
      ORDER BY p.created_at DESC
    `).all(req.user.id);

    res.json({ playlists });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch playlists' });
  }
}

export async function getPlaylistById(req: AuthRequest, res: Response): Promise<void> {
  try {
    const playlistId = req.params.id;
    const playlist = db.prepare(`
      SELECT p.*, u.name as owner_name
      FROM playlists p
      JOIN users u ON p.user_id = u.id
      WHERE p.id = ?
    `).get(playlistId) as any;

    if (!playlist) {
      res.status(404).json({ error: 'Playlist not found' });
      return;
    }

    const songs = db.prepare(`
      SELECT s.*, ps.position, ps.added_at
      FROM playlist_songs ps
      JOIN songs s ON ps.song_id = s.id
      WHERE ps.playlist_id = ?
      ORDER BY ps.position ASC
    `).all(playlistId);

    res.json({ playlist, songs });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch playlist' });
  }
}

export async function createPlaylist(req: AuthRequest, res: Response): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const { name, description, cover_url } = req.body;
    if (!name || !name.trim()) {
      res.status(400).json({ error: 'Playlist name is required' });
      return;
    }

    const id = `pl_${cryptoRandomString(12)}`;
    db.prepare(`
      INSERT INTO playlists (id, user_id, name, description, cover_url)
      VALUES (?, ?, ?, ?, ?)
    `).run(id, req.user.id, name.trim(), description || null, cover_url || null);

    const playlist = db.prepare('SELECT * FROM playlists WHERE id = ?').get(id);
    res.status(201).json({ playlist });
  } catch (error) {
    res.status(500).json({ error: 'Failed to create playlist' });
  }
}

export async function updatePlaylist(req: AuthRequest, res: Response): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const playlistId = req.params.id;
    const playlist = db.prepare('SELECT user_id FROM playlists WHERE id = ?').get(playlistId) as any;

    if (!playlist) {
      res.status(404).json({ error: 'Playlist not found' });
      return;
    }

    if (playlist.user_id !== req.user.id) {
      res.status(403).json({ error: 'Forbidden: You do not own this playlist' });
      return;
    }

    const { name, description, cover_url } = req.body;
    db.prepare(`
      UPDATE playlists
      SET name = COALESCE(?, name),
          description = COALESCE(?, description),
          cover_url = COALESCE(?, cover_url),
          updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `).run(name || null, description || null, cover_url || null, playlistId);

    const updated = db.prepare('SELECT * FROM playlists WHERE id = ?').get(playlistId);
    res.json({ playlist: updated });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update playlist' });
  }
}

export async function deletePlaylist(req: AuthRequest, res: Response): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const playlistId = req.params.id;
    const playlist = db.prepare('SELECT user_id FROM playlists WHERE id = ?').get(playlistId) as any;

    if (!playlist) {
      res.status(404).json({ error: 'Playlist not found' });
      return;
    }

    if (playlist.user_id !== req.user.id) {
      res.status(403).json({ error: 'Forbidden: You do not own this playlist' });
      return;
    }

    db.prepare('DELETE FROM playlists WHERE id = ?').run(playlistId);
    res.json({ success: true, message: 'Playlist deleted' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete playlist' });
  }
}

export async function addSongToPlaylist(req: AuthRequest, res: Response): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const playlistId = req.params.id;
    const playlist = db.prepare('SELECT user_id FROM playlists WHERE id = ?').get(playlistId) as any;

    if (!playlist) {
      res.status(404).json({ error: 'Playlist not found' });
      return;
    }

    if (playlist.user_id !== req.user.id) {
      res.status(403).json({ error: 'Forbidden: You do not own this playlist' });
      return;
    }

    const { youtube_video_id, title, channel_name, thumbnail_url, duration } = req.body;
    if (!youtube_video_id || !title) {
      res.status(400).json({ error: 'youtube_video_id and title are required' });
      return;
    }

    const songId = ensureSongExists({ youtube_video_id, title, channel_name: channel_name || 'Artist', thumbnail_url, duration });

    // Check if song already in playlist
    const existing = db.prepare('SELECT id FROM playlist_songs WHERE playlist_id = ? AND song_id = ?').get(playlistId, songId);
    if (existing) {
      res.status(400).json({ error: 'Song is already in this playlist' });
      return;
    }

    const maxPosResult = db.prepare('SELECT MAX(position) as max_pos FROM playlist_songs WHERE playlist_id = ?').get(playlistId) as any;
    const nextPosition = (maxPosResult?.max_pos ?? 0) + 1;
    const psId = `ps_${cryptoRandomString(12)}`;

    db.prepare(`
      INSERT INTO playlist_songs (id, playlist_id, song_id, position)
      VALUES (?, ?, ?, ?)
    `).run(psId, playlistId, songId, nextPosition);

    res.status(201).json({ success: true, songId });
  } catch (error) {
    res.status(500).json({ error: 'Failed to add song to playlist' });
  }
}

export async function removeSongFromPlaylist(req: AuthRequest, res: Response): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const { id: playlistId, songId } = req.params;
    const playlist = db.prepare('SELECT user_id FROM playlists WHERE id = ?').get(playlistId) as any;

    if (!playlist) {
      res.status(404).json({ error: 'Playlist not found' });
      return;
    }

    if (playlist.user_id !== req.user.id) {
      res.status(403).json({ error: 'Forbidden: You do not own this playlist' });
      return;
    }

    db.prepare('DELETE FROM playlist_songs WHERE playlist_id = ? AND song_id = ?').run(playlistId, songId);
    res.json({ success: true, message: 'Song removed from playlist' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to remove song from playlist' });
  }
}

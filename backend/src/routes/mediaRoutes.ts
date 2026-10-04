import { Router } from 'express';
import {
  getUserPlaylists,
  getPlaylistById,
  createPlaylist,
  updatePlaylist,
  deletePlaylist,
  addSongToPlaylist,
  removeSongFromPlaylist,
} from '../controllers/playlistController';
import {
  getLikedSongs,
  toggleLikeSong,
  getListeningHistory,
  recordHistory,
  clearHistory,
} from '../controllers/mediaController';
import { authenticateToken } from '../middleware/auth';

const router = Router();

// Playlists
router.get('/playlists', authenticateToken, getUserPlaylists);
router.get('/playlists/:id', getPlaylistById);
router.post('/playlists', authenticateToken, createPlaylist);
router.put('/playlists/:id', authenticateToken, updatePlaylist);
router.delete('/playlists/:id', authenticateToken, deletePlaylist);
router.post('/playlists/:id/songs', authenticateToken, addSongToPlaylist);
router.delete('/playlists/:id/songs/:songId', authenticateToken, removeSongFromPlaylist);

// Likes
router.get('/likes', authenticateToken, getLikedSongs);
router.post('/likes/toggle', authenticateToken, toggleLikeSong);

// History
router.get('/history', authenticateToken, getListeningHistory);
router.post('/history', authenticateToken, recordHistory);
router.delete('/history', authenticateToken, clearHistory);

export default router;

import { searchSong } from '../services/youtube/searchService';
import { getVideoDetails, getRelatedVideos, getChannelDetails } from '../services/youtube/metadataService';
import { getTrendingMusic, getGenreMusic } from '../services/youtube/playlistService';
import { Router, Request, Response } from 'express';

const router = Router();

router.get('/search', async (req: Request, res: Response) => {
  try {
    const q = req.query.q as string;
    const pageToken = req.query.pageToken as string;
    const maxResults = req.query.limit ? parseInt(req.query.limit as string) : 20;
    const type = (req.query.type as string) || 'video';

    if (!q) {
      res.status(400).json({ error: 'Search query parameter q is required' });
      return;
    }

    const results = await searchSong(q, pageToken, maxResults, type);
    res.json(results);
  } catch (error: any) {
    console.error('Search Route Error:', error);
    res.status(500).json({ error: 'Failed to perform search', details: error?.message });
  }
});

router.get('/video/:videoId', async (req: Request, res: Response) => {
  try {
    const videoId = req.params.videoId;
    const song = await getVideoDetails(videoId);
    if (!song) {
      res.status(404).json({ error: 'Song / Video not found' });
      return;
    }
    res.json(song);
  } catch (error) {
    res.status(500).json({ error: 'Failed to retrieve video details' });
  }
});

router.get('/related/:videoId', async (req: Request, res: Response) => {
  try {
    const videoId = req.params.videoId;
    const items = await getRelatedVideos(videoId);
    res.json({ items });
  } catch (error) {
    res.status(500).json({ error: 'Failed to retrieve related videos' });
  }
});

router.get('/channel/:channelId', async (req: Request, res: Response) => {
  try {
    const channelId = req.params.channelId;
    const channel = await getChannelDetails(channelId);
    res.json(channel);
  } catch (error) {
    res.status(500).json({ error: 'Failed to retrieve channel details' });
  }
});

router.get('/trending', async (req: Request, res: Response) => {
  try {
    const items = await getTrendingMusic();
    res.json({ items });
  } catch (error) {
    res.status(500).json({ error: 'Failed to retrieve trending music' });
  }
});

router.get('/genre/:genre', async (req: Request, res: Response) => {
  try {
    const genre = req.params.genre;
    const items = await getGenreMusic(genre);
    res.json({ genre, items });
  } catch (error) {
    res.status(500).json({ error: 'Failed to retrieve genre music' });
  }
});

export default router;

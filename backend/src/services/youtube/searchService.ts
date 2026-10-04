import { youtubeClient, youtubeCache } from './youtubeClient';
import { SongMetadata, SearchResultPage } from './types';

// Fallback mock data if API Key is missing or rate limited
const MOCK_FEATURED_SONGS: SongMetadata[] = [
  {
    id: 'yt_L3wKzyIN1yk',
    youtube_video_id: 'L3wKzyIN1yk',
    title: 'The Weeknd - Blinding Lights (Official Audio)',
    channel_name: 'TheWeekndVEVO',
    channel_id: 'UC0WP5P-ufpJfJ-AyHsM122Q',
    thumbnail_url: 'https://i.ytimg.com/vi/L3wKzyIN1yk/hqdefault.jpg',
    duration: '3:20',
  },
  {
    id: 'yt_fJ9rUzIMcZQ',
    youtube_video_id: 'fJ9rUzIMcZQ',
    title: 'Queen – Bohemian Rhapsody (Official Video Remastered)',
    channel_name: 'Queen Official',
    channel_id: 'UC209C4G02k915152O',
    thumbnail_url: 'https://i.ytimg.com/vi/fJ9rUzIMcZQ/hqdefault.jpg',
    duration: '6:00',
  },
  {
    id: 'yt_4NRXx6U8ABQ',
    youtube_video_id: '4NRXx6U8ABQ',
    title: 'The Weeknd - Save Your Tears (Official Music Video)',
    channel_name: 'TheWeekndVEVO',
    channel_id: 'UC0WP5P-ufpJfJ-AyHsM122Q',
    thumbnail_url: 'https://i.ytimg.com/vi/4NRXx6U8ABQ/hqdefault.jpg',
    duration: '4:08',
  },
  {
    id: 'yt_kJQP7kiw5Fk',
    youtube_video_id: 'kJQP7kiw5Fk',
    title: 'Luis Fonsi - Despacito ft. Daddy Yankee',
    channel_name: 'LuisFonsiVEVO',
    thumbnail_url: 'https://i.ytimg.com/vi/kJQP7kiw5Fk/hqdefault.jpg',
    duration: '4:42',
  },
  {
    id: 'yt_JGwWNGJdvx8',
    youtube_video_id: 'JGwWNGJdvx8',
    title: 'Ed Sheeran - Shape of You (Official Music Video)',
    channel_name: 'Ed Sheeran',
    thumbnail_url: 'https://i.ytimg.com/vi/JGwWNGJdvx8/hqdefault.jpg',
    duration: '4:23',
  },
  {
    id: 'yt_50VNCymT-Cs',
    youtube_video_id: '50VNCymT-Cs',
    title: 'A.R. Rahman - Jai Ho (Official Video)',
    channel_name: 'A.R. Rahman',
    thumbnail_url: 'https://i.ytimg.com/vi/50VNCymT-Cs/hqdefault.jpg',
    duration: '3:42',
  },
  {
    id: 'yt_0pA1XJ7Tfms',
    youtube_video_id: '0pA1XJ7Tfms',
    title: 'Lofi Hip Hop Radio - Beats to Relax/Study to',
    channel_name: 'Lofi Girl',
    thumbnail_url: 'https://i.ytimg.com/vi/jfKfPfyJRdk/hqdefault.jpg',
    duration: 'Live',
  }
];

export async function searchSong(
  query: string,
  pageToken?: string,
  maxResults: number = 20,
  type: string = 'video'
): Promise<SearchResultPage> {
  if (!query || !query.trim()) {
    return { items: [] };
  }

  const cacheKey = `search:${query}:${pageToken || ''}:${maxResults}:${type}`;
  const cached = youtubeCache.get<SearchResultPage>(cacheKey);
  if (cached) return cached;

  const apiKey = process.env.YOUTUBE_API_KEY;
  if (!apiKey || apiKey === 'your_youtube_api_key_here') {
    // Graceful fallback with mock data when no API key configured
    const filtered = MOCK_FEATURED_SONGS.filter(s =>
      s.title.toLowerCase().includes(query.toLowerCase()) ||
      s.channel_name.toLowerCase().includes(query.toLowerCase())
    );
    const results = filtered.length > 0 ? filtered : MOCK_FEATURED_SONGS;
    const page: SearchResultPage = {
      items: results,
      totalResults: results.length,
    };
    youtubeCache.set(cacheKey, page);
    return page;
  }

  try {
    const response = await youtubeClient.get('/search', {
      params: {
        q: `${query} music`,
        part: 'snippet',
        type: type,
        videoCategoryId: '10', // Music Category
        maxResults,
        pageToken,
      },
    });

    const items: SongMetadata[] = response.data.items.map((item: any) => {
      const videoId = item.id.videoId || item.id.channelId || item.id.playlistId || item.id;
      return {
        id: `yt_${videoId}`,
        youtube_video_id: videoId,
        title: item.snippet.title,
        channel_name: item.snippet.channelTitle,
        channel_id: item.snippet.channelId,
        thumbnail_url: item.snippet.thumbnails?.high?.url || item.snippet.thumbnails?.medium?.url || item.snippet.thumbnails?.default?.url,
        published_at: item.snippet.publishedAt,
        description: item.snippet.description,
      };
    });

    const page: SearchResultPage = {
      items,
      nextPageToken: response.data.nextPageToken,
      totalResults: response.data.pageInfo?.totalResults,
    };

    youtubeCache.set(cacheKey, page);
    return page;
  } catch (error: any) {
    console.warn('YouTube API call failed, using fallback results:', error?.response?.data || error?.message);
    const filtered = MOCK_FEATURED_SONGS.filter(s =>
      s.title.toLowerCase().includes(query.toLowerCase()) ||
      s.channel_name.toLowerCase().includes(query.toLowerCase())
    );
    return {
      items: filtered.length > 0 ? filtered : MOCK_FEATURED_SONGS,
      totalResults: MOCK_FEATURED_SONGS.length,
    };
  }
}

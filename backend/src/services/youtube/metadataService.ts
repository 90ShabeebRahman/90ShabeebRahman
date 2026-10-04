import { youtubeClient, youtubeCache } from './youtubeClient';
import { SongMetadata } from './types';

export async function getVideoDetails(videoId: string): Promise<SongMetadata | null> {
  const cacheKey = `video:${videoId}`;
  const cached = youtubeCache.get<SongMetadata>(cacheKey);
  if (cached) return cached;

  const apiKey = process.env.YOUTUBE_API_KEY;
  if (!apiKey || apiKey === 'your_youtube_api_key_here') {
    return {
      id: `yt_${videoId}`,
      youtube_video_id: videoId,
      title: `Song (${videoId})`,
      channel_name: 'YouTube Music Artist',
      thumbnail_url: `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`,
      duration: '3:45',
    };
  }

  try {
    const response = await youtubeClient.get('/videos', {
      params: {
        id: videoId,
        part: 'snippet,contentDetails',
      },
    });

    if (!response.data.items || response.data.items.length === 0) {
      return null;
    }

    const item = response.data.items[0];
    const durationIso = item.contentDetails?.duration || '';
    const formattedDuration = formatIsoDuration(durationIso);

    const song: SongMetadata = {
      id: `yt_${item.id}`,
      youtube_video_id: item.id,
      title: item.snippet.title,
      channel_name: item.snippet.channelTitle,
      channel_id: item.snippet.channelId,
      thumbnail_url: item.snippet.thumbnails?.high?.url || item.snippet.thumbnails?.medium?.url,
      duration: formattedDuration,
      description: item.snippet.description,
    };

    youtubeCache.set(cacheKey, song);
    return song;
  } catch (error) {
    console.warn(`Failed to fetch YouTube details for videoId ${videoId}`, error);
    return {
      id: `yt_${videoId}`,
      youtube_video_id: videoId,
      title: `Song (${videoId})`,
      channel_name: 'YouTube Music Artist',
      thumbnail_url: `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`,
      duration: '3:45',
    };
  }
}

export async function getRelatedVideos(videoId: string, maxResults: number = 10): Promise<SongMetadata[]> {
  const cacheKey = `related:${videoId}:${maxResults}`;
  const cached = youtubeCache.get<SongMetadata[]>(cacheKey);
  if (cached) return cached;

  const apiKey = process.env.YOUTUBE_API_KEY;
  if (!apiKey || apiKey === 'your_youtube_api_key_here') {
    return [
      {
        id: 'yt_L3wKzyIN1yk',
        youtube_video_id: 'L3wKzyIN1yk',
        title: 'The Weeknd - Blinding Lights (Official Audio)',
        channel_name: 'TheWeekndVEVO',
        thumbnail_url: 'https://i.ytimg.com/vi/L3wKzyIN1yk/hqdefault.jpg',
        duration: '3:20',
      },
      {
        id: 'yt_4NRXx6U8ABQ',
        youtube_video_id: '4NRXx6U8ABQ',
        title: 'The Weeknd - Save Your Tears (Official Music Video)',
        channel_name: 'TheWeekndVEVO',
        thumbnail_url: 'https://i.ytimg.com/vi/4NRXx6U8ABQ/hqdefault.jpg',
        duration: '4:08',
      }
    ];
  }

  try {
    const response = await youtubeClient.get('/search', {
      params: {
        relatedToVideoId: videoId,
        type: 'video',
        part: 'snippet',
        maxResults,
      },
    });

    const items: SongMetadata[] = response.data.items.map((item: any) => ({
      id: `yt_${item.id.videoId}`,
      youtube_video_id: item.id.videoId,
      title: item.snippet.title,
      channel_name: item.snippet.channelTitle,
      channel_id: item.snippet.channelId,
      thumbnail_url: item.snippet.thumbnails?.high?.url || item.snippet.thumbnails?.medium?.url,
    }));

    youtubeCache.set(cacheKey, items);
    return items;
  } catch (error) {
    return [];
  }
}

export async function getChannelDetails(channelId: string): Promise<any> {
  const cacheKey = `channel:${channelId}`;
  const cached = youtubeCache.get<any>(cacheKey);
  if (cached) return cached;

  const apiKey = process.env.YOUTUBE_API_KEY;
  if (!apiKey || apiKey === 'your_youtube_api_key_here') {
    return {
      id: channelId,
      title: 'Featured Artist',
      description: 'Popular musical artist on YouTube',
      thumbnail_url: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=400&auto=format&fit=crop',
      subscriberCount: '10M+',
    };
  }

  try {
    const response = await youtubeClient.get('/channels', {
      params: {
        id: channelId,
        part: 'snippet,statistics,brandingSettings',
      },
    });

    if (!response.data.items || response.data.items.length === 0) {
      return null;
    }

    const item = response.data.items[0];
    const details = {
      id: item.id,
      title: item.snippet.title,
      description: item.snippet.description,
      thumbnail_url: item.snippet.thumbnails?.high?.url || item.snippet.thumbnails?.medium?.url,
      banner_url: item.brandingSettings?.image?.bannerExternalUrl,
      subscriberCount: item.statistics?.subscriberCount,
    };

    youtubeCache.set(cacheKey, details);
    return details;
  } catch (error) {
    return null;
  }
}

function formatIsoDuration(isoDuration: string): string {
  const match = isoDuration.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
  if (!match) return '3:30';

  const hours = match[1] ? parseInt(match[1]) : 0;
  const minutes = match[2] ? parseInt(match[2]) : 0;
  const seconds = match[3] ? parseInt(match[3]) : 0;

  const paddedSeconds = seconds < 10 ? `0${seconds}` : `${seconds}`;

  if (hours > 0) {
    const paddedMinutes = minutes < 10 ? `0${minutes}` : `${minutes}`;
    return `${hours}:${paddedMinutes}:${paddedSeconds}`;
  }

  return `${minutes}:${paddedSeconds}`;
}

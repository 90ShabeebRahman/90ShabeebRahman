import { searchSong } from './searchService';
import { getVideoDetails, getRelatedVideos, getChannelDetails } from './metadataService';
import { SongMetadata } from './types';

export async function getTrendingMusic(regionCode: string = 'US', limit: number = 20): Promise<SongMetadata[]> {
  const result = await searchSong('top hits music 2025 trending', undefined, limit);
  return result.items;
}

export async function getGenreMusic(genre: string, limit: number = 20): Promise<SongMetadata[]> {
  const result = await searchSong(`${genre} music mix`, undefined, limit);
  return result.items;
}

export {
  searchSong,
  getVideoDetails,
  getRelatedVideos,
  getChannelDetails,
};

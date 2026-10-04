export interface SongMetadata {
  id: string; // Database ID or youtube_video_id
  youtube_video_id: string;
  title: string;
  channel_name: string;
  channel_id?: string;
  thumbnail_url: string;
  duration?: string;
  published_at?: string;
  description?: string;
}

export interface SearchResultPage {
  items: SongMetadata[];
  nextPageToken?: string;
  totalResults?: number;
}

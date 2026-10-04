import axios from 'axios';

const YOUTUBE_API_KEY = process.env.YOUTUBE_API_KEY || '';
const YOUTUBE_BASE_URL = 'https://www.googleapis.com/youtube/v3';

export const youtubeClient = axios.create({
  baseURL: YOUTUBE_BASE_URL,
  params: {
    key: YOUTUBE_API_KEY,
  },
  timeout: 10000,
});

export interface CacheEntry<T> {
  data: T;
  timestamp: number;
}

class YouTubeCache {
  private cache: Map<string, CacheEntry<any>> = new Map();
  private ttlMs: number = 30 * 60 * 1000; // 30 mins cache

  get<T>(key: string): T | null {
    const entry = this.cache.get(key);
    if (!entry) return null;
    if (Date.now() - entry.timestamp > this.ttlMs) {
      this.cache.delete(key);
      return null;
    }
    return entry.data as T;
  }

  set<T>(key: string, data: T): void {
    this.cache.set(key, { data, timestamp: Date.now() });
  }

  clear(): void {
    this.cache.clear();
  }
}

export const youtubeCache = new YouTubeCache();

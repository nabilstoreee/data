export interface VideoResultData {
  id: string;
  title: string;
  cover: string;
  playUrl: string;
  watermarkUrl?: string;
  musicUrl?: string;
  author?: string;
  duration?: number;
  platform: 'tiktok' | 'youtube';
  date?: string;
  images?: string[];
  quality?: string;
  stats?: {
    likes?: number;
    views?: number;
    shares?: number;
  }
}

export interface HistoryItem {
  id: number;
  title: string;
  cover: string;
  playUrl: string;
  date: string;
}

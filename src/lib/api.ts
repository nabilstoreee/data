import { VideoResultData } from '../types';

export async function fetchTikTok(url: string): Promise<VideoResultData> {
  const res = await fetch(`https://www.tikwm.com/api/?url=${encodeURIComponent(url)}`);
  const data = await res.json();
  
  if (data.code !== 0 || !data.data) {
    throw new Error('Gagal mengambil data video. Pastikan link valid.');
  }

  return {
    id: data.data.id || Math.random().toString(),
    title: data.data.title || 'TikTok Video',
    cover: data.data.cover || data.data.origin_cover,
    playUrl: data.data.play,
    watermarkUrl: data.data.wmplay,
    musicUrl: data.data.music,
    author: data.data.author?.unique_id || 'unknown',
    duration: data.data.duration,
    platform: 'tiktok',
    images: data.data.images,
    stats: {
      likes: data.data.digg_count,
      views: data.data.play_count,
      shares: data.data.share_count
    }
  };
}

const APIKEY_YOUTUBE = 'nbteam';
export async function fetchYouTube(url: string, quality?: string): Promise<VideoResultData> {
  const qParams = quality ? `&quality=${quality}` : '';
  let res = await fetch(`https://youtubedl.siputzx.my.id/download?url=${encodeURIComponent(url)}&type=merge&apikey=${APIKEY_YOUTUBE}${qParams}`);
  let data = await res.json();
  
  let attempts = 0;
  while (data.status !== 'completed' && attempts < 10) {
    await new Promise(r => setTimeout(r, 3000));
    res = await fetch(`https://youtubedl.siputzx.my.id/download?url=${encodeURIComponent(url)}&type=merge&apikey=${APIKEY_YOUTUBE}${qParams}`);
    data = await res.json();
    attempts++;
    if (data.status === 'error') throw new Error(data.error || 'Server error saat memproses video.');
  }

  if (data.status !== 'completed') {
    throw new Error('Waktu habis, video mungkin terlalu besar. Silakan coba lagi.');
  }

  return {
    id: Math.random().toString(36).substring(7),
    title: data.title || 'YouTube Video',
    cover: data.thumbnail || '',
    playUrl: `https://youtubedl.siputzx.my.id${data.fileUrl}`,
    platform: 'youtube',
    quality: quality || 'auto'
  };
}

export async function fetchYouTubeAudio(url: string): Promise<string> {
    let res = await fetch(`https://youtubedl.siputzx.my.id/download?url=${encodeURIComponent(url)}&type=audio&apikey=${APIKEY_YOUTUBE}`);
    let data = await res.json();
    
    let attempts = 0;
    while (data.status !== 'completed' && attempts < 10) {
      await new Promise(r => setTimeout(r, 3000));
      res = await fetch(`https://youtubedl.siputzx.my.id/download?url=${encodeURIComponent(url)}&type=audio&apikey=${APIKEY_YOUTUBE}`);
      data = await res.json();
      attempts++;
      if (data.status === 'error') throw new Error(data.error || 'Server error saat memproses audio.');
    }
  
    if (data.status !== 'completed') {
      throw new Error('Waktu habis, silakan coba lagi.');
    }
  
    return `https://youtubedl.siputzx.my.id${data.fileUrl}`;
}
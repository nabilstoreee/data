import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Download, ChevronLeft, Music, Copy, Share2, Play, Pause, User, Users, Video, Server, Gauge, Zap, Lock, Crown, Check } from 'lucide-react';
import { VideoResultData } from '../types';
import { fetchYouTubeAudio } from '../lib/api';
import { loadUser, isPremiumActive, UserState } from '../lib/user';
import { VideoAdModal } from './VideoAdModal';

function generateCustomFilename(data: VideoResultData, format?: string, ext = 'mp4') {
  const fmt = format || '[Tanggal]_[Penulis]_[Judul]';
  const now = new Date();
  const dateStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
  
  const cleanTitle = (data.title || 'Video')
    .replace(/[\\/:*?"<>|]/g, '')
    .replace(/\s+/g, '_')
    .substring(0, 40);
    
  const cleanAuthor = (data.authorNickname || data.author || 'Creator')
    .replace(/[\\/:*?"<>|]/g, '')
    .replace(/\s+/g, '_');
    
  let result = fmt
    .replace(/\[Tanggal\]/gi, dateStr)
    .replace(/\[Penulis\]/gi, cleanAuthor)
    .replace(/\[Judul\]/gi, cleanTitle)
    .replace(/\[Platform\]/gi, data.platform)
    .replace(/\[ID\]/gi, data.id || 'video');

  if (!result.trim()) result = `video_${cleanAuthor}`;
  return `${result}.${ext}`;
}

interface VideoResultProps {
  data: VideoResultData;
  onBack: () => void;
  settings?: any;
  user?: UserState;
  onUpgradeClick?: () => void;
}

export function VideoResult({ data, onBack, settings, user, onUpgradeClick }: VideoResultProps) {
  const [downloadingAudio, setDownloadingAudio] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [videoLoadError, setVideoLoadError] = useState(false);
  const customFormat = settings?.filenameFormat || '[Tanggal]_[Penulis]_[Judul]';
  const videoRef = useRef<HTMLVideoElement>(null);

  const [showVideoAd, setShowVideoAd] = useState(false);
  const [pendingDownload, setPendingDownload] = useState<{ url: string; filename: string } | null>(null);

  // High-speed download server states
  const [selectedServer, setSelectedServer] = useState<'standard' | 'premium'>('standard');
  const [showHighSpeedLoader, setShowHighSpeedLoader] = useState(false);
  const [highSpeedProgress, setHighSpeedProgress] = useState(0);
  const [highSpeedSpeed, setHighSpeedSpeed] = useState('0 MB/s');

  const isPremium = user ? isPremiumActive(user) : false;

  useEffect(() => {
    if (isPremium) {
      setSelectedServer('premium');
    } else {
      setSelectedServer('standard');
    }
  }, [isPremium]);

  const triggerDownload = (url: string, filename: string) => {
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.target = '_blank';
    link.rel = 'noreferrer';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const startHighSpeedDownload = (url: string, filename: string) => {
    setShowHighSpeedLoader(true);
    setHighSpeedProgress(0);
    setHighSpeedSpeed('0 MB/s');

    // Accelerating speedometer visual intervals
    setTimeout(() => {
      setHighSpeedProgress(12);
      setHighSpeedSpeed('14.2 MB/s');
    }, 200);

    setTimeout(() => {
      setHighSpeedProgress(45);
      setHighSpeedSpeed('61.5 MB/s');
    }, 500);

    setTimeout(() => {
      setHighSpeedProgress(80);
      setHighSpeedSpeed('114.9 MB/s ⚡');
    }, 900);

    setTimeout(() => {
      setHighSpeedProgress(100);
      setHighSpeedSpeed('108.4 MB/s');
    }, 1300);

    setTimeout(() => {
      setShowHighSpeedLoader(false);
      triggerDownload(url, filename);
    }, 1600);
  };

  const initiateDownload = (url: string, filename: string) => {
    const showAds = settings?.showAdsForNonPremium !== false && !isPremium;

    if (showAds) {
      setPendingDownload({ url, filename });
      setShowVideoAd(true);
    } else {
      if (selectedServer === 'premium' && isPremium) {
        startHighSpeedDownload(url, filename);
      } else {
        triggerDownload(url, filename);
      }
    }
  };

  const handleAdCompleted = () => {
    if (pendingDownload) {
      triggerDownload(pendingDownload.url, pendingDownload.filename);
      setPendingDownload(null);
    }
  };

  const handleTogglePlay = async () => {
    const video = videoRef.current;
    if (!video) return;

    if (!video.paused) {
      video.pause();
    } else {
      try {
        await video.play();
      } catch (error) {
        console.error("Play error:", error instanceof Error ? error.message : error);
      }
    }
  };

  const handleDownloadYoutubeAudio = async () => {
    try {
      setDownloadingAudio(true);
      const url = await fetchYouTubeAudio(data.playUrl);
      const filename = generateCustomFilename(data, customFormat, 'mp3');
      initiateDownload(url, filename);
    } catch (e) {
      alert("Gagal mengunduh audio.");
    } finally {
      setDownloadingAudio(false);
    }
  };

  const handleCopyCaption = () => {
    navigator.clipboard.writeText(data.title);
    alert('Caption disalin!');
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({ title: data.title, url: data.playUrl }).catch(() => {});
    } else {
      navigator.clipboard.writeText(data.playUrl);
      alert('Link disalin!');
    }
  };


  return (
    <motion.div 
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="w-full"
    >
      <div className="flex items-center justify-between mb-8 pb-4 border-b border-slate-200 dark:border-slate-800">
        <button 
          onClick={onBack}
          className="text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white flex items-center gap-2 transition-all group font-bold text-sm"
        >
          <ChevronLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
          <span>Kembali</span>
        </button>
        <div className="px-3 py-1 bg-indigo-50 dark:bg-indigo-500/10 border border-indigo-200 dark:border-indigo-500/20 rounded-lg">
          <span className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-widest">
            {settings?.videoBadgeText || data.platform} {data.quality ? ` • ${data.quality}` : ''}
          </span>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl overflow-hidden shadow-lg">
        {data.images && data.images.length > 0 ? (
          <div className="relative bg-slate-100 dark:bg-[#0b0f19] p-4 flex gap-4 overflow-x-auto snap-x scrollbar-none">
            {data.images.map((imgUrl, i) => (
              <div key={i} className="snap-center shrink-0 w-[80%] max-w-[300px] aspect-[3/4] relative rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800">
                <img src={imgUrl} alt={`Slide ${i + 1}`} className="w-full h-full object-cover" />
                <button 
                  onClick={() => initiateDownload(imgUrl, `image_${i+1}.jpg`)}
                  className="absolute bottom-3 right-3 bg-white/90 text-slate-900 p-2 rounded-xl shadow-lg hover:bg-white hover:scale-105 transition-all cursor-pointer"
                  title="Download Image"
                >
                  <Download className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        ) : (
          <div className="relative aspect-video bg-slate-100 dark:bg-[#0b0f19] cursor-pointer" onClick={!videoLoadError ? handleTogglePlay : undefined}>
            {!videoLoadError ? (
              <>
                <video 
                  ref={videoRef}
                  src={data.playUrl || undefined} 
                  poster={data.cover || undefined} 
                  className="w-full h-full object-contain"
                  onPlay={() => setIsPlaying(true)}
                  onPause={() => setIsPlaying(false)}
                  onError={() => setVideoLoadError(true)}
                  playsInline
                />
                {!isPlaying && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/20 backdrop-blur-[2px]">
                    <div className="w-16 h-16 bg-white/90 dark:bg-slate-900/90 rounded-full flex items-center justify-center shadow-2xl">
                      <Play className="w-8 h-8 text-indigo-600 dark:text-indigo-400 ml-1" fill="currentColor" />
                    </div>
                  </div>
                )}
              </>
            ) : (
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-950/90 p-4 text-center select-none overflow-hidden rounded-t-3xl">
                {data.cover && (
                  <img src={data.cover} alt="Video cover" className="absolute inset-0 w-full h-full object-cover opacity-20 blur-sm" />
                )}
                <div className="relative z-10 space-y-2">
                  <div className="w-12 h-12 rounded-full bg-slate-800/80 border border-slate-700 flex items-center justify-center mx-auto text-amber-500 shadow-md">
                    <Video className="w-5 h-5" />
                  </div>
                  <h4 className="text-xs font-bold text-white tracking-wide">Pemutaran Langsung Terbatas</h4>
                  <p className="text-[11px] text-slate-400 max-w-[280px] leading-relaxed mx-auto">
                    Video dilindungi oleh server asal. Gunakan tombol download di bawah untuk menyimpan dan menonton video secara offline.
                  </p>
                </div>
              </div>
            )}
          </div>
        )}

        <div className="p-6">
          <h3 className="text-slate-900 dark:text-slate-100 font-bold text-lg leading-snug mb-2 line-clamp-2">
            {data.title}
          </h3>

          {/* Kartu Profil dengan Statistik Kreator */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm">
            <div className="flex items-center gap-3.5">
              {data.authorAvatar ? (
                <img src={data.authorAvatar} alt={data.author} className="w-12 h-12 rounded-full object-cover border-2 border-indigo-500/50 shadow-sm shrink-0" />
              ) : (
                <div className="w-12 h-12 rounded-full flex items-center justify-center bg-indigo-100 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-400 border-2 border-white dark:border-slate-700 shadow-sm shrink-0">
                  <User className="w-6 h-6" />
                </div>
              )}
              <div className="min-w-0">
                <h4 className="text-slate-900 dark:text-white font-bold text-sm truncate">
                  {data.authorNickname ? `${data.authorNickname} ` : ''}
                  <span className="text-indigo-600 dark:text-indigo-400 font-semibold">@{data.author || 'creator'}</span>
                </h4>
                <p className="text-slate-500 dark:text-slate-400 text-xs mt-0.5 flex items-center gap-1 font-medium">
                  Kreator {data.platform === 'tiktok' ? 'TikTok' : 'YouTube'}
                </p>
              </div>
            </div>

            {/* Statistik Kreator */}
            {(data.authorStats?.followers !== undefined || data.authorStats?.videosCount !== undefined) && (
              <div className="flex items-center justify-around sm:justify-end gap-5 border-t sm:border-t-0 sm:border-l border-slate-200 dark:border-slate-700/60 pt-3 sm:pt-0 sm:pl-5">
                {data.authorStats?.followers !== undefined ? (
                  <div className="text-center sm:text-left">
                    <div className="text-[10px] uppercase tracking-wider font-bold text-slate-400 dark:text-slate-500 flex items-center gap-1 justify-center sm:justify-start">
                      <Users className="w-3 h-3 text-indigo-500" /> Pengikut
                    </div>
                    <div className="font-bold text-sm text-slate-900 dark:text-white mt-0.5">
                      {typeof data.authorStats.followers === 'number' ? data.authorStats.followers.toLocaleString() : data.authorStats.followers}
                    </div>
                  </div>
                ) : null}
                {data.authorStats?.videosCount !== undefined ? (
                  <div className="text-center sm:text-left">
                    <div className="text-[10px] uppercase tracking-wider font-bold text-slate-400 dark:text-slate-500 flex items-center gap-1 justify-center sm:justify-start">
                      <Video className="w-3 h-3 text-emerald-500" /> Video
                    </div>
                    <div className="font-bold text-sm text-slate-900 dark:text-white mt-0.5">
                      {typeof data.authorStats.videosCount === 'number' ? data.authorStats.videosCount.toLocaleString() : data.authorStats.videosCount}
                    </div>
                  </div>
                ) : null}
              </div>
            )}
          </div>



          {data.stats && (
            <div className="grid grid-cols-3 gap-4 mb-6 border-y border-slate-200 dark:border-slate-800/60 py-4">
              <div className="text-center">
                <div className="text-indigo-600 dark:text-indigo-400 text-[10px] uppercase tracking-widest font-bold mb-1">Likes</div>
                <div className="text-slate-900 dark:text-slate-100 font-bold text-lg">{data.stats.likes?.toLocaleString() || '0'}</div>
              </div>
              <div className="text-center">
                <div className="text-indigo-600 dark:text-indigo-400 text-[10px] uppercase tracking-widest font-bold mb-1">Shares</div>
                <div className="text-slate-900 dark:text-slate-100 font-bold text-lg">{data.stats.shares?.toLocaleString() || '0'}</div>
              </div>
              <div className="text-center">
                <div className="text-indigo-600 dark:text-indigo-400 text-[10px] uppercase tracking-widest font-bold mb-1">Views</div>
                <div className="text-slate-900 dark:text-slate-100 font-bold text-lg">{data.stats.views?.toLocaleString() || '0'}</div>
              </div>
            </div>
          )}

          {/* Konfigurasi Server Unduhan */}
          <div className="mb-6 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0d121f]">
            <h4 className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-3 flex items-center gap-2">
              <Server className="w-4 h-4 text-indigo-500" /> Server Unduhan
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Server Standard */}
              <button
                onClick={() => setSelectedServer('standard')}
                className={`p-3 rounded-xl border text-left transition-all relative ${
                  selectedServer === 'standard'
                    ? 'border-indigo-500 bg-indigo-50/10 dark:bg-indigo-500/5'
                    : 'border-slate-100 dark:border-slate-800/80 hover:bg-slate-50 dark:hover:bg-slate-900/30'
                }`}
              >
                <div className="flex items-center gap-2">
                  <span className={`w-2.5 h-2.5 rounded-full ${selectedServer === 'standard' ? 'bg-indigo-500 animate-pulse' : 'bg-slate-300 dark:bg-slate-700'}`}></span>
                  <span className="text-xs font-bold text-slate-800 dark:text-slate-200">Server Reguler</span>
                </div>
                <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-1 pl-4.5">
                  Gratis • Kecepatan Normal (~2.5 MB/s)
                </p>
              </button>

              {/* Server Premium */}
              <button
                onClick={() => {
                  if (!isPremium) {
                    if (onUpgradeClick) onUpgradeClick();
                  } else {
                    setSelectedServer('premium');
                  }
                }}
                className={`p-3 rounded-xl border text-left transition-all relative ${
                  selectedServer === 'premium'
                    ? 'border-emerald-500 bg-emerald-50/10 dark:bg-emerald-500/5'
                    : 'border-slate-100 dark:border-slate-800/80 hover:bg-slate-50 dark:hover:bg-slate-900/30'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className={`w-2.5 h-2.5 rounded-full ${selectedServer === 'premium' ? 'bg-emerald-500 animate-pulse' : 'bg-slate-300 dark:bg-slate-700'}`}></span>
                    <span className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1">
                      Dedicated Server <Zap className="w-3 h-3 text-emerald-500 fill-emerald-500" />
                    </span>
                  </div>
                  {isPremium ? (
                    <span className="text-[9px] font-black bg-emerald-500/15 text-emerald-500 px-1.5 py-0.5 rounded-md uppercase tracking-wider">
                      Aktif
                    </span>
                  ) : (
                    <span className="text-[9px] font-bold bg-indigo-500/10 text-indigo-500 dark:text-indigo-400 px-1.5 py-0.5 rounded-md flex items-center gap-0.5">
                      <Lock className="w-2.5 h-2.5" /> Lock
                    </span>
                  )}
                </div>
                <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-1 pl-4.5">
                  Premium • Kecepatan 10x (~25.0 MB/s)
                </p>
              </button>
            </div>
          </div>

          <div className="space-y-4">
            {data.platform === 'tiktok' && (
              <div className="flex gap-4 mb-6 overflow-x-auto pb-2 scrollbar-none">
                <button 
                  onClick={handleCopyCaption}
                  className="flex-1 min-w-[120px] bg-slate-50 dark:bg-slate-800/50 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700/50 rounded-xl py-3 text-sm font-semibold text-slate-700 dark:text-slate-300 transition-all flex items-center justify-center gap-2"
                >
                  <Copy className="w-4 h-4" /> Copy Caption
                </button>
                <button 
                  onClick={handleShare}
                  className="flex-1 min-w-[120px] bg-slate-50 dark:bg-slate-800/50 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700/50 rounded-xl py-3 text-sm font-semibold text-slate-700 dark:text-slate-300 transition-all flex items-center justify-center gap-2"
                >
                  <Share2 className="w-4 h-4" /> Bagikan
                </button>
              </div>
            )}

            {!(data.images && data.images.length > 0) && (
              <motion.button
                onClick={() => initiateDownload(data.playUrl, generateCustomFilename(data, customFormat, 'mp4'))}
                whileHover={{ scale: 1.03 }}
                animate={{ scale: [1, 1.015, 1] }}
                transition={{ repeat: Infinity, duration: 1.8, ease: "easeInOut" }}
                className="block w-full bg-slate-900 text-white dark:bg-white dark:text-black font-bold text-sm py-4 rounded-full text-center flex items-center justify-center gap-2.5 hover:bg-slate-800 dark:hover:bg-slate-200 transition-all shadow-xl dark:shadow-[0_0_20px_rgba(255,255,255,0.15)] cursor-pointer"
              >
                <Download className="w-4 h-4" />
                Download Video HD {data.platform === 'tiktok' ? '(No Watermark)' : ''}
              </motion.button>
            )}

            {data.musicUrl && data.platform === 'tiktok' && (
              <button 
                onClick={() => initiateDownload(data.musicUrl!, generateCustomFilename(data, customFormat, 'mp3'))}
                className="block w-full bg-slate-50 dark:bg-slate-800/50 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700/50 text-slate-700 dark:text-slate-300 font-semibold text-sm py-3.5 rounded-full text-center transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <Music className="w-4 h-4" /> Download Audio (MP3)
              </button>
            )}

            {data.platform === 'youtube' && (
              <button 
                onClick={handleDownloadYoutubeAudio}
                disabled={downloadingAudio}
                className="w-full bg-slate-50 dark:bg-slate-800/50 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700/50 text-slate-700 dark:text-slate-300 font-semibold text-sm py-3.5 rounded-full text-center transition-all flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
              >
                <Music className="w-4 h-4" /> 
                {downloadingAudio ? 'Memproses Audio...' : 'Download Audio (MP3)'}
              </button>
            )}

            {data.watermarkUrl && data.platform === 'tiktok' && !(data.images && data.images.length > 0) && (
              <button 
                onClick={() => initiateDownload(data.watermarkUrl!, generateCustomFilename(data, customFormat + '_WM', 'mp4'))}
                className="block w-full bg-indigo-50 dark:bg-indigo-500/10 hover:bg-indigo-100 dark:hover:bg-indigo-500/20 border border-indigo-200 dark:border-indigo-500/30 text-indigo-600 dark:text-indigo-400 font-bold text-sm py-3.5 rounded-full text-center transition-all flex items-center justify-center gap-2 mt-2 cursor-pointer"
              >
                <Download className="w-4 h-4" /> Download dengan Watermark
              </button>
            )}
          </div>
        </div>
      </div>

      <VideoAdModal 
        isOpen={showVideoAd} 
        onClose={() => setShowVideoAd(false)} 
        onAdCompleted={handleAdCompleted} 
      />

      <AnimatePresence>
        {showHighSpeedLoader && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-50 flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.9, y: 15 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 15 }}
              className="bg-white dark:bg-[#0b0f19] border border-slate-200 dark:border-slate-800 rounded-3xl p-6 w-full max-w-sm text-center shadow-2xl relative overflow-hidden"
            >
              <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-emerald-500 to-teal-500" />
              
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center mx-auto mb-4 animate-bounce">
                <Gauge className="w-6 h-6" />
              </div>
              
              <h3 className="text-slate-900 dark:text-white font-black text-base tracking-tight">
                High-Speed Server Unduhan
              </h3>
              <p className="text-xs text-slate-400 dark:text-slate-500 mt-1 max-w-[240px] mx-auto leading-relaxed">
                Menyalurkan data melalui Dedicated Premium Link (Multi-Threaded)
              </p>

              {/* Speedometer dial simulation */}
              <div className="relative w-40 h-40 mx-auto my-6 flex items-center justify-center">
                <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                  {/* Background circle */}
                  <circle
                    cx="50"
                    cy="50"
                    r="40"
                    stroke="currentColor"
                    strokeWidth="6"
                    fill="transparent"
                    className="text-slate-100 dark:text-slate-800"
                  />
                  {/* Foreground progress circle */}
                  <motion.circle
                    cx="50"
                    cy="50"
                    r="40"
                    stroke="url(#speedometerGradient)"
                    strokeWidth="8"
                    strokeDasharray="251.2"
                    strokeDashoffset={251.2 - (251.2 * highSpeedProgress) / 100}
                    strokeLinecap="round"
                    fill="transparent"
                    transition={{ duration: 0.1 }}
                  />
                  <defs>
                    <linearGradient id="speedometerGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#10b981" />
                      <stop offset="100%" stopColor="#06b6d4" />
                    </linearGradient>
                  </defs>
                </svg>
                
                {/* Speed value text */}
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-2xl font-black text-slate-900 dark:text-white font-mono tracking-tight">
                    {highSpeedProgress}%
                  </span>
                  <span className="text-xs font-extrabold text-emerald-500 font-mono mt-0.5 animate-pulse">
                    {highSpeedSpeed}
                  </span>
                </div>
              </div>

              <div className="p-3 bg-slate-50 dark:bg-slate-900/40 rounded-2xl border border-slate-100 dark:border-slate-800/80 text-left space-y-1 text-[10px] text-slate-400 dark:text-slate-500">
                <div className="flex justify-between">
                  <span>Node ID:</span>
                  <span className="font-mono text-slate-700 dark:text-slate-300 font-bold">PREMIUM-SG-01</span>
                </div>
                <div className="flex justify-between">
                  <span>Protokol:</span>
                  <span className="text-emerald-500 font-extrabold">SSL Multi-Channel (10x Speed)</span>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

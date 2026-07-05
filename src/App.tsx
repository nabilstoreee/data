import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ClipboardPaste, Loader2, Play, Menu } from 'lucide-react';
import { fetchTikTok, fetchYouTube } from './lib/api';
import { VideoResultData } from './types';
import { VideoResult } from './components/VideoResult';
import { addHistory } from './lib/history';
import { getSettings, saveSettings } from './lib/settings';
import { HistoryPanel, InfoPanel, AdminPanel, SidebarMenu, RatingPanel } from './components/Panels';

type Platform = 'tiktok' | 'youtube';

const FlipClockUnit = ({ label, value }: { label: string; value: number }) => {
  return (
    <div className="flex flex-col items-center">
      <div className="relative w-16 h-20 bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-[0_8px_16px_-6px_rgba(0,0,0,0.5)] flex items-center justify-center">
        {/* Horizontal divider line for authentic flip clock look */}
        <div className="absolute top-1/2 left-0 right-0 h-[1px] bg-black/50 z-10" />
        <div className="absolute top-0 left-0 right-0 bottom-1/2 bg-white/5 z-10 pointer-events-none" />
        
        <AnimatePresence mode="popLayout">
          <motion.span
            key={value}
            initial={{ y: 20, opacity: 0, rotateX: -90 }}
            animate={{ y: 0, opacity: 1, rotateX: 0 }}
            exit={{ y: -20, opacity: 0, rotateX: 90 }}
            transition={{ duration: 0.3, type: "spring", bounce: 0 }}
            className="absolute text-4xl font-mono font-bold text-amber-500"
            style={{ transformStyle: 'preserve-3d' }}
          >
            {value.toString().padStart(2, '0')}
          </motion.span>
        </AnimatePresence>
      </div>
      <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest mt-2">{label}</span>
    </div>
  );
};

export default function App() {
  const [platform, setPlatform] = useState<Platform>('tiktok');
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState<VideoResultData | null>(null);
  const [ytQuality, setYtQuality] = useState('1080p');

  const [settings, setSettings] = useState(getSettings());
  
  useEffect(() => {
    document.title = `${settings.brandTitle} - Video Downloader`;
    let metaKeywords = document.querySelector('meta[name="keywords"]');
    if (!metaKeywords) {
      metaKeywords = document.createElement('meta');
      metaKeywords.setAttribute('name', 'keywords');
      document.head.appendChild(metaKeywords);
    }
    metaKeywords.setAttribute('content', settings.seoKeywords);
  }, [settings]);
  
  const [showHistory, setShowHistory] = useState(false);
  const [showAdmin, setShowAdmin] = useState(false);
  const [showInfo, setShowInfo] = useState(false);
  const [showRating, setShowRating] = useState(false);
  const [showSidebar, setShowSidebar] = useState(false);

  const [remainingTime, setRemainingTime] = useState<{h: number, m: number, s: number} | null>(null);

  useEffect(() => {
    if (!settings.maintenanceMode || !settings.maintenanceEndTime) {
      setRemainingTime(null);
      return;
    }
    const updateCountdown = () => {
      const remain = settings.maintenanceEndTime! - Date.now();
      if (remain <= 0) {
        setRemainingTime({h: 0, m: 0, s: 0});
      } else {
        const h = Math.floor(remain / 3600000);
        const m = Math.floor((remain % 3600000) / 60000);
        const s = Math.floor((remain % 60000) / 1000);
        setRemainingTime({h, m, s});
      }
    };
    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);
    return () => clearInterval(interval);
  }, [settings.maintenanceMode, settings.maintenanceEndTime]);

  const [isDark, setIsDark] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('theme');
      if (saved !== null) return saved === 'dark';
    }
    return true;
  });

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [isDark]);

  const getPlatformColors = (p: Platform) => {
    switch (p) {
      case 'tiktok': return 'bg-slate-900 text-white dark:bg-white dark:text-black shadow-[0_0_20px_rgba(0,0,0,0.1)] dark:shadow-[0_0_20px_rgba(255,255,255,0.15)]';
      case 'youtube': return 'bg-slate-900 text-white dark:bg-white dark:text-black shadow-[0_0_20px_rgba(0,0,0,0.1)] dark:shadow-[0_0_20px_rgba(255,255,255,0.15)]';
      default: return 'bg-slate-900 text-white dark:bg-white dark:text-black shadow-[0_0_20px_rgba(0,0,0,0.1)] dark:shadow-[0_0_20px_rgba(255,255,255,0.15)]';
    }
  };

  const getBrandDetails = (p: Platform) => {
    switch (p) {
      case 'tiktok': return { name: settings.brandTitle, desc: settings.brandDesc };
      case 'youtube': return { name: settings.youtubeBrandTitle, desc: settings.youtubeBrandDesc };
      default: return { name: `Save${p.charAt(0).toUpperCase() + p.slice(1)}`, desc: `Download Video ${p.charAt(0).toUpperCase() + p.slice(1)}` };
    }
  };

  const getPlaceholder = (p: Platform) => {
    switch (p) {
      case 'tiktok': return settings.tiktokPlaceholder;
      case 'youtube': return settings.youtubePlaceholder;
      default: return `Tempel link ${p} di sini...`;
    }
  };

  const handleTabSwitch = (newPlatform: Platform) => {
    setPlatform(newPlatform);
    setUrl('');
    setError('');
    setResult(null);
  };

  const handlePaste = async () => {
    try {
      const text = await navigator.clipboard.readText();
      if (text) setUrl(text);
    } catch (err) {
      setError('Gagal membaca clipboard. Berikan izin atau paste manual.');
    }
  };

  const handleDownload = async () => {
    if (!url.trim()) {
      setError('Masukkan link video terlebih dahulu!');
      return;
    }
    setError('');
    setLoading(true);

    try {
      let data: VideoResultData | null = null;
      if (platform === 'tiktok') {
        data = await fetchTikTok(url.trim());
      } else if (platform === 'youtube') {
        data = await fetchYouTube(url.trim(), ytQuality !== '1080p' ? ytQuality : undefined);
      }
      
      if (data) {
        if (settings.enableHistory !== false) {
          addHistory(data);
        }
        setResult(data);
      }
    } catch (err: any) {
      setError(err.message || 'Terjadi kesalahan. Silakan coba lagi.');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveSettings = (newSettings: any) => {
    saveSettings(newSettings);
    setSettings(newSettings);
  };

  const brand = getBrandDetails(platform);
  const colors = getPlatformColors(platform);

  if (settings.maintenanceMode) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-[#0b0f19] flex items-center justify-center p-4">
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[2rem] p-8 max-w-md w-full text-center shadow-xl relative">
          <div className="w-20 h-20 bg-amber-500/10 text-amber-500 mx-auto rounded-[1.5rem] flex items-center justify-center mb-6">
            <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">{settings.maintenanceTitle || 'Maintenance'}</h2>
          <p className="text-slate-600 dark:text-slate-400 mb-6">{settings.maintenanceMessage}</p>
          {settings.maintenanceEndTime && remainingTime && (
            <div className="flex justify-center gap-3 sm:gap-4 mb-8">
              <FlipClockUnit label="Jam" value={remainingTime.h} />
              <div className="flex flex-col items-center justify-center -mt-6">
                <div className="w-1.5 h-1.5 rounded-full bg-slate-300 dark:bg-slate-700 mb-2" />
                <div className="w-1.5 h-1.5 rounded-full bg-slate-300 dark:bg-slate-700" />
              </div>
              <FlipClockUnit label="Menit" value={remainingTime.m} />
              <div className="flex flex-col items-center justify-center -mt-6">
                <div className="w-1.5 h-1.5 rounded-full bg-slate-300 dark:bg-slate-700 mb-2" />
                <div className="w-1.5 h-1.5 rounded-full bg-slate-300 dark:bg-slate-700" />
              </div>
              <FlipClockUnit label="Detik" value={remainingTime.s} />
            </div>
          )}
          <div className="flex justify-center">
            <button 
              onClick={() => setShowAdmin(true)}
              className="text-xs font-medium text-slate-400 dark:text-slate-500 hover:text-indigo-500 dark:hover:text-indigo-400 transition-colors"
            >
              Akses Admin Panel
            </button>
          </div>
        </div>
        <AdminPanel isOpen={showAdmin} onClose={() => setShowAdmin(false)} settings={settings} onSave={handleSaveSettings} />
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4 sm:p-8 font-sans flex items-center justify-center relative overscroll-none transition-colors duration-300">
      {settings.emergencyBannerActive && (
        <div className="absolute top-0 left-0 right-0 bg-red-500 text-white px-4 py-2 text-center text-sm font-medium z-50 shadow-md">
          🚨 {settings.emergencyBannerMessage}
        </div>
      )}
      <div className="fixed inset-0 z-[-1] pointer-events-none">
        <div className="absolute top-10 left-10 w-[300px] h-[300px] bg-indigo-500/10 rounded-full blur-[100px] mix-blend-screen" />
        <div className="absolute bottom-10 right-10 w-[300px] h-[300px] bg-slate-500/10 rounded-full blur-[100px] mix-blend-screen" />
      </div>

      <div className="fixed top-6 right-6 sm:top-8 sm:right-8 z-40 flex items-center gap-4">
        {settings.announcement && (
          <div className="hidden sm:flex bg-amber-500/10 border border-amber-500/20 text-amber-600 dark:text-amber-400 px-4 py-2 rounded-full text-sm font-bold shadow-lg backdrop-blur-md">
            📢 {settings.announcement}
          </div>
        )}
        <button 
          onClick={() => setShowSidebar(true)} 
          className="w-12 h-12 rounded-full border border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm flex items-center justify-center text-slate-500 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all shadow-xl hover:scale-105"
        >
          <Menu className="w-5 h-5" />
        </button>
      </div>

      {settings.announcement && (
        <div className="fixed top-4 left-4 right-20 sm:hidden z-40">
          <div className="bg-amber-500/10 border border-amber-500/20 text-amber-600 dark:text-amber-400 px-4 py-3 rounded-2xl text-[11px] font-bold shadow-lg backdrop-blur-md text-center line-clamp-2">
            📢 {settings.announcement}
          </div>
        </div>
      )}

      <div className="w-full max-w-2xl relative z-10 pt-16 sm:pt-0">
        <div className="flex flex-wrap p-1.5 gap-1.5 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md rounded-3xl border border-slate-200 dark:border-slate-800 mb-8 mx-auto max-w-xl justify-center items-center">
          {(['tiktok', 'youtube'] as Platform[]).map((p) => (
            <button
              key={p}
              onClick={() => handleTabSwitch(p)}
              className={`flex-1 min-w-[30%] sm:min-w-[0] py-2.5 px-3 rounded-2xl text-xs sm:text-sm font-semibold transition-all capitalize flex gap-2 items-center justify-center ${
                platform === p 
                  ? 'bg-indigo-50 dark:bg-slate-800/80 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-500/30 shadow-sm' 
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800/40'
              }`}
            >
              <div className={`w-1.5 h-1.5 rounded-full ${platform === p ? 'bg-indigo-500' : 'bg-slate-300 dark:bg-slate-600'}`}></div>
              {p}
            </button>
          ))}
        </div>

        <div className="glass p-6 sm:p-10 rounded-[2.5rem] relative overflow-hidden bg-white/80 dark:bg-[#121212]/80 backdrop-blur-3xl transition-colors duration-300">
          <AnimatePresence mode="wait">
            {!result ? (
              <motion.div 
                key="input-section"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
              >
                <header className="text-center mb-10">
                  <div className="mb-4">
                    <div className="w-16 h-16 rounded-[1rem] bg-indigo-500 flex items-center justify-center mx-auto shadow-[0_0_15px_rgba(99,102,241,0.5)]">
                      <span className="text-3xl font-bold text-white leading-none">S</span>
                    </div>
                  </div>
                  <h1 className="text-4xl sm:text-5xl font-bold tracking-tight mb-3 text-slate-900 dark:text-slate-100">
                    {brand.name}
                  </h1>
                  <p className="text-xs text-indigo-600 dark:text-indigo-400 uppercase tracking-widest font-bold">{brand.desc}</p>
                </header>

                <div className="space-y-6">
                    <div className="relative group">
                      <input
                        type="text"
                        value={url}
                        onChange={(e) => setUrl(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleDownload()}
                        placeholder={getPlaceholder(platform)}
                        className={`w-full pl-6 pr-32 py-4 rounded-xl bg-slate-50 dark:bg-[#0b0f19] border ${error ? 'border-red-500/50' : 'border-slate-200 dark:border-slate-800 hover:border-indigo-300 dark:hover:border-indigo-500/30 text-slate-900 dark:text-slate-100'} focus:border-indigo-500 focus:outline-none transition-all placeholder-slate-400 dark:placeholder-slate-500 text-sm`}
                      />
                      <button 
                        onClick={handlePaste}
                        className="absolute right-2 top-1/2 -translate-y-1/2 px-4 py-2 rounded-lg bg-indigo-50 dark:bg-indigo-500/10 hover:bg-indigo-100 dark:hover:bg-indigo-500/20 border border-indigo-200 dark:border-indigo-500/20 text-indigo-600 dark:text-indigo-400 text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-2"
                      >
                        <ClipboardPaste className="w-3.5 h-3.5" /> Tempel
                      </button>
                    </div>

                    {error && (
                      <motion.div 
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-red-400 text-sm font-medium px-4 py-3 bg-red-500/10 border border-red-500/20 rounded-xl"
                      >
                        {error}
                      </motion.div>
                    )}

                    {platform === 'youtube' && (
                      <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="flex flex-wrap gap-2 justify-center py-2">
                        <span className="w-full text-center text-xs font-bold text-slate-400 mb-1">Pilih Resolusi:</span>
                        {['144p', '360p', '720p', '1080p'].map(q => (
                          <button
                            key={q}
                            onClick={() => setYtQuality(q)}
                            className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all ${
                              ytQuality === q 
                                ? 'bg-red-500 text-white shadow-md shadow-red-500/25 scale-105' 
                                : 'bg-slate-100 dark:bg-slate-800/60 text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
                            }`}
                          >
                            {q}
                          </button>
                        ))}
                      </motion.div>
                    )}

                    <button 
                      onClick={handleDownload}
                      disabled={loading || !url}
                      className={`w-full ${colors} font-bold text-sm py-4 rounded-full flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed hover:opacity-90 transition-all`}
                    >
                      {loading ? (
                        <>
                          <Loader2 className="w-5 h-5 animate-spin" /> Memproses...
                        </>
                      ) : (
                        <>
                          Download Video <Play className="w-5 h-5 fill-current" />
                        </>
                      )}
                    </button>
                  </div>
              </motion.div>
            ) : (
              <motion.div key="result-section">
                <VideoResult data={result} onBack={() => setResult(null)} settings={settings} />
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <footer className="mt-12 p-6 border-t border-slate-200 dark:border-slate-800 text-center">
          <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">
            © {new Date().getFullYear()} {settings.brandTitle} • {settings.footerText}
          </p>
        </footer>
      </div>

      <SidebarMenu 
        isOpen={showSidebar}
        onClose={() => setShowSidebar(false)}
        onOpenHistory={() => setShowHistory(true)}
        onOpenAdmin={() => setShowAdmin(true)}
        onOpenInfo={() => setShowInfo(true)}
        onOpenRating={() => setShowRating(true)}
        isDark={isDark}
        setIsDark={setIsDark}
        settings={settings}
      />

      <HistoryPanel isOpen={showHistory} onClose={() => setShowHistory(false)} />
      <AdminPanel isOpen={showAdmin} onClose={() => setShowAdmin(false)} settings={settings} onSave={handleSaveSettings} />
      <InfoPanel isOpen={showInfo} onClose={() => setShowInfo(false)} settings={settings} />
      <RatingPanel isOpen={showRating} onClose={() => setShowRating(false)} />
    </div>
  );
}

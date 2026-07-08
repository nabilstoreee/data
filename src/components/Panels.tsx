import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { t, getLang, setLang } from '../lib/i18n';
import { X, Trash2, Download, LogIn, Save, Shield, Info, History, ChevronLeft, ChevronRight, Sun, Moon, Star, User, Zap, Check, Code, Github, Instagram, Youtube, Send, MessageCircle, Music, HelpCircle, AlertCircle, Sparkles, Bell, FileText, CheckCircle2, Globe, Plus, Eye, EyeOff, Activity, Cpu, Wifi, Loader2 } from 'lucide-react';
import { VideoResultData } from '../types';
import { getHistory, clearHistory, removeHistoryItem } from '../lib/history';
import { SiteSettings } from '../lib/settings';
import { loadUser, ActivityLog, getRegisteredUsers, saveRegisteredUsers, getBannedEmails, saveBannedEmails, getBannedIps, saveBannedIps, BlacklistItem, getSimulatedIp, BAN_DURATIONS, savePaymentRequests, removePaymentRequest, initializeFirestoreSync } from '../lib/user';
import { BrandAd, MOCK_VIDEO_ADS, getAdsFromFirestore, saveAdToFirestore, deleteAdFromFirestore, resetAdsToDefaultFirestore } from '../lib/adsDb';

// Common Modal Backdrop
function Modal({ isOpen, onClose, title, children, size = 'md' }: any) {
  const sizeClasses = {
    md: 'max-w-md',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl'
  }[size] || 'max-w-md';

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.95, y: 20, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            exit={{ scale: 0.95, y: 20, opacity: 0 }}
            className={`bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 sm:p-8 rounded-[2rem] ${sizeClasses} w-full relative shadow-2xl max-h-[85vh] overflow-y-auto`}
            onClick={e => e.stopPropagation()}
          >
            <button
              onClick={onClose}
              className="absolute top-4 right-4 p-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-indigo-500/20 rounded-xl text-slate-500 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-6 px-2">{title}</h2>
            {children}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export function HistoryPanel({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const [hist, setHist] = useState<VideoResultData[]>([]);

  useEffect(() => {
    if (isOpen) setHist(getHistory());
  }, [isOpen]);

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    clearHistory();
    setHist([]);
  };

  const handleRemove = (e: React.MouseEvent, id: string | number) => {
    e.stopPropagation();
    e.preventDefault();
    removeHistoryItem(id);
    setHist(getHistory());
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={t('Riwayat Download')}>
      {hist.length > 0 && (
        <button onClick={handleClear} className="mb-4 text-xs font-bold text-red-600 dark:text-red-400 hover:text-red-500 dark:hover:text-red-300 bg-red-50 dark:bg-red-500/10 px-3 py-1.5 rounded-lg transition-colors">
          Hapus Semua
        </button>
      )}
      <div className="space-y-3">
        {hist.length === 0 ? (
          <p className="text-slate-500 text-sm text-center py-8">Belum ada riwayat download.</p>
        ) : (
          hist.map(item => (
            <div key={item.id} className="flex gap-3 bg-slate-50 dark:bg-slate-800/40 p-3 rounded-xl border border-slate-200 dark:border-slate-800">
              <div className="w-16 h-16 bg-slate-200 dark:bg-[#0b0f19] rounded-lg overflow-hidden flex-shrink-0">
                <img src={item.cover || undefined} alt={item.title} className="w-full h-full object-cover opacity-80" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-slate-800 dark:text-slate-200 line-clamp-2 leading-snug">{item.title}</p>
                <p className="text-[10px] text-slate-500 mt-1">{item.date}</p>
              </div>
              <div className="flex flex-col gap-2">
                <a href={item.playUrl} download className="p-1.5 bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 rounded-lg hover:bg-indigo-100 dark:hover:bg-indigo-500/20 text-center">
                  <Download className="w-4 h-4 mx-auto" />
                </a>
                <button onClick={(e) => handleRemove(e, item.id)} className="p-1.5 bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 rounded-lg hover:bg-red-100 dark:hover:bg-red-500/20 text-center">
                  <Trash2 className="w-4 h-4 mx-auto" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </Modal>
  );
}

export function InfoPanel({ isOpen, onClose, settings }: { isOpen: boolean; onClose: () => void, settings: SiteSettings }) {
  const features = settings.infoFeatures.split(',').map(s => s.trim()).filter(Boolean);
  const techStack = settings.infoTechStack.split(',').map(s => s.trim()).filter(Boolean);

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Informasi">
      <div className="text-center mb-8">
        <div className="w-20 h-20 bg-indigo-500 mx-auto rounded-[1.5rem] shadow-[0_0_20px_rgba(99,102,241,0.5)] flex items-center justify-center mb-4 text-white font-bold text-4xl">
          {settings.infoProfileName.charAt(0).toUpperCase()}
        </div>
        <h3 className="text-2xl font-bold text-slate-900 dark:text-slate-100">{settings.infoProfileName}</h3>
        <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">{settings.infoProfileRole}</p>
      </div>
      
      <div className="space-y-8">
        {/* TENTANG WEBSITE */}
        <div>
          <h4 className="text-xs font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-widest flex items-center gap-2 mb-4">
            Tentang Website
            <div className="h-px bg-slate-200 dark:bg-slate-800 flex-1"></div>
          </h4>
          
          <div className="bg-slate-50 dark:bg-[#121212] p-4 rounded-2xl border border-slate-200 dark:border-slate-800 mb-4 flex items-start gap-4">
            <div className="w-12 h-12 bg-slate-200 dark:bg-[#1e1e1e] flex items-center justify-center rounded-xl flex-shrink-0 text-indigo-500">
               <Zap className="w-6 h-6 fill-current" />
            </div>
            <div>
              <h5 className="font-bold text-slate-900 dark:text-white mb-1">{settings.brandTitle}</h5>
              <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">{settings.infoAboutText}</p>
            </div>
          </div>
          
          {features.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {features.map((feat, i) => (
                <div key={i} className="flex items-center gap-2 px-3 py-1.5 bg-slate-50 dark:bg-[#1e1e1e] border border-slate-200 dark:border-slate-800 rounded-lg text-sm text-indigo-600 dark:text-indigo-400 font-medium">
                  <Check className="w-3.5 h-3.5" />
                  <span className="text-slate-700 dark:text-slate-300">{feat}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* DEVELOPER */}
        <div>
          <h4 className="text-xs font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-widest flex items-center gap-2 mb-4">
            Developer
            <div className="h-px bg-slate-200 dark:bg-slate-800 flex-1"></div>
          </h4>
          
          <div className="bg-slate-50 dark:bg-[#121212] p-4 rounded-2xl border border-slate-200 dark:border-slate-800 mb-4 flex items-start gap-4">
            <div className="w-12 h-12 bg-slate-200 dark:bg-[#1e1e1e] flex items-center justify-center rounded-xl flex-shrink-0 text-blue-500">
               <User className="w-6 h-6 fill-current" />
            </div>
            <div>
              <h5 className="font-bold text-slate-900 dark:text-white mb-1">{settings.infoDevName}</h5>
              <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">{settings.infoDevDesc}</p>
            </div>
          </div>

          <div className="flex flex-wrap gap-3">
             {settings.infoSocialGithub && (
                <a href={settings.infoSocialGithub} target="_blank" rel="noreferrer" className="w-10 h-10 rounded-xl bg-slate-50 dark:bg-[#1e1e1e] border border-slate-200 dark:border-slate-800 flex items-center justify-center text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors">
                   <Github className="w-4 h-4" />
                </a>
             )}
             {settings.infoSocialTelegram && (
                <a href={settings.infoSocialTelegram} target="_blank" rel="noreferrer" className="w-10 h-10 rounded-xl bg-slate-50 dark:bg-[#1e1e1e] border border-slate-200 dark:border-slate-800 flex items-center justify-center text-slate-600 dark:text-slate-400 hover:bg-blue-500 hover:text-white transition-colors">
                   <Send className="w-4 h-4" />
                </a>
             )}
             {settings.infoSocialInstagram && (
                <a href={settings.infoSocialInstagram} target="_blank" rel="noreferrer" className="w-10 h-10 rounded-xl bg-slate-50 dark:bg-[#1e1e1e] border border-slate-200 dark:border-slate-800 flex items-center justify-center text-slate-600 dark:text-slate-400 hover:bg-pink-500 hover:text-white transition-colors">
                   <Instagram className="w-4 h-4" />
                </a>
             )}
             {settings.infoSocialYoutube && (
                <a href={settings.infoSocialYoutube} target="_blank" rel="noreferrer" className="w-10 h-10 rounded-xl bg-slate-50 dark:bg-[#1e1e1e] border border-slate-200 dark:border-slate-800 flex items-center justify-center text-slate-600 dark:text-slate-400 hover:bg-red-500 hover:text-white transition-colors">
                   <Youtube className="w-4 h-4" />
                </a>
             )}
             {settings.infoSocialWhatsapp && (
                <a href={settings.infoSocialWhatsapp} target="_blank" rel="noreferrer" className="w-10 h-10 rounded-xl bg-slate-50 dark:bg-[#1e1e1e] border border-slate-200 dark:border-slate-800 flex items-center justify-center text-slate-600 dark:text-slate-400 hover:bg-green-500 hover:text-white transition-colors">
                   <MessageCircle className="w-4 h-4" />
                </a>
             )}
             {settings.infoSocialTiktok && (
                <a href={settings.infoSocialTiktok} target="_blank" rel="noreferrer" className="w-10 h-10 rounded-xl bg-slate-50 dark:bg-[#1e1e1e] border border-slate-200 dark:border-slate-800 flex items-center justify-center text-slate-600 dark:text-slate-400 hover:bg-black hover:border-black hover:text-white transition-colors dark:hover:bg-white dark:hover:text-black">
                   <Music className="w-4 h-4" />
                </a>
             )}
          </div>
        </div>

        {/* TEKNOLOGI */}
        {techStack.length > 0 && (
          <div>
            <h4 className="text-xs font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-widest flex items-center gap-2 mb-4">
              Teknologi
              <div className="h-px bg-slate-200 dark:bg-slate-800 flex-1"></div>
            </h4>
            <div className="flex flex-wrap gap-3">
              {techStack.map((tech, i) => (
                <div key={i} className="flex items-center gap-2 px-3 py-2 bg-slate-50 dark:bg-[#1e1e1e] border border-slate-200 dark:border-slate-800 rounded-xl text-sm font-medium">
                  <Code className="w-3.5 h-3.5 text-blue-500" />
                  <span className="text-slate-700 dark:text-slate-300">{tech}</span>
                </div>
              ))}
            </div>
          </div>
        )}


      </div>
    </Modal>
  );
}

export function AdminPanel({ isOpen, onClose, settings, onSave }: { isOpen: boolean; onClose: () => void, settings: SiteSettings, onSave: (s: SiteSettings) => void }) {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState('');
  const [pass, setPass] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);

  const [form, setForm] = useState(settings);
  const [activeTab, setActiveTab] = useState<'settings' | 'users' | 'blacklist' | 'logs' | 'payments_queue' | 'payments_settings' | 'security_status' | 'ads'>('settings');
  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [showClearConfirm, setShowClearConfirm] = useState(false);

  // Custom Ads Management States
  const [customAds, setCustomAds] = useState<BrandAd[]>([]);
  const [isEditingAd, setIsEditingAd] = useState(false);
  const [isAddingAd, setIsAddingAd] = useState(false);
  const [adForm, setAdForm] = useState<Partial<BrandAd>>({
    id: '',
    title: '',
    desc: '',
    sponsor: '',
    domain: '',
    videoUrl: '',
    ctaText: 'KUNJUNGI SEKARANG',
    ctaUrl: '',
    logoEmoji: '🎯',
    logoBg: 'bg-indigo-600',
    accentBg: 'bg-indigo-600 hover:bg-indigo-700 focus:ring-indigo-500/50',
    accentText: 'text-indigo-600',
    duration: 5,
    category: 'Sponsor',
    rating: '4.8 ★',
    downloads: '1M+ Unduhan',
    tagline: 'Kualitas Premium & Keamanan Terjamin'
  });

  // Load custom ads dynamically from Firestore when AdminPanel is opened
  useEffect(() => {
    if (isOpen) {
      const fetchAds = async () => {
        try {
          const ads = await getAdsFromFirestore();
          setCustomAds(ads);
        } catch (e) {
          console.error("Failed to load custom ads from Firestore", e);
        }
      };
      fetchAds();
    }
  }, [isOpen]);

  const handleSaveAdsToStorage = async (updatedAds: BrandAd[]) => {
    // Save to local state first for instant UI response
    setCustomAds(updatedAds);
    
    try {
      // Find what changed and sync with Firestore
      if (updatedAds.length === MOCK_VIDEO_ADS.length && 
          updatedAds.every((ad, i) => ad.id === MOCK_VIDEO_ADS[i].id && ad.title === MOCK_VIDEO_ADS[i].title)) {
        // It's a reset operation!
        await resetAdsToDefaultFirestore();
      } else if (updatedAds.length < customAds.length) {
        // One or more ads were deleted
        const deletedIds = customAds.filter(item => !updatedAds.some(u => u.id === item.id)).map(item => item.id);
        for (const id of deletedIds) {
          await deleteAdFromFirestore(id);
        }
      } else {
        // An ad was added or modified
        const changedAds = updatedAds.filter(item => {
          const original = customAds.find(c => c.id === item.id);
          if (!original) return true; // New ad
          return JSON.stringify(item) !== JSON.stringify(original); // Modified ad
        });
        
        for (const ad of changedAds) {
          await saveAdToFirestore(ad);
        }
      }
    } catch (error) {
      console.error("Failed to sync changes with Firebase Firestore:", error);
    }
  };

  // System Monitor (API Health) states
  const [tiktokStatus, setTiktokStatus] = useState<'loading' | 'online' | 'slow' | 'offline'>('loading');
  const [tiktokLatency, setTiktokLatency] = useState<number | null>(null);
  const [youtubeStatus, setYoutubeStatus] = useState<'loading' | 'online' | 'slow' | 'offline'>('loading');
  const [youtubeLatency, setYoutubeLatency] = useState<number | null>(null);
  const [isTestingApis, setIsTestingApis] = useState(false);

  const testApiHealth = async () => {
    setIsTestingApis(true);
    setTiktokStatus('loading');
    setYoutubeStatus('loading');

    // Test TikTok API
    try {
      const start = performance.now();
      await fetch('https://www.tikwm.com/api/', { method: 'HEAD', mode: 'no-cors', cache: 'no-cache' });
      const duration = Math.round(performance.now() - start);
      setTiktokLatency(duration);
      setTiktokStatus(duration > 1500 ? 'slow' : 'online');
    } catch (e) {
      try {
        const start = performance.now();
        await fetch('https://www.tikwm.com/api/', { method: 'GET', mode: 'no-cors', cache: 'no-cache' });
        const duration = Math.round(performance.now() - start);
        setTiktokLatency(duration);
        setTiktokStatus(duration > 1500 ? 'slow' : 'online');
      } catch (err) {
        setTiktokStatus('offline');
        setTiktokLatency(null);
      }
    }

    // Test YouTube API
    try {
      const start = performance.now();
      await fetch('https://youtubedl.siputzx.my.id/download', { method: 'HEAD', mode: 'no-cors', cache: 'no-cache' });
      const duration = Math.round(performance.now() - start);
      setYoutubeLatency(duration);
      setYoutubeStatus(duration > 1500 ? 'slow' : 'online');
    } catch (e) {
      try {
        const start = performance.now();
        await fetch('https://youtubedl.siputzx.my.id/download', { method: 'GET', mode: 'no-cors', cache: 'no-cache' });
        const duration = Math.round(performance.now() - start);
        setYoutubeLatency(duration);
        setYoutubeStatus(duration > 1500 ? 'slow' : 'online');
      } catch (err) {
        setYoutubeStatus('offline');
        setYoutubeLatency(null);
      }
    }

    setIsTestingApis(false);
  };

  useEffect(() => {
    if (activeTab === 'security_status') {
      testApiHealth();
    }
  }, [activeTab]);

  // Real Payment Verification states
  const [paymentRequests, setPaymentRequests] = useState<any[]>([]);
  const [adminChatInputs, setAdminChatInputs] = useState<{ [reqId: string]: string }>({});
  const [zoomImage, setZoomImage] = useState<string | null>(null);

  // Sync Payment Requests in real-time
  useEffect(() => {
    if (!isLoggedIn || !isOpen) return;
    const loadRequests = () => {
      try {
        const raw = localStorage.getItem('savetik_payment_requests');
        if (raw) {
          setPaymentRequests(JSON.parse(raw));
        }
      } catch (e) {}
    };
    loadRequests();
    window.addEventListener('storage', loadRequests);
    const interval = setInterval(loadRequests, 1500);
    return () => {
      window.removeEventListener('storage', loadRequests);
      clearInterval(interval);
    };
  }, [isLoggedIn, isOpen]);

  // User Management & Blacklist States
  const [registeredUsers, setRegisteredUsers] = useState<any[]>([]);
  const [bannedEmails, setBannedEmails] = useState<BlacklistItem[]>([]);
  const [bannedIps, setBannedIps] = useState<BlacklistItem[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'banned'>('all');
  const [premiumFilter, setPremiumFilter] = useState<'all' | 'regular' | 'premium'>('all');
  const [sortBy, setSortBy] = useState<'index' | 'points-desc' | 'points-asc'>('index');

  // Inline/Modal editing states
  const [editingEmail, setEditingEmail] = useState<string | null>(null);
  const [editingPointsValue, setEditingPointsValue] = useState<number>(0);
  const [editingPremiumEmail, setEditingPremiumEmail] = useState<string | null>(null);
  const [daysValue, setDaysValue] = useState<number>(30);

  // Manual blacklist add states
  const [blacklistType, setBlacklistType] = useState<'email' | 'ip'>('email');
  const [blacklistValue, setBlacklistValue] = useState('');
  const [blacklistReason, setBlacklistReason] = useState('');

  const currentUser = loadUser();
  const isAuthorizedAdmin = currentUser.isLoggedIn && (
    currentUser.email?.toLowerCase() === 'jrnabil570@gmail.com' ||
    currentUser.email?.toLowerCase() === 'admin@example.com' ||
    currentUser.email?.toLowerCase() === settings.contactEmail?.toLowerCase()
  );

  useEffect(() => {
    if (isLoggedIn && isOpen) {
      const loadLocalData = () => {
        const logsRaw = localStorage.getItem('savetik_activity_logs');
        if (logsRaw) {
          try {
            setLogs(JSON.parse(logsRaw));
          } catch (e) {}
        }
        setRegisteredUsers(getRegisteredUsers());
        setBannedEmails(getBannedEmails());
        setBannedIps(getBannedIps());
      };

      loadLocalData();

      // Async sync with Firestore to get the absolute latest data from other devices
      const performSync = async () => {
        try {
          await initializeFirestoreSync();
          loadLocalData();
        } catch (e) {
          console.error("Failed to sync Firestore data on AdminPanel open:", e);
        }
      };
      
      performSync();

      // Poll Firestore every 10 seconds to sync with other devices in real-time while admin panel is open
      const interval = setInterval(() => {
        performSync();
      }, 10000);

      return () => clearInterval(interval);
    }
  }, [isLoggedIn, isOpen]);

  useEffect(() => {
    setForm(settings);
  }, [settings]);

  // Load saved credentials on open
  useEffect(() => {
    if (isOpen) {
      const saved = localStorage.getItem('savetik_admin_login');
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          if (parsed.user && parsed.pass) {
            setUser(parsed.user);
            setPass(parsed.pass);
            // Auto-login if password matches current settings password
            if (parsed.user === 'admin' && parsed.pass === (settings.adminPassword || 'admin')) {
              setIsLoggedIn(true);
            }
          }
        } catch (e) {}
      }
    }
  }, [isOpen, settings.adminPassword]);

  const handleLogin = () => {
    if (user === 'admin' && pass === (settings.adminPassword || 'admin')) {
      setIsLoggedIn(true);
      if (rememberMe) {
        localStorage.setItem('savetik_admin_login', JSON.stringify({ user, pass }));
      } else {
        localStorage.removeItem('savetik_admin_login');
      }
    } else {
      alert('Username atau Password salah!');
    }
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setPass('');
    localStorage.removeItem('savetik_admin_login');
  };

  const handleSave = () => {
    onSave(form);
    // If the admin password was changed, update our saved login too if rememberMe was active
    if (rememberMe && user === 'admin') {
      localStorage.setItem('savetik_admin_login', JSON.stringify({ user, pass: form.adminPassword }));
    }
    alert('Pengaturan disimpan!');
    onClose();
  };

  const handleSavePoints = (email: string) => {
    const updated = registeredUsers.map(u => {
      if (u.email.toLowerCase() === email.toLowerCase()) {
        return { ...u, points: editingPointsValue };
      }
      return u;
    });
    setRegisteredUsers(updated);
    saveRegisteredUsers(updated);
    setEditingEmail(null);
    
    // Also update current active session if editing current user's points
    const active = loadUser();
    if (active.isLoggedIn && active.email?.toLowerCase() === email.toLowerCase()) {
      active.points = editingPointsValue;
      localStorage.setItem('user_state', JSON.stringify(active));
      window.dispatchEvent(new Event('storage')); window.dispatchEvent(new Event('user_updated'));
    }
  };

  const handleSavePremium = (email: string) => {
    let until: number | null = null;
    if (daysValue === -1) {
      until = -1;
    } else if (daysValue > 0) {
      until = Date.now() + daysValue * 24 * 60 * 60 * 1000;
    }
    
    const updated = registeredUsers.map(u => {
      if (u.email.toLowerCase() === email.toLowerCase()) {
        return { ...u, premiumUntil: until };
      }
      return u;
    });
    setRegisteredUsers(updated);
    saveRegisteredUsers(updated);
    setEditingPremiumEmail(null);
    
    // Update active user session
    const active = loadUser();
    if (active.isLoggedIn && active.email?.toLowerCase() === email.toLowerCase()) {
      active.premiumUntil = until;
      localStorage.setItem('user_state', JSON.stringify(active));
      window.dispatchEvent(new Event('storage')); window.dispatchEvent(new Event('user_updated'));
    }
  };

  const [banDurationEmail, setBanDurationEmail] = useState<string | null>(null);
  const [banDurationValue, setBanDurationValue] = useState<number>(-1); // -1 for permanent
  
  const handleDeleteUser = (email: string) => {
    console.log('Deleting user:', email);
    // if (!window.confirm(`Yakin ingin menghapus akun ${email} secara permanen?`)) return;
    
    // Remove from registered users
    const currentUsers = getRegisteredUsers();
    const updatedUsers = currentUsers.filter((u: any) => u.email.toLowerCase() !== email.toLowerCase());
    setRegisteredUsers(updatedUsers);
    saveRegisteredUsers(updatedUsers);
    
    // Force active user to logout if it's them
    const activeUserRaw = localStorage.getItem('user_state');
    if (activeUserRaw) {
      try {
        const activeUser = JSON.parse(activeUserRaw);
        if (activeUser.email && activeUser.email.toLowerCase() === email.toLowerCase()) {
          activeUser.isLoggedIn = false;
          activeUser.premiumUntil = null;
          localStorage.setItem('user_state', JSON.stringify(activeUser));
          window.dispatchEvent(new Event('storage'));
          window.dispatchEvent(new Event('user_updated'));
        }
      } catch (e) {}
    }
  };

  const handleApplyBan = (u: any) => {
    const newBannedState = true;
    const userIp = u.ip || getSimulatedIp(u.email);
    let bannedUntil = null;
    let banDurationLabel = 'Permanen';
    if (banDurationValue !== -1) {
      bannedUntil = Date.now() + banDurationValue;
      banDurationLabel = BAN_DURATIONS.find(d => d.value === banDurationValue)?.label || 'Sementara';
    }
    
    // 1. Update registered users
    const updated = registeredUsers.map(user => {
      if (user.email.toLowerCase() === u.email.toLowerCase()) {
        return { ...user, banned: true, bannedUntil, banDurationLabel };
      }
      return user;
    });
    setRegisteredUsers(updated);
    saveRegisteredUsers(updated);
    
    // 2. Add to Blacklist if permanent
    if (banDurationValue === -1) {
      const currBannedEmails = getBannedEmails();
      if (!currBannedEmails.some(b => b.value.toLowerCase() === u.email.toLowerCase())) {
        currBannedEmails.push({
          value: u.email,
          reason: 'Diblokir manual oleh Administrator dari dashboard',
          createdAt: new Date().toLocaleDateString('id-ID')
        });
        saveBannedEmails(currBannedEmails);
      }
    }
    
    // update active user if logged in
    const activeUserRaw = localStorage.getItem('user_state');
    if (activeUserRaw) {
      try {
        const activeUser = JSON.parse(activeUserRaw);
        if (activeUser.email && activeUser.email.toLowerCase() === u.email.toLowerCase()) {
          activeUser.banned = true;
          activeUser.isLoggedIn = false;
          if (bannedUntil) activeUser.bannedUntil = bannedUntil;
          localStorage.setItem('user_state', JSON.stringify(activeUser));
          window.dispatchEvent(new Event('storage')); window.dispatchEvent(new Event('user_updated'));
        }
      } catch (e) {}
    }
    setBanDurationEmail(null);
  };

  const handleToggleBan = (u: any) => {
    const newBannedState = !u.banned;
    const userIp = u.ip || getSimulatedIp(u.email);
    
    // 1. Update registered users
    const updated = registeredUsers.map(user => {
      if (user.email.toLowerCase() === u.email.toLowerCase()) {
        return { ...user, banned: newBannedState };
      }
      return user;
    });
    setRegisteredUsers(updated);
    saveRegisteredUsers(updated);
    
    // 2. Add/Remove from Blacklist
    if (newBannedState) {
      // Add email to blacklist
      const currBannedEmails = getBannedEmails();
      if (!currBannedEmails.some(b => b.value.toLowerCase() === u.email.toLowerCase())) {
        currBannedEmails.push({
          value: u.email,
          reason: 'Diblokir manual oleh Administrator dari dashboard',
          createdAt: new Date().toLocaleString('id-ID')
        });
        saveBannedEmails(currBannedEmails);
        setBannedEmails(currBannedEmails);
      }
      
      // Add IP to blacklist
      if (userIp && userIp !== '127.0.0.1') {
        const currBannedIps = getBannedIps();
        if (!currBannedIps.some(b => b.value === userIp)) {
          currBannedIps.push({
            value: userIp,
            reason: 'IP ditangguhkan otomatis (Banned Account email: ' + u.email + ')',
            createdAt: new Date().toLocaleString('id-ID')
          });
          saveBannedIps(currBannedIps);
          setBannedIps(currBannedIps);
        }
      }
    } else {
      // Remove email from blacklist
      const currBannedEmails = getBannedEmails().filter(b => b.value.toLowerCase() !== u.email.toLowerCase());
      saveBannedEmails(currBannedEmails);
      setBannedEmails(currBannedEmails);
      
      // Remove IP from blacklist
      const currBannedIps = getBannedIps().filter(b => b.value !== userIp);
      saveBannedIps(currBannedIps);
      setBannedIps(currBannedIps);
    }
    
    // 3. Log out if currently active session is this banned user
    const active = loadUser();
    if (active.isLoggedIn && active.email?.toLowerCase() === u.email.toLowerCase()) {
      if (newBannedState) {
        active.isLoggedIn = false;
        active.banned = true;
      } else {
        active.banned = false;
      }
      localStorage.setItem('user_state', JSON.stringify(active));
      window.dispatchEvent(new Event('storage')); window.dispatchEvent(new Event('user_updated'));
    }
  };

  const handleAddManualBlacklist = () => {
    if (!blacklistValue.trim()) return;
    const value = blacklistValue.trim();
    const reason = blacklistReason.trim() || 'Diblokir manual oleh Administrator';
    const createdAt = new Date().toLocaleString('id-ID');

    if (blacklistType === 'email') {
      const curr = [...bannedEmails];
      if (curr.some(b => b.value.toLowerCase() === value.toLowerCase())) return;
      curr.push({ value, reason, createdAt });
      saveBannedEmails(curr);
      setBannedEmails(curr);
      
      // Also update matching registered user
      const updatedUsers = getRegisteredUsers().map(user => {
        if (user.email.toLowerCase() === value.toLowerCase()) {
          return { ...user, banned: true };
        }
        return user;
      });
      setRegisteredUsers(updatedUsers);
      saveRegisteredUsers(updatedUsers);
      
      // Logout active matching session
      const active = loadUser();
      if (active.isLoggedIn && active.email?.toLowerCase() === value.toLowerCase()) {
        active.isLoggedIn = false;
        active.banned = true;
        localStorage.setItem('user_state', JSON.stringify(active));
        window.dispatchEvent(new Event('storage')); window.dispatchEvent(new Event('user_updated'));
      }
    } else {
      const curr = [...bannedIps];
      if (curr.some(b => b.value === value)) return;
      curr.push({ value, reason, createdAt });
      saveBannedIps(curr);
      setBannedIps(curr);

      // Also update matching registered users with this IP
      const updatedUsers = getRegisteredUsers().map(user => {
        if (user.ip === value) {
          return { ...user, banned: true };
        }
        return user;
      });
      setRegisteredUsers(updatedUsers);
      saveRegisteredUsers(updatedUsers);

      // Logout active matching session if their IP is banned
      const active = loadUser();
      if (active.isLoggedIn && active.ip === value) {
        active.isLoggedIn = false;
        active.banned = true;
        localStorage.setItem('user_state', JSON.stringify(active));
        window.dispatchEvent(new Event('storage')); window.dispatchEvent(new Event('user_updated'));
      }
    }

    setBlacklistValue('');
    setBlacklistReason('');
  };

  const handleRemoveBannedEmail = (email: string) => {
    const curr = bannedEmails.filter(b => b.value.toLowerCase() !== email.toLowerCase());
    saveBannedEmails(curr);
    setBannedEmails(curr);
    
    // Also update matching registered user
    const updatedUsers = getRegisteredUsers().map(user => {
      if (user.email.toLowerCase() === email.toLowerCase()) {
        return { ...user, banned: false };
      }
      return user;
    });
    setRegisteredUsers(updatedUsers);
    saveRegisteredUsers(updatedUsers);

    // Update active matching session
    const active = loadUser();
    if (active.email?.toLowerCase() === email.toLowerCase()) {
      active.banned = false;
      localStorage.setItem('user_state', JSON.stringify(active));
      window.dispatchEvent(new Event('storage')); window.dispatchEvent(new Event('user_updated'));
    }
  };

  const handleRemoveBannedIp = (ip: string) => {
    const curr = bannedIps.filter(b => b.value !== ip);
    saveBannedIps(curr);
    setBannedIps(curr);

    // Also update matching registered users with this IP
    const updatedUsers = getRegisteredUsers().map(user => {
      if (user.ip === ip) {
        return { ...user, banned: false };
      }
      return user;
    });
    setRegisteredUsers(updatedUsers);
    saveRegisteredUsers(updatedUsers);

    // Update active matching session
    const active = loadUser();
    if (active.ip === ip) {
      active.banned = false;
      localStorage.setItem('user_state', JSON.stringify(active));
      window.dispatchEvent(new Event('storage')); window.dispatchEvent(new Event('user_updated'));
    }
  };

  const handleApprovePayment = async (req: any, durationDays: number) => {
    // 1. Update registered users database
    const users = getRegisteredUsers();
    let until: number | null = null;
    if (durationDays === -1) {
      until = -1; // Lifetime
    } else {
      until = Date.now() + durationDays * 24 * 60 * 60 * 1000;
    }

    const updatedUsers = users.map(u => {
      if (u.email.toLowerCase() === req.userEmail.toLowerCase()) {
        return { ...u, premiumUntil: until };
      }
      return u;
    });
    await saveRegisteredUsers(updatedUsers);
    setRegisteredUsers(updatedUsers);

    // Update active user state if the approved user is currently logged in
    const activeUserRaw = localStorage.getItem('user_state');
    if (activeUserRaw) {
      try {
        const activeUser = JSON.parse(activeUserRaw);
        if (activeUser.email && activeUser.email.toLowerCase() === req.userEmail.toLowerCase()) {
          activeUser.premiumUntil = until;
          localStorage.setItem('user_state', JSON.stringify(activeUser));
          window.dispatchEvent(new Event('storage')); window.dispatchEvent(new Event('user_updated'));
        }
      } catch (e) {}
    }

    // 2. Update payment request status & add system chat message
    const payRaw = localStorage.getItem('savetik_payment_requests');
    let currentRequests = paymentRequests;
    if (payRaw) {
      try {
        currentRequests = JSON.parse(payRaw);
      } catch (e) {}
    }

    const durationText = durationDays === -1 ? 'Premium Selamanya (Lifetime)' : `Premium ${durationDays} Hari`;
    const updatedRequests = currentRequests.map(r => {
      if (r.id === req.id) {
        return {
          ...r,
          status: 'approved',
          approvedDays: durationDays,
          messages: [
            ...r.messages,
            {
              id: 'msg_sys_appr_' + Date.now(),
              sender: 'admin',
              text: `✅ Pembayaran Anda telah Diverifikasi & Disetujui! Status Akun Anda telah diaktifkan menjadi *${durationText}*! Terima kasih atas dukungannya.`,
              timestamp: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })
            }
          ]
        };
      }
      return r;
    });
    await savePaymentRequests(updatedRequests);
    setPaymentRequests(updatedRequests);

    // 3. Update active user session if they are the logged in user
    const active = loadUser();
    if (active.isLoggedIn && active.email?.toLowerCase() === req.userEmail.toLowerCase()) {
      active.premiumUntil = until;
      localStorage.setItem('user_state', JSON.stringify(active));
    }
    window.dispatchEvent(new Event('storage')); window.dispatchEvent(new Event('user_updated'));

    alert(`Sukses menyetujui paket ${durationText} untuk ${req.userEmail}!`);
  };

  const handleRejectPayment = async (req: any) => {
    const payRaw = localStorage.getItem('savetik_payment_requests');
    let currentRequests = paymentRequests;
    if (payRaw) {
      try {
        currentRequests = JSON.parse(payRaw);
      } catch (e) {}
    }

    const updatedRequests = currentRequests.map(r => {
      if (r.id === req.id) {
        return {
          ...r,
          status: 'rejected',
          messages: [
            ...r.messages,
            {
              id: 'msg_sys_rej_' + Date.now(),
              sender: 'admin',
              text: `❌ Mohon maaf, verifikasi pembayaran Anda ditolak oleh Admin. Silakan cek kembali bukti transfer Anda atau kirimkan chat di bawah ini untuk bantuan lebih lanjut.`,
              timestamp: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })
            }
          ]
        };
      }
      return r;
    });
    await savePaymentRequests(updatedRequests);
    setPaymentRequests(updatedRequests);
    window.dispatchEvent(new Event('storage')); window.dispatchEvent(new Event('user_updated'));
    alert(`Sukses menolak pembayaran dari ${req.userEmail}.`);
  };

  const handleSendAdminChatMessage = async (reqId: string) => {
    const text = adminChatInputs[reqId]?.trim();
    if (!text) return;

    const payRaw = localStorage.getItem('savetik_payment_requests');
    let currentRequests = paymentRequests;
    if (payRaw) {
      try {
        currentRequests = JSON.parse(payRaw);
      } catch (e) {}
    }

    const updatedRequests = currentRequests.map(r => {
      if (r.id === reqId) {
        return {
          ...r,
          messages: [
            ...r.messages,
            {
              id: 'msg_admin_' + Date.now(),
              sender: 'admin',
              text: text,
              timestamp: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })
            }
          ]
        };
      }
      return r;
    });

    await savePaymentRequests(updatedRequests);
    setPaymentRequests(updatedRequests);
    setAdminChatInputs(prev => ({ ...prev, [reqId]: '' }));
    window.dispatchEvent(new Event('storage')); window.dispatchEvent(new Event('user_updated'));
  };

  const handleDeletePaymentRequest = async (reqId: string) => {
    const payRaw = localStorage.getItem('savetik_payment_requests');
    let currentRequests = paymentRequests;
    if (payRaw) {
      try {
        currentRequests = JSON.parse(payRaw);
      } catch (e) {}
    }

    const updatedRequests = currentRequests.filter(r => r.id !== reqId);
    await savePaymentRequests(updatedRequests);
    await removePaymentRequest(reqId);
    setPaymentRequests(updatedRequests);
    window.dispatchEvent(new Event('storage')); window.dispatchEvent(new Event('user_updated'));
  };

  const handleDeleteAdminChatMessage = async (reqId: string, msgId: string) => {
    const payRaw = localStorage.getItem('savetik_payment_requests');
    let currentRequests = paymentRequests;
    if (payRaw) {
      try {
        currentRequests = JSON.parse(payRaw);
      } catch (e) {}
    }

    const updatedRequests = currentRequests.map(r => {
      if (r.id === reqId) {
        return {
          ...r,
          messages: r.messages.filter((msg: any) => msg.id !== msgId)
        };
      }
      return r;
    });

    await savePaymentRequests(updatedRequests);
    setPaymentRequests(updatedRequests);
    window.dispatchEvent(new Event('storage')); window.dispatchEvent(new Event('user_updated'));
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={isLoggedIn ? "Admin Settings" : "Login Admin"} size={isLoggedIn ? "xl" : "md"}>
      {!isLoggedIn ? (
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-500 mb-1 uppercase tracking-wider">Username</label>
            <input type="text" value={user} onChange={e => setUser(e.target.value)} className="w-full bg-slate-50 dark:bg-[#0b0f19] border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-3 text-sm text-slate-900 dark:text-white focus:border-indigo-500 focus:outline-none transition-colors" />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-500 mb-1 uppercase tracking-wider">Password</label>
            <div className="relative">
              <input 
                type={showPass ? "text" : "password"} 
                value={pass} 
                onChange={e => setPass(e.target.value)} 
                onKeyDown={e => e.key === 'Enter' && handleLogin()} 
                className="w-full bg-slate-50 dark:bg-[#0b0f19] border border-slate-200 dark:border-slate-800 rounded-xl pl-4 pr-12 py-3 text-sm text-slate-900 dark:text-white focus:border-indigo-500 focus:outline-none transition-colors" 
              />
              <button 
                type="button"
                onClick={() => setShowPass(!showPass)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
              >
                {showPass ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>
          
          <label className="flex items-center gap-2.5 cursor-pointer py-1 select-none">
            <input 
              type="checkbox" 
              checked={rememberMe} 
              onChange={e => setRememberMe(e.target.checked)} 
              className="w-4 h-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500" 
            />
            <span className="text-xs font-medium text-slate-600 dark:text-slate-400">Simpan Login (Jangan Tanya Lagi)</span>
          </label>

          <button onClick={handleLogin} className="w-full bg-indigo-500 hover:bg-indigo-600 text-white font-bold py-3.5 rounded-xl transition-colors flex items-center justify-center gap-2 mt-2">
            <LogIn className="w-4 h-4" /> Login
          </button>
        </div>
      ) : (
        <div className="space-y-4 pr-1 pb-2">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
            <div className="flex bg-slate-100 dark:bg-slate-800/80 p-1 rounded-xl max-w-full overflow-x-auto gap-0.5 scrollbar-thin">
              <button
                type="button"
                onClick={() => setActiveTab('settings')}
                className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all shrink-0 ${activeTab === 'settings' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200'}`}
              >
                Pengaturan
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('payments_queue')}
                className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all shrink-0 relative ${activeTab === 'payments_queue' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200'}`}
              >
                Persetujuan Premium
                {paymentRequests.filter(r => r.status === 'pending').length > 0 && (
                  <span className="absolute -top-1 -right-1.5 bg-red-500 text-white font-extrabold text-[8px] h-4 w-4 rounded-full flex items-center justify-center animate-bounce border border-white dark:border-slate-900 shadow">
                    {paymentRequests.filter(r => r.status === 'pending').length}
                  </span>
                )}
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('payments_settings')}
                className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all shrink-0 ${activeTab === 'payments_settings' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200'}`}
              >
                Kelola QRIS & Paket
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('users')}
                className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all shrink-0 ${activeTab === 'users' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200'}`}
              >
                Manajemen Pengguna
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('blacklist')}
                className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all shrink-0 ${activeTab === 'blacklist' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200'}`}
              >
                Daftar Hitam
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('logs')}
                className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all shrink-0 ${activeTab === 'logs' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200'}`}
              >
                Log Aktivitas
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('security_status')}
                className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all shrink-0 ${activeTab === 'security_status' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200'}`}
              >
                Status & Keamanan
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('ads')}
                className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all shrink-0 ${activeTab === 'ads' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200'}`}
              >
                Kelola Iklan Video
              </button>
            </div>
            <button
              onClick={handleLogout}
              className="text-xs font-bold text-red-500 hover:text-red-600 transition-colors flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-red-500/5 hover:bg-red-500/10 border border-red-500/20"
            >
              Keluar Admin
            </button>
          </div>

          {activeTab === 'settings' && (
            <div className="space-y-4">
              <div className="pt-2">
                <h4 className="text-xs font-bold text-indigo-500 uppercase tracking-widest">Pengaturan Umum & Platform</h4>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1 uppercase tracking-wider">Nama Website (TikTok)</label>
            <input type="text" value={form.brandTitle} onChange={e => setForm({...form, brandTitle: e.target.value})} className="w-full bg-slate-50 dark:bg-[#0b0f19] border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-3 text-sm text-slate-900 dark:text-white focus:border-indigo-500 focus:outline-none transition-colors" />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-500 mb-1 uppercase tracking-wider">Deskripsi Website (TikTok)</label>
            <input type="text" value={form.brandDesc} onChange={e => setForm({...form, brandDesc: e.target.value})} className="w-full bg-slate-50 dark:bg-[#0b0f19] border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-3 text-sm text-slate-900 dark:text-white focus:border-indigo-500 focus:outline-none transition-colors" />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-500 mb-1 uppercase tracking-wider">Placeholder Input (TikTok)</label>
            <input type="text" value={form.tiktokPlaceholder} onChange={e => setForm({...form, tiktokPlaceholder: e.target.value})} className="w-full bg-slate-50 dark:bg-[#0b0f19] border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-3 text-sm text-slate-900 dark:text-white focus:border-indigo-500 focus:outline-none transition-colors" />
          </div>
          
          <div className="mt-4 mb-2">
             <div className="h-px bg-slate-200 dark:bg-slate-800 w-full mb-4"></div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-500 mb-1 uppercase tracking-wider">Nama Website (YouTube)</label>
            <input type="text" value={form.youtubeBrandTitle} onChange={e => setForm({...form, youtubeBrandTitle: e.target.value})} className="w-full bg-slate-50 dark:bg-[#0b0f19] border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-3 text-sm text-slate-900 dark:text-white focus:border-indigo-500 focus:outline-none transition-colors" />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-500 mb-1 uppercase tracking-wider">Deskripsi Website (YouTube)</label>
            <input type="text" value={form.youtubeBrandDesc} onChange={e => setForm({...form, youtubeBrandDesc: e.target.value})} className="w-full bg-slate-50 dark:bg-[#0b0f19] border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-3 text-sm text-slate-900 dark:text-white focus:border-indigo-500 focus:outline-none transition-colors" />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-500 mb-1 uppercase tracking-wider">Placeholder Input (YouTube)</label>
            <input type="text" value={form.youtubePlaceholder} onChange={e => setForm({...form, youtubePlaceholder: e.target.value})} className="w-full bg-slate-50 dark:bg-[#0b0f19] border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-3 text-sm text-slate-900 dark:text-white focus:border-indigo-500 focus:outline-none transition-colors" />
          </div>

          <div className="mt-4 mb-2">
             <div className="h-px bg-slate-200 dark:bg-slate-800 w-full mb-4"></div>
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-500 mb-1 uppercase tracking-wider">Nama Developer</label>
            <input type="text" value={form.devName} onChange={e => setForm({...form, devName: e.target.value})} className="w-full bg-slate-50 dark:bg-[#0b0f19] border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-3 text-sm text-slate-900 dark:text-white focus:border-indigo-500 focus:outline-none transition-colors" />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-500 mb-1 uppercase tracking-wider">Email Kontak</label>
            <input type="email" value={form.contactEmail} onChange={e => setForm({...form, contactEmail: e.target.value})} className="w-full bg-slate-50 dark:bg-[#0b0f19] border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-3 text-sm text-slate-900 dark:text-white focus:border-indigo-500 focus:outline-none transition-colors" />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-500 mb-1 uppercase tracking-wider">Pengumuman (Banner)</label>
            <input type="text" value={form.announcement} onChange={e => setForm({...form, announcement: e.target.value})} placeholder="Kosongkan jika tidak ada" className="w-full bg-slate-50 dark:bg-[#0b0f19] border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-3 text-sm text-slate-900 dark:text-white focus:border-indigo-500 focus:outline-none transition-colors" />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-500 mb-1 uppercase tracking-wider">Teks Footer</label>
            <input type="text" value={form.footerText} onChange={e => setForm({...form, footerText: e.target.value})} className="w-full bg-slate-50 dark:bg-[#0b0f19] border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-3 text-sm text-slate-900 dark:text-white focus:border-indigo-500 focus:outline-none transition-colors" />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-500 mb-1 uppercase tracking-wider">Teks Badge Video (Contoh: TikTok)</label>
            <input type="text" value={form.videoBadgeText} onChange={e => setForm({...form, videoBadgeText: e.target.value})} className="w-full bg-slate-50 dark:bg-[#0b0f19] border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-3 text-sm text-slate-900 dark:text-white focus:border-indigo-500 focus:outline-none transition-colors" />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-500 mb-1 uppercase tracking-wider">Kata Kunci SEO</label>
            <textarea value={form.seoKeywords} onChange={e => setForm({...form, seoKeywords: e.target.value})} rows={3} className="w-full bg-slate-50 dark:bg-[#0b0f19] border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-3 text-sm text-slate-900 dark:text-white focus:border-indigo-500 focus:outline-none transition-colors" />
          </div>

          <div className="pt-4 border-t border-slate-200 dark:border-slate-800 mt-4">
            <h4 className="text-xs font-bold text-indigo-500 mb-4 uppercase tracking-widest">Pengaturan Info Panel</h4>
            
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1">Nama Profil (Header)</label>
                <input type="text" value={form.infoProfileName} onChange={e => setForm({...form, infoProfileName: e.target.value})} className="w-full bg-slate-50 dark:bg-[#0b0f19] border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2.5 text-sm text-slate-900 dark:text-white focus:border-indigo-500 focus:outline-none transition-colors" />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1">Peran Profil (Contoh: Full-Stack Developer)</label>
                <input type="text" value={form.infoProfileRole} onChange={e => setForm({...form, infoProfileRole: e.target.value})} className="w-full bg-slate-50 dark:bg-[#0b0f19] border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2.5 text-sm text-slate-900 dark:text-white focus:border-indigo-500 focus:outline-none transition-colors" />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1">Deskripsi Website di Info</label>
                <textarea value={form.infoAboutText} onChange={e => setForm({...form, infoAboutText: e.target.value})} rows={3} className="w-full bg-slate-50 dark:bg-[#0b0f19] border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2.5 text-sm text-slate-900 dark:text-white focus:border-indigo-500 focus:outline-none transition-colors" />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1">Fitur Website (Pisahkan dengan koma)</label>
                <input type="text" value={form.infoFeatures} onChange={e => setForm({...form, infoFeatures: e.target.value})} placeholder="No Watermark, HD Quality, Gratis" className="w-full bg-slate-50 dark:bg-[#0b0f19] border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2.5 text-sm text-slate-900 dark:text-white focus:border-indigo-500 focus:outline-none transition-colors" />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1">Nama Developer (Kartu)</label>
                <input type="text" value={form.infoDevName} onChange={e => setForm({...form, infoDevName: e.target.value})} className="w-full bg-slate-50 dark:bg-[#0b0f19] border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2.5 text-sm text-slate-900 dark:text-white focus:border-indigo-500 focus:outline-none transition-colors" />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1">Deskripsi Developer</label>
                <textarea value={form.infoDevDesc} onChange={e => setForm({...form, infoDevDesc: e.target.value})} rows={3} className="w-full bg-slate-50 dark:bg-[#0b0f19] border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2.5 text-sm text-slate-900 dark:text-white focus:border-indigo-500 focus:outline-none transition-colors" />
              </div>

              <div className="grid grid-cols-2 gap-4">
                 <div>
                   <label className="block text-xs font-bold text-slate-500 mb-1">Link GitHub</label>
                   <input type="text" value={form.infoSocialGithub} onChange={e => setForm({...form, infoSocialGithub: e.target.value})} className="w-full bg-slate-50 dark:bg-[#0b0f19] border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2.5 text-sm text-slate-900 dark:text-white focus:border-indigo-500 focus:outline-none transition-colors" />
                 </div>
                 <div>
                   <label className="block text-xs font-bold text-slate-500 mb-1">Link Telegram</label>
                   <input type="text" value={form.infoSocialTelegram} onChange={e => setForm({...form, infoSocialTelegram: e.target.value})} className="w-full bg-slate-50 dark:bg-[#0b0f19] border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2.5 text-sm text-slate-900 dark:text-white focus:border-indigo-500 focus:outline-none transition-colors" />
                 </div>
                 <div>
                   <label className="block text-xs font-bold text-slate-500 mb-1">Link Instagram</label>
                   <input type="text" value={form.infoSocialInstagram} onChange={e => setForm({...form, infoSocialInstagram: e.target.value})} className="w-full bg-slate-50 dark:bg-[#0b0f19] border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2.5 text-sm text-slate-900 dark:text-white focus:border-indigo-500 focus:outline-none transition-colors" />
                 </div>
                 <div>
                   <label className="block text-xs font-bold text-slate-500 mb-1">Link YouTube</label>
                   <input type="text" value={form.infoSocialYoutube} onChange={e => setForm({...form, infoSocialYoutube: e.target.value})} className="w-full bg-slate-50 dark:bg-[#0b0f19] border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2.5 text-sm text-slate-900 dark:text-white focus:border-indigo-500 focus:outline-none transition-colors" />
                 </div>
                 <div>
                   <label className="block text-xs font-bold text-slate-500 mb-1">Link WhatsApp</label>
                   <input type="text" value={form.infoSocialWhatsapp} onChange={e => setForm({...form, infoSocialWhatsapp: e.target.value})} className="w-full bg-slate-50 dark:bg-[#0b0f19] border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2.5 text-sm text-slate-900 dark:text-white focus:border-indigo-500 focus:outline-none transition-colors" />
                 </div>
                 <div>
                   <label className="block text-xs font-bold text-slate-500 mb-1">Link TikTok</label>
                   <input type="text" value={form.infoSocialTiktok} onChange={e => setForm({...form, infoSocialTiktok: e.target.value})} className="w-full bg-slate-50 dark:bg-[#0b0f19] border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2.5 text-sm text-slate-900 dark:text-white focus:border-indigo-500 focus:outline-none transition-colors" />
                 </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1">Teknologi (Pisahkan dengan koma)</label>
                <input type="text" value={form.infoTechStack} onChange={e => setForm({...form, infoTechStack: e.target.value})} placeholder="HTML5, Tailwind CSS" className="w-full bg-slate-50 dark:bg-[#0b0f19] border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2.5 text-sm text-slate-900 dark:text-white focus:border-indigo-500 focus:outline-none transition-colors" />
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-200 dark:border-slate-800 mt-4 mb-2">
            <h4 className="text-xs font-bold text-red-500 mb-4 uppercase tracking-widest">Sistem & Pemeliharaan</h4>
            
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1">Password Admin</label>
                <input type="text" value={form.adminPassword || ''} onChange={e => setForm({...form, adminPassword: e.target.value})} className="w-full bg-slate-50 dark:bg-[#0b0f19] border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2 text-sm text-slate-900 dark:text-white focus:border-red-500 focus:outline-none transition-colors" />
                <p className="text-[10px] text-slate-500 mt-1">Username login adalah "admin"</p>
              </div>

              <label className="flex items-center gap-3 p-3 bg-red-50 dark:bg-red-500/10 rounded-xl border border-red-200 dark:border-red-500/30 cursor-pointer">
                <input type="checkbox" checked={form.maintenanceMode} onChange={e => setForm({...form, maintenanceMode: e.target.checked})} className="w-5 h-5 rounded border-red-300 text-red-500 focus:ring-red-500" />
                <span className="text-sm font-semibold text-red-700 dark:text-red-400">Aktifkan Maintenance Mode</span>
              </label>

              {form.maintenanceMode && (
                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1">Judul Maintenance</label>
                  <input type="text" value={form.maintenanceTitle || 'Maintenance'} onChange={e => setForm({...form, maintenanceTitle: e.target.value})} className="w-full bg-slate-50 dark:bg-[#0b0f19] border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2 text-sm text-slate-900 dark:text-white focus:border-red-500 focus:outline-none transition-colors mb-3" />
                  
                  <div className="mb-1">
                    <label className="block text-xs font-bold text-slate-500 mb-1">Durasi Perbaikan Berjalan</label>
                    <div className="flex gap-3">
                      <div className="flex-1">
                        <div className="relative">
                          <input 
                            type="number" 
                            min="0"
                            value={(() => {
                              if (!form.maintenanceEndTime) return '';
                              const remainingMins = Math.max(0, Math.ceil((form.maintenanceEndTime - Date.now()) / 60000));
                              return Math.floor(remainingMins / 60) || '';
                            })()} 
                            onChange={e => {
                              const hours = parseInt(e.target.value) || 0;
                              let mins = 0;
                              if (form.maintenanceEndTime) {
                                const remainingMins = Math.max(0, Math.ceil((form.maintenanceEndTime - Date.now()) / 60000));
                                mins = remainingMins % 60;
                              }
                              const totalMins = (hours * 60) + mins;
                              setForm({...form, maintenanceEndTime: totalMins > 0 ? Date.now() + totalMins * 60000 : undefined});
                            }}
                            placeholder="0"
                            className="w-full bg-slate-50 dark:bg-[#0b0f19] border border-slate-200 dark:border-slate-800 rounded-xl pl-4 pr-10 py-2 text-sm text-slate-900 dark:text-white focus:border-red-500 focus:outline-none transition-colors" 
                          />
                          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400">Jam</span>
                        </div>
                      </div>
                      <div className="flex-1">
                        <div className="relative">
                          <input 
                            type="number" 
                            min="0"
                            value={(() => {
                              if (!form.maintenanceEndTime) return '';
                              const remainingMins = Math.max(0, Math.ceil((form.maintenanceEndTime - Date.now()) / 60000));
                              return remainingMins % 60 || '';
                            })()} 
                            onChange={e => {
                              const mins = parseInt(e.target.value) || 0;
                              let hours = 0;
                              if (form.maintenanceEndTime) {
                                const remainingMins = Math.max(0, Math.ceil((form.maintenanceEndTime - Date.now()) / 60000));
                                hours = Math.floor(remainingMins / 60);
                              }
                              const totalMins = (hours * 60) + mins;
                              setForm({...form, maintenanceEndTime: totalMins > 0 ? Date.now() + totalMins * 60000 : undefined});
                            }}
                            placeholder="0"
                            className="w-full bg-slate-50 dark:bg-[#0b0f19] border border-slate-200 dark:border-slate-800 rounded-xl pl-4 pr-12 py-2 text-sm text-slate-900 dark:text-white focus:border-red-500 focus:outline-none transition-colors" 
                          />
                          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400">Menit</span>
                        </div>
                      </div>
                    </div>
                    <p className="text-[10px] text-slate-500 mt-1">Kosongkan jika tidak ada batas waktu</p>
                  </div>
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1">Pesan Maintenance</label>
                <textarea value={form.maintenanceMessage} onChange={e => setForm({...form, maintenanceMessage: e.target.value})} rows={2} className="w-full bg-slate-50 dark:bg-[#0b0f19] border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2 text-sm text-slate-900 dark:text-white focus:border-red-500 focus:outline-none transition-colors" />
              </div>

              <label className="flex items-center gap-3 p-3 bg-amber-50 dark:bg-amber-500/10 rounded-xl border border-amber-200 dark:border-amber-500/30 cursor-pointer">
                <input type="checkbox" checked={form.emergencyBannerActive} onChange={e => setForm({...form, emergencyBannerActive: e.target.checked})} className="w-5 h-5 rounded border-amber-300 text-amber-500 focus:ring-amber-500" />
                <span className="text-sm font-semibold text-amber-700 dark:text-amber-400">Tampilkan Banner Darurat</span>
              </label>
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1">Pesan Banner Darurat</label>
                <input type="text" value={form.emergencyBannerMessage} onChange={e => setForm({...form, emergencyBannerMessage: e.target.value})} className="w-full bg-slate-50 dark:bg-[#0b0f19] border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2.5 text-sm text-slate-900 dark:text-white focus:border-amber-500 focus:outline-none transition-colors" />
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-200 dark:border-slate-800 mt-4 mb-2">
            <h4 className="text-xs font-bold text-indigo-500 mb-4 uppercase tracking-widest">Daftar API</h4>
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1">Penyedia API TikTok</label>
                <input 
                  type="text"
                  value={form.apiProviders?.tiktok || ''} 
                  onChange={e => setForm({...form, apiProviders: { ...form.apiProviders, tiktok: e.target.value }})} 
                  className="w-full bg-slate-50 dark:bg-[#0b0f19] border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2.5 text-sm text-slate-900 dark:text-white focus:border-indigo-500 focus:outline-none transition-colors mb-3" 
                />
                
                <label className="block text-xs font-bold text-slate-500 mb-1">Penyedia API YouTube</label>
                <input 
                  type="text"
                  value={form.apiProviders?.youtube || ''} 
                  onChange={e => setForm({...form, apiProviders: { ...form.apiProviders, youtube: e.target.value }})} 
                  className="w-full bg-slate-50 dark:bg-[#0b0f19] border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2.5 text-sm text-slate-900 dark:text-white focus:border-indigo-500 focus:outline-none transition-colors" 
                />
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-200 dark:border-slate-800 mt-4">
            <h4 className="text-xs font-bold text-indigo-500 mb-4 uppercase tracking-widest">Penamaan File & Update Aplikasi</h4>
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1">Format Nama File Default</label>
                <input 
                  type="text"
                  value={form.filenameFormat || ''} 
                  onChange={e => setForm({...form, filenameFormat: e.target.value})} 
                  placeholder="[Tanggal]_[Penulis]_[Judul]"
                  className="w-full bg-slate-50 dark:bg-[#0b0f19] border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2 font-mono text-xs text-slate-900 dark:text-white focus:border-indigo-500 focus:outline-none transition-colors" 
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1">Versi Aplikasi</label>
                  <input 
                    type="text"
                    value={form.updateVersion || ''} 
                    onChange={e => setForm({...form, updateVersion: e.target.value})} 
                    placeholder="v2.5.0"
                    className="w-full bg-slate-50 dark:bg-[#0b0f19] border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2 text-xs text-slate-900 dark:text-white focus:border-indigo-500 focus:outline-none transition-colors" 
                  />
                </div>
                <div className="flex items-end pb-1">
                  <label className="flex items-center gap-2 p-2 bg-indigo-50 dark:bg-indigo-500/10 rounded-xl border border-indigo-200 dark:border-indigo-500/30 cursor-pointer w-full">
                    <input type="checkbox" checked={form.updateNotificationActive !== false} onChange={e => setForm({...form, updateNotificationActive: e.target.checked})} className="w-4 h-4 rounded border-indigo-300 text-indigo-500 focus:ring-indigo-500" />
                    <span className="text-xs font-semibold text-indigo-700 dark:text-indigo-400">Aktifkan Banner Update</span>
                  </label>
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1">Catatan Rilis (Changelog Update)</label>
                <textarea 
                  value={form.updateMessage || ''} 
                  onChange={e => setForm({...form, updateMessage: e.target.value})} 
                  rows={4} 
                  placeholder="Gunakan awalan berikut untuk format daftar otomatis:&#10;+ Tambah fitur baru&#10;- Hapus fitur lama&#10;* Update/perbaikan fitur"
                  className="w-full bg-slate-50 dark:bg-[#0b0f19] border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2.5 text-xs text-slate-900 dark:text-white focus:border-indigo-500 focus:outline-none transition-colors font-mono" 
                />
                <p className="text-[10px] text-slate-400 mt-1 leading-normal">
                  Ketik pembaruan di atas. Baris baru yang diawali dengan <strong>+</strong> otomatis menjadi badge <span className="text-emerald-500">TAMBAH</span>, <strong>-</strong> menjadi <span className="text-rose-500">HAPUS</span>, dan <strong>*</strong> menjadi <span className="text-indigo-500">UPDATE</span> pada tampilan user.
                </p>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-200 dark:border-slate-800 mt-4 mb-2">
            <label className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-200 dark:border-slate-800 cursor-pointer">
              <input type="checkbox" checked={form.enableHistory} onChange={e => setForm({...form, enableHistory: e.target.checked})} className="w-5 h-5 rounded border-slate-300 text-indigo-500 focus:ring-indigo-500" />
              <span className="text-sm font-semibold text-slate-800 dark:text-slate-200">Aktifkan Riwayat Download</span>
            </label>
          </div>

          <div className="pt-4 border-t border-slate-200 dark:border-slate-800 mt-4 mb-2">
            <h4 className="text-xs font-bold text-indigo-500 mb-4 uppercase tracking-widest">Sistem Poin, Premium & Iklan</h4>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1">Poin Bonus Pendaftaran</label>
                  <input 
                    type="number"
                    value={form.registerPointsReward !== undefined ? form.registerPointsReward : 50} 
                    onChange={e => setForm({...form, registerPointsReward: parseInt(e.target.value) || 0})} 
                    className="w-full bg-slate-50 dark:bg-[#0b0f19] border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2.5 text-sm text-slate-900 dark:text-white focus:border-indigo-500 focus:outline-none transition-colors" 
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1">Poin Bonus Download</label>
                  <input 
                    type="number"
                    value={form.downloadPointsReward !== undefined ? form.downloadPointsReward : 10} 
                    onChange={e => setForm({...form, downloadPointsReward: parseInt(e.target.value) || 0})} 
                    className="w-full bg-slate-50 dark:bg-[#0b0f19] border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2.5 text-sm text-slate-900 dark:text-white focus:border-indigo-500 focus:outline-none transition-colors" 
                  />
                </div>
              </div>
              <div className="pt-2 border-t border-slate-100 dark:border-slate-800/80 mt-2">
                <div className="flex items-center justify-between mb-3">
                  <h5 className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wide">Daftar Produk Toko Poin & Premium</h5>
                  <button
                    type="button"
                    onClick={() => {
                      const newPlan = {
                        id: 'plan_' + Date.now(),
                        days: 1,
                        cost: 100,
                        label: '1 Hari Premium',
                        desc: 'Bebas Iklan + Kecepatan Tinggi'
                      };
                      setForm({
                        ...form,
                        premiumPlans: [...(form.premiumPlans || []), newPlan]
                      });
                    }}
                    className="flex items-center gap-1 px-2.5 py-1.5 bg-indigo-500 hover:bg-indigo-600 text-white text-[10px] font-bold rounded-xl transition-all shadow-sm"
                  >
                    <Plus className="w-3.5 h-3.5" /> Tambah Produk
                  </button>
                </div>
                <div className="space-y-3 max-h-[250px] overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-slate-300 dark:scrollbar-thumb-slate-800">
                  {(!form.premiumPlans || form.premiumPlans.length === 0) ? (
                    <div className="text-center py-6 text-xs text-slate-400 dark:text-slate-500 border border-dashed border-slate-200 dark:border-slate-800 rounded-2xl">
                      Belum ada produk toko poin. Klik "Tambah Produk" di atas.
                    </div>
                  ) : (
                    form.premiumPlans.map((plan, idx) => (
                      <div key={plan.id || idx} className="p-3 bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800/60 rounded-2xl space-y-2 relative">
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-[9px] bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400 font-bold px-2 py-0.5 rounded-md uppercase tracking-wider">
                            Produk #{idx + 1}
                          </span>
                          <button
                            type="button"
                            onClick={() => {
                              setForm({
                                ...form,
                                premiumPlans: (form.premiumPlans || []).filter(p => p.id !== plan.id)
                              });
                            }}
                            className="p-1 hover:bg-red-50 hover:text-red-500 dark:hover:bg-red-500/15 rounded-lg text-slate-400 transition-colors"
                            title="Hapus Produk"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                        
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          <div>
                            <label className="block text-[9px] font-bold text-slate-400 mb-0.5 uppercase tracking-wide">Nama Produk</label>
                            <input 
                              type="text"
                              value={plan.label} 
                              onChange={e => {
                                const updated = (form.premiumPlans || []).map(p => p.id === plan.id ? { ...p, label: e.target.value } : p);
                                setForm({...form, premiumPlans: updated});
                              }}
                              className="w-full bg-white dark:bg-[#0b0f19] border border-slate-200 dark:border-slate-800 rounded-xl px-2.5 py-1.5 text-xs text-slate-900 dark:text-white focus:border-indigo-500 focus:outline-none transition-colors" 
                              placeholder="Contoh: 1 Hari Premium"
                            />
                          </div>
                          <div>
                            <label className="block text-[9px] font-bold text-slate-400 mb-0.5 uppercase tracking-wide">Deskripsi</label>
                            <input 
                              type="text"
                              value={plan.desc} 
                              onChange={e => {
                                const updated = (form.premiumPlans || []).map(p => p.id === plan.id ? { ...p, desc: e.target.value } : p);
                                setForm({...form, premiumPlans: updated});
                              }}
                              className="w-full bg-white dark:bg-[#0b0f19] border border-slate-200 dark:border-slate-800 rounded-xl px-2.5 py-1.5 text-xs text-slate-900 dark:text-white focus:border-indigo-500 focus:outline-none transition-colors" 
                              placeholder="Bebas Iklan + Kecepatan Tinggi"
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <label className="block text-[9px] font-bold text-slate-400 mb-0.5 uppercase tracking-wide">Durasi (Hari)</label>
                            <div className="flex gap-1.5 items-center">
                              <input 
                                type="number"
                                value={plan.days === -1 ? '' : plan.days} 
                                disabled={plan.days === -1}
                                onChange={e => {
                                  const updated = (form.premiumPlans || []).map(p => p.id === plan.id ? { ...p, days: parseInt(e.target.value) || 0 } : p);
                                  setForm({...form, premiumPlans: updated});
                                }}
                                className="w-full bg-white dark:bg-[#0b0f19] border border-slate-200 dark:border-slate-800 rounded-xl px-2 py-1 text-xs text-slate-900 dark:text-white focus:border-indigo-500 focus:outline-none transition-colors disabled:opacity-50" 
                                placeholder={plan.days === -1 ? 'Permanen' : 'e.g. 1'}
                              />
                              <label className="flex items-center gap-1 cursor-pointer select-none shrink-0 bg-white dark:bg-[#0b0f19] border border-slate-200 dark:border-slate-800 px-2 py-1 rounded-xl h-[26px]">
                                <input 
                                  type="checkbox" 
                                  checked={plan.days === -1} 
                                  onChange={e => {
                                    const updated = (form.premiumPlans || []).map(p => p.id === plan.id ? { ...p, days: e.target.checked ? -1 : 30, label: e.target.checked ? 'Premium Permanen' : p.label, desc: e.target.checked ? 'Bebas Iklan Selamanya (Permanen)' : p.desc } : p);
                                    setForm({...form, premiumPlans: updated});
                                  }}
                                  className="w-3 h-3 text-indigo-500 focus:ring-indigo-500 rounded border-slate-300 animate-pulse"
                                />
                                <span className="text-[9px] font-extrabold text-slate-500 uppercase">Permanen</span>
                              </label>
                            </div>
                          </div>
                          <div>
                            <label className="block text-[9px] font-bold text-slate-400 mb-0.5 uppercase tracking-wide">Harga (Poin)</label>
                            <input 
                              type="number"
                              value={plan.cost} 
                              onChange={e => {
                                const updated = (form.premiumPlans || []).map(p => p.id === plan.id ? { ...p, cost: parseInt(e.target.value) || 0 } : p);
                                setForm({...form, premiumPlans: updated});
                              }}
                              className="w-full bg-white dark:bg-[#0b0f19] border border-slate-200 dark:border-slate-800 rounded-xl px-2.5 py-1.5 text-xs text-slate-900 dark:text-white focus:border-indigo-500 focus:outline-none transition-colors" 
                              placeholder="e.g. 100"
                            />
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
              <div>
                <label className="flex items-center gap-3 p-3 bg-indigo-50 dark:bg-indigo-500/10 rounded-xl border border-indigo-200 dark:border-indigo-500/30 cursor-pointer">
                  <input 
                    type="checkbox" 
                    checked={form.showAdsForNonPremium !== false} 
                    onChange={e => setForm({...form, showAdsForNonPremium: e.target.checked})} 
                    className="w-5 h-5 rounded border-indigo-300 text-indigo-500 focus:ring-indigo-500" 
                  />
                  <div>
                    <span className="text-sm font-semibold text-indigo-700 dark:text-indigo-400 block">Tampilkan Iklan Untuk Non-Premium</span>
                    <span className="text-[10px] text-indigo-500/70 block mt-0.5">Iklan banner simulasi akan tampil di bagian atas & bawah jika user belum Premium.</span>
                  </div>
                </label>
              </div>

              <div className="pt-4 border-t border-slate-200 dark:border-slate-800 mt-4">
                <h4 className="text-xs font-bold text-indigo-500 mb-4 uppercase tracking-widest">Penyiar Pengumuman/Promo (Pop-up Pop-up)</h4>
                <div className="space-y-4">
                  <label className="flex items-center gap-3 p-3 bg-indigo-50 dark:bg-indigo-500/10 rounded-xl border border-indigo-200 dark:border-indigo-500/30 cursor-pointer">
                    <input 
                      type="checkbox" 
                      checked={form.broadcastAnnouncementActive || false} 
                      onChange={e => setForm({
                        ...form, 
                        broadcastAnnouncementActive: e.target.checked, 
                        broadcastAnnouncementId: e.target.checked ? 'bc_' + Date.now() : form.broadcastAnnouncementId
                      })} 
                      className="w-5 h-5 rounded border-indigo-300 text-indigo-500 focus:ring-indigo-500" 
                    />
                    <div>
                      <span className="text-sm font-semibold text-indigo-700 dark:text-indigo-400 block">Aktifkan Pop-up Pengumuman Global</span>
                      <span className="text-[10px] text-indigo-500/70 block mt-0.5">Pengumuman akan muncul sebagai modal pop-up ketika pengguna membuka aplikasi.</span>
                    </div>
                  </label>
                  {form.broadcastAnnouncementActive && (
                    <div className="space-y-3">
                      <div>
                        <label className="block text-xs font-bold text-slate-500 mb-1">Isi Pesan Pengumuman / Promo</label>
                        <textarea 
                          value={form.broadcastAnnouncementMessage || ''} 
                          onChange={e => setForm({...form, broadcastAnnouncementMessage: e.target.value})} 
                          rows={3} 
                          placeholder="Masukkan pengumuman penting atau promo paket premium..."
                          className="w-full bg-slate-50 dark:bg-[#0b0f19] border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2.5 text-xs text-slate-900 dark:text-white focus:border-indigo-500 focus:outline-none transition-colors" 
                        />
                      </div>
                      <div className="flex justify-between items-center bg-slate-50 dark:bg-slate-900/60 p-3 rounded-xl border border-slate-200 dark:border-slate-800">
                        <div>
                          <span className="text-xs font-bold text-slate-700 dark:text-slate-300 block">ID Siaran Pengumuman</span>
                          <span className="text-[10px] text-slate-400 font-mono select-all mt-0.5">{form.broadcastAnnouncementId || 'Belum dibuat'}</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => setForm({...form, broadcastAnnouncementId: 'bc_' + Date.now()})}
                          className="px-2.5 py-1.5 bg-amber-500 hover:bg-amber-600 text-white text-[10px] font-bold rounded-lg transition-colors"
                        >
                          Kirim Ulang (Reset ID)
                        </button>
                      </div>
                      <p className="text-[9px] text-slate-400">Klik "Kirim Ulang" jika Anda ingin semua pengguna yang telah menutup pengumuman sebelumnya melihat pengumuman baru ini kembali.</p>
                    </div>
                  )}
                </div>
              </div>

            </div>
          </div>

              <button onClick={handleSave} className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-bold py-3.5 rounded-xl transition-colors flex items-center justify-center gap-2 mt-4 sticky bottom-0">
                <Save className="w-4 h-4" /> Simpan Semua
              </button>
            </div>
          )}

          {activeTab === 'payments_queue' && (
            <div className="space-y-4">
              <div className="pt-2 flex justify-between items-center">
                <h4 className="text-xs font-bold text-indigo-500 uppercase tracking-widest">
                  Antrean Persetujuan Pembayaran Premium ({paymentRequests.length})
                </h4>
                <div className="text-[10px] text-slate-400 font-medium">
                  Status: <span className="text-amber-500 font-extrabold">{paymentRequests.filter(r => r.status === 'pending').length} Tertunda</span>
                </div>
              </div>

              {/* List of Requests */}
              <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-1 scrollbar-thin">
                {paymentRequests.length === 0 ? (
                  <div className="text-center py-16 text-slate-400 dark:text-slate-500 border border-dashed border-slate-200 dark:border-slate-800 rounded-2xl text-xs">
                    Belum ada pengajuan pembayaran dari pengguna.
                  </div>
                ) : (
                  [...paymentRequests].reverse().map((req) => {
                    const isPending = req.status === 'pending';
                    const isApproved = req.status === 'approved';
                    const isRejected = req.status === 'rejected';

                    return (
                      <div key={req.id} className="p-4 bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800/80 rounded-2xl space-y-4 shadow-sm">
                        {/* Header info */}
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100 dark:border-slate-800">
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-extrabold text-slate-800 dark:text-slate-200 text-sm">{req.userName}</span>
                              <span className="text-xs text-slate-400">({req.userEmail})</span>
                            </div>
                            <div className="text-[10px] text-slate-500 mt-0.5">
                              Diajukan pada: <strong className="font-mono text-slate-600 dark:text-slate-400">{req.createdAt}</strong>
                            </div>
                          </div>
                          <div className="flex items-center gap-2.5 font-sans">
                            <span className="text-[10px] bg-indigo-100 dark:bg-indigo-500/10 text-indigo-700 dark:text-indigo-400 font-extrabold px-2.5 py-1 rounded-lg uppercase tracking-wider">
                              {req.paymentMethod?.toUpperCase()}
                            </span>
                            {isPending && (
                              <span className="text-[10px] bg-amber-500/10 text-amber-500 border border-amber-500/20 font-extrabold px-2.5 py-1 rounded-lg uppercase tracking-wider animate-pulse">
                                Tertunda
                              </span>
                            )}
                            {isApproved && (
                              <span className="text-[10px] bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 font-extrabold px-2.5 py-1 rounded-lg uppercase tracking-wider">
                                Disetujui
                              </span>
                            )}
                            {isRejected && (
                              <span className="text-[10px] bg-red-500/10 text-red-500 border border-red-500/20 font-extrabold px-2.5 py-1 rounded-lg uppercase tracking-wider">
                                Ditolak
                              </span>
                            )}
                            <button
                              onClick={() => handleDeletePaymentRequest(req.id)}
                              className="ml-2 p-1.5 bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white rounded-lg transition-colors border border-red-500/20"
                              title="Hapus Tiket Pembayaran"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>

                        {/* Request Detail Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                          {/* Left Column (md:col-span-5): Info & Proof Photo */}
                          <div className="md:col-span-5 space-y-3">
                            <div className="bg-white dark:bg-[#0b0f19] border border-slate-200 dark:border-slate-800/80 p-3 rounded-xl space-y-2">
                              <div className="text-[11px] text-slate-400 font-bold uppercase tracking-wide">Rincian Pembelian</div>
                              <div className="text-xs space-y-1 text-slate-700 dark:text-slate-300">
                                <div>Paket: <strong className="text-indigo-600 dark:text-indigo-400 font-bold">{req.planLabel}</strong></div>
                                <div>Durasi: <strong className="font-bold">{req.planDays === -1 ? 'Selamanya (Lifetime)' : `${req.planDays} Hari`}</strong></div>
                                {req.phoneNumber && (
                                  <div>Nomor HP: <strong className="font-mono text-slate-800 dark:text-slate-200">{req.phoneNumber}</strong></div>
                                )}
                              </div>
                            </div>

                            {/* Proof Image */}
                            <div>
                              <div className="text-[10px] font-bold text-slate-400 mb-1.5 uppercase">Bukti Transfer (Klik untuk Zoom):</div>
                              <div 
                                className="relative border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden aspect-video bg-white dark:bg-slate-950 max-h-[160px] cursor-zoom-in group shadow-sm hover:border-indigo-400 transition-colors"
                                onClick={() => setZoomImage(req.proofImage)}
                              >
                                {req.proofImage ? (
                                  <>
                                    <img src={req.proofImage} alt="Proof of Payment" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-xs font-bold gap-1">
                                      <Eye className="w-4 h-4" /> Zoom Gambar
                                    </div>
                                  </>
                                ) : (
                                  <div className="w-full h-full flex items-center justify-center text-xs text-slate-400">
                                    Tidak ada gambar bukti
                                  </div>
                                )}
                              </div>
                            </div>

                            {/* Verification Decisions */}
                            <div className="bg-slate-100/50 dark:bg-slate-800/30 p-3 rounded-xl border border-slate-200 dark:border-slate-800 space-y-2.5">
                              <div className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider">Keputusan Admin</div>
                              {isPending ? (
                                <div className="space-y-2">
                                  <div className="text-[9px] text-slate-400 font-bold leading-normal">
                                    Setujui premium sesuai durasi paket:
                                  </div>
                                  <div className="grid grid-cols-3 gap-1.5 font-sans">
                                    <button
                                      onClick={() => handleApprovePayment(req, 30)}
                                      className="py-1.5 px-2 bg-emerald-600 hover:bg-emerald-700 text-white text-[9px] font-extrabold rounded-lg transition-colors shadow-sm uppercase tracking-wider"
                                    >
                                      30 Hari Yes
                                    </button>
                                    <button
                                      onClick={() => handleApprovePayment(req, 90)}
                                      className="py-1.5 px-2 bg-emerald-600 hover:bg-emerald-700 text-white text-[9px] font-extrabold rounded-lg transition-colors shadow-sm uppercase tracking-wider"
                                    >
                                      90 Hari Yes
                                    </button>
                                    <button
                                      onClick={() => handleApprovePayment(req, -1)}
                                      className="py-1.5 px-2 bg-indigo-600 hover:bg-indigo-700 text-white text-[9px] font-extrabold rounded-lg transition-colors shadow-sm uppercase tracking-wider"
                                    >
                                      Selamanya Yes
                                    </button>
                                  </div>

                                  <button
                                    onClick={() => handleRejectPayment(req)}
                                    className="w-full py-1.5 bg-red-600 hover:bg-red-700 text-white text-[10px] font-bold rounded-lg transition-colors shadow-sm uppercase tracking-wider"
                                  >
                                    Tolak / Reject No
                                  </button>
                                </div>
                              ) : (
                                <div className="text-[11px] font-bold text-slate-600 dark:text-slate-300 flex items-center gap-1.5 py-1">
                                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                                  Sudah diproses ({isApproved ? 'DISETUJUI' : 'DITOLAK'})
                                </div>
                              )}
                            </div>
                          </div>

                          {/* Right Column (md:col-span-7): Chat Room */}
                          <div className="md:col-span-7 flex flex-col h-[320px] bg-white dark:bg-[#0b0f19] border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-inner">
                            <div className="bg-slate-50 dark:bg-slate-900/40 border-b border-slate-100 dark:border-slate-800 px-3 py-2 flex items-center justify-between">
                              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wide flex items-center gap-1">
                                <MessageCircle className="w-3.5 h-3.5 text-indigo-500" /> Ruang Diskusi Pengguna
                              </span>
                              <span className="text-[9px] text-slate-400 font-mono">ID: {req.id}</span>
                            </div>

                            {/* Chat messages */}
                            <div className="flex-1 overflow-y-auto p-3 space-y-2 text-xs scrollbar-thin">
                              {req.messages?.map((msg: any) => {
                                const isAdminMsg = msg.sender === 'admin';
                                return (
                                  <div 
                                    key={msg.id} 
                                    className={`flex flex-col max-w-[85%] ${isAdminMsg ? 'ml-auto items-end' : 'mr-auto items-start'}`}
                                  >
                                    <div 
                                      className={`px-3 py-2 rounded-2xl leading-normal ${
                                        isAdminMsg 
                                          ? 'bg-indigo-600 text-white rounded-tr-none' 
                                          : 'bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 rounded-tl-none'
                                      }`}
                                    >
                                      {msg.text}
                                    </div>
                                    <div className="flex items-center gap-1.5 mt-0.5 px-1">
                                      <span className="text-[8px] text-slate-400 font-mono">{msg.timestamp}</span>
                                      <button
                                        onClick={() => handleDeleteAdminChatMessage(req.id, msg.id)}
                                        className="text-red-400 hover:text-red-500 p-0.5 rounded transition-colors"
                                        title="Hapus pesan"
                                      >
                                        <Trash2 className="w-3 h-3" />
                                      </button>
                                    </div>
                                  </div>
                                );
                              })}
                            </div>

                            {/* Chat input form */}
                            <div className="p-2 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/20 flex gap-2">
                              <input
                                type="text"
                                placeholder="Balas pesan atau koordinasi..."
                                value={adminChatInputs[req.id] || ''}
                                onChange={e => setAdminChatInputs({ ...adminChatInputs, [req.id]: e.target.value })}
                                onKeyDown={e => e.key === 'Enter' && handleSendAdminChatMessage(req.id)}
                                className="flex-1 bg-white dark:bg-[#0b0f19] border border-slate-200 dark:border-slate-800 px-3 py-1.5 rounded-lg text-xs text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500"
                              />
                              <button
                                onClick={() => handleSendAdminChatMessage(req.id)}
                                className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-bold transition-colors shrink-0"
                              >
                                Kirim
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          )}

          {activeTab === 'payments_settings' && (
            <div className="space-y-4">
              <div className="pt-2">
                <h4 className="text-xs font-bold text-indigo-500 uppercase tracking-widest">Pengaturan Pembayaran Instan (Admin)</h4>
              </div>

              {/* DANA & GoPay credentials */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1 uppercase tracking-wider">Nomor DANA Admin</label>
                  <input
                    type="text"
                    value={form.adminDanaNumber || ''}
                    onChange={e => setForm({ ...form, adminDanaNumber: e.target.value })}
                    className="w-full bg-slate-50 dark:bg-[#0b0f19] border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-3 text-sm text-slate-900 dark:text-white focus:border-indigo-500 focus:outline-none transition-colors"
                    placeholder="Contoh: 081234567890"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1 uppercase tracking-wider">Nomor GoPay Admin</label>
                  <input
                    type="text"
                    value={form.adminGopayNumber || ''}
                    onChange={e => setForm({ ...form, adminGopayNumber: e.target.value })}
                    className="w-full bg-slate-50 dark:bg-[#0b0f19] border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-3 text-sm text-slate-900 dark:text-white focus:border-indigo-500 focus:outline-none transition-colors"
                    placeholder="Contoh: 081234567890"
                  />
                </div>
              </div>

              {/* QRIS URL & Upload */}
              <div className="p-4 bg-slate-50 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800 rounded-2xl space-y-3">
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">Foto/Gambar QRIS Admin</label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-center">
                  <div className="sm:col-span-2 space-y-2">
                    <p className="text-[10px] text-slate-500 leading-normal">
                      Unggah file QRIS baru dari perangkat Anda (akan disimpan sebagai Base64) atau masukkan URL gambar langsung di kolom bawah.
                    </p>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={e => {
                        const file = e.target.files?.[0];
                        if (file) {
                          const reader = new FileReader();
                          reader.onload = (event) => {
                            setForm({ ...form, adminQrisUrl: event.target?.result as string });
                          };
                          reader.readAsDataURL(file);
                        }
                      }}
                      className="block w-full text-xs text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-indigo-50 dark:file:bg-indigo-500/10 file:text-indigo-700 dark:file:text-indigo-400 hover:file:bg-indigo-100 dark:hover:file:bg-indigo-500/20"
                    />
                    <input
                      type="text"
                      value={form.adminQrisUrl || ''}
                      onChange={e => setForm({ ...form, adminQrisUrl: e.target.value })}
                      className="w-full bg-white dark:bg-[#0b0f19] border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white focus:border-indigo-500 focus:outline-none transition-colors"
                      placeholder="Atau tempel URL gambar QRIS di sini..."
                    />
                  </div>
                  <div className="flex justify-center border border-slate-200 dark:border-slate-800 p-2 rounded-xl bg-white dark:bg-slate-950 aspect-square max-w-[120px] mx-auto overflow-hidden">
                    {form.adminQrisUrl ? (
                      <img src={form.adminQrisUrl} alt="QRIS Admin" className="w-full h-full object-contain" />
                    ) : (
                      <span className="text-[10px] text-slate-400 self-center text-center">Belum ada QRIS</span>
                    )}
                  </div>
                </div>
              </div>

              {/* Direct plans (Produk Premium Direct/Manual) */}
              <div className="pt-2">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                    Daftar Produk Paket Beli Premium Instan
                  </h4>
                  <button
                    type="button"
                    onClick={() => {
                      const newDirectPlan = {
                        id: 'buy_' + Date.now(),
                        label: 'Paket Premium Baru',
                        days: 30,
                        price: 'Rp 15.000',
                        originalPrice: 'Rp 30.000',
                        discount: '50% OFF',
                        desc: 'Akses tanpa iklan, server super cepat.'
                      };
                      setForm({
                        ...form,
                        directPlans: [...(form.directPlans || []), newDirectPlan]
                      });
                    }}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-500 hover:bg-indigo-600 text-white text-[10px] font-bold rounded-xl transition-all shadow-sm"
                  >
                    <Plus className="w-3.5 h-3.5" /> Tambah Paket Baru
                  </button>
                </div>

                <div className="space-y-4 max-h-[350px] overflow-y-auto pr-1 scrollbar-thin">
                  {(!form.directPlans || form.directPlans.length === 0) ? (
                    <div className="text-center py-8 text-xs text-slate-400 dark:text-slate-500 border border-dashed border-slate-200 dark:border-slate-800 rounded-2xl text-xs">
                      Belum ada paket pembelian instan. Klik "Tambah Paket Baru" di atas.
                    </div>
                  ) : (
                    form.directPlans.map((plan, idx) => (
                      <div key={plan.id || idx} className="p-4 bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800/60 rounded-2xl space-y-3 relative">
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-[9px] bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400 font-bold px-2 py-0.5 rounded-md uppercase tracking-wider">
                            Paket #{idx + 1}
                          </span>
                          <button
                            type="button"
                            onClick={() => {
                              setForm({
                                ...form,
                                directPlans: (form.directPlans || []).filter(p => p.id !== plan.id)
                              });
                            }}
                            className="p-1 hover:bg-red-50 hover:text-red-500 dark:hover:bg-red-500/15 rounded-lg text-slate-400 transition-colors"
                            title="Hapus Paket"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <div>
                            <label className="block text-[9px] font-bold text-slate-400 mb-0.5 uppercase tracking-wide">Nama Paket</label>
                            <input
                              type="text"
                              value={plan.label}
                              onChange={e => {
                                const updated = (form.directPlans || []).map(p => p.id === plan.id ? { ...p, label: e.target.value } : p);
                                setForm({ ...form, directPlans: updated });
                              }}
                              className="w-full bg-white dark:bg-[#0b0f19] border border-slate-200 dark:border-slate-800 rounded-xl px-2.5 py-1.5 text-xs text-slate-900 dark:text-white focus:border-indigo-500 focus:outline-none"
                              placeholder="Premium 30 Hari"
                            />
                          </div>
                          <div>
                            <label className="block text-[9px] font-bold text-slate-400 mb-0.5 uppercase tracking-wide">Deskripsi</label>
                            <input
                              type="text"
                              value={plan.desc}
                              onChange={e => {
                                const updated = (form.directPlans || []).map(p => p.id === plan.id ? { ...p, desc: e.target.value } : p);
                                setForm({ ...form, directPlans: updated });
                              }}
                              className="w-full bg-white dark:bg-[#0b0f19] border border-slate-200 dark:border-slate-800 rounded-xl px-2.5 py-1.5 text-xs text-slate-900 dark:text-white focus:border-indigo-500 focus:outline-none"
                              placeholder="Akses tanpa iklan, server cepat..."
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                          <div>
                            <label className="block text-[9px] font-bold text-slate-400 mb-0.5 uppercase tracking-wide">Harga (Rupiah)</label>
                            <input
                              type="text"
                              value={plan.price}
                              onChange={e => {
                                const updated = (form.directPlans || []).map(p => p.id === plan.id ? { ...p, price: e.target.value } : p);
                                setForm({ ...form, directPlans: updated });
                              }}
                              className="w-full bg-white dark:bg-[#0b0f19] border border-slate-200 dark:border-slate-800 rounded-xl px-2.5 py-1.5 text-xs text-slate-900 dark:text-white focus:border-indigo-500"
                              placeholder="Rp 15.000"
                            />
                          </div>
                          <div>
                            <label className="block text-[9px] font-bold text-slate-400 mb-0.5 uppercase tracking-wide">Harga Coret (Asli)</label>
                            <input
                              type="text"
                              value={plan.originalPrice}
                              onChange={e => {
                                const updated = (form.directPlans || []).map(p => p.id === plan.id ? { ...p, originalPrice: e.target.value } : p);
                                setForm({ ...form, directPlans: updated });
                              }}
                              className="w-full bg-white dark:bg-[#0b0f19] border border-slate-200 dark:border-slate-800 rounded-xl px-2.5 py-1.5 text-xs text-slate-900 dark:text-white focus:border-indigo-500"
                              placeholder="Rp 30.000"
                            />
                          </div>
                          <div>
                            <label className="block text-[9px] font-bold text-slate-400 mb-0.5 uppercase tracking-wide">Diskon Teks</label>
                            <input
                              type="text"
                              value={plan.discount}
                              onChange={e => {
                                const updated = (form.directPlans || []).map(p => p.id === plan.id ? { ...p, discount: e.target.value } : p);
                                setForm({ ...form, directPlans: updated });
                              }}
                              className="w-full bg-white dark:bg-[#0b0f19] border border-slate-200 dark:border-slate-800 rounded-xl px-2.5 py-1.5 text-xs text-slate-900 dark:text-white focus:border-indigo-500"
                              placeholder="50% OFF"
                            />
                          </div>
                          <div>
                            <label className="block text-[9px] font-bold text-slate-400 mb-0.5 uppercase tracking-wide">Durasi (Hari)</label>
                            <div className="flex gap-1.5 items-center">
                              <input
                                type="number"
                                value={plan.days === -1 ? '' : plan.days}
                                disabled={plan.days === -1}
                                onChange={e => {
                                  const updated = (form.directPlans || []).map(p => p.id === plan.id ? { ...p, days: parseInt(e.target.value) || 0 } : p);
                                  setForm({ ...form, directPlans: updated });
                                }}
                                className="w-full bg-white dark:bg-[#0b0f19] border border-slate-200 dark:border-slate-800 rounded-xl px-2 py-1 text-xs text-slate-900 dark:text-white focus:border-indigo-500 disabled:opacity-50"
                                placeholder={plan.days === -1 ? 'Lifetime' : 'e.g. 30'}
                              />
                              <label className="flex items-center gap-1 cursor-pointer select-none shrink-0 bg-white dark:bg-[#0b0f19] border border-slate-200 dark:border-slate-800 px-2 py-1 rounded-xl h-[26px]">
                                <input
                                  type="checkbox"
                                  checked={plan.days === -1}
                                  onChange={e => {
                                    const updated = (form.directPlans || []).map(p => p.id === plan.id ? { ...p, days: e.target.checked ? -1 : 30 } : p);
                                    setForm({ ...form, directPlans: updated });
                                  }}
                                  className="w-3 h-3 text-indigo-500 focus:ring-indigo-500 rounded border-slate-300"
                                />
                                <span className="text-[9px] font-bold text-slate-500 uppercase">Permanen</span>
                              </label>
                            </div>
                          </div>
                        </div>

                        <label className="flex items-center gap-2 cursor-pointer select-none">
                          <input
                            type="checkbox"
                            checked={plan.popular || false}
                            onChange={e => {
                              const updated = (form.directPlans || []).map(p => p.id === plan.id ? { ...p, popular: e.target.checked } : p);
                              setForm({ ...form, directPlans: updated });
                            }}
                            className="w-3.5 h-3.5 text-indigo-500 rounded border-slate-300"
                          />
                          <span className="text-[10px] font-bold text-slate-600 dark:text-slate-400 uppercase">
                            Tampilkan sebagai Pilihan Populer (Badge)
                          </span>
                        </label>
                      </div>
                    ))
                  )}
                </div>
              </div>

              <button
                onClick={handleSave}
                className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-bold py-3.5 rounded-xl transition-colors flex items-center justify-center gap-2 mt-4 sticky bottom-0"
              >
                <Save className="w-4 h-4" /> Simpan Semua Pengaturan Pembayaran
              </button>
            </div>
          )}

          {activeTab === 'users' && (
            <div className="space-y-4">
              <div className="pt-2">
                <h4 className="text-xs font-bold text-indigo-500 uppercase tracking-widest">Dasbor Manajemen Pengguna</h4>
              </div>
              
              {/* Search & Filters Row */}
              <div className="flex flex-col md:flex-row gap-3 items-stretch justify-between">
                <div className="relative flex-1">
                  <input
                    type="text"
                    placeholder="Cari nama, email, atau IP..."
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    className="w-full pl-9 pr-4 py-2.5 text-xs bg-slate-50 dark:bg-[#0b0f19] border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500 transition-colors"
                  />
                  <div className="absolute left-3 top-3 text-slate-400">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </div>
                </div>
                
                <div className="flex flex-wrap gap-2">
                  <select
                    value={statusFilter}
                    onChange={e => setStatusFilter(e.target.value as any)}
                    className="px-3 py-2 text-xs bg-slate-50 dark:bg-[#0b0f19] border border-slate-200 dark:border-slate-800 rounded-xl text-slate-700 dark:text-slate-300 focus:outline-none focus:border-indigo-500"
                  >
                    <option value="all">Semua Status</option>
                    <option value="active">Hanya Aktif</option>
                    <option value="banned">Hanya Dibanned</option>
                  </select>

                  <select
                    value={premiumFilter}
                    onChange={e => setPremiumFilter(e.target.value as any)}
                    className="px-3 py-2 text-xs bg-slate-50 dark:bg-[#0b0f19] border border-slate-200 dark:border-slate-800 rounded-xl text-slate-700 dark:text-slate-300 focus:outline-none focus:border-indigo-500"
                  >
                    <option value="all">Semua Jenis Akun</option>
                    <option value="regular">Hanya Regular</option>
                    <option value="premium">Hanya Premium</option>
                  </select>

                  <select
                    value={sortBy}
                    onChange={e => setSortBy(e.target.value as any)}
                    className="px-3 py-2 text-xs bg-slate-50 dark:bg-[#0b0f19] border border-slate-200 dark:border-slate-800 rounded-xl text-slate-700 dark:text-slate-300 focus:outline-none focus:border-indigo-500"
                  >
                    <option value="index">Urut: Daftar</option>
                    <option value="points-desc">Poin: Tertinggi</option>
                    <option value="points-asc">Poin: Terendah</option>
                  </select>
                </div>
              </div>

              {/* Users Grid/Table Container */}
              <div className="border border-slate-150 dark:border-slate-800/80 rounded-2xl overflow-hidden bg-slate-50/20 dark:bg-slate-900/10">
                <div className="overflow-x-auto max-h-[50vh] scrollbar-thin">
                  {registeredUsers.length === 0 ? (
                    <div className="text-center py-12 text-slate-400 text-xs">Loading data...</div>
                  ) : (() => {
                    const search = searchQuery.toLowerCase();
                    const filtered = registeredUsers.filter(u => {
                      // Custom logic for different tabs
                      const matchesSearch = 
                        u.name.toLowerCase().includes(search) || 
                        u.email.toLowerCase().includes(search) || 
                        (u.ip && u.ip.includes(search));

                      const matchesStatus = 
                        statusFilter === 'all' || 
                        (statusFilter === 'banned' && u.banned) || 
                        (statusFilter === 'active' && !u.banned);

                      const isUserPremium = u.premiumUntil === -1 || (u.premiumUntil && u.premiumUntil > Date.now());
                      const matchesPremium = 
                        premiumFilter === 'all' || 
                        (premiumFilter === 'premium' && isUserPremium) || 
                        (premiumFilter === 'regular' && !isUserPremium);

                      return matchesSearch && matchesStatus && matchesPremium && !u.deleted;
                    }).sort((a, b) => {
                      if (sortBy === 'points-desc') return b.points - a.points;
                      if (sortBy === 'points-asc') return a.points - b.points;
                      return 0;
                    });

                    if (filtered.length === 0) {
                      return (
                        <div className="text-center py-16 text-slate-400 text-xs">
                          Tidak ada pengguna yang cocok dengan filter pencarian.
                        </div>
                      );
                    }

                    return (
                      <table className="w-full text-left border-collapse text-xs">
                        <thead>
                          <tr className="bg-slate-100/70 dark:bg-slate-800/60 border-b border-slate-200/50 dark:border-slate-800/50 text-[10px] font-extrabold uppercase text-slate-500 tracking-wider">
                            <th className="p-3">Pengguna</th>
                            <th className="p-3">Poin</th>
                            <th className="p-3">Tipe Akun</th>
                            <th className="p-3">IP Address</th>
                            <th className="p-3">Status</th>
                            <th className="p-3 text-right">Aksi</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-800/50">
                          {filtered.map(u => {
                            const isUserPremium = u.premiumUntil === -1 || (u.premiumUntil && u.premiumUntil > Date.now());
                            return (
                              <tr key={u.email} className="hover:bg-slate-100/20 dark:hover:bg-slate-800/10 transition-colors">
                                <td className="p-3 min-w-[160px]">
                                  <div className="flex items-center gap-2.5 min-w-0">
                                    <img
                                      src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${u.email}`}
                                      alt={u.name}
                                      className="w-7 h-7 rounded-full bg-slate-200 shrink-0 border border-slate-100 dark:border-slate-800"
                                    />
                                    <div className="min-w-0">
                                      <div className="font-bold text-slate-800 dark:text-slate-200 truncate">{u.name}</div>
                                      <div className="text-[10px] text-slate-400 truncate">{u.email}</div>
                                    </div>
                                  </div>
                                </td>
                                <td className="p-3">
                                  {editingEmail === u.email ? (
                                    <div className="flex items-center gap-1">
                                      <input
                                        type="number"
                                        value={editingPointsValue}
                                        onChange={e => setEditingPointsValue(parseInt(e.target.value) || 0)}
                                        className="w-16 px-2 py-1 text-xs bg-white dark:bg-[#0b0f19] border border-slate-200 dark:border-slate-800 rounded-lg text-slate-900 dark:text-white font-mono focus:border-indigo-500 focus:outline-none"
                                      />
                                      <button
                                        onClick={() => handleSavePoints(u.email)}
                                        className="p-1 text-emerald-500 hover:bg-emerald-500/10 rounded-md transition-colors"
                                      >
                                        <Check className="w-3.5 h-3.5" />
                                      </button>
                                      <button
                                        onClick={() => setEditingEmail(null)}
                                        className="p-1 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-md transition-colors"
                                      >
                                        <X className="w-3.5 h-3.5" />
                                      </button>
                                    </div>
                                  ) : (
                                    <div className="flex items-center gap-1 font-mono">
                                      <span className="font-bold text-indigo-600 dark:text-indigo-400">{u.points}</span>
                                      <span className="text-[9px] text-slate-400">pts</span>
                                      <button
                                        onClick={() => {
                                          setEditingEmail(u.email);
                                          setEditingPointsValue(u.points);
                                        }}
                                        className="p-0.5 text-slate-400 hover:text-indigo-500 rounded transition-colors ml-1"
                                      >
                                        <svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                          <path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                                        </svg>
                                      </button>
                                    </div>
                                  )}
                                </td>
                                <td className="p-3">
                                  {editingPremiumEmail === u.email ? (
                                    <div className="flex items-center gap-1">
                                      <select
                                        value={daysValue}
                                        onChange={e => setDaysValue(parseInt(e.target.value))}
                                        className="px-1.5 py-1 text-xs bg-white dark:bg-[#0b0f19] border border-slate-200 dark:border-slate-800 rounded-lg text-slate-900 dark:text-white focus:outline-none"
                                      >
                                        <option value="0">Regular</option>
                                        <option value="7">7 Hari</option>
                                        <option value="30">30 Hari</option>
                                        <option value="-1">Lifetime</option>
                                      </select>
                                      <button
                                        onClick={() => handleSavePremium(u.email)}
                                        className="p-1 text-emerald-500 hover:bg-emerald-500/10 rounded-md transition-colors"
                                      >
                                        <Check className="w-3.5 h-3.5" />
                                      </button>
                                      <button
                                        onClick={() => setEditingPremiumEmail(null)}
                                        className="p-1 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-md transition-colors"
                                      >
                                        <X className="w-3.5 h-3.5" />
                                      </button>
                                    </div>
                                  ) : (
                                    <div className="flex items-center gap-1">
                                      {isUserPremium ? (
                                        <span className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full text-[9px] font-extrabold bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                                          <Zap className="w-2.5 h-2.5 fill-amber-500" />
                                          {u.premiumUntil === -1 ? 'Lifetime' : 'Premium'}
                                        </span>
                                      ) : (
                                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-semibold bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400">
                                          Regular
                                        </span>
                                      )}
                                      <button
                                        onClick={() => {
                                          setEditingPremiumEmail(u.email);
                                          setDaysValue(u.premiumUntil === -1 ? -1 : isUserPremium ? 30 : 0);
                                        }}
                                        className="p-0.5 text-slate-400 hover:text-indigo-500 rounded transition-colors"
                                      >
                                        <svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                          <path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                                        </svg>
                                      </button>
                                    </div>
                                  )}
                                </td>
                                <td className="p-3 font-mono text-[10px] text-slate-500 dark:text-slate-400">
                                  {u.ip || getSimulatedIp(u.email)}
                                </td>
                                <td className="p-3">
                                  {u.banned ? (
                                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-extrabold bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20">
                                      Diblokir
                                    </span>
                                  ) : (
                                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                                      Aktif
                                    </span>
                                  )}
                                </td>
                                <td className="p-3 text-right">
                                  {u.email.toLowerCase() === 'jrnabil570@gmail.com' ? (
                                    <span className="text-[10px] font-bold text-indigo-500 bg-indigo-500/10 px-2 py-0.5 rounded-lg border border-indigo-500/20">Owner</span>
                                  ) : (
                                    <div className="flex items-center justify-end gap-1">
                                      {banDurationEmail === u.email ? (
                                        <div className="flex items-center gap-1">
                                          <select
                                            value={banDurationValue}
                                            onChange={e => setBanDurationValue(parseInt(e.target.value))}
                                            className="px-1.5 py-1 text-[10px] bg-white dark:bg-[#0b0f19] border border-slate-200 dark:border-slate-800 rounded-lg text-slate-900 dark:text-white"
                                          >
                                            {BAN_DURATIONS.map(d => (
                                              <option key={d.value} value={d.value}>{d.label}</option>
                                            ))}
                                          </select>
                                          <button onClick={() => handleApplyBan(u)} className="p-1 text-emerald-500 hover:bg-emerald-500/10 rounded-md"><Check className="w-3.5 h-3.5"/></button>
                                          <button onClick={() => setBanDurationEmail(null)} className="p-1 text-slate-400 hover:bg-slate-100 rounded-md"><X className="w-3.5 h-3.5"/></button>
                                        </div>
                                      ) : (
                                        <>
                                          <button
                                            onClick={() => u.banned ? handleToggleBan(u) : setBanDurationEmail(u.email)}
                                            className={`px-2 py-1 text-[9px] font-extrabold rounded-lg transition-all ${
                                              u.banned
                                                ? 'bg-emerald-500 hover:bg-emerald-600 text-white shadow-sm'
                                                : 'bg-red-500 hover:bg-red-600 text-white shadow-sm'
                                            }`}
                                          >
                                            {u.banned ? 'Unban' : 'Ban Akun'}
                                          </button>
                                          <button
                                            type="button"
                                            onClick={(e) => {
                                              console.log('Delete button clicked for:', u.email);
                                              e.stopPropagation();
                                              handleDeleteUser(u.email);
                                            }}
                                            className="cursor-pointer pointer-events-auto z-[100] p-1.5 text-rose-500 hover:bg-rose-500/10 rounded-lg transition-colors"
                                            title="Hapus Pengguna"
                                          >
                                            <Trash2 className="w-3.5 h-3.5" />
                                          </button>
                                        </>
                                      )}
                                    </div>
                                  )}
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    );
                  })()}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'blacklist' && (
            <div className="space-y-4">
              <div className="pt-2">
                <h4 className="text-xs font-bold text-indigo-500 uppercase tracking-widest">Daftar Hitam (Blacklist) Spammer</h4>
              </div>

              {/* Form Tambah Manual */}
              <div className="p-4 bg-slate-50 dark:bg-slate-900/40 border border-slate-100 dark:border-slate-800 rounded-2xl space-y-3">
                <h5 className="text-[10px] font-extrabold text-slate-800 dark:text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
                  <Plus className="w-3.5 h-3.5 text-indigo-500" /> Tambah Manual ke Daftar Hitam
                </h5>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[9px] font-bold text-slate-400 mb-1 uppercase tracking-wide">Tipe Blokir</label>
                    <select
                      value={blacklistType}
                      onChange={e => setBlacklistType(e.target.value as 'email' | 'ip')}
                      className="w-full bg-white dark:bg-[#0b0f19] border border-slate-200 dark:border-slate-800 rounded-xl px-2.5 py-2 text-xs text-slate-900 dark:text-white focus:border-indigo-500 focus:outline-none"
                    >
                      <option value="email">Alamat Email</option>
                      <option value="ip">IP Address</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[9px] font-bold text-slate-400 mb-1 uppercase tracking-wide">
                      {blacklistType === 'email' ? 'Alamat Email' : 'IP Address'}
                    </label>
                    <input
                      type="text"
                      placeholder={blacklistType === 'email' ? 'e.g. spammer@gmail.com' : 'e.g. 103.115.22.88'}
                      value={blacklistValue}
                      onChange={e => setBlacklistValue(e.target.value)}
                      className="w-full bg-white dark:bg-[#0b0f19] border border-slate-200 dark:border-slate-800 rounded-xl px-2.5 py-2 text-xs text-slate-900 dark:text-white focus:border-indigo-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[9px] font-bold text-slate-400 mb-1 uppercase tracking-wide">Alasan Pemblokiran</label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        placeholder="Alasan diblokir..."
                        value={blacklistReason}
                        onChange={e => setBlacklistReason(e.target.value)}
                        className="flex-1 bg-white dark:bg-[#0b0f19] border border-slate-200 dark:border-slate-800 rounded-xl px-2.5 py-2 text-xs text-slate-900 dark:text-white focus:border-indigo-500 focus:outline-none"
                      />
                      <button
                        onClick={handleAddManualBlacklist}
                        className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-3 py-2 rounded-xl text-xs flex items-center justify-center transition-colors shadow-sm hover:shadow-indigo-500/10"
                      >
                        Blokir
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Blacklist List */}
              <div className="border border-slate-150 dark:border-slate-800/80 rounded-2xl overflow-hidden bg-slate-50/20 dark:bg-slate-900/10">
                <div className="flex bg-slate-100/60 dark:bg-slate-800/40 p-1 border-b border-slate-150 dark:border-slate-800">
                  <button
                    onClick={() => setBlacklistType('email')}
                    className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all ${blacklistType === 'email' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-500 hover:text-slate-700 dark:text-slate-400'}`}
                  >
                    Email Diblokir ({bannedEmails.length})
                  </button>
                  <button
                    onClick={() => setBlacklistType('ip')}
                    className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all ${blacklistType === 'ip' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-500 hover:text-slate-700 dark:text-slate-400'}`}
                  >
                    IP Diblokir ({bannedIps.length})
                  </button>
                </div>

                <div className="overflow-y-auto max-h-[40vh] scrollbar-thin">
                  {blacklistType === 'email' ? (
                    bannedEmails.length === 0 ? (
                      <div className="text-center py-12 text-slate-400 text-xs">Belum ada email yang diblokir.</div>
                    ) : (
                      <table className="w-full text-left border-collapse text-xs">
                        <thead>
                          <tr className="bg-slate-50 dark:bg-[#0b0f19]/30 border-b border-slate-200/50 dark:border-slate-800/50 text-[10px] uppercase font-bold text-slate-400">
                            <th className="p-3">Email Address</th>
                            <th className="p-3">Alasan Pemblokiran</th>
                            <th className="p-3">Tanggal Pemblokiran</th>
                            <th className="p-3 text-right">Aksi</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-800/50">
                          {bannedEmails.map(b => (
                            <tr key={b.value} className="hover:bg-slate-100/10 dark:hover:bg-slate-800/5">
                              <td className="p-3 font-bold text-slate-800 dark:text-slate-200">{b.value}</td>
                              <td className="p-3 text-slate-500 dark:text-slate-400">{b.reason}</td>
                              <td className="p-3 text-slate-400 text-[10px]">{b.createdAt}</td>
                              <td className="p-3 text-right">
                                <button
                                  onClick={() => handleRemoveBannedEmail(b.value)}
                                  className="text-red-500 hover:text-red-600 font-extrabold hover:bg-red-500/5 px-2.5 py-1 rounded-lg transition-all text-[10px]"
                                >
                                  Buka Blokir
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    )
                  ) : (
                    bannedIps.length === 0 ? (
                      <div className="text-center py-12 text-slate-400 text-xs">Belum ada IP Address yang diblokir.</div>
                    ) : (
                      <table className="w-full text-left border-collapse text-xs">
                        <thead>
                          <tr className="bg-slate-50 dark:bg-[#0b0f19]/30 border-b border-slate-200/50 dark:border-slate-800/50 text-[10px] uppercase font-bold text-slate-400">
                            <th className="p-3">IP Address</th>
                            <th className="p-3">Alasan Pemblokiran</th>
                            <th className="p-3">Tanggal Pemblokiran</th>
                            <th className="p-3 text-right">Aksi</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-800/50">
                          {bannedIps.map(b => (
                            <tr key={b.value} className="hover:bg-slate-100/10 dark:hover:bg-slate-800/5">
                              <td className="p-3 font-mono font-bold text-indigo-600 dark:text-indigo-400">{b.value}</td>
                              <td className="p-3 text-slate-500 dark:text-slate-400">{b.reason}</td>
                              <td className="p-3 text-slate-400 text-[10px]">{b.createdAt}</td>
                              <td className="p-3 text-right">
                                <button
                                  onClick={() => handleRemoveBannedIp(b.value)}
                                  className="text-red-500 hover:text-red-600 font-extrabold hover:bg-red-500/5 px-2.5 py-1 rounded-lg transition-all text-[10px]"
                                >
                                  Buka Blokir
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    )
                  )}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'logs' && (
            <div className="space-y-4">
              {!isAuthorizedAdmin ? (
                <div className="py-8 px-4 text-center space-y-3">
                  <div className="w-12 h-12 rounded-full bg-rose-500/10 text-rose-500 flex items-center justify-center mx-auto">
                    <Shield className="w-6 h-6" />
                  </div>
                  <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200">Akses Dibatasi</h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400 max-w-[280px] mx-auto leading-relaxed">
                    Log Aktivitas hanya bisa dilihat oleh email admin yang sah (<strong>jrnabil570@gmail.com</strong>). Silakan masuk ke akun Anda dengan email admin terlebih dahulu.
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider">Daftar Login Pengguna</h4>
                    {logs.length > 0 && (
                      showClearConfirm ? (
                        <div className="flex items-center gap-1.5 shrink-0">
                          <button
                            type="button"
                            onClick={() => {
                              localStorage.removeItem('savetik_activity_logs');
                              setLogs([]);
                              setShowClearConfirm(false);
                            }}
                            className="text-[10px] font-extrabold text-white bg-red-600 hover:bg-red-700 px-2.5 py-1.5 rounded-lg transition-all shadow-sm"
                          >
                            Ya, Hapus
                          </button>
                          <button
                            type="button"
                            onClick={() => setShowClearConfirm(false)}
                            className="text-[10px] font-bold text-slate-500 hover:text-slate-600 dark:text-slate-400 dark:hover:text-slate-300 px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 transition-all bg-white dark:bg-slate-900"
                          >
                            Batal
                          </button>
                        </div>
                      ) : (
                        <button
                          type="button"
                          onClick={() => setShowClearConfirm(true)}
                          className="text-[10px] font-bold text-red-500 hover:text-red-600 hover:bg-red-500/5 px-2.5 py-1.5 rounded-lg border border-red-500/10 transition-all"
                        >
                          Hapus Semua
                        </button>
                      )
                    )}
                  </div>
                  
                  <div className="space-y-2 max-h-[50vh] overflow-y-auto pr-1 scrollbar-thin">
                    {logs.length === 0 ? (
                      <div className="text-center py-12 text-xs text-slate-400 dark:text-slate-500 border border-dashed border-slate-200 dark:border-slate-800 rounded-2xl">
                        Belum ada aktivitas login yang tercatat.
                      </div>
                    ) : (
                      logs.map((log, index) => (
                        <div key={index} className="p-3 bg-slate-50 dark:bg-slate-900/60 border border-slate-200/60 dark:border-slate-800/60 rounded-2xl flex items-center justify-between gap-3 text-xs">
                          <div className="flex items-center gap-2.5 min-w-0">
                            <div className="w-8 h-8 rounded-full bg-indigo-500/10 text-indigo-500 flex items-center justify-center font-bold flex-shrink-0">
                              {log.username.charAt(0).toUpperCase()}
                            </div>
                            <div className="min-w-0">
                              <div className="font-bold text-slate-800 dark:text-slate-200 truncate">{log.username}</div>
                              <div className="text-[10px] text-slate-500 dark:text-slate-400 truncate">{log.email}</div>
                            </div>
                          </div>
                          <div className="text-right flex-shrink-0">
                            <div className="font-mono text-[10px] text-amber-500 font-bold">{log.points} pts</div>
                            <div className="text-[9px] text-slate-400 mt-0.5">{log.loginTime}</div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === 'security_status' && (
            <div className="space-y-6">
              {/* Part 1: Service Status Monitor */}
              <div className="bg-slate-50 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 space-y-4">
                <div className="flex justify-between items-center">
                  <div className="space-y-1">
                    <h4 className="text-xs font-bold text-indigo-500 uppercase tracking-widest flex items-center gap-2">
                      <Activity className="w-4 h-4" /> Sistem Pemantau Status Layanan
                    </h4>
                    <p className="text-[10px] text-slate-500 dark:text-slate-400">Pemeriksa status kesehatan realtime untuk API pengunduh eksternal.</p>
                  </div>
                  <button
                    type="button"
                    onClick={testApiHealth}
                    disabled={isTestingApis}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-500 hover:bg-indigo-600 disabled:bg-slate-200 dark:disabled:bg-slate-800 text-white disabled:text-slate-500 text-xs font-bold rounded-xl transition-all shadow-sm"
                  >
                    {isTestingApis ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin" /> Memeriksa...
                      </>
                    ) : (
                      <>
                        <Wifi className="w-3.5 h-3.5" /> Periksa Status
                      </>
                    )}
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* TikTok API Card */}
                  <div className="p-4 bg-white dark:bg-slate-950 border border-slate-100 dark:border-slate-850 rounded-2xl shadow-sm space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-700 dark:text-slate-300">API Pengunduh TikTok</span>
                      <span className={`h-2.5 w-2.5 rounded-full ${
                        tiktokStatus === 'online' ? 'bg-emerald-500 animate-pulse' :
                        tiktokStatus === 'slow' ? 'bg-amber-500' :
                        tiktokStatus === 'offline' ? 'bg-rose-500' :
                        'bg-slate-300 dark:bg-slate-700'
                      }`} />
                    </div>
                    <div className="font-mono text-[10px] text-slate-400 bg-slate-50 dark:bg-slate-900 p-2 rounded-xl truncate">
                      https://www.tikwm.com/api/
                    </div>
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-slate-500">Status:</span>
                      <span className={`font-bold ${
                        tiktokStatus === 'online' ? 'text-emerald-500' :
                        tiktokStatus === 'slow' ? 'text-amber-500' :
                        tiktokStatus === 'offline' ? 'text-rose-500' :
                        'text-slate-400'
                      }`}>
                        {tiktokStatus === 'online' ? 'Aktif (Normal)' :
                         tiktokStatus === 'slow' ? 'Lambat (Tinggi)' :
                         tiktokStatus === 'offline' ? 'Terputus (Offline)' :
                         'Memuat...'}
                      </span>
                    </div>
                    <div className="flex justify-between items-center text-xs border-t border-slate-50 dark:border-slate-900 pt-2">
                      <span className="text-slate-500">Respons Latency:</span>
                      <span className="font-mono font-bold text-indigo-500">
                        {tiktokLatency !== null ? `${tiktokLatency} ms` : 'N/A'}
                      </span>
                    </div>
                  </div>

                  {/* YouTube API Card */}
                  <div className="p-4 bg-white dark:bg-slate-950 border border-slate-100 dark:border-slate-850 rounded-2xl shadow-sm space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-700 dark:text-slate-300">API Pengunduh YouTube</span>
                      <span className={`h-2.5 w-2.5 rounded-full ${
                        youtubeStatus === 'online' ? 'bg-emerald-500 animate-pulse' :
                        youtubeStatus === 'slow' ? 'bg-amber-500' :
                        youtubeStatus === 'offline' ? 'bg-rose-500' :
                        'bg-slate-300 dark:bg-slate-700'
                      }`} />
                    </div>
                    <div className="font-mono text-[10px] text-slate-400 bg-slate-50 dark:bg-slate-900 p-2 rounded-xl truncate">
                      https://youtubedl.siputzx.my.id/download
                    </div>
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-slate-500">Status:</span>
                      <span className={`font-bold ${
                        youtubeStatus === 'online' ? 'text-emerald-500' :
                        youtubeStatus === 'slow' ? 'text-amber-500' :
                        youtubeStatus === 'offline' ? 'text-rose-500' :
                        'text-slate-400'
                      }`}>
                        {youtubeStatus === 'online' ? 'Aktif (Normal)' :
                         youtubeStatus === 'slow' ? 'Lambat (Tinggi)' :
                         youtubeStatus === 'offline' ? 'Terputus (Offline)' :
                         'Memuat...'}
                      </span>
                    </div>
                    <div className="flex justify-between items-center text-xs border-t border-slate-50 dark:border-slate-900 pt-2">
                      <span className="text-slate-500">Respons Latency:</span>
                      <span className="font-mono font-bold text-indigo-500">
                        {youtubeLatency !== null ? `${youtubeLatency} ms` : 'N/A'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Part 2: Rate Limiting & Anti-Bot Spam */}
              <div className="bg-slate-50 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 space-y-5">
                <div className="space-y-1">
                  <h4 className="text-xs font-bold text-indigo-500 uppercase tracking-widest flex items-center gap-2">
                    <Cpu className="w-4 h-4" /> Pengaturan Pembatasan Tarif (Rate Limiting)
                  </h4>
                  <p className="text-[10px] text-slate-500 dark:text-slate-400">Batasi aktivitas akses bot pihak ketiga atau spamming unduhan otomatis.</p>
                </div>

                <div className="space-y-4">
                  <label className="flex items-center gap-3 p-3 bg-white dark:bg-slate-950 border border-slate-100 dark:border-slate-850 rounded-xl cursor-pointer shadow-sm">
                    <input 
                      type="checkbox" 
                      checked={form.rateLimitEnabled || false} 
                      onChange={e => setForm({...form, rateLimitEnabled: e.target.checked})} 
                      className="w-5 h-5 rounded border-indigo-300 text-indigo-500 focus:ring-indigo-500 cursor-pointer" 
                    />
                    <div>
                      <span className="text-xs font-bold text-slate-700 dark:text-slate-300 block">Aktifkan Pembatasan Frekuensi Unduhan</span>
                      <span className="text-[9px] text-slate-400 block mt-0.5">Batasi jumlah unduhan video per alamat IP & akun pengguna dalam jangka waktu tertentu.</span>
                    </div>
                  </label>

                  {form.rateLimitEnabled && (
                    <div className="p-4 bg-white dark:bg-slate-950 border border-slate-100 dark:border-slate-850 rounded-2xl space-y-4 animate-fade-in">
                      <div className="space-y-2">
                        <div className="flex justify-between items-center text-xs">
                          <span className="font-semibold text-slate-600 dark:text-slate-400">Batas Maksimum Unduhan:</span>
                          <span className="font-mono font-bold text-indigo-500 text-sm">{form.rateLimitMaxRequests} Kali</span>
                        </div>
                        <input 
                          type="range" 
                          min="1" 
                          max="20" 
                          value={form.rateLimitMaxRequests || 5} 
                          onChange={e => setForm({...form, rateLimitMaxRequests: parseInt(e.target.value) || 5})}
                          className="w-full accent-indigo-500 cursor-pointer"
                        />
                        <span className="text-[9px] text-slate-400 block mt-0.5">Jumlah maksimum unduhan sukses/permintaan yang diizinkan sebelum terblokir.</span>
                      </div>

                      <div className="space-y-2">
                        <div className="flex justify-between items-center text-xs">
                          <span className="font-semibold text-slate-600 dark:text-slate-400">Jendela Deteksi Waktu:</span>
                          <span className="font-mono font-bold text-indigo-500 text-sm">{form.rateLimitWindowMinutes} Menit</span>
                        </div>
                        <input 
                          type="range" 
                          min="1" 
                          max="10" 
                          value={form.rateLimitWindowMinutes || 1} 
                          onChange={e => setForm({...form, rateLimitWindowMinutes: parseInt(e.target.value) || 1})}
                          className="w-full accent-indigo-500 cursor-pointer"
                        />
                        <span className="text-[9px] text-slate-400 block mt-0.5">Rentang durasi waktu pemantauan dalam satuan menit.</span>
                      </div>
                    </div>
                  )}

                  <label className="flex items-center gap-3 p-3 bg-white dark:bg-slate-950 border border-slate-100 dark:border-slate-850 rounded-xl cursor-pointer shadow-sm">
                    <input 
                      type="checkbox" 
                      checked={form.autoBlockSuspiciousIps || false} 
                      onChange={e => setForm({...form, autoBlockSuspiciousIps: e.target.checked})} 
                      className="w-5 h-5 rounded border-indigo-300 text-indigo-500 focus:ring-indigo-500 cursor-pointer" 
                    />
                    <div>
                      <span className="text-xs font-bold text-slate-700 dark:text-slate-300 block">Deteksi Bot & Blokir Otomatis (Auto-Ban)</span>
                      <span className="text-[9px] text-slate-400 block mt-0.5">Jika diaktifkan, pengguna/IP yang melebihi batas unduhan akan otomatis dimasukkan ke Daftar Hitam (banned) secara instan.</span>
                    </div>
                  </label>

                  <label className="flex items-center gap-3 p-3 bg-white dark:bg-slate-950 border border-slate-100 dark:border-slate-850 rounded-xl cursor-pointer shadow-sm">
                    <input 
                      type="checkbox" 
                      checked={form.botSpamProtectionEnabled || false} 
                      onChange={e => setForm({...form, botSpamProtectionEnabled: e.target.checked})} 
                      className="w-5 h-5 rounded border-indigo-300 text-indigo-500 focus:ring-indigo-500 cursor-pointer" 
                    />
                    <div>
                      <span className="text-xs font-bold text-slate-700 dark:text-slate-300 block">Aktifkan Perlindungan Anti-Spam (reCAPTCHA Simulation)</span>
                      <span className="text-[9px] text-slate-400 block mt-0.5">Memvalidasi token integritas browser sebelum setiap unduhan untuk mencegah eksploitasi skrip otomatis.</span>
                    </div>
                  </label>
                </div>
              </div>

              {/* Action save button */}
              <button onClick={handleSave} className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-bold py-3.5 rounded-xl transition-colors flex items-center justify-center gap-2 mt-4 sticky bottom-0 z-10 shadow-lg">
                <Save className="w-4 h-4" /> Simpan Semua Konfigurasi
              </button>
            </div>
          )}

          {activeTab === 'ads' && (
            <div className="space-y-6 animate-fade-in">
              <div className="flex justify-between items-center pt-2">
                <div className="space-y-1">
                  <h4 className="text-xs font-bold text-indigo-500 uppercase tracking-widest flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-indigo-500" /> Manajemen Iklan Video Kustom
                  </h4>
                  <p className="text-[10px] text-slate-500 dark:text-slate-400">
                    Kelola video sponsor Anda sendiri secara realtime. Iklan akan dirotasi secara acak bersamaan dengan iklan default website.
                  </p>
                </div>
                
                {!isAddingAd && !isEditingAd && (
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      type="button"
                      onClick={() => {
                        if (confirm("Apakah Anda yakin ingin menyetel ulang semua iklan video ke setelan bawaan website? Perubahan Anda saat ini akan ditimpa.")) {
                          handleSaveAdsToStorage(MOCK_VIDEO_ADS);
                          alert("Iklan berhasil disetel ulang ke bawaan website!");
                        }
                      }}
                      className="flex items-center gap-1 px-3 py-1.5 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-900 text-slate-700 dark:text-slate-300 text-[11px] font-semibold rounded-xl transition-all active:scale-95 cursor-pointer"
                      title="Setel ulang semua iklan ke bawaan"
                    >
                      🔄 Reset Bawaan
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setAdForm({
                          id: 'ad_' + Date.now(),
                          title: '',
                          desc: '',
                          sponsor: '',
                          domain: '',
                          videoUrl: '',
                          ctaText: 'KUNJUNGI SEKARANG',
                          ctaUrl: '',
                          logoEmoji: '🎯',
                          logoBg: 'bg-indigo-600',
                          accentBg: 'bg-indigo-600 hover:bg-indigo-700 focus:ring-indigo-500/50',
                          accentText: 'text-indigo-600',
                          duration: 5,
                          category: 'Sponsor',
                          rating: '4.8 ★',
                          downloads: '1M+ Unduhan',
                          tagline: 'Kualitas Premium & Keamanan Terjamin'
                        });
                        setIsAddingAd(true);
                        setIsEditingAd(false);
                      }}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl transition-all shadow-md active:scale-95 cursor-pointer shrink-0"
                    >
                      <Plus className="w-3.5 h-3.5 text-white" /> Tambah Iklan Baru
                    </button>
                  </div>
                )}
              </div>

              {/* Form Add / Edit */}
              {(isAddingAd || isEditingAd) ? (
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    const adToSave = { ...adForm } as BrandAd;
                    if (!adToSave.title || !adToSave.videoUrl || !adToSave.ctaUrl) {
                      alert("Harap lengkapi field wajib: Judul, URL Video, dan Link Tujuan.");
                      return;
                    }
                    
                    let updatedList = [...customAds];
                    if (isEditingAd) {
                      updatedList = updatedList.map(item => item.id === adToSave.id ? adToSave : item);
                    } else {
                      updatedList = [adToSave, ...updatedList];
                    }
                    
                    handleSaveAdsToStorage(updatedList);
                    setIsAddingAd(false);
                    setIsEditingAd(false);
                    alert(isEditingAd ? "Iklan berhasil diperbarui!" : "Iklan baru berhasil ditambahkan!");
                  }}
                  className="bg-slate-50 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 space-y-4 text-left"
                >
                  <h5 className="text-sm font-bold text-slate-800 dark:text-slate-100 flex items-center gap-1.5">
                    {isEditingAd ? "Edit Detail Iklan" : "Buat Iklan Baru"}
                  </h5>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Nama Merek / Judul Iklan *</label>
                      <input 
                        type="text" 
                        required
                        value={adForm.title || ''} 
                        onChange={e => setAdForm({...adForm, title: e.target.value})} 
                        placeholder="Contoh: Mobile Legends: Bang Bang!"
                        className="w-full bg-white dark:bg-[#0b0f19] border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2.5 text-xs text-slate-900 dark:text-white focus:border-indigo-500 focus:outline-none transition-colors"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Nama Sponsor / Perusahaan *</label>
                      <input 
                        type="text" 
                        required
                        value={adForm.sponsor || ''} 
                        onChange={e => setAdForm({...adForm, sponsor: e.target.value})} 
                        placeholder="Contoh: Moonton Ltd."
                        className="w-full bg-white dark:bg-[#0b0f19] border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2.5 text-xs text-slate-900 dark:text-white focus:border-indigo-500 focus:outline-none transition-colors"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Domain Website (Favicon) *</label>
                      <input 
                        type="text" 
                        required
                        value={adForm.domain || ''} 
                        onChange={e => setAdForm({...adForm, domain: e.target.value})} 
                        placeholder="Contoh: mobilelegends.com"
                        className="w-full bg-white dark:bg-[#0b0f19] border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2.5 text-xs text-slate-900 dark:text-white focus:border-indigo-500 focus:outline-none transition-colors"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Tagline Singkat</label>
                      <input 
                        type="text" 
                        value={adForm.tagline || ''} 
                        onChange={e => setAdForm({...adForm, tagline: e.target.value})} 
                        placeholder="Contoh: M6 World Championship Dimulai!"
                        className="w-full bg-white dark:bg-[#0b0f19] border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2.5 text-xs text-slate-900 dark:text-white focus:border-indigo-500 focus:outline-none transition-colors"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Deskripsi Utama Iklan *</label>
                    <textarea 
                      required
                      rows={2}
                      value={adForm.desc || ''} 
                      onChange={e => setAdForm({...adForm, desc: e.target.value})} 
                      placeholder="Tuliskan kalimat promosi menarik di sini. Pengguna akan membacanya saat video iklan berjalan..."
                      className="w-full bg-white dark:bg-[#0b0f19] border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2.5 text-xs text-slate-900 dark:text-white focus:border-indigo-500 focus:outline-none transition-colors resize-none"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Link URL Video (.mp4) *</label>
                      <input 
                        type="url" 
                        required
                        value={adForm.videoUrl || ''} 
                        onChange={e => setAdForm({...adForm, videoUrl: e.target.value})} 
                        placeholder="https://example.com/video.mp4"
                        className="w-full bg-white dark:bg-[#0b0f19] border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2.5 text-xs text-slate-900 dark:text-white focus:border-indigo-500 focus:outline-none transition-colors"
                      />
                      <span className="text-[9px] text-slate-400 mt-0.5 block">Direct link .mp4.</span>
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Link Foto/Gambar Logo (Opsional)</label>
                      <input 
                        type="url" 
                        value={adForm.logoUrl || ''} 
                        onChange={e => setAdForm({...adForm, logoUrl: e.target.value})} 
                        placeholder="https://example.com/foto-profil.png"
                        className="w-full bg-white dark:bg-[#0b0f19] border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2.5 text-xs text-slate-900 dark:text-white focus:border-indigo-500 focus:outline-none transition-colors"
                      />
                      <span className="text-[9px] text-slate-400 mt-0.5 block">Pasang URL foto profil iklan sendiri.</span>
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Emoji Logo Brand</label>
                      <input 
                        type="text" 
                        value={adForm.logoEmoji || ''} 
                        onChange={e => setAdForm({...adForm, logoEmoji: e.target.value})} 
                        placeholder="🎮"
                        className="w-full bg-white dark:bg-[#0b0f19] border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2.5 text-xs text-slate-900 dark:text-white focus:border-indigo-500 focus:outline-none transition-colors"
                      />
                      <span className="text-[9px] text-slate-400 mt-0.5 block">Fallback jika foto/favicon kosong.</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Teks Tombol Aksi (CTA) *</label>
                      <input 
                        type="text" 
                        required
                        value={adForm.ctaText || ''} 
                        onChange={e => setAdForm({...adForm, ctaText: e.target.value.toUpperCase()})} 
                        placeholder="Contoh: MAIN SEKARANG"
                        className="w-full bg-white dark:bg-[#0b0f19] border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2.5 text-xs text-slate-900 dark:text-white focus:border-indigo-500 focus:outline-none transition-colors"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Link URL Tujuan Tombol *</label>
                      <input 
                        type="url" 
                        required
                        value={adForm.ctaUrl || ''} 
                        onChange={e => setAdForm({...adForm, ctaUrl: e.target.value})} 
                        placeholder="https://play.google.com/..."
                        className="w-full bg-white dark:bg-[#0b0f19] border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2.5 text-xs text-slate-900 dark:text-white focus:border-indigo-500 focus:outline-none transition-colors"
                      />
                    </div>
                  </div>

                  {/* Dynamic skip settings */}
                  <div className="bg-white dark:bg-slate-950 p-4 rounded-xl border border-slate-200 dark:border-slate-800 space-y-3">
                    <span className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider font-semibold">Metode Skip & Durasi Iklan</span>
                    
                    <div className="flex flex-col sm:flex-row gap-4">
                      <label className="flex items-center gap-2 text-xs text-slate-700 dark:text-slate-300 cursor-pointer">
                        <input 
                          type="radio" 
                          name="skipMethod" 
                          checked={adForm.duration === -1 || adForm.duration === 0} 
                          onChange={() => setAdForm({...adForm, duration: -1})}
                          className="w-4 h-4 text-indigo-600 border-slate-300 focus:ring-indigo-500" 
                        />
                        <div>
                          <span className="font-bold block text-xs">Ikuti Panjang Video</span>
                          <span className="text-[9px] text-slate-400 block mt-0.5">Tombol skip baru muncul setelah video selesai diputar.</span>
                        </div>
                      </label>

                      <label className="flex items-center gap-2 text-xs text-slate-700 dark:text-slate-300 cursor-pointer">
                        <input 
                          type="radio" 
                          name="skipMethod" 
                          checked={adForm.duration !== -1 && adForm.duration !== 0} 
                          onChange={() => setAdForm({...adForm, duration: 5})}
                          className="w-4 h-4 text-indigo-600 border-slate-300 focus:ring-indigo-500" 
                        />
                        <div>
                          <span className="font-bold block text-xs">Tentukan Detik Sendiri</span>
                          <span className="text-[9px] text-slate-400 block mt-0.5">Bisa diskip setelah berjalan sekian detik.</span>
                        </div>
                      </label>
                    </div>

                    {(adForm.duration !== -1 && adForm.duration !== 0) && (
                      <div className="pt-2 animate-fade-in">
                        <label className="block text-[9px] font-bold text-slate-400 uppercase mb-1">Detik Sebelum Skip</label>
                        <input 
                          type="number" 
                          min={1}
                          max={300}
                          value={adForm.duration || 5} 
                          onChange={e => setAdForm({...adForm, duration: Math.max(1, parseInt(e.target.value) || 5)})} 
                          className="w-24 bg-slate-50 dark:bg-[#0b0f19] border border-slate-200 dark:border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-900 dark:text-white focus:border-indigo-500 focus:outline-none transition-colors"
                        />
                      </div>
                    )}
                  </div>

                  {/* Presets and Meta */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Preset Tema Warna Iklan</label>
                      <select
                        onChange={e => {
                          const val = e.target.value;
                          if (val === 'shopee') {
                            setAdForm({
                              ...adForm,
                              logoBg: 'bg-[#EE4D2D]',
                              accentBg: 'bg-[#EE4D2D] hover:bg-[#D73C1C] focus:ring-[#EE4D2D]/50',
                              accentText: 'text-[#EE4D2D]'
                            });
                          } else if (val === 'whatsapp') {
                            setAdForm({
                              ...adForm,
                              logoBg: 'bg-[#25D366]',
                              accentBg: 'bg-[#25D366] hover:bg-[#1EBE55] focus:ring-[#25D366]/50',
                              accentText: 'text-[#25D366]'
                            });
                          } else if (val === 'facebook') {
                            setAdForm({
                              ...adForm,
                              logoBg: 'bg-[#1877F2]',
                              accentBg: 'bg-[#1877F2] hover:bg-[#1565C0] focus:ring-[#1877F2]/50',
                              accentText: 'text-[#1877F2]'
                            });
                          } else if (val === 'lazada') {
                            setAdForm({
                              ...adForm,
                              logoBg: 'bg-[#ff007f]',
                              accentBg: 'bg-[#ff007f] hover:bg-[#d40066] focus:ring-[#ff007f]/50',
                              accentText: 'text-[#ff007f]'
                            });
                          } else if (val === 'x') {
                            setAdForm({
                              ...adForm,
                              logoBg: 'bg-[#0F1419]',
                              accentBg: 'bg-[#0F1419] border border-slate-700 hover:bg-[#1C2127] focus:ring-slate-700/50',
                              accentText: 'text-[#0F1419] dark:text-white'
                            });
                          } else {
                            setAdForm({
                              ...adForm,
                              logoBg: 'bg-indigo-600',
                              accentBg: 'bg-indigo-600 hover:bg-indigo-700 focus:ring-indigo-500/50',
                              accentText: 'text-indigo-600'
                            });
                          }
                        }}
                        className="w-full bg-white dark:bg-[#0b0f19] border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2.5 text-xs text-slate-900 dark:text-white focus:border-indigo-500 focus:outline-none transition-colors font-semibold"
                      >
                        <option value="indigo">Indigo Classic (Ungu)</option>
                        <option value="shopee">Shopee Orange (Oranye)</option>
                        <option value="whatsapp">WhatsApp Green (Hijau)</option>
                        <option value="facebook">Facebook Blue (Biru)</option>
                        <option value="lazada">Lazada Pink (Merah Muda)</option>
                        <option value="x">X Black (Hitam)</option>
                      </select>
                    </div>

                    <div className="grid grid-cols-3 gap-2">
                      <div>
                        <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Kategori</label>
                        <input 
                          type="text" 
                          value={adForm.category || ''} 
                          onChange={e => setAdForm({...adForm, category: e.target.value})} 
                          className="w-full bg-white dark:bg-[#0b0f19] border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2.5 text-[11px] text-slate-900 dark:text-white focus:border-indigo-500 focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Rating</label>
                        <input 
                          type="text" 
                          value={adForm.rating || ''} 
                          onChange={e => setAdForm({...adForm, rating: e.target.value})} 
                          className="w-full bg-white dark:bg-[#0b0f19] border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2.5 text-[11px] text-slate-900 dark:text-white focus:border-indigo-500 focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Unduhan</label>
                        <input 
                          type="text" 
                          value={adForm.downloads || ''} 
                          onChange={e => setAdForm({...adForm, downloads: e.target.value})} 
                          className="w-full bg-white dark:bg-[#0b0f19] border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2.5 text-[11px] text-slate-900 dark:text-white focus:border-indigo-500 focus:outline-none"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Buttons Action */}
                  <div className="flex justify-end gap-3 pt-2">
                    <button
                      type="button"
                      onClick={() => {
                        setIsAddingAd(false);
                        setIsEditingAd(false);
                      }}
                      className="px-4 py-2.5 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 text-xs font-bold rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                    >
                      Batal
                    </button>
                    
                    <button
                      type="submit"
                      className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl transition-all shadow-md cursor-pointer"
                    >
                      {isEditingAd ? "Perbarui Iklan" : "Simpan Iklan Baru"}
                    </button>
                  </div>
                </form>
              ) : (
                /* Ads list */
                <div className="space-y-3 text-left">
                  {customAds.length === 0 ? (
                    <div className="p-8 text-center bg-slate-50 dark:bg-slate-900/20 border border-dashed border-slate-200 dark:border-slate-800 rounded-2xl">
                      <HelpCircle className="w-8 h-8 text-slate-400 mx-auto mb-3" />
                      <h5 className="text-xs font-bold text-slate-700 dark:text-slate-300">Belum Ada Iklan Video Kustom</h5>
                      <p className="text-[10px] text-slate-400 mt-1 max-w-xs mx-auto">
                        Saat ini website hanya memutar iklan bawaan (Shopee, Lazada, dll). Klik tombol "Tambah Iklan Baru" di atas untuk menambahkan iklan Anda sendiri.
                      </p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 gap-3 max-h-[400px] overflow-y-auto pr-1">
                      {customAds.map((adItem) => (
                        <div 
                          key={adItem.id}
                          className="flex items-center justify-between p-4 bg-white dark:bg-slate-950 border border-slate-150 dark:border-slate-850 rounded-2xl shadow-sm hover:border-slate-300 dark:hover:border-slate-700 transition-all"
                        >
                          <div className="flex items-center gap-3 min-w-0 flex-1">
                            <div className={`w-10 h-10 rounded-xl ${adItem.logoBg || 'bg-indigo-600'} flex items-center justify-center text-xl shrink-0 font-bold border border-white/10 text-white shadow overflow-hidden`}>
                              {adItem.logoUrl ? (
                                <img src={adItem.logoUrl} alt={adItem.sponsor} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                              ) : (
                                adItem.logoEmoji || '🎯'
                              )}
                            </div>
                            <div className="min-w-0 flex-1 pr-2">
                              <div className="flex items-center gap-1.5 flex-wrap">
                                <span className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate max-w-[200px]">{adItem.title}</span>
                                <span className="text-[9px] bg-slate-150 dark:bg-slate-800 text-slate-500 px-1.5 py-0.5 rounded-full font-bold uppercase shrink-0">{adItem.sponsor}</span>
                              </div>
                              <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-0.5 truncate max-w-[320px]">{adItem.videoUrl}</p>
                              <div className="flex items-center gap-2 mt-1 flex-wrap">
                                <span className="text-[9px] font-bold text-indigo-500 dark:text-indigo-400">
                                  {adItem.duration === -1 || adItem.duration === 0 ? "⏱️ Ikuti Video" : `⏱️ Skip: ${adItem.duration}s`}
                                </span>
                                <span className="text-[9px] font-mono text-slate-400 dark:text-slate-500">• {adItem.domain}</span>
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center gap-2 shrink-0">
                            <button
                              type="button"
                              onClick={() => {
                                setAdForm({ ...adItem });
                                setIsEditingAd(true);
                                setIsAddingAd(false);
                              }}
                              className="p-2 hover:bg-indigo-50 dark:hover:bg-indigo-500/10 text-indigo-500 dark:text-indigo-400 rounded-xl transition-all cursor-pointer"
                              title="Edit Iklan"
                            >
                              <Code className="w-4 h-4" />
                            </button>
                            
                            <button
                              type="button"
                              onClick={() => {
                                if (confirm(`Apakah Anda yakin ingin menghapus iklan "${adItem.title}"?`)) {
                                  const updated = customAds.filter(item => item.id !== adItem.id);
                                  handleSaveAdsToStorage(updated);
                                  alert("Iklan berhasil dihapus!");
                                }
                              }}
                              className="p-2 hover:bg-rose-50 dark:hover:bg-rose-500/10 text-rose-500 dark:text-rose-400 rounded-xl transition-all cursor-pointer"
                              title="Hapus Iklan"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Lightbox Modal for Zoom Image */}
      {zoomImage && (
        <div className="fixed inset-0 bg-black/95 z-[9999] flex items-center justify-center p-4" onClick={() => setZoomImage(null)}>
          <button
            onClick={() => setZoomImage(null)}
            className="absolute top-4 right-4 bg-white/10 hover:bg-white/20 text-white p-2.5 rounded-full transition-colors border border-white/10"
          >
            <X className="w-6 h-6" />
          </button>
          <img
            src={zoomImage}
            alt="Zoomed Proof of Payment"
            className="max-w-full max-h-[90vh] object-contain rounded-xl shadow-2xl animate-fade-in"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </Modal>
  );
}

export function RatingPanel({ isOpen, onClose }: any) {
  const [rating, setRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = () => {
    if (rating === 0) return;
    setSubmitted(true);
    setTimeout(() => {
      onClose();
      setSubmitted(false);
      setRating(0);
    }, 2000);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={t('Beri Kami Rating')}>
      {submitted ? (
        <div className="text-center py-8">
          <div className="w-16 h-16 bg-emerald-50 dark:bg-emerald-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <Star className="w-8 h-8 text-emerald-500 fill-emerald-500" />
          </div>
          <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100 mb-2">Terima Kasih!</h3>
          <p className="text-slate-600 dark:text-slate-400 text-sm">Rating Anda sangat membantu kami untuk berkembang.</p>
        </div>
      ) : (
        <div className="text-center py-6">
          <p className="text-slate-600 dark:text-slate-300 text-sm mb-6">Bagaimana pengalaman Anda menggunakan aplikasi ini?</p>
          <div className="flex justify-center gap-2 mb-8">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                onMouseEnter={() => setHoveredRating(star)}
                onMouseLeave={() => setHoveredRating(0)}
                onClick={() => setRating(star)}
                className="focus:outline-none transition-transform hover:scale-110 active:scale-95"
              >
                <Star
                  className={`w-10 h-10 transition-colors ${
                    star <= (hoveredRating || rating)
                      ? 'text-amber-500 fill-amber-500'
                      : 'text-slate-200 dark:text-slate-700'
                  }`}
                />
              </button>
            ))}
          </div>
          <button
            onClick={handleSubmit}
            disabled={rating === 0}
            className="w-full bg-indigo-500 hover:bg-indigo-600 disabled:bg-slate-300 dark:disabled:bg-slate-800 disabled:text-slate-500 text-white font-bold py-3.5 rounded-xl transition-all"
          >
            Kirim Rating
          </button>
        </div>
      )}
    </Modal>
  );
}

export function AboutPanel({ isOpen, onClose, settings, user }: any) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title={t('Tentang Aplikasi')}>
      <div className="space-y-6 text-slate-700 dark:text-slate-300">
        <div className="text-center p-6 bg-gradient-to-br from-indigo-500/10 via-purple-500/10 to-transparent rounded-2xl border border-indigo-500/20">
          <div className="w-16 h-16 bg-indigo-600 text-white rounded-2xl flex items-center justify-center mx-auto mb-3 shadow-lg shadow-indigo-500/30">
            <Sparkles className="w-8 h-8" />
          </div>
          <h3 className="text-xl font-bold text-slate-900 dark:text-white">{settings?.brandTitle || 'SaveTik'}</h3>
          <p className="text-xs font-medium text-indigo-600 dark:text-indigo-400 mt-1">{settings?.brandDesc || 'Fast, Secure & No Watermark'}</p>
        </div>

        <div className="space-y-3">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">Misi & Pengenalan</h4>
          <p className="text-sm leading-relaxed bg-slate-50 dark:bg-slate-800/40 p-4 rounded-xl border border-slate-200 dark:border-slate-700/50">
            {settings?.infoAboutText || 'Aplikasi download video TikTok & YouTube beresolusi tinggi tanpa watermark. Dirancang dengan fokus pada kecepatan ekstraksi, keamanan privasi, dan kenyamanan pengguna tanpa perlu registrasi atau instalasi tambahan.'}
          </p>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="bg-slate-50 dark:bg-slate-800/40 p-3.5 rounded-xl border border-slate-200 dark:border-slate-700/50">
            <div className="font-bold text-slate-900 dark:text-white text-sm mb-1 flex items-center gap-1.5">
              <Zap className="w-4 h-4 text-amber-500" /> Cepat & Gratis
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">Proses langsung dari server tanpa batas kuota.</p>
          </div>
          <div className="bg-slate-50 dark:bg-slate-800/40 p-3.5 rounded-xl border border-slate-200 dark:border-slate-700/50">
            <div className="font-bold text-slate-900 dark:text-white text-sm mb-1 flex items-center gap-1.5">
              <Shield className="w-4 h-4 text-emerald-500" /> Privasi Aman
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">Tanpa menyimpan data pribadi atau kredensial.</p>
          </div>
        </div>

        <div className="border-t border-slate-200 dark:border-slate-700/50 pt-4 flex items-center justify-between text-xs text-slate-400">
          <span>Versi Aplikasi: <strong className="text-indigo-500">{settings?.updateVersion || 'v2.5.0'}</strong></span>
          <span>© {new Date().getFullYear()} {settings?.devName || 'Nabil Assihidiqi'}</span>
        </div>
      </div>
    </Modal>
  );
}

export function FeedbackPanel({ isOpen, onClose }: any) {
  const [type, setType] = useState<'suggestion' | 'bug'>('suggestion');
  const [message, setMessage] = useState('');
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: any) => {
    e.preventDefault();
    if (!message.trim()) return;
    
    // Buka aplikasi email pengguna dengan data yang diisi
    const subject = encodeURIComponent(`[${type === 'bug' ? 'Laporan Bug' : 'Saran Fitur'}] SaveTik`);
    const body = encodeURIComponent(`Kategori: ${type === 'bug' ? 'Laporan Bug' : 'Saran Fitur'}\n\nPesan:\n${message}\n\nEmail Pengirim: ${email || 'Tidak disertakan'}`);
    window.location.href = `mailto:jrnabil570@gmail.com?subject=${subject}&body=${body}`;
    
    setSubmitted(true);
    setTimeout(() => {
      setSubmitted(false);
      setMessage('');
      setEmail('');
      onClose();
    }, 2000);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={t('Masukan & Lapor Bug')}>
      {submitted ? (
        <div className="py-10 text-center space-y-3">
          <div className="w-16 h-16 bg-emerald-100 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 rounded-full flex items-center justify-center mx-auto shadow-lg shadow-emerald-500/20 animate-bounce">
            <CheckCircle2 className="w-8 h-8" />
          </div>
          <h4 className="text-lg font-bold text-slate-900 dark:text-white">Terima Kasih Atas Masukan Anda!</h4>
          <p className="text-xs text-slate-500 dark:text-slate-400 max-w-xs mx-auto">
            Laporan Anda telah dicatat oleh sistem kami dan akan ditinjau untuk pengembangan selanjutnya.
          </p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4 text-slate-700 dark:text-slate-300">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">Kategori Feedback</label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setType('suggestion')}
                className={`py-2.5 px-4 rounded-xl font-bold text-xs flex items-center justify-center gap-2 border transition-all ${
                  type === 'suggestion'
                    ? 'bg-indigo-600 text-white border-indigo-600 shadow-md shadow-indigo-500/20'
                    : 'bg-slate-50 dark:bg-slate-800/50 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-100'
                }`}
              >
                <Sparkles className="w-4 h-4" /> Saran / Ide Fitur
              </button>
              <button
                type="button"
                onClick={() => setType('bug')}
                className={`py-2.5 px-4 rounded-xl font-bold text-xs flex items-center justify-center gap-2 border transition-all ${
                  type === 'bug'
                    ? 'bg-rose-600 text-white border-rose-600 shadow-md shadow-rose-500/20'
                    : 'bg-slate-50 dark:bg-slate-800/50 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-100'
                }`}
              >
                <AlertCircle className="w-4 h-4" /> Laporan Bug / Error
              </button>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
              {type === 'suggestion' ? 'Deskripsikan Ide Fitur Anda:' : 'Jelaskan Kendala atau Error yang Terjadi:'}
            </label>
            <textarea
              required
              rows={4}
              value={message}
              onChange={e => setMessage(e.target.value)}
              placeholder={type === 'suggestion' ? 'Contoh: Tambahkan fitur konversi ke GIF atau batch download...' : 'Contoh: Gagal mengunduh video dari link tertentu saat mengklik tombol...'}
              className="w-full bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl p-3 text-sm focus:border-indigo-500 focus:outline-none transition-colors"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
              Email / Kontak Anda <span className="text-slate-400 font-normal">(Opsional)</span>
            </label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="nama@email.com (Untuk update balasan)"
              className="w-full bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl p-3 text-sm focus:border-indigo-500 focus:outline-none transition-colors"
            />
          </div>

          <button
            type="submit"
            className="w-full py-3.5 bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold rounded-xl hover:opacity-90 transition-opacity flex items-center justify-center gap-2 shadow-lg"
          >
            <Send className="w-4 h-4" /> Kirim Masukan
          </button>
        </form>
      )}
    </Modal>
  );
}

export function UpdateModal({ isOpen, onClose, settings, user }: any) {
  const renderUpdateContent = () => {
    const rawMessage = settings?.updateMessage;
    // Check if the message is empty or doesn't contain list formatting tags (+, -, *)
    const hasBullets = rawMessage && (rawMessage.includes('+') || rawMessage.includes('-') || rawMessage.includes('*'));

    const messageToUse = hasBullets ? rawMessage : 
      `+ Fitur Premium Permanen (Bisa ditukar dengan Poin Toko)
+ Integrasi edit Poin Bebas khusus email admin jrnabil570@gmail.com
+ Iklan Video Acak Game CoC, FF, TikTok, ChatGPT, DeepSeek, Gemini, dll
* Peningkatan sistem pemeliharaan otomatis & kecepatan konversi
- Fitur lag delay pada login log telah dihapus`;

    const lines = messageToUse.split('\n').map((l: string) => l.trim()).filter(Boolean);

    return (
      <div className="space-y-2.5">
        {lines.map((line: string, idx: number) => {
          let type: 'add' | 'remove' | 'update' | 'normal' = 'normal';
          let text = line;

          if (line.startsWith('+') || line.toLowerCase().startsWith('[tambah]') || line.toLowerCase().startsWith('[add]')) {
            type = 'add';
            text = line.replace(/^\+/, '').replace(/^\[tambah\]/i, '').replace(/^\[add\]/i, '').trim();
          } else if (line.startsWith('-') || line.toLowerCase().startsWith('[hapus]') || line.toLowerCase().startsWith('[remove]')) {
            type = 'remove';
            text = line.replace(/^-/, '').replace(/^\[hapus\]/i, '').replace(/^\[remove\]/i, '').trim();
          } else if (line.startsWith('*') || line.startsWith('~') || line.toLowerCase().startsWith('[update]') || line.toLowerCase().startsWith('[perbaikan]') || line.toLowerCase().startsWith('[fix]')) {
            type = 'update';
            text = line.replace(/^[\*~]/, '').replace(/^\[update\]/i, '').replace(/^\[perbaikan\]/i, '').replace(/^\[fix\]/i, '').trim();
          }

          if (type === 'add') {
            return (
              <div key={idx} className="flex items-start gap-2.5 text-xs">
                <span className="px-2 py-0.5 rounded-md text-[9px] font-black bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 shrink-0 uppercase tracking-wider">TAMBAH</span>
                <span className="font-semibold text-slate-700 dark:text-slate-300">{text}</span>
              </div>
            );
          }
          if (type === 'remove') {
            return (
              <div key={idx} className="flex items-start gap-2.5 text-xs">
                <span className="px-2 py-0.5 rounded-md text-[9px] font-black bg-rose-500/10 text-rose-600 dark:text-rose-400 shrink-0 uppercase tracking-wider">HAPUS</span>
                <span className="font-semibold text-slate-500 dark:text-slate-400 line-through">{text}</span>
              </div>
            );
          }
          if (type === 'update') {
            return (
              <div key={idx} className="flex items-start gap-2.5 text-xs">
                <span className="px-2 py-0.5 rounded-md text-[9px] font-black bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 shrink-0 uppercase tracking-wider font-extrabold">UPDATE</span>
                <span className="font-semibold text-slate-700 dark:text-slate-300">{text}</span>
              </div>
            );
          }

          return (
            <div key={idx} className="flex items-start gap-2 text-xs">
              <span className="text-indigo-500 shrink-0 mt-0.5">•</span>
              <span className="font-medium text-slate-600 dark:text-slate-300">{text}</span>
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={settings?.updateTitle || "Update Fitur Baru Tersedia!"}>
      <div className="space-y-5 text-slate-700 dark:text-slate-300">
        <div className="flex items-center gap-3.5 p-4 bg-indigo-50 dark:bg-indigo-500/10 border border-indigo-200 dark:border-indigo-500/20 rounded-2xl">
          <div className="w-12 h-12 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-black text-sm shrink-0 shadow-md shadow-indigo-500/20">
            {settings?.updateVersion || 'v2.5.0'}
          </div>
          <div>
            <h4 className="font-bold text-slate-900 dark:text-white text-sm">Versi Terbaru Telah Aktif!</h4>
            <p className="text-xs text-indigo-600 dark:text-indigo-400 mt-0.5 font-medium">Sistem berjalan secara otomatis dengan pembaruan terkini.</p>
          </div>
        </div>

        <div>
          <h5 className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-2.5">Apa yang Baru di Versi Ini?</h5>
          <div className="bg-slate-50 dark:bg-slate-800/40 p-4 rounded-2xl border border-slate-200 dark:border-slate-700/50 space-y-2.5 leading-relaxed">
            {renderUpdateContent()}
          </div>
        </div>

        <button
          onClick={onClose}
          className="w-full py-3.5 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-500 transition-colors shadow-lg shadow-indigo-500/25 flex items-center justify-center gap-2"
        >
          <CheckCircle2 className="w-4 h-4" /> Mengerti & Lanjutkan
        </button>
      </div>
    </Modal>
  );
}

export function SidebarMenu({ isOpen, onClose, onOpenHistory, onOpenAdmin, onOpenInfo, onOpenAbout, onOpenFeedback, onOpenUpdate, isDark, setIsDark, onOpenRating, settings, user }: any) {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-50 bg-slate-900/40 dark:bg-black/60 backdrop-blur-sm"
          />
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed top-0 right-0 bottom-0 z-50 w-full sm:w-[400px] bg-white dark:bg-[#0a0a0a] border-l border-slate-200 dark:border-white/10 flex flex-col overflow-y-auto"
          >
            <div className="flex items-center p-4 border-b border-slate-200 dark:border-white/10 bg-white/90 dark:bg-[#0a0a0a]/90 backdrop-blur-md sticky top-0 z-10">
               <button onClick={onClose} className="p-2 rounded-full text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/10 transition-colors border border-slate-200 dark:border-white/10">
                  <ChevronLeft className="w-5 h-5" />
               </button>
               <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100 flex-1 text-center pr-10">{t('Pengaturan')}</h2>
            </div>
            
            <div className="p-4 space-y-6">
               <div>
                  <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-3 px-2">{t('Tampilan')}</h3>
                  <div className="bg-slate-50 dark:bg-[#121212] border border-slate-200 dark:border-white/5 rounded-2xl overflow-hidden flex flex-col">
                     <button onClick={() => setIsDark(!isDark)} className="w-full flex items-center justify-between p-4 hover:bg-slate-100 dark:hover:bg-white/5 transition-colors border-b border-slate-200 dark:border-white/5 group">
                        <div className="flex items-center gap-4">
                           <div className="p-2 rounded-full bg-amber-50 dark:bg-amber-500/10 text-amber-500">
                              {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
                           </div>
                           <span className="text-[15px] font-semibold text-slate-800 dark:text-slate-200">{t('Mode Gelap')}</span>
                        </div>
                        <div className={`w-12 h-6 rounded-full relative transition-colors ${isDark ? 'bg-indigo-500' : 'bg-slate-300 dark:bg-slate-700'}`}>
                           <motion.div 
                             layout 
                             className={`w-4 h-4 bg-white rounded-full absolute top-1 ${isDark ? 'right-1' : 'left-1'}`} 
                           />
                        </div>
                     </button>
                  </div>
               </div>
               <div>
                  <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-3 px-2">{t('Bahasa')}</h3>
                  <div className="bg-slate-50 dark:bg-[#121212] border border-slate-200 dark:border-white/5 rounded-2xl overflow-hidden p-3.5 space-y-2">
                     <div className="flex items-center gap-3 mb-1 px-1">
                        <div className="p-2 rounded-full bg-blue-50 dark:bg-blue-500/10 text-blue-500">
                           <Globe className="w-4 h-4" />
                        </div>
                        <span className="text-xs font-bold text-slate-700 dark:text-slate-300">{t('Pilih Bahasa')}</span>
                     </div>
                     <select 
                        value={getLang()} 
                        onChange={(e) => setLang(e.target.value)}
                        className="w-full bg-white dark:bg-[#0b0f19] border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2.5 text-xs text-slate-900 dark:text-white focus:border-indigo-500 focus:outline-none transition-colors"
                     >
                        <option value="id">🇮🇩 Bahasa Indonesia</option>
                        <option value="en">🇺🇸 English</option>
                        <option value="su">🇮🇩 Basa Sunda</option>
                        <option value="jv">🇮🇩 Basa Jawa</option>
                        <option value="ms">🇲🇾 Bahasa Melayu</option>
                        <option value="ja">🇯🇵 日本語 (Japanese)</option>
                        <option value="ko">🇰🇷 한국어 (Korean)</option>
                        <option value="ru">🇷🇺 Русский (Russian)</option>
                        <option value="fa">🇮🇷 فارسی (Persian)</option>
                        <option value="ar">🇸🇦 العربية (Arabic)</option>
                     </select>
                  </div>
               </div>
               <div>
                  <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-3 px-2">{t('Aplikasi')}</h3>
                  <div className="bg-slate-50 dark:bg-[#121212] border border-slate-200 dark:border-white/5 rounded-2xl overflow-hidden flex flex-col">
                     {settings?.enableHistory !== false && (
                       <button onClick={() => { onClose(); onOpenHistory(); }} className="w-full flex items-center justify-between p-4 hover:bg-slate-100 dark:hover:bg-white/5 transition-colors border-b border-slate-200 dark:border-white/5 group">
                          <div className="flex items-center gap-4">
                             <div className="p-2 rounded-full bg-blue-50 dark:bg-blue-500/10 text-blue-500 dark:text-blue-400">
                                <History className="w-5 h-5" />
                             </div>
                             <span className="text-[15px] font-semibold text-slate-800 dark:text-slate-200">{t('Riwayat Download')}</span>
                          </div>
                          <ChevronRight className="w-5 h-5 text-slate-400 dark:text-slate-600" />
                       </button>
                     )}
                     <button onClick={() => { onClose(); onOpenRating(); }} className={`w-full flex items-center justify-between p-4 hover:bg-slate-100 dark:hover:bg-white/5 transition-colors group ${settings?.enableHistory === false ? '' : 'border-t border-slate-200 dark:border-white/5'}`}>
                        <div className="flex items-center gap-4">
                           <div className="p-2 rounded-full bg-amber-50 dark:bg-amber-500/10 text-amber-500 dark:text-amber-400">
                              <Star className="w-5 h-5" />
                           </div>
                           <span className="text-[15px] font-semibold text-slate-800 dark:text-slate-200">{t('Beri Kami Rating')}</span>
                        </div>
                        <ChevronRight className="w-5 h-5 text-slate-400 dark:text-slate-600" />
                     </button>
                     <button onClick={() => { onClose(); onOpenFeedback(); }} className="w-full flex items-center justify-between p-4 hover:bg-slate-100 dark:hover:bg-white/5 transition-colors group border-t border-slate-200 dark:border-white/5">
                        <div className="flex items-center gap-4">
                           <div className="p-2 rounded-full bg-purple-50 dark:bg-purple-500/10 text-purple-500 dark:text-purple-400">
                              <MessageCircle className="w-5 h-5" />
                           </div>
                           <span className="text-[15px] font-semibold text-slate-800 dark:text-slate-200">{t('Masukan & Lapor Bug')}</span>
                        </div>
                        <ChevronRight className="w-5 h-5 text-slate-400 dark:text-slate-600" />
                     </button>
                     {settings?.updateNotificationActive !== false && (
                       <button onClick={() => { onClose(); onOpenUpdate(); }} className="w-full flex items-center justify-between p-4 hover:bg-slate-100 dark:hover:bg-white/5 transition-colors group border-t border-slate-200 dark:border-white/5">
                          <div className="flex items-center gap-4">
                             <div className="p-2 rounded-full bg-indigo-50 dark:bg-indigo-500/10 text-indigo-500 dark:text-indigo-400 relative">
                                <Bell className="w-5 h-5" />
                                <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-rose-500 animate-ping" />
                             </div>
                             <div>
                                <span className="text-[15px] font-semibold text-slate-800 dark:text-slate-200 block">{t('Status Update')}</span>
                                <span className="text-[11px] text-indigo-500 font-bold">{settings?.updateVersion || 'v2.5.0'} Aktif</span>
                             </div>
                          </div>
                          <ChevronRight className="w-5 h-5 text-slate-400 dark:text-slate-600" />
                       </button>
                     )}
                  </div>
               </div>
               {user?.email === "jrnabil570@gmail.com" && (
               <div>
                 <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-3 px-2">{t('Keamanan & Sistem')}</h3>
                 <div className="bg-slate-50 dark:bg-[#121212] border border-slate-200 dark:border-white/5 rounded-2xl overflow-hidden flex flex-col">
                     <button onClick={() => { onClose(); onOpenAdmin(); }} className="w-full flex items-center justify-between p-4 hover:bg-slate-100 dark:hover:bg-white/5 transition-colors border-b border-slate-200 dark:border-white/5 group">
                        <div className="flex items-center gap-4">
                           <div className="p-2 rounded-full bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400">
                              <Shield className="w-5 h-5" />
                           </div>
                           <span className="text-[15px] font-semibold text-slate-800 dark:text-slate-200">{t('Pengaturan Akun (Admin)')}</span>
                        </div>
                        <ChevronRight className="w-5 h-5 text-slate-400 dark:text-slate-600" />
                     </button>
                 </div>
               </div>
               )}

               <div className="mt-6">
                 <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-3 px-2">{t('Tentang')}</h3>
                 <div className="bg-slate-50 dark:bg-[#121212] border border-slate-200 dark:border-white/5 rounded-2xl overflow-hidden flex flex-col">
                     <button onClick={() => { onClose(); onOpenAbout(); }} className="w-full flex items-center justify-between p-4 hover:bg-slate-100 dark:hover:bg-white/5 transition-colors group border-b border-slate-200 dark:border-white/5">
                        <div className="flex items-center gap-4">
                           <div className="p-2 rounded-full bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400">
                              <Sparkles className="w-5 h-5" />
                           </div>
                           <span className="text-[15px] font-semibold text-slate-800 dark:text-slate-200">{t('Tentang Aplikasi')}</span>
                        </div>
                        <ChevronRight className="w-5 h-5 text-slate-400 dark:text-slate-600" />
                     </button>
                     <button onClick={() => { onClose(); onOpenInfo(); }} className="w-full flex items-center justify-between p-4 hover:bg-slate-100 dark:hover:bg-white/5 transition-colors group">
                        <div className="flex items-center gap-4">
                           <div className="p-2 rounded-full bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                              <Info className="w-5 h-5" />
                           </div>
                           <span className="text-[15px] font-semibold text-slate-800 dark:text-slate-200">{t('Informasi Pengembang')}</span>
                        </div>
                        <ChevronRight className="w-5 h-5 text-slate-400 dark:text-slate-600" />
                     </button>
                 </div>
               </div>
               </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

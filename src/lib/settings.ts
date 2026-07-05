export interface FAQItem {
  id: string;
  question: string;
  answer: string;
}

export interface PremiumPlan {
  id: string;
  days: number;
  cost: number;
  label: string;
  desc: string;
}

export interface SiteSettings {
  brandTitle: string;
  brandDesc: string;
  devName: string;
  contactEmail: string;
  announcement: string;
  seoKeywords: string;
  footerText: string;
  videoBadgeText: string;
  enableHistory: boolean;
  infoProfileName: string;
  infoProfileRole: string;
  infoAboutText: string;
  infoFeatures: string;
  infoDevName: string;
  infoDevDesc: string;
  infoSocialGithub: string;
  infoSocialTelegram: string;
  infoSocialInstagram: string;
  infoSocialYoutube: string;
  infoSocialWhatsapp: string;
  infoSocialTiktok: string;
  infoTechStack: string;
  youtubeBrandTitle: string;
  youtubeBrandDesc: string;
  tiktokPlaceholder: string;
  youtubePlaceholder: string;
  maintenanceMode: boolean;
  maintenanceTitle: string;
  maintenanceMessage: string;
  maintenanceEndTime?: number;
  emergencyBannerActive: boolean;
  emergencyBannerMessage: string;
  filenameFormat?: string;
  updateNotificationActive?: boolean;
  updateVersion?: string;
  updateTitle?: string;
  updateMessage?: string;
  faqs: FAQItem[];
  apiProviders: {
    tiktok: string;
    youtube: string;
  };
  adminPassword?: string;
  registerPointsReward: number;
  downloadPointsReward: number;
  premiumCost0Day: number;
  premiumCost1Day: number;
  premiumCost7Days: number;
  premiumCost30Days: number;
  showAdsForNonPremium: boolean;
  premiumPlans: PremiumPlan[];
}

const DEFAULT_SETTINGS: SiteSettings = {
  brandTitle: 'SaveTik',
  brandDesc: 'Fast, Secure & No Watermark',
  devName: 'Nabil Assihidiqi',
  contactEmail: 'admin@example.com',
  announcement: '',
  seoKeywords: 'tiktok downloader, youtube downloader, ig downloader',
  footerText: 'Menggunakan API Publik',
  videoBadgeText: 'TikTok',
  enableHistory: true,
  infoProfileName: 'Nabil Assihidiqi',
  infoProfileRole: 'Full-Stack Developer',
  infoAboutText: 'Platform download video TikTok tanpa watermark dengan kualitas HD. Cepat, aman, dan tanpa login.',
  infoFeatures: 'No Watermark, HD Quality, Gratis, Aman',
  infoDevName: 'Nabil Assihidiqi',
  infoDevDesc: 'Pengembang web & mobile application. Fokus pada pengalaman pengguna yang modern dan intuitif.',
  infoSocialGithub: 'https://github.com',
  infoSocialTelegram: 'https://t.me',
  infoSocialInstagram: 'https://instagram.com',
  infoSocialYoutube: 'https://youtube.com',
  infoSocialWhatsapp: 'https://wa.me',
  infoSocialTiktok: 'https://tiktok.com',
  infoTechStack: 'HTML5, Tailwind CSS, JavaScript, API',
  youtubeBrandTitle: 'SaveTube',
  youtubeBrandDesc: 'Download Video YouTube HD',
  tiktokPlaceholder: 'Tempel link tiktok di sini...',
  youtubePlaceholder: 'Tempel link youtube di sini...',
  maintenanceMode: false,
  maintenanceTitle: 'Maintenance',
  maintenanceMessage: 'Mohon maaf, website sedang dalam perbaikan. Kami akan segera kembali.',
  emergencyBannerActive: false,
  emergencyBannerMessage: 'Pengumuman Penting: Server sedang mengalami kendala jaringan.',
  filenameFormat: '[Tanggal]_[Penulis]_[Judul]',
  updateNotificationActive: true,
  updateVersion: 'v2.5.0',
  updateTitle: 'Update Fitur Baru Tersedia!',
  updateMessage: 'Nikmati penamaan file otomatis yang bisa dikustomisasi, statistik kreator di profil, halaman Tentang aplikasi, dan pelaporan masukan/bug secara langsung!',
  faqs: [
    { id: '1', question: 'Apakah layanan ini gratis?', answer: 'Ya, layanan 100% gratis tanpa batasan.' },
    { id: '2', question: 'Kenapa video gagal didownload?', answer: 'Pastikan URL valid dan video tidak di-private.' }
  ],
  apiProviders: {
    tiktok: 'siputzx',
    youtube: 'siputzx'
  },
  adminPassword: 'admin',
  registerPointsReward: 50,
  downloadPointsReward: 10,
  premiumCost0Day: 0,
  premiumCost1Day: 100,
  premiumCost7Days: 1000,
  premiumCost30Days: 5000,
  showAdsForNonPremium: true,
  premiumPlans: [
    { id: 'reset', days: 0, cost: 0, label: '0 Hari (Reset/Hapus Premium)', desc: 'Kembali ke Member Biasa (Untuk Test Iklan)' },
    { id: '1day', days: 1, cost: 100, label: '1 Hari Premium', desc: 'Bebas Iklan + Kecepatan Tinggi' },
    { id: '7days', days: 7, cost: 1000, label: '7 Hari Premium', desc: 'Bebas Iklan + Kecepatan Tinggi' },
    { id: '30days', days: 30, cost: 5000, label: '1 Bulan Premium', desc: 'Bebas Iklan + Kecepatan Tinggi' }
  ]
};

export function getSettings(): SiteSettings {
  try {
    const saved = localStorage.getItem('savetik_settings');
    if (saved) {
      const parsed = JSON.parse(saved);
      return { 
        ...DEFAULT_SETTINGS, 
        ...parsed,
        premiumPlans: parsed.premiumPlans || DEFAULT_SETTINGS.premiumPlans
      };
    }
  } catch (e) {}
  return DEFAULT_SETTINGS;
}

export function saveSettings(settings: SiteSettings) {
  localStorage.setItem('savetik_settings', JSON.stringify(settings));
}

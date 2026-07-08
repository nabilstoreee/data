import { db } from './firebase';
import { collection, getDocs, doc, setDoc, deleteDoc, writeBatch } from 'firebase/firestore';

export interface BrandAd {
  id: string;
  title: string;
  desc: string;
  sponsor: string;
  domain: string;
  videoUrl: string;
  ctaText: string;
  ctaUrl: string;
  logoEmoji: string;
  logoBg: string;
  accentBg: string;
  accentText: string;
  duration: number;
  category: string;
  rating: string;
  downloads: string;
  tagline: string;
  logoUrl?: string;
}

// Highly stable, fast Google Cloud Storage sample videos aligned to themes for instant playback & no CORS errors
export const MOCK_VIDEO_ADS: BrandAd[] = [
  {
    id: 'shopee',
    title: 'Shopee Live Diskon Murah 24 Jam! 🧡',
    desc: 'Belanja semua kebutuhan serba Rp0! Nikmati Gratis Ongkir tanpa minimum belanja ke seluruh Indonesia dan diskon kilat harian s.d 90%. Buruan Checkout barang impianmu sekarang!',
    sponsor: 'Shopee Indonesia',
    domain: 'shopee.co.id',
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
    ctaText: 'BUKA SHOPEE APP',
    ctaUrl: 'https://shopee.co.id',
    logoEmoji: '🛍️',
    logoBg: 'bg-[#EE4D2D]',
    accentBg: 'bg-[#EE4D2D] hover:bg-[#D73C1C] focus:ring-[#EE4D2D]/50',
    accentText: 'text-[#EE4D2D]',
    duration: 6,
    category: 'Belanja / Shopping',
    rating: '4.8 ★',
    downloads: '100JT+ Unduhan',
    tagline: 'Gratis Ongkir Rp0 Se-Indonesia'
  },
  {
    id: 'lazada',
    title: 'Lazada Mega Gajian Sale! ⚡',
    desc: 'Diskon terbesar akhir bulan s.d 85% + voucher bonus dadakan hingga Rp500rb. Nikmati pengiriman cepat gratis ongkir tanpa syarat se-Indonesia! Belanja seru hanya di Lazada.',
    sponsor: 'Lazada Indonesia',
    domain: 'lazada.co.id',
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyrides.mp4',
    ctaText: 'BELANJA DI LAZADA',
    ctaUrl: 'https://lazada.co.id',
    logoEmoji: '💎',
    logoBg: 'bg-gradient-to-tr from-[#101566] to-[#000080]',
    accentBg: 'bg-[#000080] hover:bg-[#000066] focus:ring-[#000080]/50',
    accentText: 'text-[#000080]',
    duration: 8,
    category: 'Belanja / Shopping',
    rating: '4.7 ★',
    downloads: '100JT+ Unduhan',
    tagline: 'Lazada Tambah Mulia, Tambah Diskon!'
  },
  {
    id: 'ajaib',
    title: 'Ajaib Investasi Saham & Kripto Terpercaya 📈',
    desc: 'Mulai investasi masa depanmu dengan mudah! Transaksi saham, reksa dana, dan kripto dalam satu aplikasi aman, berizin, dan diawasi oleh OJK. Dapatkan hadiah gratis 1 lot saham!',
    sponsor: 'Ajaib Sekuritas',
    domain: 'ajaib.co.id',
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4',
    ctaText: 'DAFTAR AJAIB SEKARANG',
    ctaUrl: 'https://ajaib.co.id',
    logoEmoji: '🧞',
    logoBg: 'bg-[#00D084]',
    accentBg: 'bg-[#00D084] hover:bg-[#00B070] focus:ring-[#00D084]/50',
    accentText: 'text-[#00D084]',
    duration: 7,
    category: 'Keuangan / Finance',
    rating: '4.9 ★',
    downloads: '10JT+ Unduhan',
    tagline: 'Pilihan Investasi Generasi Muda'
  },
  {
    id: 'mlbb',
    title: 'Mobile Legends: Skin Epic Gratis & Kolaborasi Baru! 🎮',
    desc: 'Log in sekarang ke game MOBA No. 1 di Indonesia! Rasakan pertarungan tim 5v5 yang adil, klaim skin kolaborasi gratis eksklusif, raih kemenangan bintang, dan hancurkan base lawan!',
    sponsor: 'Moonton Games',
    domain: 'mobilelegends.com',
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4',
    ctaText: 'MAIN MLBB SEKARANG',
    ctaUrl: 'https://play.google.com/store/apps/details?id=com.mobile.legends',
    logoEmoji: '⚔️',
    logoBg: 'bg-[#121E36] border border-amber-500/50',
    accentBg: 'bg-[#D4AF37] text-slate-950 hover:bg-[#C5A02E] focus:ring-[#D4AF37]/50',
    accentText: 'text-[#D4AF37]',
    duration: 10,
    category: 'Game Aksi / MOBA',
    rating: '4.6 ★',
    downloads: '500JT+ Unduhan',
    tagline: 'Main Bareng Teman & Menangkan Savage!'
  },
  {
    id: 'hok',
    title: 'Honor of Kings: Game MOBA No. 1 di Dunia! 👑',
    desc: 'Nikmati pertempuran tim 5v5 yang adil sejati! Kontrol yang sangat responsif, ping super stabil di server Asia, grafis ultra HD yang memukau, dan dapatkan puluhan hero legendaris GRATIS!',
    sponsor: 'Level Infinite',
    domain: 'honorofkings.com',
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4',
    ctaText: 'DOWNLOAD HOK GRATIS',
    ctaUrl: 'https://play.google.com/store/apps/details?id=com.levelinfinite.sgameGlobal',
    logoEmoji: '🛡️',
    logoBg: 'bg-gradient-to-br from-[#EE9F3E] to-[#B02F23]',
    accentBg: 'bg-[#EE9F3E] text-slate-950 hover:bg-[#DF8F2E] focus:ring-[#EE9F3E]/50',
    accentText: 'text-[#EE9F3E]',
    duration: 8,
    category: 'Game Aksi / MOBA',
    rating: '4.8 ★',
    downloads: '50JT+ Unduhan',
    tagline: 'MOBA Adil Sejati Dengan Grafis Ultra HD'
  },
  {
    id: 'ff',
    title: 'Free Fire: Booyah Adrenaline Rush! 🔥',
    desc: 'Turun ke medan tempur 10 menit bersama 49 pemain lain! Bertahan hidup, temukan senjata terbaik, gunakan Gloo Wall secara taktis, dan jadilah yang terakhir berdiri untuk BOOYAH!',
    sponsor: 'Garena Free Fire',
    domain: 'ff.garena.com',
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4',
    ctaText: 'KLAIM BUNDLE GRATIS',
    ctaUrl: 'https://play.google.com/store/apps/details?id=com.dts.freefireth',
    logoEmoji: '🔫',
    logoBg: 'bg-gradient-to-r from-[#FF3F00] to-[#FF8C00]',
    accentBg: 'bg-gradient-to-r from-[#FF3F00] to-[#FF8C00] hover:brightness-110 focus:ring-[#FF3F00]/50',
    accentText: 'text-[#FF3F00]',
    duration: 9,
    category: 'Game Battle Royale',
    rating: '4.5 ★',
    downloads: '1M+ Unduhan',
    tagline: 'Pertempuran Sengit 10 Menit, Jadilah Booyah!'
  },
  {
    id: 'pubg',
    title: 'PUBG Mobile: Era Kolaborasi Tematik Baru! 🪂',
    desc: 'Rasakan baku tembak paling realistis di ponsel pintar Anda! Masuki peta klasik Erangel yang penuh dengan tantangan baru, kendaraan mutakhir, senjata taktis, dan kustomisasi skin keren!',
    sponsor: 'Tencent Games',
    domain: 'pubgmobile.com',
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4',
    ctaText: 'MULAI BATTLE ROYALE',
    ctaUrl: 'https://play.google.com/store/apps/details?id=com.tencent.ig',
    logoEmoji: '🍳',
    logoBg: 'bg-[#FFC107] text-slate-900',
    accentBg: 'bg-[#FFC107] text-slate-950 hover:bg-[#E0A800] focus:ring-[#FFC107]/50',
    accentText: 'text-[#FFC107]',
    duration: 10,
    category: 'Game Shooter / Royale',
    rating: '4.6 ★',
    downloads: '500JT+ Unduhan',
    tagline: 'Winner Winner Chicken Dinner!'
  },
  {
    id: 'tiktok',
    title: 'TikTok: Temukan Kreativitas Tanpa Batas! 📱',
    desc: 'Tonton jutaan video kreatif, tren audio viral terbaru, dan konten seru langsung di FYP Anda! Berkreasilah dengan filter menakjubkan atau belanja murah berkualitas di TikTok Shop!',
    sponsor: 'TikTok Inc.',
    domain: 'tiktok.com',
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4',
    ctaText: 'BUKA TIKTOK APP',
    ctaUrl: 'https://tiktok.com',
    logoEmoji: '🖤',
    logoBg: 'bg-slate-950 border border-slate-800',
    accentBg: 'bg-white text-slate-950 hover:bg-slate-100 focus:ring-white/50',
    accentText: 'text-white',
    duration: 6,
    category: 'Sosial / Video Pendek',
    rating: '4.8 ★',
    downloads: '1M+ Unduhan',
    tagline: 'Mulailah Hari Menyenangkanmu di FYP'
  },
  {
    id: 'capcut',
    title: 'CapCut: Edit Video Viral Sekali Klik! 🎬',
    desc: 'Gunakan ribuan template jedag-jedug gratis yang sedang trending di TikTok! Tambahkan musik viral, transisi estetik, efek bertenaga AI, dan ekspor video HD instan tanpa watermark!',
    sponsor: 'CapCut Video Editor',
    domain: 'capcut.com',
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
    ctaText: 'COBA TEMPLATE GRATIS',
    ctaUrl: 'https://play.google.com/store/apps/details?id=com.lemon.lvoverseas',
    logoEmoji: '🌟',
    logoBg: 'bg-gradient-to-br from-[#00F2FE] to-[#4FACFE]',
    accentBg: 'bg-[#4FACFE] hover:bg-[#3D9CE0] focus:ring-[#4FACFE]/50',
    accentText: 'text-[#4FACFE]',
    duration: 8,
    category: 'Pemutar & Editor Video',
    rating: '4.7 ★',
    downloads: '500JT+ Unduhan',
    tagline: 'Edit Video Profesional Jadi Sangat Mudah'
  },
  {
    id: 'litmatch',
    title: 'Litmatch: Cari Teman Baru & Voice Chat Room! 🌸',
    desc: 'Bergabunglah dengan ruang obrolan sosial paling hangat untuk anak muda! Temukan teman dengan minat yang sama melalui Game Jiwa, Obrolan Suara 1-on-1, dan bagikan cerita harian Anda.',
    sponsor: 'Litmatch Team',
    domain: 'litmatchapp.com',
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4',
    ctaText: 'CARI TEMAN DEKAT',
    ctaUrl: 'https://play.google.com/store/apps/details?id=com.litatom.litmatch',
    logoEmoji: '🎈',
    logoBg: 'bg-[#FF64A0]',
    accentBg: 'bg-[#FF64A0] hover:bg-[#E54D88] focus:ring-[#FF64A0]/50',
    accentText: 'text-[#FF64A0]',
    duration: 8,
    category: 'Sosial / Gaya Hidup',
    rating: '4.5 ★',
    downloads: '100JT+ Unduhan',
    tagline: 'Komunitas Obrolan Aman Berbagi Cerita'
  },
  {
    id: 'instagram',
    title: 'Instagram: Dekat dengan Hal yang Anda Suka! 📸',
    desc: 'Kirim pesan instan ke teman-temanmu, tonton video pendek Reels yang menghibur, bagikan pemikiran unikmu di Threads, dan posting momen harian seru lewat Insta Stories!',
    sponsor: 'Meta Platforms',
    domain: 'instagram.com',
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerMeltdowns.mp4',
    ctaText: 'BUKA INSTAGRAM',
    ctaUrl: 'https://instagram.com',
    logoEmoji: '🪐',
    logoBg: 'bg-gradient-to-tr from-[#FFB13B] via-[#DD2A7B] to-[#812BB2]',
    accentBg: 'bg-gradient-to-tr from-[#FFB13B] via-[#DD2A7B] to-[#812BB2] hover:brightness-110 focus:ring-[#DD2A7B]/50',
    accentText: 'text-[#DD2A7B]',
    duration: 7,
    category: 'Sosial / Foto & Video',
    rating: '4.7 ★',
    downloads: '1M+ Unduhan',
    tagline: 'Ekspresikan Dirimu & Terhubung dengan Dunia'
  },
  {
    id: 'facebook',
    title: 'Facebook: Temukan Komunitas Impian Anda! 👥',
    desc: 'Terhubung dengan teman lama dan keluarga! Bergabunglah ke grup komunitas hobi lokal yang aktif, temukan barang murah berkualitas di Marketplace, dan tonton video menarik di FB Watch!',
    sponsor: 'Meta Platforms',
    domain: 'facebook.com',
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerMeltdowns.mp4',
    ctaText: 'GABUNG FACEBOOK',
    ctaUrl: 'https://facebook.com',
    logoEmoji: '👥',
    logoBg: 'bg-[#1877F2]',
    accentBg: 'bg-[#1877F2] hover:bg-[#1565C0] focus:ring-[#1877F2]/50',
    accentText: 'text-[#1877F2]',
    duration: 8,
    category: 'Sosial / Komunikasi',
    rating: '4.6 ★',
    downloads: '5M+ Unduhan',
    tagline: 'Semakin Dekat, Semakin Terhubung'
  },
  {
    id: 'x',
    title: 'X: Apa yang Sedang Terjadi di Dunia Saat Ini! 𝕏',
    desc: 'Dapatkan berita terkini secara real-time langsung dari sumbernya! Bagikan opini berani Anda, ikuti topik tren teknologi, hiburan, politik, olahraga, dan lakukan diskusi seru di X Spaces!',
    sponsor: 'X Corp.',
    domain: 'x.com',
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
    ctaText: 'JELAJAHI TREN BARU',
    ctaUrl: 'https://x.com',
    logoEmoji: '🦅',
    logoBg: 'bg-[#0F1419]',
    accentBg: 'bg-[#0F1419] border border-slate-700 hover:bg-[#1C2127] focus:ring-slate-700/50',
    accentText: 'text-[#0F1419] dark:text-white',
    duration: 7,
    category: 'Berita & Majalah',
    rating: '4.4 ★',
    downloads: '1M+ Unduhan',
    tagline: 'Alun-alun Digital Berita Global Tercepat'
  },
  {
    id: 'whatsapp',
    title: 'WhatsApp Messenger: Kirim Pesan Aman & Privat! 💬',
    desc: 'Lakukan panggilan suara dan video HD gratis ke seluruh dunia! Kirim pesan instan, kelola obrolan grup keluarga, dan bagikan pembaruan Status yang dilindungi oleh Enkripsi Ujung-ke-Ujung aman.',
    sponsor: 'Meta Platforms',
    domain: 'whatsapp.com',
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4',
    ctaText: 'BUKA WHATSAPP CHAT',
    ctaUrl: 'https://whatsapp.com',
    logoEmoji: '🟢',
    logoBg: 'bg-[#25D366]',
    accentBg: 'bg-[#25D366] hover:bg-[#1EBE55] focus:ring-[#25D366]/50',
    accentText: 'text-[#25D366]',
    duration: 6,
    category: 'Sosial / Komunikasi',
    rating: '4.8 ★',
    downloads: '5M+ Unduhan',
    tagline: 'Sederhana, Handal, Aman & Terbuka'
  }
];

const COLLECTION_NAME = 'custom_ads';

export async function getAdsFromFirestore(): Promise<BrandAd[]> {
  try {
    const colRef = collection(db, COLLECTION_NAME);
    const querySnapshot = await getDocs(colRef);
    
    if (querySnapshot.empty) {
      // Pre-populate with defaults
      const batch = writeBatch(db);
      for (const ad of MOCK_VIDEO_ADS) {
        const docRef = doc(db, COLLECTION_NAME, ad.id);
        batch.set(docRef, ad);
      }
      await batch.commit();
      return MOCK_VIDEO_ADS;
    }
    
    const ads: BrandAd[] = [];
    querySnapshot.forEach((doc) => {
      ads.push({ id: doc.id, ...doc.data() } as BrandAd);
    });
    return ads;
  } catch (e) {
    console.error("Failed to fetch ads from Firestore, fallback to mock:", e);
    return MOCK_VIDEO_ADS;
  }
}

export async function saveAdToFirestore(ad: BrandAd): Promise<void> {
  try {
    const docRef = doc(db, COLLECTION_NAME, ad.id);
    await setDoc(docRef, ad);
  } catch (e) {
    console.error("Failed to save ad to Firestore:", e);
    throw e;
  }
}

export async function deleteAdFromFirestore(adId: string): Promise<void> {
  try {
    const docRef = doc(db, COLLECTION_NAME, adId);
    await deleteDoc(docRef);
  } catch (e) {
    console.error("Failed to delete ad from Firestore:", e);
    throw e;
  }
}

export async function resetAdsToDefaultFirestore(): Promise<BrandAd[]> {
  try {
    const colRef = collection(db, COLLECTION_NAME);
    const querySnapshot = await getDocs(colRef);
    
    const batch = writeBatch(db);
    // Delete all current docs
    querySnapshot.forEach((doc) => {
      batch.delete(doc.ref);
    });
    
    // Write defaults
    for (const ad of MOCK_VIDEO_ADS) {
      const docRef = doc(db, COLLECTION_NAME, ad.id);
      batch.set(docRef, ad);
    }
    
    await batch.commit();
    return MOCK_VIDEO_ADS;
  } catch (e) {
    console.error("Failed to reset ads in Firestore:", e);
    throw e;
  }
}

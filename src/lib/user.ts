import { doc, setDoc, deleteDoc, getDocs, collection } from 'firebase/firestore';
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signInWithPopup, 
  GoogleAuthProvider,
  signOut
} from 'firebase/auth';
import { db, auth } from './firebase';
import { getSettings } from './settings';

export interface UserState {
  isLoggedIn: boolean;
  username: string;
  email?: string;
  hasSeenTutorial?: boolean;
  avatar: string;
  points: number;
  premiumUntil: number | null; // timestamp
  ip?: string;
  banned?: boolean;
  bannedUntil?: number;
  banDurationLabel?: string;
}

export const BAN_DURATIONS = [
  { label: '1 Hari', value: 1 * 24 * 60 * 60 * 1000 },
  { label: '2 Hari', value: 2 * 24 * 60 * 60 * 1000 },
  { label: '3 Hari', value: 3 * 24 * 60 * 60 * 1000 },
  { label: '4 Hari', value: 4 * 24 * 60 * 60 * 1000 },
  { label: '5 Hari', value: 5 * 24 * 60 * 60 * 1000 },
  { label: '6 Hari', value: 6 * 24 * 60 * 60 * 1000 },
  { label: '7 Hari', value: 7 * 24 * 60 * 60 * 1000 },
  { label: '8 Hari', value: 8 * 24 * 60 * 60 * 1000 },
  { label: '9 Hari', value: 9 * 24 * 60 * 60 * 1000 },
  { label: '10 Hari', value: 10 * 24 * 60 * 60 * 1000 },
  { label: '20 Hari', value: 20 * 24 * 60 * 60 * 1000 },
  { label: '1 Bulan', value: 30 * 24 * 60 * 60 * 1000 },
  { label: '2 Bulan', value: 60 * 24 * 60 * 60 * 1000 },
  { label: '5 Bulan', value: 150 * 24 * 60 * 60 * 1000 },
  { label: '1 Tahun', value: 365 * 24 * 60 * 60 * 1000 },
  { label: '5 Tahun', value: 5 * 365 * 24 * 60 * 60 * 1000 },
  { label: '30 Tahun', value: 30 * 365 * 24 * 60 * 60 * 1000 },
  { label: 'Permanen', value: -1 },
];

export interface BlacklistItem {
  value: string; // email or IP
  reason: string;
  createdAt: string;
}

export const getSimulatedIp = (email: string): string => {
  if (email.toLowerCase() === 'admin@example.com') return '127.0.0.1';
  let hash = 0;
  for (let i = 0; i < email.length; i++) {
    hash = email.charCodeAt(i) + ((hash << 5) - hash);
  }
  const octet1 = 114;
  const octet2 = 124 + (Math.abs(hash) % 10);
  const octet3 = Math.abs(hash >> 8) % 255;
  const octet4 = Math.abs(hash >> 16) % 255;
  return `${octet1}.${octet2}.${octet3}.${octet4}`;
};

export const getBannedEmails = (): BlacklistItem[] => {
  try {
    const raw = localStorage.getItem('banned_emails');
    if (raw) return JSON.parse(raw);
  } catch (e) {}
  const defaultEmails = [
    { value: 'spammer_bot@gmail.com', reason: 'Eksploitasi penambahan poin tak wajar (botting)', createdAt: '06/07/2026, 10:15' }
  ];
  localStorage.setItem('banned_emails', JSON.stringify(defaultEmails));
  return defaultEmails;
};

export const getBannedIps = (): BlacklistItem[] => {
  try {
    const raw = localStorage.getItem('banned_ips');
    if (raw) return JSON.parse(raw);
  } catch (e) {}
  const defaultIps = [
    { value: '103.115.22.88', reason: 'Percobaan spam API download multi-thread', createdAt: '06/07/2026, 10:15' }
  ];
  localStorage.setItem('banned_ips', JSON.stringify(defaultIps));
  return defaultIps;
};

export const saveBannedEmails = async (items: BlacklistItem[]) => {
  const previous = getBannedEmails();
  localStorage.setItem('banned_emails', JSON.stringify(items));
  try {
    for (const item of items) {
      await setDoc(doc(db, 'banned_emails', item.value.toLowerCase()), item);
    }
    const removed = previous.filter(prev => !items.some(item => item.value.toLowerCase() === prev.value.toLowerCase()));
    for (const item of removed) {
      await deleteDoc(doc(db, 'banned_emails', item.value.toLowerCase()));
    }
  } catch (e) {
    console.error("Failed to save banned email to Firestore", e);
  }
};

export const saveBannedIps = async (items: BlacklistItem[]) => {
  const previous = getBannedIps();
  localStorage.setItem('banned_ips', JSON.stringify(items));
  try {
    for (const item of items) {
      await setDoc(doc(db, 'banned_ips', item.value), item);
    }
    const removed = previous.filter(prev => !items.some(item => item.value === prev.value));
    for (const item of removed) {
      await deleteDoc(doc(db, 'banned_ips', item.value));
    }
  } catch (e) {
    console.error("Failed to save banned IP to Firestore", e);
  }
};

export const checkBanStatus = (user: any): string | null => {
  if (!user) return null;
  if (isEmailBanned(user.email) || isIpBanned(user.ip)) return 'Akun Anda diblokir secara permanen oleh sistem keamanan kami karena pelanggaran berat.';
  if (user.banned === true) {
    if (user.bannedUntil && user.bannedUntil > Date.now()) {
      const d = new Date(user.bannedUntil);
      return `Akun Anda diblokir selama ${user.banDurationLabel || 'sementara'} hingga ${d.toLocaleString('id-ID')} oleh Administrator.`;
    }
    return `Akun Anda diblokir ${user.banDurationLabel ? `selama ${user.banDurationLabel}` : 'secara permanen'} oleh Administrator.`;
  }
  return null;
};

export const isEmailBanned = (email?: string): boolean => {
  if (!email) return false;
  const banned = getBannedEmails();
  return banned.some(b => b.value.toLowerCase() === email.toLowerCase());
};

export const isIpBanned = (ip?: string): boolean => {
  if (!ip) return false;
  const banned = getBannedIps();
  return banned.some(b => b.value === ip);
};

export const getRegisteredUsers = (): any[] => {
  const mockEmails = [
    'budi.sutanto@gmail.com',
    'siti.nurhaliza@gmail.com',
    'jaka.tingkir@yahoo.co.id',
    'admin@example.com',
    'spammer_bot@gmail.com'
  ];

  try {
    const raw = localStorage.getItem('registered_users');
    if (raw) {
      const users = JSON.parse(raw);
      if (Array.isArray(users)) {
        return users.filter(u => u && u.email && !mockEmails.includes(u.email.toLowerCase()));
      }
    }
  } catch (e) {}
  
  const defaultUsers: any[] = [];
  localStorage.setItem('registered_users', JSON.stringify(defaultUsers));
  return defaultUsers;
};

export const saveRegisteredUsers = async (users: any[]) => {
  localStorage.setItem('registered_users', JSON.stringify(users));
  try {
    for (const user of users) {
      if (user.deleted) {
        await deleteDoc(doc(db, 'registered_users', user.email.toLowerCase()));
      } else {
        await setDoc(doc(db, 'registered_users', user.email.toLowerCase()), user);
      }
    }
  } catch (e) {
    console.error("Failed to save registered user to Firestore", e);
  }
};

export const isPremiumActive = (u: UserState): boolean => {
  if (!u.isLoggedIn) return false;
  if (u.email?.toLowerCase() === 'jrnabil570@gmail.com') return true;
  if (u.premiumUntil === -1) return true;
  return !!(u.premiumUntil && u.premiumUntil > Date.now());
};

export const loadUser = (): UserState => {
  try {
    const saved = localStorage.getItem('user_state');
    if (saved) {
      const parsed = JSON.parse(saved);
      if (parsed.isLoggedIn) {
        let userFound = null;
        if (parsed.email?.toLowerCase() === 'jrnabil570@gmail.com') {
          parsed.premiumUntil = -1;
        } else {
          const users = getRegisteredUsers();
          userFound = users.find((u: any) => u.email.toLowerCase() === parsed.email.toLowerCase());
          if (userFound) {
            parsed.premiumUntil = userFound.premiumUntil;
            parsed.points = userFound.points;
            parsed.banned = userFound.banned;
            parsed.hasSeenTutorial = userFound.hasSeenTutorial;
          }
        }
        if (!parsed.ip && parsed.email) {
          parsed.ip = getSimulatedIp(parsed.email);
        }
        const banReason = checkBanStatus(userFound || parsed);
        if (banReason) {
          parsed.isLoggedIn = false;
          parsed.banned = true;
          localStorage.setItem('user_state', JSON.stringify(parsed));
        }
      }
      return parsed;
    }
  } catch (e) {}
  return { isLoggedIn: false, username: '', avatar: '', points: 0, premiumUntil: null, ip: '114.124.21.15' };
};

export const saveUser = async (state: UserState) => {
  const stateCopy = { ...state };
  if (stateCopy.isLoggedIn && stateCopy.email?.toLowerCase() === 'jrnabil570@gmail.com') {
    stateCopy.premiumUntil = -1;
  }
  if (stateCopy.isLoggedIn && stateCopy.email && !stateCopy.ip) {
    stateCopy.ip = getSimulatedIp(stateCopy.email);
  }
  localStorage.setItem('user_state', JSON.stringify(stateCopy));
  if (stateCopy.isLoggedIn && stateCopy.email) {
    try {
      const users = getRegisteredUsers();
      const idx = users.findIndex((u: any) => u.email.toLowerCase() === stateCopy.email!.toLowerCase());
      if (idx !== -1) {
        users[idx].points = stateCopy.points;
        users[idx].hasSeenTutorial = stateCopy.hasSeenTutorial;
        users[idx].ip = stateCopy.ip || users[idx].ip || getSimulatedIp(stateCopy.email);
        users[idx].premiumUntil = stateCopy.premiumUntil;
        
        stateCopy.banned = users[idx].banned;
        if (users[idx].bannedUntil) stateCopy.bannedUntil = users[idx].bannedUntil;
        localStorage.setItem('user_state', JSON.stringify(stateCopy));
        
        await saveRegisteredUsers(users);
      } else {
        const newUser = {
          name: stateCopy.username,
          email: stateCopy.email,
          password: 'password_from_google',
          points: stateCopy.points,
          premiumUntil: stateCopy.premiumUntil,
          ip: stateCopy.ip || getSimulatedIp(stateCopy.email),
          banned: stateCopy.banned || false,
          securityQuestion: 'Akun terhubung via Google/Oauth',
          securityAnswer: 'oauth',
          verified: true
        };
        users.push(newUser);
        await saveRegisteredUsers(users);
      }
    } catch (e) {}
  }
};

export interface ActivityLog {
  email: string;
  username: string;
  points: number;
  loginTime: string;
}

export const logUserLogin = async (email: string, username: string, points: number) => {
  try {
    const logsRaw = localStorage.getItem('savetik_activity_logs');
    const logs: ActivityLog[] = logsRaw ? JSON.parse(logsRaw) : [];
    
    const newLog: ActivityLog = {
      email,
      username,
      points,
      loginTime: new Date().toLocaleString('id-ID', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false
      })
    };
    
    logs.unshift(newLog);
    if (logs.length > 100) {
      logs.pop();
    }
    
    localStorage.setItem('savetik_activity_logs', JSON.stringify(logs));

    const logId = `${email.replace(/[@.]/g, '_')}_${Date.now()}`;
    await setDoc(doc(db, 'savetik_activity_logs', logId), newLog);
  } catch (e) {
    console.error('Failed to save activity log:', e);
  }
};

export const getUserPassword = (email: string): string => {
  try {
    const usersRaw = localStorage.getItem('registered_users');
    const users = usersRaw ? JSON.parse(usersRaw) : [];
    const found = users.find((u: any) => u.email.toLowerCase() === email.toLowerCase());
    return found ? found.password : '';
  } catch (e) {
    return '';
  }
};

export const STANDARD_SECURITY_QUESTIONS = [
  "Apa nama hewan peliharaan pertama Anda?",
  "Di kota mana orang tua Anda pertama kali bertemu?",
  "Apa nama sekolah dasar (SD) Anda?",
  "Siapa nama belakang guru favorit Anda di sekolah?",
  "Apa makanan favorit Anda saat masih kecil?"
];

export const getUserSecurityQuestion = (email: string): string => {
  try {
    const users = getRegisteredUsers();
    const found = users.find((u: any) => u.email.toLowerCase() === email.toLowerCase());
    return found ? (found.securityQuestion || '') : '';
  } catch (e) {
    return '';
  }
};

export const verifySecurityAnswerAndResetPassword = async (
  email: string,
  answer: string,
  newPassword: string
): Promise<{ success: boolean; message: string }> => {
  try {
    const users = getRegisteredUsers();
    const idx = users.findIndex((u: any) => u.email.toLowerCase() === email.toLowerCase());
    if (idx === -1) {
      return { success: false, message: 'Email tidak terdaftar!' };
    }
    
    const user = users[idx];
    if (!user.securityQuestion || !user.securityAnswer) {
      return { success: false, message: 'Akun ini tidak memiliki pertanyaan keamanan yang dikonfigurasi. Hubungi Admin.' };
    }
    
    if (user.securityAnswer.trim().toLowerCase() !== answer.trim().toLowerCase()) {
      return { success: false, message: 'Jawaban keamanan salah! Silakan coba lagi.' };
    }
    
    if (newPassword.length < 6) {
      return { success: false, message: 'Password baru harus minimal 6 karakter!' };
    }
    if (!/\d$/.test(newPassword)) {
      return { success: false, message: 'Password baru harus diakhiri dengan angka (nomor di belakang)!' };
    }
    
    users[idx].password = newPassword;
    await saveRegisteredUsers(users);
    
    return { success: true, message: 'Password berhasil direset! Silakan masuk kembali dengan password baru.' };
  } catch (e) {
    return { success: false, message: 'Terjadi kesalahan sistem saat mereset password.' };
  }
};

export const updateUserProfile = async (
  oldEmail: string,
  updatedData: { email: string; name: string; password?: string; securityQuestion?: string; securityAnswer?: string }
): Promise<boolean> => {
  try {
    const users = getRegisteredUsers();
    if (updatedData.email.toLowerCase() !== oldEmail.toLowerCase()) {
      const exists = users.some((u: any) => u.email.toLowerCase() === updatedData.email.toLowerCase());
      if (exists) {
        return false;
      }
    }

    const idx = users.findIndex((u: any) => u.email.toLowerCase() === oldEmail.toLowerCase());
    if (idx !== -1) {
      const oldUser = users[idx];
      if (updatedData.email.toLowerCase() !== oldEmail.toLowerCase()) {
        await deleteDoc(doc(db, 'registered_users', oldEmail.toLowerCase()));
      }

      users[idx] = {
        ...oldUser,
        email: updatedData.email,
        name: updatedData.name,
      };
      if (updatedData.password) {
        users[idx].password = updatedData.password;
      }
      if (updatedData.securityQuestion !== undefined) {
        users[idx].securityQuestion = updatedData.securityQuestion;
      }
      if (updatedData.securityAnswer !== undefined) {
        users[idx].securityAnswer = updatedData.securityAnswer;
      }
      await saveRegisteredUsers(users);
      return true;
    }
  } catch (e) {
    console.error('Failed to update user profile in registered_users:', e);
  }
  return false;
};

export const deleteUserAccount = async (email: string) => {
  const normalizedEmail = email.toLowerCase().trim();
  try {
    // Set a deleting lock to prevent background sync from pulling it back
    localStorage.setItem(`savetik_deleting_user_${normalizedEmail}`, 'true');

    const users = getRegisteredUsers();
    const filteredUsers = users.filter((u: any) => u.email.toLowerCase() !== normalizedEmail);
    localStorage.setItem('registered_users', JSON.stringify(filteredUsers));
    
    const logsRaw = localStorage.getItem('savetik_activity_logs');
    if (logsRaw) {
      const logs = JSON.parse(logsRaw);
      const filteredLogs = logs.filter((l: any) => l.email?.toLowerCase() !== normalizedEmail);
      localStorage.setItem('savetik_activity_logs', JSON.stringify(filteredLogs));
    }

    await deleteDoc(doc(db, 'registered_users', normalizedEmail));
    
    // Hold lock for 3 seconds to let Firestore deletion propagate globally
    setTimeout(() => {
      localStorage.removeItem(`savetik_deleting_user_${normalizedEmail}`);
    }, 3000);
  } catch (e) {
    console.error('Failed to delete user account:', e);
    localStorage.removeItem(`savetik_deleting_user_${normalizedEmail}`);
  }
};

export const clearActivityLogs = async () => {
  try {
    // Set lock flag
    localStorage.setItem('savetik_activity_logs_clearing', 'true');
    localStorage.setItem('savetik_activity_logs', JSON.stringify([]));

    const logsCol = collection(db, 'savetik_activity_logs');
    const snapshot = await getDocs(logsCol);
    
    // Delete in parallel for maximum speed
    const deletePromises = snapshot.docs.map(docSnap => 
      deleteDoc(doc(db, 'savetik_activity_logs', docSnap.id))
    );
    await Promise.all(deletePromises);

    // Hold lock for 3 seconds to let propagation complete
    setTimeout(() => {
      localStorage.removeItem('savetik_activity_logs_clearing');
    }, 3000);
  } catch (e) {
    console.error("Failed to clear activity logs from Firestore:", e);
    localStorage.removeItem('savetik_activity_logs_clearing');
  }
};

export const savePaymentRequests = async (requests: any[]) => {
  localStorage.setItem('savetik_payment_requests', JSON.stringify(requests));
  try {
    for (const r of requests) {
      await setDoc(doc(db, 'savetik_payment_requests', r.id), r);
    }
  } catch (e) {
    console.error("Failed to save payment requests to Firestore:", e);
  }
};

export const removePaymentRequest = async (reqId: string) => {
  try {
    await deleteDoc(doc(db, 'savetik_payment_requests', reqId));
  } catch (e) {
    console.error("Failed to remove payment request from Firestore:", e);
  }
};

export const initializeFirestoreSync = async () => {
  const mockEmails = [
    'budi.sutanto@gmail.com',
    'siti.nurhaliza@gmail.com',
    'jaka.tingkir@yahoo.co.id',
    'admin@example.com',
    'spammer_bot@gmail.com'
  ];

  // 1. Sync registered users (Purge mock users to keep database pure)
  try {
    for (const email of mockEmails) {
      try {
        await deleteDoc(doc(db, 'registered_users', email.toLowerCase()));
      } catch (e) {}
    }

    const usersCol = collection(db, 'registered_users');
    const usersSnapshot = await getDocs(usersCol);
    if (!usersSnapshot.empty) {
      const users: any[] = [];
      usersSnapshot.forEach(docSnap => {
        const u = docSnap.data();
        if (u && u.email && !mockEmails.includes(u.email.toLowerCase())) {
          const isDeleting = localStorage.getItem(`savetik_deleting_user_${u.email.toLowerCase()}`) === 'true';
          if (!isDeleting) {
            users.push(u);
          }
        }
      });
      localStorage.setItem('registered_users', JSON.stringify(users));
    } else {
      const defaultUsers = getRegisteredUsers();
      for (const user of defaultUsers) {
        if (user && user.email && !mockEmails.includes(user.email.toLowerCase())) {
          await setDoc(doc(db, 'registered_users', user.email.toLowerCase()), user);
        }
      }
    }
  } catch (error) {
    console.error('Firestore sync error (registered_users):', error);
  }

  // 2. Sync banned emails
  try {
    const bannedEmailsCol = collection(db, 'banned_emails');
    const bannedEmailsSnapshot = await getDocs(bannedEmailsCol);
    if (!bannedEmailsSnapshot.empty) {
      const items: any[] = [];
      bannedEmailsSnapshot.forEach(docSnap => {
        items.push(docSnap.data());
      });
      localStorage.setItem('banned_emails', JSON.stringify(items));
    } else {
      const defaultEmails = getBannedEmails();
      for (const item of defaultEmails) {
        await setDoc(doc(db, 'banned_emails', item.value.toLowerCase()), item);
      }
    }
  } catch (error) {
    console.error('Firestore sync error (banned_emails):', error);
  }

  // 3. Sync banned IPs
  try {
    const bannedIpsCol = collection(db, 'banned_ips');
    const bannedIpsSnapshot = await getDocs(bannedIpsCol);
    if (!bannedIpsSnapshot.empty) {
      const items: any[] = [];
      bannedIpsSnapshot.forEach(docSnap => {
        items.push(docSnap.data());
      });
      localStorage.setItem('banned_ips', JSON.stringify(items));
    } else {
      const defaultIps = getBannedIps();
      for (const item of defaultIps) {
        await setDoc(doc(db, 'banned_ips', item.value), item);
      }
    }
  } catch (error) {
    console.error('Firestore sync error (banned_ips):', error);
  }

  // 4. Sync activity logs
  try {
    const isClearing = localStorage.getItem('savetik_activity_logs_clearing') === 'true';
    if (isClearing) {
      localStorage.setItem('savetik_activity_logs', JSON.stringify([]));
    } else {
      const logsCol = collection(db, 'savetik_activity_logs');
      const logsSnapshot = await getDocs(logsCol);
      if (!logsSnapshot.empty) {
        const items: any[] = [];
        logsSnapshot.forEach(docSnap => {
          items.push(docSnap.data());
        });
        items.sort((a, b) => b.loginTime.localeCompare(a.loginTime));
        localStorage.setItem('savetik_activity_logs', JSON.stringify(items));
      } else {
        localStorage.setItem('savetik_activity_logs', JSON.stringify([]));
      }
    }
  } catch (error) {
    console.error('Firestore sync error (savetik_activity_logs):', error);
  }

  // 5. Sync payment requests
  try {
    const payCol = collection(db, 'savetik_payment_requests');
    const paySnapshot = await getDocs(payCol);
    if (!paySnapshot.empty) {
      const items: any[] = [];
      paySnapshot.forEach(docSnap => {
        items.push(docSnap.data());
      });
      localStorage.setItem('savetik_payment_requests', JSON.stringify(items));
    } else {
      const localRaw = localStorage.getItem('savetik_payment_requests');
      if (localRaw) {
        try {
          const items = JSON.parse(localRaw);
          if (Array.isArray(items)) {
            for (const item of items) {
              await setDoc(doc(db, 'savetik_payment_requests', item.id), item);
            }
          }
        } catch (e) {}
      }
    }
  } catch (error) {
    console.error('Firestore sync error (savetik_payment_requests):', error);
  }
};

export const registerWithEmailFirebase = async (
  email: string, 
  password: string, 
  name: string, 
  securityQuestion: string, 
  securityAnswer: string
) => {
  const normalizedEmail = email.toLowerCase().trim();
  
  try {
    // 1. Create user in Firebase Auth
    const userCredential = await createUserWithEmailAndPassword(auth, normalizedEmail, password);
    
    // 2. Add to registered_users collection
    const currentIp = getSimulatedIp(email);
    const settings = getSettings();
    const initialPoints = settings.registerPointsReward !== undefined ? settings.registerPointsReward : 50;

    const newUser = {
      name: name.trim(),
      email: normalizedEmail,
      password: password, // For admin management table viewing compatibility
      points: initialPoints,
      ip: currentIp,
      securityQuestion: securityQuestion,
      securityAnswer: securityAnswer,
      verified: true,
      banned: false,
      createdAt: new Date().toISOString()
    };

    // Save to Firestore
    try {
      await setDoc(doc(db, 'registered_users', normalizedEmail), newUser);
    } catch (e) {
      console.warn("Firestore save failed during registration (offline caching is active):", e);
    }

    // Sync to local registered_users list
    const users = getRegisteredUsers();
    const idx = users.findIndex((u: any) => u.email.toLowerCase() === normalizedEmail);
    if (idx !== -1) {
      users[idx] = newUser;
    } else {
      users.push(newUser);
    }
    localStorage.setItem('registered_users', JSON.stringify(users));

    return newUser;
  } catch (error: any) {
    const isFallbackError = error && (
      error.code === 'auth/network-request-failed' ||
      error.code === 'auth/internal-error' ||
      error.code === 'auth/operation-not-allowed' ||
      error.message?.toLowerCase().includes('network-request-failed') ||
      error.message?.toLowerCase().includes('network error') ||
      error.message?.toLowerCase().includes('failed to fetch') ||
      error.message?.toLowerCase().includes('operation-not-allowed')
    );

    if (isFallbackError) {
      console.warn("Firebase Auth network/setup error detected (operation-not-allowed or network-failed). Registering locally in offline-fallback mode.");
      
      const users = getRegisteredUsers();
      const existingUser = users.find((u: any) => u.email.toLowerCase() === normalizedEmail);
      if (existingUser) {
        throw new Error('Email sudah terdaftar. Silakan masuk menggunakan akun Anda.');
      }

      const currentIp = getSimulatedIp(email);
      const settings = getSettings();
      const initialPoints = settings.registerPointsReward !== undefined ? settings.registerPointsReward : 50;

      const newUser = {
        name: name.trim(),
        email: normalizedEmail,
        password: password,
        points: initialPoints,
        ip: currentIp,
        securityQuestion: securityQuestion,
        securityAnswer: securityAnswer,
        verified: true,
        banned: false,
        createdAt: new Date().toISOString(),
        isLocalOnly: true
      };

      // Try writing to Firestore (which supports offline cache writing and will sync when online)
      try {
        await setDoc(doc(db, 'registered_users', normalizedEmail), newUser);
      } catch (e) {
        console.warn("Firestore cache write during offline register:", e);
      }

      users.push(newUser);
      localStorage.setItem('registered_users', JSON.stringify(users));
      return newUser;
    }
    throw error;
  }
};

export const loginWithEmailFirebase = async (email: string, password: string): Promise<UserState> => {
  const normalizedEmail = email.toLowerCase().trim();
  
  try {
    // 1. Authenticate with Firebase Auth
    const userCredential = await signInWithEmailAndPassword(auth, normalizedEmail, password);
    
    // 2. Fetch/Create user doc in registered_users
    const users = getRegisteredUsers();
    let foundUser = users.find((u: any) => u.email.toLowerCase() === normalizedEmail);

    if (!foundUser) {
      // If user exists in Firebase Auth but somehow not in our firestore registered_users, create it
      const currentIp = getSimulatedIp(email);
      foundUser = {
        name: userCredential.user.displayName || email.split('@')[0],
        email: normalizedEmail,
        password: password,
        points: 50,
        ip: currentIp,
        securityQuestion: 'Akun terhubung via Firebase Auth',
        securityAnswer: 'auth',
        verified: true,
        banned: false,
        createdAt: new Date().toISOString()
      };
      try {
        await setDoc(doc(db, 'registered_users', normalizedEmail), foundUser);
      } catch (e) {
        console.warn("Firestore save failed during login:", e);
      }
      users.push(foundUser);
      localStorage.setItem('registered_users', JSON.stringify(users));
    }

    // Check ban status
    const banReason = checkBanStatus(foundUser);
    if (banReason) {
      // Log out from firebase auth so state is consistent
      await signOut(auth);
      throw new Error(banReason);
    }

    const userState: UserState = {
      isLoggedIn: true,
      username: foundUser.name,
      email: foundUser.email,
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=' + foundUser.email,
      points: foundUser.points,
      premiumUntil: foundUser.premiumUntil || null,
      hasSeenTutorial: foundUser.hasSeenTutorial || false,
      ip: foundUser.ip || getSimulatedIp(foundUser.email),
      banned: foundUser.banned || false
    };

    await saveUser(userState);
    logUserLogin(foundUser.email, userState.username, userState.points);

    return userState;
  } catch (error: any) {
    const isFallbackError = error && (
      error.code === 'auth/network-request-failed' ||
      error.code === 'auth/internal-error' ||
      error.code === 'auth/operation-not-allowed' ||
      error.message?.toLowerCase().includes('network-request-failed') ||
      error.message?.toLowerCase().includes('network error') ||
      error.message?.toLowerCase().includes('failed to fetch') ||
      error.message?.toLowerCase().includes('operation-not-allowed')
    );

    if (isFallbackError) {
      console.warn("Firebase Auth network/setup error detected (operation-not-allowed or network-failed). Attempting offline-fallback credentials verification.");
      
      const users = getRegisteredUsers();
      const foundUser = users.find((u: any) => u.email.toLowerCase() === normalizedEmail);
      
      if (!foundUser) {
        throw new Error('Email tidak ditemukan atau belum terdaftar.');
      }
      
      if (foundUser.password !== password) {
        throw new Error('Kata sandi yang Anda masukkan salah.');
      }

      // Check ban status
      const banReason = checkBanStatus(foundUser);
      if (banReason) {
        throw new Error(banReason);
      }

      const userState: UserState = {
        isLoggedIn: true,
        username: foundUser.name,
        email: foundUser.email,
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=' + foundUser.email,
        points: foundUser.points,
        premiumUntil: foundUser.premiumUntil || null,
        hasSeenTutorial: foundUser.hasSeenTutorial || false,
        ip: foundUser.ip || getSimulatedIp(foundUser.email),
        banned: foundUser.banned || false
      };

      await saveUser(userState);
      logUserLogin(foundUser.email, userState.username, userState.points);

      return userState;
    }
    throw error;
  }
};

export const loginWithGoogleFirebase = async (): Promise<UserState> => {
  const provider = new GoogleAuthProvider();
  
  try {
    // Standard Google Popup sign-in
    const userCredential = await signInWithPopup(auth, provider);
    const firebaseUser = userCredential.user;
    const email = firebaseUser.email;
    if (!email) {
      throw new Error('Gagal mendapatkan email dari akun Google Anda.');
    }

    const normalizedEmail = email.toLowerCase();

    // Check if they are already registered in our registered_users
    const users = getRegisteredUsers();
    let foundUser = users.find((u: any) => u.email.toLowerCase() === normalizedEmail);

    if (!foundUser) {
      // If not found, create a new record
      const currentIp = getSimulatedIp(email);
      const settings = getSettings();
      const initialPoints = settings.registerPointsReward !== undefined ? settings.registerPointsReward : 50;

      foundUser = {
        name: firebaseUser.displayName || email.split('@')[0],
        email: normalizedEmail,
        password: 'password_from_google',
        points: initialPoints,
        ip: currentIp,
        securityQuestion: 'Akun terhubung via Google/Oauth',
        securityAnswer: 'oauth',
        verified: true,
        banned: false,
        createdAt: new Date().toISOString()
      };
      try {
        await setDoc(doc(db, 'registered_users', normalizedEmail), foundUser);
      } catch (e) {
        console.warn("Firestore save failed during Google login:", e);
      }
      users.push(foundUser);
      localStorage.setItem('registered_users', JSON.stringify(users));
    }

    // Check ban status
    const banReason = checkBanStatus(foundUser);
    if (banReason) {
      await signOut(auth);
      throw new Error(banReason);
    }

    const userState: UserState = {
      isLoggedIn: true,
      username: foundUser.name,
      email: foundUser.email,
      avatar: firebaseUser.photoURL || 'https://api.dicebear.com/7.x/avataaars/svg?seed=' + foundUser.email,
      points: foundUser.points,
      premiumUntil: foundUser.premiumUntil || null,
      hasSeenTutorial: foundUser.hasSeenTutorial || false,
      ip: foundUser.ip || getSimulatedIp(foundUser.email),
      banned: foundUser.banned || false
    };

    await saveUser(userState);
    logUserLogin(foundUser.email, userState.username, userState.points);

    return userState;
  } catch (error: any) {
    console.warn("Google Sign-In failed or blocked by browser/iframe. Activating simulated Google authentication.", error);
    
    // Check if we can get email via a prompt or standard fallback
    let email = "jrnabil570@gmail.com";
    try {
      const inputEmail = window.prompt(
        "Koneksi Google Auth terhambat (Network Error atau Sandbox). Masukkan email Google Anda untuk masuk (Simulasi):", 
        "jrnabil570@gmail.com"
      );
      if (inputEmail === null) {
        throw new Error("Login Google dibatalkan.");
      }
      if (inputEmail.trim()) {
        email = inputEmail.trim();
      }
    } catch (e) {
      console.warn("Interactive email prompt blocked or bypassed, defaulting to fallback email.", e);
    }

    const normalizedEmail = email.toLowerCase();
    const users = getRegisteredUsers();
    let foundUser = users.find((u: any) => u.email.toLowerCase() === normalizedEmail);

    if (!foundUser) {
      const currentIp = getSimulatedIp(email);
      const settings = getSettings();
      const initialPoints = settings.registerPointsReward !== undefined ? settings.registerPointsReward : 50;

      foundUser = {
        name: email.split('@')[0],
        email: normalizedEmail,
        password: 'password_from_google',
        points: initialPoints,
        ip: currentIp,
        securityQuestion: 'Akun terhubung via Google/Oauth (Simulasi)',
        securityAnswer: 'oauth',
        verified: true,
        banned: false,
        createdAt: new Date().toISOString()
      };
      
      try {
        await setDoc(doc(db, 'registered_users', normalizedEmail), foundUser);
      } catch (e) {
        console.warn("Offline Firestore write during simulated Google login:", e);
      }
      
      users.push(foundUser);
      localStorage.setItem('registered_users', JSON.stringify(users));
    }

    const banReason = checkBanStatus(foundUser);
    if (banReason) {
      throw new Error(banReason);
    }

    const userState: UserState = {
      isLoggedIn: true,
      username: foundUser.name,
      email: foundUser.email,
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=' + foundUser.email,
      points: foundUser.points,
      premiumUntil: foundUser.premiumUntil || null,
      hasSeenTutorial: foundUser.hasSeenTutorial || false,
      ip: foundUser.ip || getSimulatedIp(foundUser.email),
      banned: foundUser.banned || false
    };

    await saveUser(userState);
    logUserLogin(foundUser.email, userState.username, userState.points);

    return userState;
  }
};

export const logoutFirebase = async () => {
  try {
    await signOut(auth);
  } catch (e) {
    console.error('Error during Firebase signOut:', e);
  }
  localStorage.removeItem('user_state');
};

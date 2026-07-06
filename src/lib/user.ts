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

export const saveBannedEmails = (items: BlacklistItem[]) => {
  localStorage.setItem('banned_emails', JSON.stringify(items));
};

export const saveBannedIps = (items: BlacklistItem[]) => {
  localStorage.setItem('banned_ips', JSON.stringify(items));
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
  try {
    const raw = localStorage.getItem('registered_users');
    if (raw) {
      return JSON.parse(raw);
    }
  } catch (e) {}
  
  const defaultUsers = [
    { name: 'Budi Sutanto', email: 'budi.sutanto@gmail.com', password: '111111', points: 150, premiumUntil: null, ip: '114.125.43.12', securityQuestion: 'Apa nama hewan peliharaan pertama Anda?', securityAnswer: 'kucing', verified: true },
    { name: 'Siti Nurhaliza', email: 'siti.nurhaliza@gmail.com', password: '222222', points: 450, premiumUntil: Date.now() + 30 * 24 * 60 * 60 * 1000, ip: '114.128.9.112', securityQuestion: 'Apa nama sekolah dasar (SD) Anda?', securityAnswer: 'sd n 1', verified: true },
    { name: 'Jaka Tingkir', email: 'jaka.tingkir@yahoo.co.id', password: '333333', points: 80, premiumUntil: null, ip: '114.124.22.19', securityQuestion: 'Apa makanan favorit Anda saat masih kecil?', securityAnswer: 'bakso', verified: true },
    { name: 'Admin Alternatif', email: 'admin@example.com', password: 'admin1', points: 1000, premiumUntil: -1, ip: '127.0.0.1', securityQuestion: 'Siapa nama belakang guru favorit Anda di sekolah?', securityAnswer: 'hartono', verified: true },
    { name: 'Spammer Bot', email: 'spammer_bot@gmail.com', password: '666666', points: 150000, premiumUntil: null, ip: '103.115.22.88', banned: true, securityQuestion: 'Apa nama hewan peliharaan pertama Anda?', securityAnswer: 'robot', verified: true }
  ];
  localStorage.setItem('registered_users', JSON.stringify(defaultUsers));
  return defaultUsers;
};

export const saveRegisteredUsers = (users: any[]) => {
  localStorage.setItem('registered_users', JSON.stringify(users));
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
        // Force simulated IP if missing
        if (!parsed.ip && parsed.email) {
          parsed.ip = getSimulatedIp(parsed.email);
        }
        // Blacklist/ban enforcement
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

export const saveUser = (state: UserState) => {
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
        
        stateCopy.premiumUntil = users[idx].premiumUntil;
        stateCopy.banned = users[idx].banned;
        if (users[idx].bannedUntil) stateCopy.bannedUntil = users[idx].bannedUntil;
        localStorage.setItem('user_state', JSON.stringify(stateCopy));
        
        saveRegisteredUsers(users);
      } else {
        users.push({
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
        });
        saveRegisteredUsers(users);
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

export const logUserLogin = (email: string, username: string, points: number) => {
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
    
    // Add to start of list so newest logs are shown first
    logs.unshift(newLog);
    
    // Maintain maximum of 100 entries
    if (logs.length > 100) {
      logs.pop();
    }
    
    localStorage.setItem('savetik_activity_logs', JSON.stringify(logs));
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

export const verifySecurityAnswerAndResetPassword = (
  email: string,
  answer: string,
  newPassword: string
): { success: boolean; message: string } => {
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
    
    if (newPassword.length !== 6) {
      return { success: false, message: 'Password baru harus tepat 6 karakter/angka!' };
    }
    
    users[idx].password = newPassword;
    saveRegisteredUsers(users);
    
    return { success: true, message: 'Password berhasil direset! Silakan masuk kembali dengan password baru.' };
  } catch (e) {
    return { success: false, message: 'Terjadi kesalahan sistem saat mereset password.' };
  }
};

export const updateUserProfile = (
  oldEmail: string,
  updatedData: { email: string; name: string; password?: string; securityQuestion?: string; securityAnswer?: string }
): boolean => {
  try {
    const usersRaw = localStorage.getItem('registered_users');
    const users = usersRaw ? JSON.parse(usersRaw) : [];
    
    // Check if new email is already taken by a DIFFERENT user
    if (updatedData.email.toLowerCase() !== oldEmail.toLowerCase()) {
      const exists = users.some((u: any) => u.email.toLowerCase() === updatedData.email.toLowerCase());
      if (exists) {
        return false;
      }
    }

    const idx = users.findIndex((u: any) => u.email.toLowerCase() === oldEmail.toLowerCase());
    if (idx !== -1) {
      users[idx].email = updatedData.email;
      users[idx].name = updatedData.name;
      if (updatedData.password) {
        users[idx].password = updatedData.password;
      }
      if (updatedData.securityQuestion !== undefined) {
        users[idx].securityQuestion = updatedData.securityQuestion;
      }
      if (updatedData.securityAnswer !== undefined) {
        users[idx].securityAnswer = updatedData.securityAnswer;
      }
      localStorage.setItem('registered_users', JSON.stringify(users));
      return true;
    }
  } catch (e) {
    console.error('Failed to update user profile in registered_users:', e);
  }
  return false;
};

export const deleteUserAccount = (email: string) => {
  try {
    const users = getRegisteredUsers();
    const idx = users.findIndex((u: any) => u.email.toLowerCase() === email.toLowerCase());
    if (idx !== -1) {
      users[idx].deleted = true;
      saveRegisteredUsers(users);
    }
    
    // Also remove from activity logs if any
    const logsRaw = localStorage.getItem('savetik_activity_logs');
    if (logsRaw) {
      const logs = JSON.parse(logsRaw);
      const filteredLogs = logs.filter((l: any) => l.email?.toLowerCase() !== email.toLowerCase());
      localStorage.setItem('savetik_activity_logs', JSON.stringify(filteredLogs));
    }
  } catch (e) {
    console.error('Failed to delete user account:', e);
  }
};


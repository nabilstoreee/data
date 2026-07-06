import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { t } from '../lib/i18n';
import { X, LogIn, User, Zap, Gift, Shield, CheckCircle2, Sparkles, Eye, EyeOff, ArrowLeft, QrCode, Smartphone, CreditCard, Check, AlertTriangle, Send, Upload, MessageSquare, Image, Trash2, Mail } from 'lucide-react';
import { UserState, logUserLogin, isPremiumActive, getUserPassword, updateUserProfile, getRegisteredUsers, saveRegisteredUsers, isEmailBanned, isIpBanned, getSimulatedIp, deleteUserAccount, STANDARD_SECURITY_QUESTIONS, getUserSecurityQuestion, verifySecurityAnswerAndResetPassword, checkBanStatus } from '../lib/user';
import { getSettings } from '../lib/settings';
import { clearHistory } from '../lib/history';

export function PremiumStatusBadge({ user, className = '' }: { user: UserState; className?: string }) {
  const [timeLeft, setTimeLeft] = useState('');

  useEffect(() => {
    if (!isPremiumActive(user)) return;
    if (user.premiumUntil === -1 || user.email?.toLowerCase() === 'jrnabil570@gmail.com') {
      setTimeLeft('Premium Aktif Selamanya');
      return;
    }

    const updateTimer = () => {
      const until = user.premiumUntil || 0;
      const now = Date.now();
      const diff = until - now;
      if (diff <= 0) {
        setTimeLeft('Premium Kedaluwarsa');
        return;
      }

      const totalSeconds = Math.floor(diff / 1000);
      const totalMinutes = Math.floor(totalSeconds / 60);
      const totalHours = Math.floor(totalMinutes / 60);
      const totalDays = Math.floor(totalHours / 24);

      const months = Math.floor(totalDays / 30);
      const remainingDaysAfterMonths = totalDays % 30;
      const weeks = Math.floor(remainingDaysAfterMonths / 7);
      const days = remainingDaysAfterMonths % 7;

      const hours = totalHours % 24;
      const minutes = totalMinutes % 60;
      const seconds = totalSeconds % 60;

      const parts = [];
      if (months > 0) parts.push(`${months} Bln`);
      if (weeks > 0) parts.push(`${weeks} Mggu`);
      if (days > 0) parts.push(`${days} Hari`);

      const hStr = String(hours).padStart(2, '0');
      const mStr = String(minutes).padStart(2, '0');
      const sStr = String(seconds).padStart(2, '0');

      setTimeLeft(`${parts.length > 0 ? parts.join(', ') + ' ' : ''}${hStr}:${mStr}:${sStr}`);
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, [user]);

  if (!isPremiumActive(user)) return null;

  return (
    <div className={`inline-flex items-center gap-1.5 px-3 py-1 text-xs font-semibold ${className}`}>
      <Shield className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
      <span>
        {user.premiumUntil === -1 || user.email?.toLowerCase() === 'jrnabil570@gmail.com' ? (
          'Premium Aktif Selamanya'
        ) : (
          `Premium s.d ${new Date(user.premiumUntil!).toLocaleDateString('id-ID')} (${timeLeft})`
        )}
      </span>
    </div>
  );
}

function Modal({ isOpen, onClose, title, children }: any) {
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
            initial={{ scale: 0.95, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 20 }}
            className="w-full max-w-md bg-white dark:bg-[#121212] rounded-[2rem] shadow-2xl overflow-hidden border border-slate-200 dark:border-slate-800"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center justify-between p-6 sm:p-8 border-b border-slate-100 dark:border-slate-800/50">
              <h2 className="text-xl font-bold text-slate-800 dark:text-slate-200">{title}</h2>
              <button onClick={onClose} className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-slate-500">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 sm:p-8 overflow-y-auto max-h-[70vh]">
              {children}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export function AuthModal({ isOpen, onClose, onLogin }: { isOpen: boolean, onClose: () => void, onLogin: (user: UserState) => void }) {
  const [isRegister, setIsRegister] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Security Question register states
  const [regQuestion, setRegQuestion] = useState(STANDARD_SECURITY_QUESTIONS[0]);
  const [regQuestionCustom, setRegQuestionCustom] = useState('');
  const [regAnswer, setRegAnswer] = useState('');

  // Email Verification states
  const [isVerifyingEmail, setIsVerifyingEmail] = useState(false);
  const [verificationCode, setVerificationCode] = useState('');
  const [verificationInput, setVerificationInput] = useState('');
  const [verificationTimer, setVerificationTimer] = useState(0);

  // Forgot Password states
  const [isForgotPassword, setIsForgotPassword] = useState(false);
  const [forgotStep, setForgotStep] = useState<'email' | 'question'>('email');
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotQuestion, setForgotQuestion] = useState('');
  const [forgotAnswer, setForgotAnswer] = useState('');
  const [forgotNewPassword, setForgotNewPassword] = useState('');
  const [showForgotNewPass, setShowForgotNewPass] = useState(false);

  useEffect(() => {
    if (isOpen) {
      const saved = localStorage.getItem('saved_credentials');
      if (saved) {
        try {
          const { email: savedEmail, password: savedPassword } = JSON.parse(saved);
          if (savedEmail) setEmail(savedEmail);
          if (savedPassword) setPassword(savedPassword);
          setRememberMe(true);
        } catch (e) {}
      }
      setIsRegister(false);
      setIsForgotPassword(false);
      setIsVerifyingEmail(false);
      setError('');
      setSuccess('');
    }
  }, [isOpen]);

  // Handle email verification countdown timer
  useEffect(() => {
    if (!isVerifyingEmail || verificationTimer <= 0) return;
    const t = setInterval(() => {
      setVerificationTimer(prev => prev - 1);
    }, 1000);
    return () => clearInterval(t);
  }, [isVerifyingEmail, verificationTimer]);

  const handleResendCode = () => {
    const code = String(Math.floor(100000 + Math.random() * 900000));
    setVerificationCode(code);
    setVerificationTimer(60);
    setSuccess(`Kode verifikasi baru telah dikirimkan ke email ${email}!`);
    setError('');
  };

  const handleForgotPasswordSubmit = (e: any) => {
    e.preventDefault();
    if (forgotStep === 'email') {
      if (!forgotEmail) return;
      
      const users = getRegisteredUsers();
      const found = users.find((u: any) => u.email.toLowerCase() === forgotEmail.toLowerCase());
      if (!found) {
        setError('Email tidak terdaftar!');
        return;
      }
      
      const question = found.securityQuestion;
      if (!question) {
        setError('Akun ini tidak memiliki konfigurasi pertanyaan keamanan rahasia. Hubungi Administrator.');
        return;
      }
      
      setForgotQuestion(question);
      setForgotStep('question');
      setForgotAnswer('');
      setForgotNewPassword('');
      setError('');
      setSuccess('');
    } else {
      if (!forgotAnswer.trim()) {
        setError('Silakan masukkan jawaban rahasia.');
        return;
      }
      if (forgotNewPassword.length !== 6) {
        setError('Password baru harus tepat 6 karakter/angka!');
        return;
      }
      
      const result = verifySecurityAnswerAndResetPassword(forgotEmail, forgotAnswer, forgotNewPassword);
      if (result.success) {
        setSuccess(result.message);
        setError('');
        setIsForgotPassword(false);
        setPassword(forgotNewPassword);
        setEmail(forgotEmail);
      } else {
        setError(result.message);
      }
    }
  };

  const handleVerifyAndRegister = (e: any) => {
    e.preventDefault();
    if (verificationInput !== verificationCode) {
      setError('Kode verifikasi salah! Silakan masukkan kode 6-digit yang benar.');
      return;
    }

    const currentIp = getSimulatedIp(email);
    const users = getRegisteredUsers();
    
    const settings = getSettings();
    const initialPoints = settings.registerPointsReward !== undefined ? settings.registerPointsReward : 50;
    
    const finalQuestion = regQuestion === 'custom' ? regQuestionCustom : regQuestion;

    users.push({ 
      name, 
      email, 
      password, 
      points: initialPoints, 
      ip: currentIp,
      securityQuestion: finalQuestion,
      securityAnswer: regAnswer,
      verified: true
    });
    saveRegisteredUsers(users);

    setSuccess('Akun berhasil diverifikasi & didaftarkan! Silakan masuk.');
    setError('');
    
    setIsRegister(false);
    setIsVerifyingEmail(false);
    setName('');
    setPassword('');
    setRegAnswer('');
    setRegQuestionCustom('');
    setRegQuestion(STANDARD_SECURITY_QUESTIONS[0]);
  };

  const handleLogin = (e: any) => {
    e.preventDefault();
    if (!email || !password) return;
    if (isRegister && !name) return;

    if (password.length !== 6) {
      setError('Password harus tepat 6 karakter/angka!');
      return;
    }

    const currentIp = getSimulatedIp(email);
    const users = getRegisteredUsers();
    const foundUser = users.find((u: any) => u.email.toLowerCase() === email.toLowerCase());

    if (!isRegister && !foundUser) {
      setError('Akun tidak ditemukan. Silakan daftar terlebih dahulu.');
      return;
    }

    const banReason = checkBanStatus(foundUser || { email, ip: currentIp });
    if (banReason) {
      setError(banReason);
      return;
    }

    if (isRegister) {
      const users = getRegisteredUsers();
      const exists = users.some((u: any) => u.email.toLowerCase() === email.toLowerCase());
      if (exists) {
        setError('Email sudah terdaftar! Silakan gunakan email lain atau langsung masuk.');
        return;
      }

      if (regQuestion === 'custom' && !regQuestionCustom.trim()) {
        setError('Silakan masukkan pertanyaan keamanan kustom Anda.');
        return;
      }
      if (!regAnswer.trim()) {
        setError('Silakan masukkan jawaban keamanan rahasia Anda.');
        return;
      }

      const code = String(Math.floor(100000 + Math.random() * 900000));
      setVerificationCode(code);
      setVerificationInput('');
      setVerificationTimer(60);
      setIsVerifyingEmail(true);
      setError('');
      setSuccess('');
      return;
    }

    if (rememberMe) {
      localStorage.setItem('saved_credentials', JSON.stringify({ email, password }));
    } else {
      localStorage.removeItem('saved_credentials');
    }
    
    if (foundUser && foundUser.banned) {
      setError('Akun Anda telah ditangguhkan (banned) oleh Administrator.');
      return;
    }

    if (foundUser && foundUser.password !== password) {
      setError('Password salah! Silakan masukkan password yang tepat.');
      return;
    }

    const settings = getSettings();
    const initialPoints = settings.registerPointsReward !== undefined ? settings.registerPointsReward : 50;

    const username = foundUser ? foundUser.name : email.split('@')[0];
    const userPoints = foundUser && foundUser.points !== undefined ? foundUser.points : initialPoints;
    const premiumUntil = foundUser && foundUser.premiumUntil !== undefined ? foundUser.premiumUntil : null;
    const hasSeenTutorial = foundUser && foundUser.hasSeenTutorial !== undefined ? foundUser.hasSeenTutorial : false;

    const mockUser: UserState = {
      isLoggedIn: true,
      username: username || `User${Math.floor(Math.random() * 1000)}`,
      email,
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=' + email,
      points: userPoints,
      premiumUntil,
      hasSeenTutorial,
      ip: currentIp,
      banned: foundUser ? foundUser.banned : false
    };
    logUserLogin(email, mockUser.username, mockUser.points);
    onLogin(mockUser);
    onClose();
  };

  let modalTitle = "Masuk ke Akun";
  if (isForgotPassword) {
    modalTitle = "Pulihkan Kata Sandi";
  } else if (isVerifyingEmail) {
    modalTitle = "Verifikasi Email";
  } else if (isRegister) {
    modalTitle = "Daftar Akun Baru";
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={modalTitle}>
      {isForgotPassword ? (
        <div className="space-y-4 text-left">
          <div className="text-center mb-5">
            <div className="w-14 h-14 bg-amber-50 dark:bg-amber-500/10 text-amber-500 rounded-2xl flex items-center justify-center mx-auto mb-3">
              <Shield className="w-7 h-7" />
            </div>
            <h3 className="text-base font-bold text-slate-800 dark:text-slate-200">
              Reset Password via Pertanyaan Keamanan
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Verifikasi identitas Anda dengan menjawab pertanyaan keamanan rahasia yang telah dikonfigurasi.
            </p>
          </div>

          <form onSubmit={handleForgotPasswordSubmit} className="space-y-4">
            {error && (
              <div className="bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/50 text-rose-600 dark:text-rose-400 text-xs font-semibold p-3.5 rounded-xl text-center">
                {error}
              </div>
            )}
            {success && (
              <div className="bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900/50 text-emerald-600 dark:text-emerald-400 text-xs font-semibold p-3.5 rounded-xl text-center">
                {success}
              </div>
            )}

            {forgotStep === 'email' ? (
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5 uppercase tracking-wider">Email Akun Anda</label>
                <input
                  type="email"
                  required
                  value={forgotEmail}
                  onChange={e => setForgotEmail(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-3 text-sm text-slate-900 dark:text-white focus:border-indigo-500 focus:outline-none transition-colors"
                  placeholder="Masukkan email terdaftar"
                />
              </div>
            ) : (
              <div className="space-y-4">
                <div className="bg-indigo-50 dark:bg-indigo-950/30 border border-indigo-100 dark:border-indigo-900/30 p-4 rounded-2xl">
                  <span className="text-[10px] font-bold text-indigo-500 uppercase tracking-widest block mb-1">Pertanyaan Keamanan Anda:</span>
                  <span className="text-sm font-extrabold text-slate-800 dark:text-white leading-snug">{forgotQuestion}</span>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5 uppercase tracking-wider">Jawaban Rahasia Anda</label>
                  <input
                    type="text"
                    required
                    value={forgotAnswer}
                    onChange={e => setForgotAnswer(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-3 text-sm text-slate-900 dark:text-white focus:border-indigo-500 focus:outline-none transition-colors"
                    placeholder="Masukkan jawaban rahasia Anda"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5 uppercase tracking-wider">Kata Sandi Baru (6 Angka/Karakter)</label>
                  <div className="relative">
                    <input
                      type={showForgotNewPass ? "text" : "password"}
                      required
                      maxLength={6}
                      value={forgotNewPassword}
                      onChange={e => setForgotNewPassword(e.target.value)}
                      className="w-full bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-xl pl-4 pr-12 py-3 text-sm text-slate-900 dark:text-white focus:border-indigo-500 focus:outline-none transition-colors"
                      placeholder="Masukkan 6 digit password baru"
                    />
                    <button
                      type="button"
                      onClick={() => setShowForgotNewPass(!showForgotNewPass)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                    >
                      {showForgotNewPass ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>
              </div>
            )}

            <button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3.5 rounded-xl transition-colors shadow-md shadow-indigo-500/20 mt-2">
              {forgotStep === 'email' ? "Cari Pertanyaan Keamanan" : "Konfirmasi & Setel Password Baru"}
            </button>

            <div className="text-center mt-3">
              <button 
                type="button" 
                onClick={() => {
                  setIsForgotPassword(false);
                  setError('');
                  setSuccess('');
                }}
                className="text-xs font-bold text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 underline"
              >
                Kembali ke Halaman Masuk
              </button>
            </div>
          </form>
        </div>
      ) : isVerifyingEmail ? (
        <div className="space-y-4 text-left">
          <div className="text-center mb-5">
            <div className="w-14 h-14 bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 rounded-2xl flex items-center justify-center mx-auto mb-3">
              <Shield className="w-7 h-7" />
            </div>
            <h3 className="text-base font-bold text-slate-800 dark:text-slate-200">
              Verifikasi Alamat Email Anda
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
              Kode verifikasi OTP 6-digit telah dikirimkan ke email <span className="font-extrabold text-indigo-500">{email}</span>.
            </p>
          </div>

          <div className="bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/30 rounded-2xl p-4 space-y-1.5 relative overflow-hidden">
            <div className="flex items-center gap-2 text-amber-800 dark:text-amber-400 text-xs font-black">
              <div className="w-2 h-2 rounded-full bg-amber-500 animate-ping" />
              <span>[SIMULATOR SERVER EMAIL]</span>
            </div>
            <p className="text-[11px] font-semibold text-slate-600 dark:text-slate-300 leading-normal">
              Kepada: <span className="font-mono text-indigo-600 dark:text-indigo-400">{email}</span>
            </p>
            <p className="text-xs font-bold text-slate-800 dark:text-white leading-normal">
              Subjek: <span className="text-amber-700 dark:text-amber-400">[SaveTik] OTP Kode Verifikasi Akun Anda</span>
            </p>
            <div className="mt-2 p-3 bg-white dark:bg-[#0c101d] rounded-xl border border-slate-100 dark:border-slate-800/80 text-center">
              <span className="text-[10px] text-slate-400 block font-medium">KODE VERIFIKASI SEKERING:</span>
              <span className="text-2xl font-black tracking-widest text-indigo-600 dark:text-indigo-400 font-mono select-all animate-pulse">{verificationCode}</span>
            </div>
          </div>

          <form onSubmit={handleVerifyAndRegister} className="space-y-4">
            {error && (
              <div className="bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/50 text-rose-600 dark:text-rose-400 text-xs font-semibold p-3.5 rounded-xl text-center">
                {error}
              </div>
            )}
            {success && (
              <div className="bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900/50 text-emerald-600 dark:text-emerald-400 text-xs font-semibold p-3.5 rounded-xl text-center">
                {success}
              </div>
            )}

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5 uppercase tracking-wider text-center">Masukkan Kode Verifikasi</label>
              <input
                type="text"
                required
                maxLength={6}
                value={verificationInput}
                onChange={e => setVerificationInput(e.target.value.replace(/\D/g, ''))}
                className="w-full bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-3.5 text-center text-xl font-mono font-black tracking-widest text-slate-900 dark:text-white focus:border-indigo-500 focus:outline-none transition-colors"
                placeholder="0 0 0 0 0 0"
              />
            </div>

            <button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3.5 rounded-xl transition-colors shadow-md shadow-indigo-500/20 flex items-center justify-center gap-2">
              Verifikasi & Buat Akun <Check className="w-4 h-4" />
            </button>

            <div className="flex justify-between items-center text-xs mt-3 px-1">
              <button 
                type="button" 
                onClick={() => {
                  setIsVerifyingEmail(false);
                  setError('');
                  setSuccess('');
                }}
                className="font-bold text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 underline"
              >
                Kembali Edit Profil
              </button>
              
              {verificationTimer > 0 ? (
                <span className="text-slate-400 font-semibold">
                  Kirim ulang OTP ({verificationTimer}s)
                </span>
              ) : (
                <button 
                  type="button" 
                  onClick={handleResendCode}
                  className="font-bold text-indigo-600 dark:text-indigo-400 hover:underline"
                >
                  Kirim Ulang Kode OTP
                </button>
              )}
            </div>
          </form>
        </div>
      ) : (
        <>
          <div className="text-center mb-6">
            <div className="w-16 h-16 bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <LogIn className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-bold text-slate-800 dark:text-slate-200 mb-2">
              {isRegister ? "Buat Akun Baru" : "Simpan Tanpa Batas"}
            </h3>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              {isRegister 
                ? "Daftar sekarang untuk mulai mengunduh video dan mengumpulkan poin gratis."
                : "Masuk untuk mendapatkan poin setiap kali mengunduh dan tukarkan dengan fitur Premium."}
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4 text-left">
            {error && (
              <div className="bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/50 text-rose-600 dark:text-rose-400 text-xs font-semibold p-3.5 rounded-xl text-center">
                {error}
              </div>
            )}
            {success && (
              <div className="bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900/50 text-emerald-600 dark:text-emerald-400 text-xs font-semibold p-3.5 rounded-xl text-center">
                {success}
              </div>
            )}

            {isRegister && (
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5 uppercase tracking-wider">Nama Lengkap</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={e => setName(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-3 text-sm text-slate-900 dark:text-white focus:border-indigo-500 focus:outline-none transition-colors"
                  placeholder="Masukkan nama lengkap Anda"
                />
              </div>
            )}

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5 uppercase tracking-wider">Email</label>
              <input
                type="email"
                required
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-3 text-sm text-slate-900 dark:text-white focus:border-indigo-500 focus:outline-none transition-colors"
                placeholder="Masukkan email Anda"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5 uppercase tracking-wider">Password (6 Angka/Karakter)</label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={e => {
                    setPassword(e.target.value);
                    setError('');
                  }}
                  className="w-full bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-xl pl-4 pr-12 py-3 text-sm text-slate-900 dark:text-white focus:border-indigo-500 focus:outline-none transition-colors"
                  placeholder="Masukkan password Anda"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              <span className="text-[10px] text-slate-400 block mt-1">Password harus tepat bernilai 6 karakter</span>
            </div>

            {isRegister && (
              <>
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5 uppercase tracking-wider">Pertanyaan Keamanan Rahasia</label>
                  <select
                    value={regQuestion}
                    onChange={e => {
                      setRegQuestion(e.target.value);
                      if (e.target.value !== 'custom') {
                        setRegQuestionCustom('');
                      }
                    }}
                    className="w-full bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-3 text-sm text-slate-900 dark:text-white focus:border-indigo-500 focus:outline-none transition-colors"
                  >
                    {STANDARD_SECURITY_QUESTIONS.map((q, idx) => (
                      <option key={idx} value={q}>{q}</option>
                    ))}
                    <option value="custom">Tulis pertanyaan sendiri...</option>
                  </select>
                </div>

                {regQuestion === 'custom' && (
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5 uppercase tracking-wider">Tulis Pertanyaan Keamanan Kustom Anda</label>
                    <input
                      type="text"
                      required
                      value={regQuestionCustom}
                      onChange={e => setRegQuestionCustom(e.target.value)}
                      className="w-full bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-3 text-sm text-slate-900 dark:text-white focus:border-indigo-500 focus:outline-none transition-colors"
                      placeholder="Contoh: Siapa nama sahabat kecil Anda?"
                    />
                  </div>
                )}

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5 uppercase tracking-wider">Jawaban Rahasia</label>
                  <input
                    type="text"
                    required
                    value={regAnswer}
                    onChange={e => setRegAnswer(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-3 text-sm text-slate-900 dark:text-white focus:border-indigo-500 focus:outline-none transition-colors"
                    placeholder="Masukkan jawaban rahasia Anda"
                  />
                  <span className="text-[10px] text-slate-400 block mt-1">Jawaban ini digunakan untuk memulihkan akun jika Anda lupa kata sandi.</span>
                </div>
              </>
            )}

            <div className="flex items-center justify-between py-1">
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={e => setRememberMe(e.target.checked)}
                  className="rounded border-slate-300 dark:border-slate-700 text-indigo-600 focus:ring-indigo-500 w-4 h-4"
                />
                <span className="text-xs font-semibold text-slate-600 dark:text-slate-400">
                  Ingat Saya
                </span>
              </label>

              {!isRegister && (
                <button
                  type="button"
                  onClick={() => {
                    setIsForgotPassword(true);
                    setForgotStep('email');
                    setForgotEmail(email);
                    setError('');
                    setSuccess('');
                  }}
                  className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline"
                >
                  Lupa Password?
                </button>
              )}
            </div>

            <button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3.5 rounded-xl transition-colors shadow-md shadow-indigo-500/20 mt-2 flex items-center justify-center gap-2">
              {isRegister ? "Daftar & Kirim Kode OTP" : "Masuk"} <Zap className="w-4 h-4" />
            </button>

            <div className="text-center mt-4">
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {isRegister ? "Sudah punya akun?" : "Belum punya akun?"}
                <button 
                  type="button" 
                  onClick={() => {
                    setIsRegister(!isRegister);
                    setError('');
                    setSuccess('');
                  }} 
                  className="ml-2 font-bold text-indigo-600 dark:text-indigo-400 hover:underline"
                >
                  {isRegister ? "Masuk" : "Daftar disini"}
                </button>
              </p>
            </div>
          </form>
        </>
      )}
    </Modal>
  );
}

const DEFAULT_DIRECT_PLANS = [
  { id: 'buy_30_days', label: 'Premium 30 Hari', days: 30, price: 'Rp 15.000', originalPrice: 'Rp 30.000', discount: '50% OFF', desc: 'Akses tanpa iklan, dedicated server premium 10x lebih cepat selama 30 hari.' },
  { id: 'buy_90_days', label: 'Premium 90 Hari', days: 90, price: 'Rp 35.000', originalPrice: 'Rp 90.000', discount: '61% OFF', desc: 'Pilihan Populer! Nikmati server super cepat & bebas iklan selama 90 hari.', popular: true },
  { id: 'buy_lifetime', label: 'Premium Selamanya', days: -1, price: 'Rp 75.000', originalPrice: 'Rp 250.000', discount: '70% OFF', desc: 'Akses tanpa batas, server high-speed 10x dan bebas iklan selamanya (Permanen).' }
];

export function RewardsPanel({ 
  isOpen, 
  onClose, 
  user, 
  onRedeem,
  onPurchasePremium
}: { 
  isOpen: boolean, 
  onClose: () => void, 
  user: UserState, 
  onRedeem: (days: number, cost: number) => void,
  onPurchasePremium: (days: number) => void
}) {
  const settings = getSettings();
  const plans = settings.premiumPlans || [];
  const directPlans = settings.directPlans || DEFAULT_DIRECT_PLANS;

  // Checkout states
  const [checkoutPlan, setCheckoutPlan] = useState<any | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<'qris' | 'gopay' | 'dana' | 'ovo'>('qris');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [checkoutTimer, setCheckoutTimer] = useState(300);
  
  // Real Verification & Chat Room States
  const [activeChatId, setActiveChatId] = useState<string | null>(null);
  const [paymentRequests, setPaymentRequests] = useState<any[]>([]);
  const [proofImage, setProofImage] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [chatInput, setChatInput] = useState('');
  const [userNote, setUserNote] = useState('');
  const [zoomImage, setZoomImage] = useState<string | null>(null);

  // Sync Payment Requests and update session premium
  useEffect(() => {
    const loadRequests = () => {
      try {
        const raw = localStorage.getItem('savetik_payment_requests');
        if (raw) {
          const parsed = JSON.parse(raw);
          setPaymentRequests(parsed);
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
  }, []);

  // Count down timer for checkout
  useEffect(() => {
    if (!checkoutPlan) return;
    setCheckoutTimer(300);
    const interval = setInterval(() => {
      setCheckoutTimer(prev => {
        if (prev <= 1) {
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [checkoutPlan]);

  const formatTimer = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  const handleStartCheckout = (plan: any) => {
    if (!user.isLoggedIn) {
      alert('Anda harus masuk/login terlebih dahulu untuk melakukan pembelian instan!');
      return;
    }
    setCheckoutPlan(plan);
    setPaymentMethod('qris');
    setPhoneNumber('');
    setProofImage(null);
    setUserNote('');
  };

  const handleFile = (file: File) => {
    if (!file.type.startsWith('image/')) {
      alert('Format file salah! Harus berupa file gambar.');
      return;
    }
    const reader = new FileReader();
    reader.onload = (e) => {
      setProofImage(e.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleSendVerificationRequest = () => {
    if (!proofImage) {
      alert('Silakan upload atau seret foto bukti transfer terlebih dahulu!');
      return;
    }

    const reqId = 'pay_' + Date.now();
    const newRequest: any = {
      id: reqId,
      userEmail: user.email || 'guest@example.com',
      userName: user.username || 'Guest',
      planId: checkoutPlan.id,
      planLabel: checkoutPlan.label,
      planDays: checkoutPlan.days,
      paymentMethod: paymentMethod,
      phoneNumber: phoneNumber || '',
      status: 'pending',
      proofImage: proofImage,
      createdAt: new Date().toLocaleString('id-ID'),
      messages: [
        {
          id: 'msg_init_' + Date.now(),
          sender: 'user',
          text: `Halo Admin, saya mengajukan verifikasi pembayaran untuk pembelian paket *${checkoutPlan.label}* (${checkoutPlan.price}) melalui metode ${paymentMethod.toUpperCase()}.${phoneNumber ? ' Nomor HP Pengirim: ' + phoneNumber : ''}.${userNote.trim() ? ' Catatan: ' + userNote : ''}`,
          image: proofImage,
          timestamp: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })
        }
      ]
    };

    const updated = [...paymentRequests, newRequest];
    localStorage.setItem('savetik_payment_requests', JSON.stringify(updated));
    setPaymentRequests(updated);

    // Switch to active chat window immediately
    setCheckoutPlan(null);
    setActiveChatId(reqId);
    setProofImage(null);
    setUserNote('');
    setPhoneNumber('');
  };

  const handleSendChatMessage = () => {
    if (!chatInput.trim() || !activeChatId) return;

    const updated = paymentRequests.map((r) => {
      if (r.id === activeChatId) {
        return {
          ...r,
          messages: [
            ...r.messages,
            {
              id: 'msg_user_' + Date.now(),
              sender: 'user',
              text: chatInput,
              timestamp: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })
            }
          ]
        };
      }
      return r;
    });

    localStorage.setItem('savetik_payment_requests', JSON.stringify(updated));
    setPaymentRequests(updated);
    setChatInput('');
  };

  const handleDeleteChatMessage = (messageId: string) => {
    if (!activeChatId) return;
    const updated = paymentRequests.map((r) => {
      if (r.id === activeChatId) {
        return {
          ...r,
          messages: r.messages.filter((msg: any) => msg.id !== messageId)
        };
      }
      return r;
    });
    localStorage.setItem('savetik_payment_requests', JSON.stringify(updated));
    setPaymentRequests(updated);
  };

  // Find user's pending request if any
  const myRequests = user.email 
    ? paymentRequests.filter(r => r.userEmail.toLowerCase() === user.email!.toLowerCase())
    : [];
  const pendingRequest = myRequests.find(r => r.status === 'pending');
  const latestRequest = myRequests[myRequests.length - 1];

  const activeChatRequest = paymentRequests.find(r => r.id === activeChatId);

  return (
    <>
      <Modal isOpen={isOpen} onClose={onClose} title={activeChatId ? "Diskusi Verifikasi Pembayaran" : checkoutPlan ? "Sistem Pembayaran Instan" : "Toko Poin & Premium"}>
        <AnimatePresence mode="wait">

        {/* CHAT WINDOW */}
        {activeChatId && activeChatRequest ? (
          <motion.div
            key="rewards-chat"
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            className="flex flex-col h-[520px]"
          >
            {/* Header / Ticket Summary */}
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3 mb-3">
              <button
                onClick={() => setActiveChatId(null)}
                className="flex items-center gap-1 text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline"
              >
                <ArrowLeft className="w-3.5 h-3.5" /> Kembali ke Menu
              </button>
              <div className="text-right">
                <span className="text-[10px] text-slate-400 font-mono block">Ticket ID: {activeChatRequest.id}</span>
                <span className="text-xs font-bold text-slate-800 dark:text-slate-200">{activeChatRequest.planLabel}</span>
              </div>
            </div>

            {/* Status Alert Badge */}
            <div className={`p-2.5 rounded-xl text-center text-xs font-bold mb-3 flex items-center justify-center gap-2 ${
              activeChatRequest.status === 'pending'
                ? 'bg-amber-50 dark:bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-100 dark:border-amber-500/20'
                : activeChatRequest.status === 'approved'
                ? 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-500/20'
                : 'bg-rose-50 dark:bg-rose-500/10 text-rose-700 dark:text-rose-400 border border-rose-100 dark:border-rose-500/20'
            }`}>
              <span className={`w-2 h-2 rounded-full ${
                activeChatRequest.status === 'pending'
                  ? 'bg-amber-500 animate-pulse'
                  : activeChatRequest.status === 'approved'
                  ? 'bg-emerald-500'
                  : 'bg-rose-500'
              }`} />
              {activeChatRequest.status === 'pending' && "Menunggu Pengecekan Admin"}
              {activeChatRequest.status === 'approved' && "Pembayaran Disetujui (Premium Aktif)"}
              {activeChatRequest.status === 'rejected' && "Pembayaran Ditolak Admin"}
            </div>

            {/* Messages Box */}
            <div className="flex-1 overflow-y-auto p-2 space-y-3 mb-3 bg-slate-50 dark:bg-[#060a13] rounded-2xl border border-slate-100 dark:border-slate-800/60 flex flex-col scrollbar-thin">
              {activeChatRequest.messages.map((msg: any) => {
                const isMe = msg.sender === 'user';
                return (
                  <div
                    key={msg.id}
                    className={`max-w-[85%] rounded-2xl p-3 text-xs flex flex-col relative ${
                      isMe 
                        ? 'bg-indigo-600 text-white self-end rounded-tr-none' 
                        : 'bg-white dark:bg-[#111724] text-slate-900 dark:text-slate-100 self-start border border-slate-100 dark:border-slate-800 rounded-tl-none shadow-sm'
                    }`}
                  >
                    {!isMe && (
                      <span className="font-extrabold text-[9px] text-indigo-500 dark:text-indigo-400 uppercase tracking-widest mb-1 block">
                        Administrator
                      </span>
                    )}
                    <p className="whitespace-pre-wrap leading-relaxed">{msg.text}</p>
                    
                    {msg.image && (
                      <div className="mt-2 rounded-lg overflow-hidden border border-slate-200/50 dark:border-slate-700 max-w-[200px] cursor-pointer hover:opacity-90 active:scale-95 transition-all" onClick={() => setZoomImage(msg.image)}>
                        <img src={msg.image} alt="Bukti Lampiran" className="w-full h-auto object-cover max-h-[120px]" />
                        <div className="bg-black/50 text-[9px] text-white py-0.5 text-center flex items-center justify-center gap-1">
                          <Image className="w-3 h-3" /> Klik untuk Perbesar
                        </div>
                      </div>
                    )}
                    
                    <div className="flex items-center justify-between gap-3 mt-2 border-t border-white/10 dark:border-slate-800/80 pt-1.5 w-full">
                      <span className={`text-[9px] ${isMe ? 'text-indigo-200/80' : 'text-slate-400 dark:text-slate-500'} font-mono`}>
                        {msg.timestamp}
                      </span>
                      <button
                        onClick={() => handleDeleteChatMessage(msg.id)}
                        className={`text-red-400 hover:text-red-500 transition-colors p-1 rounded-md hover:bg-black/10 dark:hover:bg-white/5`}
                        title="Hapus pesan"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Quick Helper Answers */}
            <div className="flex gap-1.5 mb-2 overflow-x-auto pb-1 flex-shrink-0">
              {["Mohon bantuannya admin.", "Terima kasih banyak.", "Saya sudah mengirim bukti asli."].map((txt) => (
                <button
                  key={txt}
                  onClick={() => setChatInput(txt)}
                  className="px-2.5 py-1 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-600 dark:text-slate-300 rounded-lg text-[10px] font-medium transition-colors flex-shrink-0"
                >
                  {txt}
                </button>
              ))}
            </div>

            {/* Message input */}
            <div className="flex gap-2 items-center flex-shrink-0">
              <input
                type="text"
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') handleSendChatMessage(); }}
                placeholder="Tulis pesan untuk Admin..."
                className="flex-1 bg-slate-50 dark:bg-[#0c1221] border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-3 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500 font-medium"
              />
              <button
                onClick={handleSendChatMessage}
                disabled={!chatInput.trim()}
                className="p-3 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white rounded-xl transition-all shadow-md shadow-indigo-500/10 flex items-center justify-center"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          </motion.div>
        ) : !checkoutPlan ? (
          <motion.div
            key="rewards-main"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
          >
            {/* Active Verification Status Banner */}
            {latestRequest && (
              <div className={`p-3.5 rounded-2xl border mb-5 flex justify-between items-center ${
                latestRequest.status === 'pending'
                  ? 'border-amber-200 bg-amber-500/5 text-amber-800 dark:text-amber-400'
                  : latestRequest.status === 'approved'
                  ? 'border-emerald-200 bg-emerald-500/5 text-emerald-800 dark:text-emerald-400'
                  : 'border-rose-200 bg-rose-500/5 text-rose-800 dark:text-rose-400'
              }`}>
                <div className="flex items-center gap-2.5">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    latestRequest.status === 'pending' ? 'bg-amber-100 dark:bg-amber-500/25' : latestRequest.status === 'approved' ? 'bg-emerald-100 dark:bg-emerald-500/25' : 'bg-rose-100 dark:bg-rose-500/25'
                  }`}>
                    <MessageSquare className="w-4 h-4" />
                  </div>
                  <div>
                    <h5 className="text-xs font-black">
                      {latestRequest.status === 'pending' && "Menunggu Verifikasi Admin"}
                      {latestRequest.status === 'approved' && "Pembayaran Anda Disetujui!"}
                      {latestRequest.status === 'rejected' && "Pembayaran Anda Ditolak"}
                    </h5>
                    <p className="text-[10px] opacity-75 mt-0.5">Buka ruang obrolan untuk berdiskusi dengan Admin.</p>
                  </div>
                </div>
                <button
                  onClick={() => setActiveChatId(latestRequest.id)}
                  className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-[10px] rounded-lg transition-all"
                >
                  Hubungi Admin
                </button>
              </div>
            )}

            {/* Points balance display */}
            <div className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl p-6 text-white mb-6 relative overflow-hidden shadow-lg shadow-indigo-500/10">
              <div className="absolute top-0 right-0 p-4 opacity-20">
                <Gift className="w-24 h-24" />
              </div>
              <div className="relative z-10">
                <p className="text-indigo-100 font-medium text-sm mb-1">Poin Anda Saat Ini</p>
                <div className="flex items-end gap-2 mb-4">
                  <motion.span 
                    key={user.points}
                    initial={{ scale: 1 }}
                    animate={{
                      scale: [1, 1.25, 0.95, 1.05, 1],
                      color: ["#ffffff", "#34d399", "#ffffff"],
                      x: [0, -3, 3, -1.5, 1.5, 0]
                    }}
                    transition={{ duration: 0.6 }}
                    className="text-4xl font-black inline-block origin-left"
                  >
                    {user.points}
                  </motion.span>
                  <span className="text-lg font-medium pb-1">pts</span>
                </div>
                {isPremiumActive(user) ? (
                  <PremiumStatusBadge user={user} className="bg-white/20 backdrop-blur-md text-white rounded-full text-xs font-medium" />
                ) : (
                  <p className="text-sm text-indigo-100">Kumpulkan poin dengan mengunduh video untuk ditukarkan dengan akun Premium.</p>
                )}
              </div>
            </div>

            {/* Direct Instant Purchase (QRIS, Dana, Gopay) */}
            <div className="mb-6 border-b border-slate-200 dark:border-slate-800 pb-6">
              <h3 className="font-bold text-slate-900 dark:text-white mb-1.5 flex items-center gap-1.5 text-base">
                <CreditCard className="w-5 h-5 text-indigo-500" /> Beli Premium Instan
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
                Bayar instant menggunakan QRIS, Dana, atau GoPay milik Admin. Konfirmasi manual diproses cepat via chat.
              </p>

              <div className="space-y-3.5">
                {directPlans.map((plan: any) => (
                  <div 
                    key={plan.id}
                    className={`p-4 rounded-2xl border transition-all relative overflow-hidden ${
                      plan.popular 
                        ? 'border-indigo-400 bg-indigo-50/20 dark:bg-indigo-500/5 dark:border-indigo-500/50' 
                        : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-[#090d16]'
                    }`}
                  >
                    {plan.popular && (
                      <span className="absolute top-0 right-0 bg-indigo-600 text-white font-extrabold text-[9px] px-2.5 py-0.5 rounded-bl-lg uppercase tracking-wider">
                        Terpopuler
                      </span>
                    )}

                    <div className="flex justify-between items-start gap-4 mb-2">
                      <div>
                        <div className="font-bold text-slate-900 dark:text-white flex items-center gap-2 text-sm sm:text-base">
                          {plan.label}
                          <span className="bg-amber-100 dark:bg-amber-500/20 text-amber-700 dark:text-amber-400 text-[10px] font-black px-1.5 py-0.5 rounded-md">
                            {plan.discount}
                          </span>
                        </div>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 max-w-[280px]">
                          {plan.desc}
                        </p>
                      </div>

                      <div className="text-right">
                        <div className="text-xs text-slate-400 dark:text-slate-500 line-through font-medium">
                          {plan.originalPrice}
                        </div>
                        <div className="text-base font-black text-indigo-600 dark:text-indigo-400">
                          {plan.price}
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={() => handleStartCheckout(plan)}
                      className="w-full mt-2 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl transition-all shadow-sm shadow-indigo-500/10 flex items-center justify-center gap-1.5"
                    >
                      Beli Langsung <Zap className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Redeem Points Free Method */}
            <div>
              <h3 className="font-bold text-slate-900 dark:text-white mb-3 flex items-center gap-1.5 text-base">
                <Gift className="w-5 h-5 text-indigo-500" /> Tukarkan Poin Gratis
              </h3>
              <div className="space-y-3">
                {plans.length === 0 ? (
                  <div className="text-center py-6 text-xs text-slate-400 dark:text-slate-500">
                    Tidak ada paket poin yang terkonfigurasi.
                  </div>
                ) : (
                  plans.map((plan, i) => {
                    const canAfford = user.points >= plan.cost;
                    const displayLabel = plan.label.toLowerCase().includes('premium') ? plan.label : `${plan.label} Premium`;
                    return (
                      <div key={plan.id || i} className={`p-4 rounded-2xl border transition-all ${canAfford ? 'border-indigo-100 dark:border-indigo-500/20 bg-indigo-50/20 dark:bg-indigo-500/5' : 'border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50'} flex items-center justify-between`}>
                        <div className="min-w-0 pr-3">
                          <div className="font-bold text-slate-800 dark:text-slate-200 text-sm truncate">{displayLabel}</div>
                          <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 break-words leading-relaxed">{plan.desc}</div>
                        </div>
                        <button 
                          disabled={!canAfford}
                          onClick={() => onRedeem(plan.days, plan.cost)}
                          className={`px-4 py-2.5 rounded-xl text-xs font-bold flex-shrink-0 flex items-center gap-1.5 transition-all ${canAfford ? 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-md shadow-indigo-500/20' : 'bg-slate-200 dark:bg-slate-800 text-slate-400 cursor-not-allowed'}`}
                        >
                          Tukar {plan.cost} pts
                        </button>
                      </div>
                    )
                  })
                )}
              </div>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="rewards-checkout"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="text-left"
          >
            {/* Top Back Header */}
            <div className="flex items-center gap-2 mb-5 border-b border-slate-100 dark:border-slate-800/80 pb-3">
              <button
                onClick={() => setCheckoutPlan(null)}
                className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
              </button>
              <div>
                <h3 className="font-bold text-slate-900 dark:text-white text-sm">Pembayaran Instan</h3>
                <p className="text-[10px] text-slate-500">Kirim Pembayaran ke Admin untuk Verifikasi</p>
              </div>
            </div>

            <div className="space-y-4 max-h-[500px] overflow-y-auto pr-1 pb-4 scrollbar-thin">
              {/* Plan Info Card */}
              <div className="p-4 rounded-2xl bg-indigo-50 dark:bg-indigo-500/10 border border-indigo-100 dark:border-indigo-500/20">
                <div className="text-[10px] font-bold text-indigo-500 uppercase tracking-widest">Produk yang Dibeli</div>
                <div className="flex justify-between items-center mt-1.5">
                  <span className="font-black text-slate-900 dark:text-white text-sm">{checkoutPlan.label}</span>
                  <span className="font-black text-indigo-600 dark:text-indigo-400 text-base">{checkoutPlan.price}</span>
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                  Membuka server unduhan dedicated speed 10x lebih cepat & pemblokir iklan otomatis.
                </p>
              </div>

              {/* Payment Method Tabs */}
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2">Metode Pembayaran</label>
                <div className="grid grid-cols-3 gap-2">
                  {/* QRIS */}
                  <button
                    onClick={() => setPaymentMethod('qris')}
                    className={`p-2.5 rounded-xl border flex flex-col items-center gap-1 transition-all text-[11px] font-bold ${
                      paymentMethod === 'qris'
                        ? 'border-pink-500 bg-pink-500/5 text-pink-600 dark:text-pink-400'
                        : 'border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-900/40 text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    <QrCode className="w-4 h-4 text-pink-500" />
                    QRIS (Scan)
                  </button>

                  {/* Gopay */}
                  <button
                    onClick={() => setPaymentMethod('gopay')}
                    className={`p-2.5 rounded-xl border flex flex-col items-center gap-1 transition-all text-[11px] font-bold ${
                      paymentMethod === 'gopay'
                        ? 'border-blue-500 bg-blue-500/5 text-blue-600 dark:text-blue-400'
                        : 'border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-900/40 text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    <CreditCard className="w-4 h-4 text-blue-500" />
                    GoPay
                  </button>

                  {/* DANA */}
                  <button
                    onClick={() => setPaymentMethod('dana')}
                    className={`p-2.5 rounded-xl border flex flex-col items-center gap-1 transition-all text-[11px] font-bold ${
                      paymentMethod === 'dana'
                        ? 'border-sky-500 bg-sky-500/5 text-sky-600 dark:text-sky-400'
                        : 'border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-900/40 text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    <Smartphone className="w-4 h-4 text-sky-500" />
                    DANA
                  </button>
                </div>
              </div>

              {/* Payment Details & Instructions */}
              <div className="border border-slate-100 dark:border-slate-800/80 rounded-2xl p-4 bg-slate-50 dark:bg-black/20 text-center">
                <div className="flex justify-between items-center text-[10px] font-bold text-slate-400 mb-3 uppercase tracking-wider">
                  <span>Informasi Transfer</span>
                  <span className="text-indigo-600 dark:text-indigo-400 flex items-center gap-1">
                    Batas Waktu: <strong className="font-mono">{formatTimer(checkoutTimer)}</strong>
                  </span>
                </div>

                {paymentMethod === 'qris' ? (
                  <div className="flex flex-col items-center py-2">
                    <div className="p-3 bg-white border border-pink-100 rounded-2xl shadow-sm mb-3">
                      <div className="w-[125px] h-[30px] bg-pink-600 rounded-md flex items-center justify-center text-[10px] text-white font-black uppercase mb-2 tracking-widest shadow-sm">
                        QRIS MERCH
                      </div>
                      <div 
                        className={`w-[120px] h-[120px] rounded-lg overflow-hidden flex items-center justify-center bg-slate-100 border ${settings.adminQrisUrl ? 'cursor-zoom-in hover:opacity-90 active:scale-95 transition-all' : ''}`}
                        onClick={() => settings.adminQrisUrl && setZoomImage(settings.adminQrisUrl)}
                        title={settings.adminQrisUrl ? "Klik untuk Perbesar" : undefined}
                      >
                        {settings.adminQrisUrl ? (
                          <div className="relative w-full h-full group">
                            <img src={settings.adminQrisUrl} alt="QRIS Merchant" className="w-full h-full object-contain" />
                            <div className="absolute inset-x-0 bottom-0 bg-black/50 text-[8px] text-white py-0.5 text-center opacity-0 group-hover:opacity-100 transition-opacity">
                              Perbesar 🔍
                            </div>
                          </div>
                        ) : (
                          <span className="text-[10px] text-slate-400">QRIS Tidak Tersedia</span>
                        )}
                      </div>
                    </div>
                    <p className="text-[10px] text-slate-500 leading-relaxed max-w-[260px]">
                      Silakan scan barcode QRIS di atas untuk melakukan pembayaran otomatis ke merchant Admin.
                    </p>
                  </div>
                ) : paymentMethod === 'dana' ? (
                  <div className="space-y-3 py-3 text-center">
                    <div className="p-3 bg-sky-500/10 border border-sky-500/20 rounded-xl max-w-[260px] mx-auto">
                      <p className="text-[10px] text-sky-500 uppercase font-black tracking-widest mb-1">E-Wallet DANA</p>
                      <h4 className="text-lg font-black text-slate-800 dark:text-slate-100">{settings.adminDanaNumber || 'Belum diatur'}</h4>
                      <p className="text-[9px] text-slate-400 mt-1">A.N Nabil Downloader Corp</p>
                    </div>
                    <p className="text-[10px] text-slate-500 leading-relaxed max-w-[260px] mx-auto">
                      Kirim nominal senilai <strong className="text-indigo-600 dark:text-indigo-400">{checkoutPlan.price}</strong> ke No DANA Admin di atas, lalu simpan bukti struk transfer.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3 py-3 text-center">
                    <div className="p-3 bg-blue-500/10 border border-blue-500/20 rounded-xl max-w-[260px] mx-auto">
                      <p className="text-[10px] text-blue-500 uppercase font-black tracking-widest mb-1">E-Wallet GoPay</p>
                      <h4 className="text-lg font-black text-slate-800 dark:text-slate-100">{settings.adminGopayNumber || 'Belum diatur'}</h4>
                      <p className="text-[9px] text-slate-400 mt-1">A.N Nabil Downloader Corp</p>
                    </div>
                    <p className="text-[10px] text-slate-500 leading-relaxed max-w-[260px] mx-auto">
                      Kirim nominal senilai <strong className="text-indigo-600 dark:text-indigo-400">{checkoutPlan.price}</strong> ke No GoPay Admin di atas, lalu simpan bukti struk transfer.
                    </p>
                  </div>
                )}
              </div>

              {/* Form Input fields */}
              <div className="space-y-3.5">
                {paymentMethod !== 'qris' && (
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Nomor HP Pengirim</label>
                    <input
                      type="text"
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value.replace(/[^0-9]/g, ''))}
                      placeholder="Contoh: 081234567890"
                      className="w-full bg-white dark:bg-[#0c1221] border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-3 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500 font-bold"
                    />
                  </div>
                )}

                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Catatan Tambahan (Opsional)</label>
                  <input
                    type="text"
                    value={userNote}
                    onChange={(e) => setUserNote(e.target.value)}
                    placeholder="Contoh: pembayaran atas nama nabil"
                    className="w-full bg-white dark:bg-[#0c1221] border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-3 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500 font-medium"
                  />
                </div>

                {/* Drag and Drop File Upload of Payment Proof */}
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1.5">Unggah Foto Bukti Transfer</label>
                  <div
                    onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                    onDragLeave={() => setIsDragging(false)}
                    onDrop={(e) => {
                      e.preventDefault();
                      setIsDragging(false);
                      const file = e.dataTransfer.files?.[0];
                      if (file) handleFile(file);
                    }}
                    onClick={() => document.getElementById('proof-image-upload')?.click()}
                    className={`border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer transition-all ${
                      isDragging
                        ? 'border-indigo-500 bg-indigo-500/10'
                        : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-slate-50/50 dark:bg-black/10'
                    }`}
                  >
                    <input
                      type="file"
                      id="proof-image-upload"
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) handleFile(file);
                      }}
                      className="hidden"
                    />
                    {proofImage ? (
                      <div className="space-y-2">
                        <img src={proofImage} alt="Bukti Transfer" className="max-h-36 mx-auto rounded-xl object-contain shadow" />
                        <p className="text-[10px] text-indigo-500 font-bold">Klik atau Seret Gambar Lain untuk Mengganti</p>
                      </div>
                    ) : (
                      <div className="space-y-1.5">
                        <Upload className="w-8 h-8 text-slate-400 mx-auto" />
                        <p className="text-xs font-bold text-slate-700 dark:text-slate-300">Pilih atau Seret Bukti Transfer</p>
                        <p className="text-[9px] text-slate-400">Pastikan gambar jelas & nomor referensi terlihat</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Submit Verification Request */}
              <button
                onClick={handleSendVerificationRequest}
                className="w-full py-4 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-md shadow-indigo-500/10 transition-colors flex items-center justify-center gap-1.5"
              >
                Kirim Bukti ke Admin 🚀
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </Modal>

    {/* Lightbox / Zoom Modal outside of the Modal overflow container to avoid clipping */}
    <AnimatePresence>
      {zoomImage && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[9999] bg-black/95 flex items-center justify-center p-4"
          onClick={() => setZoomImage(null)}
        >
          <div className="relative max-w-full max-h-full flex flex-col items-center">
            <button
              onClick={() => setZoomImage(null)}
              className="absolute -top-12 right-0 bg-white/10 hover:bg-white/20 text-white p-2.5 rounded-full transition-colors border border-white/10"
              title="Tutup"
            >
              <X className="w-5 h-5" />
            </button>
            <img src={zoomImage} alt="Perbesar Gambar" className="max-w-[95vw] max-h-[85vh] rounded-lg object-contain shadow-2xl" />
            <p className="text-center text-white/75 text-[11px] mt-3 font-medium">Klik di mana saja untuk menutup</p>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  </>
  );
}

export function UserProfilePanel({ isOpen, onClose, user, onLogout, onOpenRewards, onUpdateUser }: { isOpen: boolean, onClose: () => void, user: UserState, onLogout: () => void, onOpenRewards: () => void, onUpdateUser?: (updated: UserState) => void }) {
  const [editName, setEditName] = useState(user.username);
  const [editEmail, setEditEmail] = useState(user.email || '');
  const [editPassword, setEditPassword] = useState('');
  const [showEditPass, setShowEditPass] = useState(false);
  const [editSuccess, setEditSuccess] = useState('');
  const [editError, setEditError] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const [editQuestion, setEditQuestion] = useState(STANDARD_SECURITY_QUESTIONS[0]);
  const [editQuestionCustom, setEditQuestionCustom] = useState('');
  const [editAnswer, setEditAnswer] = useState('');

  useEffect(() => {
    if (isOpen && user.email) {
      setEditName(user.username);
      setEditEmail(user.email || '');
      setEditPassword(getUserPassword(user.email));

      const users = getRegisteredUsers();
      const found = users.find((u: any) => u.email.toLowerCase() === user.email!.toLowerCase());
      if (found) {
        const q = found.securityQuestion || '';
        if (STANDARD_SECURITY_QUESTIONS.includes(q)) {
          setEditQuestion(q);
          setEditQuestionCustom('');
        } else if (q) {
          setEditQuestion('custom');
          setEditQuestionCustom(q);
        } else {
          setEditQuestion(STANDARD_SECURITY_QUESTIONS[0]);
          setEditQuestionCustom('');
        }
        setEditAnswer(found.securityAnswer || '');
      } else {
        setEditQuestion(STANDARD_SECURITY_QUESTIONS[0]);
        setEditQuestionCustom('');
        setEditAnswer('');
      }

      setEditSuccess('');
      setEditError('');
      setIsEditing(false);
      setShowDeleteConfirm(false);
    }
  }, [isOpen, user]);

  const handleDeleteSelf = () => {
    if (user.email) {
      deleteUserAccount(user.email);
    }
    clearHistory();
    onLogout();
    onClose();
  };

  const handleSaveProfile = () => {
    if (!editName.trim()) {
      setEditError('Nama lengkap tidak boleh kosong!');
      return;
    }
    if (!editEmail.trim()) {
      setEditError('Email tidak boleh kosong!');
      return;
    }
    if (editPassword.length !== 6) {
      setEditError('Password harus tepat 6 karakter/angka!');
      return;
    }

    const finalQuestion = editQuestion === 'custom' ? editQuestionCustom : editQuestion;
    if (editQuestion === 'custom' && !editQuestionCustom.trim()) {
      setEditError('Silakan masukkan pertanyaan keamanan kustom Anda.');
      return;
    }
    if (!editAnswer.trim()) {
      setEditError('Silakan masukkan jawaban keamanan rahasia Anda.');
      return;
    }

    const oldEmail = user.email || '';
    const successUpdate = updateUserProfile(oldEmail, {
      email: editEmail,
      name: editName,
      password: editPassword,
      securityQuestion: finalQuestion,
      securityAnswer: editAnswer
    });

    if (!successUpdate) {
      setEditError('Email sudah terdaftar di akun lain!');
      return;
    }

    // Update active user state
    if (onUpdateUser) {
      const updatedUser = {
        ...user,
        username: editName,
        email: editEmail,
        avatar: editEmail !== oldEmail ? `https://api.dicebear.com/7.x/avataaars/svg?seed=${editEmail}` : user.avatar
      };
      onUpdateUser(updatedUser);
    }

    setEditError('');
    setEditSuccess('Profil berhasil diperbarui!');
    setTimeout(() => {
      setIsEditing(false);
      setEditSuccess('');
    }, 1500);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Profil Akun">
      <div className="flex flex-col items-center mb-6">
        <div className="w-20 h-20 rounded-full border-4 border-indigo-100 dark:border-indigo-900 overflow-hidden bg-slate-100 dark:bg-slate-800 mb-4">
          {user.avatar ? (
            <img src={user.avatar} alt={user.username} className="w-full h-full object-cover" />
          ) : (
            <User className="w-full h-full p-4 text-slate-400" />
          )}
        </div>
        <h3 className="text-xl font-bold text-slate-900 dark:text-white">{user.username}</h3>
        {isPremiumActive(user) ? (
          <div className="flex flex-col items-center gap-1.5 mt-2">
            <div className="bg-gradient-to-r from-amber-200 to-amber-400 text-amber-900 text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1.5 shadow-sm animate-pulse">
              <Sparkles className="w-3.5 h-3.5" />
              Premium Member {user.premiumUntil === -1 || user.email?.toLowerCase() === 'jrnabil570@gmail.com' ? '(Permanen)' : ''}
            </div>
            <PremiumStatusBadge user={user} className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-xl" />
          </div>
        ) : (
          <div className="mt-2 bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 text-xs font-bold px-3 py-1 rounded-full">
            Pengguna Gratis
          </div>
        )}
      </div>

      <div className="bg-indigo-50 dark:bg-indigo-500/10 border border-indigo-100 dark:border-indigo-500/20 rounded-2xl p-4 mb-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-indigo-100 dark:bg-indigo-500/20 rounded-xl flex items-center justify-center text-indigo-600 dark:text-indigo-400">
            <Zap className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs font-medium text-slate-500 dark:text-slate-400">Poin Terkumpul</div>
            {user.email?.toLowerCase() === 'jrnabil570@gmail.com' ? (
              <div className="flex items-center gap-1 mt-1">
                <input
                  type="number"
                  value={user.points}
                  onChange={(e) => {
                    const newPts = parseInt(e.target.value) || 0;
                    if (onUpdateUser) {
                      onUpdateUser({ ...user, points: newPts });
                    }
                  }}
                  className="w-24 bg-white dark:bg-[#0b0f19] border border-slate-200 dark:border-slate-800 rounded-lg px-2 py-1 text-xs text-indigo-600 dark:text-indigo-400 font-extrabold focus:outline-none focus:border-indigo-500"
                />
                <span className="text-[10px] font-bold text-indigo-500 dark:text-indigo-400">pts (Edit Bebas)</span>
              </div>
            ) : (
              <motion.div 
                key={user.points}
                initial={{ scale: 1 }}
                animate={{
                  scale: [1, 1.25, 0.95, 1.05, 1],
                  color: ["#4f46e5", "#10b981", "#4f46e5"],
                  x: [0, -3, 3, -1.5, 1.5, 0]
                }}
                transition={{ duration: 0.6 }}
                className="text-xl font-black text-indigo-600 dark:text-indigo-400 origin-left"
              >
                {user.points} pts
              </motion.div>
            )}
          </div>
        </div>
        <button onClick={() => { onClose(); onOpenRewards(); }} className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-bold rounded-xl transition-colors shadow-md shadow-indigo-500/20">
          Tukar
        </button>
      </div>

      {isEditing ? (
        <div className="border border-slate-200 dark:border-slate-800 rounded-2xl p-4 mb-4 bg-slate-50 dark:bg-[#090d16] text-left">
          <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200 mb-3 uppercase tracking-wider flex items-center gap-1.5 border-b border-slate-200 dark:border-slate-800/80 pb-2">
            <User className="w-3.5 h-3.5 text-indigo-500" />
            Edit Informasi Akun
          </h4>

          {editError && (
            <div className="mb-3 bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/50 text-rose-600 dark:text-rose-400 text-[10px] font-bold p-2.5 rounded-xl text-center">
              {editError}
            </div>
          )}
          {editSuccess && (
            <div className="mb-3 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900/50 text-emerald-600 dark:text-emerald-400 text-[10px] font-bold p-2.5 rounded-xl text-center">
              {editSuccess}
            </div>
          )}

          <div className="space-y-3">
            <div>
              <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 mb-1 uppercase tracking-wide">Nama Lengkap</label>
              <input
                type="text"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                className="w-full bg-white dark:bg-[#0b0f19] border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-950 dark:text-white focus:outline-none focus:border-indigo-500"
                placeholder="Nama Lengkap Anda"
              />
            </div>

            <div>
              <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 mb-1 uppercase tracking-wide">Alamat Email</label>
              <input
                type="email"
                value={editEmail}
                onChange={(e) => setEditEmail(e.target.value)}
                className="w-full bg-white dark:bg-[#0b0f19] border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-950 dark:text-white focus:outline-none focus:border-indigo-500"
                placeholder="email@example.com"
              />
            </div>

            <div>
              <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 mb-1 uppercase tracking-wide">Password (6 Angka/Karakter)</label>
              <div className="relative">
                <input
                  type={showEditPass ? 'text' : 'password'}
                  value={editPassword}
                  maxLength={6}
                  onChange={(e) => setEditPassword(e.target.value)}
                  className="w-full bg-white dark:bg-[#0b0f19] border border-slate-200 dark:border-slate-800 rounded-xl pl-3 pr-10 py-2 text-xs text-slate-950 dark:text-white focus:outline-none focus:border-indigo-500 font-mono tracking-widest"
                  placeholder="Password 6 digit"
                />
                <button
                  type="button"
                  onClick={() => setShowEditPass(!showEditPass)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                >
                  {showEditPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 mb-1 uppercase tracking-wide">Pertanyaan Keamanan Rahasia</label>
              <select
                value={editQuestion}
                onChange={(e) => {
                  setEditQuestion(e.target.value);
                  if (e.target.value !== 'custom') {
                    setEditQuestionCustom('');
                  }
                }}
                className="w-full bg-white dark:bg-[#0b0f19] border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-950 dark:text-white focus:outline-none focus:border-indigo-500"
              >
                {STANDARD_SECURITY_QUESTIONS.map((q, idx) => (
                  <option key={idx} value={q}>{q}</option>
                ))}
                <option value="custom">Tulis pertanyaan sendiri...</option>
              </select>
            </div>

            {editQuestion === 'custom' && (
              <div>
                <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 mb-1 uppercase tracking-wide">Tulis Pertanyaan Keamanan Kustom Anda</label>
                <input
                  type="text"
                  required
                  value={editQuestionCustom}
                  onChange={(e) => setEditQuestionCustom(e.target.value)}
                  className="w-full bg-white dark:bg-[#0b0f19] border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-950 dark:text-white focus:outline-none focus:border-indigo-500"
                  placeholder="Contoh: Siapa nama sahabat kecil Anda?"
                />
              </div>
            )}

            <div>
              <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 mb-1 uppercase tracking-wide">Jawaban Rahasia</label>
              <input
                type="text"
                required
                value={editAnswer}
                onChange={(e) => setEditAnswer(e.target.value)}
                className="w-full bg-white dark:bg-[#0b0f19] border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-950 dark:text-white focus:outline-none focus:border-indigo-500"
                placeholder="Jawaban Rahasia"
              />
              <span className="text-[9px] text-slate-400 block mt-1">Digunakan untuk memulihkan akun jika Anda lupa kata sandi.</span>
            </div>

            <div className="flex gap-2 pt-1.5">
              <button
                onClick={() => {
                  setIsEditing(false);
                  setEditError('');
                  setEditSuccess('');
                }}
                className="flex-1 py-2 px-3 bg-slate-200 hover:bg-slate-300 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold text-xs rounded-xl transition-all"
              >
                Batal
              </button>
              <button
                onClick={handleSaveProfile}
                className="flex-1 py-2 px-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl transition-all shadow-md shadow-indigo-500/20"
              >
                Simpan
              </button>
            </div>
          </div>
        </div>
      ) : (
        <button
          onClick={() => setIsEditing(true)}
          className="w-full mb-3 py-3 px-4 border border-indigo-200 dark:border-indigo-500/20 hover:bg-indigo-50 dark:hover:bg-indigo-950/20 text-indigo-600 dark:text-indigo-400 font-bold text-xs rounded-xl transition-all flex items-center justify-center gap-2"
        >
          <User className="w-4 h-4" />
          Edit Profil & Pengaturan Akun
        </button>
      )}

      <div className="space-y-2 mt-4 border-t border-slate-100 dark:border-slate-800 pt-4">
        {!showDeleteConfirm ? (
          <>
            <button onClick={() => { onClose(); onLogout(); }} className="w-full py-3 px-4 bg-slate-100 dark:bg-slate-800/50 hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold rounded-xl transition-colors flex items-center justify-center gap-2 text-xs">
              Keluar dari Akun
            </button>
            <button 
              onClick={() => setShowDeleteConfirm(true)} 
              className="w-full py-3 px-4 bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/10 dark:hover:bg-rose-950/20 text-rose-600 dark:text-rose-400 font-bold rounded-xl transition-colors flex items-center justify-center gap-2 text-xs"
            >
              Hapus Akun Mandiri (Permanen)
            </button>
          </>
        ) : (
          <div className="bg-rose-50 dark:bg-rose-950/25 border border-rose-200 dark:border-rose-900/40 rounded-2xl p-4 text-left">
            <div className="flex gap-2.5 items-start text-rose-600 dark:text-rose-400 mb-3">
              <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5" />
              <div>
                <h4 className="text-xs font-black uppercase tracking-wider">Konfirmasi Hapus Akun</h4>
                <p className="text-[10px] font-semibold text-slate-500 dark:text-slate-400 mt-1 leading-normal">
                  Apakah Anda yakin? Seluruh riwayat unduhan, profil, dan poin Anda akan dibersihkan secara permanen dari database lokal dan tidak dapat dikembalikan.
                </p>
              </div>
            </div>
            <div className="flex gap-2">
              <button 
                onClick={() => setShowDeleteConfirm(false)} 
                className="flex-1 py-2 px-3 bg-slate-200 hover:bg-slate-300 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold text-xs rounded-xl transition-all"
              >
                Batal
              </button>
              <button 
                onClick={handleDeleteSelf} 
                className="flex-1 py-2 px-3 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-xl transition-all shadow-md shadow-rose-500/25"
              >
                Ya, Hapus Permanen
              </button>
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
}

export function LoginScreen({ onLogin }: { onLogin: (user: UserState) => void }) {
  const [isRegister, setIsRegister] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showResetPassword, setShowResetPassword] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [rememberMe, setRememberMe] = useState(false);

  const [isForgotPassword, setIsForgotPassword] = useState(false);
  const [forgotStep, setForgotStep] = useState<'email' | 'question'>('email');
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotQuestion, setForgotQuestion] = useState('');
  const [forgotAnswer, setForgotAnswer] = useState('');
  const [forgotNewPassword, setForgotNewPassword] = useState('');

  // Security Question register states
  const [regQuestion, setRegQuestion] = useState(STANDARD_SECURITY_QUESTIONS[0]);
  const [regQuestionCustom, setRegQuestionCustom] = useState('');
  const [regAnswer, setRegAnswer] = useState('');

  // Email Verification states
  const [isVerifyingEmail, setIsVerifyingEmail] = useState(false);
  const [verificationCode, setVerificationCode] = useState('');
  const [verificationInput, setVerificationInput] = useState('');
  const [verificationTimer, setVerificationTimer] = useState(0);

  useEffect(() => {
    let interval: any;
    if (verificationTimer > 0 && isVerifyingEmail) {
      interval = setInterval(() => {
        setVerificationTimer((prev: any) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [verificationTimer, isVerifyingEmail]);

  useEffect(() => {
    const saved = localStorage.getItem('saved_credentials');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setEmail(parsed.email);
        setPassword(parsed.password);
        setRememberMe(true);
      } catch (e) {}
    }
    
    const handleOpenForgot = () => setIsForgotPassword(true);
    window.addEventListener('open_forgot_password', handleOpenForgot);
    return () => window.removeEventListener('open_forgot_password', handleOpenForgot);
  }, []);

  const handleForgotPasswordSubmit = (e: any) => {
    e.preventDefault();
    if (forgotStep === 'email') {
      if (!forgotEmail) return;
      
      const users = getRegisteredUsers();
      const found = users.find((u: any) => u.email.toLowerCase() === forgotEmail.toLowerCase());
      if (!found) {
        setError('Email tidak terdaftar!');
        return;
      }
      
      const question = found.securityQuestion;
      if (!question) {
        setError('Akun ini tidak memiliki konfigurasi pertanyaan keamanan rahasia. Hubungi Administrator.');
        return;
      }
      
      setForgotQuestion(question);
      setForgotStep('question');
      setForgotAnswer('');
      setForgotNewPassword('');
      setError('');
      setSuccess('');
    } else {
      if (!forgotAnswer.trim()) {
        setError('Silakan masukkan jawaban rahasia.');
        return;
      }
      if (forgotNewPassword.length !== 6) {
        setError('Password baru harus tepat 6 karakter/angka!');
        return;
      }
      
      const result = verifySecurityAnswerAndResetPassword(forgotEmail, forgotAnswer, forgotNewPassword);
      if (result.success) {
        setSuccess(result.message);
        setError('');
        setIsForgotPassword(false);
        setPassword(forgotNewPassword);
        setEmail(forgotEmail);
      } else {
        setError(result.message);
      }
    }
  };

  const handleVerifyAndRegister = (e: any) => {
    e.preventDefault();
    if (verificationInput !== verificationCode) {
      setError('Kode verifikasi salah! Silakan masukkan kode 6-digit yang benar.');
      return;
    }
    const currentIp = getSimulatedIp(email);
    const users = getRegisteredUsers();
    
    const settings = getSettings();
    const initialPoints = settings.registerPointsReward !== undefined ? settings.registerPointsReward : 50;
    
    const finalQuestion = regQuestion === 'custom' ? regQuestionCustom : regQuestion;
    users.push({ 
      name, 
      email, 
      password, 
      points: initialPoints, 
      ip: currentIp,
      securityQuestion: finalQuestion,
      securityAnswer: regAnswer,
      verified: true
    });
    saveRegisteredUsers(users);
    setSuccess('Akun berhasil diverifikasi & didaftarkan! Silakan masuk.');
    setError('');
    
    setIsRegister(false);
    setIsVerifyingEmail(false);
    setName('');
    setPassword('');
    setRegAnswer('');
    setRegQuestionCustom('');
    setRegQuestion(STANDARD_SECURITY_QUESTIONS[0]);
  };

  const sendVerificationCode = () => {
    const code = String(Math.floor(100000 + Math.random() * 900000));
    setVerificationCode(code);
    setVerificationInput('');
    setVerificationTimer(60);
    setSuccess(`Kode verifikasi baru telah dikirimkan ke email ${email}!`);
    setError('');
  };

  const handleSubmit = (e: any) => {
    e.preventDefault();
    if (!email || !password) return;
    if (isRegister && !name) return;

    if (password.length !== 6) {
      setError('Password harus tepat 6 karakter/angka!');
      return;
    }

    if (isRegister) {
      const usersRaw = localStorage.getItem('registered_users');
      const users = usersRaw ? JSON.parse(usersRaw) : [];
      const exists = users.some((u: any) => u.email.toLowerCase() === email.toLowerCase());
      if (exists) {
        setError('Email sudah terdaftar! Silakan gunakan email lain atau langsung masuk.');
        return;
      }
      
      if (regQuestion === 'custom' && !regQuestionCustom.trim()) {
        setError('Silakan masukkan pertanyaan keamanan kustom Anda.');
        return;
      }
      if (!regAnswer.trim()) {
        setError('Silakan masukkan jawaban keamanan rahasia Anda.');
        return;
      }
      
      const code = String(Math.floor(100000 + Math.random() * 900000));
      setVerificationCode(code);
      setVerificationInput('');
      setVerificationTimer(60);
      setIsVerifyingEmail(true);
      setError('');
      setSuccess('');
      return;
    }

    if (rememberMe) {
      localStorage.setItem('saved_credentials', JSON.stringify({ email, password }));
    } else {
      localStorage.removeItem('saved_credentials');
    }
    
    const usersRaw = localStorage.getItem('registered_users');
    const users = usersRaw ? JSON.parse(usersRaw) : [];
    const foundUser = users.find((u: any) => u.email.toLowerCase() === email.toLowerCase());

    if (!foundUser) {
      setError('Akun tidak ditemukan. Silakan daftar terlebih dahulu atau akun Anda mungkin telah dihapus.');
      return;
    }

    const currentIp = getSimulatedIp(email);
    const banReason = checkBanStatus(foundUser || { email, ip: currentIp });
    if (banReason) {
      setError(banReason);
      return;
    }

    if (foundUser && foundUser.password !== password) {
      setError('Password salah! Silakan masukkan password yang tepat.');
      return;
    }

    const settings = getSettings();
    const initialPoints = settings.registerPointsReward !== undefined ? settings.registerPointsReward : 50;

    const username = foundUser ? foundUser.name : email.split('@')[0];
    const userPoints = foundUser && foundUser.points !== undefined ? foundUser.points : initialPoints;
    const premiumUntil = foundUser && foundUser.premiumUntil !== undefined ? foundUser.premiumUntil : null;
    const hasSeenTutorial = foundUser && foundUser.hasSeenTutorial !== undefined ? foundUser.hasSeenTutorial : false;

    const mockUser: UserState = {
      isLoggedIn: true,
      username: username || `User${Math.floor(Math.random() * 1000)}`,
      email,
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=' + email,
      points: userPoints,
      premiumUntil,
      hasSeenTutorial,
      ip: currentIp,
      banned: foundUser ? foundUser.banned : false
    };

    logUserLogin(email, mockUser.username, mockUser.points);
    onLogin(mockUser);
  };

  if (isForgotPassword) {
    return (
      <div className="w-full max-w-md mx-auto bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl p-8 rounded-[2.5rem] shadow-2xl border border-slate-200 dark:border-slate-800">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-amber-50 dark:bg-amber-500/10 text-amber-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Shield className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Reset Password</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">Verifikasi identitas Anda untuk mengatur ulang password.</p>
        </div>
        
        <form onSubmit={handleForgotPasswordSubmit} className="space-y-4">
          {error && <div className="bg-rose-50 text-rose-600 p-3 rounded-xl text-xs font-semibold">{error}</div>}
          {success && <div className="bg-emerald-50 text-emerald-600 p-3 rounded-xl text-xs font-semibold">{success}</div>}
          
          {forgotStep === 'email' ? (
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">Email Akun</label>
              <input type="email" required value={forgotEmail} onChange={e => setForgotEmail(e.target.value)} className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-5 py-4 text-sm text-slate-900 dark:text-white focus:border-indigo-500 outline-none" placeholder="Masukkan email akun Anda" />
            </div>
          ) : (
            <>
              <div className="bg-slate-50 dark:bg-slate-950 p-4 rounded-xl mb-4 border border-slate-200 dark:border-slate-800">
                <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">Pertanyaan Keamanan Anda:</p>
                <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">{forgotQuestion}</p>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">Jawaban Rahasia</label>
                <input type="text" required value={forgotAnswer} onChange={e => setForgotAnswer(e.target.value)} className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-5 py-4 text-sm text-slate-900 dark:text-white focus:border-indigo-500 outline-none" placeholder="Masukkan jawaban rahasia" />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">Password Baru (6 Karakter)</label>
                <div className="relative">
                  <input type={showResetPassword ? "text" : "password"} required maxLength={6} value={forgotNewPassword} onChange={e => setForgotNewPassword(e.target.value)} className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-5 py-4 text-sm text-slate-900 dark:text-white focus:border-indigo-500 outline-none" placeholder="Masukkan password baru" />
                  <button
                    type="button"
                    onClick={() => setShowResetPassword(!showResetPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
                  >
                    {showResetPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>
            </>
          )}
          
          <button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-4 rounded-2xl transition-all shadow-lg mt-4">
            {forgotStep === 'email' ? 'Lanjutkan' : 'Reset Password'}
          </button>
          
          <div className="text-center mt-4">
            <button type="button" onClick={() => { setIsForgotPassword(false); setForgotStep('email'); }} className="text-xs text-slate-500 hover:text-slate-800 dark:hover:text-white font-semibold">
              Kembali ke Login
            </button>
          </div>
        </form>
      </div>
    );
  }

  if (isVerifyingEmail) {
    return (
      <div className="w-full max-w-md mx-auto bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl p-8 rounded-[2.5rem] shadow-2xl border border-slate-200 dark:border-slate-800">
        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-emerald-50 dark:bg-emerald-500/10 text-emerald-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Mail className="w-8 h-8" />
          </div>
          <h3 className="text-xl font-bold text-slate-900 dark:text-white">Verifikasi Email Anda</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">Kode OTP 6-digit telah dikirim ke: <br/><strong className="text-slate-700 dark:text-slate-300">{email}</strong></p>
        </div>
        <form onSubmit={handleVerifyAndRegister} className="space-y-4">
          {error && <div className="bg-rose-50 text-rose-600 p-3 rounded-xl text-xs font-semibold text-center">{error}</div>}
          {success && <div className="bg-emerald-50 text-emerald-600 p-3 rounded-xl text-xs font-semibold text-center">{success}</div>}
          <div className="bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 text-xs p-3 rounded-xl text-center border border-blue-200 dark:border-blue-800">
            <strong>:</strong> Kode verifikasi Anda adalah: <span className="text-lg font-black tracking-widest block mt-1">{verificationCode}</span>
          </div>
          <div>
            <input type="text" required maxLength={6} value={verificationInput} onChange={e => setVerificationInput(e.target.value.replace(/\D/g, ''))} className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-5 py-4 text-center text-xl font-bold tracking-[0.5em] text-slate-900 dark:text-white focus:border-indigo-500 outline-none" placeholder="------" />
          </div>
          <button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-4 rounded-2xl">
            Verifikasi & Buat Akun
          </button>
          <div className="text-center mt-4">
            <button type="button" disabled={verificationTimer > 0} onClick={sendVerificationCode} className="text-xs text-indigo-600 font-semibold disabled:text-slate-400">
              {verificationTimer > 0 ? `Kirim ulang kode (${verificationTimer}s)` : 'Kirim Ulang Kode OTP'}
            </button>
          </div>
          <div className="text-center mt-2">
            <button type="button" onClick={() => setIsVerifyingEmail(false)} className="text-xs text-slate-500 font-semibold">
              Batal & Kembali
            </button>
          </div>
        </form>
      </div>
    );
  }

  return (
    <div className="w-full max-w-md mx-auto bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl p-8 rounded-[2.5rem] shadow-2xl border border-slate-200 dark:border-slate-800">
      <div className="text-center mb-8">
        <div className="w-20 h-20 bg-indigo-600 text-white rounded-[1.5rem] flex items-center justify-center mx-auto mb-6 shadow-lg shadow-indigo-500/30">
          <LogIn className="w-10 h-10" />
        </div>
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
          {isRegister ? 'Buat Akun Baru' : 'Selamat Datang'}
        </h2>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          {isRegister 
            ? 'Daftar sekarang untuk mulai mengunduh video dan mengumpulkan poin gratis.' 
            : 'Silakan masuk ke akun Anda untuk melanjutkan.'}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        {error && (
          <div className="bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/50 text-rose-600 dark:text-rose-400 text-xs font-semibold p-3.5 rounded-xl text-center">
            {error}
          </div>
        )}
        {success && (
          <div className="bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900/50 text-emerald-600 dark:text-emerald-400 text-xs font-semibold p-3.5 rounded-xl text-center">
            {success}
          </div>
        )}

        {isRegister && (
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2 uppercase tracking-wider">Nama Lengkap</label>
            <input
              type="text"
              required
              value={name}
              onChange={e => setName(e.target.value)}
              className="w-full bg-slate-50 dark:bg-black/50 border border-slate-200 dark:border-slate-800 rounded-xl px-5 py-4 text-sm text-slate-900 dark:text-white focus:border-indigo-500 focus:outline-none transition-colors"
              placeholder="Contoh: Budi Santoso"
            />
          </div>
        )}

        <div>
          <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2 uppercase tracking-wider">Email Akun</label>
          <input
            type="email"
            required
            value={email}
            onChange={e => setEmail(e.target.value.toLowerCase())}
            className="w-full bg-slate-50 dark:bg-black/50 border border-slate-200 dark:border-slate-800 rounded-xl px-5 py-4 text-sm text-slate-900 dark:text-white focus:border-indigo-500 focus:outline-none transition-colors"
            placeholder="nama@email.com"
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2 uppercase tracking-wider">Password (6 Karakter)</label>
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              required
              maxLength={6}
              value={password}
              onChange={e => setPassword(e.target.value)}
              className="w-full bg-slate-50 dark:bg-black/50 border border-slate-200 dark:border-slate-800 rounded-xl px-5 py-4 text-sm font-mono tracking-widest text-slate-900 dark:text-white focus:border-indigo-500 focus:outline-none transition-colors"
              placeholder="••••••"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
            >
              {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {isRegister && (
          <div className="pt-2 pb-2 border-t border-slate-200 dark:border-slate-800 mt-4">
            <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200 mb-3 flex items-center gap-2">
              <Shield className="w-4 h-4 text-indigo-500" />
              Pengaturan Keamanan Akun
            </h4>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mb-3 leading-relaxed">
              Pertanyaan keamanan ini akan digunakan jika Anda lupa password. Pastikan Anda mengingat jawabannya.
            </p>
            <div className="space-y-3">
              <div>
                <label className="block text-[10px] font-bold text-slate-600 dark:text-slate-400 mb-1.5 uppercase tracking-wider">Pilih Pertanyaan</label>
                <select 
                  value={regQuestion}
                  onChange={e => setRegQuestion(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-black/50 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-3 text-sm text-slate-900 dark:text-white focus:border-indigo-500 focus:outline-none"
                >
                  {STANDARD_SECURITY_QUESTIONS.map((q, i) => (
                    <option key={i} value={q}>{q}</option>
                  ))}
                  <option value="custom">Tulis pertanyaan sendiri...</option>
                </select>
              </div>
              
              {regQuestion === 'custom' && (
                <div>
                  <label className="block text-[10px] font-bold text-slate-600 dark:text-slate-400 mb-1.5 uppercase tracking-wider">Pertanyaan Kustom</label>
                  <input
                    type="text"
                    required={regQuestion === 'custom'}
                    value={regQuestionCustom}
                    onChange={e => setRegQuestionCustom(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-black/50 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-3 text-sm text-slate-900 dark:text-white focus:border-indigo-500 focus:outline-none"
                    placeholder="Contoh: Apa nama hewan peliharaan pertama saya?"
                  />
                </div>
              )}
              
              <div>
                <label className="block text-[10px] font-bold text-slate-600 dark:text-slate-400 mb-1.5 uppercase tracking-wider">Jawaban Rahasia Anda</label>
                <input
                  type="text"
                  required
                  value={regAnswer}
                  onChange={e => setRegAnswer(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-black/50 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-3 text-sm text-slate-900 dark:text-white focus:border-indigo-500 focus:outline-none"
                  placeholder="Masukkan jawaban yang mudah Anda ingat"
                />
              </div>
            </div>
          </div>
        )}

        {!isRegister && (
          <div className="flex items-center">
            <label className="flex items-center gap-2 cursor-pointer group">
              <input 
                type="checkbox" 
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500 dark:focus:ring-indigo-600 dark:ring-offset-slate-900 cursor-pointer" 
              />
              <span className="text-xs font-semibold text-slate-600 dark:text-slate-400 group-hover:text-slate-900 dark:group-hover:text-slate-200 transition-colors">
                Simpan Info Login (Ingat Saya)
              </span>
            </label>
          </div>
        )}

        <div className="pt-2">
          <button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-4 rounded-2xl transition-all shadow-lg hover:shadow-indigo-500/25 flex items-center justify-center gap-2">
            <LogIn className="w-5 h-5" /> {isRegister ? 'Daftar Sekarang' : 'Masuk'}
          </button>
          
          {!isRegister && (
            <div className="text-center mt-4">
              <button type="button" onClick={() => setIsForgotPassword(true)} className="text-xs text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 dark:hover:text-indigo-300 font-semibold">Lupa Password?</button>
            </div>
          )}
        </div>
      </form>

      <div className="mt-8 text-center border-t border-slate-200 dark:border-slate-800 pt-6">
        <p className="text-sm text-slate-600 dark:text-slate-400 font-semibold">
          {isRegister ? 'Sudah punya akun?' : 'Belum punya akun?'}
        </p>
        <button
          onClick={() => {
            setIsRegister(!isRegister);
            setError('');
            setSuccess('');
          }}
          className="mt-2 text-indigo-600 dark:text-indigo-400 font-bold hover:text-indigo-700 dark:hover:text-indigo-300 transition-colors bg-indigo-50 dark:bg-indigo-500/10 px-6 py-2.5 rounded-full"
        >
          {isRegister ? 'Masuk ke Akun' : 'Daftar Akun Baru'}
        </button>
      </div>
    </div>
  );
}

export function TutorialPanel({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const [step, setStep] = useState(1);
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[100]"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-sm bg-white dark:bg-[#0b0f19] border border-slate-200 dark:border-white/10 rounded-3xl p-6 z-[101] shadow-2xl"
          >
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">{t('Tutorial')}</h2>
              <button onClick={onClose} className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="space-y-4 mb-8">
              {step === 1 && (
                <div className="text-center space-y-4">
                  <div className="w-16 h-16 bg-blue-500/10 text-blue-500 rounded-full flex items-center justify-center mx-auto">
                    <span className="text-2xl font-bold">1</span>
                  </div>
                  <h3 className="font-bold text-lg text-slate-900 dark:text-white">Copy Link</h3>
                  <p className="text-slate-600 dark:text-slate-400">Copy the video link from TikTok or YouTube app.</p>
                </div>
              )}
              {step === 2 && (
                <div className="text-center space-y-4">
                  <div className="w-16 h-16 bg-indigo-500/10 text-indigo-500 rounded-full flex items-center justify-center mx-auto">
                    <span className="text-2xl font-bold">2</span>
                  </div>
                  <h3 className="font-bold text-lg text-slate-900 dark:text-white">Paste Link</h3>
                  <p className="text-slate-600 dark:text-slate-400">Paste the copied link into the input field in this app.</p>
                </div>
              )}
              {step === 3 && (
                <div className="text-center space-y-4">
                  <div className="w-16 h-16 bg-emerald-500/10 text-emerald-500 rounded-full flex items-center justify-center mx-auto">
                    <span className="text-2xl font-bold">3</span>
                  </div>
                  <h3 className="font-bold text-lg text-slate-900 dark:text-white">{t('Unduh')}</h3>
                  <p className="text-slate-600 dark:text-slate-400">Click download and choose your preferred video quality.</p>
                </div>
              )}
            </div>

            <div className="flex gap-3">
              {step < 3 ? (
                <button onClick={() => setStep(step + 1)} className="flex-1 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl transition-colors">
                  {t('Selanjutnya')}
                </button>
              ) : (
                <button onClick={onClose} className="flex-1 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl transition-colors">
                  {t('Selesai')}
                </button>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

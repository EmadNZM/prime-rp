import React, { useState, useEffect } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { useAuth } from '../../context/AuthContext';
import { PrimeLogo } from '../../components/common/PrimeLogo';
import { Lock, User, KeyRound, AlertCircle, ArrowRight, ArrowLeft } from 'lucide-react';

interface LoginPageProps {
  setCurrentTab: (tab: string) => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ setCurrentTab }) => {
  const { language, isRtl } = useLanguage();
  const { loginWithDiscord, portalLogin, isAuthenticated } = useAuth();
  
  const [username, setUsername] = useState<string>('PrimeOwner');
  const [password, setPassword] = useState<string>('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  useEffect(() => {
    if (isAuthenticated) {
      setCurrentTab('dashboard');
    }
  }, [isAuthenticated, setCurrentTab]);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('error')) {
      setErrorMsg(
        language === 'ar'
          ? 'تعذر التحقق التلقائي عبر Discord. يرجى تسجيل الدخول عبر البوابة الرسمية أدناه.'
          : 'Discord verification was not completed. Please sign in via the portal below.'
      );
    }
  }, [language]);

  const handlePortalSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim()) {
      setErrorMsg(language === 'ar' ? 'يرجى إدخال اسم المستخدم' : 'Please enter a username');
      return;
    }
    
    setIsSubmitting(true);
    setErrorMsg(null);
    try {
      await portalLogin(username.trim(), password);
      setCurrentTab('dashboard');
    } catch (err: any) {
      console.error('Portal sign in error:', err);
      setErrorMsg(
        language === 'ar'
          ? 'فشل تسجيل الدخول. تأكد من صحة بيانات الحساب والمحاولة مجدداً.'
          : 'Authentication failed. Please check your credentials and try again.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const BackIcon = isRtl ? ArrowRight : ArrowLeft;

  return (
    <div className="min-h-screen bg-[#070707] text-[#E5E5E5] pt-28 pb-24 px-4 flex items-center justify-center">
      <div className="max-w-md w-full bg-[#0B0B0B] border border-[#202020] rounded-3xl p-6 sm:p-8 shadow-2xl relative overflow-hidden">
        
        {/* Ambient Halo Glow */}
        <div 
          className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-28 bg-[#C8874B]/15 blur-3xl pointer-events-none rounded-full" 
          aria-hidden="true"
        />

        {/* Back Link */}
        <button
          onClick={() => setCurrentTab('home')}
          className="inline-flex items-center gap-1.5 text-xs text-[#777] hover:text-[#C8874B] transition-colors mb-6 relative z-10"
        >
          <BackIcon className="w-3.5 h-3.5" />
          <span>{language === 'ar' ? 'العودة للرئيسية' : 'Back to Home'}</span>
        </button>

        {/* Portal Header */}
        <div className="text-center mb-6 relative z-10">
          <div className="flex justify-center mb-3">
            <PrimeLogo size="md" variant="login" showText={false} withGlow={true} />
          </div>
          <h1 className="text-2xl font-black text-white tracking-tight mb-1">
            {language === 'ar' ? 'بوابة تسجيل الدخول الرسمية' : 'Official Portal Login'}
          </h1>
          <p className="text-xs text-[#888]">
            {language === 'ar' 
              ? 'المنصة الرسمية وسيرفر اللعب الواقعي PRIME RP'
              : 'PRIME RP FiveM Official Platform & Community Portal'}
          </p>
        </div>

        {/* Error / Alert notice if any */}
        {errorMsg && (
          <div className="mb-5 p-3.5 rounded-xl bg-red-500/10 border border-red-500/30 flex items-start gap-2.5 text-xs text-red-400">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <p className="leading-relaxed">{errorMsg}</p>
          </div>
        )}

        {/* Method 1: Discord OAuth2 Login (Standard for FiveM) */}
        <div className="space-y-3 mb-6">
          <button
            type="button"
            onClick={loginWithDiscord}
            className="w-full py-3.5 px-4 rounded-xl bg-[#5865F2] hover:bg-[#4752C4] text-white font-bold text-xs flex items-center justify-center gap-2.5 shadow-lg shadow-[#5865F2]/20 transition-all hover:scale-[1.01] active:scale-98"
          >
            <svg className="w-4 h-4 fill-current shrink-0" viewBox="0 0 24 24">
              <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.929 1.793 8.18 1.793 12.061 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.894.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.028zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z"/>
            </svg>
            <span>{language === 'ar' ? 'المتابعة بحساب Discord' : 'Continue with Discord'}</span>
          </button>
          <p className="text-[11px] text-[#777] text-center">
            {language === 'ar'
              ? 'الربط التلقائي والآمن بحساب الديسكورد المعتمد لديك في السيرفر'
              : 'Directly syncs with your verified Discord account and city roles'}
          </p>
        </div>

        {/* Divider */}
        <div className="relative flex py-2 items-center mb-6">
          <div className="flex-grow border-t border-[#222]"></div>
          <span className="flex-shrink mx-3 text-[11px] font-bold text-[#666] uppercase tracking-wider">
            {language === 'ar' ? 'أو الدخول المباشر للمنصة' : 'Or Portal Direct Sign In'}
          </span>
          <div className="flex-grow border-t border-[#222]"></div>
        </div>

        {/* Method 2: Authentic Portal Login (Staff & Citizens) */}
        <form onSubmit={handlePortalSubmit} className="space-y-4">
          <div>
            <label className="block text-[11px] font-bold text-[#AAA] mb-1.5">
              {language === 'ar' ? 'اسم المستخدم أو المعرف' : 'Username or Citizen ID'}
            </label>
            <div className="relative">
              <User className="w-4 h-4 text-[#666] absolute top-1/2 -translate-y-1/2 left-3 rtl:left-auto rtl:right-3" />
              <input
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="PrimeOwner"
                className="w-full bg-[#141414] border border-[#2B2B2B] rounded-xl px-9 py-2.5 text-xs text-white placeholder-[#555] focus:outline-none focus:border-[#C8874B] transition-colors"
              />
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-[#AAA] mb-1.5">
              {language === 'ar' ? 'كلمة المرور أو رمز الأمان' : 'Security Password / Key'}
            </label>
            <div className="relative">
              <KeyRound className="w-4 h-4 text-[#666] absolute top-1/2 -translate-y-1/2 left-3 rtl:left-auto rtl:right-3" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-[#141414] border border-[#2B2B2B] rounded-xl px-9 py-2.5 text-xs text-white placeholder-[#555] focus:outline-none focus:border-[#C8874B] transition-colors"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3.5 rounded-xl bg-gradient-to-r from-[#C8874B] via-[#DF9F64] to-[#C8874B] text-black font-extrabold text-xs tracking-wider transition-all hover:brightness-110 active:scale-98 shadow-md shadow-[#C8874B]/20 flex items-center justify-center gap-2 mt-2"
          >
            <Lock className="w-4 h-4" />
            <span>
              {isSubmitting
                ? (language === 'ar' ? 'جاري التحقق...' : 'Verifying...')
                : (language === 'ar' ? 'تسجيل الدخول إلى البوابة' : 'Sign In to Portal')}
            </span>
          </button>

          <p className="text-[10px] text-[#666] text-center pt-2">
            {language === 'ar'
              ? 'نظام الدخول محمي بجدار حماية Prime RP المشفر'
              : 'Protected by Prime RP encrypted security architecture'}
          </p>
        </form>

      </div>
    </div>
  );
};

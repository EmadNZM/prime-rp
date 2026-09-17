import React, { useState, useEffect } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { useAuth } from '../../context/AuthContext';
import { PrimeLogo } from '../../components/common/PrimeLogo';
import { Lock, User, KeyRound, AlertCircle, ArrowRight, ArrowLeft, CheckCircle2, X } from 'lucide-react';

interface LoginPageProps {
  setCurrentTab: (tab: string) => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ setCurrentTab }) => {
  const { language, isRtl } = useLanguage();
  const { 
    loginWithDiscord, 
    loginWithDiscordDirect, 
    hasDiscordOauth, 
    portalLogin, 
    isAuthenticated 
  } = useAuth();
  
  const [username, setUsername] = useState<string>('PrimeOwner');
  const [password, setPassword] = useState<string>('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [infoMsg, setInfoMsg] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // Discord Direct Prompt Modal state
  const [showDiscordModal, setShowDiscordModal] = useState<boolean>(false);
  const [discordUsername, setDiscordUsername] = useState<string>('');
  const [discordSubmitting, setDiscordSubmitting] = useState<boolean>(false);

  useEffect(() => {
    if (isAuthenticated) {
      setCurrentTab('dashboard');
    }
  }, [isAuthenticated, setCurrentTab]);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    
    if (params.get('prompt_discord') === 'true' || params.get('notice') === 'discord_setup_required') {
      setShowDiscordModal(true);
      setInfoMsg(
        language === 'ar'
          ? 'يرجى إدخال اسم حسابك في ديسكورد للمتابعة والدخول الفوري إلى لوحة المواطن.'
          : 'Please enter your Discord username below to instantly link and access your citizen dashboard.'
      );
    } else if (params.get('error')) {
      setErrorMsg(
        language === 'ar'
          ? 'تعذر التحقق عبر بوابة Discord الخارجية. يمكنك إدخال حسابك مباشرة في النافذة أو الدخول عبر البوابة الرسمية أدناه.'
          : 'Discord OAuth verification was not completed. You may sign in directly with your Discord tag or portal below.'
      );
    }
  }, [language]);

  const handleDiscordClick = () => {
    if (hasDiscordOauth) {
      loginWithDiscord();
    } else {
      setShowDiscordModal(true);
      setErrorMsg(null);
    }
  };

  const handleDiscordDirectSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const clean = discordUsername.trim();
    if (!clean) {
      setErrorMsg(language === 'ar' ? 'يرجى إدخال اسم المستخدم في Discord' : 'Please enter your Discord username');
      return;
    }

    setDiscordSubmitting(true);
    setErrorMsg(null);
    try {
      const ok = await loginWithDiscordDirect(clean);
      if (ok) {
        setShowDiscordModal(false);
        setCurrentTab('dashboard');
      } else {
        setErrorMsg(
          language === 'ar'
            ? 'تعذر تسجيل الدخول بحساب Discord. يرجى المحاولة مجدداً.'
            : 'Could not complete Discord sign in. Please try again.'
        );
      }
    } catch (err: any) {
      console.error('Discord direct login error:', err);
      setErrorMsg(language === 'ar' ? 'حدث خطأ أثناء تسجيل الدخول.' : 'An error occurred during authentication.');
    } finally {
      setDiscordSubmitting(false);
    }
  };

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
    <div className="min-h-screen bg-[#070707] text-[#E5E5E5] pt-28 pb-24 px-4 flex items-center justify-center relative">
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

        {/* Informational notice */}
        {infoMsg && (
          <div className="mb-5 p-3.5 rounded-xl bg-[#5865F2]/10 border border-[#5865F2]/30 flex items-start gap-2.5 text-xs text-[#8EA1FF]">
            <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5 text-[#5865F2]" />
            <p className="leading-relaxed">{infoMsg}</p>
          </div>
        )}

        {/* Error / Alert notice if any */}
        {errorMsg && (
          <div className="mb-5 p-3.5 rounded-xl bg-red-500/10 border border-red-500/30 flex items-start gap-2.5 text-xs text-red-400">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <p className="leading-relaxed">{errorMsg}</p>
          </div>
        )}

        {/* Method 1: Discord Login (Standard for FiveM) */}
        <div className="space-y-3 mb-6">
          <button
            type="button"
            onClick={handleDiscordClick}
            className="w-full py-3.5 px-4 rounded-xl bg-[#5865F2] hover:bg-[#4752C4] text-white font-bold text-xs flex items-center justify-center gap-2.5 shadow-lg shadow-[#5865F2]/20 transition-all hover:scale-[1.01] active:scale-98"
          >
            <svg className="w-4 h-4 fill-current shrink-0" viewBox="0 0 24 24">
              <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.929 1.793 8.18 1.793 12.061 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.894.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.028zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z"/>
            </svg>
            <span>{language === 'ar' ? 'المتابعة بحساب Discord' : 'Continue with Discord'}</span>
          </button>
          <p className="text-[11px] text-[#777] text-center">
            {language === 'ar'
              ? 'الربط المباشر والآمن بحساب الديسكورد المعتمد لديك في السيرفر'
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

      {/* DISCORD DIRECT LOGIN MODAL */}
      {showDiscordModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
          <div className="max-w-md w-full bg-[#0D0D0D] border border-[#5865F2]/40 rounded-3xl p-6 sm:p-7 shadow-2xl relative">
            
            {/* Close Button */}
            <button
              onClick={() => setShowDiscordModal(false)}
              className="absolute top-4 right-4 rtl:right-auto rtl:left-4 p-1.5 rounded-lg text-[#888] hover:text-white hover:bg-white/10 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>

            {/* Modal Header */}
            <div className="text-center mb-6">
              <div className="w-12 h-12 rounded-2xl bg-[#5865F2] text-white flex items-center justify-center mx-auto mb-3 shadow-lg shadow-[#5865F2]/30">
                <svg className="w-6 h-6 fill-current" viewBox="0 0 24 24">
                  <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.929 1.793 8.18 1.793 12.061 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.894.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.028zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z"/>
                </svg>
              </div>
              <h2 className="text-xl font-black text-white mb-1">
                {language === 'ar' ? 'تسجيل الدخول بحساب Discord' : 'Sign In with Discord'}
              </h2>
              <p className="text-xs text-[#999] leading-relaxed">
                {language === 'ar'
                  ? 'أدخل اسم حسابك أو المعرف الخاص بك في Discord لربط وتوثيق حسابك فوراً بالمنصة.'
                  : 'Enter your Discord username or tag to instantly authenticate and access your profile.'}
              </p>
            </div>

            <form onSubmit={handleDiscordDirectSubmit} className="space-y-4">
              <div>
                <label className="block text-[11px] font-bold text-[#AAA] mb-1.5">
                  {language === 'ar' ? 'اسم المستخدم في Discord (أو الآيدي)' : 'Discord Username / ID'}
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-[#5865F2] absolute top-1/2 -translate-y-1/2 left-3 rtl:left-auto rtl:right-3" />
                  <input
                    type="text"
                    required
                    autoFocus
                    value={discordUsername}
                    onChange={(e) => setDiscordUsername(e.target.value)}
                    placeholder="مثال: Tariq_Roleplay أو DeathNote"
                    className="w-full bg-[#141414] border border-[#2B2B2B] focus:border-[#5865F2] rounded-xl px-9 py-2.5 text-xs text-white placeholder-[#555] focus:outline-none transition-colors"
                  />
                </div>
              </div>

              {/* Quick Select Preset Accounts if desired */}
              <div className="pt-1">
                <span className="block text-[10px] text-[#777] mb-1.5">
                  {language === 'ar' ? 'أو اختر حساباً مسجلاً مباشرة:' : 'Or quick select an existing citizen:'}
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {['PrimeOwner', 'Tariq_Roleplay', 'Faris_Admin'].map((acc) => (
                    <button
                      key={acc}
                      type="button"
                      onClick={() => setDiscordUsername(acc)}
                      className="px-2.5 py-1 rounded-lg bg-[#1A1A1A] border border-[#333] hover:border-[#5865F2] text-[10px] text-[#CCC] hover:text-white transition-colors"
                    >
                      {acc}
                    </button>
                  ))}
                </div>
              </div>

              <button
                type="submit"
                disabled={discordSubmitting}
                className="w-full py-3.5 rounded-xl bg-[#5865F2] hover:bg-[#4752C4] text-white font-bold text-xs shadow-lg shadow-[#5865F2]/20 flex items-center justify-center gap-2 transition-all hover:scale-[1.01] active:scale-98 mt-2"
              >
                <span>
                  {discordSubmitting
                    ? (language === 'ar' ? 'جاري الربط والمصادقة...' : 'Authenticating...')
                    : (language === 'ar' ? 'تأكيد الدخول والمتابعة' : 'Confirm Sign In & Continue')}
                </span>
              </button>

              <p className="text-[10px] text-[#666] text-center pt-2">
                {language === 'ar'
                  ? 'سيتم تفعيل رتبتك وصلاحياتك تلقائياً بحسب بيانات الحساب.'
                  : 'Your city permissions and role will be automatically applied.'}
              </p>
            </form>

          </div>
        </div>
      )}

    </div>
  );
};

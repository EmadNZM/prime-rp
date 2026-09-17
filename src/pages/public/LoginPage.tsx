import React, { useState, useEffect } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { useAuth } from '../../context/AuthContext';
import { PrimeLogo } from '../../components/common/PrimeLogo';
import { ShieldCheck, UserCheck, Lock, User, KeyRound, CheckCircle2, AlertCircle } from 'lucide-react';

interface LoginPageProps {
  setCurrentTab: (tab: string) => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ setCurrentTab }) => {
  const { t, language } = useLanguage();
  const { loginWithDiscord, portalLogin, isAuthenticated } = useAuth();
  
  const [authMethod, setAuthMethod] = useState<'discord' | 'direct'>('discord');
  const [selectedRole, setSelectedRole] = useState<string>('SUPER_ADMIN');
  const [username, setUsername] = useState<string>('PrimeOwner');
  const [accessCode, setAccessCode] = useState<string>('••••••••');
  const [notice, setNotice] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('notice') === 'no_discord_configured') {
      setNotice(
        language === 'ar' 
          ? 'بوابة الدخول المباشر جاهزة ومفعّلة أدناه للدخول الفوري للإدارة والمواطنين.' 
          : 'Direct Portal Access is active below for instant staff & citizen sign in.'
      );
      setAuthMethod('direct');
    } else if (params.get('error')) {
      setNotice(
        language === 'ar'
          ? 'تعذر التحقق التلقائي عبر Discord. يمكنك الدخول عبر بوابة الحسابات المباشرة.'
          : 'Discord verification was not completed. You can sign in via Direct Portal Access.'
      );
    }
  }, [language]);

  const handleDirectLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await portalLogin(selectedRole, username.trim() || 'PrimeMember');
      setCurrentTab('dashboard');
    } catch (err) {
      console.error('Portal login error:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#070707] text-[#E5E5E5] pt-28 pb-24 px-4 flex items-center justify-center">
      <div className="max-w-md w-full bg-[#0B0B0B] border border-[#202020] rounded-3xl p-6 sm:p-8 shadow-2xl relative overflow-hidden">
        
        {/* Ambient Top Glow */}
        <div 
          className="absolute top-0 left-1/2 -translate-x-1/2 w-56 h-24 bg-[#C8874B]/15 blur-3xl pointer-events-none rounded-full" 
          aria-hidden="true"
        />

        {/* Portal Header */}
        <div className="text-center mb-6 relative z-10">
          <div className="flex justify-center mb-3">
            <PrimeLogo size="md" variant="login" showText={false} withGlow={true} />
          </div>
          <h1 className="text-2xl font-black text-white tracking-tight mb-1">
            {language === 'ar' ? 'بوابة الدخول الرسمية' : 'Official Portal Login'}
          </h1>
          <p className="text-xs text-[#888]">
            {language === 'ar' 
              ? 'المنصة الرسمية وسيرفر اللعب الواقعي PRIME RP'
              : 'PRIME RP FiveM Official Platform & Community Portal'}
          </p>
        </div>

        {/* Notice if any */}
        {notice && (
          <div className="mb-5 p-3.5 rounded-xl bg-[#151515] border border-[#C8874B]/30 flex items-start gap-2.5 text-xs text-[#DDD]">
            <AlertCircle className="w-4 h-4 text-[#C8874B] shrink-0 mt-0.5" />
            <p className="leading-relaxed">{notice}</p>
          </div>
        )}

        {/* Method Switcher Tabs */}
        <div className="grid grid-cols-2 gap-1 p-1 bg-[#121212] border border-[#222] rounded-xl mb-6">
          <button
            type="button"
            onClick={() => setAuthMethod('discord')}
            className={`py-2 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 ${
              authMethod === 'discord'
                ? 'bg-[#5865F2] text-white shadow-md'
                : 'text-[#888] hover:text-white'
            }`}
          >
            <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
              <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.929 1.793 8.18 1.793 12.061 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.894.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.028zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z"/>
            </svg>
            <span>Discord</span>
          </button>

          <button
            type="button"
            onClick={() => setAuthMethod('direct')}
            className={`py-2 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 ${
              authMethod === 'direct'
                ? 'bg-[#C8874B] text-black shadow-md'
                : 'text-[#888] hover:text-white'
            }`}
          >
            <Lock className="w-3.5 h-3.5" />
            <span>{language === 'ar' ? 'بوابة الدخول المباشر' : 'Direct Portal'}</span>
          </button>
        </div>

        {/* TAB 1: DISCORD OAUTH */}
        {authMethod === 'discord' && (
          <div className="space-y-4">
            <p className="text-xs text-[#999] leading-relaxed text-center">
              {language === 'ar'
                ? 'تسجيل الدخول المعتمد لسيرفرات FiveM لربط حسابك وتلقي الرتب وتفعيل التذاكر تلقائياً.'
                : 'Standard FiveM authentication linking your Discord roles, citizen profile, and tickets.'}
            </p>

            <button
              onClick={loginWithDiscord}
              className="w-full py-3.5 rounded-xl bg-[#5865F2] hover:bg-[#4752C4] text-white font-extrabold text-sm transition-all flex items-center justify-center gap-3 shadow-lg shadow-[#5865F2]/20 hover:scale-[1.01]"
            >
              <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.929 1.793 8.18 1.793 12.061 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.894.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.028zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z"/>
              </svg>
              <span>{language === 'ar' ? 'المتابعة بحساب Discord الرسمي' : 'Continue with Discord OAuth2'}</span>
            </button>

            <div className="pt-2 space-y-1.5 text-[11px] text-[#777]">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                <span>{language === 'ar' ? 'تزامن الرتب الفوري مع مجتمع الديسكورد' : 'Live synchronization with server discord roles'}</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                <span>{language === 'ar' ? 'وصول آمن ومشفّر للوحة المواطن' : 'Secure encrypted access to citizen portal'}</span>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: DIRECT STAFF & CITIZEN LOGIN */}
        {authMethod === 'direct' && (
          <form onSubmit={handleDirectLogin} className="space-y-4">
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
                  className="w-full bg-[#141414] border border-[#2B2B2B] rounded-xl px-9 py-2.5 text-xs text-white placeholder-[#555] focus:outline-none focus:border-[#C8874B]"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-[#AAA] mb-1.5">
                {language === 'ar' ? 'رمز الأمان أو كلمة المرور' : 'Security PIN / Password'}
              </label>
              <div className="relative">
                <KeyRound className="w-4 h-4 text-[#666] absolute top-1/2 -translate-y-1/2 left-3 rtl:left-auto rtl:right-3" />
                <input
                  type="password"
                  value={accessCode}
                  onChange={(e) => setAccessCode(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-[#141414] border border-[#2B2B2B] rounded-xl px-9 py-2.5 text-xs text-white placeholder-[#555] focus:outline-none focus:border-[#C8874B]"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-[#AAA] mb-1.5">
                {language === 'ar' ? 'مستوى الصلاحية المعتمد' : 'Authorized Role Level'}
              </label>
              <select
                value={selectedRole}
                onChange={(e) => setSelectedRole(e.target.value)}
                className="w-full bg-[#141414] border border-[#2B2B2B] rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-[#C8874B]"
              >
                <option value="SUPER_ADMIN">👑 Super Admin (مالك السيرفر - كامل الصلاحيات)</option>
                <option value="ADMIN">🛡️ Admin (مدير عام)</option>
                <option value="MODERATOR">⚖️ Moderator (مشرف)</option>
                <option value="SUPPORT">🎧 Support (دعم فني)</option>
                <option value="CITIZEN">👤 Citizen (مواطن معتمد)</option>
              </select>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-[#C8874B] via-[#DF9F64] to-[#C8874B] text-black font-extrabold text-xs tracking-wider transition-all hover:brightness-110 active:scale-95 shadow-md shadow-[#C8874B]/20 flex items-center justify-center gap-2 mt-2"
            >
              <UserCheck className="w-4 h-4" />
              <span>
                {isSubmitting
                  ? (language === 'ar' ? 'جاري الدخول...' : 'Signing in...')
                  : (language === 'ar' ? 'تسجيل الدخول إلى البوابة' : 'Sign In to Portal')}
              </span>
            </button>
          </form>
        )}

      </div>
    </div>
  );
};

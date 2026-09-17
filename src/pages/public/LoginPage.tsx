import React, { useState, useEffect } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { useAuth } from '../../context/AuthContext';
import { apiClient } from '../../services/apiClient';
import { PrimeLogo } from '../../components/common/PrimeLogo';
import { 
  ShieldCheck, 
  ArrowLeft, 
  ArrowRight, 
  AlertCircle, 
  CheckCircle2, 
  Copy, 
  Check, 
  Lock,
  Sparkles
} from 'lucide-react';

interface LoginPageProps {
  setCurrentTab: (tab: string) => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ setCurrentTab }) => {
  const { language } = useLanguage();
  const { isAuthenticated, loginWithDiscord } = useAuth();

  const [authConfig, setAuthConfig] = useState<any>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [infoMsg, setInfoMsg] = useState<string | null>(null);
  const [isRedirectingDiscord, setIsRedirectingDiscord] = useState<boolean>(false);
  const [copiedRedirect, setCopiedRedirect] = useState<boolean>(false);

  useEffect(() => {
    // If already authenticated, redirect to dashboard
    if (isAuthenticated) {
      setCurrentTab('dashboard');
      return;
    }

    // Inspect URL query params for errors or notices
    const params = new URLSearchParams(window.location.search);
    const err = params.get('error');
    if (err === 'discord_credentials_missing') {
      setErrorMsg(
        language === 'ar'
          ? 'تنبيه إداري: لم يتم العثور على مفاتيح Discord OAuth في إعدادات البيئة (DISCORD_CLIENT_ID / DISCORD_CLIENT_SECRET).'
          : 'Discord OAuth credentials are not fully configured in the environment.'
      );
    } else if (err === 'oauth_failed') {
      setErrorMsg(
        language === 'ar'
          ? 'تعذر تسجيل الدخول عبر Discord، يرجى المحاولة مجددًا أو التأكد من مصادقة حسابك.'
          : 'Discord authentication failed. Please try again.'
      );
    } else if (err === 'invalid_oauth_state') {
      setErrorMsg(
        language === 'ar'
          ? 'انتهت صلاحية جلسة التحقق من الأمان، يرجى إعادة المحاولة مجددًا.'
          : 'OAuth state validation expired. Please try again.'
      );
    } else if (err === 'no_code_provided') {
      setErrorMsg(
        language === 'ar'
          ? 'لم يتم استلام رمز مصادقة صالح من منصة Discord.'
          : 'No valid authorization code was returned from Discord.'
      );
    }

    // Load auth configuration from backend
    apiClient.getAuthConfig().then((cfg) => {
      setAuthConfig(cfg);
    });
  }, [isAuthenticated, language, setCurrentTab]);

  const handleDiscordClick = () => {
    setIsRedirectingDiscord(true);
    loginWithDiscord();
  };

  const handleCopyCallback = () => {
    const url = authConfig?.currentRedirectUri || authConfig?.configuredRedirectUri || `${window.location.origin}/api/auth/discord/callback`;
    navigator.clipboard.writeText(url);
    setCopiedRedirect(true);
    setTimeout(() => setCopiedRedirect(false), 2500);
  };

  const currentCallbackUrl =
    authConfig?.currentRedirectUri || authConfig?.configuredRedirectUri || `${window.location.origin}/api/auth/discord/callback`;

  const isCredentialsMissing = Boolean(authConfig && !authConfig.hasDiscordOauth);

  const BackIcon = language === 'ar' ? ArrowRight : ArrowLeft;

  return (
    <div className="min-h-[80vh] flex items-center justify-center py-12 px-4 sm:px-6 relative">
      {/* Background ambient lighting */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-[#C8874B]/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-[#5865F2]/5 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-md bg-[#121212] border border-[#222] rounded-3xl p-6 sm:p-8 relative shadow-2xl overflow-hidden backdrop-blur-xl">
        {/* Subtle top ambient bar */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-[#C8874B] to-transparent" />

        {/* Back Button */}
        <button
          onClick={() => setCurrentTab('home')}
          className="inline-flex items-center gap-1.5 text-xs text-[#777] hover:text-[#C8874B] transition-colors mb-6 relative z-10"
        >
          <BackIcon className="w-3.5 h-3.5" />
          <span>{language === 'ar' ? 'العودة للرئيسية' : 'Back to Home'}</span>
        </button>

        {/* Portal Header */}
        <div className="text-center mb-8 relative z-10">
          <div className="flex justify-center mb-4">
            <PrimeLogo size="lg" variant="login" showText={false} withGlow={true} />
          </div>
          <h1 className="text-2xl font-black text-white tracking-tight mb-1.5">
            {language === 'ar' ? 'بوابة تسجيل الدخول الرسمية' : 'Official Portal Login'}
          </h1>
          <p className="text-xs text-[#888]">
            {language === 'ar' 
              ? 'المنصة الرسمية وسيرفر اللعب الواقعي PRIME RP'
              : 'PRIME RP FiveM Official Platform & Community Portal'}
          </p>
        </div>

        {/* Error notification */}
        {errorMsg && (
          <div className="mb-6 p-4 rounded-2xl bg-red-500/10 border border-red-500/30 flex flex-col gap-3 text-xs text-red-400">
            <div className="flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-red-400" />
              <div className="space-y-1">
                <p className="font-bold leading-relaxed">{errorMsg}</p>
                {isCredentialsMissing && (
                  <p className="text-[11px] text-[#CCC] leading-relaxed">
                    يرجى ضبط مفاتيح Discord OAuth في إعدادات البيئة بالخادم لتفعيل تسجيل الدخول.
                  </p>
                )}
              </div>
            </div>

            {isCredentialsMissing && (
              <div className="p-3 rounded-xl bg-[#0F0F0F] border border-[#2A2A2A] text-[11px] text-[#BBB] space-y-2">
                <p className="font-bold text-[#C8874B]">رابط الاسترجاع المطلوب في Discord Developer Portal:</p>
                <div className="pt-1 flex items-center justify-between gap-2 bg-black/50 p-2 rounded-lg border border-[#222]">
                  <span className="font-mono text-[#8EA1FF] text-[10px] truncate">{currentCallbackUrl}</span>
                  <button
                    type="button"
                    onClick={handleCopyCallback}
                    className="shrink-0 px-2 py-1 rounded bg-[#1F1F1F] hover:bg-[#2A2A2A] text-white flex items-center gap-1 text-[10px]"
                  >
                    {copiedRedirect ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                    <span>{copiedRedirect ? 'تم النسخ' : 'نسخ'}</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Informational Message */}
        {infoMsg && (
          <div className="mb-6 p-3.5 rounded-xl bg-[#5865F2]/10 border border-[#5865F2]/30 flex items-start gap-2.5 text-xs text-[#8EA1FF]">
            <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5 text-[#5865F2]" />
            <p className="leading-relaxed">{infoMsg}</p>
          </div>
        )}

        {/* Discord OAuth Login Button */}
        <div className="space-y-4 mb-6">
          <button
            type="button"
            onClick={handleDiscordClick}
            disabled={isRedirectingDiscord}
            className="w-full py-4 px-5 rounded-2xl bg-[#5865F2] hover:bg-[#4752C4] text-white font-bold text-sm flex items-center justify-center gap-3 shadow-xl shadow-[#5865F2]/25 transition-all hover:scale-[1.01] active:scale-98 disabled:opacity-75 relative group cursor-pointer"
          >
            <svg className="w-5 h-5 fill-current shrink-0 transition-transform group-hover:scale-110" viewBox="0 0 24 24">
              <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.929 1.793 8.18 1.793 12.061 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.894.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.028zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z"/>
            </svg>
            <span>
              {isRedirectingDiscord
                ? (language === 'ar' ? 'جاري التحويل إلى ديسكورد...' : 'Connecting to Discord...')
                : (language === 'ar' ? 'تسجيل الدخول بواسطة Discord' : 'Sign In with Discord')}
            </span>
          </button>
        </div>

        {/* Security & Authentication Info Box */}
        <div className="p-4 rounded-2xl bg-[#161616] border border-[#262626] text-[11px] text-[#888] space-y-2">
          <div className="flex items-center gap-2 text-white font-semibold text-xs">
            <ShieldCheck className="w-4 h-4 text-[#C8874B]" />
            <span>{language === 'ar' ? 'نظام المصادقة المشفر' : 'Encrypted Authentication'}</span>
          </div>
          <p className="leading-relaxed">
            {language === 'ar'
              ? 'يتم ربط الحسابات ومزامنة الصلاحيات والرتب تلقائياً عبر حساب Discord الرسمي الخاص بك مع حماية كاملة للبيانات.'
              : 'Accounts, permissions, and roles are securely authenticated and synced directly with your official Discord profile.'}
          </p>
        </div>

        {/* Footer Security Badges */}
        <div className="mt-6 pt-4 border-t border-[#1C1C1C] flex items-center justify-between text-[10px] text-[#666]">
          <div className="flex items-center gap-1.5">
            <Lock className="w-3 h-3 text-[#C8874B]" />
            <span>SSL / TLS 256-Bit Encrypted</span>
          </div>
          <div className="flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-emerald-400" />
            <span className="text-emerald-400 font-medium">Official Community Gate</span>
          </div>
        </div>
      </div>
    </div>
  );
};

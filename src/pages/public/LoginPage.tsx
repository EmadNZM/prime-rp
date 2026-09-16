import React, { useState } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { useAuth } from '../../context/AuthContext';
import { PrimeLogo } from '../../components/common/PrimeLogo';
import { ShieldCheck, UserCheck, AlertCircle } from 'lucide-react';

interface LoginPageProps {
  setCurrentTab: (tab: string) => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ setCurrentTab }) => {
  const { t } = useLanguage();
  const { loginWithDiscord, devLogin, isAuthenticated } = useAuth();
  const [selectedDevRole, setSelectedDevRole] = useState<string>('SUPER_ADMIN');
  const [devUsername, setDevUsername] = useState<string>('PrimeOwner');

  const handleDevSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await devLogin(selectedDevRole, devUsername);
    setCurrentTab('dashboard');
  };

  return (
    <div className="min-h-screen bg-[#070707] text-[#E5E5E5] pt-28 pb-24 px-4 flex items-center justify-center">
      <div className="max-w-md w-full bg-[#0B0B0B] border border-[#222] rounded-3xl p-8 shadow-2xl relative">
        
        {/* Glow */}
        <div 
          className="absolute top-0 left-1/2 -translate-x-1/2 w-48 h-20 bg-[#C8874B]/10 blur-2xl pointer-events-none" 
          aria-hidden="true"
        />

        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <PrimeLogo size="md" variant="login" showText={false} withGlow={true} />
          </div>
          <h1 className="text-2xl font-black text-white mb-2">{t('nav.loginDiscord')}</h1>
          <p className="text-xs text-[#888]">
            سجّل دخولك بواسطة حساب الديسكورد الرسمي للوصول إلى لوحة المواطن والتحكم.
          </p>
        </div>

        {/* Discord OAuth Login Button */}
        <button
          onClick={loginWithDiscord}
          className="w-full py-4 rounded-xl bg-[#5865F2] hover:bg-[#4752C4] text-white font-extrabold text-sm transition-all flex items-center justify-center gap-3 shadow-lg shadow-[#5865F2]/20 mb-8 hover:scale-[1.02]"
        >
          <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
            <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.929 1.793 8.18 1.793 12.061 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.894.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.028zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z"/>
          </svg>
          <span>Login via Discord OAuth2</span>
        </button>

        {/* DEVELOPER QUICK LOGIN SWITCHER */}
        <div className="border-t border-[#1C1C1C] pt-6">
          <div className="flex items-center gap-2 mb-3">
            <ShieldCheck className="w-4 h-4 text-[#C8874B]" />
            <h3 className="text-xs font-bold text-white uppercase tracking-wider">
              وضع المعاينة الفورية (Developer Role Switcher)
            </h3>
          </div>
          <p className="text-[11px] text-[#777] mb-4">
            للتجربة والتقييم السريع لجميع الرتب والصلاحيات بدون انتظار مفاتيح ديسكورد:
          </p>

          <form onSubmit={handleDevSubmit} className="space-y-3">
            <div>
              <label className="block text-[10px] font-bold text-[#999] mb-1">الرتبة / Role</label>
              <select
                value={selectedDevRole}
                onChange={(e) => setSelectedDevRole(e.target.value)}
                className="w-full bg-[#141414] border border-[#2B2B2B] rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#C8874B]"
              >
                <option value="SUPER_ADMIN">👑 Super Admin (مالك السيرفر - كامل الصلاحيات)</option>
                <option value="ADMIN">🛡️ Admin (مدير عام)</option>
                <option value="MODERATOR">⚖️ Moderator (مشرف)</option>
                <option value="SUPPORT">🎧 Support (دعم فني)</option>
                <option value="CITIZEN">👤 Citizen (مواطن عادي)</option>
              </select>
            </div>

            <div>
              <label className="block text-[10px] font-bold text-[#999] mb-1">اسم العرض / Display Name</label>
              <input
                type="text"
                value={devUsername}
                onChange={(e) => setDevUsername(e.target.value)}
                className="w-full bg-[#141414] border border-[#2B2B2B] rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#C8874B]"
              />
            </div>

            <button
              type="submit"
              className="w-full py-2.5 rounded-xl bg-[#C8874B]/20 hover:bg-[#C8874B] text-[#C8874B] hover:text-black border border-[#C8874B]/40 font-bold text-xs transition-all flex items-center justify-center gap-2"
            >
              <UserCheck className="w-4 h-4" />
              <span>دخول فوري بهذه الرتبة</span>
            </button>
          </form>
        </div>

      </div>
    </div>
  );
};

import React from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { useAuth } from '../../context/AuthContext';
import { PrimeLogo } from './PrimeLogo';
import { EyeOff, Home, MessageSquare, ArrowLeft, ArrowRight, ShieldAlert } from 'lucide-react';

interface PageHiddenNoticeProps {
  pageNameAr: string;
  pageNameEn: string;
  onGoHome: () => void;
  children?: React.ReactNode;
}

export const PageHiddenNotice: React.FC<PageHiddenNoticeProps> = ({
  pageNameAr,
  pageNameEn,
  onGoHome,
  children
}) => {
  const { language, isRtl } = useLanguage();
  const { isStaff } = useAuth();

  // If staff/admin is viewing, allow them to see the page with an admin alert banner
  if (isStaff && children) {
    return (
      <div className="relative">
        {/* Sticky Staff Notification Bar */}
        <div className="bg-amber-500/15 border-b border-amber-500/30 text-amber-200 px-4 py-2.5 text-xs font-bold flex items-center justify-between gap-3 sticky top-16 z-40 backdrop-blur-md">
          <div className="flex items-center gap-2 max-w-4xl mx-auto w-full">
            <ShieldAlert className="w-4 h-4 text-amber-400 shrink-0" />
            <span>
              {language === 'ar'
                ? `تنبيه إداري: صفحة (${pageNameAr}) مخفية حالياً كلياً عن الزوار والعموم في واجهة الموقع. أنت تستعرضها بصلاحيات الإدارة الخاصة.`
                : `Admin Notice: (${pageNameEn}) is currently HIDDEN from public visitors. You are previewing it with administrative staff privileges.`}
            </span>
          </div>
          <button
            onClick={onGoHome}
            className="text-[11px] underline hover:text-white shrink-0 cursor-pointer"
          >
            {language === 'ar' ? 'الرئيسية' : 'Home'}
          </button>
        </div>
        {children}
      </div>
    );
  }

  // Public visitor view: Sleek Luxury Maintenance Notice
  return (
    <div className="min-h-[75vh] flex items-center justify-center px-4 py-16 relative overflow-hidden">
      {/* Background glow effects */}
      <div 
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-[#c8874b]/5 blur-3xl pointer-events-none rounded-full" 
        aria-hidden="true" 
      />

      <div className="max-w-md w-full bg-[#0b0d13] border border-white/[0.08] rounded-3xl p-8 sm:p-10 text-center relative z-10 shadow-2xl">
        {/* Logo or Icon */}
        <div className="w-16 h-16 rounded-3xl bg-[#c8874b]/10 border border-[#c8874b]/30 flex items-center justify-center mx-auto mb-6 text-[#c8874b] shadow-inner">
          <EyeOff className="w-8 h-8" />
        </div>

        {/* Badge */}
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-bold uppercase tracking-wider mb-4">
          <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
          <span>{language === 'ar' ? 'الصفحة غير متاحة حالياً' : 'Page Temporarily Unavailable'}</span>
        </div>

        {/* Title */}
        <h2 className="text-xl sm:text-2xl font-black text-white font-rajdhani tracking-wide mb-3">
          {language === 'ar' ? `صفحة ${pageNameAr}` : pageNameEn}
        </h2>

        {/* Description */}
        <p className="text-xs sm:text-sm text-[#8c94a6] leading-relaxed mb-8">
          {language === 'ar'
            ? 'تم إخفاء هذا القسم مؤقتاً بواسطة إدارة سيرفر Prime RP لأعمال التحديث أو الصيانة الدورية. يمكنك الاستمرار في تصفح باقي أقسام السيرفر المتاحة.'
            : 'This section has been temporarily hidden by Prime RP administration for maintenance or updates. Please explore other available sections.'}
        </p>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <button
            onClick={onGoHome}
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-[#c8874b] to-[#df9f64] text-black font-black text-xs uppercase tracking-wider hover:opacity-90 transition-all cursor-pointer shadow-lg shadow-[#c8874b]/20"
          >
            <Home className="w-4 h-4" />
            <span>{language === 'ar' ? 'العودة للرئيسية' : 'Return to Home'}</span>
          </button>

          <a
            href="https://discord.gg/primerp"
            target="_blank"
            rel="noreferrer"
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-[#141722] hover:bg-[#1a1f2e] border border-white/[0.08] hover:border-[#5865F2]/50 text-xs font-bold text-white transition-all shadow-sm"
          >
            <MessageSquare className="w-4 h-4 text-[#5865F2]" />
            <span>Discord</span>
          </a>
        </div>
      </div>
    </div>
  );
};

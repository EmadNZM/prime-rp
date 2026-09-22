import React, { useState } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { useSettings } from '../../context/SettingsContext';
import { SiteSettings, PageVisibilitySettings, DEFAULT_PAGE_VISIBILITY } from '../../types';
import { 
  Eye, 
  EyeOff, 
  Check, 
  Save, 
  BookOpen, 
  Briefcase, 
  Newspaper, 
  ShoppingBag, 
  Users, 
  Trophy, 
  HelpCircle, 
  MessageSquare,
  ShieldCheck,
  AlertCircle,
  Sparkles,
  RefreshCw
} from 'lucide-react';

interface PageVisibilityManagerProps {
  settings: SiteSettings;
  setSettings: React.Dispatch<React.SetStateAction<SiteSettings | null>>;
  onSave?: (e: React.FormEvent) => Promise<void>;
  showToast?: (msg: string) => void;
}

interface PageItemConfig {
  key: keyof PageVisibilitySettings;
  titleAr: string;
  titleEn: string;
  route: string;
  descriptionAr: string;
  descriptionEn: string;
  icon: React.ComponentType<{ className?: string }>;
  accentColor: string;
  badgeAr: string;
  badgeEn: string;
}

const PAGE_CONFIGS: PageItemConfig[] = [
  {
    key: 'store',
    titleAr: 'المتجر الرسمي والرتب (Store & VIP)',
    titleEn: 'Official Store & VIP Packages',
    route: '/store',
    descriptionAr: 'صفحة متجر السيرفر، باقات VIP، شراء المركبات والمقرات، سلة المشتريات وقسم الدفع.',
    descriptionEn: 'Server web store, VIP memberships, custom vehicles, properties, cart and checkout.',
    icon: ShoppingBag,
    accentColor: '#df9f64',
    badgeAr: 'المتجر والتبرعات',
    badgeEn: 'Monetization & Perks'
  },
  {
    key: 'jobs',
    titleAr: 'الوظائف والتقديم (Jobs & Careers)',
    titleEn: 'Job Applications & Factions',
    route: '/jobs',
    descriptionAr: 'قائمة الوظائف الشاغرة (الشرطة، الإسعاف، الميكانيك)، نماذج التقديم الإلكتروني ومتابعة الطلبات.',
    descriptionEn: 'Available public/whitelist jobs (Police, EMS, Mechanics), online applications & status checks.',
    icon: Briefcase,
    accentColor: '#3b82f6',
    badgeAr: 'التوظيف والقطاعات',
    badgeEn: 'Careers'
  },
  {
    key: 'rules',
    titleAr: 'القوانين واللوائح (Rules & Regulations)',
    titleEn: 'Server Rules & Constitution',
    route: '/rules',
    descriptionAr: 'الدستور العام لسيرفر Prime RP، بنود الرول بلاي، قوانين السطو، المناطق الآمنة والمحظورات.',
    descriptionEn: 'Full roleplay constitution, robbery rules, green zones, voice guidelines and prohibited conduct.',
    icon: BookOpen,
    accentColor: '#10b981',
    badgeAr: 'القوانين والدستور',
    badgeEn: 'Regulations'
  },
  {
    key: 'news',
    titleAr: 'الأخبار والمقالات (News & Articles)',
    titleEn: 'News & Announcements',
    route: '/news',
    descriptionAr: 'تحديثات السيرفر الدورية، أخبار المدينة الرسمية، المقالات الصحفية وإعلانات الفعاليات الكبرى.',
    descriptionEn: 'Server updates, official city press releases, major community announcements and patch notes.',
    icon: Newspaper,
    accentColor: '#8b5cf6',
    badgeAr: 'الأخبار والتحديثات',
    badgeEn: 'Announcements'
  },
  {
    key: 'leaderboard',
    titleAr: 'لوحة الشرف والمتصدرين (Leaderboard)',
    titleEn: 'Hall of Fame & Leaderboards',
    route: '/leaderboard',
    descriptionAr: 'إحصائيات المتصدرين في ساعات اللعب، أثرياء المدينة، ضباط إنفاذ القانون، وأخطر المطلوبين.',
    descriptionEn: 'Top players by playtime, wealth rankings, law enforcement commendations, and most wanted.',
    icon: Trophy,
    accentColor: '#eab308',
    badgeAr: 'لوحة الشرف',
    badgeEn: 'Rankings'
  },
  {
    key: 'players',
    titleAr: 'اللاعبين المتصلين (Live Players)',
    titleEn: 'Live Connected Players',
    route: '/players',
    descriptionAr: 'قائمة اللاعبين المتصلين حالياً داخل سيرفر FiveM، البنق، والهويات الرسمية.',
    descriptionEn: 'Real-time FXServer online player directory, ping metrics, and in-game identifiers.',
    icon: Users,
    accentColor: '#06b6d4',
    badgeAr: 'الخادم المباشر',
    badgeEn: 'Live Server'
  },
  {
    key: 'support',
    titleAr: 'الدعم الفني والبلاغات (Support & Tickets)',
    titleEn: 'Support Tickets & Player Reports',
    route: '/support',
    descriptionAr: 'نظام فتح تذاكر المساعدة، الشكاوى والبلاغات عن المخالفات، والتواصل مع طاقم الإدارة.',
    descriptionEn: 'Help desk ticket system, incident/cheater reporting portal, and admin staff communication.',
    icon: MessageSquare,
    accentColor: '#ec4899',
    badgeAr: 'الدعم والتذاكر',
    badgeEn: 'Support Desk'
  },
  {
    key: 'faq',
    titleAr: 'الأسئلة الشائعة (FAQ & Knowledge)',
    titleEn: 'Frequently Asked Questions',
    route: '/faq',
    descriptionAr: 'مركز المساعدة السريع، إجابات المشاكل الشائعة، متطلبات التشغيل، وإرشادات الدخول للمدينة.',
    descriptionEn: 'Quick answers to frequent inquiries, connection guides, voice setup, and general guidelines.',
    icon: HelpCircle,
    accentColor: '#14b8a6',
    badgeAr: 'الأسئلة والإرشادات',
    badgeEn: 'FAQ'
  }
];

export const PageVisibilityManager: React.FC<PageVisibilityManagerProps> = ({
  settings,
  setSettings,
  onSave,
  showToast
}) => {
  const { language } = useLanguage();
  const { updateSettings } = useSettings();
  const [isSaving, setIsSaving] = useState<boolean>(false);

  const currentVisibility: PageVisibilitySettings = {
    ...DEFAULT_PAGE_VISIBILITY,
    ...(settings?.pageVisibility || {})
  };

  const visibleCount = PAGE_CONFIGS.filter((p) => currentVisibility[p.key] !== false).length;
  const hiddenCount = PAGE_CONFIGS.length - visibleCount;

  // Toggle individual page visibility with instant auto-save and optimistic UI
  const handleToggle = async (key: keyof PageVisibilitySettings) => {
    const newValue = currentVisibility[key] === false ? true : false;
    const updatedVisibility: PageVisibilitySettings = {
      ...currentVisibility,
      [key]: newValue
    };

    const newSettings: SiteSettings = {
      ...settings,
      pageVisibility: updatedVisibility
    };

    setSettings(newSettings);

    try {
      setIsSaving(true);
      await updateSettings({ pageVisibility: updatedVisibility });
      const pageInfo = PAGE_CONFIGS.find((p) => p.key === key);
      const name = language === 'ar' ? pageInfo?.titleAr : pageInfo?.titleEn;
      if (showToast) {
        showToast(
          newValue 
            ? (language === 'ar' ? `تم إظهار صفحة (${name}) في الواجهة بنجاح` : `Page (${name}) is now VISIBLE`)
            : (language === 'ar' ? `تم إخفاء صفحة (${name}) كلياً من واجهة الموقع` : `Page (${name}) is now HIDDEN from UI`)
        );
      }
    } catch (err) {
      console.error('Failed to toggle page visibility:', err);
      if (showToast) {
        showToast(language === 'ar' ? 'فشل حفظ حالة الصفحة' : 'Failed to update page visibility');
      }
    } finally {
      setIsSaving(false);
    }
  };

  // Bulk action: Show all
  const handleShowAll = async () => {
    const allVisible: PageVisibilitySettings = {
      rules: true,
      jobs: true,
      news: true,
      store: true,
      players: true,
      leaderboard: true,
      support: true,
      faq: true
    };

    const newSettings: SiteSettings = {
      ...settings,
      pageVisibility: allVisible
    };

    setSettings(newSettings);
    try {
      setIsSaving(true);
      await updateSettings({ pageVisibility: allVisible });
      if (showToast) {
        showToast(language === 'ar' ? 'تم إظهار كافة صفحات المنصة بنجاح' : 'All pages are now visible');
      }
    } catch {
      if (showToast) showToast(language === 'ar' ? 'فشل تحديث الصفحات' : 'Failed to update pages');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="bg-[#0b0d13] border border-white/[0.08] rounded-3xl p-6 sm:p-8 space-y-8 shadow-2xl relative overflow-hidden">
      {/* Decorative ambient gradient */}
      <div 
        className="absolute top-0 right-0 w-96 h-96 bg-[#c8874b]/5 blur-3xl pointer-events-none rounded-full" 
        aria-hidden="true" 
      />

      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/[0.06] pb-6 relative z-10">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-[#c8874b]/10 border border-[#c8874b]/30 flex items-center justify-center text-[#c8874b] shadow-inner">
            <Eye className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-3">
              <h3 className="text-lg sm:text-xl font-black text-white font-rajdhani tracking-wide">
                {language === 'ar' ? 'إدارة ظهور وإخفاء الصفحات' : 'Page Visibility & Navigation Control'}
              </h3>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-[#c8874b]/20 text-[#c8874b] border border-[#c8874b]/30">
                {language === 'ar' ? 'تحكم فوري' : 'Live Sync'}
              </span>
            </div>
            <p className="text-xs text-[#8c94a6] mt-1 leading-relaxed max-w-2xl">
              {language === 'ar'
                ? 'تحكم بإظهار أو إخفاء أي صفحة من المنصة. عند إخفاء الصفحة، تختفي كلياً من شريط التنقل العلوي (Navbar)، التذييل (Footer)، والصفحة الرئيسية، ويتم حظر الوصول المباشر إليها للزوار.'
                : 'Toggle any page on or off. Hidden pages completely vanish from Navbar, Footer, and Homepage shortcuts, and public direct URL access is blocked.'}
            </p>
          </div>
        </div>

        {/* Counter Badges & Quick Action */}
        <div className="flex flex-wrap items-center gap-2.5 shrink-0">
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-xs font-bold text-emerald-400">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>{language === 'ar' ? `الظاهرة: ${visibleCount}` : `Visible: ${visibleCount}`}</span>
          </div>

          {hiddenCount > 0 && (
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-xs font-bold text-rose-400">
              <EyeOff className="w-3.5 h-3.5" />
              <span>{language === 'ar' ? `المخفية: ${hiddenCount}` : `Hidden: ${hiddenCount}`}</span>
            </div>
          )}

          <button
            type="button"
            onClick={handleShowAll}
            disabled={isSaving || hiddenCount === 0}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-[#141722] hover:bg-[#1a1f2e] border border-white/[0.08] hover:border-[#c8874b]/50 text-xs font-bold text-[#c8874b] transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed shadow-sm"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>{language === 'ar' ? 'إظهار الجميع' : 'Show All'}</span>
          </button>
        </div>
      </div>

      {/* Pages Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 relative z-10">
        {PAGE_CONFIGS.map((page) => {
          const Icon = page.icon;
          const isVisible = currentVisibility[page.key] !== false;

          return (
            <div
              key={page.key}
              className={`p-5 rounded-2xl border transition-all duration-300 relative overflow-hidden flex flex-col justify-between ${
                isVisible
                  ? 'bg-[#0f111a] border-white/[0.08] hover:border-white/[0.18]'
                  : 'bg-[#090a0f] border-dashed border-red-500/20 opacity-80 hover:opacity-100'
              }`}
            >
              <div>
                {/* Top Row: Icon, Title, Badge & Switch */}
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="flex items-center gap-3">
                    <div 
                      className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border ${
                        isVisible 
                          ? 'bg-[#161a26] border-white/[0.1]' 
                          : 'bg-red-500/10 border-red-500/20 text-red-400'
                      }`}
                      style={{ color: isVisible ? page.accentColor : undefined }}
                    >
                      <Icon className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="text-sm font-bold text-white tracking-wide">
                          {language === 'ar' ? page.titleAr : page.titleEn}
                        </h4>
                        <span className="text-[10px] font-mono text-[#62697b] bg-[#141722] px-2 py-0.5 rounded border border-white/[0.04]">
                          {page.route}
                        </span>
                      </div>
                      <span className="text-[10px] text-[#71788a] font-bold uppercase tracking-wider block mt-0.5">
                        {language === 'ar' ? page.badgeAr : page.badgeEn}
                      </span>
                    </div>
                  </div>

                  {/* Toggle Switch */}
                  <label className="relative inline-flex items-center cursor-pointer shrink-0">
                    <input
                      type="checkbox"
                      checked={isVisible}
                      disabled={isSaving}
                      onChange={() => handleToggle(page.key)}
                      className="sr-only peer"
                    />
                    <div className="w-12 h-6.5 bg-[#1b1f2e] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[3px] after:start-[3px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-gradient-to-r peer-checked:from-[#c8874b] peer-checked:to-[#df9f64] border border-white/[0.1]"></div>
                  </label>
                </div>

                {/* Description */}
                <p className="text-xs text-[#8c94a6] leading-relaxed mb-4">
                  {language === 'ar' ? page.descriptionAr : page.descriptionEn}
                </p>
              </div>

              {/* Status Footer Inside Card */}
              <div className="pt-3 border-t border-white/[0.04] flex items-center justify-between text-[11px]">
                <div className="flex items-center gap-2">
                  {isVisible ? (
                    <span className="flex items-center gap-1.5 text-emerald-400 font-bold">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                      <span>{language === 'ar' ? 'ظاهرة بالكامل للزوار' : 'Visible to all visitors'}</span>
                    </span>
                  ) : (
                    <span className="flex items-center gap-1.5 text-rose-400 font-bold">
                      <EyeOff className="w-3.5 h-3.5" />
                      <span>{language === 'ar' ? 'مخفية كلياً من الواجهة' : 'Completely hidden from UI'}</span>
                    </span>
                  )}
                </div>

                <div className="text-[10px] text-[#555d70]">
                  {isVisible 
                    ? (language === 'ar' ? 'Navbar • Footer • Home' : 'Navbar • Footer • Home')
                    : (language === 'ar' ? 'محجوبة ومحولة للرئيسية' : 'Blocked & Redirected')}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Info Notice Box */}
      <div className="p-4 rounded-2xl bg-[#090a0f] border border-white/[0.06] flex items-start gap-3 relative z-10">
        <ShieldCheck className="w-5 h-5 text-[#c8874b] shrink-0 mt-0.5" />
        <div className="text-xs text-[#8c94a6] leading-relaxed">
          <span className="text-white font-bold block mb-1">
            {language === 'ar' ? 'ملاحظة تشغيلية مهمة حول إخفاء الصفحات:' : 'Important Operation Note:'}
          </span>
          {language === 'ar'
            ? 'يتم تطبيق التغييرات فوراً في الوقت الفعلي (Real-time). إذا كان الزائر يتصفح الصفحة أثناء إخفائها وحاول إعادة التحميل أو النقر على الرابط، ستظهر له رسالة شياكة توضح أن الصفحة تحت الصيانة المؤقتة، مع إمكانية إتاحة المعاينة للمسؤولين والإداريين فقط.'
            : 'Changes apply instantly in real-time. If a regular visitor visits a hidden page URL directly, a clean maintenance notice will appear guiding them back to the Home page.'}
        </div>
      </div>
    </div>
  );
};

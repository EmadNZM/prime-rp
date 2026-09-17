import React, { useState, useRef } from 'react';
import { SiteSettings } from '../../types';
import { useSettings } from '../../context/SettingsContext';
import { 
  Upload, 
  RefreshCw, 
  Check, 
  ExternalLink, 
  Image as ImageIcon, 
  Sliders, 
  Globe, 
  Sparkles,
  Info,
  Layers,
  ArrowRight
} from 'lucide-react';

interface LogoManagerSettingsProps {
  settings: SiteSettings;
  setSettings: React.Dispatch<React.SetStateAction<SiteSettings | null>>;
  onSave: (e: React.FormEvent) => void;
  showToast: (msg: string) => void;
}

interface LogoSlotConfig {
  key: 'main' | 'navbar' | 'hero' | 'footer' | 'login' | 'favicon';
  titleAr: string;
  titleEn: string;
  descAr: string;
  recommendedSize: string;
  defaultFallback: string;
  tag: string;
}

const LOGO_SLOTS: LogoSlotConfig[] = [
  {
    key: 'main',
    titleAr: 'الشعار الرئيسي للموقع (Main Global Logo)',
    titleEn: 'Main Brand Logo',
    descAr: 'الشعار الأساسي المعتمد لسيرفر Prime RP المستخدم في كل مكان كقيمة افتراضية.',
    recommendedSize: '512x512 أو 1024x1024 (PNG شفاف أو SVG)',
    defaultFallback: '/assets/prime-logo.png',
    tag: 'الأساسي'
  },
  {
    key: 'navbar',
    titleAr: 'شعار الشريط العلوي (Navbar Logo)',
    titleEn: 'Navigation Bar Logo',
    descAr: 'يظهر في أعلى كل صفحات الموقع في الشريط الرئيسي الثابت (Navbar).',
    recommendedSize: '180x60 أو 240x80 (PNG أو SVG)',
    defaultFallback: '/assets/prime-logo.png',
    tag: 'الهيدر'
  },
  {
    key: 'hero',
    titleAr: 'شعار الواجهة الترحيبية (Hero Section Logo)',
    titleEn: 'Homepage Hero Showcase Logo',
    descAr: 'الشعار الضخم البارز في أعلى الصفحة الرئيسية مع التوهج الذهبي الفاخر.',
    recommendedSize: '800x800 أو دقة عالية 1536x1024',
    defaultFallback: '/assets/prime-logo.png',
    tag: 'الرئيسية'
  },
  {
    key: 'footer',
    titleAr: 'شعار التذييل السفلي (Footer Logo)',
    titleEn: 'Footer Brand Logo',
    descAr: 'يظهر في أسفل جميع الصفحات مع روابط المجتمع وحقوق السيرفر.',
    recommendedSize: '200x80 (أفقي أو مفرغ)',
    defaultFallback: '/assets/prime-logo.png',
    tag: 'الفوتر'
  },
  {
    key: 'login',
    titleAr: 'شعار بطاقة تسجيل الدخول (Login Modal / Card Logo)',
    titleEn: 'Login Window Logo',
    descAr: 'يظهر في صندوق تسجيل الدخول عبر Discord OAuth2 وصفحة الدخول.',
    recommendedSize: '256x256 أو 512x512',
    defaultFallback: '/assets/prime-logo.png',
    tag: 'الدخول'
  },
  {
    key: 'favicon',
    titleAr: 'أيقونة تبويب المتصفح (Browser Favicon)',
    titleEn: 'Browser Tab Favicon (ICO / PNG)',
    descAr: 'الأيقونة المصغرة التي تظهر في شريط علامات تبويب المتصفح بجانب عنوان الموقع.',
    recommendedSize: '32x32 أو 64x64 (PNG أو ICO)',
    defaultFallback: '/assets/prime-logo.png',
    tag: 'المتصفح'
  }
];

export const LogoManagerSettings: React.FC<LogoManagerSettingsProps> = ({
  settings,
  setSettings,
  onSave,
  showToast
}) => {
  const { refreshSettings } = useSettings();
  const [activeSubTab, setActiveSubTab] = useState<'logos' | 'general'>('logos');
  const [uploadingSlot, setUploadingSlot] = useState<string | null>(null);
  const fileInputRefs = useRef<{ [key: string]: HTMLInputElement | null }>({});

  const currentLogos = settings.logos || {
    main: '/assets/prime-logo.png',
    navbar: '/assets/prime-logo.png',
    hero: '/assets/prime-logo.png',
    footer: '/assets/prime-logo.png',
    login: '/assets/prime-logo.png',
    favicon: '/assets/prime-logo.png'
  };

  type LogoKey = 'main' | 'navbar' | 'hero' | 'footer' | 'login' | 'favicon';

  const handleLogoUrlChange = (slotKey: LogoKey, value: string) => {
    setSettings((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        logos: {
          ...prev.logos,
          [slotKey]: value
        }
      };
    });
  };

  const handleFileUpload = (slotKey: LogoKey, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Check size limit (max 8MB for browser upload)
    if (file.size > 8 * 1024 * 1024) {
      showToast('حجم الصورة كبير جداً، يرجى اختيار ملف بحجم أقل من 8 ميجابايت');
      return;
    }

    setUploadingSlot(slotKey);
    const reader = new FileReader();
    reader.onload = () => {
      const base64Data = reader.result as string;
      handleLogoUrlChange(slotKey, base64Data);
      setUploadingSlot(null);
      showToast(`تم تحميل وتطبيق ${String(slotKey)} بنجاح! لا تنسَ الضغط على زر حفظ التغييرات`);
    };
    reader.onerror = () => {
      setUploadingSlot(null);
      showToast('حدث خطأ أثناء قراءة ملف الصورة');
    };
    reader.readAsDataURL(file);
  };

  const handleResetSlot = (slotKey: LogoKey) => {
    handleLogoUrlChange(slotKey, '/assets/prime-logo.png');
    showToast(`تمت استعادة الشعار الافتراضي لـ ${String(slotKey)}`);
  };

  const handleResetAllLogos = () => {
    setSettings((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        logos: {
          main: '/assets/prime-logo.png',
          navbar: '/assets/prime-logo.png',
          hero: '/assets/prime-logo.png',
          footer: '/assets/prime-logo.png',
          login: '/assets/prime-logo.png',
          favicon: '/assets/prime-logo.png'
        }
      };
    });
    showToast('تمت إعادة تعيين جميع اللوجوهات إلى الشعار الرسمي الافتراضي');
  };

  const handleApplyToAll = (sourceSlot: LogoKey) => {
    const sourceValue = currentLogos[sourceSlot] || '/assets/prime-logo.png';
    setSettings((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        logos: {
          main: sourceValue,
          navbar: sourceValue,
          hero: sourceValue,
          footer: sourceValue,
          login: sourceValue,
          favicon: sourceValue
        }
      };
    });
    showToast('تم تطبيق هذا اللوجو على جميع واجهات ومواقع المنصة بنجاح!');
  };

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      {/* HEADER WITH SUBTABS */}
      <div className="bg-[#0D0D0D] border border-[#202020] rounded-3xl p-6 sm:p-8 relative overflow-hidden">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <span className="p-2 rounded-xl bg-[#C8874B]/10 text-[#C8874B] border border-[#C8874B]/20">
                <ImageIcon className="w-5 h-5" />
              </span>
              <h2 className="text-xl sm:text-2xl font-black text-white">
                إدارة شعارات وهوية المنصة الفاخرة
              </h2>
            </div>
            <p className="text-xs sm:text-sm text-[#888] leading-relaxed max-w-2xl">
              يمكنك هنا رفع وتعديل كل شعار (Logo) بشكل منفصل ومخصص لكل قسم في الموقع، أو وضع رابط مباشر للصورة بصيغ (PNG / WebP / SVG).
            </p>
          </div>

          <div className="flex items-center gap-2 bg-[#141414] p-1.5 rounded-2xl border border-[#242424] self-stretch sm:self-auto justify-center">
            <button
              type="button"
              onClick={() => setActiveSubTab('logos')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                activeSubTab === 'logos'
                  ? 'bg-[#C8874B] text-black shadow-lg shadow-[#C8874B]/20'
                  : 'text-[#888] hover:text-white'
              }`}
            >
              <Layers className="w-4 h-4" />
              <span>إدارة الشعارات (Logos)</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveSubTab('general')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                activeSubTab === 'general'
                  ? 'bg-[#C8874B] text-black shadow-lg shadow-[#C8874B]/20'
                  : 'text-[#888] hover:text-white'
              }`}
            >
              <Sliders className="w-4 h-4" />
              <span>الإعدادات العامة</span>
            </button>
          </div>
        </div>
      </div>

      <form onSubmit={onSave} className="space-y-6">
        {activeSubTab === 'logos' && (
          <div className="space-y-6">
            {/* QUICK ACTIONS BAR */}
            <div className="flex flex-wrap items-center justify-between gap-3 bg-[#111] border border-[#222] p-4 rounded-2xl">
              <div className="flex items-center gap-2 text-xs text-[#AAA]">
                <Info className="w-4 h-4 text-[#C8874B]" />
                <span>جميع التعديلات تظهر فوراً بالمعاينة الحية وتُحفظ بشكل دائم في قاعدة البيانات.</span>
              </div>
              <button
                type="button"
                onClick={handleResetAllLogos}
                className="flex items-center gap-1.5 text-xs text-[#C8874B] hover:text-white px-3 py-1.5 rounded-lg bg-[#181818] border border-[#282828] transition-colors"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>استعادة الافتراضيات لجميع الشعارات</span>
              </button>
            </div>

            {/* LOGO SLOTS GRID */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {LOGO_SLOTS.map((slot) => {
                const currentVal = currentLogos[slot.key] || slot.defaultFallback;
                const isUploading = uploadingSlot === slot.key;

                return (
                  <div
                    key={slot.key}
                    className="bg-[#0C0C0C] border border-[#1E1E1E] hover:border-[#2D2D2D] rounded-3xl p-6 transition-all duration-300 flex flex-col justify-between relative group"
                  >
                    {/* Header */}
                    <div>
                      <div className="flex items-start justify-between gap-2 mb-3">
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full bg-[#C8874B]/10 text-[#C8874B] border border-[#C8874B]/20">
                            {slot.tag}
                          </span>
                          <h3 className="text-sm font-black text-white">{slot.titleAr}</h3>
                        </div>
                        <span className="text-[10px] text-[#666] font-mono">{slot.titleEn}</span>
                      </div>

                      <p className="text-xs text-[#888] mb-4 leading-relaxed">
                        {slot.descAr}
                      </p>

                      {/* Preview Box */}
                      <div className="bg-[#050505] border border-[#1C1C1C] rounded-2xl p-4 mb-4 flex items-center justify-center min-h-[140px] relative overflow-hidden group-hover:border-[#C8874B]/30 transition-colors">
                        <div 
                          className="absolute inset-0 bg-radial from-[#C8874B]/5 to-transparent pointer-events-none" 
                          aria-hidden="true" 
                        />
                        <img
                          src={currentVal}
                          alt={slot.titleEn}
                          className="max-h-24 max-w-[200px] object-contain drop-shadow-xl transition-transform duration-300 group-hover:scale-105"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = '/assets/prime-logo.png';
                          }}
                        />
                        <div className="absolute bottom-2 right-2 text-[10px] font-mono text-[#555] bg-black/60 px-2 py-0.5 rounded backdrop-blur-sm">
                          {slot.recommendedSize}
                        </div>
                      </div>

                      {/* URL input */}
                      <div className="space-y-2 mb-4">
                        <label className="block text-[11px] font-bold text-[#AAA]">
                          مسار أو رابط الصورة (Image URL / Path)
                        </label>
                        <div className="relative">
                          <input
                            type="text"
                            value={currentVal.startsWith('data:') ? 'بيانات صورة مرفوعة محلياً (Base64 Image Uploaded)' : currentVal}
                            disabled={currentVal.startsWith('data:')}
                            onChange={(e) => handleLogoUrlChange(slot.key, e.target.value)}
                            placeholder="/assets/prime-logo.png أو https://..."
                            className="w-full bg-[#121212] border border-[#262626] focus:border-[#C8874B] rounded-xl px-3 py-2 text-xs text-white focus:outline-none placeholder:text-[#555]"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="pt-2 border-t border-[#181818] flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        {/* Hidden file input */}
                        <input
                          type="file"
                          accept="image/*"
                          ref={(el) => (fileInputRefs.current[slot.key] = el)}
                          onChange={(e) => handleFileUpload(slot.key, e)}
                          className="hidden"
                        />
                        
                        {/* Upload Button */}
                        <button
                          type="button"
                          onClick={() => fileInputRefs.current[slot.key]?.click()}
                          disabled={isUploading}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#C8874B]/10 hover:bg-[#C8874B] text-[#C8874B] hover:text-black text-xs font-bold border border-[#C8874B]/20 transition-all"
                        >
                          <Upload className="w-3.5 h-3.5" />
                          <span>{isUploading ? 'جاري التحميل...' : 'رفع صورة من جهازك'}</span>
                        </button>

                        {/* Reset button */}
                        <button
                          type="button"
                          onClick={() => handleResetSlot(slot.key)}
                          title="استعادة الافتراضي"
                          className="p-2 rounded-xl bg-[#161616] hover:bg-[#222] text-[#888] hover:text-white border border-[#252525] transition-colors"
                        >
                          <RefreshCw className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      {/* Apply to All Option */}
                      <button
                        type="button"
                        onClick={() => handleApplyToAll(slot.key)}
                        className="text-[11px] text-[#777] hover:text-[#C8874B] transition-colors flex items-center gap-1"
                      >
                        <span>تطبيق على الكل</span>
                        <ArrowRight className="w-3 h-3 rtl:rotate-180" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* GENERAL SETTINGS TAB */}
        {activeSubTab === 'general' && (
          <div className="bg-[#0B0B0B] border border-[#1C1C1C] rounded-3xl p-6 sm:p-8 space-y-5">
            <h3 className="text-lg font-black text-white mb-4">بيانات السيرفر والروابط العامة</h3>

            <div>
              <label className="block text-xs font-bold text-[#AAA] mb-1.5">اسم السيرفر (Server Name)</label>
              <input
                type="text"
                value={settings.siteName || (settings as any).serverName || 'PRIME RP'}
                onChange={(e) => setSettings({ ...settings, siteName: e.target.value, serverName: e.target.value } as any)}
                className="w-full bg-[#121212] border border-[#262626] rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-[#C8874B]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#AAA] mb-1.5">وصف السيرفر (Site Description)</label>
              <input
                type="text"
                value={settings.siteDescription || ''}
                onChange={(e) => setSettings({ ...settings, siteDescription: e.target.value })}
                className="w-full bg-[#121212] border border-[#262626] rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-[#C8874B]"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-[#AAA] mb-1.5">رابط FiveM Connect</label>
                <input
                  type="text"
                  value={settings.fiveMConnectUrl || ''}
                  onChange={(e) => setSettings({ ...settings, fiveMConnectUrl: e.target.value })}
                  className="w-full bg-[#121212] border border-[#262626] rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-[#C8874B]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#AAA] mb-1.5">رابط دعوة سيرفر Discord</label>
                <input
                  type="text"
                  value={settings.discordUrl || (settings as any).discordInviteUrl || ''}
                  onChange={(e) => setSettings({ ...settings, discordUrl: e.target.value, discordInviteUrl: e.target.value } as any)}
                  className="w-full bg-[#121212] border border-[#262626] rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-[#C8874B]"
                />
              </div>
            </div>

            {/* Discord OAuth Integration Credentials */}
            <div className="p-5 rounded-2xl bg-[#0F0F16] border border-[#5865F2]/20 space-y-4">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2 text-[#5865F2]">
                  <Sparkles className="w-4 h-4" />
                  <h4 className="text-xs font-black text-white">بيانات اعتماد تسجيل الدخول الفعلي عبر Discord (OAuth2)</h4>
                </div>
                <span className="text-[10px] px-2 py-0.5 rounded bg-[#5865F2]/20 text-[#8EA1FF] font-mono font-bold">
                  Discord Developer Portal
                </span>
              </div>
              <p className="text-[11px] text-[#888] leading-relaxed">
                يمكنك إدخال مفاتيح تطبيقك هنا مباشرة لحفظها في الموقع، أو تعيينها كمتغيرات بيئة (<span className="text-white font-mono">DISCORD_CLIENT_ID</span> و <span className="text-white font-mono">DISCORD_CLIENT_SECRET</span>) في ملف <span className="text-white font-mono">.env</span> الخاص بالمشروع مباشرة.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-bold text-[#AAA] mb-1">
                    معرف التطبيق (Client ID)
                  </label>
                  <input
                    type="text"
                    placeholder="مثال: 123456789012345678"
                    value={settings.discordClientId || ''}
                    onChange={(e) => setSettings({ ...settings, discordClientId: e.target.value.trim() })}
                    className="w-full bg-[#14141E] border border-[#2B2B3B] focus:border-[#5865F2] rounded-xl px-3.5 py-2 text-xs text-white font-mono focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-[#AAA] mb-1">
                    المفتاح السري للتطبيق (Client Secret)
                  </label>
                  <input
                    type="password"
                    placeholder="مثال: aBcDeFgHiJkLmNoPqRsTuVwXyZ"
                    value={settings.discordClientSecret || ''}
                    onChange={(e) => setSettings({ ...settings, discordClientSecret: e.target.value.trim() })}
                    className="w-full bg-[#14141E] border border-[#2B2B3B] focus:border-[#5865F2] rounded-xl px-3.5 py-2 text-xs text-white font-mono focus:outline-none"
                  />
                </div>
              </div>

              <div className="p-3 rounded-xl bg-black/40 border border-[#222] flex items-center justify-between gap-3 text-[11px]">
                <div className="truncate">
                  <span className="text-[#777]">الرابط المطلوب في Discord Redirects: </span>
                  <span className="font-mono text-[#8EA1FF]">
                    {typeof window !== 'undefined' ? `${window.location.origin}/api/auth/discord/callback` : '/api/auth/discord/callback'}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    navigator.clipboard.writeText(`${window.location.origin}/api/auth/discord/callback`);
                    showToast('تم نسخ رابط الاسترجاع Redirect URI');
                  }}
                  className="shrink-0 px-3 py-1 rounded-lg bg-[#5865F2] hover:bg-[#4752C4] text-white text-[10px] font-bold"
                >
                  نسخ الرابط
                </button>
              </div>
            </div>

            <div className="flex items-center gap-3 pt-3 border-t border-[#181818]">
              <input
                type="checkbox"
                id="maintMode"
                checked={settings.maintenanceMode}
                onChange={(e) => setSettings({ ...settings, maintenanceMode: e.target.checked })}
                className="w-4 h-4 rounded text-[#C8874B] focus:ring-[#C8874B] accent-[#C8874B]"
              />
              <label htmlFor="maintMode" className="text-xs font-bold text-white cursor-pointer">
                تفعيل وضع الصيانة (Maintenance Mode)
              </label>
            </div>
          </div>
        )}

        {/* SAVE BUTTON */}
        <div className="pt-4 flex items-center justify-end gap-4">
          <button
            type="submit"
            className="px-8 py-3.5 rounded-2xl bg-[#C8874B] hover:bg-[#d9965a] text-black font-extrabold text-sm shadow-xl shadow-[#C8874B]/20 transition-all transform hover:scale-[1.02] flex items-center gap-2"
          >
            <Check className="w-4 h-4" />
            <span>حفظ جميع التغييرات والشعارات</span>
          </button>
        </div>
      </form>
    </div>
  );
};

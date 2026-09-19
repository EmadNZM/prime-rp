import React, { useState, useEffect } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { useSettings } from '../../context/SettingsContext';
import { apiClient } from '../../services/apiClient';
import { HomepageSettings } from '../../types';
import { 
  Sparkles, 
  Save, 
  RotateCcw, 
  Image as ImageIcon, 
  Megaphone, 
  BarChart2, 
  Eye, 
  Check, 
  AlertCircle,
  ExternalLink,
  Flame,
  Layout
} from 'lucide-react';

const PRESET_WALLPAPERS = [
  {
    name: 'Los Santos Sunset Skyline',
    url: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=1920&auto=format&fit=crop&q=80'
  },
  {
    name: 'Downtown Neon & Luxury Fleet',
    url: 'https://images.unsplash.com/photo-1542282088-72c9c27ed0cd?w=1920&auto=format&fit=crop&q=80'
  },
  {
    name: 'Vinewood Hills Night View',
    url: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?w=1920&auto=format&fit=crop&q=80'
  },
  {
    name: 'Cyberpunk Hypercar Pursuit',
    url: 'https://images.unsplash.com/photo-1511512578047-dfb367046420?w=1920&auto=format&fit=crop&q=80'
  }
];

export const HomepageCMSManager: React.FC = () => {
  const { language } = useLanguage();
  const { settings, updateSettings } = useSettings();

  const [cmsData, setCmsData] = useState<HomepageSettings>({
    announcement: {
      enabled: true,
      textAr: 'مرحباً بكم في Prime RP V3.0! انضم إلى مجتمع الديسكورد وتعرف على التحديثات الحصرية وفعاليات المدينة.',
      textEn: 'Welcome to Prime RP V3.0! Join our Discord community for exclusive city events and updates.',
      type: 'info',
      badgeAr: 'إعلان السيرفر',
      badgeEn: 'Announcement',
      link: 'https://discord.gg/primerp'
    },
    hero: {
      titleLine1Ar: 'مدينة صُنعت',
      titleLine1En: 'A CITY',
      titleLine2Ar: 'بأيديكم',
      titleLine2En: 'BUILT BY YOU',
      subtitleAr: 'مدينة حية متكاملة بُنيت بعناية لعشاق اللعب الواقعي الجاد. نظام اقتصادي متوازن، وظائف رسمية بمحاكاة كاملة، صوت ثلاثي الأبعاد محيطي، وأداء ثابت يضمن تجربة خالية من التقطيع.',
      subtitleEn: 'A living, breathing metropolis built for authentic storylines, dedicated community, custom MDT systems, 3D spatial radio, and seamless 60 FPS netcode.',
      mottoAr: 'عصر جديد • واقع لا مثيل له',
      mottoEn: 'A NEW ERA • A REALER WORLD',
      badgeAr: 'السيرفر الواقعي الأقوى',
      badgeEn: 'PREMIUM FIVEM ROLEPLAY',
      bgImage: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=1920&auto=format&fit=crop&q=80',
      ctaConnectAr: 'دخول السيرفر الآن',
      ctaConnectEn: 'CONNECT NOW',
      ctaDiscordAr: 'مجتمع الديسكورد',
      ctaDiscordEn: 'JOIN DISCORD'
    },
    stats: {
      totalCitizens: '+15,000',
      activeFactions: '12',
      satisfactionRate: '99.4%',
      fpsPerformance: '60 FPS'
    }
  });

  const [activeTab, setActiveTab] = useState<'hero' | 'announcement' | 'stats' | 'preview'>('hero');
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; msg: string } | null>(null);

  useEffect(() => {
    if (settings?.homepage) {
      setCmsData(prev => ({
        ...prev,
        ...settings.homepage
      }));
    }
  }, [settings]);

  const handleSave = async () => {
    setIsSaving(true);
    setFeedback(null);
    try {
      await apiClient.saveHomepageCMS(cmsData);
      // Update global context
      updateSettings({
        ...settings,
        homepage: cmsData
      });
      setFeedback({
        type: 'success',
        msg: language === 'ar' ? 'تم حفظ وتحديث محتوى الصفحة الرئيسية بنجاح' : 'Homepage CMS updated successfully'
      });
      setTimeout(() => setFeedback(null), 4000);
    } catch (err) {
      setFeedback({
        type: 'error',
        msg: language === 'ar' ? 'فشل حفظ محتوى الصفحة الرئيسية' : 'Failed to save homepage CMS'
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Header Banner */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-[#11131b] via-[#151926] to-[#11131b] border border-white/[0.08] shadow-2xl relative overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-black text-[#df9f64] uppercase tracking-wider mb-2">
              <Layout className="w-4 h-4 text-[#c8874b]" />
              <span>{language === 'ar' ? 'التحكم الكامل بواجهات الموقع (Homepage CMS)' : 'Frontend & Homepage CMS Control'}</span>
            </div>
            <h2 className="text-2xl font-black text-white tracking-tight">
              {language === 'ar' ? 'تخصيص واجهة الموقع الرئيسية والبانرات' : 'Homepage Hero & Announcement Management'}
            </h2>
            <p className="text-xs sm:text-sm text-[#8c92a4] mt-1 max-w-xl">
              {language === 'ar'
                ? 'تحكم فوري بنصوص قسم الهيرو، صور الخلفية، الإعلانات العاجلة، والأرقام والإحصائيات المعروضة لزوار السيرفر.'
                : 'Directly modify the landing hero copy, background imagery, global announcements, and live statistics.'}
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-[#c8874b] hover:bg-[#df9f64] text-black font-black text-xs uppercase tracking-wider transition-all shadow-lg shadow-[#c8874b]/20 cursor-pointer disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              <span>{isSaving ? (language === 'ar' ? 'جاري الحفظ...' : 'Saving...') : (language === 'ar' ? 'حفظ ونشر التعديلات' : 'Publish Changes')}</span>
            </button>
          </div>
        </div>

        {feedback && (
          <div className={`mt-4 p-3.5 rounded-xl text-xs font-bold flex items-center gap-2 border ${
            feedback.type === 'success' 
              ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' 
              : 'bg-rose-500/10 text-rose-400 border-rose-500/20'
          }`}>
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{feedback.msg}</span>
          </div>
        )}
      </div>

      {/* Subtabs */}
      <div className="flex items-center gap-2 border-b border-white/[0.08] pb-3">
        <button
          onClick={() => setActiveTab('hero')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === 'hero'
              ? 'bg-[#c8874b] text-black shadow-md shadow-[#c8874b]/20'
              : 'bg-[#121622] text-[#8c92a4] hover:text-white'
          }`}
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>{language === 'ar' ? 'واجهة الهيرو الرئيسية' : 'Hero Section'}</span>
        </button>

        <button
          onClick={() => setActiveTab('announcement')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === 'announcement'
              ? 'bg-[#c8874b] text-black shadow-md shadow-[#c8874b]/20'
              : 'bg-[#121622] text-[#8c92a4] hover:text-white'
          }`}
        >
          <Megaphone className="w-3.5 h-3.5" />
          <span>{language === 'ar' ? 'شريط الإعلانات العلوية' : 'Announcement Bar'}</span>
        </button>

        <button
          onClick={() => setActiveTab('stats')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === 'stats'
              ? 'bg-[#c8874b] text-black shadow-md shadow-[#c8874b]/20'
              : 'bg-[#121622] text-[#8c92a4] hover:text-white'
          }`}
        >
          <BarChart2 className="w-3.5 h-3.5" />
          <span>{language === 'ar' ? 'عدادات الإحصائيات' : 'Live Counters'}</span>
        </button>

        <button
          onClick={() => setActiveTab('preview')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === 'preview'
              ? 'bg-[#c8874b] text-black shadow-md shadow-[#c8874b]/20'
              : 'bg-[#121622] text-[#8c92a4] hover:text-white'
          }`}
        >
          <Eye className="w-3.5 h-3.5" />
          <span>{language === 'ar' ? 'معاينة حية' : 'Live Preview'}</span>
        </button>
      </div>

      {/* HERO TAB */}
      {activeTab === 'hero' && (
        <div className="space-y-6">
          <div className="p-6 rounded-2xl bg-[#0e1017] border border-white/[0.08] shadow-xl space-y-6">
            <h3 className="text-base font-black text-white flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[#c8874b]" />
              <span>{language === 'ar' ? 'النصوص والعناوين الرئيسية' : 'Hero Headlines & Subtitle'}</span>
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-[#8c92a4] mb-1.5">
                  {language === 'ar' ? 'سطر العنوان الأول (عربي)' : 'Title Line 1 (Arabic)'}
                </label>
                <input
                  type="text"
                  value={cmsData.hero.titleLine1Ar}
                  onChange={(e) => setCmsData(prev => ({ ...prev, hero: { ...prev.hero, titleLine1Ar: e.target.value } }))}
                  className="w-full bg-[#151926] border border-white/[0.1] rounded-xl px-4 py-2.5 text-xs text-white focus:border-[#c8874b] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#8c92a4] mb-1.5">
                  {language === 'ar' ? 'سطر العنوان الأول (إنجليزي)' : 'Title Line 1 (English)'}
                </label>
                <input
                  type="text"
                  value={cmsData.hero.titleLine1En}
                  onChange={(e) => setCmsData(prev => ({ ...prev, hero: { ...prev.hero, titleLine1En: e.target.value } }))}
                  className="w-full bg-[#151926] border border-white/[0.1] rounded-xl px-4 py-2.5 text-xs text-white focus:border-[#c8874b] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#8c92a4] mb-1.5">
                  {language === 'ar' ? 'سطر العنوان الثاني البارز (عربي)' : 'Title Line 2 Accent (Arabic)'}
                </label>
                <input
                  type="text"
                  value={cmsData.hero.titleLine2Ar}
                  onChange={(e) => setCmsData(prev => ({ ...prev, hero: { ...prev.hero, titleLine2Ar: e.target.value } }))}
                  className="w-full bg-[#151926] border border-white/[0.1] rounded-xl px-4 py-2.5 text-xs text-white focus:border-[#c8874b] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#8c92a4] mb-1.5">
                  {language === 'ar' ? 'سطر العنوان الثاني البارز (إنجليزي)' : 'Title Line 2 Accent (English)'}
                </label>
                <input
                  type="text"
                  value={cmsData.hero.titleLine2En}
                  onChange={(e) => setCmsData(prev => ({ ...prev, hero: { ...prev.hero, titleLine2En: e.target.value } }))}
                  className="w-full bg-[#151926] border border-white/[0.1] rounded-xl px-4 py-2.5 text-xs text-white focus:border-[#c8874b] focus:outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-[#8c92a4] mb-1.5">
                  {language === 'ar' ? 'الوصف التقديمي (عربي)' : 'Subtitle (Arabic)'}
                </label>
                <textarea
                  rows={3}
                  value={cmsData.hero.subtitleAr}
                  onChange={(e) => setCmsData(prev => ({ ...prev, hero: { ...prev.hero, subtitleAr: e.target.value } }))}
                  className="w-full bg-[#151926] border border-white/[0.1] rounded-xl p-3 text-xs text-white focus:border-[#c8874b] focus:outline-none leading-relaxed"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#8c92a4] mb-1.5">
                  {language === 'ar' ? 'الوصف التقديمي (إنجليزي)' : 'Subtitle (English)'}
                </label>
                <textarea
                  rows={3}
                  value={cmsData.hero.subtitleEn}
                  onChange={(e) => setCmsData(prev => ({ ...prev, hero: { ...prev.hero, subtitleEn: e.target.value } }))}
                  className="w-full bg-[#151926] border border-white/[0.1] rounded-xl p-3 text-xs text-white focus:border-[#c8874b] focus:outline-none leading-relaxed"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-xs font-bold text-[#8c92a4] mb-1.5">
                  {language === 'ar' ? 'الشعار الفرعي (عربي)' : 'Motto (Arabic)'}
                </label>
                <input
                  type="text"
                  value={cmsData.hero.mottoAr}
                  onChange={(e) => setCmsData(prev => ({ ...prev, hero: { ...prev.hero, mottoAr: e.target.value } }))}
                  className="w-full bg-[#151926] border border-white/[0.1] rounded-xl px-3 py-2 text-xs text-white focus:border-[#c8874b] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#8c92a4] mb-1.5">
                  {language === 'ar' ? 'الشعار الفرعي (إنجليزي)' : 'Motto (English)'}
                </label>
                <input
                  type="text"
                  value={cmsData.hero.mottoEn}
                  onChange={(e) => setCmsData(prev => ({ ...prev, hero: { ...prev.hero, mottoEn: e.target.value } }))}
                  className="w-full bg-[#151926] border border-white/[0.1] rounded-xl px-3 py-2 text-xs text-white focus:border-[#c8874b] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#8c92a4] mb-1.5">
                  {language === 'ar' ? 'شارة الهيرو (عربي)' : 'Badge (Arabic)'}
                </label>
                <input
                  type="text"
                  value={cmsData.hero.badgeAr}
                  onChange={(e) => setCmsData(prev => ({ ...prev, hero: { ...prev.hero, badgeAr: e.target.value } }))}
                  className="w-full bg-[#151926] border border-white/[0.1] rounded-xl px-3 py-2 text-xs text-white focus:border-[#c8874b] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#8c92a4] mb-1.5">
                  {language === 'ar' ? 'شارة الهيرو (إنجليزي)' : 'Badge (English)'}
                </label>
                <input
                  type="text"
                  value={cmsData.hero.badgeEn}
                  onChange={(e) => setCmsData(prev => ({ ...prev, hero: { ...prev.hero, badgeEn: e.target.value } }))}
                  className="w-full bg-[#151926] border border-white/[0.1] rounded-xl px-3 py-2 text-xs text-white focus:border-[#c8874b] focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* Background Image & Wallpapers */}
          <div className="p-6 rounded-2xl bg-[#0e1017] border border-white/[0.08] shadow-xl space-y-4">
            <h3 className="text-base font-black text-white flex items-center gap-2">
              <ImageIcon className="w-4 h-4 text-[#c8874b]" />
              <span>{language === 'ar' ? 'صورة الخلفية السينمائية (Hero Wallpaper)' : 'Cinematic Wallpaper & Visual Theme'}</span>
            </h3>

            <div>
              <label className="block text-xs font-bold text-[#8c92a4] mb-1.5">
                {language === 'ar' ? 'رابط الصورة المباشر (Direct Image URL)' : 'Direct Wallpaper URL'}
              </label>
              <input
                type="text"
                value={cmsData.hero.bgImage}
                onChange={(e) => setCmsData(prev => ({ ...prev, hero: { ...prev.hero, bgImage: e.target.value } }))}
                className="w-full bg-[#151926] border border-white/[0.1] rounded-xl px-4 py-2.5 text-xs text-white font-mono focus:border-[#c8874b] focus:outline-none"
                placeholder="https://..."
              />
            </div>

            <p className="text-xs text-[#8c92a4] pt-2">
              {language === 'ar' ? 'أو اختر من الخلفيات السينمائية الجاهزة لسيرفرات FiveM:' : 'Or choose from our high-resolution GTA Los Santos presets:'}
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
              {PRESET_WALLPAPERS.map(preset => {
                const isCurrent = cmsData.hero.bgImage === preset.url;
                return (
                  <div
                    key={preset.name}
                    onClick={() => setCmsData(prev => ({ ...prev, hero: { ...prev.hero, bgImage: preset.url } }))}
                    className={`group relative rounded-xl overflow-hidden border cursor-pointer transition-all ${
                      isCurrent ? 'border-[#c8874b] ring-2 ring-[#c8874b]/40 shadow-lg' : 'border-white/[0.08] hover:border-white/[0.2]'
                    }`}
                  >
                    <img
                      src={preset.url}
                      alt={preset.name}
                      className="w-full h-24 object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent p-2.5 flex flex-col justify-end">
                      <span className="text-[11px] font-bold text-white truncate">{preset.name}</span>
                      {isCurrent && (
                        <span className="text-[10px] text-[#c8874b] font-black flex items-center gap-1 mt-0.5">
                          <Check className="w-3 h-3" /> {language === 'ar' ? 'الخلفية النشطة' : 'Active'}
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* ANNOUNCEMENT TAB */}
      {activeTab === 'announcement' && (
        <div className="p-6 rounded-2xl bg-[#0e1017] border border-white/[0.08] shadow-xl space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-white/[0.08]">
            <div>
              <h3 className="text-base font-black text-white flex items-center gap-2">
                <Megaphone className="w-4 h-4 text-[#c8874b]" />
                <span>{language === 'ar' ? 'إعدادات شريط الإعلانات العاجلة' : 'Announcement Banner Controls'}</span>
              </h3>
              <p className="text-xs text-[#8c92a4] mt-0.5">
                {language === 'ar' ? 'يظهر هذا الشريط في أعلى الصفحة الرئيسية لجميع الزوار للتنبيه عن الفعاليات والتحديثات.' : 'A top announcement strip visible on the landing page for all citizens.'}
              </p>
            </div>

            <label className="flex items-center gap-3 cursor-pointer">
              <span className="text-xs font-bold text-white">
                {cmsData.announcement.enabled ? (language === 'ar' ? 'مفعل ومباشر' : 'Enabled') : (language === 'ar' ? 'معطل ومخفي' : 'Disabled')}
              </span>
              <input
                type="checkbox"
                checked={cmsData.announcement.enabled}
                onChange={(e) => setCmsData(prev => ({
                  ...prev,
                  announcement: { ...prev.announcement, enabled: e.target.checked }
                }))}
                className="w-5 h-5 accent-[#c8874b] rounded cursor-pointer"
              />
            </label>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-[#8c92a4] mb-1.5">
                {language === 'ar' ? 'نص الإعلان (عربي)' : 'Announcement Text (Arabic)'}
              </label>
              <textarea
                rows={3}
                value={cmsData.announcement.textAr}
                onChange={(e) => setCmsData(prev => ({
                  ...prev,
                  announcement: { ...prev.announcement, textAr: e.target.value }
                }))}
                className="w-full bg-[#151926] border border-white/[0.1] rounded-xl p-3 text-xs text-white focus:border-[#c8874b] focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#8c92a4] mb-1.5">
                {language === 'ar' ? 'نص الإعلان (إنجليزي)' : 'Announcement Text (English)'}
              </label>
              <textarea
                rows={3}
                value={cmsData.announcement.textEn}
                onChange={(e) => setCmsData(prev => ({
                  ...prev,
                  announcement: { ...prev.announcement, textEn: e.target.value }
                }))}
                className="w-full bg-[#151926] border border-white/[0.1] rounded-xl p-3 text-xs text-white focus:border-[#c8874b] focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-[#8c92a4] mb-1.5">
                {language === 'ar' ? 'شارة التنبيه (عربي)' : 'Badge (Arabic)'}
              </label>
              <input
                type="text"
                value={cmsData.announcement.badgeAr}
                onChange={(e) => setCmsData(prev => ({
                  ...prev,
                  announcement: { ...prev.announcement, badgeAr: e.target.value }
                }))}
                className="w-full bg-[#151926] border border-white/[0.1] rounded-xl px-3 py-2 text-xs text-white focus:border-[#c8874b] focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#8c92a4] mb-1.5">
                {language === 'ar' ? 'نوع الإعلان والتلوين' : 'Notification Severity'}
              </label>
              <select
                value={cmsData.announcement.type}
                onChange={(e) => setCmsData(prev => ({
                  ...prev,
                  announcement: { ...prev.announcement, type: e.target.value as any }
                }))}
                className="w-full bg-[#151926] border border-white/[0.1] rounded-xl px-3 py-2 text-xs text-white focus:border-[#c8874b] focus:outline-none"
              >
                <option value="info">أزرق هادئ (Info)</option>
                <option value="warning">ذهبي تحذيري (Warning)</option>
                <option value="urgent">أحمر عاجل (Urgent)</option>
                <option value="success">أخضر إيجابي (Success)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#8c92a4] mb-1.5">
                {language === 'ar' ? 'رابط التوجيه (اختياري)' : 'Target Link (Optional)'}
              </label>
              <input
                type="text"
                value={cmsData.announcement.link || ''}
                onChange={(e) => setCmsData(prev => ({
                  ...prev,
                  announcement: { ...prev.announcement, link: e.target.value }
                }))}
                className="w-full bg-[#151926] border border-white/[0.1] rounded-xl px-3 py-2 text-xs text-white focus:border-[#c8874b] focus:outline-none"
                placeholder="https://discord.gg/..."
              />
            </div>
          </div>
        </div>
      )}

      {/* STATS TAB */}
      {activeTab === 'stats' && (
        <div className="p-6 rounded-2xl bg-[#0e1017] border border-white/[0.08] shadow-xl space-y-6">
          <h3 className="text-base font-black text-white flex items-center gap-2">
            <BarChart2 className="w-4 h-4 text-[#c8874b]" />
            <span>{language === 'ar' ? 'عدادات الإحصائيات العامة لسيرفر اللعب' : 'Public City Metrics Counters'}</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-xs font-bold text-[#8c92a4] mb-1.5">
                {language === 'ar' ? 'إجمالي المواطنين المسجلين' : 'Total Citizens'}
              </label>
              <input
                type="text"
                value={cmsData.stats.totalCitizens}
                onChange={(e) => setCmsData(prev => ({ ...prev, stats: { ...prev.stats, totalCitizens: e.target.value } }))}
                className="w-full bg-[#151926] border border-white/[0.1] rounded-xl px-3 py-2.5 text-xs text-white font-mono focus:border-[#c8874b] focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#8c92a4] mb-1.5">
                {language === 'ar' ? 'الفصائل والمنظمات النشطة' : 'Active Factions'}
              </label>
              <input
                type="text"
                value={cmsData.stats.activeFactions}
                onChange={(e) => setCmsData(prev => ({ ...prev, stats: { ...prev.stats, activeFactions: e.target.value } }))}
                className="w-full bg-[#151926] border border-white/[0.1] rounded-xl px-3 py-2.5 text-xs text-white font-mono focus:border-[#c8874b] focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#8c92a4] mb-1.5">
                {language === 'ar' ? 'نسبة رضا المجتمع' : 'Satisfaction Rate'}
              </label>
              <input
                type="text"
                value={cmsData.stats.satisfactionRate}
                onChange={(e) => setCmsData(prev => ({ ...prev, stats: { ...prev.stats, satisfactionRate: e.target.value } }))}
                className="w-full bg-[#151926] border border-white/[0.1] rounded-xl px-3 py-2.5 text-xs text-white font-mono focus:border-[#c8874b] focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#8c92a4] mb-1.5">
                {language === 'ar' ? 'معدل أداء السيرفر (FPS)' : 'Netcode Performance'}
              </label>
              <input
                type="text"
                value={cmsData.stats.fpsPerformance}
                onChange={(e) => setCmsData(prev => ({ ...prev, stats: { ...prev.stats, fpsPerformance: e.target.value } }))}
                className="w-full bg-[#151926] border border-white/[0.1] rounded-xl px-3 py-2.5 text-xs text-white font-mono focus:border-[#c8874b] focus:outline-none"
              />
            </div>
          </div>
        </div>
      )}

      {/* PREVIEW TAB */}
      {activeTab === 'preview' && (
        <div className="p-6 rounded-2xl bg-[#0e1017] border border-white/[0.08] shadow-xl space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-black text-white flex items-center gap-2">
              <Eye className="w-4 h-4 text-[#c8874b]" />
              <span>{language === 'ar' ? 'المعاينة الفورية كما تظهر للمواطنين' : 'Live Interactive Visual Preview'}</span>
            </h3>
            <span className="text-xs text-[#7a8091] font-mono">1920x1080 Aspect</span>
          </div>

          <div className="relative rounded-2xl overflow-hidden border border-white/[0.12] min-h-[420px] flex flex-col justify-between p-8 bg-black">
            {/* Background Image with Dark Gradient */}
            <div 
              className="absolute inset-0 bg-cover bg-center transition-all duration-700 opacity-40"
              style={{ backgroundImage: `url('${cmsData.hero.bgImage}')` }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#090a0f] via-black/60 to-transparent" />

            {/* Announcement Banner in Preview */}
            {cmsData.announcement.enabled && (
              <div className="relative z-10 w-full p-3 rounded-xl bg-black/60 backdrop-blur-md border border-[#c8874b]/30 flex items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-2.5">
                  <span className="px-2 py-0.5 rounded bg-[#c8874b] text-black font-black text-[10px] uppercase">
                    {language === 'ar' ? cmsData.announcement.badgeAr : cmsData.announcement.badgeEn}
                  </span>
                  <span className="text-white font-bold">
                    {language === 'ar' ? cmsData.announcement.textAr : cmsData.announcement.textEn}
                  </span>
                </div>
                <ExternalLink className="w-3.5 h-3.5 text-[#c8874b]" />
              </div>
            )}

            {/* Center Content */}
            <div className="relative z-10 my-auto max-w-2xl py-6">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#c8874b]/15 border border-[#c8874b]/40 text-[#df9f64] text-[11px] font-black uppercase tracking-wider mb-4">
                <Flame className="w-3.5 h-3.5" />
                <span>{language === 'ar' ? cmsData.hero.badgeAr : cmsData.hero.badgeEn}</span>
              </div>

              <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight leading-tight">
                {language === 'ar' ? cmsData.hero.titleLine1Ar : cmsData.hero.titleLine1En}{' '}
                <span className="text-[#c8874b]">
                  {language === 'ar' ? cmsData.hero.titleLine2Ar : cmsData.hero.titleLine2En}
                </span>
              </h1>

              <p className="text-xs sm:text-sm text-[#a2a8b9] mt-3 leading-relaxed">
                {language === 'ar' ? cmsData.hero.subtitleAr : cmsData.hero.subtitleEn}
              </p>

              <div className="flex items-center gap-3 mt-6">
                <button className="px-6 py-2.5 rounded-xl bg-[#c8874b] text-black font-black text-xs uppercase tracking-wider shadow-lg">
                  {language === 'ar' ? cmsData.hero.ctaConnectAr : cmsData.hero.ctaConnectEn}
                </button>
                <button className="px-6 py-2.5 rounded-xl bg-white/[0.08] hover:bg-white/[0.12] text-white font-bold text-xs uppercase tracking-wider border border-white/[0.1]">
                  {language === 'ar' ? cmsData.hero.ctaDiscordAr : cmsData.hero.ctaDiscordEn}
                </button>
              </div>
            </div>

            {/* Counters Strip in Preview */}
            <div className="relative z-10 grid grid-cols-4 gap-3 pt-6 border-t border-white/[0.1]">
              <div>
                <span className="text-xs text-[#7a8091] block">{language === 'ar' ? 'المواطنون' : 'Citizens'}</span>
                <span className="text-base font-black text-white font-mono">{cmsData.stats.totalCitizens}</span>
              </div>
              <div>
                <span className="text-xs text-[#7a8091] block">{language === 'ar' ? 'الفصائل' : 'Factions'}</span>
                <span className="text-base font-black text-white font-mono">{cmsData.stats.activeFactions}</span>
              </div>
              <div>
                <span className="text-xs text-[#7a8091] block">{language === 'ar' ? 'الرضا' : 'Satisfaction'}</span>
                <span className="text-base font-black text-emerald-400 font-mono">{cmsData.stats.satisfactionRate}</span>
              </div>
              <div>
                <span className="text-xs text-[#7a8091] block">{language === 'ar' ? 'الأداء' : 'Netcode'}</span>
                <span className="text-base font-black text-[#c8874b] font-mono">{cmsData.stats.fpsPerformance}</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

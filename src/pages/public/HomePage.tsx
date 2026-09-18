import React, { useState, useEffect } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { PrimeLogo } from '../../components/common/PrimeLogo';
import { MagneticButton } from '../../components/common/MagneticButton';
import { apiClient } from '../../services/apiClient';
import { NewsItem, JobItem, ProductItem, FiveMTelemetry, FAQItem } from '../../types';
import { 
  Play, 
  MessageSquare, 
  Users, 
  Activity, 
  Shield, 
  Briefcase, 
  DollarSign, 
  Zap, 
  ArrowRight, 
  ArrowLeft,
  Crown,
  ExternalLink,
  Sparkles,
  Copy,
  Check,
  ChevronDown,
  ShoppingBag,
  HelpCircle,
  Radio,
  Flame,
  Building2,
  Terminal,
  Volume2,
  CheckCircle2,
  XCircle,
  Compass,
  Cpu,
  ShieldAlert,
  Car
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface HomePageProps {
  setCurrentTab: (tab: string) => void;
  setSelectedNewsSlug: (slug: string) => void;
  currentTab?: string;
}

export const HomePage: React.FC<HomePageProps> = ({ setCurrentTab, setSelectedNewsSlug, currentTab }) => {
  const { t, language, isRtl } = useLanguage();
  const [siteSettings, setSiteSettings] = useState<any>(null);
  const [telemetry, setTelemetry] = useState<FiveMTelemetry | null>(null);
  const [featuredNews, setFeaturedNews] = useState<NewsItem[]>([]);
  const [featuredJobs, setFeaturedJobs] = useState<JobItem[]>([]);
  const [featuredProducts, setFeaturedProducts] = useState<ProductItem[]>([]);
  const [faqs, setFaqs] = useState<FAQItem[]>([]);
  const [copiedConnect, setCopiedConnect] = useState<boolean>(false);
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);
  const [activeTabSector, setActiveTabSector] = useState<string>('police');

  // Auto-scroll to About section if requested
  useEffect(() => {
    if (currentTab === 'about') {
      const timer = setTimeout(() => {
        const el = document.getElementById('about');
        if (el) {
          el.scrollIntoView({ behavior: 'smooth' });
        }
      }, 150);
      return () => clearTimeout(timer);
    }
  }, [currentTab]);

  useEffect(() => {
    async function loadData() {
      try {
        const [settings, status, news, jobs, prods, faqData] = await Promise.all([
          apiClient.getSiteSettings().catch(() => null),
          apiClient.getFiveMStatus().catch(() => null),
          apiClient.getNews().catch(() => []),
          apiClient.getJobs().catch(() => []),
          apiClient.getProducts().catch(() => []),
          apiClient.getFAQ().catch(() => [])
        ]);
        if (settings) setSiteSettings(settings);
        if (status) setTelemetry(status);
        if (Array.isArray(news)) setFeaturedNews(news.slice(0, 3));
        if (Array.isArray(jobs)) setFeaturedJobs(jobs.slice(0, 3));
        if (Array.isArray(prods)) {
          const featured = prods.filter((p: ProductItem) => p.featured);
          setFeaturedProducts(featured.length > 0 ? featured.slice(0, 3) : prods.slice(0, 3));
        }
        if (Array.isArray(faqData)) setFaqs(faqData.slice(0, 5));
      } catch (err) {
        console.error('Failed to load home page data:', err);
      }
    }
    loadData();
  }, []);

  const isConfigured = Boolean(
    (telemetry?.ip && telemetry?.port && telemetry?.error !== 'not_configured') ||
    siteSettings?.fiveMConnectUrl
  );
  const isOnline = Boolean(telemetry?.isOnline);
  const playersCount = isOnline ? (telemetry?.playersCount ?? 0) : 0;
  const maxPlayers = telemetry?.maxPlayers || 150;
  const capacityPercent = Math.min(100, Math.round((playersCount / maxPlayers) * 100)) || 10;

  const connectCommand = telemetry?.ip && telemetry?.port 
    ? `connect ${telemetry.ip}:${telemetry.port}`
    : 'connect play.primerp.net:30120';

  const handleCopyConnect = () => {
    navigator.clipboard.writeText(connectCommand);
    setCopiedConnect(true);
    setTimeout(() => setCopiedConnect(false), 2500);
  };

  const handlePlayNow = () => {
    if (siteSettings?.fiveMConnectUrl) {
      window.location.href = siteSettings.fiveMConnectUrl;
      return;
    }
    const ip = telemetry?.ip || siteSettings?.telemetry?.ip;
    const port = telemetry?.port || siteSettings?.telemetry?.port;
    if (ip && port && telemetry?.error !== 'not_configured') {
      window.location.href = `fivem://connect/${ip}:${port}`;
      return;
    }
    setCurrentTab('players');
  };

  const ArrowIcon = isRtl ? ArrowLeft : ArrowRight;

  const citySectors = [
    {
      id: 'police',
      titleAr: 'قطاع الأمن والعدالة (LSPD & SWAT)',
      titleEn: 'Law Enforcement & Tactical SWAT',
      badgeAr: 'انضباط ونظام صارم',
      badgeEn: 'Strict Chain of Command',
      icon: Shield,
      accent: '#38BDF8',
      descAr: 'غرف عمليات تفاعلية، أجهزة MDT ذكية، دوريات شرطية وسيارات مطاردة مخصصة، مع بروتوكولات حقيقية للقبض والتحقيق.',
      descEn: 'State-of-the-art MDT terminals, tactical pursuit interceptors, official dispatch channels, and SWAT crisis operations.',
      stats: [
        { labelAr: 'الرتب الرسمية', labelEn: 'Official Ranks', val: '12+ Ranks' },
        { labelAr: 'مركبات مخصصة', labelEn: 'Tactical Fleet', val: '24+ Cruisers' },
        { labelAr: 'الحالة الحالية', labelEn: 'Active Status', val: 'Patrol Armed' }
      ],
      actionTab: 'jobs',
      actionLabelAr: 'التقديم على سلك الشرطة',
      actionLabelEn: 'Apply for Police Cadet'
    },
    {
      id: 'ems',
      titleAr: 'الخدمات الطبية والإسعاف الجوي (EMS)',
      titleEn: 'Emergency & Air Rescue Services',
      badgeAr: 'حفظ الأرواح 24/7',
      badgeEn: '24/7 Trauma Response',
      icon: Activity,
      accent: '#F43F5E',
      descAr: 'غرف إنعاش تفاعلية بمستشفى Pillbox Hill، طائرات إسعاف جوي لنقل الحالات الحرجة، ونظام علاجي متطور ومحاكاة للعمليات الجراحية.',
      descEn: 'Interactive hospital surgeries, aerial Medevac helicopters, emergency triage units, and comprehensive clinical roleplay.',
      stats: [
        { labelAr: 'طواقم الطوارئ', labelEn: 'EMS Shifts', val: '24/7 On-Duty' },
        { labelAr: 'مستشفيات مجهزة', labelEn: 'Medical Hubs', val: 'Pillbox Central' },
        { labelAr: 'الإنقاذ الجوي', labelEn: 'Air Medevac', val: 'Swift Response' }
      ],
      actionTab: 'jobs',
      actionLabelAr: 'التقديم على الإسعاف',
      actionLabelEn: 'Join Emergency Squad'
    },
    {
      id: 'business',
      titleAr: 'الشركات والاستثمار الحر',
      titleEn: 'Commerce, Real Estate & Holdings',
      badgeAr: 'اقتصاد حر متكامل',
      badgeEn: 'Sovereign Player Economy',
      icon: DollarSign,
      accent: '#E6AA38',
      descAr: 'امتلك معارض سيارات حصرية، نوادي ليلية فاخرة، كراجات تعديل احترافية، أو قصوراً مطلة على شواطئ Vinewood Hills بحرية مالية مطلقة.',
      descEn: 'Player-owned luxury dealerships, mechanic workshops, nightclubs, fine-dining restaurants, and sovereign penthouses.',
      stats: [
        { labelAr: 'الأنشطة المتاحة', labelEn: 'Enterprises', val: '35+ Businesses' },
        { labelAr: 'نظام العقارات', labelEn: 'Real Estate', val: 'Custom Interiors' },
        { labelAr: 'سوق العمل', labelEn: 'Trade Volume', val: '100% Player Run' }
      ],
      actionTab: 'store',
      actionLabelAr: 'باقات الأعمال والمتجر',
      actionLabelEn: 'Explore VIP Business'
    },
    {
      id: 'gangs',
      titleAr: 'الجريمة المنظمة وعصابات الشوارع',
      titleEn: 'Syndicates & Underworld Crews',
      badgeAr: 'صراع النفوذ والسيطرة',
      badgeEn: 'Territorial RP',
      icon: Flame,
      accent: '#A855F7',
      descAr: 'حروب نفوذ على أراضي لوس سانتوس، تخطيط لسرقات كبرى للبنوك ومحلات المجوهرات، مع التزام تام بقوانين اللعب النظيف والرول بلاي الواقعي.',
      descEn: 'Territorial turf control, intricate bank heists, underground street racing, and syndicate diplomacy governed by strict fair-play RP.',
      stats: [
        { labelAr: 'مناطق النفوذ', labelEn: 'Turf Regions', val: 'South LS & City' },
        { labelAr: 'عمليات السطو', labelEn: 'Major Heists', val: 'Pacific & Vaults' },
        { labelAr: 'قواعد الرول بلاي', labelEn: 'Fair-Play Rules', val: 'Strict NLR / FearRP' }
      ],
      actionTab: 'rules',
      actionLabelAr: 'قوانين العصابات والسرقات',
      actionLabelEn: 'Review Underworld Rules'
    }
  ];

  const currentSector = citySectors.find(s => s.id === activeTabSector) || citySectors[0];

  return (
    <div className="min-h-screen bg-[#050508] text-[#F1F3F7] relative overflow-hidden bg-hud-grid">
      
      {/* ATMOSPHERIC GLOWS */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-[700px] pointer-events-none opacity-40 z-0 bg-radial-glow" />
      <div className="absolute top-24 left-1/3 w-[600px] h-[600px] rounded-full bg-[#E6AA38]/10 blur-[160px] pointer-events-none z-0" />
      <div className="absolute top-96 right-1/4 w-[450px] h-[450px] rounded-full bg-[#00F0FF]/5 blur-[170px] pointer-events-none z-0" />

      {/* ================= BREAKING CITY WIRE TICKER ================= */}
      <div className="relative z-20 pt-24 sm:pt-28 pb-3 border-b border-[#1E2029]/80 bg-[#08080C]/80 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center gap-3 overflow-hidden text-xs">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-[#E6AA38] text-black font-black uppercase text-[10px] tracking-wider shrink-0 shadow-sm shadow-[#E6AA38]/30">
            <Radio className="w-3 h-3 animate-pulse" />
            <span>{language === 'ar' ? 'بث مباشر' : 'CITY WIRE'}</span>
          </div>
          <div className="overflow-hidden whitespace-nowrap text-[#9EA3B0] text-xs">
            <span className="inline-block animate-marquee">
              {language === 'ar'
                ? '⚡ افتتاح دفعة التقديم الجديدة لأكاديمية شرطة LSPD • نظام صوتي ثلاثي الأبعاد SaltyChat مفعّل • باقات VIP الجديدة أصبحت متاحة بالمتجر • بطولات سباقات الشوارع الرسمية هذا المساء • مرحباً بكم في مجتمع PRIME RP FiveM'
                : '⚡ LSPD Police Academy Batch #14 Now Open • SaltyChat 3.1 Spatial Voice Engine Active • New 2026 VIP Tier Packages Available • Welcome to PRIME RP FiveM Community'}
            </span>
          </div>
        </div>
      </div>

      {/* ================= HERO SECTION (RADICAL REDESIGN) ================= */}
      <section className="relative z-10 pt-10 pb-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
          
          {/* LEFT: Cinematic Copy & CTAs (7 Cols) */}
          <div className="lg:col-span-7 space-y-6 text-center lg:text-left lg:rtl:text-right">
            
            {/* Status Pill with Capacity Meter */}
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="inline-flex flex-wrap items-center gap-3 px-3.5 py-1.5 rounded-full bg-[#0A0A0F] border border-[#1E2029] text-xs shadow-xl"
            >
              <span className="flex items-center gap-1.5 font-bold">
                <span className={`w-2 h-2 rounded-full ${isOnline ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'}`} />
                <span className={isOnline ? 'text-emerald-400' : 'text-amber-400'}>
                  {isOnline ? (language === 'ar' ? 'سيرفر FiveM متصل' : 'FIVEM ONLINE') : (language === 'ar' ? 'في وضع الاستعداد' : 'FIVEM STANDBY')}
                </span>
              </span>
              <span className="text-[#333]">•</span>
              <span className="text-[#9EA3B0] flex items-center gap-1.5 font-rajdhani">
                <Users className="w-3.5 h-3.5 text-[#E6AA38]" />
                <strong className="text-white">{playersCount}</strong>
                <span>/ {maxPlayers} {language === 'ar' ? 'مواطن' : 'Citizens'}</span>
              </span>
              <span className="text-[#333] hidden sm:inline">•</span>
              <span className="hidden sm:inline-flex items-center gap-1 text-[11px] text-[#38BDF8] font-mono">
                <Zap className="w-3 h-3" />
                <span>{telemetry?.pingMs || 25}ms</span>
              </span>
            </motion.div>

            {/* Hero Main Headline */}
            <motion.h1
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-4xl sm:text-6xl md:text-7xl font-black tracking-tight text-white uppercase leading-[1.08]"
            >
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-white via-[#E1E4EC] to-[#9EA3B0]">
                {language === 'ar' ? 'عالم اللعب الواقعي' : 'THE NEXT LEVEL OF'}
              </span>
              <span className="block mt-1 gold-gradient-text drop-shadow-md">
                PRIME ROLEPLAY
              </span>
            </motion.h1>

            {/* Hero Subtitle */}
            <motion.p
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-base sm:text-lg text-[#9EA3B0] max-w-2xl mx-auto lg:mx-0 leading-relaxed"
            >
              {language === 'ar'
                ? 'المنصة الرسمية لسيرفر PRIME RP FiveM. مدينة متكاملة بأنظمة اقتصاد واقعية، وظائف حكومية بتسلسل رسمي، صوت محيطي ثلاثي الأبعاد، وحماية متطورة تضمن أعلى معايير العدالة والتنافس.'
                : 'Experience premier GTA V Roleplay engineered with custom 60-tick netcode, player-owned corporations, sovereign law enforcement, and zero compromise on performance.'}
            </motion.p>

            {/* Action Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="flex flex-wrap items-center justify-center lg:justify-start gap-4 pt-2"
            >
              <MagneticButton onClick={handlePlayNow}>
                <div className="flex items-center gap-2.5 px-8 py-4 rounded-2xl bg-gradient-to-r from-[#E6AA38] via-[#FFC857] to-[#E6AA38] text-black font-black text-sm uppercase tracking-wider hover:brightness-110 active:scale-95 transition-all shadow-xl shadow-[#E6AA38]/30 cursor-pointer">
                  <Play className="w-4 h-4 fill-current" />
                  <span>{language === 'ar' ? 'دخول السيرفر الآن' : 'Connect to FiveM'}</span>
                </div>
              </MagneticButton>

              <MagneticButton>
                <a
                  href={siteSettings?.discordUrl || 'https://discord.gg/primerp'}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-2.5 px-7 py-4 rounded-2xl bg-[#0F1017] hover:bg-[#161822] border border-[#1E2029] hover:border-[#5865F2]/80 text-white font-bold text-sm uppercase tracking-wider transition-all shadow-lg cursor-pointer"
                >
                  <MessageSquare className="w-4 h-4 text-[#5865F2]" />
                  <span>{language === 'ar' ? 'سيرفر الديسكورد' : 'Join Discord'}</span>
                </a>
              </MagneticButton>
            </motion.div>

            {/* Highlights Chips */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="grid grid-cols-3 gap-3 pt-4 max-w-lg mx-auto lg:mx-0 text-left rtl:text-right"
            >
              <div className="p-3 rounded-xl bg-[#0B0C10] border border-[#1E2029]/80">
                <div className="text-[#E6AA38] font-black text-lg font-rajdhani">60 FPS</div>
                <div className="text-[11px] text-[#777] uppercase font-bold">{language === 'ar' ? 'أداء فائق وثابت' : 'Synced Netcode'}</div>
              </div>
              <div className="p-3 rounded-xl bg-[#0B0C10] border border-[#1E2029]/80">
                <div className="text-[#38BDF8] font-black text-lg font-rajdhani">SaltyChat</div>
                <div className="text-[11px] text-[#777] uppercase font-bold">{language === 'ar' ? 'صوت ثلاثي الأبعاد' : '3D Spatial Audio'}</div>
              </div>
              <div className="p-3 rounded-xl bg-[#0B0C10] border border-[#1E2029]/80">
                <div className="text-emerald-400 font-black text-lg font-rajdhani">ANTI-CHEAT</div>
                <div className="text-[11px] text-[#777] uppercase font-bold">{language === 'ar' ? 'حماية شاملة V4' : 'Active Defense'}</div>
              </div>
            </motion.div>

          </div>

          {/* RIGHT: Live FiveM Terminal & Console Simulator (5 Cols) */}
          <div className="lg:col-span-5">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6 }}
              className="rounded-3xl bg-gradient-to-b from-[#0D0E14] via-[#090A0E] to-[#07070A] border border-[#1E2029] p-6 shadow-2xl relative cyber-corners"
            >
              {/* Terminal Title Bar */}
              <div className="flex items-center justify-between pb-4 border-b border-[#181A22] mb-5">
                <div className="flex items-center gap-2">
                  <div className="flex gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-rose-500/80" />
                    <span className="w-2.5 h-2.5 rounded-full bg-amber-500/80" />
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/80" />
                  </div>
                  <span className="text-[11px] font-mono font-bold text-[#888] ml-2 rtl:ml-0 rtl:mr-2">
                    PRIME-HUD://TERMINAL.v4
                  </span>
                </div>
                <span className="px-2 py-0.5 rounded text-[10px] font-black bg-[#E6AA38]/15 text-[#FFC857] border border-[#E6AA38]/30 font-rajdhani uppercase">
                  FIVE-M LIVE
                </span>
              </div>

              {/* Server Logo & Identity */}
              <div className="text-center py-4 flex flex-col items-center">
                <PrimeLogo size="md" variant="hero" showText={false} withGlow={true} />
                <h3 className="text-lg font-black text-white mt-3 font-rajdhani tracking-wider">
                  PRIME ROLEPLAY CITIZEN PORTAL
                </h3>
                <p className="text-xs text-[#777] mt-0.5">
                  LOS SANTOS OFFICIAL GATEWAY
                </p>
              </div>

              {/* Citizen Population Capacity Progress Bar */}
              <div className="my-4 p-4 rounded-2xl bg-[#060609] border border-[#181A22]">
                <div className="flex justify-between items-center text-xs mb-2">
                  <span className="text-[#888] flex items-center gap-1.5">
                    <Users className="w-3.5 h-3.5 text-[#E6AA38]" />
                    <span>{language === 'ar' ? 'سعة السيرفر اللحظية' : 'Live Capacity Load'}</span>
                  </span>
                  <span className="font-mono font-bold text-white">
                    {playersCount} / {maxPlayers} ({capacityPercent}%)
                  </span>
                </div>
                <div className="w-full h-2 rounded-full bg-[#15151C] overflow-hidden">
                  <div 
                    className="h-full rounded-full bg-gradient-to-r from-[#E6AA38] to-[#FFC857] transition-all duration-700 shadow-sm shadow-[#E6AA38]"
                    style={{ width: `${capacityPercent}%` }}
                  />
                </div>
              </div>

              {/* Live F8 Console Direct Connect Command */}
              <div className="space-y-2 mt-4">
                <label className="text-[11px] font-mono text-[#888] flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <Terminal className="w-3 h-3 text-[#E6AA38]" />
                    <span>{language === 'ar' ? 'أمر الاتصال عبر كونسول F8:' : 'FiveM F8 Console Launcher:'}</span>
                  </span>
                  <span className="text-[#555] text-[10px]">Press F8 in FiveM</span>
                </label>

                <div className="flex items-center gap-2 p-2 rounded-xl bg-[#060609] border border-[#181A22]">
                  <code className="text-xs text-[#E1E4EC] font-mono px-2 py-1 flex-grow select-all truncate">
                    {connectCommand}
                  </code>
                  <button
                    onClick={handleCopyConnect}
                    className="px-3 py-1.5 rounded-lg bg-[#111218] hover:bg-[#181A22] text-[#9EA3B0] hover:text-white border border-[#222] transition-all cursor-pointer shrink-0 flex items-center gap-1 text-xs font-bold"
                  >
                    {copiedConnect ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                        <span className="text-emerald-400">{language === 'ar' ? 'تم' : 'Done'}</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5 text-[#E6AA38]" />
                        <span className="text-[#FFC857]">{language === 'ar' ? 'نسخ' : 'Copy'}</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Instant Protocol Launch Button */}
              <button
                onClick={handlePlayNow}
                className="w-full mt-4 py-3 rounded-xl bg-[#151620] hover:bg-[#E6AA38] text-[#FFC857] hover:text-black border border-[#E6AA38]/30 hover:border-[#E6AA38] font-bold text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 cursor-pointer shadow-lg"
              >
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>{language === 'ar' ? 'تشغيل FiveM والانضمام مباشرة' : 'Launch Client & Connect'}</span>
              </button>

            </motion.div>
          </div>

        </div>
      </section>

      {/* ================= INTERACTIVE BENTO MATRIX: CITY SECTORS ================= */}
      <section id="about" className="py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto border-t border-[#181A22] relative z-10 scroll-mt-24">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-14">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#E6AA38]/10 text-[#FFC857] text-xs font-bold mb-3 uppercase tracking-wider border border-[#E6AA38]/20">
            <Compass className="w-3.5 h-3.5" />
            <span>{language === 'ar' ? 'اختر مسارك • قطاعات المدينة' : 'Choose Your Path • City Sectors'}</span>
          </div>
          <h2 className="text-3xl sm:text-5xl font-black text-white mb-4 uppercase tracking-tight">
            {language === 'ar' ? 'عالم واسع بمصائر متعددة' : 'Forge Your Destiny in PRIME'}
          </h2>
          <p className="text-[#9EA3B0] text-sm sm:text-base leading-relaxed">
            {language === 'ar'
              ? 'تعتمد مدينة PRIME RP على التوازن الواقعي بين السلطة، والخدمات الإنسانية، والتجارة الحرة، وصراع العصابات.'
              : 'Our city features dedicated infrastructure, custom MDTs, and deep career ladders across every walk of life.'}
          </p>
        </div>

        {/* Sector Navigation Tabs */}
        <div className="flex flex-wrap items-center justify-center gap-2 mb-8">
          {citySectors.map((sector) => {
            const active = activeTabSector === sector.id;
            const Icon = sector.icon;
            return (
              <button
                key={sector.id}
                onClick={() => setActiveTabSector(sector.id)}
                className={`flex items-center gap-2 px-5 py-3 rounded-2xl text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
                  active
                    ? 'bg-[#111218] text-white border border-[#E6AA38] shadow-lg shadow-[#E6AA38]/15'
                    : 'bg-[#08080C] text-[#888] hover:text-white border border-[#181A22] hover:border-[#282A35]'
                }`}
              >
                <Icon className="w-4 h-4" style={{ color: active ? sector.accent : undefined }} />
                <span>{language === 'ar' ? sector.titleAr.split('(')[0] : sector.titleEn.split('&')[0]}</span>
              </button>
            );
          })}
        </div>

        {/* Active Sector Showcase Card */}
        <div className="rounded-3xl bg-gradient-to-b from-[#0C0D13] to-[#07070A] border border-[#1E2029] p-6 sm:p-10 shadow-2xl relative overflow-hidden cyber-corners">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            
            <div className="lg:col-span-8 space-y-6">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-[11px] font-black uppercase tracking-wider border"
                style={{ 
                  backgroundColor: `${currentSector.accent}15`, 
                  borderColor: `${currentSector.accent}40`,
                  color: currentSector.accent 
                }}
              >
                <span>{language === 'ar' ? currentSector.badgeAr : currentSector.badgeEn}</span>
              </div>

              <h3 className="text-2xl sm:text-4xl font-black text-white">
                {language === 'ar' ? currentSector.titleAr : currentSector.titleEn}
              </h3>

              <p className="text-sm sm:text-base text-[#9EA3B0] leading-relaxed max-w-2xl">
                {language === 'ar' ? currentSector.descAr : currentSector.descEn}
              </p>

              {/* Stats bento */}
              <div className="grid grid-cols-3 gap-4 pt-2">
                {currentSector.stats.map((stat, i) => (
                  <div key={i} className="p-3.5 rounded-2xl bg-[#060609] border border-[#181A22]">
                    <div className="text-[11px] text-[#777] uppercase font-bold mb-1">
                      {language === 'ar' ? stat.labelAr : stat.labelEn}
                    </div>
                    <div className="text-sm sm:text-base font-black text-white font-rajdhani">
                      {stat.val}
                    </div>
                  </div>
                ))}
              </div>

              <div className="pt-2">
                <button
                  onClick={() => setCurrentTab(currentSector.actionTab)}
                  className="px-6 py-3.5 rounded-xl bg-gradient-to-r from-[#E6AA38] to-[#FFC857] hover:brightness-110 text-black font-black text-xs uppercase tracking-wider transition-all shadow-lg shadow-[#E6AA38]/20 flex items-center gap-2 cursor-pointer"
                >
                  <span>{language === 'ar' ? currentSector.actionLabelAr : currentSector.actionLabelEn}</span>
                  <ArrowIcon className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            <div className="lg:col-span-4 flex flex-col items-center justify-center p-6 rounded-2xl bg-[#060609]/70 border border-[#181A22] text-center">
              <div 
                className="w-20 h-20 rounded-3xl flex items-center justify-center mb-4 border"
                style={{ 
                  backgroundColor: `${currentSector.accent}15`, 
                  borderColor: `${currentSector.accent}40`,
                  color: currentSector.accent 
                }}
              >
                <currentSector.icon className="w-10 h-10" />
              </div>
              <h4 className="text-base font-bold text-white mb-1">
                {language === 'ar' ? 'نظام احترافي موثق' : 'Certified Gameplay'}
              </h4>
              <p className="text-xs text-[#777] leading-relaxed">
                {language === 'ar' 
                  ? 'تم فحص وبرمجة هذا القطاع لضمان تجربة واقعية دون أخطاء أو قلتشات تؤثر على مجريات اللعب.'
                  : 'Engineered with deep scripting, custom MLOs, and vetted by community moderators.'}
              </p>
            </div>

          </div>
        </div>

      </section>

      {/* ================= ARCHITECTURE PILLARS (STANDARDS) ================= */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto border-t border-[#181A22] relative z-10">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <h2 className="text-2xl sm:text-4xl font-black text-white uppercase tracking-tight">
            {t('features.title')}
          </h2>
          <p className="text-[#9EA3B0] text-xs sm:text-sm mt-2">
            {t('features.subtitle')}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          <div className="p-6 rounded-2xl bg-[#090A0E] border border-[#1A1C24] hover:border-[#E6AA38]/50 transition-all card-hover-lift group">
            <div className="w-12 h-12 rounded-xl bg-[#E6AA38]/10 border border-[#E6AA38]/20 flex items-center justify-center mb-4 text-[#FFC857] group-hover:scale-110 transition-transform">
              <DollarSign className="w-6 h-6" />
            </div>
            <h3 className="text-base font-black text-white mb-1.5">{t('features.economy')}</h3>
            <p className="text-xs text-[#888] leading-relaxed">{t('features.economyDesc')}</p>
          </div>

          <div className="p-6 rounded-2xl bg-[#090A0E] border border-[#1A1C24] hover:border-[#E6AA38]/50 transition-all card-hover-lift group">
            <div className="w-12 h-12 rounded-xl bg-[#E6AA38]/10 border border-[#E6AA38]/20 flex items-center justify-center mb-4 text-[#FFC857] group-hover:scale-110 transition-transform">
              <Briefcase className="w-6 h-6" />
            </div>
            <h3 className="text-base font-black text-white mb-1.5">{t('features.jobs')}</h3>
            <p className="text-xs text-[#888] leading-relaxed">{t('features.jobsDesc')}</p>
          </div>

          <div className="p-6 rounded-2xl bg-[#090A0E] border border-[#1A1C24] hover:border-[#E6AA38]/50 transition-all card-hover-lift group">
            <div className="w-12 h-12 rounded-xl bg-[#E6AA38]/10 border border-[#E6AA38]/20 flex items-center justify-center mb-4 text-[#FFC857] group-hover:scale-110 transition-transform">
              <Shield className="w-6 h-6" />
            </div>
            <h3 className="text-base font-black text-white mb-1.5">{t('features.security')}</h3>
            <p className="text-xs text-[#888] leading-relaxed">{t('features.securityDesc')}</p>
          </div>

          <div className="p-6 rounded-2xl bg-[#090A0E] border border-[#1A1C24] hover:border-[#E6AA38]/50 transition-all card-hover-lift group">
            <div className="w-12 h-12 rounded-xl bg-[#E6AA38]/10 border border-[#E6AA38]/20 flex items-center justify-center mb-4 text-[#FFC857] group-hover:scale-110 transition-transform">
              <Zap className="w-6 h-6" />
            </div>
            <h3 className="text-base font-black text-white mb-1.5">{t('features.performance')}</h3>
            <p className="text-xs text-[#888] leading-relaxed">{t('features.performanceDesc')}</p>
          </div>
        </div>
      </section>

      {/* ================= GOLDEN ROLEPLAY DIRECTIVES & FAIR PLAY ================= */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto border-t border-[#181A22] relative z-10">
        <div className="text-center max-w-3xl mx-auto mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 text-xs font-bold mb-3 uppercase tracking-wider border border-emerald-500/20">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>{language === 'ar' ? 'مبادئ اللعب النظيف' : 'Roleplay Integrity & Code'}</span>
          </div>
          <h2 className="text-2xl sm:text-4xl font-black text-white uppercase tracking-tight">
            {language === 'ar' ? 'القواعد الذهبية لتجربة رول بلاي نقية' : 'The Golden Pillars of Serious RP'}
          </h2>
          <p className="text-[#9EA3B0] text-xs sm:text-sm mt-2">
            {language === 'ar'
              ? 'نحرص في PRIME RP على بيئة لعب تحترم السيناريوهات الدرامية وتبتعد تماماً عن الفوضى.'
              : 'Fair-play standards ensure every interaction develops into memorable, character-driven storylines.'}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-6 rounded-2xl bg-[#090A0E] border border-[#1A1C24]">
            <div className="flex items-center gap-2 text-rose-400 font-black text-sm mb-3">
              <XCircle className="w-4 h-4" />
              <span>{language === 'ar' ? 'ممنوع RDM / VDM' : 'No RDM / VDM'}</span>
            </div>
            <p className="text-xs text-[#888] leading-relaxed mb-4">
              {language === 'ar'
                ? 'يُحظر منعاً باتاً قتل أي لاعب أو صدمه بالمركبة دون وجود دافع درامي وسيناريو مسبق ومبرر كامل.'
                : 'Killing or running over citizens without prior verbal interaction and legitimate storyline context is strictly forbidden.'}
            </p>
            <div className="p-2.5 rounded-lg bg-[#060609] border border-[#181A22] text-[11px] text-emerald-400 font-bold">
              ✓ {language === 'ar' ? 'الواجب: التحاور وبدء السيناريو أولاً' : 'Requirement: Verbal RP interaction first'}
            </div>
          </div>

          <div className="p-6 rounded-2xl bg-[#090A0E] border border-[#1A1C24]">
            <div className="flex items-center gap-2 text-amber-400 font-black text-sm mb-3">
              <ShieldAlert className="w-4 h-4" />
              <span>{language === 'ar' ? 'قيمة الحياة (FearRP)' : 'Fear RP & Value of Life'}</span>
            </div>
            <p className="text-xs text-[#888] leading-relaxed mb-4">
              {language === 'ar'
                ? 'عندما يتم تهديدك بسلاح من قبل عدة أشخاص، يجب أن تظهر الخوف على حياة شخصيتك وتستجيب للأوامر.'
                : 'When faced with superior armed threats, you must fear for your character\'s survival and comply with directives.'}
            </p>
            <div className="p-2.5 rounded-lg bg-[#060609] border border-[#181A22] text-[11px] text-emerald-400 font-bold">
              ✓ {language === 'ar' ? 'الواجب: الحفاظ على حياتك كأولوية' : 'Requirement: Value your life above pride'}
            </div>
          </div>

          <div className="p-6 rounded-2xl bg-[#090A0E] border border-[#1A1C24]">
            <div className="flex items-center gap-2 text-purple-400 font-black text-sm mb-3">
              <Cpu className="w-4 h-4" />
              <span>{language === 'ar' ? 'ممنوع الميتا والباور' : 'No Metagaming & Powergaming'}</span>
            </div>
            <p className="text-xs text-[#888] leading-relaxed mb-4">
              {language === 'ar'
                ? 'استخدام معلومات الديسكورد داخل اللعبة أو فرض أفعال خارقة لا يمكن للطرف الآخر التفاعل معها ممنوع قطعياً.'
                : 'Using out-of-game knowledge or forcing unrealistic actions that give opponents no counter-play is prohibited.'}
            </p>
            <div className="p-2.5 rounded-lg bg-[#060609] border border-[#181A22] text-[11px] text-emerald-400 font-bold">
              ✓ {language === 'ar' ? 'الواجب: الفصل التام بين الشخصية والواقع' : 'Requirement: Strict IC vs OOC separation'}
            </div>
          </div>
        </div>

        <div className="text-center mt-8">
          <button
            onClick={() => setCurrentTab('rules')}
            className="inline-flex items-center gap-2 text-xs font-bold text-[#E6AA38] hover:text-[#FFC857] transition-colors cursor-pointer"
          >
            <span>{language === 'ar' ? 'الاطلاع على كتاب القوانين الكامل (Rules Book)' : 'Read Full City Rules & Directives'}</span>
            <ArrowIcon className="w-3.5 h-3.5" />
          </button>
        </div>
      </section>

      {/* ================= STORE VIP PACKAGES SPOTLIGHT ================= */}
      {featuredProducts.length > 0 && (
        <section className="py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto border-t border-[#181A22] relative z-10">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-12 gap-4">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#E6AA38]/10 text-[#FFC857] text-xs font-bold mb-2 uppercase tracking-wider border border-[#E6AA38]/20">
                <Crown className="w-3.5 h-3.5" />
                <span>{language === 'ar' ? 'المتجر الرسمي' : 'Official Store'}</span>
              </div>
              <h2 className="text-3xl font-black text-white">
                {language === 'ar' ? 'باقات النخبة والمركبات الحصرية' : 'Featured VIP Packages'}
              </h2>
            </div>
            <button
              onClick={() => setCurrentTab('store')}
              className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-wider text-[#E6AA38] hover:text-[#FFC857] transition-colors cursor-pointer"
            >
              <span>{language === 'ar' ? 'تصفح المتجر بالكامل' : 'Explore Entire Store'}</span>
              <ArrowIcon className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {featuredProducts.map((product) => {
              const trans = product.translations[language] || product.translations.ar || product.translations.en;
              return (
                <div
                  key={product.id}
                  onClick={() => setCurrentTab('store')}
                  className="rounded-3xl bg-[#0A0A0F] border border-[#1E2029] hover:border-[#E6AA38]/70 p-6 flex flex-col justify-between transition-all card-hover-lift group cursor-pointer shadow-xl relative cyber-corners"
                >
                  <div>
                    <div className="h-48 rounded-2xl overflow-hidden mb-5 relative bg-[#111218]">
                      <img
                        src={product.image}
                        alt={trans.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      <div className="absolute top-3 right-3 rtl:right-auto rtl:left-3 px-2.5 py-1 rounded-lg bg-black/85 backdrop-blur-md text-[#FFC857] text-[10px] font-bold uppercase tracking-wider border border-white/10">
                        {product.category}
                      </div>
                    </div>

                    <h3 className="text-xl font-black text-white group-hover:text-[#FFC857] transition-colors mb-2">
                      {trans.name}
                    </h3>
                    <p className="text-xs text-[#888] line-clamp-2 leading-relaxed mb-4">
                      {trans.description}
                    </p>
                  </div>

                  <div className="pt-4 border-t border-[#181A22] flex items-center justify-between">
                    <div>
                      <span className="text-[10px] text-[#666] block font-bold uppercase tracking-wider">
                        {language === 'ar' ? 'السعر' : 'Price'}
                      </span>
                      <span className="text-2xl font-black text-[#FFC857] font-rajdhani">
                        ${product.price} <span className="text-xs font-normal text-[#888]">{product.currency}</span>
                      </span>
                    </div>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setCurrentTab('store');
                      }}
                      className="px-4 py-2.5 rounded-xl bg-[#111218] hover:bg-[#E6AA38] text-[#FFC857] hover:text-black text-xs font-bold uppercase tracking-wider transition-all border border-[#222] hover:border-[#E6AA38] flex items-center gap-1.5 cursor-pointer shadow-md"
                    >
                      <ShoppingBag className="w-3.5 h-3.5" />
                      <span>{language === 'ar' ? 'عرض الحزمة' : 'View Package'}</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* ================= CAREERS / VACANCIES PREVIEW ================= */}
      {featuredJobs.length > 0 && (
        <section className="py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto border-t border-[#181A22] relative z-10">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-12 gap-4">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#E6AA38]/10 text-[#FFC857] text-xs font-bold mb-2 uppercase tracking-wider border border-[#E6AA38]/20">
                <Briefcase className="w-3.5 h-3.5" />
                <span>Careers & Recruitment</span>
              </div>
              <h2 className="text-3xl font-black text-white">{t('jobs.title')}</h2>
            </div>
            <button
              onClick={() => setCurrentTab('jobs')}
              className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-wider text-[#E6AA38] hover:text-[#FFC857] transition-colors cursor-pointer"
            >
              <span>{language === 'ar' ? 'استعراض كافة الوظائف الشاغرة' : 'View All Opportunities'}</span>
              <ArrowIcon className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {featuredJobs.map((job) => {
              const trans = job.translations[language] || job.translations.ar;
              return (
                <div
                  key={job.id}
                  className="rounded-3xl bg-[#0A0A0F] border border-[#1E2029] hover:border-[#E6AA38]/60 p-6 flex flex-col justify-between transition-all card-hover-lift group"
                >
                  <div className="space-y-4">
                    <div className="flex justify-between items-start">
                      <span className="px-2.5 py-1 rounded-lg bg-[#111218] text-[#FFC857] text-[10px] font-bold uppercase tracking-wider border border-[#222]">
                        {job.category}
                      </span>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        job.status === 'HIRING_OPEN'
                          ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                          : 'bg-[#181A22] text-[#888]'
                      }`}>
                        {job.status === 'HIRING_OPEN' ? (language === 'ar' ? 'التقديم متاح' : 'Hiring Active') : (language === 'ar' ? 'مغلق مؤقتاً' : 'Closed')}
                      </span>
                    </div>

                    <h3 className="text-xl font-black text-white group-hover:text-[#FFC857] transition-colors">
                      {trans.name}
                    </h3>

                    <p className="text-xs text-[#888] line-clamp-3 leading-relaxed">
                      {trans.description}
                    </p>

                    <div className="pt-2">
                      <span className="text-xs text-[#666] block mb-0.5">
                        {language === 'ar' ? 'الراتب التقديري:' : 'Hourly Wage:'}
                      </span>
                      <span className="text-lg font-black text-[#FFC857] font-rajdhani">
                        ${job.salaryMin} - ${job.salaryMax} / hr
                      </span>
                    </div>
                  </div>

                  <div className="pt-6 border-t border-[#181A22] mt-4">
                    <button
                      onClick={() => setCurrentTab('jobs')}
                      className="w-full py-3 rounded-xl bg-[#111218] hover:bg-[#181A22] text-white text-xs font-bold uppercase tracking-wider transition-all border border-[#222] hover:border-[#E6AA38] cursor-pointer flex items-center justify-center gap-2"
                    >
                      <span>{language === 'ar' ? 'تفاصيل التقديم' : 'Application Portal'}</span>
                      <ArrowIcon className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* ================= COMMUNITY FAQ ACCORDION ================= */}
      {faqs.length > 0 && (
        <section className="py-24 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto border-t border-[#181A22] relative z-10">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#E6AA38]/10 text-[#FFC857] text-xs font-bold mb-3 uppercase tracking-wider border border-[#E6AA38]/20">
              <HelpCircle className="w-3.5 h-3.5" />
              <span>{t('nav.faq')}</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-black text-white mb-3 uppercase tracking-tight">
              {language === 'ar' ? 'الأسئلة الشائعة وإرشادات الانضمام' : 'Frequently Asked Questions'}
            </h2>
            <p className="text-[#9EA3B0] text-xs sm:text-sm">
              {language === 'ar'
                ? 'إجابات شاملة لأبرز أسئلة اللاعبين الجدد حول خطوات الانضمام وحل مشاكل الاتصال.'
                : 'Direct instructions on whitelisting, keybinds, and FiveM connection setup.'}
            </p>
          </div>

          <div className="space-y-3">
            {faqs.map((faq, idx) => {
              const trans = faq.translations[language] || faq.translations.ar || faq.translations.en;
              const isOpen = openFaqIndex === idx;
              return (
                <div
                  key={faq.id}
                  className={`rounded-2xl border transition-all overflow-hidden ${
                    isOpen ? 'bg-[#0A0A0F] border-[#E6AA38]/40 shadow-lg' : 'bg-[#08080C] border-[#181A22] hover:border-[#282A35]'
                  }`}
                >
                  <button
                    onClick={() => setOpenFaqIndex(isOpen ? null : idx)}
                    className="w-full p-5 text-left rtl:text-right flex items-center justify-between gap-4 cursor-pointer"
                  >
                    <span className="font-bold text-sm text-white">{trans.question}</span>
                    <ChevronDown className={`w-4 h-4 text-[#E6AA38] shrink-0 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
                  </button>
                  <AnimatePresence>
                    {isOpen && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.25 }}
                        className="overflow-hidden"
                      >
                        <div className="p-5 pt-0 text-xs text-[#9EA3B0] leading-relaxed border-t border-[#151620]">
                          {trans.answer}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </div>

          <div className="text-center mt-8">
            <button
              onClick={() => setCurrentTab('faq')}
              className="inline-flex items-center gap-2 text-xs font-bold text-[#E6AA38] hover:text-[#FFC857] transition-colors cursor-pointer"
            >
              <span>{language === 'ar' ? 'عرض كافة الأسئلة الشائعة' : 'View full knowledge base'}</span>
              <ArrowIcon className="w-3.5 h-3.5" />
            </button>
          </div>
        </section>
      )}

      {/* ================= COMMUNITY DISCORD CITADEL ================= */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto border-t border-[#181A22] relative z-10">
        <div className="rounded-3xl bg-gradient-to-r from-[#0C0D14] via-[#10121C] to-[#0C0D14] border border-[#1E2029] p-8 sm:p-14 text-center relative overflow-hidden shadow-2xl cyber-corners">
          <div className="absolute top-0 right-0 w-96 h-96 bg-[#5865F2]/10 blur-[110px] pointer-events-none rounded-full" />
          <div className="absolute bottom-0 left-0 w-80 h-80 bg-[#E6AA38]/10 blur-[110px] pointer-events-none rounded-full" />

          <div className="relative z-10 max-w-3xl mx-auto space-y-6">
            <span className="w-14 h-14 rounded-2xl bg-[#5865F2]/15 border border-[#5865F2]/30 flex items-center justify-center mx-auto text-[#5865F2] shadow-xl shadow-[#5865F2]/10">
              <MessageSquare className="w-7 h-7" />
            </span>

            <h2 className="text-3xl sm:text-5xl font-black text-white tracking-tight uppercase">
              {language === 'ar' ? 'مجتمع النخبة في ديسكورد' : 'The Official Discord Citadel'}
            </h2>

            <p className="text-sm sm:text-base text-[#9EA3B0] leading-relaxed max-w-xl mx-auto">
              {language === 'ar'
                ? 'انضم إلى آلاف المواطنين والضباط والمسعفين، وشارك في الفعاليات الأسبوعية، وتابع الإعلانات الحصرية أولاً بأول.'
                : 'Connect with active citizens, register your character backstory, participate in official community votes, and stay connected with staff.'}
            </p>

            <div className="pt-2 flex flex-wrap justify-center items-center gap-4">
              <a
                href={siteSettings?.discordUrl || 'https://discord.gg/primerp'}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2.5 px-8 py-4 rounded-2xl bg-[#5865F2] hover:bg-[#4752C4] active:scale-95 text-white font-black text-xs uppercase tracking-wider transition-all shadow-xl shadow-[#5865F2]/30 cursor-pointer"
              >
                <span>{language === 'ar' ? 'الانضمام لسيرفر الديسكورد' : 'Connect to Discord Server'}</span>
                <ExternalLink className="w-4 h-4" />
              </a>

              <button
                onClick={() => setCurrentTab('support')}
                className="inline-flex items-center gap-2 px-6 py-4 rounded-2xl bg-[#111218] hover:bg-[#181A22] border border-[#222] text-[#E1E4EC] font-bold text-xs uppercase tracking-wider transition-all cursor-pointer"
              >
                <span>{language === 'ar' ? 'مركز الدعم الفني' : 'Support Desk'}</span>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ================= FINAL LAUNCH COMMAND CALL TO ACTION ================= */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto text-center relative z-10">
        <h2 className="text-3xl sm:text-6xl font-black text-white mb-6 uppercase tracking-tight">
          {language === 'ar' ? 'ابدأ رحلتك في مدينة PRIME RP' : 'Your Journey Begins in PRIME'}
        </h2>
        <p className="text-sm sm:text-base text-[#9EA3B0] max-w-xl mx-auto mb-10 leading-relaxed">
          {language === 'ar'
            ? 'سيرفر رول بلاي متكامل بنظام مواطنة موثق ومجتمع شغوف. شغّل FiveM وانضم إلى أفضل تجربة لعب واقعي الآن.'
            : 'Unrivaled roleplay standard, sovereign judicial system, and living economy. Launch FiveM and claim your citizen status.'}
        </p>

        <div className="flex flex-wrap items-center justify-center gap-4">
          <MagneticButton onClick={handlePlayNow}>
            <div className="flex items-center justify-center gap-2.5 px-8 py-4 rounded-2xl bg-gradient-to-r from-[#E6AA38] via-[#FFC857] to-[#E6AA38] text-black font-black text-xs uppercase tracking-wider hover:brightness-110 active:scale-95 transition-all shadow-xl shadow-[#E6AA38]/30 cursor-pointer">
              <Play className="w-4 h-4 fill-current" />
              <span>{language === 'ar' ? 'دخول السيرفر الآن' : 'Connect to Server'}</span>
            </div>
          </MagneticButton>

          <button
            onClick={() => setCurrentTab('jobs')}
            className="flex items-center justify-center gap-2.5 px-7 py-4 rounded-2xl bg-[#0F1017] hover:bg-[#161822] border border-[#1E2029] hover:border-[#E6AA38] text-white font-bold text-xs uppercase tracking-wider transition-all cursor-pointer"
          >
            <Briefcase className="w-4 h-4 text-[#FFC857]" />
            <span>{language === 'ar' ? 'تقديم على وظيفة' : 'Careers & Roles'}</span>
          </button>
        </div>
      </section>

    </div>
  );
};

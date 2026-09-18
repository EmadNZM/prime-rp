import React, { useState, useEffect } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import { PrimeLogo } from '../../components/common/PrimeLogo';
import { MagneticButton } from '../../components/common/MagneticButton';
import { apiClient } from '../../services/apiClient';
import { NewsItem, JobItem, ProductItem, FiveMTelemetry, FAQItem } from '../../types';
import { 
  Play, 
  MessageSquare, 
  Users, 
  Shield, 
  Briefcase, 
  DollarSign, 
  Zap, 
  ArrowRight, 
  ArrowLeft,
  Crown,
  ExternalLink,
  Copy,
  Check,
  ChevronDown,
  ShoppingBag,
  HelpCircle,
  Radio,
  Flame,
  Activity,
  Terminal,
  Volume2,
  CheckCircle2,
  XCircle,
  Compass,
  Cpu,
  ShieldAlert,
  Server,
  Layers,
  ChevronRight,
  Headphones,
  Car,
  Sparkles,
  Award,
  Globe2,
  User,
  Wallet,
  CreditCard,
  Key,
  FileText,
  Gavel,
  Wrench,
  BadgeCheck
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface HomePageProps {
  setCurrentTab: (tab: string) => void;
  setSelectedNewsSlug: (slug: string) => void;
  currentTab?: string;
}

export const HomePage: React.FC<HomePageProps> = ({ setCurrentTab, setSelectedNewsSlug, currentTab }) => {
  const { t, language, isRtl } = useLanguage();
  const { addToCart } = useCart();
  const { user, isAuthenticated } = useAuth();
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
          setFeaturedProducts(featured.length > 0 ? featured.slice(0, 4) : prods.slice(0, 4));
        }
        if (Array.isArray(faqData)) setFaqs(faqData.slice(0, 6));
      } catch (err) {
        console.error('Failed to load home page data:', err);
      }
    }
    loadData();
  }, []);

  const isOnline = Boolean(telemetry?.online || (telemetry?.playersCount !== undefined && telemetry?.playersCount > 0));
  const playersCount = isOnline ? (telemetry?.playersCount ?? 0) : 0;
  const maxPlayers = telemetry?.maxPlayers || 150;
  const capacityPercent = Math.min(100, Math.round((playersCount / maxPlayers) * 100)) || 15;

  const connectTarget = telemetry?.ip && telemetry?.port 
    ? `${telemetry.ip}:${telemetry.port}`
    : 'play.primerp.net:30120';
  const connectCommand = `connect ${connectTarget}`;

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
    window.location.href = `fivem://connect/${connectTarget}`;
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
      accent: '#38bdf8',
      image: 'https://images.unsplash.com/photo-1541872703-74c5e44368f9?auto=format&fit=crop&w=800&q=80',
      roleAr: 'ضابط أمن / قائد فرقة التدخل السريع',
      roleEn: 'Patrol Sergeant / Tactical Lead',
      descAr: 'غرف عمليات تفاعلية، أجهزة MDT ذكية، دوريات شرطية وسيارات مطاردة مخصصة، مع بروتوكولات حقيقية للقبض والتحقيق ومحاكمات عادلة.',
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
      accent: '#f43f5e',
      image: 'https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?auto=format&fit=crop&w=800&q=80',
      roleAr: 'طبيب جراح / مسعف إنقاذ جوي',
      roleEn: 'Trauma Surgeon / Medevac Flight',
      descAr: 'غرف إنعاش تفاعلية بمستشفى Pillbox Hill، طائرات إسعاف جوي لنقل الحالات الحرجة، ونظام علاجي متطور ومحاكاة للعمليات الجراحية الميدانية.',
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
      accent: '#c8874b',
      image: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=800&q=80',
      roleAr: 'رجل أعمال / مستثمر عقارات',
      roleEn: 'Corporate Tycoon / Dealership Owner',
      descAr: 'امتلك معارض سيارات حصرية، نوادي ليلية فاخرة، كراجات تعديل احترافية، أو قصوراً مطلة على شواطئ Vinewood Hills بحرية مالية مطلقة واستثمار مستمر.',
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
      accent: '#a855f7',
      image: 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&w=800&q=80',
      roleAr: 'زعيم تنظيم / قائد عائلة مافيا',
      roleEn: 'Syndicate Don / Underworld Enforcer',
      descAr: 'حروب نفوذ على أراضي لوس سانتوس، تخطيط لسرقات كبرى للبنوك ومحلات المجوهرات، مع التزام تام بقوانين اللعب النظيف والرول بلاي الواقعي والنظام الداخلي.',
      descEn: 'Territorial turf control, intricate bank heists, underground street racing, and syndicate diplomacy governed by strict fair-play RP.',
      stats: [
        { labelAr: 'مناطق النفوذ', labelEn: 'Turf Regions', val: 'South LS & City' },
        { labelAr: 'عمليات السطو', labelEn: 'Major Heists', val: 'Pacific & Vaults' },
        { labelAr: 'قواعد الرول بلاي', labelEn: 'Fair-Play Rules', val: 'Strict NLR / FearRP' }
      ],
      actionTab: 'rules',
      actionLabelAr: 'قوانين العصابات والسرقات',
      actionLabelEn: 'Review Underworld Rules'
    },
    {
      id: 'racing',
      titleAr: 'سباقات الشوارع والتعديل (Underground)',
      titleEn: 'Midnight Drift & Performance Tuners',
      badgeAr: 'سرعة وتحكم احترافي',
      badgeEn: 'Midnight Underground Culture',
      icon: Car,
      accent: '#eab308',
      image: 'https://images.unsplash.com/photo-1617814076367-b759c7d7e738?auto=format&fit=crop&w=800&q=80',
      roleAr: 'سائق سباقات / ميكانيكي محترف',
      roleEn: 'Tuner Specialist / Street Racer',
      descAr: 'كراجات تعديل احترافية مع شيبات وتيربو مخصص، سباقات شوارع ليلية مع مراهنات وسيارات معدلة يدوياً بأحدث أصوات محركات GTA الواقعية.',
      descEn: 'Custom ECU engine tuning, dyno testing, midnight drift meets, pink-slip wagers, and bespoke automotive fabrication.',
      stats: [
        { labelAr: 'كراجات التعديل', labelEn: 'Tuning Hubs', val: 'Bennys & LS' },
        { labelAr: 'حلبات السباق', labelEn: 'Drift Routes', val: '18+ Courses' },
        { labelAr: 'السرعة القصوى', labelEn: 'Tuned Velocity', val: 'Uncapped Dyno' }
      ],
      actionTab: 'store',
      actionLabelAr: 'استعراض سيارات المتجر',
      actionLabelEn: 'View Tuned Imports'
    },
    {
      id: 'doj',
      titleAr: 'القضاء والعدالة (DOJ & Legal)',
      titleEn: 'Department of Justice & Judicial Council',
      badgeAr: 'سيادة القانون والعدل',
      badgeEn: 'Fair Trial & Due Process',
      icon: Gavel,
      accent: '#10b981',
      image: 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?auto=format&fit=crop&w=800&q=80',
      roleAr: 'قاضي المحكمة العليا / محامي دفاع',
      roleEn: 'Supreme Judge / Defense Attorney',
      descAr: 'جلسات محاكمة علنية في قصر العدل، استصدار مذكرات التفتيش والاعتقال، ومرافعات قانونية تحمي حقوق المواطنين وتضمن عدالة السيناريوهات.',
      descEn: 'Courtroom trials, search warrant authorizations, bail hearings, civil arbitration, and sovereign constitutional law.',
      stats: [
        { labelAr: 'قاعات المحاكم', labelEn: 'Courtrooms', val: 'Central Hall' },
        { labelAr: 'مذكرات الضبط', labelEn: 'Legal Warrants', val: 'MDT Integrated' },
        { labelAr: 'الحصانة', labelEn: 'Judicial Immunity', val: 'Constitution' }
      ],
      actionTab: 'rules',
      actionLabelAr: 'الاطلاع على القوانين',
      actionLabelEn: 'Explore Penal Code'
    }
  ];

  const currentSector = citySectors.find(s => s.id === activeTabSector) || citySectors[0];

  return (
    <div className="min-h-screen bg-[#08090d] text-[#f1f3f7] relative overflow-hidden">
      
      {/* ATMOSPHERIC BACKGROUND (Obsidian Canvas + Radial Copper Aurora) */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-[850px] pointer-events-none z-0 overflow-hidden">
        <div className="w-full h-full bg-copper-glow-radial opacity-70" />
        <div className="absolute top-10 left-1/2 -translate-x-1/2 w-[700px] h-[450px] rounded-full bg-[#c8874b]/12 blur-[140px]" />
        <div className="absolute top-64 right-10 w-[350px] h-[350px] rounded-full bg-[#df9f64]/8 blur-[120px]" />
      </div>
      
      {/* Subtle Background Mesh Grid */}
      <div className="absolute inset-0 bg-mesh-grid pointer-events-none opacity-30 z-0" />

      {/* ================= HERO SECTION ================= */}
      <section className="relative z-10 pt-32 sm:pt-40 pb-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center">
          
          {/* LEFT: Cinematic Copy & High-Impact CTAs (7 Cols) */}
          <div className="lg:col-span-7 space-y-6 text-center lg:text-left lg:rtl:text-right">
            
            {/* Live Server Telemetry Pill with Pulsing Signal */}
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
              className="inline-flex flex-wrap items-center gap-2.5 px-4 py-2 rounded-full bg-[#0d0f16]/90 border border-white/[0.08] hover:border-[#c8874b]/40 text-xs shadow-lg backdrop-blur-xl transition-colors"
            >
              <span className="flex items-center gap-2 font-bold">
                <span className="relative flex h-2.5 w-2.5">
                  <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${isOnline ? 'bg-emerald-400' : 'bg-amber-400'}`} />
                  <span className={`relative inline-flex rounded-full h-2.5 w-2.5 ${isOnline ? 'bg-emerald-500' : 'bg-amber-500'}`} />
                </span>
                <span className={isOnline ? 'text-emerald-400' : 'text-amber-400'}>
                  {isOnline ? (language === 'ar' ? 'السيرفر متصل الآن' : 'SERVER ONLINE') : (language === 'ar' ? 'في وضع الاستعداد' : 'FIVEM STANDBY')}
                </span>
              </span>
              <span className="text-white/20">•</span>
              <span className="text-[#969cad] flex items-center gap-1.5 font-rajdhani">
                <Users className="w-3.5 h-3.5 text-[#c8874b]" />
                <strong className="text-white font-bold">{playersCount}</strong>
                <span>/ {maxPlayers} {language === 'ar' ? 'مواطن' : 'Citizens'}</span>
              </span>
              <span className="text-white/20 hidden sm:inline">•</span>
              <span className="hidden sm:inline-flex items-center gap-1 text-[11px] text-[#df9f64] font-mono">
                <Zap className="w-3 h-3" />
                <span>{telemetry?.pingMs || 24}ms</span>
              </span>
            </motion.div>

            {/* Hero Main Headline (Matching Poster Mockup 1) */}
            <motion.h1
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.08 }}
              className="text-4xl sm:text-6xl md:text-7xl font-black tracking-tight text-white uppercase leading-[1.04]"
            >
              <span className="block text-white">
                {language === 'ar' ? 'مدينة صُنعت لأجلك' : 'A CITY BUILT BY YOU'}
              </span>
              <span className="block mt-1.5 copper-gradient-text drop-shadow-[0_4px_30px_rgba(200,135,75,0.28)] font-rajdhani">
                {language === 'ar' ? 'عصر جديد • واقع لا مثيل له' : 'A NEW ERA • A REALER WORLD'}
              </span>
            </motion.h1>

            {/* Poster Tagline Quote */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.12 }}
              className="inline-block text-xs sm:text-sm italic text-[#df9f64] font-serif border-l-2 rtl:border-l-0 rtl:border-r-2 border-[#c8874b] px-3 py-0.5"
            >
              &ldquo;{language === 'ar' ? 'أكثر من مجرد سيرفر.. إنه مجتمع متكامل.' : 'More Than a Server, A Community.'}&rdquo;
            </motion.div>

            {/* Hero Subtitle */}
            <motion.p
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.16 }}
              className="text-base sm:text-lg text-[#969cad] max-w-2xl mx-auto lg:mx-0 leading-relaxed font-normal"
            >
              {language === 'ar'
                ? 'مدينة حية متكاملة بُنيت بعناية لعشاق اللعب الواقعي الجاد. نظام اقتصادي متوازن، وظائف رسمية بمحاكاة كاملة، صوت ثلاثي الأبعاد محيطي، وأداء ثابت يضمن تجربة خالية من التقطيع.'
                : 'A living, breathing metropolis built for authentic storylines, dedicated community, custom MDT systems, 3D spatial radio, and seamless 60 FPS netcode.'}
            </motion.p>

            {/* Action Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.24 }}
              className="flex flex-wrap items-center justify-center lg:justify-start gap-4 pt-2"
            >
              <MagneticButton onClick={handlePlayNow}>
                <div className="flex items-center gap-2.5 px-8 py-4 rounded-xl bg-[#c8874b] hover:bg-[#df9f64] text-black font-black text-sm uppercase tracking-wider active:scale-95 transition-all shadow-[0_10px_30px_rgba(200,135,75,0.35)] cursor-pointer">
                  <Play className="w-4 h-4 fill-current" />
                  <span>{language === 'ar' ? 'دخول السيرفر الآن' : 'Connect to Server'}</span>
                </div>
              </MagneticButton>

              <MagneticButton>
                <a
                  href={siteSettings?.discordUrl || 'https://discord.gg/primerp'}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-2.5 px-7 py-4 rounded-xl bg-[#0d0f16] hover:bg-[#131620] border border-white/[0.08] hover:border-[#5865F2]/80 text-white font-bold text-sm uppercase tracking-wider transition-all shadow-lg cursor-pointer"
                >
                  <MessageSquare className="w-4 h-4 text-[#5865F2]" />
                  <span>{language === 'ar' ? 'مجتمع الديسكورد' : 'Join Discord'}</span>
                </a>
              </MagneticButton>
            </motion.div>

            {/* Highlights Bar */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.32 }}
              className="grid grid-cols-3 gap-3 pt-4 max-w-lg mx-auto lg:mx-0 text-left rtl:text-right"
            >
              <div className="p-3.5 rounded-xl bg-[#0d0f16] border border-white/[0.06] hover:border-[#c8874b]/30 transition-colors">
                <div className="text-[#c8874b] font-black text-lg font-rajdhani">60 FPS</div>
                <div className="text-[11px] text-[#7a8091] uppercase font-bold">{language === 'ar' ? 'أداء فائق وثابت' : 'Ultra Performance'}</div>
              </div>
              <div className="p-3.5 rounded-xl bg-[#0d0f16] border border-white/[0.06] hover:border-[#c8874b]/30 transition-colors">
                <div className="text-[#df9f64] font-black text-lg font-rajdhani">SaltyChat</div>
                <div className="text-[11px] text-[#7a8091] uppercase font-bold">{language === 'ar' ? 'صوت ثلاثي الأبعاد' : '3D Spatial Audio'}</div>
              </div>
              <div className="p-3.5 rounded-xl bg-[#0d0f16] border border-white/[0.06] hover:border-emerald-500/30 transition-colors">
                <div className="text-emerald-400 font-black text-lg font-rajdhani">ACTIVE V4</div>
                <div className="text-[11px] text-[#7a8091] uppercase font-bold">{language === 'ar' ? 'حماية شاملة' : 'Anti-Cheat Shield'}</div>
              </div>
            </motion.div>

          </div>

          {/* RIGHT: Live FiveM Server Telemetry Hub */}
          <div className="lg:col-span-5">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
              className="rounded-2xl bg-[#0d0f16] border border-white/[0.08] hover:border-[#c8874b]/40 p-6 sm:p-7 shadow-2xl relative overflow-hidden transition-all duration-300"
            >
              {/* Header */}
              <div className="flex items-center justify-between pb-4 border-b border-white/[0.06] mb-5">
                <div className="flex items-center gap-2">
                  <Server className="w-4 h-4 text-[#c8874b]" />
                  <span className="text-xs font-bold uppercase tracking-wider text-white">
                    {language === 'ar' ? 'معلومات السيرفر المباشرة' : 'FiveM Server Node'}
                  </span>
                </div>
                <span className="px-2.5 py-0.5 rounded-md text-[10px] font-black bg-[#c8874b]/15 text-[#df9f64] border border-[#c8874b]/30 font-rajdhani uppercase">
                  ACTIVE 2026
                </span>
              </div>

              {/* Logo & Server Name */}
              <div className="text-center py-3 flex flex-col items-center">
                <PrimeLogo size="md" variant="hero" showText={false} withGlow={true} />
                <h3 className="text-base font-black text-white mt-3 font-rajdhani tracking-wider">
                  PRIME ROLEPLAY • LOS SANTOS
                </h3>
                <p className="text-xs text-[#7a8091] mt-0.5">
                  Official Whitelisted & Public Citizen Portal
                </p>
              </div>

              {/* Capacity Progress Bar */}
              <div className="my-4 p-4 rounded-xl bg-[#08090d] border border-white/[0.05]">
                <div className="flex justify-between items-center text-xs mb-2">
                  <span className="text-[#969cad] flex items-center gap-1.5">
                    <Users className="w-3.5 h-3.5 text-[#c8874b]" />
                    <span>{language === 'ar' ? 'سعة السيرفر اللحظية' : 'Current Player Load'}</span>
                  </span>
                  <span className="font-mono font-bold text-white">
                    {playersCount} / {maxPlayers} ({capacityPercent}%)
                  </span>
                </div>
                <div className="w-full h-2 rounded-full bg-[#131620] overflow-hidden">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${capacityPercent}%` }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                    className="h-full rounded-full bg-gradient-to-r from-[#9e6331] via-[#c8874b] to-[#df9f64] shadow-sm shadow-[#c8874b]"
                  />
                </div>
              </div>

              {/* F8 Console Command Box */}
              <div className="space-y-2 mt-4">
                <label className="text-[11px] font-mono text-[#969cad] flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <Terminal className="w-3.5 h-3.5 text-[#c8874b]" />
                    <span>{language === 'ar' ? 'أمر الاتصال عبر كونسول F8:' : 'FiveM F8 Command:'}</span>
                  </span>
                  <span className="text-[#666] text-[10px]">Press F8 in FiveM</span>
                </label>

                <div className="flex items-center gap-2 p-2 rounded-xl bg-[#08090d] border border-white/[0.06]">
                  <code className="text-xs text-[#f1f3f7] font-mono px-2 py-1 flex-grow select-all truncate">
                    {connectCommand}
                  </code>
                  <button
                    onClick={handleCopyConnect}
                    className="px-3 py-1.5 rounded-lg bg-[#131620] hover:bg-[#1c202d] text-[#969cad] hover:text-white border border-white/[0.08] transition-all cursor-pointer shrink-0 flex items-center gap-1 text-xs font-bold"
                  >
                    {copiedConnect ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                        <span className="text-emerald-400">{language === 'ar' ? 'تم النسخ' : 'Copied'}</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5 text-[#c8874b]" />
                        <span className="text-[#df9f64]">{language === 'ar' ? 'نسخ' : 'Copy'}</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Instant Protocol Launch Button */}
              <button
                onClick={handlePlayNow}
                className="w-full mt-4 py-3 rounded-xl bg-[#131620] hover:bg-[#c8874b] text-[#df9f64] hover:text-black border border-[#c8874b]/30 hover:border-[#c8874b] font-bold text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 cursor-pointer shadow-lg"
              >
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>{language === 'ar' ? 'تشغيل FiveM والدخول مباشرة' : 'Launch Client & Connect'}</span>
              </button>

            </motion.div>
          </div>

        </div>
      </section>

      {/* ================= ONBOARDING: HOW TO JOIN (3 STEPS) ================= */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto border-t border-white/[0.06] relative z-10">
        <div className="text-center max-w-2xl mx-auto mb-14">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#c8874b]/10 text-[#df9f64] text-xs font-bold mb-3 uppercase tracking-wider border border-[#c8874b]/20">
            <Layers className="w-3.5 h-3.5" />
            <span>{language === 'ar' ? 'دليل الانضمام السريع' : 'Getting Started • 3 Steps'}</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-black text-white uppercase tracking-tight">
            {language === 'ar' ? 'كيف تبدأ مسيرتك في المدينة؟' : 'How to Join Prime Roleplay'}
          </h2>
          <p className="text-[#969cad] text-xs sm:text-sm mt-2">
            {language === 'ar'
              ? 'خطوات بسيطة وواضحة تضمن دخولك السلس وبدء صناعة قصة شخصيتك.'
              : 'Follow these essential steps to connect and start your journey.'}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* Step 1 */}
          <div className="p-7 rounded-2xl bg-[#0d0f16] border border-white/[0.06] hover:border-[#c8874b]/50 transition-all card-hover-lift group">
            <div className="flex items-center justify-between mb-5">
              <span className="text-2xl font-black text-[#c8874b] font-rajdhani">01</span>
              <span className="p-2.5 rounded-xl bg-[#131620] text-[#5865F2]">
                <MessageSquare className="w-5 h-5" />
              </span>
            </div>
            <h3 className="text-lg font-black text-white mb-2">
              {language === 'ar' ? 'انضم لديسكورد السيرفر' : 'Join Official Discord'}
            </h3>
            <p className="text-xs text-[#969cad] leading-relaxed mb-5">
              {language === 'ar'
                ? 'توجه إلى سيرفر الديسكورد للتوثيق، واستلام رتبة المواطن، وقراءة آخر التحديثات والإعلانات الرسمية.'
                : 'Join our Discord guild, verify your citizen role, and gain full access to announcements and support.'}
            </p>
            <a
              href={siteSettings?.discordUrl || 'https://discord.gg/primerp'}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-[#c8874b] group-hover:text-[#df9f64] transition-colors"
            >
              <span>{language === 'ar' ? 'الانضمام لديسكورد' : 'Discord Server'}</span>
              <ArrowIcon className="w-3.5 h-3.5" />
            </a>
          </div>

          {/* Step 2 */}
          <div className="p-7 rounded-2xl bg-[#0d0f16] border border-white/[0.06] hover:border-[#c8874b]/50 transition-all card-hover-lift group">
            <div className="flex items-center justify-between mb-5">
              <span className="text-2xl font-black text-[#c8874b] font-rajdhani">02</span>
              <span className="p-2.5 rounded-xl bg-[#131620] text-[#df9f64]">
                <Headphones className="w-5 h-5" />
              </span>
            </div>
            <h3 className="text-lg font-black text-white mb-2">
              {language === 'ar' ? 'إعداد SaltyChat والصوت' : 'Install SaltyChat Voice'}
            </h3>
            <p className="text-xs text-[#969cad] leading-relaxed mb-5">
              {language === 'ar'
                ? 'نظام صوتي واقعي ثلاثي الأبعاد مع قنوات راديو لاسلكية للشرطة والمسعفين وتأثيرات الصدى داخل المباني.'
                : 'Download SaltyChat plugin for TeamSpeak 3 to enable 3D positional audio and realistic radio frequencies.'}
            </p>
            <button
              onClick={() => setCurrentTab('faq')}
              className="inline-flex items-center gap-1.5 text-xs font-bold text-[#c8874b] group-hover:text-[#df9f64] transition-colors cursor-pointer"
            >
              <span>{language === 'ar' ? 'دليل إعداد الصوت' : 'Voice Setup Guide'}</span>
              <ArrowIcon className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Step 3 */}
          <div className="p-7 rounded-2xl bg-[#0d0f16] border border-white/[0.06] hover:border-[#c8874b]/50 transition-all card-hover-lift group">
            <div className="flex items-center justify-between mb-5">
              <span className="text-2xl font-black text-[#c8874b] font-rajdhani">03</span>
              <span className="p-2.5 rounded-xl bg-[#131620] text-emerald-400">
                <Play className="w-5 h-5 fill-current" />
              </span>
            </div>
            <h3 className="text-lg font-black text-white mb-2">
              {language === 'ar' ? 'اتصل واصنع قصتك' : 'Connect & Play'}
            </h3>
            <p className="text-xs text-[#969cad] leading-relaxed mb-5">
              {language === 'ar'
                ? 'شغّل FiveM، اضغط F8، الصق أمر الاتصال وابدأ بإنشاء هوية شخصيتك واختيار مسارك المهني أو التجاري.'
                : 'Launch FiveM, paste the connect command in your F8 console, customize your character and build your empire.'}
            </p>
            <button
              onClick={handlePlayNow}
              className="inline-flex items-center gap-1.5 text-xs font-bold text-[#c8874b] group-hover:text-[#df9f64] transition-colors cursor-pointer"
            >
              <span>{language === 'ar' ? 'تشغيل السيرفر الآن' : 'Launch FiveM Now'}</span>
              <ArrowIcon className="w-3.5 h-3.5" />
            </button>
          </div>

        </div>
      </section>

      {/* ================= MOCKUP 2: FEATURES • VISUAL STORYTELLING ================= */}
      <section id="about" className="py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto border-t border-white/[0.06] relative z-10 scroll-mt-24">
        
        {/* Section Header with Poster Identity */}
        <div className="text-center max-w-3xl mx-auto mb-14">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#c8874b]/10 text-[#df9f64] text-xs font-black mb-3 uppercase tracking-widest border border-[#c8874b]/20 font-rajdhani">
            <Sparkles className="w-3.5 h-3.5 text-[#c8874b]" />
            <span>{language === 'ar' ? 'المميزات • سرد قصصي بصري' : 'FEATURES • VISUAL STORYTELLING'}</span>
          </div>
          <h2 className="text-3xl sm:text-5xl font-black text-white mb-4 uppercase tracking-tight font-rajdhani">
            {language === 'ar' ? 'عالم واسع بمصائر وشخصيات حقيقية' : 'A Living City • Deep Realistic Roleplay'}
          </h2>
          <p className="text-[#969cad] text-sm sm:text-base leading-relaxed">
            {language === 'ar'
              ? 'تعتمد مدينة PRIME RP على توازن واقعي بين السلطة، والخدمات الإنسانية، والتجارة الحرة، وصراع العصابات المنضبط، وسباقات الشوارع الليلية.'
              : 'Immerse yourself in deeply scripted sectors with authentic MDTs, player-run corporations, courtroom trials, and underground racing culture.'}
          </p>
        </div>

        {/* 6-CARD CHARACTER ARCHETYPE GRID (Matching Poster Mockup 2 Layout) */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {citySectors.map((sector) => {
            const Icon = sector.icon;
            const isSelected = activeTabSector === sector.id;
            return (
              <div
                key={sector.id}
                onClick={() => setActiveTabSector(sector.id)}
                className={`group relative rounded-2xl bg-[#0d0f16] border overflow-hidden transition-all duration-300 cursor-pointer flex flex-col justify-between ${
                  isSelected 
                    ? 'border-[#c8874b] shadow-2xl shadow-[#c8874b]/15 scale-[1.01]' 
                    : 'border-white/[0.07] hover:border-[#c8874b]/50 hover:shadow-xl'
                }`}
              >
                {/* Character Photo with Cinematic Gradient Overlay */}
                <div className="h-52 w-full relative overflow-hidden bg-[#131620]">
                  <img
                    src={sector.image}
                    alt={sector.titleEn}
                    className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-700 opacity-85 group-hover:opacity-100"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0d0f16] via-[#0d0f16]/40 to-transparent" />
                  
                  {/* Top Badge */}
                  <div className="absolute top-3 left-3 rtl:left-auto rtl:right-3 flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-black/80 backdrop-blur-md text-[10px] font-black uppercase tracking-wider border border-white/10"
                    style={{ color: sector.accent }}
                  >
                    <Icon className="w-3 h-3" />
                    <span>{language === 'ar' ? sector.badgeAr : sector.badgeEn}</span>
                  </div>

                  {/* Character Role Tag */}
                  <div className="absolute bottom-2.5 left-4 rtl:left-auto rtl:right-4">
                    <span className="text-[11px] font-bold text-[#A1A1A1] uppercase tracking-wider block">
                      {language === 'ar' ? 'الدور المتاح:' : 'Role Archetype:'}
                    </span>
                    <span className="text-sm font-black text-white font-rajdhani">
                      {language === 'ar' ? sector.roleAr : sector.roleEn}
                    </span>
                  </div>
                </div>

                {/* Card Content */}
                <div className="p-5 space-y-3 flex-grow flex flex-col justify-between">
                  <div>
                    <h3 className="text-lg font-black text-white group-hover:text-[#df9f64] transition-colors flex items-center justify-between">
                      <span>{language === 'ar' ? sector.titleAr.split('(')[0] : sector.titleEn.split('&')[0]}</span>
                      <Icon className="w-4 h-4 opacity-70" style={{ color: sector.accent }} />
                    </h3>
                    <p className="text-xs text-[#969cad] leading-relaxed line-clamp-3 mt-1.5">
                      {language === 'ar' ? sector.descAr : sector.descEn}
                    </p>
                  </div>

                  {/* Quick Stat Highlights */}
                  <div className="pt-3 border-t border-white/[0.05] grid grid-cols-2 gap-2 text-xs">
                    <div className="p-2 rounded-lg bg-[#08090d]/80 border border-white/[0.04]">
                      <span className="text-[10px] text-[#666] block font-bold">{language === 'ar' ? sector.stats[0].labelAr : sector.stats[0].labelEn}</span>
                      <span className="text-xs font-black text-white font-rajdhani">{sector.stats[0].val}</span>
                    </div>
                    <div className="p-2 rounded-lg bg-[#08090d]/80 border border-white/[0.04]">
                      <span className="text-[10px] text-[#666] block font-bold">{language === 'ar' ? sector.stats[1].labelAr : sector.stats[1].labelEn}</span>
                      <span className="text-xs font-black text-[#df9f64] font-rajdhani">{sector.stats[1].val}</span>
                    </div>
                  </div>

                  {/* Action Link */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setCurrentTab(sector.actionTab);
                    }}
                    className="w-full mt-2 py-2.5 rounded-xl bg-[#131620] hover:bg-[#c8874b] text-[#df9f64] hover:text-black font-bold text-xs uppercase tracking-wider transition-all border border-white/[0.08] hover:border-[#c8874b] flex items-center justify-center gap-1.5 cursor-pointer shadow-sm"
                  >
                    <span>{language === 'ar' ? sector.actionLabelAr : sector.actionLabelEn}</span>
                    <ArrowIcon className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Interactive Detailed Sector Terminal Tab */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentSector.id}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
            className="rounded-2xl bg-[#0d0f16] border border-white/[0.08] p-6 sm:p-10 shadow-2xl relative overflow-hidden"
          >
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

                <h3 className="text-2xl sm:text-4xl font-black text-white font-rajdhani">
                  {language === 'ar' ? currentSector.titleAr : currentSector.titleEn}
                </h3>

                <p className="text-sm sm:text-base text-[#969cad] leading-relaxed max-w-2xl">
                  {language === 'ar' ? currentSector.descAr : currentSector.descEn}
                </p>

                {/* Stats bento */}
                <div className="grid grid-cols-3 gap-4 pt-2">
                  {currentSector.stats.map((stat, i) => (
                    <div key={i} className="p-3.5 rounded-xl bg-[#08090d] border border-white/[0.05]">
                      <div className="text-[11px] text-[#7a8091] uppercase font-bold mb-1">
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
                    className="px-6 py-3.5 rounded-xl bg-[#c8874b] hover:bg-[#df9f64] text-black font-black text-xs uppercase tracking-wider transition-all shadow-md shadow-[#c8874b]/20 flex items-center gap-2 cursor-pointer"
                  >
                    <span>{language === 'ar' ? currentSector.actionLabelAr : currentSector.actionLabelEn}</span>
                    <ArrowIcon className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              <div className="lg:col-span-4 flex flex-col items-center justify-center p-6 rounded-xl bg-[#08090d] border border-white/[0.06] text-center">
                <div 
                  className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4 border shadow-xl"
                  style={{ 
                    backgroundColor: `${currentSector.accent}15`, 
                    borderColor: `${currentSector.accent}40`,
                    color: currentSector.accent 
                  }}
                >
                  <currentSector.icon className="w-8 h-8" />
                </div>
                <h4 className="text-base font-bold text-white mb-1">
                  {language === 'ar' ? 'نظام احترافي موثق' : 'Certified Gameplay'}
                </h4>
                <p className="text-xs text-[#7a8091] leading-relaxed">
                  {language === 'ar' 
                    ? 'تم فحص وبرمجة هذا القطاع لضمان تجربة واقعية دون أخطاء أو قلتشات تؤثر على مجريات اللعب.'
                    : 'Engineered with deep scripting, custom MLOs, and vetted by community moderators.'}
                </p>
              </div>

            </div>
          </motion.div>
        </AnimatePresence>

      </section>

      {/* ================= MOCKUP 3: STORE • MODERN & INTERACTIVE ================= */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto border-t border-white/[0.06] relative z-10">
        
        {/* Section Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-12 gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#c8874b]/10 text-[#df9f64] text-xs font-black mb-2 uppercase tracking-widest border border-[#c8874b]/20 font-rajdhani">
              <Crown className="w-3.5 h-3.5 text-[#c8874b]" />
              <span>{language === 'ar' ? 'المتجر • عصري وتفاعلي' : 'STORE • MODERN & INTERACTIVE'}</span>
            </div>
            <h2 className="text-3xl sm:text-5xl font-black text-white uppercase tracking-tight font-rajdhani">
              {language === 'ar' ? 'صالة عرض النخبة والمركبات الفاخرة' : 'Tebex VIP Showroom & Packages'}
            </h2>
          </div>
          <button
            onClick={() => setCurrentTab('store')}
            className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-wider text-[#c8874b] hover:text-[#df9f64] transition-colors cursor-pointer"
          >
            <span>{language === 'ar' ? 'تصفح كافة باقات المتجر' : 'Explore Entire Store'}</span>
            <ArrowIcon className="w-4 h-4" />
          </button>
        </div>

        {/* 3 TOP FEATURED LUXURY SHOWCASE CARDS (As in Poster Mockup 3) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          
          {/* Spotlight 1: VIP Empire Bundle */}
          <div className="rounded-2xl bg-[#0d0f16] border border-[#c8874b]/60 hover:border-[#df9f64] p-6 shadow-2xl relative overflow-hidden transition-all group flex flex-col justify-between">
            <div className="absolute -top-10 -right-10 w-36 h-36 bg-[#c8874b]/15 rounded-full blur-2xl pointer-events-none" />
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="px-2.5 py-1 rounded-md bg-[#c8874b]/20 border border-[#c8874b]/40 text-[#df9f64] text-[10px] font-black uppercase tracking-wider">
                  {language === 'ar' ? 'الباقة الملكية' : 'ROYAL BUNDLE'}
                </span>
                <span className="text-xs font-bold text-white/50 font-mono">TIER-1</span>
              </div>
              <div className="h-44 rounded-xl overflow-hidden mb-4 relative bg-[#131620]">
                <img
                  src="https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=900&q=80"
                  alt="Prime VIP Empire"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
              </div>
              <h3 className="text-xl font-black text-white group-hover:text-[#df9f64] transition-colors font-rajdhani">
                {language === 'ar' ? 'باقة إمبراطورية PRIME الملكية' : 'PRIME VIP EMPIRE PASS'}
              </h3>
              <p className="text-xs text-[#969cad] leading-relaxed mt-1.5 line-clamp-2">
                {language === 'ar' 
                  ? 'شقة بنتهاوس فاخرة، كراج 5 سيارات، أولوية دخول السيرفر رقم #1، ورتبة ذهبية في الديسكورد.'
                  : 'Sovereign citizen status, luxury penthouse, priority queue #1, custom Discord badge, and 5-car garage.'}
              </p>
            </div>

            <div className="pt-4 mt-4 border-t border-white/[0.06] flex items-center justify-between">
              <div>
                <span className="text-[10px] text-[#666] block font-bold uppercase">{language === 'ar' ? 'السعر' : 'Price'}</span>
                <span className="text-2xl font-black text-[#df9f64] font-rajdhani">$49.99 <span className="text-xs font-normal text-[#888]">USD</span></span>
              </div>
              <button
                onClick={() => setCurrentTab('store')}
                className="px-4 py-2 rounded-xl bg-[#c8874b] hover:bg-[#df9f64] text-black text-xs font-black uppercase tracking-wider transition-all flex items-center gap-1.5 cursor-pointer shadow-md shadow-[#c8874b]/20"
              >
                <ShoppingBag className="w-3.5 h-3.5" />
                <span>{language === 'ar' ? 'اقتناء' : 'Acquire'}</span>
              </button>
            </div>
          </div>

          {/* Spotlight 2: Overflod Autarch Hypercar */}
          <div className="rounded-2xl bg-[#0d0f16] border border-white/[0.08] hover:border-[#c8874b] p-6 shadow-2xl relative overflow-hidden transition-all group flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="px-2.5 py-1 rounded-md bg-[#131620] border border-white/[0.08] text-[#38bdf8] text-[10px] font-black uppercase tracking-wider">
                  {language === 'ar' ? 'سوبركار حصرية' : 'EXOTIC IMPORT'}
                </span>
                <span className="text-xs font-bold text-white/50 font-mono">1 OF 5</span>
              </div>
              <div className="h-44 rounded-xl overflow-hidden mb-4 relative bg-[#131620]">
                <img
                  src="https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?auto=format&fit=crop&w=900&q=80"
                  alt="Overflod Autarch"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
              </div>
              <h3 className="text-xl font-black text-white group-hover:text-[#df9f64] transition-colors font-rajdhani">
                {language === 'ar' ? 'سوبركار أوفرفلود أوتارك V8' : 'OVERFLOD AUTARCH HYPERCAR'}
              </h3>
              <p className="text-xs text-[#969cad] leading-relaxed mt-1.5 line-clamp-2">
                {language === 'ar' 
                  ? 'محرك توين تيربو معدل بصوت واقعي، بودي كيت من ألياف الكربون، ولوحة ملكية مخصصة.'
                  : 'Twin-turbo custom engine audio, carbon-fiber aerodynamics, and reserved vanity registration.'}
              </p>
            </div>

            <div className="pt-4 mt-4 border-t border-white/[0.06] flex items-center justify-between">
              <div>
                <span className="text-[10px] text-[#666] block font-bold uppercase">{language === 'ar' ? 'السعر' : 'Price'}</span>
                <span className="text-2xl font-black text-[#df9f64] font-rajdhani">$34.99 <span className="text-xs font-normal text-[#888]">USD</span></span>
              </div>
              <button
                onClick={() => setCurrentTab('store')}
                className="px-4 py-2 rounded-xl bg-[#131620] hover:bg-[#c8874b] text-[#df9f64] hover:text-black border border-white/[0.08] hover:border-[#c8874b] text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <ShoppingBag className="w-3.5 h-3.5" />
                <span>{language === 'ar' ? 'شراء' : 'Purchase'}</span>
              </button>
            </div>
          </div>

          {/* Spotlight 3: Vinewood Hills Mansion */}
          <div className="rounded-2xl bg-[#0d0f16] border border-white/[0.08] hover:border-[#c8874b] p-6 shadow-2xl relative overflow-hidden transition-all group flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="px-2.5 py-1 rounded-md bg-[#131620] border border-white/[0.08] text-[#a855f7] text-[10px] font-black uppercase tracking-wider">
                  {language === 'ar' ? 'عقار فاخر MLO' : 'EXCLUSIVE ESTATE'}
                </span>
                <span className="text-xs font-bold text-white/50 font-mono">PRIME LOC</span>
              </div>
              <div className="h-44 rounded-xl overflow-hidden mb-4 relative bg-[#131620]">
                <img
                  src="https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=900&q=80"
                  alt="Vinewood Hills Mansion"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
              </div>
              <h3 className="text-xl font-black text-white group-hover:text-[#df9f64] transition-colors font-rajdhani">
                {language === 'ar' ? 'قصر فاينوود هيلز الملكي' : 'VINEWOOD LUXURY PENTHOUSE'}
              </h3>
              <p className="text-xs text-[#969cad] leading-relaxed mt-1.5 line-clamp-2">
                {language === 'ar' 
                  ? 'تصميم داخلي مخصص، مسبح خاص مطل على المدينة، مهبط هليكوبتر، وكراج آمن يتسع لـ 10 مركبات.'
                  : 'Custom MLO interior, private infinity pool overlooking LS, rooftop helipad, and 10-car garage.'}
              </p>
            </div>

            <div className="pt-4 mt-4 border-t border-white/[0.06] flex items-center justify-between">
              <div>
                <span className="text-[10px] text-[#666] block font-bold uppercase">{language === 'ar' ? 'السعر' : 'Price'}</span>
                <span className="text-2xl font-black text-[#df9f64] font-rajdhani">$29.99 <span className="text-xs font-normal text-[#888]">USD</span></span>
              </div>
              <button
                onClick={() => setCurrentTab('store')}
                className="px-4 py-2 rounded-xl bg-[#131620] hover:bg-[#c8874b] text-[#df9f64] hover:text-black border border-white/[0.08] hover:border-[#c8874b] text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <ShoppingBag className="w-3.5 h-3.5" />
                <span>{language === 'ar' ? 'شراء' : 'Purchase'}</span>
              </button>
            </div>
          </div>

        </div>

        {/* Regular Store Grid */}
        {featuredProducts.length > 0 && (
          <div>
            <div className="text-xs font-bold text-[#7a8091] uppercase tracking-wider mb-4">
              {language === 'ar' ? 'حزم وعناصر إضافية للمواطنين:' : 'Additional Citizen Packages & Items:'}
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {featuredProducts.map((product) => {
                const trans = product.translations[language] || product.translations.ar || product.translations.en;
                return (
                  <div
                    key={product.id}
                    onClick={() => setCurrentTab('store')}
                    className="rounded-2xl bg-[#0d0f16] border border-white/[0.07] hover:border-[#c8874b]/70 p-5 flex flex-col justify-between transition-all card-hover-lift group cursor-pointer shadow-lg relative"
                  >
                    <div>
                      <div className="h-44 rounded-xl overflow-hidden mb-4 relative bg-[#131620]">
                        <img
                          src={product.image}
                          alt={trans.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                        <div className="absolute top-2.5 right-2.5 rtl:right-auto rtl:left-2.5 px-2.5 py-0.5 rounded-md bg-black/85 backdrop-blur-md text-[#df9f64] text-[10px] font-bold uppercase tracking-wider border border-white/10">
                          {product.category}
                        </div>
                      </div>

                      <h3 className="text-base font-black text-white group-hover:text-[#df9f64] transition-colors mb-1.5 font-rajdhani">
                        {trans.name}
                      </h3>
                      <p className="text-xs text-[#7a8091] line-clamp-2 leading-relaxed mb-4">
                        {trans.description}
                      </p>
                    </div>

                    <div className="pt-3 border-t border-white/[0.06] flex items-center justify-between">
                      <div>
                        <span className="text-[10px] text-[#666] block font-bold uppercase tracking-wider">
                          {language === 'ar' ? 'السعر' : 'Price'}
                        </span>
                        <span className="text-xl font-black text-[#df9f64] font-rajdhani">
                          ${product.price} <span className="text-xs font-normal text-[#888]">{product.currency}</span>
                        </span>
                      </div>

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          addToCart(product);
                        }}
                        className="px-3.5 py-2 rounded-lg bg-[#131620] hover:bg-[#c8874b] text-[#df9f64] hover:text-black text-xs font-bold uppercase tracking-wider transition-all border border-white/[0.08] hover:border-[#c8874b] flex items-center gap-1.5 cursor-pointer shadow-sm"
                        title={language === 'ar' ? 'إضافة للسلة' : 'Add to Cart'}
                      >
                        <ShoppingBag className="w-3.5 h-3.5" />
                        <span>{language === 'ar' ? 'شراء' : 'Buy'}</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

      </section>

      {/* ================= ARCHITECTURE PILLARS (SERVER SPECS) ================= */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto border-t border-white/[0.06] relative z-10">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <h2 className="text-2xl sm:text-4xl font-black text-white uppercase tracking-tight">
            {t('features.title')}
          </h2>
          <p className="text-[#969cad] text-xs sm:text-sm mt-2">
            {t('features.subtitle')}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          <div className="p-6 rounded-2xl bg-[#0d0f16] border border-white/[0.06] hover:border-[#c8874b]/50 transition-all card-hover-lift group">
            <div className="w-12 h-12 rounded-xl bg-[#c8874b]/10 border border-[#c8874b]/20 flex items-center justify-center mb-4 text-[#df9f64] group-hover:scale-110 transition-transform">
              <DollarSign className="w-6 h-6" />
            </div>
            <h3 className="text-base font-black text-white mb-1.5">{t('features.economy')}</h3>
            <p className="text-xs text-[#7a8091] leading-relaxed">{t('features.economyDesc')}</p>
          </div>

          <div className="p-6 rounded-2xl bg-[#0d0f16] border border-white/[0.06] hover:border-[#c8874b]/50 transition-all card-hover-lift group">
            <div className="w-12 h-12 rounded-xl bg-[#c8874b]/10 border border-[#c8874b]/20 flex items-center justify-center mb-4 text-[#df9f64] group-hover:scale-110 transition-transform">
              <Briefcase className="w-6 h-6" />
            </div>
            <h3 className="text-base font-black text-white mb-1.5">{t('features.jobs')}</h3>
            <p className="text-xs text-[#7a8091] leading-relaxed">{t('features.jobsDesc')}</p>
          </div>

          <div className="p-6 rounded-2xl bg-[#0d0f16] border border-white/[0.06] hover:border-[#c8874b]/50 transition-all card-hover-lift group">
            <div className="w-12 h-12 rounded-xl bg-[#c8874b]/10 border border-[#c8874b]/20 flex items-center justify-center mb-4 text-[#df9f64] group-hover:scale-110 transition-transform">
              <Shield className="w-6 h-6" />
            </div>
            <h3 className="text-base font-black text-white mb-1.5">{t('features.security')}</h3>
            <p className="text-xs text-[#7a8091] leading-relaxed">{t('features.securityDesc')}</p>
          </div>

          <div className="p-6 rounded-2xl bg-[#0d0f16] border border-white/[0.06] hover:border-[#c8874b]/50 transition-all card-hover-lift group">
            <div className="w-12 h-12 rounded-xl bg-[#c8874b]/10 border border-[#c8874b]/20 flex items-center justify-center mb-4 text-[#df9f64] group-hover:scale-110 transition-transform">
              <Zap className="w-6 h-6" />
            </div>
            <h3 className="text-base font-black text-white mb-1.5">{t('features.performance')}</h3>
            <p className="text-xs text-[#7a8091] leading-relaxed">{t('features.performanceDesc')}</p>
          </div>
        </div>
      </section>

      {/* ================= FAIR PLAY & GOLDEN DIRECTIVES ================= */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto border-t border-white/[0.06] relative z-10">
        <div className="text-center max-w-3xl mx-auto mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 text-xs font-bold mb-3 uppercase tracking-wider border border-emerald-500/20">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>{language === 'ar' ? 'مبادئ اللعب النظيف' : 'Roleplay Integrity & Code'}</span>
          </div>
          <h2 className="text-2xl sm:text-4xl font-black text-white uppercase tracking-tight">
            {language === 'ar' ? 'القواعد الأساسية لتجربة رول بلاي نقية' : 'The Golden Pillars of Serious RP'}
          </h2>
          <p className="text-[#969cad] text-xs sm:text-sm mt-2">
            {language === 'ar'
              ? 'نحرص في PRIME RP على بيئة لعب تحترم السيناريوهات الدرامية وتبتعد تماماً عن الفوضى.'
              : 'Fair-play standards ensure every interaction develops into memorable, character-driven storylines.'}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-6 rounded-2xl bg-[#0d0f16] border border-white/[0.06] hover:border-rose-500/30 transition-colors">
            <div className="flex items-center gap-2 text-rose-400 font-black text-sm mb-3">
              <XCircle className="w-4 h-4" />
              <span>{language === 'ar' ? 'ممنوع RDM / VDM' : 'No RDM / VDM'}</span>
            </div>
            <p className="text-xs text-[#7a8091] leading-relaxed mb-4">
              {language === 'ar'
                ? 'يُحظر منعاً باتاً قتل أي لاعب أو صدمه بالمركبة دون وجود دافع درامي وسيناريو مسبق ومبرر كامل.'
                : 'Killing or running over citizens without prior verbal interaction and legitimate storyline context is strictly forbidden.'}
            </p>
            <div className="p-2.5 rounded-lg bg-[#08090d] border border-white/[0.05] text-[11px] text-emerald-400 font-bold">
              ✓ {language === 'ar' ? 'الواجب: التحاور وبدء السيناريو أولاً' : 'Requirement: Verbal RP interaction first'}
            </div>
          </div>

          <div className="p-6 rounded-2xl bg-[#0d0f16] border border-white/[0.06] hover:border-amber-500/30 transition-colors">
            <div className="flex items-center gap-2 text-amber-400 font-black text-sm mb-3">
              <ShieldAlert className="w-4 h-4" />
              <span>{language === 'ar' ? 'قيمة الحياة (FearRP)' : 'Fear RP & Value of Life'}</span>
            </div>
            <p className="text-xs text-[#7a8091] leading-relaxed mb-4">
              {language === 'ar'
                ? 'عندما يتم تهديدك بسلاح من قبل عدة أشخاص، يجب أن تظهر الخوف على حياة شخصيتك وتستجيب للأوامر.'
                : 'When faced with superior armed threats, you must fear for your character\'s survival and comply with directives.'}
            </p>
            <div className="p-2.5 rounded-lg bg-[#08090d] border border-white/[0.05] text-[11px] text-emerald-400 font-bold">
              ✓ {language === 'ar' ? 'الواجب: الحفاظ على حياتك كأولوية' : 'Requirement: Value your life above pride'}
            </div>
          </div>

          <div className="p-6 rounded-2xl bg-[#0d0f16] border border-white/[0.06] hover:border-purple-500/30 transition-colors">
            <div className="flex items-center gap-2 text-purple-400 font-black text-sm mb-3">
              <Cpu className="w-4 h-4" />
              <span>{language === 'ar' ? 'ممنوع الميتا والباور' : 'No Metagaming & Powergaming'}</span>
            </div>
            <p className="text-xs text-[#7a8091] leading-relaxed mb-4">
              {language === 'ar'
                ? 'استخدام معلومات الديسكورد داخل اللعبة أو فرض أفعال خارقة لا يمكن للطرف الآخر التفاعل معها ممنوع قطعياً.'
                : 'Using out-of-game knowledge or forcing unrealistic actions that give opponents no counter-play is prohibited.'}
            </p>
            <div className="p-2.5 rounded-lg bg-[#08090d] border border-white/[0.05] text-[11px] text-emerald-400 font-bold">
              ✓ {language === 'ar' ? 'الواجب: الفصل التام بين الشخصية والواقع' : 'Requirement: Strict IC vs OOC separation'}
            </div>
          </div>
        </div>

        <div className="text-center mt-8">
          <button
            onClick={() => setCurrentTab('rules')}
            className="inline-flex items-center gap-2 text-xs font-bold text-[#c8874b] hover:text-[#df9f64] transition-colors cursor-pointer"
          >
            <span>{language === 'ar' ? 'الاطلاع على كتاب القوانين الكامل (Rules Book)' : 'Read Full City Rules & Directives'}</span>
            <ArrowIcon className="w-3.5 h-3.5" />
          </button>
        </div>
      </section>

      {/* ================= CAREERS / VACANCIES PREVIEW ================= */}
      {featuredJobs.length > 0 && (
        <section className="py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto border-t border-white/[0.06] relative z-10">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-12 gap-4">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#c8874b]/10 text-[#df9f64] text-xs font-bold mb-2 uppercase tracking-wider border border-[#c8874b]/20">
                <Briefcase className="w-3.5 h-3.5" />
                <span>Careers & Recruitment</span>
              </div>
              <h2 className="text-3xl font-black text-white">{t('jobs.title')}</h2>
            </div>
            <button
              onClick={() => setCurrentTab('jobs')}
              className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-wider text-[#c8874b] hover:text-[#df9f64] transition-colors cursor-pointer"
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
                  className="rounded-2xl bg-[#0d0f16] border border-white/[0.06] hover:border-[#c8874b]/60 p-6 flex flex-col justify-between transition-all card-hover-lift group"
                >
                  <div className="space-y-4">
                    <div className="flex justify-between items-start">
                      <span className="px-2.5 py-1 rounded-md bg-[#131620] text-[#df9f64] text-[10px] font-bold uppercase tracking-wider border border-white/[0.06]">
                        {job.category}
                      </span>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        job.status === 'HIRING_OPEN'
                          ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                          : 'bg-[#131620] text-[#777]'
                      }`}>
                        {job.status === 'HIRING_OPEN' ? (language === 'ar' ? 'التقديم متاح' : 'Hiring Active') : (language === 'ar' ? 'مغلق مؤقتاً' : 'Closed')}
                      </span>
                    </div>

                    <h3 className="text-lg font-black text-white group-hover:text-[#df9f64] transition-colors">
                      {trans.name}
                    </h3>

                    <p className="text-xs text-[#7a8091] line-clamp-3 leading-relaxed">
                      {trans.description}
                    </p>

                    <div className="pt-2">
                      <span className="text-xs text-[#666] block mb-0.5">
                        {language === 'ar' ? 'الراتب التقديري:' : 'Hourly Wage:'}
                      </span>
                      <span className="text-lg font-black text-[#df9f64] font-rajdhani">
                        ${job.salaryMin} - ${job.salaryMax} / hr
                      </span>
                    </div>
                  </div>

                  <div className="pt-6 border-t border-white/[0.06] mt-4">
                    <button
                      onClick={() => setCurrentTab('jobs')}
                      className="w-full py-3 rounded-xl bg-[#131620] hover:bg-[#1c202d] text-white text-xs font-bold uppercase tracking-wider transition-all border border-white/[0.08] hover:border-[#c8874b] cursor-pointer flex items-center justify-center gap-2"
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
        <section className="py-24 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto border-t border-white/[0.06] relative z-10">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#c8874b]/10 text-[#df9f64] text-xs font-bold mb-3 uppercase tracking-wider border border-[#c8874b]/20">
              <HelpCircle className="w-3.5 h-3.5" />
              <span>{t('nav.faq')}</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-black text-white mb-3 uppercase tracking-tight">
              {language === 'ar' ? 'الأسئلة الشائعة وإرشادات الانضمام' : 'Frequently Asked Questions'}
            </h2>
            <p className="text-[#969cad] text-xs sm:text-sm">
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
                  className={`rounded-xl border transition-all overflow-hidden ${
                    isOpen ? 'bg-[#0d0f16] border-[#c8874b]/50 shadow-lg' : 'bg-[#0d0f16] border-white/[0.06] hover:border-white/[0.12]'
                  }`}
                >
                  <button
                    onClick={() => setOpenFaqIndex(isOpen ? null : idx)}
                    className="w-full p-5 text-left rtl:text-right flex items-center justify-between gap-4 cursor-pointer"
                  >
                    <span className="font-bold text-sm text-white">{trans.question}</span>
                    <ChevronDown className={`w-4 h-4 text-[#c8874b] shrink-0 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
                  </button>
                  <AnimatePresence>
                    {isOpen && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
                        className="overflow-hidden"
                      >
                        <div className="p-5 pt-0 text-xs text-[#969cad] leading-relaxed border-t border-white/[0.06]">
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
              className="inline-flex items-center gap-2 text-xs font-bold text-[#c8874b] hover:text-[#df9f64] transition-colors cursor-pointer"
            >
              <span>{language === 'ar' ? 'عرض كافة الأسئلة الشائعة' : 'View full knowledge base'}</span>
              <ArrowIcon className="w-3.5 h-3.5" />
            </button>
          </div>
        </section>
      )}

      {/* ================= MOCKUP 4: DASHBOARD • CLEAN & PROFESSIONAL ================= */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto border-t border-white/[0.06] relative z-10">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-12">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#c8874b]/10 text-[#df9f64] text-xs font-black mb-3 uppercase tracking-widest border border-[#c8874b]/20 font-rajdhani">
            <BadgeCheck className="w-3.5 h-3.5 text-[#c8874b]" />
            <span>{language === 'ar' ? 'لوحة التحكم • نظيفة واحترافية' : 'DASHBOARD • CLEAN & PROFESSIONAL'}</span>
          </div>
          <h2 className="text-3xl sm:text-5xl font-black text-white mb-3 uppercase tracking-tight font-rajdhani">
            {language === 'ar' ? 'لوحة تحكم المواطن المتكاملة' : 'Welcome Back, Citizen'}
          </h2>
          <p className="text-[#969cad] text-xs sm:text-sm max-w-xl mx-auto leading-relaxed">
            {language === 'ar'
              ? 'تتبع رصيدك البنكي، تراخيصك الرسمية، مركباتك، وطلبات التوظيف والدعم الفني في واجهة موحدة سلسة.'
              : 'Direct live access to your citizen dossier, registered vehicles, bank accounts, permits, and active support tickets.'}
          </p>
        </div>

        {/* CITIZEN DOSSIER TERMINAL CARD (Mockup 4 Visual Representation) */}
        <div className="rounded-3xl bg-[#0d0f16] border border-white/[0.09] p-6 sm:p-10 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-1/4 w-80 h-80 bg-[#c8874b]/10 rounded-full blur-[100px] pointer-events-none" />
          
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 relative z-10">
            
            {/* Citizen Identity Profile (4 Cols) */}
            <div className="lg:col-span-4 p-6 rounded-2xl bg-[#08090d] border border-white/[0.06] flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-4 mb-5">
                  <div className="relative">
                    <div className="w-16 h-16 rounded-2xl bg-[#131620] border-2 border-[#c8874b] p-0.5 overflow-hidden flex items-center justify-center">
                      {user?.avatar ? (
                        <img src={user.avatar} alt="Avatar" className="w-full h-full object-cover rounded-xl" />
                      ) : (
                        <User className="w-8 h-8 text-[#c8874b]" />
                      )}
                    </div>
                    <span className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-500 border-2 border-[#08090d] rounded-full" />
                  </div>
                  <div>
                    <span className="text-[10px] text-[#A1A1A1] uppercase font-bold tracking-wider">
                      {language === 'ar' ? 'سجل المواطن:' : 'CITIZEN DOSSIER'}
                    </span>
                    <h3 className="text-lg font-black text-white font-rajdhani">
                      {user?.username || (language === 'ar' ? 'ألكسندر ثورن' : 'Alexander Thorne')}
                    </h3>
                    <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded bg-[#c8874b]/15 text-[#df9f64] text-[10px] font-black uppercase tracking-wider mt-1 border border-[#c8874b]/30">
                      <Shield className="w-2.5 h-2.5" />
                      <span>{language === 'ar' ? 'مواطن موثق #1042' : 'WHITELISTED #1042'}</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-2.5 text-xs pt-4 border-t border-white/[0.06]">
                  <div className="flex items-center justify-between">
                    <span className="text-[#666]">{language === 'ar' ? 'المدينة والولاية:' : 'Jurisdiction:'}</span>
                    <span className="text-white font-bold">Los Santos, San Andreas</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-[#666]">{language === 'ar' ? 'ساعات الإقامة:' : 'City Playtime:'}</span>
                    <span className="text-[#df9f64] font-black font-rajdhani">148 Hours</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-[#666]">{language === 'ar' ? 'المركبة المسجلة:' : 'Active Garage:'}</span>
                    <span className="text-white font-bold">Pfister Comet S2</span>
                  </div>
                </div>
              </div>

              <div className="pt-6 mt-6 border-t border-white/[0.06]">
                <button
                  onClick={() => setCurrentTab('user')}
                  className="w-full py-3 rounded-xl bg-[#c8874b] hover:bg-[#df9f64] text-black font-black text-xs uppercase tracking-wider transition-all shadow-lg shadow-[#c8874b]/25 cursor-pointer flex items-center justify-center gap-2"
                >
                  <Terminal className="w-4 h-4" />
                  <span>{language === 'ar' ? 'دخول لوحة التحكم الكاملة' : 'Launch Citizen Terminal'}</span>
                </button>
              </div>
            </div>

            {/* Financials, Assets & Official Licenses (8 Cols) */}
            <div className="lg:col-span-8 space-y-6">
              
              {/* Financial Stats Bar */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                
                <div className="p-5 rounded-2xl bg-[#08090d] border border-white/[0.06] hover:border-[#c8874b]/30 transition-colors">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs text-[#7a8091] font-bold uppercase">{language === 'ar' ? 'الرصيد البنكي' : 'Fleeca Bank'}</span>
                    <CreditCard className="w-4 h-4 text-emerald-400" />
                  </div>
                  <div className="text-2xl font-black text-white font-rajdhani">$125,480</div>
                  <span className="text-[10px] text-emerald-400 font-bold block mt-1">✓ {language === 'ar' ? 'حساب نشط ومؤمّن' : 'Verified Savings'}</span>
                </div>

                <div className="p-5 rounded-2xl bg-[#08090d] border border-white/[0.06] hover:border-[#c8874b]/30 transition-colors">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs text-[#7a8091] font-bold uppercase">{language === 'ar' ? 'السيولة النقدية' : 'Cash on Hand'}</span>
                    <Wallet className="w-4 h-4 text-[#df9f64]" />
                  </div>
                  <div className="text-2xl font-black text-[#df9f64] font-rajdhani">$4,250</div>
                  <span className="text-[10px] text-[#A1A1A1] block mt-1">{language === 'ar' ? 'المحفظة الشخصية' : 'Physical Cash'}</span>
                </div>

                <div className="p-5 rounded-2xl bg-[#08090d] border border-white/[0.06] hover:border-[#c8874b]/30 transition-colors">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs text-[#7a8091] font-bold uppercase">{language === 'ar' ? 'التقييم الائتماني' : 'Credit Score'}</span>
                    <Sparkles className="w-4 h-4 text-[#38bdf8]" />
                  </div>
                  <div className="text-2xl font-black text-white font-rajdhani">785 / 850</div>
                  <span className="text-[10px] text-[#38bdf8] font-bold block mt-1">{language === 'ar' ? 'مؤهل للقروض العقارية' : 'Prime Tier Borrower'}</span>
                </div>

              </div>

              {/* Official Permits & Licenses Matrix */}
              <div className="p-5 rounded-2xl bg-[#08090d] border border-white/[0.06]">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <Award className="w-4 h-4 text-[#c8874b]" />
                    <span className="text-xs font-bold uppercase tracking-wider text-white">
                      {language === 'ar' ? 'التراخيص والسجلات الرسمية (Department of Justice)' : 'Official Permits & Certifications (State Records)'}
                    </span>
                  </div>
                  <span className="text-[10px] text-[#666] font-mono">MDT-SYNCED</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="p-3 rounded-xl bg-[#0d0f16] border border-white/[0.04] flex items-center justify-between">
                    <div>
                      <span className="text-[10px] text-[#7a8091] block uppercase font-bold">{language === 'ar' ? 'رخصة القيادة' : 'Driver License'}</span>
                      <span className="text-xs font-bold text-white">CLASS A / B</span>
                    </div>
                    <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 text-[10px] font-black border border-emerald-500/20">
                      {language === 'ar' ? 'سارية' : 'VALID'}
                    </span>
                  </div>

                  <div className="p-3 rounded-xl bg-[#0d0f16] border border-white/[0.04] flex items-center justify-between">
                    <div>
                      <span className="text-[10px] text-[#7a8091] block uppercase font-bold">{language === 'ar' ? 'تصريح السلاح' : 'Firearm Permit'}</span>
                      <span className="text-xs font-bold text-white">CLASS-3 CCW</span>
                    </div>
                    <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 text-[10px] font-black border border-emerald-500/20">
                      {language === 'ar' ? 'مرخص' : 'ISSUED'}
                    </span>
                  </div>

                  <div className="p-3 rounded-xl bg-[#0d0f16] border border-white/[0.04] flex items-center justify-between">
                    <div>
                      <span className="text-[10px] text-[#7a8091] block uppercase font-bold">{language === 'ar' ? 'رخصة الطيران' : 'Aviation License'}</span>
                      <span className="text-xs font-bold text-white">HELICOPTER / JET</span>
                    </div>
                    <span className="px-2 py-0.5 rounded bg-sky-500/10 text-sky-400 text-[10px] font-black border border-sky-500/20">
                      {language === 'ar' ? 'معتمد' : 'CERTIFIED'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Fast Navigation Quick Shortcuts */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <button
                  onClick={() => setCurrentTab('jobs')}
                  className="p-3 rounded-xl bg-[#08090d] hover:bg-[#131620] border border-white/[0.06] hover:border-[#c8874b]/50 text-left rtl:text-right transition-all cursor-pointer group"
                >
                  <Briefcase className="w-4 h-4 text-[#c8874b] mb-1.5 group-hover:scale-110 transition-transform" />
                  <span className="text-xs font-bold text-white block">{language === 'ar' ? 'طلبات التوظيف' : 'My Applications'}</span>
                  <span className="text-[10px] text-[#666]">{language === 'ar' ? 'متابعة الحالة' : 'Status: Review'}</span>
                </button>

                <button
                  onClick={() => setCurrentTab('support')}
                  className="p-3 rounded-xl bg-[#08090d] hover:bg-[#131620] border border-white/[0.06] hover:border-[#c8874b]/50 text-left rtl:text-right transition-all cursor-pointer group"
                >
                  <MessageSquare className="w-4 h-4 text-[#5865F2] mb-1.5 group-hover:scale-110 transition-transform" />
                  <span className="text-xs font-bold text-white block">{language === 'ar' ? 'تذاكر الدعم' : 'Support Tickets'}</span>
                  <span className="text-[10px] text-[#666]">{language === 'ar' ? 'المساعدة الفنية' : '24/7 Response'}</span>
                </button>

                <button
                  onClick={() => setCurrentTab('store')}
                  className="p-3 rounded-xl bg-[#08090d] hover:bg-[#131620] border border-white/[0.06] hover:border-[#c8874b]/50 text-left rtl:text-right transition-all cursor-pointer group"
                >
                  <ShoppingBag className="w-4 h-4 text-[#df9f64] mb-1.5 group-hover:scale-110 transition-transform" />
                  <span className="text-xs font-bold text-white block">{language === 'ar' ? 'فواتير المتجر' : 'Tebex Orders'}</span>
                  <span className="text-[10px] text-[#666]">{language === 'ar' ? 'تسليم فوري' : 'Instant Delivery'}</span>
                </button>

                <button
                  onClick={() => setCurrentTab('rules')}
                  className="p-3 rounded-xl bg-[#08090d] hover:bg-[#131620] border border-white/[0.06] hover:border-[#c8874b]/50 text-left rtl:text-right transition-all cursor-pointer group"
                >
                  <Shield className="w-4 h-4 text-emerald-400 mb-1.5 group-hover:scale-110 transition-transform" />
                  <span className="text-xs font-bold text-white block">{language === 'ar' ? 'سجل السوابق' : 'Penal Record'}</span>
                  <span className="text-[10px] text-emerald-400">{language === 'ar' ? 'سجل نظيف' : 'Clean Slate'}</span>
                </button>
              </div>

            </div>

          </div>
        </div>

      </section>

      {/* ================= MOCKUP 5: COMMUNITY • ENGAGING & SOCIAL ================= */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto border-t border-white/[0.06] relative z-10">
        
        {/* Full-width Cinematic Los Santos Night Panorama Container */}
        <div className="rounded-3xl bg-[#0d0f16] border border-white/[0.1] relative overflow-hidden shadow-2xl">
          
          {/* Panoramic Background with Vignette and Golden City Lights */}
          <div className="absolute inset-0 z-0">
            <img
              src="https://images.unsplash.com/photo-1506146332389-18140dc7b2fb?auto=format&fit=crop&w=1600&q=80"
              alt="Los Santos Skyline Night"
              className="w-full h-full object-cover object-center opacity-30 scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#0d0f16] via-[#0d0f16]/75 to-[#0d0f16]/90" />
            <div className="absolute inset-0 bg-copper-glow-radial opacity-40" />
          </div>

          <div className="relative z-10 px-6 py-16 sm:px-14 sm:py-20 text-center max-w-4xl mx-auto space-y-7">
            
            {/* Header Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#c8874b]/15 text-[#df9f64] text-xs font-black uppercase tracking-widest border border-[#c8874b]/30 font-rajdhani">
              <Users className="w-4 h-4 text-[#c8874b]" />
              <span>{language === 'ar' ? 'المجتمع • تفاعلي وجذاب' : 'COMMUNITY • ENGAGING & SOCIAL'}</span>
            </div>

            {/* Poster Main Slogan */}
            <div className="space-y-2">
              <h2 className="text-4xl sm:text-7xl font-black text-white tracking-tight uppercase font-rajdhani">
                {language === 'ar' ? 'انضم إلى PRIME RP' : 'JOIN PRIME RP'}
              </h2>
              <div className="text-base sm:text-2xl font-black tracking-widest text-[#DF9F64] uppercase font-rajdhani">
                {language === 'ar' ? 'قصة أعظم بانتظارك • العب • شارك • انتمِ' : 'A BIGGER STORY AWAITS • PLAY • ROLEPLAY • BELONG'}
              </div>
            </div>

            {/* Poster Subquote */}
            <p className="text-sm sm:text-lg italic text-[#df9f64]/90 font-serif max-w-xl mx-auto">
              &ldquo;{language === 'ar' ? 'نفس العالم.. لكن بتجربة جديدة كلياً.' : 'Same World. A New Experience.'}&rdquo;
            </p>

            {/* Live Metrics Row */}
            <div className="flex flex-wrap items-center justify-center gap-4 py-2">
              <div className="px-4 py-2 rounded-xl bg-[#08090d]/80 backdrop-blur-md border border-white/[0.08] flex items-center gap-2 text-xs">
                <span className="w-2 h-2 rounded-full bg-[#5865F2] animate-pulse" />
                <span className="text-[#A1A1A1]">{language === 'ar' ? 'أعضاء الديسكورد:' : 'Discord Guild:'}</span>
                <span className="text-white font-black font-rajdhani">5,400+ Citizens</span>
              </div>

              <div className="px-4 py-2 rounded-xl bg-[#08090d]/80 backdrop-blur-md border border-white/[0.08] flex items-center gap-2 text-xs">
                <span className="w-2 h-2 rounded-full bg-emerald-400" />
                <span className="text-[#A1A1A1]">{language === 'ar' ? 'نظام الصوت:' : 'Voice Engine:'}</span>
                <span className="text-emerald-400 font-black font-rajdhani">SaltyChat 3D</span>
              </div>

              <div className="px-4 py-2 rounded-xl bg-[#08090d]/80 backdrop-blur-md border border-white/[0.08] flex items-center gap-2 text-xs">
                <span className="w-2 h-2 rounded-full bg-[#c8874b]" />
                <span className="text-[#A1A1A1]">{language === 'ar' ? 'التوثيق:' : 'Whitelist:'}</span>
                <span className="text-[#df9f64] font-black font-rajdhani">{language === 'ar' ? 'متاح للجميع' : 'Open Registration'}</span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
              <a
                href={siteSettings?.discordUrl || 'https://discord.gg/primerp'}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-2.5 px-8 py-4 rounded-xl bg-[#5865F2] hover:bg-[#4752C4] active:scale-95 text-white font-black text-xs uppercase tracking-wider transition-all shadow-xl shadow-[#5865F2]/25 cursor-pointer"
              >
                <MessageSquare className="w-4 h-4" />
                <span>{language === 'ar' ? 'الانضمام لمجتمع الديسكورد' : 'Join Discord Community'}</span>
              </a>

              <MagneticButton onClick={handlePlayNow}>
                <div className="flex items-center gap-2.5 px-8 py-4 rounded-xl bg-[#c8874b] hover:bg-[#df9f64] text-black font-black text-xs uppercase tracking-wider active:scale-95 transition-all shadow-xl shadow-[#c8874b]/30 cursor-pointer">
                  <Play className="w-4 h-4 fill-current" />
                  <span>{language === 'ar' ? 'تشغيل FiveM والدخول الآن' : 'Connect to Server Now'}</span>
                </div>
              </MagneticButton>
            </div>

            {/* 1-Click F8 Copy Bar */}
            <div className="pt-2 max-w-md mx-auto">
              <div className="flex items-center gap-2 p-2 rounded-xl bg-[#08090d]/90 border border-white/[0.08]">
                <code className="text-xs text-[#df9f64] font-mono px-2 py-1 flex-grow select-all truncate">
                  {connectCommand}
                </code>
                <button
                  onClick={handleCopyConnect}
                  className="px-3 py-1.5 rounded-lg bg-[#131620] hover:bg-[#1c202d] text-white border border-white/[0.08] transition-all cursor-pointer shrink-0 flex items-center gap-1.5 text-xs font-bold"
                >
                  {copiedConnect ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                      <span className="text-emerald-400">{language === 'ar' ? 'تم النسخ' : 'Copied'}</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5 text-[#c8874b]" />
                      <span className="text-[#df9f64]">{language === 'ar' ? 'نسخ F8' : 'Copy F8'}</span>
                    </>
                  )}
                </button>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ================= FINAL LAUNCH CALL TO ACTION ================= */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto text-center relative z-10">
        <h2 className="text-3xl sm:text-6xl font-black text-white mb-4 uppercase tracking-tight font-rajdhani">
          {language === 'ar' ? 'ابدأ رحلتك في مدينة PRIME RP' : 'Your Journey Begins in PRIME'}
        </h2>
        <p className="text-sm sm:text-base text-[#969cad] max-w-xl mx-auto mb-8 leading-relaxed">
          {language === 'ar'
            ? 'سيرفر رول بلاي متكامل بنظام مواطنة موثق ومجتمع شغوف. شغّل FiveM وانضم إلى أفضل تجربة لعب واقعي الآن.'
            : 'Unrivaled roleplay standard, sovereign judicial system, and living economy. Launch FiveM and claim your citizen status.'}
        </p>

        <div className="flex flex-wrap items-center justify-center gap-4">
          <MagneticButton onClick={handlePlayNow}>
            <div className="flex items-center justify-center gap-2.5 px-8 py-4 rounded-xl bg-[#c8874b] hover:bg-[#df9f64] text-black font-black text-xs uppercase tracking-wider active:scale-95 transition-all shadow-xl shadow-[#c8874b]/30 cursor-pointer">
              <Play className="w-4 h-4 fill-current" />
              <span>{language === 'ar' ? 'دخول السيرفر الآن' : 'Connect to Server'}</span>
            </div>
          </MagneticButton>

          <button
            onClick={() => setCurrentTab('jobs')}
            className="flex items-center justify-center gap-2.5 px-7 py-4 rounded-xl bg-[#0d0f16] hover:bg-[#131620] border border-white/[0.08] hover:border-[#c8874b] text-white font-bold text-xs uppercase tracking-wider transition-all cursor-pointer"
          >
            <Briefcase className="w-4 h-4 text-[#df9f64]" />
            <span>{language === 'ar' ? 'تقديم على وظيفة' : 'Careers & Roles'}</span>
          </button>
        </div>
      </section>

    </div>
  );
};

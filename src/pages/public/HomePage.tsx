import React, { useState, useEffect, useRef } from 'react';
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

  const isConfigured = Boolean(
    siteSettings?.fiveMConnectUrl || 
    telemetry?.ip ||
    (telemetry && telemetry.status !== 'NOT_CONFIGURED' && telemetry.status !== 'UNCONFIGURED')
  );
  const isOnline = Boolean(telemetry?.online || (telemetry?.playersCount !== undefined && telemetry?.playersCount > 0));
  const isOffline = isConfigured && !isOnline;
  const isNotConfigured = !isConfigured && !isOnline;
  const playersCount = isOnline ? (telemetry?.playersCount ?? 0) : 0;
  const maxPlayers = telemetry?.maxPlayers || 150;
  const capacityPercent = isOnline ? Math.min(100, Math.round((playersCount / maxPlayers) * 100)) : 0;

  const connectTarget = (telemetry?.ip && telemetry?.port) 
    ? `${telemetry.ip}:${telemetry.port}`
    : (siteSettings?.fiveMConnectUrl ? siteSettings.fiveMConnectUrl.replace(/^fivem:\/\/connect\//, '').replace(/^connect\s+/, '').trim() : '');
  const connectCommand = connectTarget ? `connect ${connectTarget}` : '';

  // ================= 60FPS MOUSE PARALLAX & SCROLL DYNAMICS =================
  const heroSectionRef = useRef<HTMLElement | null>(null);
  const heroBgRef = useRef<HTMLDivElement | null>(null);
  const heroFgRef = useRef<HTMLDivElement | null>(null);
  const heroSpotlightRef = useRef<HTMLDivElement | null>(null);
  const rawMousePos = useRef({ x: 0, y: 0, clientX: 0, clientY: 0 });
  const smoothMousePos = useRef({ x: 0, y: 0, clientX: 0, clientY: 0 });
  const [scrollFadeProgress, setScrollFadeProgress] = useState(0);

  useEffect(() => {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    let animId: number;

    const onMouseMove = (e: MouseEvent) => {
      if (prefersReducedMotion) return;
      const heroEl = heroSectionRef.current;
      if (!heroEl) return;
      const rect = heroEl.getBoundingClientRect();
      if (rect.bottom < 0) return; // Scrolled past hero

      const normX = (e.clientX / window.innerWidth) * 2 - 1; // -1 to +1
      const normY = (e.clientY / window.innerHeight) * 2 - 1; // -1 to +1

      rawMousePos.current = {
        x: normX,
        y: normY,
        clientX: e.clientX,
        clientY: e.clientY
      };
    };

    const onScroll = () => {
      const heroHeight = heroSectionRef.current?.offsetHeight || window.innerHeight;
      const progress = Math.min(1, Math.max(0, window.scrollY / (heroHeight * 0.75)));
      setScrollFadeProgress(progress);
    };

    window.addEventListener('mousemove', onMouseMove, { passive: true });
    window.addEventListener('scroll', onScroll, { passive: true });

    // Smooth RAF lerp for silky parallax & spotlight
    const lerpLoop = () => {
      if (!prefersReducedMotion) {
        const ease = 0.08;
        smoothMousePos.current.x += (rawMousePos.current.x - smoothMousePos.current.x) * ease;
        smoothMousePos.current.y += (rawMousePos.current.y - smoothMousePos.current.y) * ease;
        smoothMousePos.current.clientX += (rawMousePos.current.clientX - smoothMousePos.current.clientX) * ease;
        smoothMousePos.current.clientY += (rawMousePos.current.clientY - smoothMousePos.current.clientY) * ease;

        // Background layer subtle inverse drift
        if (heroBgRef.current) {
          const bgX = smoothMousePos.current.x * -16;
          const bgY = smoothMousePos.current.y * -12;
          heroBgRef.current.style.transform = `translate3d(${bgX}px, ${bgY}px, 0)`;
        }

        // Foreground content opposing drift
        if (heroFgRef.current) {
          const fgX = smoothMousePos.current.x * 10;
          const fgY = smoothMousePos.current.y * 8;
          heroFgRef.current.style.transform = `translate3d(${fgX}px, ${fgY}px, 0)`;
        }

        // Copper mouse-follow spotlight
        if (heroSpotlightRef.current) {
          heroSpotlightRef.current.style.transform = `translate3d(${smoothMousePos.current.clientX}px, ${smoothMousePos.current.clientY}px, 0)`;
        }
      }

      animId = requestAnimationFrame(lerpLoop);
    };

    animId = requestAnimationFrame(lerpLoop);

    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('scroll', onScroll);
      if (animId) cancelAnimationFrame(animId);
    };
  }, []);

  const handleCopyConnect = () => {
    if (!connectCommand) {
      return;
    }
    navigator.clipboard.writeText(connectCommand);
    setCopiedConnect(true);
    setTimeout(() => setCopiedConnect(false), 2500);
  };

  const handlePlayNow = () => {
    if (siteSettings?.fiveMConnectUrl) {
      window.location.href = siteSettings.fiveMConnectUrl;
      return;
    }
    if (connectTarget) {
      window.location.href = `fivem://connect/${connectTarget}`;
    }
  };

  const ArrowIcon = isRtl ? ArrowLeft : ArrowRight;

  const HERO_AMBIENT_PARTICLES = [
    { id: 1, left: '14%', bottom: '18%', size: '3px', duration: '9s', delay: '0s' },
    { id: 2, left: '26%', bottom: '26%', size: '4px', duration: '11s', delay: '1.5s' },
    { id: 3, left: '39%', bottom: '14%', size: '2.5px', duration: '8s', delay: '2.8s' },
    { id: 4, left: '54%', bottom: '32%', size: '3.5px', duration: '12s', delay: '0.6s' },
    { id: 5, left: '67%', bottom: '20%', size: '4px', duration: '9.5s', delay: '3.4s' },
    { id: 6, left: '79%', bottom: '28%', size: '2px', duration: '13s', delay: '1.9s' },
    { id: 7, left: '89%', bottom: '15%', size: '3.5px', duration: '10s', delay: '0.3s' },
    { id: 8, left: '21%', bottom: '38%', size: '2.5px', duration: '11.5s', delay: '4.5s' },
    { id: 9, left: '35%', bottom: '22%', size: '3px', duration: '8.5s', delay: '2.2s' },
    { id: 10, left: '72%', bottom: '42%', size: '4px', duration: '12.5s', delay: '1.1s' },
    { id: 11, left: '83%', bottom: '10%', size: '3px', duration: '9s', delay: '3.8s' },
    { id: 12, left: '93%', bottom: '30%', size: '2px', duration: '14s', delay: '0.4s' }
  ];

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
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-[950px] pointer-events-none z-0 overflow-hidden">
        <div className="w-full h-full bg-copper-glow-radial opacity-50" />
        <div className="absolute top-10 left-1/2 -translate-x-1/2 w-[800px] h-[500px] rounded-full bg-[#c8874b]/10 blur-[160px]" />
        <div className="absolute top-80 right-10 w-[450px] h-[450px] rounded-full bg-[#df9f64]/6 blur-[140px]" />
      </div>
      
      {/* Subtle Background Mesh Grid */}
      <div className="absolute inset-0 bg-mesh-grid pointer-events-none opacity-20 z-0" />

      {/* ================= 1. FULL-SCREEN CINEMATIC LIVING HERO SECTION ================= */}
      <section 
        ref={heroSectionRef} 
        className="relative z-10 w-full min-h-[100dvh] flex items-center justify-center overflow-hidden select-none"
      >
        
        {/* FULL-BLEED LIVING BACKGROUND CONTAINER (Edge-to-Edge, Zero Borders, Zero Boxes) */}
        <div className="absolute inset-0 w-full h-full pointer-events-none overflow-hidden z-0">
          
          {/* 1. Cinematic Background Image Layer with Pan/Zoom & Mouse Parallax */}
          <div 
            ref={heroBgRef}
            className="absolute -inset-[5%] w-[110%] h-[110%] will-change-transform pointer-events-none"
          >
            <img
              src={siteSettings?.homepage?.heroImage || "/assets/gta-hero-night.jpg"}
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                if (target.src !== window.location.origin + '/assets/gta-los-santos-skyline.jpg') {
                  target.src = '/assets/gta-los-santos-skyline.jpg';
                }
              }}
              alt="Los Santos Downtown GTA Roleplay Skyline"
              className="w-full h-full object-cover object-center animate-cinematic-hero pointer-events-none transition-all duration-500"
              style={{
                opacity: Math.max(0.12, 0.68 - scrollFadeProgress * 0.48),
                filter: `brightness(${Math.max(0.42, 0.98 - scrollFadeProgress * 0.55)}) contrast(1.15) blur(${scrollFadeProgress * 8}px)`
              }}
            />
          </div>

          {/* 2. Mouse-Follow Spotlight (Radial Copper Aurora Glow) */}
          <div
            ref={heroSpotlightRef}
            className="fixed top-0 left-0 -translate-x-1/2 -translate-y-1/2 w-[650px] h-[650px] rounded-full pointer-events-none blur-[140px] will-change-transform transition-opacity duration-500 hidden md:block"
            style={{
              background: 'radial-gradient(circle, rgba(200, 135, 75, 0.24) 0%, rgba(200, 135, 75, 0.06) 45%, transparent 70%)',
              opacity: Math.max(0, 0.32 - scrollFadeProgress * 0.32)
            }}
          />

          {/* 3. Drifting Atmospheric Fog / Haze Overlay */}
          <div 
            className="absolute inset-0 animate-fog-drift pointer-events-none"
            style={{
              background: 'radial-gradient(ellipse 70% 50% at 50% 60%, rgba(200, 135, 75, 0.08) 0%, rgba(13, 15, 22, 0.25) 50%, transparent 80%)',
              opacity: Math.max(0.1, 0.6 - scrollFadeProgress * 0.5)
            }}
          />

          {/* 4. Floating Ambient Copper Embers & Dust Motes */}
          <div className="absolute inset-0 pointer-events-none overflow-hidden">
            {HERO_AMBIENT_PARTICLES.map((particle) => (
              <span
                key={particle.id}
                className="absolute rounded-full bg-[#df9f64] pointer-events-none animate-particle-float"
                style={{
                  left: particle.left,
                  bottom: particle.bottom,
                  width: particle.size,
                  height: particle.size,
                  animationDuration: particle.duration,
                  animationDelay: particle.delay,
                  boxShadow: '0 0 10px rgba(200, 135, 75, 0.8)',
                  opacity: Math.max(0, 0.65 - scrollFadeProgress * 0.65)
                }}
              />
            ))}
          </div>

          {/* 5. Subtle Cinematic Film Grain Texture */}
          <div className="absolute inset-0 pointer-events-none opacity-[0.03] mix-blend-overlay animate-film-grain">
            <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
              <filter id="hero-film-grain">
                <feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves="3" stitchTiles="stitch" />
                <feColorMatrix type="saturate" values="0" />
              </filter>
              <rect width="100%" height="100%" filter="url(#hero-film-grain)" />
            </svg>
          </div>

          {/* 6. Seamless Symmetrical Atmospheric Vignettes (Edge-to-Edge immersion, No lopsided dark sides) */}
          {/* Top Fade (under global navbar) */}
          <div className="absolute top-0 inset-x-0 h-44 bg-gradient-to-b from-[#08090d] via-[#08090d]/70 to-transparent pointer-events-none" />

          {/* Symmetrical Central Radial Vignette & Backdrop Darkening for maximum contrast & full immersion */}
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_rgba(8,9,13,0.5)_0%,_rgba(8,9,13,0.78)_55%,_#08090d_100%)] pointer-events-none" />
          <div className="absolute inset-0 bg-[#08090d]/30 pointer-events-none" />

          {/* Bottom Fade: Seamless Melt into the website page canvas */}
          <div className="absolute bottom-0 inset-x-0 h-64 sm:h-80 bg-gradient-to-t from-[#08090d] via-[#08090d]/95 via-45% to-transparent pointer-events-none" />

        </div>

        {/* FOREGROUND HERO CONTENT (Full-Screen, Centered, Edge-to-Edge Balanced) */}
        <div 
          ref={heroFgRef}
          className="relative z-10 w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-32 sm:pt-36 pb-16 sm:pb-20 flex flex-col items-center justify-center will-change-transform text-center"
          style={{
            opacity: Math.max(0, 1 - scrollFadeProgress * 1.5),
            transform: `translate3d(0, -${scrollFadeProgress * 45}px, 0)`
          }}
        >
          <div className="w-full max-w-4xl mx-auto flex flex-col items-center justify-center space-y-6 sm:space-y-7 text-center">
            
            {/* Optional Announcement Banner from Homepage CMS */}
            {siteSettings?.homepage?.announcementActive && siteSettings?.homepage?.announcementText && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-3 rounded-xl bg-[#c8874b]/15 border border-[#c8874b]/30 text-xs text-[#df9f64] font-bold flex items-center justify-between gap-3 shadow-lg w-full max-w-2xl mx-auto"
              >
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-[#c8874b] shrink-0" />
                  <span>{siteSettings.homepage.announcementText}</span>
                </div>
                {siteSettings.homepage.announcementLink && (
                  <a
                    href={siteSettings.homepage.announcementLink}
                    target="_blank"
                    rel="noreferrer"
                    className="px-2.5 py-1 rounded-lg bg-[#c8874b] text-black text-[10px] font-black uppercase tracking-wider shrink-0 hover:bg-[#df9f64]"
                  >
                    {language === 'ar' ? 'عرض المزيد' : 'Learn More'}
                  </a>
                )}
              </motion.div>
            )}

            {/* Stagger 1: Small Status / Badge */}
            <motion.div
              initial={{ opacity: 0, y: -16, filter: 'blur(8px)' }}
              animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
              transition={{ duration: 0.45, delay: 0.12, ease: [0.16, 1, 0.3, 1] }}
              className="inline-flex items-center justify-center gap-2.5 px-4 py-1.5 rounded-full bg-[#0d0f16]/90 border border-[#c8874b]/40 text-xs shadow-xl backdrop-blur-xl mx-auto"
            >
              <span className="flex items-center gap-2 font-bold">
                <span className="relative flex h-2.5 w-2.5">
                  {isOnline && (
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 bg-emerald-400" />
                  )}
                  <span 
                    className={`relative inline-flex rounded-full h-2.5 w-2.5 ${
                      isOnline 
                        ? 'bg-emerald-500 shadow-[0_0_8px_#10b981]' 
                        : isOffline 
                        ? 'bg-rose-500 shadow-[0_0_8px_#f43f5e]' 
                        : 'bg-amber-500 shadow-[0_0_8px_#f59e0b]'
                    }`} 
                  />
                </span>
                <span 
                  className={
                    isOnline 
                      ? 'text-emerald-400 font-black' 
                      : isOffline 
                      ? 'text-rose-400 font-black' 
                      : 'text-amber-400 font-black'
                  }
                >
                  {isOnline 
                    ? (language === 'ar' ? 'السيرفر متصل الآن' : 'SERVER ONLINE') 
                    : isOffline 
                    ? (language === 'ar' ? 'السيرفر غير متصل' : 'SERVER OFFLINE')
                    : (language === 'ar' ? 'في انتظار التهيئة' : 'NOT CONFIGURED')}
                </span>
              </span>
              <span className="text-white/20">•</span>
              <span className="text-[#df9f64] font-black uppercase tracking-widest text-[11px] font-rajdhani">
                {language === 'ar' 
                  ? (siteSettings?.homepage?.heroBadgeTextAr || 'عصر جديد • واقع لا مثيل له')
                  : (siteSettings?.homepage?.heroBadgeTextEn || 'A NEW ERA • A REALER WORLD')}
              </span>
            </motion.div>

            {/* Stagger 2: Large Cinematic Display Heading */}
            <motion.h1
              initial={{ opacity: 0, y: 22, scale: 0.96, filter: 'blur(10px)' }}
              animate={{ opacity: 1, y: 0, scale: 1, filter: 'blur(0px)' }}
              transition={{ duration: 0.55, delay: 0.24, ease: [0.16, 1, 0.3, 1] }}
              className="text-5xl sm:text-7xl md:text-8xl lg:text-9xl font-black tracking-tight text-white uppercase leading-[0.98] font-rajdhani drop-shadow-2xl text-center mx-auto"
            >
              {siteSettings?.homepage?.heroTitleAr && language === 'ar' ? (
                <span className="block text-white copper-gradient-shimmer">
                  {siteSettings.homepage.heroTitleAr}
                </span>
              ) : siteSettings?.homepage?.heroTitleEn && language === 'en' ? (
                <span className="block text-white copper-gradient-shimmer">
                  {siteSettings.homepage.heroTitleEn}
                </span>
              ) : (
                <>
                  <span className="block text-white">
                    {language === 'ar' ? 'مدينة صُنعت' : 'A CITY'}
                  </span>
                  <span className="block text-white copper-gradient-shimmer">
                    {language === 'ar' ? 'بأيديكم' : 'BUILT BY YOU'}
                  </span>
                </>
              )}
            </motion.h1>

            {/* Stagger 3: Narrative Hero Subtitle */}
            <motion.p
              initial={{ opacity: 0, y: 18, filter: 'blur(6px)' }}
              animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
              transition={{ duration: 0.5, delay: 0.38, ease: [0.16, 1, 0.3, 1] }}
              className="text-sm sm:text-base md:text-lg lg:text-xl text-[#b8b8be] max-w-2xl sm:max-w-3xl mx-auto leading-relaxed font-normal text-center"
            >
              {language === 'ar'
                ? (siteSettings?.homepage?.heroSubtitleAr || 'مدينة حية متكاملة بُنيت بعناية لعشاق اللعب الواقعي الجاد. نظام اقتصادي متوازن، وظائف رسمية بمحاكاة كاملة، صوت ثلاثي الأبعاد محيطي، وأداء ثابت يضمن تجربة خالية من التقطيع.')
                : (siteSettings?.homepage?.heroSubtitleEn || 'A living, breathing metropolis built for authentic storylines, dedicated community, custom MDT systems, 3D spatial radio, and seamless 60 FPS netcode.')}
            </motion.p>

            {/* Stagger 4: Integrated CTA Buttons with Hover Glow & Micro-motion */}
            <motion.div
              initial={{ opacity: 0, y: 16, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.45, delay: 0.52, ease: [0.16, 1, 0.3, 1] }}
              className="flex flex-wrap items-center justify-center gap-4 pt-2 mx-auto"
            >
              <MagneticButton onClick={handlePlayNow}>
                <div 
                  className="group relative overflow-hidden flex items-center gap-3 px-8 py-4 rounded-full bg-[#c8874b] hover:bg-[#df9f64] text-black font-black text-xs uppercase tracking-wider transition-all duration-300 shadow-[0_10px_35px_rgba(200,135,75,0.35)] hover:shadow-[0_0_35px_rgba(200,135,75,0.65)] hover:scale-105 active:scale-95 cursor-pointer"
                  data-cursor="pointer"
                >
                  <Play className="w-4 h-4 fill-current group-hover:translate-x-1 rtl:group-hover:-translate-x-1 group-hover:scale-110 transition-transform duration-200" />
                  <span>{language === 'ar' ? 'دخول السيرفر الآن' : 'CONNECT NOW'}</span>
                </div>
              </MagneticButton>

              <MagneticButton>
                <a
                  href={siteSettings?.discordUrl || 'https://discord.gg/primerp'}
                  target="_blank"
                  rel="noreferrer"
                  className="group flex items-center gap-2.5 px-7 py-4 rounded-full bg-[#0d0f16]/85 hover:bg-[#131622] border border-white/[0.12] hover:border-[#5865F2] text-white font-bold text-xs uppercase tracking-wider transition-all duration-300 backdrop-blur-xl shadow-lg hover:shadow-[0_0_25px_rgba(88,101,242,0.35)] cursor-pointer"
                  data-cursor="pointer"
                >
                  <MessageSquare className="w-4 h-4 text-[#5865F2] group-hover:scale-110 transition-transform duration-200" />
                  <span>{language === 'ar' ? 'مجتمع الديسكورد' : 'JOIN DISCORD'}</span>
                </a>
              </MagneticButton>
            </motion.div>

            {/* Stagger 5: Real-data Server Status Panel */}
            <motion.div
              initial={{ opacity: 0, y: 20, filter: 'blur(6px)' }}
              animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
              transition={{ duration: 0.5, delay: 0.64, ease: [0.16, 1, 0.3, 1] }}
              className="pt-3 w-full max-w-lg mx-auto text-start"
            >
              <div className="p-4 rounded-2xl bg-[#0d0f16]/80 backdrop-blur-xl border border-white/[0.08] shadow-2xl space-y-3">
                
                {/* Telemetry Stats Bar */}
                <div className="flex items-center justify-between text-xs font-mono">
                  <div className="flex items-center gap-2">
                    <span 
                      className={`w-2 h-2 rounded-full ${
                        isOnline 
                          ? 'bg-emerald-400 animate-pulse' 
                          : isOffline 
                          ? 'bg-rose-500' 
                          : 'bg-amber-400'
                      }`} 
                    />
                    <span className="text-white font-bold">
                      {isOnline 
                        ? 'PRIME NODE #1' 
                        : isOffline 
                        ? 'PRIME NODE #1 (OFFLINE)' 
                        : 'FIVEM NODE'}
                    </span>
                    {isOnline && (
                      <>
                        <span className="text-[#666]">•</span>
                        <span className="text-[#df9f64]">{telemetry?.pingMs || telemetry?.ping || 24}ms</span>
                      </>
                    )}
                  </div>
                  <div className="text-white font-bold font-rajdhani">
                    {isOnline ? (
                      <>
                        <span className="text-[#c8874b]">{playersCount}</span> / {maxPlayers} Citizens
                      </>
                    ) : isOffline ? (
                      <span className="text-rose-400 font-semibold">{language === 'ar' ? 'السيرفر متوقف' : 'Offline'}</span>
                    ) : (
                      <span className="text-amber-400 font-semibold">{language === 'ar' ? 'وضع الاستعداد' : 'Standby'}</span>
                    )}
                  </div>
                </div>

                {/* Progress Bar with Bronze Gradient (Real capacity or dormant) */}
                <div className="w-full h-1.5 rounded-full bg-white/[0.08] overflow-hidden">
                  <div 
                    className="h-full rounded-full bg-gradient-to-r from-[#9e6331] via-[#c8874b] to-[#df9f64] shadow-[0_0_8px_rgba(200,135,75,0.8)] transition-all duration-700"
                    style={{ width: `${capacityPercent}%` }}
                  />
                </div>

                {/* One-click F8 Connect Pill */}
                <div className="flex items-center justify-between pt-1 border-t border-white/[0.04] text-[11px]">
                  <span className="text-[#888] font-mono select-all truncate">
                    {connectCommand || (language === 'ar' ? 'سيرفر FiveM قيد الإعداد' : 'FXServer Direct Connect Pending')}
                  </span>
                  <button
                    onClick={handleCopyConnect}
                    className="inline-flex items-center gap-1 text-[#df9f64] hover:text-white font-bold ml-2 shrink-0 transition-colors cursor-pointer"
                    data-cursor="pointer"
                  >
                    {copiedConnect ? (
                      <>
                        <Check className="w-3 h-3 text-emerald-400" />
                        <span className="text-emerald-400">{language === 'ar' ? 'تم النسخ' : 'Copied'}</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3 h-3" />
                        <span>{language === 'ar' ? 'نسخ F8' : 'Copy F8'}</span>
                      </>
                    )}
                  </button>
                </div>

              </div>
            </motion.div>

            {/* Scroll Down Invitation */}
            <motion.button
              onClick={() => {
                document.getElementById('about')?.scrollIntoView({ behavior: 'smooth' });
              }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.75, y: [0, 6, 0] }}
              transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
              className="pt-2 flex flex-col items-center gap-1 text-white/40 hover:text-[#c8874b] transition-colors cursor-pointer group mx-auto"
              aria-label="Scroll down"
            >
              <span className="text-[10px] tracking-widest font-mono uppercase text-white/50 group-hover:text-[#df9f64] transition-colors">
                {language === 'ar' ? 'استكشف السيرفر' : 'EXPLORE PRIME RP'}
              </span>
              <ChevronDown className="w-4 h-4 text-[#c8874b] group-hover:translate-y-0.5 transition-transform" />
            </motion.button>

          </div>
        </div>
      </section>

      {/* ================= 2. FEATURES • VISUAL STORYTELLING (Exact Frame 2 Reference) ================= */}
      <section id="about" className="py-28 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto border-t border-white/[0.06] relative z-10 scroll-mt-24">
        
        {/* Section Header with Category Tabs */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <div>
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#c8874b]/10 text-[#df9f64] text-xs font-black mb-3 uppercase tracking-widest border border-[#c8874b]/20 font-rajdhani">
              <Sparkles className="w-3.5 h-3.5 text-[#c8874b]" />
              <span>{language === 'ar' ? 'المميزات • عالم حي ومتكامل' : 'FEATURES • A LIVING ECOSYSTEM'}</span>
            </div>
            <h2 className="text-3xl sm:text-5xl font-black text-white uppercase tracking-tight font-rajdhani">
              {language === 'ar' ? 'عالم واسع بمصائر وشخصيات حقيقية' : 'A Living City • Deep Realistic Roleplay'}
            </h2>
            <p className="text-[#a1a1a1] text-xs sm:text-sm mt-1.5 max-w-xl leading-relaxed">
              {language === 'ar'
                ? 'توازن واقعي بين سلطة القانون، والخدمات الإنسانية، والتجارة الحرة، وصراع العصابات المنضبط بأعلى معايير الرول بلاي.'
                : 'Immerse yourself in deeply scripted sectors with authentic MDTs, player-run corporations, courtroom trials, and underground racing culture.'}
            </p>
          </div>

          {/* Category Tabs Strip */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
            {citySectors.map((sector) => {
              const active = activeTabSector === sector.id;
              const SectorIcon = sector.icon;
              return (
                <button
                  key={sector.id}
                  onClick={() => setActiveTabSector(sector.id)}
                  className={`px-4 py-2.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer flex items-center gap-2 ${
                    active
                      ? 'bg-[#c8874b] text-black font-black shadow-lg shadow-[#c8874b]/25 uppercase tracking-wider'
                      : 'bg-[#0d0f16] text-[#888] hover:text-white border border-white/[0.06] hover:border-white/[0.15]'
                  }`}
                >
                  <SectorIcon className="w-3.5 h-3.5" />
                  <span>{language === 'ar' ? sector.badgeAr : sector.badgeEn}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* TOP ROW: 3 Editorial Visual Panels */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 mb-8">
          
          {/* Panel 1 (Wide): Amber Skyline Silhouette & New Era */}
          <div className="md:col-span-6 rounded-3xl bg-[#0d0f16] border border-white/[0.08] hover:border-[#c8874b]/50 transition-all relative overflow-hidden h-80 group shadow-xl">
            <img
              src="https://images.unsplash.com/photo-1519501025264-65ba15a82390?auto=format&fit=crop&w=1200&q=80"
              alt="Metropolis Skyline"
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 opacity-60"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#0d0f16] via-[#0d0f16]/50 to-transparent" />
            <div className="absolute inset-0 p-6 sm:p-8 flex flex-col justify-end">
              <div className="flex items-center gap-2 mb-2.5">
                <span className="px-2.5 py-1 rounded-md bg-[#c8874b]/20 border border-[#c8874b]/40 text-[#df9f64] text-[10px] font-black uppercase tracking-wider">
                  {language === 'ar' ? 'العالم الحي' : 'THE LIVING WORLD'}
                </span>
                <span className="px-2 py-0.5 rounded-md bg-black/60 border border-white/[0.08] text-[10px] font-mono text-[#a1a1a1]">
                  100% PLAYER DRIVEN
                </span>
              </div>
              <h3 className="text-2xl sm:text-3xl font-black text-white uppercase font-rajdhani mb-2">
                {language === 'ar' ? 'اقتصاد حر وصوت ثلاثي الأبعاد' : 'Sovereign Economy & 3D Spatial Audio'}
              </h3>
              <p className="text-xs text-[#b8bcc8] line-clamp-2 max-w-lg leading-relaxed">
                {language === 'ar' 
                  ? 'كافة الشركات، العقارات، ومحطات التعديل يديرها اللاعبون بالكامل دون تدخل الإدارة، مع راديو SaltyChat ثلاثي الأبعاد لنقاء صوتي واقعي.'
                  : 'Player-run enterprises, real estate investments, and SaltyChat spatial radio for authentic proximity communication.'}
              </p>
            </div>
          </div>

          {/* Panel 2 (Center): High-Altitude LS Skyscraper telemetry */}
          <div className="md:col-span-3 rounded-3xl bg-[#0d0f16] border border-white/[0.08] hover:border-sky-500/50 transition-all relative overflow-hidden h-80 group shadow-xl">
            <img
              src="https://images.unsplash.com/photo-1477959858617-67f30bc75b82?auto=format&fit=crop&w=800&q=80"
              alt="Night LS Lights"
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 opacity-55"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#0d0f16] via-[#0d0f16]/60 to-transparent" />
            <div className="absolute inset-0 p-6 flex flex-col justify-end">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-[#38bdf8] font-mono text-[10px] font-bold px-2 py-0.5 rounded bg-sky-500/10 border border-sky-500/20">
                  60 FPS • 128 TICK
                </span>
              </div>
              <h4 className="text-xl font-black text-white font-rajdhani mb-1">
                {language === 'ar' ? 'سيرفر بدون لاق' : 'Zero Netcode Stutter'}
              </h4>
              <p className="text-xs text-[#969cad] line-clamp-2 leading-relaxed">
                {language === 'ar' ? 'بنية برمجية محسنة تضمن سلاسة تامة أثناء المطاردات الكبرى.' : 'Custom synchronization architecture engineered for seamless high-speed pursuits.'}
              </p>
            </div>
          </div>

          {/* Panel 3 (Right): Police & Syndicate Encounter Portrait */}
          <div className="md:col-span-3 rounded-3xl bg-[#0d0f16] border border-white/[0.08] hover:border-purple-500/50 transition-all relative overflow-hidden h-80 group shadow-xl">
            <img
              src="https://images.unsplash.com/photo-1508739773434-c26b3d09e071?auto=format&fit=crop&w=800&q=80"
              alt="Underground Noir"
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 opacity-55"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#0d0f16] via-[#0d0f16]/60 to-transparent" />
            <div className="absolute inset-0 p-6 flex flex-col justify-end">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-purple-400 font-mono text-[10px] font-bold px-2 py-0.5 rounded bg-purple-500/10 border border-purple-500/20">
                  FAIR PLAY RP
                </span>
              </div>
              <h4 className="text-xl font-black text-white font-rajdhani mb-1">
                {language === 'ar' ? 'قوانين صارمة وحماية' : 'Strict NLR & FearRP'}
              </h4>
              <p className="text-xs text-[#969cad] line-clamp-2 leading-relaxed">
                {language === 'ar' ? 'محاكمات وجلسات قضاء علنية لحفظ حقوق كل مواطن.' : 'Judicial due process guaranteed by official Department of Justice magistrates.'}
              </p>
            </div>
          </div>

        </div>

        {/* BOTTOM ROW: 4 Tall Character Archetype Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {citySectors.slice(0, 4).map((sector) => {
            const Icon = sector.icon;
            const isSelected = activeTabSector === sector.id;
            return (
              <div
                key={sector.id}
                onClick={() => setActiveTabSector(sector.id)}
                className={`group rounded-3xl bg-[#0d0f16] border overflow-hidden transition-all duration-300 cursor-pointer flex flex-col justify-between h-[440px] ${
                  isSelected 
                    ? 'border-[#c8874b] shadow-2xl shadow-[#c8874b]/20 scale-[1.01]' 
                    : 'border-white/[0.08] hover:border-[#c8874b]/60 hover:shadow-xl'
                }`}
              >
                {/* Upper 60% Portrait */}
                <div className="h-[60%] relative overflow-hidden bg-[#131620]">
                  <img
                    src={sector.image}
                    alt={sector.titleEn}
                    className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-700 opacity-80 group-hover:opacity-100"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0d0f16] via-[#0d0f16]/35 to-transparent" />
                  
                  {/* Department Pill */}
                  <div className="absolute top-3 left-3 rtl:left-auto rtl:right-3 flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-black/85 backdrop-blur-md text-[10px] font-black uppercase tracking-wider border border-white/10"
                    style={{ color: sector.accent }}
                  >
                    <Icon className="w-3 h-3" />
                    <span>{language === 'ar' ? sector.badgeAr : sector.badgeEn}</span>
                  </div>

                  {/* Archetype Role Name */}
                  <div className="absolute bottom-3 left-4 rtl:left-auto rtl:right-4">
                    <span className="text-lg font-black text-white font-rajdhani block">
                      {language === 'ar' ? sector.roleAr : sector.roleEn}
                    </span>
                  </div>
                </div>

                {/* Lower 40% Container */}
                <div className="p-5 flex-grow flex flex-col justify-between space-y-3">
                  <p className="text-xs text-[#a1a1a8] leading-relaxed line-clamp-3">
                    {language === 'ar' ? sector.descAr : sector.descEn}
                  </p>

                  <div className="pt-2 border-t border-white/[0.05] flex items-center justify-between">
                    <span className="text-[10px] text-[#df9f64] font-mono font-bold">{sector.stats[0].val}</span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setCurrentTab(sector.actionTab);
                      }}
                      className="px-3 py-1.5 rounded-lg bg-[#131620] hover:bg-[#c8874b] text-[#df9f64] hover:text-black text-[11px] font-bold uppercase transition-all flex items-center gap-1 cursor-pointer border border-white/[0.06] hover:border-[#c8874b]"
                    >
                      <span>{language === 'ar' ? 'التفاصيل' : 'Explore'}</span>
                      <ArrowIcon className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

      </section>

      {/* ================= 3. STORE • MODERN & INTERACTIVE (Exact Frame 3 Reference) ================= */}
      <section className="py-28 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto border-t border-white/[0.06] relative z-10">
        
        {/* Section Header Bar */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-12 gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#c8874b]/10 text-[#df9f64] text-xs font-black mb-2 uppercase tracking-widest border border-[#c8874b]/20 font-rajdhani">
              <Crown className="w-3.5 h-3.5 text-[#c8874b]" />
              <span>{language === 'ar' ? 'المتجر • عصري وتفاعلي' : 'STORE • MODERN & INTERACTIVE'}</span>
            </div>
            <h2 className="text-3xl sm:text-5xl font-black text-white uppercase tracking-tight font-rajdhani">
              {language === 'ar' ? 'صالة عرض المركبات والباقات الملكية' : 'Tebex VIP Showroom & Packages'}
            </h2>
            <p className="text-[#a1a1a1] text-xs sm:text-sm mt-1 max-w-xl">
              {language === 'ar' ? 'تسليم تلقائي فوري داخل اللعبة بمجرد إتمام العملية عبر بوابات دفع آمنة ومعتمدة.' : 'Instant automated in-game delivery upon checkout via verified secure payment gateways.'}
            </p>
          </div>
          <button
            onClick={() => setCurrentTab('store')}
            className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-wider text-[#c8874b] hover:text-[#df9f64] transition-colors cursor-pointer"
          >
            <span>{language === 'ar' ? 'تصفح كافة باقات المتجر' : 'Explore Entire Store'}</span>
            <ArrowIcon className="w-4 h-4" />
          </button>
        </div>

        {/* EXACT 6-CARD GRID (2 Rows of 3 Cards • Exact Layout of Mockup 3) */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          
          {/* Card 1: Overflod Autarch (White Supercar) */}
          <div className="rounded-3xl bg-[#0d0f16] border border-white/[0.08] hover:border-[#c8874b] p-5 shadow-2xl relative overflow-hidden transition-all duration-300 card-hover-lift group flex flex-col justify-between">
            <div>
              <div className="h-52 rounded-2xl overflow-hidden mb-4 relative bg-[#131620]">
                <img
                  src="https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?auto=format&fit=crop&w=800&q=80"
                  alt="Overflod Autarch"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute top-3 left-3 rtl:left-auto rtl:right-3 px-2.5 py-1 rounded-md bg-black/80 backdrop-blur-md text-[#38bdf8] text-[10px] font-black uppercase tracking-wider border border-white/10">
                  VEHICLES
                </div>
                <div className="absolute bottom-2.5 left-2.5 rtl:left-auto rtl:right-2.5 flex items-center gap-1.5">
                  <span className="px-2 py-0.5 rounded bg-black/70 backdrop-blur-md text-[10px] font-mono text-white/90">340 KM/H</span>
                  <span className="px-2 py-0.5 rounded bg-black/70 backdrop-blur-md text-[10px] font-mono text-[#df9f64]">AWD</span>
                </div>
              </div>
              <h3 className="text-xl font-black text-white group-hover:text-[#df9f64] transition-colors font-rajdhani">
                OVERFLOD AUTARCH HYPERCAR
              </h3>
              <p className="text-xs text-[#a1a1a8] leading-relaxed mt-1 line-clamp-2">
                Twin-turbo custom engine audio, carbon-fiber aerodynamics, and reserved vanity registration.
              </p>
            </div>
            <div className="pt-4 mt-4 border-t border-white/[0.06] flex items-center justify-between">
              <div>
                <span className="text-[10px] text-[#717684] block font-bold uppercase">Price</span>
                <span className="text-2xl font-black text-[#df9f64] font-rajdhani">$34.99 <span className="text-xs font-normal text-[#888]">USD</span></span>
              </div>
              <button
                onClick={() => setCurrentTab('store')}
                className="px-5 py-2.5 rounded-xl bg-[#c8874b] hover:bg-[#df9f64] text-black text-xs font-black uppercase tracking-wider transition-all flex items-center gap-1.5 cursor-pointer shadow-md shadow-[#c8874b]/20"
              >
                <ShoppingBag className="w-3.5 h-3.5" />
                <span>{language === 'ar' ? 'شراء' : 'Purchase'}</span>
              </button>
            </div>
          </div>

          {/* Card 2: Pfister Comet S2 (Orange/Bronze Supercar) */}
          <div className="rounded-3xl bg-[#0d0f16] border border-[#c8874b]/50 hover:border-[#df9f64] p-5 shadow-2xl relative overflow-hidden transition-all duration-300 card-hover-lift group flex flex-col justify-between">
            <div>
              <div className="h-52 rounded-2xl overflow-hidden mb-4 relative bg-[#131620]">
                <img
                  src="https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=800&q=80"
                  alt="Pfister Comet S2"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute top-3 left-3 rtl:left-auto rtl:right-3 px-2.5 py-1 rounded-md bg-[#c8874b]/20 border border-[#c8874b]/40 text-[#df9f64] text-[10px] font-black uppercase tracking-wider">
                  FEATURED
                </div>
                <div className="absolute bottom-2.5 left-2.5 rtl:left-auto rtl:right-2.5 flex items-center gap-1.5">
                  <span className="px-2 py-0.5 rounded bg-black/70 backdrop-blur-md text-[10px] font-mono text-white/90">315 KM/H</span>
                  <span className="px-2 py-0.5 rounded bg-black/70 backdrop-blur-md text-[10px] font-mono text-[#df9f64]">DRIFT TUNE</span>
                </div>
              </div>
              <h3 className="text-xl font-black text-white group-hover:text-[#df9f64] transition-colors font-rajdhani">
                PFISTER COMET S2 TUNER
              </h3>
              <p className="text-xs text-[#a1a1a8] leading-relaxed mt-1 line-clamp-2">
                Midnight drift tune, bespoke widebody package, anti-lag ECU map, and custom interior trim.
              </p>
            </div>
            <div className="pt-4 mt-4 border-t border-white/[0.06] flex items-center justify-between">
              <div>
                <span className="text-[10px] text-[#717684] block font-bold uppercase">Price</span>
                <span className="text-2xl font-black text-[#df9f64] font-rajdhani">$29.99 <span className="text-xs font-normal text-[#888]">USD</span></span>
              </div>
              <button
                onClick={() => setCurrentTab('store')}
                className="px-5 py-2.5 rounded-xl bg-[#c8874b] hover:bg-[#df9f64] text-black text-xs font-black uppercase tracking-wider transition-all flex items-center gap-1.5 cursor-pointer shadow-md shadow-[#c8874b]/20"
              >
                <ShoppingBag className="w-3.5 h-3.5" />
                <span>{language === 'ar' ? 'شراء' : 'Purchase'}</span>
              </button>
            </div>
          </div>

          {/* Card 3: Enus Paragon R (Charcoal Luxury Coupe) */}
          <div className="rounded-3xl bg-[#0d0f16] border border-white/[0.08] hover:border-[#c8874b] p-5 shadow-2xl relative overflow-hidden transition-all duration-300 card-hover-lift group flex flex-col justify-between">
            <div>
              <div className="h-52 rounded-2xl overflow-hidden mb-4 relative bg-[#131620]">
                <img
                  src="https://images.unsplash.com/photo-1552519507-da3b142c6e3d?auto=format&fit=crop&w=800&q=80"
                  alt="Enus Paragon R"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute top-3 left-3 rtl:left-auto rtl:right-3 px-2.5 py-1 rounded-md bg-black/80 backdrop-blur-md text-[#a855f7] text-[10px] font-black uppercase tracking-wider border border-white/10">
                  EXECUTIVE
                </div>
                <div className="absolute bottom-2.5 left-2.5 rtl:left-auto rtl:right-2.5 flex items-center gap-1.5">
                  <span className="px-2 py-0.5 rounded bg-black/70 backdrop-blur-md text-[10px] font-mono text-white/90">285 KM/H</span>
                  <span className="px-2 py-0.5 rounded bg-black/70 backdrop-blur-md text-[10px] font-mono text-emerald-400">ARMORED</span>
                </div>
              </div>
              <h3 className="text-xl font-black text-white group-hover:text-[#df9f64] transition-colors font-rajdhani">
                ENUS PARAGON R ARMORED
              </h3>
              <p className="text-xs text-[#a1a1a8] leading-relaxed mt-1 line-clamp-2">
                Reinforced bullet-resistant glass, presidential leather cabin, and silent executive cruiser engine.
              </p>
            </div>
            <div className="pt-4 mt-4 border-t border-white/[0.06] flex items-center justify-between">
              <div>
                <span className="text-[10px] text-[#717684] block font-bold uppercase">Price</span>
                <span className="text-2xl font-black text-[#df9f64] font-rajdhani">$24.99 <span className="text-xs font-normal text-[#888]">USD</span></span>
              </div>
              <button
                onClick={() => setCurrentTab('store')}
                className="px-5 py-2.5 rounded-xl bg-[#131620] hover:bg-[#c8874b] text-[#df9f64] hover:text-black border border-white/[0.08] hover:border-[#c8874b] text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <ShoppingBag className="w-3.5 h-3.5" />
                <span>{language === 'ar' ? 'شراء' : 'Purchase'}</span>
              </button>
            </div>
          </div>

          {/* Card 4: Grotti Itali RSX (Silver Exotic Hypercar) */}
          <div className="rounded-3xl bg-[#0d0f16] border border-white/[0.08] hover:border-[#c8874b] p-5 shadow-2xl relative overflow-hidden transition-all duration-300 card-hover-lift group flex flex-col justify-between">
            <div>
              <div className="h-52 rounded-2xl overflow-hidden mb-4 relative bg-[#131620]">
                <img
                  src="https://images.unsplash.com/photo-1617814076367-b759c7d7e738?auto=format&fit=crop&w=800&q=80"
                  alt="Grotti Itali RSX"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute top-3 left-3 rtl:left-auto rtl:right-3 px-2.5 py-1 rounded-md bg-black/80 backdrop-blur-md text-[#38bdf8] text-[10px] font-black uppercase tracking-wider border border-white/10">
                  VEHICLES
                </div>
                <div className="absolute bottom-2.5 left-2.5 rtl:left-auto rtl:right-2.5 flex items-center gap-1.5">
                  <span className="px-2 py-0.5 rounded bg-black/70 backdrop-blur-md text-[10px] font-mono text-white/90">350 KM/H</span>
                  <span className="px-2 py-0.5 rounded bg-black/70 backdrop-blur-md text-[10px] font-mono text-[#38bdf8]">V12 NA</span>
                </div>
              </div>
              <h3 className="text-xl font-black text-white group-hover:text-[#df9f64] transition-colors font-rajdhani">
                GROTTI ITALI RSX SPEEDSTER
              </h3>
              <p className="text-xs text-[#a1a1a8] leading-relaxed mt-1 line-clamp-2">
                Active aerodynamic wing, high-revving naturally aspirated V12 sound, and carbon ceramic brakes.
              </p>
            </div>
            <div className="pt-4 mt-4 border-t border-white/[0.06] flex items-center justify-between">
              <div>
                <span className="text-[10px] text-[#717684] block font-bold uppercase">Price</span>
                <span className="text-2xl font-black text-[#df9f64] font-rajdhani">$39.99 <span className="text-xs font-normal text-[#888]">USD</span></span>
              </div>
              <button
                onClick={() => setCurrentTab('store')}
                className="px-5 py-2.5 rounded-xl bg-[#131620] hover:bg-[#c8874b] text-[#df9f64] hover:text-black border border-white/[0.08] hover:border-[#c8874b] text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <ShoppingBag className="w-3.5 h-3.5" />
                <span>{language === 'ar' ? 'شراء' : 'Purchase'}</span>
              </button>
            </div>
          </div>

          {/* Card 5: Prime VIP Empire Pass (Syndicate Executive Bundle) */}
          <div className="rounded-3xl bg-[#0d0f16] border border-[#c8874b]/50 hover:border-[#df9f64] p-5 shadow-2xl relative overflow-hidden transition-all duration-300 card-hover-lift group flex flex-col justify-between">
            <div>
              <div className="h-52 rounded-2xl overflow-hidden mb-4 relative bg-[#131620]">
                <img
                  src="https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=800&q=80"
                  alt="Prime VIP Empire Pass"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute top-3 left-3 rtl:left-auto rtl:right-3 px-2.5 py-1 rounded-md bg-[#c8874b]/20 border border-[#c8874b]/40 text-[#df9f64] text-[10px] font-black uppercase tracking-wider">
                  VIP PASS
                </div>
                <div className="absolute bottom-2.5 left-2.5 rtl:left-auto rtl:right-2.5 flex items-center gap-1.5">
                  <span className="px-2 py-0.5 rounded bg-black/70 backdrop-blur-md text-[10px] font-mono text-[#df9f64]">QUEUE #1</span>
                  <span className="px-2 py-0.5 rounded bg-black/70 backdrop-blur-md text-[10px] font-mono text-emerald-400">$250K CASH</span>
                </div>
              </div>
              <h3 className="text-xl font-black text-white group-hover:text-[#df9f64] transition-colors font-rajdhani">
                PRIME VIP EMPIRE PASS
              </h3>
              <p className="text-xs text-[#a1a1a8] leading-relaxed mt-1 line-clamp-2">
                Sovereign citizen status, priority queue #1, custom Discord badge, and 5-car garage allocation.
              </p>
            </div>
            <div className="pt-4 mt-4 border-t border-white/[0.06] flex items-center justify-between">
              <div>
                <span className="text-[10px] text-[#717684] block font-bold uppercase">Price</span>
                <span className="text-2xl font-black text-[#df9f64] font-rajdhani">$49.99 <span className="text-xs font-normal text-[#888]">USD</span></span>
              </div>
              <button
                onClick={() => setCurrentTab('store')}
                className="px-5 py-2.5 rounded-xl bg-[#c8874b] hover:bg-[#df9f64] text-black text-xs font-black uppercase tracking-wider transition-all flex items-center gap-1.5 cursor-pointer shadow-md shadow-[#c8874b]/20"
              >
                <ShoppingBag className="w-3.5 h-3.5" />
                <span>{language === 'ar' ? 'شراء' : 'Purchase'}</span>
              </button>
            </div>
          </div>

          {/* Card 6: Vinewood Hills Penthouse (Luxury Estate MLO) */}
          <div className="rounded-3xl bg-[#0d0f16] border border-white/[0.08] hover:border-[#c8874b] p-5 shadow-2xl relative overflow-hidden transition-all duration-300 card-hover-lift group flex flex-col justify-between">
            <div>
              <div className="h-52 rounded-2xl overflow-hidden mb-4 relative bg-[#131620]">
                <img
                  src="https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=800&q=80"
                  alt="Vinewood Hills Mansion"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute top-3 left-3 rtl:left-auto rtl:right-3 px-2.5 py-1 rounded-md bg-black/80 backdrop-blur-md text-[#a855f7] text-[10px] font-black uppercase tracking-wider border border-white/10">
                  PROPERTIES
                </div>
                <div className="absolute bottom-2.5 left-2.5 rtl:left-auto rtl:right-2.5 flex items-center gap-1.5">
                  <span className="px-2 py-0.5 rounded bg-black/70 backdrop-blur-md text-[10px] font-mono text-purple-400">HELIPAD</span>
                  <span className="px-2 py-0.5 rounded bg-black/70 backdrop-blur-md text-[10px] font-mono text-white/90">10-GARAGE</span>
                </div>
              </div>
              <h3 className="text-xl font-black text-white group-hover:text-[#df9f64] transition-colors font-rajdhani">
                VINEWOOD LUXURY PENTHOUSE
              </h3>
              <p className="text-xs text-[#a1a1a8] leading-relaxed mt-1 line-clamp-2">
                Custom MLO interior, private infinity pool overlooking LS, rooftop helipad, and 10-car garage.
              </p>
            </div>
            <div className="pt-4 mt-4 border-t border-white/[0.06] flex items-center justify-between">
              <div>
                <span className="text-[10px] text-[#717684] block font-bold uppercase">Price</span>
                <span className="text-2xl font-black text-[#df9f64] font-rajdhani">$44.99 <span className="text-xs font-normal text-[#888]">USD</span></span>
              </div>
              <button
                onClick={() => setCurrentTab('store')}
                className="px-5 py-2.5 rounded-xl bg-[#131620] hover:bg-[#c8874b] text-[#df9f64] hover:text-black border border-white/[0.08] hover:border-[#c8874b] text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <ShoppingBag className="w-3.5 h-3.5" />
                <span>{language === 'ar' ? 'شراء' : 'Purchase'}</span>
              </button>
            </div>
          </div>

        </div>

        {/* Regular Store Grid */}
        {featuredProducts.length > 0 && (
          <div className="mt-14">
            <div className="text-xs font-bold text-[#a1a1a8] uppercase tracking-wider mb-5 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#c8874b]" />
              <span>{language === 'ar' ? 'حزم وعناصر إضافية للمواطنين:' : 'Additional Citizen Packages & Items:'}</span>
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
                        <span className="text-[10px] text-[#717684] block font-bold uppercase tracking-wider">
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
      <section className="py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto border-t border-white/[0.06] relative z-10">
        <div className="text-center max-w-2xl mx-auto mb-14">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#c8874b]/10 text-[#df9f64] text-xs font-black mb-3 uppercase tracking-widest border border-[#c8874b]/20 font-rajdhani">
            <Server className="w-3.5 h-3.5 text-[#c8874b]" />
            <span>{language === 'ar' ? 'البنية التحتية والمواصفات' : 'SYSTEM ARCHITECTURE & STANDARDS'}</span>
          </div>
          <h2 className="text-3xl sm:text-5xl font-black text-white uppercase tracking-tight font-rajdhani">
            {t('features.title')}
          </h2>
          <p className="text-[#a1a1a8] text-xs sm:text-sm mt-2">
            {t('features.subtitle')}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="p-6 rounded-2xl bg-[#0d0f16] border border-white/[0.06] hover:border-[#c8874b]/60 transition-all card-hover-lift group shadow-lg">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 rounded-xl bg-[#c8874b]/10 border border-[#c8874b]/20 flex items-center justify-center text-[#df9f64] group-hover:scale-110 transition-transform">
                <DollarSign className="w-6 h-6" />
              </div>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                100% PLAYER RUN
              </span>
            </div>
            <h3 className="text-lg font-black text-white mb-2 font-rajdhani">{t('features.economy')}</h3>
            <p className="text-xs text-[#a1a1a8] leading-relaxed">{t('features.economyDesc')}</p>
          </div>

          <div className="p-6 rounded-2xl bg-[#0d0f16] border border-white/[0.06] hover:border-[#c8874b]/60 transition-all card-hover-lift group shadow-lg">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 rounded-xl bg-[#c8874b]/10 border border-[#c8874b]/20 flex items-center justify-center text-[#df9f64] group-hover:scale-110 transition-transform">
                <Briefcase className="w-6 h-6" />
              </div>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-sky-500/10 text-sky-400 border border-sky-500/20">
                GOVERNMENT MDT
              </span>
            </div>
            <h3 className="text-lg font-black text-white mb-2 font-rajdhani">{t('features.jobs')}</h3>
            <p className="text-xs text-[#a1a1a8] leading-relaxed">{t('features.jobsDesc')}</p>
          </div>

          <div className="p-6 rounded-2xl bg-[#0d0f16] border border-white/[0.06] hover:border-[#c8874b]/60 transition-all card-hover-lift group shadow-lg">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 rounded-xl bg-[#c8874b]/10 border border-[#c8874b]/20 flex items-center justify-center text-[#df9f64] group-hover:scale-110 transition-transform">
                <Shield className="w-6 h-6" />
              </div>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-purple-500/10 text-purple-400 border border-purple-500/20">
                ZERO TOLERANCE
              </span>
            </div>
            <h3 className="text-lg font-black text-white mb-2 font-rajdhani">{t('features.security')}</h3>
            <p className="text-xs text-[#a1a1a8] leading-relaxed">{t('features.securityDesc')}</p>
          </div>

          <div className="p-6 rounded-2xl bg-[#0d0f16] border border-white/[0.06] hover:border-[#c8874b]/60 transition-all card-hover-lift group shadow-lg">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 rounded-xl bg-[#c8874b]/10 border border-[#c8874b]/20 flex items-center justify-center text-[#df9f64] group-hover:scale-110 transition-transform">
                <Zap className="w-6 h-6" />
              </div>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#c8874b]/15 text-[#df9f64] border border-[#c8874b]/30">
                128 TICKRATE
              </span>
            </div>
            <h3 className="text-lg font-black text-white mb-2 font-rajdhani">{t('features.performance')}</h3>
            <p className="text-xs text-[#a1a1a8] leading-relaxed">{t('features.performanceDesc')}</p>
          </div>
        </div>
      </section>

      {/* ================= FAIR PLAY & GOLDEN DIRECTIVES ================= */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto border-t border-white/[0.06] relative z-10">
        <div className="text-center max-w-3xl mx-auto mb-14">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 text-xs font-bold mb-3 uppercase tracking-wider border border-emerald-500/20">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>{language === 'ar' ? 'مبادئ اللعب النظيف' : 'Roleplay Integrity & Code'}</span>
          </div>
          <h2 className="text-3xl sm:text-5xl font-black text-white uppercase tracking-tight font-rajdhani">
            {language === 'ar' ? 'القواعد الأساسية لتجربة رول بلاي نقية' : 'The Golden Pillars of Serious RP'}
          </h2>
          <p className="text-[#a1a1a8] text-xs sm:text-sm mt-2 leading-relaxed">
            {language === 'ar'
              ? 'نحرص في PRIME RP على بيئة لعب تحترم السيناريوهات الدرامية وتمنح كل شخصية مساحتها الحقيقية للتطور والتأثير.'
              : 'Fair-play standards ensure every interaction develops into memorable, character-driven storylines.'}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-6 rounded-2xl bg-[#0d0f16] border border-white/[0.06] hover:border-rose-500/40 transition-all shadow-lg flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2 text-rose-400 font-black text-sm">
                  <XCircle className="w-4 h-4" />
                  <span>{language === 'ar' ? 'ممنوع RDM / VDM' : 'No RDM / VDM'}</span>
                </div>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-rose-500/10 text-rose-400 border border-rose-500/20">STRICT</span>
              </div>
              <p className="text-xs text-[#a1a1a8] leading-relaxed mb-4">
                {language === 'ar'
                  ? 'يُحظر منعاً باتاً قتل أي لاعب أو صدمه بالمركبة دون وجود دافع درامي وسيناريو مسبق ومبرر كامل.'
                  : 'Killing or running over citizens without prior verbal interaction and legitimate storyline context is strictly forbidden.'}
              </p>
            </div>
            <div className="p-3 rounded-xl bg-[#08090d] border border-white/[0.05] text-[11px] text-emerald-400 font-bold">
              ✓ {language === 'ar' ? 'الواجب: التحاور وبدء السيناريو أولاً' : 'Requirement: Verbal RP interaction first'}
            </div>
          </div>

          <div className="p-6 rounded-2xl bg-[#0d0f16] border border-white/[0.06] hover:border-amber-500/40 transition-all shadow-lg flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2 text-amber-400 font-black text-sm">
                  <ShieldAlert className="w-4 h-4" />
                  <span>{language === 'ar' ? 'قيمة الحياة (FearRP)' : 'Fear RP & Value of Life'}</span>
                </div>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20">SURVIVAL</span>
              </div>
              <p className="text-xs text-[#a1a1a8] leading-relaxed mb-4">
                {language === 'ar'
                  ? 'عندما يتم تهديدك بسلاح من قبل عدة أشخاص، يجب أن تظهر الخوف على حياة شخصيتك وتستجيب للأوامر.'
                  : 'When faced with superior armed threats, you must fear for your character\'s survival and comply with directives.'}
              </p>
            </div>
            <div className="p-3 rounded-xl bg-[#08090d] border border-white/[0.05] text-[11px] text-emerald-400 font-bold">
              ✓ {language === 'ar' ? 'الواجب: الحفاظ على حياتك كأولوية' : 'Requirement: Value your life above pride'}
            </div>
          </div>

          <div className="p-6 rounded-2xl bg-[#0d0f16] border border-white/[0.06] hover:border-purple-500/40 transition-all shadow-lg flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2 text-purple-400 font-black text-sm">
                  <Cpu className="w-4 h-4" />
                  <span>{language === 'ar' ? 'ممنوع الميتا والباور' : 'No Metagaming & Powergaming'}</span>
                </div>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-purple-500/10 text-purple-400 border border-purple-500/20">REALISM</span>
              </div>
              <p className="text-xs text-[#a1a1a8] leading-relaxed mb-4">
                {language === 'ar'
                  ? 'استخدام معلومات الديسكورد داخل اللعبة أو فرض أفعال خارقة لا يمكن للطرف الآخر التفاعل معها ممنوع قطعياً.'
                  : 'Using out-of-game knowledge or forcing unrealistic actions that give opponents no counter-play is prohibited.'}
              </p>
            </div>
            <div className="p-3 rounded-xl bg-[#08090d] border border-white/[0.05] text-[11px] text-emerald-400 font-bold">
              ✓ {language === 'ar' ? 'الواجب: الفصل التام بين الشخصية والواقع' : 'Requirement: Strict IC vs OOC separation'}
            </div>
          </div>
        </div>

        <div className="text-center mt-10">
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
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#c8874b]/10 text-[#df9f64] text-xs font-black mb-3 uppercase tracking-widest border border-[#c8874b]/20 font-rajdhani">
                <Briefcase className="w-3.5 h-3.5 text-[#c8874b]" />
                <span>{language === 'ar' ? 'الوظائف والتوظيف الحكومي' : 'CAREERS & FACTION RECRUITMENT'}</span>
              </div>
              <h2 className="text-3xl sm:text-4xl font-black text-white uppercase tracking-tight font-rajdhani">
                {t('jobs.title')}
              </h2>
            </div>
            <button
              onClick={() => setCurrentTab('jobs')}
              className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-wider text-[#c8874b] hover:text-[#df9f64] transition-colors cursor-pointer group"
            >
              <span>{language === 'ar' ? 'استعراض كافة الوظائف الشاغرة' : 'View All Opportunities'}</span>
              <ArrowIcon className="w-4 h-4 transition-transform group-hover:translate-x-1 rtl:group-hover:-translate-x-1" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {featuredJobs.map((job) => {
              const trans = job.translations[language] || job.translations.ar;
              const isHiring = job.status === 'HIRING_OPEN';
              return (
                <div
                  key={job.id}
                  className="rounded-2xl bg-[#0d0f16] border border-white/[0.07] hover:border-[#c8874b]/60 p-6 flex flex-col justify-between transition-all card-hover-lift group relative overflow-hidden shadow-lg"
                >
                  <div className="absolute top-0 right-0 w-32 h-32 bg-[#c8874b]/5 rounded-bl-full pointer-events-none group-hover:bg-[#c8874b]/10 transition-colors" />

                  <div className="space-y-4 relative z-10">
                    <div className="flex justify-between items-start gap-2">
                      <span className="px-2.5 py-1 rounded-lg bg-[#131620] text-[#df9f64] text-[10px] font-black uppercase tracking-wider border border-white/[0.08] font-rajdhani">
                        {job.category}
                      </span>
                      <span className={`text-[10px] font-black px-2.5 py-0.5 rounded-full flex items-center gap-1.5 uppercase tracking-wider ${
                        isHiring
                          ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/25'
                          : 'bg-[#131620] text-[#777] border border-white/[0.06]'
                      }`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${isHiring ? 'bg-emerald-400 animate-pulse' : 'bg-[#555]'}`} />
                        {isHiring ? (language === 'ar' ? 'التقديم متاح' : 'Hiring Open') : (language === 'ar' ? 'مغلق مؤقتاً' : 'Closed')}
                      </span>
                    </div>

                    <h3 className="text-xl font-black text-white group-hover:text-[#df9f64] transition-colors font-rajdhani tracking-tight">
                      {trans.name}
                    </h3>

                    <p className="text-xs text-[#969cad] line-clamp-3 leading-relaxed">
                      {trans.description}
                    </p>

                    <div className="pt-3 border-t border-white/[0.06] flex items-center justify-between">
                      <div>
                        <span className="text-[10px] text-[#666] block uppercase tracking-wider font-bold">
                          {language === 'ar' ? 'الراتب المعتمد:' : 'Hourly Compensation:'}
                        </span>
                        <span className="text-base font-black text-[#df9f64] font-rajdhani">
                          ${job.salaryMin} - ${job.salaryMax} <span className="text-xs text-[#969cad] font-normal">/ hr</span>
                        </span>
                      </div>
                      <span className="text-[10px] text-emerald-400 font-bold bg-emerald-500/10 px-2 py-1 rounded-md border border-emerald-500/20">
                        {language === 'ar' ? 'تأمين حكومي' : 'State Insured'}
                      </span>
                    </div>
                  </div>

                  <div className="pt-5 border-t border-white/[0.06] mt-4 relative z-10">
                    <button
                      onClick={() => setCurrentTab('jobs')}
                      className="w-full py-2.5 rounded-xl bg-[#131620] hover:bg-[#c8874b] text-white hover:text-black text-xs font-black uppercase tracking-wider transition-all border border-white/[0.08] hover:border-[#c8874b] cursor-pointer flex items-center justify-center gap-2 group-hover:shadow-md"
                    >
                      <span>{language === 'ar' ? 'تقديم طلب توظيف' : 'Submit Application'}</span>
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
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#c8874b]/10 text-[#df9f64] text-xs font-black mb-3 uppercase tracking-widest border border-[#c8874b]/20 font-rajdhani">
              <HelpCircle className="w-3.5 h-3.5 text-[#c8874b]" />
              <span>{language === 'ar' ? 'الأسئلة الشائعة والدعم الفوري' : 'FREQUENTLY ASKED QUESTIONS'}</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-black text-white mb-3 uppercase tracking-tight font-rajdhani">
              {language === 'ar' ? 'دليل الانضمام والأسئلة الأكثر تكراراً' : 'Everything You Need to Know'}
            </h2>
            <p className="text-[#969cad] text-xs sm:text-sm max-w-xl mx-auto leading-relaxed">
              {language === 'ar'
                ? 'إجابات مباشرة ودقيقة حول خطوات التوثيق، تثبيت الإضافات، أوامر F8، وحل مشكلات الاتصال بالسيرفر.'
                : 'Direct answers regarding whitelist requirements, SaltyChat voice configuration, keybinds, and FiveM connect setup.'}
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
                    isOpen 
                      ? 'bg-[#0d0f16] border-[#c8874b]/50 shadow-xl shadow-black/60' 
                      : 'bg-[#0d0f16]/90 border-white/[0.07] hover:border-white/[0.15]'
                  }`}
                >
                  <button
                    onClick={() => setOpenFaqIndex(isOpen ? null : idx)}
                    className="w-full p-5 text-left rtl:text-right flex items-center justify-between gap-4 cursor-pointer"
                  >
                    <div className="flex items-center gap-3">
                      <span className="w-6 h-6 rounded-lg bg-[#131620] border border-white/[0.06] text-[#c8874b] text-xs font-black font-rajdhani flex items-center justify-center shrink-0">
                        {(idx + 1).toString().padStart(2, '0')}
                      </span>
                      <span className="font-bold text-sm text-white">{trans.question}</span>
                    </div>
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
                        <div className="p-5 pt-0 text-xs sm:text-sm text-[#969cad] leading-relaxed border-t border-white/[0.06] bg-[#08090d]/50">
                          {trans.answer}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </div>

          <div className="mt-8 p-5 rounded-2xl bg-[#0d0f16] border border-white/[0.07] flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left rtl:sm:text-right">
            <div>
              <h4 className="text-sm font-bold text-white mb-0.5">
                {language === 'ar' ? 'هل لديك استفسار آخر لم تجد إجابته هنا؟' : 'Still have questions or need technical assistance?'}
              </h4>
              <p className="text-xs text-[#7a8091]">
                {language === 'ar' ? 'فريق الدعم الفني متواجد على مدار 24 ساعة للإجابة على جميع الاستفسارات.' : 'Our staff team is available 24/7 on Discord to help you connect.'}
              </p>
            </div>
            <div className="flex items-center gap-3 shrink-0">
              <button
                onClick={() => setCurrentTab('support')}
                className="px-4 py-2 rounded-xl bg-[#131620] hover:bg-[#1c202d] text-white border border-white/[0.08] text-xs font-bold transition-all cursor-pointer"
              >
                {language === 'ar' ? 'تذاكر الدعم' : 'Support Tickets'}
              </button>
              <button
                onClick={() => setCurrentTab('faq')}
                className="px-4 py-2 rounded-xl bg-[#c8874b] hover:bg-[#df9f64] text-black text-xs font-black uppercase tracking-wider transition-all cursor-pointer"
              >
                {language === 'ar' ? 'قاعدة المعرفة' : 'Full Knowledge Base'}
              </button>
            </div>
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
                <span className="text-white font-black font-rajdhani">
                  {siteSettings?.discordGuildMembers ? `${siteSettings.discordGuildMembers.toLocaleString()}+ Citizens` : (language === 'ar' ? 'مجتمع رسمي نشط' : 'Official Community')}
                </span>
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
                  {connectCommand || (language === 'ar' ? 'سيرفر FiveM قيد الإعداد' : 'FXServer Direct Connect Pending')}
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

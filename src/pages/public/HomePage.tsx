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
  CheckCircle2,
  ExternalLink,
  ChevronRight,
  ChevronLeft,
  Sparkles,
  Server,
  Copy,
  Check,
  ChevronDown,
  ShoppingBag,
  HelpCircle,
  Radio,
  WifiOff,
  Flame,
  Building2,
  Award
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
        if (Array.isArray(faqData)) setFaqs(faqData.slice(0, 4));
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

  return (
    <div className="min-h-screen bg-[#070707] text-[#E5E5E5] relative overflow-hidden">
      
      {/* ATMOSPHERIC BACKGROUND MESH */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-[800px] bg-radial-mesh pointer-events-none opacity-60 z-0" />
      <div className="absolute top-28 left-1/4 w-[500px] h-[500px] rounded-full bg-[#C8874B]/10 blur-[140px] pointer-events-none z-0" />
      <div className="absolute top-96 right-1/4 w-[420px] h-[420px] rounded-full bg-[#151518]/40 blur-[150px] pointer-events-none z-0" />

      {/* ================= HERO SECTION ================= */}
      <section className="relative z-10 min-h-[92vh] flex flex-col justify-center items-center px-4 sm:px-6 lg:px-8 pt-32 pb-16">
        <div className="max-w-5xl mx-auto text-center flex flex-col items-center">
          
          {/* Live FiveM Status Pill */}
          <motion.div
            initial={{ opacity: 0, y: -15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="inline-flex items-center gap-3 px-4 py-2 rounded-full bg-[#0D0D0F]/90 border border-[#222226] hover:border-[#C8874B]/40 backdrop-blur-md mb-8 shadow-xl"
          >
            <span className={`flex items-center gap-1.5 font-bold text-xs ${isOnline ? 'text-emerald-400' : isConfigured ? 'text-rose-400' : 'text-amber-400'}`}>
              <span className={`w-2 h-2 rounded-full ${isOnline ? 'bg-emerald-400 animate-pulse' : isConfigured ? 'bg-rose-400' : 'bg-amber-400'}`} />
              {isOnline 
                ? (language === 'ar' ? 'السيرفر متصل الآن' : 'FIVEM ONLINE') 
                : !isConfigured 
                  ? (language === 'ar' ? 'بانتظار تهيئة السيرفر' : 'CONFIG PENDING') 
                  : (language === 'ar' ? 'السيرفر غير متصل' : 'SERVER OFFLINE')}
            </span>
            <span className="text-[#333]">•</span>
            <span className="text-[#9A9A9A] text-xs flex items-center gap-1.5">
              <Users className="w-3.5 h-3.5 text-[#C8874B]" />
              <strong className="text-white font-mono">
                {isOnline ? (telemetry?.playersCount ?? 0) : 0}
              </strong>
              {isOnline && telemetry?.maxPlayers ? ` / ${telemetry.maxPlayers}` : ''}{' '}
              {language === 'ar' ? 'مواطن متصل' : 'Citizens Online'}
            </span>
          </motion.div>

          {/* PRIME RP LOGO */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.7, delay: 0.1 }}
            className="mb-8 transform hover:scale-[1.02] transition-transform duration-500"
          >
            <PrimeLogo size="hero" variant="hero" showText={false} withGlow={true} />
          </motion.div>

          {/* HERO HEADLINE */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="text-4xl sm:text-6xl md:text-7xl font-black tracking-tight text-white mb-6 uppercase leading-[1.1]"
          >
            <span className="text-transparent bg-clip-text bg-gradient-to-b from-[#FFFFFF] via-[#E5E5E5] to-[#8E8E8E]">
              {t('hero.title')}{' '}
            </span>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#C8874B] via-[#DF9F64] to-[#E5A93C]">
              PRIME RP
            </span>
          </motion.h1>

          {/* HERO SUBTITLE */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.3 }}
            className="text-base sm:text-lg md:text-xl text-[#9A9A9A] max-w-2xl mb-10 leading-relaxed font-normal"
          >
            {t('hero.description')}
          </motion.p>

          {/* HERO CTAS WITH MAGNETIC BUTTONS */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.4 }}
            className="flex flex-wrap items-center justify-center gap-4 w-full sm:w-auto mb-8"
          >
            <MagneticButton onClick={handlePlayNow}>
              <div className="w-full sm:w-auto flex items-center justify-center gap-2.5 px-8 py-4 rounded-2xl bg-gradient-to-r from-[#C8874B] via-[#DF9F64] to-[#C8874B] text-black font-black text-sm uppercase tracking-wider hover:brightness-110 active:scale-98 transition-all shadow-xl shadow-[#C8874B]/25 cursor-pointer">
                <Play className="w-4 h-4 fill-current" />
                <span>{t('hero.playNow')}</span>
              </div>
            </MagneticButton>

            <MagneticButton>
              <a
                href={siteSettings?.discordUrl || 'https://discord.gg/primerp'}
                target="_blank"
                rel="noreferrer"
                className="w-full sm:w-auto flex items-center justify-center gap-2.5 px-7 py-4 rounded-2xl bg-[#0D0D0F] hover:bg-[#151518] border border-[#222226] hover:border-[#5865F2]/80 text-white font-bold text-sm uppercase tracking-wider transition-all shadow-lg cursor-pointer"
              >
                <MessageSquare className="w-4 h-4 text-[#5865F2]" />
                <span>{t('hero.joinDiscord')}</span>
              </a>
            </MagneticButton>
          </motion.div>

          {/* QUICK CONNECT CONSOLE COMMAND */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.45 }}
            className="mb-14 flex items-center gap-2 p-1.5 pr-3 rtl:pr-1.5 rtl:pl-3 rounded-2xl bg-[#0D0D0F] border border-[#222226] max-w-md mx-auto"
          >
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#151518] text-[#9A9A9A] font-mono text-xs select-all">
              <span className="text-[#C8874B] font-bold">F8:</span>
              <span className="text-[#DDD]">{connectCommand}</span>
            </div>
            <button
              onClick={handleCopyConnect}
              className="p-2 rounded-xl bg-[#151518] hover:bg-[#202025] text-[#AAA] hover:text-white border border-[#252528] transition-all cursor-pointer shrink-0 flex items-center gap-1.5 text-xs font-bold"
              title="Copy F8 connect command"
            >
              {copiedConnect ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-emerald-400 text-[11px]">{language === 'ar' ? 'تم النسخ' : 'Copied'}</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5 text-[#C8874B]" />
                  <span className="text-[#C8874B] text-[11px]">{language === 'ar' ? 'نسخ' : 'Copy'}</span>
                </>
              )}
            </button>
          </motion.div>

          {/* LIVE TELEMETRY STATS HUD */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.5 }}
            className="w-full max-w-4xl grid grid-cols-2 md:grid-cols-4 gap-4 p-4 rounded-3xl bg-[#0D0D0F]/80 backdrop-blur-xl border border-[#222226] shadow-2xl"
          >
            <div className="flex flex-col items-center justify-center p-3 border-r rtl:border-r-0 rtl:border-l border-[#1C1C20] last:border-none">
              <div className="flex items-center gap-1.5 text-xs text-[#777] mb-1">
                <Users className="w-3.5 h-3.5 text-[#C8874B]" />
                <span>{t('hero.onlinePlayers')}</span>
              </div>
              <p className="text-2xl font-black text-white font-rajdhani">
                {isOnline ? (telemetry?.playersCount ?? 0) : 0}{' '}
                <span className="text-xs font-normal text-[#666]">
                  {isOnline && telemetry?.maxPlayers ? `/ ${telemetry.maxPlayers}` : ''}
                </span>
              </p>
            </div>

            <div className="flex flex-col items-center justify-center p-3 border-r rtl:border-r-0 rtl:border-l border-[#1C1C20] last:border-none">
              <div className="flex items-center gap-1.5 text-xs text-[#777] mb-1">
                <Activity className={`w-3.5 h-3.5 ${isOnline ? 'text-emerald-400' : 'text-rose-400'}`} />
                <span>{t('hero.serverStatus')}</span>
              </div>
              <span className={`inline-flex items-center gap-1.5 text-xs font-black px-2.5 py-0.5 rounded-full border ${
                isOnline 
                  ? 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20' 
                  : isConfigured 
                    ? 'text-rose-400 bg-rose-500/10 border-rose-500/20' 
                    : 'text-amber-400 bg-amber-500/10 border-amber-500/20'
              }`}>
                <span className={`w-1.5 h-1.5 rounded-full ${isOnline ? 'bg-emerald-400 animate-pulse' : isConfigured ? 'bg-rose-400' : 'bg-amber-400'}`} />
                {isOnline ? t('hero.online') : isConfigured ? (language === 'ar' ? 'غير متصل' : 'Offline') : (language === 'ar' ? 'قيد التهيئة' : 'Setup')}
              </span>
            </div>

            <div className="flex flex-col items-center justify-center p-3 border-r rtl:border-r-0 rtl:border-l border-[#1C1C20] last:border-none">
              <div className="flex items-center gap-1.5 text-xs text-[#777] mb-1">
                <Briefcase className="w-3.5 h-3.5 text-[#C8874B]" />
                <span>{t('hero.departments')}</span>
              </div>
              <p className="text-2xl font-black text-white font-rajdhani">
                {featuredJobs.length > 0 ? `${featuredJobs.length}+` : '6+'}
              </p>
            </div>

            <div className="flex flex-col items-center justify-center p-3">
              <div className="flex items-center gap-1.5 text-xs text-[#777] mb-1">
                <Zap className="w-3.5 h-3.5 text-[#DF9F64]" />
                <span>{language === 'ar' ? 'سرعة الاستجابة' : 'Network Ping'}</span>
              </div>
              <p className="text-2xl font-black text-[#C8874B] font-rajdhani">
                {isOnline ? `${telemetry?.pingMs || telemetry?.ping || 35} ms` : '-'}
              </p>
            </div>
          </motion.div>

        </div>
      </section>

      {/* ================= WHY PRIME RP PILLARS (ABOUT) ================= */}
      <section id="about" className="py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto border-t border-[#151518] relative z-10 scroll-mt-20">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#C8874B]/10 text-[#C8874B] text-xs font-bold mb-3 uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5" />
            <span>{language === 'ar' ? 'المعايير القياسية • من نحن' : 'Standard Architecture • About Us'}</span>
          </div>
          <h2 className="text-3xl sm:text-5xl font-black text-white mb-4 uppercase tracking-tight">
            {t('features.title')}
          </h2>
          <p className="text-[#9A9A9A] text-sm sm:text-base leading-relaxed">
            {t('features.subtitle')}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="p-7 rounded-3xl bg-[#0D0D0F] border border-[#222226] hover:border-[#C8874B]/50 transition-all card-hover-lift group">
            <div className="w-12 h-12 rounded-2xl bg-[#C8874B]/10 border border-[#C8874B]/20 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform text-[#C8874B]">
              <DollarSign className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-black text-white mb-2">{t('features.economy')}</h3>
            <p className="text-xs text-[#888] leading-relaxed">{t('features.economyDesc')}</p>
          </div>

          <div className="p-7 rounded-3xl bg-[#0D0D0F] border border-[#222226] hover:border-[#C8874B]/50 transition-all card-hover-lift group">
            <div className="w-12 h-12 rounded-2xl bg-[#C8874B]/10 border border-[#C8874B]/20 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform text-[#C8874B]">
              <Briefcase className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-black text-white mb-2">{t('features.jobs')}</h3>
            <p className="text-xs text-[#888] leading-relaxed">{t('features.jobsDesc')}</p>
          </div>

          <div className="p-7 rounded-3xl bg-[#0D0D0F] border border-[#222226] hover:border-[#C8874B]/50 transition-all card-hover-lift group">
            <div className="w-12 h-12 rounded-2xl bg-[#C8874B]/10 border border-[#C8874B]/20 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform text-[#C8874B]">
              <Shield className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-black text-white mb-2">{t('features.security')}</h3>
            <p className="text-xs text-[#888] leading-relaxed">{t('features.securityDesc')}</p>
          </div>

          <div className="p-7 rounded-3xl bg-[#0D0D0F] border border-[#222226] hover:border-[#C8874B]/50 transition-all card-hover-lift group">
            <div className="w-12 h-12 rounded-2xl bg-[#C8874B]/10 border border-[#C8874B]/20 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform text-[#C8874B]">
              <Zap className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-black text-white mb-2">{t('features.performance')}</h3>
            <p className="text-xs text-[#888] leading-relaxed">{t('features.performanceDesc')}</p>
          </div>
        </div>
      </section>

      {/* ================= CITY EXPERIENCE / GAMEPLAY SECTORS ================= */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto border-t border-[#151518] relative z-10">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#C8874B]/10 text-[#C8874B] text-xs font-bold mb-3 uppercase tracking-wider">
            <Building2 className="w-3.5 h-3.5" />
            <span>{language === 'ar' ? 'بيئة اللعب والمدينة' : 'Immersive City Life'}</span>
          </div>
          <h2 className="text-3xl sm:text-5xl font-black text-white mb-4 uppercase tracking-tight">
            {language === 'ar' ? 'اختر مسارك في عالم PRIME' : 'Forge Your Destiny in PRIME RP'}
          </h2>
          <p className="text-[#9A9A9A] text-sm sm:text-base leading-relaxed">
            {language === 'ar'
              ? 'صُممت مدينة PRIME RP لتمنح كل مواطن حرية مطلقة في بناء إمبراطوريته، سواء في تطبيق القانون أو قيادة المؤسسات أو خوض مغامرات الجريمة المنظمة.'
              : 'Every district is engineered with custom scripts and living systems to support deep, uninterrupted storylines.'}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="p-6 rounded-3xl bg-gradient-to-b from-[#0D0D0F] to-[#09090B] border border-[#222226] hover:border-[#58A6FF]/50 transition-all card-hover-lift group flex flex-col justify-between">
            <div>
              <div className="w-12 h-12 rounded-2xl bg-[#58A6FF]/10 border border-[#58A6FF]/30 flex items-center justify-center mb-5 text-[#58A6FF]">
                <Shield className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-black text-white mb-2">
                {language === 'ar' ? 'قطاع الأمن والعدالة' : 'Law Enforcement & SWAT'}
              </h3>
              <p className="text-xs text-[#888] leading-relaxed mb-4">
                {language === 'ar'
                  ? 'مراكز شرطة متطورة، رادارات حديثة، تدريبات تكتيكية، ودوريات لحماية المواطنين وفرض النظام.'
                  : 'Advanced dispatch radios, MDT terminals, pursuit vehicles, and tactical crisis response.'}
              </p>
            </div>
            <div className="pt-4 border-t border-[#1C1C20] flex items-center justify-between">
              <span className="text-[11px] font-bold text-[#58A6FF] uppercase tracking-wider">
                {language === 'ar' ? 'رتب وانضباط' : 'Official Ranks'}
              </span>
              <button
                onClick={() => setCurrentTab('jobs')}
                className="inline-flex items-center gap-1 text-xs font-bold text-white hover:text-[#58A6FF] transition-colors cursor-pointer"
              >
                <span>{language === 'ar' ? 'التوظيف' : 'Careers'}</span>
                <ArrowIcon className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          <div className="p-6 rounded-3xl bg-gradient-to-b from-[#0D0D0F] to-[#09090B] border border-[#222226] hover:border-rose-500/50 transition-all card-hover-lift group flex flex-col justify-between">
            <div>
              <div className="w-12 h-12 rounded-2xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-center mb-5 text-rose-400">
                <Activity className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-black text-white mb-2">
                {language === 'ar' ? 'الخدمات الطبية والإنقاذ' : 'Emergency & Medical Services'}
              </h3>
              <p className="text-xs text-[#888] leading-relaxed mb-4">
                {language === 'ar'
                  ? 'غرف عمليات تفاعلية، إسعاف جوي سريع، وعلاج ميداني فوري للحفاظ على أرواح المصابين.'
                  : 'Field triage, interactive trauma surgeries, air medical evacuation, and disaster management.'}
              </p>
            </div>
            <div className="pt-4 border-t border-[#1C1C20] flex items-center justify-between">
              <span className="text-[11px] font-bold text-rose-400 uppercase tracking-wider">
                {language === 'ar' ? 'إنقاذ 24/7' : '24/7 Response'}
              </span>
              <button
                onClick={() => setCurrentTab('jobs')}
                className="inline-flex items-center gap-1 text-xs font-bold text-white hover:text-rose-400 transition-colors cursor-pointer"
              >
                <span>{language === 'ar' ? 'التوظيف' : 'Careers'}</span>
                <ArrowIcon className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          <div className="p-6 rounded-3xl bg-gradient-to-b from-[#0D0D0F] to-[#09090B] border border-[#222226] hover:border-[#C8874B]/50 transition-all card-hover-lift group flex flex-col justify-between">
            <div>
              <div className="w-12 h-12 rounded-2xl bg-[#C8874B]/10 border border-[#C8874B]/30 flex items-center justify-center mb-5 text-[#C8874B]">
                <DollarSign className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-black text-white mb-2">
                {language === 'ar' ? 'الشركات والاستثمار' : 'Commerce & Real Estate'}
              </h3>
              <p className="text-xs text-[#888] leading-relaxed mb-4">
                {language === 'ar'
                  ? 'امتلك معرض سياراتك، أو أدِر مطعماً راقياً، أو استثمر في العقارات والقصور الفاخرة.'
                  : 'Player-owned dealerships, mechanic garages, luxury penthouses, and sovereign corporations.'}
              </p>
            </div>
            <div className="pt-4 border-t border-[#1C1C20] flex items-center justify-between">
              <span className="text-[11px] font-bold text-[#C8874B] uppercase tracking-wider">
                {language === 'ar' ? 'حرية مالية' : 'Sovereign Wealth'}
              </span>
              <button
                onClick={() => setCurrentTab('store')}
                className="inline-flex items-center gap-1 text-xs font-bold text-[#C8874B] hover:text-[#DF9F64] transition-colors cursor-pointer"
              >
                <span>{language === 'ar' ? 'المتجر' : 'Store'}</span>
                <ArrowIcon className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          <div className="p-6 rounded-3xl bg-gradient-to-b from-[#0D0D0F] to-[#09090B] border border-[#222226] hover:border-purple-500/50 transition-all card-hover-lift group flex flex-col justify-between">
            <div>
              <div className="w-12 h-12 rounded-2xl bg-purple-500/10 border border-purple-500/30 flex items-center justify-center mb-5 text-purple-400">
                <Flame className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-black text-white mb-2">
                {language === 'ar' ? 'الجريمة المنظمة والعصابات' : 'Syndicates & Underworld'}
              </h3>
              <p className="text-xs text-[#888] leading-relaxed mb-4">
                {language === 'ar'
                  ? 'حروب نفوذ، خطط سرقات كبرى، وتجارة سرية بموجب قوانين رول بلاي دقيقة تحمي اللعب النظيف.'
                  : 'Turf wars, bank heists, smuggling networks, and territorial influence under strict RP rule.'}
              </p>
            </div>
            <div className="pt-4 border-t border-[#1C1C20] flex items-center justify-between">
              <span className="text-[11px] font-bold text-purple-400 uppercase tracking-wider">
                {language === 'ar' ? 'نفوذ وسيطرة' : 'Territory Control'}
              </span>
              <button
                onClick={() => setCurrentTab('rules')}
                className="inline-flex items-center gap-1 text-xs font-bold text-white hover:text-purple-400 transition-colors cursor-pointer"
              >
                <span>{language === 'ar' ? 'القوانين' : 'Rules'}</span>
                <ArrowIcon className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ================= STORE VIP SHOWCASE ================= */}
      {featuredProducts.length > 0 && (
        <section className="py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto border-t border-[#151518] relative z-10">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-12 gap-4">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#C8874B]/10 text-[#C8874B] text-xs font-bold mb-2 uppercase tracking-wider">
                <Crown className="w-3.5 h-3.5" />
                <span>{language === 'ar' ? 'المتجر الرسمي' : 'Official Store'}</span>
              </div>
              <h2 className="text-3xl font-black text-white">
                {language === 'ar' ? 'باقات وحزم النخبة (VIP & Perks)' : 'Featured VIP & Vehicle Packages'}
              </h2>
            </div>
            <button
              onClick={() => setCurrentTab('store')}
              className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-wider text-[#C8874B] hover:text-[#DF9F64] transition-colors cursor-pointer"
            >
              <span>{language === 'ar' ? 'زيارة المتجر بالكامل' : 'Explore Full Store'}</span>
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
                  className="rounded-3xl bg-[#0D0D0F] border border-[#222226] hover:border-[#C8874B]/60 p-6 flex flex-col justify-between transition-all card-hover-lift group cursor-pointer"
                >
                  <div>
                    <div className="h-44 rounded-2xl overflow-hidden mb-4 relative bg-[#151518]">
                      <img
                        src={product.image}
                        alt={trans.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      <div className="absolute top-3 right-3 rtl:right-auto rtl:left-3 px-2.5 py-1 rounded-lg bg-black/80 backdrop-blur-md text-[#DF9F64] text-[10px] font-bold uppercase tracking-wider border border-white/10">
                        {product.category}
                      </div>
                    </div>

                    <h3 className="text-xl font-black text-white group-hover:text-[#DF9F64] transition-colors mb-2">
                      {trans.name}
                    </h3>
                    <p className="text-xs text-[#888] line-clamp-2 leading-relaxed mb-4">
                      {trans.description}
                    </p>
                  </div>

                  <div className="pt-4 border-t border-[#1C1C20] flex items-center justify-between">
                    <div>
                      <span className="text-[10px] text-[#666] block font-bold uppercase tracking-wider">
                        {language === 'ar' ? 'السعر' : 'Price'}
                      </span>
                      <span className="text-xl font-black text-[#C8874B] font-rajdhani">
                        ${product.price} <span className="text-xs font-normal text-[#888]">{product.currency}</span>
                      </span>
                    </div>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setCurrentTab('store');
                      }}
                      className="px-4 py-2.5 rounded-xl bg-[#151518] hover:bg-[#C8874B] text-[#C8874B] hover:text-black text-xs font-bold uppercase tracking-wider transition-all border border-[#252528] hover:border-[#C8874B] flex items-center gap-1.5 cursor-pointer"
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

      {/* ================= PRIME CAREERS PREVIEW ================= */}
      {featuredJobs.length > 0 && (
        <section className="py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto border-t border-[#151518] relative z-10">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-12 gap-4">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#C8874B]/10 text-[#C8874B] text-xs font-bold mb-2 uppercase tracking-wider">
                <Briefcase className="w-3.5 h-3.5" />
                <span>Careers & Roles</span>
              </div>
              <h2 className="text-3xl font-black text-white">{t('jobs.title')}</h2>
            </div>
            <button
              onClick={() => setCurrentTab('jobs')}
              className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-wider text-[#C8874B] hover:text-[#DF9F64] transition-colors cursor-pointer"
            >
              <span>{language === 'ar' ? 'عرض كافة الوظائف المتاحة' : 'View All Opportunities'}</span>
              <ArrowIcon className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {featuredJobs.map((job) => {
              const trans = job.translations[language] || job.translations.ar;
              return (
                <div
                  key={job.id}
                  className="rounded-3xl bg-[#0D0D0F] border border-[#222226] hover:border-[#C8874B]/50 p-6 flex flex-col justify-between transition-all card-hover-lift group"
                >
                  <div className="space-y-4">
                    <div className="flex justify-between items-start">
                      <span className="px-2.5 py-1 rounded-lg bg-[#151518] text-[#C8874B] text-[10px] font-bold uppercase tracking-wider border border-[#252528]">
                        {job.category}
                      </span>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        job.status === 'HIRING_OPEN'
                          ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                          : 'bg-[#1E1E22] text-[#888]'
                      }`}>
                        {job.status === 'HIRING_OPEN' ? (language === 'ar' ? 'التقديم متاح' : 'Hiring Active') : (language === 'ar' ? 'مغلق مؤقتاً' : 'Closed')}
                      </span>
                    </div>

                    <h3 className="text-xl font-black text-white group-hover:text-[#DF9F64] transition-colors">
                      {trans.name}
                    </h3>

                    <p className="text-xs text-[#888] line-clamp-3 leading-relaxed">
                      {trans.description}
                    </p>

                    <div className="pt-2">
                      <span className="text-xs text-[#666] block mb-0.5">
                        {language === 'ar' ? 'الراتب التقريبي:' : 'Estimated Salary:'}
                      </span>
                      <span className="text-base font-black text-[#C8874B] font-rajdhani">
                        ${job.salaryMin} - ${job.salaryMax} / hr
                      </span>
                    </div>
                  </div>

                  <div className="pt-6 border-t border-[#1C1C20] mt-4">
                    <button
                      onClick={() => setCurrentTab('jobs')}
                      className="w-full py-3 rounded-xl bg-[#151518] hover:bg-[#1E1E22] text-white text-xs font-bold uppercase tracking-wider transition-all border border-[#252528] hover:border-[#C8874B] cursor-pointer flex items-center justify-center gap-2"
                    >
                      <span>{language === 'ar' ? 'تفاصيل التقديم' : 'Application Details'}</span>
                      <ArrowIcon className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* ================= LATEST BULLETINS & NEWS ================= */}
      {featuredNews.length > 0 && (
        <section className="py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto border-t border-[#151518] relative z-10">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-12 gap-4">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#C8874B]/10 text-[#C8874B] text-xs font-bold mb-2 uppercase tracking-wider">
                <span>Directives & News</span>
              </div>
              <h2 className="text-3xl font-black text-white">{t('news.title')}</h2>
            </div>
            <button
              onClick={() => setCurrentTab('news')}
              className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-wider text-[#C8874B] hover:text-[#DF9F64] transition-colors cursor-pointer"
            >
              <span>{t('news.latestUpdates')}</span>
              <ArrowIcon className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {featuredNews.map((news) => {
              const trans = news.translations[language] || news.translations.ar || news.translations.en;
              return (
                <div
                  key={news.id}
                  onClick={() => {
                    setSelectedNewsSlug(news.slug);
                    setCurrentTab('news-detail');
                  }}
                  className="rounded-3xl bg-[#0D0D0F] border border-[#222226] hover:border-[#C8874B]/50 transition-all overflow-hidden cursor-pointer group card-hover-lift flex flex-col justify-between"
                >
                  <div>
                    <div className="h-48 overflow-hidden relative">
                      <img
                        src={news.image}
                        alt={trans.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      <div className="absolute top-3 right-3 rtl:right-auto rtl:left-3 px-2.5 py-1 rounded-lg bg-black/80 backdrop-blur-md text-[#DF9F64] text-[10px] font-bold uppercase tracking-wider border border-white/10">
                        {news.category}
                      </div>
                    </div>
                    <div className="p-6">
                      <h3 className="text-lg font-black text-white group-hover:text-[#DF9F64] transition-colors mb-2 line-clamp-2">
                        {trans.title}
                      </h3>
                      <p className="text-xs text-[#888] line-clamp-2 leading-relaxed">
                        {trans.excerpt}
                      </p>
                    </div>
                  </div>
                  <div className="p-6 pt-0 flex items-center justify-between text-xs text-[#666] border-t border-[#151518] mt-2">
                    <span>{new Date(news.createdAt).toLocaleDateString(language === 'ar' ? 'ar-SA' : 'en-US')}</span>
                    <span className="text-[#C8874B] font-bold group-hover:translate-x-1 rtl:group-hover:-translate-x-1 transition-transform flex items-center gap-1">
                      <span>{language === 'ar' ? 'قراءة' : 'Read'}</span>
                      <ArrowIcon className="w-3.5 h-3.5" />
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* ================= COMMUNITY FAQ ACCORDION ================= */}
      {faqs.length > 0 && (
        <section className="py-24 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto border-t border-[#151518] relative z-10">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#C8874B]/10 text-[#C8874B] text-xs font-bold mb-3 uppercase tracking-wider">
              <HelpCircle className="w-3.5 h-3.5" />
              <span>{t('nav.faq')}</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-black text-white mb-3 uppercase tracking-tight">
              {language === 'ar' ? 'الأسئلة الشائعة والمعلومات الأساسية' : 'Frequently Asked Questions'}
            </h2>
            <p className="text-[#9A9A9A] text-xs sm:text-sm">
              {language === 'ar'
                ? 'إجابات مباشرة على أكثر استفسارات اللاعبين الجدد حول الانضمام وقوانين المدينة.'
                : 'Direct answers regarding joining, whitelist rules, and community guidelines.'}
            </p>
          </div>

          <div className="space-y-3">
            {faqs.map((faq, idx) => {
              const trans = faq.translations[language] || faq.translations.ar || faq.translations.en;
              const isOpen = openFaqIndex === idx;
              return (
                <div
                  key={faq.id}
                  className="rounded-2xl bg-[#0D0D0F] border border-[#222226] hover:border-[#C8874B]/40 transition-all overflow-hidden"
                >
                  <button
                    onClick={() => setOpenFaqIndex(isOpen ? null : idx)}
                    className="w-full p-5 text-left rtl:text-right flex items-center justify-between gap-4 cursor-pointer"
                  >
                    <span className="font-bold text-sm text-white">{trans.question}</span>
                    <ChevronDown className={`w-4 h-4 text-[#C8874B] shrink-0 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
                  </button>
                  <AnimatePresence>
                    {isOpen && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3 }}
                        className="overflow-hidden"
                      >
                        <div className="p-5 pt-0 text-xs text-[#9A9A9A] leading-relaxed border-t border-[#151518]">
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
              className="inline-flex items-center gap-2 text-xs font-bold text-[#C8874B] hover:text-[#DF9F64] transition-colors cursor-pointer"
            >
              <span>{language === 'ar' ? 'عرض كل الأسئلة الشائعة' : 'View all FAQs'}</span>
              <ArrowIcon className="w-3.5 h-3.5" />
            </button>
          </div>
        </section>
      )}

      {/* ================= COMMUNITY DISCORD CTA BANNER ================= */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto border-t border-[#151518] relative z-10">
        <div className="rounded-3xl bg-gradient-to-r from-[#0D0D0F] via-[#121216] to-[#0D0D0F] border border-[#C8874B]/30 p-8 sm:p-14 text-center relative overflow-hidden shadow-2xl">
          <div className="absolute top-0 right-0 w-96 h-96 bg-[#5865F2]/10 blur-[100px] pointer-events-none rounded-full" />
          <div className="absolute bottom-0 left-0 w-80 h-80 bg-[#C8874B]/10 blur-[100px] pointer-events-none rounded-full" />

          <div className="relative z-10 max-w-3xl mx-auto space-y-6">
            <span className="w-12 h-12 rounded-2xl bg-[#5865F2]/15 border border-[#5865F2]/30 flex items-center justify-center mx-auto text-[#5865F2]">
              <MessageSquare className="w-6 h-6" />
            </span>

            <h2 className="text-3xl sm:text-5xl font-black text-white tracking-tight">
              {language === 'ar' ? 'انضم إلى مجتمع النخبة في ديسكورد' : 'Join the Official PRIME RP Discord'}
            </h2>

            <p className="text-sm sm:text-base text-[#9A9A9A] leading-relaxed max-w-xl mx-auto">
              {language === 'ar'
                ? 'تواصل مع آلاف المواطنين، تابع التحديثات الحصرية، واطلع على إعلانات التوظيف والفعاليات اليومية.'
                : 'Connect with thousands of citizens, stay ahead with executive announcements, and participate in daily community events.'}
            </p>

            <div className="pt-2">
              <a
                href={siteSettings?.discordUrl || 'https://discord.gg/primerp'}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2.5 px-8 py-4 rounded-2xl bg-[#5865F2] hover:bg-[#4752C4] active:scale-98 text-white font-black text-xs uppercase tracking-wider transition-all shadow-xl shadow-[#5865F2]/25 cursor-pointer"
              >
                <span>{language === 'ar' ? 'الانضمام الفوري لسيرفر الديسكورد' : 'Connect to Discord Server'}</span>
                <ExternalLink className="w-4 h-4" />
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* ================= FINAL CALL TO ACTION ================= */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto text-center relative z-10">
        <h2 className="text-3xl sm:text-6xl font-black text-white mb-6 uppercase tracking-tight">
          {language === 'ar' ? 'هل أنت مستعد لدخول مدينة PRIME RP؟' : 'Ready to Experience PRIME RP?'}
        </h2>
        <p className="text-sm sm:text-base text-[#9A9A9A] max-w-xl mx-auto mb-10 leading-relaxed">
          {language === 'ar'
            ? 'سيرفر اللعب الواقعي الأكثر فخامة وتكاملاً. ابدأ مسيرتك الآن وانضم إلى عالم النخبة.'
            : 'Join the most prestigious roleplay server. Launch FiveM and become part of our sovereign community.'}
        </p>

        <div className="flex flex-wrap items-center justify-center gap-4">
          <MagneticButton onClick={handlePlayNow}>
            <div className="flex items-center justify-center gap-2.5 px-8 py-4 rounded-2xl bg-gradient-to-r from-[#C8874B] via-[#DF9F64] to-[#C8874B] text-black font-black text-xs uppercase tracking-wider hover:brightness-110 active:scale-98 transition-all shadow-xl shadow-[#C8874B]/25 cursor-pointer">
              <Play className="w-4 h-4 fill-current" />
              <span>{language === 'ar' ? 'ابدأ اللعب الآن' : 'Connect to Server'}</span>
            </div>
          </MagneticButton>

          <button
            onClick={() => setCurrentTab('jobs')}
            className="flex items-center justify-center gap-2.5 px-7 py-4 rounded-2xl bg-[#0D0D0F] hover:bg-[#151518] border border-[#222226] hover:border-[#C8874B] text-white font-bold text-xs uppercase tracking-wider transition-all cursor-pointer"
          >
            <Briefcase className="w-4 h-4 text-[#C8874B]" />
            <span>{language === 'ar' ? 'تقديم على وظيفة' : 'Apply for Career'}</span>
          </button>
        </div>
      </section>

    </div>
  );
};

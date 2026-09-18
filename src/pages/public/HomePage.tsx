import React, { useState, useEffect } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { PrimeLogo } from '../../components/common/PrimeLogo';
import { MagneticButton } from '../../components/common/MagneticButton';
import { apiClient } from '../../services/apiClient';
import { NewsItem, JobItem, ProductItem, FiveMTelemetry } from '../../types';
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
  Terminal,
  Server
} from 'lucide-react';
import { motion } from 'motion/react';

interface HomePageProps {
  setCurrentTab: (tab: string) => void;
  setSelectedNewsSlug: (slug: string) => void;
}

export const HomePage: React.FC<HomePageProps> = ({ setCurrentTab, setSelectedNewsSlug }) => {
  const { t, language, isRtl } = useLanguage();
  const [siteSettings, setSiteSettings] = useState<any>(null);
  const [telemetry, setTelemetry] = useState<FiveMTelemetry | null>(null);
  const [featuredNews, setFeaturedNews] = useState<NewsItem[]>([]);
  const [featuredJobs, setFeaturedJobs] = useState<JobItem[]>([]);
  const [featuredProducts, setFeaturedProducts] = useState<ProductItem[]>([]);

  useEffect(() => {
    async function loadData() {
      try {
        const [settings, status, news, jobs, prods] = await Promise.all([
          apiClient.getSiteSettings().catch(() => null),
          apiClient.getFiveMStatus().catch(() => null),
          apiClient.getNews().catch(() => []),
          apiClient.getJobs().catch(() => []),
          apiClient.getProducts().catch(() => [])
        ]);
        if (settings) setSiteSettings(settings);
        if (status) setTelemetry(status);
        if (Array.isArray(news)) setFeaturedNews(news.slice(0, 3));
        if (Array.isArray(jobs)) setFeaturedJobs(jobs.slice(0, 3));
        if (Array.isArray(prods)) setFeaturedProducts(prods.filter((p: ProductItem) => p.featured).slice(0, 2));
      } catch (err) {
        console.error('Failed to load home page data:', err);
      }
    }
    loadData();
  }, []);

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
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-[700px] bg-radial-mesh pointer-events-none opacity-70 z-0" />
      <div className="absolute top-32 left-1/4 w-[450px] h-[450px] rounded-full bg-[#C8874B]/10 blur-[130px] pointer-events-none z-0" />
      <div className="absolute top-80 right-1/4 w-[380px] h-[380px] rounded-full bg-[#151518]/30 blur-[140px] pointer-events-none z-0" />

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
            <span className="flex items-center gap-1.5 text-emerald-400 font-bold text-xs">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              {telemetry?.status || (telemetry?.online ? 'FIVEM ONLINE' : 'SERVER READY')}
            </span>
            <span className="text-[#333]">•</span>
            <span className="text-[#9A9A9A] text-xs flex items-center gap-1.5">
              <Users className="w-3.5 h-3.5 text-[#C8874B]" />
              <strong className="text-white font-mono">{telemetry?.playersCount ?? telemetry?.activePlayers ?? siteSettings?.activePlayersCount ?? 128}</strong> / {telemetry?.maxPlayers ?? siteSettings?.maxPlayersCount ?? 256} {language === 'ar' ? 'مواطن متصل' : 'Citizens Online'}
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
            className="flex flex-wrap items-center justify-center gap-4 w-full sm:w-auto mb-16"
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
                className="w-full sm:w-auto flex items-center justify-center gap-2.5 px-7 py-4 rounded-2xl bg-[#0D0D0F] hover:bg-[#151518] border border-[#222226] hover:border-[#5865F2]/80 text-white font-bold text-sm uppercase tracking-wider transition-all shadow-lg"
              >
                <MessageSquare className="w-4 h-4 text-[#5865F2]" />
                <span>{t('hero.joinDiscord')}</span>
              </a>
            </MagneticButton>
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
                {telemetry?.playersCount ?? telemetry?.activePlayers ?? siteSettings?.activePlayersCount ?? 128}{' '}
                <span className="text-xs font-normal text-[#666]">/ {telemetry?.maxPlayers ?? siteSettings?.maxPlayersCount ?? 256}</span>
              </p>
            </div>

            <div className="flex flex-col items-center justify-center p-3 border-r rtl:border-r-0 rtl:border-l border-[#1C1C20] last:border-none">
              <div className="flex items-center gap-1.5 text-xs text-[#777] mb-1">
                <Activity className="w-3.5 h-3.5 text-emerald-400" />
                <span>{t('hero.serverStatus')}</span>
              </div>
              <span className="inline-flex items-center gap-1.5 text-xs font-black text-emerald-400 bg-emerald-500/10 px-2.5 py-0.5 rounded-full border border-emerald-500/20">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                {t('hero.online')}
              </span>
            </div>

            <div className="flex flex-col items-center justify-center p-3 border-r rtl:border-r-0 rtl:border-l border-[#1C1C20] last:border-none">
              <div className="flex items-center gap-1.5 text-xs text-[#777] mb-1">
                <Briefcase className="w-3.5 h-3.5 text-[#C8874B]" />
                <span>{t('hero.departments')}</span>
              </div>
              <p className="text-2xl font-black text-white font-rajdhani">{featuredJobs.length > 0 ? `${featuredJobs.length}+` : '8+'}</p>
            </div>

            <div className="flex flex-col items-center justify-center p-3">
              <div className="flex items-center gap-1.5 text-xs text-[#777] mb-1">
                <Shield className="w-3.5 h-3.5 text-[#DF9F64]" />
                <span>{t('hero.uptime')}</span>
              </div>
              <p className="text-2xl font-black text-white font-rajdhani">99.8%</p>
            </div>
          </motion.div>

        </div>
      </section>

      {/* ================= FEATURES PILLARS ================= */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto border-t border-[#151518] relative z-10">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#C8874B]/10 text-[#C8874B] text-xs font-bold mb-3 uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Prime Architecture</span>
          </div>
          <h3 className="text-3xl sm:text-4xl font-black text-white mb-4">
            {t('features.title')}
          </h3>
          <p className="text-[#9A9A9A] text-sm sm:text-base">
            {t('features.subtitle')}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="p-6 rounded-3xl bg-[#0D0D0F] border border-[#222226] hover:border-[#C8874B]/50 transition-all card-hover-lift group">
            <div className="w-12 h-12 rounded-2xl bg-[#C8874B]/10 border border-[#C8874B]/20 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform text-[#C8874B]">
              <DollarSign className="w-6 h-6" />
            </div>
            <h4 className="text-lg font-black text-white mb-2">{t('features.economy')}</h4>
            <p className="text-xs text-[#888] leading-relaxed">{t('features.economyDesc')}</p>
          </div>

          <div className="p-6 rounded-3xl bg-[#0D0D0F] border border-[#222226] hover:border-[#C8874B]/50 transition-all card-hover-lift group">
            <div className="w-12 h-12 rounded-2xl bg-[#C8874B]/10 border border-[#C8874B]/20 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform text-[#C8874B]">
              <Briefcase className="w-6 h-6" />
            </div>
            <h4 className="text-lg font-black text-white mb-2">{t('features.jobs')}</h4>
            <p className="text-xs text-[#888] leading-relaxed">{t('features.jobsDesc')}</p>
          </div>

          <div className="p-6 rounded-3xl bg-[#0D0D0F] border border-[#222226] hover:border-[#C8874B]/50 transition-all card-hover-lift group">
            <div className="w-12 h-12 rounded-2xl bg-[#C8874B]/10 border border-[#C8874B]/20 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform text-[#C8874B]">
              <Shield className="w-6 h-6" />
            </div>
            <h4 className="text-lg font-black text-white mb-2">{t('features.security')}</h4>
            <p className="text-xs text-[#888] leading-relaxed">{t('features.securityDesc')}</p>
          </div>

          <div className="p-6 rounded-3xl bg-[#0D0D0F] border border-[#222226] hover:border-[#C8874B]/50 transition-all card-hover-lift group">
            <div className="w-12 h-12 rounded-2xl bg-[#C8874B]/10 border border-[#C8874B]/20 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform text-[#C8874B]">
              <Zap className="w-6 h-6" />
            </div>
            <h4 className="text-lg font-black text-white mb-2">{t('features.performance')}</h4>
            <p className="text-xs text-[#888] leading-relaxed">{t('features.performanceDesc')}</p>
          </div>
        </div>
      </section>

      {/* ================= LATEST BULLETINS & NEWS ================= */}
      {featuredNews.length > 0 && (
        <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto border-t border-[#151518] relative z-10">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-12 gap-4">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#C8874B]/10 text-[#C8874B] text-xs font-bold mb-2 uppercase tracking-wider">
                <span>Directives & News</span>
              </div>
              <h3 className="text-3xl font-black text-white">{t('news.title')}</h3>
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
                      <h4 className="text-lg font-black text-white group-hover:text-[#DF9F64] transition-colors mb-2 line-clamp-2">
                        {trans.title}
                      </h4>
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

      {/* ================= PRIME CAREERS PREVIEW ================= */}
      {featuredJobs.length > 0 && (
        <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto border-t border-[#151518] relative z-10">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-12 gap-4">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#C8874B]/10 text-[#C8874B] text-xs font-bold mb-2 uppercase tracking-wider">
                <Briefcase className="w-3.5 h-3.5" />
                <span>Careers & Roles</span>
              </div>
              <h3 className="text-3xl font-black text-white">{t('jobs.title')}</h3>
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

                    <h4 className="text-xl font-black text-white group-hover:text-[#DF9F64] transition-colors">
                      {trans.name}
                    </h4>

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

      {/* ================= COMMUNITY DISCORD CTA BANNER ================= */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto border-t border-[#151518] relative z-10">
        <div className="rounded-3xl bg-gradient-to-r from-[#0D0D0F] via-[#121216] to-[#0D0D0F] border border-[#C8874B]/30 p-8 sm:p-14 text-center relative overflow-hidden shadow-2xl">
          <div className="absolute top-0 right-0 w-96 h-96 bg-[#5865F2]/10 blur-[100px] pointer-events-none rounded-full" />
          <div className="absolute bottom-0 left-0 w-80 h-80 bg-[#C8874B]/10 blur-[100px] pointer-events-none rounded-full" />

          <div className="relative z-10 max-w-3xl mx-auto space-y-6">
            <span className="w-12 h-12 rounded-2xl bg-[#5865F2]/15 border border-[#5865F2]/30 flex items-center justify-center mx-auto text-[#5865F2]">
              <MessageSquare className="w-6 h-6" />
            </span>

            <h3 className="text-3xl sm:text-5xl font-black text-white tracking-tight">
              {language === 'ar' ? 'انضم إلى مجتمع النخبة في ديسكورد' : 'Join the Official PRIME RP Discord'}
            </h3>

            <p className="text-sm sm:text-base text-[#9A9A9A] leading-relaxed max-w-xl mx-auto">
              {language === 'ar'
                ? 'تواصل مع أكثر من 15,000 مواطن، تابع التحديثات الحصرية، وتعرّف على فعاليات السيرفر اليومية.'
                : 'Connect with over 15,000 citizens, stay ahead with executive announcements, and participate in daily community events.'}
            </p>

            <div className="pt-2">
              <a
                href={siteSettings?.discordUrl || 'https://discord.gg/primerp'}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2.5 px-8 py-4 rounded-2xl bg-[#5865F2] hover:bg-[#4752C4] active:scale-98 text-white font-black text-xs uppercase tracking-wider transition-all shadow-xl shadow-[#5865F2]/25"
              >
                <span>{language === 'ar' ? 'الانضمام الفوري لسيرفر الديسكورد' : 'Connect to Discord Server'}</span>
                <ExternalLink className="w-4 h-4" />
              </a>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
};

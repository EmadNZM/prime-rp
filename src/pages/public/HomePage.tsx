import React, { useState, useEffect } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { PrimeLogo } from '../../components/common/PrimeLogo';
import { apiClient } from '../../services/apiClient';
import { NewsItem, JobItem, ProductItem } from '../../types';
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
  ExternalLink
} from 'lucide-react';

interface HomePageProps {
  setCurrentTab: (tab: string) => void;
  setSelectedNewsSlug: (slug: string) => void;
}

export const HomePage: React.FC<HomePageProps> = ({ setCurrentTab, setSelectedNewsSlug }) => {
  const { t, language, isRtl } = useLanguage();
  const [siteSettings, setSiteSettings] = useState<any>(null);
  const [featuredNews, setFeaturedNews] = useState<NewsItem[]>([]);
  const [featuredJobs, setFeaturedJobs] = useState<JobItem[]>([]);
  const [featuredProducts, setFeaturedProducts] = useState<ProductItem[]>([]);

  useEffect(() => {
    async function loadData() {
      try {
        const [settings, news, jobs, prods] = await Promise.all([
          apiClient.getSiteSettings(),
          apiClient.getNews(),
          apiClient.getJobs(),
          apiClient.getProducts()
        ]);
        setSiteSettings(settings);
        setFeaturedNews(news.slice(0, 3));
        setFeaturedJobs(jobs.slice(0, 3));
        setFeaturedProducts(prods.filter((p: ProductItem) => p.featured).slice(0, 2));
      } catch (err) {
        console.error('Failed to load home page data:', err);
      }
    }
    loadData();
  }, []);

  const handlePlayNow = () => {
    // Open FiveM connect or show connect instruction
    const connectUrl = siteSettings?.fiveMConnectUrl || 'fivem://connect/play.prime-rp.com';
    window.location.href = connectUrl;
  };

  const ArrowIcon = isRtl ? ArrowLeft : ArrowRight;

  return (
    <div className="min-h-screen bg-[#070707] text-[#E5E5E5] pt-24 pb-20">
      
      {/* ================= HERO SECTION ================= */}
      <section className="relative min-h-[85vh] flex items-center justify-center overflow-hidden px-4 sm:px-6 lg:px-8 bg-radial-mesh">
        {/* Subtle Background Glows */}
        <div 
          className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[#C8874B]/10 blur-[140px] rounded-full pointer-events-none" 
          aria-hidden="true"
        />

        <div className="max-w-5xl mx-auto text-center relative z-10 flex flex-col items-center">
          
          {/* Tagline Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#121212] border border-[#C8874B]/30 mb-8 copper-glow-sm">
            <span className="w-2 h-2 rounded-full bg-[#C8874B] animate-pulse" />
            <span className="text-xs sm:text-sm font-bold tracking-wide text-[#DF9F64]">
              {t('hero.tagline')}
            </span>
          </div>

          {/* PRIME RP LOGO */}
          <div className="mb-6 transform hover:scale-[1.02] transition-transform duration-500">
            <PrimeLogo size="hero" showText={false} withGlow={true} />
          </div>

          {/* HERO TITLE */}
          <h1 className="text-4xl sm:text-6xl md:text-7xl font-black tracking-tight text-white mb-6 uppercase">
            <span className="text-transparent bg-clip-text bg-gradient-to-b from-[#FFFFFF] via-[#E5E5E5] to-[#8E8E8E]">
              {t('hero.title')}
            </span>
          </h1>

          {/* HERO DESCRIPTION */}
          <p className="text-base sm:text-lg md:text-xl text-[#A5A5A5] max-w-3xl mb-10 leading-relaxed font-normal">
            {t('hero.description')}
          </p>

          {/* HERO CTA BUTTONS */}
          <div className="flex flex-wrap items-center justify-center gap-4 w-full sm:w-auto mb-16">
            <button
              onClick={handlePlayNow}
              className="w-full sm:w-auto flex items-center justify-center gap-3 px-8 py-4 rounded-xl bg-gradient-to-r from-[#C8874B] via-[#DF9F64] to-[#C8874B] text-black font-extrabold text-base tracking-wider hover:brightness-110 active:scale-95 transition-all shadow-lg shadow-[#C8874B]/25 copper-glow"
            >
              <Play className="w-5 h-5 fill-current" />
              <span>{t('hero.playNow')}</span>
            </button>

            <a
              href="https://discord.gg/primerp"
              target="_blank"
              rel="noreferrer"
              className="w-full sm:w-auto flex items-center justify-center gap-3 px-8 py-4 rounded-xl bg-[#111] hover:bg-[#1A1A1A] border border-[#2B2B2B] hover:border-[#5865F2] text-white font-bold text-base transition-all hover:scale-[1.02]"
            >
              <MessageSquare className="w-5 h-5 text-[#5865F2]" />
              <span>{t('hero.joinDiscord')}</span>
            </a>
          </div>

          {/* LIVE TELEMETRY STATS BAR */}
          <div className="w-full max-w-4xl grid grid-cols-2 md:grid-cols-4 gap-4 p-4 rounded-2xl bg-[#0B0B0B]/80 backdrop-blur-md border border-[#1E1E1E] shadow-2xl">
            <div className="flex flex-col items-center justify-center p-3 border-r rtl:border-r-0 rtl:border-l border-[#1A1A1A] last:border-none">
              <div className="flex items-center gap-1.5 text-xs text-[#888] mb-1">
                <Users className="w-3.5 h-3.5 text-[#C8874B]" />
                <span>{t('hero.onlinePlayers')}</span>
              </div>
              <p className="text-2xl font-black text-white">
                {siteSettings?.activePlayersCount || 184} <span className="text-xs font-normal text-[#666]">/ {siteSettings?.maxPlayersCount || 250}</span>
              </p>
            </div>

            <div className="flex flex-col items-center justify-center p-3 border-r rtl:border-r-0 rtl:border-l border-[#1A1A1A] last:border-none">
              <div className="flex items-center gap-1.5 text-xs text-[#888] mb-1">
                <Activity className="w-3.5 h-3.5 text-emerald-500" />
                <span>{t('hero.serverStatus')}</span>
              </div>
              <span className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-400 bg-emerald-500/10 px-2.5 py-0.5 rounded-full">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                {t('hero.online')}
              </span>
            </div>

            <div className="flex flex-col items-center justify-center p-3 border-r rtl:border-r-0 rtl:border-l border-[#1A1A1A] last:border-none">
              <div className="flex items-center gap-1.5 text-xs text-[#888] mb-1">
                <Briefcase className="w-3.5 h-3.5 text-[#C8874B]" />
                <span>{t('hero.departments')}</span>
              </div>
              <p className="text-2xl font-black text-white">12+</p>
            </div>

            <div className="flex flex-col items-center justify-center p-3">
              <div className="flex items-center gap-1.5 text-xs text-[#888] mb-1">
                <Shield className="w-3.5 h-3.5 text-[#DF9F64]" />
                <span>{t('hero.uptime')}</span>
              </div>
              <p className="text-2xl font-black text-white">99.8%</p>
            </div>
          </div>

        </div>
      </section>

      {/* ================= FEATURES SECTION ================= */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto border-t border-[#161616]">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-xs font-extrabold uppercase tracking-widest text-[#C8874B] mb-2">
            Features
          </h2>
          <h3 className="text-3xl sm:text-4xl font-black text-white mb-4">
            {t('features.title')}
          </h3>
          <p className="text-[#8E8E8E] text-sm sm:text-base">
            {t('features.subtitle')}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="p-6 rounded-2xl bg-[#0B0B0B] border border-[#1E1E1E] hover:border-[#C8874B]/40 transition-all group">
            <div className="w-12 h-12 rounded-xl bg-[#C8874B]/10 border border-[#C8874B]/20 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
              <DollarSign className="w-6 h-6 text-[#C8874B]" />
            </div>
            <h4 className="text-lg font-bold text-white mb-2">{t('features.economy')}</h4>
            <p className="text-sm text-[#888] leading-relaxed">{t('features.economyDesc')}</p>
          </div>

          <div className="p-6 rounded-2xl bg-[#0B0B0B] border border-[#1E1E1E] hover:border-[#C8874B]/40 transition-all group">
            <div className="w-12 h-12 rounded-xl bg-[#C8874B]/10 border border-[#C8874B]/20 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
              <Briefcase className="w-6 h-6 text-[#C8874B]" />
            </div>
            <h4 className="text-lg font-bold text-white mb-2">{t('features.jobs')}</h4>
            <p className="text-sm text-[#888] leading-relaxed">{t('features.jobsDesc')}</p>
          </div>

          <div className="p-6 rounded-2xl bg-[#0B0B0B] border border-[#1E1E1E] hover:border-[#C8874B]/40 transition-all group">
            <div className="w-12 h-12 rounded-xl bg-[#C8874B]/10 border border-[#C8874B]/20 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
              <Shield className="w-6 h-6 text-[#C8874B]" />
            </div>
            <h4 className="text-lg font-bold text-white mb-2">{t('features.security')}</h4>
            <p className="text-sm text-[#888] leading-relaxed">{t('features.securityDesc')}</p>
          </div>

          <div className="p-6 rounded-2xl bg-[#0B0B0B] border border-[#1E1E1E] hover:border-[#C8874B]/40 transition-all group">
            <div className="w-12 h-12 rounded-xl bg-[#C8874B]/10 border border-[#C8874B]/20 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
              <Zap className="w-6 h-6 text-[#C8874B]" />
            </div>
            <h4 className="text-lg font-bold text-white mb-2">{t('features.performance')}</h4>
            <p className="text-sm text-[#888] leading-relaxed">{t('features.performanceDesc')}</p>
          </div>
        </div>
      </section>

      {/* ================= LATEST NEWS PREVIEW ================= */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto border-t border-[#161616]">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-12 gap-4">
          <div>
            <h2 className="text-xs font-extrabold uppercase tracking-widest text-[#C8874B] mb-2">
              Bulletins
            </h2>
            <h3 className="text-3xl font-black text-white">{t('news.title')}</h3>
          </div>
          <button
            onClick={() => setCurrentTab('news')}
            className="inline-flex items-center gap-2 text-sm font-bold text-[#C8874B] hover:text-[#DF9F64] transition-colors"
          >
            <span>{t('news.latestUpdates')}</span>
            <ArrowIcon className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {featuredNews.map((item) => {
            const currentTrans = item.translations[language] || item.translations.ar;
            return (
              <div
                key={item.id}
                onClick={() => {
                  setSelectedNewsSlug(item.slug);
                  setCurrentTab('news-detail');
                }}
                className="group cursor-pointer rounded-2xl overflow-hidden bg-[#0B0B0B] border border-[#1E1E1E] hover:border-[#C8874B]/50 transition-all flex flex-col"
              >
                <div className="relative h-48 overflow-hidden">
                  <img
                    src={item.image}
                    alt={currentTrans.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <span className="absolute top-3 left-3 rtl:left-auto rtl:right-3 px-2.5 py-1 text-[11px] font-bold rounded-md bg-black/80 backdrop-blur-md text-[#C8874B] border border-[#C8874B]/30">
                    {item.category}
                  </span>
                </div>
                <div className="p-6 flex-1 flex flex-col justify-between">
                  <div>
                    <span className="text-xs text-[#777] block mb-2">
                      {new Date(item.createdAt).toLocaleDateString(language === 'ar' ? 'ar-SA' : 'en-US')}
                    </span>
                    <h4 className="text-lg font-bold text-white mb-2 group-hover:text-[#C8874B] transition-colors line-clamp-2">
                      {currentTrans.title}
                    </h4>
                    <p className="text-sm text-[#888] line-clamp-2 mb-4">
                      {currentTrans.excerpt}
                    </p>
                  </div>
                  <div className="inline-flex items-center gap-1.5 text-xs font-bold text-[#C8874B]">
                    <span>{t('news.readMore')}</span>
                    <ArrowIcon className="w-3.5 h-3.5" />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* ================= STORE HIGHLIGHT SECTION ================= */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto border-t border-[#161616]">
        <div className="text-center max-w-2xl mx-auto mb-14">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#C8874B]/10 text-[#C8874B] text-xs font-bold mb-3">
            <Crown className="w-3.5 h-3.5" />
            <span>Official Store</span>
          </div>
          <h3 className="text-3xl sm:text-4xl font-black text-white mb-3">{t('store.title')}</h3>
          <p className="text-[#888] text-sm sm:text-base">{t('store.subtitle')}</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {featuredProducts.map((prod) => {
            const currentTrans = prod.translations[language] || prod.translations.ar;
            return (
              <div
                key={prod.id}
                className="relative rounded-3xl p-8 bg-[#0B0B0B] border border-[#C8874B]/30 hover:border-[#C8874B] transition-all flex flex-col justify-between copper-glow-sm group"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-xs font-extrabold uppercase tracking-widest text-[#C8874B]">
                      {prod.category}
                    </span>
                    <span className="text-2xl font-black text-white">
                      ${prod.price} <span className="text-xs font-normal text-[#888]">USD</span>
                    </span>
                  </div>

                  <h4 className="text-2xl font-black text-white mb-3 group-hover:text-[#DF9F64] transition-colors">
                    {currentTrans.name}
                  </h4>
                  <p className="text-sm text-[#888] mb-6 leading-relaxed">
                    {currentTrans.description}
                  </p>

                  <div className="space-y-2.5 mb-8 border-t border-[#1A1A1A] pt-4">
                    {currentTrans.perks.slice(0, 4).map((perk, i) => (
                      <div key={i} className="flex items-start gap-2 text-xs sm:text-sm text-[#BBB]">
                        <CheckCircle2 className="w-4 h-4 text-[#C8874B] shrink-0 mt-0.5" />
                        <span>{perk}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <button
                  onClick={() => setCurrentTab('store')}
                  className="w-full py-3.5 rounded-xl bg-gradient-to-r from-[#C8874B] to-[#DF9F64] text-black font-extrabold text-sm tracking-wide hover:brightness-110 active:scale-98 transition-all"
                >
                  {t('store.buyNow')}
                </button>
              </div>
            );
          })}
        </div>
      </section>

      {/* ================= COMMUNITY CALL TO ACTION ================= */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto">
        <div className="rounded-3xl p-8 sm:p-14 bg-gradient-to-br from-[#121212] to-[#080808] border border-[#282828] text-center relative overflow-hidden">
          <div 
            className="absolute -top-24 -right-24 w-72 h-72 bg-[#5865F2]/10 blur-3xl rounded-full pointer-events-none" 
            aria-hidden="true"
          />
          <h3 className="text-3xl sm:text-4xl font-black text-white mb-4">
            انضم إلى مجتمع النخبة في سيرفر الديسكورد
          </h3>
          <p className="text-[#999] max-w-xl mx-auto text-sm sm:text-base mb-8">
            كن على تواصل مع أكثر من 15,000 لاعب، شارك في الفعاليات الأسبوعية، وتقدم للوظائف الرسمية.
          </p>
          <a
            href="https://discord.gg/primerp"
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-3 px-8 py-4 rounded-xl bg-[#5865F2] hover:bg-[#4752C4] text-white font-extrabold text-base transition-all shadow-xl shadow-[#5865F2]/25 hover:scale-105"
          >
            <MessageSquare className="w-5 h-5 fill-current" />
            <span>Join Discord Community</span>
          </a>
        </div>
      </section>

    </div>
  );
};

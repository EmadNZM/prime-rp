import React, { useState, useEffect } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { apiClient } from '../../services/apiClient';
import { NewsItem } from '../../types';
import { Newspaper, Calendar, User, ArrowRight, ArrowLeft, Flame, Sparkles, Tag } from 'lucide-react';

interface NewsPageProps {
  setCurrentTab: (tab: string) => void;
  setSelectedNewsSlug: (slug: string) => void;
}

export const NewsPage: React.FC<NewsPageProps> = ({ setCurrentTab, setSelectedNewsSlug }) => {
  const { t, language, isRtl } = useLanguage();
  const [news, setNews] = useState<NewsItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  useEffect(() => {
    async function loadNews() {
      try {
        const data = await apiClient.getNews();
        setNews(data);
      } catch (err) {
        console.error('Failed to load news:', err);
      } finally {
        setIsLoading(false);
      }
    }
    loadNews();
  }, []);

  const categories = ['all', ...Array.from(new Set(news.map((n) => n.category)))];
  const filteredNews = news.filter((n) => selectedCategory === 'all' || n.category === selectedCategory);
  const featuredItem = news.find((n) => n.featured) || news[0];
  const ArrowIcon = isRtl ? ArrowLeft : ArrowRight;

  return (
    <div className="min-h-screen bg-[#08090d] text-[#f1f3f7] pt-32 pb-28 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      
      {/* Ambient background glow (ONX & EchoRP) */}
      <div className="absolute top-10 left-1/2 -translate-x-1/2 w-full max-w-6xl h-[500px] bg-[#c8874b]/5 blur-[160px] pointer-events-none rounded-full" />
      <div className="absolute top-96 left-10 w-96 h-96 bg-[#c8874b]/5 blur-[140px] pointer-events-none rounded-full" />

      <div className="max-w-6xl mx-auto relative z-10">
        
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-12">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#c8874b]/10 border border-[#c8874b]/30 text-[#df9f64] text-xs font-black uppercase tracking-wider mb-4 shadow-sm">
            <Newspaper className="w-3.5 h-3.5 text-[#c8874b]" />
            <span>{language === 'ar' ? 'سجلات وأخبار المدينة' : 'PRIME Daily & Patch Logs'}</span>
          </div>
          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-white uppercase tracking-tight mb-4">
            <span className="block text-white">{language === 'ar' ? 'أخبار وتحديثات السيرفر' : 'DISPATCHES & LOGS'}</span>
            <span className="block mt-1 copper-gradient-text">
              {language === 'ar' ? 'كل جديد في برايم' : 'LATEST HIGHLIGHTS'}
            </span>
          </h1>
          <p className="text-[#969cad] text-sm sm:text-base leading-relaxed max-w-2xl mx-auto">
            {language === 'ar'
              ? 'تابع أحدث التحديثات البرمجية، فعاليات المجتمع، التوسعات الحكومية، والقرارات الإدارية الخاصة بمدينة PRIME RP.'
              : 'Official development updates, season roadmap reveals, government decrees, and live community event recaps.'}
          </p>
        </div>

        {/* Category Filter Tabs */}
        <div className="flex items-center gap-2.5 overflow-x-auto pb-4 mb-10 border-b border-white/[0.06] scrollbar-none">
          {categories.map((cat) => {
            const isSelected = selectedCategory === cat;
            return (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-5 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all whitespace-nowrap cursor-pointer ${
                  isSelected
                    ? 'bg-[#c8874b] text-black shadow-md shadow-[#c8874b]/20 font-black'
                    : 'bg-[#0d0f16] text-[#969cad] hover:text-white border border-white/[0.06] hover:border-white/[0.12]'
                }`}
              >
                {cat === 'all' ? (language === 'ar' ? 'جميع الأخبار والتحديثات' : 'All Updates') : cat}
              </button>
            );
          })}
        </div>

        {isLoading ? (
          <div className="text-center py-24 text-[#969cad] flex flex-col items-center justify-center gap-3">
            <div className="w-8 h-8 rounded-full border-2 border-[#c8874b] border-t-transparent animate-spin" />
            <span className="text-xs uppercase tracking-wider font-bold">{t('common.loading')}</span>
          </div>
        ) : (
          <div>
            {/* Featured Article Banner (ONX & EchoRP Style) */}
            {featuredItem && selectedCategory === 'all' && (
              <div
                onClick={() => {
                  setSelectedNewsSlug(featuredItem.slug);
                  setCurrentTab('news-detail');
                }}
                className="group cursor-pointer rounded-2xl overflow-hidden bg-[#0d0f16] border border-white/[0.08] hover:border-[#c8874b]/60 transition-all duration-300 mb-12 grid grid-cols-1 lg:grid-cols-12 shadow-2xl relative"
              >
                <div className="lg:col-span-7 relative min-h-[340px] overflow-hidden bg-[#131620]">
                  <img
                    src={featuredItem.image}
                    alt={featuredItem.translations[language]?.title || ''}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0d0f16] via-transparent to-transparent lg:hidden" />
                  <span className="absolute top-4 left-4 rtl:left-auto rtl:right-4 px-3 py-1.5 rounded-xl bg-[#c8874b] text-black text-[10px] font-black uppercase tracking-wider shadow-lg flex items-center gap-1.5">
                    <Flame className="w-3.5 h-3.5 fill-black" />
                    <span>Featured Dispatch</span>
                  </span>
                </div>
                
                <div className="lg:col-span-5 p-8 sm:p-10 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center gap-4 text-xs text-[#7a8091] mb-3 font-mono">
                      <span className="flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-[#c8874b]" />
                        {new Date(featuredItem.createdAt).toLocaleDateString(language === 'ar' ? 'ar-SA' : 'en-US')}
                      </span>
                      <span className="flex items-center gap-1.5">
                        <User className="w-3.5 h-3.5 text-[#c8874b]" />
                        {featuredItem.authorName}
                      </span>
                    </div>

                    <h2 className="text-2xl sm:text-3xl font-black text-white mb-4 group-hover:text-[#df9f64] transition-colors leading-snug uppercase tracking-tight">
                      {featuredItem.translations[language]?.title || featuredItem.translations.ar.title}
                    </h2>
                    
                    <p className="text-xs sm:text-sm text-[#969cad] leading-relaxed mb-6">
                      {featuredItem.translations[language]?.excerpt || featuredItem.translations.ar.excerpt}
                    </p>
                  </div>

                  <div className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-wider text-[#df9f64] group-hover:translate-x-1.5 rtl:group-hover:-translate-x-1.5 transition-transform">
                    <span>{t('news.readMore')}</span>
                    <ArrowIcon className="w-4 h-4" />
                  </div>
                </div>
              </div>
            )}

            {/* Standard News Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredNews.map((item) => {
                const trans = item.translations[language] || item.translations.ar;
                return (
                  <div
                    key={item.id}
                    onClick={() => {
                      setSelectedNewsSlug(item.slug);
                      setCurrentTab('news-detail');
                    }}
                    className="group cursor-pointer rounded-2xl overflow-hidden bg-[#0d0f16] border border-white/[0.08] hover:border-[#c8874b]/50 transition-all duration-300 flex flex-col justify-between shadow-xl card-hover-lift"
                  >
                    <div>
                      <div className="relative h-52 overflow-hidden bg-[#131620]">
                        <img
                          src={item.image}
                          alt={trans.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                        <span className="absolute top-3 left-3 rtl:left-auto rtl:right-3 px-3 py-1 text-[10px] font-black uppercase tracking-wider rounded-lg bg-[#08090d]/90 backdrop-blur-md text-[#df9f64] border border-[#c8874b]/30">
                          {item.category}
                        </span>
                      </div>
                      
                      <div className="p-6">
                        <span className="text-[11px] text-[#7a8091] block mb-2 font-mono">
                          {new Date(item.createdAt).toLocaleDateString(language === 'ar' ? 'ar-SA' : 'en-US')}
                        </span>
                        <h3 className="text-lg font-bold text-white mb-2 group-hover:text-[#df9f64] transition-colors line-clamp-2 uppercase tracking-tight">
                          {trans.title}
                        </h3>
                        <p className="text-xs text-[#969cad] line-clamp-3 leading-relaxed">
                          {trans.excerpt}
                        </p>
                      </div>
                    </div>

                    <div className="px-6 pb-6 pt-2">
                      <div className="inline-flex items-center gap-1.5 text-xs font-black uppercase tracking-wider text-[#df9f64] group-hover:translate-x-1.5 rtl:group-hover:-translate-x-1.5 transition-transform">
                        <span>{t('news.readMore')}</span>
                        <ArrowIcon className="w-3.5 h-3.5" />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

          </div>
        )}

      </div>
    </div>
  );
};

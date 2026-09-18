import React, { useState, useEffect } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { apiClient } from '../../services/apiClient';
import { NewsItem } from '../../types';
import { Newspaper, Calendar, User, ArrowRight, ArrowLeft, Flame } from 'lucide-react';

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
    <div className="min-h-screen bg-[#070707] text-[#E5E5E5] pt-28 pb-24 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Ambient background glow */}
      <div className="absolute top-20 left-1/2 -translate-x-1/2 w-full max-w-5xl h-96 bg-[#C8874B]/5 blur-[140px] pointer-events-none rounded-full" />

      <div className="max-w-6xl mx-auto relative z-10">
        
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-12">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#C8874B]/10 border border-[#C8874B]/25 text-[#C8874B] text-[10px] font-black uppercase tracking-wider mb-4">
            <Newspaper className="w-3.5 h-3.5" />
            <span>{language === 'ar' ? 'سجلات وأخبار السيرفر' : 'Prime Chronicles & Logs'}</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-black text-white uppercase tracking-tight mb-4">
            {t('news.title')}
          </h1>
          <p className="text-[#888] text-sm sm:text-base leading-relaxed max-w-2xl mx-auto">
            {t('news.subtitle')}
          </p>
        </div>

        {/* Category Filter Tabs */}
        <div className="flex items-center gap-2.5 overflow-x-auto pb-4 mb-10 border-b border-[#1E1E22]">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-5 py-2.5 rounded-2xl text-xs font-black uppercase tracking-wider transition-all whitespace-nowrap cursor-pointer ${
                selectedCategory === cat
                  ? 'bg-gradient-to-r from-[#C8874B] to-[#DF9F64] text-black shadow-lg shadow-[#C8874B]/20'
                  : 'bg-[#0D0D0F] text-[#888] hover:text-white hover:bg-[#151518] border border-[#222226]'
              }`}
            >
              {cat === 'all' ? (language === 'ar' ? 'جميع الأخبار والتحديثات' : 'All Updates') : cat}
            </button>
          ))}
        </div>

        {isLoading ? (
          <div className="text-center py-20 text-[#888] flex flex-col items-center justify-center gap-3">
            <div className="w-8 h-8 rounded-full border-2 border-[#C8874B] border-t-transparent animate-spin" />
            <span className="text-xs uppercase tracking-wider">{t('common.loading')}</span>
          </div>
        ) : (
          <div>
            {/* Featured Article Banner */}
            {featuredItem && selectedCategory === 'all' && (
              <div
                onClick={() => {
                  setSelectedNewsSlug(featuredItem.slug);
                  setCurrentTab('news-detail');
                }}
                className="group cursor-pointer rounded-3xl overflow-hidden bg-[#0D0D0F] border border-[#222226] hover:border-[#C8874B]/40 transition-all duration-300 mb-12 grid grid-cols-1 lg:grid-cols-12 shadow-2xl"
              >
                <div className="lg:col-span-7 relative min-h-[320px] overflow-hidden">
                  <img
                    src={featuredItem.image}
                    alt={featuredItem.translations[language]?.title || ''}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0D0D0F] via-transparent to-transparent lg:hidden" />
                  <span className="absolute top-4 left-4 rtl:left-auto rtl:right-4 px-3 py-1 rounded-full bg-gradient-to-r from-[#C8874B] to-[#DF9F64] text-black text-[10px] font-black uppercase tracking-wider shadow-lg flex items-center gap-1.5">
                    <Flame className="w-3 h-3 fill-black" />
                    <span>Featured Update</span>
                  </span>
                </div>
                <div className="lg:col-span-5 p-8 sm:p-10 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center gap-4 text-xs text-[#777] mb-3">
                      <span className="flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-[#C8874B]" />
                        {new Date(featuredItem.createdAt).toLocaleDateString(language === 'ar' ? 'ar-SA' : 'en-US')}
                      </span>
                      <span className="flex items-center gap-1.5">
                        <User className="w-3.5 h-3.5 text-[#C8874B]" />
                        {featuredItem.authorName}
                      </span>
                    </div>

                    <h2 className="text-2xl sm:text-3xl font-black text-white mb-4 group-hover:text-[#DF9F64] transition-colors leading-snug uppercase tracking-tight">
                      {featuredItem.translations[language]?.title || featuredItem.translations.ar.title}
                    </h2>
                    <p className="text-sm text-[#8E8E8E] leading-relaxed mb-6">
                      {featuredItem.translations[language]?.excerpt || featuredItem.translations.ar.excerpt}
                    </p>
                  </div>

                  <div className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-wider text-[#C8874B] group-hover:translate-x-1 rtl:group-hover:-translate-x-1 transition-transform">
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
                    className="group cursor-pointer rounded-3xl overflow-hidden bg-[#0D0D0F] border border-[#222226] hover:border-[#C8874B]/40 transition-all duration-300 flex flex-col justify-between shadow-xl"
                  >
                    <div>
                      <div className="relative h-52 overflow-hidden">
                        <img
                          src={item.image}
                          alt={trans.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                        <span className="absolute top-3 left-3 rtl:left-auto rtl:right-3 px-3 py-1 text-[10px] font-black uppercase tracking-wider rounded-full bg-[#0D0D0F]/90 backdrop-blur-md text-[#DF9F64] border border-[#C8874B]/30">
                          {item.category}
                        </span>
                      </div>
                      <div className="p-6">
                        <span className="text-[11px] text-[#777] block mb-2 font-mono">
                          {new Date(item.createdAt).toLocaleDateString(language === 'ar' ? 'ar-SA' : 'en-US')}
                        </span>
                        <h3 className="text-lg font-bold text-white mb-2 group-hover:text-[#DF9F64] transition-colors line-clamp-2 uppercase tracking-tight">
                          {trans.title}
                        </h3>
                        <p className="text-xs text-[#888] line-clamp-3 leading-relaxed">
                          {trans.excerpt}
                        </p>
                      </div>
                    </div>

                    <div className="px-6 pb-6 pt-2">
                      <div className="inline-flex items-center gap-1.5 text-xs font-black uppercase tracking-wider text-[#C8874B] group-hover:translate-x-1 rtl:group-hover:-translate-x-1 transition-transform">
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

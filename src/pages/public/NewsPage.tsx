import React, { useState, useEffect } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { apiClient } from '../../services/apiClient';
import { NewsItem } from '../../types';
import { Newspaper, Calendar, User, ArrowRight, ArrowLeft } from 'lucide-react';

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
    <div className="min-h-screen bg-[#070707] text-[#E5E5E5] pt-28 pb-24 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#C8874B]/10 text-[#C8874B] text-xs font-bold mb-4">
            <Newspaper className="w-3.5 h-3.5" />
            <span>Prime Chronicles</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-black text-white mb-4">
            {t('news.title')}
          </h1>
          <p className="text-[#8E8E8E] text-sm sm:text-base leading-relaxed">
            {t('news.subtitle')}
          </p>
        </div>

        {/* Category Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-4 mb-10 border-b border-[#1A1A1A]">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                selectedCategory === cat
                  ? 'bg-[#C8874B] text-black shadow-md shadow-[#C8874B]/20'
                  : 'bg-[#111] text-[#999] hover:text-white hover:bg-[#1A1A1A] border border-[#222]'
              }`}
            >
              {cat === 'all' ? (language === 'ar' ? 'جميع الأخبار' : 'All Updates') : cat}
            </button>
          ))}
        </div>

        {isLoading ? (
          <div className="text-center py-20 text-[#888]">{t('common.loading')}</div>
        ) : (
          <div>
            {/* Featured Article Banner */}
            {featuredItem && selectedCategory === 'all' && (
              <div
                onClick={() => {
                  setSelectedNewsSlug(featuredItem.slug);
                  setCurrentTab('news-detail');
                }}
                className="group cursor-pointer rounded-3xl overflow-hidden bg-[#0B0B0B] border border-[#222] hover:border-[#C8874B]/50 transition-all mb-12 grid grid-cols-1 lg:grid-cols-12"
              >
                <div className="lg:col-span-7 relative min-h-[300px] overflow-hidden">
                  <img
                    src={featuredItem.image}
                    alt={featuredItem.translations[language]?.title || ''}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                  />
                  <span className="absolute top-4 left-4 rtl:left-auto rtl:right-4 px-3 py-1 rounded-md bg-[#C8874B] text-black text-xs font-extrabold uppercase">
                    Featured Update
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

                    <h2 className="text-2xl sm:text-3xl font-black text-white mb-4 group-hover:text-[#C8874B] transition-colors leading-snug">
                      {featuredItem.translations[language]?.title || featuredItem.translations.ar.title}
                    </h2>
                    <p className="text-sm text-[#8E8E8E] leading-relaxed mb-6">
                      {featuredItem.translations[language]?.excerpt || featuredItem.translations.ar.excerpt}
                    </p>
                  </div>

                  <div className="inline-flex items-center gap-2 text-sm font-bold text-[#C8874B]">
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
                    className="group cursor-pointer rounded-2xl overflow-hidden bg-[#0B0B0B] border border-[#1E1E1E] hover:border-[#C8874B]/50 transition-all flex flex-col justify-between"
                  >
                    <div>
                      <div className="relative h-48 overflow-hidden">
                        <img
                          src={item.image}
                          alt={trans.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                        <span className="absolute top-3 left-3 rtl:left-auto rtl:right-3 px-2.5 py-1 text-[11px] font-bold rounded-md bg-black/80 backdrop-blur-md text-[#C8874B] border border-[#C8874B]/30">
                          {item.category}
                        </span>
                      </div>
                      <div className="p-6">
                        <span className="text-xs text-[#777] block mb-2">
                          {new Date(item.createdAt).toLocaleDateString(language === 'ar' ? 'ar-SA' : 'en-US')}
                        </span>
                        <h3 className="text-lg font-bold text-white mb-2 group-hover:text-[#C8874B] transition-colors line-clamp-2">
                          {trans.title}
                        </h3>
                        <p className="text-sm text-[#888] line-clamp-3">
                          {trans.excerpt}
                        </p>
                      </div>
                    </div>

                    <div className="px-6 pb-6 pt-2">
                      <div className="inline-flex items-center gap-1.5 text-xs font-bold text-[#C8874B]">
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

import React, { useState, useEffect } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { apiClient } from '../../services/apiClient';
import { NewsItem } from '../../types';
import { Calendar, User, ArrowLeft, ArrowRight, Share2, Check } from 'lucide-react';

interface NewsDetailPageProps {
  slug: string;
  onBack: () => void;
}

export const NewsDetailPage: React.FC<NewsDetailPageProps> = ({ slug, onBack }) => {
  const { t, language, isRtl } = useLanguage();
  const [item, setItem] = useState<NewsItem | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [copied, setCopied] = useState<boolean>(false);

  useEffect(() => {
    async function loadItem() {
      try {
        const data = await apiClient.getNewsBySlug(slug);
        setItem(data);
      } catch (err) {
        console.error('Failed to load article:', err);
      } finally {
        setIsLoading(false);
      }
    }
    loadItem();
  }, [slug]);

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const BackArrow = isRtl ? ArrowRight : ArrowLeft;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#070707] text-[#E5E5E5] pt-32 text-center">
        {t('common.loading')}
      </div>
    );
  }

  if (!item) {
    return (
      <div className="min-h-screen bg-[#070707] text-[#E5E5E5] pt-32 text-center">
        <p className="text-xl mb-4">المقال غير موجود أو تم حذفه / Article not found</p>
        <button
          onClick={onBack}
          className="px-6 py-2 rounded-xl bg-[#C8874B] text-black font-bold"
        >
          {t('common.back')}
        </button>
      </div>
    );
  }

  const trans = item.translations[language] || item.translations.ar;

  return (
    <div className="min-h-screen bg-[#070707] text-[#E5E5E5] pt-28 pb-24 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        
        {/* Back Button & Share */}
        <div className="flex items-center justify-between mb-8">
          <button
            onClick={onBack}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#111] border border-[#222] text-[#AAA] hover:text-white hover:border-[#C8874B] transition-all text-xs font-bold"
          >
            <BackArrow className="w-4 h-4" />
            <span>{t('news.allNews')}</span>
          </button>

          <button
            onClick={handleShare}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#111] border border-[#222] text-xs text-[#AAA] hover:text-white"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Share2 className="w-3.5 h-3.5" />}
            <span>{copied ? 'تم النسخ' : 'مشاركة'}</span>
          </button>
        </div>

        {/* Article Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <span className="px-3 py-1 rounded-md text-xs font-black bg-[#C8874B]/20 text-[#C8874B] border border-[#C8874B]/30">
              {item.category}
            </span>
            <span className="text-xs text-[#777] flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-[#C8874B]" />
              {new Date(item.createdAt).toLocaleDateString(language === 'ar' ? 'ar-SA' : 'en-US')}
            </span>
            <span className="text-xs text-[#777] flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-[#C8874B]" />
              {item.authorName}
            </span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-black text-white leading-tight mb-4">
            {trans.title}
          </h1>

          <p className="text-lg text-[#C8874B] leading-relaxed border-l-2 rtl:border-l-0 rtl:border-r-2 border-[#C8874B] pl-4 rtl:pl-0 rtl:pr-4 py-1">
            {trans.excerpt}
          </p>
        </div>

        {/* Featured Image */}
        <div className="relative h-80 sm:h-96 rounded-3xl overflow-hidden border border-[#222] mb-10 shadow-2xl">
          <img
            src={item.image}
            alt={trans.title}
            className="w-full h-full object-cover"
          />
        </div>

        {/* Content Body */}
        <div className="prose prose-invert max-w-none text-[#C7C7C7] text-base leading-loose whitespace-pre-line bg-[#0B0B0B] border border-[#1A1A1A] p-8 sm:p-10 rounded-3xl">
          {trans.content}
        </div>

      </div>
    </div>
  );
};

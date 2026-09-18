import React, { useState, useEffect } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { apiClient } from '../../services/apiClient';
import { NewsItem } from '../../types';
import { Calendar, User, ArrowLeft, ArrowRight, Share2, Check, Tag } from 'lucide-react';

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
      <div className="min-h-screen bg-[#08090d] text-[#969cad] pt-36 text-center">
        <div className="w-8 h-8 rounded-full border-2 border-[#c8874b] border-t-transparent animate-spin mx-auto mb-3" />
        <p className="text-xs uppercase tracking-wider font-bold">{t('common.loading')}</p>
      </div>
    );
  }

  if (!item) {
    return (
      <div className="min-h-screen bg-[#08090d] text-[#f1f3f7] pt-36 text-center">
        <p className="text-lg mb-4 text-[#969cad]">{language === 'ar' ? 'المقال غير موجود أو تم حذفه' : 'Article not found'}</p>
        <button
          onClick={onBack}
          className="px-6 py-2.5 rounded-xl bg-[#c8874b] hover:bg-[#df9f64] text-black font-black text-xs uppercase tracking-wider transition-all cursor-pointer shadow-md"
        >
          {t('common.back')}
        </button>
      </div>
    );
  }

  const trans = item.translations[language] || item.translations.ar;

  return (
    <div className="min-h-screen bg-[#08090d] text-[#f1f3f7] pt-32 pb-28 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Ambience */}
      <div className="absolute top-10 left-1/2 -translate-x-1/2 w-full max-w-5xl h-96 bg-[#c8874b]/5 blur-[140px] pointer-events-none rounded-full" />

      <div className="max-w-4xl mx-auto relative z-10">
        
        {/* Back Button & Share */}
        <div className="flex items-center justify-between mb-8">
          <button
            onClick={onBack}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#0d0f16] border border-white/[0.08] text-[#969cad] hover:text-white hover:border-[#c8874b]/50 transition-all text-xs font-bold cursor-pointer"
          >
            <BackArrow className="w-4 h-4" />
            <span>{t('news.allNews')}</span>
          </button>

          <button
            onClick={handleShare}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#0d0f16] border border-white/[0.08] text-xs text-[#969cad] hover:text-white hover:border-[#c8874b]/50 transition-all cursor-pointer"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Share2 className="w-3.5 h-3.5 text-[#c8874b]" />}
            <span>{copied ? (language === 'ar' ? 'تم النسخ' : 'Copied') : (language === 'ar' ? 'مشاركة' : 'Share')}</span>
          </button>
        </div>

        {/* Article Header */}
        <div className="mb-8">
          <div className="flex flex-wrap items-center gap-3 mb-4">
            <span className="px-3 py-1 rounded-lg text-xs font-black bg-[#c8874b]/15 text-[#df9f64] border border-[#c8874b]/30 uppercase font-rajdhani">
              {item.category}
            </span>
            <span className="text-xs text-[#7a8091] flex items-center gap-1.5 font-mono">
              <Calendar className="w-3.5 h-3.5 text-[#c8874b]" />
              {new Date(item.createdAt).toLocaleDateString(language === 'ar' ? 'ar-SA' : 'en-US')}
            </span>
            <span className="text-xs text-[#7a8091] flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-[#c8874b]" />
              {item.authorName}
            </span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-black text-white leading-tight mb-4 tracking-tight uppercase font-rajdhani">
            {trans.title}
          </h1>

          <p className="text-base sm:text-lg text-[#df9f64] leading-relaxed border-l-2 rtl:border-l-0 rtl:border-r-2 border-[#c8874b] pl-4 rtl:pl-0 rtl:pr-4 py-1 font-medium bg-[#c8874b]/5 rounded-r-xl rtl:rounded-r-none rtl:rounded-l-xl">
            {trans.excerpt}
          </p>
        </div>

        {/* Featured Image */}
        <div className="relative h-80 sm:h-96 rounded-2xl overflow-hidden border border-white/[0.08] mb-10 shadow-2xl bg-[#131620]">
          <img
            src={item.image}
            alt={trans.title}
            className="w-full h-full object-cover"
          />
        </div>

        {/* Content Body */}
        <div className="prose prose-invert max-w-none text-[#d1d5db] text-base leading-loose whitespace-pre-line bg-[#0d0f16] border border-white/[0.08] p-8 sm:p-10 rounded-2xl shadow-xl">
          {trans.content}
        </div>

      </div>
    </div>
  );
};

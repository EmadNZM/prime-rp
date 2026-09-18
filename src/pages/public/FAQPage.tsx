import React, { useState, useEffect } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { apiClient } from '../../services/apiClient';
import { FAQItem } from '../../types';
import { HelpCircle, ChevronDown, ChevronUp, Sparkles, MessageCircleQuestion } from 'lucide-react';

export const FAQPage: React.FC = () => {
  const { t, language } = useLanguage();
  const [faqs, setFaqs] = useState<FAQItem[]>([]);
  const [openIndex, setOpenIndex] = useState<number | null>(0);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    async function loadFaq() {
      try {
        const data = await apiClient.getFAQ();
        setFaqs(data);
      } catch (err) {
        console.error('Failed to load FAQ:', err);
      } finally {
        setIsLoading(false);
      }
    }
    loadFaq();
  }, []);

  const toggleAccordion = (idx: number) => {
    setOpenIndex(openIndex === idx ? null : idx);
  };

  return (
    <div className="min-h-screen bg-[#070707] text-[#E5E5E5] pt-28 pb-24 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Ambient background glow */}
      <div className="absolute top-20 left-1/2 -translate-x-1/2 w-full max-w-4xl h-96 bg-[#C8874B]/5 blur-[120px] pointer-events-none rounded-full" />

      <div className="max-w-4xl mx-auto relative z-10">
        
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-14">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#C8874B]/10 border border-[#C8874B]/25 text-[#C8874B] text-[10px] font-black uppercase tracking-wider mb-4">
            <MessageCircleQuestion className="w-3.5 h-3.5" />
            <span>{language === 'ar' ? 'مركز المساعدة والاستفسارات' : 'Knowledge Base & FAQ'}</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-black text-white uppercase tracking-tight mb-4">
            {t('faq.title')}
          </h1>
          <p className="text-[#888] text-sm sm:text-base leading-relaxed max-w-2xl mx-auto">
            {t('faq.subtitle')}
          </p>
        </div>

        {isLoading ? (
          <div className="text-center py-20 text-[#888] flex flex-col items-center justify-center gap-3">
            <div className="w-8 h-8 rounded-full border-2 border-[#C8874B] border-t-transparent animate-spin" />
            <span className="text-xs uppercase tracking-wider">{t('common.loading')}</span>
          </div>
        ) : (
          <div className="space-y-4">
            {faqs.map((item, idx) => {
              const trans = item.translations[language] || item.translations.ar;
              const isOpen = openIndex === idx;
              return (
                <div
                  key={item.id}
                  className={`rounded-3xl border transition-all duration-300 overflow-hidden ${
                    isOpen 
                      ? 'bg-[#0D0D0F] border-[#C8874B]/40 shadow-xl shadow-[#C8874B]/5' 
                      : 'bg-[#0D0D0F] border-[#222226] hover:border-[#333]'
                  }`}
                >
                  <button
                    onClick={() => toggleAccordion(idx)}
                    className="w-full text-left rtl:text-right p-6 sm:p-7 flex items-center justify-between gap-4 focus:outline-none cursor-pointer"
                  >
                    <div className="flex items-center gap-3">
                      <span className={`w-2 h-2 rounded-full transition-colors ${isOpen ? 'bg-[#C8874B]' : 'bg-[#333]'}`} />
                      <span className="text-base sm:text-lg font-bold text-white leading-snug">
                        {trans.question}
                      </span>
                    </div>
                    <div className={`w-8 h-8 rounded-xl flex items-center justify-center transition-all ${
                      isOpen ? 'bg-[#C8874B]/15 text-[#C8874B]' : 'bg-[#151518] text-[#777]'
                    }`}>
                      {isOpen ? (
                        <ChevronUp className="w-4 h-4 shrink-0" />
                      ) : (
                        <ChevronDown className="w-4 h-4 shrink-0" />
                      )}
                    </div>
                  </button>

                  {isOpen && (
                    <div className="px-6 sm:px-7 pb-7 text-sm text-[#AAA] leading-relaxed border-t border-[#1E1E22] pt-5">
                      {trans.answer}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* Need More Help Box */}
        <div className="mt-14 p-6 sm:p-8 rounded-3xl bg-[#0D0D0F] border border-[#222226] text-center flex flex-col sm:flex-row items-center justify-between gap-6 shadow-2xl">
          <div className="text-center sm:text-left sm:rtl:text-right">
            <h3 className="text-lg font-black text-white uppercase tracking-tight mb-1">
              {language === 'ar' ? 'هل لا تزال لديك استفسارات إضافية؟' : 'Still have questions?'}
            </h3>
            <p className="text-xs text-[#777]">
              {language === 'ar' 
                ? 'فريق الدعم الفني جاهز لمساعدتك على مدار الساعة عبر تذاكر الدعم والديسكورد.' 
                : 'Our support team is available 24/7 to assist you via support tickets and Discord.'}
            </p>
          </div>
          <a
            href="https://discord.gg/prime-rp"
            target="_blank"
            rel="noopener noreferrer"
            className="px-6 py-3 rounded-2xl bg-gradient-to-r from-[#C8874B] to-[#DF9F64] text-black font-black text-xs uppercase tracking-wider hover:brightness-110 transition-all shadow-xl shadow-[#C8874B]/20 shrink-0"
          >
            {language === 'ar' ? 'انضم إلى مجتمع الديسكورد' : 'Join Discord Support'}
          </a>
        </div>

      </div>
    </div>
  );
};

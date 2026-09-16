import React, { useState, useEffect } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { apiClient } from '../../services/apiClient';
import { FAQItem } from '../../types';
import { HelpCircle, ChevronDown, ChevronUp } from 'lucide-react';

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
    <div className="min-h-screen bg-[#070707] text-[#E5E5E5] pt-28 pb-24 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-14">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#C8874B]/10 text-[#C8874B] text-xs font-bold mb-4">
            <HelpCircle className="w-3.5 h-3.5" />
            <span>Knowledge Base</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-black text-white mb-4">
            {t('faq.title')}
          </h1>
          <p className="text-[#8E8E8E] text-sm sm:text-base leading-relaxed">
            {t('faq.subtitle')}
          </p>
        </div>

        {isLoading ? (
          <div className="text-center py-20 text-[#888]">{t('common.loading')}</div>
        ) : (
          <div className="space-y-4">
            {faqs.map((item, idx) => {
              const trans = item.translations[language] || item.translations.ar;
              const isOpen = openIndex === idx;
              return (
                <div
                  key={item.id}
                  className="rounded-2xl bg-[#0B0B0B] border border-[#1C1C1C] overflow-hidden transition-all"
                >
                  <button
                    onClick={() => toggleAccordion(idx)}
                    className="w-full text-left rtl:text-right p-5 sm:p-6 flex items-center justify-between gap-4 focus:outline-none"
                  >
                    <span className="text-base sm:text-lg font-bold text-white">
                      {trans.question}
                    </span>
                    {isOpen ? (
                      <ChevronUp className="w-5 h-5 text-[#C8874B] shrink-0" />
                    ) : (
                      <ChevronDown className="w-5 h-5 text-[#666] shrink-0" />
                    )}
                  </button>

                  {isOpen && (
                    <div className="px-5 sm:px-6 pb-6 text-sm text-[#999] leading-relaxed border-t border-[#181818] pt-4">
                      {trans.answer}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

      </div>
    </div>
  );
};

import React, { useState, useEffect, useMemo } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { useSettings } from '../../context/SettingsContext';
import { apiClient } from '../../services/apiClient';
import { FAQItem } from '../../types';
import { 
  HelpCircle, 
  ChevronDown, 
  ChevronUp, 
  Search, 
  X, 
  Ticket, 
  MessageSquare, 
  Sparkles, 
  Layers,
  ArrowRight,
  ArrowLeft
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface FAQPageProps {
  setCurrentTab?: (tab: string) => void;
}

export const FAQPage: React.FC<FAQPageProps> = ({ setCurrentTab }) => {
  const { t, language, isRtl } = useLanguage();
  const { settings } = useSettings();
  const [faqs, setFaqs] = useState<FAQItem[]>([]);
  const [openIndex, setOpenIndex] = useState<number | null>(0);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    async function loadFaq() {
      try {
        const data = await apiClient.getFAQ();
        setFaqs(data || []);
      } catch (err) {
        console.error('Failed to load FAQ:', err);
      } finally {
        setIsLoading(false);
      }
    }
    loadFaq();
  }, []);

  const categories = [
    { id: 'all', labelAr: 'الكل', labelEn: 'All Questions' },
    { id: 'GENERAL', labelAr: 'عام والانضمام', labelEn: 'General & Join' },
    { id: 'RULES', labelAr: 'القوانين والرول بلاي', labelEn: 'Rules & RP' },
    { id: 'FIVEM', labelAr: 'الاتصال والمشاكل', labelEn: 'Connection' },
    { id: 'STORE', labelAr: 'المتجر وباقات VIP', labelEn: 'Store & VIP' }
  ];

  const filteredFaqs = useMemo(() => {
    return faqs.filter(item => {
      // Category filter (if items have category or fallback match)
      if (selectedCategory !== 'all' && (item as any).category && (item as any).category !== selectedCategory) {
        return false;
      }
      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase().trim();
      const trans = item.translations[language] || item.translations.ar || item.translations.en;
      return trans.question.toLowerCase().includes(q) || trans.answer.toLowerCase().includes(q);
    });
  }, [faqs, selectedCategory, searchQuery, language]);

  const toggleAccordion = (idx: number) => {
    setOpenIndex(openIndex === idx ? null : idx);
  };

  const ArrowIcon = isRtl ? ArrowLeft : ArrowRight;

  return (
    <div className="min-h-screen bg-[#08090d] text-[#f1f3f7] pt-32 pb-28 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      
      {/* Ambient background glow */}
      <div className="absolute top-10 left-1/2 -translate-x-1/2 w-full max-w-6xl h-[500px] bg-[#c8874b]/5 blur-[160px] pointer-events-none rounded-full" />

      <div className="max-w-4xl mx-auto relative z-10">
        
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-12">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#c8874b]/10 border border-[#c8874b]/30 text-[#df9f64] text-xs font-black uppercase tracking-wider mb-4 shadow-sm">
            <HelpCircle className="w-3.5 h-3.5 text-[#c8874b]" />
            <span>{language === 'ar' ? 'مركز المعرفة والاستفسارات' : 'Knowledge Base & FAQ'}</span>
          </div>
          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-white uppercase tracking-tight mb-4">
            <span className="block text-white">{t('faq.title')}</span>
            <span className="block mt-1 copper-gradient-text">
              {language === 'ar' ? 'دليلك الشامل لمدينة برايم' : 'FREQUENTLY ASKED'}
            </span>
          </h1>
          <p className="text-[#969cad] text-sm sm:text-base leading-relaxed max-w-2xl mx-auto">
            {t('faq.subtitle')}
          </p>
        </div>

        {/* Live Search Bar */}
        <div className="relative max-w-2xl mx-auto mb-8">
          <Search className="absolute left-4 rtl:left-auto rtl:right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#7a8091]" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={language === 'ar' ? 'ابحث في الأسئلة الشائعة، القوانين، طريقة الاتصال...' : 'Search questions, rules, connection guide...'}
            className="w-full pl-12 pr-12 rtl:pl-12 rtl:pr-12 py-4 rounded-xl bg-[#0d0f16] border border-white/[0.08] focus:border-[#c8874b] text-sm text-white placeholder-[#666] outline-none transition-all shadow-xl"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-4 rtl:right-auto rtl:left-4 top-1/2 -translate-y-1/2 p-1.5 rounded-lg hover:bg-white/10 text-[#7a8091] hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Category Pill Filters */}
        <div className="flex flex-wrap items-center justify-center gap-2 mb-10">
          {categories.map((cat) => {
            const active = selectedCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => {
                  setSelectedCategory(cat.id);
                  setOpenIndex(null);
                }}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  active
                    ? 'bg-[#c8874b] text-black shadow-md shadow-[#c8874b]/20 font-black'
                    : 'bg-[#0d0f16] text-[#969cad] hover:text-white border border-white/[0.06] hover:border-white/[0.12]'
                }`}
              >
                {language === 'ar' ? cat.labelAr : cat.labelEn}
              </button>
            );
          })}
        </div>

        {isLoading ? (
          <div className="text-center py-20 text-[#969cad] flex flex-col items-center justify-center gap-3">
            <div className="w-8 h-8 rounded-full border-2 border-[#c8874b] border-t-transparent animate-spin" />
            <span className="text-xs uppercase tracking-wider font-bold">{t('common.loading')}</span>
          </div>
        ) : filteredFaqs.length === 0 ? (
          <div className="text-center py-16 p-8 rounded-2xl bg-[#0d0f16] border border-white/[0.08]">
            <HelpCircle className="w-10 h-10 text-[#555] mx-auto mb-3" />
            <p className="text-sm font-bold text-white mb-2 uppercase tracking-wide">
              {language === 'ar' ? 'لم يتم العثور على نتائج مطابقة' : 'No matching questions found'}
            </p>
            <p className="text-xs text-[#7a8091] mb-6">
              {language === 'ar' ? 'جرب البحث بكلمات مختلفة أو تواصل مع فريق الدعم مباشرة.' : 'Try a different search term or reach out to our support team directly.'}
            </p>
            {setCurrentTab && (
              <button
                onClick={() => setCurrentTab('support')}
                className="px-6 py-2.5 rounded-xl bg-[#131620] hover:bg-[#1a1e2d] border border-[#c8874b]/40 text-[#df9f64] text-xs font-bold transition-all cursor-pointer inline-flex items-center gap-2"
              >
                <Ticket className="w-4 h-4" />
                <span>{language === 'ar' ? 'فتح تذكرة دعم فني' : 'Open Support Ticket'}</span>
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-3.5">
            {filteredFaqs.map((item, idx) => {
              const trans = item.translations[language] || item.translations.ar || item.translations.en;
              const isOpen = openIndex === idx;
              return (
                <div
                  key={item.id}
                  className={`rounded-xl border transition-all duration-200 overflow-hidden ${
                    isOpen 
                      ? 'bg-[#0d0f16] border-[#c8874b]/50 shadow-xl shadow-[#c8874b]/5' 
                      : 'bg-[#0d0f16] border-white/[0.06] hover:border-white/[0.12]'
                  }`}
                >
                  <button
                    onClick={() => toggleAccordion(idx)}
                    className="w-full text-left rtl:text-right p-5 sm:p-6 flex items-center justify-between gap-4 focus:outline-none cursor-pointer"
                  >
                    <div className="flex items-center gap-3">
                      <span className={`w-2 h-2 rounded-full transition-colors shrink-0 ${isOpen ? 'bg-[#c8874b]' : 'bg-[#333]'}`} />
                      <span className="text-sm sm:text-base font-bold text-white leading-snug">
                        {trans.question}
                      </span>
                    </div>
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all shrink-0 ${
                      isOpen ? 'bg-[#c8874b]/20 text-[#df9f64]' : 'bg-[#131620] text-[#7a8091]'
                    }`}>
                      {isOpen ? (
                        <ChevronUp className="w-4 h-4" />
                      ) : (
                        <ChevronDown className="w-4 h-4" />
                      )}
                    </div>
                  </button>

                  <AnimatePresence>
                    {isOpen && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.25 }}
                        className="overflow-hidden"
                      >
                        <div className="px-5 sm:px-6 pb-6 text-xs sm:text-sm text-[#969cad] leading-relaxed border-t border-white/[0.06] pt-4">
                          {trans.answer}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </div>
        )}

        {/* Need More Help Box */}
        <div className="mt-14 p-6 sm:p-8 rounded-2xl bg-[#0d0f16] border border-white/[0.08] flex flex-col sm:flex-row items-center justify-between gap-6 shadow-2xl">
          <div className="text-center sm:text-left sm:rtl:text-right">
            <h3 className="text-base sm:text-lg font-black text-white uppercase tracking-tight mb-1">
              {language === 'ar' ? 'هل لا تزال لديك استفسارات إضافية؟' : 'Still have unanswered questions?'}
            </h3>
            <p className="text-xs text-[#7a8091]">
              {language === 'ar' 
                ? 'فريق الدعم الفني وإدارة السيرفر جاهزون لمساعدتك على مدار الساعة.' 
                : 'Our support team is available 24/7 to assist with tickets, reports, and onboarding.'}
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            {setCurrentTab && (
              <button
                onClick={() => {
                  setCurrentTab('support');
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                className="px-5 py-3 rounded-xl bg-[#c8874b] hover:bg-[#df9f64] text-black font-black text-xs uppercase tracking-wider active:scale-98 transition-all shadow-lg shadow-[#c8874b]/20 shrink-0 cursor-pointer flex items-center gap-2"
              >
                <Ticket className="w-4 h-4" />
                <span>{language === 'ar' ? 'فتح تذكرة دعم' : 'Open Support Ticket'}</span>
              </button>
            )}
            <a
              href={settings?.discordUrl || "https://discord.gg/primee"}
              target="_blank"
              rel="noopener noreferrer"
              className="px-5 py-3 rounded-xl bg-[#131620] hover:bg-[#1a1e2d] border border-white/[0.08] hover:border-[#5865F2]/50 text-white font-bold text-xs uppercase tracking-wider transition-all shrink-0 flex items-center gap-2"
            >
              <MessageSquare className="w-4 h-4 text-[#5865F2]" />
              <span>{language === 'ar' ? 'ديسكورد الدعم' : 'Discord Support'}</span>
            </a>
          </div>
        </div>

      </div>
    </div>
  );
};

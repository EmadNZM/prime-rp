import React, { useState, useEffect } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { apiClient } from '../../services/apiClient';
import { RuleCategory } from '../../types';
import { ShieldAlert, AlertTriangle, Search, BookOpen } from 'lucide-react';

export const RulesPage: React.FC = () => {
  const { t, language } = useLanguage();
  const [categories, setCategories] = useState<RuleCategory[]>([]);
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    async function loadRules() {
      try {
        const data = await apiClient.getRules();
        setCategories(data);
      } catch (err) {
        console.error('Failed to load rules:', err);
      } finally {
        setIsLoading(false);
      }
    }
    loadRules();
  }, []);

  const filteredCategories = categories.filter((cat) => {
    if (activeCategory !== 'all' && cat.id !== activeCategory) {
      return false;
    }
    return true;
  });

  return (
    <div className="min-h-screen bg-[#070707] text-[#E5E5E5] pt-28 pb-24 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#C8874B]/10 text-[#C8874B] text-xs font-bold mb-4">
            <BookOpen className="w-3.5 h-3.5" />
            <span>Server Constitution</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-black text-white mb-4">
            {t('rules.title')}
          </h1>
          <p className="text-[#8E8E8E] text-sm sm:text-base leading-relaxed">
            {t('rules.subtitle')}
          </p>
        </div>

        {/* Filter and Search Bar */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-10 pb-6 border-b border-[#1A1A1A]">
          {/* Category Tabs */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => setActiveCategory('all')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                activeCategory === 'all'
                  ? 'bg-[#C8874B] text-black shadow-md shadow-[#C8874B]/20'
                  : 'bg-[#111] text-[#999] hover:text-white hover:bg-[#1A1A1A] border border-[#222]'
              }`}
            >
              {t('rules.allCategories')}
            </button>
            {categories.map((cat) => {
              const trans = cat.translations[language] || cat.translations.ar;
              return (
                <button
                  key={cat.id}
                  onClick={() => setActiveCategory(cat.id)}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                    activeCategory === cat.id
                      ? 'bg-[#C8874B] text-black shadow-md shadow-[#C8874B]/20'
                      : 'bg-[#111] text-[#999] hover:text-white hover:bg-[#1A1A1A] border border-[#222]'
                  }`}
                >
                  {trans.title}
                </button>
              );
            })}
          </div>

          {/* Search Input */}
          <div className="relative w-full md:w-72">
            <Search className="w-4 h-4 text-[#777] absolute left-3 rtl:left-auto rtl:right-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t('rules.searchPlaceholder')}
              className="w-full bg-[#111] border border-[#222] rounded-xl pl-9 pr-4 rtl:pl-4 rtl:pr-9 py-2 text-xs text-white placeholder-[#666] focus:outline-none focus:border-[#C8874B]"
            />
          </div>
        </div>

        {/* Rule Categories List */}
        {isLoading ? (
          <div className="text-center py-20 text-[#888]">{t('common.loading')}</div>
        ) : (
          <div className="space-y-12">
            {filteredCategories.map((cat) => {
              const catTrans = cat.translations[language] || cat.translations.ar;
              const matchingRules = cat.rules.filter((rule) => {
                if (!searchQuery) return true;
                const rTrans = rule.translations[language] || rule.translations.ar;
                return (
                  rTrans.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                  rTrans.description.toLowerCase().includes(searchQuery.toLowerCase())
                );
              });

              if (matchingRules.length === 0) return null;

              return (
                <div key={cat.id} className="rounded-3xl bg-[#0B0B0B] border border-[#1C1C1C] p-6 sm:p-8">
                  {/* Category Header */}
                  <div className="border-b border-[#1A1A1A] pb-6 mb-6">
                    <div className="flex items-center gap-3 mb-2">
                      <ShieldAlert className="w-6 h-6 text-[#C8874B]" />
                      <h2 className="text-xl sm:text-2xl font-black text-white">
                        {catTrans.title}
                      </h2>
                    </div>
                    <p className="text-sm text-[#888] mb-3">{catTrans.description}</p>
                    {catTrans.penaltyInfo && (
                      <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-red-500/10 border border-red-500/20 text-xs font-semibold text-red-400">
                        <AlertTriangle className="w-3.5 h-3.5" />
                        <span>{t('rules.penalty')}: {catTrans.penaltyInfo}</span>
                      </div>
                    )}
                  </div>

                  {/* Rules Items */}
                  <div className="space-y-4">
                    {matchingRules.map((rule) => {
                      const rTrans = rule.translations[language] || rule.translations.ar;
                      return (
                        <div
                          key={rule.id}
                          className="p-5 rounded-2xl bg-[#111111] border border-[#1E1E1E] hover:border-[#C8874B]/30 transition-all"
                        >
                          <div className="flex items-start gap-4">
                            <span className="px-2.5 py-1 rounded-md bg-[#C8874B]/10 text-[#C8874B] text-xs font-black shrink-0 border border-[#C8874B]/20">
                              {rule.number}
                            </span>
                            <div className="flex-1">
                              <h3 className="text-base font-bold text-white mb-1.5">
                                {rTrans.title}
                              </h3>
                              <p className="text-sm text-[#999] leading-relaxed mb-2">
                                {rTrans.description}
                              </p>
                              {rTrans.warning && (
                                <p className="text-xs text-[#C8874B] font-semibold">
                                  ⚠️ {rTrans.warning}
                                </p>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        )}

      </div>
    </div>
  );
};

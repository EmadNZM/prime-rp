import React, { useState, useEffect } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { apiClient } from '../../services/apiClient';
import { RuleCategory } from '../../types';
import { ShieldAlert, AlertTriangle, Search, BookOpen, Scale } from 'lucide-react';

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
    <div className="min-h-screen bg-[#070707] text-[#E5E5E5] pt-28 pb-24 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Ambient glow */}
      <div className="absolute top-20 left-1/2 -translate-x-1/2 w-full max-w-5xl h-96 bg-[#C8874B]/5 blur-[140px] pointer-events-none rounded-full" />

      <div className="max-w-6xl mx-auto relative z-10">
        
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-12">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#C8874B]/10 border border-[#C8874B]/25 text-[#C8874B] text-[10px] font-black uppercase tracking-wider mb-4">
            <Scale className="w-3.5 h-3.5" />
            <span>{language === 'ar' ? 'دستور وقوانين المجتمع' : 'Server Constitution & Codex'}</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-black text-white uppercase tracking-tight mb-4">
            {t('rules.title')}
          </h1>
          <p className="text-[#888] text-sm sm:text-base leading-relaxed max-w-2xl mx-auto">
            {t('rules.subtitle')}
          </p>
        </div>

        {/* Filter and Search Bar */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-10 pb-6 border-b border-[#1E1E22]">
          {/* Category Tabs */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => setActiveCategory('all')}
              className={`px-4 py-2.5 rounded-2xl text-xs font-black uppercase tracking-wider transition-all cursor-pointer ${
                activeCategory === 'all'
                  ? 'bg-gradient-to-r from-[#C8874B] to-[#DF9F64] text-black shadow-lg shadow-[#C8874B]/20'
                  : 'bg-[#0D0D0F] text-[#888] hover:text-white hover:bg-[#151518] border border-[#222226]'
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
                  className={`px-4 py-2.5 rounded-2xl text-xs font-black uppercase tracking-wider transition-all cursor-pointer ${
                    activeCategory === cat.id
                      ? 'bg-gradient-to-r from-[#C8874B] to-[#DF9F64] text-black shadow-lg shadow-[#C8874B]/20'
                      : 'bg-[#0D0D0F] text-[#888] hover:text-white hover:bg-[#151518] border border-[#222226]'
                  }`}
                >
                  {trans.title}
                </button>
              );
            })}
          </div>

          {/* Search Input */}
          <div className="relative w-full md:w-80">
            <Search className="w-4 h-4 text-[#777] absolute left-3.5 rtl:left-auto rtl:right-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t('rules.searchPlaceholder')}
              className="w-full bg-[#0D0D0F] border border-[#222226] rounded-2xl pl-10 pr-4 rtl:pl-4 rtl:pr-10 py-2.5 text-xs text-white placeholder-[#666] focus:outline-none focus:border-[#C8874B] transition-colors"
            />
          </div>
        </div>

        {/* Rule Categories List */}
        {isLoading ? (
          <div className="text-center py-20 text-[#888] flex flex-col items-center justify-center gap-3">
            <div className="w-8 h-8 rounded-full border-2 border-[#C8874B] border-t-transparent animate-spin" />
            <span className="text-xs uppercase tracking-wider">{t('common.loading')}</span>
          </div>
        ) : (
          <div className="space-y-10">
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
                <div key={cat.id} className="rounded-3xl bg-[#0D0D0F] border border-[#222226] p-6 sm:p-9 shadow-2xl">
                  {/* Category Header */}
                  <div className="border-b border-[#1E1E22] pb-6 mb-6">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-10 h-10 rounded-xl bg-[#C8874B]/10 border border-[#C8874B]/20 flex items-center justify-center text-[#C8874B]">
                        <ShieldAlert className="w-5 h-5" />
                      </div>
                      <h2 className="text-xl sm:text-2xl font-black text-white uppercase tracking-tight">
                        {catTrans.title}
                      </h2>
                    </div>
                    <p className="text-xs text-[#888] leading-relaxed mb-3">{catTrans.description}</p>
                    {catTrans.penaltyInfo && (
                      <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-rose-500/10 border border-rose-500/25 text-xs font-bold text-rose-400">
                        <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                        <span>{t('rules.penalty')}: {catTrans.penaltyInfo}</span>
                      </div>
                    )}
                  </div>

                  {/* Rules Items */}
                  <div className="space-y-3.5">
                    {matchingRules.map((rule) => {
                      const rTrans = rule.translations[language] || rule.translations.ar;
                      return (
                        <div
                          key={rule.id}
                          className="p-5 rounded-2xl bg-[#151518] border border-[#222226] hover:border-[#C8874B]/30 transition-all shadow-sm"
                        >
                          <div className="flex items-start gap-4">
                            <span className="px-3 py-1 rounded-xl bg-[#C8874B]/10 text-[#C8874B] text-xs font-black shrink-0 border border-[#C8874B]/20 font-mono">
                              #{rule.number}
                            </span>
                            <div className="flex-1">
                              <h3 className="text-sm font-bold text-white mb-1.5 uppercase tracking-tight">
                                {rTrans.title}
                              </h3>
                              <p className="text-xs text-[#AAA] leading-relaxed mb-2">
                                {rTrans.description}
                              </p>
                              {rTrans.warning && (
                                <p className="text-xs text-[#DF9F64] font-bold bg-[#C8874B]/5 p-2 rounded-lg border border-[#C8874B]/15">
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

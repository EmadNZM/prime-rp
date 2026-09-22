import React, { useState, useEffect } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { apiClient } from '../../services/apiClient';
import { RuleCategory } from '../../types';
import { 
  ShieldAlert, 
  AlertTriangle, 
  Search, 
  BookOpen, 
  Scale, 
  CheckCircle2, 
  XCircle, 
  Copy, 
  Check, 
  Flame, 
  ShieldCheck, 
  FileText,
  Gavel,
  ChevronDown
} from 'lucide-react';

export const RulesPage: React.FC = () => {
  const { t, language, isRtl } = useLanguage();
  const [categories, setCategories] = useState<RuleCategory[]>([]);
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [copiedRuleId, setCopiedRuleId] = useState<string | null>(null);

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

  const handleCopyRule = (ruleNum: number | string, title: string) => {
    navigator.clipboard.writeText(`PRIME RP Rule #${ruleNum}: ${title}`);
    setCopiedRuleId(String(ruleNum));
    setTimeout(() => setCopiedRuleId(null), 2000);
  };

  const filteredCategories = categories.filter((cat) => {
    if (activeCategory !== 'all' && cat.id !== activeCategory) {
      return false;
    }
    return true;
  });

  return (
    <div className="min-h-screen bg-[#08090d] text-[#f1f3f7] pt-32 pb-28 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      
      {/* Background Ambience (EchoRP / ONX Style) */}
      <div className="absolute top-10 left-1/2 -translate-x-1/2 w-full max-w-6xl h-[500px] bg-[#c8874b]/5 blur-[160px] pointer-events-none rounded-full" />
      <div className="absolute top-96 right-10 w-96 h-96 bg-[#c8874b]/5 blur-[140px] pointer-events-none rounded-full" />

      <div className="max-w-6xl mx-auto relative z-10">
        
        {/* Header (EchoRP Codex Style) */}
        <div className="text-center max-w-3xl mx-auto mb-14">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#c8874b]/10 border border-[#c8874b]/30 text-[#df9f64] text-xs font-black uppercase tracking-wider mb-4 shadow-sm">
            <Scale className="w-3.5 h-3.5 text-[#c8874b]" />
            <span>{language === 'ar' ? 'دستور وقوانين مدينة برايم' : 'City Constitution & RP Codex'}</span>
          </div>
          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-white uppercase tracking-tight mb-4">
            <span className="block text-white">{language === 'ar' ? 'القوانين الرسمية' : 'OFFICIAL CODEX'}</span>
            <span className="block mt-1 copper-gradient-text">
              {language === 'ar' ? 'ومعايير الرول بلاي' : '& ROLEPLAY STANDARDS'}
            </span>
          </h1>
          <p className="text-[#969cad] text-sm sm:text-base leading-relaxed max-w-2xl mx-auto">
            {language === 'ar'
              ? 'تضع إدارة PRIME RP معايير صارمة لضمان بيئة لعب نزيهة تحترم السيناريوهات الدرامية، وتحافظ على حقوق المواطنين والمسعفين ورجال الأمن.'
              : 'Our penal code and conduct policies safeguard authentic storylines, player respect, and fair-play dynamics across all factions.'}
          </p>
        </div>

        {/* 3 Golden Tenet Pillars (EchoRP & ONX) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-12">
          <div className="p-5 rounded-2xl bg-[#0d0f16] border border-white/[0.06] flex items-start gap-3.5">
            <div className="p-2.5 rounded-xl bg-rose-500/10 text-rose-400 shrink-0 border border-rose-500/20">
              <XCircle className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-black text-white uppercase mb-1">
                {language === 'ar' ? 'صفر تسامح مع RDM / VDM' : 'Zero RDM / VDM Tolerance'}
              </h4>
              <p className="text-xs text-[#7a8091] leading-relaxed">
                {language === 'ar' ? 'القتل أو الصدم دون سيناريو تفاعلي وكلام مسبق يعرضك للحظر الفوري.' : 'Engaging or ramming without legitimate prior verbal RP results in immediate penalties.'}
              </p>
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-[#0d0f16] border border-white/[0.06] flex items-start gap-3.5">
            <div className="p-2.5 rounded-xl bg-[#c8874b]/10 text-[#df9f64] shrink-0 border border-[#c8874b]/20">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-black text-white uppercase mb-1">
                {language === 'ar' ? 'الخوف على الحياة (FearRP)' : 'Absolute Value of Life'}
              </h4>
              <p className="text-xs text-[#7a8091] leading-relaxed">
                {language === 'ar' ? 'شخصيتك ليست خارقة؛ الخضوع للتهديد المسلح إلزامي لحفظ حياتك.' : 'Always prioritize your character\'s survival when faced with lethal superior threats.'}
              </p>
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-[#0d0f16] border border-white/[0.06] flex items-start gap-3.5">
            <div className="p-2.5 rounded-xl bg-purple-500/10 text-purple-400 shrink-0 border border-purple-500/20">
              <Gavel className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-black text-white uppercase mb-1">
                {language === 'ar' ? 'فصل الواقع عن اللعبة (IC / OOC)' : 'Strict IC / OOC Separation'}
              </h4>
              <p className="text-xs text-[#7a8091] leading-relaxed">
                {language === 'ar' ? 'الخلافات داخل المدينة درامية فقط، ولا يُسمح بنقلها للديسكورد أو العكس.' : 'Character rivalries belong solely within the city; never escalate in Discord OOC.'}
              </p>
            </div>
          </div>
        </div>

        {/* Filter and Search Bar (ONX / Dusa Style) */}
        <div className="p-4 sm:p-5 rounded-2xl bg-[#0d0f16] border border-white/[0.07] mb-10 shadow-xl flex flex-col md:flex-row items-center justify-between gap-4">
          
          {/* Category Tabs */}
          <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
            <button
              onClick={() => setActiveCategory('all')}
              className={`px-4 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
                activeCategory === 'all'
                  ? 'bg-[#c8874b] text-black shadow-md shadow-[#c8874b]/25 font-black'
                  : 'bg-[#131620] text-[#969cad] hover:text-white border border-white/[0.06] hover:border-white/[0.12]'
              }`}
            >
              {t('rules.allCategories')}
            </button>
            {categories.map((cat) => {
              const trans = cat.translations[language] || cat.translations.ar;
              const isSelected = activeCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  onClick={() => setActiveCategory(cat.id)}
                  className={`px-4 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-[#c8874b] text-black shadow-md shadow-[#c8874b]/25 font-black'
                      : 'bg-[#131620] text-[#969cad] hover:text-white border border-white/[0.06] hover:border-white/[0.12]'
                  }`}
                >
                  {trans.title}
                </button>
              );
            })}
          </div>

          {/* Search Input */}
          <div className="relative w-full md:w-72 shrink-0">
            <Search className="w-4 h-4 text-[#7a8091] absolute left-3.5 rtl:left-auto rtl:right-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t('rules.searchPlaceholder')}
              className="w-full bg-[#131620] border border-white/[0.08] rounded-xl pl-10 pr-4 rtl:pl-4 rtl:pr-10 py-2.5 text-xs text-white placeholder-[#666] focus:outline-none focus:border-[#c8874b] transition-colors"
            />
          </div>
        </div>

        {/* Rule Categories List */}
        {isLoading ? (
          <div className="text-center py-24 text-[#969cad] flex flex-col items-center justify-center gap-3">
            <div className="w-8 h-8 rounded-full border-2 border-[#c8874b] border-t-transparent animate-spin" />
            <span className="text-xs uppercase tracking-wider font-bold">{t('common.loading')}</span>
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
                <div key={cat.id} className="rounded-2xl bg-[#0d0f16] border border-white/[0.08] p-6 sm:p-8 shadow-2xl">
                  
                  {/* Category Header */}
                  <div className="border-b border-white/[0.06] pb-6 mb-6">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-2">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-[#c8874b]/10 border border-[#c8874b]/30 flex items-center justify-center text-[#df9f64]">
                          <ShieldAlert className="w-5 h-5" />
                        </div>
                        <h2 className="text-xl sm:text-2xl font-black text-white uppercase tracking-tight font-rajdhani">
                          {catTrans.title}
                        </h2>
                      </div>
                      
                      {catTrans.penaltyInfo && (
                        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-rose-500/10 border border-rose-500/25 text-xs font-bold text-rose-400 self-start sm:self-auto">
                          <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                          <span>{t('rules.penalty')}: {catTrans.penaltyInfo}</span>
                        </div>
                      )}
                    </div>
                    <p className="text-xs text-[#969cad] leading-relaxed max-w-3xl">{catTrans.description}</p>
                  </div>

                  {/* Rules Items (EchoRP & ONX Card Style) */}
                  <div className="space-y-4">
                    {matchingRules.map((rule) => {
                      const rTrans = rule.translations[language] || rule.translations.ar;
                      const isCopied = copiedRuleId === String(rule.number);
                      return (
                        <div
                          key={rule.id}
                          className="p-5 rounded-xl bg-[#08090d] border border-white/[0.06] hover:border-[#c8874b]/50 transition-all card-hover-lift group relative"
                        >
                          <div className="flex items-start gap-4">
                            <span className="px-2.5 py-1 rounded-lg bg-[#131620] text-[#df9f64] text-xs font-black shrink-0 border border-[#c8874b]/30 font-mono">
                              #{rule.number}
                            </span>
                            <div className="flex-1">
                              <div className="flex items-center justify-between gap-2 mb-1.5">
                                <h3 className="text-sm sm:text-base font-bold text-white group-hover:text-[#df9f64] transition-colors uppercase tracking-tight">
                                  {rTrans.title}
                                </h3>
                                <button
                                  onClick={() => handleCopyRule(rule.number, rTrans.title)}
                                  className="p-1.5 rounded-lg bg-[#131620] text-[#7a8091] hover:text-white hover:border-[#c8874b] border border-white/[0.06] transition-all cursor-pointer shrink-0"
                                  title={language === 'ar' ? 'نسخ رقم البند' : 'Copy Rule ID'}
                                >
                                  {isCopied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                                </button>
                              </div>
                              
                              <p className="text-xs sm:text-sm text-[#969cad] leading-relaxed mb-3">
                                {rTrans.description}
                              </p>

                              {rTrans.warning && (
                                <div className="text-xs text-[#df9f64] font-semibold bg-[#c8874b]/10 p-2.5 rounded-lg border border-[#c8874b]/20 flex items-center gap-2">
                                  <AlertTriangle className="w-4 h-4 shrink-0 text-[#c8874b]" />
                                  <span>{rTrans.warning}</span>
                                </div>
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

        {/* Footer Support Banner */}
        <div className="mt-14 p-6 sm:p-8 rounded-2xl bg-[#0d0f16] border border-white/[0.07] text-center max-w-2xl mx-auto">
          <BookOpen className="w-8 h-8 text-[#c8874b] mx-auto mb-3" />
          <h3 className="text-base font-black text-white uppercase tracking-wider mb-1">
            {language === 'ar' ? 'هل واجهت مخالفة لقوانين السيرفر؟' : 'Witnessed a Rule Violation?'}
          </h3>
          <p className="text-xs text-[#7a8091] leading-relaxed mb-4">
            {language === 'ar'
              ? 'يمكنك دائماً حفظ كليب للموقف وفتح تذكرة بلاغ عبر قسم الدعم الفني أو الديسكورد الرسمي.'
              : 'Save video proof of the scenario and open a moderation ticket through our player support portal.'}
          </p>
          <a
            href="https://discord.gg/primee"
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#131620] hover:bg-[#c8874b] text-[#df9f64] hover:text-black border border-[#c8874b]/30 font-bold text-xs uppercase tracking-wider transition-all"
          >
            <span>{language === 'ar' ? 'فتح تذكرة بلاغ بالديسكورد' : 'Open Ticket in Discord'}</span>
          </a>
        </div>

      </div>
    </div>
  );
};

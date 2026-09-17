import React, { useState, useEffect } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { apiClient } from '../../services/apiClient';
import { Trophy, Clock, Wallet, Shield, Database, RefreshCw, Sparkles } from 'lucide-react';

interface LeaderboardItem {
  rank: number;
  name: string;
  metric: string;
  subtitle: string;
  badge?: string;
}

export const LeaderboardPage: React.FC = () => {
  const { language } = useLanguage();
  const [activeTab, setActiveTab] = useState<'playtime' | 'wealth' | 'law'>('playtime');
  const [leaderboardData, setLeaderboardData] = useState<LeaderboardItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    async function fetchLeaderboard() {
      try {
        const data = await apiClient.getLeaderboard();
        setLeaderboardData(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error('Failed to load leaderboard:', err);
        setLeaderboardData([]);
      } finally {
        setIsLoading(false);
      }
    }
    fetchLeaderboard();
  }, []);

  return (
    <div className="min-h-screen bg-[#070707] text-[#E5E5E5] pt-28 pb-24 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">
        
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#C8874B]/10 text-[#C8874B] text-xs font-bold mb-4 border border-[#C8874B]/20">
            <Trophy className="w-3.5 h-3.5" />
            <span>{language === 'ar' ? 'لوحة شرف المجتمع' : 'Community Hall of Fame'}</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-black text-white mb-4 tracking-tight">
            {language === 'ar' ? 'المتصدرون والإحصائيات' : 'Leaderboard & Rankings'}
          </h1>
          <p className="text-[#8E8E8E] text-sm sm:text-base leading-relaxed">
            {language === 'ar'
              ? 'سجل الإنجازات والنشاط العام المعتمد للاعبي مجتمع وسيرفر PRIME RP.'
              : 'Official verified rankings and community achievements across the PRIME RP city.'}
          </p>
        </div>

        {/* Database Synchronization Notice */}
        <div className="p-4 sm:p-5 rounded-2xl bg-[#0D0D0D] border border-[#202020] mb-8 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-xl">
          <div className="flex items-center gap-3">
            <span className="p-2.5 rounded-xl bg-[#C8874B]/10 text-[#C8874B] border border-[#C8874B]/20">
              <Database className="w-5 h-5" />
            </span>
            <div>
              <h3 className="text-sm font-bold text-white">
                {language === 'ar' ? 'حالة مزامنة بيانات اللعبة' : 'Game Database Synchronization'}
              </h3>
              <p className="text-xs text-[#888]">
                {language === 'ar' 
                  ? 'يتم ربط بيانات المتصدرين بسجلات قاعدة بيانات السيرفر (In-Game DB) لضمان الدقة والشفافية.' 
                  : 'Leaderboard records are linked to authoritative server database statistics for transparency.'}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 text-xs text-[#C8874B] bg-[#C8874B]/10 px-3.5 py-1.5 rounded-full border border-[#C8874B]/20 shrink-0">
            <span className="w-2 h-2 rounded-full bg-[#C8874B] animate-pulse" />
            <span>{language === 'ar' ? 'مزامنة معتمدة' : 'Official Sync'}</span>
          </div>
        </div>

        {/* Filter Categories */}
        <div className="flex items-center justify-center gap-2 mb-8">
          <button
            onClick={() => setActiveTab('playtime')}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'playtime'
                ? 'bg-[#C8874B] text-black shadow-lg shadow-[#C8874B]/20'
                : 'bg-[#111] text-[#888] hover:text-white border border-[#222]'
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            <span>{language === 'ar' ? 'ساعات اللعب' : 'Playtime'}</span>
          </button>
          
          <button
            onClick={() => setActiveTab('wealth')}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'wealth'
                ? 'bg-[#C8874B] text-black shadow-lg shadow-[#C8874B]/20'
                : 'bg-[#111] text-[#888] hover:text-white border border-[#222]'
            }`}
          >
            <Wallet className="w-3.5 h-3.5" />
            <span>{language === 'ar' ? 'اقتصاد المدينة' : 'Wealth'}</span>
          </button>

          <button
            onClick={() => setActiveTab('law')}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'law'
                ? 'bg-[#C8874B] text-black shadow-lg shadow-[#C8874B]/20'
                : 'bg-[#111] text-[#888] hover:text-white border border-[#222]'
            }`}
          >
            <Shield className="w-3.5 h-3.5" />
            <span>{language === 'ar' ? 'القطاعات الأمنية' : 'Law Enforcement'}</span>
          </button>
        </div>

        {/* Loading State */}
        {isLoading ? (
          <div className="text-center py-20">
            <RefreshCw className="w-6 h-6 animate-spin text-[#C8874B] mx-auto mb-3" />
            <p className="text-xs text-[#888]">{language === 'ar' ? 'جاري التحقق من سجلات السيرفر...' : 'Fetching live records...'}</p>
          </div>
        ) : leaderboardData.length === 0 ? (
          /* Respectful, Clean Empty State (No Fake Data) */
          <div className="text-center py-20 px-6 rounded-3xl bg-[#0C0C0C] border border-[#1E1E1E] max-w-xl mx-auto">
            <div className="w-16 h-16 rounded-2xl bg-[#141414] border border-[#262626] flex items-center justify-center mx-auto mb-4 text-[#C8874B]">
              <Database className="w-8 h-8" />
            </div>
            <h3 className="text-base sm:text-lg font-bold text-white mb-2">
              {language === 'ar'
                ? 'بانتظار مزامنة قاعدة بيانات اللعبة'
                : 'Leaderboard Data Pending Synchronization'}
            </h3>
            <p className="text-xs sm:text-sm text-[#888] leading-relaxed max-w-md mx-auto mb-6">
              {language === 'ar'
                ? 'بيانات المتصدرين وسجلات ساعات اللعب والاقتصاد تُعرض تلقائياً بمجرد اكتمال اتصال قاعدة بيانات سيرفر FiveM الحية. لا يتم عرض أي إحصائيات وهمية حفاظاً على المصداقية والنزاهة.'
                : 'Leaderboard rankings are dynamically populated from live in-game database telemetry once linked. We strictly avoid displaying mock statistics to preserve competitive integrity.'}
            </p>
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#141414] border border-[#2A2A2A] text-xs text-[#AAA]">
              <Sparkles className="w-3.5 h-3.5 text-[#C8874B]" />
              <span>{language === 'ar' ? 'سيتم التحديث آلياً مع التدوين الحي' : 'Auto-updates via live game synchronization'}</span>
            </div>
          </div>
        ) : (
          /* Render real data if present */
          <div className="space-y-3">
            {leaderboardData.map((item) => (
              <div
                key={item.rank}
                className="p-4 sm:p-5 rounded-2xl bg-[#0C0C0C] border border-[#1A1A1A] hover:border-[#C8874B]/40 transition-all flex items-center justify-between"
              >
                <div className="flex items-center gap-4">
                  <div className="w-9 h-9 rounded-xl bg-[#161616] border border-[#262626] flex items-center justify-center text-xs font-bold text-[#C8874B]">
                    #{item.rank}
                  </div>
                  <div>
                    <h4 className="font-bold text-sm sm:text-base text-white">{item.name}</h4>
                    <p className="text-xs text-[#777]">{item.subtitle}</p>
                  </div>
                </div>
                <div className="text-right rtl:text-left">
                  <span className="text-xs sm:text-sm font-mono font-bold text-white">{item.metric}</span>
                </div>
              </div>
            ))}
          </div>
        )}

      </div>
    </div>
  );
};

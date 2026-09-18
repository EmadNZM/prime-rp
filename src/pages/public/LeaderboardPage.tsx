import React, { useState, useEffect } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { apiClient } from '../../services/apiClient';
import { Trophy, Clock, Wallet, Shield, Database, RefreshCw, Users, Wifi, AlertCircle } from 'lucide-react';

interface LeaderboardItem {
  rank: number;
  name: string;
  metric: string;
  subtitle: string;
  badge?: string;
}

interface LivePlayer {
  id: number;
  name: string;
  ping: number;
}

export const LeaderboardPage: React.FC = () => {
  const { language } = useLanguage();
  const [activeTab, setActiveTab] = useState<'live' | 'playtime' | 'wealth' | 'law'>('live');
  const [leaderboardData, setLeaderboardData] = useState<LeaderboardItem[]>([]);
  const [livePlayers, setLivePlayers] = useState<LivePlayer[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);

  const loadData = async () => {
    setIsRefreshing(true);
    try {
      const [lb, players] = await Promise.all([
        apiClient.getLeaderboard().catch(() => []),
        apiClient.getPlayers().catch(() => [])
      ]);
      setLeaderboardData(Array.isArray(lb) ? lb : []);
      setLivePlayers(Array.isArray(players) ? players : []);
    } catch (err) {
      console.error('Failed to load leaderboard data:', err);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  return (
    <div className="min-h-screen bg-[#070707] text-[#E5E5E5] pt-28 pb-24 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">
        
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#C8874B]/10 text-[#C8874B] text-xs font-bold mb-4 border border-[#C8874B]/20">
            <Trophy className="w-3.5 h-3.5" />
            <span>{language === 'ar' ? 'سجل وإحصائيات السيرفر' : 'Server Statistics & Records'}</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-black text-white mb-4 tracking-tight">
            {language === 'ar' ? 'المتصدرون والمتواجدون' : 'Leaderboard & Online Citizens'}
          </h1>
          <p className="text-[#8E8E8E] text-sm sm:text-base leading-relaxed">
            {language === 'ar'
              ? 'السجل الرسمي المعتمد لإحصائيات اللاعبين والمتواجدين حالياً في مدينة PRIME RP.'
              : 'Official real-time activity and community statistics across the PRIME RP city.'}
          </p>
        </div>

        {/* Database Synchronization Notice - HONEST & TRANSPARENT */}
        <div className="p-4 sm:p-5 rounded-2xl bg-[#0D0D0D] border border-[#202020] mb-8 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-xl">
          <div className="flex items-center gap-3">
            <span className="p-2.5 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
              <Database className="w-5 h-5" />
            </span>
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <span>{language === 'ar' ? 'حالة ربط بيانات السيرفر (In-Game DB)' : 'Game Database Connection Status'}</span>
              </h3>
              <p className="text-xs text-[#888]">
                {language === 'ar' 
                  ? 'لوحة الشرف التنافسية (الساعات، الثروة، الرتب) غير متاحة حالياً حتى اكتمال ربط قاعدة بيانات FiveM لتفادي أي بيانات وهمية.' 
                  : 'Competitive rankings (playtime, wealth, law) are currently inactive pending live FiveM game DB sync to prevent mock data.'}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 text-xs text-amber-400 bg-amber-400/10 px-3.5 py-1.5 rounded-full border border-amber-400/20 shrink-0">
            <AlertCircle className="w-3.5 h-3.5" />
            <span>{language === 'ar' ? 'بانتظار ربط قاعدة اللعبة' : 'Pending In-Game Sync'}</span>
          </div>
        </div>

        {/* Filter Categories */}
        <div className="flex flex-wrap items-center justify-center gap-2 mb-8">
          <button
            onClick={() => setActiveTab('live')}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'live'
                ? 'bg-[#C8874B] text-black shadow-lg shadow-[#C8874B]/20'
                : 'bg-[#111] text-[#888] hover:text-white border border-[#222]'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>{language === 'ar' ? 'المتواجدون حالياً' : 'Live Online Players'}</span>
            <span className="px-1.5 py-0.5 rounded bg-black/40 text-[10px] font-mono">
              {livePlayers.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('playtime')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'playtime'
                ? 'bg-[#222] text-white border border-[#C8874B]/60'
                : 'bg-[#111] text-[#777] hover:text-[#AAA] border border-[#222]'
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            <span>{language === 'ar' ? 'ساعات اللعب' : 'Playtime'}</span>
            <span className="px-1.5 py-0.2 text-[9px] rounded bg-amber-500/15 text-amber-400 border border-amber-500/25">
              {language === 'ar' ? 'غير نشط' : 'Inactive'}
            </span>
          </button>
          
          <button
            onClick={() => setActiveTab('wealth')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'wealth'
                ? 'bg-[#222] text-white border border-[#C8874B]/60'
                : 'bg-[#111] text-[#777] hover:text-[#AAA] border border-[#222]'
            }`}
          >
            <Wallet className="w-3.5 h-3.5" />
            <span>{language === 'ar' ? 'اقتصاد المدينة' : 'Wealth'}</span>
            <span className="px-1.5 py-0.2 text-[9px] rounded bg-amber-500/15 text-amber-400 border border-amber-500/25">
              {language === 'ar' ? 'غير نشط' : 'Inactive'}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('law')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'law'
                ? 'bg-[#222] text-white border border-[#C8874B]/60'
                : 'bg-[#111] text-[#777] hover:text-[#AAA] border border-[#222]'
            }`}
          >
            <Shield className="w-3.5 h-3.5" />
            <span>{language === 'ar' ? 'القطاعات الأمنية' : 'Law Enforcement'}</span>
            <span className="px-1.5 py-0.2 text-[9px] rounded bg-amber-500/15 text-amber-400 border border-amber-500/25">
              {language === 'ar' ? 'غير نشط' : 'Inactive'}
            </span>
          </button>
        </div>

        {/* Loading State */}
        {isLoading ? (
          <div className="text-center py-20">
            <RefreshCw className="w-6 h-6 animate-spin text-[#C8874B] mx-auto mb-3" />
            <p className="text-xs text-[#888]">{language === 'ar' ? 'جاري التحقق من سجلات السيرفر...' : 'Fetching live records...'}</p>
          </div>
        ) : activeTab === 'live' ? (
          /* Live Active Players Tab */
          <div>
            <div className="flex items-center justify-between mb-4 px-2">
              <span className="text-xs text-[#777]">
                {language === 'ar' ? `إجمالي المتواجدين الحقيقيين: ${livePlayers.length} مواطن` : `Total Live Players: ${livePlayers.length}`}
              </span>
              <button
                onClick={loadData}
                disabled={isRefreshing}
                className="flex items-center gap-1.5 text-xs text-[#C8874B] hover:underline"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
                <span>{language === 'ar' ? 'تحديث فوري' : 'Refresh'}</span>
              </button>
            </div>

            {livePlayers.length === 0 ? (
              <div className="text-center py-16 px-6 rounded-3xl bg-[#0C0C0C] border border-[#1E1E1E]">
                <Users className="w-10 h-10 text-[#444] mx-auto mb-3" />
                <h4 className="text-sm font-bold text-white mb-1">
                  {language === 'ar' ? 'لا يوجد لاعبون متصلون حالياً' : 'No Players Online Currently'}
                </h4>
                <p className="text-xs text-[#666]">
                  {language === 'ar' ? 'السيرفر جاهز لاستقبال المواطنين عبر عميل FiveM' : 'Server is ready for incoming players via FiveM'}
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                {livePlayers.map((player) => (
                  <div
                    key={player.id}
                    className="p-3.5 rounded-xl bg-[#0C0C0C] border border-[#1A1A1A] flex items-center justify-between hover:border-[#C8874B]/30 transition-all"
                  >
                    <div className="flex items-center gap-3">
                      <span className="w-7 h-7 rounded-lg bg-[#181818] border border-[#262626] flex items-center justify-center text-xs font-mono text-[#C8874B]">
                        #{player.id}
                      </span>
                      <span className="text-sm font-semibold text-white truncate max-w-[140px]">{player.name}</span>
                    </div>
                    <div className="flex items-center gap-1 text-[11px] font-mono text-emerald-400 bg-emerald-400/10 px-2 py-0.5 rounded border border-emerald-400/20">
                      <Wifi className="w-3 h-3" />
                      <span>{player.ping}ms</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : leaderboardData.length === 0 ? (
          /* Respectful, Clean Inactive State (No Fake Data) */
          <div className="text-center py-20 px-6 rounded-3xl bg-[#0C0C0C] border border-[#1E1E1E] max-w-xl mx-auto">
            <div className="w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center mx-auto mb-4 text-amber-400">
              <Database className="w-8 h-8" />
            </div>
            <h3 className="text-base sm:text-lg font-bold text-white mb-2">
              {language === 'ar'
                ? 'لوحة المتصدرين غير متاحة حالياً'
                : 'Leaderboard Rankings Inactive'}
            </h3>
            <p className="text-xs sm:text-sm text-[#888] leading-relaxed max-w-md mx-auto mb-6">
              {language === 'ar'
                ? 'يتم تفعيل الترتيب التنافسي تلقائياً بعد اكتمال ربط قاعدة بيانات سيرفر FiveM (In-Game MySQL/Postgres). تم حجب أي أرقام افتراضية التزاماً بالشفافية والمصداقية التامة.'
                : 'Competitive statistics will be enabled once the server-side game database telemetry is synchronized. Fake or simulated ranking data is strictly prohibited.'}
            </p>
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#141414] border border-[#2A2A2A] text-xs text-[#AAA]">
              <AlertCircle className="w-3.5 h-3.5 text-amber-400" />
              <span>{language === 'ar' ? 'البيانات الحقيقية فقط بدون محاكاة وهمية' : 'Real authoritative data only — zero simulated entries'}</span>
            </div>
          </div>
        ) : (
          /* Render real data if present from backend */
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

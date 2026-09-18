import React, { useState, useEffect } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { apiClient } from '../../services/apiClient';
import { 
  Trophy, 
  Clock, 
  Wallet, 
  Shield, 
  Database, 
  RefreshCw, 
  Users, 
  Wifi, 
  AlertCircle, 
  Medal,
  Award,
  Flame,
  CheckCircle2
} from 'lucide-react';

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
    <div className="min-h-screen bg-[#08090d] text-[#f1f3f7] pt-32 pb-28 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      
      {/* Background Ambience */}
      <div className="absolute top-10 left-1/2 -translate-x-1/2 w-full max-w-6xl h-[500px] bg-[#c8874b]/5 blur-[160px] pointer-events-none rounded-full" />
      <div className="absolute top-80 right-10 w-96 h-96 bg-[#c8874b]/5 blur-[140px] pointer-events-none rounded-full" />

      <div className="max-w-5xl mx-auto relative z-10">
        
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-12">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#c8874b]/10 border border-[#c8874b]/30 text-[#df9f64] text-xs font-black uppercase tracking-wider mb-4 shadow-sm">
            <Trophy className="w-3.5 h-3.5 text-[#c8874b]" />
            <span>{language === 'ar' ? 'سجل الشرف والإحصائيات التنافسية' : 'Server Hall of Fame & Metrics'}</span>
          </div>
          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-white mb-4 tracking-tight uppercase">
            <span className="block text-white">{language === 'ar' ? 'المتصدرون ونخبة المجتمع' : 'LEADERBOARD & ACTIVE'}</span>
            <span className="block mt-1 copper-gradient-text">
              {language === 'ar' ? 'سجل الإنجازات' : 'CITIZEN DIRECTORY'}
            </span>
          </h1>
          <p className="text-[#969cad] text-sm sm:text-base leading-relaxed max-w-2xl mx-auto">
            {language === 'ar'
              ? 'السجل الرسمي المعتمد لإحصائيات اللاعبين والمتواجدين حالياً في مدينة PRIME RP بأعلى معايير الدقة والشفافية.'
              : 'Official real-time activity, live citizen roster, and verified community statistics across the PRIME RP city.'}
          </p>
        </div>

        {/* Database Synchronization Notice (Clean ONX/EchoRP Card) */}
        <div className="p-5 rounded-2xl bg-[#0d0f16] border border-white/[0.08] mb-8 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-xl">
          <div className="flex items-center gap-3.5">
            <span className="p-3 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20 shrink-0">
              <Database className="w-5 h-5" />
            </span>
            <div>
              <h3 className="text-sm font-black text-white flex items-center gap-2">
                <span>{language === 'ar' ? 'حالة ربط بيانات السيرفر (In-Game DB)' : 'Game Database Connection Status'}</span>
              </h3>
              <p className="text-xs text-[#7a8091] leading-relaxed mt-0.5">
                {language === 'ar' 
                  ? 'لوحة الشرف التنافسية (الساعات، الثروة، الرتب) غير متاحة حالياً حتى اكتمال ربط قاعدة بيانات FiveM لتفادي أي بيانات وهمية.' 
                  : 'Competitive rankings (playtime, wealth, law) are currently inactive pending live FiveM game DB sync to prevent mock data.'}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 text-xs font-bold text-amber-400 bg-amber-400/10 px-3.5 py-1.5 rounded-xl border border-amber-400/20 shrink-0">
            <AlertCircle className="w-3.5 h-3.5" />
            <span>{language === 'ar' ? 'بانتظار ربط قاعدة اللعبة' : 'Pending In-Game Sync'}</span>
          </div>
        </div>

        {/* Filter Categories */}
        <div className="flex flex-wrap items-center justify-center gap-2.5 mb-8">
          <button
            onClick={() => setActiveTab('live')}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
              activeTab === 'live'
                ? 'bg-[#c8874b] text-black shadow-md shadow-[#c8874b]/20 font-black'
                : 'bg-[#0d0f16] text-[#969cad] hover:text-white border border-white/[0.06] hover:border-white/[0.12]'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>{language === 'ar' ? 'المتواجدون حالياً' : 'Live Online Players'}</span>
            <span className="px-1.5 py-0.5 rounded-md bg-black/30 text-[10px] font-mono">
              {livePlayers.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('playtime')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
              activeTab === 'playtime'
                ? 'bg-[#131620] text-white border border-[#c8874b]'
                : 'bg-[#0d0f16] text-[#7a8091] hover:text-[#969cad] border border-white/[0.06]'
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            <span>{language === 'ar' ? 'ساعات اللعب' : 'Playtime'}</span>
            <span className="px-1.5 py-0.5 text-[9px] rounded-md bg-amber-500/15 text-amber-400 border border-amber-500/25">
              {language === 'ar' ? 'غير نشط' : 'Inactive'}
            </span>
          </button>
          
          <button
            onClick={() => setActiveTab('wealth')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
              activeTab === 'wealth'
                ? 'bg-[#131620] text-white border border-[#c8874b]'
                : 'bg-[#0d0f16] text-[#7a8091] hover:text-[#969cad] border border-white/[0.06]'
            }`}
          >
            <Wallet className="w-3.5 h-3.5" />
            <span>{language === 'ar' ? 'اقتصاد المدينة' : 'Wealth'}</span>
            <span className="px-1.5 py-0.5 text-[9px] rounded-md bg-amber-500/15 text-amber-400 border border-amber-500/25">
              {language === 'ar' ? 'غير نشط' : 'Inactive'}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('law')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
              activeTab === 'law'
                ? 'bg-[#131620] text-white border border-[#c8874b]'
                : 'bg-[#0d0f16] text-[#7a8091] hover:text-[#969cad] border border-white/[0.06]'
            }`}
          >
            <Shield className="w-3.5 h-3.5" />
            <span>{language === 'ar' ? 'القطاعات الأمنية' : 'Law Enforcement'}</span>
            <span className="px-1.5 py-0.5 text-[9px] rounded-md bg-amber-500/15 text-amber-400 border border-amber-500/25">
              {language === 'ar' ? 'غير نشط' : 'Inactive'}
            </span>
          </button>
        </div>

        {/* Loading State */}
        {isLoading ? (
          <div className="text-center py-20 text-[#969cad]">
            <RefreshCw className="w-7 h-7 animate-spin text-[#c8874b] mx-auto mb-3" />
            <p className="text-xs uppercase tracking-wider font-bold">{language === 'ar' ? 'جاري التحقق من سجلات السيرفر...' : 'Fetching live records...'}</p>
          </div>
        ) : activeTab === 'live' ? (
          /* Live Active Players Tab */
          <div>
            <div className="flex items-center justify-between mb-4 px-2">
              <span className="text-xs text-[#7a8091]">
                {language === 'ar' ? `إجمالي المتواجدين الحقيقيين: ${livePlayers.length} مواطن` : `Total Live Players: ${livePlayers.length}`}
              </span>
              <button
                onClick={loadData}
                disabled={isRefreshing}
                className="flex items-center gap-1.5 text-xs font-bold text-[#df9f64] hover:text-white transition-colors cursor-pointer"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
                <span>{language === 'ar' ? 'تحديث فوري' : 'Refresh'}</span>
              </button>
            </div>

            {livePlayers.length === 0 ? (
              <div className="text-center py-16 px-6 rounded-2xl bg-[#0d0f16] border border-white/[0.08]">
                <Users className="w-10 h-10 text-[#444] mx-auto mb-3" />
                <h4 className="text-sm font-black text-white mb-1 uppercase tracking-wider">
                  {language === 'ar' ? 'لا يوجد لاعبون متصلون حالياً' : 'No Players Online Currently'}
                </h4>
                <p className="text-xs text-[#7a8091]">
                  {language === 'ar' ? 'السيرفر جاهز لاستقبال المواطنين عبر عميل FiveM' : 'Server is ready for incoming players via FiveM'}
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                {livePlayers.map((player) => (
                  <div
                    key={player.id}
                    className="p-3.5 rounded-xl bg-[#0d0f16] border border-white/[0.06] flex items-center justify-between hover:border-[#c8874b]/40 transition-all card-hover-lift group"
                  >
                    <div className="flex items-center gap-3">
                      <span className="w-8 h-8 rounded-lg bg-[#131620] border border-[#c8874b]/30 flex items-center justify-center text-xs font-mono font-black text-[#df9f64]">
                        #{player.id}
                      </span>
                      <span className="text-sm font-bold text-white truncate max-w-[140px] group-hover:text-[#df9f64] transition-colors">{player.name}</span>
                    </div>
                    <div className="flex items-center gap-1 text-[10px] font-mono text-emerald-400 bg-emerald-400/10 px-2 py-0.5 rounded-lg border border-emerald-400/20">
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
          <div className="text-center py-20 px-6 rounded-2xl bg-[#0d0f16] border border-white/[0.08] max-w-xl mx-auto shadow-2xl">
            <div className="w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center mx-auto mb-4 text-amber-400">
              <Database className="w-8 h-8" />
            </div>
            <h3 className="text-base sm:text-lg font-black text-white mb-2 tracking-tight uppercase">
              {language === 'ar'
                ? 'لوحة المتصدرين غير متاحة حالياً'
                : 'Leaderboard Rankings Inactive'}
            </h3>
            <p className="text-xs sm:text-sm text-[#7a8091] leading-relaxed max-w-md mx-auto mb-6">
              {language === 'ar'
                ? 'يتم تفعيل الترتيب التنافسي تلقائياً بعد اكتمال ربط قاعدة بيانات سيرفر FiveM (In-Game MySQL/Postgres). تم حجب أي أرقام افتراضية التزاماً بالشفافية والمصداقية التامة.'
                : 'Competitive statistics will be enabled once the server-side game database telemetry is synchronized. Fake or simulated ranking data is strictly prohibited.'}
            </p>
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#08090d] border border-white/[0.06] text-xs text-[#969cad]">
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
                className="p-4 sm:p-5 rounded-xl bg-[#0d0f16] border border-white/[0.06] hover:border-[#c8874b]/40 transition-all flex items-center justify-between card-hover-lift"
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-[#131620] border border-[#c8874b]/30 flex items-center justify-center text-xs font-black text-[#df9f64]">
                    #{item.rank}
                  </div>
                  <div>
                    <h4 className="font-bold text-sm sm:text-base text-white">{item.name}</h4>
                    <p className="text-xs text-[#7a8091]">{item.subtitle}</p>
                  </div>
                </div>
                <div className="text-right rtl:text-left">
                  <span className="text-xs sm:text-sm font-mono font-bold text-[#df9f64]">{item.metric}</span>
                </div>
              </div>
            ))}
          </div>
        )}

      </div>
    </div>
  );
};

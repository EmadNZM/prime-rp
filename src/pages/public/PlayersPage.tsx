import React, { useState, useEffect } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { apiClient } from '../../services/apiClient';
import { FiveMTelemetry } from '../../types';
import { 
  Users, 
  Search, 
  Wifi, 
  WifiOff, 
  Activity, 
  RefreshCw, 
  Server, 
  Gamepad2,
  Copy,
  Check,
  Radio
} from 'lucide-react';

interface FiveMPlayer {
  id: number;
  name: string;
  ping: number;
}

export const PlayersPage: React.FC = () => {
  const { language } = useLanguage();
  const [telemetry, setTelemetry] = useState<FiveMTelemetry | null>(null);
  const [players, setPlayers] = useState<FiveMPlayer[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [copiedConnect, setCopiedConnect] = useState<boolean>(false);

  const loadData = async () => {
    try {
      const [statusData, playersData] = await Promise.all([
        apiClient.getFiveMStatus(),
        apiClient.getPlayers()
      ]);
      setTelemetry(statusData);
      setPlayers(Array.isArray(playersData) ? playersData : []);
    } catch (err) {
      console.error('Failed to load FiveM players:', err);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    loadData();
    // Auto-refresh every 30 seconds
    const interval = setInterval(loadData, 30000);
    return () => clearInterval(interval);
  }, []);

  const handleRefresh = () => {
    setIsRefreshing(true);
    loadData();
  };

  const handleCopyConnect = () => {
    if (!telemetry?.ip || !telemetry?.port) return;
    navigator.clipboard.writeText(`connect ${telemetry.ip}:${telemetry.port}`);
    setCopiedConnect(true);
    setTimeout(() => setCopiedConnect(false), 2500);
  };

  const filteredPlayers = players.filter((p) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return p.name.toLowerCase().includes(q) || String(p.id).includes(q);
  });

  const isConfigured = Boolean(telemetry?.ip && telemetry?.port && telemetry?.error !== 'not_configured');
  const isOnline = Boolean(telemetry?.isOnline);

  return (
    <div className="min-h-screen bg-[#070707] text-[#E5E5E5] pt-28 pb-24 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Background Ambience */}
      <div className="absolute top-20 left-1/2 -translate-x-1/2 w-full max-w-5xl h-96 bg-[#C8874B]/5 blur-[120px] pointer-events-none rounded-full" />

      <div className="max-w-6xl mx-auto relative z-10">
        
        {/* Header Section */}
        <div className="text-center max-w-3xl mx-auto mb-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#C8874B]/10 text-[#C8874B] text-xs font-bold mb-4 border border-[#C8874B]/20 uppercase tracking-wider">
            <Users className="w-3.5 h-3.5" />
            <span>{language === 'ar' ? 'اللاعبون المتصلون الآن' : 'Live Connected Players'}</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-black text-white mb-4 tracking-tight uppercase">
            {language === 'ar' ? 'قائمة المتصلين بالسيرفر' : 'Server Online Roster'}
          </h1>
          <p className="text-[#9A9A9A] text-xs sm:text-sm leading-relaxed">
            {language === 'ar'
              ? 'مراقبة حية ومباشرة لحالة خادم PRIME RP واللاعبين المتصلين في الوقت الفعلي عبر بروتوكول FiveM.'
              : 'Real-time telemetry and active players currently connected to the PRIME RP FiveM server.'}
          </p>
        </div>

        {/* Server Telemetry Status Banner */}
        <div className="mb-10 p-5 sm:p-6 rounded-3xl bg-[#0D0D0F] border border-[#222226] shadow-2xl flex flex-col md:flex-row items-center justify-between gap-5">
          <div className="flex items-center gap-4 w-full md:w-auto">
            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 border ${
              !isConfigured
                ? 'bg-amber-500/10 border-amber-500/30 text-amber-400'
                : isOnline 
                  ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400 shadow-lg shadow-emerald-500/10' 
                  : 'bg-rose-500/10 border-rose-500/30 text-rose-400'
            }`}>
              {!isConfigured ? <Server className="w-6 h-6" /> : isOnline ? <Radio className="w-6 h-6 animate-pulse" /> : <WifiOff className="w-6 h-6" />}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-black text-white text-base tracking-tight">PRIME RP FiveM</span>
                <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
                  !isConfigured
                    ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40'
                    : isOnline 
                      ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40' 
                      : 'bg-rose-500/20 text-rose-400 border border-rose-500/40'
                }`}>
                  {!isConfigured 
                    ? (language === 'ar' ? 'غير مهيأ' : 'Not Configured')
                    : isOnline 
                      ? (language === 'ar' ? 'متصل' : 'Online') 
                      : (language === 'ar' ? 'غير متصل' : 'Offline')}
                </span>
              </div>
              <p className="text-xs text-[#777] font-mono mt-1">
                {isConfigured ? `${telemetry?.ip}:${telemetry?.port}` : (language === 'ar' ? 'بانتظار إعداد FIVEM_SERVER_IP و PORT' : 'Awaiting FIVEM_SERVER_IP & PORT')}
              </p>
            </div>
          </div>

          {/* Stats Badges */}
          <div className="flex flex-wrap items-center gap-3 w-full md:w-auto justify-between md:justify-end">
            <div className="px-4 py-2.5 rounded-2xl bg-[#151518] border border-[#222226] text-center min-w-[100px]">
              <span className="text-[10px] text-[#777] block font-bold uppercase tracking-wider">
                {language === 'ar' ? 'المتصلين' : 'Citizens'}
              </span>
              <span className="text-sm font-black text-white font-rajdhani">
                {isOnline ? `${players.length} / ${telemetry?.maxPlayers || 128}` : '0'}
              </span>
            </div>

            <div className="px-4 py-2.5 rounded-2xl bg-[#151518] border border-[#222226] text-center min-w-[90px]">
              <span className="text-[10px] text-[#777] block font-bold uppercase tracking-wider">
                {language === 'ar' ? 'البنج' : 'Ping'}
              </span>
              <span className="text-sm font-black text-[#C8874B] font-rajdhani">
                {isOnline ? `${telemetry?.pingMs || telemetry?.ping || 35} ms` : '-'}
              </span>
            </div>

            <button
              onClick={handleCopyConnect}
              disabled={!isConfigured}
              className="px-4 py-2.5 rounded-2xl bg-[#151518] hover:bg-[#1E1E22] text-white border border-[#252528] hover:border-[#C8874B]/50 transition-all flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
            >
              {copiedConnect ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-[#C8874B]" />}
              <span>{copiedConnect ? (language === 'ar' ? 'تم النسخ' : 'Copied') : (!isConfigured ? (language === 'ar' ? 'غير مهيأ' : 'Not Configured') : (language === 'ar' ? 'أمر الاتصال' : 'Connect'))}</span>
            </button>

            <button
              onClick={handleRefresh}
              disabled={isRefreshing}
              className="p-2.5 rounded-2xl bg-[#151518] hover:bg-[#1E1E22] text-[#AAA] hover:text-white border border-[#252528] transition-all disabled:opacity-50 cursor-pointer"
              title="Refresh Roster"
            >
              <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin text-[#C8874B]' : ''}`} />
            </button>
          </div>
        </div>

        {/* Search Bar */}
        <div className="max-w-md mx-auto mb-8 relative">
          <Search className="w-4 h-4 text-[#777] absolute left-3 rtl:left-auto rtl:right-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={language === 'ar' ? 'بحث عن لاعب بالاسم أو المعرف (ID)...' : 'Filter player by name or ID...'}
            className="w-full bg-[#0D0D0F] border border-[#222226] rounded-2xl pl-9 pr-4 rtl:pl-4 rtl:pr-9 py-3 text-xs text-white placeholder-[#666] focus:outline-none focus:border-[#C8874B] transition-colors shadow-sm"
          />
        </div>

        {/* Loading State */}
        {isLoading ? (
          <div className="text-center py-20">
            <RefreshCw className="w-6 h-6 animate-spin text-[#C8874B] mx-auto mb-3" />
            <p className="text-xs text-[#888]">{language === 'ar' ? 'جاري الاتصال بالسيرفر...' : 'Connecting to FiveM Server...'}</p>
          </div>
        ) : !isOnline ? (
          /* Server Offline State */
          <div className="text-center py-16 px-6 rounded-3xl bg-[#0D0D0F] border border-rose-500/20 max-w-lg mx-auto shadow-2xl">
            <WifiOff className="w-10 h-10 text-rose-400 mx-auto mb-3" />
            <h3 className="text-base font-black text-white mb-1">
              {language === 'ar' ? 'الخادم غير متصل حالياً' : 'Server Currently Offline'}
            </h3>
            <p className="text-xs text-[#888] leading-relaxed max-w-md mx-auto">
              {language === 'ar'
                ? 'تعذر الوصول إلى خادم FiveM في الوقت الحالي. قد يكون الخادم في فترة صيانة دورية أو إعادة تشغيل.'
                : 'Could not communicate with the FiveM server. It may be offline or undergoing scheduled maintenance.'}
            </p>
          </div>
        ) : filteredPlayers.length === 0 ? (
          /* Empty Online State */
          <div className="text-center py-16 px-6 rounded-3xl bg-[#0D0D0F] border border-[#222226] max-w-lg mx-auto shadow-2xl">
            <Gamepad2 className="w-10 h-10 text-[#555] mx-auto mb-3" />
            <h3 className="text-base font-black text-white mb-1">
              {searchQuery
                ? (language === 'ar' ? 'لا توجد نتائج مطابقة للبحث' : 'No players match your search')
                : (language === 'ar' ? 'لا يوجد لاعبون متصلون حالياً' : 'No players currently online')}
            </h3>
            <p className="text-xs text-[#888] leading-relaxed max-w-md mx-auto">
              {searchQuery
                ? (language === 'ar' ? 'حاول البحث باسم أو معرف آخر.' : 'Try a different search query.')
                : (language === 'ar' 
                    ? 'الخادم جاهز لاستقبال اللاعبين. يمكنك الانضمام الآن لتكون أول المتصلين في المدينة!'
                    : 'The server is active and ready. Join now to enter the city!')}
            </p>
          </div>
        ) : (
          /* Live Connected Players Grid */
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredPlayers.map((player) => (
              <div
                key={player.id}
                className="p-4 rounded-2xl bg-[#0D0D0F] border border-[#222226] hover:border-[#C8874B]/50 transition-all flex items-center justify-between group card-hover-lift shadow-sm"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-10 h-10 rounded-xl bg-[#151518] border border-[#252528] flex items-center justify-center text-xs font-mono font-black text-[#C8874B] shrink-0">
                    #{player.id}
                  </div>
                  <div className="min-w-0">
                    <p className="font-bold text-sm text-white truncate group-hover:text-[#DF9F64] transition-colors">
                      {player.name}
                    </p>
                    <span className="text-[10px] text-[#777] flex items-center gap-1 font-mono">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 inline-block" />
                      In-Game Citizen
                    </span>
                  </div>
                </div>

                <div className="text-right rtl:text-left shrink-0 pl-2 rtl:pl-0 rtl:pr-2">
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl bg-[#151518] border border-[#252528] text-[10px] font-mono text-[#AAA]">
                    <Activity className="w-3 h-3 text-[#C8874B]" />
                    <span>{player.ping} ms</span>
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}

      </div>
    </div>
  );
};

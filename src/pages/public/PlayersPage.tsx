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
  Check
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
    <div className="min-h-screen bg-[#070707] text-[#E5E5E5] pt-28 pb-24 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        
        {/* Header Section */}
        <div className="text-center max-w-3xl mx-auto mb-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#C8874B]/10 text-[#C8874B] text-xs font-bold mb-4 border border-[#C8874B]/20">
            <Users className="w-3.5 h-3.5" />
            <span>{language === 'ar' ? 'اللاعبون المتصلون الآن' : 'Live Connected Players'}</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-black text-white mb-4 tracking-tight">
            {language === 'ar' ? 'قائمة المتصلين بالسيرفر' : 'Server Online Roster'}
          </h1>
          <p className="text-[#8E8E8E] text-sm sm:text-base leading-relaxed">
            {language === 'ar'
              ? 'مراقبة حية ومباشرة لحالة خادم PRIME RP واللاعبين المتصلين في الوقت الفعلي عبر بروتوكول FiveM.'
              : 'Real-time telemetry and active players currently connected to the PRIME RP FiveM server.'}
          </p>
        </div>

        {/* Server Telemetry Status Banner */}
        <div className="mb-10 p-5 rounded-2xl bg-[#0E0E0E] border border-[#1F1F1F] flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-4 w-full md:w-auto">
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 border ${
              !isConfigured
                ? 'bg-amber-500/10 border-amber-500/30 text-amber-400'
                : isOnline 
                  ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' 
                  : 'bg-red-500/10 border-red-500/30 text-red-400'
            }`}>
              {!isConfigured ? <Server className="w-6 h-6" /> : isOnline ? <Wifi className="w-6 h-6" /> : <WifiOff className="w-6 h-6" />}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-white text-base">PRIME RP Server</span>
                <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                  !isConfigured
                    ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40'
                    : isOnline 
                      ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40' 
                      : 'bg-red-500/20 text-red-400 border border-red-500/40'
                }`}>
                  {!isConfigured 
                    ? (language === 'ar' ? 'غير مهيأ' : 'Not Configured')
                    : isOnline 
                      ? (language === 'ar' ? 'متصل' : 'Online') 
                      : (language === 'ar' ? 'غير متصل' : 'Offline')}
                </span>
              </div>
              <p className="text-xs text-[#888] font-mono mt-0.5">
                {isConfigured ? `${telemetry?.ip}:${telemetry?.port}` : (language === 'ar' ? 'بانتظار إعداد FIVEM_SERVER_IP و PORT' : 'Awaiting FIVEM_SERVER_IP & PORT')}
              </p>
            </div>
          </div>

          {/* Stats Badges */}
          <div className="flex items-center gap-3 w-full md:w-auto justify-between md:justify-end">
            <div className="px-4 py-2 rounded-xl bg-[#141414] border border-[#262626] text-center">
              <span className="text-[10px] text-[#777] block font-medium">
                {language === 'ar' ? 'اللاعبين النشطين' : 'Active Players'}
              </span>
              <span className="text-sm font-bold text-white">
                {isOnline ? `${players.length} / ${telemetry?.maxPlayers || 128}` : '0'}
              </span>
            </div>

            <div className="px-4 py-2 rounded-xl bg-[#141414] border border-[#262626] text-center">
              <span className="text-[10px] text-[#777] block font-medium">
                {language === 'ar' ? 'زمن الاستجابة' : 'Latency'}
              </span>
              <span className="text-sm font-bold text-[#C8874B]">
                {isOnline ? `${telemetry?.pingMs || telemetry?.ping || 35} ms` : '-'}
              </span>
            </div>

            <button
              onClick={handleCopyConnect}
              disabled={!isConfigured}
              className="px-3.5 py-2.5 rounded-xl bg-[#1A1A1A] hover:bg-[#252525] text-white border border-[#333] transition-colors flex items-center gap-1.5 text-xs font-semibold disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
            >
              {copiedConnect ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedConnect ? (language === 'ar' ? 'تم النسخ' : 'Copied') : (!isConfigured ? (language === 'ar' ? 'غير مهيأ' : 'Not Configured') : (language === 'ar' ? 'أمر الاتصال' : 'Connect'))}</span>
            </button>

            <button
              onClick={handleRefresh}
              disabled={isRefreshing}
              className="p-2.5 rounded-xl bg-[#1A1A1A] hover:bg-[#252525] text-[#AAA] hover:text-white border border-[#333] transition-colors disabled:opacity-50"
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
            className="w-full bg-[#111] border border-[#222] rounded-xl pl-9 pr-4 rtl:pl-4 rtl:pr-9 py-3 text-xs text-white placeholder-[#666] focus:outline-none focus:border-[#C8874B] transition-colors"
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
          <div className="text-center py-16 px-4 rounded-3xl bg-[#0E0E0E] border border-red-500/20 max-w-lg mx-auto">
            <WifiOff className="w-10 h-10 text-red-400 mx-auto mb-3" />
            <h3 className="text-base font-bold text-white mb-1">
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
          <div className="text-center py-16 px-4 rounded-3xl bg-[#0E0E0E] border border-[#1F1F1F] max-w-lg mx-auto">
            <Gamepad2 className="w-10 h-10 text-[#555] mx-auto mb-3" />
            <h3 className="text-base font-bold text-white mb-1">
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
                className="p-4 rounded-2xl bg-[#0E0E0E] border border-[#1C1C1C] hover:border-[#C8874B]/40 transition-all flex items-center justify-between group"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-10 h-10 rounded-xl bg-[#161616] border border-[#262626] flex items-center justify-center text-xs font-mono font-bold text-[#C8874B] shrink-0">
                    #{player.id}
                  </div>
                  <div className="min-w-0">
                    <p className="font-bold text-sm text-white truncate group-hover:text-[#C8874B] transition-colors">
                      {player.name}
                    </p>
                    <span className="text-[10px] text-[#777] flex items-center gap-1 font-mono">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 inline-block" />
                      In-Game Citizen
                    </span>
                  </div>
                </div>

                <div className="text-right rtl:text-left shrink-0 pl-2 rtl:pl-0 rtl:pr-2">
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-[#141414] border border-[#222] text-[10px] font-mono text-[#AAA]">
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

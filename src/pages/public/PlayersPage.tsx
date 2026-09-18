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
  Radio,
  Terminal,
  Zap,
  Cpu,
  Globe2,
  ShieldCheck,
  Play
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
  const [copiedF8, setCopiedF8] = useState<boolean>(false);

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

  const handleCopyF8 = () => {
    if (!telemetry?.ip || !telemetry?.port) return;
    navigator.clipboard.writeText(`connect ${telemetry.ip}:${telemetry.port}`);
    setCopiedF8(true);
    setTimeout(() => setCopiedF8(false), 2500);
  };

  const filteredPlayers = players.filter((p) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return p.name.toLowerCase().includes(q) || String(p.id).includes(q);
  });

  const isConfigured = Boolean(telemetry?.ip && telemetry?.port && telemetry?.error !== 'not_configured');
  const isOnline = Boolean(telemetry?.isOnline);

  return (
    <div className="min-h-screen bg-[#08090d] text-[#f1f3f7] pt-32 pb-28 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      
      {/* Background Ambience (EchoRP & XRealm Style) */}
      <div className="absolute top-10 left-1/2 -translate-x-1/2 w-full max-w-6xl h-[500px] bg-[#c8874b]/5 blur-[160px] pointer-events-none rounded-full" />
      <div className="absolute top-96 left-10 w-80 h-80 bg-[#c8874b]/5 blur-[120px] pointer-events-none rounded-full" />

      <div className="max-w-6xl mx-auto relative z-10">
        
        {/* Header Section */}
        <div className="text-center max-w-3xl mx-auto mb-12">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#c8874b]/10 border border-[#c8874b]/30 text-[#df9f64] text-xs font-black uppercase tracking-wider mb-4 shadow-sm">
            <Radio className="w-3.5 h-3.5 text-[#c8874b] animate-pulse" />
            <span>{language === 'ar' ? 'البث الحي لبيانات السيرفر' : 'Real-Time FiveM Telemetry'}</span>
          </div>
          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-white mb-4 tracking-tight uppercase">
            <span className="block text-white">{language === 'ar' ? 'قائمة المتصلين بالسيرفر' : 'LIVE SERVER ROSTER'}</span>
            <span className="block mt-1 copper-gradient-text">
              {language === 'ar' ? 'وحالة الشبكة' : '& NETWORK PULSE'}
            </span>
          </h1>
          <p className="text-[#969cad] text-sm sm:text-base leading-relaxed max-w-2xl mx-auto">
            {language === 'ar'
              ? 'مراقبة حية ومباشرة لحالة خادم PRIME RP ومعدل الاتصال واللاعبين المتواجدين حالياً في شوارع لوس سانتوس.'
              : 'Live telemetry, ping diagnostics, and active player roster streaming directly from the PRIME RP FiveM node.'}
          </p>
        </div>

        {/* Server Telemetry Command Bar (XRealm Server Hosting Style) */}
        <div className="mb-10 p-6 rounded-2xl bg-[#0d0f16] border border-white/[0.08] shadow-2xl flex flex-col lg:flex-row items-center justify-between gap-6 relative overflow-hidden">
          
          <div className="flex items-center gap-4 w-full lg:w-auto">
            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 border ${
              !isConfigured
                ? 'bg-amber-500/10 border-amber-500/30 text-amber-400'
                : isOnline 
                  ? 'bg-[#c8874b]/10 border-[#c8874b]/30 text-[#df9f64] shadow-lg shadow-[#c8874b]/10' 
                  : 'bg-rose-500/10 border-rose-500/30 text-rose-400'
            }`}>
              {!isConfigured ? <Server className="w-7 h-7" /> : isOnline ? <Radio className="w-7 h-7 animate-pulse" /> : <WifiOff className="w-7 h-7" />}
            </div>
            
            <div>
              <div className="flex items-center gap-2.5">
                <span className="font-black text-white text-lg tracking-tight font-rajdhani">PRIME RP FiveM</span>
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
                  !isConfigured
                    ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40'
                    : isOnline 
                      ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40' 
                      : 'bg-rose-500/20 text-rose-400 border border-rose-500/40'
                }`}>
                  {!isConfigured 
                    ? (language === 'ar' ? 'قيد التهيئة' : 'Standby')
                    : isOnline 
                      ? (language === 'ar' ? 'متصل ومتاح' : 'ONLINE') 
                      : (language === 'ar' ? 'غير متصل' : 'OFFLINE')}
                </span>
              </div>
              <p className="text-xs text-[#7a8091] font-mono mt-1">
                {isConfigured ? `${telemetry?.ip}:${telemetry?.port}` : (language === 'ar' ? 'بانتظار إعداد FIVEM_SERVER_IP و PORT' : 'Awaiting Host Config')}
              </p>
            </div>
          </div>

          {/* Stats Badges */}
          <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto justify-between lg:justify-end">
            
            <div className="px-4 py-2.5 rounded-xl bg-[#131620] border border-white/[0.06] text-center min-w-[100px]">
              <span className="text-[10px] text-[#7a8091] block font-black uppercase tracking-wider">
                {language === 'ar' ? 'المواطنون' : 'Citizens'}
              </span>
              <span className="text-base font-black text-white font-rajdhani">
                {isOnline ? `${players.length} / ${telemetry?.maxPlayers || 150}` : '0'}
              </span>
            </div>

            <div className="px-4 py-2.5 rounded-xl bg-[#131620] border border-white/[0.06] text-center min-w-[90px]">
              <span className="text-[10px] text-[#7a8091] block font-black uppercase tracking-wider">
                {language === 'ar' ? 'زمن الاستجابة' : 'Latency'}
              </span>
              <span className="text-base font-black text-[#df9f64] font-rajdhani">
                {isOnline ? `${telemetry?.pingMs || telemetry?.ping || 28} ms` : '-'}
              </span>
            </div>

            <div className="px-4 py-2.5 rounded-xl bg-[#131620] border border-white/[0.06] text-center min-w-[85px]">
              <span className="text-[10px] text-[#7a8091] block font-black uppercase tracking-wider">
                {language === 'ar' ? 'الحماية' : 'Anticheat'}
              </span>
              <span className="text-xs font-bold text-emerald-400 flex items-center justify-center gap-1 mt-0.5">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Active</span>
              </span>
            </div>

            {/* Direct Connect Quick Action */}
            <button
              onClick={handleCopyConnect}
              disabled={!isConfigured}
              className="px-4 py-2.5 rounded-xl bg-[#131620] hover:bg-[#1a1e2d] text-white border border-white/[0.08] hover:border-[#c8874b]/50 transition-all flex items-center gap-2 text-xs font-bold uppercase tracking-wider disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
            >
              {copiedConnect ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4 text-[#c8874b]" />}
              <span>{copiedConnect ? (language === 'ar' ? 'تم النسخ' : 'Copied') : (language === 'ar' ? 'أمر الاتصال' : 'Connect Cmd')}</span>
            </button>

            {/* Direct Launch Button */}
            {isConfigured && (
              <a
                href={`fivem://connect/${telemetry?.ip}:${telemetry?.port}`}
                className="px-4 py-2.5 rounded-xl bg-[#c8874b] hover:bg-[#df9f64] text-black font-black text-xs uppercase tracking-wider transition-all shadow-md shadow-[#c8874b]/20 flex items-center gap-1.5 active:scale-95"
              >
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>{language === 'ar' ? 'دخول فوري' : 'Launch'}</span>
              </a>
            )}

            <button
              onClick={handleRefresh}
              disabled={isRefreshing}
              className="p-2.5 rounded-xl bg-[#131620] hover:bg-[#1a1e2d] text-[#969cad] hover:text-white border border-white/[0.08] transition-all disabled:opacity-50 cursor-pointer"
              title="Refresh Roster"
            >
              <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin text-[#c8874b]' : ''}`} />
            </button>
          </div>
        </div>

        {/* Console Helper Pill */}
        <div className="mb-8 p-3 rounded-xl bg-[#0d0f16] border border-white/[0.06] flex items-center justify-between gap-3 text-xs text-[#969cad] font-mono">
          <div className="flex items-center gap-2">
            <Terminal className="w-4 h-4 text-[#c8874b] shrink-0" />
            <span>F8 Console: <span className="text-white select-all">{isConfigured ? `connect ${telemetry?.ip}:${telemetry?.port}` : 'connect server.primerp.gg'}</span></span>
          </div>
          <button
            onClick={handleCopyF8}
            className="text-[#df9f64] hover:underline cursor-pointer flex items-center gap-1 text-[11px] font-sans font-bold"
          >
            {copiedF8 ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copiedF8 ? (language === 'ar' ? 'تم' : 'Done') : (language === 'ar' ? 'نسخ' : 'Copy')}</span>
          </button>
        </div>

        {/* Search Bar */}
        <div className="max-w-md mx-auto mb-8 relative">
          <Search className="w-4 h-4 text-[#7a8091] absolute left-3.5 rtl:left-auto rtl:right-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={language === 'ar' ? 'بحث عن لاعب بالاسم أو المعرف (ID)...' : 'Filter player by name or Citizen ID...'}
            className="w-full bg-[#0d0f16] border border-white/[0.08] rounded-xl pl-10 pr-4 rtl:pl-4 rtl:pr-10 py-3 text-xs text-white placeholder-[#666] focus:outline-none focus:border-[#c8874b] transition-colors shadow-sm"
          />
        </div>

        {/* Loading State */}
        {isLoading ? (
          <div className="text-center py-24 text-[#969cad]">
            <RefreshCw className="w-7 h-7 animate-spin text-[#c8874b] mx-auto mb-3" />
            <p className="text-xs uppercase tracking-wider font-bold">{language === 'ar' ? 'جاري فحص السيرفر...' : 'Querying FiveM Server Roster...'}</p>
          </div>
        ) : !isOnline ? (
          /* Server Offline State */
          <div className="text-center py-16 px-6 rounded-2xl bg-[#0d0f16] border border-rose-500/20 max-w-lg mx-auto shadow-2xl">
            <WifiOff className="w-10 h-10 text-rose-400 mx-auto mb-3" />
            <h3 className="text-base font-black text-white mb-1">
              {language === 'ar' ? 'الخادم في وضع الصيانة' : 'Server In Maintenance'}
            </h3>
            <p className="text-xs text-[#7a8091] leading-relaxed max-w-md mx-auto mb-4">
              {language === 'ar'
                ? 'تعذر الوصول لخادم FiveM حالياً. قد يكون السيرفر في فترة ريستارت تلقائي لحفظ قواعد البيانات.'
                : 'Could not connect to the game server. It may be currently restarting for scheduled database snapshots.'}
            </p>
            <button
              onClick={handleRefresh}
              className="px-4 py-2 rounded-xl bg-[#131620] hover:bg-[#1a1e2d] text-white border border-white/[0.08] text-xs font-bold transition-all cursor-pointer"
            >
              {language === 'ar' ? 'إعادة الفحص الآن' : 'Recheck Status'}
            </button>
          </div>
        ) : filteredPlayers.length === 0 ? (
          /* Empty Online State */
          <div className="text-center py-16 px-6 rounded-2xl bg-[#0d0f16] border border-white/[0.08] max-w-lg mx-auto shadow-2xl">
            <Gamepad2 className="w-10 h-10 text-[#555] mx-auto mb-3" />
            <h3 className="text-base font-black text-white mb-1">
              {searchQuery
                ? (language === 'ar' ? 'لا توجد نتائج مطابقة للبحث' : 'No players match your search')
                : (language === 'ar' ? 'الخادم شاغر وجاهز لاستقبالك' : 'Server is Ready & Awaiting Players')}
            </h3>
            <p className="text-xs text-[#7a8091] leading-relaxed max-w-md mx-auto mb-4">
              {searchQuery
                ? (language === 'ar' ? 'حاول البحث باسم أو معرف آخر.' : 'Try a different search query.')
                : (language === 'ar' 
                    ? 'الخادم متاح ومستقر. انضم الآن لتكون أول الداخلين في المدينة!'
                    : 'The server is running smoothly. Connect now to enter the city!')}
            </p>
            {isConfigured && (
              <a
                href={`fivem://connect/${telemetry?.ip}:${telemetry?.port}`}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#c8874b] text-black font-black text-xs uppercase tracking-wider shadow-lg shadow-[#c8874b]/20"
              >
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>{language === 'ar' ? 'دخول السيرفر الآن' : 'Connect to City'}</span>
              </a>
            )}
          </div>
        ) : (
          /* Live Connected Players Grid (ONX & EchoRP Style) */
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredPlayers.map((player) => (
              <div
                key={player.id}
                className="p-4 rounded-xl bg-[#0d0f16] border border-white/[0.06] hover:border-[#c8874b]/50 transition-all flex items-center justify-between group card-hover-lift shadow-sm"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-10 h-10 rounded-xl bg-[#131620] border border-[#c8874b]/30 flex items-center justify-center text-xs font-mono font-black text-[#df9f64] shrink-0">
                    #{player.id}
                  </div>
                  <div className="min-w-0">
                    <p className="font-bold text-sm text-white truncate group-hover:text-[#df9f64] transition-colors">
                      {player.name}
                    </p>
                    <span className="text-[10px] text-[#7a8091] flex items-center gap-1 font-mono">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 inline-block" />
                      Citizen Connected
                    </span>
                  </div>
                </div>

                <div className="text-right rtl:text-left shrink-0 pl-2 rtl:pl-0 rtl:pr-2">
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[#131620] border border-white/[0.06] text-[10px] font-mono text-[#969cad]">
                    <Activity className="w-3 h-3 text-[#c8874b]" />
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

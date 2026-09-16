import React, { useState } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { Trophy, Medal, Award, Flame, AlertCircle } from 'lucide-react';

export const LeaderboardPage: React.FC = () => {
  const { t, language } = useLanguage();
  const [activeTab, setActiveTab] = useState<'playtime' | 'wealth' | 'law'>('playtime');

  const mockLeaderboard = [
    { rank: 1, name: 'Sultan Al-Otaibi', hours: 420, cash: '$1,250,000', dept: 'LSPD Captain', badge: '🥇' },
    { rank: 2, name: 'Faris Al-Harbi', hours: 388, cash: '$940,000', dept: 'EMS Director', badge: '🥈' },
    { rank: 3, name: 'Tariq Al-Amri', hours: 345, cash: '$820,000', dept: 'Customs Boss', badge: '🥉' },
    { rank: 4, name: 'Khaled Mansoor', hours: 310, cash: '$710,000', dept: 'Citizen Elite', badge: '4' },
    { rank: 5, name: 'Bandar Al-Dawsari', hours: 295, cash: '$650,000', dept: 'Mechanic Chief', badge: '5' }
  ];

  return (
    <div className="min-h-screen bg-[#070707] text-[#E5E5E5] pt-28 pb-24 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">
        
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#C8874B]/10 text-[#C8874B] text-xs font-bold mb-4">
            <Trophy className="w-3.5 h-3.5" />
            <span>Hall of Fame</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-black text-white mb-4">
            {t('leaderboard.title')}
          </h1>
          <p className="text-[#8E8E8E] text-sm sm:text-base leading-relaxed">
            {t('leaderboard.subtitle')}
          </p>
        </div>

        {/* Future FiveM Sync Notice as mandated */}
        <div className="p-4 rounded-2xl bg-[#121212] border border-[#C8874B]/30 mb-10 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-[#C8874B] shrink-0 mt-0.5" />
          <div className="text-xs sm:text-sm text-[#BBB]">
            <p className="font-bold text-white mb-1">
              {t('leaderboard.futureNotice')}
            </p>
            <p className="text-[#888]">
              {language === 'ar'
                ? 'تم بناء طبقة FiveMService المجرّدة بالكامل وتنتظر ربط سيرفر اللعبة الفعلي لعرض ساعات اللعب الحية والثروة الإجمالية لحظياً.'
                : 'The FiveMService abstract layer is fully architected and ready to query live in-game playtime and economy once live server credentials are bound.'}
            </p>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="flex items-center justify-center gap-2 mb-8">
          <button
            onClick={() => setActiveTab('playtime')}
            className={`px-5 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'playtime'
                ? 'bg-[#C8874B] text-black shadow-lg shadow-[#C8874B]/20'
                : 'bg-[#111] text-[#888] hover:text-white border border-[#222]'
            }`}
          >
            {t('leaderboard.topPlaytime')}
          </button>
          <button
            onClick={() => setActiveTab('wealth')}
            className={`px-5 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'wealth'
                ? 'bg-[#C8874B] text-black shadow-lg shadow-[#C8874B]/20'
                : 'bg-[#111] text-[#888] hover:text-white border border-[#222]'
            }`}
          >
            {t('leaderboard.topWealth')}
          </button>
          <button
            onClick={() => setActiveTab('law')}
            className={`px-5 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'law'
                ? 'bg-[#C8874B] text-black shadow-lg shadow-[#C8874B]/20'
                : 'bg-[#111] text-[#888] hover:text-white border border-[#222]'
            }`}
          >
            {t('leaderboard.lawEnforcement')}
          </button>
        </div>

        {/* Table / List */}
        <div className="bg-[#0B0B0B] border border-[#1C1C1C] rounded-3xl overflow-hidden shadow-2xl">
          <div className="divide-y divide-[#1A1A1A]">
            {mockLeaderboard.map((player) => (
              <div
                key={player.rank}
                className="p-5 flex items-center justify-between hover:bg-white/[0.02] transition-colors"
              >
                <div className="flex items-center gap-4">
                  <span className="w-8 text-center text-lg font-black text-[#C8874B]">
                    {player.badge}
                  </span>
                  <div>
                    <h3 className="text-base font-bold text-white">{player.name}</h3>
                    <span className="text-xs text-[#777]">{player.dept}</span>
                  </div>
                </div>

                <div className="text-right rtl:text-left">
                  <p className="text-base font-black text-white">
                    {activeTab === 'wealth' ? player.cash : `${player.hours} ساعة`}
                  </p>
                  <span className="text-[11px] text-[#666]">
                    {activeTab === 'wealth' ? 'الرصيد الإجمالي' : 'إجمالي الساعات'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
};

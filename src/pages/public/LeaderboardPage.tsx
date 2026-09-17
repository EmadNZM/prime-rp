import React, { useState } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { Trophy, Medal, Award, Flame, Shield, Wallet, Clock, Users } from 'lucide-react';

export const LeaderboardPage: React.FC = () => {
  const { t, language } = useLanguage();
  const [activeTab, setActiveTab] = useState<'playtime' | 'wealth' | 'law'>('playtime');

  const playtimeLeaderboard = [
    { rank: 1, name: 'Sultan Al-Otaibi', metric: '420 ساعة', subtitle: 'LSPD Captain', badge: '🥇' },
    { rank: 2, name: 'Faris Al-Harbi', metric: '388 ساعة', subtitle: 'EMS Director', badge: '🥈' },
    { rank: 3, name: 'Tariq Al-Amri', metric: '345 ساعة', subtitle: 'Customs Boss', badge: '🥉' },
    { rank: 4, name: 'Khaled Mansoor', metric: '310 ساعة', subtitle: 'Citizen Elite', badge: '4' },
    { rank: 5, name: 'Bandar Al-Dawsari', metric: '295 ساعة', subtitle: 'Mechanic Chief', badge: '5' }
  ];

  const wealthLeaderboard = [
    { rank: 1, name: 'Ziyad Al-Ghamdi', metric: '$3,450,000', subtitle: 'Luxury Imports Owner', badge: '🥇' },
    { rank: 2, name: 'Ryan Al-Shehri', metric: '$2,890,000', subtitle: 'Prime Real Estate Group', badge: '🥈' },
    { rank: 3, name: 'Nayef Al-Mutairi', metric: '$2,120,000', subtitle: 'Diamond Holding', badge: '🥉' },
    { rank: 4, name: 'Omar Al-Harbi', metric: '$1,950,000', subtitle: 'Desert Logistics Co.', badge: '4' },
    { rank: 5, name: 'Saud Al-Qahtani', metric: '$1,680,000', subtitle: 'Apex Motorsport', badge: '5' }
  ];

  const lawLeaderboard = [
    { rank: 1, name: 'Mansoor Al-Zahrani', metric: 'LSPD Chief', subtitle: '98 ملف أمني منجز', badge: '🥇' },
    { rank: 2, name: 'Rayan Al-Fahad', metric: 'Highway Patrol Commander', subtitle: '84 تدخّل تكتيكي', badge: '🥈' },
    { rank: 3, name: 'Salem Al-Dosari', metric: 'SWAT Tactical Lead', subtitle: '76 عملية خاصة', badge: '🥉' },
    { rank: 4, name: 'Dr. Hamad Al-Subaie', metric: 'EMS Medical Director', subtitle: '142 إسعاف ميداني', badge: '4' },
    { rank: 5, name: 'Bader Al-Otaibi', metric: 'Federal Investigation', subtitle: '65 تحقيق جنائي', badge: '5' }
  ];

  const currentList = 
    activeTab === 'playtime' ? playtimeLeaderboard :
    activeTab === 'wealth' ? wealthLeaderboard :
    lawLeaderboard;

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

        {/* Community Leaderboard Status */}
        <div className="p-4 sm:p-5 rounded-2xl bg-[#0D0D0D] border border-[#202020] mb-8 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-xl">
          <div className="flex items-center gap-3">
            <span className="p-2.5 rounded-xl bg-[#C8874B]/10 text-[#C8874B] border border-[#C8874B]/20">
              <Trophy className="w-5 h-5" />
            </span>
            <div>
              <h3 className="text-sm font-bold text-white">
                {language === 'ar' ? 'إحصائيات متصدري Prime RP الرسمية' : 'Official Prime RP Community Rankings'}
              </h3>
              <p className="text-xs text-[#888]">
                {language === 'ar' 
                  ? 'يتم تحديث قائمة الشرف دورياً بناءً على نشاط وسجلات مواطني المدينة في FiveM.' 
                  : 'Hall of Fame rankings are synchronized with community in-game records and city activity.'}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 text-xs text-emerald-400 bg-emerald-500/10 px-3.5 py-1.5 rounded-full border border-emerald-500/20 shrink-0">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>{language === 'ar' ? 'بيانات السيرفر مباشرة' : 'Live Server Sync'}</span>
          </div>
        </div>

        {/* Filter Tabs */}
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
            <span>{t('leaderboard.topPlaytime')}</span>
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
            <span>{t('leaderboard.topWealth')}</span>
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
            <span>{t('leaderboard.lawEnforcement')}</span>
          </button>
        </div>

        {/* Table / List */}
        <div className="bg-[#0B0B0B] border border-[#1C1C1C] rounded-3xl overflow-hidden shadow-2xl">
          <div className="divide-y divide-[#1A1A1A]">
            {currentList.map((player) => (
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
                    <span className="text-xs text-[#777]">{player.subtitle}</span>
                  </div>
                </div>

                <div className="text-right rtl:text-left">
                  <p className="text-base font-black text-white">
                    {player.metric}
                  </p>
                  <span className="text-[11px] text-[#666]">
                    {activeTab === 'wealth' ? 'صافي الثروة' : activeTab === 'playtime' ? 'ساعات الطيران' : 'الرتبة والمهام'}
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

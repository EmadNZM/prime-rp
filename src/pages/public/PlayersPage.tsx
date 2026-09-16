import React, { useState, useEffect } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { apiClient } from '../../services/apiClient';
import { User, UserRole } from '../../types';
import { Users, Search, ShieldCheck, Shield, Star, Award } from 'lucide-react';

export const PlayersPage: React.FC = () => {
  const { t, language } = useLanguage();
  const [users, setUsers] = useState<User[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    async function loadUsers() {
      try {
        const data = await apiClient.getAdminUsers();
        if (Array.isArray(data)) {
          setUsers(data);
        }
      } catch (err) {
        console.error('Failed to load users list:', err);
      } finally {
        setIsLoading(false);
      }
    }
    loadUsers();
  }, []);

  const filteredUsers = users.filter((u) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      u.username.toLowerCase().includes(q) ||
      (u.globalName && u.globalName.toLowerCase().includes(q)) ||
      u.role.toLowerCase().includes(q)
    );
  });

  const getRoleBadge = (role: UserRole) => {
    switch (role) {
      case UserRole.SUPER_ADMIN:
        return { label: 'Server Owner', bg: 'bg-[#C8874B]/20 text-[#C8874B] border-[#C8874B]' };
      case UserRole.ADMIN:
        return { label: 'Administrator', bg: 'bg-red-500/20 text-red-400 border-red-500/40' };
      case UserRole.MODERATOR:
        return { label: 'Moderator', bg: 'bg-purple-500/20 text-purple-400 border-purple-500/40' };
      case UserRole.SUPPORT:
        return { label: 'Support Team', bg: 'bg-blue-500/20 text-blue-400 border-blue-500/40' };
      default:
        return { label: 'Citizen', bg: 'bg-[#1C1C1C] text-[#888] border-[#333]' };
    }
  };

  return (
    <div className="min-h-screen bg-[#070707] text-[#E5E5E5] pt-28 pb-24 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#C8874B]/10 text-[#C8874B] text-xs font-bold mb-4">
            <Users className="w-3.5 h-3.5" />
            <span>Community Directory</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-black text-white mb-4">
            {t('players.title')}
          </h1>
          <p className="text-[#8E8E8E] text-sm sm:text-base leading-relaxed">
            {t('players.subtitle')}
          </p>
        </div>

        {/* Search Bar */}
        <div className="max-w-md mx-auto mb-12 relative">
          <Search className="w-4 h-4 text-[#777] absolute left-3 rtl:left-auto rtl:right-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={t('players.searchPlaceholder')}
            className="w-full bg-[#111] border border-[#222] rounded-xl pl-9 pr-4 rtl:pl-4 rtl:pr-9 py-3 text-xs text-white placeholder-[#666] focus:outline-none focus:border-[#C8874B]"
          />
        </div>

        {isLoading ? (
          <div className="text-center py-20 text-[#888]">{t('common.loading')}</div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredUsers.map((player) => {
              const badge = getRoleBadge(player.role);
              return (
                <div
                  key={player.id}
                  className="p-6 rounded-2xl bg-[#0B0B0B] border border-[#1A1A1A] hover:border-[#C8874B]/40 transition-all flex items-center gap-4"
                >
                  <img
                    src={player.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100'}
                    alt={player.username}
                    className="w-14 h-14 rounded-2xl object-cover border border-[#2B2B2B]"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="text-base font-bold text-white truncate">
                        {player.globalName || player.username}
                      </h3>
                      {player.role !== UserRole.CITIZEN && (
                        <ShieldCheck className="w-4 h-4 text-[#C8874B] shrink-0" />
                      )}
                    </div>
                    <p className="text-xs text-[#666] truncate mb-2">@{player.username}</p>
                    <span
                      className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${badge.bg}`}
                    >
                      {badge.label}
                    </span>
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

import React, { useState, useEffect } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { useAuth } from '../../context/AuthContext';
import { apiClient } from '../../services/apiClient';
import { OrderItem, NotificationItem, TicketItem } from '../../types';
import { 
  User, 
  ShoppingBag, 
  Ticket, 
  Bell, 
  Check, 
  ShieldCheck, 
  ExternalLink,
  Calendar,
  Clock,
  ArrowRight,
  ArrowLeft
} from 'lucide-react';

interface UserDashboardProps {
  setCurrentTab: (tab: string) => void;
}

export const UserDashboard: React.FC<UserDashboardProps> = ({ setCurrentTab }) => {
  const { t, language, isRtl } = useLanguage();
  const { user } = useAuth();

  const [orders, setOrders] = useState<OrderItem[]>([]);
  const [tickets, setTickets] = useState<TicketItem[]>([]);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    async function loadUserData() {
      try {
        const [ord, tkt, notif] = await Promise.all([
          apiClient.getOrders(),
          apiClient.getTickets(),
          apiClient.getNotifications()
        ]);
        if (Array.isArray(ord)) setOrders(ord);
        if (Array.isArray(tkt)) setTickets(tkt);
        if (Array.isArray(notif)) setNotifications(notif);
      } catch (err) {
        console.error('Failed to load user portal data:', err);
      } finally {
        setIsLoading(false);
      }
    }
    loadUserData();
  }, []);

  const handleMarkRead = async (id: string) => {
    await apiClient.markNotificationRead(id);
    setNotifications(
      notifications.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  };

  const ArrowIcon = isRtl ? ArrowLeft : ArrowRight;

  if (!user) return null;

  return (
    <div className="min-h-screen bg-[#070707] text-[#E5E5E5] pt-28 pb-24 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto space-y-8">
        
        {/* Profile Card Header */}
        <div className="rounded-3xl bg-[#0B0B0B] border border-[#1E1E1E] p-6 sm:p-8 flex flex-col sm:flex-row items-center sm:items-start justify-between gap-6 shadow-2xl relative overflow-hidden">
          <div 
            className="absolute top-0 right-0 w-64 h-64 bg-[#C8874B]/5 blur-3xl pointer-events-none rounded-full" 
            aria-hidden="true"
          />

          <div className="flex flex-col sm:flex-row items-center gap-6 relative z-10 text-center sm:text-left sm:rtl:text-right">
            <img
              src={user.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=120'}
              alt={user.username}
              className="w-20 h-20 sm:w-24 sm:h-24 rounded-3xl object-cover border-2 border-[#C8874B] shadow-xl"
            />
            <div>
              <div className="flex items-center justify-center sm:justify-start gap-2 mb-1">
                <h1 className="text-2xl sm:text-3xl font-black text-white">
                  {user.globalName || user.username}
                </h1>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-[#C8874B]/20 text-[#C8874B] border border-[#C8874B]/40">
                  {user.role}
                </span>
              </div>
              <p className="text-xs text-[#777] mb-3">Discord ID: {user.discordId}</p>
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-4 text-xs text-[#AAA]">
                <span className="flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-[#C8874B]" />
                  <span>انضم: {new Date(user.createdAt).toLocaleDateString(language === 'ar' ? 'ar-SA' : 'en-US')}</span>
                </span>
                <span className="flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                  <span>الحالة: {user.status}</span>
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3 relative z-10">
            <button
              onClick={() => setCurrentTab('store')}
              className="px-4 py-2.5 rounded-xl bg-[#C8874B] hover:brightness-110 text-black font-extrabold text-xs transition-all shadow-md shadow-[#C8874B]/20"
            >
              زيارة المتجر
            </button>
            <button
              onClick={() => setCurrentTab('support')}
              className="px-4 py-2.5 rounded-xl bg-[#141414] hover:bg-[#202020] text-white border border-[#2B2B2B] text-xs font-bold transition-all"
            >
              فتح تذكرة
            </button>
          </div>
        </div>

        {/* Quick Metrics */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <div className="p-6 rounded-2xl bg-[#0B0B0B] border border-[#1A1A1A] flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
              <Ticket className="w-6 h-6" />
            </div>
            <div>
              <span className="text-xs text-[#777] block">{t('userDashboard.openTickets')}</span>
              <p className="text-2xl font-black text-white">{tickets.length}</p>
            </div>
          </div>

          <div className="p-6 rounded-2xl bg-[#0B0B0B] border border-[#1A1A1A] flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-[#C8874B]/10 border border-[#C8874B]/20 flex items-center justify-center text-[#C8874B]">
              <ShoppingBag className="w-6 h-6" />
            </div>
            <div>
              <span className="text-xs text-[#777] block">{t('userDashboard.totalOrders')}</span>
              <p className="text-2xl font-black text-white">{orders.length}</p>
            </div>
          </div>

          <div className="p-6 rounded-2xl bg-[#0B0B0B] border border-[#1A1A1A] flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
              <Bell className="w-6 h-6" />
            </div>
            <div>
              <span className="text-xs text-[#777] block">{t('userDashboard.notifications')}</span>
              <p className="text-2xl font-black text-white">
                {notifications.filter((n) => !n.read).length}
              </p>
            </div>
          </div>
        </div>

        {/* Orders and Notifications Split View */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Recent Orders List */}
          <div className="lg:col-span-7 bg-[#0B0B0B] border border-[#1E1E1E] rounded-3xl p-6 sm:p-8">
            <div className="flex items-center justify-between mb-6 pb-4 border-b border-[#1A1A1A]">
              <h2 className="text-lg font-black text-white flex items-center gap-2">
                <ShoppingBag className="w-5 h-5 text-[#C8874B]" />
                <span>{t('userDashboard.recentOrders')}</span>
              </h2>
              <button
                onClick={() => setCurrentTab('store')}
                className="text-xs text-[#C8874B] font-bold hover:underline"
              >
                تسوّق الآن
              </button>
            </div>

            {orders.length === 0 ? (
              <p className="text-xs text-[#666] text-center py-10">لا توجد طلبات سابقة حتى الآن.</p>
            ) : (
              <div className="space-y-3">
                {orders.map((ord) => (
                  <div
                    key={ord.id}
                    className="p-4 rounded-xl bg-[#111] border border-[#1C1C1C] flex items-center justify-between"
                  >
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs font-mono font-bold text-[#C8874B]">
                          #{ord.orderNumber}
                        </span>
                        <span className="text-xs font-bold text-white">{ord.productName}</span>
                      </div>
                      <span className="text-[11px] text-[#777]">
                        {new Date(ord.createdAt).toLocaleDateString(language === 'ar' ? 'ar-SA' : 'en-US')}
                      </span>
                    </div>

                    <div className="text-right rtl:text-left">
                      <p className="text-sm font-black text-white">${ord.price} USD</p>
                      <span className="inline-block px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                        {ord.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Notifications List */}
          <div className="lg:col-span-5 bg-[#0B0B0B] border border-[#1E1E1E] rounded-3xl p-6 sm:p-8">
            <div className="flex items-center justify-between mb-6 pb-4 border-b border-[#1A1A1A]">
              <h2 className="text-lg font-black text-white flex items-center gap-2">
                <Bell className="w-5 h-5 text-[#C8874B]" />
                <span>{t('userDashboard.notifications')}</span>
              </h2>
              <span className="text-xs text-[#666]">{notifications.length} إشعار</span>
            </div>

            {notifications.length === 0 ? (
              <p className="text-xs text-[#666] text-center py-10">لا توجد إشعارات حالياً.</p>
            ) : (
              <div className="space-y-3">
                {notifications.map((notif) => (
                  <div
                    key={notif.id}
                    className={`p-4 rounded-xl border transition-all ${
                      notif.read
                        ? 'bg-[#101010] border-[#1C1C1C] opacity-70'
                        : 'bg-[#151515] border-[#C8874B]/30'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <h4 className="text-xs font-bold text-white">{notif.title}</h4>
                      {!notif.read && (
                        <button
                          onClick={() => handleMarkRead(notif.id)}
                          className="text-[10px] text-[#C8874B] hover:underline flex items-center gap-1"
                        >
                          <Check className="w-3 h-3" />
                          <span>تحديد كمقروء</span>
                        </button>
                      )}
                    </div>
                    <p className="text-xs text-[#888] leading-relaxed mb-2">{notif.message}</p>
                    <span className="text-[10px] text-[#555] block">
                      {new Date(notif.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>

      </div>
    </div>
  );
};

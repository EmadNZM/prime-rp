import React, { useState, useEffect } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { useAuth } from '../../context/AuthContext';
import { apiClient } from '../../services/apiClient';
import { OrderItem, NotificationItem, TicketItem, JobApplication } from '../../types';
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
  ArrowLeft,
  Briefcase,
  Eye,
  X,
  FileCheck,
  AlertCircle
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
  const [jobApplications, setJobApplications] = useState<JobApplication[]>([]);
  const [selectedApplication, setSelectedApplication] = useState<JobApplication | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    async function loadUserData() {
      try {
        const [ord, tkt, notif, apps] = await Promise.all([
          apiClient.getOrders(),
          apiClient.getTickets(),
          apiClient.getNotifications(),
          apiClient.getMyJobApplications()
        ]);
        if (Array.isArray(ord)) setOrders(ord);
        if (Array.isArray(tkt)) setTickets(tkt);
        if (Array.isArray(notif)) setNotifications(notif);
        if (Array.isArray(apps)) setJobApplications(apps);
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
                  <span>
                    {language === 'ar' ? 'انضم:' : 'Joined:'}{' '}
                    {new Date(user.createdAt).toLocaleDateString(language === 'ar' ? 'ar-SA' : 'en-US')}
                  </span>
                </span>
                <span className="flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                  <span>{language === 'ar' ? 'الحالة:' : 'Status:'} {user.status}</span>
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3 relative z-10">
            <button
              onClick={() => setCurrentTab('jobs')}
              className="px-4 py-2.5 rounded-xl bg-[#C8874B] hover:brightness-110 text-black font-extrabold text-xs transition-all shadow-md shadow-[#C8874B]/20 flex items-center gap-1.5"
            >
              <Briefcase className="w-3.5 h-3.5" />
              <span>{language === 'ar' ? 'تقديم على وظيفة' : 'Apply for Job'}</span>
            </button>
            <button
              onClick={() => setCurrentTab('support')}
              className="px-4 py-2.5 rounded-xl bg-[#141414] hover:bg-[#202020] text-white border border-[#2B2B2B] text-xs font-bold transition-all"
            >
              {language === 'ar' ? 'فتح تذكرة' : 'Open Ticket'}
            </button>
          </div>
        </div>

        {/* Quick Metrics */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-6">
          <div className="p-6 rounded-2xl bg-[#0B0B0B] border border-[#1A1A1A] flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-[#C8874B]/10 border border-[#C8874B]/20 flex items-center justify-center text-[#C8874B]">
              <Briefcase className="w-6 h-6" />
            </div>
            <div>
              <span className="text-xs text-[#777] block">
                {language === 'ar' ? 'طلبات التوظيف' : 'Job Applications'}
              </span>
              <p className="text-2xl font-black text-white">{jobApplications.length}</p>
            </div>
          </div>

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
            <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
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

        {/* My Job Applications Section */}
        <div className="bg-[#0B0B0B] border border-[#1E1E1E] rounded-3xl p-6 sm:p-8">
          <div className="flex items-center justify-between mb-6 pb-4 border-b border-[#1A1A1A]">
            <div>
              <h2 className="text-lg font-black text-white flex items-center gap-2">
                <Briefcase className="w-5 h-5 text-[#C8874B]" />
                <span>
                  {language === 'ar' ? 'طلبات التوظيف الخاصة بي' : 'My Job Applications'}
                </span>
              </h2>
              <p className="text-xs text-[#777] mt-0.5">
                {language === 'ar'
                  ? 'متابعة حالة ترشيحك وانضمامك للقطاعات الحكومية والخاصة في Prime RP'
                  : 'Track your application status and enrollment in public & private sectors in Prime RP'}
              </p>
            </div>
            <button
              onClick={() => setCurrentTab('jobs')}
              className="text-xs text-[#C8874B] font-bold hover:underline flex items-center gap-1"
            >
              <span>{language === 'ar' ? 'استعراض الوظائف الشاغرة' : 'Browse Open Jobs'}</span>
              <ArrowIcon className="w-3.5 h-3.5" />
            </button>
          </div>

          {jobApplications.length === 0 ? (
            <div className="text-center py-12 px-4 rounded-2xl bg-[#0E0E0E] border border-dashed border-[#222]">
              <Briefcase className="w-10 h-10 text-[#444] mx-auto mb-3" />
              <p className="text-sm font-bold text-white mb-1">
                {language === 'ar' ? 'لم تقم بتقديم أي طلب توظيف حتى الآن' : 'No job applications submitted yet'}
              </p>
              <p className="text-xs text-[#777] max-w-sm mx-auto mb-4">
                {language === 'ar'
                  ? 'تصفح القطاعات المتاحة مثل الشرطة، الإسعاف، الميكانيكا أو الشركات وقدم طلبك مباشرة.'
                  : 'Explore available departments such as Police, EMS, Mechanics, or Businesses and submit your application directly.'}
              </p>
              <button
                onClick={() => setCurrentTab('jobs')}
                className="px-5 py-2.5 rounded-xl bg-[#C8874B] text-black font-extrabold text-xs hover:brightness-110 transition-all"
              >
                {language === 'ar' ? 'تصفح وتقديم الآن' : 'Browse & Apply Now'}
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {jobApplications.map((app) => {
                const statusStyles = {
                  ACCEPTED: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
                  UNDER_REVIEW: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
                  REJECTED: 'bg-red-500/10 text-red-400 border-red-500/20',
                  PENDING: 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                }[app.status] || 'bg-gray-500/10 text-gray-400 border-gray-500/20';

                const statusLabels = {
                  ACCEPTED: language === 'ar' ? 'تم القبول (ACCEPTED)' : 'ACCEPTED',
                  UNDER_REVIEW: language === 'ar' ? 'قيد التدقيق (UNDER REVIEW)' : 'UNDER REVIEW',
                  REJECTED: language === 'ar' ? 'مرفوض (REJECTED)' : 'REJECTED',
                  PENDING: language === 'ar' ? 'قيد الانتظار (PENDING)' : 'PENDING'
                }[app.status] || app.status;

                return (
                  <div
                    key={app.id}
                    className="p-5 rounded-2xl bg-[#111] border border-[#1E1E1E] hover:border-[#333] transition-all flex flex-col justify-between space-y-4"
                  >
                    <div>
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <div>
                          <span className="text-[10px] font-extrabold uppercase tracking-widest text-[#C8874B] block">
                            {app.jobCategory || (language === 'ar' ? 'القطاع' : 'Department')}
                          </span>
                          <h3 className="text-base font-bold text-white">
                            {app.jobTitle || (language === 'ar' ? 'طلب توظيف' : 'Job Application')}
                          </h3>
                        </div>
                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold border ${statusStyles}`}>
                          {statusLabels}
                        </span>
                      </div>

                      <div className="grid grid-cols-2 gap-2 text-xs text-[#888] py-2 border-y border-[#1A1A1A] my-2">
                        <div>
                          <span className="block text-[10px] text-[#555]">
                            {language === 'ar' ? 'الشخصية:' : 'Character:'}
                          </span>
                          <span className="text-white font-bold">
                            {app.characterName} ({app.characterAge} {language === 'ar' ? 'سنة' : 'yrs'})
                          </span>
                        </div>
                        <div>
                          <span className="block text-[10px] text-[#555]">
                            {language === 'ar' ? 'التواجد اليومي:' : 'Daily Availability:'}
                          </span>
                          <span className="text-white font-bold">{app.dailyAvailability}</span>
                        </div>
                      </div>

                      {app.reviewNotes && (
                        <div className="mt-2 p-2.5 rounded-xl bg-[#181818] border border-[#222] text-xs">
                          <span className="font-bold text-[#C8874B] block mb-0.5">
                            {language === 'ar' ? 'ملاحظات لجنة التوظيف:' : 'Recruitment Review Notes:'}
                          </span>
                          <span className="text-[#AAA] leading-relaxed">{app.reviewNotes}</span>
                        </div>
                      )}
                    </div>

                    <div className="flex items-center justify-between pt-2">
                      <span className="text-[11px] text-[#666]">
                        {new Date(app.createdAt).toLocaleDateString(language === 'ar' ? 'ar-SA' : 'en-US')}
                      </span>
                      <button
                        onClick={() => setSelectedApplication(app)}
                        className="px-3.5 py-1.5 rounded-lg bg-[#1C1C1C] hover:bg-[#252525] text-xs font-bold text-white transition-all flex items-center gap-1.5"
                      >
                        <Eye className="w-3.5 h-3.5 text-[#C8874B]" />
                        <span>{language === 'ar' ? 'تفاصيل الاستمارة' : 'View Application'}</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
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
                {language === 'ar' ? 'تسوّق الآن' : 'Shop Now'}
              </button>
            </div>

            {orders.length === 0 ? (
              <p className="text-xs text-[#666] text-center py-10">
                {language === 'ar' ? 'لا توجد طلبات سابقة حتى الآن.' : 'No previous orders found.'}
              </p>
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
              <span className="text-xs text-[#666]">
                {notifications.length} {language === 'ar' ? 'إشعار' : 'Notifications'}
              </span>
            </div>

            {notifications.length === 0 ? (
              <p className="text-xs text-[#666] text-center py-10">
                {language === 'ar' ? 'لا توجد إشعارات حالياً.' : 'No notifications yet.'}
              </p>
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
                          <span>{language === 'ar' ? 'تحديد كمقروء' : 'Mark Read'}</span>
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

        {/* Application Details Modal */}
        {selectedApplication && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto">
            <div className="relative w-full max-w-xl bg-[#0E0E0E] border border-[#222] rounded-3xl p-6 sm:p-8 shadow-2xl my-8 text-right rtl:text-right ltr:text-left">
              <button
                onClick={() => setSelectedApplication(null)}
                className="absolute top-5 left-5 rtl:left-5 rtl:right-auto p-2 rounded-xl bg-[#1A1A1A] hover:bg-[#2A2A2A] text-[#888] hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="mb-6 pb-4 border-b border-[#1C1C1C]">
                <span className="text-[10px] font-extrabold uppercase tracking-widest text-[#C8874B] block mb-1">
                  {language === 'ar' ? 'تفاصيل استمارة التوظيف' : 'Job Application Details'}
                </span>
                <h3 className="text-xl font-black text-white">
                  {selectedApplication.jobTitle || (language === 'ar' ? 'وظيفة في السيرفر' : 'Server Job Position')}
                </h3>
                <p className="text-xs text-[#777]">
                  {language === 'ar' ? 'المرجع:' : 'Ref ID:'} {selectedApplication.id}
                </p>
              </div>

              <div className="space-y-4 text-xs">
                <div className="p-4 rounded-xl bg-[#141414] border border-[#1E1E1E] space-y-2">
                  <div className="flex justify-between">
                    <span className="text-[#777]">{language === 'ar' ? 'اسم الشخصية:' : 'Character Name:'}</span>
                    <span className="text-white font-bold">{selectedApplication.characterName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#777]">{language === 'ar' ? 'عمر الشخصية:' : 'Character Age:'}</span>
                    <span className="text-white font-bold">{selectedApplication.characterAge} {language === 'ar' ? 'عاماً' : 'years'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#777]">{language === 'ar' ? 'التواجد اليومي:' : 'Daily Availability:'}</span>
                    <span className="text-white font-bold">{selectedApplication.dailyAvailability}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#777]">{language === 'ar' ? 'تاريخ التقديم:' : 'Applied Date:'}</span>
                    <span className="text-white font-bold">
                      {new Date(selectedApplication.createdAt).toLocaleString(language === 'ar' ? 'ar-SA' : 'en-US')}
                    </span>
                  </div>
                </div>

                <div>
                  <h4 className="font-bold text-[#C8874B] mb-1">
                    {language === 'ar' ? 'الخبرات والنبذة المقدمة:' : 'Experience & Summary:'}
                  </h4>
                  <p className="p-3.5 rounded-xl bg-[#141414] border border-[#1E1E1E] text-[#BBB] leading-relaxed whitespace-pre-wrap">
                    {selectedApplication.experience}
                  </p>
                </div>

                {selectedApplication.answers && Object.keys(selectedApplication.answers).length > 0 && (
                  <div>
                    <h4 className="font-bold text-[#C8874B] mb-1">
                      {language === 'ar' ? 'إجابات سيناريوهات الـ RP:' : 'RP Scenario Answers:'}
                    </h4>
                    <div className="p-3.5 rounded-xl bg-[#141414] border border-[#1E1E1E] text-[#BBB] space-y-2">
                      {Object.entries(selectedApplication.answers).map(([key, val]) => (
                        <div key={key}>
                          <span className="text-[10px] text-[#777] block">{key}:</span>
                          <p className="text-white">{String(val)}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {selectedApplication.reviewNotes && (
                  <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-200">
                    <span className="font-bold block mb-1">
                      {language === 'ar' ? 'ملاحظة مسؤولي التوظيف:' : 'Recruiter Feedback:'}
                    </span>
                    <p className="text-xs">{selectedApplication.reviewNotes}</p>
                  </div>
                )}
              </div>

              <div className="pt-6 mt-6 border-t border-[#1C1C1C] flex justify-end">
                <button
                  onClick={() => setSelectedApplication(null)}
                  className="px-6 py-2.5 rounded-xl bg-[#1F1F1F] text-white font-bold text-xs hover:bg-[#2A2A2A] transition-all"
                >
                  {language === 'ar' ? 'إغلاق' : 'Close'}
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

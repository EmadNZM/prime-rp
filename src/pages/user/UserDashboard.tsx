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
    <div className="min-h-screen bg-[#08090d] text-[#f1f3f7] pt-32 pb-28 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Background ambient lighting */}
      <div className="absolute top-10 left-1/2 -translate-x-1/2 w-full max-w-6xl h-[500px] bg-[#c8874b]/5 blur-[160px] pointer-events-none rounded-full" />

      <div className="max-w-6xl mx-auto space-y-8 relative z-10">
        
        {/* Section Header with Poster Identity */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-2">
          <div>
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#c8874b]/10 text-[#df9f64] text-xs font-black mb-3 uppercase tracking-widest border border-[#c8874b]/20 font-rajdhani">
              <ShieldCheck className="w-3.5 h-3.5 text-[#c8874b]" />
              <span>{language === 'ar' ? 'لوحة التحكم • نظيفة واحترافية' : 'DASHBOARD • CLEAN & PROFESSIONAL'}</span>
            </div>
            <h1 className="text-3xl sm:text-5xl font-black text-white uppercase tracking-tight font-rajdhani">
              {language === 'ar' ? `مرحباً بعودتك، ${user.globalName || user.username}` : `Welcome Back, ${user.globalName || user.username}`}
            </h1>
            <p className="text-xs sm:text-sm text-[#969cad] mt-1.5 max-w-xl">
              {language === 'ar' 
                ? 'إدارة متكاملة لحسابك، ومتابعة فواتير المتجر، وطلبات التوظيف، وتذاكر الدعم الفني، ومزامنة الصلاحيات.' 
                : 'Manage your citizen profile, job applications, official store invoices, support tickets, and permission synchronizations.'}
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setCurrentTab('jobs')}
              className="px-5 py-2.5 rounded-xl bg-[#c8874b] hover:bg-[#df9f64] text-black font-black text-xs uppercase tracking-wider transition-all shadow-lg shadow-[#c8874b]/20 flex items-center gap-1.5 cursor-pointer"
            >
              <Briefcase className="w-3.5 h-3.5" />
              <span>{language === 'ar' ? 'تقديم على وظيفة' : 'Apply for Job'}</span>
            </button>
            <button
              onClick={() => setCurrentTab('support')}
              className="px-5 py-2.5 rounded-xl bg-[#131620] hover:bg-[#1a1e2d] text-white border border-white/[0.08] text-xs font-bold uppercase tracking-wider transition-all cursor-pointer"
            >
              {language === 'ar' ? 'فتح تذكرة' : 'Open Ticket'}
            </button>
          </div>
        </div>

        {/* CITIZEN DOSSIER & IN-GAME INTEGRATION STATUS */}
        <div className="rounded-3xl bg-[#0d0f16] border border-white/[0.09] p-6 sm:p-8 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-1/4 w-80 h-80 bg-[#c8874b]/10 rounded-full blur-[100px] pointer-events-none" />
          
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 relative z-10">
            
            {/* Citizen Identity Profile (4 Cols) */}
            <div className="lg:col-span-4 p-6 rounded-2xl bg-[#08090d] border border-white/[0.06] flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-4 mb-5">
                  <div className="relative">
                    <img
                      src={user.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=120'}
                      alt={user.username}
                      className="w-16 h-16 rounded-2xl object-cover border-2 border-[#c8874b] shadow-xl p-0.5 bg-[#131620]"
                    />
                    <span className="absolute -bottom-1 -right-1 rtl:right-auto rtl:-left-1 w-4 h-4 rounded-full bg-emerald-500 border-2 border-[#08090d]" />
                  </div>
                  <div>
                    <span className="text-[10px] text-[#A1A1A1] uppercase font-bold tracking-wider">
                      {language === 'ar' ? 'ملف المواطن:' : 'CITIZEN PROFILE'}
                    </span>
                    <h3 className="text-lg font-black text-white font-rajdhani">
                      {user.globalName || user.username}
                    </h3>
                    <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded bg-[#c8874b]/15 text-[#df9f64] text-[10px] font-black uppercase tracking-wider mt-1 border border-[#c8874b]/30">
                      <ShieldCheck className="w-2.5 h-2.5" />
                      <span>{language === 'ar' ? `حساب معتمد • ${user.role}` : `VERIFIED • ${user.role}`}</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-2.5 text-xs pt-4 border-t border-white/[0.06]">
                  <div className="flex items-center justify-between">
                    <span className="text-[#666]">{language === 'ar' ? 'اسم المستخدم:' : 'Username:'}</span>
                    <span className="text-white font-bold">{user.username}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-[#666]">{language === 'ar' ? 'معرف ديسكورد:' : 'Discord ID:'}</span>
                    <span className="text-[#df9f64] font-mono text-[11px]">{user.discordId}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-[#666]">{language === 'ar' ? 'تاريخ التسجيل:' : 'Registered:'}</span>
                    <span className="text-white font-bold">{new Date(user.createdAt).toLocaleDateString(language === 'ar' ? 'ar-SA' : 'en-US')}</span>
                  </div>
                </div>
              </div>

              <div className="pt-6 mt-6 border-t border-white/[0.06] flex items-center justify-between">
                <div className="text-[11px] text-emerald-400 font-bold flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  <span>{language === 'ar' ? 'مصادقة Discord نشطة' : 'Discord Auth Active'}</span>
                </div>
                <span className="text-[10px] text-[#7a8091] font-mono">ROLE: {user.role}</span>
              </div>
            </div>

            {/* In-Game Character & Economy Integration Status (8 Cols) */}
            <div className="lg:col-span-8 space-y-6">
              
              {/* In-Game Character Sync Info Notice */}
              <div className="p-4 rounded-2xl bg-[#08090d] border border-white/[0.06]">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <FileCheck className="w-4 h-4 text-[#c8874b]" />
                    <span className="text-xs font-bold uppercase tracking-wider text-white font-rajdhani">
                      {language === 'ar' ? 'ربط بيانات السيرفر والشخصية' : 'IN-GAME CHARACTER & ECONOMY STATUS'}
                    </span>
                  </div>
                  <span className="px-2 py-0.5 rounded bg-amber-500/10 text-amber-400 text-[10px] font-bold border border-amber-500/20">
                    {language === 'ar' ? 'في انتظار الربط داخل اللعبة' : 'PENDING IN-GAME LINK'}
                  </span>
                </div>
                <p className="text-xs text-[#969cad] leading-relaxed">
                  {language === 'ar'
                    ? 'يتم عرض أرصدة البنك وتراخيص الشخصية وسجلات المركبات تلقائياً بعد دخولك سيرفر FiveM وربط حسابك عبر الأمر المخصص داخل اللعبة.'
                    : 'In-game balances, Department of Justice licenses, and vehicle telemetry populate automatically once linked inside the FiveM server.'}
                </p>
              </div>

              {/* Economy & Records Grid (Accurately Labeled as Unlinked / Pending Server Sync) */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                
                <div className="p-5 rounded-2xl bg-[#08090d] border border-white/[0.06]">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs text-[#7a8091] font-bold uppercase">{language === 'ar' ? 'الرصيد البنكي' : 'Bank Balance'}</span>
                    <ShoppingBag className="w-4 h-4 text-[#555]" />
                  </div>
                  <div className="text-2xl font-black text-[#666] font-rajdhani">—</div>
                  <span className="text-[10px] text-[#7a8091] block mt-1">
                    {language === 'ar' ? 'يتطلب دخول السيرفر' : 'Requires In-Game Link'}
                  </span>
                </div>

                <div className="p-5 rounded-2xl bg-[#08090d] border border-white/[0.06]">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs text-[#7a8091] font-bold uppercase">{language === 'ar' ? 'السيولة النقدية' : 'Cash on Hand'}</span>
                    <Briefcase className="w-4 h-4 text-[#555]" />
                  </div>
                  <div className="text-2xl font-black text-[#666] font-rajdhani">—</div>
                  <span className="text-[10px] text-[#7a8091] block mt-1">
                    {language === 'ar' ? 'غير متصل حالياً' : 'Not Connected'}
                  </span>
                </div>

                <div className="p-5 rounded-2xl bg-[#08090d] border border-white/[0.06]">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs text-[#7a8091] font-bold uppercase">{language === 'ar' ? 'التراخيص الرسمية' : 'Permits & Licenses'}</span>
                    <ShieldCheck className="w-4 h-4 text-[#555]" />
                  </div>
                  <div className="text-2xl font-black text-[#666] font-rajdhani">—</div>
                  <span className="text-[10px] text-[#7a8091] block mt-1">
                    {language === 'ar' ? 'في انتظار مزامنة DOJ' : 'Pending DOJ Sync'}
                  </span>
                </div>

              </div>

            </div>

          </div>
        </div>

        {/* Quick Metrics */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 sm:gap-6">
          <div className="p-6 rounded-2xl bg-[#0d0f16] border border-white/[0.08] flex items-center gap-4 shadow-xl card-hover-lift">
            <div className="w-12 h-12 rounded-xl bg-[#c8874b]/10 border border-[#c8874b]/30 flex items-center justify-center text-[#df9f64]">
              <Briefcase className="w-6 h-6" />
            </div>
            <div>
              <span className="text-xs text-[#7a8091] block font-bold uppercase tracking-wider">
                {language === 'ar' ? 'طلبات التوظيف' : 'Job Applications'}
              </span>
              <p className="text-2xl font-black text-white font-rajdhani">{jobApplications.length}</p>
            </div>
          </div>

          <div className="p-6 rounded-2xl bg-[#0d0f16] border border-white/[0.08] flex items-center gap-4 shadow-xl card-hover-lift">
            <div className="w-12 h-12 rounded-xl bg-sky-500/10 border border-sky-500/20 flex items-center justify-center text-sky-400">
              <Ticket className="w-6 h-6" />
            </div>
            <div>
              <span className="text-xs text-[#7a8091] block font-bold uppercase tracking-wider">{t('userDashboard.openTickets')}</span>
              <p className="text-2xl font-black text-white font-rajdhani">{tickets.length}</p>
            </div>
          </div>

          <div className="p-6 rounded-2xl bg-[#0d0f16] border border-white/[0.08] flex items-center gap-4 shadow-xl card-hover-lift">
            <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
              <ShoppingBag className="w-6 h-6" />
            </div>
            <div>
              <span className="text-xs text-[#7a8091] block font-bold uppercase tracking-wider">{t('userDashboard.totalOrders')}</span>
              <p className="text-2xl font-black text-white font-rajdhani">{orders.length}</p>
            </div>
          </div>

          <div className="p-6 rounded-2xl bg-[#0d0f16] border border-white/[0.08] flex items-center gap-4 shadow-xl card-hover-lift">
            <div className="w-12 h-12 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
              <Bell className="w-6 h-6" />
            </div>
            <div>
              <span className="text-xs text-[#7a8091] block font-bold uppercase tracking-wider">{t('userDashboard.notifications')}</span>
              <p className="text-2xl font-black text-white font-rajdhani">
                {notifications.filter((n) => !n.read).length}
              </p>
            </div>
          </div>
        </div>

        {/* My Job Applications Section */}
        <div className="bg-[#0d0f16] border border-white/[0.08] rounded-2xl p-6 sm:p-8 shadow-2xl">
          <div className="flex items-center justify-between mb-6 pb-4 border-b border-white/[0.06]">
            <div>
              <h2 className="text-lg font-black text-white flex items-center gap-2 uppercase tracking-tight font-rajdhani">
                <Briefcase className="w-5 h-5 text-[#c8874b]" />
                <span>
                  {language === 'ar' ? 'طلبات التوظيف الخاصة بي' : 'My Job Applications'}
                </span>
              </h2>
              <p className="text-xs text-[#7a8091] mt-0.5">
                {language === 'ar'
                  ? 'متابعة حالة ترشيحك وانضمامك للقطاعات الحكومية والخاصة في Prime RP'
                  : 'Track your application status and enrollment in public & private sectors in Prime RP'}
              </p>
            </div>
            <button
              onClick={() => setCurrentTab('jobs')}
              className="text-xs text-[#df9f64] font-bold hover:text-white transition-colors flex items-center gap-1 cursor-pointer"
            >
              <span>{language === 'ar' ? 'استعراض الوظائف الشاغرة' : 'Browse Open Jobs'}</span>
              <ArrowIcon className="w-3.5 h-3.5" />
            </button>
          </div>

          {jobApplications.length === 0 ? (
            <div className="text-center py-12 px-4 rounded-2xl bg-[#08090d] border border-dashed border-white/[0.08]">
              <Briefcase className="w-10 h-10 text-[#444] mx-auto mb-3" />
              <p className="text-sm font-black text-white mb-1 uppercase tracking-wider">
                {language === 'ar' ? 'لم تقم بتقديم أي طلب توظيف حتى الآن' : 'No job applications submitted yet'}
              </p>
              <p className="text-xs text-[#7a8091] max-w-sm mx-auto mb-4 leading-relaxed">
                {language === 'ar'
                  ? 'تصفح القطاعات المتاحة مثل الشرطة، الإسعاف، الميكانيكا أو الشركات وقدم طلبك مباشرة.'
                  : 'Explore available departments such as Police, EMS, Mechanics, or Businesses and submit your application directly.'}
              </p>
              <button
                onClick={() => setCurrentTab('jobs')}
                className="px-6 py-2.5 rounded-xl bg-[#c8874b] hover:bg-[#df9f64] text-black font-black text-xs uppercase tracking-wider transition-all cursor-pointer shadow-md"
              >
                {language === 'ar' ? 'تصفح وتقديم الآن' : 'Browse & Apply Now'}
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {jobApplications.map((app) => {
                const statusStyles = {
                  ACCEPTED: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
                  UNDER_REVIEW: 'bg-sky-500/10 text-sky-400 border-sky-500/20',
                  REJECTED: 'bg-rose-500/10 text-rose-400 border-rose-500/20',
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
                    className="p-5 rounded-2xl bg-[#08090d] border border-white/[0.08] hover:border-[#c8874b]/40 transition-all flex flex-col justify-between space-y-4 shadow-sm"
                  >
                    <div>
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <div>
                          <span className="text-[10px] font-black uppercase tracking-widest text-[#df9f64] block font-mono">
                            {app.jobCategory || (language === 'ar' ? 'القطاع' : 'Department')}
                          </span>
                          <h3 className="text-base font-bold text-white mt-0.5">
                            {app.jobTitle || (language === 'ar' ? 'طلب توظيف' : 'Job Application')}
                          </h3>
                        </div>
                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-black border ${statusStyles}`}>
                          {statusLabels}
                        </span>
                      </div>

                      <div className="grid grid-cols-2 gap-2 text-xs text-[#7a8091] py-2.5 border-y border-white/[0.06] my-2">
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
                        <div className="mt-2 p-3 rounded-xl bg-[#0d0f16] border border-white/[0.06] text-xs">
                          <span className="font-bold text-[#df9f64] block mb-0.5">
                            {language === 'ar' ? 'ملاحظات لجنة التوظيف:' : 'Recruitment Review Notes:'}
                          </span>
                          <span className="text-[#969cad] leading-relaxed">{app.reviewNotes}</span>
                        </div>
                      )}
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t border-white/[0.06]">
                      <span className="text-[11px] text-[#7a8091] font-mono">
                        {new Date(app.createdAt).toLocaleDateString(language === 'ar' ? 'ar-SA' : 'en-US')}
                      </span>
                      <button
                        onClick={() => setSelectedApplication(app)}
                        className="px-4 py-2 rounded-xl bg-[#131620] hover:bg-[#1a1e2d] text-xs font-bold text-white transition-all flex items-center gap-1.5 cursor-pointer border border-white/[0.08]"
                      >
                        <Eye className="w-3.5 h-3.5 text-[#c8874b]" />
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
          <div className="lg:col-span-7 bg-[#0d0f16] border border-white/[0.08] rounded-2xl p-6 sm:p-8 shadow-2xl">
            <div className="flex items-center justify-between mb-6 pb-4 border-b border-white/[0.06]">
              <h2 className="text-lg font-black text-white flex items-center gap-2 uppercase tracking-tight font-rajdhani">
                <ShoppingBag className="w-5 h-5 text-[#c8874b]" />
                <span>{t('userDashboard.recentOrders')}</span>
              </h2>
              <button
                onClick={() => setCurrentTab('store')}
                className="text-xs text-[#df9f64] font-bold hover:text-white transition-colors cursor-pointer"
              >
                {language === 'ar' ? 'تسوّق الآن' : 'Shop Now'}
              </button>
            </div>

            {orders.length === 0 ? (
              <p className="text-xs text-[#7a8091] text-center py-10">
                {language === 'ar' ? 'لا توجد طلبات سابقة حتى الآن.' : 'No previous orders found.'}
              </p>
            ) : (
              <div className="space-y-3">
                {orders.map((ord) => (
                  <div
                    key={ord.id}
                    className="p-4 rounded-xl bg-[#08090d] border border-white/[0.06] flex items-center justify-between shadow-sm"
                  >
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs font-mono font-bold text-[#df9f64]">
                          #{ord.orderNumber}
                        </span>
                        <span className="text-xs font-bold text-white">{ord.productName}</span>
                      </div>
                      <span className="text-[11px] text-[#7a8091] font-mono">
                        {new Date(ord.createdAt).toLocaleDateString(language === 'ar' ? 'ar-SA' : 'en-US')}
                      </span>
                    </div>

                    <div className="text-right rtl:text-left">
                      <p className="text-sm font-black text-white font-rajdhani">${ord.price} USD</p>
                      <span className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                        {ord.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Notifications List */}
          <div className="lg:col-span-5 bg-[#0d0f16] border border-white/[0.08] rounded-2xl p-6 sm:p-8 shadow-2xl">
            <div className="flex items-center justify-between mb-6 pb-4 border-b border-white/[0.06]">
              <h2 className="text-lg font-black text-white flex items-center gap-2 uppercase tracking-tight font-rajdhani">
                <Bell className="w-5 h-5 text-[#c8874b]" />
                <span>{t('userDashboard.notifications')}</span>
              </h2>
              <span className="text-xs text-[#7a8091] font-mono">
                {notifications.length} {language === 'ar' ? 'إشعار' : 'Notifications'}
              </span>
            </div>

            {notifications.length === 0 ? (
              <p className="text-xs text-[#7a8091] text-center py-10">
                {language === 'ar' ? 'لا توجد إشعارات حالياً.' : 'No notifications yet.'}
              </p>
            ) : (
              <div className="space-y-3">
                {notifications.map((notif) => (
                  <div
                    key={notif.id}
                    className={`p-4 rounded-xl border transition-all ${
                      notif.read
                        ? 'bg-[#08090d] border-white/[0.04] opacity-70'
                        : 'bg-[#131620] border-[#c8874b]/30'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <h4 className="text-xs font-bold text-white">{notif.title}</h4>
                      {!notif.read && (
                        <button
                          onClick={() => handleMarkRead(notif.id)}
                          className="text-[10px] text-[#df9f64] hover:underline flex items-center gap-1 cursor-pointer"
                        >
                          <Check className="w-3 h-3" />
                          <span>{language === 'ar' ? 'تحديد كمقروء' : 'Mark Read'}</span>
                        </button>
                      )}
                    </div>
                    <p className="text-xs text-[#969cad] leading-relaxed mb-2">{notif.message}</p>
                    <span className="text-[10px] text-[#7a8091] block font-mono">
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
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md overflow-y-auto">
            <div className="relative w-full max-w-xl bg-[#0d0f16] border border-white/[0.08] rounded-2xl p-6 sm:p-8 shadow-2xl my-8 text-right rtl:text-right ltr:text-left">
              <button
                onClick={() => setSelectedApplication(null)}
                className="absolute top-5 left-5 rtl:left-5 rtl:right-auto p-2 rounded-xl bg-[#131620] hover:bg-[#1a1e2d] text-[#969cad] hover:text-white transition-colors border border-white/[0.08] cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>

              <div className="mb-6 pb-4 border-b border-white/[0.06]">
                <span className="text-[10px] font-black uppercase tracking-widest text-[#df9f64] block mb-1 font-mono">
                  {language === 'ar' ? 'تفاصيل استمارة التوظيف' : 'Job Application Details'}
                </span>
                <h3 className="text-xl font-black text-white uppercase tracking-tight">
                  {selectedApplication.jobTitle || (language === 'ar' ? 'وظيفة في السيرفر' : 'Server Job Position')}
                </h3>
                <p className="text-xs text-[#7a8091] font-mono mt-0.5">
                  {language === 'ar' ? 'المرجع:' : 'Ref ID:'} {selectedApplication.id}
                </p>
              </div>

              <div className="space-y-4 text-xs">
                <div className="p-4 rounded-xl bg-[#08090d] border border-white/[0.06] space-y-2">
                  <div className="flex justify-between">
                    <span className="text-[#7a8091]">{language === 'ar' ? 'اسم الشخصية:' : 'Character Name:'}</span>
                    <span className="text-white font-bold">{selectedApplication.characterName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#7a8091]">{language === 'ar' ? 'عمر الشخصية:' : 'Character Age:'}</span>
                    <span className="text-white font-bold">{selectedApplication.characterAge} {language === 'ar' ? 'عاماً' : 'years'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#7a8091]">{language === 'ar' ? 'التواجد اليومي:' : 'Daily Availability:'}</span>
                    <span className="text-white font-bold">{selectedApplication.dailyAvailability}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#7a8091]">{language === 'ar' ? 'تاريخ التقديم:' : 'Applied Date:'}</span>
                    <span className="text-white font-bold font-mono">
                      {new Date(selectedApplication.createdAt).toLocaleString(language === 'ar' ? 'ar-SA' : 'en-US')}
                    </span>
                  </div>
                </div>

                <div>
                  <h4 className="font-bold text-[#df9f64] mb-1">
                    {language === 'ar' ? 'الخبرات والنبذة المقدمة:' : 'Experience & Summary:'}
                  </h4>
                  <p className="p-4 rounded-xl bg-[#08090d] border border-white/[0.06] text-[#d1d5db] leading-relaxed whitespace-pre-wrap">
                    {selectedApplication.experience}
                  </p>
                </div>

                {selectedApplication.answers && Object.keys(selectedApplication.answers).length > 0 && (
                  <div>
                    <h4 className="font-bold text-[#df9f64] mb-1">
                      {language === 'ar' ? 'إجابات سيناريوهات الـ RP:' : 'RP Scenario Answers:'}
                    </h4>
                    <div className="p-4 rounded-xl bg-[#08090d] border border-white/[0.06] text-[#d1d5db] space-y-2">
                      {Object.entries(selectedApplication.answers).map(([key, val]) => (
                        <div key={key}>
                          <span className="text-[10px] text-[#7a8091] block">{key}:</span>
                          <p className="text-white">{String(val)}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {selectedApplication.reviewNotes && (
                  <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-200">
                    <span className="font-bold block mb-1">
                      {language === 'ar' ? 'ملاحظة مسؤولي التوظيف:' : 'Recruiter Feedback:'}
                    </span>
                    <p className="text-xs">{selectedApplication.reviewNotes}</p>
                  </div>
                )}
              </div>

              <div className="pt-6 mt-6 border-t border-white/[0.06] flex justify-end">
                <button
                  onClick={() => setSelectedApplication(null)}
                  className="px-6 py-2.5 rounded-xl bg-[#131620] text-white font-bold text-xs hover:bg-[#1a1e2d] transition-all border border-white/[0.08] cursor-pointer"
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

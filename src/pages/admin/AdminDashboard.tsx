import React, { useState, useEffect } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { useAuth } from '../../context/AuthContext';
import { apiClient } from '../../services/apiClient';
import { 
  User, 
  UserRole, 
  UserStatus, 
  NewsItem, 
  RuleCategory, 
  JobItem, 
  ProductItem, 
  OrderItem, 
  TicketItem, 
  AuditLogItem, 
  SiteSettings 
} from '../../types';
import { 
  LayoutDashboard, 
  Users, 
  Newspaper, 
  BookOpen, 
  Briefcase, 
  ShoppingBag, 
  Ticket, 
  FileText, 
  Settings, 
  ShieldCheck, 
  Plus, 
  Trash2, 
  Edit3, 
  Check, 
  AlertTriangle, 
  Search, 
  Send,
  Lock
} from 'lucide-react';

interface AdminDashboardProps {
  setCurrentTab: (tab: string) => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ setCurrentTab }) => {
  const { t, language } = useLanguage();
  const { user, isStaff, isAdmin } = useAuth();

  const [activeAdminTab, setActiveAdminTab] = useState<
    'overview' | 'users' | 'news' | 'rules' | 'jobs' | 'store' | 'tickets' | 'audit' | 'settings'
  >('overview');

  const [overviewMetrics, setOverviewMetrics] = useState<any>(null);
  const [usersList, setUsersList] = useState<User[]>([]);
  const [newsList, setNewsList] = useState<NewsItem[]>([]);
  const [rulesList, setRulesList] = useState<RuleCategory[]>([]);
  const [jobsList, setJobsList] = useState<JobItem[]>([]);
  const [productsList, setProductsList] = useState<ProductItem[]>([]);
  const [ticketsList, setTicketsList] = useState<TicketItem[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLogItem[]>([]);
  const [settings, setSettings] = useState<SiteSettings | null>(null);

  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [notificationMsg, setNotificationMsg] = useState<string | null>(null);

  // Modals & Form states
  const [showNewsModal, setShowNewsModal] = useState<boolean>(false);
  const [newsForm, setNewsForm] = useState<any>({
    slug: '',
    category: 'تحديثات',
    image: 'https://images.unsplash.com/photo-1511512578047-dfb367046420?w=800',
    featured: false,
    status: 'PUBLISHED',
    translations: {
      ar: { title: '', excerpt: '', content: '' },
      en: { title: '', excerpt: '', content: '' }
    }
  });

  // Ticket reply in admin
  const [selectedAdminTicket, setSelectedAdminTicket] = useState<TicketItem | null>(null);
  const [staffReplyText, setStaffReplyText] = useState<string>('');

  useEffect(() => {
    loadAllAdminData();
  }, [activeAdminTab]);

  async function loadAllAdminData() {
    setIsLoading(true);
    try {
      if (activeAdminTab === 'overview') {
        const data = await apiClient.getAdminOverview();
        setOverviewMetrics(data.metrics);
        setAuditLogs(data.recentAuditLogs || []);
      } else if (activeAdminTab === 'users') {
        const data = await apiClient.getAdminUsers();
        if (Array.isArray(data)) setUsersList(data);
      } else if (activeAdminTab === 'news') {
        const data = await apiClient.getAdminNews();
        if (Array.isArray(data)) setNewsList(data);
      } else if (activeAdminTab === 'rules') {
        const data = await apiClient.getRules();
        if (Array.isArray(data)) setRulesList(data);
      } else if (activeAdminTab === 'jobs') {
        const data = await apiClient.getJobs();
        if (Array.isArray(data)) setJobsList(data);
      } else if (activeAdminTab === 'store') {
        const data = await apiClient.getProducts();
        if (Array.isArray(data)) setProductsList(data);
      } else if (activeAdminTab === 'tickets') {
        const data = await apiClient.getTickets();
        if (Array.isArray(data)) {
          setTicketsList(data);
          if (data.length > 0 && !selectedAdminTicket) setSelectedAdminTicket(data[0]);
        }
      } else if (activeAdminTab === 'audit') {
        const data = await apiClient.getAuditLogs();
        if (Array.isArray(data)) setAuditLogs(data);
      } else if (activeAdminTab === 'settings') {
        const data = await apiClient.getSiteSettings();
        setSettings(data);
      }
    } catch (err) {
      console.error('Failed to load admin data:', err);
    } finally {
      setIsLoading(false);
    }
  }

  const showToast = (msg: string) => {
    setNotificationMsg(msg);
    setTimeout(() => setNotificationMsg(null), 3500);
  };

  // User role/status handlers
  const handleUpdateRole = async (userId: string, role: string) => {
    await apiClient.updateUserRole(userId, role);
    setUsersList(usersList.map((u) => (u.id === userId ? { ...u, role: role as any } : u)));
    showToast('تم تحديث رتبة المستخدم بنجاح');
  };

  const handleUpdateStatus = async (userId: string, status: string) => {
    await apiClient.updateUserStatus(userId, status);
    setUsersList(usersList.map((u) => (u.id === userId ? { ...u, status: status as any } : u)));
    showToast('تم تحديث حالة المستخدم بنجاح');
  };

  // News CMS handlers
  const handleSaveNews = async (e: React.FormEvent) => {
    e.preventDefault();
    const saved = await apiClient.saveNewsCMS(newsForm);
    if (saved) {
      setShowNewsModal(false);
      setNewsList([saved, ...newsList.filter((n) => n.id !== saved.id)]);
      showToast('تم حفظ المقال الإخباري ونشره');
    }
  };

  const handleDeleteNews = async (id: string) => {
    if (window.confirm('هل أنت متأكد من رغبتك في حذف هذا المقال نهائياً؟')) {
      await apiClient.deleteNewsCMS(id);
      setNewsList(newsList.filter((n) => n.id !== id));
      showToast('تم حذف المقال');
    }
  };

  // Staff ticket reply
  const handleStaffReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAdminTicket || !staffReplyText.trim()) return;

    const updated = await apiClient.sendTicketMessage(selectedAdminTicket.id, staffReplyText.trim());
    if (updated) {
      setSelectedAdminTicket(updated);
      setTicketsList(ticketsList.map((t) => (t.id === updated.id ? updated : t)));
      setStaffReplyText('');
      showToast('تم إرسال رد الإدارة إلى التذكرة');
    }
  };

  const handleStaffTicketStatus = async (status: string) => {
    if (!selectedAdminTicket) return;
    const updated = await apiClient.updateTicketStatus(selectedAdminTicket.id, status);
    if (updated) {
      setSelectedAdminTicket(updated);
      setTicketsList(ticketsList.map((t) => (t.id === updated.id ? updated : t)));
      showToast(`تم تغيير حالة التذكرة إلى ${status}`);
    }
  };

  // Settings Save
  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!settings) return;
    await apiClient.updateSettings(settings);
    showToast('تم حفظ إعدادات المنصة بنجاح');
  };

  if (!isStaff) {
    return (
      <div className="min-h-screen bg-[#070707] text-[#E5E5E5] pt-32 text-center">
        <Lock className="w-12 h-12 text-red-500 mx-auto mb-4" />
        <h2 className="text-2xl font-black mb-2">منطقة محظورة / Restricted Area</h2>
        <p className="text-sm text-[#888] mb-6">يتطلب الدخول امتلاك رتبة إدارية أو إشرافية معتمدة.</p>
        <button onClick={() => setCurrentTab('home')} className="px-6 py-2.5 rounded-xl bg-[#C8874B] text-black font-bold">
          العودة للرئيسية
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#070707] text-[#E5E5E5] pt-24 pb-20 px-4 sm:px-6 lg:px-8">
      
      {/* Toast Notification */}
      {notificationMsg && (
        <div className="fixed bottom-6 right-6 rtl:right-auto rtl:left-6 z-50 px-5 py-3 rounded-2xl bg-[#C8874B] text-black font-bold text-xs shadow-2xl flex items-center gap-2 animate-in fade-in slide-in-from-bottom-4">
          <Check className="w-4 h-4" />
          <span>{notificationMsg}</span>
        </div>
      )}

      <div className="max-w-7xl mx-auto">
        
        {/* Admin Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 pb-6 border-b border-[#1C1C1C]">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#C8874B]/20 text-[#C8874B] text-xs font-bold mb-2 border border-[#C8874B]/30">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Staff Administration Suite</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white">
              {t('admin.title')}
            </h1>
            <p className="text-xs text-[#888]">
              تسجيل الدخول الحالي: <span className="text-white font-semibold">{user?.globalName || user?.username}</span> ({user?.role})
            </p>
          </div>

          <button
            onClick={() => setCurrentTab('home')}
            className="px-4 py-2 rounded-xl bg-[#141414] hover:bg-[#202020] border border-[#2B2B2B] text-xs font-bold text-white transition-all self-start sm:self-auto"
          >
            العودة للموقع
          </button>
        </div>

        {/* Horizontal Navigation Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-4 mb-8 border-b border-[#181818]">
          {[
            { id: 'overview', label: t('admin.overview'), icon: LayoutDashboard },
            { id: 'users', label: t('admin.users'), icon: Users },
            { id: 'news', label: t('admin.news'), icon: Newspaper },
            { id: 'rules', label: t('admin.rules'), icon: BookOpen },
            { id: 'jobs', label: t('admin.jobs'), icon: Briefcase },
            { id: 'store', label: t('admin.store'), icon: ShoppingBag },
            { id: 'tickets', label: t('admin.tickets'), icon: Ticket },
            { id: 'audit', label: t('admin.auditLogs'), icon: FileText },
            { id: 'settings', label: t('admin.settings'), icon: Settings }
          ].map((item) => {
            const Icon = item.icon;
            const active = activeAdminTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveAdminTab(item.id as any)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                  active
                    ? 'bg-[#C8874B] text-black shadow-md shadow-[#C8874B]/20'
                    : 'bg-[#101010] text-[#888] hover:text-white hover:bg-[#181818] border border-[#202020]'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>

        {/* TAB 1: OVERVIEW */}
        {activeAdminTab === 'overview' && (
          <div className="space-y-8">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <div className="p-6 rounded-2xl bg-[#0B0B0B] border border-[#1C1C1C]">
                <span className="text-xs text-[#777] block mb-1">المستخدمين المسجلين</span>
                <p className="text-3xl font-black text-white">{overviewMetrics?.totalUsers || 0}</p>
              </div>
              <div className="p-6 rounded-2xl bg-[#0B0B0B] border border-[#1C1C1C]">
                <span className="text-xs text-[#777] block mb-1">التذاكر المفتوحة</span>
                <p className="text-3xl font-black text-amber-400">{overviewMetrics?.openTickets || 0}</p>
              </div>
              <div className="p-6 rounded-2xl bg-[#0B0B0B] border border-[#1C1C1C]">
                <span className="text-xs text-[#777] block mb-1">إجمالي المبيعات والاشتراكات</span>
                <p className="text-3xl font-black text-emerald-400">${overviewMetrics?.totalRevenue || 0} USD</p>
              </div>
              <div className="p-6 rounded-2xl bg-[#0B0B0B] border border-[#1C1C1C]">
                <span className="text-xs text-[#777] block mb-1">المقالات الإخبارية</span>
                <p className="text-3xl font-black text-white">{overviewMetrics?.totalNews || 0}</p>
              </div>
            </div>

            {/* Recent Audit Trail Preview */}
            <div className="rounded-3xl bg-[#0B0B0B] border border-[#1C1C1C] p-6">
              <h3 className="text-base font-black text-white mb-4">آخر سجلات الأنشطة الإدارية (Audit Trail)</h3>
              <div className="space-y-2 text-xs">
                {auditLogs.slice(0, 5).map((log) => (
                  <div key={log.id} className="p-3 rounded-xl bg-[#111] border border-[#1C1C1C] flex items-center justify-between">
                    <div>
                      <span className="font-bold text-[#C8874B] mr-2 rtl:mr-0 rtl:ml-2">{log.adminName}</span>
                      <span className="text-white font-mono bg-[#1E1E1E] px-2 py-0.5 rounded text-[10px] mr-2 rtl:mr-0 rtl:ml-2">
                        {log.action}
                      </span>
                      <span className="text-[#888]">{log.metadata}</span>
                    </div>
                    <span className="text-[#666] text-[10px]">
                      {new Date(log.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: USERS MANAGEMENT */}
        {activeAdminTab === 'users' && (
          <div className="bg-[#0B0B0B] border border-[#1C1C1C] rounded-3xl p-6 sm:p-8">
            <h3 className="text-xl font-black text-white mb-6">إدارة حسابات المواطنين والرتب</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left rtl:text-right">
                <thead className="text-[#777] uppercase border-b border-[#1C1C1C]">
                  <tr>
                    <th className="pb-3">المواطن</th>
                    <th className="pb-3">معرّف ديسكورد</th>
                    <th className="pb-3">الرتبة</th>
                    <th className="pb-3">الحالة</th>
                    <th className="pb-3">الإجراءات</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#1A1A1A]">
                  {usersList.map((usr) => (
                    <tr key={usr.id} className="hover:bg-white/[0.01]">
                      <td className="py-4">
                        <div className="flex items-center gap-3">
                          <img src={usr.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=60'} alt="" className="w-8 h-8 rounded-full" />
                          <div>
                            <p className="font-bold text-white">{usr.globalName || usr.username}</p>
                            <span className="text-[10px] text-[#666]">@{usr.username}</span>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 font-mono text-[#888]">{usr.discordId}</td>
                      <td className="py-4">
                        <select
                          value={usr.role}
                          onChange={(e) => handleUpdateRole(usr.id, e.target.value)}
                          className="bg-[#141414] border border-[#282828] rounded-lg px-2.5 py-1 text-white text-[11px] focus:outline-none focus:border-[#C8874B]"
                        >
                          <option value="SUPER_ADMIN">👑 Super Admin</option>
                          <option value="ADMIN">🛡️ Admin</option>
                          <option value="MODERATOR">⚖️ Moderator</option>
                          <option value="SUPPORT">🎧 Support</option>
                          <option value="CITIZEN">👤 Citizen</option>
                        </select>
                      </td>
                      <td className="py-4">
                        <select
                          value={usr.status}
                          onChange={(e) => handleUpdateStatus(usr.id, e.target.value)}
                          className={`border rounded-lg px-2.5 py-1 text-[11px] font-bold focus:outline-none ${
                            usr.status === 'ACTIVE'
                              ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                              : 'bg-red-500/10 text-red-400 border-red-500/30'
                          }`}
                        >
                          <option value="ACTIVE">ACTIVE</option>
                          <option value="SUSPENDED">SUSPENDED</option>
                          <option value="BANNED">BANNED</option>
                        </select>
                      </td>
                      <td className="py-4 text-[#666]">
                        {new Date(usr.createdAt).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 3: NEWS CMS */}
        {activeAdminTab === 'news' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-black text-white">نظام إدارة المحتوى الإخباري (News CMS)</h3>
              <button
                onClick={() => {
                  setNewsForm({
                    slug: `announcement-${Date.now().toString().slice(-4)}`,
                    category: 'تحديثات',
                    image: 'https://images.unsplash.com/photo-1511512578047-dfb367046420?w=800',
                    featured: true,
                    status: 'PUBLISHED',
                    translations: {
                      ar: { title: '', excerpt: '', content: '' },
                      en: { title: '', excerpt: '', content: '' }
                    }
                  });
                  setShowNewsModal(true);
                }}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#C8874B] text-black text-xs font-bold"
              >
                <Plus className="w-4 h-4" />
                <span>إضافة خبر جديد</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {newsList.map((item) => (
                <div key={item.id} className="p-5 rounded-2xl bg-[#0B0B0B] border border-[#1E1E1E] flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <span className="px-2.5 py-0.5 rounded text-[10px] font-bold bg-[#C8874B]/20 text-[#C8874B]">
                        {item.category}
                      </span>
                      <span className="text-xs text-[#777]">{item.status}</span>
                    </div>
                    <h4 className="text-base font-bold text-white mb-2">{item.translations.ar.title}</h4>
                    <p className="text-xs text-[#888] line-clamp-2 mb-4">{item.translations.ar.excerpt}</p>
                  </div>
                  <div className="flex items-center justify-end gap-2 border-t border-[#1C1C1C] pt-3">
                    <button
                      onClick={() => handleDeleteNews(item.id)}
                      className="p-2 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 text-xs"
                      title="حذف"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 7: SUPPORT TICKETS DESK */}
        {activeAdminTab === 'tickets' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            <div className="lg:col-span-4 space-y-3">
              <h4 className="text-xs font-bold text-[#777] uppercase tracking-wider mb-2">الوارد المباشر للتذاكر</h4>
              {ticketsList.map((tkt) => (
                <button
                  key={tkt.id}
                  onClick={() => setSelectedAdminTicket(tkt)}
                  className={`w-full text-left rtl:text-right p-4 rounded-2xl border transition-all ${
                    selectedAdminTicket?.id === tkt.id
                      ? 'bg-[#151515] border-[#C8874B]'
                      : 'bg-[#0B0B0B] border-[#1C1C1C]'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-mono font-bold text-[#C8874B]">#{tkt.ticketNumber}</span>
                    <span className="text-[10px] text-[#777]">{tkt.status}</span>
                  </div>
                  <p className="text-sm font-bold text-white truncate">{tkt.subject}</p>
                  <p className="text-xs text-[#777]">من: {tkt.userName}</p>
                </button>
              ))}
            </div>

            <div className="lg:col-span-8 bg-[#0B0B0B] border border-[#1E1E1E] rounded-3xl p-6 flex flex-col justify-between min-h-[500px]">
              {selectedAdminTicket ? (
                <>
                  <div>
                    <div className="flex items-center justify-between pb-4 mb-4 border-b border-[#1A1A1A]">
                      <div>
                        <span className="text-xs font-mono text-[#C8874B]">#{selectedAdminTicket.ticketNumber}</span>
                        <h3 className="text-lg font-black text-white">{selectedAdminTicket.subject}</h3>
                        <span className="text-xs text-[#888]">المواطن: {selectedAdminTicket.userName}</span>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleStaffTicketStatus('RESOLVED')}
                          className="px-3 py-1.5 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs font-bold"
                        >
                          تم الحل
                        </button>
                        <button
                          onClick={() => handleStaffTicketStatus('CLOSED')}
                          className="px-3 py-1.5 rounded-lg bg-[#222] text-[#888] hover:text-white text-xs font-bold"
                        >
                          إغلاق
                        </button>
                      </div>
                    </div>

                    {/* Messages */}
                    <div className="space-y-3 max-h-80 overflow-y-auto mb-6">
                      {selectedAdminTicket.messages.map((m) => (
                        <div key={m.id} className={`p-4 rounded-xl text-xs ${m.isStaff ? 'bg-[#161616] border border-[#C8874B]/30' : 'bg-[#101010] border border-[#222]'}`}>
                          <div className="flex justify-between mb-1 font-bold text-[#AAA]">
                            <span>{m.senderName} {m.isStaff ? '(طاقم الإدارة)' : ''}</span>
                            <span className="text-[10px] text-[#555]">{new Date(m.createdAt).toLocaleTimeString()}</span>
                          </div>
                          <p className="text-white leading-relaxed">{m.message}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  <form onSubmit={handleStaffReply} className="border-t border-[#1A1A1A] pt-4 flex gap-2">
                    <input
                      type="text"
                      value={staffReplyText}
                      onChange={(e) => setStaffReplyText(e.target.value)}
                      placeholder="اكتب رد طاقم الإدارة الرسمي..."
                      className="flex-1 bg-[#111] border border-[#2B2B2B] rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-[#C8874B]"
                    />
                    <button type="submit" className="px-5 py-2.5 rounded-xl bg-[#C8874B] text-black font-extrabold text-xs">
                      إرسال الرد
                    </button>
                  </form>
                </>
              ) : (
                <div className="text-center py-20 text-[#666]">اختر تذكرة لمراجعتها</div>
              )}
            </div>
          </div>
        )}

        {/* TAB 8: AUDIT LOGS */}
        {activeAdminTab === 'audit' && (
          <div className="bg-[#0B0B0B] border border-[#1C1C1C] rounded-3xl p-6 sm:p-8">
            <h3 className="text-xl font-black text-white mb-6">سجل الرقابة والأمان (Audit Trail)</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left rtl:text-right">
                <thead className="text-[#777] uppercase border-b border-[#1C1C1C]">
                  <tr>
                    <th className="pb-3">الوقت</th>
                    <th className="pb-3">الإداري</th>
                    <th className="pb-3">نوع الإجراء</th>
                    <th className="pb-3">الكيان</th>
                    <th className="pb-3">التفاصيل</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#1A1A1A]">
                  {auditLogs.map((log) => (
                    <tr key={log.id} className="hover:bg-white/[0.01]">
                      <td className="py-3 font-mono text-[#666]">
                        {new Date(log.createdAt).toLocaleString()}
                      </td>
                      <td className="py-3 font-bold text-[#C8874B]">{log.adminName}</td>
                      <td className="py-3">
                        <span className="px-2 py-0.5 rounded bg-[#181818] font-mono text-[10px] text-white">
                          {log.action}
                        </span>
                      </td>
                      <td className="py-3 text-[#AAA]">{log.entity}</td>
                      <td className="py-3 text-[#888]">{log.metadata}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 9: SETTINGS */}
        {activeAdminTab === 'settings' && settings && (
          <div className="bg-[#0B0B0B] border border-[#1C1C1C] rounded-3xl p-6 sm:p-8 max-w-2xl mx-auto">
            <h3 className="text-xl font-black text-white mb-6">إعدادات المنصة والسيرفر</h3>
            <form onSubmit={handleSaveSettings} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-[#AAA] mb-1">اسم السيرفر</label>
                <input
                  type="text"
                  value={settings.serverName}
                  onChange={(e) => setSettings({ ...settings, serverName: e.target.value })}
                  className="w-full bg-[#111] border border-[#2B2B2B] rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-[#C8874B]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#AAA] mb-1">رابط FiveM Connect</label>
                <input
                  type="text"
                  value={settings.fiveMConnectUrl}
                  onChange={(e) => setSettings({ ...settings, fiveMConnectUrl: e.target.value })}
                  className="w-full bg-[#111] border border-[#2B2B2B] rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-[#C8874B]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#AAA] mb-1">رابط دعوة سيرفر الديسكورد</label>
                <input
                  type="text"
                  value={settings.discordInviteUrl}
                  onChange={(e) => setSettings({ ...settings, discordInviteUrl: e.target.value })}
                  className="w-full bg-[#111] border border-[#2B2B2B] rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-[#C8874B]"
                />
              </div>

              <div className="flex items-center gap-3 pt-2">
                <input
                  type="checkbox"
                  id="maintMode"
                  checked={settings.maintenanceMode}
                  onChange={(e) => setSettings({ ...settings, maintenanceMode: e.target.checked })}
                  className="w-4 h-4 rounded text-[#C8874B] focus:ring-[#C8874B]"
                />
                <label htmlFor="maintMode" className="text-xs font-bold text-white cursor-pointer">
                  تفعيل وضع الصيانة (Maintenance Mode)
                </label>
              </div>

              <div className="pt-4">
                <button
                  type="submit"
                  className="w-full py-3 rounded-xl bg-[#C8874B] text-black font-extrabold text-xs hover:brightness-110"
                >
                  حفظ التغييرات
                </button>
              </div>
            </form>
          </div>
        )}

        {/* MODAL: ADD NEWS */}
        {showNewsModal && (
          <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-[#0B0B0B] border border-[#282828] rounded-3xl p-6 sm:p-8 max-w-xl w-full max-h-[90vh] overflow-y-auto">
              <h3 className="text-xl font-black text-white mb-4">إنشاء خبر جديد (Bilingual CMS)</h3>
              <form onSubmit={handleSaveNews} className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-[#AAA] mb-1">الرابط الدائم (Slug)</label>
                    <input
                      type="text"
                      required
                      value={newsForm.slug}
                      onChange={(e) => setNewsForm({ ...newsForm, slug: e.target.value })}
                      className="w-full bg-[#111] border border-[#222] rounded-xl p-2 text-xs text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-[#AAA] mb-1">القسم / التصنيف</label>
                    <input
                      type="text"
                      required
                      value={newsForm.category}
                      onChange={(e) => setNewsForm({ ...newsForm, category: e.target.value })}
                      className="w-full bg-[#111] border border-[#222] rounded-xl p-2 text-xs text-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-[#AAA] mb-1">رابط صورة الغلاف</label>
                  <input
                    type="text"
                    required
                    value={newsForm.image}
                    onChange={(e) => setNewsForm({ ...newsForm, image: e.target.value })}
                    className="w-full bg-[#111] border border-[#222] rounded-xl p-2 text-xs text-white"
                  />
                </div>

                {/* Arabic Fields */}
                <div className="p-4 rounded-2xl bg-[#121212] border border-[#222] space-y-3">
                  <h4 className="text-xs font-bold text-[#C8874B]">المحتوى بالعربية</h4>
                  <input
                    type="text"
                    required
                    placeholder="عنوان المقال بالعربية"
                    value={newsForm.translations.ar.title}
                    onChange={(e) =>
                      setNewsForm({
                        ...newsForm,
                        translations: {
                          ...newsForm.translations,
                          ar: { ...newsForm.translations.ar, title: e.target.value }
                        }
                      })
                    }
                    className="w-full bg-[#0B0B0B] border border-[#222] rounded-xl p-2 text-xs text-white"
                  />
                  <input
                    type="text"
                    placeholder="مقتطف قصير"
                    value={newsForm.translations.ar.excerpt}
                    onChange={(e) =>
                      setNewsForm({
                        ...newsForm,
                        translations: {
                          ...newsForm.translations,
                          ar: { ...newsForm.translations.ar, excerpt: e.target.value }
                        }
                      })
                    }
                    className="w-full bg-[#0B0B0B] border border-[#222] rounded-xl p-2 text-xs text-white"
                  />
                  <textarea
                    rows={3}
                    placeholder="نص المقال الكامل..."
                    value={newsForm.translations.ar.content}
                    onChange={(e) =>
                      setNewsForm({
                        ...newsForm,
                        translations: {
                          ...newsForm.translations,
                          ar: { ...newsForm.translations.ar, content: e.target.value }
                        }
                      })
                    }
                    className="w-full bg-[#0B0B0B] border border-[#222] rounded-xl p-2 text-xs text-white"
                  />
                </div>

                {/* English Fields */}
                <div className="p-4 rounded-2xl bg-[#121212] border border-[#222] space-y-3">
                  <h4 className="text-xs font-bold text-[#C8874B]">English Content</h4>
                  <input
                    type="text"
                    required
                    placeholder="English Article Title"
                    value={newsForm.translations.en.title}
                    onChange={(e) =>
                      setNewsForm({
                        ...newsForm,
                        translations: {
                          ...newsForm.translations,
                          en: { ...newsForm.translations.en, title: e.target.value }
                        }
                      })
                    }
                    className="w-full bg-[#0B0B0B] border border-[#222] rounded-xl p-2 text-xs text-white"
                  />
                  <textarea
                    rows={2}
                    placeholder="Full English Content..."
                    value={newsForm.translations.en.content}
                    onChange={(e) =>
                      setNewsForm({
                        ...newsForm,
                        translations: {
                          ...newsForm.translations,
                          en: { ...newsForm.translations.en, content: e.target.value }
                        }
                      })
                    }
                    className="w-full bg-[#0B0B0B] border border-[#222] rounded-xl p-2 text-xs text-white"
                  />
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t border-[#1C1C1C]">
                  <button
                    type="button"
                    onClick={() => setShowNewsModal(false)}
                    className="px-4 py-2 rounded-xl bg-[#1A1A1A] text-white text-xs font-bold"
                  >
                    إلغاء
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2 rounded-xl bg-[#C8874B] text-black text-xs font-extrabold"
                  >
                    حفظ ونشر
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

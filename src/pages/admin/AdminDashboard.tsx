import React, { useState, useEffect } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { useAuth } from '../../context/AuthContext';
import { useSettings } from '../../context/SettingsContext';
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
import { LogoManagerSettings } from '../../components/admin/LogoManagerSettings';
import { ReportsManager } from '../../components/admin/ReportsManager';
import { SocialLinksManager } from '../../components/admin/SocialLinksManager';
import { JobsManager } from '../../components/admin/JobsManager';
import { RolesPermissionsManager } from '../../components/admin/RolesPermissionsManager';
import { HomepageCMSManager } from '../../components/admin/HomepageCMSManager';
import { LeaderboardManager } from '../../components/admin/LeaderboardManager';
import { FAQManager } from '../../components/admin/FAQManager';
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
  Edit,
  Check, 
  AlertTriangle, 
  Lock,
  Crown,
  Sliders,
  Layout,
  Trophy,
  HelpCircle,
  Eye,
  RotateCcw
} from 'lucide-react';

interface AdminDashboardProps {
  setCurrentTab: (tab: string) => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ setCurrentTab }) => {
  const { t, language } = useLanguage();
  const { user, effectiveUser, isStaff, isOwner, hasPermission, previewRole, setPreviewRole } = useAuth();
  const { updateSettings: updateGlobalSettings } = useSettings();

  const [activeAdminTab, setActiveAdminTab] = useState<
    'overview' | 'roles' | 'homepage' | 'leaderboard' | 'faq' | 'users' | 'reports' | 'news' | 'rules' | 'jobs' | 'store' | 'tickets' | 'audit' | 'settings'
  >('overview');

  const [overviewMetrics, setOverviewMetrics] = useState<any>(null);
  const [usersList, setUsersList] = useState<User[]>([]);
  const [newsList, setNewsList] = useState<NewsItem[]>([]);
  const [rulesList, setRulesList] = useState<RuleCategory[]>([]);
  const [jobsList, setJobsList] = useState<JobItem[]>([]);
  const [productsList, setProductsList] = useState<ProductItem[]>([]);
  const [adminOrdersList, setAdminOrdersList] = useState<OrderItem[]>([]);
  const [storeSubTab, setStoreSubTab] = useState<'products' | 'orders'>('products');
  const [ticketsList, setTicketsList] = useState<TicketItem[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLogItem[]>([]);
  const [settings, setSettings] = useState<SiteSettings | null>(null);

  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [notificationMsg, setNotificationMsg] = useState<string | null>(null);

  // Role Assignment State
  const [assignIdentifier, setAssignIdentifier] = useState<string>('');
  const [assignRoleValue, setAssignRoleValue] = useState<string>('MODERATOR');
  const [isAssigningRole, setIsAssigningRole] = useState<boolean>(false);

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

  // Product CMS state
  const [showProductModal, setShowProductModal] = useState<boolean>(false);
  const [editingProduct, setEditingProduct] = useState<ProductItem | null>(null);
  const [productForm, setProductForm] = useState<any>({
    id: '',
    slug: '',
    category: 'VIP',
    price: 25,
    currency: 'USD',
    image: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=800',
    stock: 100,
    status: 'ACTIVE',
    featured: false,
    translations: {
      ar: { name: '', description: '', perks: [] },
      en: { name: '', description: '', perks: [] }
    }
  });

  // Rule Category CMS state
  const [showRuleModal, setShowRuleModal] = useState<boolean>(false);
  const [ruleCategoryForm, setRuleCategoryForm] = useState<any>({
    id: '',
    slug: '',
    order: 1,
    translations: {
      ar: { title: '', description: '', penaltyInfo: '' },
      en: { title: '', description: '', penaltyInfo: '' }
    },
    rules: []
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
        const [pData, oData] = await Promise.all([
          apiClient.getProducts(),
          apiClient.getAdminOrders().catch(() => [])
        ]);
        if (Array.isArray(pData)) setProductsList(pData);
        if (Array.isArray(oData)) setAdminOrdersList(oData);
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
    if (!isOwner) {
      showToast('تعديل الرتب متاح فقط لمالك السيرفر المعتمد');
      return;
    }
    try {
      const res = await apiClient.updateUserRole(userId, role);
      if (res && !res.error) {
        setUsersList(usersList.map((u) => (u.id === userId ? { ...u, role: role as any } : u)));
        showToast('تم تحديث رتبة المستخدم بنجاح');
      } else {
        showToast(res?.error || 'تعذر تحديث الرتبة');
      }
    } catch (err) {
      showToast('حدث خطأ أثناء تعديل الرتبة');
    }
  };

  const handleUpdateStatus = async (userId: string, status: string) => {
    try {
      const res = await apiClient.updateUserStatus(userId, status);
      if (res && !res.error) {
        setUsersList(usersList.map((u) => (u.id === userId ? { ...u, status: status as any } : u)));
        showToast('تم تحديث حالة المستخدم بنجاح');
      } else {
        showToast(res?.error || 'تعذر تحديث حالة الحساب');
      }
    } catch (err) {
      showToast('حدث خطأ أثناء تعديل حالة الحساب');
    }
  };

  const handleAssignRole = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!assignIdentifier.trim()) return;
    if (!isOwner) {
      showToast('صلاحية تعيين الرتب محصورة حصرياً بمالك السيرفر');
      return;
    }

    setIsAssigningRole(true);
    try {
      const res = await apiClient.assignUserRole(assignIdentifier.trim(), assignRoleValue);
      if (res && res.user) {
        showToast(`تم تعيين رتبة ${assignRoleValue} للمواطن ${assignIdentifier} بنجاح`);
        setAssignIdentifier('');
        const data = await apiClient.getAdminUsers();
        if (Array.isArray(data)) setUsersList(data);
      } else {
        showToast(res?.error || 'تعذر تعيين الرتبة');
      }
    } catch (err: any) {
      console.error(err);
      showToast('تعذر تعيين الرتبة، يرجى التحقق والمحاولة مجدداً');
    } finally {
      setIsAssigningRole(false);
    }
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

  // Product CMS handlers
  const openProductModal = (prod?: ProductItem) => {
    if (prod) {
      setEditingProduct(prod);
      setProductForm({
        id: prod.id,
        slug: prod.slug,
        category: prod.category || 'VIP',
        price: prod.price,
        currency: prod.currency || 'USD',
        image: prod.image,
        stock: prod.stock || 100,
        status: prod.status || 'ACTIVE',
        featured: !!prod.featured,
        translations: {
          ar: {
            name: prod.translations.ar?.name || '',
            description: prod.translations.ar?.description || '',
            perks: prod.translations.ar?.perks || []
          },
          en: {
            name: prod.translations.en?.name || '',
            description: prod.translations.en?.description || '',
            perks: prod.translations.en?.perks || []
          }
        }
      });
    } else {
      setEditingProduct(null);
      setProductForm({
        id: `prod_${Date.now()}`,
        slug: `prod-${Date.now().toString().slice(-4)}`,
        category: 'VIP',
        price: 20,
        currency: 'USD',
        image: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=800',
        stock: 50,
        status: 'ACTIVE',
        featured: false,
        translations: {
          ar: { name: '', description: '', perks: [] },
          en: { name: '', description: '', perks: [] }
        }
      });
    }
    setShowProductModal(true);
  };

  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const saved = await apiClient.saveProductCMS(productForm);
      if (saved) {
        setShowProductModal(false);
        setProductsList(prev => [saved, ...prev.filter(p => p.id !== saved.id)]);
        showToast('تم حفظ بيانات المنتج بالمتجر بنجاح');
      }
    } catch (err: any) {
      showToast(err.message || 'فشل حفظ المنتج');
    }
  };

  const handleDeleteProduct = async (id: string) => {
    if (!window.confirm('هل أنت متأكد من رغبتك في حذف هذا المنتج من المتجر؟')) return;
    try {
      await apiClient.deleteProductCMS(id);
      setProductsList(prev => prev.filter(p => p.id !== id));
      showToast('تم حذف المنتج من المتجر');
    } catch (err: any) {
      showToast(err.message || 'فشل حذف المنتج');
    }
  };

  const handleUpdateOrderStatus = async (orderId: string, newStatus: string) => {
    try {
      const updated = await apiClient.updateAdminOrderStatus(orderId, newStatus);
      if (updated) {
        setAdminOrdersList(prev => prev.map(o => o.id === orderId ? { ...o, status: newStatus } : o));
        showToast(language === 'ar' ? `تم تحديث حالة الطلب إلى ${newStatus}` : `Order status updated to ${newStatus}`);
      }
    } catch (err: any) {
      showToast(err.message || 'فشل تحديث حالة الطلب');
    }
  };

  // Rule Category CMS handlers
  const handleSaveRuleCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const saved = await apiClient.saveRuleCMS(ruleCategoryForm);
      if (saved) {
        setShowRuleModal(false);
        setRulesList(prev => [saved, ...prev.filter(r => r.id !== saved.id)]);
        showToast('تم حفظ قسم القوانين بنجاح');
      }
    } catch (err: any) {
      showToast(err.message || 'فشل حفظ قسم القوانين');
    }
  };

  const handleDeleteRuleCategory = async (id: string) => {
    if (!window.confirm('هل أنت متأكد من رغبتك في حذف قسم القوانين هذا؟')) return;
    try {
      await apiClient.deleteRuleCMS(id);
      setRulesList(prev => prev.filter(r => r.id !== id));
      showToast('تم حذف قسم القوانين');
    } catch (err: any) {
      showToast(err.message || 'فشل حذف قسم القوانين');
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
    try {
      const updated = await updateGlobalSettings(settings);
      setSettings(updated);
      showToast('تم حفظ إعدادات وشعارات المنصة بنجاح!');
    } catch (err) {
      console.error('Failed to save settings:', err);
      showToast('حدث خطأ أثناء حفظ الإعدادات');
    }
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
    <div className="min-h-screen bg-[#08090d] text-[#f1f3f7] pt-28 pb-24 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Ambient background glow */}
      <div className="absolute top-10 left-1/2 -translate-x-1/2 w-full max-w-6xl h-[500px] bg-[#c8874b]/5 blur-[160px] pointer-events-none rounded-full" />
      
      {/* Toast Notification */}
      {notificationMsg && (
        <div className="fixed bottom-6 right-6 rtl:right-auto rtl:left-6 z-50 px-5 py-3 rounded-xl bg-[#c8874b] text-black font-black text-xs uppercase tracking-wider shadow-2xl flex items-center gap-2 animate-in fade-in slide-in-from-bottom-4">
          <Check className="w-4 h-4" />
          <span>{notificationMsg}</span>
        </div>
      )}

      <div className="max-w-7xl mx-auto relative z-10">
        
        {/* Admin Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 pb-6 border-b border-white/[0.08]">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#c8874b]/15 text-[#df9f64] text-[10px] font-black uppercase tracking-wider mb-2 border border-[#c8874b]/30">
              <ShieldCheck className="w-3.5 h-3.5 text-[#c8874b]" />
              <span className="font-mono">Staff Administration Suite</span>
              {isOwner && (
                <span className="inline-flex items-center gap-1 bg-[#c8874b] text-black px-2 py-0.5 rounded-full text-[10px] font-black font-mono">
                  <Crown className="w-3 h-3" />
                  <span>Server Owner</span>
                </span>
              )}
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white uppercase tracking-tight font-rajdhani">
              {t('admin.title')}
            </h1>
            <p className="text-xs text-[#7a8091] mt-1">
              {language === 'ar' ? 'تسجيل الدخول الحالي:' : 'Current Session:'}{' '}
              <span className="text-white font-semibold">{user?.globalName || user?.username}</span> ({user?.role})
            </p>
          </div>

          <button
            onClick={() => setCurrentTab('home')}
            className="px-5 py-2.5 rounded-xl bg-[#131620] hover:bg-[#1a1e2d] border border-white/[0.08] hover:border-white/[0.15] text-xs font-bold uppercase tracking-wider text-white transition-all self-start sm:self-auto cursor-pointer"
          >
            {language === 'ar' ? 'العودة للموقع' : 'Back to Website'}
          </button>
        </div>

        {/* Role Preview Simulation Alert Banner */}
        {!import.meta.env.PROD && previewRole && (
          <div className="mb-6 p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs shadow-lg">
            <div className="flex items-center gap-2.5">
              <Eye className="w-5 h-5 text-amber-400 shrink-0" />
              <div>
                <span className="font-black text-amber-300">
                  {language === 'ar' ? 'وضع محاكاة الرتب نشط حالياً (بيئة التطوير):' : 'Active Role Preview Simulation (Dev Only):'}
                </span>{' '}
                <span className="text-white font-bold px-2 py-0.5 rounded bg-amber-500/20 border border-amber-500/30">
                  {effectiveUser?.role}
                </span>{' '}
                <span className="text-amber-200/70">
                  ({language === 'ar' ? `رتبتك الحقيقية: ${user?.role}` : `Your real role: ${user?.role}`})
                </span>
              </div>
            </div>
            <button
              onClick={() => setPreviewRole(null)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-black text-xs transition-all cursor-pointer shrink-0"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>{language === 'ar' ? 'إلغاء المحاكاة واستعادة الرتبة' : 'Exit Simulation'}</span>
            </button>
          </div>
        )}

        {/* Horizontal Navigation Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-4 mb-8 border-b border-white/[0.06]">
          {[
            { id: 'overview', label: t('admin.overview'), icon: LayoutDashboard, perm: null },
            { id: 'roles', label: language === 'ar' ? 'الرتب والصلاحيات' : 'Roles & RBAC', icon: Sliders, perm: 'manage_roles' },
            { id: 'homepage', label: language === 'ar' ? 'واجهة الموقع' : 'Homepage CMS', icon: Layout, perm: 'manage_homepage' },
            { id: 'leaderboard', label: language === 'ar' ? 'لوحة الشرف' : 'Leaderboard', icon: Trophy, perm: 'manage_leaderboard' },
            { id: 'faq', label: language === 'ar' ? 'الأسئلة الشائعة' : 'FAQ CMS', icon: HelpCircle, perm: 'manage_faq' },
            { id: 'users', label: t('admin.users'), icon: Users, perm: 'manage_users' },
            { id: 'reports', label: language === 'ar' ? 'البلاغات والشكاوى' : 'Reports & Violations', icon: AlertTriangle, perm: 'manage_reports' },
            { id: 'news', label: t('admin.news'), icon: Newspaper, perm: 'manage_news' },
            { id: 'rules', label: t('admin.rules'), icon: BookOpen, perm: 'manage_rules' },
            { id: 'jobs', label: t('admin.jobs'), icon: Briefcase, perm: 'manage_jobs' },
            { id: 'store', label: t('admin.store'), icon: ShoppingBag, perm: 'manage_store' },
            { id: 'tickets', label: t('admin.ticketsCMS') || t('admin.tickets'), icon: Ticket, perm: 'manage_tickets' },
            { id: 'audit', label: t('admin.auditLogs'), icon: FileText, perm: 'view_audit_logs' },
            { id: 'settings', label: t('admin.siteSettings') || t('admin.settings'), icon: Settings, perm: 'manage_settings' }
          ]
            .filter((item) => !item.perm || hasPermission(item.perm as any))
            .map((item) => {
              const Icon = item.icon;
              const active = activeAdminTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveAdminTab(item.id as any)}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                    active
                      ? 'bg-[#c8874b] text-black shadow-lg shadow-[#c8874b]/20 font-black uppercase tracking-wider'
                      : 'bg-[#0d0f16] text-[#969cad] hover:text-white hover:bg-[#131620] border border-white/[0.06]'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{item.label}</span>
                </button>
              );
            })}
        </div>

        {/* TAB: ROLES & PERMISSIONS MANAGER */}
        {activeAdminTab === 'roles' && hasPermission('manage_roles') && (
          <RolesPermissionsManager />
        )}

        {/* TAB: HOMEPAGE CMS MANAGER */}
        {activeAdminTab === 'homepage' && hasPermission('manage_homepage') && (
          <HomepageCMSManager />
        )}

        {/* TAB: LEADERBOARD CMS MANAGER */}
        {activeAdminTab === 'leaderboard' && hasPermission('manage_leaderboard') && (
          <LeaderboardManager />
        )}

        {/* TAB: FAQ CMS MANAGER */}
        {activeAdminTab === 'faq' && hasPermission('manage_faq') && (
          <FAQManager />
        )}

        {/* TAB 1: OVERVIEW */}
        {activeAdminTab === 'overview' && (
          <div className="space-y-8">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
              <div className="p-6 rounded-3xl bg-[#0D0D0F] border border-[#222226] shadow-xl">
                <span className="text-xs text-[#777] block mb-1 font-bold uppercase tracking-wider">
                  {language === 'ar' ? 'المستخدمين المسجلين' : 'Registered Citizens'}
                </span>
                <p className="text-3xl font-black text-white font-rajdhani">{overviewMetrics?.totalUsers || 0}</p>
              </div>
              <div className="p-6 rounded-3xl bg-[#0D0D0F] border border-[#222226] shadow-xl">
                <span className="text-xs text-[#777] block mb-1 font-bold uppercase tracking-wider">
                  {language === 'ar' ? 'التذاكر المفتوحة' : 'Open Tickets'}
                </span>
                <p className="text-3xl font-black text-amber-400 font-rajdhani">{overviewMetrics?.openTickets || 0}</p>
              </div>
              <div className="p-6 rounded-3xl bg-[#0D0D0F] border border-[#222226] shadow-xl">
                <span className="text-xs text-[#777] block mb-1 font-bold uppercase tracking-wider">
                  {language === 'ar' ? 'البلاغات المفتوحة' : 'Pending Reports'}
                </span>
                <p className="text-3xl font-black text-blue-400 font-rajdhani">{overviewMetrics?.openReports || 0}</p>
              </div>
              <div className="p-6 rounded-3xl bg-[#0D0D0F] border border-[#222226] shadow-xl">
                <span className="text-xs text-[#777] block mb-1 font-bold uppercase tracking-wider">
                  {language === 'ar' ? 'إجمالي المبيعات' : 'Total Revenue'}
                </span>
                <p className="text-3xl font-black text-emerald-400 font-rajdhani">${overviewMetrics?.totalRevenue || 0} USD</p>
              </div>
            </div>

            {/* Recent Audit Trail Preview */}
            <div className="rounded-3xl bg-[#0D0D0F] border border-[#222226] p-6 sm:p-8 shadow-2xl">
              <h3 className="text-base font-black text-white uppercase tracking-tight mb-4">
                {language === 'ar' ? 'آخر سجلات الأنشطة الإدارية (Audit Trail)' : 'Recent Administrative Audit Trail'}
              </h3>
              <div className="space-y-2.5 text-xs">
                {auditLogs.slice(0, 6).map((log) => (
                  <div key={log.id} className="p-3.5 rounded-2xl bg-[#151518] border border-[#222226] flex items-center justify-between">
                    <div>
                      <span className="font-bold text-[#DF9F64] mr-2 rtl:mr-0 rtl:ml-2">{log.adminName}</span>
                      <span className="text-white font-mono bg-[#222226] px-2.5 py-0.5 rounded-lg text-[10px] mr-2 rtl:mr-0 rtl:ml-2">
                        {log.action}
                      </span>
                      <span className="text-[#888]">{log.metadata}</span>
                    </div>
                    <span className="text-[#666] text-[10px] font-mono">
                      {new Date(log.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: USERS MANAGEMENT & ROLE ASSIGNMENT */}
        {activeAdminTab === 'users' && (
          <div className="space-y-6">
            {/* Role Assignment Form */}
            {isOwner ? (
              <div className="bg-[#0D0D0D] border border-[#222] rounded-3xl p-6 sm:p-7 shadow-lg">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4 pb-4 border-b border-[#1A1A1A]">
                  <div>
                    <h3 className="text-base font-bold text-white flex items-center gap-2">
                      <Crown className="w-5 h-5 text-[#C8874B]" />
                      <span>تعيين وترقية رتبة مواطن (صلاحية حصرية لمالك السيرفر)</span>
                    </h3>
                    <p className="text-xs text-[#888] mt-1">
                      يدخل المواطنون برتبة Citizen افتراضياً عند تسجيل الدخول عبر Discord. يمكنك ترقية أي مواطن عبر معرف الديسكورد أو اسم المستخدم.
                    </p>
                  </div>
                </div>

                <form onSubmit={handleAssignRole} className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-end">
                  <div className="sm:col-span-6">
                    <label className="block text-[11px] font-bold text-[#AAA] mb-1.5">
                      معرف ديسكورد أو اسم المستخدم (Discord ID / Username)
                    </label>
                    <input
                      type="text"
                      required
                      value={assignIdentifier}
                      onChange={(e) => setAssignIdentifier(e.target.value)}
                      placeholder="مثال: 947294829102948201 أو Tariq_RP"
                      className="w-full bg-[#141414] border border-[#2B2B2B] focus:border-[#C8874B] rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-[#555] focus:outline-none transition-colors"
                    />
                  </div>

                  <div className="sm:col-span-4">
                    <label className="block text-[11px] font-bold text-[#AAA] mb-1.5">
                      الرتبة الممنوحة
                    </label>
                    <select
                      value={assignRoleValue}
                      onChange={(e) => setAssignRoleValue(e.target.value)}
                      className="w-full bg-[#141414] border border-[#2B2B2B] focus:border-[#C8874B] rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none transition-colors"
                    >
                      <option value="ADMIN">🛡️ Admin (إدارة وسيرفر)</option>
                      <option value="MODERATOR">⚖️ Moderator (مشرف)</option>
                      <option value="SUPPORT">🎧 Support (دعم فني)</option>
                      <option value="EDITOR">✍️ Editor (محرر أخبار ومحتوى)</option>
                      <option value="STORE_MANAGER">🛍️ Store Manager (مدير المتجر)</option>
                      <option value="CITIZEN">👤 Citizen (مواطن عادي)</option>
                    </select>
                  </div>

                  <div className="sm:col-span-2">
                    <button
                      type="submit"
                      disabled={isAssigningRole}
                      className="w-full py-2.5 rounded-xl bg-[#C8874B] hover:bg-[#b0733a] text-black font-bold text-xs transition-all flex items-center justify-center gap-1.5 disabled:opacity-50"
                    >
                      <span>{isAssigningRole ? 'جاري الحفظ...' : 'تثبيت الرتبة'}</span>
                    </button>
                  </div>
                </form>
              </div>
            ) : (
              <div className="p-4 rounded-2xl bg-[#141414] border border-[#262626] text-xs text-[#AAA] flex items-center gap-3">
                <Lock className="w-5 h-5 text-[#C8874B] shrink-0" />
                <div>
                  <p className="font-bold text-white">إشعار صلاحيات الرتب</p>
                  <p className="text-[11px] text-[#888] mt-0.5">
                    تعيين وتعديل الرتب محصور حصرياً بمالك السيرفر المعتمد (Server Owner).
                  </p>
                </div>
              </div>
            )}

            <div className="bg-[#0B0B0B] border border-[#1C1C1C] rounded-3xl p-6 sm:p-8">
              <h3 className="text-xl font-black text-white mb-6">قائمة حسابات المواطنين والرتب</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left rtl:text-right">
                  <thead className="text-[#777] uppercase border-b border-[#1C1C1C]">
                    <tr>
                      <th className="pb-3">المواطن</th>
                      <th className="pb-3">معرّف ديسكورد</th>
                      <th className="pb-3">الرتبة</th>
                      <th className="pb-3">الحالة</th>
                      <th className="pb-3">تاريخ الانضمام</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#1A1A1A]">
                    {usersList.map((usr) => {
                      const userIsOwner = Boolean(usr.isOwner || usr.role === UserRole.OWNER);

                      return (
                        <tr key={usr.id} className="hover:bg-white/[0.01]">
                          <td className="py-4">
                            <div className="flex items-center gap-3">
                              <img
                                src={usr.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=60'}
                                alt=""
                                className="w-8 h-8 rounded-full border border-[#2B2B2B]"
                              />
                              <div>
                                <div className="flex items-center gap-1.5">
                                  <p className="font-bold text-white">{usr.globalName || usr.username}</p>
                                  {userIsOwner && (
                                    <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded bg-[#C8874B]/20 text-[#C8874B] text-[9px] font-black border border-[#C8874B]/40">
                                      <Crown className="w-2.5 h-2.5" />
                                      OWNER
                                    </span>
                                  )}
                                </div>
                                <span className="text-[10px] text-[#666]">@{usr.username}</span>
                              </div>
                            </div>
                          </td>
                          <td className="py-4 font-mono text-[#888]">{usr.discordId}</td>
                          <td className="py-4">
                            {userIsOwner ? (
                              <span className="font-bold text-[#C8874B] text-[11px]">Server Owner</span>
                            ) : (
                              <select
                                disabled={!isOwner}
                                value={usr.role}
                                onChange={(e) => handleUpdateRole(usr.id, e.target.value)}
                                className="bg-[#141414] border border-[#282828] rounded-lg px-2.5 py-1 text-white text-[11px] focus:outline-none focus:border-[#C8874B] disabled:opacity-60"
                              >
                                <option value="ADMIN">🛡️ Admin</option>
                                <option value="MODERATOR">⚖️ Moderator</option>
                                <option value="SUPPORT">🎧 Support</option>
                                <option value="EDITOR">✍️ Editor</option>
                                <option value="STORE_MANAGER">🛍️ Store Manager</option>
                                <option value="CITIZEN">👤 Citizen</option>
                              </select>
                            )}
                          </td>
                          <td className="py-4">
                            {userIsOwner ? (
                              <span className="text-emerald-400 font-bold text-[11px]">ACTIVE</span>
                            ) : (
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
                            )}
                          </td>
                          <td className="py-4 text-[#666]">
                            {new Date(usr.createdAt).toLocaleDateString()}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB: REPORTS CMS */}
        {activeAdminTab === 'reports' && (
          <ReportsManager showToast={showToast} />
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

        {/* TAB 4: RULES CMS */}
        {activeAdminTab === 'rules' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xl font-black text-white">دستور وقوانين السيرفر (Rules CMS)</h3>
                <p className="text-xs text-[#888] mt-1">استعراض وتحديث فئات القوانين الرسمية المنشورة للمواطنين</p>
              </div>
              <button
                onClick={() => {
                  setRuleCategoryForm({
                    id: `rule_cat_${Date.now()}`,
                    slug: `rules-${Date.now().toString().slice(-4)}`,
                    order: rulesList.length + 1,
                    translations: {
                      ar: { title: '', description: '', penaltyInfo: '' },
                      en: { title: '', description: '', penaltyInfo: '' }
                    },
                    rules: []
                  });
                  setShowRuleModal(true);
                }}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#C8874B] text-black text-xs font-bold hover:bg-[#b0733d] transition-all"
              >
                <Plus className="w-4 h-4" />
                <span>إضافة قسم قوانين جديد</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {rulesList.map((category) => (
                <div key={category.id} className="p-6 rounded-2xl bg-[#0B0B0B] border border-[#1E1E1E] space-y-4">
                  <div className="flex items-center justify-between border-b border-[#1A1A1A] pb-3">
                    <div>
                      <span className="text-[10px] font-extrabold uppercase text-[#C8874B] block">{category.icon}</span>
                      <h4 className="text-base font-bold text-white">{category.translations.ar?.title || category.id}</h4>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="px-2.5 py-0.5 rounded text-[10px] font-bold bg-[#141414] text-[#AAA] border border-[#222]">
                        {category.rules?.length || 0} قواعد
                      </span>
                      <button
                        onClick={() => handleDeleteRuleCategory(category.id)}
                        className="p-1.5 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-colors"
                        title="حذف هذا القسم"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
                    {category.rules && category.rules.length > 0 ? (
                      category.rules.map((r, idx) => (
                        <div key={idx} className="p-3 rounded-xl bg-[#111] border border-[#1C1C1C] text-xs space-y-1">
                          <span className="font-bold text-white block">#{r.order || idx + 1} {r.translations.ar?.title}</span>
                          <p className="text-[#888] text-[11px] leading-relaxed">{r.translations.ar?.description}</p>
                        </div>
                      ))
                    ) : (
                      <p className="text-xs text-[#666] py-3 text-center">لا توجد بنود فرعية بعد في هذا القسم</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 5: JOBS & APPLICATIONS RECRUITMENT SUITE */}
        {activeAdminTab === 'jobs' && (
          <JobsManager showToast={showToast} />
        )}

        {/* TAB 6: STORE & PACKAGES CMS */}
        {activeAdminTab === 'store' && (
          <div className="space-y-6">
            {/* Sub-tabs switch */}
            <div className="flex items-center justify-between border-b border-white/[0.08] pb-4">
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setStoreSubTab('products')}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    storeSubTab === 'products'
                      ? 'bg-[#c8874b] text-black shadow-lg shadow-[#c8874b]/20'
                      : 'bg-[#11131b] text-[#969cad] hover:text-white hover:bg-[#1a1e2d]'
                  }`}
                >
                  <ShoppingBag className="w-4 h-4" />
                  <span>{language === 'ar' ? 'المنتجات والباقات' : 'Products & Packages'}</span>
                  <span className="px-1.5 py-0.5 rounded-full text-[10px] bg-black/30 font-mono">
                    {productsList.length}
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => setStoreSubTab('orders')}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    storeSubTab === 'orders'
                      ? 'bg-[#c8874b] text-black shadow-lg shadow-[#c8874b]/20'
                      : 'bg-[#11131b] text-[#969cad] hover:text-white hover:bg-[#1a1e2d]'
                  }`}
                >
                  <FileText className="w-4 h-4" />
                  <span>{language === 'ar' ? 'سجل طلبات الشراء' : 'Customer Orders'}</span>
                  <span className="px-1.5 py-0.5 rounded-full text-[10px] bg-black/30 font-mono">
                    {adminOrdersList.length}
                  </span>
                </button>
              </div>

              {storeSubTab === 'products' && (
                <button
                  onClick={() => openProductModal()}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#c8874b] text-black text-xs font-bold hover:bg-[#df9f64] transition-all cursor-pointer shadow-md"
                >
                  <Plus className="w-4 h-4" />
                  <span>{language === 'ar' ? 'إضافة منتج جديد' : 'New Product'}</span>
                </button>
              )}
            </div>

            {/* Products CMS Sub-tab */}
            {storeSubTab === 'products' && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {productsList.map((product) => (
                  <div key={product.id} className="p-5 rounded-2xl bg-[#0B0B0B] border border-[#1E1E1E] flex flex-col justify-between space-y-4">
                    <div>
                      <div className="relative h-36 rounded-xl overflow-hidden mb-3 border border-[#222]">
                        <img src={product.image} alt={product.translations.ar?.name} className="w-full h-full object-cover" />
                        <span className="absolute top-2 right-2 px-2 py-0.5 rounded text-[10px] font-bold bg-black/80 text-white">
                          {product.category}
                        </span>
                      </div>

                      <h4 className="text-base font-bold text-white mb-1">{product.translations.ar?.name}</h4>
                      <p className="text-xs text-[#888] line-clamp-2 mb-3">{product.translations.ar?.description}</p>
                      <p className="text-lg font-black text-[#C8874B]">${product.price} USD</p>
                    </div>

                    <div className="pt-3 border-t border-[#1C1C1C] text-xs text-[#666] flex justify-between items-center">
                      <span className="text-[#C8874B] font-semibold">{product.category}</span>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => openProductModal(product)}
                          className="p-1.5 rounded-lg bg-white/5 text-[#AAA] hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
                          title="تعديل المنتج"
                        >
                          <Edit className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDeleteProduct(product.id)}
                          className="p-1.5 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-colors cursor-pointer"
                          title="حذف المنتج"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Customer Orders Sub-tab */}
            {storeSubTab === 'orders' && (
              <div className="space-y-4">
                {adminOrdersList.length === 0 ? (
                  <div className="p-12 text-center rounded-2xl bg-[#0b0c10] border border-white/[0.06]">
                    <ShoppingBag className="w-10 h-10 text-[#7a8091] mx-auto mb-3 opacity-40" />
                    <p className="text-sm font-bold text-white mb-1">
                      {language === 'ar' ? 'لا توجد طلبات شراء مسجلة حالياً' : 'No customer orders recorded yet'}
                    </p>
                    <p className="text-xs text-[#7a8091]">
                      {language === 'ar' ? 'جميع طلبات الشراء عبر المتجر ستظهر هنا تلقائياً' : 'All store purchases will appear here automatically'}
                    </p>
                  </div>
                ) : (
                  <div className="rounded-2xl bg-[#0b0c10] border border-white/[0.08] overflow-hidden">
                    <div className="overflow-x-auto">
                      <table className="w-full text-left rtl:text-right text-xs">
                        <thead>
                          <tr className="border-b border-white/[0.08] bg-[#07080b] text-[#7a8091] font-semibold">
                            <th className="py-3.5 px-4">{language === 'ar' ? 'رقم الطلب' : 'Order #'}</th>
                            <th className="py-3.5 px-4">{language === 'ar' ? 'المنتج' : 'Product'}</th>
                            <th className="py-3.5 px-4">{language === 'ar' ? 'المبلغ' : 'Amount'}</th>
                            <th className="py-3.5 px-4">{language === 'ar' ? 'المشتري (المعرف)' : 'Citizen ID'}</th>
                            <th className="py-3.5 px-4">{language === 'ar' ? 'التاريخ' : 'Date'}</th>
                            <th className="py-3.5 px-4">{language === 'ar' ? 'الحالة' : 'Status'}</th>
                            <th className="py-3.5 px-4 text-center">{language === 'ar' ? 'إجراءات الحالة' : 'Status Actions'}</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-white/[0.04]">
                          {adminOrdersList.map((order) => {
                            const isPending = order.status === 'PENDING';
                            const isCompleted = order.status === 'COMPLETED';
                            const isCancelled = order.status === 'CANCELLED';
                            const isRefunded = order.status === 'REFUNDED';

                            return (
                              <tr key={order.id} className="hover:bg-white/[0.02] transition-colors">
                                <td className="py-3.5 px-4 font-mono font-bold text-[#df9f64]">
                                  {order.orderNumber}
                                </td>
                                <td className="py-3.5 px-4 text-white font-medium">
                                  {order.productName}
                                </td>
                                <td className="py-3.5 px-4 font-mono font-bold text-white">
                                  ${order.price} {order.currency}
                                </td>
                                <td className="py-3.5 px-4 font-mono text-[#969cad] text-[11px] truncate max-w-[140px]">
                                  {order.userId}
                                </td>
                                <td className="py-3.5 px-4 text-[#7a8091] text-[11px]">
                                  {new Date(order.createdAt).toLocaleDateString(language === 'ar' ? 'ar-SA' : 'en-US')}
                                </td>
                                <td className="py-3.5 px-4">
                                  <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold ${
                                    isCompleted 
                                      ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                                      : isPending
                                      ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                                      : isRefunded
                                      ? 'bg-purple-500/10 text-purple-400 border border-purple-500/20'
                                      : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                                  }`}>
                                    {order.status}
                                  </span>
                                </td>
                                <td className="py-3.5 px-4">
                                  <div className="flex items-center justify-center gap-1.5">
                                    {!isCompleted && (
                                      <button
                                        onClick={() => handleUpdateOrderStatus(order.id, 'COMPLETED')}
                                        className="px-2 py-1 rounded-lg bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/30 text-emerald-400 text-[10px] font-bold transition-all cursor-pointer"
                                        title="قبول وتأكيد إتمام الطلب"
                                      >
                                        {language === 'ar' ? 'إتمام' : 'Complete'}
                                      </button>
                                    )}
                                    {!isCancelled && (
                                      <button
                                        onClick={() => handleUpdateOrderStatus(order.id, 'CANCELLED')}
                                        className="px-2 py-1 rounded-lg bg-rose-500/15 hover:bg-rose-500/25 border border-rose-500/30 text-rose-400 text-[10px] font-bold transition-all cursor-pointer"
                                        title="إلغاء الطلب"
                                      >
                                        {language === 'ar' ? 'إلغاء' : 'Cancel'}
                                      </button>
                                    )}
                                    {!isRefunded && (
                                      <button
                                        onClick={() => handleUpdateOrderStatus(order.id, 'REFUNDED')}
                                        className="px-2 py-1 rounded-lg bg-purple-500/15 hover:bg-purple-500/25 border border-purple-500/30 text-purple-400 text-[10px] font-bold transition-all cursor-pointer"
                                        title="استرجاع المبلغ"
                                      >
                                        {language === 'ar' ? 'استرجاع' : 'Refund'}
                                      </button>
                                    )}
                                  </div>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>
            )}
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

        {/* TAB 9: SETTINGS, LOGOS & SOCIAL LINKS */}
        {activeAdminTab === 'settings' && settings && (
          <div className="space-y-8">
            <LogoManagerSettings
              settings={settings}
              setSettings={setSettings}
              onSave={handleSaveSettings}
              showToast={showToast}
            />
            <SocialLinksManager showToast={showToast} isOwner={isOwner} />
          </div>
        )}

        {/* MODAL: ADD/EDIT STORE PRODUCT */}
        {showProductModal && (
          <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-[#0B0B0B] border border-[#282828] rounded-3xl p-6 sm:p-8 max-w-xl w-full max-h-[90vh] overflow-y-auto">
              <h3 className="text-xl font-black text-white mb-4">
                {editingProduct ? 'تعديل منتج بالمتجر' : 'إضافة منتج جديد للمتجر'}
              </h3>
              <form onSubmit={handleSaveProduct} className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-[#AAA] mb-1">الرابط الدائم (Slug)</label>
                    <input
                      type="text"
                      required
                      value={productForm.slug}
                      onChange={(e) => setProductForm({ ...productForm, slug: e.target.value })}
                      className="w-full bg-[#111] border border-[#222] rounded-xl p-2 text-xs text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-[#AAA] mb-1">التصنيف (Category)</label>
                    <select
                      value={productForm.category}
                      onChange={(e) => setProductForm({ ...productForm, category: e.target.value })}
                      className="w-full bg-[#111] border border-[#222] rounded-xl p-2 text-xs text-white"
                    >
                      <option value="VIP">عضويات VIP</option>
                      <option value="VEHICLES">مركبات وسيارات (Vehicles)</option>
                      <option value="PROPERTIES">عقارات ومقرات (Properties)</option>
                      <option value="BUNDLES">باقات مجمعة (Bundles)</option>
                      <option value="OTHER">أخرى (Other)</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-[#AAA] mb-1">السعر ($)</label>
                    <input
                      type="number"
                      required
                      min="0"
                      step="0.01"
                      value={productForm.price}
                      onChange={(e) => setProductForm({ ...productForm, price: parseFloat(e.target.value) || 0 })}
                      className="w-full bg-[#111] border border-[#222] rounded-xl p-2 text-xs text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-[#AAA] mb-1">المخزون (Stock)</label>
                    <input
                      type="number"
                      required
                      min="0"
                      value={productForm.stock}
                      onChange={(e) => setProductForm({ ...productForm, stock: parseInt(e.target.value, 10) || 0 })}
                      className="w-full bg-[#111] border border-[#222] rounded-xl p-2 text-xs text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-[#AAA] mb-1">الحالة</label>
                    <select
                      value={productForm.status}
                      onChange={(e) => setProductForm({ ...productForm, status: e.target.value })}
                      className="w-full bg-[#111] border border-[#222] rounded-xl p-2 text-xs text-white"
                    >
                      <option value="ACTIVE">نشط (Active)</option>
                      <option value="OUT_OF_STOCK">نفد المخزون</option>
                      <option value="HIDDEN">مخفي (Hidden)</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-[#AAA] mb-1">رابط الصورة</label>
                  <input
                    type="text"
                    required
                    value={productForm.image}
                    onChange={(e) => setProductForm({ ...productForm, image: e.target.value })}
                    className="w-full bg-[#111] border border-[#222] rounded-xl p-2 text-xs text-white"
                  />
                </div>

                {/* Arabic Information */}
                <div className="p-4 rounded-2xl bg-[#121212] border border-[#222] space-y-3">
                  <h4 className="text-xs font-bold text-[#C8874B]">المعلومات بالعربية</h4>
                  <input
                    type="text"
                    required
                    placeholder="اسم المنتج بالعربية"
                    value={productForm.translations.ar?.name || ''}
                    onChange={(e) =>
                      setProductForm({
                        ...productForm,
                        translations: {
                          ...productForm.translations,
                          ar: { ...productForm.translations.ar, name: e.target.value }
                        }
                      })
                    }
                    className="w-full bg-[#0B0B0B] border border-[#222] rounded-xl p-2 text-xs text-white"
                  />
                  <textarea
                    rows={2}
                    placeholder="وصف المنتج بالعربية..."
                    value={productForm.translations.ar?.description || ''}
                    onChange={(e) =>
                      setProductForm({
                        ...productForm,
                        translations: {
                          ...productForm.translations,
                          ar: { ...productForm.translations.ar, description: e.target.value }
                        }
                      })
                    }
                    className="w-full bg-[#0B0B0B] border border-[#222] rounded-xl p-2 text-xs text-white"
                  />
                </div>

                {/* English Information */}
                <div className="p-4 rounded-2xl bg-[#121212] border border-[#222] space-y-3">
                  <h4 className="text-xs font-bold text-[#C8874B]">English Information</h4>
                  <input
                    type="text"
                    required
                    placeholder="Product Name in English"
                    value={productForm.translations.en?.name || ''}
                    onChange={(e) =>
                      setProductForm({
                        ...productForm,
                        translations: {
                          ...productForm.translations,
                          en: { ...productForm.translations.en, name: e.target.value }
                        }
                      })
                    }
                    className="w-full bg-[#0B0B0B] border border-[#222] rounded-xl p-2 text-xs text-white"
                  />
                  <textarea
                    rows={2}
                    placeholder="Product description in English..."
                    value={productForm.translations.en?.description || ''}
                    onChange={(e) =>
                      setProductForm({
                        ...productForm,
                        translations: {
                          ...productForm.translations,
                          en: { ...productForm.translations.en, description: e.target.value }
                        }
                      })
                    }
                    className="w-full bg-[#0B0B0B] border border-[#222] rounded-xl p-2 text-xs text-white"
                  />
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t border-[#1C1C1C]">
                  <button
                    type="button"
                    onClick={() => setShowProductModal(false)}
                    className="px-4 py-2 rounded-xl bg-[#1A1A1A] text-white text-xs font-bold"
                  >
                    إلغاء
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2 rounded-xl bg-[#C8874B] text-black text-xs font-extrabold"
                  >
                    حفظ المنتج
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* MODAL: ADD RULE CATEGORY */}
        {showRuleModal && (
          <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-[#0B0B0B] border border-[#282828] rounded-3xl p-6 sm:p-8 max-w-xl w-full max-h-[90vh] overflow-y-auto">
              <h3 className="text-xl font-black text-white mb-4">إضافة قسم قوانين جديد</h3>
              <form onSubmit={handleSaveRuleCategory} className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-[#AAA] mb-1">الرابط الدائم (Slug)</label>
                    <input
                      type="text"
                      required
                      value={ruleCategoryForm.slug}
                      onChange={(e) => setRuleCategoryForm({ ...ruleCategoryForm, slug: e.target.value })}
                      className="w-full bg-[#111] border border-[#222] rounded-xl p-2 text-xs text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-[#AAA] mb-1">الترتيب الرقمي</label>
                    <input
                      type="number"
                      required
                      min="1"
                      value={ruleCategoryForm.order}
                      onChange={(e) => setRuleCategoryForm({ ...ruleCategoryForm, order: parseInt(e.target.value, 10) || 1 })}
                      className="w-full bg-[#111] border border-[#222] rounded-xl p-2 text-xs text-white"
                    />
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-[#121212] border border-[#222] space-y-3">
                  <h4 className="text-xs font-bold text-[#C8874B]">المعلومات بالعربية</h4>
                  <input
                    type="text"
                    required
                    placeholder="عنوان القسم بالعربية (مثال: القواعد العامة)"
                    value={ruleCategoryForm.translations.ar?.title || ''}
                    onChange={(e) =>
                      setRuleCategoryForm({
                        ...ruleCategoryForm,
                        translations: {
                          ...ruleCategoryForm.translations,
                          ar: { ...ruleCategoryForm.translations.ar, title: e.target.value }
                        }
                      })
                    }
                    className="w-full bg-[#0B0B0B] border border-[#222] rounded-xl p-2 text-xs text-white"
                  />
                  <textarea
                    rows={2}
                    placeholder="وصف مختصر لمجال هذه القوانين..."
                    value={ruleCategoryForm.translations.ar?.description || ''}
                    onChange={(e) =>
                      setRuleCategoryForm({
                        ...ruleCategoryForm,
                        translations: {
                          ...ruleCategoryForm.translations,
                          ar: { ...ruleCategoryForm.translations.ar, description: e.target.value }
                        }
                      })
                    }
                    className="w-full bg-[#0B0B0B] border border-[#222] rounded-xl p-2 text-xs text-white"
                  />
                </div>

                <div className="p-4 rounded-2xl bg-[#121212] border border-[#222] space-y-3">
                  <h4 className="text-xs font-bold text-[#C8874B]">English Information</h4>
                  <input
                    type="text"
                    required
                    placeholder="Category Title in English (e.g., General Rules)"
                    value={ruleCategoryForm.translations.en?.title || ''}
                    onChange={(e) =>
                      setRuleCategoryForm({
                        ...ruleCategoryForm,
                        translations: {
                          ...ruleCategoryForm.translations,
                          en: { ...ruleCategoryForm.translations.en, title: e.target.value }
                        }
                      })
                    }
                    className="w-full bg-[#0B0B0B] border border-[#222] rounded-xl p-2 text-xs text-white"
                  />
                  <textarea
                    rows={2}
                    placeholder="Short description of this section..."
                    value={ruleCategoryForm.translations.en?.description || ''}
                    onChange={(e) =>
                      setRuleCategoryForm({
                        ...ruleCategoryForm,
                        translations: {
                          ...ruleCategoryForm.translations,
                          en: { ...ruleCategoryForm.translations.en, description: e.target.value }
                        }
                      })
                    }
                    className="w-full bg-[#0B0B0B] border border-[#222] rounded-xl p-2 text-xs text-white"
                  />
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t border-[#1C1C1C]">
                  <button
                    type="button"
                    onClick={() => setShowRuleModal(false)}
                    className="px-4 py-2 rounded-xl bg-[#1A1A1A] text-white text-xs font-bold"
                  >
                    إلغاء
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2 rounded-xl bg-[#C8874B] text-black text-xs font-extrabold"
                  >
                    حفظ القسم
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
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

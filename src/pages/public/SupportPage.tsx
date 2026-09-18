import React, { useState, useEffect } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { useAuth } from '../../context/AuthContext';
import { apiClient } from '../../services/apiClient';
import { TicketItem, ReportItem } from '../../types';
import { 
  Ticket, 
  Plus, 
  Send, 
  AlertCircle, 
  CheckCircle2, 
  Clock, 
  MessageSquare, 
  ShieldCheck,
  ShieldAlert,
  User,
  FileText,
  X
} from 'lucide-react';

export const SupportPage: React.FC = () => {
  const { t, language, isRtl } = useLanguage();
  const { user, isAuthenticated, loginWithDiscord } = useAuth();
  
  const [activeSection, setActiveSection] = useState<'tickets' | 'reports'>('tickets');

  // Tickets state
  const [tickets, setTickets] = useState<TicketItem[]>([]);
  const [selectedTicket, setSelectedTicket] = useState<TicketItem | null>(null);
  const [replyMessage, setReplyMessage] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSending, setIsSending] = useState<boolean>(false);

  // New ticket modal
  const [isTicketModalOpen, setIsTicketModalOpen] = useState<boolean>(false);
  const [newSubject, setNewSubject] = useState<string>('');
  const [newCategory, setNewCategory] = useState<string>('دعم فني عام');
  const [newPriority, setNewPriority] = useState<string>('MEDIUM');
  const [newMessage, setNewMessage] = useState<string>('');

  // Reports state
  const [reports, setReports] = useState<ReportItem[]>([]);
  const [isReportModalOpen, setIsReportModalOpen] = useState<boolean>(false);
  const [reportTargetName, setReportTargetName] = useState<string>('');
  const [reportTargetId, setReportTargetId] = useState<string>('');
  const [reportCategory, setReportCategory] = useState<string>('FAIL_RP');
  const [reportReason, setReportReason] = useState<string>('');
  const [isSubmittingReport, setIsSubmittingReport] = useState<boolean>(false);

  useEffect(() => {
    if (!isAuthenticated) {
      setIsLoading(false);
      return;
    }
    loadData();
  }, [isAuthenticated]);

  async function loadData() {
    setIsLoading(true);
    try {
      const [tktData, repData] = await Promise.all([
        apiClient.getTickets().catch(() => []),
        apiClient.getReports().catch(() => [])
      ]);

      if (Array.isArray(tktData)) {
        setTickets(tktData);
        if (tktData.length > 0 && !selectedTicket) {
          setSelectedTicket(tktData[0]);
        }
      }
      if (Array.isArray(repData)) {
        setReports(repData);
      }
    } catch (err) {
      console.error('Failed to load support data:', err);
    } finally {
      setIsLoading(false);
    }
  }

  const handleCreateTicket = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSubject || !newMessage) return;

    try {
      const created = await apiClient.createTicket({
        subject: newSubject,
        category: newCategory,
        priority: newPriority,
        message: newMessage
      });

      if (created && created.id) {
        setTickets([created, ...tickets]);
        setSelectedTicket(created);
        setIsTicketModalOpen(false);
        setNewSubject('');
        setNewMessage('');
      }
    } catch (err) {
      console.error('Failed to create ticket:', err);
    }
  };

  const handleSendReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTicket || !replyMessage.trim()) return;

    setIsSending(true);
    try {
      const updated = await apiClient.sendTicketMessage(selectedTicket.id, replyMessage.trim());
      if (updated) {
        setSelectedTicket(updated);
        setTickets(tickets.map((t) => (t.id === updated.id ? updated : t)));
        setReplyMessage('');
      }
    } catch (err) {
      console.error('Failed to reply:', err);
    } finally {
      setIsSending(false);
    }
  };

  const handleCreateReport = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reportReason.trim()) return;

    setIsSubmittingReport(true);
    try {
      const created = await apiClient.createReport({
        category: reportCategory,
        reason: reportReason.trim(),
        targetName: reportTargetName.trim() || undefined,
        targetId: reportTargetId.trim() || undefined
      });

      if (created && created.id) {
        setReports([created, ...reports]);
        setIsReportModalOpen(false);
        setReportTargetName('');
        setReportTargetId('');
        setReportReason('');
      }
    } catch (err) {
      console.error('Failed to submit report:', err);
    } finally {
      setIsSubmittingReport(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'OPEN':
        return { label: language === 'ar' ? 'مفتوحة' : 'OPEN', color: 'text-amber-400 bg-amber-500/10 border-amber-500/30' };
      case 'IN_PROGRESS':
      case 'IN_REVIEW':
        return { label: language === 'ar' ? 'قيد المراجعة' : 'IN REVIEW', color: 'text-blue-400 bg-blue-500/10 border-blue-500/30' };
      case 'RESOLVED':
        return { label: language === 'ar' ? 'تم الحل' : 'RESOLVED', color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30' };
      case 'CLOSED':
        return { label: language === 'ar' ? 'مغلقة' : 'CLOSED', color: 'text-[#777] bg-[#222] border-[#333]' };
      default:
        return { label: status, color: 'text-[#888]' };
    }
  };

  return (
    <div className="min-h-screen bg-[#070707] text-[#E5E5E5] pt-28 pb-24 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 pb-6 border-b border-[#1A1A1A]">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#C8874B]/10 text-[#C8874B] text-xs font-bold mb-2">
              <Ticket className="w-3.5 h-3.5" />
              <span>{language === 'ar' ? 'مركز الدعم والعمليات' : 'Help Desk & Operations'}</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-black text-white">
              {t('support.title')}
            </h1>
            <p className="text-sm text-[#888]">{t('support.subtitle')}</p>
          </div>

          {isAuthenticated && (
            <div className="flex items-center gap-3">
              {activeSection === 'tickets' ? (
                <button
                  onClick={() => setIsTicketModalOpen(true)}
                  className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-gradient-to-r from-[#C8874B] to-[#DF9F64] text-black font-extrabold text-xs tracking-wider hover:brightness-110 transition-all shadow-lg shadow-[#C8874B]/20"
                >
                  <Plus className="w-4 h-4" />
                  <span>{t('support.createTicket')}</span>
                </button>
              ) : (
                <button
                  onClick={() => setIsReportModalOpen(true)}
                  className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-red-600 hover:bg-red-500 text-white font-extrabold text-xs tracking-wider transition-all shadow-lg shadow-red-600/20"
                >
                  <ShieldAlert className="w-4 h-4" />
                  <span>{language === 'ar' ? 'تقديم بلاغ جديد' : 'Submit Violation Report'}</span>
                </button>
              )}
            </div>
          )}
        </div>

        {/* Section Navigation Tabs */}
        <div className="flex items-center gap-3 mb-8">
          <button
            onClick={() => setActiveSection('tickets')}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold transition-all ${
              activeSection === 'tickets'
                ? 'bg-[#C8874B] text-black shadow-lg shadow-[#C8874B]/20'
                : 'bg-[#111] text-[#888] hover:text-white border border-[#222]'
            }`}
          >
            <Ticket className="w-3.5 h-3.5" />
            <span>{language === 'ar' ? 'تذاكر الدعم الفني' : 'Support Tickets'}</span>
            <span className="px-1.5 py-0.5 rounded bg-black/30 text-[10px] font-mono">
              {tickets.length}
            </span>
          </button>

          <button
            onClick={() => setActiveSection('reports')}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold transition-all ${
              activeSection === 'reports'
                ? 'bg-[#C8874B] text-black shadow-lg shadow-[#C8874B]/20'
                : 'bg-[#111] text-[#888] hover:text-white border border-[#222]'
            }`}
          >
            <ShieldAlert className="w-3.5 h-3.5" />
            <span>{language === 'ar' ? 'سجل البلاغات والشكاوى' : 'Violation & Incident Reports'}</span>
            <span className="px-1.5 py-0.5 rounded bg-black/30 text-[10px] font-mono">
              {reports.length}
            </span>
          </button>
        </div>

        {!isAuthenticated ? (
          <div className="p-12 text-center rounded-3xl bg-[#0B0B0B] border border-[#1E1E1E] max-w-xl mx-auto">
            <Ticket className="w-12 h-12 text-[#C8874B] mx-auto mb-4" />
            <h3 className="text-xl font-bold text-white mb-2">
              {language === 'ar' ? 'تسجيل الدخول مطلوب' : 'Authentication Required'}
            </h3>
            <p className="text-sm text-[#888] mb-6">
              {language === 'ar'
                ? 'يرجى تسجيل الدخول عبر حساب الديسكورد الخاص بك لتتمكن من رفع التذاكر والبلاغات ومتابعة الإجراءات.'
                : 'Please login with your Discord account to open support tickets, submit violation reports, and track responses.'}
            </p>
            <button
              onClick={loginWithDiscord}
              className="px-6 py-3 rounded-xl bg-[#5865F2] hover:bg-[#4752C4] text-white text-xs font-bold transition-all shadow-md shadow-[#5865F2]/20"
            >
              {language === 'ar' ? 'تسجيل الدخول عبر Discord' : 'Login via Discord'}
            </button>
          </div>
        ) : isLoading ? (
          <div className="text-center py-20 text-[#888]">{t('common.loading')}</div>
        ) : activeSection === 'tickets' ? (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            
            {/* Left: Tickets List */}
            <div className="lg:col-span-4 space-y-3">
              {tickets.length === 0 ? (
                <div className="p-8 rounded-2xl bg-[#0B0B0B] border border-[#1A1A1A] text-center text-xs text-[#777]">
                  {language === 'ar'
                    ? 'لا توجد تذاكر مفتوحة حالياً. يمكنك إنشاء تذكرة جديدة.'
                    : 'No tickets open currently. You can submit a new ticket.'}
                </div>
              ) : (
                tickets.map((tkt) => {
                  const isSelected = selectedTicket?.id === tkt.id;
                  const status = getStatusBadge(tkt.status);
                  return (
                    <button
                      key={tkt.id}
                      onClick={() => setSelectedTicket(tkt)}
                      className={`w-full text-left rtl:text-right p-4 rounded-2xl border transition-all ${
                        isSelected
                          ? 'bg-[#141414] border-[#C8874B] shadow-md shadow-[#C8874B]/10'
                          : 'bg-[#0B0B0B] border-[#1C1C1C] hover:border-[#333]'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-mono font-bold text-[#C8874B]">
                          #{tkt.ticketNumber}
                        </span>
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${status.color}`}>
                          {status.label}
                        </span>
                      </div>
                      <h4 className="text-sm font-bold text-white truncate mb-1">{tkt.subject}</h4>
                      <p className="text-xs text-[#777]">{tkt.category}</p>
                    </button>
                  );
                })
              )}
            </div>

            {/* Right: Ticket Conversation Thread */}
            <div className="lg:col-span-8 bg-[#0B0B0B] border border-[#1E1E1E] rounded-3xl p-6 sm:p-8 flex flex-col justify-between min-h-[500px]">
              {selectedTicket ? (
                <>
                  <div>
                    {/* Thread Header */}
                    <div className="border-b border-[#1A1A1A] pb-4 mb-6 flex items-start justify-between">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-xs font-mono font-bold text-[#C8874B]">
                            #{selectedTicket.ticketNumber}
                          </span>
                          <span className="text-xs text-[#888]">| {selectedTicket.category}</span>
                        </div>
                        <h2 className="text-xl font-black text-white">{selectedTicket.subject}</h2>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-xs font-bold border ${getStatusBadge(selectedTicket.status).color}`}>
                        {getStatusBadge(selectedTicket.status).label}
                      </span>
                    </div>

                    {/* Messages Container */}
                    <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2 rtl:pr-0 rtl:pl-2 mb-6">
                      {selectedTicket.messages.map((msg) => (
                        <div
                          key={msg.id}
                          className={`p-4 rounded-2xl border ${
                            msg.isStaff
                              ? 'bg-[#151515] border-[#C8874B]/40 rtl:mr-6 ltr:ml-6'
                              : 'bg-[#101010] border-[#222] rtl:ml-6 ltr:mr-6'
                          }`}
                        >
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2">
                              <img
                                src={msg.senderAvatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=60'}
                                alt={msg.senderName}
                                className="w-6 h-6 rounded-full object-cover"
                              />
                              <span className="text-xs font-bold text-white">{msg.senderName}</span>
                              {msg.isStaff && (
                                <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.2 rounded bg-[#C8874B] text-black">
                                  <ShieldCheck className="w-3 h-3" />
                                  <span>Staff</span>
                                </span>
                              )}
                            </div>
                            <span className="text-[10px] text-[#666]">
                              {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </div>
                          <p className="text-xs sm:text-sm text-[#CCC] leading-relaxed whitespace-pre-wrap">
                            {msg.message}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Reply Box */}
                  {selectedTicket.status !== 'CLOSED' ? (
                    <form onSubmit={handleSendReply} className="border-t border-[#1A1A1A] pt-4">
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={replyMessage}
                          onChange={(e) => setReplyMessage(e.target.value)}
                          placeholder={language === 'ar' ? 'اكتب ردك أو استفسارك هنا...' : 'Type your reply or question here...'}
                          className="flex-1 bg-[#111] border border-[#262626] rounded-xl px-4 py-3 text-xs text-white placeholder-[#666] focus:outline-none focus:border-[#C8874B]"
                        />
                        <button
                          type="submit"
                          disabled={isSending || !replyMessage.trim()}
                          className="px-5 py-3 rounded-xl bg-[#C8874B] text-black font-extrabold text-xs hover:brightness-110 transition-all flex items-center gap-1.5 disabled:opacity-50"
                        >
                          <Send className="w-4 h-4" />
                          <span>{t('support.sendReply')}</span>
                        </button>
                      </div>
                    </form>
                  ) : (
                    <div className="p-3 rounded-xl bg-[#141414] border border-[#222] text-center text-xs text-[#777]">
                      {language === 'ar'
                        ? 'تم إغلاق هذه التذكرة. إذا كنت بحاجة لمزيد من المساعدة، يرجى فتح تذكرة جديدة.'
                        : 'This ticket is closed. If you require further assistance, please open a new ticket.'}
                    </div>
                  )}
                </>
              ) : (
                <div className="text-center py-20 text-[#888]">
                  {language === 'ar' ? 'اختر تذكرة من القائمة لعرض تفاصيل المحادثة.' : 'Select a ticket from the list to view conversation.'}
                </div>
              )}
            </div>

          </div>
        ) : (
          /* Reports Section */
          <div className="space-y-4">
            {reports.length === 0 ? (
              <div className="p-12 rounded-3xl bg-[#0B0B0B] border border-[#1E1E1E] text-center max-w-lg mx-auto">
                <ShieldCheck className="w-12 h-12 text-emerald-400 mx-auto mb-3" />
                <h3 className="text-base font-bold text-white mb-1">
                  {language === 'ar' ? 'سجلك نظيف بدون بلاغات مسجلة' : 'No violation reports filed'}
                </h3>
                <p className="text-xs text-[#777] mb-6">
                  {language === 'ar'
                    ? 'في حال تعرضت لأي مضايقة أو مخالفة لقوانين الرول بلاي (RDM, VDM, Fail RP)، يمكنك رفع بلاغ رسمي مباشرة.'
                    : 'If you encountered any violation of roleplay rules (RDM, VDM, Fail RP), you can submit an official report.'}
                </p>
                <button
                  onClick={() => setIsReportModalOpen(true)}
                  className="px-5 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white font-extrabold text-xs transition-all"
                >
                  {language === 'ar' ? 'تقديم بلاغ الآن' : 'Submit a Report Now'}
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {reports.map((rep) => {
                  const status = getStatusBadge(rep.status);
                  return (
                    <div
                      key={rep.id}
                      className="p-5 rounded-2xl bg-[#0B0B0B] border border-[#1E1E1E] hover:border-[#2C2C2C] transition-all flex flex-col justify-between space-y-4"
                    >
                      <div>
                        <div className="flex items-start justify-between gap-2 mb-2">
                          <div>
                            <span className="text-[10px] font-extrabold uppercase tracking-wider text-red-400 block">
                              {rep.category}
                            </span>
                            <h3 className="text-sm font-bold text-white">
                              {language === 'ar' ? 'المخالف:' : 'Target:'} {rep.targetName || rep.targetId || (language === 'ar' ? 'غير محدد' : 'Unspecified')}
                            </h3>
                          </div>
                          <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${status.color}`}>
                            {status.label}
                          </span>
                        </div>

                        <p className="text-xs text-[#AAA] bg-[#121212] p-3 rounded-xl border border-[#1C1C1C] leading-relaxed whitespace-pre-wrap mb-3">
                          {rep.reason}
                        </p>

                        {(rep.notes || rep.adminNotes) && (
                          <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs">
                            <span className="font-bold text-amber-300 block mb-0.5">
                              {language === 'ar' ? 'رد الإدارة / الإجراء المتخذ:' : 'Staff Action / Notes:'}
                            </span>
                            <p className="text-[#CCC]">{rep.notes || rep.adminNotes}</p>
                          </div>
                        )}
                      </div>

                      <div className="flex items-center justify-between pt-2 border-t border-[#161616] text-[11px] text-[#666]">
                        <span>ID: {rep.id.slice(0, 8)}...</span>
                        <span>{new Date(rep.createdAt).toLocaleDateString(language === 'ar' ? 'ar-SA' : 'en-US')}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* CREATE TICKET MODAL */}
        {isTicketModalOpen && (
          <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-[#0B0B0B] border border-[#262626] rounded-3xl p-6 sm:p-8 max-w-lg w-full relative shadow-2xl">
              <button
                onClick={() => setIsTicketModalOpen(false)}
                className="absolute top-5 left-5 rtl:left-5 rtl:right-auto p-2 rounded-xl bg-[#1A1A1A] hover:bg-[#2A2A2A] text-[#888] hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>

              <h3 className="text-xl font-black text-white mb-4">{t('support.createTicket')}</h3>

              <form onSubmit={handleCreateTicket} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-[#AAA] mb-1">
                    {t('support.ticketSubject')}
                  </label>
                  <input
                    type="text"
                    required
                    value={newSubject}
                    onChange={(e) => setNewSubject(e.target.value)}
                    placeholder={language === 'ar' ? 'مثال: مشكلة في تفعيل الرتبة' : 'e.g., Rank activation inquiry'}
                    className="w-full bg-[#111] border border-[#222] rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-[#C8874B]"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-[#AAA] mb-1">
                      {t('support.category')}
                    </label>
                    <select
                      value={newCategory}
                      onChange={(e) => setNewCategory(e.target.value)}
                      className="w-full bg-[#111] border border-[#222] rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-[#C8874B]"
                    >
                      <option value="دعم فني عام">{language === 'ar' ? 'دعم فني عام' : 'General Technical'}</option>
                      <option value="المتجر والاشتراكات">{language === 'ar' ? 'المتجر والاشتراكات' : 'Store & Subscriptions'}</option>
                      <option value="طلب تقديم وظيفة">{language === 'ar' ? 'طلب تقديم وظيفة' : 'Job Application Inquiry'}</option>
                      <option value="اقتراح تطويري">{language === 'ar' ? 'اقتراح تطويري' : 'Server Suggestion'}</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#AAA] mb-1">
                      {t('support.priority')}
                    </label>
                    <select
                      value={newPriority}
                      onChange={(e) => setNewPriority(e.target.value)}
                      className="w-full bg-[#111] border border-[#222] rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-[#C8874B]"
                    >
                      <option value="LOW">{language === 'ar' ? 'منخفضة (Low)' : 'Low'}</option>
                      <option value="MEDIUM">{language === 'ar' ? 'متوسطة (Medium)' : 'Medium'}</option>
                      <option value="HIGH">{language === 'ar' ? 'عاجلة (High)' : 'High'}</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#AAA] mb-1">
                    {t('support.message')}
                  </label>
                  <textarea
                    required
                    rows={4}
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder={language === 'ar' ? 'اشرح المشكلة بالتفصيل لمساعدتك بأسرع وقت...' : 'Describe your issue in detail...'}
                    className="w-full bg-[#111] border border-[#222] rounded-xl p-3 text-xs text-white focus:outline-none focus:border-[#C8874B]"
                  />
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t border-[#1A1A1A]">
                  <button
                    type="button"
                    onClick={() => setIsTicketModalOpen(false)}
                    className="px-5 py-2.5 rounded-xl bg-[#1A1A1A] text-white text-xs font-bold"
                  >
                    {t('common.cancel')}
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2.5 rounded-xl bg-[#C8874B] text-black text-xs font-extrabold hover:brightness-110"
                  >
                    {t('support.submitTicket')}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* CREATE VIOLATION REPORT MODAL */}
        {isReportModalOpen && (
          <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-[#0B0B0B] border border-[#262626] rounded-3xl p-6 sm:p-8 max-w-lg w-full relative shadow-2xl">
              <button
                onClick={() => setIsReportModalOpen(false)}
                className="absolute top-5 left-5 rtl:left-5 rtl:right-auto p-2 rounded-xl bg-[#1A1A1A] hover:bg-[#2A2A2A] text-[#888] hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>

              <div className="mb-4">
                <span className="text-[10px] font-bold text-red-400 uppercase tracking-widest block">
                  {language === 'ar' ? 'قسم الشكاوى والبلاغات' : 'Violations & Incident Department'}
                </span>
                <h3 className="text-xl font-black text-white">
                  {language === 'ar' ? 'تقديم بلاغ عن مخالفة' : 'File Violation Report'}
                </h3>
              </div>

              <form onSubmit={handleCreateReport} className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-[#AAA] mb-1">
                      {language === 'ar' ? 'اسم المخالف أو شخصيته' : 'Target Player Name'}
                    </label>
                    <input
                      type="text"
                      value={reportTargetName}
                      onChange={(e) => setReportTargetName(e.target.value)}
                      placeholder={language === 'ar' ? 'اسم اللاعب أو لقبه' : 'e.g., John Doe'}
                      className="w-full bg-[#111] border border-[#222] rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-[#C8874B]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-[#AAA] mb-1">
                      {language === 'ar' ? 'رقم اللاعب / ID (إن وجد)' : 'Server ID / Discord (optional)'}
                    </label>
                    <input
                      type="text"
                      value={reportTargetId}
                      onChange={(e) => setReportTargetId(e.target.value)}
                      placeholder="e.g. 142"
                      className="w-full bg-[#111] border border-[#222] rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-[#C8874B]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#AAA] mb-1">
                    {language === 'ar' ? 'نوع المخالفة' : 'Violation Category'}
                  </label>
                  <select
                    value={reportCategory}
                    onChange={(e) => setReportCategory(e.target.value)}
                    className="w-full bg-[#111] border border-[#222] rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-[#C8874B]"
                  >
                    <option value="RDM">RDM (Random Deathmatch)</option>
                    <option value="VDM">VDM (Vehicle Deathmatch)</option>
                    <option value="FAIL_RP">Fail RP / خروج عن الواقعية</option>
                    <option value="COMBAT_LOG">Combat Logging / الخروج وقت السيناريو</option>
                    <option value="EXPLOIT">استغلال ثغرة (Exploit/Glitch)</option>
                    <option value="HARASSMENT">مضايقة أو إساءة (Harassment)</option>
                    <option value="OTHER">{language === 'ar' ? 'أخرى' : 'Other'}</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#AAA] mb-1">
                    {language === 'ar' ? 'تفاصيل المخالفة والأدلة' : 'Incident Details & Proof'}
                  </label>
                  <textarea
                    required
                    rows={4}
                    value={reportReason}
                    onChange={(e) => setReportReason(e.target.value)}
                    placeholder={language === 'ar' ? 'اشرح ما حدث بدقة مع وضع روابط الفيديو أو الصور إن توفرت...' : 'Describe what happened with video/clip links if available...'}
                    className="w-full bg-[#111] border border-[#222] rounded-xl p-3 text-xs text-white focus:outline-none focus:border-[#C8874B]"
                  />
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t border-[#1A1A1A]">
                  <button
                    type="button"
                    onClick={() => setIsReportModalOpen(false)}
                    className="px-5 py-2.5 rounded-xl bg-[#1A1A1A] text-white text-xs font-bold"
                  >
                    {t('common.cancel')}
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmittingReport || !reportReason.trim()}
                    className="px-6 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-extrabold disabled:opacity-50"
                  >
                    {isSubmittingReport ? (language === 'ar' ? 'جاري الإرسال...' : 'Submitting...') : (language === 'ar' ? 'إرسال البلاغ' : 'Submit Report')}
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

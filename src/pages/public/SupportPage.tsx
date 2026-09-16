import React, { useState, useEffect } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { useAuth } from '../../context/AuthContext';
import { apiClient } from '../../services/apiClient';
import { TicketItem } from '../../types';
import { 
  Ticket, 
  Plus, 
  Send, 
  AlertCircle, 
  CheckCircle2, 
  Clock, 
  MessageSquare, 
  ChevronLeft, 
  ChevronRight,
  ShieldCheck
} from 'lucide-react';

export const SupportPage: React.FC = () => {
  const { t, language, isRtl } = useLanguage();
  const { user, isAuthenticated, loginWithDiscord } = useAuth();
  
  const [tickets, setTickets] = useState<TicketItem[]>([]);
  const [selectedTicket, setSelectedTicket] = useState<TicketItem | null>(null);
  const [replyMessage, setReplyMessage] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSending, setIsSending] = useState<boolean>(false);

  // New ticket modal
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [newSubject, setNewSubject] = useState<string>('');
  const [newCategory, setNewCategory] = useState<string>('دعم فني عام');
  const [newPriority, setNewPriority] = useState<string>('MEDIUM');
  const [newMessage, setNewMessage] = useState<string>('');

  useEffect(() => {
    if (!isAuthenticated) {
      setIsLoading(false);
      return;
    }
    loadTickets();
  }, [isAuthenticated]);

  async function loadTickets() {
    setIsLoading(true);
    try {
      const data = await apiClient.getTickets();
      if (Array.isArray(data)) {
        setTickets(data);
        if (data.length > 0 && !selectedTicket) {
          setSelectedTicket(data[0]);
        }
      }
    } catch (err) {
      console.error('Failed to load tickets:', err);
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
        setIsModalOpen(false);
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

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'OPEN':
        return { label: t('support.statusOpen'), color: 'text-amber-400 bg-amber-500/10 border-amber-500/30' };
      case 'IN_PROGRESS':
        return { label: t('support.statusInProgress'), color: 'text-blue-400 bg-blue-500/10 border-blue-500/30' };
      case 'RESOLVED':
        return { label: t('support.statusResolved'), color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30' };
      case 'CLOSED':
        return { label: t('support.statusClosed'), color: 'text-[#777] bg-[#222] border-[#333]' };
      default:
        return { label: status, color: 'text-[#888]' };
    }
  };

  return (
    <div className="min-h-screen bg-[#070707] text-[#E5E5E5] pt-28 pb-24 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-10 pb-6 border-b border-[#1A1A1A]">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#C8874B]/10 text-[#C8874B] text-xs font-bold mb-2">
              <Ticket className="w-3.5 h-3.5" />
              <span>Help Desk & Operations</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-black text-white">
              {t('support.title')}
            </h1>
            <p className="text-sm text-[#888]">{t('support.subtitle')}</p>
          </div>

          {isAuthenticated && (
            <button
              onClick={() => setIsModalOpen(true)}
              className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-gradient-to-r from-[#C8874B] to-[#DF9F64] text-black font-extrabold text-xs tracking-wider hover:brightness-110 transition-all shadow-lg shadow-[#C8874B]/20"
            >
              <Plus className="w-4 h-4" />
              <span>{t('support.createTicket')}</span>
            </button>
          )}
        </div>

        {!isAuthenticated ? (
          <div className="p-12 text-center rounded-3xl bg-[#0B0B0B] border border-[#1E1E1E] max-w-xl mx-auto">
            <Ticket className="w-12 h-12 text-[#C8874B] mx-auto mb-4" />
            <h3 className="text-xl font-bold text-white mb-2">تسجيل الدخول مطلوب لفتح التذاكر</h3>
            <p className="text-sm text-[#888] mb-6">
              يرجى تسجيل الدخول عبر حساب الديسكورد الخاص بك لتتمكن من رفع تذاكر الدعم ومتابعة الردود لحظياً.
            </p>
            <button
              onClick={loginWithDiscord}
              className="px-6 py-3 rounded-xl bg-[#5865F2] hover:bg-[#4752C4] text-white text-xs font-bold transition-all shadow-md shadow-[#5865F2]/20"
            >
              تسجيل الدخول عبر Discord
            </button>
          </div>
        ) : isLoading ? (
          <div className="text-center py-20 text-[#888]">{t('common.loading')}</div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            
            {/* Left: Tickets List */}
            <div className="lg:col-span-4 space-y-3">
              {tickets.length === 0 ? (
                <div className="p-6 rounded-2xl bg-[#0B0B0B] border border-[#1A1A1A] text-center text-xs text-[#777]">
                  لا توجد تذاكر مفتوحة حالياً. يمكنك إنشاء تذكرة جديدة.
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
                          placeholder="اكتب ردك أو استفسارك هنا..."
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
                      تم إغلاق هذه التذكرة. إذا كنت بحاجة لمزيد من المساعدة، يرجى فتح تذكرة جديدة.
                    </div>
                  )}
                </>
              ) : (
                <div className="text-center py-20 text-[#888]">
                  اختر تذكرة من القائمة لعرض تفاصيل المحادثة.
                </div>
              )}
            </div>

          </div>
        )}

        {/* CREATE TICKET MODAL */}
        {isModalOpen && (
          <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-[#0B0B0B] border border-[#262626] rounded-3xl p-6 sm:p-8 max-w-lg w-full relative shadow-2xl">
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
                    placeholder="مثال: مشكلة في استلام رتبة VIP"
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
                      <option value="دعم فني عام">دعم فني عام</option>
                      <option value="المتجر والاشتراكات">المتجر والاشتراكات</option>
                      <option value="بلاغ عن مخالفة رول بلاي">بلاغ عن مخالفة رول بلاي</option>
                      <option value="طلب تقديم وظيفة">طلب تقديم وظيفة</option>
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
                      <option value="LOW">منخفضة (Low)</option>
                      <option value="MEDIUM">متوسطة (Medium)</option>
                      <option value="HIGH">عاجلة (High)</option>
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
                    placeholder="اشرح المشكلة بالتفصيل لمساعدتك بأسرع وقت..."
                    className="w-full bg-[#111] border border-[#222] rounded-xl p-3 text-xs text-white focus:outline-none focus:border-[#C8874B]"
                  />
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t border-[#1A1A1A]">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
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

      </div>
    </div>
  );
};

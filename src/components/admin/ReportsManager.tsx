import React, { useState, useEffect } from 'react';
import { ReportItem } from '../../types';
import { apiClient } from '../../services/apiClient';
import { 
  AlertTriangle, 
  CheckCircle2, 
  Clock, 
  Search, 
  Filter, 
  ShieldAlert, 
  UserX, 
  Bug, 
  Check, 
  X,
  MessageSquare,
  RefreshCw
} from 'lucide-react';

interface ReportsManagerProps {
  showToast: (msg: string) => void;
}

export const ReportsManager: React.FC<ReportsManagerProps> = ({ showToast }) => {
  const [reports, setReports] = useState<ReportItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedReport, setSelectedReport] = useState<ReportItem | null>(null);
  const [resolutionNotes, setResolutionNotes] = useState<string>('');
  const [isUpdating, setIsUpdating] = useState<boolean>(false);

  const loadReports = async () => {
    setIsLoading(true);
    try {
      const data = await apiClient.getReports();
      setReports(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Failed to load reports:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadReports();
  }, []);

  const handleUpdateStatus = async (reportId: string, status: string) => {
    setIsUpdating(true);
    try {
      const updated = await apiClient.updateReportStatus(reportId, status, resolutionNotes);
      if (updated) {
        setReports(reports.map((r) => (r.id === reportId ? updated : r)));
        if (selectedReport?.id === reportId) {
          setSelectedReport(updated);
        }
        showToast(`تم تحديث حالة البلاغ إلى ${status}`);
        setResolutionNotes('');
      }
    } catch (err) {
      console.error(err);
      showToast('تعذر تحديث حالة البلاغ');
    } finally {
      setIsUpdating(false);
    }
  };

  const filteredReports = reports.filter((r) => {
    if (statusFilter !== 'ALL' && r.status !== statusFilter) return false;
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      r.reporterName.toLowerCase().includes(q) ||
      (r.targetName && r.targetName.toLowerCase().includes(q)) ||
      r.reason.toLowerCase().includes(q) ||
      r.category.toLowerCase().includes(q)
    );
  });

  const getCategoryBadge = (cat: string) => {
    switch (cat) {
      case 'PLAYER_REPORT':
        return { label: 'بلاغ ضد لاعب', icon: UserX, color: 'text-red-400 bg-red-500/10 border-red-500/30' };
      case 'BUG_REPORT':
        return { label: 'خطأ برمجي (Bug)', icon: Bug, color: 'text-amber-400 bg-amber-500/10 border-amber-500/30' };
      case 'STAFF_REPORT':
        return { label: 'شكوى إدارية', icon: ShieldAlert, color: 'text-purple-400 bg-purple-500/10 border-purple-500/30' };
      default:
        return { label: 'مخالفة عامة', icon: AlertTriangle, color: 'text-blue-400 bg-blue-500/10 border-blue-500/30' };
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'OPEN':
        return 'bg-amber-500/15 text-amber-400 border-amber-500/30';
      case 'IN_REVIEW':
        return 'bg-blue-500/15 text-blue-400 border-blue-500/30';
      case 'RESOLVED':
        return 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30';
      case 'CLOSED':
        return 'bg-[#222] text-[#888] border-[#333]';
      default:
        return 'bg-[#191919] text-[#AAA] border-[#333]';
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Header & Quick Stats */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-xl font-black text-white flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-[#C8874B]" />
            <span>نظام إدارة البلاغات والشكاوى (Reports CMS)</span>
          </h3>
          <p className="text-xs text-[#888] mt-1">
            متابعة ومراجعة بلاغات المواطنين ضد المخالفين، والأخطاء البرمجية، مع تدقيق وحفظ قرارات الإدارة.
          </p>
        </div>

        <button
          onClick={loadReports}
          disabled={isLoading}
          className="px-3 py-1.5 rounded-xl bg-[#141414] hover:bg-[#202020] border border-[#2B2B2B] text-xs text-white flex items-center gap-1.5 self-start sm:self-auto disabled:opacity-50"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin text-[#C8874B]' : ''}`} />
          <span>تحديث</span>
        </button>
      </div>

      {/* Metrics Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl bg-[#0B0B0B] border border-[#1A1A1A]">
          <span className="text-[11px] text-[#777] block">إجمالي البلاغات</span>
          <p className="text-2xl font-black text-white mt-1">{reports.length}</p>
        </div>
        <div className="p-4 rounded-2xl bg-[#0B0B0B] border border-[#1A1A1A]">
          <span className="text-[11px] text-[#777] block">بلاغات مفتوحة</span>
          <p className="text-2xl font-black text-amber-400 mt-1">
            {reports.filter((r) => r.status === 'OPEN').length}
          </p>
        </div>
        <div className="p-4 rounded-2xl bg-[#0B0B0B] border border-[#1A1A1A]">
          <span className="text-[11px] text-[#777] block">قيد التحقيق</span>
          <p className="text-2xl font-black text-blue-400 mt-1">
            {reports.filter((r) => r.status === 'IN_REVIEW').length}
          </p>
        </div>
        <div className="p-4 rounded-2xl bg-[#0B0B0B] border border-[#1A1A1A]">
          <span className="text-[11px] text-[#777] block">تم الحل والإغلاق</span>
          <p className="text-2xl font-black text-emerald-400 mt-1">
            {reports.filter((r) => r.status === 'RESOLVED' || r.status === 'CLOSED').length}
          </p>
        </div>
      </div>

      {/* Filters & Search */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-[#0E0E0E] p-4 rounded-2xl border border-[#1C1C1C]">
        <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
          {['ALL', 'OPEN', 'IN_REVIEW', 'RESOLVED', 'CLOSED'].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 ${
                statusFilter === st
                  ? 'bg-[#C8874B] text-black shadow-sm'
                  : 'bg-[#141414] text-[#888] hover:text-white border border-[#222]'
              }`}
            >
              {st === 'ALL' && 'الكل'}
              {st === 'OPEN' && 'مفتوح (جديد)'}
              {st === 'IN_REVIEW' && 'قيد المراجعة'}
              {st === 'RESOLVED' && 'تم الحل'}
              {st === 'CLOSED' && 'مغلق'}
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="w-3.5 h-3.5 text-[#777] absolute left-3 rtl:left-auto rtl:right-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="بحث في البلاغات..."
            className="w-full bg-[#141414] border border-[#252525] focus:border-[#C8874B] rounded-xl pl-8 pr-3 rtl:pl-3 rtl:pr-8 py-2 text-xs text-white placeholder-[#666] focus:outline-none"
          />
        </div>
      </div>

      {/* Reports List */}
      {isLoading ? (
        <div className="text-center py-16 text-[#888] text-xs">جاري تحميل البلاغات...</div>
      ) : filteredReports.length === 0 ? (
        <div className="text-center py-16 rounded-3xl bg-[#0B0B0B] border border-[#1A1A1A]">
          <CheckCircle2 className="w-10 h-10 text-emerald-400 mx-auto mb-2" />
          <p className="text-sm font-bold text-white">لا توجد بلاغات تطابق الفلتر الحالي</p>
          <p className="text-xs text-[#777] mt-1">جميع التقارير تم التعامل معها بنجاح.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredReports.map((report) => {
            const catBadge = getCategoryBadge(report.category);
            const CatIcon = catBadge.icon;
            const isSelected = selectedReport?.id === report.id;

            return (
              <div
                key={report.id}
                className={`p-5 rounded-2xl border transition-all ${
                  isSelected 
                    ? 'bg-[#121212] border-[#C8874B] shadow-xl' 
                    : 'bg-[#0B0B0B] border-[#1C1C1C] hover:border-[#2E2E2E]'
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                  <div className="flex items-start gap-3.5">
                    <img
                      src={report.reporterAvatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=60'}
                      alt=""
                      className="w-10 h-10 rounded-xl object-cover border border-[#262626] shrink-0"
                    />
                    <div>
                      <div className="flex flex-wrap items-center gap-2 mb-1.5">
                        <span className="font-bold text-sm text-white">{report.reporterName}</span>
                        <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${catBadge.color}`}>
                          <CatIcon className="w-3 h-3" />
                          <span>{catBadge.label}</span>
                        </span>
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${getStatusBadge(report.status)}`}>
                          {report.status}
                        </span>
                      </div>

                      {report.targetName && (
                        <p className="text-xs text-[#C8874B] font-semibold mb-1">
                          الطرف المشتكى عليه: <span className="text-white font-mono">{report.targetName}</span>
                          {report.targetId && <span className="text-[#777] text-[10px] mr-1">({report.targetId})</span>}
                        </p>
                      )}

                      <p className="text-xs text-[#BBB] leading-relaxed mt-1 max-w-2xl bg-[#141414] p-3 rounded-xl border border-[#1F1F1F]">
                        {report.reason}
                      </p>

                      {report.adminNotes && (
                        <div className="mt-2.5 p-2.5 rounded-lg bg-[#C8874B]/10 border border-[#C8874B]/20 text-[11px] text-[#D8A77B]">
                          <span className="font-bold">ملاحظات الإدارة: </span>
                          <span>{report.adminNotes}</span>
                        </div>
                      )}

                      <span className="text-[10px] text-[#666] block mt-2">
                        تاريخ البلاغ: {new Date(report.createdAt).toLocaleString()}
                      </span>
                    </div>
                  </div>

                  {/* Actions & Status Changers */}
                  <div className="flex flex-wrap sm:flex-col items-end gap-2 shrink-0 border-t sm:border-t-0 pt-3 sm:pt-0 border-[#1C1C1C]">
                    <div className="flex items-center gap-1.5">
                      {report.status !== 'IN_REVIEW' && (
                        <button
                          onClick={() => handleUpdateStatus(report.id, 'IN_REVIEW')}
                          disabled={isUpdating}
                          className="px-2.5 py-1 rounded-lg bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 border border-blue-500/30 text-[11px] font-bold transition-colors disabled:opacity-50"
                        >
                          تحقيق (In Review)
                        </button>
                      )}
                      {report.status !== 'RESOLVED' && (
                        <button
                          onClick={() => handleUpdateStatus(report.id, 'RESOLVED')}
                          disabled={isUpdating}
                          className="px-2.5 py-1 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[11px] font-bold transition-colors disabled:opacity-50"
                        >
                          حل البلاغ
                        </button>
                      )}
                      {report.status !== 'CLOSED' && (
                        <button
                          onClick={() => handleUpdateStatus(report.id, 'CLOSED')}
                          disabled={isUpdating}
                          className="px-2.5 py-1 rounded-lg bg-[#1A1A1A] hover:bg-[#252525] text-[#AAA] border border-[#333] text-[11px] font-bold transition-colors disabled:opacity-50"
                        >
                          إغلاق
                        </button>
                      )}
                    </div>

                    <button
                      onClick={() => setSelectedReport(isSelected ? null : report)}
                      className="text-[11px] text-[#C8874B] hover:underline font-semibold"
                    >
                      {isSelected ? 'إخفاء محرر الملاحظات' : 'إضافة قرار وملاحظات'}
                    </button>
                  </div>
                </div>

                {/* Resolution Notes Expansion */}
                {isSelected && (
                  <div className="mt-4 pt-4 border-t border-[#1C1C1C] flex flex-col sm:flex-row items-center gap-3">
                    <input
                      type="text"
                      value={resolutionNotes}
                      onChange={(e) => setResolutionNotes(e.target.value)}
                      placeholder="أدخل سبب أو ملاحظات قرار الإدارة (مثال: تم اتخاذ الإجراء اللازم في اللعبة)..."
                      className="w-full bg-[#141414] border border-[#2B2B2B] focus:border-[#C8874B] rounded-xl px-3.5 py-2 text-xs text-white placeholder-[#666] focus:outline-none"
                    />
                    <button
                      onClick={() => handleUpdateStatus(report.id, report.status)}
                      disabled={isUpdating || !resolutionNotes.trim()}
                      className="px-4 py-2 rounded-xl bg-[#C8874B] hover:bg-[#B0733A] text-black font-bold text-xs shrink-0 transition-colors disabled:opacity-50"
                    >
                      حفظ الملاحظة
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

    </div>
  );
};

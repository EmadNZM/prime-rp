import React, { useState, useEffect } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { apiClient } from '../../services/apiClient';
import { JobItem, JobApplication, JobApplicationStatus } from '../../types';
import { 
  Briefcase, 
  Users, 
  Plus, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  Eye, 
  Search, 
  Filter, 
  X, 
  Save, 
  Trash2, 
  Edit, 
  FileText, 
  Calendar, 
  AlertCircle,
  ShieldCheck,
  Check,
  DollarSign
} from 'lucide-react';

interface JobsManagerProps {
  showToast: (msg: string) => void;
}

export const JobsManager: React.FC<JobsManagerProps> = ({ showToast }) => {
  const { language } = useLanguage();

  const [activeSubTab, setActiveSubTab] = useState<'applications' | 'jobs_cms'>('applications');

  // Applications state
  const [applications, setApplications] = useState<JobApplication[]>([]);
  const [selectedApplication, setSelectedApplication] = useState<JobApplication | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [jobFilter, setJobFilter] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [reviewNotesInput, setReviewNotesInput] = useState<string>('');
  const [isUpdatingStatus, setIsUpdatingStatus] = useState<boolean>(false);

  // Jobs state
  const [jobs, setJobs] = useState<JobItem[]>([]);
  const [isJobModalOpen, setIsJobModalOpen] = useState<boolean>(false);
  const [editingJob, setEditingJob] = useState<JobItem | null>(null);
  const [jobFormData, setJobFormData] = useState({
    id: '',
    category: 'حكومية',
    salaryMin: 5000,
    salaryMax: 9000,
    status: 'HIRING_OPEN',
    image: 'https://images.unsplash.com/photo-1541872703-74c5e44368f9?w=800',
    translations: {
      ar: {
        name: '',
        description: '',
        requirements: ['العمر فوق 18 عاماً', 'الالتزام بقواعد الرول بلاي', 'التحلي بالانضباط وحسن الخلق'],
        duties: ['تأدية المهام الموكلة بدقة', 'التواجد في فترات الورديات المحددة', 'التعاون مع أعضاء الفريق']
      },
      en: {
        name: '',
        description: '',
        requirements: ['Age 18+', 'Strict RP adherence', 'Professional conduct'],
        duties: ['Perform assigned duties', 'Attend shift hours', 'Team collaboration']
      }
    }
  });

  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [appsData, jobsData] = await Promise.all([
        apiClient.getAdminJobApplications(),
        apiClient.getJobs()
      ]);
      setApplications(appsData || []);
      setJobs(jobsData || []);
    } catch (err) {
      console.error('Failed to load jobs manager data:', err);
      showToast('تعذر تحميل بيانات الوظائف والطلبات');
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateStatus = async (appId: string, newStatus: JobApplicationStatus) => {
    setIsUpdatingStatus(true);
    try {
      const updated = await apiClient.updateAdminJobApplicationStatus(
        appId,
        newStatus,
        reviewNotesInput.trim() || undefined
      );

      setApplications(prev => prev.map(a => a.id === appId ? updated : a));
      if (selectedApplication?.id === appId) {
        setSelectedApplication(updated);
      }
      showToast(`تم تحديث حالة الطلب إلى: ${newStatus}`);
      setReviewNotesInput('');
    } catch (err: any) {
      showToast(err.message || 'فشل تحديث حالة الطلب');
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  const openJobModal = (jobToEdit?: JobItem) => {
    if (jobToEdit) {
      setEditingJob(jobToEdit);
      setJobFormData({
        id: jobToEdit.id,
        category: jobToEdit.category,
        salaryMin: jobToEdit.salaryMin,
        salaryMax: jobToEdit.salaryMax,
        status: jobToEdit.status,
        image: jobToEdit.image,
        translations: {
          ar: {
            name: jobToEdit.translations.ar?.name || '',
            description: jobToEdit.translations.ar?.description || '',
            requirements: jobToEdit.translations.ar?.requirements || [],
            duties: jobToEdit.translations.ar?.duties || []
          },
          en: {
            name: jobToEdit.translations.en?.name || '',
            description: jobToEdit.translations.en?.description || '',
            requirements: jobToEdit.translations.en?.requirements || [],
            duties: jobToEdit.translations.en?.duties || []
          }
        }
      });
    } else {
      setEditingJob(null);
      setJobFormData({
        id: `job-${Date.now().toString().slice(-4)}`,
        category: 'حكومية',
        salaryMin: 4000,
        salaryMax: 8000,
        status: 'HIRING_OPEN',
        image: 'https://images.unsplash.com/photo-1541872703-74c5e44368f9?w=800',
        translations: {
          ar: {
            name: '',
            description: '',
            requirements: ['العمر فوق 18 عاماً', 'الالتزام بقواعد الرول بلاي'],
            duties: ['تأدية المهام الموكلة بدقة', 'التواجد في الورديات الرسمية']
          },
          en: {
            name: '',
            description: '',
            requirements: ['Age 18+', 'Follow RP rules'],
            duties: ['Carry out tasks faithfully', 'Attend official shifts']
          }
        }
      });
    }
    setIsJobModalOpen(true);
  };

  const handleSaveJob = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await apiClient.saveJobCMS(jobFormData);
      showToast('تم حفظ بيانات الوظيفة بنجاح');
      setIsJobModalOpen(false);
      loadData();
    } catch (err: any) {
      showToast(err.message || 'فشل حفظ الوظيفة');
    }
  };

  const handleDeleteJob = async (jobId: string) => {
    if (!window.confirm('هل أنت متأكد من رغبتك بحذف هذه الوظيفة من النظام؟')) return;
    try {
      await apiClient.deleteJobCMS(jobId);
      setJobs(prev => prev.filter(j => j.id !== jobId));
      showToast('تم حذف الوظيفة بنجاح');
    } catch (err: any) {
      showToast(err.message || 'فشل حذف الوظيفة');
    }
  };

  // Filtered applications
  const filteredApplications = applications.filter(app => {
    if (statusFilter !== 'ALL' && app.status !== statusFilter) return false;
    if (jobFilter !== 'ALL' && app.jobId !== jobFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchName = app.characterName.toLowerCase().includes(q);
      const matchDiscord = app.discordUsername?.toLowerCase().includes(q);
      const matchJob = (app.jobTitle || '').toLowerCase().includes(q);
      return matchName || matchDiscord || matchJob;
    }
    return true;
  });

  return (
    <div className="space-y-6">
      
      {/* Top Header & Sub-tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#0B0B0B] border border-[#1C1C1C] p-6 rounded-3xl">
        <div>
          <h3 className="text-xl font-black text-white flex items-center gap-2.5">
            <Briefcase className="w-5 h-5 text-[#C8874B]" />
            <span>نظام الوظائف وطلبات التوظيف (Jobs & Recruitment Center)</span>
          </h3>
          <p className="text-xs text-[#888] mt-1">
            إدارة القطاعات الوظيفية، مراجعة استمارات المواطنين، واتخاذ قرارات القبول والرفض الرسمية.
          </p>
        </div>

        {/* Sub-tabs buttons */}
        <div className="flex items-center gap-2 bg-[#121212] p-1.5 rounded-2xl border border-[#222]">
          <button
            onClick={() => setActiveSubTab('applications')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
              activeSubTab === 'applications'
                ? 'bg-[#C8874B] text-black shadow-md shadow-[#C8874B]/20'
                : 'text-[#888] hover:text-white'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>طلبات التوظيف ({applications.length})</span>
          </button>

          <button
            onClick={() => setActiveSubTab('jobs_cms')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
              activeSubTab === 'jobs_cms'
                ? 'bg-[#C8874B] text-black shadow-md shadow-[#C8874B]/20'
                : 'text-[#888] hover:text-white'
            }`}
          >
            <Briefcase className="w-4 h-4" />
            <span>الوظائف والقطاعات ({jobs.length})</span>
          </button>
        </div>
      </div>

      {/* SUB-TAB 1: APPLICATIONS MANAGER */}
      {activeSubTab === 'applications' && (
        <div className="space-y-4">
          
          {/* Filters Bar */}
          <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 bg-[#0D0D0D] border border-[#1E1E1E] p-4 rounded-2xl">
            {/* Search */}
            <div className="sm:col-span-5 relative">
              <Search className="w-4 h-4 text-[#666] absolute right-3 top-3 rtl:right-3 rtl:left-auto ltr:left-3 ltr:right-auto" />
              <input
                type="text"
                placeholder="البحث باسم الشخصية، المعرف، أو الوظيفة..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-[#141414] border border-[#222] focus:border-[#C8874B] rounded-xl pr-9 pl-4 rtl:pr-9 rtl:pl-4 ltr:pl-9 ltr:pr-4 py-2.5 text-xs text-white focus:outline-none placeholder:text-[#555]"
              />
            </div>

            {/* Status Filter */}
            <div className="sm:col-span-4">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full bg-[#141414] border border-[#222] focus:border-[#C8874B] rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none"
              >
                <option value="ALL">جميع الحالات (All Statuses)</option>
                <option value="PENDING">قيد الانتظار (PENDING)</option>
                <option value="UNDER_REVIEW">قيد التدقيق (UNDER REVIEW)</option>
                <option value="ACCEPTED">المقبولين (ACCEPTED)</option>
                <option value="REJECTED">المرفوضين (REJECTED)</option>
              </select>
            </div>

            {/* Job Filter */}
            <div className="sm:col-span-3">
              <select
                value={jobFilter}
                onChange={(e) => setJobFilter(e.target.value)}
                className="w-full bg-[#141414] border border-[#222] focus:border-[#C8874B] rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none"
              >
                <option value="ALL">جميع القطاعات</option>
                {jobs.map(j => (
                  <option key={j.id} value={j.id}>
                    {j.translations.ar?.name || j.id}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Applications Table */}
          <div className="bg-[#0B0B0B] border border-[#1C1C1C] rounded-3xl overflow-hidden shadow-xl">
            {isLoading ? (
              <div className="text-center py-16 text-[#666] text-xs">جاري تحميل طلبات التوظيف...</div>
            ) : filteredApplications.length === 0 ? (
              <div className="text-center py-16 text-[#666] text-xs">
                لا توجد طلبات توظيف تطابق خيارات الفلترة المحددة.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left rtl:text-right">
                  <thead className="text-[#777] uppercase bg-[#0E0E0E] border-b border-[#1A1A1A]">
                    <tr>
                      <th className="px-6 py-4">مقدم الطلب (Discord)</th>
                      <th className="px-6 py-4">الوظيفة والقطاع</th>
                      <th className="px-6 py-4">اسم الشخصية والعمر</th>
                      <th className="px-6 py-4">التواجد اليومي</th>
                      <th className="px-6 py-4">تاريخ التقديم</th>
                      <th className="px-6 py-4">الحالة</th>
                      <th className="px-6 py-4 text-center">الإجراءات</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#161616]">
                    {filteredApplications.map((app) => {
                      const statusStyles = {
                        ACCEPTED: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
                        UNDER_REVIEW: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
                        REJECTED: 'bg-red-500/10 text-red-400 border-red-500/20',
                        PENDING: 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                      }[app.status] || 'bg-gray-500/10 text-gray-400 border-gray-500/20';

                      const statusLabels = {
                        ACCEPTED: 'مقبول',
                        UNDER_REVIEW: 'تدقيق',
                        REJECTED: 'مرفوض',
                        PENDING: 'انتظار'
                      }[app.status] || app.status;

                      return (
                        <tr key={app.id} className="hover:bg-[#111] transition-colors">
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-2">
                              {app.userAvatar ? (
                                <img
                                  src={app.userAvatar}
                                  alt={app.discordUsername || ''}
                                  className="w-7 h-7 rounded-full object-cover border border-[#333]"
                                />
                              ) : (
                                <div className="w-7 h-7 rounded-full bg-[#222] text-[#888] flex items-center justify-center font-bold">
                                  {(app.discordUsername || 'U')[0]}
                                </div>
                              )}
                              <div>
                                <span className="font-bold text-white block">
                                  {app.discordUsername || 'مواطن'}
                                </span>
                                <span className="text-[10px] text-[#666] font-mono">
                                  ID: {app.userId.slice(0, 8)}...
                                </span>
                              </div>
                            </div>
                          </td>

                          <td className="px-6 py-4">
                            <span className="font-bold text-[#C8874B] block">
                              {app.jobTitle || app.jobId}
                            </span>
                            <span className="text-[10px] text-[#666]">
                              {app.jobCategory || 'عام'}
                            </span>
                          </td>

                          <td className="px-6 py-4">
                            <span className="font-bold text-white block">{app.characterName}</span>
                            <span className="text-[10px] text-[#777]">{app.characterAge} عاماً</span>
                          </td>

                          <td className="px-6 py-4 text-[#AAA]">
                            {app.dailyAvailability}
                          </td>

                          <td className="px-6 py-4 text-[#777]">
                            {new Date(app.createdAt).toLocaleDateString('ar-SA')}
                          </td>

                          <td className="px-6 py-4">
                            <span className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold border ${statusStyles}`}>
                              {statusLabels}
                            </span>
                          </td>

                          <td className="px-6 py-4 text-center">
                            <button
                              onClick={() => {
                                setSelectedApplication(app);
                                setReviewNotesInput(app.reviewNotes || '');
                              }}
                              className="px-3 py-1.5 rounded-lg bg-[#1A1A1A] hover:bg-[#C8874B] text-[#AAA] hover:text-black font-bold text-xs transition-all flex items-center gap-1.5 mx-auto"
                            >
                              <Eye className="w-3.5 h-3.5" />
                              <span>مراجعة</span>
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* SUB-TAB 2: JOBS CMS */}
      {activeSubTab === 'jobs_cms' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h4 className="text-base font-bold text-white">قائمة القطاعات والوظائف المعروضة بالموقع</h4>
            <button
              onClick={() => openJobModal()}
              className="px-4 py-2 rounded-xl bg-[#C8874B] text-black font-bold text-xs flex items-center gap-1.5 hover:brightness-110 transition-all shadow-md shadow-[#C8874B]/20"
            >
              <Plus className="w-4 h-4" />
              <span>إضافة وظيفة جديدة</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {jobs.map((job) => {
              const trans = job.translations.ar || job.translations[language] || { name: job.id, description: '' };
              return (
                <div key={job.id} className="bg-[#0B0B0B] border border-[#1E1E1E] rounded-3xl overflow-hidden flex flex-col justify-between">
                  <div>
                    <div className="relative h-40 border-b border-[#1E1E1E]">
                      <img src={job.image} alt={trans.name} className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
                      <span className="absolute bottom-3 right-3 rtl:right-3 rtl:left-auto ltr:left-3 ltr:right-auto px-2.5 py-0.5 rounded text-[10px] font-black bg-[#C8874B] text-black">
                        {job.status}
                      </span>
                    </div>

                    <div className="p-5">
                      <span className="text-[10px] font-extrabold uppercase text-[#C8874B] block mb-1">
                        {job.category}
                      </span>
                      <h4 className="text-base font-bold text-white mb-2">{trans.name}</h4>
                      <p className="text-xs text-[#888] line-clamp-2 mb-4 leading-relaxed">
                        {trans.description}
                      </p>
                      <div className="p-3 rounded-xl bg-[#121212] border border-[#1A1A1A] text-xs">
                        <span className="text-[#666] block text-[10px]">الراتب لكل وردية:</span>
                        <span className="font-bold text-white">${job.salaryMin} - ${job.salaryMax}</span>
                      </div>
                    </div>
                  </div>

                  <div className="p-4 border-t border-[#1A1A1A] flex items-center justify-end gap-2 bg-[#0E0E0E]">
                    <button
                      onClick={() => openJobModal(job)}
                      className="p-2 rounded-lg bg-[#1A1A1A] hover:bg-[#252525] text-[#AAA] hover:text-white transition-all text-xs flex items-center gap-1"
                    >
                      <Edit className="w-3.5 h-3.5" />
                      <span>تعديل</span>
                    </button>
                    <button
                      onClick={() => handleDeleteJob(job.id)}
                      className="p-2 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 transition-all text-xs"
                      title="حذف الوظيفة"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* MODAL 1: APPLICATION REVIEW MODAL */}
      {selectedApplication && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto">
          <div className="relative w-full max-w-2xl bg-[#0E0E0E] border border-[#222] rounded-3xl p-6 sm:p-8 shadow-2xl my-8 text-right rtl:text-right ltr:text-left overflow-hidden">
            <button
              onClick={() => setSelectedApplication(null)}
              className="absolute top-5 left-5 rtl:left-5 rtl:right-auto p-2 rounded-xl bg-[#1A1A1A] hover:bg-[#2A2A2A] text-[#888] hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="mb-6 pb-4 border-b border-[#1C1C1C]">
              <span className="text-[10px] font-extrabold uppercase tracking-widest text-[#C8874B] block mb-1">
                مراجعة استمارة التوظيف الرسمية
              </span>
              <h3 className="text-xl font-black text-white">
                {selectedApplication.jobTitle || 'طلب وظيفة'} • {selectedApplication.characterName}
              </h3>
              <p className="text-xs text-[#777]">
                حساب الديسكورد: <span className="text-white font-bold">{selectedApplication.discordUsername}</span> (ID: {selectedApplication.userId})
              </p>
            </div>

            <div className="space-y-4 text-xs">
              {/* Applicant Info Cards */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 p-4 rounded-xl bg-[#141414] border border-[#1E1E1E]">
                <div>
                  <span className="text-[#666] block">اسم الشخصية:</span>
                  <span className="text-white font-bold">{selectedApplication.characterName}</span>
                </div>
                <div>
                  <span className="text-[#666] block">عمر الشخصية:</span>
                  <span className="text-white font-bold">{selectedApplication.characterAge} عاماً</span>
                </div>
                <div>
                  <span className="text-[#666] block">التواجد اليومي:</span>
                  <span className="text-white font-bold">{selectedApplication.dailyAvailability}</span>
                </div>
                <div>
                  <span className="text-[#666] block">تاريخ الإرسال:</span>
                  <span className="text-white font-bold">{new Date(selectedApplication.createdAt).toLocaleString('ar-SA')}</span>
                </div>
                <div>
                  <span className="text-[#666] block">الحالة الحالية:</span>
                  <span className="font-bold text-[#C8874B]">{selectedApplication.status}</span>
                </div>
                <div>
                  <span className="text-[#666] block">معرف الطلب:</span>
                  <span className="font-mono text-[#888] text-[10px]">{selectedApplication.id}</span>
                </div>
              </div>

              {/* Experience */}
              <div>
                <h4 className="font-bold text-[#C8874B] mb-1.5 flex items-center gap-1.5">
                  <FileText className="w-3.5 h-3.5" />
                  <span>الخبرات السابقة في رول بلاي FiveM:</span>
                </h4>
                <div className="p-4 rounded-xl bg-[#141414] border border-[#1E1E1E] text-[#CCC] leading-relaxed whitespace-pre-wrap">
                  {selectedApplication.experience}
                </div>
              </div>

              {/* Answers */}
              {selectedApplication.answers && Object.keys(selectedApplication.answers).length > 0 && (
                <div>
                  <h4 className="font-bold text-[#C8874B] mb-1.5 flex items-center gap-1.5">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    <span>إجابات السيناريوهات والأسئلة التقييمية:</span>
                  </h4>
                  <div className="p-4 rounded-xl bg-[#141414] border border-[#1E1E1E] text-[#CCC] space-y-2">
                    {Object.entries(selectedApplication.answers).map(([k, v]) => (
                      <div key={k}>
                        <span className="text-[10px] text-[#777] block">{k}:</span>
                        <p className="text-white leading-relaxed">{String(v)}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Review Notes Input */}
              <div className="p-4 rounded-xl bg-[#121212] border border-[#222] space-y-2">
                <label className="block font-bold text-white text-xs">
                  ملاحظة الإدارة للمواطن (تظهر له مباشرة في لوحة التحكم):
                </label>
                <textarea
                  rows={2}
                  value={reviewNotesInput}
                  onChange={(e) => setReviewNotesInput(e.target.value)}
                  placeholder="اكتب ملاحظة أو توجيهات (مثال: تم قبولك مبدئياً، يرجى مراجعة الروم الصوتي بالمقر لإجراء المقابلة)..."
                  className="w-full bg-[#181818] border border-[#282828] focus:border-[#C8874B] rounded-xl p-3 text-xs text-white focus:outline-none placeholder:text-[#555] resize-none"
                />
              </div>

              {/* Decision Action Buttons */}
              <div className="pt-4 border-t border-[#1C1C1C] flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <button
                    disabled={isUpdatingStatus}
                    onClick={() => handleUpdateStatus(selectedApplication.id, 'ACCEPTED')}
                    className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition-all flex items-center gap-1.5 shadow-lg shadow-emerald-600/20 disabled:opacity-50"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>قبول الطلب (ACCEPT)</span>
                  </button>

                  <button
                    disabled={isUpdatingStatus}
                    onClick={() => handleUpdateStatus(selectedApplication.id, 'UNDER_REVIEW')}
                    className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs transition-all flex items-center gap-1.5 shadow-lg shadow-blue-600/20 disabled:opacity-50"
                  >
                    <Clock className="w-4 h-4" />
                    <span>قيد التدقيق (UNDER REVIEW)</span>
                  </button>

                  <button
                    disabled={isUpdatingStatus}
                    onClick={() => handleUpdateStatus(selectedApplication.id, 'REJECTED')}
                    className="px-4 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-xs transition-all flex items-center gap-1.5 shadow-lg shadow-red-600/20 disabled:opacity-50"
                  >
                    <XCircle className="w-4 h-4" />
                    <span>رفض الطلب (REJECT)</span>
                  </button>
                </div>

                <button
                  onClick={() => setSelectedApplication(null)}
                  className="px-4 py-2.5 rounded-xl bg-[#1A1A1A] hover:bg-[#252525] text-[#AAA] font-bold text-xs transition-all"
                >
                  إغلاق
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 2: ADD / EDIT JOB CMS */}
      {isJobModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto">
          <div className="relative w-full max-w-2xl bg-[#0E0E0E] border border-[#222] rounded-3xl p-6 sm:p-8 shadow-2xl my-8 text-right rtl:text-right ltr:text-left">
            <button
              onClick={() => setIsJobModalOpen(false)}
              className="absolute top-5 left-5 rtl:left-5 rtl:right-auto p-2 rounded-xl bg-[#1A1A1A] hover:bg-[#2A2A2A] text-[#888] hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-xl font-black text-white mb-6">
              {editingJob ? 'تعديل بيانات الوظيفة' : 'إضافة وظيفة شاغرة جديدة'}
            </h3>

            <form onSubmit={handleSaveJob} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-[#AAA] mb-1">المعرف البرمجي (ID)</label>
                  <input
                    type="text"
                    required
                    disabled={!!editingJob}
                    value={jobFormData.id}
                    onChange={(e) => setJobFormData({ ...jobFormData, id: e.target.value })}
                    className="w-full bg-[#141414] border border-[#222] rounded-xl p-2.5 text-white disabled:opacity-50"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-[#AAA] mb-1">القطاع / التصنيف</label>
                  <input
                    type="text"
                    required
                    value={jobFormData.category}
                    onChange={(e) => setJobFormData({ ...jobFormData, category: e.target.value })}
                    className="w-full bg-[#141414] border border-[#222] rounded-xl p-2.5 text-white"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-[#AAA] mb-1">حالة التقديم</label>
                  <select
                    value={jobFormData.status}
                    onChange={(e) => setJobFormData({ ...jobFormData, status: e.target.value })}
                    className="w-full bg-[#141414] border border-[#222] rounded-xl p-2.5 text-white"
                  >
                    <option value="HIRING_OPEN">مفتوح للجميع (HIRING OPEN)</option>
                    <option value="INVITE_ONLY">دعوة خاصة (INVITE ONLY)</option>
                    <option value="HIRING_CLOSED">مغلق مؤقتاً (HIRING CLOSED)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-[#AAA] mb-1">الراتب الأدنى ($)</label>
                  <input
                    type="number"
                    value={jobFormData.salaryMin}
                    onChange={(e) => setJobFormData({ ...jobFormData, salaryMin: parseInt(e.target.value) || 0 })}
                    className="w-full bg-[#141414] border border-[#222] rounded-xl p-2.5 text-white"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-[#AAA] mb-1">الراتب الأعلى ($)</label>
                  <input
                    type="number"
                    value={jobFormData.salaryMax}
                    onChange={(e) => setJobFormData({ ...jobFormData, salaryMax: parseInt(e.target.value) || 0 })}
                    className="w-full bg-[#141414] border border-[#222] rounded-xl p-2.5 text-white"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-[#AAA] mb-1">رابط صورة الغلاف</label>
                  <input
                    type="text"
                    value={jobFormData.image}
                    onChange={(e) => setJobFormData({ ...jobFormData, image: e.target.value })}
                    className="w-full bg-[#141414] border border-[#222] rounded-xl p-2.5 text-white"
                  />
                </div>
              </div>

              {/* Arabic Content */}
              <div className="p-4 rounded-2xl bg-[#141414] border border-[#222] space-y-3">
                <h4 className="font-bold text-[#C8874B]">المحتوى بالعربية (Arabic)</h4>
                <div>
                  <label className="block text-[10px] text-[#777] mb-1">مسمى الوظيفة بالعربية</label>
                  <input
                    type="text"
                    required
                    value={jobFormData.translations.ar.name}
                    onChange={(e) => setJobFormData({
                      ...jobFormData,
                      translations: {
                        ...jobFormData.translations,
                        ar: { ...jobFormData.translations.ar, name: e.target.value }
                      }
                    })}
                    placeholder="مثال: ضابط شرطة لوس سانتوس"
                    className="w-full bg-[#0B0B0B] border border-[#222] rounded-xl p-2.5 text-white"
                  />
                </div>
                <div>
                  <label className="block text-[10px] text-[#777] mb-1">وصف الوظيفة</label>
                  <textarea
                    rows={2}
                    value={jobFormData.translations.ar.description}
                    onChange={(e) => setJobFormData({
                      ...jobFormData,
                      translations: {
                        ...jobFormData.translations,
                        ar: { ...jobFormData.translations.ar, description: e.target.value }
                      }
                    })}
                    placeholder="نبذة عن المهام وطبيعة العمل..."
                    className="w-full bg-[#0B0B0B] border border-[#222] rounded-xl p-2.5 text-white resize-none"
                  />
                </div>
              </div>

              {/* English Content */}
              <div className="p-4 rounded-2xl bg-[#141414] border border-[#222] space-y-3">
                <h4 className="font-bold text-[#C8874B]">English Content</h4>
                <div>
                  <label className="block text-[10px] text-[#777] mb-1">Job Title in English</label>
                  <input
                    type="text"
                    required
                    value={jobFormData.translations.en.name}
                    onChange={(e) => setJobFormData({
                      ...jobFormData,
                      translations: {
                        ...jobFormData.translations,
                        en: { ...jobFormData.translations.en, name: e.target.value }
                      }
                    })}
                    placeholder="e.g. LSPD Police Officer"
                    className="w-full bg-[#0B0B0B] border border-[#222] rounded-xl p-2.5 text-white"
                  />
                </div>
                <div>
                  <label className="block text-[10px] text-[#777] mb-1">Description</label>
                  <textarea
                    rows={2}
                    value={jobFormData.translations.en.description}
                    onChange={(e) => setJobFormData({
                      ...jobFormData,
                      translations: {
                        ...jobFormData.translations,
                        en: { ...jobFormData.translations.en, description: e.target.value }
                      }
                    })}
                    placeholder="Short description..."
                    className="w-full bg-[#0B0B0B] border border-[#222] rounded-xl p-2.5 text-white resize-none"
                  />
                </div>
              </div>

              <div className="pt-4 border-t border-[#1C1C1C] flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsJobModalOpen(false)}
                  className="px-5 py-2.5 rounded-xl bg-[#181818] text-[#AAA] font-bold text-xs"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-[#C8874B] text-black font-extrabold text-xs hover:brightness-110 transition-all flex items-center gap-1.5"
                >
                  <Save className="w-4 h-4" />
                  <span>حفظ التعديلات</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

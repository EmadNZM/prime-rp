import React, { useState, useEffect } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { useAuth } from '../../context/AuthContext';
import { apiClient } from '../../services/apiClient';
import { JobItem, JobApplication } from '../../types';
import { JobApplicationModal } from '../../components/jobs/JobApplicationModal';
import { 
  Briefcase, 
  DollarSign, 
  CheckCircle2, 
  ChevronRight, 
  ChevronLeft, 
  Building2,
  Clock,
  ShieldCheck,
  LogIn,
  FileCheck,
  AlertCircle
} from 'lucide-react';

interface JobsPageProps {
  setCurrentTab: (tab: string) => void;
}

export const JobsPage: React.FC<JobsPageProps> = ({ setCurrentTab }) => {
  const { t, language, isRtl } = useLanguage();
  const { user, isAuthenticated, loginWithDiscord } = useAuth();
  
  const [jobs, setJobs] = useState<JobItem[]>([]);
  const [selectedJob, setSelectedJob] = useState<JobItem | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Application state
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [activeApplication, setActiveApplication] = useState<JobApplication | null>(null);
  const [isCheckingApp, setIsCheckingApp] = useState<boolean>(false);

  useEffect(() => {
    async function loadJobs() {
      try {
        const data = await apiClient.getJobs();
        setJobs(data);
        if (data.length > 0) setSelectedJob(data[0]);
      } catch (err) {
        console.error('Failed to load jobs:', err);
      } finally {
        setIsLoading(false);
      }
    }
    loadJobs();
  }, []);

  // Check application status when selectedJob or user changes
  useEffect(() => {
    async function checkStatus() {
      if (!selectedJob || !isAuthenticated) {
        setActiveApplication(null);
        return;
      }
      setIsCheckingApp(true);
      try {
        const res = await apiClient.checkJobApplication(selectedJob.id);
        if (res.hasApplied && res.application) {
          setActiveApplication(res.application);
        } else {
          setActiveApplication(null);
        }
      } catch (err) {
        console.error('Error checking application:', err);
        setActiveApplication(null);
      } finally {
        setIsCheckingApp(false);
      }
    }
    checkStatus();
  }, [selectedJob, isAuthenticated]);

  const ArrowIcon = isRtl ? ChevronLeft : ChevronRight;

  const handleApplicationSuccess = (app: JobApplication) => {
    setActiveApplication(app);
  };

  return (
    <div className="min-h-screen bg-[#070707] text-[#E5E5E5] pt-28 pb-24 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-14">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#C8874B]/10 text-[#C8874B] text-xs font-bold mb-4">
            <Building2 className="w-3.5 h-3.5" />
            <span>Careers & Enterprises</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-black text-white mb-4">
            {t('jobs.title')}
          </h1>
          <p className="text-[#8E8E8E] text-sm sm:text-base leading-relaxed">
            {t('jobs.subtitle')}
          </p>
        </div>

        {/* Jobs Layout: Sidebar selection + Detailed Spec Card */}
        {isLoading ? (
          <div className="text-center py-20 text-[#888]">{t('common.loading')}</div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            
            {/* Sidebar list */}
            <div className="lg:col-span-5 space-y-3">
              {jobs.map((job) => {
                const trans = job.translations[language] || job.translations.ar;
                const isSelected = selectedJob?.id === job.id;
                return (
                  <button
                    key={job.id}
                    onClick={() => setSelectedJob(job)}
                    className={`w-full text-left rtl:text-right p-5 rounded-2xl border transition-all flex items-center justify-between ${
                      isSelected
                        ? 'bg-[#141414] border-[#C8874B] shadow-lg shadow-[#C8874B]/10'
                        : 'bg-[#0B0B0B] border-[#1C1C1C] hover:border-[#333]'
                    }`}
                  >
                    <div>
                      <span className="text-[10px] font-extrabold uppercase tracking-widest text-[#C8874B] block mb-1">
                        {job.category}
                      </span>
                      <h3 className="text-base font-bold text-white mb-1">
                        {trans.name}
                      </h3>
                      <span className="text-xs text-[#777]">
                        ${job.salaryMin} - ${job.salaryMax} {t('jobs.perShift')}
                      </span>
                    </div>
                    <ArrowIcon className={`w-5 h-5 ${isSelected ? 'text-[#C8874B]' : 'text-[#444]'}`} />
                  </button>
                );
              })}
            </div>

            {/* Main Detail View */}
            {selectedJob && (
              <div className="lg:col-span-7 bg-[#0B0B0B] border border-[#1E1E1E] rounded-3xl overflow-hidden p-6 sm:p-8 flex flex-col justify-between">
                <div>
                  <div className="relative h-56 rounded-2xl overflow-hidden mb-6 border border-[#222]">
                    <img
                      src={selectedJob.image}
                      alt={selectedJob.translations[language]?.name || ''}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent" />
                    <div className="absolute bottom-4 left-4 rtl:left-auto rtl:right-4">
                      <span className="px-3 py-1 rounded-md text-xs font-black bg-[#C8874B] text-black">
                        {selectedJob.status === 'HIRING_OPEN'
                          ? t('jobs.hiringOpen')
                          : selectedJob.status === 'INVITE_ONLY'
                          ? t('jobs.inviteOnly')
                          : t('jobs.hiringClosed')}
                      </span>
                    </div>
                  </div>

                  <h2 className="text-2xl font-black text-white mb-2">
                    {selectedJob.translations[language]?.name || selectedJob.translations.ar.name}
                  </h2>

                  <p className="text-sm text-[#999] leading-relaxed mb-6">
                    {selectedJob.translations[language]?.description || selectedJob.translations.ar.description}
                  </p>

                  <div className="grid grid-cols-2 gap-4 p-4 rounded-xl bg-[#111] border border-[#1A1A1A] mb-6">
                    <div>
                      <span className="text-xs text-[#777] block mb-1">{t('jobs.salaryRange')}</span>
                      <p className="text-lg font-black text-[#C8874B]">
                        ${selectedJob.salaryMin} - ${selectedJob.salaryMax}
                      </p>
                    </div>
                    <div>
                      <span className="text-xs text-[#777] block mb-1">القطاع / Department</span>
                      <p className="text-sm font-bold text-white">{selectedJob.category}</p>
                    </div>
                  </div>

                  {/* Requirements */}
                  <div className="mb-6">
                    <h4 className="text-xs font-extrabold uppercase tracking-wider text-[#C8874B] mb-3">
                      {t('jobs.requirements')}
                    </h4>
                    <div className="space-y-2">
                      {(selectedJob.translations[language]?.requirements || selectedJob.translations.ar.requirements).map(
                        (req, i) => (
                          <div key={i} className="flex items-start gap-2.5 text-xs text-[#BBB]">
                            <CheckCircle2 className="w-4 h-4 text-[#C8874B] shrink-0 mt-0.5" />
                            <span>{req}</span>
                          </div>
                        )
                      )}
                    </div>
                  </div>

                  {/* Duties */}
                  <div className="mb-8">
                    <h4 className="text-xs font-extrabold uppercase tracking-wider text-[#C8874B] mb-3">
                      {t('jobs.duties')}
                    </h4>
                    <div className="space-y-2">
                      {(selectedJob.translations[language]?.duties || selectedJob.translations.ar.duties).map(
                        (duty, i) => (
                          <div key={i} className="flex items-start gap-2.5 text-xs text-[#888]">
                            <div className="w-1.5 h-1.5 rounded-full bg-[#C8874B] shrink-0 mt-1.5" />
                            <span>{duty}</span>
                          </div>
                        )
                      )}
                    </div>
                  </div>
                </div>

                {/* Application CTA State Handling */}
                <div className="pt-4 border-t border-[#1C1C1C]">
                  {!isAuthenticated ? (
                    <button
                      onClick={loginWithDiscord}
                      className="w-full py-4 rounded-xl bg-[#5865F2] hover:bg-[#4752C4] text-white font-extrabold text-sm tracking-wide transition-all shadow-lg shadow-[#5865F2]/20 flex items-center justify-center gap-2"
                    >
                      <LogIn className="w-4 h-4" />
                      <span>{language === 'ar' ? 'تسجيل الدخول عبر ديسكورد للتقديم على الوظيفة' : 'Sign In with Discord to Apply'}</span>
                    </button>
                  ) : activeApplication ? (
                    <div className="p-4 rounded-2xl bg-[#141414] border border-[#222] space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <FileCheck className="w-5 h-5 text-[#C8874B]" />
                          <span className="text-sm font-bold text-white">
                            {language === 'ar' ? 'لديك طلب مقدم لهذه الوظيفة' : 'Active Application on File'}
                          </span>
                        </div>
                        <span className={`px-2.5 py-0.5 rounded-full text-xs font-extrabold ${
                          activeApplication.status === 'ACCEPTED' 
                            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                            : activeApplication.status === 'UNDER_REVIEW'
                            ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                            : activeApplication.status === 'REJECTED'
                            ? 'bg-red-500/10 text-red-400 border border-red-500/20'
                            : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                        }`}>
                          {activeApplication.status === 'ACCEPTED' && (language === 'ar' ? 'تم القبول' : 'Accepted')}
                          {activeApplication.status === 'UNDER_REVIEW' && (language === 'ar' ? 'قيد المراجعة' : 'Under Review')}
                          {activeApplication.status === 'REJECTED' && (language === 'ar' ? 'تم الرفض' : 'Rejected')}
                          {activeApplication.status === 'PENDING' && (language === 'ar' ? 'قيد الانتظار' : 'Pending')}
                        </span>
                      </div>
                      <p className="text-xs text-[#888]">
                        {language === 'ar' ? 'الشخصية:' : 'Character:'} <span className="text-white font-bold">{activeApplication.characterName}</span> • {language === 'ar' ? 'تاريخ التقديم:' : 'Applied:'} {new Date(activeApplication.createdAt).toLocaleDateString(language === 'ar' ? 'ar-SA' : 'en-US')}
                      </p>
                      {activeApplication.reviewNotes && (
                        <div className="p-2.5 rounded-xl bg-[#1C1C1C] text-xs text-[#AAA]">
                          <span className="font-bold text-[#C8874B]">{language === 'ar' ? 'ملاحظة الإدارة: ' : 'Staff Note: '}</span>
                          <span>{activeApplication.reviewNotes}</span>
                        </div>
                      )}
                      <button
                        onClick={() => setCurrentTab('dashboard')}
                        className="w-full py-2.5 rounded-xl bg-[#1F1F1F] hover:bg-[#2A2A2A] text-xs font-bold text-white transition-all text-center cursor-pointer"
                      >
                        {language === 'ar' ? 'عرض ومتابعة كافة طلباتي في لوحة التحكم' : 'View & Track Applications in Dashboard'}
                      </button>
                    </div>
                  ) : selectedJob.status === 'HIRING_CLOSED' ? (
                    <button
                      disabled
                      className="w-full py-4 rounded-xl bg-[#181818] border border-[#222] text-[#666] font-extrabold text-sm tracking-wide cursor-not-allowed"
                    >
                      {t('jobs.hiringClosed')}
                    </button>
                  ) : (
                    <button
                      onClick={() => setIsModalOpen(true)}
                      className="w-full py-4 rounded-xl bg-gradient-to-r from-[#C8874B] to-[#DF9F64] text-black font-extrabold text-sm tracking-wide hover:brightness-110 transition-all shadow-lg shadow-[#C8874B]/20"
                    >
                      {t('jobs.applyNow')}
                    </button>
                  )}
                </div>

              </div>
            )}

          </div>
        )}

        {/* Modal for Application */}
        {selectedJob && (
          <JobApplicationModal
            job={selectedJob}
            isOpen={isModalOpen}
            onClose={() => setIsModalOpen(false)}
            onSuccess={handleApplicationSuccess}
            onNavigateToDashboard={() => setCurrentTab('dashboard')}
          />
        )}

      </div>
    </div>
  );
};

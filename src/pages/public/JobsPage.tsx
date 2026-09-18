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
  AlertCircle,
  Sparkles,
  Award,
  Users,
  Layers
} from 'lucide-react';
import { motion } from 'motion/react';

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
    <div className="min-h-screen bg-[#08090d] text-[#f1f3f7] pt-32 pb-28 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      
      {/* Background Ambience (EchoRP & ONX) */}
      <div className="absolute top-10 left-1/2 -translate-x-1/2 w-full max-w-6xl h-[500px] bg-[#c8874b]/5 blur-[160px] pointer-events-none rounded-full" />
      <div className="absolute top-80 right-10 w-96 h-96 bg-[#c8874b]/5 blur-[140px] pointer-events-none rounded-full" />

      <div className="max-w-6xl mx-auto relative z-10">
        
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-14">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#c8874b]/10 border border-[#c8874b]/30 text-[#df9f64] text-xs font-black mb-4 uppercase tracking-wider shadow-sm">
            <Building2 className="w-3.5 h-3.5 text-[#c8874b]" />
            <span>{language === 'ar' ? 'الوظائف الحكومية والقطاع الخاص' : 'Careers & Enterprise Recruitment'}</span>
          </div>
          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-white mb-4 tracking-tight uppercase">
            <span className="block text-white">{language === 'ar' ? 'سوق العمل والمسارات المهنية' : 'CAREERS & FACTIONS'}</span>
            <span className="block mt-1 copper-gradient-text">
              {language === 'ar' ? 'اصنع هيبة شخصيتك' : 'SHAPE YOUR DESTINY'}
            </span>
          </h1>
          <p className="text-[#969cad] text-sm sm:text-base leading-relaxed max-w-2xl mx-auto">
            {language === 'ar'
              ? 'سواء كنت ترغب في الانخراط بسلك الشرطة والتحقيقات، أو إنقاذ الأرواح في الطوارئ الطبية، أو إدارة الأعمال الخاصة، تجد هنا شواغر رسمية بنظام رواتب واقعي.'
              : 'Join official law enforcement cadres, emergency trauma surgery, Department of Justice judiciary, or player-owned enterprises with automated shift payouts.'}
          </p>
        </div>

        {/* Jobs Layout: Sidebar selection + Detailed Spec Card */}
        {isLoading ? (
          <div className="text-center py-24 text-[#969cad] flex flex-col items-center justify-center gap-3">
            <div className="w-8 h-8 rounded-full border-2 border-[#c8874b] border-t-transparent animate-spin" />
            <span className="text-xs uppercase tracking-wider font-bold">{t('common.loading')}</span>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* Sidebar list */}
            <div className="lg:col-span-5 space-y-3">
              {jobs.map((job) => {
                const trans = job.translations[language] || job.translations.ar;
                const isSelected = selectedJob?.id === job.id;
                return (
                  <button
                    key={job.id}
                    onClick={() => setSelectedJob(job)}
                    className={`w-full text-left rtl:text-right p-5 rounded-2xl border transition-all flex items-center justify-between cursor-pointer ${
                      isSelected
                        ? 'bg-[#0d0f16] border-[#c8874b] shadow-xl shadow-[#c8874b]/15 ring-1 ring-[#c8874b]/40'
                        : 'bg-[#0d0f16]/70 border-white/[0.06] hover:border-white/[0.15] hover:bg-[#0d0f16]'
                    }`}
                  >
                    <div>
                      <span className="text-[10px] font-black uppercase tracking-widest text-[#df9f64] block mb-1 font-rajdhani">
                        {job.category}
                      </span>
                      <h3 className="text-base font-black text-white mb-1">
                        {trans.name}
                      </h3>
                      <span className="text-xs text-[#7a8091] font-rajdhani font-semibold">
                        ${job.salaryMin} - ${job.salaryMax} {t('jobs.perShift')}
                      </span>
                    </div>
                    <ArrowIcon className={`w-5 h-5 transition-transform ${isSelected ? 'text-[#df9f64] translate-x-1 rtl:-translate-x-1' : 'text-[#555]'}`} />
                  </button>
                );
              })}
            </div>

            {/* Main Detail View (ONX / EchoRP Bento Card) */}
            {selectedJob && (
              <div className="lg:col-span-7 bg-[#0d0f16] border border-white/[0.08] rounded-2xl overflow-hidden p-6 sm:p-8 flex flex-col justify-between shadow-2xl relative">
                <div>
                  <div className="relative h-64 rounded-xl overflow-hidden mb-6 border border-white/[0.06] bg-[#131620]">
                    <img
                      src={selectedJob.image}
                      alt={selectedJob.translations[language]?.name || ''}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#0d0f16] via-transparent to-transparent" />
                    <div className="absolute bottom-4 left-4 rtl:left-auto rtl:right-4">
                      <span className={`px-3 py-1 rounded-lg text-xs font-black uppercase tracking-wider shadow-md ${
                        selectedJob.status === 'HIRING_OPEN'
                          ? 'bg-[#c8874b] text-black font-black'
                          : selectedJob.status === 'INVITE_ONLY'
                          ? 'bg-purple-600 text-white'
                          : 'bg-zinc-800 text-zinc-400'
                      }`}>
                        {selectedJob.status === 'HIRING_OPEN'
                          ? (language === 'ar' ? 'التقديم متاح الآن' : 'RECRUITMENT OPEN')
                          : selectedJob.status === 'INVITE_ONLY'
                          ? (language === 'ar' ? 'عبر الدعوات فقط' : 'INVITE ONLY')
                          : (language === 'ar' ? 'مغلق مؤقتاً' : 'RECRUITMENT CLOSED')}
                      </span>
                    </div>
                  </div>

                  <h2 className="text-2xl sm:text-3xl font-black text-white mb-2 tracking-tight">
                    {selectedJob.translations[language]?.name || selectedJob.translations.ar.name}
                  </h2>

                  <p className="text-xs sm:text-sm text-[#969cad] leading-relaxed mb-6">
                    {selectedJob.translations[language]?.description || selectedJob.translations.ar.description}
                  </p>

                  <div className="grid grid-cols-2 gap-4 p-4 rounded-xl bg-[#08090d] border border-white/[0.05] mb-6">
                    <div>
                      <span className="text-[11px] text-[#7a8091] uppercase font-bold block mb-1">{t('jobs.salaryRange')}</span>
                      <p className="text-xl font-black text-[#df9f64] font-rajdhani">
                        ${selectedJob.salaryMin} - ${selectedJob.salaryMax} <span className="text-xs text-[#888]">/ hr</span>
                      </p>
                    </div>
                    <div>
                      <span className="text-[11px] text-[#7a8091] uppercase font-bold block mb-1">القطاع / Department</span>
                      <p className="text-sm font-black text-white font-rajdhani">{selectedJob.category}</p>
                    </div>
                  </div>

                  {/* Requirements */}
                  <div className="mb-6">
                    <h4 className="text-xs font-black uppercase tracking-wider text-[#df9f64] mb-3 flex items-center gap-2">
                      <Award className="w-4 h-4 text-[#c8874b]" />
                      <span>{t('jobs.requirements')}</span>
                    </h4>
                    <div className="space-y-2">
                      {(selectedJob.translations[language]?.requirements || selectedJob.translations.ar.requirements).map(
                        (req, i) => (
                          <div key={i} className="flex items-start gap-2.5 text-xs text-[#d1d5db]">
                            <CheckCircle2 className="w-4 h-4 text-[#c8874b] shrink-0 mt-0.5" />
                            <span>{req}</span>
                          </div>
                        )
                      )}
                    </div>
                  </div>

                  {/* Duties */}
                  <div className="mb-8">
                    <h4 className="text-xs font-black uppercase tracking-wider text-[#df9f64] mb-3 flex items-center gap-2">
                      <Layers className="w-4 h-4 text-[#c8874b]" />
                      <span>{t('jobs.duties')}</span>
                    </h4>
                    <div className="space-y-2">
                      {(selectedJob.translations[language]?.duties || selectedJob.translations.ar.duties).map(
                        (duty, i) => (
                          <div key={i} className="flex items-start gap-2.5 text-xs text-[#969cad]">
                            <div className="w-1.5 h-1.5 rounded-full bg-[#c8874b] shrink-0 mt-1.5" />
                            <span>{duty}</span>
                          </div>
                        )
                      )}
                    </div>
                  </div>
                </div>

                {/* Application CTA State Handling */}
                <div className="pt-6 border-t border-white/[0.06]">
                  {!isAuthenticated ? (
                    <button
                      onClick={loginWithDiscord}
                      className="w-full py-4 rounded-xl bg-[#5865F2] hover:bg-[#4752C4] text-white font-black text-xs uppercase tracking-wider transition-all shadow-xl shadow-[#5865F2]/20 flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <LogIn className="w-4 h-4" />
                      <span>{language === 'ar' ? 'تسجيل الدخول عبر ديسكورد للتقديم على الوظيفة' : 'Sign In with Discord to Apply'}</span>
                    </button>
                  ) : activeApplication ? (
                    <div className="p-4 rounded-xl bg-[#08090d] border border-white/[0.06] space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <FileCheck className="w-5 h-5 text-[#c8874b]" />
                          <span className="text-xs sm:text-sm font-bold text-white">
                            {language === 'ar' ? 'لديك طلب مقدم لهذه الوظيفة' : 'Active Application on File'}
                          </span>
                        </div>
                        <span className={`px-2.5 py-0.5 rounded-full text-xs font-black ${
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
                      <p className="text-xs text-[#7a8091]">
                        {language === 'ar' ? 'الشخصية:' : 'Character:'} <span className="text-white font-bold">{activeApplication.characterName}</span> • {language === 'ar' ? 'تاريخ التقديم:' : 'Applied:'} {new Date(activeApplication.createdAt).toLocaleDateString(language === 'ar' ? 'ar-SA' : 'en-US')}
                      </p>
                      {activeApplication.reviewNotes && (
                        <div className="p-2.5 rounded-xl bg-[#131620] text-xs text-[#969cad] border border-white/[0.06]">
                          <span className="font-bold text-[#df9f64]">{language === 'ar' ? 'ملاحظة الإدارة: ' : 'Staff Note: '}</span>
                          <span>{activeApplication.reviewNotes}</span>
                        </div>
                      )}
                      <button
                        onClick={() => setCurrentTab('dashboard')}
                        className="w-full py-2.5 rounded-xl bg-[#131620] hover:bg-[#1c202d] text-xs font-bold text-white transition-all text-center cursor-pointer border border-white/[0.08]"
                      >
                        {language === 'ar' ? 'عرض ومتابعة كافة طلباتي في لوحة التحكم' : 'View & Track Applications in Dashboard'}
                      </button>
                    </div>
                  ) : selectedJob.status === 'HIRING_CLOSED' ? (
                    <button
                      disabled
                      className="w-full py-4 rounded-xl bg-[#131620] border border-white/[0.06] text-[#666] font-black text-xs uppercase tracking-wider cursor-not-allowed"
                    >
                      {t('jobs.hiringClosed')}
                    </button>
                  ) : (
                    <button
                      onClick={() => setIsModalOpen(true)}
                      className="w-full py-4 rounded-xl bg-[#c8874b] hover:bg-[#df9f64] text-black font-black text-xs uppercase tracking-wider transition-all shadow-xl shadow-[#c8874b]/25 cursor-pointer flex items-center justify-center gap-2"
                    >
                      <Briefcase className="w-4 h-4" />
                      <span>{t('jobs.applyNow')}</span>
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

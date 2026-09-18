import React, { useState } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { useAuth } from '../../context/AuthContext';
import { apiClient } from '../../services/apiClient';
import { JobItem, JobApplication } from '../../types';
import { 
  X, 
  Send, 
  User as UserIcon, 
  Clock, 
  ShieldAlert, 
  CheckCircle2, 
  AlertCircle, 
  Loader2,
  FileText,
  Calendar
} from 'lucide-react';

interface JobApplicationModalProps {
  job: JobItem;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (application: JobApplication) => void;
  onNavigateToDashboard?: () => void;
}

export const JobApplicationModal: React.FC<JobApplicationModalProps> = ({
  job,
  isOpen,
  onClose,
  onSuccess,
  onNavigateToDashboard
}) => {
  const { language } = useLanguage();
  const { user } = useAuth();

  const [characterName, setCharacterName] = useState('');
  const [characterAge, setCharacterAge] = useState<string>('24');
  const [experience, setExperience] = useState('');
  const [dailyAvailability, setDailyAvailability] = useState('4-6 ساعات يومياً');
  const [scenarioAnswer, setScenarioAnswer] = useState('');
  const [agreedToRules, setAgreedToRules] = useState(false);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [submittedApplication, setSubmittedApplication] = useState<JobApplication | null>(null);

  if (!isOpen) return null;

  const isAr = language === 'ar';
  const trans = job.translations[language] || job.translations.ar;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!characterName.trim()) {
      setErrorMessage(
        isAr 
          ? 'يرجى إدخال اسم الشخصية في الرول بلاي بشكل صحيح (مثال: سلطان القحطاني)'
          : 'Please enter character name for roleplay (e.g. Sultan Al-Qahtani)'
      );
      return;
    }

    const ageNum = parseInt(characterAge, 10);
    if (isNaN(ageNum) || ageNum < 16 || ageNum > 80) {
      setErrorMessage(
        isAr 
          ? 'عمر الشخصية يجب أن يكون بين 16 و 80 عاماً'
          : 'Character age must be between 16 and 80 years'
      );
      return;
    }

    if (!dailyAvailability.trim()) {
      setErrorMessage(
        isAr 
          ? 'يرجى تحديد معدل ساعات التواجد اليومي التقريبي'
          : 'Please specify your daily shift availability'
      );
      return;
    }

    if (!experience.trim() || experience.trim().length < 20) {
      setErrorMessage(
        isAr 
          ? 'يرجى كتابة نبذة كافية عن خبراتك السابقة في رول بلاي FiveM (20 حرف على الأقل)'
          : 'Please write a brief summary of your previous FiveM RP experience (minimum 20 characters)'
      );
      return;
    }

    if (!agreedToRules) {
      setErrorMessage(
        isAr 
          ? 'يجب الموافقة والتعهد بالالتزام بأنظمة وقوانين السيرفر قبل إرسال الطلب'
          : 'You must agree to server rules and guidelines before submitting'
      );
      return;
    }

    setIsSubmitting(true);
    try {
      const answers: Record<string, any> = {};
      if (scenarioAnswer.trim()) {
        answers['scenario_rp_resolution'] = scenarioAnswer.trim();
      }

      const res = await apiClient.submitJobApplication(job.id, {
        characterName: characterName.trim(),
        characterAge: ageNum,
        experience: experience.trim(),
        dailyAvailability: dailyAvailability.trim(),
        answers
      });

      setSubmittedApplication(res);
      onSuccess(res);
    } catch (err: any) {
      setErrorMessage(
        err.message || (isAr ? 'حدث خطأ أثناء إرسال الطلب، يرجى المحاولة لاحقاً.' : 'Failed to submit application. Please try again.')
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto">
      <div 
        className="relative w-full max-w-2xl bg-[#0E0E0E] border border-[#222] rounded-3xl p-6 sm:p-8 shadow-2xl my-8 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 rtl:right-auto rtl:left-5 p-2 rounded-xl bg-[#1A1A1A] hover:bg-[#2A2A2A] text-[#888] hover:text-white transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {submittedApplication ? (
          /* Success Screen */
          <div className="py-8 text-center space-y-5">
            <div className="w-16 h-16 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto shadow-lg shadow-emerald-500/10">
              <CheckCircle2 className="w-8 h-8" />
            </div>

            <div className="space-y-2">
              <h3 className="text-2xl font-black text-white">
                {isAr ? 'تم استلام طلب التوظيف بنجاح!' : 'Application Submitted Successfully!'}
              </h3>
              <p className="text-[#888] text-sm max-w-md mx-auto leading-relaxed">
                {isAr ? (
                  <>تم تسجيل طلبك لوظيفة <span className="text-[#C8874B] font-bold">[{trans.name}]</span> بنجاح. سيقوم مسؤولو التوظيف بمراجعة طلبك وإشعارك بالنتيجة.</>
                ) : (
                  <>Your application for <span className="text-[#C8874B] font-bold">[{trans.name}]</span> has been registered. Staff will review it and notify you.</>
                )}
              </p>
            </div>

            <div className="bg-[#141414] border border-[#222] rounded-2xl p-4 text-xs text-[#999] max-w-md mx-auto space-y-2">
              <div className="flex justify-between items-center py-1 border-b border-[#1E1E1E]">
                <span>{isAr ? 'رقم مرجع الطلب:' : 'Application ID:'}</span>
                <span className="font-mono text-[#C8874B]">{submittedApplication.id}</span>
              </div>
              <div className="flex justify-between items-center py-1 border-b border-[#1E1E1E]">
                <span>{isAr ? 'اسم الشخصية:' : 'Character Name:'}</span>
                <span className="text-white font-bold">{submittedApplication.characterName}</span>
              </div>
              <div className="flex justify-between items-center py-1">
                <span>{isAr ? 'الحالة الحالية:' : 'Current Status:'}</span>
                <span className="px-2.5 py-0.5 rounded-full bg-amber-500/10 text-amber-400 font-bold">
                  {isAr ? 'قيد الانتظار (PENDING)' : 'Pending Review'}
                </span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 justify-center pt-3">
              {onNavigateToDashboard && (
                <button
                  onClick={() => {
                    onClose();
                    onNavigateToDashboard();
                  }}
                  className="px-6 py-3 rounded-xl bg-[#C8874B] text-black font-extrabold text-sm hover:brightness-110 transition-all cursor-pointer"
                >
                  {isAr ? 'متابعة الطلب في لوحة التحكم' : 'View in Dashboard'}
                </button>
              )}
              <button
                onClick={onClose}
                className="px-6 py-3 rounded-xl bg-[#1A1A1A] border border-[#2A2A2A] text-white font-bold text-sm hover:bg-[#252525] transition-all cursor-pointer"
              >
                {isAr ? 'إغلاق النافذة' : 'Close'}
              </button>
            </div>
          </div>
        ) : (
          /* Application Form */
          <div>
            {/* Header */}
            <div className="mb-6 pb-6 border-b border-[#1C1C1C]">
              <span className="text-[11px] font-extrabold uppercase tracking-widest text-[#C8874B] block mb-1">
                {isAr ? `استمارة التقديم الرسمية • ${job.category}` : `Official Application Form • ${job.category}`}
              </span>
              <h2 className="text-2xl font-black text-white flex items-center gap-2">
                <span>{isAr ? `تقديم طلب: ${trans.name}` : `Apply for: ${trans.name}`}</span>
              </h2>
              <p className="text-[#777] text-xs mt-1">
                {isAr ? 'مقدم الطلب: ' : 'Applicant: '}<span className="text-white font-bold">{user?.globalName || user?.username}</span> (Discord ID: {user?.discordId})
              </p>
            </div>

            {errorMessage && (
              <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs flex items-center gap-3">
                <AlertCircle className="w-5 h-5 shrink-0 text-red-400" />
                <span>{errorMessage}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Character Details Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-[#AAA] mb-2 flex items-center gap-1.5">
                    <UserIcon className="w-3.5 h-3.5 text-[#C8874B]" />
                    <span>{isAr ? 'اسم الشخصية داخل اللعبة (كامل)' : 'Character Full Name'}</span>
                  </label>
                  <input
                    type="text"
                    value={characterName}
                    onChange={(e) => setCharacterName(e.target.value)}
                    placeholder={isAr ? 'مثال: سلطان القحطاني' : 'e.g. Sultan Al-Qahtani'}
                    className="w-full px-4 py-3 rounded-xl bg-[#141414] border border-[#222] focus:border-[#C8874B] focus:outline-none text-white text-sm transition-colors placeholder:text-[#555]"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#AAA] mb-2 flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-[#C8874B]" />
                    <span>{isAr ? 'عمر الشخصية (سنوات)' : 'Character Age (Years)'}</span>
                  </label>
                  <input
                    type="number"
                    value={characterAge}
                    onChange={(e) => setCharacterAge(e.target.value)}
                    min={16}
                    max={80}
                    placeholder="24"
                    className="w-full px-4 py-3 rounded-xl bg-[#141414] border border-[#222] focus:border-[#C8874B] focus:outline-none text-white text-sm transition-colors placeholder:text-[#555]"
                    required
                  />
                </div>
              </div>

              {/* Availability */}
              <div>
                <label className="block text-xs font-bold text-[#AAA] mb-2 flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-[#C8874B]" />
                  <span>{isAr ? 'معدل التواجد وساعات الوردية اليومية' : 'Daily Availability & Shift Hours'}</span>
                </label>
                <input
                  type="text"
                  value={dailyAvailability}
                  onChange={(e) => setDailyAvailability(e.target.value)}
                  placeholder={isAr ? 'مثال: 4 إلى 6 ساعات (الفترة المسائية من 6 م إلى 12 ص)' : 'e.g. 4-6 hours daily (evening shift)'}
                  className="w-full px-4 py-3 rounded-xl bg-[#141414] border border-[#222] focus:border-[#C8874B] focus:outline-none text-white text-sm transition-colors placeholder:text-[#555]"
                  required
                />
              </div>

              {/* Experience */}
              <div>
                <label className="block text-xs font-bold text-[#AAA] mb-2 flex items-center gap-1.5">
                  <FileText className="w-3.5 h-3.5 text-[#C8874B]" />
                  <span>{isAr ? 'الخبرات السابقة في رول بلاي FiveM والقطاعات المشابهة' : 'Previous FiveM RP Experience'}</span>
                </label>
                <textarea
                  rows={3}
                  value={experience}
                  onChange={(e) => setExperience(e.target.value)}
                  placeholder={isAr ? 'اذكر السيرفرات التي لعبت بها، الرتب أو المناصب السابقة، ومدى معرفتك بمصطلحات الـ RP...' : 'Mention servers played, previous ranks, and familiarity with roleplay terminology...'}
                  className="w-full px-4 py-3 rounded-xl bg-[#141414] border border-[#222] focus:border-[#C8874B] focus:outline-none text-white text-sm transition-colors placeholder:text-[#555] resize-none"
                  required
                />
              </div>

              {/* Scenario Questions */}
              <div>
                <label className="block text-xs font-bold text-[#AAA] mb-2 flex items-center gap-1.5">
                  <ShieldAlert className="w-3.5 h-3.5 text-[#C8874B]" />
                  <span>{isAr ? 'سؤال سيناريو: كيف تتصرف إذا واجهت حالة كسر رول بلاي (Fail RP) أثناء أداء واجبك؟' : 'Scenario Question: How do you handle a Fail RP incident while on duty?'}</span>
                </label>
                <textarea
                  rows={2}
                  value={scenarioAnswer}
                  onChange={(e) => setScenarioAnswer(e.target.value)}
                  placeholder={isAr ? 'اكتب كيف ستتعامل مع الموقف دون الخروج من الشخصية (Stay In Character)...' : 'Describe how you maintain character and resolve the situation in-character...'}
                  className="w-full px-4 py-3 rounded-xl bg-[#141414] border border-[#222] focus:border-[#C8874B] focus:outline-none text-white text-sm transition-colors placeholder:text-[#555] resize-none"
                />
              </div>

              {/* Terms Checkbox */}
              <div className="p-4 rounded-xl bg-[#141414] border border-[#1F1F1F]">
                <label className="flex items-start gap-3 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={agreedToRules}
                    onChange={(e) => setAgreedToRules(e.target.checked)}
                    className="mt-0.5 rounded border-gray-700 text-[#C8874B] focus:ring-[#C8874B]"
                  />
                  <span className="text-xs text-[#999] leading-relaxed">
                    {isAr 
                      ? 'أتعهد بالالتزام التام بكافة قوانين السيرفر ولوائح هذا القطاع، وعدم استغلال الصلاحيات أو الرتب، وأقر بأن تقديم معلومات كاذبة يعرّض الطلب وحسابي للمساءلة.'
                      : 'I hereby pledge to strictly adhere to all server rules and department regulations, avoid powergaming/abuse, and acknowledge that providing falsified details will lead to application dismissal.'}
                  </span>
                </label>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-5 py-3 rounded-xl bg-[#181818] hover:bg-[#222] text-[#AAA] hover:text-white text-xs font-bold transition-all cursor-pointer"
                >
                  {isAr ? 'إلغاء' : 'Cancel'}
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-7 py-3 rounded-xl bg-gradient-to-r from-[#C8874B] to-[#DF9F64] text-black font-extrabold text-xs tracking-wide hover:brightness-110 transition-all flex items-center gap-2 shadow-lg shadow-[#C8874B]/20 disabled:opacity-50 cursor-pointer"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>{isAr ? 'جاري إرسال الطلب...' : 'Submitting...'}</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      <span>{isAr ? 'إرسال طلب التوظيف' : 'Submit Application'}</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};

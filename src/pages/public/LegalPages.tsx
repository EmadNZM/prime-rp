import React from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { ShieldCheck, FileText, ArrowLeft, ArrowRight, Scale, RefreshCw } from 'lucide-react';

interface LegalPageProps {
  type: 'terms' | 'privacy';
  onBack: () => void;
}

export const LegalPages: React.FC<LegalPageProps> = ({ type, onBack }) => {
  const { language, isRtl } = useLanguage();
  const BackArrow = isRtl ? ArrowRight : ArrowLeft;

  return (
    <div className="min-h-screen bg-[#08090d] text-[#f1f3f7] pt-32 pb-28 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Background ambient glow */}
      <div className="absolute top-10 left-1/2 -translate-x-1/2 w-full max-w-5xl h-[450px] bg-[#c8874b]/5 blur-[160px] pointer-events-none rounded-full" />

      <div className="max-w-4xl mx-auto relative z-10">
        <button
          onClick={onBack}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#0d0f16] border border-white/[0.08] text-[#969cad] hover:text-white hover:border-[#c8874b]/50 transition-all text-xs font-bold mb-8 cursor-pointer"
        >
          <BackArrow className="w-4 h-4" />
          <span>{language === 'ar' ? 'الرجوع إلى الصفحة الرئيسية' : 'Return to Homepage'}</span>
        </button>

        <div className="bg-[#0d0f16] border border-white/[0.08] rounded-2xl p-8 sm:p-12 shadow-2xl relative overflow-hidden">
          {/* Top copper accent */}
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-[#c8874b] to-transparent" />

          <div className="flex items-center gap-3.5 mb-8">
            <div className="w-12 h-12 rounded-xl bg-[#c8874b]/10 border border-[#c8874b]/30 flex items-center justify-center text-[#df9f64]">
              {type === 'terms' ? (
                <FileText className="w-6 h-6" />
              ) : (
                <ShieldCheck className="w-6 h-6" />
              )}
            </div>
            <div>
              <span className="text-[10px] font-black uppercase tracking-wider text-[#df9f64] font-mono block">
                PRIME RP LEGAL & COMPLIANCE
              </span>
              <h1 className="text-2xl sm:text-3xl font-black text-white uppercase tracking-tight font-rajdhani">
                {type === 'terms' 
                  ? (language === 'ar' ? 'الشروط والأحكام وسياسة الاستخدام' : 'Terms of Service & Citizen Agreement') 
                  : (language === 'ar' ? 'سياسة الخصوصية وحماية البيانات' : 'Privacy Policy & Data Protection')}
              </h1>
            </div>
          </div>

          <div className="prose prose-invert max-w-none text-[#969cad] text-sm leading-loose space-y-6">
            {type === 'terms' ? (
              <>
                <p className="text-base text-[#d1d5db]">
                  {language === 'ar'
                    ? 'أهلاً بك في منصة PRIME RP. بدخولك واستخدامك لمنصتنا وسيرفر FiveM الرسمي الخاص بنا، فإنك توافق على الالتزام الكامل بهذه الشروط والضوابط القانونية والإدارية المعمول بها في مجتمعنا.'
                    : 'Welcome to PRIME RP. By accessing our web platform and connecting to our official FiveM server, you agree to be legally bound by these terms and roleplay governance protocols.'}
                </p>

                <h3 className="text-base font-bold text-white border-b border-white/[0.06] pb-2 flex items-center gap-2">
                  <Scale className="w-4 h-4 text-[#c8874b]" />
                  <span>{language === 'ar' ? '1. قواعد الرول بلاي والسلوك العام' : '1. Roleplay Code of Conduct'}</span>
                </h3>
                <p>
                  {language === 'ar'
                    ? 'يجب على جميع اللاعبين الالتزام الصارم بقوانين تقمّص الأدوار الواقعي (Roleplay Rules)، وتجنب مخالفات VDM و RDM والـ Fail RP والـ Combat Logging. تحتفظ إدارة السيرفر بحق اتخاذ الإجراءات التأديبية بما فيها الحظر المؤقت أو النهائي دون إنذار مسبق في حال ارتكاب مخالفات جسيمة تمس استقرار وتجربة المجتمع.'
                    : 'All citizens must strictly abide by realistic roleplay standards, zero-tolerance policies on RDM/VDM/Fail RP, and respectful community conduct. Server administration reserves the right to issue warnings, temporary bans, or permanent account revocations for egregious violations.'}
                </p>

                <h3 className="text-base font-bold text-white border-b border-white/[0.06] pb-2 flex items-center gap-2">
                  <RefreshCw className="w-4 h-4 text-[#c8874b]" />
                  <span>{language === 'ar' ? '2. متجر السيرفر، المشتريات وسياسة الاسترداد' : '2. Store Purchases & Non-Refundable Policy'}</span>
                </h3>
                <p>
                  {language === 'ar'
                    ? 'جميع المشتريات والاشتراكات في متجر PRIME RP هي مساهمات وتبرعات رقمية طوعية تهدف حصراً لدعم تكاليف البنية التحتية واستمرارية وخوادم السيرفر. نظراً للطبيعة الفورية للسلع الرقمية وتسليمها الفوري، فإن جميع المبيعات نهائية وغير قابلة للاسترداد المالي (Strictly Non-refundable) وفقاً لسياسات Cfx.re و FiveM الرسمية.'
                    : 'All digital assets, vehicles, and subscriptions purchased via the PRIME store are voluntary contributions directly supporting infrastructure and server operational costs. Due to instant digital fulfillment, all sales are strictly final and non-refundable in accordance with standard Cfx.re / Tebex guidelines.'}
                </p>

                <h3 className="text-base font-bold text-white border-b border-white/[0.06] pb-2 flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-[#c8874b]" />
                  <span>{language === 'ar' ? '3. حماية الحسابات والمسؤولية الأمنية' : '3. Account Security & Integrity'}</span>
                </h3>
                <p>
                  {language === 'ar'
                    ? 'المستخدم مسؤول مسؤولية كاملة عن أمان حسابه في ديسكورد وربطه بالمنصة. يمنع منعاً باتاً مشاركة الحسابات، بيع الأصول الرقمية بأموال حقيقية خارج المنصة الرسمية، أو استغلال أي ثغرات برمجية (Glitching/Duping).'
                    : 'Users are solely responsible for maintaining security of their Discord credentials and API tokens. Account trading, unauthorized third-party real-money trading (RMT), and gameplay exploit usage will trigger instant permanent bans.'}
                </p>
              </>
            ) : (
              <>
                <p className="text-base text-[#d1d5db]">
                  {language === 'ar'
                    ? 'نحن في PRIME RP نولي اهتماماً فائقاً لحماية خصوصية بيانات مجتمعنا وشفافية التعامل معها وفق أعلى المعايير الأمنية.'
                    : 'PRIME RP is dedicated to protecting player privacy and handling data with total integrity and security standards.'}
                </p>

                <h3 className="text-base font-bold text-white border-b border-white/[0.06] pb-2 flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-[#c8874b]" />
                  <span>{language === 'ar' ? '1. البيانات التي نقوم بجمعها' : '1. Collected Information'}</span>
                </h3>
                <p>
                  {language === 'ar'
                    ? 'نستخدم تقنية Discord OAuth2 الرسمية للحصول على معرّفك العام (Discord ID)، اسم المستخدم، وصورتك الرمزية فقط للتحقق من هويتك ومزامنة رتبك داخل مجتمع السيرفر. لا نطلب ولا نخزن كلمات المرور الخاصة بك إطلاقاً.'
                    : 'We authenticate users strictly via official Discord OAuth2 to retrieve public profile metadata (User ID, Avatar URL, Display Name, and guild roles). We never have access to, or request, your personal Discord password.'}
                </p>

                <h3 className="text-base font-bold text-white border-b border-white/[0.06] pb-2 flex items-center gap-2">
                  <FileText className="w-4 h-4 text-[#c8874b]" />
                  <span>{language === 'ar' ? '2. أمان وتخزين البيانات' : '2. Security & Data Storage'}</span>
                </h3>
                <p>
                  {language === 'ar'
                    ? 'تخزن سجلات الأنشطة وتذاكر الدعم والطلبات في قواعد بيانات محمية بجدران نارية متطورة وتشفير عالي. لا يتم بيع، تداول، أو مشاركة أي بيانات شخصية مع أي جهات خارجية إطلاقاً.'
                    : 'All activity records, support tickets, and telemetry logs are maintained within encrypted databases. We never sell, lease, or distribute community information to advertisers or external commercial third parties.'}
                </p>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

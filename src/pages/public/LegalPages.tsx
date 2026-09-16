import React from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { ShieldCheck, FileText, ArrowLeft, ArrowRight } from 'lucide-react';

interface LegalPageProps {
  type: 'terms' | 'privacy';
  onBack: () => void;
}

export const LegalPages: React.FC<LegalPageProps> = ({ type, onBack }) => {
  const { isRtl } = useLanguage();
  const BackArrow = isRtl ? ArrowRight : ArrowLeft;

  return (
    <div className="min-h-screen bg-[#070707] text-[#E5E5E5] pt-28 pb-24 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <button
          onClick={onBack}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#111] border border-[#222] text-[#AAA] hover:text-white hover:border-[#C8874B] transition-all text-xs font-bold mb-8"
        >
          <BackArrow className="w-4 h-4" />
          <span>الرجوع إلى الصفحة الرئيسية</span>
        </button>

        <div className="bg-[#0B0B0B] border border-[#1E1E1E] rounded-3xl p-8 sm:p-12 shadow-2xl">
          <div className="flex items-center gap-3 mb-6">
            {type === 'terms' ? (
              <FileText className="w-8 h-8 text-[#C8874B]" />
            ) : (
              <ShieldCheck className="w-8 h-8 text-[#C8874B]" />
            )}
            <h1 className="text-3xl font-black text-white">
              {type === 'terms' ? 'الشروط والأحكام (Terms of Service)' : 'سياسة الخصوصية (Privacy Policy)'}
            </h1>
          </div>

          <div className="prose prose-invert max-w-none text-[#A5A5A5] text-sm leading-loose space-y-6">
            {type === 'terms' ? (
              <>
                <p>
                  أهلاً بك في منصة <strong>PRIME RP</strong>. بدخولك واستخدامك لمنصتنا أو سيرفر FiveM الخاص بنا، فإنك توافق على الالتزام الكامل بهذه الشروط والقوانين المعمول بها.
                </p>
                <h3 className="text-lg font-bold text-white border-b border-[#222] pb-2">1. قواعد الرول بلاي والسلوك العام</h3>
                <p>
                  يجب على جميع اللاعبين الالتزام الصارم بقوانين تقمّص الأدوار الواقعي (Roleplay Rules)، وتجنب مخالفات VDM و RDM والـ Fail RP. تحتفظ إدارة السيرفر بحق اتخاذ الإجراءات التأديبية بما فيها الحظر المؤقت أو النهائي دون إنذار مسبق في حال ارتكاب مخالفات جسيمة.
                </p>
                <h3 className="text-lg font-bold text-white border-b border-[#222] pb-2">2. متجر السيرفر والاشتراكات</h3>
                <p>
                  جميع المشتريات والاشتراكات في متجر PRIME RP هي مساهمات رقمية طوعية لدعم استمرارية وتطوير خوادم السيرفر. جميع المبيعات نهائية وغير قابلة للاسترداد المالي (Non-refundable) وفقاً لسياسات FiveM الرسمية.
                </p>
                <h3 className="text-lg font-bold text-white border-b border-[#222] pb-2">3. حماية الحسابات والمسؤولية</h3>
                <p>
                  المستخدم مسؤول مسؤولية كاملة عن أمان حسابه في ديسكورد وربطه بالمنصة. يمنع منعاً باتاً مشاركة الحسابات أو استغلال أي ثغرات برمجية.
                </p>
              </>
            ) : (
              <>
                <p>
                  نحن في <strong>PRIME RP</strong> نولي اهتماماً فائقاً لحماية خصوصية بيانات مجتمعنا. توضح هذه السياسة طبيعة المعلومات التي يتم جمعها وكيفية التعامل معها.
                </p>
                <h3 className="text-lg font-bold text-white border-b border-[#222] pb-2">1. البيانات التي نقوم بجمعها</h3>
                <p>
                  نستخدم تقنية Discord OAuth2 للحصول على معرّفك العام (Discord ID)، اسم المستخدم، وصورتك الرمزية فقط للتحقق من هويتك داخل مجتمع السيرفر. لا نطلب ولا نخزن كلمات المرور الخاصة بك إطلاقاً.
                </p>
                <h3 className="text-lg font-bold text-white border-b border-[#222] pb-2">2. أمان وتخزين البيانات</h3>
                <p>
                  تخزن سجلات الأنشطة وتذاكر الدعم والطلبات في قواعد بيانات محمية بجدران نارية متطورة، ولا يتم بيع أو مشاركة أي بيانات شخصية مع أي جهات خارجية.
                </p>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

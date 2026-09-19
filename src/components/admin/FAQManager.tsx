import React, { useState, useEffect } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { apiClient } from '../../services/apiClient';
import { FAQItem } from '../../types';
import { 
  HelpCircle, 
  Plus, 
  Trash2, 
  Edit3, 
  Check, 
  X, 
  AlertCircle, 
  Search, 
  ChevronDown, 
  ChevronUp 
} from 'lucide-react';

export const FAQManager: React.FC = () => {
  const { language } = useLanguage();

  const [faqs, setFaqs] = useState<FAQItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [activeCategory, setActiveCategory] = useState<string>('ALL');

  // Modal State
  const [showModal, setShowModal] = useState<boolean>(false);
  const [editingFaq, setEditingFaq] = useState<FAQItem | null>(null);
  const [formData, setFormData] = useState<any>({
    category: 'عام',
    translations: {
      ar: { question: '', answer: '' },
      en: { question: '', answer: '' }
    }
  });

  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; msg: string } | null>(null);

  useEffect(() => {
    loadFaqs();
  }, []);

  const loadFaqs = async () => {
    setIsLoading(true);
    try {
      const data = await apiClient.getAdminFAQ();
      if (Array.isArray(data)) {
        setFaqs(data);
      }
    } catch (err) {
      console.error('Failed to load FAQs:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenAdd = () => {
    setEditingFaq(null);
    setFormData({
      category: 'عام',
      translations: {
        ar: { question: '', answer: '' },
        en: { question: '', answer: '' }
      }
    });
    setShowModal(true);
  };

  const handleOpenEdit = (faq: FAQItem) => {
    setEditingFaq(faq);
    setFormData({
      category: faq.category || 'عام',
      translations: {
        ar: {
          question: faq.translations?.ar?.question || '',
          answer: faq.translations?.ar?.answer || ''
        },
        en: {
          question: faq.translations?.en?.question || '',
          answer: faq.translations?.en?.answer || ''
        }
      }
    });
    setShowModal(true);
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm(language === 'ar' ? 'هل تريد بالتأكيد حذف هذا السؤال؟' : 'Delete this FAQ item?')) {
      return;
    }
    try {
      await apiClient.deleteFAQ(id);
      setFaqs(prev => prev.filter(f => f.id !== id));
      setFeedback({
        type: 'success',
        msg: language === 'ar' ? 'تم حذف السؤال بنجاح' : 'FAQ deleted'
      });
      setTimeout(() => setFeedback(null), 3000);
    } catch (err) {
      setFeedback({
        type: 'error',
        msg: language === 'ar' ? 'فشل حذف السؤال' : 'Failed to delete FAQ'
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const itemToSave = {
        id: editingFaq ? editingFaq.id : undefined,
        category: formData.category,
        translations: formData.translations
      };
      await apiClient.saveFAQ(itemToSave);
      setShowModal(false);
      loadFaqs();
      setFeedback({
        type: 'success',
        msg: language === 'ar' ? 'تم حفظ السؤال وإجابته بنجاح' : 'FAQ item saved successfully'
      });
      setTimeout(() => setFeedback(null), 3000);
    } catch (err) {
      setFeedback({
        type: 'error',
        msg: language === 'ar' ? 'حدث خطأ أثناء حفظ السؤال' : 'Failed to save FAQ'
      });
    } finally {
      setIsSaving(false);
    }
  };

  const filteredFaqs = faqs.filter(f => {
    const qAr = f.translations?.ar?.question || '';
    const qEn = f.translations?.en?.question || '';
    const matchesSearch = qAr.toLowerCase().includes(searchTerm.toLowerCase()) || qEn.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = activeCategory === 'ALL' || f.category === activeCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Top Banner */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-[#11131b] via-[#151926] to-[#11131b] border border-white/[0.08] shadow-2xl relative overflow-hidden flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-black text-[#df9f64] uppercase tracking-wider mb-2">
            <HelpCircle className="w-4 h-4 text-[#c8874b]" />
            <span>{language === 'ar' ? 'مركز الأسئلة الشائعة (FAQ CMS)' : 'FAQ & Knowledge Base Management'}</span>
          </div>
          <h2 className="text-2xl font-black text-white tracking-tight">
            {language === 'ar' ? 'إدارة بنك الأسئلة الشائعة والدليل التوجيهي' : 'Manage Frequently Asked Questions'}
          </h2>
          <p className="text-xs sm:text-sm text-[#8c92a4] mt-1 max-w-xl">
            {language === 'ar'
              ? 'إضافة وتعديل الأسئلة الأكثر تكراراً للمواطنين بخصوص دخول السيرفر، المتجر، والقوانين باللغتين العربية والإنجليزية.'
              : 'Publish and organize bilingual FAQs for new players regarding connection, rules, and store perks.'}
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#c8874b] hover:bg-[#df9f64] text-black font-black text-xs uppercase tracking-wider transition-all shadow-lg shadow-[#c8874b]/20 cursor-pointer shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>{language === 'ar' ? 'إضافة سؤال جديد' : 'Add Question'}</span>
        </button>
      </div>

      {feedback && (
        <div className={`p-3.5 rounded-xl text-xs font-bold flex items-center gap-2 border ${
          feedback.type === 'success' 
            ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' 
            : 'bg-rose-500/10 text-rose-400 border-rose-500/20'
        }`}>
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{feedback.msg}</span>
        </div>
      )}

      {/* Filter & Search Strip */}
      <div className="p-4 rounded-xl bg-[#0e1017] border border-white/[0.08] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="relative flex-1 max-w-sm w-full">
          <Search className="w-4 h-4 text-[#7a8091] absolute right-3 rtl:right-3 ltr:left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder={language === 'ar' ? 'بحث في الأسئلة...' : 'Search questions...'}
            className="w-full bg-[#151926] border border-white/[0.08] rounded-xl px-9 py-2 text-xs text-white focus:outline-none focus:border-[#c8874b]"
          />
        </div>

        <div className="flex flex-wrap gap-2">
          {['ALL', 'عام', 'المتجر', 'تقني', 'القوانين'].map(cat => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                activeCategory === cat
                  ? 'bg-[#c8874b] text-black'
                  : 'bg-[#151926] text-[#8c92a4] hover:text-white'
              }`}
            >
              {cat === 'ALL' ? (language === 'ar' ? 'الكل' : 'All') : cat}
            </button>
          ))}
        </div>
      </div>

      {/* FAQ Items Grid */}
      <div className="space-y-3">
        {filteredFaqs.map(faq => {
          const q = language === 'ar' ? faq.translations?.ar?.question : faq.translations?.en?.question;
          const a = language === 'ar' ? faq.translations?.ar?.answer : faq.translations?.en?.answer;

          return (
            <div
              key={faq.id}
              className="p-5 rounded-2xl bg-[#0e1017] border border-white/[0.08] hover:border-white/[0.15] transition-all space-y-3"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="space-y-1.5 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase bg-[#c8874b]/15 text-[#df9f64] border border-[#c8874b]/30">
                      {faq.category || 'عام'}
                    </span>
                    <h3 className="text-sm font-black text-white">{q || 'سؤال غير معنون'}</h3>
                  </div>
                  <p className="text-xs text-[#8c92a4] leading-relaxed whitespace-pre-line">{a}</p>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => handleOpenEdit(faq)}
                    className="p-2 rounded-xl bg-[#151926] hover:bg-[#c8874b] hover:text-black text-[#8c92a4] transition-all cursor-pointer"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => handleDelete(faq.id)}
                    className="p-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 transition-all cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}

        {filteredFaqs.length === 0 && !isLoading && (
          <div className="p-12 text-center rounded-2xl bg-[#0e1017] border border-white/[0.08] text-xs text-[#7a8091]">
            {language === 'ar' ? 'لا توجد أسئلة شائعة متطابقة.' : 'No FAQ items found.'}
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-xl bg-[#0e1017] border border-white/[0.12] rounded-2xl p-6 shadow-2xl">
            <div className="flex items-center justify-between pb-4 border-b border-white/[0.08]">
              <h3 className="text-base font-black text-white flex items-center gap-2">
                <HelpCircle className="w-4 h-4 text-[#c8874b]" />
                <span>{editingFaq ? (language === 'ar' ? 'تعديل السؤال' : 'Edit FAQ') : (language === 'ar' ? 'إضافة سؤال جديد' : 'Add FAQ')}</span>
              </h3>
              <button
                onClick={() => setShowModal(false)}
                className="p-1.5 rounded-lg bg-white/[0.05] hover:bg-white/[0.1] text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 py-4">
              <div>
                <label className="block text-xs font-bold text-[#8c92a4] mb-1.5">
                  {language === 'ar' ? 'التصنيف' : 'Category'}
                </label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData((prev: any) => ({ ...prev, category: e.target.value }))}
                  className="w-full bg-[#151926] border border-white/[0.1] rounded-xl px-3 py-2 text-xs text-white focus:border-[#c8874b] focus:outline-none"
                >
                  <option value="عام">عام (General)</option>
                  <option value="المتجر">المتجر والاشتراكات (Store)</option>
                  <option value="تقني">الدعم التقني والاتصال (Technical)</option>
                  <option value="القوانين">القوانين والضوابط (Rules)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#8c92a4] mb-1.5">
                  {language === 'ar' ? 'نص السؤال (عربي)' : 'Question (Arabic)'}
                </label>
                <input
                  type="text"
                  required
                  value={formData.translations.ar.question}
                  onChange={(e) => setFormData((prev: any) => ({
                    ...prev,
                    translations: { ...prev.translations, ar: { ...prev.translations.ar, question: e.target.value } }
                  }))}
                  className="w-full bg-[#151926] border border-white/[0.1] rounded-xl px-3 py-2 text-xs text-white focus:border-[#c8874b] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#8c92a4] mb-1.5">
                  {language === 'ar' ? 'الإجابة التفصيلية (عربي)' : 'Answer (Arabic)'}
                </label>
                <textarea
                  rows={3}
                  required
                  value={formData.translations.ar.answer}
                  onChange={(e) => setFormData((prev: any) => ({
                    ...prev,
                    translations: { ...prev.translations, ar: { ...prev.translations.ar, answer: e.target.value } }
                  }))}
                  className="w-full bg-[#151926] border border-white/[0.1] rounded-xl p-3 text-xs text-white focus:border-[#c8874b] focus:outline-none leading-relaxed"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#8c92a4] mb-1.5">
                  {language === 'ar' ? 'نص السؤال (إنجليزي - اختياري)' : 'Question (English)'}
                </label>
                <input
                  type="text"
                  value={formData.translations.en.question}
                  onChange={(e) => setFormData((prev: any) => ({
                    ...prev,
                    translations: { ...prev.translations, en: { ...prev.translations.en, question: e.target.value } }
                  }))}
                  className="w-full bg-[#151926] border border-white/[0.1] rounded-xl px-3 py-2 text-xs text-white focus:border-[#c8874b] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#8c92a4] mb-1.5">
                  {language === 'ar' ? 'الإجابة التفصيلية (إنجليزي - اختياري)' : 'Answer (English)'}
                </label>
                <textarea
                  rows={2}
                  value={formData.translations.en.answer}
                  onChange={(e) => setFormData((prev: any) => ({
                    ...prev,
                    translations: { ...prev.translations, en: { ...prev.translations.en, answer: e.target.value } }
                  }))}
                  className="w-full bg-[#151926] border border-white/[0.1] rounded-xl p-3 text-xs text-white focus:border-[#c8874b] focus:outline-none leading-relaxed"
                />
              </div>

              <div className="pt-4 border-t border-white/[0.08] flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 rounded-xl bg-white/[0.06] text-xs font-bold text-white hover:bg-white/[0.1]"
                >
                  {language === 'ar' ? 'إلغاء' : 'Cancel'}
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-5 py-2 rounded-xl bg-[#c8874b] text-black text-xs font-black uppercase hover:bg-[#df9f64]"
                >
                  {isSaving ? (language === 'ar' ? 'جاري الحفظ...' : 'Saving...') : (language === 'ar' ? 'حفظ ونشر' : 'Save')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

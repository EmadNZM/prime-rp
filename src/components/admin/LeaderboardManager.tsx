import React, { useState, useEffect } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { apiClient } from '../../services/apiClient';
import { LeaderboardEntry } from '../../types';
import { 
  Trophy, 
  Plus, 
  Trash2, 
  Edit3, 
  Crown, 
  Clock, 
  DollarSign, 
  Shield, 
  Crosshair, 
  Check, 
  X, 
  AlertCircle,
  Save,
  Search
} from 'lucide-react';

export const LeaderboardManager: React.FC = () => {
  const { language } = useLanguage();

  const [activeCategory, setActiveCategory] = useState<'playtime' | 'wealth' | 'law' | 'wanted'>('playtime');
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [searchTerm, setSearchTerm] = useState<string>('');

  // Modal State
  const [showModal, setShowModal] = useState<boolean>(false);
  const [editingEntry, setEditingEntry] = useState<LeaderboardEntry | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    rank: 1,
    category: 'playtime' as 'playtime' | 'wealth' | 'law' | 'wanted',
    metric: '',
    subtitle: '',
    badge: '',
    avatar: '',
    discordId: ''
  });

  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; msg: string } | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  useEffect(() => {
    loadLeaderboard();
  }, [activeCategory]);

  const loadLeaderboard = async () => {
    setIsLoading(true);
    try {
      const data = await apiClient.getAdminLeaderboard(activeCategory);
      if (Array.isArray(data)) {
        setEntries(data);
      }
    } catch (err) {
      console.error('Failed to load leaderboard:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenAdd = () => {
    setEditingEntry(null);
    setFormData({
      name: '',
      rank: entries.length + 1,
      category: activeCategory,
      metric: activeCategory === 'playtime' ? '100 ساعة' : activeCategory === 'wealth' ? '$1,000,000' : '50 قضية',
      subtitle: '',
      badge: '',
      avatar: '',
      discordId: ''
    });
    setShowModal(true);
  };

  const handleOpenEdit = (entry: LeaderboardEntry) => {
    setEditingEntry(entry);
    setFormData({
      name: entry.name,
      rank: entry.rank,
      category: entry.category,
      metric: entry.metric,
      subtitle: entry.subtitle || '',
      badge: entry.badge || '',
      avatar: entry.avatar || '',
      discordId: entry.discordId || ''
    });
    setShowModal(true);
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm(language === 'ar' ? 'هل أنت متأكد من حذف هذا السجل من لوحة الشرف؟' : 'Delete this record from leaderboard?')) {
      return;
    }
    try {
      await apiClient.deleteLeaderboardItem(id);
      setEntries(prev => prev.filter(e => e.id !== id));
      setFeedback({
        type: 'success',
        msg: language === 'ar' ? 'تم حذف السجل بنجاح' : 'Record deleted successfully'
      });
      setTimeout(() => setFeedback(null), 3000);
    } catch (err) {
      setFeedback({
        type: 'error',
        msg: language === 'ar' ? 'فشل حذف السجل' : 'Failed to delete record'
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.metric) return;
    setIsSubmitting(true);
    try {
      await apiClient.saveLeaderboardItem({
        id: editingEntry ? editingEntry.id : undefined,
        ...formData
      });
      setShowModal(false);
      loadLeaderboard();
      setFeedback({
        type: 'success',
        msg: language === 'ar' ? 'تم حفظ بيانات التصنيف بنجاح' : 'Leaderboard record saved'
      });
      setTimeout(() => setFeedback(null), 3000);
    } catch (err) {
      setFeedback({
        type: 'error',
        msg: language === 'ar' ? 'حدث خطأ أثناء حفظ السجل' : 'Failed to save record'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const categoryConfigs = [
    { id: 'playtime', nameAr: 'ساعات التواجد', nameEn: 'Most Active', icon: Clock, color: '#38bdf8' },
    { id: 'wealth', nameAr: 'أثرياء المدينة', nameEn: 'Top Wealth', icon: DollarSign, color: '#f59e0b' },
    { id: 'law', nameAr: 'حماة القانون', nameEn: 'Law Enforcement', icon: Shield, color: '#3b82f6' },
    { id: 'wanted', nameAr: 'قائمة المطلوبين', nameEn: 'Most Wanted', icon: Crosshair, color: '#ef4444' }
  ];

  const filteredEntries = entries.filter(e =>
    e.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (e.subtitle && e.subtitle.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Top Banner */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-[#11131b] via-[#151926] to-[#11131b] border border-white/[0.08] shadow-2xl relative overflow-hidden flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-black text-[#df9f64] uppercase tracking-wider mb-2">
            <Trophy className="w-4 h-4 text-[#c8874b]" />
            <span>{language === 'ar' ? 'لوحة الشرف وتصنيفات المدينة (Leaderboard CMS)' : 'City Leaderboards & Hall of Fame'}</span>
          </div>
          <h2 className="text-2xl font-black text-white tracking-tight">
            {language === 'ar' ? 'إدارة تصنيفات اللاعبين والسجلات الرسمية' : 'Manage Player Ranks & Hall of Fame'}
          </h2>
          <p className="text-xs sm:text-sm text-[#8c92a4] mt-1 max-w-xl">
            {language === 'ar'
              ? 'تعديل أو إضافة السجلات الرسمية لقائمة أثرياء السيرفر، ساعات المواطنة، سجلات الأمن، والمطلوبين للعدالة.'
              : 'Add, update or synchronize leaderboard records across activity, wealth, police honor rolls, and wanted criminals.'}
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#c8874b] hover:bg-[#df9f64] text-black font-black text-xs uppercase tracking-wider transition-all shadow-lg shadow-[#c8874b]/20 cursor-pointer shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>{language === 'ar' ? 'إضافة لاعب للتصنيف' : 'Add Player'}</span>
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

      {/* Category Tabs */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {categoryConfigs.map(cat => {
          const Icon = cat.icon;
          const isSelected = activeCategory === cat.id;

          return (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id as any)}
              className={`p-4 rounded-xl border flex items-center gap-3 transition-all cursor-pointer ${
                isSelected
                  ? 'bg-[#151926] border-[#c8874b] shadow-lg shadow-[#c8874b]/10 ring-1 ring-[#c8874b]/40'
                  : 'bg-[#0e1017] border-white/[0.06] hover:bg-[#121520]'
              }`}
            >
              <div 
                className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                style={{ backgroundColor: `${cat.color}20`, color: cat.color }}
              >
                <Icon className="w-5 h-5" />
              </div>
              <div className="text-right rtl:text-right ltr:text-left truncate">
                <h4 className="text-xs font-black text-white truncate">
                  {language === 'ar' ? cat.nameAr : cat.nameEn}
                </h4>
                <span className="text-[10px] text-[#7a8091] font-mono">
                  {cat.id.toUpperCase()}
                </span>
              </div>
            </button>
          );
        })}
      </div>

      {/* Search & Filter Strip */}
      <div className="p-4 rounded-xl bg-[#0e1017] border border-white/[0.08] flex items-center justify-between gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="w-4 h-4 text-[#7a8091] absolute right-3 rtl:right-3 ltr:left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder={language === 'ar' ? 'بحث عن لاعب أو لقب...' : 'Search by name or title...'}
            className="w-full bg-[#151926] border border-white/[0.08] rounded-xl px-9 py-2 text-xs text-white focus:outline-none focus:border-[#c8874b]"
          />
        </div>

        <span className="text-xs text-[#8c92a4] font-mono">
          {filteredEntries.length} {language === 'ar' ? 'سجل' : 'records'}
        </span>
      </div>

      {/* Leaderboard Table Card */}
      <div className="rounded-2xl bg-[#0e1017] border border-white/[0.08] overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-right rtl:text-right ltr:text-left text-xs">
            <thead>
              <tr className="border-b border-white/[0.08] bg-[#121520] text-[#7a8091] font-black uppercase text-[10px] tracking-wider">
                <th className="py-3.5 px-4 w-16 text-center">#</th>
                <th className="py-3.5 px-4">{language === 'ar' ? 'اللاعب / المواطن' : 'Citizen'}</th>
                <th className="py-3.5 px-4">{language === 'ar' ? 'المعيار / الرقم' : 'Metric'}</th>
                <th className="py-3.5 px-4">{language === 'ar' ? 'الوسام / الشارة' : 'Badge'}</th>
                <th className="py-3.5 px-4 text-center">{language === 'ar' ? 'الإجراءات' : 'Actions'}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.05]">
              {filteredEntries.map((entry) => (
                <tr key={entry.id} className="hover:bg-white/[0.02] transition-colors">
                  <td className="py-3 px-4 text-center font-mono font-black">
                    {entry.rank === 1 ? (
                      <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/40">
                        1
                      </span>
                    ) : entry.rank === 2 ? (
                      <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-slate-300/20 text-slate-300 border border-slate-300/40">
                        2
                      </span>
                    ) : entry.rank === 3 ? (
                      <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-amber-700/20 text-amber-600 border border-amber-700/40">
                        3
                      </span>
                    ) : (
                      <span className="text-[#7a8091]">#{entry.rank}</span>
                    )}
                  </td>

                  <td className="py-3 px-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-[#151926] border border-white/[0.08] flex items-center justify-center text-xs font-bold text-white shrink-0">
                        {entry.name.charAt(0)}
                      </div>
                      <div>
                        <div className="font-bold text-white text-xs">{entry.name}</div>
                        {entry.subtitle && (
                          <div className="text-[10px] text-[#7a8091] mt-0.5">{entry.subtitle}</div>
                        )}
                      </div>
                    </div>
                  </td>

                  <td className="py-3 px-4 font-mono font-bold text-[#c8874b]">
                    {entry.metric}
                  </td>

                  <td className="py-3 px-4">
                    {entry.badge ? (
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase bg-[#c8874b]/15 text-[#df9f64] border border-[#c8874b]/30">
                        {entry.badge}
                      </span>
                    ) : (
                      <span className="text-[10px] text-[#555]">—</span>
                    )}
                  </td>

                  <td className="py-3 px-4 text-center">
                    <div className="flex items-center justify-center gap-2">
                      <button
                        onClick={() => handleOpenEdit(entry)}
                        className="p-1.5 rounded-lg bg-[#151926] hover:bg-[#c8874b] hover:text-black text-[#8c92a4] transition-all cursor-pointer"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDelete(entry.id)}
                        className="p-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 transition-all cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}

              {filteredEntries.length === 0 && !isLoading && (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-xs text-[#7a8091]">
                    {language === 'ar' ? 'لا توجد سجلات مسجلة في هذا التصنيف حالياً.' : 'No records found in this category.'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-[#0e1017] border border-white/[0.12] rounded-2xl p-6 shadow-2xl">
            <div className="flex items-center justify-between pb-4 border-b border-white/[0.08]">
              <h3 className="text-base font-black text-white flex items-center gap-2">
                <Trophy className="w-4 h-4 text-[#c8874b]" />
                <span>{editingEntry ? (language === 'ar' ? 'تعديل السجل' : 'Edit Record') : (language === 'ar' ? 'إضافة لاعب للتصنيف' : 'Add Player Record')}</span>
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
                  {language === 'ar' ? 'اسم اللاعب أو المواطن' : 'Citizen / Player Name'}
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full bg-[#151926] border border-white/[0.1] rounded-xl px-3 py-2 text-xs text-white focus:border-[#c8874b] focus:outline-none"
                  placeholder="مثال: سلطان القحطاني (Sultan)"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-[#8c92a4] mb-1.5">
                    {language === 'ar' ? 'الترتيب (Rank)' : 'Rank Position'}
                  </label>
                  <input
                    type="number"
                    min={1}
                    value={formData.rank}
                    onChange={(e) => setFormData(prev => ({ ...prev, rank: Number(e.target.value) }))}
                    className="w-full bg-[#151926] border border-white/[0.1] rounded-xl px-3 py-2 text-xs text-white focus:border-[#c8874b] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#8c92a4] mb-1.5">
                    {language === 'ar' ? 'الفئة' : 'Category'}
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value as any }))}
                    className="w-full bg-[#151926] border border-white/[0.1] rounded-xl px-3 py-2 text-xs text-white focus:border-[#c8874b] focus:outline-none"
                  >
                    <option value="playtime">ساعات التواجد (Playtime)</option>
                    <option value="wealth">أثرياء المدينة (Wealth)</option>
                    <option value="law">حماة القانون (Law)</option>
                    <option value="wanted">قائمة المطلوبين (Wanted)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#8c92a4] mb-1.5">
                  {language === 'ar' ? 'المعيار / الرقم البارز' : 'Metric Value'}
                </label>
                <input
                  type="text"
                  required
                  value={formData.metric}
                  onChange={(e) => setFormData(prev => ({ ...prev, metric: e.target.value }))}
                  className="w-full bg-[#151926] border border-white/[0.1] rounded-xl px-3 py-2 text-xs text-white font-mono focus:border-[#c8874b] focus:outline-none"
                  placeholder="مثال: 1,450 ساعة أو $18,000,000"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#8c92a4] mb-1.5">
                  {language === 'ar' ? 'الوصف الفرعي أو الحي' : 'Subtitle / District'}
                </label>
                <input
                  type="text"
                  value={formData.subtitle}
                  onChange={(e) => setFormData(prev => ({ ...prev, subtitle: e.target.value }))}
                  className="w-full bg-[#151926] border border-white/[0.1] rounded-xl px-3 py-2 text-xs text-white focus:border-[#c8874b] focus:outline-none"
                  placeholder="مثال: ريتشمان • رجل أعمال"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#8c92a4] mb-1.5">
                  {language === 'ar' ? 'شارة أو وسام الشرف' : 'Badge Tag'}
                </label>
                <input
                  type="text"
                  value={formData.badge}
                  onChange={(e) => setFormData(prev => ({ ...prev, badge: e.target.value }))}
                  className="w-full bg-[#151926] border border-white/[0.1] rounded-xl px-3 py-2 text-xs text-white focus:border-[#c8874b] focus:outline-none"
                  placeholder="مثال: Legendary Citizen أو Tycoon"
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
                  disabled={isSubmitting}
                  className="px-5 py-2 rounded-xl bg-[#c8874b] text-black text-xs font-black uppercase hover:bg-[#df9f64]"
                >
                  {isSubmitting ? (language === 'ar' ? 'جاري الحفظ...' : 'Saving...') : (language === 'ar' ? 'حفظ السجل' : 'Save')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

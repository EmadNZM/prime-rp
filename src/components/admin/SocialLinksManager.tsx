import React, { useState, useEffect } from 'react';
import { SocialLinkItem } from '../../types';
import { apiClient } from '../../services/apiClient';
import { 
  Share2, 
  Plus, 
  Trash2, 
  ExternalLink, 
  Check, 
  ShieldCheck, 
  Globe 
} from 'lucide-react';

interface SocialLinksManagerProps {
  showToast: (msg: string) => void;
  isOwner: boolean;
}

export const SocialLinksManager: React.FC<SocialLinksManagerProps> = ({ showToast, isOwner }) => {
  const [links, setLinks] = useState<SocialLinkItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [showAddModal, setShowAddModal] = useState<boolean>(false);

  const [formPlatform, setFormPlatform] = useState<string>('Discord');
  const [formUrl, setFormUrl] = useState<string>('');
  const [formLabel, setFormLabel] = useState<string>('');
  const [formOrder, setFormOrder] = useState<number>(0);
  const [isSaving, setIsSaving] = useState<boolean>(false);

  const loadLinks = async () => {
    setIsLoading(true);
    try {
      const data = await apiClient.getSocialLinks();
      setLinks(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Failed to load social links:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadLinks();
  }, []);

  const handleSaveLink = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formUrl.trim() || !isOwner) return;

    setIsSaving(true);
    try {
      const saved = await apiClient.saveSocialLink({
        platform: formPlatform,
        url: formUrl.trim(),
        label: formLabel.trim() || formPlatform,
        sortOrder: formOrder,
        isActive: true
      });

      if (saved) {
        showToast('تم حفظ الرابط الرسمي بنجاح');
        setShowAddModal(false);
        setFormUrl('');
        setFormLabel('');
        loadLinks();
      }
    } catch (err) {
      console.error(err);
      showToast('تعذر حفظ الرابط');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!isOwner) return;
    if (window.confirm('هل أنت متأكد من حذف هذا الرابط؟')) {
      try {
        await apiClient.deleteSocialLink(id);
        setLinks(links.filter((l) => l.id !== id));
        showToast('تم حذف الرابط بنجاح');
      } catch (err) {
        showToast('تعذر حذف الرابط');
      }
    }
  };

  return (
    <div className="bg-[#0B0B0B] border border-[#1C1C1C] rounded-3xl p-6 sm:p-8 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#1A1A1A]">
        <div>
          <h3 className="text-base sm:text-lg font-black text-white flex items-center gap-2">
            <Share2 className="w-5 h-5 text-[#C8874B]" />
            <span>إدارة روابط التواصل الاجتماعي الرسمية (Social Links)</span>
          </h3>
          <p className="text-xs text-[#888] mt-1">
            الروابط الرسمية المعتمدة لسيرفر Prime RP التي تظهر للمواطنين في الفوتر وواجهات المجتمع.
          </p>
        </div>

        {isOwner && (
          <button
            onClick={() => setShowAddModal(true)}
            className="px-4 py-2 rounded-xl bg-[#C8874B] hover:bg-[#B0733A] text-black font-bold text-xs flex items-center gap-1.5 transition-colors self-start sm:self-auto"
          >
            <Plus className="w-4 h-4" />
            <span>إضافة رابط رسمي</span>
          </button>
        )}
      </div>

      {!isOwner && (
        <div className="p-3.5 rounded-2xl bg-[#141414] border border-[#262626] text-xs text-[#AAA] flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-[#C8874B] shrink-0" />
          <span>تعديل وحذف الروابط الرسمية مخصص حصرياً لمالك السيرفر (Server Owner).</span>
        </div>
      )}

      {/* Modal for adding a new social link */}
      {showAddModal && isOwner && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-[#121212] border border-[#222] rounded-3xl p-6 w-full max-w-md shadow-2xl">
            <h4 className="text-base font-bold text-white mb-4">إضافة رابط تواصل معتمد</h4>
            <form onSubmit={handleSaveLink} className="space-y-4">
              <div>
                <label className="block text-xs text-[#AAA] mb-1">المنصة (Platform)</label>
                <select
                  value={formPlatform}
                  onChange={(e) => setFormPlatform(e.target.value)}
                  className="w-full bg-[#181818] border border-[#2C2C2C] rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#C8874B]"
                >
                  <option value="Discord">Discord (ديسكورد)</option>
                  <option value="Twitter">Twitter / X (تويتر)</option>
                  <option value="YouTube">YouTube (يوتيوب)</option>
                  <option value="TikTok">TikTok (تيك توك)</option>
                  <option value="Twitch">Twitch (تويتش)</option>
                  <option value="Instagram">Instagram (انستغرام)</option>
                  <option value="Telegram">Telegram (تيليجرام)</option>
                  <option value="Kick">Kick (كيك)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs text-[#AAA] mb-1">الرابط المباشر (URL)</label>
                <input
                  type="url"
                  required
                  value={formUrl}
                  onChange={(e) => setFormUrl(e.target.value)}
                  placeholder="https://..."
                  className="w-full bg-[#181818] border border-[#2C2C2C] rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#C8874B]"
                />
              </div>

              <div>
                <label className="block text-xs text-[#AAA] mb-1">اسم العرض (اختياري)</label>
                <input
                  type="text"
                  value={formLabel}
                  onChange={(e) => setFormLabel(e.target.value)}
                  placeholder="مثال: مجتمع Prime RP الرسمي"
                  className="w-full bg-[#181818] border border-[#2C2C2C] rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#C8874B]"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-xl bg-[#1A1A1A] text-xs text-[#888] hover:text-white"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-4 py-2 rounded-xl bg-[#C8874B] text-black font-bold text-xs hover:bg-[#B0733A] disabled:opacity-50"
                >
                  {isSaving ? 'جاري الحفظ...' : 'حفظ الرابط'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Existing links table */}
      {isLoading ? (
        <div className="text-center py-10 text-xs text-[#777]">جاري تحميل الروابط...</div>
      ) : links.length === 0 ? (
        <div className="text-center py-10 text-xs text-[#666]">لا توجد روابط مسجلة حالياً.</div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {links.map((link) => (
            <div
              key={link.id}
              className="p-3.5 rounded-xl bg-[#111] border border-[#1E1E1E] flex items-center justify-between"
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <Globe className="w-4 h-4 text-[#C8874B] shrink-0" />
                <div className="min-w-0">
                  <p className="font-bold text-xs text-white truncate">{link.label || link.platform}</p>
                  <a
                    href={link.url}
                    target="_blank"
                    rel="noreferrer"
                    className="text-[10px] text-[#777] hover:text-[#C8874B] truncate block font-mono"
                  >
                    {link.url}
                  </a>
                </div>
              </div>

              {isOwner && (
                <button
                  onClick={() => handleDelete(link.id)}
                  className="p-1.5 rounded-lg text-[#666] hover:text-red-400 hover:bg-red-500/10 transition-colors shrink-0"
                  title="حذف"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          ))}
        </div>
      )}

    </div>
  );
};

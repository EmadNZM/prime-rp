import React, { useState, useEffect } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { useAuth } from '../../context/AuthContext';
import { apiClient } from '../../services/apiClient';
import { UserRole, PermissionId, User } from '../../types';
import { 
  PERMISSIONS_CATALOG, 
  ROLES_DEFINITIONS, 
  DEFAULT_ROLE_PERMISSIONS 
} from '../../utils/permissions';
import { 
  ShieldCheck, 
  Shield, 
  Crown, 
  Check, 
  X, 
  Sparkles, 
  Users, 
  Save, 
  RotateCcw, 
  AlertCircle, 
  UserCheck, 
  Eye, 
  Sliders
} from 'lucide-react';

export const RolesPermissionsManager: React.FC = () => {
  const { language } = useLanguage();
  const { effectiveUser, user: originalUser, isOwner, previewRole, setPreviewRole } = useAuth();
  
  const [selectedRole, setSelectedRole] = useState<UserRole>(UserRole.ADMIN);
  const [rolePermissions, setRolePermissions] = useState<Record<string, PermissionId[]>>({ ...DEFAULT_ROLE_PERMISSIONS });
  const [activeCategory, setActiveCategory] = useState<string>('ALL');
  
  // Custom user override modal
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [selectedUserForOverride, setSelectedUserForOverride] = useState<User | null>(null);
  const [userSpecificPerms, setUserSpecificPerms] = useState<PermissionId[]>([]);
  
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [feedbackMsg, setFeedbackMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    loadRolesConfig();
    loadUsers();
  }, []);

  const loadRolesConfig = async () => {
    try {
      const data = await apiClient.getRolesConfig();
      if (data?.customRolePermissions && Object.keys(data.customRolePermissions).length > 0) {
        setRolePermissions(prev => ({
          ...prev,
          ...data.customRolePermissions
        }));
      }
    } catch (err) {
      console.error('Failed to load roles config:', err);
    }
  };

  const loadUsers = async () => {
    try {
      const users = await apiClient.getAdminUsers();
      if (Array.isArray(users)) {
        setAllUsers(users);
      }
    } catch (err) {
      console.error('Failed to load users for permissions manager:', err);
    }
  };

  const currentRoleDef = ROLES_DEFINITIONS.find(r => r.role === selectedRole) || ROLES_DEFINITIONS[0];
  const activePermissions = rolePermissions[selectedRole] || DEFAULT_ROLE_PERMISSIONS[selectedRole] || [];

  const handleTogglePermission = (permId: PermissionId) => {
    if (selectedRole === UserRole.OWNER) {
      setFeedbackMsg({
        type: 'error',
        text: language === 'ar' ? 'صلاحيات المالك جذرية ومطلقة ولا يمكن تقييدها' : 'Owner has immutable root privileges'
      });
      return;
    }

    setRolePermissions(prev => {
      const current = prev[selectedRole] || DEFAULT_ROLE_PERMISSIONS[selectedRole] || [];
      const updated = current.includes(permId)
        ? current.filter(id => id !== permId)
        : [...current, permId];
      return {
        ...prev,
        [selectedRole]: updated
      };
    });
  };

  const handleSaveMatrix = async () => {
    setIsSaving(true);
    setFeedbackMsg(null);
    try {
      await apiClient.saveRolesConfig({ rolePermissions });
      setFeedbackMsg({
        type: 'success',
        text: language === 'ar' ? 'تم حفظ وتحديث مصفوفة الرتب والصلاحيات بنجاح' : 'Role permissions matrix saved successfully'
      });
      setTimeout(() => setFeedbackMsg(null), 4000);
    } catch (err) {
      setFeedbackMsg({
        type: 'error',
        text: language === 'ar' ? 'حدث خطأ أثناء حفظ الصلاحيات' : 'Failed to save permissions'
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleResetDefaults = () => {
    setRolePermissions({ ...DEFAULT_ROLE_PERMISSIONS });
    setFeedbackMsg({
      type: 'success',
      text: language === 'ar' ? 'تمت استعادة الصلاحيات الافتراضية للرتب' : 'Reset to default role permissions'
    });
    setTimeout(() => setFeedbackMsg(null), 3000);
  };

  const handleOpenUserModal = (targetUser: User) => {
    setSelectedUserForOverride(targetUser);
    setUserSpecificPerms((targetUser.permissions as PermissionId[]) || []);
  };

  const handleSaveUserOverrides = async () => {
    if (!selectedUserForOverride) return;
    setIsSaving(true);
    try {
      await apiClient.updateUserRole(selectedUserForOverride.id, selectedUserForOverride.role, userSpecificPerms);
      setFeedbackMsg({
        type: 'success',
        text: language === 'ar' ? `تم تحديث صلاحيات المستخدم ${selectedUserForOverride.username} بنجاح` : 'User custom permissions updated'
      });
      setSelectedUserForOverride(null);
      loadUsers();
      setTimeout(() => setFeedbackMsg(null), 3500);
    } catch (err) {
      setFeedbackMsg({
        type: 'error',
        text: language === 'ar' ? 'فشل تحديث صلاحيات المستخدم' : 'Failed to update user permissions'
      });
    } finally {
      setIsSaving(false);
    }
  };

  const categories = [
    { id: 'ALL', nameAr: 'كافة الصلاحيات', nameEn: 'All Permissions' },
    { id: 'SYSTEM', nameAr: 'النظام والأمان', nameEn: 'System & Security' },
    { id: 'CMS', nameAr: 'إدارة الواجهات', nameEn: 'Interface CMS' },
    { id: 'MODERATION', nameAr: 'المجتمع والرقابة', nameEn: 'Community & Moderation' },
    { id: 'STORE', nameAr: 'المتجر والمبيعات', nameEn: 'Store & Sales' }
  ];

  const filteredPermissions = PERMISSIONS_CATALOG.filter(perm => {
    if (activeCategory === 'ALL') return true;
    if (activeCategory === 'SYSTEM') return perm.categoryEn.includes('Security') || perm.categoryEn.includes('System');
    if (activeCategory === 'CMS') return perm.categoryEn.includes('CMS') || perm.categoryAr.includes('الواجهات');
    if (activeCategory === 'MODERATION') return perm.categoryEn.includes('Moderation') || perm.categoryAr.includes('الرقابة');
    if (activeCategory === 'STORE') return perm.categoryEn.includes('Store') || perm.categoryEn.includes('Sales');
    return true;
  });

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Top Banner / Role Preview Simulator */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-[#11131b] via-[#151926] to-[#11131b] border border-white/[0.08] shadow-2xl relative overflow-hidden">
        <div className="absolute -right-10 -top-10 w-64 h-64 bg-[#c8874b]/10 rounded-full blur-3xl pointer-events-none" />
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
          <div>
            <div className="flex items-center gap-2 text-xs font-black text-[#df9f64] uppercase tracking-wider mb-2">
              <ShieldCheck className="w-4 h-4 text-[#c8874b]" />
              <span>{language === 'ar' ? 'نظام التحكم بالرتب والصلاحيات (RBAC Core)' : 'Role-Based Access Control Architecture'}</span>
            </div>
            <h2 className="text-2xl font-black text-white tracking-tight">
              {language === 'ar' ? 'إدارة الرتب وتوزيع الصلاحيات والمحاكاة' : 'Roles & Permissions Matrix & Live Simulator'}
            </h2>
            <p className="text-xs sm:text-sm text-[#8c92a4] mt-1 max-w-2xl">
              {language === 'ar'
                ? 'تحكم دقيق في كافة وظائف المنصة وواجهات الموقع. يمكنك اختبار الواجهة فوراً بأي رتبة عبر زر المحاكاة.'
                : 'Fine-grained authorization across all website CMS and moderation modules. Live test any role using the simulator.'}
            </p>
          </div>

          {/* Simulator Controls */}
          <div className="p-4 rounded-xl bg-[#090b10]/90 border border-white/[0.08] flex flex-col sm:flex-row items-start sm:items-center gap-3">
            <div className="flex items-center gap-2">
              <Eye className="w-4 h-4 text-amber-400" />
              <span className="text-xs font-bold text-white whitespace-nowrap">
                {language === 'ar' ? 'محاكاة الواجهة كـ:' : 'Preview Dashboard As:'}
              </span>
            </div>
            <select
              value={previewRole || ''}
              onChange={(e) => setPreviewRole(e.target.value ? (e.target.value as UserRole) : null)}
              className="bg-[#151824] border border-white/[0.12] rounded-lg px-3 py-1.5 text-xs font-bold text-white focus:outline-none focus:border-[#c8874b]"
            >
              <option value="">{language === 'ar' ? 'الرتبة الفعلية الحالية' : 'Current Real Role'}</option>
              {ROLES_DEFINITIONS.map(r => (
                <option key={r.role} value={r.role}>
                  {language === 'ar' ? r.nameAr : r.nameEn} ({r.role})
                </option>
              ))}
            </select>
            {previewRole && (
              <button
                onClick={() => setPreviewRole(null)}
                className="text-[11px] font-bold text-rose-400 bg-rose-500/10 hover:bg-rose-500/20 px-2.5 py-1.5 rounded-lg border border-rose-500/20 transition-all cursor-pointer"
              >
                {language === 'ar' ? 'إلغاء المحاكاة' : 'Reset'}
              </button>
            )}
          </div>
        </div>

        {/* Feedback banner */}
        {feedbackMsg && (
          <div className={`mt-4 p-3.5 rounded-xl text-xs font-bold flex items-center gap-2 border ${
            feedbackMsg.type === 'success' 
              ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' 
              : 'bg-rose-500/10 text-rose-400 border-rose-500/20'
          }`}>
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{feedbackMsg.text}</span>
          </div>
        )}
      </div>

      {/* Role Selection Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2.5">
        {ROLES_DEFINITIONS.map(r => {
          const isSelected = selectedRole === r.role;
          const assignedCount = (rolePermissions[r.role] || DEFAULT_ROLE_PERMISSIONS[r.role] || []).length;

          return (
            <button
              key={r.role}
              onClick={() => setSelectedRole(r.role)}
              className={`p-3 rounded-xl border text-right rtl:text-right ltr:text-left transition-all flex flex-col justify-between cursor-pointer ${
                isSelected
                  ? 'bg-[#151926] border-[#c8874b] shadow-lg shadow-[#c8874b]/10 ring-1 ring-[#c8874b]/40'
                  : 'bg-[#0e1017] border-white/[0.06] hover:bg-[#131622] hover:border-white/[0.12]'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span 
                  className="w-2.5 h-2.5 rounded-full" 
                  style={{ backgroundColor: r.badgeColor }}
                />
                <span className="text-[10px] font-mono text-[#7a8091]">
                  LVL {r.level}
                </span>
              </div>
              <div>
                <h4 className="text-xs font-black text-white truncate">
                  {language === 'ar' ? r.nameAr : r.nameEn}
                </h4>
                <p className="text-[10px] font-mono text-[#a2a8b9] mt-0.5">
                  {assignedCount} {language === 'ar' ? 'صلاحية' : 'perms'}
                </p>
              </div>
            </button>
          );
        })}
      </div>

      {/* Main Role Configuration Card */}
      <div className="p-6 rounded-2xl bg-[#0e1017] border border-white/[0.08] shadow-xl">
        {/* Role Header Info */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-white/[0.08]">
          <div className="flex items-center gap-3.5">
            <div 
              className="w-12 h-12 rounded-xl flex items-center justify-center text-white font-black shadow-lg"
              style={{ backgroundColor: `${currentRoleDef.badgeColor}25`, border: `1px solid ${currentRoleDef.badgeColor}50` }}
            >
              {currentRoleDef.role === UserRole.OWNER ? (
                <Crown className="w-6 h-6 text-[#c8874b]" />
              ) : (
                <Shield className="w-6 h-6" style={{ color: currentRoleDef.badgeColor }} />
              )}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-black text-white">
                  {language === 'ar' ? currentRoleDef.nameAr : currentRoleDef.nameEn}
                </h3>
                <span 
                  className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider text-white"
                  style={{ backgroundColor: currentRoleDef.badgeColor }}
                >
                  {currentRoleDef.role}
                </span>
              </div>
              <p className="text-xs text-[#8c92a4] mt-0.5 max-w-xl">
                {language === 'ar' ? currentRoleDef.descriptionAr : currentRoleDef.descriptionEn}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5 self-end md:self-auto">
            <button
              onClick={handleResetDefaults}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#151926] hover:bg-[#1b2030] text-xs font-bold text-[#8c92a4] hover:text-white border border-white/[0.08] transition-all cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>{language === 'ar' ? 'استعادة الافتراضي' : 'Reset'}</span>
            </button>
            <button
              onClick={handleSaveMatrix}
              disabled={isSaving}
              className="flex items-center gap-2 px-5 py-2 rounded-xl bg-[#c8874b] hover:bg-[#df9f64] text-black font-black text-xs uppercase tracking-wider transition-all shadow-md shadow-[#c8874b]/20 cursor-pointer disabled:opacity-50"
            >
              <Save className="w-3.5 h-3.5" />
              <span>{isSaving ? (language === 'ar' ? 'جاري الحفظ...' : 'Saving...') : (language === 'ar' ? 'حفظ الصلاحيات' : 'Save Changes')}</span>
            </button>
          </div>
        </div>

        {/* Category Filters */}
        <div className="flex flex-wrap gap-2 pt-6 mb-6">
          {categories.map(cat => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeCategory === cat.id
                  ? 'bg-[#c8874b]/20 text-[#df9f64] border border-[#c8874b]/40 font-black'
                  : 'bg-[#151926] text-[#8c92a4] hover:text-white border border-white/[0.06]'
              }`}
            >
              {language === 'ar' ? cat.nameAr : cat.nameEn}
            </button>
          ))}
        </div>

        {/* Permissions Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
          {filteredPermissions.map(perm => {
            const hasPerm = currentRoleDef.role === UserRole.OWNER || activePermissions.includes(perm.id);

            return (
              <div
                key={perm.id}
                onClick={() => handleTogglePermission(perm.id)}
                className={`p-4 rounded-xl border transition-all flex items-start justify-between gap-4 cursor-pointer select-none ${
                  hasPerm
                    ? 'bg-[#121622] border-[#c8874b]/40 shadow-sm'
                    : 'bg-[#0a0c12] border-white/[0.05] hover:border-white/[0.12] opacity-75'
                }`}
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-black text-white">
                      {language === 'ar' ? perm.nameAr : perm.nameEn}
                    </span>
                    <span className="text-[10px] font-mono text-[#7a8091] px-1.5 py-0.5 rounded bg-white/[0.04]">
                      {perm.id}
                    </span>
                  </div>
                  <p className="text-[11px] text-[#8c92a4] leading-relaxed">
                    {language === 'ar' ? perm.descriptionAr : perm.descriptionEn}
                  </p>
                </div>

                <div 
                  className={`w-6 h-6 rounded-lg flex items-center justify-center shrink-0 transition-all ${
                    hasPerm 
                      ? 'bg-[#c8874b] text-black shadow-md shadow-[#c8874b]/30' 
                      : 'bg-white/[0.06] text-[#555] border border-white/[0.1]'
                  }`}
                >
                  {hasPerm ? <Check className="w-3.5 h-3.5 stroke-[3]" /> : <X className="w-3.5 h-3.5" />}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* User-Specific Permission Overrides Section */}
      <div className="p-6 rounded-2xl bg-[#0e1017] border border-white/[0.08] shadow-xl">
        <div className="flex items-center justify-between gap-4 mb-4">
          <div>
            <h3 className="text-base font-black text-white flex items-center gap-2">
              <UserCheck className="w-4 h-4 text-[#c8874b]" />
              <span>{language === 'ar' ? 'تخصيص صلاحيات استثنائية لمستخدم محدد' : 'Individual User Permission Overrides'}</span>
            </h3>
            <p className="text-xs text-[#8c92a4] mt-0.5">
              {language === 'ar'
                ? 'منح مستخدم معين صلاحيات إضافية محددة دون الحاجة لترقية رتبته العامة.'
                : 'Grant specific individual permissions to a user without changing their baseline role.'}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
          {allUsers.slice(0, 9).map(u => (
            <div
              key={u.id}
              className="p-3.5 rounded-xl bg-[#121622] border border-white/[0.06] flex items-center justify-between gap-3 hover:border-white/[0.15] transition-all"
            >
              <div className="flex items-center gap-2.5 truncate">
                <img
                  src={u.avatar || `https://api.dicebear.com/7.x/bottts/svg?seed=${u.username}`}
                  alt={u.username}
                  className="w-9 h-9 rounded-xl bg-black border border-white/[0.1] object-cover shrink-0"
                />
                <div className="truncate">
                  <h4 className="text-xs font-bold text-white truncate">{u.globalName || u.username}</h4>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <span className="text-[10px] font-mono text-[#c8874b]">{u.role}</span>
                    <span className="text-[10px] text-[#7a8091]">• {u.permissions?.length || 0} extra</span>
                  </div>
                </div>
              </div>

              <button
                onClick={() => handleOpenUserModal(u)}
                className="px-2.5 py-1 rounded-lg bg-[#1a1f2e] hover:bg-[#c8874b] hover:text-black text-[11px] font-bold text-white transition-all cursor-pointer shrink-0"
              >
                {language === 'ar' ? 'تخصيص' : 'Edit'}
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Modal: User Overrides */}
      {selectedUserForOverride && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-2xl bg-[#0e1017] border border-white/[0.12] rounded-2xl p-6 shadow-2xl max-h-[85vh] flex flex-col">
            <div className="flex items-center justify-between pb-4 border-b border-white/[0.08]">
              <div className="flex items-center gap-3">
                <img
                  src={selectedUserForOverride.avatar || `https://api.dicebear.com/7.x/bottts/svg?seed=${selectedUserForOverride.username}`}
                  alt={selectedUserForOverride.username}
                  className="w-10 h-10 rounded-xl bg-black border border-white/[0.1]"
                />
                <div>
                  <h3 className="text-sm font-black text-white">{selectedUserForOverride.username}</h3>
                  <span className="text-xs text-[#c8874b] font-mono">{selectedUserForOverride.role}</span>
                </div>
              </div>
              <button
                onClick={() => setSelectedUserForOverride(null)}
                className="p-1.5 rounded-lg bg-white/[0.05] hover:bg-white/[0.1] text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="py-4 overflow-y-auto space-y-2 flex-1 pr-1">
              <p className="text-xs text-[#8c92a4] mb-3">
                {language === 'ar'
                  ? 'اختر الصلاحيات الاستثنائية التي ترغب بمنحها لهذا المستخدم:'
                  : 'Select specific permission overrides to grant this user:'}
              </p>
              {PERMISSIONS_CATALOG.map(perm => {
                const isChecked = userSpecificPerms.includes(perm.id);
                return (
                  <div
                    key={perm.id}
                    onClick={() => {
                      setUserSpecificPerms(prev =>
                        prev.includes(perm.id) ? prev.filter(p => p !== perm.id) : [...prev, perm.id]
                      );
                    }}
                    className={`p-3 rounded-xl border flex items-center justify-between cursor-pointer transition-all ${
                      isChecked ? 'bg-[#151926] border-[#c8874b]/50' : 'bg-[#0a0c12] border-white/[0.04]'
                    }`}
                  >
                    <div>
                      <h5 className="text-xs font-bold text-white">{language === 'ar' ? perm.nameAr : perm.nameEn}</h5>
                      <p className="text-[10px] text-[#7a8091]">{language === 'ar' ? perm.descriptionAr : perm.descriptionEn}</p>
                    </div>
                    <div className={`w-5 h-5 rounded-md flex items-center justify-center ${isChecked ? 'bg-[#c8874b] text-black' : 'bg-white/[0.05]'}`}>
                      {isChecked && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="pt-4 border-t border-white/[0.08] flex items-center justify-end gap-2.5">
              <button
                onClick={() => setSelectedUserForOverride(null)}
                className="px-4 py-2 rounded-xl bg-white/[0.06] text-xs font-bold text-white hover:bg-white/[0.1]"
              >
                {language === 'ar' ? 'إلغاء' : 'Cancel'}
              </button>
              <button
                onClick={handleSaveUserOverrides}
                disabled={isSaving}
                className="px-5 py-2 rounded-xl bg-[#c8874b] text-black text-xs font-black uppercase hover:bg-[#df9f64]"
              >
                {isSaving ? (language === 'ar' ? 'جاري الحفظ...' : 'Saving...') : (language === 'ar' ? 'تأكيد الحفظ' : 'Confirm')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

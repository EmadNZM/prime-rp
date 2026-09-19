import { User, UserRole, PermissionId, PermissionDefinition, RoleDefinition } from '../types';

export const PERMISSIONS_CATALOG: PermissionDefinition[] = [
  // User & Role Management
  {
    id: 'manage_roles',
    nameAr: 'إدارة الرتب والصلاحيات',
    nameEn: 'Manage Roles & Permissions',
    categoryAr: 'النظام والأمان',
    categoryEn: 'System & Security',
    descriptionAr: 'تعيين وتعديل رتب المستخدمين وتخصيص الصلاحيات الممنوحة لكل رتبة',
    descriptionEn: 'Assign and modify user roles and customize granted permissions'
  },
  {
    id: 'manage_users',
    nameAr: 'إدارة المواطنين والحسابات',
    nameEn: 'Manage Citizens & Accounts',
    categoryAr: 'المجتمع والرقابة',
    categoryEn: 'Community & Moderation',
    descriptionAr: 'البحث في قائمة المواطنين وتغيير حالة الحساب (نشط، موقوف، محظور)',
    descriptionEn: 'Search citizens, update account status (Active, Suspended, Banned)'
  },
  // Full Website CMS
  {
    id: 'manage_homepage',
    nameAr: 'التحكم بالصفحة الرئيسية والبنرات',
    nameEn: 'Manage Homepage & Banners',
    categoryAr: 'إدارة الواجهات',
    categoryEn: 'Interface CMS',
    descriptionAr: 'تعديل نصوص الهيرو، شريط التنبيهات العلوي، خلفيات GTA، وإحصائيات الواجهة',
    descriptionEn: 'Edit hero texts, top announcement banner, GTA backdrops, and live stats'
  },
  {
    id: 'manage_store',
    nameAr: 'التحكم بالمتجر والمنتجات',
    nameEn: 'Manage Store & Products',
    categoryAr: 'إدارة الواجهات',
    categoryEn: 'Interface CMS',
    descriptionAr: 'إضافة وتعديل باقات VIP والسيارات، الأسعار، المميزات، وحالة التوفر',
    descriptionEn: 'Add/edit VIP bundles, vehicles, pricing, perks, and stock status'
  },
  {
    id: 'manage_orders',
    nameAr: 'إدارة فواتير وطلبات المتجر',
    nameEn: 'Manage Store Orders',
    categoryAr: 'المتجر والمبيعات',
    categoryEn: 'Store & Sales',
    descriptionAr: 'استعراض عمليات الشراء والفواتير وحالات الدفع والمبيعات',
    descriptionEn: 'Review citizen transactions, invoices, and purchase records'
  },
  {
    id: 'manage_rules',
    nameAr: 'إدارة القوانين والبنود',
    nameEn: 'Manage Rules & Guidelines',
    categoryAr: 'إدارة الواجهات',
    categoryEn: 'Interface CMS',
    descriptionAr: 'إضافة وتعديل أقسام القوانين والبنود التفصيلية والإنذارات والعقوبات',
    descriptionEn: 'Add/edit rule categories, specific clauses, warnings, and penalties'
  },
  {
    id: 'manage_jobs',
    nameAr: 'إدارة الوظائف والتقديمات',
    nameEn: 'Manage Jobs & Applications',
    categoryAr: 'إدارة الواجهات',
    categoryEn: 'Interface CMS',
    descriptionAr: 'تعديل رواتب وشروط الوظائف ومراجعة طلبات التوظيف وقبولها أو رفضها',
    descriptionEn: 'Edit job salaries and requirements, review and accept/reject applications'
  },
  {
    id: 'manage_news',
    nameAr: 'إدارة الأخبار والمقالات',
    nameEn: 'Manage News & Updates',
    categoryAr: 'إدارة الواجهات',
    categoryEn: 'Interface CMS',
    descriptionAr: 'نشر مقالات وتحديثات السيرفر باللغتين العربية والإنجليزية وتحديد المميز',
    descriptionEn: 'Publish bilingual server announcements, articles, and featured updates'
  },
  {
    id: 'manage_leaderboard',
    nameAr: 'التحكم بالمتصدرين ولوحة الشرف',
    nameEn: 'Manage Leaderboard & Hall of Fame',
    categoryAr: 'إدارة الواجهات',
    categoryEn: 'Interface CMS',
    descriptionAr: 'إدارة قوائم الشرف (أكثر ساعات لعب، ثروة، قطاع الشرطة، المطلوبين)',
    descriptionEn: 'Manage Hall of Fame lists (Playtime, Wealth, Police officers, Most Wanted)'
  },
  {
    id: 'manage_faq',
    nameAr: 'إدارة الأسئلة الشائعة',
    nameEn: 'Manage FAQ & Knowledge Base',
    categoryAr: 'إدارة الواجهات',
    categoryEn: 'Interface CMS',
    descriptionAr: 'إضافة وتعديل وتصنيف بنك الأسئلة والأجوبة السريعة للاعبين',
    descriptionEn: 'Add, edit, and organize questions & answers for community guidance'
  },
  // Support & Moderation
  {
    id: 'manage_tickets',
    nameAr: 'الدعم الفني والتذاكر',
    nameEn: 'Manage Support Tickets',
    categoryAr: 'المجتمع والرقابة',
    categoryEn: 'Community & Moderation',
    descriptionAr: 'الرد على تذاكر اللاعبين وتعيين أولويتها وتغيير حالتها (محلولة، مغلقة)',
    descriptionEn: 'Reply to citizen support tickets, update priority, and resolve issues'
  },
  {
    id: 'manage_reports',
    nameAr: 'مراجعة البلاغات والشكاوى',
    nameEn: 'Manage Reports & Violations',
    categoryAr: 'المجتمع والرقابة',
    categoryEn: 'Community & Moderation',
    descriptionAr: 'التحقيق في بلاغات المخالفات بين المواطنين وشكاوى الأعطال',
    descriptionEn: 'Review rule violation reports, bug reports, and issue disciplinary notes'
  },
  // Core Settings & Auditing
  {
    id: 'manage_settings',
    nameAr: 'الإعدادات العامة والسيرفر',
    nameEn: 'Manage Global Site Settings',
    categoryAr: 'النظام والأمان',
    categoryEn: 'System & Security',
    descriptionAr: 'تعديل شعارات الموقع، رابط الديسكورد، اتصال FiveM Connect، ووضع الصيانة',
    descriptionEn: 'Update logos, Discord invite, FiveM connection link, and maintenance mode'
  },
  {
    id: 'view_audit_logs',
    nameAr: 'استعراض سجل الرقابة والتدقيق',
    nameEn: 'View Administrative Audit Trail',
    categoryAr: 'النظام والأمان',
    categoryEn: 'System & Security',
    descriptionAr: 'متابعة كافة الإجراءات والتعديلات التي يقوم بها طاقم الإدارة مع الوقت والـ IP',
    descriptionEn: 'Monitor all actions performed by staff members with timestamps and IPs'
  }
];

export const DEFAULT_ROLE_PERMISSIONS: Record<UserRole, PermissionId[]> = {
  [UserRole.OWNER]: [
    'manage_roles',
    'manage_users',
    'manage_homepage',
    'manage_store',
    'manage_orders',
    'manage_rules',
    'manage_jobs',
    'manage_news',
    'manage_tickets',
    'manage_reports',
    'manage_leaderboard',
    'manage_faq',
    'manage_settings',
    'view_audit_logs'
  ],
  [UserRole.SUPER_ADMIN]: [
    'manage_roles',
    'manage_users',
    'manage_homepage',
    'manage_store',
    'manage_orders',
    'manage_rules',
    'manage_jobs',
    'manage_news',
    'manage_tickets',
    'manage_reports',
    'manage_leaderboard',
    'manage_faq',
    'manage_settings',
    'view_audit_logs'
  ],
  [UserRole.ADMIN]: [
    'manage_users',
    'manage_homepage',
    'manage_store',
    'manage_orders',
    'manage_rules',
    'manage_jobs',
    'manage_news',
    'manage_tickets',
    'manage_reports',
    'manage_leaderboard',
    'manage_faq',
    'manage_settings',
    'view_audit_logs'
  ],
  [UserRole.MODERATOR]: [
    'manage_users',
    'manage_rules',
    'manage_jobs',
    'manage_tickets',
    'manage_reports',
    'view_audit_logs'
  ],
  [UserRole.SUPPORT]: [
    'manage_tickets',
    'manage_reports',
    'manage_faq'
  ],
  [UserRole.EDITOR]: [
    'manage_homepage',
    'manage_news',
    'manage_rules',
    'manage_faq',
    'manage_leaderboard'
  ],
  [UserRole.STORE_MANAGER]: [
    'manage_store',
    'manage_orders'
  ],
  [UserRole.CITIZEN]: []
};

export const ROLES_DEFINITIONS: RoleDefinition[] = [
  {
    role: UserRole.OWNER,
    nameAr: 'مالك السيرفر',
    nameEn: 'Server Owner',
    badgeColor: '#c8874b',
    descriptionAr: 'المؤسس والمسؤول الأعلى مع صلاحيات جذرية مطلقة (Root Access) على كافة أنظمة المنصة والسيرفر.',
    descriptionEn: 'Founder and ultimate authority with root privileges across all systems.',
    level: 100,
    defaultPermissions: DEFAULT_ROLE_PERMISSIONS[UserRole.OWNER]
  },
  {
    role: UserRole.SUPER_ADMIN,
    nameAr: 'إدارة عليا',
    nameEn: 'Super Administrator',
    badgeColor: '#ef4444',
    descriptionAr: 'إدارة عليا تنفيذية تمتلك التحكم الكامل في الرتب والواجهات والسيرفرات والموظفين.',
    descriptionEn: 'Executive administration with comprehensive control over roles and systems.',
    level: 90,
    defaultPermissions: DEFAULT_ROLE_PERMISSIONS[UserRole.SUPER_ADMIN]
  },
  {
    role: UserRole.ADMIN,
    nameAr: 'مدير عام',
    nameEn: 'Administrator',
    badgeColor: '#f97316',
    descriptionAr: 'إدارة عامة للعمليات والمحتوى والمتجر والمواطنين مع استثناء التعديل على رتب الإدارة العليا.',
    descriptionEn: 'General administration covering operations, content, and users.',
    level: 80,
    defaultPermissions: DEFAULT_ROLE_PERMISSIONS[UserRole.ADMIN]
  },
  {
    role: UserRole.MODERATOR,
    nameAr: 'مشرف ومراقب',
    nameEn: 'Moderator',
    badgeColor: '#8b5cf6',
    descriptionAr: 'متابعة سلوك اللاعبين، معالجة البلاغات، تطبيق القوانين، ومراجعة تقديمات الوظائف.',
    descriptionEn: 'Enforce community standards, resolve reports, and inspect job applications.',
    level: 60,
    defaultPermissions: DEFAULT_ROLE_PERMISSIONS[UserRole.MODERATOR]
  },
  {
    role: UserRole.SUPPORT,
    nameAr: 'دعم فني',
    nameEn: 'Support Staff',
    badgeColor: '#06b6d4',
    descriptionAr: 'الرد على تذاكر الدعم الفني، مساعدة المواطنين الجدد، وإدارة بنك الأسئلة الشائعة.',
    descriptionEn: 'Handle support tickets, assist newcomers, and maintain the FAQ repository.',
    level: 40,
    defaultPermissions: DEFAULT_ROLE_PERMISSIONS[UserRole.SUPPORT]
  },
  {
    role: UserRole.EDITOR,
    nameAr: 'محرر ومسؤول إعلامي',
    nameEn: 'Content Editor',
    badgeColor: '#10b981',
    descriptionAr: 'صياغة ونشر الأخبار، كتابة القوانين، تحرير بنرات الصفحة الرئيسية وإحصائيات لوحة الشرف.',
    descriptionEn: 'Publish news, edit rule texts, manage homepage banners, and update leaderboard.',
    level: 35,
    defaultPermissions: DEFAULT_ROLE_PERMISSIONS[UserRole.EDITOR]
  },
  {
    role: UserRole.STORE_MANAGER,
    nameAr: 'مدير المتجر',
    nameEn: 'Store Manager',
    badgeColor: '#eab308',
    descriptionAr: 'إدارة المنتجات، باقات VIP، حزم المركبات، والاطلاع على سجل مبيعات المتجر.',
    descriptionEn: 'Manage store packages, VIP tiers, vehicles, and inspect transactions.',
    level: 30,
    defaultPermissions: DEFAULT_ROLE_PERMISSIONS[UserRole.STORE_MANAGER]
  },
  {
    role: UserRole.CITIZEN,
    nameAr: 'مواطن',
    nameEn: 'Citizen',
    badgeColor: '#64748b',
    descriptionAr: 'عضو مجتمع عادي يمتلك صلاحية التصفح، الشراء، التقديم على الوظائف، وفتح التذاكر.',
    descriptionEn: 'Standard community member with basic public access and support rights.',
    level: 1,
    defaultPermissions: []
  }
];

export function hasUserPermission(
  user: User | null,
  permission: PermissionId,
  customRolePermissions?: Record<string, PermissionId[]>
): boolean {
  if (!user) return false;
  if (user.isOwner || user.role === UserRole.OWNER) return true;

  // Check explicit user permission overrides
  if (Array.isArray(user.permissions) && user.permissions.includes(permission)) {
    return true;
  }

  // Check role permissions (with custom overrides if configured)
  const rolePerms = customRolePermissions?.[user.role] || DEFAULT_ROLE_PERMISSIONS[user.role] || [];
  return rolePerms.includes(permission);
}

export function getUserEffectivePermissions(
  user: User | null,
  customRolePermissions?: Record<string, PermissionId[]>
): PermissionId[] {
  if (!user) return [];
  if (user.isOwner || user.role === UserRole.OWNER) {
    return PERMISSIONS_CATALOG.map(p => p.id);
  }

  const rolePerms = customRolePermissions?.[user.role] || DEFAULT_ROLE_PERMISSIONS[user.role] || [];
  const userPerms = Array.isArray(user.permissions) ? (user.permissions as PermissionId[]) : [];
  
  return Array.from(new Set([...rolePerms, ...userPerms]));
}

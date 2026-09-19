// Global Types for Prime RP Platform

export type Language = 'ar' | 'en';

export enum UserRole {
  OWNER = 'OWNER',
  SUPER_ADMIN = 'SUPER_ADMIN',
  ADMIN = 'ADMIN',
  MODERATOR = 'MODERATOR',
  SUPPORT = 'SUPPORT',
  EDITOR = 'EDITOR',
  STORE_MANAGER = 'STORE_MANAGER',
  CITIZEN = 'CITIZEN'
}

export enum UserStatus {
  ACTIVE = 'ACTIVE',
  SUSPENDED = 'SUSPENDED',
  BANNED = 'BANNED'
}

export interface User {
  id: string;
  discordId: string;
  username: string;
  displayName?: string;
  globalName?: string;
  avatar?: string;
  email?: string;
  role: UserRole;
  status: UserStatus;
  isAdmin: boolean;
  isOwner: boolean;
  permissions: string[];
  createdAt: string;
  updatedAt: string;
  lastLogin: string;
  lastLoginAt?: string;
  bio?: string;
}

export interface NewsItem {
  id: string;
  slug: string;
  status: 'DRAFT' | 'PUBLISHED';
  featured: boolean;
  image: string;
  category: string;
  authorId: string;
  authorName?: string;
  createdAt: string;
  updatedAt: string;
  translations: {
    ar: { title: string; excerpt: string; content: string; seoTitle?: string; seoDescription?: string };
    en: { title: string; excerpt: string; content: string; seoTitle?: string; seoDescription?: string };
  };
}

export interface RuleCategory {
  id: string;
  slug: string;
  order: number;
  translations: {
    ar: { title: string; description: string; penaltyInfo: string };
    en: { title: string; description: string; penaltyInfo: string };
  };
  rules: RuleItem[];
}

export interface RuleItem {
  id: string;
  number: string;
  translations: {
    ar: { title: string; description: string; warning?: string };
    en: { title: string; description: string; warning?: string };
  };
}

export interface JobItem {
  id: string;
  slug: string;
  category: 'GOVERNMENT' | 'CIVILIAN' | 'CRIMINAL' | 'EMERGENCY' | 'BUSINESS';
  image: string;
  salaryMin: number;
  salaryMax: number;
  status: 'HIRING_OPEN' | 'HIRING_CLOSED' | 'INVITE_ONLY';
  translations: {
    ar: { name: string; description: string; requirements: string[]; duties: string[] };
    en: { name: string; description: string; requirements: string[]; duties: string[] };
  };
}

export type JobApplicationStatus = 'PENDING' | 'UNDER_REVIEW' | 'ACCEPTED' | 'REJECTED';

export interface JobApplication {
  id: string;
  jobId: string;
  userId: string;
  status: JobApplicationStatus;
  characterName: string;
  characterAge: number;
  experience: string;
  dailyAvailability: string;
  answers: Record<string, any>;
  reviewerId?: string;
  reviewerName?: string;
  reviewNotes?: string;
  createdAt: string;
  updatedAt: string;
  // Relational details when joined
  jobTitle?: string;
  jobCategory?: string;
  applicantUsername?: string;
  applicantDiscordId?: string;
  applicantAvatar?: string;
}

export interface ProductItem {
  id: string;
  slug: string;
  category: 'VIP' | 'VEHICLES' | 'PROPERTIES' | 'BUNDLES' | 'OTHER';
  price: number;
  currency: string;
  image: string;
  stock: number;
  status: 'ACTIVE' | 'OUT_OF_STOCK' | 'HIDDEN';
  featured: boolean;
  translations: {
    ar: { name: string; description: string; perks: string[] };
    en: { name: string; description: string; perks: string[] };
  };
}

export interface OrderItem {
  id: string;
  orderNumber: string;
  userId: string;
  productId: string;
  productName: string;
  price: number;
  currency: string;
  status: 'PENDING' | 'COMPLETED' | 'CANCELLED' | 'REFUNDED';
  createdAt: string;
}

export enum TicketStatus {
  OPEN = 'OPEN',
  IN_PROGRESS = 'IN_PROGRESS',
  WAITING = 'WAITING',
  CLOSED = 'CLOSED'
}

export enum TicketPriority {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  URGENT = 'URGENT'
}

export interface TicketMessage {
  id: string;
  ticketId: string;
  senderId: string;
  senderName: string;
  senderAvatar?: string;
  senderRole: string;
  isStaff: boolean;
  message: string;
  createdAt: string;
}

export interface TicketItem {
  id: string;
  ticketNumber: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  subject: string;
  category: string;
  priority: TicketPriority;
  status: TicketStatus;
  assignedTo?: string;
  createdAt: string;
  updatedAt: string;
  messages: TicketMessage[];
}

export interface NotificationItem {
  id: string;
  userId: string;
  type: 'TICKET' | 'ORDER' | 'SYSTEM' | 'ADMIN';
  title: string;
  message: string;
  link?: string;
  read: boolean;
  createdAt: string;
}

export interface AuditLogItem {
  id: string;
  adminId: string;
  adminName: string;
  action: string;
  entity: string;
  entityId: string;
  metadata?: string;
  ip: string;
  createdAt: string;
}

export type PermissionId =
  | 'manage_roles'       // نظام الرتب والصلاحيات
  | 'manage_users'       // إدارة المواطنين وحالاتهم
  | 'manage_homepage'    // التحكم الكامل بالصفحة الرئيسية والبنرات
  | 'manage_store'       // التحكم بالمتجر والمنتجات والأسعار
  | 'manage_orders'      // إدارة الطلبات والمبيعات
  | 'manage_rules'       // إدارة القوانين والبنود والتحذيرات
  | 'manage_jobs'        // إدارة الوظائف والتقديمات
  | 'manage_news'        // إدارة الأخبار والمقالات
  | 'manage_tickets'     // إدارة تذاكر الدعم الفني
  | 'manage_reports'     // مراجعة البلاغات والشكاوى
  | 'manage_leaderboard' // التحكم بالمتصدرين ولوحة الشرف
  | 'manage_faq'         // إدارة الأسئلة الشائعة
  | 'manage_settings'    // الإعدادات العامة والسيرفر والشعارات
  | 'view_audit_logs';   // استعراض سجل الرقابة والتدقيق

export interface PermissionDefinition {
  id: PermissionId;
  nameAr: string;
  nameEn: string;
  categoryAr: string;
  categoryEn: string;
  descriptionAr: string;
  descriptionEn: string;
}

export interface RoleDefinition {
  role: UserRole;
  nameAr: string;
  nameEn: string;
  badgeColor: string;
  descriptionAr: string;
  descriptionEn: string;
  level: number;
  defaultPermissions: PermissionId[];
}

export interface LeaderboardEntry {
  id: string;
  category: 'playtime' | 'wealth' | 'law' | 'wanted';
  rank: number;
  name: string;
  metric: string;
  subtitle: string;
  badge?: string;
  avatar?: string;
  discordId?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface HomepageSettings {
  announcement?: {
    enabled: boolean;
    textAr: string;
    textEn: string;
    type: 'info' | 'warning' | 'urgent' | 'success';
    badgeAr?: string;
    badgeEn?: string;
    link?: string;
  };
  hero?: {
    titleLine1Ar?: string;
    titleLine1En?: string;
    titleLine2Ar?: string;
    titleLine2En?: string;
    subtitleAr?: string;
    subtitleEn?: string;
    mottoAr?: string;
    mottoEn?: string;
    badgeAr?: string;
    badgeEn?: string;
    bgImage?: string;
    ctaConnectAr?: string;
    ctaConnectEn?: string;
    ctaDiscordAr?: string;
    ctaDiscordEn?: string;
  };
  stats?: {
    totalCitizens?: string;
    activeFactions?: string;
    satisfactionRate?: string;
    fpsPerformance?: string;
  };
}

export interface SiteSettings {
  siteName: string;
  siteDescription: string;
  discordUrl: string;
  fiveMConnectUrl: string;
  contactEmail: string;
  maintenanceMode: boolean;
  activePlayersCount: number;
  maxPlayersCount: number;
  serverStatus: 'ONLINE' | 'MAINTENANCE' | 'OFFLINE';
  discordClientId?: string;
  discordClientSecret?: string;
  discordRedirectUri?: string;
  logos?: {
    main?: string;       // Primary website logo
    navbar?: string;     // Top navigation bar logo
    hero?: string;       // Big Hero showcase logo
    footer?: string;     // Bottom footer logo
    login?: string;      // Login card logo
    favicon?: string;    // Browser favicon
  };
  homepage?: HomepageSettings;
  rolePermissions?: Record<string, PermissionId[]>;
}

export interface FAQItem {
  id: string;
  category: string;
  order: number;
  translations: {
    ar: { question: string; answer: string };
    en: { question: string; answer: string };
  };
}

export type ReportCategory = 'PLAYER_REPORT' | 'STAFF_REPORT' | 'BUG_REPORT' | 'RULE_VIOLATION' | 'OTHER';
export type ReportStatus = 'OPEN' | 'IN_REVIEW' | 'RESOLVED' | 'CLOSED';

export interface ReportItem {
  id: string;
  reporterId: string;
  reporterName: string;
  reporterAvatar?: string;
  targetId?: string;
  targetName?: string;
  category: ReportCategory;
  reason: string;
  status: ReportStatus;
  notes?: string;
  adminNotes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface SocialLinkItem {
  id: string;
  platform: string;
  url: string;
  label?: string;
  sortOrder?: number;
  isActive: boolean;
  createdAt: string;
}

export interface FiveMTelemetry {
  online: boolean;
  isOnline?: boolean;
  playersCount: number;
  activePlayers?: number;
  maxPlayers: number;
  serverName?: string;
  serverVersion?: string;
  gameBuild?: string;
  gametype?: string;
  mapname?: string;
  ping?: number;
  pingMs?: number;
  connectUrl?: string;
  ip?: string;
  port?: number;
  status?: string;
  error?: string;
  source?: string;
  raw?: any;
}

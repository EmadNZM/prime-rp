// Global Types for Prime RP Platform

export type Language = 'ar' | 'en';

export enum UserRole {
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
  globalName?: string;
  avatar?: string;
  email?: string;
  role: UserRole;
  status: UserStatus;
  permissions: string[];
  createdAt: string;
  updatedAt: string;
  lastLogin: string;
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
  status: 'PENDING' | 'COMPLETED' | 'CANCELLED';
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

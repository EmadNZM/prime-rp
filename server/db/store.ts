import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { 
  initialUsers, 
  initialNews, 
  initialRules, 
  initialJobs, 
  initialProducts, 
  initialFAQ, 
  initialSiteSettings,
  initialSocialLinks,
  initialReports,
  initialLeaderboard
} from './seedData';
import { 
  User, 
  NewsItem, 
  RuleCategory, 
  JobItem, 
  ProductItem, 
  OrderItem, 
  TicketItem, 
  NotificationItem, 
  AuditLogItem, 
  SiteSettings, 
  FAQItem,
  ReportItem,
  SocialLinkItem,
  ReportStatus,
  JobApplication,
  JobApplicationStatus,
  LeaderboardEntry
} from '../../src/types';

export interface StoredSession {
  id: string;
  userId: string;
  ipAddress?: string;
  userAgent?: string;
  expiresAt: string;
  createdAt: string;
  lastUsedAt: string;
}

export interface StoredDiscordTokens {
  userId: string;
  accessToken: string;
  refreshToken: string;
  expiresAt: string;
}

interface DatabaseSchema {
  users: User[];
  news: NewsItem[];
  rules: RuleCategory[];
  jobs: JobItem[];
  products: ProductItem[];
  orders: OrderItem[];
  tickets: TicketItem[];
  notifications: NotificationItem[];
  auditLogs: AuditLogItem[];
  siteSettings: SiteSettings;
  faq: FAQItem[];
  reports: ReportItem[];
  socialLinks: SocialLinkItem[];
  sessions: StoredSession[];
  discordTokens: StoredDiscordTokens[];
  jobApplications: JobApplication[];
  leaderboard: LeaderboardEntry[];
}

const DATA_DIR = path.join(process.cwd(), 'data');
const DB_FILE = path.join(DATA_DIR, 'prime_rp_db.json');

class DatabaseStore {
  private data: DatabaseSchema;
  private isInitialized: boolean = false;

  constructor() {
    this.data = {
      users: [],
      news: [],
      rules: [],
      jobs: [],
      products: [],
      orders: [],
      tickets: [],
      notifications: [],
      auditLogs: [],
      siteSettings: initialSiteSettings,
      faq: [],
      reports: [],
      socialLinks: [],
      sessions: [],
      discordTokens: [],
      jobApplications: [],
      leaderboard: []
    };
    this.init();
  }

  private init() {
    if (this.isInitialized) return;

    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }

    if (fs.existsSync(DB_FILE)) {
      try {
        const raw = fs.readFileSync(DB_FILE, 'utf-8');
        const parsed = JSON.parse(raw);
        this.data = {
          ...this.data,
          ...parsed,
          siteSettings: { ...initialSiteSettings, ...(parsed.siteSettings || {}) },
          reports: parsed.reports || [...initialReports],
          socialLinks: parsed.socialLinks || [...initialSocialLinks],
          sessions: parsed.sessions || [],
          discordTokens: parsed.discordTokens || [],
          jobApplications: parsed.jobApplications || [],
          leaderboard: parsed.leaderboard && parsed.leaderboard.length > 0 ? parsed.leaderboard : [...initialLeaderboard]
        };
      } catch (err) {
        console.error('Failed to parse database file, resetting to seed data:', err);
        this.seed();
      }
    } else {
      this.seed();
    }

    this.isInitialized = true;
  }

  private seed() {
    this.data.users = [...initialUsers];
    this.data.news = [...initialNews];
    this.data.rules = [...initialRules];
    this.data.jobs = [...initialJobs];
    this.data.products = [...initialProducts];
    this.data.faq = [...initialFAQ];
    this.data.reports = [...initialReports];
    this.data.socialLinks = [...initialSocialLinks];
    this.data.leaderboard = [...initialLeaderboard];
    this.data.sessions = [];
    this.data.discordTokens = [];
    this.data.siteSettings = { ...initialSiteSettings };
    this.data.orders = [
      {
        id: 'ord_1',
        orderNumber: 'PR-9241',
        userId: 'usr_citizen',
        productId: 'prod_vip_gold',
        productName: 'VIP Gold Royal Pass',
        price: 35,
        currency: 'USD',
        status: 'COMPLETED',
        createdAt: new Date('2026-02-15T14:30:00Z').toISOString()
      }
    ];
    this.data.tickets = [
      {
        id: 'tkt_1',
        ticketNumber: 'TKT-1001',
        userId: 'usr_citizen',
        userName: 'Tariq Al-Amri',
        userAvatar: 'https://images.unsplash.com/photo-1527980965255-d3b416303d12?w=150&auto=format&fit=crop&q=80',
        subject: 'استفسار بخصوص تفعيل رتبة VIP في الديسكورد',
        category: 'المتجر والاشتراكات',
        priority: 'MEDIUM' as any,
        status: 'OPEN' as any,
        assignedTo: 'usr_support',
        createdAt: new Date('2026-03-12T10:00:00Z').toISOString(),
        updatedAt: new Date('2026-03-12T11:20:00Z').toISOString(),
        messages: [
          {
            id: 'msg_1',
            ticketId: 'tkt_1',
            senderId: 'usr_citizen',
            senderName: 'Tariq Al-Amri',
            senderAvatar: 'https://images.unsplash.com/photo-1527980965255-d3b416303d12?w=150&auto=format&fit=crop&q=80',
            senderRole: 'CITIZEN',
            isStaff: false,
            message: 'السلام عليكم، قمت بشراء باقة VIP الذهبية وأود التأكد من ربط الرتبة بحسابي في الديسكورد.',
            createdAt: new Date('2026-03-12T10:00:00Z').toISOString()
          },
          {
            id: 'msg_2',
            ticketId: 'tkt_1',
            senderId: 'usr_support',
            senderName: 'Sultan Tech',
            senderAvatar: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=150&auto=format&fit=crop&q=80',
            senderRole: 'SUPPORT',
            isStaff: true,
            message: 'أهلاً بك يا طارق! تم التحقق من طلبك ورقم الفاتورة، وجرى تحديث الرتبة بنجاح. نتمنى لك تجربة لعب ممتعة.',
            createdAt: new Date('2026-03-12T11:20:00Z').toISOString()
          }
        ]
      }
    ];
    this.data.auditLogs = [
      {
        id: 'log_1',
        adminId: 'usr_superadmin',
        adminName: 'Prime Owner',
        action: 'NEWS_PUBLISHED',
        entity: 'NewsItem',
        entityId: 'news_01',
        metadata: 'نشر التحديث الجذري 3.0',
        ip: '127.0.0.1',
        createdAt: new Date('2026-03-01T12:00:00Z').toISOString()
      },
      {
        id: 'log_2',
        adminId: 'usr_admin',
        adminName: 'Faris Al-Harbi',
        action: 'SETTINGS_UPDATE',
        entity: 'SiteSettings',
        entityId: 'global',
        metadata: 'تحديث رابط سيرفر الديسكورد وتفاصيل حالة السيرفر',
        ip: '127.0.0.1',
        createdAt: new Date('2026-03-05T09:15:00Z').toISOString()
      }
    ];
    this.save();
  }

  private save() {
    try {
      fs.writeFileSync(DB_FILE, JSON.stringify(this.data, null, 2), 'utf-8');
    } catch (err) {
      console.error('Failed to write database file:', err);
    }
  }

  // --- USERS ---
  getUsers(): User[] {
    return this.data.users;
  }

  getUser(id: string): User | undefined {
    return this.data.users.find((u) => u.id === id || u.discordId === id);
  }

  getUserById(id: string): User | undefined {
    return this.data.users.find((u) => u.id === id || u.discordId === id);
  }

  getUserByDiscordId(discordId: string): User | undefined {
    return this.data.users.find((u) => u.discordId === discordId);
  }

  saveUser(user: User): User {
    const idx = this.data.users.findIndex(u => u.id === user.id);
    if (idx >= 0) {
      this.data.users[idx] = user;
    } else {
      this.data.users.push(user);
    }
    this.save();
    return user;
  }

  updateUser(id: string, partial: Partial<User>): User | null {
    const idx = this.data.users.findIndex(u => u.id === id || u.discordId === id);
    if (idx < 0) return null;
    this.data.users[idx] = {
      ...this.data.users[idx],
      ...partial,
      updatedAt: new Date().toISOString()
    };
    this.save();
    return this.data.users[idx];
  }

  upsertUser(userData: Partial<User> & { discordId: string }): User {
    const existingIndex = this.data.users.findIndex(
      (u) => u.discordId === userData.discordId || (userData.id && u.id === userData.id)
    );
    if (existingIndex >= 0) {
      const existing = this.data.users[existingIndex];
      const ownerDiscordId = (process.env.OWNER_DISCORD_ID || '').trim();
      const isOwner = Boolean(ownerDiscordId && (userData.discordId === ownerDiscordId || existing.discordId === ownerDiscordId));
      const assignedRole = isOwner ? ('OWNER' as any) : (existing.role === 'OWNER' ? ('CITIZEN' as any) : (userData.role !== undefined ? userData.role : existing.role));
      const isAdmin = isOwner || ['SUPER_ADMIN', 'ADMIN'].includes(assignedRole);

      const updated: User = {
        ...existing,
        ...userData,
        role: assignedRole,
        permissions: isOwner ? ['*'] : (userData.permissions !== undefined ? userData.permissions.filter(p => p !== '*') : existing.permissions.filter(p => p !== '*')),
        status: userData.status !== undefined ? userData.status : existing.status,
        isAdmin: Boolean(isAdmin),
        isOwner: Boolean(isOwner),
        updatedAt: new Date().toISOString(),
        lastLogin: new Date().toISOString()
      };
      this.data.users[existingIndex] = updated;
      this.save();
      return updated;
    } else {
      // STRICT REQUIREMENT: Any newly registered user is ALWAYS a standard CITIZEN!
      // The administration grants elevated roles/permissions from the admin panel.
      const ownerDiscordId = (process.env.OWNER_DISCORD_ID || '').trim();
      const isOwner = Boolean(ownerDiscordId && userData.discordId === ownerDiscordId);
      const newUserRole = isOwner ? ('OWNER' as any) : (userData.role === 'OWNER' ? ('CITIZEN' as any) : (userData.role || ('CITIZEN' as any)));
      const isAdmin = isOwner || ['SUPER_ADMIN', 'ADMIN'].includes(newUserRole);

      const defaultPermissions = isOwner
        ? ['*']
        : newUserRole === 'ADMIN'
        ? ['users.view', 'users.edit', 'news.*', 'rules.*', 'jobs.*', 'tickets.*', 'audit.view']
        : ['tickets.create', 'orders.create'];

      const newUser: User = {
        id: `usr_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
        discordId: userData.discordId,
        username: userData.username || 'Citizen',
        globalName: userData.globalName || userData.username || 'Citizen',
        avatar: userData.avatar,
        email: userData.email,
        role: newUserRole,
        status: userData.status || ('ACTIVE' as any),
        isAdmin: Boolean(isAdmin),
        isOwner: Boolean(isOwner),
        permissions: userData.permissions || defaultPermissions,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        lastLogin: new Date().toISOString(),
        bio: userData.bio || ''
      };
      this.data.users.push(newUser);
      this.save();
      return newUser;
    }
  }

  updateUserRole(userId: string, role: any, permissions?: string[]): User | null {
    const user = this.data.users.find((u) => u.id === userId || u.discordId === userId);
    if (!user) return null;
    user.role = role;
    if (permissions && permissions.length > 0) {
      user.permissions = permissions;
    } else {
      // Apply standard permissions matching the new role granted by administration
      switch (role) {
        case 'SUPER_ADMIN':
          user.permissions = ['*'];
          break;
        case 'ADMIN':
          user.permissions = ['users.view', 'users.edit', 'news.*', 'rules.*', 'jobs.*', 'tickets.*', 'audit.view', 'settings.edit'];
          break;
        case 'MODERATOR':
          user.permissions = ['users.view', 'rules.edit', 'tickets.view', 'tickets.reply', 'audit.view'];
          break;
        case 'SUPPORT':
          user.permissions = ['tickets.view', 'tickets.reply', 'tickets.close'];
          break;
        case 'EDITOR':
          user.permissions = ['news.*', 'rules.edit'];
          break;
        case 'STORE_MANAGER':
          user.permissions = ['products.*', 'orders.*'];
          break;
        case 'CITIZEN':
        default:
          user.permissions = ['tickets.create', 'orders.create'];
          break;
      }
    }
    user.updatedAt = new Date().toISOString();
    this.save();
    return user;
  }

  assignUserRoleByIdentifier(identifier: string, role: any, permissions?: string[]): User {
    const clean = String(identifier).trim().toLowerCase();
    const existing = this.data.users.find(
      (u) =>
        u.id.toLowerCase() === clean ||
        u.discordId.toLowerCase() === clean ||
        u.username.toLowerCase() === clean ||
        (u.globalName && u.globalName.toLowerCase() === clean)
    );

    if (existing) {
      return this.updateUserRole(existing.id, role, permissions) || existing;
    }

    // Pre-create user placeholder with assigned role so when they log in via Discord later they get this role
    return this.upsertUser({
      discordId: identifier.startsWith('usr_') ? identifier : `discord_${identifier}`,
      username: identifier,
      globalName: identifier,
      role: role,
      permissions: permissions
    });
  }

  updateUserStatus(userId: string, status: any): User | null {
    const user = this.data.users.find((u) => u.id === userId);
    if (!user) return null;
    user.status = status;
    user.updatedAt = new Date().toISOString();
    this.save();
    return user;
  }

  // --- NEWS ---
  getNews(onlyPublished: boolean = true): NewsItem[] {
    if (onlyPublished) {
      return this.data.news.filter((n) => n.status === 'PUBLISHED');
    }
    return this.data.news;
  }

  getNewsBySlug(slug: string): NewsItem | undefined {
    return this.data.news.find((n) => n.slug === slug);
  }

  saveNews(item: Partial<NewsItem>): NewsItem {
    if (item.id) {
      const idx = this.data.news.findIndex((n) => n.id === item.id);
      if (idx >= 0) {
        this.data.news[idx] = {
          ...this.data.news[idx],
          ...item,
          updatedAt: new Date().toISOString()
        } as NewsItem;
        this.save();
        return this.data.news[idx];
      }
    }
    const newItem: NewsItem = {
      id: `news_${Date.now()}`,
      slug: item.slug || `news-${Date.now()}`,
      status: item.status || 'PUBLISHED',
      featured: !!item.featured,
      image: item.image || 'https://images.unsplash.com/photo-1511512578047-dfb367046420?w=800&auto=format&fit=crop&q=80',
      category: item.category || 'عام',
      authorId: item.authorId || 'usr_admin',
      authorName: item.authorName || 'Prime Administration',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      translations: item.translations || {
        ar: { title: 'خبر جديد', excerpt: '', content: '' },
        en: { title: 'New Announcement', excerpt: '', content: '' }
      }
    };
    this.data.news.unshift(newItem);
    this.save();
    return newItem;
  }

  deleteNews(id: string): boolean {
    const initialLen = this.data.news.length;
    this.data.news = this.data.news.filter((n) => n.id !== id);
    if (this.data.news.length !== initialLen) {
      this.save();
      return true;
    }
    return false;
  }

  // --- RULES ---
  getRules(): RuleCategory[] {
    return this.data.rules;
  }

  saveRuleCategory(cat: Partial<RuleCategory>): RuleCategory {
    if (cat.id) {
      const idx = this.data.rules.findIndex((r) => r.id === cat.id);
      if (idx >= 0) {
        this.data.rules[idx] = {
          ...this.data.rules[idx],
          ...cat,
          translations: cat.translations ? cat.translations : this.data.rules[idx].translations,
          rules: cat.rules !== undefined ? cat.rules : this.data.rules[idx].rules
        } as RuleCategory;
        this.save();
        return this.data.rules[idx];
      }
    }
    const newCat: RuleCategory = {
      id: `rule_cat_${Date.now()}`,
      slug: cat.slug || `rules-${Date.now()}`,
      order: cat.order || this.data.rules.length + 1,
      translations: cat.translations || {
        ar: { title: 'قسم جديد', description: '', penaltyInfo: '' },
        en: { title: 'New Category', description: '', penaltyInfo: '' }
      },
      rules: cat.rules || []
    };
    this.data.rules.push(newCat);
    this.save();
    return newCat;
  }

  // --- JOBS ---
  getJobs(): JobItem[] {
    return this.data.jobs;
  }

  saveJob(job: Partial<JobItem>): JobItem {
    if (job.id) {
      const idx = this.data.jobs.findIndex((j) => j.id === job.id);
      if (idx >= 0) {
        this.data.jobs[idx] = {
          ...this.data.jobs[idx],
          ...job,
          translations: job.translations ? job.translations : this.data.jobs[idx].translations
        } as JobItem;
        this.save();
        return this.data.jobs[idx];
      }
    }
    const newJob: JobItem = {
      id: `job_${Date.now()}`,
      slug: job.slug || `job-${Date.now()}`,
      category: job.category || 'CIVILIAN',
      image: job.image || 'https://images.unsplash.com/photo-1541872703-74c5e44368f9?w=800&auto=format&fit=crop&q=80',
      salaryMin: job.salaryMin || 2500,
      salaryMax: job.salaryMax || 5000,
      status: job.status || 'HIRING_OPEN',
      translations: job.translations || {
        ar: { name: 'وظيفة جديدة', description: '', requirements: [], duties: [] },
        en: { name: 'New Profession', description: '', requirements: [], duties: [] }
      }
    };
    this.data.jobs.push(newJob);
    this.save();
    return newJob;
  }

  // --- PRODUCTS & ORDERS ---
  getProducts(): ProductItem[] {
    return this.data.products;
  }

  saveProduct(prod: Partial<ProductItem>): ProductItem {
    if (prod.id) {
      const idx = this.data.products.findIndex((p) => p.id === prod.id);
      if (idx >= 0) {
        this.data.products[idx] = {
          ...this.data.products[idx],
          ...prod,
          translations: prod.translations ? prod.translations : this.data.products[idx].translations
        } as ProductItem;
        this.save();
        return this.data.products[idx];
      }
    }
    const newProd: ProductItem = {
      id: `prod_${Date.now()}`,
      slug: prod.slug || `prod-${Date.now()}`,
      category: prod.category || 'VIP',
      price: prod.price || 10,
      currency: prod.currency || 'USD',
      image: prod.image || 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=800&auto=format&fit=crop&q=80',
      stock: prod.stock || 50,
      status: prod.status || 'ACTIVE',
      featured: !!prod.featured,
      translations: prod.translations || {
        ar: { name: 'منتج جديد', description: '', perks: [] },
        en: { name: 'New Item', description: '', perks: [] }
      }
    };
    this.data.products.push(newProd);
    this.save();
    return newProd;
  }

  getOrders(userId?: string): OrderItem[] {
    if (userId) {
      return this.data.orders.filter((o) => o.userId === userId);
    }
    return this.data.orders;
  }

  createOrder(userId: string, productId: string): OrderItem | null {
    const product = this.data.products.find((p) => p.id === productId);
    if (!product) return null;

    const order: OrderItem = {
      id: `ord_${Date.now()}`,
      orderNumber: `PR-${Math.floor(1000 + Math.random() * 9000)}`,
      userId,
      productId: product.id,
      productName: product.translations.en.name,
      price: product.price,
      currency: product.currency,
      status: 'COMPLETED',
      createdAt: new Date().toISOString()
    };

    this.data.orders.unshift(order);
    this.save();

    // Create Notification
    this.createNotification({
      userId,
      type: 'ORDER',
      title: 'طلب شراء ناجح',
      message: `تم إتمام طلبك رقم ${order.orderNumber} لمنتج ${product.translations.ar.name} بنجاح.`
    });

    return order;
  }

  // --- TICKETS ---
  getTickets(userId?: string): TicketItem[] {
    if (userId) {
      return this.data.tickets.filter((t) => t.userId === userId);
    }
    return this.data.tickets;
  }

  getTicketById(id: string): TicketItem | undefined {
    return this.data.tickets.find((t) => t.id === id);
  }

  createTicket(data: {
    userId: string;
    userName: string;
    userAvatar?: string;
    subject: string;
    category: string;
    priority?: any;
    initialMessage: string;
  }): TicketItem {
    const ticketId = `tkt_${Date.now()}`;
    const newTicket: TicketItem = {
      id: ticketId,
      ticketNumber: `TKT-${Math.floor(1000 + Math.random() * 9000)}`,
      userId: data.userId,
      userName: data.userName,
      userAvatar: data.userAvatar,
      subject: data.subject,
      category: data.category,
      priority: data.priority || 'MEDIUM',
      status: 'OPEN' as any,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      messages: [
        {
          id: `msg_${Date.now()}`,
          ticketId,
          senderId: data.userId,
          senderName: data.userName,
          senderAvatar: data.userAvatar,
          senderRole: 'CITIZEN',
          isStaff: false,
          message: data.initialMessage,
          createdAt: new Date().toISOString()
        }
      ]
    };

    this.data.tickets.unshift(newTicket);
    this.save();
    return newTicket;
  }

  addTicketMessage(data: {
    ticketId: string;
    senderId: string;
    senderName: string;
    senderAvatar?: string;
    senderRole: string;
    isStaff: boolean;
    message: string;
  }): TicketItem | null {
    const ticket = this.data.tickets.find((t) => t.id === data.ticketId);
    if (!ticket) return null;

    ticket.messages.push({
      id: `msg_${Date.now()}`,
      ticketId: data.ticketId,
      senderId: data.senderId,
      senderName: data.senderName,
      senderAvatar: data.senderAvatar,
      senderRole: data.senderRole,
      isStaff: data.isStaff,
      message: data.message,
      createdAt: new Date().toISOString()
    });

    ticket.updatedAt = new Date().toISOString();
    if (data.isStaff && ticket.status === 'OPEN') {
      ticket.status = 'IN_PROGRESS' as any;
    }

    this.save();

    // Notify user if staff replied
    if (data.isStaff && ticket.userId !== data.senderId) {
      this.createNotification({
        userId: ticket.userId,
        type: 'TICKET',
        title: 'رد جديد على تذكرتك',
        message: `قام فريق الدعم الفني بالرد على التذكرة #${ticket.ticketNumber}.`
      });
    }

    return ticket;
  }

  updateTicketStatus(ticketId: string, status: any): TicketItem | null {
    const ticket = this.data.tickets.find((t) => t.id === ticketId);
    if (!ticket) return null;
    ticket.status = status;
    ticket.updatedAt = new Date().toISOString();
    this.save();
    return ticket;
  }

  // --- NOTIFICATIONS ---
  getNotifications(userId: string): NotificationItem[] {
    return this.data.notifications.filter((n) => n.userId === userId);
  }

  createNotification(data: Omit<NotificationItem, 'id' | 'read' | 'createdAt'>): NotificationItem {
    const notif: NotificationItem = {
      ...data,
      id: `notif_${Date.now()}`,
      read: false,
      createdAt: new Date().toISOString()
    };
    this.data.notifications.unshift(notif);
    this.save();
    return notif;
  }

  markNotificationAsRead(id: string, userId?: string): boolean {
    const notif = this.data.notifications.find((n) => n.id === id && (!userId || n.userId === userId));
    if (notif) {
      notif.read = true;
      this.save();
      return true;
    }
    return false;
  }

  // --- AUDIT LOGS ---
  getAuditLogs(limit: number = 50): AuditLogItem[] {
    return this.data.auditLogs.slice(0, limit);
  }

  logAudit(log: Omit<AuditLogItem, 'id' | 'createdAt'>): AuditLogItem {
    const entry: AuditLogItem = {
      ...log,
      id: `log_${Date.now()}`,
      createdAt: new Date().toISOString()
    };
    this.data.auditLogs.unshift(entry);
    // Keep max 200 logs
    if (this.data.auditLogs.length > 200) {
      this.data.auditLogs = this.data.auditLogs.slice(0, 200);
    }
    this.save();
    return entry;
  }

  // --- SITE SETTINGS ---
  getSiteSettings(): SiteSettings {
    return this.data.siteSettings;
  }

  updateSiteSettings(settings: Partial<SiteSettings>): SiteSettings {
    this.data.siteSettings = {
      ...this.data.siteSettings,
      ...settings
    };
    this.save();
    return this.data.siteSettings;
  }

  // --- RULES EXTRA ---
  deleteRuleCategory(id: string): boolean {
    const initialLen = this.data.rules.length;
    this.data.rules = this.data.rules.filter(r => r.id !== id);
    if (this.data.rules.length !== initialLen) {
      this.save();
      return true;
    }
    return false;
  }

  // --- JOBS EXTRA ---
  deleteJob(id: string): boolean {
    const initialLen = this.data.jobs.length;
    this.data.jobs = this.data.jobs.filter(j => j.id !== id);
    if (this.data.jobs.length !== initialLen) {
      this.save();
      return true;
    }
    return false;
  }

  // --- PRODUCTS EXTRA ---
  deleteProduct(id: string): boolean {
    const initialLen = this.data.products.length;
    this.data.products = this.data.products.filter(p => p.id !== id);
    if (this.data.products.length !== initialLen) {
      this.save();
      return true;
    }
    return false;
  }

  // --- FAQ ---
  getFAQ(): FAQItem[] {
    return this.data.faq;
  }

  saveFAQ(data: Partial<FAQItem>): FAQItem {
    const id = data.id || `faq_${Date.now()}`;
    const existingIndex = this.data.faq.findIndex(f => f.id === id);
    const item: FAQItem = {
      id,
      category: data.category || 'عام',
      order: typeof data.order === 'number' ? data.order : 0,
      translations: data.translations || { ar: { question: '', answer: '' }, en: { question: '', answer: '' } }
    };
    if (existingIndex >= 0) {
      this.data.faq[existingIndex] = item;
    } else {
      this.data.faq.push(item);
    }
    this.save();
    return item;
  }

  deleteFAQ(id: string): boolean {
    const initialLen = this.data.faq.length;
    this.data.faq = this.data.faq.filter(f => f.id !== id);
    if (this.data.faq.length !== initialLen) {
      this.save();
      return true;
    }
    return false;
  }

  // --- REPORTS ---
  getReports(reporterId?: string): ReportItem[] {
    if (reporterId) {
      return this.data.reports.filter(r => r.reporterId === reporterId);
    }
    return this.data.reports;
  }

  getReportById(id: string): ReportItem | undefined {
    return this.data.reports.find(r => r.id === id);
  }

  createReport(data: {
    reporterId: string;
    reporterName: string;
    reporterAvatar?: string;
    targetId?: string;
    targetName?: string;
    category: any;
    reason: string;
    notes?: string;
  }): ReportItem {
    const id = `rep_${Date.now()}_${crypto.randomBytes(3).toString('hex')}`;
    const report: ReportItem = {
      id,
      reporterId: data.reporterId,
      reporterName: data.reporterName,
      reporterAvatar: data.reporterAvatar,
      targetId: data.targetId,
      targetName: data.targetName,
      category: data.category,
      reason: data.reason,
      status: 'OPEN',
      notes: data.notes,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    this.data.reports.unshift(report);
    this.save();
    return report;
  }

  updateReportStatus(id: string, status: any, notes?: string): ReportItem | null {
    const report = this.data.reports.find(r => r.id === id);
    if (!report) return null;
    report.status = status;
    if (notes !== undefined) {
      report.adminNotes = notes;
    }
    report.updatedAt = new Date().toISOString();
    this.save();
    return report;
  }

  // --- SOCIAL LINKS ---
  getSocialLinks(activeOnly: boolean = false): SocialLinkItem[] {
    if (activeOnly) {
      return this.data.socialLinks.filter(s => s.isActive);
    }
    return this.data.socialLinks;
  }

  saveSocialLink(data: { id?: string; platform: string; url: string; isActive?: boolean }): SocialLinkItem {
    const id = data.id || `soc_${Date.now()}`;
    const existingIndex = this.data.socialLinks.findIndex(s => s.id === id);
    const item: SocialLinkItem = {
      id,
      platform: data.platform,
      url: data.url,
      isActive: data.isActive !== undefined ? data.isActive : true,
      createdAt: existingIndex >= 0 ? this.data.socialLinks[existingIndex].createdAt : new Date().toISOString()
    };
    if (existingIndex >= 0) {
      this.data.socialLinks[existingIndex] = item;
    } else {
      this.data.socialLinks.push(item);
    }
    this.save();
    return item;
  }

  deleteSocialLink(id: string): boolean {
    const initialLen = this.data.socialLinks.length;
    this.data.socialLinks = this.data.socialLinks.filter(s => s.id !== id);
    if (this.data.socialLinks.length !== initialLen) {
      this.save();
      return true;
    }
    return false;
  }

  // --- SESSIONS ---
  createSession(userId: string, ipAddress?: string, userAgent?: string, durationDays: number = 30): string {
    const sessionId = `ses_${crypto.randomBytes(32).toString('hex')}`;
    const expiresAt = new Date(Date.now() + durationDays * 24 * 60 * 60 * 1000).toISOString();
    const session: StoredSession = {
      id: sessionId,
      userId,
      ipAddress,
      userAgent,
      expiresAt,
      createdAt: new Date().toISOString(),
      lastUsedAt: new Date().toISOString()
    };
    this.data.sessions.push(session);
    this.save();
    return sessionId;
  }

  validateSession(sessionId: string): User | null {
    const session = this.data.sessions.find(s => s.id === sessionId);
    if (!session) return null;
    if (new Date(session.expiresAt) < new Date()) {
      this.deleteSession(sessionId);
      return null;
    }
    session.lastUsedAt = new Date().toISOString();
    this.save();
    const user = this.getUserById(session.userId);
    return user || null;
  }

  deleteSession(sessionId: string): void {
    this.data.sessions = this.data.sessions.filter(s => s.id !== sessionId);
    this.save();
  }

  deleteUserSessions(userId: string): void {
    this.data.sessions = this.data.sessions.filter(s => s.userId !== userId);
    this.save();
  }

  // --- DISCORD TOKENS ---
  saveDiscordTokens(userId: string, accessToken: string, refreshToken: string, expiresInSeconds: number = 604800): void {
    const expiresAt = new Date(Date.now() + expiresInSeconds * 1000).toISOString();
    const idx = this.data.discordTokens.findIndex(t => t.userId === userId);
    const entry: StoredDiscordTokens = { userId, accessToken, refreshToken, expiresAt };
    if (idx >= 0) {
      this.data.discordTokens[idx] = entry;
    } else {
      this.data.discordTokens.push(entry);
    }
    this.save();
  }

  getDiscordTokens(userId: string): StoredDiscordTokens | null {
    return this.data.discordTokens.find(t => t.userId === userId) || null;
  }

  deleteDiscordTokens(userId: string): void {
    this.data.discordTokens = this.data.discordTokens.filter(t => t.userId !== userId);
    this.save();
  }

  // --- JOB APPLICATIONS ---
  createJobApplication(app: JobApplication): JobApplication {
    const existing = this.data.jobApplications.find(
      a => a.jobId === app.jobId && a.userId === app.userId && (a.status === 'PENDING' || a.status === 'UNDER_REVIEW')
    );
    if (existing) {
      const err: any = new Error('لديك طلب توظيف معلّق مسبقاً لهذه الوظيفة قيد المراجعة والدراسة.');
      err.code = 'DUPLICATE_APPLICATION';
      err.statusCode = 409;
      throw err;
    }

    const job = this.data.jobs.find(j => j.id === app.jobId);
    const user = this.data.users.find(u => u.id === app.userId);
    const enriched: JobApplication = {
      ...app,
      jobTitle: job?.translations.ar?.name || job?.translations.en?.name || job?.slug,
      jobCategory: job?.category,
      applicantUsername: user?.username,
      applicantDiscordId: user?.discordId,
      applicantAvatar: user?.avatar
    };
    this.data.jobApplications.push(enriched);
    this.save();
    return enriched;
  }

  getJobApplicationById(id: string): JobApplication | null {
    return this.data.jobApplications.find(a => a.id === id) || null;
  }

  getJobApplicationsByUserId(userId: string): JobApplication[] {
    return this.data.jobApplications
      .filter(a => a.userId === userId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  getJobApplicationByJobAndUser(jobId: string, userId: string): JobApplication | null {
    return this.data.jobApplications.find(a => a.jobId === jobId && a.userId === userId) || null;
  }

  getAllJobApplications(filters?: { status?: string; jobId?: string }): JobApplication[] {
    let list = [...this.data.jobApplications];
    if (filters?.status) {
      list = list.filter(a => a.status === filters.status);
    }
    if (filters?.jobId) {
      list = list.filter(a => a.jobId === filters.jobId);
    }
    return list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  updateJobApplicationStatus(
    id: string,
    status: JobApplicationStatus,
    reviewerId: string,
    reviewNotes?: string
  ): JobApplication | null {
    const reviewer = this.data.users.find(u => u.id === reviewerId);
    const app = this.data.jobApplications.find(a => a.id === id);
    if (!app) return null;
    app.status = status;
    app.reviewerId = reviewerId;
    app.reviewerName = reviewer?.username || 'Staff';
    if (reviewNotes !== undefined) app.reviewNotes = reviewNotes;
    app.updatedAt = new Date().toISOString();
    this.save();
    return app;
  }

  // --- LEADERBOARD ---
  getLeaderboard(category?: string): LeaderboardEntry[] {
    if (!this.data.leaderboard || this.data.leaderboard.length === 0) {
      this.data.leaderboard = [...initialLeaderboard];
    }
    if (category) {
      return this.data.leaderboard
        .filter(item => item.category === category)
        .sort((a, b) => (a.rank || 0) - (b.rank || 0));
    }
    return this.data.leaderboard.sort((a, b) => (a.rank || 0) - (b.rank || 0));
  }

  saveLeaderboardEntry(entry: Partial<LeaderboardEntry> & { name: string; metric: string }): LeaderboardEntry {
    if (!this.data.leaderboard) {
      this.data.leaderboard = [...initialLeaderboard];
    }
    const id = entry.id || `lb_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    const existingIndex = this.data.leaderboard.findIndex(i => i.id === id);
    const updated: LeaderboardEntry = {
      id,
      category: (entry.category as any) || 'playtime',
      rank: Number(entry.rank) || (this.data.leaderboard.length + 1),
      name: entry.name,
      metric: entry.metric,
      subtitle: entry.subtitle || '',
      badge: entry.badge || '',
      avatar: entry.avatar || '',
      discordId: entry.discordId || '',
      createdAt: entry.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    if (existingIndex >= 0) {
      this.data.leaderboard[existingIndex] = updated;
    } else {
      this.data.leaderboard.push(updated);
    }
    this.save();
    return updated;
  }

  deleteLeaderboardEntry(id: string): boolean {
    if (!this.data.leaderboard) return false;
    const initialLength = this.data.leaderboard.length;
    this.data.leaderboard = this.data.leaderboard.filter(i => i.id !== id);
    if (this.data.leaderboard.length !== initialLength) {
      this.save();
      return true;
    }
    return false;
  }
}

export const db = new DatabaseStore();

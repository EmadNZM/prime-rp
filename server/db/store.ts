import fs from 'fs';
import path from 'path';
import { 
  initialUsers, 
  initialNews, 
  initialRules, 
  initialJobs, 
  initialProducts, 
  initialFAQ, 
  initialSiteSettings 
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
  FAQItem 
} from '../../src/types';

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
      faq: []
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
          siteSettings: { ...initialSiteSettings, ...(parsed.siteSettings || {}) }
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

  getUserById(id: string): User | undefined {
    return this.data.users.find((u) => u.id === id || u.discordId === id);
  }

  upsertUser(userData: Partial<User> & { discordId: string }): User {
    const existingIndex = this.data.users.findIndex(
      (u) => u.discordId === userData.discordId || (userData.id && u.id === userData.id)
    );
    if (existingIndex >= 0) {
      const existing = this.data.users[existingIndex];
      const updated = {
        ...existing,
        ...userData,
        // Preserve admin-assigned role, status and permissions unless explicitly provided
        role: userData.role !== undefined ? userData.role : existing.role,
        permissions: userData.permissions !== undefined ? userData.permissions : existing.permissions,
        status: userData.status !== undefined ? userData.status : existing.status,
        updatedAt: new Date().toISOString(),
        lastLogin: new Date().toISOString()
      };
      this.data.users[existingIndex] = updated as User;
      this.save();
      return updated as User;
    } else {
      // STRICT REQUIREMENT: Any newly registered user is ALWAYS a standard CITIZEN!
      // The administration grants elevated roles/permissions from the admin panel.
      const newUserRole = userData.role || ('CITIZEN' as any);
      const defaultPermissions = newUserRole === 'SUPER_ADMIN'
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
        this.data.rules[idx] = { ...this.data.rules[idx], ...cat } as RuleCategory;
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
        this.data.jobs[idx] = { ...this.data.jobs[idx], ...job } as JobItem;
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
        this.data.products[idx] = { ...this.data.products[idx], ...prod } as ProductItem;
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

  markNotificationAsRead(id: string): boolean {
    const notif = this.data.notifications.find((n) => n.id === id);
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

  // --- FAQ ---
  getFAQ(): FAQItem[] {
    return this.data.faq;
  }
}

export const db = new DatabaseStore();

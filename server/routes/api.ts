import { Router, Request, Response } from 'express';
import { db } from '../db/store';
import { 
  handleDiscordLogin, 
  handleDiscordCallback, 
  handleDiscordDirectLogin,
  getAuthConfig,
  handlePortalLogin, 
  handleLogout 
} from '../auth/discordAuth';
import { attachUser, requireAuth, requireRole, requirePermission } from '../middleware/authMiddleware';
import { UserRole } from '../../src/types';
import { fiveMService } from '../services/fivemService';

const router = Router();

// Middleware to parse user from session on all API routes
router.use(attachUser);

// ---------------- AUTHENTICATION ----------------
router.get('/auth/config', getAuthConfig);
router.get('/auth/me', (req: Request, res: Response) => {
  if (!req.user) {
    return res.json({ authenticated: false, user: null });
  }
  return res.json({ authenticated: true, user: req.user });
});

router.get('/auth/discord', handleDiscordLogin);
router.get('/auth/discord/callback', handleDiscordCallback);
router.post('/auth/discord-direct', handleDiscordDirectLogin);
router.post('/auth/portal-login', handlePortalLogin);
router.post('/auth/logout', handleLogout);

// ---------------- SITE SETTINGS & FIVEM STATUS ----------------
router.get('/site-settings', async (req: Request, res: Response) => {
  const settings = db.getSiteSettings();
  const telemetry = await fiveMService.getServerStatus();
  return res.json({
    ...settings,
    telemetry
  });
});

// ---------------- PUBLIC CONTENT ----------------
router.get('/news', (req: Request, res: Response) => {
  const news = db.getNews(true);
  return res.json(news);
});

router.get('/news/:slug', (req: Request, res: Response) => {
  const item = db.getNewsBySlug(req.params.slug);
  if (!item) {
    return res.status(404).json({ error: 'News item not found' });
  }
  return res.json(item);
});

router.get('/rules', (req: Request, res: Response) => {
  const rules = db.getRules();
  return res.json(rules);
});

router.get('/jobs', (req: Request, res: Response) => {
  const jobs = db.getJobs();
  return res.json(jobs);
});

router.get('/products', (req: Request, res: Response) => {
  const products = db.getProducts().filter((p) => p.status !== 'HIDDEN');
  return res.json(products);
});

router.get('/faq', (req: Request, res: Response) => {
  const faq = db.getFAQ();
  return res.json(faq);
});

// ---------------- USER ORDERS & CART CHECKOUT ----------------
router.get('/orders', requireAuth, (req: Request, res: Response) => {
  const orders = db.getOrders(req.user!.id);
  return res.json(orders);
});

router.post('/orders/checkout', requireAuth, (req: Request, res: Response) => {
  const { productId } = req.body;
  if (!productId) {
    return res.status(400).json({ error: 'Product ID is required' });
  }

  const order = db.createOrder(req.user!.id, productId);
  if (!order) {
    return res.status(404).json({ error: 'Product not found or unavailable' });
  }

  return res.status(201).json(order);
});

// ---------------- USER TICKETS ----------------
router.get('/tickets', requireAuth, (req: Request, res: Response) => {
  // If staff/admin, return all or filtered tickets, otherwise only user's tickets
  const isStaff = [UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.MODERATOR, UserRole.SUPPORT].includes(req.user!.role);
  const tickets = isStaff ? db.getTickets() : db.getTickets(req.user!.id);
  return res.json(tickets);
});

router.get('/tickets/:id', requireAuth, (req: Request, res: Response) => {
  const ticket = db.getTicketById(req.params.id);
  if (!ticket) {
    return res.status(404).json({ error: 'Ticket not found' });
  }

  const isStaff = [UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.MODERATOR, UserRole.SUPPORT].includes(req.user!.role);
  if (!isStaff && ticket.userId !== req.user!.id) {
    return res.status(403).json({ error: 'Forbidden' });
  }

  return res.json(ticket);
});

router.post('/tickets', requireAuth, (req: Request, res: Response) => {
  const { subject, category, priority, message } = req.body;
  if (!subject || !category || !message) {
    return res.status(400).json({ error: 'Subject, category, and message are required' });
  }

  const ticket = db.createTicket({
    userId: req.user!.id,
    userName: req.user!.globalName || req.user!.username,
    userAvatar: req.user!.avatar,
    subject,
    category,
    priority,
    initialMessage: message
  });

  return res.status(201).json(ticket);
});

router.post('/tickets/:id/messages', requireAuth, (req: Request, res: Response) => {
  const { message } = req.body;
  if (!message) {
    return res.status(400).json({ error: 'Message text is required' });
  }

  const ticket = db.getTicketById(req.params.id);
  if (!ticket) {
    return res.status(404).json({ error: 'Ticket not found' });
  }

  const isStaff = [UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.MODERATOR, UserRole.SUPPORT].includes(req.user!.role);
  if (!isStaff && ticket.userId !== req.user!.id) {
    return res.status(403).json({ error: 'Forbidden' });
  }

  const updatedTicket = db.addTicketMessage({
    ticketId: req.params.id,
    senderId: req.user!.id,
    senderName: req.user!.globalName || req.user!.username,
    senderAvatar: req.user!.avatar,
    senderRole: req.user!.role,
    isStaff,
    message
  });

  return res.json(updatedTicket);
});

router.patch('/tickets/:id/status', requireAuth, (req: Request, res: Response) => {
  const { status } = req.body;
  const isStaff = [UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.MODERATOR, UserRole.SUPPORT].includes(req.user!.role);
  if (!isStaff) {
    return res.status(403).json({ error: 'Only staff can modify ticket status' });
  }

  const updated = db.updateTicketStatus(req.params.id, status);
  if (!updated) {
    return res.status(404).json({ error: 'Ticket not found' });
  }

  return res.json(updated);
});

// ---------------- USER NOTIFICATIONS ----------------
router.get('/notifications', requireAuth, (req: Request, res: Response) => {
  const list = db.getNotifications(req.user!.id);
  return res.json(list);
});

router.patch('/notifications/:id/read', requireAuth, (req: Request, res: Response) => {
  const success = db.markNotificationAsRead(req.params.id);
  return res.json({ success });
});

// ---------------- ADMIN OVERVIEW & DASHBOARD ----------------
router.get('/admin/overview', requireAuth, requireRole([UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.MODERATOR, UserRole.SUPPORT, UserRole.EDITOR, UserRole.STORE_MANAGER]), (req: Request, res: Response) => {
  const users = db.getUsers();
  const tickets = db.getTickets();
  const orders = db.getOrders();
  const news = db.getNews(false);
  const products = db.getProducts();
  const auditLogs = db.getAuditLogs(10);

  const openTicketsCount = tickets.filter((t) => t.status === 'OPEN' || t.status === 'IN_PROGRESS').length;
  const totalRevenue = orders.reduce((sum, o) => sum + (o.status === 'COMPLETED' ? o.price : 0), 0);

  return res.json({
    metrics: {
      totalUsers: users.length,
      activeUsers: users.filter((u) => u.status === 'ACTIVE').length,
      openTickets: openTicketsCount,
      totalOrders: orders.length,
      totalRevenue,
      totalNews: news.length,
      totalProducts: products.length
    },
    recentAuditLogs: auditLogs
  });
});

// ---------------- ADMIN: USER MANAGEMENT ----------------
router.get('/admin/users', requireAuth, requireRole([UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.MODERATOR]), (req: Request, res: Response) => {
  const users = db.getUsers();
  return res.json(users);
});

router.patch('/admin/users/:id/role', requireAuth, requireRole([UserRole.SUPER_ADMIN, UserRole.ADMIN]), (req: Request, res: Response) => {
  const { role } = req.body;
  const user = db.updateUserRole(req.params.id, role);
  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }

  db.logAudit({
    adminId: req.user!.id,
    adminName: req.user!.globalName || req.user!.username,
    action: 'USER_ROLE_CHANGED',
    entity: 'User',
    entityId: req.params.id,
    metadata: `Assigned role ${role} to ${user.username}`,
    ip: req.ip || '127.0.0.1'
  });

  return res.json(user);
});

router.patch('/admin/users/:id/status', requireAuth, requireRole([UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.MODERATOR]), (req: Request, res: Response) => {
  const { status } = req.body;
  const user = db.updateUserStatus(req.params.id, status);
  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }

  db.logAudit({
    adminId: req.user!.id,
    adminName: req.user!.globalName || req.user!.username,
    action: 'USER_STATUS_CHANGED',
    entity: 'User',
    entityId: req.params.id,
    metadata: `Changed status to ${status} for ${user.username}`,
    ip: req.ip || '127.0.0.1'
  });

  return res.json(user);
});

// ---------------- ADMIN: NEWS CMS ----------------
router.get('/admin/news', requireAuth, requireRole([UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.EDITOR]), (req: Request, res: Response) => {
  const news = db.getNews(false);
  return res.json(news);
});

router.post('/admin/news', requireAuth, requireRole([UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.EDITOR]), (req: Request, res: Response) => {
  const item = db.saveNews({
    ...req.body,
    authorId: req.user!.id,
    authorName: req.user!.globalName || req.user!.username
  });

  db.logAudit({
    adminId: req.user!.id,
    adminName: req.user!.globalName || req.user!.username,
    action: 'NEWS_SAVED',
    entity: 'NewsItem',
    entityId: item.id,
    metadata: `Created or updated news: ${item.slug}`,
    ip: req.ip || '127.0.0.1'
  });

  return res.status(201).json(item);
});

router.delete('/admin/news/:id', requireAuth, requireRole([UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.EDITOR]), (req: Request, res: Response) => {
  const success = db.deleteNews(req.params.id);
  if (success) {
    db.logAudit({
      adminId: req.user!.id,
      adminName: req.user!.globalName || req.user!.username,
      action: 'NEWS_DELETED',
      entity: 'NewsItem',
      entityId: req.params.id,
      metadata: `Deleted news article #${req.params.id}`,
      ip: req.ip || '127.0.0.1'
    });
    return res.json({ success: true });
  }
  return res.status(404).json({ error: 'News item not found' });
});

// ---------------- ADMIN: RULES CMS ----------------
router.post('/admin/rules', requireAuth, requireRole([UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.EDITOR]), (req: Request, res: Response) => {
  const item = db.saveRuleCategory(req.body);
  db.logAudit({
    adminId: req.user!.id,
    adminName: req.user!.globalName || req.user!.username,
    action: 'RULES_UPDATED',
    entity: 'RuleCategory',
    entityId: item.id,
    metadata: `Updated rule category: ${item.slug}`,
    ip: req.ip || '127.0.0.1'
  });
  return res.json(item);
});

// ---------------- ADMIN: JOBS CMS ----------------
router.post('/admin/jobs', requireAuth, requireRole([UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.EDITOR]), (req: Request, res: Response) => {
  const item = db.saveJob(req.body);
  db.logAudit({
    adminId: req.user!.id,
    adminName: req.user!.globalName || req.user!.username,
    action: 'JOB_UPDATED',
    entity: 'JobItem',
    entityId: item.id,
    metadata: `Updated job opportunity: ${item.slug}`,
    ip: req.ip || '127.0.0.1'
  });
  return res.json(item);
});

// ---------------- ADMIN: STORE CMS ----------------
router.post('/admin/products', requireAuth, requireRole([UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.STORE_MANAGER]), (req: Request, res: Response) => {
  const item = db.saveProduct(req.body);
  db.logAudit({
    adminId: req.user!.id,
    adminName: req.user!.globalName || req.user!.username,
    action: 'PRODUCT_UPDATED',
    entity: 'ProductItem',
    entityId: item.id,
    metadata: `Saved store product: ${item.slug}`,
    ip: req.ip || '127.0.0.1'
  });
  return res.json(item);
});

// ---------------- ADMIN: AUDIT LOGS & SETTINGS ----------------
router.get('/admin/audit-logs', requireAuth, requireRole([UserRole.SUPER_ADMIN, UserRole.ADMIN]), (req: Request, res: Response) => {
  const logs = db.getAuditLogs(100);
  return res.json(logs);
});

router.post('/admin/settings', requireAuth, requireRole([UserRole.SUPER_ADMIN]), (req: Request, res: Response) => {
  const updated = db.updateSiteSettings(req.body);
  db.logAudit({
    adminId: req.user!.id,
    adminName: req.user!.globalName || req.user!.username,
    action: 'SITE_SETTINGS_UPDATED',
    entity: 'SiteSettings',
    entityId: 'global',
    metadata: 'Updated site configuration parameters',
    ip: req.ip || '127.0.0.1'
  });
  return res.json(updated);
});

export default router;

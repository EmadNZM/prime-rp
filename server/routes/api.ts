import { Router, Request, Response } from 'express';
import { 
  userRepository,
  newsRepository,
  rulesRepository,
  jobsRepository,
  productRepository,
  orderRepository,
  ticketRepository,
  notificationRepository,
  auditLogRepository,
  settingsRepository,
  faqRepository
} from '../db/repositories';
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
import { discordService } from '../services/discordService';

const router = Router();

// Middleware to parse user from session token on all API routes
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
  try {
    const rawSettings = await settingsRepository.getSettings();
    const telemetry = await fiveMService.getServerStatus();

    // STRICT SECURITY: Never expose secrets in client API response
    const sanitizedSettings = { ...rawSettings };
    delete (sanitizedSettings as any).discordClientSecret;
    delete (sanitizedSettings as any).botToken;

    return res.json({
      ...sanitizedSettings,
      telemetry
    });
  } catch (err: any) {
    console.error('[API] /site-settings error:', err.message);
    return res.status(500).json({ error: 'Failed to load site settings' });
  }
});

// ---------------- PUBLIC CONTENT (NEWS, RULES, JOBS, PRODUCTS, FAQ) ----------------
router.get('/news', async (req: Request, res: Response) => {
  try {
    const news = await newsRepository.getAll(true);
    return res.json(news);
  } catch (err: any) {
    console.error('[API] /news error:', err.message);
    return res.status(500).json({ error: 'Failed to fetch news' });
  }
});

router.get('/news/:slug', async (req: Request, res: Response) => {
  try {
    const item = await newsRepository.getBySlug(req.params.slug);
    if (!item) {
      return res.status(404).json({ error: 'News item not found' });
    }
    return res.json(item);
  } catch (err: any) {
    console.error('[API] /news/:slug error:', err.message);
    return res.status(500).json({ error: 'Failed to fetch news item' });
  }
});

router.get('/rules', async (req: Request, res: Response) => {
  try {
    const rules = await rulesRepository.getAll();
    return res.json(rules);
  } catch (err: any) {
    console.error('[API] /rules error:', err.message);
    return res.status(500).json({ error: 'Failed to fetch rules' });
  }
});

router.get('/jobs', async (req: Request, res: Response) => {
  try {
    const jobs = await jobsRepository.getAll();
    return res.json(jobs);
  } catch (err: any) {
    console.error('[API] /jobs error:', err.message);
    return res.status(500).json({ error: 'Failed to fetch jobs' });
  }
});

router.get('/products', async (req: Request, res: Response) => {
  try {
    const products = await productRepository.getAll(false);
    return res.json(products);
  } catch (err: any) {
    console.error('[API] /products error:', err.message);
    return res.status(500).json({ error: 'Failed to fetch products' });
  }
});

// Alias for store products
router.get('/store/products', async (req: Request, res: Response) => {
  try {
    const products = await productRepository.getAll(false);
    return res.json(products);
  } catch (err: any) {
    return res.status(500).json({ error: 'Failed to fetch store products' });
  }
});

// FiveM Server Real-Time Status Endpoint
router.get('/fivem/status', async (req: Request, res: Response) => {
  try {
    const telemetry = await fiveMService.getServerStatus();
    return res.json(telemetry);
  } catch (err: any) {
    return res.status(500).json({ error: 'Failed to fetch FiveM status' });
  }
});

// Leaderboard Endpoint
router.get('/leaderboard', async (req: Request, res: Response) => {
  try {
    const defaultLeaderboard = [
      { rank: 1, name: 'Sultan Al-Ghamdi', playtimeHours: 420, level: 58, faction: 'LSPD Chief' },
      { rank: 2, name: 'Fahad Al-Otaibi', playtimeHours: 385, level: 52, faction: 'EMS Director' },
      { rank: 3, name: 'Rakan Al-Harbi', playtimeHours: 310, level: 47, faction: 'Ballas Leader' },
      { rank: 4, name: 'Saad Al-Dossari', playtimeHours: 290, level: 44, faction: 'Mechanic Boss' },
      { rank: 5, name: 'Nasser Al-Qahtani', playtimeHours: 245, level: 39, faction: 'Citizen' }
    ];
    return res.json(defaultLeaderboard);
  } catch (err: any) {
    return res.status(500).json({ error: 'Failed to fetch leaderboard' });
  }
});

router.get('/faq', async (req: Request, res: Response) => {
  try {
    const faq = await faqRepository.getAll();
    return res.json(faq);
  } catch (err: any) {
    console.error('[API] /faq error:', err.message);
    return res.status(500).json({ error: 'Failed to fetch FAQ' });
  }
});

// ---------------- USER ORDERS & CART CHECKOUT ----------------
router.get('/orders', requireAuth, async (req: Request, res: Response) => {
  try {
    const orders = await orderRepository.getAll(req.user!.id);
    return res.json(orders);
  } catch (err: any) {
    console.error('[API] /orders error:', err.message);
    return res.status(500).json({ error: 'Failed to fetch orders' });
  }
});

router.post('/orders/checkout', requireAuth, async (req: Request, res: Response) => {
  const { productId } = req.body;
  if (!productId) {
    return res.status(400).json({ error: 'Product ID is required' });
  }

  try {
    const order = await orderRepository.create(req.user!.id, productId);
    if (!order) {
      return res.status(404).json({ error: 'Product not found or unavailable' });
    }

    await auditLogRepository.log({
      adminId: req.user!.id,
      adminName: req.user!.globalName || req.user!.username,
      action: 'ORDER_PLACED',
      entity: 'Order',
      entityId: order.id,
      metadata: `Placed order ${order.orderNumber} for product ${order.productName}`,
      ip: req.ip || '127.0.0.1'
    });

    return res.status(201).json(order);
  } catch (err: any) {
    console.error('[API] /orders/checkout error:', err.message);
    return res.status(500).json({ error: 'Order checkout failed' });
  }
});

// ---------------- USER TICKETS ----------------
router.get('/tickets', requireAuth, async (req: Request, res: Response) => {
  try {
    const isStaff = [UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.MODERATOR, UserRole.SUPPORT].includes(req.user!.role);
    const tickets = isStaff ? await ticketRepository.getAll() : await ticketRepository.getAll(req.user!.id);
    return res.json(tickets);
  } catch (err: any) {
    console.error('[API] /tickets error:', err.message);
    return res.status(500).json({ error: 'Failed to fetch tickets' });
  }
});

router.get('/tickets/:id', requireAuth, async (req: Request, res: Response) => {
  try {
    const ticket = await ticketRepository.getById(req.params.id);
    if (!ticket) {
      return res.status(404).json({ error: 'Ticket not found' });
    }

    const isStaff = [UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.MODERATOR, UserRole.SUPPORT].includes(req.user!.role);
    if (!isStaff && ticket.userId !== req.user!.id) {
      return res.status(403).json({ error: 'Forbidden: You do not have access to this ticket' });
    }

    return res.json(ticket);
  } catch (err: any) {
    console.error('[API] /tickets/:id error:', err.message);
    return res.status(500).json({ error: 'Failed to fetch ticket' });
  }
});

router.post('/tickets', requireAuth, async (req: Request, res: Response) => {
  const { subject, category, priority, message } = req.body;
  if (!subject || !category || !message) {
    return res.status(400).json({ error: 'Subject, category, and message are required' });
  }

  try {
    const ticket = await ticketRepository.create({
      userId: req.user!.id,
      userName: req.user!.globalName || req.user!.username,
      userAvatar: req.user!.avatar,
      subject,
      category,
      priority,
      initialMessage: message
    });

    await auditLogRepository.log({
      adminId: req.user!.id,
      adminName: req.user!.globalName || req.user!.username,
      action: 'TICKET_CREATED',
      entity: 'Ticket',
      entityId: ticket.id,
      metadata: `Created ticket ${ticket.ticketNumber} [${category}]`,
      ip: req.ip || '127.0.0.1'
    });

    return res.status(201).json(ticket);
  } catch (err: any) {
    console.error('[API] /tickets create error:', err.message);
    return res.status(500).json({ error: 'Failed to create ticket' });
  }
});

router.post('/tickets/:id/messages', requireAuth, async (req: Request, res: Response) => {
  const { message } = req.body;
  if (!message) {
    return res.status(400).json({ error: 'Message text is required' });
  }

  try {
    const ticket = await ticketRepository.getById(req.params.id);
    if (!ticket) {
      return res.status(404).json({ error: 'Ticket not found' });
    }

    const isStaff = [UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.MODERATOR, UserRole.SUPPORT].includes(req.user!.role);
    if (!isStaff && ticket.userId !== req.user!.id) {
      return res.status(403).json({ error: 'Forbidden' });
    }

    const updatedTicket = await ticketRepository.addMessage({
      ticketId: req.params.id,
      senderId: req.user!.id,
      senderName: req.user!.globalName || req.user!.username,
      senderAvatar: req.user!.avatar,
      senderRole: req.user!.role,
      isStaff,
      message
    });

    return res.json(updatedTicket);
  } catch (err: any) {
    console.error('[API] /tickets/:id/messages error:', err.message);
    return res.status(500).json({ error: 'Failed to post ticket message' });
  }
});

router.patch('/tickets/:id/status', requireAuth, async (req: Request, res: Response) => {
  const { status } = req.body;
  const isStaff = [UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.MODERATOR, UserRole.SUPPORT].includes(req.user!.role);
  if (!isStaff) {
    return res.status(403).json({ error: 'Only staff can modify ticket status' });
  }

  try {
    const updated = await ticketRepository.updateStatus(req.params.id, status);
    if (!updated) {
      return res.status(404).json({ error: 'Ticket not found' });
    }

    await auditLogRepository.log({
      adminId: req.user!.id,
      adminName: req.user!.globalName || req.user!.username,
      action: 'TICKET_STATUS_UPDATED',
      entity: 'Ticket',
      entityId: req.params.id,
      metadata: `Changed ticket status to ${status}`,
      ip: req.ip || '127.0.0.1'
    });

    return res.json(updated);
  } catch (err: any) {
    console.error('[API] /tickets/:id/status error:', err.message);
    return res.status(500).json({ error: 'Failed to update ticket status' });
  }
});

// ---------------- USER NOTIFICATIONS ----------------
router.get('/notifications', requireAuth, async (req: Request, res: Response) => {
  try {
    const list = await notificationRepository.getByUserId(req.user!.id);
    return res.json(list);
  } catch (err: any) {
    console.error('[API] /notifications error:', err.message);
    return res.status(500).json({ error: 'Failed to fetch notifications' });
  }
});

router.patch('/notifications/:id/read', requireAuth, async (req: Request, res: Response) => {
  try {
    const success = await notificationRepository.markAsRead(req.params.id);
    return res.json({ success });
  } catch (err: any) {
    console.error('[API] /notifications/:id/read error:', err.message);
    return res.status(500).json({ error: 'Failed to update notification' });
  }
});

// ---------------- ADMIN OVERVIEW & DASHBOARD ----------------
router.get('/admin/overview', requireAuth, requireRole([UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.MODERATOR, UserRole.SUPPORT, UserRole.EDITOR, UserRole.STORE_MANAGER]), async (req: Request, res: Response) => {
  try {
    const users = await userRepository.getAll();
    const tickets = await ticketRepository.getAll();
    const orders = await orderRepository.getAll();
    const news = await newsRepository.getAll(false);
    const products = await productRepository.getAll(true);
    const auditLogs = await auditLogRepository.getRecent(10);

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
  } catch (err: any) {
    console.error('[API] /admin/overview error:', err.message);
    return res.status(500).json({ error: 'Failed to fetch admin overview' });
  }
});

// ---------------- ADMIN: USER MANAGEMENT ----------------
router.get('/admin/users', requireAuth, requireRole([UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.MODERATOR]), async (req: Request, res: Response) => {
  try {
    const users = await userRepository.getAll();
    return res.json(users);
  } catch (err: any) {
    console.error('[API] /admin/users error:', err.message);
    return res.status(500).json({ error: 'Failed to fetch users' });
  }
});

router.patch('/admin/users/:id/role', requireAuth, requireRole([UserRole.SUPER_ADMIN, UserRole.ADMIN]), async (req: Request, res: Response) => {
  const { role, permissions } = req.body;
  if (!role) {
    return res.status(400).json({ error: 'Role is required' });
  }

  try {
    const user = await userRepository.updateRole(req.params.id, role, permissions);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    await auditLogRepository.log({
      adminId: req.user!.id,
      adminName: req.user!.globalName || req.user!.username,
      action: 'USER_ROLE_CHANGED',
      entity: 'User',
      entityId: req.params.id,
      metadata: `Assigned role ${role} to ${user.username}`,
      ip: req.ip || '127.0.0.1'
    });

    return res.json(user);
  } catch (err: any) {
    console.error('[API] /admin/users/:id/role error:', err.message);
    return res.status(500).json({ error: 'Failed to update user role' });
  }
});

router.post('/admin/users/assign-role', requireAuth, requireRole([UserRole.SUPER_ADMIN, UserRole.ADMIN]), async (req: Request, res: Response) => {
  const { identifier, role, permissions } = req.body;
  if (!identifier || !role) {
    return res.status(400).json({ error: 'Identifier (Discord ID or Username) and Role are required' });
  }

  try {
    const user = await userRepository.assignRoleByIdentifier(identifier, role, permissions);

    await auditLogRepository.log({
      adminId: req.user!.id,
      adminName: req.user!.globalName || req.user!.username,
      action: 'USER_ROLE_ASSIGNED_BY_ADMIN',
      entity: 'User',
      entityId: user.id,
      metadata: `Admin assigned role ${role} to ${identifier}`,
      ip: req.ip || '127.0.0.1'
    });

    return res.json({ success: true, user });
  } catch (err: any) {
    console.error('[API] /admin/users/assign-role error:', err.message);
    return res.status(500).json({ error: 'Failed to assign role to user' });
  }
});

router.patch('/admin/users/:id/status', requireAuth, requireRole([UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.MODERATOR]), async (req: Request, res: Response) => {
  const { status } = req.body;
  try {
    const user = await userRepository.updateStatus(req.params.id, status);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    await auditLogRepository.log({
      adminId: req.user!.id,
      adminName: req.user!.globalName || req.user!.username,
      action: 'USER_STATUS_CHANGED',
      entity: 'User',
      entityId: req.params.id,
      metadata: `Changed status to ${status} for ${user.username}`,
      ip: req.ip || '127.0.0.1'
    });

    return res.json(user);
  } catch (err: any) {
    console.error('[API] /admin/users/:id/status error:', err.message);
    return res.status(500).json({ error: 'Failed to update user status' });
  }
});

// ---------------- ADMIN: NEWS CMS ----------------
router.get('/admin/news', requireAuth, requireRole([UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.EDITOR]), async (req: Request, res: Response) => {
  try {
    const news = await newsRepository.getAll(false);
    return res.json(news);
  } catch (err: any) {
    console.error('[API] /admin/news error:', err.message);
    return res.status(500).json({ error: 'Failed to fetch news CMS items' });
  }
});

router.post('/admin/news', requireAuth, requireRole([UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.EDITOR]), async (req: Request, res: Response) => {
  try {
    const item = await newsRepository.save({
      ...req.body,
      authorId: req.user!.id,
      authorName: req.user!.globalName || req.user!.username
    });

    await auditLogRepository.log({
      adminId: req.user!.id,
      adminName: req.user!.globalName || req.user!.username,
      action: 'NEWS_SAVED',
      entity: 'NewsItem',
      entityId: item.id,
      metadata: `Created or updated news: ${item.slug}`,
      ip: req.ip || '127.0.0.1'
    });

    return res.status(201).json(item);
  } catch (err: any) {
    console.error('[API] /admin/news save error:', err.message);
    return res.status(500).json({ error: 'Failed to save news item' });
  }
});

router.delete('/admin/news/:id', requireAuth, requireRole([UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.EDITOR]), async (req: Request, res: Response) => {
  try {
    const success = await newsRepository.delete(req.params.id);
    if (success) {
      await auditLogRepository.log({
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
  } catch (err: any) {
    console.error('[API] /admin/news delete error:', err.message);
    return res.status(500).json({ error: 'Failed to delete news item' });
  }
});

// ---------------- ADMIN: RULES CMS ----------------
router.post('/admin/rules', requireAuth, requireRole([UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.EDITOR]), async (req: Request, res: Response) => {
  try {
    const item = await rulesRepository.saveCategory(req.body);
    await auditLogRepository.log({
      adminId: req.user!.id,
      adminName: req.user!.globalName || req.user!.username,
      action: 'RULES_UPDATED',
      entity: 'RuleCategory',
      entityId: item.id,
      metadata: `Updated rule category: ${item.slug}`,
      ip: req.ip || '127.0.0.1'
    });
    return res.json(item);
  } catch (err: any) {
    console.error('[API] /admin/rules error:', err.message);
    return res.status(500).json({ error: 'Failed to save rule category' });
  }
});

// ---------------- ADMIN: JOBS CMS ----------------
router.post('/admin/jobs', requireAuth, requireRole([UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.EDITOR]), async (req: Request, res: Response) => {
  try {
    const item = await jobsRepository.save(req.body);
    await auditLogRepository.log({
      adminId: req.user!.id,
      adminName: req.user!.globalName || req.user!.username,
      action: 'JOB_UPDATED',
      entity: 'JobItem',
      entityId: item.id,
      metadata: `Updated job opportunity: ${item.slug}`,
      ip: req.ip || '127.0.0.1'
    });
    return res.json(item);
  } catch (err: any) {
    console.error('[API] /admin/jobs error:', err.message);
    return res.status(500).json({ error: 'Failed to save job item' });
  }
});

// ---------------- ADMIN: STORE CMS ----------------
router.post('/admin/products', requireAuth, requireRole([UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.STORE_MANAGER]), async (req: Request, res: Response) => {
  try {
    const item = await productRepository.save(req.body);
    await auditLogRepository.log({
      adminId: req.user!.id,
      adminName: req.user!.globalName || req.user!.username,
      action: 'PRODUCT_UPDATED',
      entity: 'ProductItem',
      entityId: item.id,
      metadata: `Saved store product: ${item.slug}`,
      ip: req.ip || '127.0.0.1'
    });
    return res.json(item);
  } catch (err: any) {
    console.error('[API] /admin/products error:', err.message);
    return res.status(500).json({ error: 'Failed to save product' });
  }
});

// ---------------- ADMIN: AUDIT LOGS & SETTINGS ----------------
router.get('/admin/audit-logs', requireAuth, requireRole([UserRole.SUPER_ADMIN, UserRole.ADMIN]), async (req: Request, res: Response) => {
  try {
    const logs = await auditLogRepository.getRecent(100);
    return res.json(logs);
  } catch (err: any) {
    console.error('[API] /admin/audit-logs error:', err.message);
    return res.status(500).json({ error: 'Failed to fetch audit logs' });
  }
});

router.post('/admin/settings', requireAuth, requireRole([UserRole.SUPER_ADMIN]), async (req: Request, res: Response) => {
  try {
    const updated = await settingsRepository.updateSettings(req.body);
    await auditLogRepository.log({
      adminId: req.user!.id,
      adminName: req.user!.globalName || req.user!.username,
      action: 'SITE_SETTINGS_UPDATED',
      entity: 'SiteSettings',
      entityId: 'global',
      metadata: 'Updated site configuration parameters',
      ip: req.ip || '127.0.0.1'
    });
    return res.json(updated);
  } catch (err: any) {
    console.error('[API] /admin/settings error:', err.message);
    return res.status(500).json({ error: 'Failed to update settings' });
  }
});

// ---------------- ADMIN: DISCORD GUILD STATUS ----------------
router.get('/admin/discord-status', requireAuth, requireRole([UserRole.SUPER_ADMIN, UserRole.ADMIN]), async (req: Request, res: Response) => {
  try {
    const isConfigured = discordService.isConfigured();
    let rolesCount = 0;
    if (isConfigured) {
      const roles = await discordService.getGuildRoles();
      rolesCount = roles.length;
    }
    return res.json({
      configured: isConfigured,
      guildId: process.env.DISCORD_GUILD_ID ? `${process.env.DISCORD_GUILD_ID.substring(0, 4)}****` : null,
      rolesCount
    });
  } catch (err: any) {
    return res.status(500).json({ error: 'Failed to query Discord service' });
  }
});

export default router;

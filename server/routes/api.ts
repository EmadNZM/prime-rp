import { Router, Request, Response } from 'express';
import { 
  userRepository,
  newsRepository,
  rulesRepository,
  jobsRepository,
  jobApplicationRepository,
  productRepository,
  orderRepository,
  ticketRepository,
  notificationRepository,
  auditLogRepository,
  settingsRepository,
  faqRepository,
  reportRepository,
  socialLinksRepository
} from '../db/repositories';
import { 
  handleDiscordLogin, 
  handleDiscordCallback, 
  getAuthConfig, 
  handleLogout,
  handleDemoLogin
} from '../auth/discordAuth';
import { 
  attachUser, 
  requireAuth, 
  requireRole, 
  requireOwner 
} from '../middleware/authMiddleware';
import { UserRole } from '../../src/types';
import { fiveMService } from '../services/fivemService';
import { discordService } from '../services/discordService';
import { paymentService } from '../services/paymentService';

const router = Router();

// Middleware to parse user from session token on all API routes
router.use(attachUser);

// ---------------- AUTHENTICATION ----------------
// Discord OAuth is the sole production authentication flow.
router.get('/auth/config', getAuthConfig);

router.get('/auth/me', (req: Request, res: Response) => {
  if (!req.user) {
    return res.status(401).json({ authenticated: false });
  }
  return res.status(200).json({
    authenticated: true,
    user: {
      id: req.user.id,
      discordId: req.user.discordId,
      username: req.user.username,
      displayName: req.user.displayName || req.user.globalName || req.user.username,
      globalName: req.user.globalName || req.user.displayName || req.user.username,
      avatar: req.user.avatar,
      email: req.user.email,
      role: req.user.role,
      status: req.user.status,
      permissions: req.user.permissions,
      isOwner: Boolean(req.user.isOwner),
      isAdmin: Boolean(req.user.isAdmin)
    }
  });
});

router.get('/auth/discord', handleDiscordLogin);
router.get('/auth/discord/callback', handleDiscordCallback);
router.post('/auth/logout', handleLogout);
router.post('/auth/demo-login', handleDemoLogin);

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

// ---------------- FIVE M REAL-TIME ENDPOINTS ----------------
router.get('/fivem/status', async (req: Request, res: Response) => {
  try {
    const telemetry = await fiveMService.getServerStatus();
    return res.json(telemetry);
  } catch (err: any) {
    return res.status(500).json({ error: 'Failed to fetch FiveM status' });
  }
});

router.get('/players', async (req: Request, res: Response) => {
  try {
    const players = await fiveMService.getPlayers();
    return res.json(players);
  } catch (err: any) {
    return res.status(500).json({ error: 'Failed to fetch live players' });
  }
});

router.get('/fivem/players', async (req: Request, res: Response) => {
  try {
    const players = await fiveMService.getPlayers();
    return res.json(players);
  } catch (err: any) {
    return res.status(500).json({ error: 'Failed to fetch FiveM players' });
  }
});

// Leaderboard: Empty state until in-game database sync is configured
router.get('/leaderboard', async (req: Request, res: Response) => {
  return res.json([]);
});

// ---------------- PUBLIC CONTENT (NEWS, RULES, JOBS, PRODUCTS, FAQ, SOCIALS) ----------------
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

router.get('/jobs/applications/me', requireAuth, async (req: Request, res: Response) => {
  try {
    const applications = await jobApplicationRepository.getByUserId(req.user!.id);
    return res.json(applications);
  } catch (err: any) {
    console.error('[API] /jobs/applications/me error:', err.message);
    return res.status(500).json({ error: 'Failed to fetch your applications' });
  }
});

router.get('/jobs/applications/check/:jobId', requireAuth, async (req: Request, res: Response) => {
  try {
    const existing = await jobApplicationRepository.getByJobAndUser(req.params.jobId, req.user!.id);
    return res.json({ hasApplied: !!existing, application: existing });
  } catch (err: any) {
    console.error('[API] /jobs/applications/check error:', err.message);
    return res.status(500).json({ error: 'Failed to check application status' });
  }
});

router.get('/jobs/:id', async (req: Request, res: Response) => {
  try {
    let job = await jobsRepository.getBySlug(req.params.id);
    if (!job) {
      const all = await jobsRepository.getAll();
      job = all.find(j => j.id === req.params.id) || null;
    }
    if (!job) {
      return res.status(404).json({ error: 'Job not found' });
    }
    return res.json(job);
  } catch (err: any) {
    console.error('[API] /jobs/:id error:', err.message);
    return res.status(500).json({ error: 'Failed to fetch job' });
  }
});

router.post('/jobs/:jobId/applications', requireAuth, async (req: Request, res: Response) => {
  const { characterName, characterAge, experience, dailyAvailability, answers } = req.body;
  const jobId = req.params.jobId;

  if (!characterName || !characterName.trim()) {
    return res.status(400).json({ error: 'اسم الشخصية داخل اللعبة مطلوب' });
  }
  const parsedAge = parseInt(characterAge, 10);
  if (isNaN(parsedAge) || parsedAge < 16 || parsedAge > 90) {
    return res.status(400).json({ error: 'عمر الشخصية غير صالح (يجب أن يكون بين 16 و 90)' });
  }
  if (!experience || !experience.trim()) {
    return res.status(400).json({ error: 'يرجى كتابة نبذة عن خبراتك السابقة في الـ RP' });
  }
  if (!dailyAvailability || !dailyAvailability.trim()) {
    return res.status(400).json({ error: 'ساعات التواجد اليومية مطلوبة' });
  }

  try {
    // Verify job exists
    const allJobs = await jobsRepository.getAll();
    const job = allJobs.find(j => j.id === jobId || j.slug === jobId);
    if (!job) {
      return res.status(404).json({ error: 'الوظيفة المطلوبة غير موجودة' });
    }

    if (job.status === 'HIRING_CLOSED') {
      return res.status(400).json({ error: 'التقديم على هذه الوظيفة مغلق حالياً' });
    }

    // Check if user already has an active or pending application
    const existing = await jobApplicationRepository.getByJobAndUser(job.id, req.user!.id);
    if (existing && (existing.status === 'PENDING' || existing.status === 'UNDER_REVIEW')) {
      return res.status(400).json({ 
        error: 'لديك طلب معلّق مسبقاً لهذه الوظيفة قيد المراجعة والدراسة.',
        application: existing
      });
    }

    const application = await jobApplicationRepository.create({
      jobId: job.id,
      userId: req.user!.id,
      characterName: characterName.trim(),
      characterAge: parsedAge,
      experience: experience.trim(),
      dailyAvailability: dailyAvailability.trim(),
      answers: answers || {}
    });

    // Notify user
    await notificationRepository.create({
      userId: req.user!.id,
      type: 'SYSTEM',
      title: 'تم استلام طلب التوظيف بنجاح',
      message: `تم إرسال طلب انضمامك إلى [${job.translations.ar?.name || job.slug}]، وهو الآن قيد المراجعة من قبل الإدارة.`,
      link: '/dashboard'
    });

    // Audit log
    await auditLogRepository.log({
      adminId: req.user!.id,
      adminName: req.user!.globalName || req.user!.username,
      action: 'JOB_APPLICATION_SUBMITTED',
      entity: 'JobApplication',
      entityId: application.id,
      metadata: `User submitted job application for ${job.slug} as character ${characterName.trim()}`,
      ip: req.ip || '127.0.0.1'
    });

    return res.status(201).json(application);
  } catch (err: any) {
    console.error('[API] /jobs/:jobId/applications error:', err.message);
    return res.status(500).json({ error: err.message || 'فشل في إرسال طلب التوظيف' });
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

router.get('/store/products', async (req: Request, res: Response) => {
  try {
    const products = await productRepository.getAll(false);
    return res.json(products);
  } catch (err: any) {
    return res.status(500).json({ error: 'Failed to fetch store products' });
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

router.get('/social-links', async (req: Request, res: Response) => {
  try {
    const links = await socialLinksRepository.getAll(true);
    return res.json(links);
  } catch (err: any) {
    console.error('[API] /social-links error:', err.message);
    return res.status(500).json({ error: 'Failed to fetch social links' });
  }
});

// ---------------- USER ORDERS & PAYMENT ----------------
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
    const checkoutResult = await paymentService.createCheckoutSession(req.user!.id, productId);
    if (!checkoutResult) {
      return res.status(404).json({ error: 'Product not found or unavailable' });
    }

    await auditLogRepository.log({
      adminId: req.user!.id,
      adminName: req.user!.globalName || req.user!.username,
      action: 'ORDER_PLACED',
      entity: 'Order',
      entityId: checkoutResult.order.id,
      metadata: `Placed order ${checkoutResult.order.orderNumber} for product ${checkoutResult.order.productName} (${checkoutResult.provider})`,
      ip: req.ip || '127.0.0.1'
    });

    // Notify Discord Bot
    discordService.notifyOrderCreated({
      id: checkoutResult.order.id,
      orderNumber: checkoutResult.order.orderNumber,
      productName: checkoutResult.order.productName,
      price: checkoutResult.order.price,
      currency: checkoutResult.order.currency
    }).catch((err) => console.warn('[Discord Notification] Order error:', err.message));

    return res.status(201).json(checkoutResult);
  } catch (err: any) {
    console.error('[API] /orders/checkout error:', err.message);
    return res.status(500).json({ error: 'Order checkout failed' });
  }
});

// ---------------- USER TICKETS (WITH IDOR PROTECTION) ----------------
router.get('/tickets', requireAuth, async (req: Request, res: Response) => {
  try {
    const isStaff = Boolean(
      req.user!.isOwner || 
      [UserRole.OWNER, UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.MODERATOR, UserRole.SUPPORT].includes(req.user!.role)
    );
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

    const isStaff = Boolean(
      req.user!.isOwner || 
      [UserRole.OWNER, UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.MODERATOR, UserRole.SUPPORT].includes(req.user!.role)
    );
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

    // Notify Discord Bot
    discordService.notifyTicketCreated({
      id: ticket.id,
      ticketNumber: ticket.ticketNumber,
      subject: ticket.subject,
      category: ticket.category,
      userName: ticket.userName
    }).catch((err) => console.warn('[Discord Notification] Ticket error:', err.message));

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

    const isStaff = Boolean(
      req.user!.isOwner || 
      [UserRole.OWNER, UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.MODERATOR, UserRole.SUPPORT].includes(req.user!.role)
    );
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
  const isStaff = Boolean(
    req.user!.isOwner || 
    [UserRole.OWNER, UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.MODERATOR, UserRole.SUPPORT].includes(req.user!.role)
  );
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

// ---------------- REPORTS SYSTEM ----------------
router.get('/reports', requireAuth, async (req: Request, res: Response) => {
  try {
    const isStaff = Boolean(
      req.user!.isOwner || 
      [UserRole.OWNER, UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.MODERATOR].includes(req.user!.role)
    );
    const reports = isStaff ? await reportRepository.getAll() : await reportRepository.getAll(req.user!.id);
    return res.json(reports);
  } catch (err: any) {
    console.error('[API] /reports error:', err.message);
    return res.status(500).json({ error: 'Failed to fetch reports' });
  }
});

router.get('/reports/:id', requireAuth, async (req: Request, res: Response) => {
  try {
    const report = await reportRepository.getById(req.params.id);
    if (!report) {
      return res.status(404).json({ error: 'Report not found' });
    }

    const isStaff = Boolean(
      req.user!.isOwner || 
      [UserRole.OWNER, UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.MODERATOR].includes(req.user!.role)
    );
    if (!isStaff && report.reporterId !== req.user!.id) {
      return res.status(403).json({ error: 'Forbidden: You do not have access to this report' });
    }

    return res.json(report);
  } catch (err: any) {
    console.error('[API] /reports/:id error:', err.message);
    return res.status(500).json({ error: 'Failed to fetch report' });
  }
});

router.post('/reports', requireAuth, async (req: Request, res: Response) => {
  const { category, reason, targetId, targetName } = req.body;
  if (!category || !reason) {
    return res.status(400).json({ error: 'Report category and reason are required' });
  }

  try {
    const report = await reportRepository.create({
      reporterId: req.user!.id,
      reporterName: req.user!.globalName || req.user!.username,
      reporterAvatar: req.user!.avatar,
      category,
      reason,
      targetId,
      targetName
    });

    await auditLogRepository.log({
      adminId: req.user!.id,
      adminName: req.user!.globalName || req.user!.username,
      action: 'REPORT_SUBMITTED',
      entity: 'Report',
      entityId: report.id,
      metadata: `User submitted report [${category}] against ${targetName || 'N/A'}`,
      ip: req.ip || '127.0.0.1'
    });

    // Notify Discord Bot
    discordService.notifyReportCreated({
      id: report.id,
      category: report.category,
      reason: report.reason,
      reporterName: report.reporterName,
      targetName: report.targetName
    }).catch((err) => console.warn('[Discord Notification] Report error:', err.message));

    return res.status(201).json(report);
  } catch (err: any) {
    console.error('[API] /reports create error:', err.message);
    return res.status(500).json({ error: 'Failed to submit report' });
  }
});

router.patch('/reports/:id/status', requireAuth, requireRole([UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.MODERATOR]), async (req: Request, res: Response) => {
  const { status, notes } = req.body;
  if (!status) {
    return res.status(400).json({ error: 'Status is required' });
  }

  try {
    const updated = await reportRepository.updateStatus(req.params.id, status, notes);
    if (!updated) {
      return res.status(404).json({ error: 'Report not found' });
    }

    await auditLogRepository.log({
      adminId: req.user!.id,
      adminName: req.user!.globalName || req.user!.username,
      action: 'REPORT_STATUS_UPDATED',
      entity: 'Report',
      entityId: req.params.id,
      metadata: `Changed report status to ${status}`,
      ip: req.ip || '127.0.0.1'
    });

    return res.json(updated);
  } catch (err: any) {
    console.error('[API] /reports/:id/status error:', err.message);
    return res.status(500).json({ error: 'Failed to update report status' });
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
router.get(
  '/admin/overview',
  requireAuth,
  requireRole([UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.MODERATOR, UserRole.SUPPORT, UserRole.EDITOR, UserRole.STORE_MANAGER]),
  async (req: Request, res: Response) => {
    try {
      const users = await userRepository.getAll();
      const tickets = await ticketRepository.getAll();
      const orders = await orderRepository.getAll();
      const news = await newsRepository.getAll(false);
      const products = await productRepository.getAll(true);
      const reports = await reportRepository.getAll();
      const auditLogs = await auditLogRepository.getRecent(15);

      const openTicketsCount = tickets.filter((t) => t.status === 'OPEN' || t.status === 'IN_PROGRESS').length;
      const openReportsCount = reports.filter((r) => r.status === 'OPEN' || r.status === 'IN_REVIEW').length;
      const totalRevenue = orders.reduce((sum, o) => sum + (o.status === 'COMPLETED' ? o.price : 0), 0);

      return res.json({
        metrics: {
          totalUsers: users.length,
          activeUsers: users.filter((u) => u.status === 'ACTIVE').length,
          openTickets: openTicketsCount,
          openReports: openReportsCount,
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
  }
);

// ---------------- ADMIN: USER MANAGEMENT & ROLE ASSIGNMENT ----------------
// Strictly protected: Only the Server Owner can modify user roles or assign privileges.
router.get('/admin/users', requireAuth, requireRole([UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.MODERATOR]), async (req: Request, res: Response) => {
  try {
    const users = await userRepository.getAll();
    return res.json(users);
  } catch (err: any) {
    console.error('[API] /admin/users error:', err.message);
    return res.status(500).json({ error: 'Failed to fetch users' });
  }
});

router.patch('/admin/users/:id/role', requireAuth, requireOwner, async (req: Request, res: Response) => {
  const { role, permissions } = req.body;
  if (!role) {
    return res.status(400).json({ error: 'Role is required' });
  }

  // Prevent any attempt to assign OWNER role via API
  if (role === UserRole.OWNER || (role as string) === 'OWNER') {
    return res.status(400).json({ error: 'OWNER role cannot be assigned. It is reserved exclusively for the declared server owner.' });
  }

  // Prevent modifying one's own role
  if (req.user!.id === req.params.id) {
    return res.status(400).json({ error: 'You cannot modify your own administrative role.' });
  }

  try {
    const targetUser = await userRepository.findById(req.params.id);
    if (!targetUser) {
      return res.status(404).json({ error: 'User not found' });
    }

    if (targetUser.isOwner) {
      return res.status(403).json({ error: 'Cannot modify the Owner account.' });
    }

    const updatedUser = await userRepository.updateRole(req.params.id, role, permissions);

    await auditLogRepository.log({
      adminId: req.user!.id,
      adminName: req.user!.globalName || req.user!.username,
      action: 'USER_ROLE_CHANGED',
      entity: 'User',
      entityId: req.params.id,
      metadata: `Owner assigned role ${role} to ${updatedUser?.username}`,
      ip: req.ip || '127.0.0.1'
    });

    // Notify Discord Bot
    discordService.notifyRoleChanged({
      username: updatedUser?.username || 'Unknown',
      newRole: role,
      adminName: req.user!.globalName || req.user!.username
    }).catch((err) => console.warn('[Discord Notification] Role change error:', err.message));

    return res.json(updatedUser);
  } catch (err: any) {
    console.error('[API] /admin/users/:id/role error:', err.message);
    return res.status(500).json({ error: err.message || 'Failed to update user role' });
  }
});

router.post('/admin/users/assign-role', requireAuth, requireOwner, async (req: Request, res: Response) => {
  const { identifier, role, permissions } = req.body;
  if (!identifier || !role) {
    return res.status(400).json({ error: 'Identifier (Discord ID or Username) and Role are required' });
  }

  if (role === UserRole.OWNER || (role as string) === 'OWNER') {
    return res.status(400).json({ error: 'OWNER role cannot be assigned. It is reserved exclusively for the declared server owner.' });
  }

  try {
    const updatedUser = await userRepository.assignRoleByIdentifier(identifier, role, permissions);

    await auditLogRepository.log({
      adminId: req.user!.id,
      adminName: req.user!.globalName || req.user!.username,
      action: 'USER_ROLE_ASSIGNED_BY_OWNER',
      entity: 'User',
      entityId: updatedUser.id,
      metadata: `Owner assigned role ${role} to ${identifier}`,
      ip: req.ip || '127.0.0.1'
    });

    // Notify Discord Bot
    discordService.notifyRoleChanged({
      username: updatedUser.username,
      newRole: role,
      adminName: req.user!.globalName || req.user!.username
    }).catch((err) => console.warn('[Discord Notification] Role assign error:', err.message));

    return res.json({ success: true, user: updatedUser });
  } catch (err: any) {
    console.error('[API] /admin/users/assign-role error:', err.message);
    return res.status(500).json({ error: err.message || 'Failed to assign role to user' });
  }
});

router.patch('/admin/users/:id/status', requireAuth, requireRole([UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.MODERATOR]), async (req: Request, res: Response) => {
  const { status } = req.body;
  try {
    const targetUser = await userRepository.findById(req.params.id);
    if (!targetUser) {
      return res.status(404).json({ error: 'User not found' });
    }

    if (targetUser.isOwner) {
      return res.status(403).json({ error: 'Cannot modify status of the Server Owner.' });
    }

    const user = await userRepository.updateStatus(req.params.id, status);

    await auditLogRepository.log({
      adminId: req.user!.id,
      adminName: req.user!.globalName || req.user!.username,
      action: 'USER_STATUS_CHANGED',
      entity: 'User',
      entityId: req.params.id,
      metadata: `Changed status to ${status} for ${user?.username}`,
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

router.delete('/admin/rules/:id', requireAuth, requireRole([UserRole.SUPER_ADMIN, UserRole.ADMIN]), async (req: Request, res: Response) => {
  try {
    const success = await rulesRepository.deleteCategory(req.params.id);
    if (success) {
      await auditLogRepository.log({
        adminId: req.user!.id,
        adminName: req.user!.globalName || req.user!.username,
        action: 'RULES_DELETED',
        entity: 'RuleCategory',
        entityId: req.params.id,
        metadata: `Deleted rule category #${req.params.id}`,
        ip: req.ip || '127.0.0.1'
      });
      return res.json({ success: true, message: 'Rule category deleted' });
    }
    return res.status(404).json({ error: 'Rule category not found' });
  } catch (err: any) {
    console.error('[API] /admin/rules/:id delete error:', err.message);
    return res.status(500).json({ error: 'Failed to delete rule category' });
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

router.delete('/admin/jobs/:id', requireAuth, requireRole([UserRole.SUPER_ADMIN, UserRole.ADMIN]), async (req: Request, res: Response) => {
  try {
    const success = await jobsRepository.delete(req.params.id);
    if (success) {
      await auditLogRepository.log({
        adminId: req.user!.id,
        adminName: req.user!.globalName || req.user!.username,
        action: 'JOB_DELETED',
        entity: 'JobItem',
        entityId: req.params.id,
        metadata: `Deleted job ${req.params.id}`,
        ip: req.ip || '127.0.0.1'
      });
      return res.json({ success: true, message: 'Job deleted' });
    }
    return res.status(404).json({ error: 'Job not found' });
  } catch (err: any) {
    console.error('[API] /admin/jobs/:id delete error:', err.message);
    return res.status(500).json({ error: 'Failed to delete job' });
  }
});

// ---------------- ADMIN: JOB APPLICATIONS CMS ----------------
router.get('/admin/job-applications', requireAuth, requireRole([UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.MODERATOR]), async (req: Request, res: Response) => {
  try {
    const { status, jobId } = req.query;
    const applications = await jobApplicationRepository.getAll({
      status: status ? String(status) : undefined,
      jobId: jobId ? String(jobId) : undefined
    });
    return res.json(applications);
  } catch (err: any) {
    console.error('[API] /admin/job-applications error:', err.message);
    return res.status(500).json({ error: 'Failed to fetch job applications' });
  }
});

router.get('/admin/job-applications/:id', requireAuth, requireRole([UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.MODERATOR]), async (req: Request, res: Response) => {
  try {
    const app = await jobApplicationRepository.getById(req.params.id);
    if (!app) {
      return res.status(404).json({ error: 'Job application not found' });
    }
    return res.json(app);
  } catch (err: any) {
    console.error('[API] /admin/job-applications/:id error:', err.message);
    return res.status(500).json({ error: 'Failed to fetch job application' });
  }
});

router.patch('/admin/job-applications/:id/status', requireAuth, requireRole([UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.MODERATOR]), async (req: Request, res: Response) => {
  const { status, reviewNotes } = req.body;
  const validStatuses = ['PENDING', 'UNDER_REVIEW', 'ACCEPTED', 'REJECTED'];
  if (!status || !validStatuses.includes(status)) {
    return res.status(400).json({ error: 'حالة الطلب غير صالحة' });
  }

  try {
    const updated = await jobApplicationRepository.updateStatus(
      req.params.id,
      status,
      req.user!.id,
      reviewNotes
    );

    if (!updated) {
      return res.status(404).json({ error: 'Job application not found' });
    }

    const statusLabels: Record<string, string> = {
      UNDER_REVIEW: 'قيد المراجعة والتدقيق',
      ACCEPTED: 'تم قبول طلبك! تهانينا',
      REJECTED: 'تم رفض طلب التوظيف',
      PENDING: 'معلّق'
    };

    await notificationRepository.create({
      userId: updated.userId,
      type: 'SYSTEM',
      title: `تحديث طلب التوظيف: ${statusLabels[status] || status}`,
      message: reviewNotes 
        ? `حالة طلبك لوظيفة [${updated.jobTitle || 'الوظيفة'}]: ${statusLabels[status] || status}. ملاحظات الإدارة: ${reviewNotes}`
        : `حالة طلبك لوظيفة [${updated.jobTitle || 'الوظيفة'}]: ${statusLabels[status] || status}.`,
      link: '/dashboard'
    });

    await auditLogRepository.log({
      adminId: req.user!.id,
      adminName: req.user!.globalName || req.user!.username,
      action: 'JOB_APPLICATION_STATUS_UPDATED',
      entity: 'JobApplication',
      entityId: req.params.id,
      metadata: `Updated application status to ${status} for applicant ${updated.applicantUsername}. Notes: ${reviewNotes || 'none'}`,
      ip: req.ip || '127.0.0.1'
    });

    return res.json(updated);
  } catch (err: any) {
    console.error('[API] /admin/job-applications/:id/status error:', err.message);
    return res.status(500).json({ error: 'Failed to update application status' });
  }
});

// ---------------- ADMIN: STORE PRODUCTS CMS ----------------
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

router.delete('/admin/products/:id', requireAuth, requireRole([UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.STORE_MANAGER]), async (req: Request, res: Response) => {
  try {
    const success = await productRepository.delete(req.params.id);
    if (success) {
      await auditLogRepository.log({
        adminId: req.user!.id,
        adminName: req.user!.globalName || req.user!.username,
        action: 'PRODUCT_DELETED',
        entity: 'ProductItem',
        entityId: req.params.id,
        metadata: `Deleted store product #${req.params.id}`,
        ip: req.ip || '127.0.0.1'
      });
      return res.json({ success: true, message: 'Product deleted' });
    }
    return res.status(404).json({ error: 'Product not found' });
  } catch (err: any) {
    console.error('[API] /admin/products/:id delete error:', err.message);
    return res.status(500).json({ error: 'Failed to delete product' });
  }
});

// ---------------- ADMIN: FAQ CMS ----------------
router.post('/admin/faq', requireAuth, requireRole([UserRole.SUPER_ADMIN, UserRole.ADMIN]), async (req: Request, res: Response) => {
  try {
    const item = await faqRepository.save(req.body);
    await auditLogRepository.log({
      adminId: req.user!.id,
      adminName: req.user!.globalName || req.user!.username,
      action: 'FAQ_UPDATED',
      entity: 'FAQItem',
      entityId: item.id,
      metadata: `Saved FAQ item: ${item.id}`,
      ip: req.ip || '127.0.0.1'
    });
    return res.json(item);
  } catch (err: any) {
    console.error('[API] /admin/faq error:', err.message);
    return res.status(500).json({ error: 'Failed to save FAQ item' });
  }
});

router.delete('/admin/faq/:id', requireAuth, requireRole([UserRole.SUPER_ADMIN, UserRole.ADMIN]), async (req: Request, res: Response) => {
  try {
    const success = await faqRepository.delete(req.params.id);
    if (success) {
      await auditLogRepository.log({
        adminId: req.user!.id,
        adminName: req.user!.globalName || req.user!.username,
        action: 'FAQ_DELETED',
        entity: 'FAQItem',
        entityId: req.params.id,
        metadata: `Deleted FAQ item #${req.params.id}`,
        ip: req.ip || '127.0.0.1'
      });
      return res.json({ success: true });
    }
    return res.status(404).json({ error: 'FAQ item not found' });
  } catch (err: any) {
    console.error('[API] /admin/faq delete error:', err.message);
    return res.status(500).json({ error: 'Failed to delete FAQ item' });
  }
});

// ---------------- ADMIN: SOCIAL LINKS CMS ----------------
router.post('/admin/social-links', requireAuth, requireOwner, async (req: Request, res: Response) => {
  try {
    const item = await socialLinksRepository.save(req.body);
    await auditLogRepository.log({
      adminId: req.user!.id,
      adminName: req.user!.globalName || req.user!.username,
      action: 'SOCIAL_LINK_SAVED',
      entity: 'SocialLink',
      entityId: item.id,
      metadata: `Saved social link for ${item.platform}`,
      ip: req.ip || '127.0.0.1'
    });
    return res.json(item);
  } catch (err: any) {
    console.error('[API] /admin/social-links error:', err.message);
    return res.status(500).json({ error: 'Failed to save social link' });
  }
});

router.delete('/admin/social-links/:id', requireAuth, requireOwner, async (req: Request, res: Response) => {
  try {
    const success = await socialLinksRepository.delete(req.params.id);
    if (success) {
      await auditLogRepository.log({
        adminId: req.user!.id,
        adminName: req.user!.globalName || req.user!.username,
        action: 'SOCIAL_LINK_DELETED',
        entity: 'SocialLink',
        entityId: req.params.id,
        metadata: `Deleted social link #${req.params.id}`,
        ip: req.ip || '127.0.0.1'
      });
      return res.json({ success: true });
    }
    return res.status(404).json({ error: 'Social link not found' });
  } catch (err: any) {
    console.error('[API] /admin/social-links delete error:', err.message);
    return res.status(500).json({ error: 'Failed to delete social link' });
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

router.post('/admin/settings', requireAuth, requireOwner, async (req: Request, res: Response) => {
  try {
    const updated = await settingsRepository.updateSettings(req.body);
    await auditLogRepository.log({
      adminId: req.user!.id,
      adminName: req.user!.globalName || req.user!.username,
      action: 'SITE_SETTINGS_UPDATED',
      entity: 'SiteSettings',
      entityId: 'global',
      metadata: 'Updated site configuration parameters and branding logos',
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

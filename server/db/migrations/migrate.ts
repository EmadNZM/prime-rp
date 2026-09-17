import fs from 'fs';
import path from 'path';
import { query } from '../postgres';
import { initialUsers, initialNews, initialRules, initialJobs, initialProducts, initialFAQ, initialSiteSettings } from '../seedData';

export async function runMigrations(): Promise<void> {
  console.log('[Migration] Starting PostgreSQL schema migration...');
  const schemaPath = path.join(process.cwd(), 'server', 'db', 'migrations', 'schema.sql');
  const schemaSql = fs.readFileSync(schemaPath, 'utf8');

  // Run schema DDL
  await query(schemaSql);

  // Ensure sessions has last_used_at column
  await query('ALTER TABLE sessions ADD COLUMN IF NOT EXISTS last_used_at TIMESTAMPTZ DEFAULT NOW();');

  // Ensure discord_oauth_tokens table exists for secure server-side tokens
  await query(`
    CREATE TABLE IF NOT EXISTS discord_oauth_tokens (
      user_id VARCHAR(100) PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
      access_token TEXT NOT NULL,
      refresh_token TEXT NOT NULL,
      expires_at TIMESTAMPTZ NOT NULL,
      created_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW()
    );
  `);

  // Ensure job_applications table exists
  await query(`
    CREATE TABLE IF NOT EXISTS job_applications (
      id VARCHAR(100) PRIMARY KEY,
      job_id VARCHAR(100) REFERENCES jobs(id) ON DELETE CASCADE,
      user_id VARCHAR(100) REFERENCES users(id) ON DELETE CASCADE,
      status VARCHAR(50) DEFAULT 'PENDING',
      character_name VARCHAR(100) NOT NULL,
      character_age INT NOT NULL,
      experience TEXT NOT NULL,
      daily_availability VARCHAR(100) NOT NULL,
      answers JSONB DEFAULT '{}'::JSONB,
      reviewer_id VARCHAR(100) REFERENCES users(id) ON DELETE SET NULL,
      review_notes TEXT,
      created_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW()
    );
    CREATE INDEX IF NOT EXISTS idx_job_applications_user_id ON job_applications(user_id);
    CREATE INDEX IF NOT EXISTS idx_job_applications_job_id ON job_applications(job_id);
    CREATE INDEX IF NOT EXISTS idx_job_applications_status ON job_applications(status);
    CREATE INDEX IF NOT EXISTS idx_job_applications_created ON job_applications(created_at DESC);
    CREATE UNIQUE INDEX IF NOT EXISTS uq_active_job_application ON job_applications(user_id, job_id) WHERE status IN ('PENDING', 'UNDER_REVIEW');
  `);

  console.log('[Migration] PostgreSQL schema DDL successfully applied.');

  // Seed default roles if not present
  const roles = [
    { name: 'SUPER_ADMIN', displayName: 'Super Administrator', description: 'Full system ownership and root access' },
    { name: 'ADMIN', displayName: 'Administrator', description: 'Server administration and management' },
    { name: 'MODERATOR', displayName: 'Moderator', description: 'Community moderation and ticket management' },
    { name: 'SUPPORT', displayName: 'Support Agent', description: 'Player assistance and support tickets' },
    { name: 'EDITOR', displayName: 'Editor', description: 'Content and news publication management' },
    { name: 'STORE_MANAGER', displayName: 'Store Manager', description: 'Product catalog and store orders management' },
    { name: 'CITIZEN', displayName: 'Citizen', description: 'Standard registered player with basic citizen privileges' }
  ];

  for (const r of roles) {
    await query(
      `INSERT INTO roles (name, display_name, description)
       VALUES ($1, $2, $3)
       ON CONFLICT (name) DO UPDATE SET display_name = EXCLUDED.display_name, description = EXCLUDED.description`,
      [r.name, r.displayName, r.description]
    );
  }

  // Seed default permissions
  const permissions = [
    { name: '*', description: 'Universal root access' },
    { name: 'users.view', description: 'View user accounts' },
    { name: 'users.edit', description: 'Edit user accounts and roles' },
    { name: 'news.*', description: 'Manage news articles and announcements' },
    { name: 'rules.*', description: 'Manage city rules' },
    { name: 'jobs.*', description: 'Manage careers and jobs' },
    { name: 'products.*', description: 'Manage store products' },
    { name: 'tickets.view', description: 'View support tickets' },
    { name: 'tickets.reply', description: 'Reply to support tickets' },
    { name: 'tickets.close', description: 'Close support tickets' },
    { name: 'tickets.create', description: 'Create support tickets' },
    { name: 'orders.create', description: 'Place store orders' },
    { name: 'audit.view', description: 'View administration audit logs' },
    { name: 'settings.edit', description: 'Modify global site settings' }
  ];

  for (const p of permissions) {
    await query(
      `INSERT INTO permissions (name, description)
       VALUES ($1, $2)
       ON CONFLICT (name) DO UPDATE SET description = EXCLUDED.description`,
      [p.name, p.description]
    );
  }

  console.log('[Migration] Roles and permissions verified.');
}

export async function runSeed(): Promise<void> {
  console.log('[Migration] Checking if PostgreSQL tables need seeding...');

  // Check if users exist in database
  const userCheck = await query('SELECT COUNT(*) AS count FROM users');
  const userCount = parseInt(userCheck.rows[0].count, 10);

  // Load data source: either data/prime_rp_db.json or fallback to seedData
  const jsonPath = path.join(process.cwd(), 'data', 'prime_rp_db.json');
  let data: any = null;

  if (fs.existsSync(jsonPath)) {
    try {
      const raw = fs.readFileSync(jsonPath, 'utf8');
      data = JSON.parse(raw);
      console.log('[Migration] Loaded seed source from data/prime_rp_db.json');
    } catch (e) {
      console.warn('[Migration] Failed to parse data/prime_rp_db.json, using seedData fallback');
    }
  }

  if (!data) {
    data = {
      users: initialUsers,
      news: initialNews,
      rules: initialRules,
      jobs: initialJobs,
      products: initialProducts,
      orders: [],
      tickets: [],
      notifications: [],
      auditLogs: [],
      siteSettings: initialSiteSettings,
      faq: initialFAQ
    };
  }

  // 1. Seed Site Settings (always upsert)
  if (data.siteSettings) {
    await query(
      `INSERT INTO site_settings (key, data, updated_at)
       VALUES ('global', $1, NOW())
       ON CONFLICT (key) DO UPDATE SET data = EXCLUDED.data, updated_at = NOW()`,
      [JSON.stringify(data.siteSettings)]
    );
    console.log('[Migration] Site settings seeded/synchronized.');
  }

  // If database already contains users, skip re-seeding entities to prevent overwriting live state
  if (userCount > 0) {
    console.log(`[Migration] Database already populated with ${userCount} users. Skipping data seed.`);
    return;
  }

  console.log('[Migration] Empty database detected. Migrating full dataset into PostgreSQL...');

  // 2. Seed Users
  if (Array.isArray(data.users)) {
    for (const u of data.users) {
      await query(
        `INSERT INTO users (id, discord_id, username, global_name, avatar, email, role, status, permissions, bio, last_login, created_at, updated_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
         ON CONFLICT (id) DO NOTHING`,
        [
          u.id,
          u.discordId,
          u.username,
          u.globalName || u.username,
          u.avatar || null,
          u.email || null,
          u.role || 'CITIZEN',
          u.status || 'ACTIVE',
          u.permissions || ['tickets.create', 'orders.create'],
          u.bio || '',
          u.lastLogin || new Date().toISOString(),
          u.createdAt || new Date().toISOString(),
          u.updatedAt || new Date().toISOString()
        ]
      );
    }
    console.log(`[Migration] Migrated ${data.users.length} users.`);
  }

  // 3. Seed News & Translations
  if (Array.isArray(data.news)) {
    for (const n of data.news) {
      await query(
        `INSERT INTO news (id, slug, status, featured, image, category, author_id, author_name, created_at, updated_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
         ON CONFLICT (id) DO NOTHING`,
        [
          n.id,
          n.slug,
          n.status || 'PUBLISHED',
          Boolean(n.featured),
          n.image || null,
          n.category || 'أخبار',
          n.authorId || null,
          n.authorName || 'Prime RP',
          n.createdAt || new Date().toISOString(),
          n.updatedAt || new Date().toISOString()
        ]
      );

      if (n.translations) {
        for (const lang of ['ar', 'en']) {
          const t = n.translations[lang];
          if (t) {
            await query(
              `INSERT INTO news_translations (news_id, language, title, excerpt, content, seo_title, seo_description)
               VALUES ($1, $2, $3, $4, $5, $6, $7)
               ON CONFLICT (news_id, language) DO NOTHING`,
              [n.id, lang, t.title || '', t.excerpt || '', t.content || '', t.seoTitle || null, t.seoDescription || null]
            );
          }
        }
      }
    }
    console.log(`[Migration] Migrated ${data.news.length} news items.`);
  }

  // 4. Seed Rules & Translations & Rule Items
  if (Array.isArray(data.rules)) {
    for (const r of data.rules) {
      await query(
        `INSERT INTO rules (id, slug, sort_order, created_at, updated_at)
         VALUES ($1, $2, $3, NOW(), NOW())
         ON CONFLICT (id) DO NOTHING`,
        [r.id, r.slug, r.order || 0]
      );

      if (r.translations) {
        for (const lang of ['ar', 'en']) {
          const t = r.translations[lang];
          if (t) {
            await query(
              `INSERT INTO rule_translations (rule_id, language, title, description, penalty_info)
               VALUES ($1, $2, $3, $4, $5)
               ON CONFLICT (rule_id, language) DO NOTHING`,
              [r.id, lang, t.title || '', t.description || '', t.penaltyInfo || '']
            );
          }
        }
      }

      if (Array.isArray(r.rules)) {
        for (const item of r.rules) {
          await query(
            `INSERT INTO rule_items (id, rule_category_id, number, translations, created_at)
             VALUES ($1, $2, $3, $4, NOW())
             ON CONFLICT (id) DO NOTHING`,
            [item.id, r.id, item.number, JSON.stringify(item.translations)]
          );
        }
      }
    }
    console.log(`[Migration] Migrated ${data.rules.length} rule categories.`);
  }

  // 5. Seed Jobs & Translations
  if (Array.isArray(data.jobs)) {
    for (const j of data.jobs) {
      await query(
        `INSERT INTO jobs (id, slug, category, image, salary_min, salary_max, status, created_at, updated_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, NOW(), NOW())
         ON CONFLICT (id) DO NOTHING`,
        [j.id, j.slug, j.category, j.image, j.salaryMin || 0, j.salaryMax || 0, j.status || 'HIRING_OPEN']
      );

      if (j.translations) {
        for (const lang of ['ar', 'en']) {
          const t = j.translations[lang];
          if (t) {
            await query(
              `INSERT INTO job_translations (job_id, language, name, description, requirements, duties)
               VALUES ($1, $2, $3, $4, $5, $6)
               ON CONFLICT (job_id, language) DO NOTHING`,
              [j.id, lang, t.name || '', t.description || '', t.requirements || [], t.duties || []]
            );
          }
        }
      }
    }
    console.log(`[Migration] Migrated ${data.jobs.length} jobs.`);
  }

  // 6. Seed Products & Translations
  if (Array.isArray(data.products)) {
    for (const p of data.products) {
      await query(
        `INSERT INTO products (id, slug, category, price, currency, image, stock, status, featured, created_at, updated_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, NOW(), NOW())
         ON CONFLICT (id) DO NOTHING`,
        [p.id, p.slug, p.category, p.price || 0, p.currency || 'SAR', p.image, p.stock || 100, p.status || 'ACTIVE', Boolean(p.featured)]
      );

      if (p.translations) {
        for (const lang of ['ar', 'en']) {
          const t = p.translations[lang];
          if (t) {
            await query(
              `INSERT INTO product_translations (product_id, language, name, description, perks)
               VALUES ($1, $2, $3, $4, $5)
               ON CONFLICT (product_id, language) DO NOTHING`,
              [p.id, lang, t.name || '', t.description || '', t.perks || []]
            );
          }
        }
      }
    }
    console.log(`[Migration] Migrated ${data.products.length} products.`);
  }

  // 7. Seed Orders & Order Items
  if (Array.isArray(data.orders)) {
    for (const o of data.orders) {
      await query(
        `INSERT INTO orders (id, order_number, user_id, product_id, product_name, price, currency, status, created_at, updated_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
         ON CONFLICT (id) DO NOTHING`,
        [
          o.id,
          o.orderNumber,
          o.userId,
          o.productId,
          o.productName,
          o.price || 0,
          o.currency || 'SAR',
          o.status || 'COMPLETED',
          o.createdAt || new Date().toISOString(),
          o.createdAt || new Date().toISOString()
        ]
      );
    }
    console.log(`[Migration] Migrated ${data.orders.length} orders.`);
  }

  // 8. Seed Tickets & Messages
  if (Array.isArray(data.tickets)) {
    for (const t of data.tickets) {
      await query(
        `INSERT INTO tickets (id, ticket_number, user_id, user_name, user_avatar, subject, category, priority, status, assigned_to, created_at, updated_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
         ON CONFLICT (id) DO NOTHING`,
        [
          t.id,
          t.ticketNumber,
          t.userId,
          t.userName,
          t.userAvatar || null,
          t.subject,
          t.category,
          t.priority || 'MEDIUM',
          t.status || 'OPEN',
          t.assignedTo || null,
          t.createdAt || new Date().toISOString(),
          t.updatedAt || new Date().toISOString()
        ]
      );

      if (Array.isArray(t.messages)) {
        for (const m of t.messages) {
          await query(
            `INSERT INTO ticket_messages (id, ticket_id, sender_id, sender_name, sender_avatar, sender_role, is_staff, message, created_at)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
             ON CONFLICT (id) DO NOTHING`,
            [
              m.id,
              t.id,
              m.senderId,
              m.senderName,
              m.senderAvatar || null,
              m.senderRole || 'CITIZEN',
              Boolean(m.isStaff),
              m.message,
              m.createdAt || new Date().toISOString()
            ]
          );
        }
      }
    }
    console.log(`[Migration] Migrated ${data.tickets.length} tickets.`);
  }

  // 9. Seed Notifications
  if (Array.isArray(data.notifications)) {
    for (const notif of data.notifications) {
      await query(
        `INSERT INTO notifications (id, user_id, type, title, message, link, is_read, created_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
         ON CONFLICT (id) DO NOTHING`,
        [
          notif.id,
          notif.userId,
          notif.type || 'SYSTEM',
          notif.title,
          notif.message,
          notif.link || null,
          Boolean(notif.read),
          notif.createdAt || new Date().toISOString()
        ]
      );
    }
    console.log(`[Migration] Migrated ${data.notifications.length} notifications.`);
  }

  // 10. Seed Audit Logs
  if (Array.isArray(data.auditLogs)) {
    for (const log of data.auditLogs) {
      await query(
        `INSERT INTO audit_logs (id, admin_id, admin_name, action, entity, entity_id, metadata, ip, created_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
         ON CONFLICT (id) DO NOTHING`,
        [
          log.id,
          log.adminId,
          log.adminName,
          log.action,
          log.entity,
          log.entityId,
          log.metadata || '',
          log.ip || '127.0.0.1',
          log.createdAt || new Date().toISOString()
        ]
      );
    }
    console.log(`[Migration] Migrated ${data.auditLogs.length} audit logs.`);
  }

  // 11. Seed FAQ & Translations
  if (Array.isArray(data.faq)) {
    for (const f of data.faq) {
      await query(
        `INSERT INTO faq (id, category, sort_order, created_at, updated_at)
         VALUES ($1, $2, $3, NOW(), NOW())
         ON CONFLICT (id) DO NOTHING`,
        [f.id, f.category, f.order || 0]
      );

      if (f.translations) {
        for (const lang of ['ar', 'en']) {
          const t = f.translations[lang];
          if (t) {
            await query(
              `INSERT INTO faq_translations (faq_id, language, question, answer)
               VALUES ($1, $2, $3, $4)
               ON CONFLICT (faq_id, language) DO NOTHING`,
              [f.id, lang, t.question || '', t.answer || '']
            );
          }
        }
      }
    }
    console.log(`[Migration] Migrated ${data.faq.length} FAQ items.`);
  }

  console.log('[Migration] Full migration and seed completed successfully into PostgreSQL.');
}

export async function runMigrationsAndSeed(): Promise<void> {
  await runMigrations();
  await runSeed();
}

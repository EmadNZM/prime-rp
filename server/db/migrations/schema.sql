-- PostgreSQL Schema for Prime RP Platform

-- 1. ROLES & PERMISSIONS
CREATE TABLE IF NOT EXISTS roles (
  name VARCHAR(50) PRIMARY KEY,
  display_name VARCHAR(100) NOT NULL,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS permissions (
  name VARCHAR(100) PRIMARY KEY,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS role_permissions (
  role_name VARCHAR(50) REFERENCES roles(name) ON DELETE CASCADE,
  permission_name VARCHAR(100) REFERENCES permissions(name) ON DELETE CASCADE,
  PRIMARY KEY (role_name, permission_name)
);

-- 2. USERS & SESSIONS
CREATE TABLE IF NOT EXISTS users (
  id VARCHAR(100) PRIMARY KEY,
  discord_id VARCHAR(100) UNIQUE NOT NULL,
  username VARCHAR(100) NOT NULL,
  global_name VARCHAR(100),
  avatar TEXT,
  email VARCHAR(255),
  role VARCHAR(50) REFERENCES roles(name) DEFAULT 'CITIZEN',
  status VARCHAR(50) DEFAULT 'ACTIVE',
  permissions TEXT[] DEFAULT ARRAY[]::TEXT[],
  bio TEXT,
  last_login TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_users_discord_id ON users(discord_id);
CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);

CREATE TABLE IF NOT EXISTS sessions (
  id VARCHAR(128) PRIMARY KEY,
  user_id VARCHAR(100) REFERENCES users(id) ON DELETE CASCADE,
  ip_address VARCHAR(100),
  user_agent TEXT,
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  last_used_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_sessions_user_id ON sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_sessions_expires_at ON sessions(expires_at);

-- 2.1 DISCORD OAUTH TOKENS (Secure Server-Side Persistence)
CREATE TABLE IF NOT EXISTS discord_oauth_tokens (
  user_id VARCHAR(100) PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  access_token TEXT NOT NULL,
  refresh_token TEXT NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. NEWS & TRANSLATIONS
CREATE TABLE IF NOT EXISTS news (
  id VARCHAR(100) PRIMARY KEY,
  slug VARCHAR(255) UNIQUE NOT NULL,
  status VARCHAR(50) DEFAULT 'PUBLISHED',
  featured BOOLEAN DEFAULT FALSE,
  image TEXT,
  category VARCHAR(100),
  author_id VARCHAR(100),
  author_name VARCHAR(100),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_news_slug ON news(slug);
CREATE INDEX IF NOT EXISTS idx_news_status ON news(status);

CREATE TABLE IF NOT EXISTS news_translations (
  news_id VARCHAR(100) REFERENCES news(id) ON DELETE CASCADE,
  language VARCHAR(10) NOT NULL,
  title TEXT NOT NULL,
  excerpt TEXT,
  content TEXT NOT NULL,
  seo_title TEXT,
  seo_description TEXT,
  PRIMARY KEY (news_id, language)
);

-- 4. RULES & TRANSLATIONS
CREATE TABLE IF NOT EXISTS rules (
  id VARCHAR(100) PRIMARY KEY,
  slug VARCHAR(255) UNIQUE NOT NULL,
  sort_order INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS rule_translations (
  rule_id VARCHAR(100) REFERENCES rules(id) ON DELETE CASCADE,
  language VARCHAR(10) NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  penalty_info TEXT,
  PRIMARY KEY (rule_id, language)
);

CREATE TABLE IF NOT EXISTS rule_items (
  id VARCHAR(100) PRIMARY KEY,
  rule_category_id VARCHAR(100) REFERENCES rules(id) ON DELETE CASCADE,
  number VARCHAR(50) NOT NULL,
  translations JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_rule_items_category ON rule_items(rule_category_id);

-- 5. JOBS & TRANSLATIONS
CREATE TABLE IF NOT EXISTS jobs (
  id VARCHAR(100) PRIMARY KEY,
  slug VARCHAR(255) UNIQUE NOT NULL,
  category VARCHAR(50) NOT NULL,
  image TEXT,
  salary_min INT DEFAULT 0,
  salary_max INT DEFAULT 0,
  status VARCHAR(50) DEFAULT 'HIRING_OPEN',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS job_translations (
  job_id VARCHAR(100) REFERENCES jobs(id) ON DELETE CASCADE,
  language VARCHAR(10) NOT NULL,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  requirements TEXT[] DEFAULT ARRAY[]::TEXT[],
  duties TEXT[] DEFAULT ARRAY[]::TEXT[],
  PRIMARY KEY (job_id, language)
);

-- 5.1 JOB APPLICATIONS
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

-- 6. PRODUCTS & TRANSLATIONS
CREATE TABLE IF NOT EXISTS products (
  id VARCHAR(100) PRIMARY KEY,
  slug VARCHAR(255) UNIQUE NOT NULL,
  category VARCHAR(50) NOT NULL,
  price NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
  currency VARCHAR(10) DEFAULT 'SAR',
  image TEXT,
  stock INT DEFAULT 100,
  status VARCHAR(50) DEFAULT 'ACTIVE',
  featured BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS product_translations (
  product_id VARCHAR(100) REFERENCES products(id) ON DELETE CASCADE,
  language VARCHAR(10) NOT NULL,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  perks TEXT[] DEFAULT ARRAY[]::TEXT[],
  PRIMARY KEY (product_id, language)
);

-- 7. ORDERS & ORDER ITEMS
CREATE TABLE IF NOT EXISTS orders (
  id VARCHAR(100) PRIMARY KEY,
  order_number VARCHAR(100) UNIQUE NOT NULL,
  user_id VARCHAR(100) REFERENCES users(id) ON DELETE CASCADE,
  product_id VARCHAR(100) REFERENCES products(id) ON DELETE SET NULL,
  product_name VARCHAR(255) NOT NULL,
  price NUMERIC(10, 2) NOT NULL,
  currency VARCHAR(10) DEFAULT 'SAR',
  status VARCHAR(50) DEFAULT 'PENDING',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_orders_user_id ON orders(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);

CREATE TABLE IF NOT EXISTS order_items (
  id VARCHAR(100) PRIMARY KEY,
  order_id VARCHAR(100) REFERENCES orders(id) ON DELETE CASCADE,
  product_id VARCHAR(100) REFERENCES products(id) ON DELETE SET NULL,
  quantity INT DEFAULT 1,
  unit_price NUMERIC(10, 2) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. TICKETS & TICKET MESSAGES
CREATE TABLE IF NOT EXISTS tickets (
  id VARCHAR(100) PRIMARY KEY,
  ticket_number VARCHAR(100) UNIQUE NOT NULL,
  user_id VARCHAR(100) REFERENCES users(id) ON DELETE CASCADE,
  user_name VARCHAR(100) NOT NULL,
  user_avatar TEXT,
  subject VARCHAR(255) NOT NULL,
  category VARCHAR(100) NOT NULL,
  priority VARCHAR(50) DEFAULT 'MEDIUM',
  status VARCHAR(50) DEFAULT 'OPEN',
  assigned_to VARCHAR(100),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_tickets_user_id ON tickets(user_id);
CREATE INDEX IF NOT EXISTS idx_tickets_status ON tickets(status);

CREATE TABLE IF NOT EXISTS ticket_messages (
  id VARCHAR(100) PRIMARY KEY,
  ticket_id VARCHAR(100) REFERENCES tickets(id) ON DELETE CASCADE,
  sender_id VARCHAR(100) NOT NULL,
  sender_name VARCHAR(100) NOT NULL,
  sender_avatar TEXT,
  sender_role VARCHAR(50) NOT NULL,
  is_staff BOOLEAN DEFAULT FALSE,
  message TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_ticket_messages_ticket ON ticket_messages(ticket_id);

-- 9. NOTIFICATIONS
CREATE TABLE IF NOT EXISTS notifications (
  id VARCHAR(100) PRIMARY KEY,
  user_id VARCHAR(100) REFERENCES users(id) ON DELETE CASCADE,
  type VARCHAR(50) NOT NULL,
  title VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  link TEXT,
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications(user_id);

-- 10. AUDIT LOGS
CREATE TABLE IF NOT EXISTS audit_logs (
  id VARCHAR(100) PRIMARY KEY,
  admin_id VARCHAR(100) NOT NULL,
  admin_name VARCHAR(100) NOT NULL,
  action VARCHAR(100) NOT NULL,
  entity VARCHAR(100) NOT NULL,
  entity_id VARCHAR(100) NOT NULL,
  metadata TEXT,
  ip VARCHAR(100) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_audit_logs_created ON audit_logs(created_at DESC);

-- 11. FAQ & FAQ TRANSLATIONS
CREATE TABLE IF NOT EXISTS faq (
  id VARCHAR(100) PRIMARY KEY,
  category VARCHAR(100) NOT NULL,
  sort_order INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS faq_translations (
  faq_id VARCHAR(100) REFERENCES faq(id) ON DELETE CASCADE,
  language VARCHAR(10) NOT NULL,
  question TEXT NOT NULL,
  answer TEXT NOT NULL,
  PRIMARY KEY (faq_id, language)
);

-- 12. SITE SETTINGS
CREATE TABLE IF NOT EXISTS site_settings (
  key VARCHAR(50) PRIMARY KEY,
  data JSONB NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 13. SOCIAL LINKS
CREATE TABLE IF NOT EXISTS social_links (
  id VARCHAR(100) PRIMARY KEY,
  platform VARCHAR(50) NOT NULL,
  url TEXT NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 14. PLAYER PROFILES (FiveM In-Game Linkage)
CREATE TABLE IF NOT EXISTS player_profiles (
  id VARCHAR(100) PRIMARY KEY,
  user_id VARCHAR(100) REFERENCES users(id) ON DELETE CASCADE,
  citizen_id VARCHAR(100) UNIQUE,
  first_name VARCHAR(100),
  last_name VARCHAR(100),
  phone_number VARCHAR(50),
  date_of_birth VARCHAR(50),
  gender VARCHAR(20),
  cash NUMERIC(12, 2) DEFAULT 0.00,
  bank NUMERIC(12, 2) DEFAULT 0.00,
  job VARCHAR(100),
  grade VARCHAR(100),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_player_profiles_citizen ON player_profiles(citizen_id);

-- 15. REPORTS
CREATE TABLE IF NOT EXISTS reports (
  id VARCHAR(100) PRIMARY KEY,
  reporter_id VARCHAR(100) REFERENCES users(id) ON DELETE CASCADE,
  target_id VARCHAR(100),
  target_name VARCHAR(100),
  reason TEXT NOT NULL,
  category VARCHAR(50) NOT NULL,
  status VARCHAR(50) DEFAULT 'PENDING',
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 16. DISCOUNTS
CREATE TABLE IF NOT EXISTS discounts (
  id VARCHAR(100) PRIMARY KEY,
  code VARCHAR(50) UNIQUE NOT NULL,
  percentage NUMERIC(5, 2) NOT NULL,
  max_uses INT DEFAULT 100,
  used_count INT DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 17. LEADERBOARD
CREATE TABLE IF NOT EXISTS leaderboard (
  id VARCHAR(100) PRIMARY KEY,
  category VARCHAR(50) NOT NULL,
  rank INT DEFAULT 1,
  name VARCHAR(100) NOT NULL,
  metric VARCHAR(100) NOT NULL,
  subtitle VARCHAR(150),
  badge VARCHAR(100),
  avatar TEXT,
  discord_id VARCHAR(100),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_leaderboard_category ON leaderboard(category, rank);


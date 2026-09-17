import { query } from '../postgres';

export async function runCleanupAndSetup(): Promise<void> {
  console.log('[CleanupAndSetup] Starting database schema verification and cleanup...');

  // 1. Ensure OWNER role exists in roles table
  await query(`
    INSERT INTO roles (name, display_name, description)
    VALUES ('OWNER', 'Server Owner', 'Full server ownership and absolute administrative authority')
    ON CONFLICT (name) DO UPDATE SET display_name = EXCLUDED.display_name, description = EXCLUDED.description;
  `);

  // 2. Add columns to users table if not exist
  await query(`
    ALTER TABLE users ADD COLUMN IF NOT EXISTS is_admin BOOLEAN DEFAULT FALSE;
    ALTER TABLE users ADD COLUMN IF NOT EXISTS is_owner BOOLEAN DEFAULT FALSE;
    ALTER TABLE users ADD COLUMN IF NOT EXISTS display_name VARCHAR(100);
    ALTER TABLE users ADD COLUMN IF NOT EXISTS last_login_at TIMESTAMPTZ DEFAULT NOW();
  `);

  // 3. Create indexes
  await query(`
    CREATE INDEX IF NOT EXISTS idx_users_discord_id ON users (discord_id);
    CREATE INDEX IF NOT EXISTS idx_users_role ON users (role);
    CREATE INDEX IF NOT EXISTS idx_users_created_at ON users (created_at);
  `);

  // 4. Ensure reports table exists
  await query(`
    CREATE TABLE IF NOT EXISTS reports (
      id VARCHAR(100) PRIMARY KEY,
      reporter_id VARCHAR(100) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      reporter_name VARCHAR(100),
      reporter_avatar TEXT,
      target_id VARCHAR(100),
      target_name VARCHAR(100),
      category VARCHAR(50) NOT NULL,
      reason TEXT NOT NULL,
      status VARCHAR(50) NOT NULL DEFAULT 'OPEN',
      notes TEXT,
      created_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW()
    );
    CREATE INDEX IF NOT EXISTS idx_reports_reporter ON reports (reporter_id);
    CREATE INDEX IF NOT EXISTS idx_reports_status ON reports (status);
  `);

  // 5. Ensure social_links table exists
  await query(`
    CREATE TABLE IF NOT EXISTS social_links (
      id VARCHAR(100) PRIMARY KEY,
      platform VARCHAR(100) NOT NULL,
      url TEXT NOT NULL,
      is_active BOOLEAN DEFAULT TRUE,
      created_at TIMESTAMPTZ DEFAULT NOW()
    );
  `);

  // 6. Find real user by OWNER_DISCORD_ID
  const ownerDiscordId = (process.env.OWNER_DISCORD_ID || '465227455159074818').trim();
  console.log(`[CleanupAndSetup] Target OWNER_DISCORD_ID is: ${ownerDiscordId}`);

  const realUserRes = await query('SELECT * FROM users WHERE discord_id = $1', [ownerDiscordId]);
  let realUserId: string;

  if (realUserRes.rows.length > 0) {
    realUserId = realUserRes.rows[0].id;
    console.log(`[CleanupAndSetup] Found real user (${realUserId}) for Discord ID ${ownerDiscordId}. Promoting to OWNER.`);
    await query(`
      UPDATE users 
      SET role = 'OWNER', is_owner = TRUE, is_admin = TRUE, permissions = ARRAY['*'], updated_at = NOW()
      WHERE id = $1
    `, [realUserId]);
  } else {
    realUserId = `usr_${Date.now()}_owner`;
    console.log(`[CleanupAndSetup] Creating registered reservation for OWNER_DISCORD_ID ${ownerDiscordId}`);
    await query(`
      INSERT INTO users (id, discord_id, username, global_name, role, status, permissions, is_owner, is_admin, created_at, updated_at)
      VALUES ($1, $2, 'ServerOwner', 'Server Owner', 'OWNER', 'ACTIVE', ARRAY['*'], TRUE, TRUE, NOW(), NOW())
    `, [realUserId, ownerDiscordId]);
  }

  // 7. Reassign any existing orders, tickets, or reports from fake test users to real owner user before deletion
  const fakeIds = ['usr_superadmin', 'usr_admin', 'usr_support', 'usr_citizen', 'usr_1789635511197_g3h9'];
  for (const fakeId of fakeIds) {
    await query('UPDATE orders SET user_id = $1 WHERE user_id = $2', [realUserId, fakeId]);
    await query('UPDATE tickets SET user_id = $1 WHERE user_id = $2', [realUserId, fakeId]);
    await query('UPDATE notifications SET user_id = $1 WHERE user_id = $2', [realUserId, fakeId]);
    await query('UPDATE reports SET reporter_id = $1 WHERE reporter_id = $2', [realUserId, fakeId]);
    await query('UPDATE sessions SET user_id = $1 WHERE user_id = $2', [realUserId, fakeId]);
  }

  // 8. Safely delete the fake users
  const deleteRes = await query('DELETE FROM users WHERE id = ANY($1::text[])', [fakeIds]);
  console.log(`[CleanupAndSetup] Removed ${deleteRes.rowCount} fake test users.`);

  // 9. Ensure all other users are strictly CITIZEN with is_owner = false, is_admin = false
  await query(`
    UPDATE users 
    SET role = 'CITIZEN', is_owner = FALSE, is_admin = FALSE
    WHERE discord_id != $1 AND role = 'OWNER'
  `, [ownerDiscordId]);

  // Seed default social links if empty
  const socialCheck = await query('SELECT COUNT(*) FROM social_links');
  if (parseInt(socialCheck.rows[0].count, 10) === 0) {
    const defaultSocials = [
      { id: 'soc_discord', platform: 'Discord', url: 'https://discord.gg/primerp', is_active: true },
      { id: 'soc_youtube', platform: 'YouTube', url: 'https://youtube.com/@primerp', is_active: true },
      { id: 'soc_tiktok', platform: 'TikTok', url: 'https://tiktok.com/@primerp', is_active: true },
      { id: 'soc_twitter', platform: 'Twitter/X', url: 'https://x.com/primerp', is_active: true }
    ];
    for (const s of defaultSocials) {
      await query(
        'INSERT INTO social_links (id, platform, url, is_active, created_at) VALUES ($1, $2, $3, $4, NOW()) ON CONFLICT (id) DO NOTHING',
        [s.id, s.platform, s.url, s.is_active]
      );
    }
    console.log('[CleanupAndSetup] Seeded default social links.');
  }

  console.log('[CleanupAndSetup] Cleanup and setup completed successfully.');
}

import { query } from '../postgres';
import { User, UserRole, UserStatus } from '../../../src/types';

export class UserRepository {
  private static mapRowToUser(row: any): User {
    return {
      id: row.id,
      discordId: row.discord_id,
      username: row.username,
      globalName: row.global_name || row.username,
      avatar: row.avatar || undefined,
      email: row.email || undefined,
      role: row.role as UserRole,
      status: row.status as UserStatus,
      permissions: Array.isArray(row.permissions) ? row.permissions : [],
      bio: row.bio || undefined,
      lastLogin: row.last_login ? new Date(row.last_login).toISOString() : new Date().toISOString(),
      createdAt: row.created_at ? new Date(row.created_at).toISOString() : new Date().toISOString(),
      updatedAt: row.updated_at ? new Date(row.updated_at).toISOString() : new Date().toISOString()
    };
  }

  async findById(id: string): Promise<User | null> {
    const res = await query('SELECT * FROM users WHERE id = $1', [id]);
    if (res.rows.length === 0) return null;
    return UserRepository.mapRowToUser(res.rows[0]);
  }

  async findByDiscordId(discordId: string): Promise<User | null> {
    const res = await query('SELECT * FROM users WHERE discord_id = $1', [discordId]);
    if (res.rows.length === 0) return null;
    return UserRepository.mapRowToUser(res.rows[0]);
  }

  async findByUsername(username: string): Promise<User | null> {
    const res = await query('SELECT * FROM users WHERE LOWER(username) = LOWER($1) OR LOWER(global_name) = LOWER($1)', [username]);
    if (res.rows.length === 0) return null;
    return UserRepository.mapRowToUser(res.rows[0]);
  }

  async getAll(): Promise<User[]> {
    const res = await query('SELECT * FROM users ORDER BY created_at DESC');
    return res.rows.map(UserRepository.mapRowToUser);
  }

  async upsert(data: {
    discordId: string;
    username: string;
    globalName?: string;
    avatar?: string;
    email?: string;
    role?: UserRole;
    status?: UserStatus;
    permissions?: string[];
    bio?: string;
  }): Promise<User> {
    const existing = await this.findByDiscordId(data.discordId);

    if (existing) {
      // Preserve role and permissions if already established
      const role = existing.role;
      const permissions = existing.permissions;
      const status = existing.status;

      const res = await query(
        `UPDATE users 
         SET username = $1, global_name = $2, avatar = $3, email = COALESCE($4, email), 
             last_login = NOW(), updated_at = NOW()
         WHERE discord_id = $5
         RETURNING *`,
        [
          data.username,
          data.globalName || data.username,
          data.avatar || null,
          data.email || null,
          data.discordId
        ]
      );
      return UserRepository.mapRowToUser(res.rows[0]);
    }

    // New user: STRICT DEFAULT IS CITIZEN
    const id = `usr_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`;
    const role = data.role || UserRole.CITIZEN;
    const permissions = data.permissions || ['tickets.create', 'orders.create'];
    const status = data.status || UserStatus.ACTIVE;

    const res = await query(
      `INSERT INTO users (id, discord_id, username, global_name, avatar, email, role, status, permissions, bio, last_login, created_at, updated_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, NOW(), NOW(), NOW())
       RETURNING *`,
      [
        id,
        data.discordId,
        data.username,
        data.globalName || data.username,
        data.avatar || null,
        data.email || null,
        role,
        status,
        permissions,
        data.bio || ''
      ]
    );

    return UserRepository.mapRowToUser(res.rows[0]);
  }

  async updateRole(id: string, role: UserRole, customPermissions?: string[]): Promise<User | null> {
    let perms = customPermissions;
    if (!perms) {
      if (role === UserRole.SUPER_ADMIN) perms = ['*'];
      else if (role === UserRole.ADMIN) perms = ['users.view', 'users.edit', 'news.*', 'rules.*', 'jobs.*', 'tickets.*', 'audit.view'];
      else if (role === UserRole.MODERATOR) perms = ['tickets.view', 'tickets.reply', 'rules.*', 'jobs.*'];
      else if (role === UserRole.SUPPORT) perms = ['tickets.view', 'tickets.reply', 'tickets.close'];
      else if (role === UserRole.EDITOR) perms = ['news.*'];
      else if (role === UserRole.STORE_MANAGER) perms = ['products.*'];
      else perms = ['tickets.create', 'orders.create'];
    }

    const res = await query(
      `UPDATE users 
       SET role = $1, permissions = $2, updated_at = NOW() 
       WHERE id = $3
       RETURNING *`,
      [role, perms, id]
    );

    if (res.rows.length === 0) return null;
    return UserRepository.mapRowToUser(res.rows[0]);
  }

  async updateStatus(id: string, status: UserStatus): Promise<User | null> {
    const res = await query(
      `UPDATE users 
       SET status = $1, updated_at = NOW() 
       WHERE id = $2
       RETURNING *`,
      [status, id]
    );
    if (res.rows.length === 0) return null;
    return UserRepository.mapRowToUser(res.rows[0]);
  }

  async assignRoleByIdentifier(identifier: string, role: UserRole, customPermissions?: string[]): Promise<User> {
    const clean = identifier.trim();
    // Search by Discord ID or Username or globalName
    const findRes = await query(
      `SELECT * FROM users 
       WHERE discord_id = $1 OR LOWER(username) = LOWER($1) OR LOWER(global_name) = LOWER($1)
       LIMIT 1`,
      [clean]
    );

    let perms = customPermissions;
    if (!perms) {
      if (role === UserRole.SUPER_ADMIN) perms = ['*'];
      else if (role === UserRole.ADMIN) perms = ['users.view', 'users.edit', 'news.*', 'rules.*', 'jobs.*', 'tickets.*', 'audit.view'];
      else if (role === UserRole.MODERATOR) perms = ['tickets.view', 'tickets.reply', 'rules.*', 'jobs.*'];
      else if (role === UserRole.SUPPORT) perms = ['tickets.view', 'tickets.reply', 'tickets.close'];
      else if (role === UserRole.EDITOR) perms = ['news.*'];
      else if (role === UserRole.STORE_MANAGER) perms = ['products.*'];
      else perms = ['tickets.create', 'orders.create'];
    }

    if (findRes.rows.length > 0) {
      const user = findRes.rows[0];
      const updated = await query(
        `UPDATE users SET role = $1, permissions = $2, updated_at = NOW() WHERE id = $3 RETURNING *`,
        [role, perms, user.id]
      );
      return UserRepository.mapRowToUser(updated.rows[0]);
    }

    // If user does not exist yet, create a placeholder reservation for them
    const newId = `usr_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`;
    const isDiscordId = /^\d{17,20}$/.test(clean);
    const created = await query(
      `INSERT INTO users (id, discord_id, username, global_name, role, status, permissions, created_at, updated_at, last_login)
       VALUES ($1, $2, $3, $4, $5, $6, $7, NOW(), NOW(), NOW())
       RETURNING *`,
      [
        newId,
        isDiscordId ? clean : `pending_${clean}`,
        clean,
        clean,
        role,
        UserStatus.ACTIVE,
        perms
      ]
    );
    return UserRepository.mapRowToUser(created.rows[0]);
  }
}

export const userRepository = new UserRepository();

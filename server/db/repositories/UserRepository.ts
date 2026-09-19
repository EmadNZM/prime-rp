import crypto from 'crypto';
import { query, isPostgresConnected } from '../postgres';
import { User, UserRole, UserStatus } from '../../../src/types';
import { db } from '../store';

export class UserRepository {
  private static mapRowToUser(row: any): User {
    const ownerDiscordId = (process.env.OWNER_DISCORD_ID || '').trim();
    // Strict Owner Identity: Only the exact Discord ID declared in OWNER_DISCORD_ID can be owner
    const isOwner = Boolean(ownerDiscordId && row.discord_id === ownerDiscordId);
    const role = isOwner ? UserRole.OWNER : (row.role === 'OWNER' ? UserRole.CITIZEN : (row.role as UserRole));
    const isAdmin = Boolean(isOwner || row.is_admin === true || role === UserRole.ADMIN || role === UserRole.SUPER_ADMIN);

    return {
      id: row.id,
      discordId: row.discord_id,
      username: row.username,
      displayName: row.display_name || row.global_name || row.username,
      globalName: row.global_name || row.display_name || row.username,
      avatar: row.avatar || undefined,
      email: row.email || undefined,
      role,
      status: row.status as UserStatus,
      isAdmin,
      isOwner,
      permissions: isOwner ? ['*'] : (Array.isArray(row.permissions) ? row.permissions.filter((p: string) => p !== '*') : []),
      bio: row.bio || undefined,
      lastLogin: row.last_login ? new Date(row.last_login).toISOString() : new Date().toISOString(),
      lastLoginAt: row.last_login_at ? new Date(row.last_login_at).toISOString() : (row.last_login ? new Date(row.last_login).toISOString() : new Date().toISOString()),
      createdAt: row.created_at ? new Date(row.created_at).toISOString() : new Date().toISOString(),
      updatedAt: row.updated_at ? new Date(row.updated_at).toISOString() : new Date().toISOString()
    };
  }

  async findById(id: string): Promise<User | null> {
    if (!isPostgresConnected()) {
      return db.getUser(id) || null;
    }
    const res = await query('SELECT * FROM users WHERE id = $1', [id]);
    if (res.rows.length === 0) return null;
    return UserRepository.mapRowToUser(res.rows[0]);
  }

  async findByDiscordId(discordId: string): Promise<User | null> {
    if (!isPostgresConnected()) {
      return db.getUserByDiscordId(discordId) || null;
    }
    const res = await query('SELECT * FROM users WHERE discord_id = $1', [discordId]);
    if (res.rows.length === 0) return null;
    return UserRepository.mapRowToUser(res.rows[0]);
  }

  async findByUsername(username: string): Promise<User | null> {
    if (!isPostgresConnected()) {
      const u = db.getUsers().find(
        user => user.username.toLowerCase() === username.toLowerCase() ||
        (user.displayName && user.displayName.toLowerCase() === username.toLowerCase())
      );
      return u || null;
    }
    const res = await query('SELECT * FROM users WHERE LOWER(username) = LOWER($1) OR LOWER(global_name) = LOWER($1)', [username]);
    if (res.rows.length === 0) return null;
    return UserRepository.mapRowToUser(res.rows[0]);
  }

  async getAll(): Promise<User[]> {
    if (!isPostgresConnected()) {
      return db.getUsers();
    }
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
    const ownerDiscordId = (process.env.OWNER_DISCORD_ID || '').trim();
    const isOwner = Boolean(ownerDiscordId && data.discordId === ownerDiscordId);

    if (!isPostgresConnected()) {
      const existing = db.getUserByDiscordId(data.discordId);
      if (existing) {
        const role = isOwner ? UserRole.OWNER : (existing.role === UserRole.OWNER ? UserRole.CITIZEN : existing.role);
        const permissions = isOwner ? ['*'] : existing.permissions.filter(p => p !== '*');
        const isAdmin = isOwner || role === UserRole.ADMIN || role === UserRole.SUPER_ADMIN;

        const updated = db.updateUser(existing.id, {
          username: data.username,
          displayName: data.globalName || data.username,
          avatar: data.avatar,
          email: data.email || existing.email,
          role,
          permissions,
          isOwner,
          isAdmin,
          lastLogin: new Date().toISOString(),
          lastLoginAt: new Date().toISOString()
        });
        return updated!;
      }

      const id = `usr_${Date.now()}_${crypto.randomBytes(4).toString('hex')}`;
      const role = isOwner ? UserRole.OWNER : UserRole.CITIZEN;
      const permissions = isOwner ? ['*'] : ['tickets.create', 'orders.create'];
      const status = data.status || UserStatus.ACTIVE;
      const isAdmin = isOwner;

      const newUser: User = {
        id,
        discordId: data.discordId,
        username: data.username,
        displayName: data.globalName || data.username,
        avatar: data.avatar,
        email: data.email,
        role,
        status,
        permissions,
        isOwner,
        isAdmin,
        bio: data.bio || '',
        lastLogin: new Date().toISOString(),
        lastLoginAt: new Date().toISOString(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      return db.saveUser(newUser);
    }

    const existing = await this.findByDiscordId(data.discordId);

    if (existing) {
      const role = isOwner ? UserRole.OWNER : (existing.role === UserRole.OWNER ? UserRole.CITIZEN : existing.role);
      const permissions = isOwner ? ['*'] : existing.permissions.filter(p => p !== '*');
      const isAdmin = isOwner || role === UserRole.ADMIN || role === UserRole.SUPER_ADMIN;

      const res = await query(
        `UPDATE users 
         SET username = $1, global_name = $2, avatar = $3, email = COALESCE($4, email), 
             role = $5, permissions = $6, is_owner = $7, is_admin = $8,
             last_login = NOW(), last_login_at = NOW(), updated_at = NOW()
         WHERE discord_id = $9
         RETURNING *`,
        [
          data.username,
          data.globalName || data.username,
          data.avatar || null,
          data.email || null,
          role,
          permissions,
          isOwner,
          isAdmin,
          data.discordId
        ]
      );
      return UserRepository.mapRowToUser(res.rows[0]);
    }

    // New user: STRICT DEFAULT IS CITIZEN unless Discord ID matches OWNER_DISCORD_ID
    const id = `usr_${Date.now()}_${crypto.randomBytes(4).toString('hex')}`;
    const role = isOwner ? UserRole.OWNER : UserRole.CITIZEN;
    const permissions = isOwner ? ['*'] : ['tickets.create', 'orders.create'];
    const status = data.status || UserStatus.ACTIVE;
    const isAdmin = isOwner;

    const res = await query(
      `INSERT INTO users (id, discord_id, username, global_name, avatar, email, role, status, permissions, is_owner, is_admin, bio, last_login, last_login_at, created_at, updated_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, NOW(), NOW(), NOW(), NOW())
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
        isOwner,
        isAdmin,
        data.bio || ''
      ]
    );

    return UserRepository.mapRowToUser(res.rows[0]);
  }

  async updateRole(id: string, role: UserRole, customPermissions?: string[]): Promise<User | null> {
    // Strict security: OWNER role cannot be assigned or revoked via updateRole API
    if (role === UserRole.OWNER || (role as string) === 'OWNER') {
      throw new Error('Role OWNER cannot be assigned via API. The owner is strictly determined by OWNER_DISCORD_ID.');
    }

    const targetUser = await this.findById(id);
    if (!targetUser) return null;
    if (targetUser.isOwner) {
      throw new Error('Cannot change the role of the Server Owner.');
    }

    let perms = customPermissions ? customPermissions.filter(p => p !== '*' && typeof p === 'string') : undefined;
    if (!perms || perms.length === 0) {
      if (role === UserRole.ADMIN || role === UserRole.SUPER_ADMIN) perms = ['users.view', 'users.edit', 'news.*', 'rules.*', 'jobs.*', 'tickets.*', 'audit.view'];
      else if (role === UserRole.MODERATOR) perms = ['tickets.view', 'tickets.reply', 'rules.*', 'jobs.*'];
      else if (role === UserRole.SUPPORT) perms = ['tickets.view', 'tickets.reply', 'tickets.close'];
      else if (role === UserRole.EDITOR) perms = ['news.*'];
      else if (role === UserRole.STORE_MANAGER) perms = ['products.*'];
      else perms = ['tickets.create', 'orders.create'];
    }

    const isAdmin = (role === UserRole.ADMIN || role === UserRole.SUPER_ADMIN);

    if (!isPostgresConnected()) {
      return db.updateUser(id, {
        role,
        permissions: perms,
        isAdmin,
        isOwner: false
      });
    }

    const res = await query(
      `UPDATE users 
       SET role = $1, permissions = $2, is_admin = $3, is_owner = FALSE, updated_at = NOW() 
       WHERE id = $4
       RETURNING *`,
      [role, perms, isAdmin, id]
    );

    if (res.rows.length === 0) return null;
    return UserRepository.mapRowToUser(res.rows[0]);
  }

  async updateStatus(id: string, status: UserStatus): Promise<User | null> {
    const targetUser = await this.findById(id);
    if (!targetUser) return null;
    if (targetUser.isOwner) {
      throw new Error('Cannot suspend or ban the Server Owner.');
    }

    if (!isPostgresConnected()) {
      return db.updateUser(id, { status });
    }

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
    if (role === UserRole.OWNER || (role as string) === 'OWNER') {
      throw new Error('Role OWNER cannot be assigned. The owner is strictly determined by OWNER_DISCORD_ID.');
    }

    const clean = identifier.trim();

    let perms = customPermissions ? customPermissions.filter(p => p !== '*' && typeof p === 'string') : undefined;
    if (!perms || perms.length === 0) {
      if (role === UserRole.ADMIN || role === UserRole.SUPER_ADMIN) perms = ['users.view', 'users.edit', 'news.*', 'rules.*', 'jobs.*', 'tickets.*', 'audit.view'];
      else if (role === UserRole.MODERATOR) perms = ['tickets.view', 'tickets.reply', 'rules.*', 'jobs.*'];
      else if (role === UserRole.SUPPORT) perms = ['tickets.view', 'tickets.reply', 'tickets.close'];
      else if (role === UserRole.EDITOR) perms = ['news.*'];
      else if (role === UserRole.STORE_MANAGER) perms = ['products.*'];
      else perms = ['tickets.create', 'orders.create'];
    }

    const isAdmin = (role === UserRole.ADMIN || role === UserRole.SUPER_ADMIN);

    if (!isPostgresConnected()) {
      const existing = db.getUsers().find(
        u => u.discordId === clean || u.username.toLowerCase() === clean.toLowerCase()
      );
      if (existing) {
        const ownerDiscordId = (process.env.OWNER_DISCORD_ID || '').trim();
        if (existing.isOwner || (ownerDiscordId && existing.discordId === ownerDiscordId)) {
          throw new Error('Cannot modify Server Owner role.');
        }
        return db.updateUser(existing.id, {
          role,
          permissions: perms,
          isAdmin,
          isOwner: false
        })!;
      }

      const newId = `usr_${Date.now()}_${crypto.randomBytes(4).toString('hex')}`;
      const isDiscordId = /^\d{17,20}$/.test(clean);
      const newUser: User = {
        id: newId,
        discordId: isDiscordId ? clean : `pending_${clean}`,
        username: clean,
        displayName: clean,
        role,
        status: UserStatus.ACTIVE,
        permissions: perms,
        isAdmin,
        isOwner: false,
        lastLogin: new Date().toISOString(),
        lastLoginAt: new Date().toISOString(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      return db.saveUser(newUser);
    }

    const findRes = await query(
      `SELECT * FROM users 
       WHERE discord_id = $1 OR LOWER(username) = LOWER($1) OR LOWER(global_name) = LOWER($1)
       LIMIT 1`,
      [clean]
    );

    if (findRes.rows.length > 0) {
      const user = findRes.rows[0];
      const ownerDiscordId = (process.env.OWNER_DISCORD_ID || '').trim();
      if (user.is_owner || (ownerDiscordId && user.discord_id === ownerDiscordId)) {
        throw new Error('Cannot modify Server Owner role.');
      }

      const updated = await query(
        `UPDATE users SET role = $1, permissions = $2, is_admin = $3, is_owner = FALSE, updated_at = NOW() WHERE id = $4 RETURNING *`,
        [role, perms, isAdmin, user.id]
      );
      return UserRepository.mapRowToUser(updated.rows[0]);
    }

    // Placeholder reservation
    const newId = `usr_${Date.now()}_${crypto.randomBytes(4).toString('hex')}`;
    const isDiscordId = /^\d{17,20}$/.test(clean);
    const created = await query(
      `INSERT INTO users (id, discord_id, username, global_name, role, status, permissions, is_admin, is_owner, created_at, updated_at, last_login)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, FALSE, NOW(), NOW(), NOW())
       RETURNING *`,
      [
        newId,
        isDiscordId ? clean : `pending_${clean}`,
        clean,
        clean,
        role,
        UserStatus.ACTIVE,
        perms,
        isAdmin
      ]
    );
    return UserRepository.mapRowToUser(created.rows[0]);
  }
}

export const userRepository = new UserRepository();

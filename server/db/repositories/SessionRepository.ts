import crypto from 'crypto';
import { query, isPostgresConnected } from '../postgres';
import { User } from '../../../src/types';
import { userRepository } from './UserRepository';
import { db } from '../store';

export class SessionRepository {
  /**
   * Creates a persistent session in PostgreSQL with a 30-day lifetime.
   */
  async createSession(
    userId: string,
    ipAddress?: string,
    userAgent?: string,
    durationDays: number = 30
  ): Promise<string> {
    if (!isPostgresConnected()) {
      return db.createSession(userId, ipAddress, userAgent, durationDays);
    }
    const sessionId = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + durationDays * 24 * 60 * 60 * 1000);

    await query(
      `INSERT INTO sessions (id, user_id, ip_address, user_agent, expires_at, created_at, last_used_at)
       VALUES ($1, $2, $3, $4, $5, NOW(), NOW())`,
      [sessionId, userId, ipAddress || null, userAgent || null, expiresAt]
    );

    return sessionId;
  }

  /**
   * Validates session from PostgreSQL, updates last_used_at, and implements rolling expiration.
   */
  async validateSession(sessionId: string): Promise<User | null> {
    if (!sessionId || typeof sessionId !== 'string') return null;

    if (!isPostgresConnected()) {
      return db.validateSession(sessionId);
    }

    const res = await query(
      `SELECT s.id, s.user_id, s.expires_at, s.last_used_at 
       FROM sessions s
       WHERE s.id = $1 AND s.expires_at > NOW()`,
      [sessionId]
    );

    if (res.rows.length === 0) {
      return null;
    }

    const session = res.rows[0];
    const userId = session.user_id;

    // Rolling session: safely extend expiration if active and at least 1 hour has elapsed since last update
    try {
      const lastUsed = session.last_used_at ? new Date(session.last_used_at).getTime() : 0;
      const oneHourAgo = Date.now() - 60 * 60 * 1000;
      if (lastUsed < oneHourAgo) {
        const newExpiry = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
        await query(
          `UPDATE sessions 
           SET last_used_at = NOW(), expires_at = $1 
           WHERE id = $2`,
          [newExpiry, sessionId]
        );
      }
    } catch (err: any) {
      // Non-blocking error for rolling update
      console.warn('[SessionRepository] Rolling session update notice:', err.message);
    }

    return userRepository.findById(userId);
  }

  async deleteSession(sessionId: string): Promise<void> {
    if (!sessionId) return;
    if (!isPostgresConnected()) {
      db.deleteSession(sessionId);
      return;
    }
    await query('DELETE FROM sessions WHERE id = $1', [sessionId]);
  }

  async deleteUserSessions(userId: string): Promise<void> {
    if (!userId) return;
    if (!isPostgresConnected()) {
      db.deleteUserSessions(userId);
      return;
    }
    await query('DELETE FROM sessions WHERE user_id = $1', [userId]);
  }

  async deleteExpiredSessions(): Promise<void> {
    if (!isPostgresConnected()) {
      return;
    }
    await query('DELETE FROM sessions WHERE expires_at <= NOW()');
  }
}

export const sessionRepository = new SessionRepository();

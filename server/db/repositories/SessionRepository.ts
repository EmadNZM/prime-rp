import crypto from 'crypto';
import { query } from '../postgres';
import { User } from '../../../src/types';
import { userRepository } from './UserRepository';

export class SessionRepository {
  async createSession(userId: string, ipAddress?: string, userAgent?: string, durationDays: number = 7): Promise<string> {
    const sessionId = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + durationDays * 24 * 60 * 60 * 1000);

    await query(
      `INSERT INTO sessions (id, user_id, ip_address, user_agent, expires_at, created_at)
       VALUES ($1, $2, $3, $4, $5, NOW())`,
      [sessionId, userId, ipAddress || null, userAgent || null, expiresAt]
    );

    return sessionId;
  }

  async validateSession(sessionId: string): Promise<User | null> {
    if (!sessionId) return null;

    const res = await query(
      `SELECT s.id, s.user_id, s.expires_at 
       FROM sessions s
       WHERE s.id = $1 AND s.expires_at > NOW()`,
      [sessionId]
    );

    if (res.rows.length === 0) {
      return null;
    }

    const userId = res.rows[0].user_id;
    return userRepository.findById(userId);
  }

  async deleteSession(sessionId: string): Promise<void> {
    await query('DELETE FROM sessions WHERE id = $1', [sessionId]);
  }

  async deleteExpiredSessions(): Promise<void> {
    await query('DELETE FROM sessions WHERE expires_at <= NOW()');
  }
}

export const sessionRepository = new SessionRepository();

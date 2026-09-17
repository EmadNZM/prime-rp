import { query, isPostgresConnected } from '../postgres';
import { db } from '../store';

export interface DiscordTokens {
  userId: string;
  accessToken: string;
  refreshToken: string;
  expiresAt: Date;
}

export class DiscordTokenRepository {
  async saveTokens(
    userId: string,
    accessToken: string,
    refreshToken: string,
    expiresInSeconds: number = 604800
  ): Promise<void> {
    if (!isPostgresConnected()) {
      return db.saveDiscordTokens(userId, accessToken, refreshToken, expiresInSeconds);
    }
    const expiresAt = new Date(Date.now() + expiresInSeconds * 1000);
    await query(
      `INSERT INTO discord_oauth_tokens (user_id, access_token, refresh_token, expires_at, updated_at)
       VALUES ($1, $2, $3, $4, NOW())
       ON CONFLICT (user_id) DO UPDATE SET
         access_token = EXCLUDED.access_token,
         refresh_token = EXCLUDED.refresh_token,
         expires_at = EXCLUDED.expires_at,
         updated_at = NOW()`,
      [userId, accessToken, refreshToken, expiresAt]
    );
  }

  async getTokens(userId: string): Promise<DiscordTokens | null> {
    if (!isPostgresConnected()) {
      const tok = db.getDiscordTokens(userId);
      if (!tok) return null;
      return {
        userId: tok.userId,
        accessToken: tok.accessToken,
        refreshToken: tok.refreshToken,
        expiresAt: new Date(tok.expiresAt)
      };
    }
    const res = await query(
      'SELECT user_id, access_token, refresh_token, expires_at FROM discord_oauth_tokens WHERE user_id = $1',
      [userId]
    );
    if (res.rows.length === 0) return null;
    const row = res.rows[0];
    return {
      userId: row.user_id,
      accessToken: row.access_token,
      refreshToken: row.refresh_token,
      expiresAt: new Date(row.expires_at)
    };
  }

  async refreshDiscordToken(userId: string, clientId: string, clientSecret: string): Promise<string | null> {
    const tokenRecord = await this.getTokens(userId);
    if (!tokenRecord || !tokenRecord.refreshToken) {
      return null;
    }

    if (!clientId || !clientSecret) {
      return null;
    }

    try {
      const response = await fetch('https://discord.com/api/oauth2/token', {
        method: 'POST',
        body: new URLSearchParams({
          client_id: clientId,
          client_secret: clientSecret,
          grant_type: 'refresh_token',
          refresh_token: tokenRecord.refreshToken
        }),
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'User-Agent': 'PrimeRPPlatform (https://prime-rp.onrender.com, 1.0.0)'
        }
      });

      if (!response.ok) {
        console.error('[Discord OAuth] Refresh token failed with status:', response.status);
        return null;
      }

      const data = await response.json();
      await this.saveTokens(userId, data.access_token, data.refresh_token, data.expires_in || 604800);
      return data.access_token;
    } catch (err: any) {
      console.error('[Discord OAuth] Failed to refresh token:', err.message);
      return null;
    }
  }

  async deleteTokens(userId: string): Promise<void> {
    if (!isPostgresConnected()) {
      return db.deleteDiscordTokens(userId);
    }
    await query('DELETE FROM discord_oauth_tokens WHERE user_id = $1', [userId]);
  }
}

export const discordTokenRepository = new DiscordTokenRepository();

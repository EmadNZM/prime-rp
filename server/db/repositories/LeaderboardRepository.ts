import { LeaderboardEntry } from '../../../src/types';
import { query, isPostgresConnected } from '../postgres';
import { db } from '../store';

export class LeaderboardRepository {
  private static mapRow(row: any): LeaderboardEntry {
    return {
      id: row.id,
      category: row.category as any,
      rank: parseInt(row.rank, 10) || 1,
      name: row.name,
      metric: row.metric,
      subtitle: row.subtitle || '',
      badge: row.badge || undefined,
      avatar: row.avatar || undefined,
      discordId: row.discord_id || undefined,
      createdAt: row.created_at ? new Date(row.created_at).toISOString() : undefined,
      updatedAt: row.updated_at ? new Date(row.updated_at).toISOString() : undefined
    };
  }

  async getByCategory(category?: string): Promise<LeaderboardEntry[]> {
    if (!isPostgresConnected()) {
      return db.getLeaderboard(category);
    }

    let sql = 'SELECT * FROM leaderboard';
    const params: any[] = [];
    if (category) {
      sql += ' WHERE category = $1';
      params.push(category);
    }
    sql += ' ORDER BY rank ASC, created_at ASC';

    const res = await query(sql, params);
    return res.rows.map(LeaderboardRepository.mapRow);
  }

  async save(entry: Partial<LeaderboardEntry> & { name: string; metric: string }): Promise<LeaderboardEntry> {
    if (!isPostgresConnected()) {
      return db.saveLeaderboardEntry(entry);
    }

    const id = entry.id || `lead_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`;
    const category = entry.category || 'playtime';
    const rank = entry.rank || 1;
    const subtitle = entry.subtitle || '';
    const badge = entry.badge || null;
    const avatar = entry.avatar || null;
    const discordId = entry.discordId || null;

    const res = await query(
      `INSERT INTO leaderboard (id, category, rank, name, metric, subtitle, badge, avatar, discord_id, updated_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, NOW())
       ON CONFLICT (id) DO UPDATE SET
         category = EXCLUDED.category,
         rank = EXCLUDED.rank,
         name = EXCLUDED.name,
         metric = EXCLUDED.metric,
         subtitle = EXCLUDED.subtitle,
         badge = EXCLUDED.badge,
         avatar = EXCLUDED.avatar,
         discord_id = EXCLUDED.discord_id,
         updated_at = NOW()
       RETURNING *`,
      [id, category, rank, entry.name, entry.metric, subtitle, badge, avatar, discordId]
    );

    return LeaderboardRepository.mapRow(res.rows[0]);
  }

  async delete(id: string): Promise<boolean> {
    if (!isPostgresConnected()) {
      return db.deleteLeaderboardEntry(id);
    }

    const res = await query('DELETE FROM leaderboard WHERE id = $1', [id]);
    return (res.rowCount || 0) > 0;
  }
}

export const leaderboardRepository = new LeaderboardRepository();


import { query, isPostgresConnected } from '../postgres';
import { SocialLinkItem } from '../../../src/types';
import { db } from '../store';

export class SocialLinksRepository {
  private static mapRowToSocial(row: any): SocialLinkItem {
    return {
      id: row.id,
      platform: row.platform,
      url: row.url,
      isActive: row.is_active,
      createdAt: new Date(row.created_at).toISOString()
    };
  }

  async getAll(activeOnly: boolean = false): Promise<SocialLinkItem[]> {
    if (!isPostgresConnected()) {
      return db.getSocialLinks(activeOnly);
    }
    let sql = 'SELECT * FROM social_links';
    const params: any[] = [];
    if (activeOnly) {
      sql += ' WHERE is_active = TRUE';
    }
    sql += ' ORDER BY created_at ASC';

    const res = await query(sql, params);
    return res.rows.map(SocialLinksRepository.mapRowToSocial);
  }

  async save(data: { id?: string; platform: string; url: string; isActive?: boolean }): Promise<SocialLinkItem> {
    if (!isPostgresConnected()) {
      return db.saveSocialLink(data);
    }
    const id = data.id || `soc_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    const isActive = data.isActive !== undefined ? data.isActive : true;

    const res = await query(
      `INSERT INTO social_links (id, platform, url, is_active, created_at)
       VALUES ($1, $2, $3, $4, NOW())
       ON CONFLICT (id) DO UPDATE 
       SET platform = EXCLUDED.platform, url = EXCLUDED.url, is_active = EXCLUDED.is_active
       RETURNING *`,
      [id, data.platform, data.url, isActive]
    );

    return SocialLinksRepository.mapRowToSocial(res.rows[0]);
  }

  async delete(id: string): Promise<boolean> {
    if (!isPostgresConnected()) {
      return db.deleteSocialLink(id);
    }
    const res = await query('DELETE FROM social_links WHERE id = $1', [id]);
    return (res.rowCount ?? 0) > 0;
  }
}

export const socialLinksRepository = new SocialLinksRepository();

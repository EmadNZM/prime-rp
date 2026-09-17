import { query, isPostgresConnected } from '../postgres';
import { SiteSettings } from '../../../src/types';
import { initialSiteSettings } from '../seedData';
import { db } from '../store';

export class SettingsRepository {
  async getSettings(): Promise<SiteSettings> {
    if (!isPostgresConnected()) {
      return db.getSiteSettings();
    }
    const res = await query('SELECT data FROM site_settings WHERE key = $1', ['global']);
    if (res.rows.length === 0) {
      return initialSiteSettings;
    }
    return {
      ...initialSiteSettings,
      ...res.rows[0].data
    };
  }

  async updateSettings(partial: Partial<SiteSettings>): Promise<SiteSettings> {
    if (!isPostgresConnected()) {
      return db.updateSiteSettings(partial);
    }
    const current = await this.getSettings();
    const updated = {
      ...current,
      ...partial
    };

    await query(
      `INSERT INTO site_settings (key, data, updated_at)
       VALUES ('global', $1, NOW())
       ON CONFLICT (key) DO UPDATE SET data = EXCLUDED.data, updated_at = NOW()`,
      [JSON.stringify(updated)]
    );

    return updated;
  }
}

export const settingsRepository = new SettingsRepository();

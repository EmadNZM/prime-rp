import { query, isPostgresConnected, withTransaction } from '../postgres';
import { RuleCategory, RuleItem } from '../../../src/types';
import { db } from '../store';

export class RulesRepository {
  private static async attachCategoryDetails(catRow: any, client?: any): Promise<RuleCategory> {
    const queryFn = client ? (text: string, params?: any[]) => client.query(text, params) : query;
    const transRes = await queryFn(
      'SELECT language, title, description, penalty_info FROM rule_translations WHERE rule_id = $1',
      [catRow.id]
    );

    const translations: Record<string, any> = {
      ar: { title: '', description: '', penaltyInfo: '' },
      en: { title: '', description: '', penaltyInfo: '' }
    };

    for (const t of transRes.rows) {
      translations[t.language] = {
        title: t.title,
        description: t.description,
        penaltyInfo: t.penalty_info
      };
    }

    const itemsRes = await queryFn(
      'SELECT id, number, translations FROM rule_items WHERE rule_category_id = $1 ORDER BY id ASC',
      [catRow.id]
    );

    const rules: RuleItem[] = itemsRes.rows.map((item: any) => ({
      id: item.id,
      number: item.number,
      translations: item.translations
    }));

    return {
      id: catRow.id,
      slug: catRow.slug,
      order: catRow.sort_order,
      translations: translations as any,
      rules
    };
  }

  async getAll(): Promise<RuleCategory[]> {
    if (!isPostgresConnected()) {
      return db.getRules();
    }
    const res = await query('SELECT * FROM rules ORDER BY sort_order ASC, created_at ASC');
    const categories: RuleCategory[] = [];
    for (const row of res.rows) {
      categories.push(await RulesRepository.attachCategoryDetails(row));
    }
    return categories;
  }

  async getBySlug(slug: string): Promise<RuleCategory | null> {
    if (!isPostgresConnected()) {
      return db.getRules().find(r => r.slug === slug) || null;
    }
    const res = await query('SELECT * FROM rules WHERE slug = $1', [slug]);
    if (res.rows.length === 0) return null;
    return RulesRepository.attachCategoryDetails(res.rows[0]);
  }

  async saveCategory(cat: Partial<RuleCategory>): Promise<RuleCategory> {
    if (!isPostgresConnected()) {
      return db.saveRuleCategory(cat as any);
    }
    const id = cat.id || `rule_cat_${Date.now()}`;
    const slug = cat.slug || `rule-${Date.now()}`;
    const order = cat.order ?? 0;

    return withTransaction(async (client) => {
      await client.query(
        `INSERT INTO rules (id, slug, sort_order, created_at, updated_at)
         VALUES ($1, $2, $3, NOW(), NOW())
         ON CONFLICT (id) DO UPDATE 
         SET slug = EXCLUDED.slug, sort_order = EXCLUDED.sort_order, updated_at = NOW()`,
        [id, slug, order]
      );

      // Exact Synchronization: Remove stale translations not present in payload
      if (cat.translations) {
        const payloadLangs = Object.keys(cat.translations).filter(l => (cat.translations as any)[l]);
        if (payloadLangs.length > 0) {
          await client.query(
            'DELETE FROM rule_translations WHERE rule_id = $1 AND NOT (language = ANY($2))',
            [id, payloadLangs]
          );
        } else {
          await client.query('DELETE FROM rule_translations WHERE rule_id = $1', [id]);
        }

        for (const lang of payloadLangs) {
          const t = (cat.translations as any)[lang];
          if (t) {
            await client.query(
              `INSERT INTO rule_translations (rule_id, language, title, description, penalty_info)
               VALUES ($1, $2, $3, $4, $5)
               ON CONFLICT (rule_id, language) DO UPDATE
               SET title = EXCLUDED.title, description = EXCLUDED.description, penalty_info = EXCLUDED.penalty_info`,
              [id, lang, t.title || '', t.description || '', t.penaltyInfo || '']
            );
          }
        }
      }

      // Exact Synchronization: Remove stale rule_items not present in payload
      if (Array.isArray(cat.rules)) {
        const keepItemIds: string[] = [];
        for (const item of cat.rules) {
          const itemId = item.id || `r_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`;
          keepItemIds.push(itemId);
          await client.query(
            `INSERT INTO rule_items (id, rule_category_id, number, translations, created_at)
             VALUES ($1, $2, $3, $4, NOW())
             ON CONFLICT (id) DO UPDATE
             SET number = EXCLUDED.number, translations = EXCLUDED.translations`,
            [itemId, id, item.number, JSON.stringify(item.translations)]
          );
        }

        if (keepItemIds.length > 0) {
          await client.query(
            'DELETE FROM rule_items WHERE rule_category_id = $1 AND NOT (id = ANY($2))',
            [id, keepItemIds]
          );
        } else {
          await client.query('DELETE FROM rule_items WHERE rule_category_id = $1', [id]);
        }
      }

      const row = (await client.query('SELECT * FROM rules WHERE id = $1', [id])).rows[0];
      return RulesRepository.attachCategoryDetails(row, client);
    });
  }

  async deleteCategory(id: string): Promise<boolean> {
    if (!isPostgresConnected()) {
      return db.deleteRuleCategory(id);
    }
    return withTransaction(async (client) => {
      await client.query('DELETE FROM rule_items WHERE rule_category_id = $1', [id]);
      await client.query('DELETE FROM rule_translations WHERE rule_id = $1', [id]);
      const res = await client.query('DELETE FROM rules WHERE id = $1', [id]);
      return (res.rowCount || 0) > 0;
    });
  }
}

export const rulesRepository = new RulesRepository();

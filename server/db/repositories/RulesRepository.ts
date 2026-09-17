import { query, isPostgresConnected } from '../postgres';
import { RuleCategory, RuleItem } from '../../../src/types';
import { db } from '../store';

export class RulesRepository {
  private static async attachCategoryDetails(catRow: any): Promise<RuleCategory> {
    const transRes = await query(
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

    const itemsRes = await query(
      'SELECT id, number, translations FROM rule_items WHERE rule_category_id = $1 ORDER BY id ASC',
      [catRow.id]
    );

    const rules: RuleItem[] = itemsRes.rows.map((item) => ({
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

    await query(
      `INSERT INTO rules (id, slug, sort_order, created_at, updated_at)
       VALUES ($1, $2, $3, NOW(), NOW())
       ON CONFLICT (id) DO UPDATE 
       SET slug = EXCLUDED.slug, sort_order = EXCLUDED.sort_order, updated_at = NOW()`,
      [id, slug, order]
    );

    if (cat.translations) {
      for (const lang of ['ar', 'en']) {
        const t = (cat.translations as any)[lang];
        if (t) {
          await query(
            `INSERT INTO rule_translations (rule_id, language, title, description, penalty_info)
             VALUES ($1, $2, $3, $4, $5)
             ON CONFLICT (rule_id, language) DO UPDATE
             SET title = EXCLUDED.title, description = EXCLUDED.description, penalty_info = EXCLUDED.penalty_info`,
            [id, lang, t.title || '', t.description || '', t.penaltyInfo || '']
          );
        }
      }
    }

    if (Array.isArray(cat.rules)) {
      for (const item of cat.rules) {
        await query(
          `INSERT INTO rule_items (id, rule_category_id, number, translations, created_at)
           VALUES ($1, $2, $3, $4, NOW())
           ON CONFLICT (id) DO UPDATE
           SET number = EXCLUDED.number, translations = EXCLUDED.translations`,
          [item.id || `r_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`, id, item.number, JSON.stringify(item.translations)]
        );
      }
    }

    const row = (await query('SELECT * FROM rules WHERE id = $1', [id])).rows[0];
    return RulesRepository.attachCategoryDetails(row);
  }

  async deleteCategory(id: string): Promise<boolean> {
    if (!isPostgresConnected()) {
      return db.deleteRuleCategory(id);
    }
    await query('DELETE FROM rule_items WHERE rule_category_id = $1', [id]);
    await query('DELETE FROM rule_translations WHERE rule_id = $1', [id]);
    const res = await query('DELETE FROM rules WHERE id = $1', [id]);
    return (res.rowCount || 0) > 0;
  }
}

export const rulesRepository = new RulesRepository();

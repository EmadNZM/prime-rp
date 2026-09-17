import { query, isPostgresConnected } from '../postgres';
import { FAQItem } from '../../../src/types';
import { db } from '../store';

export class FAQRepository {
  private static async attachTranslations(faqRow: any): Promise<FAQItem> {
    const transRes = await query(
      'SELECT language, question, answer FROM faq_translations WHERE faq_id = $1',
      [faqRow.id]
    );

    const translations: Record<string, any> = {
      ar: { question: '', answer: '' },
      en: { question: '', answer: '' }
    };

    for (const t of transRes.rows) {
      translations[t.language] = {
        question: t.question,
        answer: t.answer
      };
    }

    return {
      id: faqRow.id,
      category: faqRow.category,
      order: faqRow.sort_order,
      translations: translations as any
    };
  }

  async getAll(): Promise<FAQItem[]> {
    if (!isPostgresConnected()) {
      return db.getFAQ();
    }
    const res = await query('SELECT * FROM faq ORDER BY sort_order ASC, created_at ASC');
    const items: FAQItem[] = [];
    for (const row of res.rows) {
      items.push(await FAQRepository.attachTranslations(row));
    }
    return items;
  }

  async save(data: Partial<FAQItem>): Promise<FAQItem> {
    if (!isPostgresConnected()) {
      return db.saveFAQ(data);
    }
    const id = data.id || `faq_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`;
    const category = data.category || 'عام';
    const sortOrder = typeof data.order === 'number' ? data.order : 0;

    await query(
      `INSERT INTO faq (id, category, sort_order, updated_at)
       VALUES ($1, $2, $3, NOW())
       ON CONFLICT (id) DO UPDATE SET
         category = EXCLUDED.category,
         sort_order = EXCLUDED.sort_order,
         updated_at = NOW()`,
      [id, category, sortOrder]
    );

    if (data.translations) {
      for (const [lang, t] of Object.entries(data.translations)) {
        if (t && (t.question || t.answer)) {
          await query(
            `INSERT INTO faq_translations (faq_id, language, question, answer)
             VALUES ($1, $2, $3, $4)
             ON CONFLICT (faq_id, language) DO UPDATE SET
               question = EXCLUDED.question,
               answer = EXCLUDED.answer`,
            [id, lang, t.question || '', t.answer || '']
          );
        }
      }
    }

    const rowRes = await query('SELECT * FROM faq WHERE id = $1', [id]);
    return FAQRepository.attachTranslations(rowRes.rows[0]);
  }

  async delete(id: string): Promise<boolean> {
    if (!isPostgresConnected()) {
      return db.deleteFAQ(id);
    }
    const res = await query('DELETE FROM faq WHERE id = $1', [id]);
    return (res.rowCount || 0) > 0;
  }
}

export const faqRepository = new FAQRepository();

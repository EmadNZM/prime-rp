import { query } from '../postgres';
import { FAQItem } from '../../../src/types';

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
    const res = await query('SELECT * FROM faq ORDER BY sort_order ASC, created_at ASC');
    const items: FAQItem[] = [];
    for (const row of res.rows) {
      items.push(await FAQRepository.attachTranslations(row));
    }
    return items;
  }
}

export const faqRepository = new FAQRepository();

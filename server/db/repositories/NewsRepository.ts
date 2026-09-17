import { query, isPostgresConnected } from '../postgres';
import { NewsItem } from '../../../src/types';
import { db } from '../store';

export class NewsRepository {
  private static async attachTranslations(newsRow: any): Promise<NewsItem> {
    const transRes = await query(
      'SELECT language, title, excerpt, content, seo_title, seo_description FROM news_translations WHERE news_id = $1',
      [newsRow.id]
    );

    const translations: Record<string, any> = {
      ar: { title: '', excerpt: '', content: '' },
      en: { title: '', excerpt: '', content: '' }
    };

    for (const t of transRes.rows) {
      translations[t.language] = {
        title: t.title,
        excerpt: t.excerpt,
        content: t.content,
        seoTitle: t.seo_title || undefined,
        seoDescription: t.seo_description || undefined
      };
    }

    return {
      id: newsRow.id,
      slug: newsRow.slug,
      status: newsRow.status,
      featured: Boolean(newsRow.featured),
      image: newsRow.image,
      category: newsRow.category,
      authorId: newsRow.author_id,
      authorName: newsRow.author_name,
      createdAt: new Date(newsRow.created_at).toISOString(),
      updatedAt: new Date(newsRow.updated_at).toISOString(),
      translations: translations as any
    };
  }

  async getAll(onlyPublished: boolean = true): Promise<NewsItem[]> {
    if (!isPostgresConnected()) {
      return db.getNews(onlyPublished);
    }
    let sql = 'SELECT * FROM news';
    const params: any[] = [];
    if (onlyPublished) {
      sql += ' WHERE status = $1';
      params.push('PUBLISHED');
    }
    sql += ' ORDER BY featured DESC, created_at DESC';

    const res = await query(sql, params);
    const results: NewsItem[] = [];
    for (const row of res.rows) {
      results.push(await NewsRepository.attachTranslations(row));
    }
    return results;
  }

  async getBySlug(slug: string): Promise<NewsItem | null> {
    if (!isPostgresConnected()) {
      return db.getNewsBySlug(slug) || null;
    }
    const res = await query('SELECT * FROM news WHERE slug = $1', [slug]);
    if (res.rows.length === 0) return null;
    return NewsRepository.attachTranslations(res.rows[0]);
  }

  async getById(id: string): Promise<NewsItem | null> {
    if (!isPostgresConnected()) {
      return db.getNews(false).find(n => n.id === id) || null;
    }
    const res = await query('SELECT * FROM news WHERE id = $1', [id]);
    if (res.rows.length === 0) return null;
    return NewsRepository.attachTranslations(res.rows[0]);
  }

  async save(item: Partial<NewsItem> & { slug: string; translations: any }): Promise<NewsItem> {
    if (!isPostgresConnected()) {
      return db.saveNews(item);
    }
    const id = item.id || `news_${Date.now()}`;
    const slug = item.slug;
    const status = item.status || 'PUBLISHED';
    const featured = Boolean(item.featured);
    const image = item.image || '';
    const category = item.category || 'أخبار';
    const authorId = item.authorId || null;
    const authorName = item.authorName || 'Prime RP';

    const res = await query(
      `INSERT INTO news (id, slug, status, featured, image, category, author_id, author_name, created_at, updated_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW(), NOW())
       ON CONFLICT (id) DO UPDATE 
       SET slug = EXCLUDED.slug, status = EXCLUDED.status, featured = EXCLUDED.featured,
           image = EXCLUDED.image, category = EXCLUDED.category, author_id = EXCLUDED.author_id,
           author_name = EXCLUDED.author_name, updated_at = NOW()
       RETURNING *`,
      [id, slug, status, featured, image, category, authorId, authorName]
    );

    const savedRow = res.rows[0];

    // Save translations
    if (item.translations) {
      for (const lang of ['ar', 'en']) {
        const t = item.translations[lang];
        if (t) {
          await query(
            `INSERT INTO news_translations (news_id, language, title, excerpt, content, seo_title, seo_description)
             VALUES ($1, $2, $3, $4, $5, $6, $7)
             ON CONFLICT (news_id, language) DO UPDATE
             SET title = EXCLUDED.title, excerpt = EXCLUDED.excerpt, content = EXCLUDED.content,
                 seo_title = EXCLUDED.seo_title, seo_description = EXCLUDED.seo_description`,
            [id, lang, t.title || '', t.excerpt || '', t.content || '', t.seoTitle || null, t.seoDescription || null]
          );
        }
      }
    }

    return NewsRepository.attachTranslations(savedRow);
  }

  async delete(id: string): Promise<boolean> {
    if (!isPostgresConnected()) {
      return db.deleteNews(id);
    }
    const res = await query('DELETE FROM news WHERE id = $1', [id]);
    return (res.rowCount ?? 0) > 0;
  }
}

export const newsRepository = new NewsRepository();

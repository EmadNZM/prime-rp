import { query, isPostgresConnected } from '../postgres';
import { ProductItem } from '../../../src/types';
import { db } from '../store';

export class ProductRepository {
  private static async attachTranslations(prodRow: any): Promise<ProductItem> {
    const transRes = await query(
      'SELECT language, name, description, perks FROM product_translations WHERE product_id = $1',
      [prodRow.id]
    );

    const translations: Record<string, any> = {
      ar: { name: '', description: '', perks: [] },
      en: { name: '', description: '', perks: [] }
    };

    for (const t of transRes.rows) {
      translations[t.language] = {
        name: t.name,
        description: t.description,
        perks: Array.isArray(t.perks) ? t.perks : []
      };
    }

    return {
      id: prodRow.id,
      slug: prodRow.slug,
      category: prodRow.category,
      price: parseFloat(prodRow.price),
      currency: prodRow.currency,
      image: prodRow.image,
      stock: prodRow.stock,
      status: prodRow.status,
      featured: Boolean(prodRow.featured),
      translations: translations as any
    };
  }

  async getAll(includeHidden: boolean = false): Promise<ProductItem[]> {
    if (!isPostgresConnected()) {
      return includeHidden ? db.getProducts() : db.getProducts().filter(p => p.status !== 'HIDDEN');
    }
    let sql = 'SELECT * FROM products';
    const params: any[] = [];
    if (!includeHidden) {
      sql += ' WHERE status != $1';
      params.push('HIDDEN');
    }
    sql += ' ORDER BY featured DESC, price DESC';

    const res = await query(sql, params);
    const products: ProductItem[] = [];
    for (const row of res.rows) {
      products.push(await ProductRepository.attachTranslations(row));
    }
    return products;
  }

  async getById(id: string): Promise<ProductItem | null> {
    if (!isPostgresConnected()) {
      return db.getProducts().find(p => p.id === id) || null;
    }
    const res = await query('SELECT * FROM products WHERE id = $1', [id]);
    if (res.rows.length === 0) return null;
    return ProductRepository.attachTranslations(res.rows[0]);
  }

  async getBySlug(slug: string): Promise<ProductItem | null> {
    if (!isPostgresConnected()) {
      return db.getProducts().find(p => p.slug === slug) || null;
    }
    const res = await query('SELECT * FROM products WHERE slug = $1', [slug]);
    if (res.rows.length === 0) return null;
    return ProductRepository.attachTranslations(res.rows[0]);
  }

  async save(product: Partial<ProductItem>): Promise<ProductItem> {
    if (!isPostgresConnected()) {
      return db.saveProduct(product as any);
    }
    const id = product.id || `prod_${Date.now()}`;
    const slug = product.slug || `item-${Date.now()}`;
    const category = product.category || 'VIP';
    const price = product.price ?? 0;
    const currency = product.currency || 'SAR';
    const image = product.image || '';
    const stock = product.stock ?? 100;
    const status = product.status || 'ACTIVE';
    const featured = Boolean(product.featured);

    await query(
      `INSERT INTO products (id, slug, category, price, currency, image, stock, status, featured, created_at, updated_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, NOW(), NOW())
       ON CONFLICT (id) DO UPDATE
       SET slug = EXCLUDED.slug, category = EXCLUDED.category, price = EXCLUDED.price,
           currency = EXCLUDED.currency, image = EXCLUDED.image, stock = EXCLUDED.stock,
           status = EXCLUDED.status, featured = EXCLUDED.featured, updated_at = NOW()`,
      [id, slug, category, price, currency, image, stock, status, featured]
    );

    if (product.translations) {
      for (const lang of ['ar', 'en']) {
        const t = (product.translations as any)[lang];
        if (t) {
          await query(
            `INSERT INTO product_translations (product_id, language, name, description, perks)
             VALUES ($1, $2, $3, $4, $5)
             ON CONFLICT (product_id, language) DO UPDATE
             SET name = EXCLUDED.name, description = EXCLUDED.description, perks = EXCLUDED.perks`,
            [id, lang, t.name || '', t.description || '', t.perks || []]
          );
        }
      }
    }

    const row = (await query('SELECT * FROM products WHERE id = $1', [id])).rows[0];
    return ProductRepository.attachTranslations(row);
  }
}

export const productRepository = new ProductRepository();

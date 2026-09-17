import { query } from '../postgres';
import { OrderItem } from '../../../src/types';
import { productRepository } from './ProductRepository';

export class OrderRepository {
  private static mapRowToOrder(row: any): OrderItem {
    return {
      id: row.id,
      orderNumber: row.order_number,
      userId: row.user_id,
      productId: row.product_id,
      productName: row.product_name,
      price: parseFloat(row.price),
      currency: row.currency,
      status: row.status,
      createdAt: new Date(row.created_at).toISOString()
    };
  }

  async getAll(userId?: string): Promise<OrderItem[]> {
    let sql = 'SELECT * FROM orders';
    const params: any[] = [];
    if (userId) {
      sql += ' WHERE user_id = $1';
      params.push(userId);
    }
    sql += ' ORDER BY created_at DESC';

    const res = await query(sql, params);
    return res.rows.map(OrderRepository.mapRowToOrder);
  }

  async getById(id: string): Promise<OrderItem | null> {
    const res = await query('SELECT * FROM orders WHERE id = $1', [id]);
    if (res.rows.length === 0) return null;
    return OrderRepository.mapRowToOrder(res.rows[0]);
  }

  async create(userId: string, productId: string): Promise<OrderItem | null> {
    const product = await productRepository.getById(productId);
    if (!product) return null;

    const id = `ord_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`;
    const orderNumber = `PRIME-${Math.floor(100000 + Math.random() * 900000)}`;
    const productName = product.translations.ar?.name || product.translations.en?.name || 'منتج Prime RP';

    const res = await query(
      `INSERT INTO orders (id, order_number, user_id, product_id, product_name, price, currency, status, created_at, updated_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW(), NOW())
       RETURNING *`,
      [id, orderNumber, userId, product.id, productName, product.price, product.currency, 'COMPLETED']
    );

    await query(
      `INSERT INTO order_items (id, order_id, product_id, quantity, unit_price, created_at)
       VALUES ($1, $2, $3, $4, $5, NOW())`,
      [`item_${id}`, id, product.id, 1, product.price]
    );

    return OrderRepository.mapRowToOrder(res.rows[0]);
  }
}

export const orderRepository = new OrderRepository();

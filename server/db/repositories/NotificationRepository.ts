import { query } from '../postgres';
import { NotificationItem } from '../../../src/types';

export class NotificationRepository {
  private static mapRowToNotification(row: any): NotificationItem {
    return {
      id: row.id,
      userId: row.user_id,
      type: row.type,
      title: row.title,
      message: row.message,
      link: row.link || undefined,
      read: Boolean(row.is_read),
      createdAt: new Date(row.created_at).toISOString()
    };
  }

  async getByUserId(userId: string): Promise<NotificationItem[]> {
    const res = await query(
      'SELECT * FROM notifications WHERE user_id = $1 ORDER BY created_at DESC',
      [userId]
    );
    return res.rows.map(NotificationRepository.mapRowToNotification);
  }

  async create(notif: {
    userId: string;
    type?: string;
    title: string;
    message: string;
    link?: string;
  }): Promise<NotificationItem> {
    const id = `notif_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`;
    const res = await query(
      `INSERT INTO notifications (id, user_id, type, title, message, link, is_read, created_at)
       VALUES ($1, $2, $3, $4, $5, $6, FALSE, NOW())
       RETURNING *`,
      [id, notif.userId, notif.type || 'SYSTEM', notif.title, notif.message, notif.link || null]
    );
    return NotificationRepository.mapRowToNotification(res.rows[0]);
  }

  async markAsRead(id: string): Promise<boolean> {
    const res = await query('UPDATE notifications SET is_read = TRUE WHERE id = $1', [id]);
    return (res.rowCount ?? 0) > 0;
  }
}

export const notificationRepository = new NotificationRepository();

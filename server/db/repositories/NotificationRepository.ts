import crypto from 'crypto';
import { query, isPostgresConnected } from '../postgres';
import { NotificationItem } from '../../../src/types';
import { db } from '../store';

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
    if (!isPostgresConnected()) {
      return db.getNotifications(userId);
    }
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
    if (!isPostgresConnected()) {
      return db.createNotification({
        userId: notif.userId,
        type: (notif.type as any) || 'SYSTEM',
        title: notif.title,
        message: notif.message,
        link: notif.link
      });
    }
    const id = `notif_${Date.now()}_${crypto.randomBytes(4).toString('hex')}`;
    const res = await query(
      `INSERT INTO notifications (id, user_id, type, title, message, link, is_read, created_at)
       VALUES ($1, $2, $3, $4, $5, $6, FALSE, NOW())
       RETURNING *`,
      [id, notif.userId, notif.type || 'SYSTEM', notif.title, notif.message, notif.link || null]
    );
    return NotificationRepository.mapRowToNotification(res.rows[0]);
  }

  async markAsRead(id: string, userId?: string): Promise<boolean> {
    if (!isPostgresConnected()) {
      return db.markNotificationAsRead(id, userId);
    }
    const sql = userId
      ? 'UPDATE notifications SET is_read = TRUE WHERE id = $1 AND user_id = $2'
      : 'UPDATE notifications SET is_read = TRUE WHERE id = $1';
    const params = userId ? [id, userId] : [id];
    const res = await query(sql, params);
    return (res.rowCount ?? 0) > 0;
  }
}

export const notificationRepository = new NotificationRepository();

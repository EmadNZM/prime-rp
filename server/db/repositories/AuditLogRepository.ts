import crypto from 'crypto';
import { query, isPostgresConnected } from '../postgres';
import { AuditLogItem } from '../../../src/types';
import { db } from '../store';

export class AuditLogRepository {
  private static mapRowToAuditLog(row: any): AuditLogItem {
    return {
      id: row.id,
      adminId: row.admin_id,
      adminName: row.admin_name,
      action: row.action,
      entity: row.entity,
      entityId: row.entity_id,
      metadata: row.metadata || undefined,
      ip: row.ip,
      createdAt: new Date(row.created_at).toISOString()
    };
  }

  async getRecent(limit: number = 50): Promise<AuditLogItem[]> {
    if (!isPostgresConnected()) {
      return db.getAuditLogs(limit);
    }
    const res = await query('SELECT * FROM audit_logs ORDER BY created_at DESC LIMIT $1', [limit]);
    return res.rows.map(AuditLogRepository.mapRowToAuditLog);
  }

  async log(entry: {
    adminId: string;
    adminName: string;
    action: string;
    entity: string;
    entityId: string;
    metadata?: string;
    ip?: string;
  }): Promise<AuditLogItem> {
    if (!isPostgresConnected()) {
      return db.logAudit({
        adminId: entry.adminId,
        adminName: entry.adminName,
        action: entry.action,
        entity: entry.entity,
        entityId: entry.entityId,
        metadata: entry.metadata,
        ip: entry.ip || '127.0.0.1'
      });
    }
    const id = `log_${Date.now()}_${crypto.randomBytes(4).toString('hex')}`;
    const res = await query(
      `INSERT INTO audit_logs (id, admin_id, admin_name, action, entity, entity_id, metadata, ip, created_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW())
       RETURNING *`,
      [
        id,
        entry.adminId,
        entry.adminName,
        entry.action,
        entry.entity,
        entry.entityId,
        entry.metadata || '',
        entry.ip || '127.0.0.1'
      ]
    );
    return AuditLogRepository.mapRowToAuditLog(res.rows[0]);
  }
}

export const auditLogRepository = new AuditLogRepository();

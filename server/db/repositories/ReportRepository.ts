import { query } from '../postgres';
import { ReportItem, ReportCategory, ReportStatus } from '../../../src/types';

export class ReportRepository {
  private static mapRowToReport(row: any): ReportItem {
    return {
      id: row.id,
      reporterId: row.reporter_id,
      reporterName: row.reporter_name || undefined,
      reporterAvatar: row.reporter_avatar || undefined,
      targetId: row.target_id || undefined,
      targetName: row.target_name || undefined,
      category: row.category as ReportCategory,
      reason: row.reason,
      status: (row.status || 'OPEN') as ReportStatus,
      notes: row.notes || undefined,
      createdAt: new Date(row.created_at).toISOString(),
      updatedAt: new Date(row.updated_at).toISOString()
    };
  }

  async getAll(reporterId?: string): Promise<ReportItem[]> {
    let sql = 'SELECT * FROM reports';
    const params: any[] = [];
    if (reporterId) {
      sql += ' WHERE reporter_id = $1';
      params.push(reporterId);
    }
    sql += ' ORDER BY created_at DESC';

    const res = await query(sql, params);
    return res.rows.map(ReportRepository.mapRowToReport);
  }

  async getById(id: string): Promise<ReportItem | null> {
    const res = await query('SELECT * FROM reports WHERE id = $1', [id]);
    if (res.rows.length === 0) return null;
    return ReportRepository.mapRowToReport(res.rows[0]);
  }

  async create(data: {
    reporterId: string;
    reporterName?: string;
    reporterAvatar?: string;
    targetId?: string;
    targetName?: string;
    category: ReportCategory;
    reason: string;
  }): Promise<ReportItem> {
    const id = `rep_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    const res = await query(
      `INSERT INTO reports (id, reporter_id, reporter_name, reporter_avatar, target_id, target_name, category, reason, status, created_at, updated_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, 'OPEN', NOW(), NOW())
       RETURNING *`,
      [
        id,
        data.reporterId,
        data.reporterName || null,
        data.reporterAvatar || null,
        data.targetId || null,
        data.targetName || null,
        data.category,
        data.reason
      ]
    );

    return ReportRepository.mapRowToReport(res.rows[0]);
  }

  async updateStatus(id: string, status: ReportStatus, notes?: string): Promise<ReportItem | null> {
    const res = await query(
      `UPDATE reports 
       SET status = $1, notes = COALESCE($2, notes), updated_at = NOW() 
       WHERE id = $3 
       RETURNING *`,
      [status, notes || null, id]
    );

    if (res.rows.length === 0) return null;
    return ReportRepository.mapRowToReport(res.rows[0]);
  }
}

export const reportRepository = new ReportRepository();

import crypto from 'crypto';
import { query, isPostgresConnected } from '../postgres';
import { JobApplication, JobApplicationStatus } from '../../../src/types';
import { db } from '../store';

export class JobApplicationRepository {
  private static mapRowToApplication(row: any): JobApplication {
    return {
      id: row.id,
      jobId: row.job_id,
      userId: row.user_id,
      status: row.status as JobApplicationStatus,
      characterName: row.character_name,
      characterAge: parseInt(row.character_age, 10) || 0,
      experience: row.experience,
      dailyAvailability: row.daily_availability,
      answers: typeof row.answers === 'string' ? JSON.parse(row.answers) : (row.answers || {}),
      reviewerId: row.reviewer_id || undefined,
      reviewerName: row.reviewer_name || undefined,
      reviewNotes: row.review_notes || undefined,
      createdAt: new Date(row.created_at).toISOString(),
      updatedAt: new Date(row.updated_at).toISOString(),
      jobTitle: row.job_title || undefined,
      jobCategory: row.job_category || undefined,
      applicantUsername: row.applicant_username || undefined,
      applicantDiscordId: row.applicant_discord_id || undefined,
      applicantAvatar: row.applicant_avatar || undefined
    };
  }

  async create(data: {
    jobId: string;
    userId: string;
    characterName: string;
    characterAge: number;
    experience: string;
    dailyAvailability: string;
    answers?: Record<string, any>;
  }): Promise<JobApplication> {
    const id = `app_${Date.now()}_${crypto.randomBytes(4).toString('hex')}`;
    const answers = data.answers || {};

    if (!isPostgresConnected()) {
      return db.createJobApplication({
        id,
        ...data,
        answers,
        status: 'PENDING',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });
    }

    const sql = `
      INSERT INTO job_applications (
        id, job_id, user_id, status, character_name, character_age,
        experience, daily_availability, answers, created_at, updated_at
      ) VALUES ($1, $2, $3, 'PENDING', $4, $5, $6, $7, $8, NOW(), NOW())
      RETURNING *
    `;

    const res = await query(sql, [
      id,
      data.jobId,
      data.userId,
      data.characterName,
      data.characterAge,
      data.experience,
      data.dailyAvailability,
      JSON.stringify(answers)
    ]);

    return JobApplicationRepository.mapRowToApplication(res.rows[0]);
  }

  async getById(id: string): Promise<JobApplication | null> {
    if (!isPostgresConnected()) {
      return db.getJobApplicationById(id);
    }

    const sql = `
      SELECT 
        ja.*,
        COALESCE(jt.name, j.slug) AS job_title,
        j.category AS job_category,
        u.username AS applicant_username,
        u.discord_id AS applicant_discord_id,
        u.avatar AS applicant_avatar,
        ru.username AS reviewer_name
      FROM job_applications ja
      LEFT JOIN jobs j ON j.id = ja.job_id
      LEFT JOIN job_translations jt ON jt.job_id = ja.job_id AND jt.language = 'ar'
      LEFT JOIN users u ON u.id = ja.user_id
      LEFT JOIN users ru ON ru.id = ja.reviewer_id
      WHERE ja.id = $1
    `;

    const res = await query(sql, [id]);
    if (res.rows.length === 0) return null;
    return JobApplicationRepository.mapRowToApplication(res.rows[0]);
  }

  async getByUserId(userId: string): Promise<JobApplication[]> {
    if (!isPostgresConnected()) {
      return db.getJobApplicationsByUserId(userId);
    }

    const sql = `
      SELECT 
        ja.*,
        COALESCE(jt.name, j.slug) AS job_title,
        j.category AS job_category,
        u.username AS applicant_username,
        u.discord_id AS applicant_discord_id,
        u.avatar AS applicant_avatar
      FROM job_applications ja
      LEFT JOIN jobs j ON j.id = ja.job_id
      LEFT JOIN job_translations jt ON jt.job_id = ja.job_id AND jt.language = 'ar'
      LEFT JOIN users u ON u.id = ja.user_id
      WHERE ja.user_id = $1
      ORDER BY ja.created_at DESC
    `;

    const res = await query(sql, [userId]);
    return res.rows.map(JobApplicationRepository.mapRowToApplication);
  }

  async getByJobAndUser(jobId: string, userId: string): Promise<JobApplication | null> {
    if (!isPostgresConnected()) {
      return db.getJobApplicationByJobAndUser(jobId, userId);
    }

    const sql = `
      SELECT 
        ja.*,
        COALESCE(jt.name, j.slug) AS job_title,
        j.category AS job_category
      FROM job_applications ja
      LEFT JOIN jobs j ON j.id = ja.job_id
      LEFT JOIN job_translations jt ON jt.job_id = ja.job_id AND jt.language = 'ar'
      WHERE ja.job_id = $1 AND ja.user_id = $2
      ORDER BY ja.created_at DESC
      LIMIT 1
    `;

    const res = await query(sql, [jobId, userId]);
    if (res.rows.length === 0) return null;
    return JobApplicationRepository.mapRowToApplication(res.rows[0]);
  }

  async getAll(filters?: { status?: string; jobId?: string }): Promise<JobApplication[]> {
    if (!isPostgresConnected()) {
      return db.getAllJobApplications(filters);
    }

    let sql = `
      SELECT 
        ja.*,
        COALESCE(jt.name, j.slug) AS job_title,
        j.category AS job_category,
        u.username AS applicant_username,
        u.discord_id AS applicant_discord_id,
        u.avatar AS applicant_avatar,
        ru.username AS reviewer_name
      FROM job_applications ja
      LEFT JOIN jobs j ON j.id = ja.job_id
      LEFT JOIN job_translations jt ON jt.job_id = ja.job_id AND jt.language = 'ar'
      LEFT JOIN users u ON u.id = ja.user_id
      LEFT JOIN users ru ON ru.id = ja.reviewer_id
      WHERE 1=1
    `;

    const params: any[] = [];
    if (filters?.status) {
      params.push(filters.status);
      sql += ` AND ja.status = $${params.length}`;
    }
    if (filters?.jobId) {
      params.push(filters.jobId);
      sql += ` AND ja.job_id = $${params.length}`;
    }

    sql += ' ORDER BY ja.created_at DESC';

    const res = await query(sql, params);
    return res.rows.map(JobApplicationRepository.mapRowToApplication);
  }

  async updateStatus(
    id: string,
    status: JobApplicationStatus,
    reviewerId: string,
    reviewNotes?: string
  ): Promise<JobApplication | null> {
    if (!isPostgresConnected()) {
      return db.updateJobApplicationStatus(id, status, reviewerId, reviewNotes);
    }

    const sql = `
      UPDATE job_applications
      SET 
        status = $1,
        reviewer_id = $2,
        review_notes = COALESCE($3, review_notes),
        updated_at = NOW()
      WHERE id = $4
      RETURNING *
    `;

    const res = await query(sql, [status, reviewerId, reviewNotes || null, id]);
    if (res.rows.length === 0) return null;
    return this.getById(id);
  }
}

export const jobApplicationRepository = new JobApplicationRepository();

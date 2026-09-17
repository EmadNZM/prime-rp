import { query, isPostgresConnected } from '../postgres';
import { JobItem } from '../../../src/types';
import { db } from '../store';

export class JobsRepository {
  private static async attachTranslations(jobRow: any): Promise<JobItem> {
    const transRes = await query(
      'SELECT language, name, description, requirements, duties FROM job_translations WHERE job_id = $1',
      [jobRow.id]
    );

    const translations: Record<string, any> = {
      ar: { name: '', description: '', requirements: [], duties: [] },
      en: { name: '', description: '', requirements: [], duties: [] }
    };

    for (const t of transRes.rows) {
      translations[t.language] = {
        name: t.name,
        description: t.description,
        requirements: Array.isArray(t.requirements) ? t.requirements : [],
        duties: Array.isArray(t.duties) ? t.duties : []
      };
    }

    return {
      id: jobRow.id,
      slug: jobRow.slug,
      category: jobRow.category,
      image: jobRow.image,
      salaryMin: jobRow.salary_min,
      salaryMax: jobRow.salary_max,
      status: jobRow.status,
      translations: translations as any
    };
  }

  async getAll(): Promise<JobItem[]> {
    if (!isPostgresConnected()) {
      return db.getJobs();
    }
    const res = await query('SELECT * FROM jobs ORDER BY category ASC, created_at ASC');
    const jobs: JobItem[] = [];
    for (const row of res.rows) {
      jobs.push(await JobsRepository.attachTranslations(row));
    }
    return jobs;
  }

  async getBySlug(slug: string): Promise<JobItem | null> {
    if (!isPostgresConnected()) {
      return db.getJobs().find(j => j.slug === slug) || null;
    }
    const res = await query('SELECT * FROM jobs WHERE slug = $1', [slug]);
    if (res.rows.length === 0) return null;
    return JobsRepository.attachTranslations(res.rows[0]);
  }

  async save(job: Partial<JobItem>): Promise<JobItem> {
    if (!isPostgresConnected()) {
      return db.saveJob(job as any);
    }
    const id = job.id || `job_${Date.now()}`;
    const slug = job.slug || `job-${Date.now()}`;
    const category = job.category || 'CIVILIAN';
    const image = job.image || '';
    const salaryMin = job.salaryMin || 0;
    const salaryMax = job.salaryMax || 0;
    const status = job.status || 'HIRING_OPEN';

    await query(
      `INSERT INTO jobs (id, slug, category, image, salary_min, salary_max, status, created_at, updated_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, NOW(), NOW())
       ON CONFLICT (id) DO UPDATE
       SET slug = EXCLUDED.slug, category = EXCLUDED.category, image = EXCLUDED.image,
           salary_min = EXCLUDED.salary_min, salary_max = EXCLUDED.salary_max,
           status = EXCLUDED.status, updated_at = NOW()`,
      [id, slug, category, image, salaryMin, salaryMax, status]
    );

    if (job.translations) {
      for (const lang of ['ar', 'en']) {
        const t = (job.translations as any)[lang];
        if (t) {
          await query(
            `INSERT INTO job_translations (job_id, language, name, description, requirements, duties)
             VALUES ($1, $2, $3, $4, $5, $6)
             ON CONFLICT (job_id, language) DO UPDATE
             SET name = EXCLUDED.name, description = EXCLUDED.description,
                 requirements = EXCLUDED.requirements, duties = EXCLUDED.duties`,
            [id, lang, t.name || '', t.description || '', t.requirements || [], t.duties || []]
          );
        }
      }
    }

    const row = (await query('SELECT * FROM jobs WHERE id = $1', [id])).rows[0];
    return JobsRepository.attachTranslations(row);
  }

  async delete(id: string): Promise<boolean> {
    if (!isPostgresConnected()) {
      return db.deleteJob(id);
    }
    await query('DELETE FROM job_translations WHERE job_id = $1', [id]);
    const res = await query('DELETE FROM jobs WHERE id = $1', [id]);
    return (res.rowCount || 0) > 0;
  }
}

export const jobsRepository = new JobsRepository();

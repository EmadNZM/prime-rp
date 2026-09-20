import { Request, Response, NextFunction } from 'express';
import { z, ZodSchema } from 'zod';
import { sendError } from '../utils/response';
import { UserRole, UserStatus, TicketStatus, JobApplicationStatus } from '../../src/types';

/**
 * Middleware factory for validating express request bodies with Zod
 */
export function validateBody<T>(schema: ZodSchema<T>) {
  return (req: Request, res: Response, next: NextFunction) => {
    const result = schema.safeParse(req.body);
    if (!result.success) {
      const firstError = result.error.issues[0];
      const fieldPath = firstError.path.join('.');
      const errorMessage = fieldPath
        ? `${fieldPath}: ${firstError.message}`
        : firstError.message;

      return sendError(
        res,
        400,
        'VALIDATION_ERROR',
        `بيانات الإدخال غير صالحة (${errorMessage})`,
        result.error.issues
      );
    }
    req.body = result.data;
    next();
  };
}

/**
 * Middleware factory for validating express route query parameters
 */
export function validateQuery<T>(schema: ZodSchema<T>) {
  return (req: Request, res: Response, next: NextFunction) => {
    const result = schema.safeParse(req.query);
    if (!result.success) {
      const firstError = result.error.issues[0];
      return sendError(
        res,
        400,
        'QUERY_VALIDATION_ERROR',
        `معاملات البحث غير صالحة (${firstError.message})`,
        result.error.issues
      );
    }
    next();
  };
}

// ----------------- ZOD SCHEMAS -----------------

export const ticketCreateSchema = z.object({
  subject: z.string().trim().min(3, 'العنوان يجب أن لا يقل عن 3 أحرف').max(150, 'العنوان طويل جداً'),
  category: z.string().trim().min(2, 'القسم مطلوب').max(50),
  message: z.string().trim().min(5, 'الرسالة يجب أن لا تقل عن 5 أحرف').max(4000, 'الرسالة تتجاوز الحد المسموح'),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'URGENT']).optional().default('MEDIUM')
});

export const ticketReplySchema = z.object({
  message: z.string().trim().min(1, 'الرسالة لا يمكن أن تكون فارغة').max(4000, 'الرسالة تتجاوز الحد المسموح')
});

export const ticketStatusSchema = z.object({
  status: z.enum(['OPEN', 'IN_PROGRESS', 'WAITING', 'RESOLVED', 'CLOSED'])
});

export const reportCreateSchema = z.object({
  category: z.string().trim().min(2, 'نوع البلاغ مطلوب').max(50),
  reason: z.string().trim().min(5, 'يرجى تقديم تفاصيل واضحة للبلاغ (5 أحرف على الأقل)').max(3000),
  targetId: z.string().trim().max(100).optional().default(''),
  targetName: z.string().trim().max(100).optional().default('')
});

export const reportStatusSchema = z.object({
  status: z.enum(['OPEN', 'IN_REVIEW', 'RESOLVED', 'DISMISSED']),
  notes: z.string().trim().max(1000).optional().default('')
});

export const jobApplicationCreateSchema = z.object({
  characterName: z.string().trim().min(2, 'اسم الشخصية مطلوب').max(100),
  characterAge: z.coerce.number().int().min(16, 'العمر يجب أن يكون 16 سنة على الأقل').max(99, 'عمر غير صالح'),
  experience: z.string().trim().min(10, 'يرجى كتابة خبراتك السابقة بالتفصيل (10 أحرف على الأقل)').max(3000),
  dailyAvailability: z.string().trim().min(2, 'التواجد اليومي مطلوب').max(100),
  answers: z.record(z.string(), z.any()).optional().default({})
});

export const jobApplicationStatusSchema = z.object({
  status: z.enum(['PENDING', 'UNDER_REVIEW', 'ACCEPTED', 'REJECTED']),
  reviewNotes: z.string().trim().max(1000).optional()
});

export const checkoutCreateSchema = z.object({
  productId: z.string().trim().min(1, 'معرف المنتج مطلوب')
});

export const orderStatusUpdateSchema = z.object({
  status: z.enum(['PENDING', 'COMPLETED', 'CANCELLED', 'REFUNDED'])
});

export const userRoleUpdateSchema = z.object({
  role: z.nativeEnum(UserRole).refine((r) => r !== UserRole.OWNER, {
    message: 'لا يمكن تعيين رتبة المالك برمجياً'
  }),
  reason: z.string().trim().max(255).optional()
});

export const userStatusUpdateSchema = z.object({
  status: z.nativeEnum(UserStatus),
  reason: z.string().trim().max(255).optional()
});

export const leaderboardEntrySchema = z.object({
  id: z.string().optional(),
  category: z.enum(['playtime', 'wealth', 'law', 'wanted']),
  name: z.string().trim().min(2).max(100),
  metric: z.string().trim().optional().default(''),
  subtitle: z.string().trim().optional().default(''),
  score: z.coerce.number().optional(),
  formattedScore: z.string().optional(),
  rank: z.coerce.number().int().min(1).optional(),
  badge: z.string().trim().max(50).optional()
});

export const fivemBridgeSyncSchema = z.object({
  serverName: z.string().trim().max(200).optional(),
  activePlayers: z.coerce.number().int().min(0),
  maxPlayers: z.coerce.number().int().min(1),
  players: z.array(
    z.object({
      id: z.coerce.number().int(),
      name: z.string(),
      ping: z.coerce.number().int().optional().default(0),
      identifiers: z.array(z.string()).optional().default([]),
      citizenId: z.string().optional(),
      job: z.string().optional(),
      grade: z.string().optional(),
      playtimeHours: z.coerce.number().optional()
    })
  ).optional().default([]),
  leaderboard: z.array(leaderboardEntrySchema).optional()
});

import { Request, Response, NextFunction } from 'express';
import { sendError } from '../utils/response';

interface RateLimitRecord {
  count: number;
  resetTime: number;
}

interface RateLimitOptions {
  windowMs: number;
  max: number;
  message?: string;
  code?: string;
}

class MemoryRateLimiter {
  private hits = new Map<string, RateLimitRecord>();
  private cleanupInterval: NodeJS.Timeout;

  constructor() {
    // Periodically prune expired rate limit keys every 2 minutes
    this.cleanupInterval = setInterval(() => {
      const now = Date.now();
      for (const [key, record] of this.hits.entries()) {
        if (record.resetTime <= now) {
          this.hits.delete(key);
        }
      }
    }, 2 * 60 * 1000);

    // Prevent interval from keeping the process alive in tests
    if (this.cleanupInterval.unref) {
      this.cleanupInterval.unref();
    }
  }

  public createMiddleware(options: RateLimitOptions) {
    const {
      windowMs,
      max,
      message = 'لقد تجاوزت الحد المسموح من الطلبات. يرجى الانتظار قليلاً والمحاولة مجدداً.',
      code = 'RATE_LIMIT_EXCEEDED'
    } = options;

    return (req: Request, res: Response, next: NextFunction) => {
      // Allow internal or test executions if disabled
      if (process.env.DISABLE_RATE_LIMIT === 'true') {
        return next();
      }

      // Key based on authenticated user ID or client IP
      const clientIp = (
        req.headers['x-forwarded-for']?.toString().split(',')[0].trim() ||
        req.socket.remoteAddress ||
        'unknown'
      );
      const identifier = req.user?.id ? `user:${req.user.id}` : `ip:${clientIp}`;
      const routeKey = `${req.baseUrl}${req.path}`;
      const storageKey = `${identifier}:${routeKey}`;

      const now = Date.now();
      let record = this.hits.get(storageKey);

      if (!record || record.resetTime <= now) {
        record = {
          count: 1,
          resetTime: now + windowMs
        };
        this.hits.set(storageKey, record);
      } else {
        record.count++;
      }

      const remaining = Math.max(0, max - record.count);
      const retryAfterSeconds = Math.ceil((record.resetTime - now) / 1000);

      res.setHeader('X-RateLimit-Limit', max);
      res.setHeader('X-RateLimit-Remaining', remaining);
      res.setHeader('X-RateLimit-Reset', Math.ceil(record.resetTime / 1000));

      if (record.count > max) {
        res.setHeader('Retry-After', retryAfterSeconds);
        return sendError(res, 429, code, `${message} (انتظر ${retryAfterSeconds} ثانية)`);
      }

      next();
    };
  }
}

const rateLimiterInstance = new MemoryRateLimiter();

// 1. Auth limiter (Discord OAuth login, callbacks, token endpoints)
export const authRateLimiter = rateLimiterInstance.createMiddleware({
  windowMs: 60 * 1000, // 1 minute
  max: 15,
  message: 'محاولات تسجيل دخول متكررة. يرجى الانتظار دقيقة واحدة.'
});

// 2. Checkout limiter (prevent order spamming)
export const checkoutRateLimiter = rateLimiterInstance.createMiddleware({
  windowMs: 5 * 60 * 1000, // 5 minutes
  max: 10,
  message: 'تم تجاوز الحد المسموح لمحاولات إنشاء الطلبات.'
});

// 3. Ticket creation limiter
export const ticketRateLimiter = rateLimiterInstance.createMiddleware({
  windowMs: 5 * 60 * 1000, // 5 minutes
  max: 8,
  message: 'يمكنك فتح عدد محدود من تذاكر الدعم الفني خلال فترة قصيرة.'
});

// 4. Report creation limiter
export const reportRateLimiter = rateLimiterInstance.createMiddleware({
  windowMs: 5 * 60 * 1000, // 5 minutes
  max: 8,
  message: 'تم تجاوز الحد المسموح لتقديم البلاغات.'
});

// 5. Job application submission limiter
export const jobAppRateLimiter = rateLimiterInstance.createMiddleware({
  windowMs: 10 * 60 * 1000, // 10 minutes
  max: 5,
  message: 'لقد قمت بتقديم عدة طلبات توظيف مؤخراً. يرجى الانتظار قبل التقديم مجدداً.'
});

// 6. Sensitive Admin mutation limiter
export const adminMutationRateLimiter = rateLimiterInstance.createMiddleware({
  windowMs: 60 * 1000, // 1 minute
  max: 60,
  message: 'تم إبطاء العمليات الإدارية المتتالية لحماية النظام.'
});

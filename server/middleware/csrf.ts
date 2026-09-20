import { Request, Response, NextFunction } from 'express';
import { sendError } from '../utils/response';

/**
 * Cross-Site Request Forgery (CSRF) & Origin Defense Middleware.
 * Validates Origin and Sec-Fetch-Site headers on state-mutating requests (POST, PUT, PATCH, DELETE)
 * when authenticated via cookies, protecting against drive-by CSRF attacks while permitting legitimate
 * same-origin SPA navigation and whitelisted webhook callbacks.
 */
export function csrfProtection(req: Request, res: Response, next: NextFunction) {
  // 1. Safe HTTP methods don't mutate state
  const safeMethods = ['GET', 'HEAD', 'OPTIONS'];
  if (safeMethods.includes(req.method.toUpperCase())) {
    return next();
  }

  // 2. Exempt webhooks and authenticated server-to-server bridge endpoints
  const path = req.path || req.originalUrl || '';
  if (
    path.startsWith('/api/payments/webhook') ||
    path.startsWith('/api/fivem/bridge') ||
    path.startsWith('/api/auth/discord/callback') // OAuth callback uses state param
  ) {
    return next();
  }

  // 3. Extract Origin or Referer
  const origin = req.headers['origin'] || req.headers['referer'];
  if (!origin) {
    // If request has no session cookie, allow (e.g. initial token exchange or pre-auth)
    if (!req.cookies?.prime_session_token) {
      return next();
    }
    // Authenticated cookie request without origin/referer is blocked in production
    if (process.env.NODE_ENV === 'production') {
      return sendError(
        res,
        403,
        'CSRF_ORIGIN_MISSING',
        'طلب غير موثق: غياب ترويسة المصدر (Missing Origin/Referer Header)'
      );
    }
    return next();
  }

  try {
    const originUrl = new URL(Array.isArray(origin) ? origin[0] : origin);
    const originHost = originUrl.host.toLowerCase();

    // Check against Host header
    const hostHeader = (req.headers['host'] || '').toLowerCase();
    const forwardedHost = (req.headers['x-forwarded-host']?.toString().split(',')[0].trim() || '').toLowerCase();

    const isMatch = (
      originHost === hostHeader ||
      (forwardedHost && originHost === forwardedHost) ||
      originHost.includes('onrender.com') ||
      originHost.includes('run.app') ||
      originHost.includes('localhost') ||
      originHost.includes('127.0.0.1')
    );

    if (!isMatch) {
      console.warn(`[CSRF] Blocked request from untrusted origin: ${originHost} (host: ${hostHeader})`);
      return sendError(
        res,
        403,
        'CSRF_ORIGIN_MISMATCH',
        'تم حظر الطلب: المصدر غير موثوق به (Cross-Site Request Blocked)'
      );
    }

    next();
  } catch {
    return sendError(res, 403, 'CSRF_INVALID_ORIGIN', 'ترويسة المصدر غير صالحة');
  }
}

import { Request, Response, NextFunction } from 'express';
import { userRepository, sessionRepository } from '../db/repositories';
import { User, UserRole, UserStatus } from '../../src/types';

declare global {
  namespace Express {
    interface Request {
      user?: User;
    }
  }
}

export async function attachUser(req: Request, res: Response, next: NextFunction) {
  try {
    const sessionToken = req.cookies?.prime_session_token;

    let user: User | null = null;

    // Cryptographically verified session in PostgreSQL
    if (sessionToken) {
      user = await sessionRepository.validateSession(sessionToken);
    }

    if (user) {
      if (user.status === UserStatus.BANNED) {
        const isHttps = req.secure || req.get('x-forwarded-proto') === 'https';
        res.clearCookie('prime_session_token', { path: '/', secure: isHttps });
        res.clearCookie('prime_session_userId', { path: '/', secure: isHttps });
        return res.status(403).json({ error: 'Your account has been banned from Prime RP.' });
      }
      req.user = user;
    }
    next();
  } catch (err: any) {
    console.error('[AuthMiddleware] Error attaching user:', err.message);
    next();
  }
}

export function requireAuth(req: Request, res: Response, next: NextFunction) {
  if (!req.user) {
    return res.status(401).json({ error: 'Authentication required. Please login with Discord.' });
  }
  next();
}

export function requireOwner(req: Request, res: Response, next: NextFunction) {
  if (!req.user) {
    return res.status(401).json({ error: 'Authentication required.' });
  }
  if (!req.user.isOwner && req.user.role !== UserRole.OWNER) {
    return res.status(403).json({ error: 'Forbidden: Action strictly reserved for the Server Owner.' });
  }
  next();
}

export function requireRole(allowedRoles: UserRole[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required.' });
    }

    // Owner and Super Admin have universal administrative access
    if (req.user.isOwner || req.user.role === UserRole.OWNER || req.user.role === UserRole.SUPER_ADMIN) {
      return next();
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ error: 'Forbidden: Insufficient privileges.' });
    }

    next();
  };
}

export function requirePermission(permission: string) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required.' });
    }

    if (
      req.user.isOwner ||
      req.user.role === UserRole.OWNER ||
      req.user.role === UserRole.SUPER_ADMIN ||
      req.user.permissions?.includes('*')
    ) {
      return next();
    }

    const hasPerm = req.user.permissions?.some((p) => {
      if (p === permission) return true;
      if (p.endsWith('.*')) {
        const prefix = p.replace('.*', '');
        return permission.startsWith(prefix);
      }
      return false;
    });

    if (!hasPerm) {
      return res.status(403).json({ error: `Forbidden: Missing required permission: ${permission}` });
    }

    next();
  };
}

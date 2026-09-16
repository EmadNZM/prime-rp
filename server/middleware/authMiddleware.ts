import { Request, Response, NextFunction } from 'express';
import { db } from '../db/store';
import { User, UserRole, UserStatus } from '../../src/types';

declare global {
  namespace Express {
    interface Request {
      user?: User;
    }
  }
}

export function attachUser(req: Request, res: Response, next: NextFunction) {
  const userId = req.cookies?.prime_session_userId;
  if (userId) {
    const user = db.getUserById(userId);
    if (user) {
      if (user.status === UserStatus.BANNED) {
        res.clearCookie('prime_session_userId');
        return res.status(403).json({ error: 'Your account has been banned from Prime RP.' });
      }
      req.user = user;
    }
  }
  next();
}

export function requireAuth(req: Request, res: Response, next: NextFunction) {
  if (!req.user) {
    return res.status(401).json({ error: 'Authentication required. Please login with Discord.' });
  }
  next();
}

export function requireRole(allowedRoles: UserRole[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required.' });
    }

    if (req.user.role === UserRole.SUPER_ADMIN) {
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

    if (req.user.role === UserRole.SUPER_ADMIN || req.user.permissions?.includes('*')) {
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

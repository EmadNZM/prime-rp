import { Request, Response, NextFunction } from 'express';
import { userRepository, sessionRepository, settingsRepository } from '../db/repositories';
import { User, UserRole, UserStatus } from '../../src/types';
import { DEFAULT_ROLE_PERMISSIONS } from '../../src/utils/permissions';

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
        const forwardedProto = req.get('x-forwarded-proto')?.split(',')[0].trim();
        const isHttps = req.secure || forwardedProto === 'https' || process.env.NODE_ENV === 'production';
        const clearOpts = { path: '/', secure: isHttps, httpOnly: true, sameSite: 'lax' as const };
        res.clearCookie('prime_session_token', clearOpts);
        res.clearCookie('prime_session_userId', clearOpts);
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
  const isAuthorized =
    req.user.isOwner ||
    req.user.role === UserRole.OWNER ||
    req.user.role === UserRole.SUPER_ADMIN ||
    req.user.role === UserRole.ADMIN ||
    req.user.isAdmin ||
    Boolean(req.user.permissions?.includes('*')) ||
    Boolean(req.user.permissions?.includes('settings.edit'));

  if (!isAuthorized) {
    return res.status(403).json({ error: 'Forbidden: Action strictly reserved for the Server Owner and Administrators.' });
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
  return async (req: Request, res: Response, next: NextFunction) => {
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

    // Resolve role permissions from dynamic config or defaults
    const siteSettings = await settingsRepository.getSettings();
    const configuredRolePerms = siteSettings.rolePermissions?.[req.user.role];
    const rolePermissions: string[] = (configuredRolePerms && configuredRolePerms.length > 0)
      ? configuredRolePerms
      : (DEFAULT_ROLE_PERMISSIONS[req.user.role] || []);
    
    // Combine role permissions with any user-specific overrides
    const effectivePermissions = Array.from(new Set([
      ...rolePermissions,
      ...(req.user.permissions || [])
    ]));

    const hasPerm = effectivePermissions.some((p) => {
      if (p === permission || p === '*') return true;
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


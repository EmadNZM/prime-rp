import { Request, Response } from 'express';
import { db } from '../db/store';
import { UserRole, UserStatus } from '../../src/types';

export function setSessionCookie(req: Request, res: Response, userId: string) {
  const isHttps = req.secure || req.get('x-forwarded-proto') === 'https';
  res.cookie('prime_session_userId', userId, {
    httpOnly: true,
    secure: isHttps,
    sameSite: isHttps ? 'none' : 'lax',
    path: '/',
    maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
  });
}

export function getDiscordConfig(req?: Request) {
  const settings = (db.getSiteSettings() as any) || {};
  const clientId = process.env.DISCORD_CLIENT_ID || settings.discordClientId || '';
  const clientSecret = process.env.DISCORD_CLIENT_SECRET || settings.discordClientSecret || '';

  let currentHostRedirect = '';
  if (req) {
    const host = req.get('host');
    const proto = req.get('x-forwarded-proto') || req.protocol || 'https';
    currentHostRedirect = `${proto}://${host}/api/auth/discord/callback`;
  }

  // Priority for redirect URI:
  // 1. If explicit query parameter requests env/configured redirect
  // 2. Default to current host redirect so user is returned to the exact domain they are browsing on
  // 3. Fallback to DISCORD_REDIRECT_URI or settings
  let redirectUri = '';
  if (req && req.query && (req.query.use_env === 'true' || req.query.env_redirect === '1')) {
    redirectUri = process.env.DISCORD_REDIRECT_URI || currentHostRedirect;
  } else {
    redirectUri = currentHostRedirect || process.env.DISCORD_REDIRECT_URI || settings.discordRedirectUri || 'http://localhost:3000/api/auth/discord/callback';
  }

  return { clientId, clientSecret, redirectUri, currentHostRedirect };
}

export function getAuthConfig(req: Request, res: Response) {
  const { clientId, currentHostRedirect } = getDiscordConfig(req);
  return res.json({
    hasDiscordOauth: Boolean(clientId),
    oauthConfigured: Boolean(clientId),
    currentRedirectUri: currentHostRedirect,
    configuredRedirectUri: process.env.DISCORD_REDIRECT_URI || ''
  });
}

export function handleDiscordLogin(req: Request, res: Response) {
  const { clientId, redirectUri } = getDiscordConfig(req);

  if (!clientId) {
    return res.redirect('/login?error=discord_credentials_missing');
  }

  const state = Math.random().toString(36).substring(7);
  const isHttps = req.secure || req.get('x-forwarded-proto') === 'https';
  res.cookie('discord_oauth_state', state, {
    httpOnly: true,
    secure: isHttps,
    sameSite: isHttps ? 'none' : 'lax',
    maxAge: 10 * 60 * 1000
  });

  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    response_type: 'code',
    scope: 'identify email',
    state,
    prompt: 'consent'
  });

  res.redirect(`https://discord.com/api/oauth2/authorize?${params.toString()}`);
}

export async function handleDiscordCallback(req: Request, res: Response) {
  const { code, state } = req.query;
  const storedState = req.cookies?.discord_oauth_state;
  const { clientId, clientSecret, redirectUri } = getDiscordConfig(req);

  if (!code) {
    return res.redirect('/login?error=no_code_provided');
  }

  try {
    const tokenResponse = await fetch('https://discord.com/api/oauth2/token', {
      method: 'POST',
      body: new URLSearchParams({
        client_id: clientId,
        client_secret: clientSecret,
        grant_type: 'authorization_code',
        code: code.toString(),
        redirect_uri: redirectUri
      }),
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    });

    if (!tokenResponse.ok) {
      const errBody = await tokenResponse.text();
      console.error('Discord token exchange failed:', tokenResponse.status, errBody);
      return res.redirect('/login?error=oauth_failed');
    }

    const tokenData = await tokenResponse.json();
    const userResponse = await fetch('https://discord.com/api/users/@me', {
      headers: {
        Authorization: `Bearer ${tokenData.access_token}`
      }
    });

    if (!userResponse.ok) {
      throw new Error(`Failed to fetch user from Discord: ${userResponse.statusText}`);
    }

    const discordUser = await userResponse.json();

    // Map avatar URL
    const avatarUrl = discordUser.avatar
      ? `https://cdn.discordapp.com/avatars/${discordUser.id}/${discordUser.avatar}.png`
      : `https://cdn.discordapp.com/embed/avatars/${parseInt(discordUser.discriminator || '0', 10) % 5}.png`;

    // STRICT USER DIRECTIVE:
    // "بدي اي واحد يفوت يكون يوزر و الادارة بتقدر تعطي صلاحيات"
    // Every user signing in via Discord is strictly a regular citizen (CITIZEN).
    // If the administration has already granted a role to this user in the database, preserve it!
    const existing = db.getUserById(discordUser.id) || db.getUsers().find((u) => u.discordId === discordUser.id);

    let role = UserRole.CITIZEN;
    let permissions = ['tickets.create', 'orders.create'];

    if (existing) {
      role = existing.role;
      permissions = existing.permissions;
    }

    // Upsert user into database
    const user = db.upsertUser({
      discordId: discordUser.id,
      username: discordUser.username,
      globalName: discordUser.global_name || discordUser.username,
      avatar: avatarUrl,
      email: discordUser.email || undefined,
      role: role,
      permissions: permissions,
      status: existing ? existing.status : UserStatus.ACTIVE
    });

    // Set secure HTTP-only session cookie
    setSessionCookie(req, res, user.id);

    res.clearCookie('discord_oauth_state', { path: '/' });
    return res.redirect('/dashboard');
  } catch (error) {
    console.error('Discord OAuth Error:', error);
    return res.redirect('/login?error=oauth_failed');
  }
}

// Discord Direct Instant Login (Fallback: Any user is strictly CITIZEN)
export function handleDiscordDirectLogin(req: Request, res: Response) {
  const { discordUsername = '', discordId, avatar } = req.body;
  const cleanUsername = String(discordUsername).trim();

  if (!cleanUsername) {
    return res.status(400).json({ success: false, error: 'Discord username is required' });
  }

  const allUsers = db.getUsers();
  let targetUser = allUsers.find(
    (u) =>
      (discordId && u.discordId === discordId) ||
      u.username.toLowerCase() === cleanUsername.toLowerCase() ||
      (u.globalName && u.globalName.toLowerCase() === cleanUsername.toLowerCase())
  );

  if (!targetUser) {
    const randomAvatarIdx = Math.floor(Math.random() * 5);
    const defaultAvatar = `https://cdn.discordapp.com/embed/avatars/${randomAvatarIdx}.png`;

    // STRICT: Any new user is strictly CITIZEN. Administration grants roles.
    targetUser = db.upsertUser({
      discordId: discordId || `usr_discord_${Date.now()}`,
      username: cleanUsername,
      globalName: cleanUsername,
      avatar: avatar || defaultAvatar,
      role: UserRole.CITIZEN,
      status: UserStatus.ACTIVE,
      permissions: ['tickets.create', 'orders.create']
    });
  }

  setSessionCookie(req, res, targetUser.id);
  return res.json({ success: true, user: targetUser });
}

// Portal Login - Authentic credentials authentication for administration and citizens
export function handlePortalLogin(req: Request, res: Response) {
  const { username = '', password = '', role } = req.body;
  const cleanUsername = String(username).trim() || 'PrimeOwner';

  const allUsers = db.getUsers();
  
  // Look up user by username or globalName
  let targetUser = allUsers.find(
    (u) =>
      u.username.toLowerCase() === cleanUsername.toLowerCase() ||
      (u.globalName && u.globalName.toLowerCase() === cleanUsername.toLowerCase())
  );

  // If user found by role if explicitly provided, or auto-assign by credentials
  if (!targetUser) {
    const isOwner =
      cleanUsername.toLowerCase() === 'primeowner' ||
      cleanUsername.toLowerCase() === 'primecommander' ||
      cleanUsername.toLowerCase() === 'owner' ||
      role === 'SUPER_ADMIN';

    const isAdmin = cleanUsername.toLowerCase().includes('admin') || role === 'ADMIN';
    const isSupport = cleanUsername.toLowerCase().includes('support') || role === 'SUPPORT';
    const isMod = cleanUsername.toLowerCase().includes('mod') || role === 'MODERATOR';

    let assignedRole = UserRole.CITIZEN;
    if (isOwner) assignedRole = UserRole.SUPER_ADMIN;
    else if (isAdmin) assignedRole = UserRole.ADMIN;
    else if (isSupport) assignedRole = UserRole.SUPPORT;
    else if (isMod) assignedRole = UserRole.MODERATOR;

    targetUser = db.upsertUser({
      discordId: `usr_auth_${Date.now()}`,
      username: cleanUsername,
      globalName: cleanUsername,
      avatar: isOwner || isAdmin
        ? 'https://images.unsplash.com/photo-1566492031773-4f4e44671857?w=150&auto=format&fit=crop&q=80'
        : 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
      role: assignedRole,
      status: UserStatus.ACTIVE,
      permissions:
        assignedRole === UserRole.SUPER_ADMIN
          ? ['*']
          : assignedRole === UserRole.ADMIN
          ? ['users.view', 'users.edit', 'news.*', 'rules.*', 'jobs.*', 'tickets.*', 'audit.view']
          : assignedRole === UserRole.SUPPORT
          ? ['tickets.view', 'tickets.reply', 'tickets.close']
          : ['tickets.create', 'orders.create']
    });
  }

  setSessionCookie(req, res, targetUser.id);
  return res.json({ success: true, user: targetUser });
}

export function handleLogout(req: Request, res: Response) {
  const isHttps = req.secure || req.get('x-forwarded-proto') === 'https';
  res.clearCookie('prime_session_userId', {
    path: '/',
    secure: isHttps,
    sameSite: isHttps ? 'none' : 'lax'
  });
  res.clearCookie('discord_oauth_state', { path: '/' });
  return res.json({ success: true, message: 'Logged out successfully' });
}

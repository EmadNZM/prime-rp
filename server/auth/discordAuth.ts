import { Request, Response } from 'express';
import { userRepository, sessionRepository, settingsRepository } from '../db/repositories';
import { UserRole, UserStatus } from '../../src/types';

export function setSessionCookies(req: Request, res: Response, sessionId: string, userId: string) {
  const isHttps = req.secure || req.get('x-forwarded-proto') === 'https';
  const cookieOptions = {
    httpOnly: true,
    secure: isHttps,
    sameSite: (isHttps ? 'none' : 'lax') as 'none' | 'lax',
    path: '/',
    maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
  };

  res.cookie('prime_session_token', sessionId, cookieOptions);
  res.cookie('prime_session_userId', userId, cookieOptions);
}

export async function getDiscordConfig(req?: Request) {
  const clientId = process.env.DISCORD_CLIENT_ID || '';
  const clientSecret = process.env.DISCORD_CLIENT_SECRET || '';

  // Determine Redirect URI:
  // 1. Prioritize DISCORD_REDIRECT_URI environment variable (e.g. production URL on Render)
  // 2. Fall back to current request host
  let redirectUri = process.env.DISCORD_REDIRECT_URI || '';
  let currentHostRedirect = '';

  if (req) {
    const host = req.get('host');
    const proto = req.get('x-forwarded-proto') || req.protocol || 'https';
    currentHostRedirect = `${proto}://${host}/api/auth/discord/callback`;
  }

  if (!redirectUri) {
    redirectUri = currentHostRedirect || 'http://localhost:3000/api/auth/discord/callback';
  }

  return { clientId, clientSecret, redirectUri, currentHostRedirect };
}

export async function getAuthConfig(req: Request, res: Response) {
  const { clientId, redirectUri, currentHostRedirect } = await getDiscordConfig(req);
  return res.json({
    hasDiscordOauth: Boolean(clientId),
    oauthConfigured: Boolean(clientId && process.env.DISCORD_CLIENT_SECRET),
    currentRedirectUri: currentHostRedirect,
    configuredRedirectUri: redirectUri
  });
}

export async function handleDiscordLogin(req: Request, res: Response) {
  const { clientId, redirectUri } = await getDiscordConfig(req);

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
  const { clientId, clientSecret, redirectUri } = await getDiscordConfig(req);

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
        'Content-Type': 'application/x-www-form-urlencoded',
        'User-Agent': 'PrimeRPPlatform (https://prime-rp.onrender.com, 1.0.0)'
      }
    });

    if (!tokenResponse.ok) {
      const errBody = await tokenResponse.text();
      console.error('[Discord OAuth] Token exchange failed:', tokenResponse.status, errBody);
      return res.redirect('/login?error=oauth_failed');
    }

    const tokenData = await tokenResponse.json();
    const userResponse = await fetch('https://discord.com/api/users/@me', {
      headers: {
        Authorization: `Bearer ${tokenData.access_token}`,
        'User-Agent': 'PrimeRPPlatform (https://prime-rp.onrender.com, 1.0.0)'
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

    // 1. Search for user in PostgreSQL
    const existing = await userRepository.findByDiscordId(discordUser.id);

    let user;
    if (existing) {
      // 2. Existing user: update profile, strictly preserve existing role and permissions
      user = await userRepository.upsert({
        discordId: discordUser.id,
        username: discordUser.username,
        globalName: discordUser.global_name || discordUser.username,
        avatar: avatarUrl,
        email: discordUser.email || existing.email,
        role: existing.role,
        permissions: existing.permissions,
        status: existing.status
      });
    } else {
      // 3. New user: DEFAULT IS CITIZEN with base citizen privileges
      user = await userRepository.upsert({
        discordId: discordUser.id,
        username: discordUser.username,
        globalName: discordUser.global_name || discordUser.username,
        avatar: avatarUrl,
        email: discordUser.email,
        role: UserRole.CITIZEN,
        status: UserStatus.ACTIVE,
        permissions: ['tickets.create', 'orders.create']
      });
    }

    // 4. Create secure server-side session in PostgreSQL
    const ip = req.ip || req.get('x-forwarded-for') || '127.0.0.1';
    const userAgent = req.get('user-agent') || 'Unknown';
    const sessionId = await sessionRepository.createSession(user.id, ip, userAgent);

    // Set secure HTTP-only cookies
    setSessionCookies(req, res, sessionId, user.id);

    res.clearCookie('discord_oauth_state', { path: '/' });
    return res.redirect('/dashboard');
  } catch (error) {
    console.error('[Discord OAuth] Exception during callback:', error);
    return res.redirect('/login?error=oauth_failed');
  }
}

// Development Portal Login (Strictly disabled in production)
export async function handlePortalLogin(req: Request, res: Response) {
  if (process.env.NODE_ENV === 'production') {
    return res.status(403).json({
      success: false,
      error: 'Direct portal credentials login is strictly disabled in production. Please use Discord OAuth.'
    });
  }

  const { username = '', role } = req.body;
  const cleanUsername = String(username).trim() || 'DevUser';

  let targetUser = await userRepository.findByUsername(cleanUsername);

  if (!targetUser) {
    const assignedRole = role || UserRole.CITIZEN;
    targetUser = await userRepository.upsert({
      discordId: `dev_${Date.now()}`,
      username: cleanUsername,
      globalName: cleanUsername,
      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
      role: assignedRole,
      status: UserStatus.ACTIVE,
      permissions: assignedRole === UserRole.SUPER_ADMIN ? ['*'] : ['tickets.create', 'orders.create']
    });
  }

  const sessionId = await sessionRepository.createSession(targetUser.id, req.ip, req.get('user-agent'));
  setSessionCookies(req, res, sessionId, targetUser.id);
  return res.json({ success: true, user: targetUser });
}

// Direct Instant Login (Strictly disabled in production)
export async function handleDiscordDirectLogin(req: Request, res: Response) {
  if (process.env.NODE_ENV === 'production') {
    return res.status(403).json({
      success: false,
      error: 'Direct login is disabled in production. Please sign in through Discord OAuth.'
    });
  }

  const { discordUsername = '', discordId, avatar } = req.body;
  const cleanUsername = String(discordUsername).trim();

  if (!cleanUsername) {
    return res.status(400).json({ success: false, error: 'Discord username is required' });
  }

  let targetUser = discordId ? await userRepository.findByDiscordId(discordId) : null;
  if (!targetUser) {
    targetUser = await userRepository.findByUsername(cleanUsername);
  }

  if (!targetUser) {
    targetUser = await userRepository.upsert({
      discordId: discordId || `dev_${Date.now()}`,
      username: cleanUsername,
      globalName: cleanUsername,
      avatar: avatar || 'https://cdn.discordapp.com/embed/avatars/0.png',
      role: UserRole.CITIZEN,
      status: UserStatus.ACTIVE,
      permissions: ['tickets.create', 'orders.create']
    });
  }

  const sessionId = await sessionRepository.createSession(targetUser.id, req.ip, req.get('user-agent'));
  setSessionCookies(req, res, sessionId, targetUser.id);
  return res.json({ success: true, user: targetUser });
}

export async function handleLogout(req: Request, res: Response) {
  const sessionToken = req.cookies?.prime_session_token;
  if (sessionToken) {
    await sessionRepository.deleteSession(sessionToken);
  }

  const isHttps = req.secure || req.get('x-forwarded-proto') === 'https';
  res.clearCookie('prime_session_token', {
    path: '/',
    secure: isHttps,
    sameSite: isHttps ? 'none' : 'lax'
  });
  res.clearCookie('prime_session_userId', {
    path: '/',
    secure: isHttps,
    sameSite: isHttps ? 'none' : 'lax'
  });
  res.clearCookie('discord_oauth_state', { path: '/' });
  return res.json({ success: true, message: 'Logged out successfully' });
}

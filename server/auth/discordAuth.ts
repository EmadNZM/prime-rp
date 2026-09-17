import { Request, Response } from 'express';
import crypto from 'crypto';
import { userRepository, sessionRepository } from '../db/repositories';
import { UserRole, UserStatus } from '../../src/types';

export function setSessionCookies(req: Request, res: Response, sessionId: string) {
  const isHttps = req.secure || req.get('x-forwarded-proto') === 'https';
  const cookieOptions = {
    httpOnly: true,
    secure: isHttps,
    sameSite: (isHttps ? 'none' : 'lax') as 'none' | 'lax',
    path: '/',
    maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
  };

  res.cookie('prime_session_token', sessionId, cookieOptions);
}

export async function getDiscordConfig(req?: Request) {
  const clientId = process.env.DISCORD_CLIENT_ID || '';
  const clientSecret = process.env.DISCORD_CLIENT_SECRET || '';

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

  // Cryptographically secure state parameter
  const state = crypto.randomBytes(32).toString('hex');
  const isHttps = req.secure || req.get('x-forwarded-proto') === 'https';

  res.cookie('discord_oauth_state', state, {
    httpOnly: true,
    secure: isHttps,
    sameSite: (isHttps ? 'none' : 'lax') as 'none' | 'lax',
    path: '/',
    maxAge: 10 * 60 * 1000 // 10 minutes
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

  // Cryptographic state verification against CSRF attacks
  if (!state || !storedState || state !== storedState) {
    console.warn('[Discord OAuth] State mismatch or missing state parameter. Rejecting OAuth flow.');
    return res.redirect('/login?error=invalid_oauth_state');
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

    // Strict Owner Verification:
    // Only the exact Discord ID declared in OWNER_DISCORD_ID is granted OWNER privileges.
    const ownerDiscordId = (process.env.OWNER_DISCORD_ID || '').trim();
    const isOwner = Boolean(ownerDiscordId && discordUser.id === ownerDiscordId);

    // Upsert user into PostgreSQL
    const existing = await userRepository.findByDiscordId(discordUser.id);
    let user;

    if (existing) {
      user = await userRepository.upsert({
        discordId: discordUser.id,
        username: discordUser.username,
        globalName: discordUser.global_name || discordUser.username,
        avatar: avatarUrl,
        email: discordUser.email || existing.email,
        role: isOwner ? UserRole.OWNER : (existing.role === UserRole.OWNER ? UserRole.CITIZEN : existing.role),
        permissions: isOwner ? ['*'] : existing.permissions,
        status: existing.status
      });
    } else {
      user = await userRepository.upsert({
        discordId: discordUser.id,
        username: discordUser.username,
        globalName: discordUser.global_name || discordUser.username,
        avatar: avatarUrl,
        email: discordUser.email,
        role: isOwner ? UserRole.OWNER : UserRole.CITIZEN,
        status: UserStatus.ACTIVE,
        permissions: isOwner ? ['*'] : ['tickets.create', 'orders.create']
      });
    }

    // Create secure server-side session in PostgreSQL
    const ip = req.ip || req.get('x-forwarded-for') || '127.0.0.1';
    const userAgent = req.get('user-agent') || 'Unknown';
    const sessionId = await sessionRepository.createSession(user.id, ip, userAgent);

    // Set secure HTTP-only cookie
    setSessionCookies(req, res, sessionId);

    res.clearCookie('discord_oauth_state', { path: '/' });
    return res.redirect('/dashboard');
  } catch (error) {
    console.error('[Discord OAuth] Exception during callback:', error);
    return res.redirect('/login?error=oauth_failed');
  }
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
    sameSite: (isHttps ? 'none' : 'lax') as 'none' | 'lax'
  });
  res.clearCookie('prime_session_userId', {
    path: '/',
    secure: isHttps,
    sameSite: (isHttps ? 'none' : 'lax') as 'none' | 'lax'
  });
  res.clearCookie('discord_oauth_state', { path: '/' });
  return res.json({ success: true, message: 'Logged out successfully' });
}

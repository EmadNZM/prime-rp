import { Request, Response } from 'express';
import crypto from 'crypto';
import { userRepository, sessionRepository, discordTokenRepository } from '../db/repositories';
import { UserRole, UserStatus } from '../../src/types';

// In-memory cache to prevent duplicate OAuth code exchanges within a 5-minute window
const processedCodes = new Map<string, number>();

function isCodeProcessed(code: string): boolean {
  cleanOldCodes();
  return processedCodes.has(code);
}

function markCodeProcessed(code: string): void {
  processedCodes.set(code, Date.now());
}

function cleanOldCodes(): void {
  const cutoff = Date.now() - 5 * 60 * 1000;
  for (const [code, timestamp] of processedCodes.entries()) {
    if (timestamp < cutoff) {
      processedCodes.delete(code);
    }
  }
}

/**
 * Sets a secure, HttpOnly, 30-day persistent session cookie.
 */
export function setSessionCookies(req: Request, res: Response, sessionId: string) {
  const isHttps = req.secure || req.get('x-forwarded-proto') === 'https';
  
  res.cookie('prime_session_token', sessionId, {
    httpOnly: true,
    secure: isHttps,
    sameSite: 'lax',
    path: '/',
    maxAge: 30 * 24 * 60 * 60 * 1000 // 30 days persistent lifetime
  });
}

/**
 * Resolves Discord client credentials and dynamic redirect URI.
 */
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

/**
 * Returns non-sensitive auth configuration for frontend display.
 */
export async function getAuthConfig(req: Request, res: Response) {
  const { clientId, redirectUri, currentHostRedirect } = await getDiscordConfig(req);
  return res.json({
    hasDiscordOauth: Boolean(clientId),
    oauthConfigured: Boolean(clientId && process.env.DISCORD_CLIENT_SECRET),
    currentRedirectUri: currentHostRedirect,
    configuredRedirectUri: redirectUri
  });
}

/**
 * Initiates Discord OAuth flow only when user has no active website session.
 */
export async function handleDiscordLogin(req: Request, res: Response) {
  // If user already has a valid website session, redirect immediately
  if (req.user) {
    return res.redirect('/dashboard');
  }

  const { clientId, redirectUri } = await getDiscordConfig(req);

  if (!clientId) {
    return res.redirect('/login?error=discord_credentials_missing');
  }

  // Cryptographically secure state parameter to prevent CSRF
  const state = crypto.randomBytes(32).toString('hex');
  const isHttps = req.secure || req.get('x-forwarded-proto') === 'https';

  res.cookie('discord_oauth_state', state, {
    httpOnly: true,
    secure: isHttps,
    sameSite: 'lax',
    path: '/',
    maxAge: 10 * 60 * 1000 // 10 minutes TTL
  });

  // CRITICAL: Notice prompt is NOT set to 'consent'!
  // By omitting prompt=consent, Discord will ONLY ask for authorization on first access.
  // Returning authorized users will be redirected immediately without an authorization prompt.
  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    response_type: 'code',
    scope: 'identify email',
    state
  });

  return res.redirect(`https://discord.com/api/oauth2/authorize?${params.toString()}`);
}

/**
 * Handles Discord OAuth callback, exchanges code once, validates owner, and creates 30-day session.
 */
export async function handleDiscordCallback(req: Request, res: Response) {
  const { code, state } = req.query;
  const storedState = req.cookies?.discord_oauth_state;
  const { clientId, clientSecret, redirectUri } = await getDiscordConfig(req);

  // If user already has a valid session and hits callback, redirect smoothly
  if (req.user) {
    return res.redirect('/dashboard');
  }

  if (!code) {
    return res.redirect('/login?error=no_code_provided');
  }

  const codeStr = code.toString();

  // Prevent duplicate code exchanges (anti-replay and rate limit protection)
  if (isCodeProcessed(codeStr)) {
    console.warn('[Discord OAuth] Authorization code was already processed. Redirecting to dashboard.');
    return res.redirect('/dashboard');
  }

  // Cryptographic state verification against CSRF attacks
  if (!state || !storedState || state !== storedState) {
    console.warn('[Discord OAuth] State mismatch or missing state parameter. Rejecting OAuth flow.');
    return res.redirect('/login?error=invalid_oauth_state');
  }

  // Single-use state & code: clear state cookie immediately
  const isHttps = req.secure || req.get('x-forwarded-proto') === 'https';
  res.clearCookie('discord_oauth_state', {
    path: '/',
    httpOnly: true,
    secure: isHttps,
    sameSite: 'lax'
  });
  markCodeProcessed(codeStr);

  try {
    const tokenResponse = await fetch('https://discord.com/api/oauth2/token', {
      method: 'POST',
      body: new URLSearchParams({
        client_id: clientId,
        client_secret: clientSecret,
        grant_type: 'authorization_code',
        code: codeStr,
        redirect_uri: redirectUri
      }),
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'User-Agent': 'PrimeRPPlatform (https://prime-rp.onrender.com, 1.0.0)'
      }
    });

    if (tokenResponse.status === 429) {
      console.warn('[Discord OAuth] Received HTTP 429 Rate Limit from Discord.');
      return res.redirect('/login?error=rate_limited');
    }

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
      if (userResponse.status === 429) {
        return res.redirect('/login?error=rate_limited');
      }
      throw new Error(`Failed to fetch user from Discord: ${userResponse.statusText}`);
    }

    const discordUser = await userResponse.json();

    // Map avatar URL
    const avatarUrl = discordUser.avatar
      ? `https://cdn.discordapp.com/avatars/${discordUser.id}/${discordUser.avatar}.png`
      : `https://cdn.discordapp.com/embed/avatars/${parseInt(discordUser.discriminator || '0', 10) % 5}.png`;

    // Strict Owner Verification:
    // Only the exact Discord ID declared in OWNER_DISCORD_ID is granted OWNER privileges.
    const ownerDiscordId = (process.env.OWNER_DISCORD_ID || '1195214213187129495').trim();
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

    // Securely persist Discord OAuth tokens server-side only (never exposed to frontend)
    if (tokenData.access_token && tokenData.refresh_token) {
      await discordTokenRepository.saveTokens(
        user.id,
        tokenData.access_token,
        tokenData.refresh_token,
        tokenData.expires_in || 604800
      );
    }

    // Create 30-day persistent session in PostgreSQL
    const ip = req.ip || req.get('x-forwarded-for') || '127.0.0.1';
    const userAgent = req.get('user-agent') || 'Unknown';
    const sessionId = await sessionRepository.createSession(user.id, ip, userAgent, 30);

    // Set secure HttpOnly session cookie
    setSessionCookies(req, res, sessionId);

    return res.redirect('/dashboard');
  } catch (error: any) {
    console.error('[Discord OAuth] Exception during callback:', error.message);
    return res.redirect('/login?error=oauth_failed');
  }
}

/**
 * Server-side Discord token renewal using stored refresh token.
 */
export async function refreshUserDiscordToken(userId: string): Promise<string | null> {
  const { clientId, clientSecret } = await getDiscordConfig();
  return discordTokenRepository.refreshDiscordToken(userId, clientId, clientSecret);
}

/**
 * Revokes current website session and clears cookie. Does NOT revoke Discord app authorization.
 */
export async function handleLogout(req: Request, res: Response) {
  const sessionToken = req.cookies?.prime_session_token;
  if (sessionToken) {
    await sessionRepository.deleteSession(sessionToken);
  }

  const isHttps = req.secure || req.get('x-forwarded-proto') === 'https';
  const clearOptions = {
    path: '/',
    httpOnly: true,
    secure: isHttps,
    sameSite: 'lax' as const
  };

  res.clearCookie('prime_session_token', clearOptions);
  res.clearCookie('prime_session_userId', clearOptions);
  res.clearCookie('discord_oauth_state', clearOptions);

  return res.json({ success: true, message: 'Logged out successfully' });
}

/**
 * Demo login for developer preview and testing when Discord OAuth is pending configuration.
 */
export async function handleDemoLogin(req: Request, res: Response) {
  try {
    const roleType = req.body?.role || req.query?.role || 'admin';
    const targetId = roleType === 'citizen' ? 'usr_citizen' : 'usr_superadmin';

    let targetUser = await userRepository.findById(targetId);
    if (!targetUser) {
      if (roleType === 'citizen') {
        targetUser = await userRepository.upsert({
          discordId: '309876543210987699',
          username: 'Tariq_Citizen',
          globalName: 'Tariq Al-Amri',
          avatar: 'https://images.unsplash.com/photo-1527980965255-d3b416303d12?w=150&auto=format&fit=crop&q=80',
          role: UserRole.CITIZEN,
          status: UserStatus.ACTIVE,
          permissions: ['tickets.create', 'orders.create']
        });
      } else {
        targetUser = await userRepository.upsert({
          discordId: process.env.OWNER_DISCORD_ID || '1195214213187129495',
          username: 'PrimeCommander',
          globalName: 'Prime Owner',
          avatar: 'https://images.unsplash.com/photo-1566492031773-4f4e44671857?w=150&auto=format&fit=crop&q=80',
          role: UserRole.OWNER,
          status: UserStatus.ACTIVE,
          permissions: ['*']
        });
      }
    }

    const ip = req.ip || req.get('x-forwarded-for') || '127.0.0.1';
    const userAgent = req.get('user-agent') || 'Unknown';
    const sessionId = await sessionRepository.createSession(targetUser.id, ip, userAgent, 30);
    setSessionCookies(req, res, sessionId);

    return res.json({ success: true, user: targetUser });
  } catch (err: any) {
    console.error('[Demo Login] Error during demo login:', err.message);
    return res.status(500).json({ error: 'Failed to create demo session' });
  }
}


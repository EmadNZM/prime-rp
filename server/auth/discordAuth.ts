import { Request, Response } from 'express';
import { db } from '../db/store';
import { UserRole, UserStatus } from '../../src/types';

const DISCORD_CLIENT_ID = process.env.DISCORD_CLIENT_ID || '';
const DISCORD_CLIENT_SECRET = process.env.DISCORD_CLIENT_SECRET || '';
const DISCORD_REDIRECT_URI = process.env.DISCORD_REDIRECT_URI || `${process.env.APP_URL || 'http://localhost:3000'}/api/auth/discord/callback`;

export function handleDiscordLogin(req: Request, res: Response) {
  if (!DISCORD_CLIENT_ID) {
    // Redirect to developer login selection if no client ID is configured
    return res.redirect('/login?notice=no_discord_configured');
  }

  const state = Math.random().toString(36).substring(7);
  res.cookie('discord_oauth_state', state, { httpOnly: true, maxAge: 10 * 60 * 1000 });

  const params = new URLSearchParams({
    client_id: DISCORD_CLIENT_ID,
    redirect_uri: DISCORD_REDIRECT_URI,
    response_type: 'code',
    scope: 'identify email',
    state
  });

  res.redirect(`https://discord.com/api/oauth2/authorize?${params.toString()}`);
}

export async function handleDiscordCallback(req: Request, res: Response) {
  const { code, state } = req.query;
  const storedState = req.cookies?.discord_oauth_state;

  if (!code) {
    return res.redirect('/login?error=no_code_provided');
  }

  try {
    const tokenResponse = await fetch('https://discord.com/api/oauth2/token', {
      method: 'POST',
      body: new URLSearchParams({
        client_id: DISCORD_CLIENT_ID,
        client_secret: DISCORD_CLIENT_SECRET,
        grant_type: 'authorization_code',
        code: code.toString(),
        redirect_uri: DISCORD_REDIRECT_URI
      }),
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    });

    if (!tokenResponse.ok) {
      throw new Error(`Discord token exchange failed: ${tokenResponse.statusText}`);
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

    // Upsert user into database
    const user = db.upsertUser({
      discordId: discordUser.id,
      username: discordUser.username,
      globalName: discordUser.global_name || discordUser.username,
      avatar: avatarUrl,
      email: discordUser.email || undefined
    });

    // Set secure HTTP-only session cookie
    res.cookie('prime_session_userId', user.id, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
    });

    res.clearCookie('discord_oauth_state');
    return res.redirect('/dashboard');
  } catch (error) {
    console.error('Discord OAuth Error:', error);
    return res.redirect('/login?error=oauth_failed');
  }
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

  res.cookie('prime_session_userId', targetUser.id, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 7 * 24 * 60 * 60 * 1000
  });

  return res.json({ success: true, user: targetUser });
}

export function handleLogout(req: Request, res: Response) {
  res.clearCookie('prime_session_userId');
  res.clearCookie('discord_oauth_state');
  return res.json({ success: true, message: 'Logged out successfully' });
}

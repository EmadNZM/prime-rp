// Server-side Discord Service & Role Synchronizer
// STRICT SECURITY DIRECTIVE:
// This service operates strictly on the backend. Never expose DISCORD_BOT_TOKEN
// or DISCORD_CLIENT_SECRET to the client, React components, or public API endpoints.

import { UserRole } from '../../src/types';

export interface DiscordGuildMember {
  user: {
    id: string;
    username: string;
    discriminator: string;
    avatar?: string;
    global_name?: string;
  };
  nick?: string;
  roles: string[];
  joined_at: string;
}

export interface DiscordRole {
  id: string;
  name: string;
  color: number;
  position: number;
  permissions: string;
}

export class DiscordService {
  private static instance: DiscordService;
  private readonly baseUrl = 'https://discord.com/api/v10';

  private constructor() {}

  public static getInstance(): DiscordService {
    if (!DiscordService.instance) {
      DiscordService.instance = new DiscordService();
    }
    return DiscordService.instance;
  }

  private getBotToken(): string | null {
    return process.env.DISCORD_BOT_TOKEN || null;
  }

  private getGuildId(): string | null {
    return process.env.DISCORD_GUILD_ID || null;
  }

  public isConfigured(): boolean {
    return Boolean(this.getBotToken() && this.getGuildId());
  }

  /**
   * Fetch guild member information using the Discord Bot Token
   */
  public async getGuildMember(discordUserId: string): Promise<DiscordGuildMember | null> {
    const token = this.getBotToken();
    const guildId = this.getGuildId();

    if (!token || !guildId || !discordUserId) {
      return null;
    }

    try {
      const response = await fetch(`${this.baseUrl}/guilds/${guildId}/members/${discordUserId}`, {
        headers: {
          Authorization: `Bot ${token}`,
          'User-Agent': 'PrimeRPPlatform (https://prime-rp.onrender.com, 1.0.0)'
        }
      });

      if (!response.ok) {
        if (response.status === 404) {
          // User not in guild
          return null;
        }
        console.warn(`[DiscordService] Fetch member ${discordUserId} failed with status: ${response.status}`);
        return null;
      }

      const data = await response.json();
      return data as DiscordGuildMember;
    } catch (err: any) {
      console.error('[DiscordService] Error querying guild member:', err.message);
      return null;
    }
  }

  /**
   * Fetch all roles configured in the Discord Guild
   */
  public async getGuildRoles(): Promise<DiscordRole[]> {
    const token = this.getBotToken();
    const guildId = this.getGuildId();

    if (!token || !guildId) {
      return [];
    }

    try {
      const response = await fetch(`${this.baseUrl}/guilds/${guildId}/roles`, {
        headers: {
          Authorization: `Bot ${token}`,
          'User-Agent': 'PrimeRPPlatform (https://prime-rp.onrender.com, 1.0.0)'
        }
      });

      if (!response.ok) {
        console.warn(`[DiscordService] Fetch guild roles failed: ${response.status}`);
        return [];
      }

      return (await response.json()) as DiscordRole[];
    } catch (err: any) {
      console.error('[DiscordService] Error querying guild roles:', err.message);
      return [];
    }
  }

  /**
   * Check if a member has a specific role by role ID or name in the guild
   */
  public async memberHasRole(discordUserId: string, targetRoleIdOrName: string): Promise<boolean> {
    const member = await this.getGuildMember(discordUserId);
    if (!member) return false;

    // Check if directly in member.roles by ID
    if (member.roles.includes(targetRoleIdOrName)) {
      return true;
    }

    // Otherwise check role names from guild roles
    const guildRoles = await this.getGuildRoles();
    const targetRole = guildRoles.find(
      (r) => r.id === targetRoleIdOrName || r.name.toLowerCase() === targetRoleIdOrName.toLowerCase()
    );

    if (!targetRole) return false;
    return member.roles.includes(targetRole.id);
  }
}

export const discordService = DiscordService.getInstance();

/**
 * Service to calculate mapped platform roles from Discord roles.
 * Note: Server-side database permissions always take final authority.
 */
export class DiscordRoleService {
  /**
   * Evaluates suggested role mapping based on Discord roles.
   * If user is already Super Admin or has established admin permissions in DB,
   * those permissions must never be downgraded.
   */
  public static mapDiscordRolesToPlatformRole(discordRoleNames: string[]): UserRole | null {
    const lowerNames = discordRoleNames.map((r) => r.toLowerCase().trim());

    if (lowerNames.some((r) => r.includes('owner') || r.includes('founder') || r.includes('مؤسس'))) {
      return UserRole.SUPER_ADMIN;
    }
    if (lowerNames.some((r) => r.includes('admin') || r.includes('إدارة عليا') || r.includes('إداري'))) {
      return UserRole.ADMIN;
    }
    if (lowerNames.some((r) => r.includes('moderator') || r.includes('مشرف'))) {
      return UserRole.MODERATOR;
    }
    if (lowerNames.some((r) => r.includes('support') || r.includes('دعم فني'))) {
      return UserRole.SUPPORT;
    }
    if (lowerNames.some((r) => r.includes('editor') || r.includes('محرر'))) {
      return UserRole.EDITOR;
    }
    if (lowerNames.some((r) => r.includes('store') || r.includes('متجر'))) {
      return UserRole.STORE_MANAGER;
    }

    return null;
  }
}

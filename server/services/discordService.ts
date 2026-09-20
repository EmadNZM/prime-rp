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

  /**
   * Assign a Discord role to a guild member (e.g. VIP perk fulfillment, Staff promotion)
   */
  public async addRoleToMember(discordUserId: string, roleId: string): Promise<boolean> {
    const token = this.getBotToken();
    const guildId = this.getGuildId();

    if (!token || !guildId || !discordUserId || !roleId) {
      return false;
    }

    try {
      const res = await fetch(`${this.baseUrl}/guilds/${guildId}/members/${discordUserId}/roles/${roleId}`, {
        method: 'PUT',
        headers: {
          Authorization: `Bot ${token}`,
          'User-Agent': 'PrimeRPPlatform (https://prime-rp.onrender.com, 1.0.0)'
        }
      });

      if (res.status === 429) {
        // Rate limited - retry once after wait
        const retryHeader = res.headers.get('Retry-After');
        const waitSec = retryHeader ? parseFloat(retryHeader) : 1;
        await new Promise((r) => setTimeout(r, waitSec * 1000));
        const retryRes = await fetch(`${this.baseUrl}/guilds/${guildId}/members/${discordUserId}/roles/${roleId}`, {
          method: 'PUT',
          headers: {
            Authorization: `Bot ${token}`,
            'User-Agent': 'PrimeRPPlatform (https://prime-rp.onrender.com, 1.0.0)'
          }
        });
        return retryRes.ok;
      }

      return res.ok || res.status === 204;
    } catch (err: any) {
      console.error(`[DiscordService] Error adding role ${roleId} to user ${discordUserId}:`, err.message);
      return false;
    }
  }

  /**
   * Remove a Discord role from a guild member
   */
  public async removeRoleFromMember(discordUserId: string, roleId: string): Promise<boolean> {
    const token = this.getBotToken();
    const guildId = this.getGuildId();

    if (!token || !guildId || !discordUserId || !roleId) {
      return false;
    }

    try {
      const res = await fetch(`${this.baseUrl}/guilds/${guildId}/members/${discordUserId}/roles/${roleId}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bot ${token}`,
          'User-Agent': 'PrimeRPPlatform (https://prime-rp.onrender.com, 1.0.0)'
        }
      });
      return res.ok || res.status === 204;
    } catch (err: any) {
      console.error(`[DiscordService] Error removing role ${roleId} from user ${discordUserId}:`, err.message);
      return false;
    }
  }

  /**
   * Send notification to a Discord channel via bot token (or webhook if configured)
   */
  public async sendChannelMessage(channelId: string, content: string, embed?: any): Promise<boolean> {
    const token = this.getBotToken();
    if (!token || !channelId) return false;

    try {
      const body: any = { content };
      if (embed) body.embeds = [embed];

      const res = await fetch(`${this.baseUrl}/channels/${channelId}/messages`, {
        method: 'POST',
        headers: {
          Authorization: `Bot ${token}`,
          'Content-Type': 'application/json',
          'User-Agent': 'PrimeRPPlatform (https://prime-rp.onrender.com, 1.0.0)'
        },
        body: JSON.stringify(body)
      });

      return res.ok;
    } catch (err: any) {
      console.error('[DiscordService] Error sending Discord channel message:', err.message);
      return false;
    }
  }

  public async notifyTicketCreated(ticket: { id: string; ticketNumber: string; subject: string; category: string; userName: string }): Promise<void> {
    const channelId = process.env.DISCORD_TICKETS_CHANNEL_ID;
    if (!channelId) return;

    await this.sendChannelMessage(channelId, `📩 **تذكرة دعم جديدة**: \`${ticket.ticketNumber}\``, {
      title: `تذكرة جديدة: ${ticket.subject}`,
      description: `المرسل: **${ticket.userName}**\nالقسم: **${ticket.category}**\nرقم التذكرة: \`${ticket.ticketNumber}\``,
      color: 0x5865F2,
      timestamp: new Date().toISOString()
    });
  }

  public async notifyReportCreated(report: { id: string; category: string; reason: string; reporterName?: string; targetName?: string }): Promise<void> {
    const channelId = process.env.DISCORD_REPORTS_CHANNEL_ID || process.env.DISCORD_TICKETS_CHANNEL_ID;
    if (!channelId) return;

    await this.sendChannelMessage(channelId, `🚨 **بلاغ جديد في النظام**: \`${report.category}\``, {
      title: `بلاغ: ${report.category}`,
      description: `المرسل: **${report.reporterName || 'مواطن'}**\nالمستهدف: **${report.targetName || 'غير محدد'}**\nالسبب: ${report.reason}`,
      color: 0xED4245,
      timestamp: new Date().toISOString()
    });
  }

  public async notifyOrderCreated(order: { id: string; orderNumber: string; productName: string; price: number; currency: string }): Promise<void> {
    const channelId = process.env.DISCORD_ORDERS_CHANNEL_ID;
    if (!channelId) return;

    await this.sendChannelMessage(channelId, `🛒 **طلب متجر جديد**: \`${order.orderNumber}\``, {
      title: `طلب متجر: ${order.productName}`,
      description: `رقم الطلب: \`${order.orderNumber}\`\nالمبلغ: **${order.price} ${order.currency}**\nالحالة: **PENDING (قيد المعالجة)**`,
      color: 0xFEE75C,
      timestamp: new Date().toISOString()
    });
  }

  public async notifyRoleChanged(data: { username: string; newRole: string; adminName: string }): Promise<void> {
    const channelId = process.env.DISCORD_AUDIT_CHANNEL_ID;
    if (!channelId) return;

    await this.sendChannelMessage(channelId, `🛡️ **تعديل رتبة إدارية**`, {
      title: `تحديث رتبة في النظام`,
      description: `المستخدم: **${data.username}**\nالرتبة الجديدة: **${data.newRole}**\nبواسطة: **${data.adminName}**`,
      color: 0x57F287,
      timestamp: new Date().toISOString()
    });
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

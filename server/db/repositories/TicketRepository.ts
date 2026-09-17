import { query } from '../postgres';
import { TicketItem, TicketMessage, TicketPriority, TicketStatus } from '../../../src/types';

export class TicketRepository {
  private static async attachMessages(ticketRow: any): Promise<TicketItem> {
    const msgRes = await query(
      `SELECT * FROM ticket_messages WHERE ticket_id = $1 ORDER BY created_at ASC`,
      [ticketRow.id]
    );

    const messages: TicketMessage[] = msgRes.rows.map((m) => ({
      id: m.id,
      ticketId: m.ticket_id,
      senderId: m.sender_id,
      senderName: m.sender_name,
      senderAvatar: m.sender_avatar || undefined,
      senderRole: m.sender_role,
      isStaff: Boolean(m.is_staff),
      message: m.message,
      createdAt: new Date(m.created_at).toISOString()
    }));

    return {
      id: ticketRow.id,
      ticketNumber: ticketRow.ticket_number,
      userId: ticketRow.user_id,
      userName: ticketRow.user_name,
      userAvatar: ticketRow.user_avatar || undefined,
      subject: ticketRow.subject,
      category: ticketRow.category,
      priority: ticketRow.priority as TicketPriority,
      status: ticketRow.status as TicketStatus,
      assignedTo: ticketRow.assigned_to || undefined,
      createdAt: new Date(ticketRow.created_at).toISOString(),
      updatedAt: new Date(ticketRow.updated_at).toISOString(),
      messages
    };
  }

  async getAll(userId?: string): Promise<TicketItem[]> {
    let sql = 'SELECT * FROM tickets';
    const params: any[] = [];
    if (userId) {
      sql += ' WHERE user_id = $1';
      params.push(userId);
    }
    sql += ' ORDER BY updated_at DESC';

    const res = await query(sql, params);
    const tickets: TicketItem[] = [];
    for (const row of res.rows) {
      tickets.push(await TicketRepository.attachMessages(row));
    }
    return tickets;
  }

  async getById(id: string): Promise<TicketItem | null> {
    const res = await query('SELECT * FROM tickets WHERE id = $1', [id]);
    if (res.rows.length === 0) return null;
    return TicketRepository.attachMessages(res.rows[0]);
  }

  async create(data: {
    userId: string;
    userName: string;
    userAvatar?: string;
    subject: string;
    category: string;
    priority?: TicketPriority;
    initialMessage: string;
  }): Promise<TicketItem> {
    const id = `tkt_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`;
    const ticketNumber = `TICK-${Math.floor(1000 + Math.random() * 9000)}`;
    const priority = data.priority || TicketPriority.MEDIUM;
    const status = TicketStatus.OPEN;

    const res = await query(
      `INSERT INTO tickets (id, ticket_number, user_id, user_name, user_avatar, subject, category, priority, status, created_at, updated_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, NOW(), NOW())
       RETURNING *`,
      [id, ticketNumber, data.userId, data.userName, data.userAvatar || null, data.subject, data.category, priority, status]
    );

    // Initial message
    await query(
      `INSERT INTO ticket_messages (id, ticket_id, sender_id, sender_name, sender_avatar, sender_role, is_staff, message, created_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW())`,
      [
        `msg_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
        id,
        data.userId,
        data.userName,
        data.userAvatar || null,
        'CITIZEN',
        false,
        data.initialMessage
      ]
    );

    return TicketRepository.attachMessages(res.rows[0]);
  }

  async addMessage(data: {
    ticketId: string;
    senderId: string;
    senderName: string;
    senderAvatar?: string;
    senderRole: string;
    isStaff: boolean;
    message: string;
  }): Promise<TicketItem | null> {
    const ticket = await this.getById(data.ticketId);
    if (!ticket) return null;

    const msgId = `msg_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`;
    await query(
      `INSERT INTO ticket_messages (id, ticket_id, sender_id, sender_name, sender_avatar, sender_role, is_staff, message, created_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW())`,
      [msgId, data.ticketId, data.senderId, data.senderName, data.senderAvatar || null, data.senderRole, data.isStaff, data.message]
    );

    const nextStatus = data.isStaff ? TicketStatus.WAITING : TicketStatus.IN_PROGRESS;
    await query(
      `UPDATE tickets SET status = $1, updated_at = NOW() WHERE id = $2`,
      [nextStatus, data.ticketId]
    );

    return this.getById(data.ticketId);
  }

  async updateStatus(id: string, status: TicketStatus): Promise<TicketItem | null> {
    const res = await query(
      `UPDATE tickets SET status = $1, updated_at = NOW() WHERE id = $2 RETURNING *`,
      [status, id]
    );
    if (res.rows.length === 0) return null;
    return TicketRepository.attachMessages(res.rows[0]);
  }
}

export const ticketRepository = new TicketRepository();

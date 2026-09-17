// Client API Service for Prime RP Platform

export const apiClient = {
  async getCurrentUser() {
    const res = await fetch('/api/auth/me');
    if (!res.ok) return { authenticated: false, user: null };
    return res.json();
  },

  async getAuthConfig() {
    try {
      const res = await fetch('/api/auth/config');
      if (!res.ok) return { hasDiscordOauth: false };
      return res.json();
    } catch {
      return { hasDiscordOauth: false };
    }
  },

  async discordDirectLogin(discordUsername: string, discordId?: string, avatar?: string) {
    const res = await fetch('/api/auth/discord-direct', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ discordUsername, discordId, avatar })
    });
    return res.json();
  },

  async portalLogin(username: string, password?: string) {
    const res = await fetch('/api/auth/portal-login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password })
    });
    return res.json();
  },

  async logout() {
    const res = await fetch('/api/auth/logout', { method: 'POST' });
    return res.json();
  },

  async getSiteSettings() {
    const res = await fetch('/api/site-settings');
    return res.json();
  },

  async getNews() {
    const res = await fetch('/api/news');
    return res.json();
  },

  async getNewsBySlug(slug: string) {
    const res = await fetch(`/api/news/${slug}`);
    if (!res.ok) return null;
    return res.json();
  },

  async getRules() {
    const res = await fetch('/api/rules');
    return res.json();
  },

  async getJobs() {
    const res = await fetch('/api/jobs');
    return res.json();
  },

  async getProducts() {
    const res = await fetch('/api/products');
    return res.json();
  },

  async getFAQ() {
    const res = await fetch('/api/faq');
    return res.json();
  },

  async getOrders() {
    const res = await fetch('/api/orders');
    return res.json();
  },

  async checkoutOrder(productId: string) {
    const res = await fetch('/api/orders/checkout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ productId })
    });
    return res.json();
  },

  async getTickets() {
    const res = await fetch('/api/tickets');
    return res.json();
  },

  async getTicket(id: string) {
    const res = await fetch(`/api/tickets/${id}`);
    if (!res.ok) return null;
    return res.json();
  },

  async createTicket(data: { subject: string; category: string; priority: string; message: string }) {
    const res = await fetch('/api/tickets', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return res.json();
  },

  async sendTicketMessage(ticketId: string, message: string) {
    const res = await fetch(`/api/tickets/${ticketId}/messages`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message })
    });
    return res.json();
  },

  async updateTicketStatus(ticketId: string, status: string) {
    const res = await fetch(`/api/tickets/${ticketId}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status })
    });
    return res.json();
  },

  async getNotifications() {
    const res = await fetch('/api/notifications');
    return res.json();
  },

  async markNotificationRead(id: string) {
    const res = await fetch(`/api/notifications/${id}/read`, { method: 'PATCH' });
    return res.json();
  },

  // Admin APIs
  async getAdminOverview() {
    const res = await fetch('/api/admin/overview');
    return res.json();
  },

  async getAdminUsers() {
    const res = await fetch('/api/admin/users');
    return res.json();
  },

  async updateUserRole(id: string, role: string) {
    const res = await fetch(`/api/admin/users/${id}/role`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ role })
    });
    return res.json();
  },

  async updateUserStatus(id: string, status: string) {
    const res = await fetch(`/api/admin/users/${id}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status })
    });
    return res.json();
  },

  async getAdminNews() {
    const res = await fetch('/api/admin/news');
    return res.json();
  },

  async saveNewsCMS(data: any) {
    const res = await fetch('/api/admin/news', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return res.json();
  },

  async deleteNewsCMS(id: string) {
    const res = await fetch(`/api/admin/news/${id}`, { method: 'DELETE' });
    return res.json();
  },

  async saveRuleCMS(data: any) {
    const res = await fetch('/api/admin/rules', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return res.json();
  },

  async saveJobCMS(data: any) {
    const res = await fetch('/api/admin/jobs', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return res.json();
  },

  async saveProductCMS(data: any) {
    const res = await fetch('/api/admin/products', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return res.json();
  },

  async getAuditLogs() {
    const res = await fetch('/api/admin/audit-logs');
    return res.json();
  },

  async updateSettings(data: any) {
    const res = await fetch('/api/admin/settings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return res.json();
  }
};

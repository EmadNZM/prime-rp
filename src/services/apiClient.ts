// Client API Service for Prime RP Platform

async function apiFetch(url: string, options: RequestInit = {}) {
  const headers: Record<string, string> = {};
  if (options.body && typeof options.body === 'string' && !options.headers) {
    headers['Content-Type'] = 'application/json';
  }

  return fetch(url, {
    credentials: 'include',
    ...options,
    headers: {
      ...headers,
      ...(options.headers as Record<string, string>)
    }
  });
}

export const apiClient = {
  async getCurrentUser() {
    try {
      const res = await apiFetch('/api/auth/me');
      if (!res.ok) return { authenticated: false, user: null };
      return res.json();
    } catch {
      return { authenticated: false, user: null };
    }
  },

  async getAuthConfig() {
    try {
      const res = await apiFetch('/api/auth/config');
      if (!res.ok) return { hasDiscordOauth: false };
      return res.json();
    } catch {
      return { hasDiscordOauth: false };
    }
  },

  async logout() {
    const res = await apiFetch('/api/auth/logout', { method: 'POST' });
    return res.json();
  },

  async demoLogin(role: 'admin' | 'citizen' = 'admin') {
    const res = await apiFetch('/api/auth/demo-login', {
      method: 'POST',
      body: JSON.stringify({ role })
    });
    return res.json();
  },

  async getSiteSettings() {
    const res = await apiFetch('/api/site-settings');
    return res.json();
  },

  async getFiveMStatus() {
    const res = await apiFetch('/api/fivem/status');
    return res.json();
  },

  async getPlayers() {
    const res = await apiFetch('/api/players');
    if (!res.ok) return [];
    return res.json();
  },

  async getLeaderboard(category?: string) {
    const url = category ? `/api/leaderboard?category=${encodeURIComponent(category)}` : '/api/leaderboard';
    const res = await apiFetch(url);
    if (!res.ok) return [];
    return res.json();
  },

  async getNews() {
    const res = await apiFetch('/api/news');
    return res.json();
  },

  async getNewsBySlug(slug: string) {
    const res = await apiFetch(`/api/news/${slug}`);
    if (!res.ok) return null;
    return res.json();
  },

  async getRules() {
    const res = await apiFetch('/api/rules');
    return res.json();
  },

  async getJobs() {
    const res = await apiFetch('/api/jobs');
    return res.json();
  },

  async getJob(id: string) {
    const res = await apiFetch(`/api/jobs/${id}`);
    if (!res.ok) return null;
    return res.json();
  },

  async getMyJobApplications() {
    const res = await apiFetch('/api/jobs/applications/me');
    if (!res.ok) return [];
    return res.json();
  },

  async checkJobApplication(jobId: string) {
    const res = await apiFetch(`/api/jobs/applications/check/${jobId}`);
    if (!res.ok) return { hasApplied: false, application: null };
    return res.json();
  },

  async submitJobApplication(jobId: string, data: {
    characterName: string;
    characterAge: number;
    experience: string;
    dailyAvailability: string;
    answers?: Record<string, any>;
  }) {
    const res = await apiFetch(`/api/jobs/${jobId}/applications`, {
      method: 'POST',
      body: JSON.stringify(data)
    });
    const json = await res.json();
    if (!res.ok) {
      throw new Error(json.error || 'Failed to submit application');
    }
    return json;
  },

  async getProducts() {
    const res = await apiFetch('/api/products');
    return res.json();
  },

  async getFAQ() {
    const res = await apiFetch('/api/faq');
    return res.json();
  },

  async getSocialLinks() {
    const res = await apiFetch('/api/social-links');
    return res.json();
  },

  async getOrders() {
    const res = await apiFetch('/api/orders');
    return res.json();
  },

  async checkoutOrder(productId: string) {
    const res = await apiFetch('/api/orders/checkout', {
      method: 'POST',
      body: JSON.stringify({ productId })
    });
    return res.json();
  },

  async getTickets() {
    const res = await apiFetch('/api/tickets');
    return res.json();
  },

  async getTicket(id: string) {
    const res = await apiFetch(`/api/tickets/${id}`);
    if (!res.ok) return null;
    return res.json();
  },

  async createTicket(data: { subject: string; category: string; priority: string; message: string }) {
    const res = await apiFetch('/api/tickets', {
      method: 'POST',
      body: JSON.stringify(data)
    });
    return res.json();
  },

  async sendTicketMessage(ticketId: string, message: string) {
    const res = await apiFetch(`/api/tickets/${ticketId}/messages`, {
      method: 'POST',
      body: JSON.stringify({ message })
    });
    return res.json();
  },

  async updateTicketStatus(ticketId: string, status: string) {
    const res = await apiFetch(`/api/tickets/${ticketId}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status })
    });
    return res.json();
  },

  // Reports
  async getReports() {
    const res = await apiFetch('/api/reports');
    if (!res.ok) return [];
    return res.json();
  },

  async getReport(id: string) {
    const res = await apiFetch(`/api/reports/${id}`);
    if (!res.ok) return null;
    return res.json();
  },

  async createReport(data: { category: string; reason: string; targetId?: string; targetName?: string }) {
    const res = await apiFetch('/api/reports', {
      method: 'POST',
      body: JSON.stringify(data)
    });
    return res.json();
  },

  async updateReportStatus(id: string, status: string, notes?: string) {
    const res = await apiFetch(`/api/reports/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status, notes })
    });
    return res.json();
  },

  async getNotifications() {
    const res = await apiFetch('/api/notifications');
    return res.json();
  },

  async markNotificationRead(id: string) {
    const res = await apiFetch(`/api/notifications/${id}/read`, { method: 'PATCH' });
    return res.json();
  },

  // Admin APIs
  async getAdminOverview() {
    const res = await apiFetch('/api/admin/overview');
    return res.json();
  },

  async getAdminUsers() {
    const res = await apiFetch('/api/admin/users');
    return res.json();
  },

  async updateUserRole(id: string, role: string, permissions?: string[]) {
    const res = await apiFetch(`/api/admin/users/${id}/role`, {
      method: 'PATCH',
      body: JSON.stringify({ role, permissions })
    });
    return res.json();
  },

  async assignUserRole(identifier: string, role: string, permissions?: string[]) {
    const res = await apiFetch('/api/admin/users/assign-role', {
      method: 'POST',
      body: JSON.stringify({ identifier, role, permissions })
    });
    return res.json();
  },

  async updateUserStatus(id: string, status: string) {
    const res = await apiFetch(`/api/admin/users/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status })
    });
    return res.json();
  },

  async getAdminNews() {
    const res = await apiFetch('/api/admin/news');
    return res.json();
  },

  async saveNewsCMS(data: any) {
    const res = await apiFetch('/api/admin/news', {
      method: 'POST',
      body: JSON.stringify(data)
    });
    return res.json();
  },

  async deleteNewsCMS(id: string) {
    const res = await apiFetch(`/api/admin/news/${id}`, { method: 'DELETE' });
    return res.json();
  },

  async saveRuleCMS(data: any) {
    const res = await apiFetch('/api/admin/rules', {
      method: 'POST',
      body: JSON.stringify(data)
    });
    return res.json();
  },

  async deleteRuleCMS(id: string) {
    const res = await apiFetch(`/api/admin/rules/${id}`, {
      method: 'DELETE'
    });
    return res.json();
  },

  async saveJobCMS(data: any) {
    const res = await apiFetch('/api/admin/jobs', {
      method: 'POST',
      body: JSON.stringify(data)
    });
    return res.json();
  },

  async deleteJobCMS(id: string) {
    const res = await apiFetch(`/api/admin/jobs/${id}`, {
      method: 'DELETE'
    });
    return res.json();
  },

  async getAdminJobApplications(filters?: { status?: string; jobId?: string }) {
    let url = '/api/admin/job-applications';
    const params = new URLSearchParams();
    if (filters?.status) params.append('status', filters.status);
    if (filters?.jobId) params.append('jobId', filters.jobId);
    if (params.toString()) url += `?${params.toString()}`;

    const res = await apiFetch(url);
    if (!res.ok) return [];
    return res.json();
  },

  async getAdminJobApplication(id: string) {
    const res = await apiFetch(`/api/admin/job-applications/${id}`);
    if (!res.ok) return null;
    return res.json();
  },

  async updateAdminJobApplicationStatus(id: string, status: string, reviewNotes?: string) {
    const res = await apiFetch(`/api/admin/job-applications/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status, reviewNotes })
    });
    const json = await res.json();
    if (!res.ok) {
      throw new Error(json.error || 'Failed to update application status');
    }
    return json;
  },

  async saveProductCMS(data: any) {
    const res = await apiFetch('/api/admin/products', {
      method: 'POST',
      body: JSON.stringify(data)
    });
    return res.json();
  },

  async deleteProductCMS(id: string) {
    const res = await apiFetch(`/api/admin/products/${id}`, {
      method: 'DELETE'
    });
    return res.json();
  },

  async getAdminFAQ() {
    const res = await apiFetch('/api/admin/faq');
    return res.json();
  },

  async saveFAQ(data: any) {
    const res = await apiFetch('/api/admin/faq', {
      method: 'POST',
      body: JSON.stringify(data)
    });
    return res.json();
  },

  async deleteFAQ(id: string) {
    const res = await apiFetch(`/api/admin/faq/${id}`, { method: 'DELETE' });
    return res.json();
  },

  async saveSocialLink(data: any) {
    const res = await apiFetch('/api/admin/social-links', {
      method: 'POST',
      body: JSON.stringify(data)
    });
    return res.json();
  },

  async deleteSocialLink(id: string) {
    const res = await apiFetch(`/api/admin/social-links/${id}`, { method: 'DELETE' });
    return res.json();
  },

  async getAuditLogs() {
    const res = await apiFetch('/api/admin/audit-logs');
    return res.json();
  },

  async getAdminLeaderboard(category?: string) {
    const url = category ? `/api/admin/leaderboard?category=${encodeURIComponent(category)}` : '/api/admin/leaderboard';
    const res = await apiFetch(url);
    if (!res.ok) return [];
    return res.json();
  },

  async saveLeaderboardItem(data: any) {
    const res = await apiFetch('/api/admin/leaderboard', {
      method: 'POST',
      body: JSON.stringify(data)
    });
    return res.json();
  },

  async deleteLeaderboardItem(id: string) {
    const res = await apiFetch(`/api/admin/leaderboard/${id}`, { method: 'DELETE' });
    return res.json();
  },

  async getRolesConfig() {
    const res = await apiFetch('/api/admin/roles-config');
    return res.json();
  },

  async saveRolesConfig(data: any) {
    const res = await apiFetch('/api/admin/roles-config', {
      method: 'POST',
      body: JSON.stringify(data)
    });
    return res.json();
  },

  async saveHomepageCMS(data: any) {
    const res = await apiFetch('/api/admin/homepage', {
      method: 'POST',
      body: JSON.stringify(data)
    });
    return res.json();
  },

  async updateSettings(data: any) {
    const res = await apiFetch('/api/admin/settings', {
      method: 'POST',
      body: JSON.stringify(data)
    });
    return res.json();
  }
};

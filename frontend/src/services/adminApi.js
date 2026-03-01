/**
 * Admin API service — apeluri backend pentru panoul de administrare.
 */
import api from './api';

export const adminApi = {
  // ── Statistici ──────────────────────────────────────────
  getStats: () => api.get('/admin/stats'),

  // ── Utilizatori ─────────────────────────────────────────
  getUsers: (params = {}) => api.get('/admin/users', { params }),
  getUser: (id) => api.get(`/admin/users/${id}`),
  updateUser: (id, data) => api.patch(`/admin/users/${id}`, data),
  deleteUser: (id) => api.delete(`/admin/users/${id}`),
};

/**
 * Axios instance configurată cu withCredentials
 * pentru a trimite/primi cookie-urile HTTP-only automat.
 */
import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  withCredentials: true, // CRUCIAL: trimite cookie-urile la fiecare request
  headers: {
    'Content-Type': 'application/json',
  },
});

// ── Interceptor: refresh automat la 401 ──────────────────────
// NU face refresh pe rutele de auth (me, refresh, login, register)
const AUTH_ROUTES = ['/auth/me', '/auth/refresh', '/auth/login', '/auth/register'];

let isRefreshing = false;
let failedQueue = [];

const processQueue = (error) => {
  failedQueue.forEach((prom) => {
    if (error) prom.reject(error);
    else prom.resolve();
  });
  failedQueue = [];
};

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    const requestUrl = originalRequest?.url || '';

    // Nu încerca refresh pe rutele de auth — previne loop-ul infinit
    const isAuthRoute = AUTH_ROUTES.some((route) => requestUrl.includes(route));
    if (isAuthRoute || originalRequest._retry) {
      return Promise.reject(error);
    }

    if (error.response?.status === 401) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        }).then(() => api(originalRequest));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        await axios.post('/api/auth/refresh', {}, { withCredentials: true });
        processQueue(null);
        return api(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError);
        // Nu redirecționa — lasă AuthContext să gestioneze starea
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

export default api;

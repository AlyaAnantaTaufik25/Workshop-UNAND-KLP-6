import axios from 'axios';

export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api/v1';
export const TOKEN_KEY = 'workshop-unand:token';
export const USER_KEY = 'workshop-unand:user';

export function getToken() {
  try { return localStorage.getItem(TOKEN_KEY); } catch { return null; }
}

export function setSession(token, user) {
  try {
    if (token) localStorage.setItem(TOKEN_KEY, token);
    if (user) localStorage.setItem(USER_KEY, JSON.stringify(user));
  } catch { /* penyimpanan browser tidak tersedia */ }
}

export function clearSession() {
  try {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
  } catch { /* abaikan */ }
}

export function readStoredUser() {
  try { return JSON.parse(localStorage.getItem(USER_KEY)); } catch { return null; }
}

const client = axios.create({ baseURL: API_BASE_URL, timeout: 30000 });

client.interceptors.request.use(config => {
  const token = getToken();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

/**
 * Error API yang dinormalisasi: message berbahasa Indonesia dari backend,
 * status HTTP, dan `state` (kode status presensi peserta bila ada).
 */
export class ApiError extends Error {
  constructor(message, status, errors = []) {
    super(message);
    this.status = status;
    this.errors = errors;
    this.state = errors.find(e => e && typeof e === 'object' && e.state)?.state;
  }
}

client.interceptors.response.use(
  response => response.data?.data,
  error => {
    const status = error.response?.status || 0;
    const body = error.response?.data;
    if (status === 401 && getToken()) {
      clearSession();
      if (window.location.pathname !== '/') window.location.assign('/');
    }
    const message = body?.message
      || (status === 0 ? 'Tidak dapat terhubung ke server. Pastikan backend berjalan.' : 'Terjadi kesalahan pada server.');
    const details = Array.isArray(body?.errors) ? body.errors : [];
    const readable = details.filter(e => typeof e === 'string' && !e.includes('\n    at '));
    return Promise.reject(new ApiError(status === 422 && readable.length && message === 'Validasi gagal' ? readable.join(', ') : message, status, details));
  },
);

export default client;

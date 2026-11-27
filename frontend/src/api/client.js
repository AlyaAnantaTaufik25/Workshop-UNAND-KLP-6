import axios from 'axios';

export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api/v1';

/**
 * Sesi login memakai cookie httpOnly dari server (tidak bisa dibaca JavaScript,
 * sehingga tidak bisa dicuri lewat XSS). Browser hanya menyimpan CACHE profil
 * (bukan token) agar antarmuka langsung tampil saat dibuka ulang.
 */
export const USER_KEY = 'workshop-unand:user';
const LEGACY_TOKEN_KEY = 'workshop-unand:token';

// Bersihkan token lama dari versi sebelum cookie httpOnly
try { localStorage.removeItem(LEGACY_TOKEN_KEY); } catch { /* abaikan */ }

export function storeUser(user) {
  try { if (user) localStorage.setItem(USER_KEY, JSON.stringify(user)); } catch { /* penyimpanan tidak tersedia */ }
}

export function clearSession() {
  try { localStorage.removeItem(USER_KEY); } catch { /* abaikan */ }
}

export function readStoredUser() {
  try { return JSON.parse(localStorage.getItem(USER_KEY)); } catch { return null; }
}

const client = axios.create({ baseURL: API_BASE_URL, timeout: 30000, withCredentials: true });

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
  // Unduhan berkas (blob) dikembalikan utuh; JSON dikembalikan bagian `data`-nya
  response => (response.config.responseType === 'blob' ? response.data : response.data?.data),
  async error => {
    const status = error.response?.status || 0;
    let body = error.response?.data;
    if (body instanceof Blob) { try { body = JSON.parse(await body.text()); } catch { body = null; } }
    const url = error.config?.url || '';
    // Sesi kedaluwarsa saat memakai aplikasi → kembali ke halaman masuk
    if (status === 401 && readStoredUser() && !url.includes('/auth/')) {
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

/** Unduh berkas dari API (mis. PDF) lalu simpan dengan nama tertentu */
export async function downloadFile(path, filename) {
  const blob = await client.get(path, { responseType: 'blob' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export default client;

import { API_BASE_URL } from './client';
import { toast } from '../components/Dialog';

/**
 * Satu koneksi Server-Sent Events bersama untuk seluruh aplikasi.
 * Dibuka saat ada pelanggan pertama, ditutup saat pelanggan terakhir pergi.
 * Browser otomatis menyambung ulang bila koneksi terputus.
 */
const listeners = new Set();
let source = null;
let connected = false;

function open() {
  if (source || typeof EventSource === 'undefined') return;
  source = new EventSource(`${API_BASE_URL}/notifications/stream`, { withCredentials: true });
  source.addEventListener('ready', () => { connected = true; });
  source.addEventListener('notification', event => {
    let payload = null;
    try { payload = JSON.parse(event.data); } catch { return; }
    // Satu toast per notifikasi (bukan per komponen pelanggan)
    toast(payload.judul, { tone: 'info' });
    listeners.forEach(fn => fn(payload));
  });
  source.onerror = () => { connected = false; };
}

function close() {
  if (source) source.close();
  source = null;
  connected = false;
}

/** Berlangganan notifikasi baru; mengembalikan fungsi berhenti berlangganan */
export function subscribeNotifications(fn) {
  listeners.add(fn);
  open();
  return () => {
    listeners.delete(fn);
    if (!listeners.size) close();
  };
}

export const isRealtimeConnected = () => connected;

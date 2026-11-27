import { useCallback, useEffect, useState } from 'react';
import { notificationsApi } from '../api';
import { subscribeNotifications } from '../api/realtime';
import useAutoRefresh from './useAutoRefresh';

/**
 * Notifikasi user login (pribadi + per peran/instansi) dari backend.
 * Notifikasi baru datang real-time (SSE); polling 2 menit hanya cadangan.
 * onNew dipanggil setiap ada notifikasi baru (mis. untuk memuat ulang data halaman).
 */
export default function useNotifications({ onNew } = {}) {
  const [items, setItems] = useState([]);

  const reload = useCallback(async () => {
    try { setItems(await notificationsApi.list()); } catch { /* notifikasi tidak kritis */ }
  }, []);

  // oxlint-disable-next-line react/set-state-in-effect -- ambil data dari server (sinkronisasi sistem eksternal)
  useEffect(() => { reload(); }, [reload]);
  useEffect(() => subscribeNotifications(payload => { reload(); onNew?.(payload); }), [reload, onNew]);
  useAutoRefresh(reload, { interval: 120000, minGap: 10000 });

  const markRead = useCallback(async id => {
    try { await notificationsApi.markRead(id); } catch { /* abaikan */ }
    reload();
  }, [reload]);

  return { items, unread: items.filter(n => n.belumDibaca).length, markRead, reload };
}

import { useCallback, useEffect, useState } from 'react';
import { notificationsApi } from '../api';

/** Notifikasi user login (pribadi + per role) dari backend */
export default function useNotifications() {
  const [items, setItems] = useState([]);

  const reload = useCallback(async () => {
    try { setItems(await notificationsApi.list()); } catch { /* notifikasi tidak kritis */ }
  }, []);

  useEffect(() => { reload(); }, [reload]);

  const markRead = useCallback(async id => {
    try { await notificationsApi.markRead(id); } catch { /* abaikan */ }
    reload();
  }, [reload]);

  return { items, unread: items.filter(n => n.belumDibaca).length, markRead, reload };
}

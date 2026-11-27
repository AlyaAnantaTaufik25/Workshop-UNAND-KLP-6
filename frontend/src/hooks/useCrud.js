import { useCallback, useState } from 'react';
import useApi from './useApi';

/**
 * Daftar data + aksi CRUD ke API. Setiap aksi memuat ulang daftar
 * dan menyimpan pesan error di `actionError` (bukan melempar).
 *
 *   const { items, create, update, remove, actionError } = useCrud(partnersApi);
 */
export default function useCrud(api, listFn, deps = []) {
  const { data, loading, error, reload } = useApi(listFn || (() => api.list()), deps, []);
  const [actionError, setActionError] = useState('');

  const run = useCallback(async fn => {
    try {
      const result = await fn();
      setActionError('');
      await reload();
      return result ?? true;
    } catch (err) {
      setActionError(err.message || 'Aksi gagal.');
      return false;
    }
  }, [reload]);

  return {
    items: data || [],
    data,
    loading,
    error,
    reload,
    actionError,
    setActionError,
    run,
    create: body => run(() => api.create(body)),
    update: (id, body) => run(() => api.update(id, body)),
    remove: id => run(() => api.remove(id)),
  };
}

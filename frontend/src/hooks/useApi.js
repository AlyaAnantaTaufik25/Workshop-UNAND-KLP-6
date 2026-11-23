import { useCallback, useEffect, useRef, useState } from 'react';

/**
 * Memanggil fungsi API saat komponen dimuat (dan saat deps berubah).
 * Mengembalikan { data, setData, loading, error, reload }.
 *
 *   const { data: kegiatan = [], loading, reload } = useApi(() => workshopsApi.list(), []);
 */
export default function useApi(fetcher, deps = [], initial = undefined) {
  const [data, setData] = useState(initial);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const active = useRef(true);
  const fetchRef = useRef(fetcher);
  fetchRef.current = fetcher;

  const reload = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await fetchRef.current();
      if (active.current) setData(result);
      return result;
    } catch (err) {
      if (active.current) setError(err);
      return undefined;
    } finally {
      if (active.current) setLoading(false);
    }
  }, []);

  useEffect(() => {
    active.current = true;
    reload();
    return () => { active.current = false; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  return { data, setData, loading, error, reload };
}

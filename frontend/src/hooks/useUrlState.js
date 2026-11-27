import { useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';

/**
 * State yang tersimpan di query URL (?key=nilai), mis. filter & pencarian tabel.
 * Filter tetap ada saat kembali dari halaman detail, di-refresh, atau dibagikan tautannya.
 * Nilai sama dengan `initial` tidak ditulis ke URL agar tetap bersih.
 */
export default function useUrlState(key, initial = '') {
  const [params, setParams] = useSearchParams();
  const value = params.has(key) ? params.get(key) : initial;

  const setValue = useCallback(next => {
    setParams(prev => {
      const current = prev.has(key) ? prev.get(key) : initial;
      const resolved = typeof next === 'function' ? next(current) : next;
      const out = new URLSearchParams(prev);
      if (resolved === initial || resolved === '' || resolved === null || resolved === undefined) out.delete(key);
      else out.set(key, String(resolved));
      return out;
    }, { replace: true });
  }, [key, initial, setParams]);

  return [value, setValue];
}

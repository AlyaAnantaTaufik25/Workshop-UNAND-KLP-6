import { useEffect, useState } from 'react';

/** Nilai yang baru berubah setelah pengguna berhenti mengetik selama `delay` ms */
export default function useDebouncedValue(value, delay = 300) {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return debounced;
}

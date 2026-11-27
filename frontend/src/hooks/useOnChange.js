import { useState } from 'react';

/**
 * Jalankan `onChange` saat `value` berubah — selama render, bukan di useEffect.
 * Pola yang dianjurkan React untuk "reset/sesuaikan state ketika props berubah"
 * (mis. tutup menu saat pindah halaman, salin data baru dari server ke state lokal),
 * tanpa render berantai dari setState di dalam effect.
 * `onChange` hanya boleh mengubah state milik komponen yang sama.
 */
export default function useOnChange(value, onChange) {
  const [previous, setPrevious] = useState(value);
  if (!Object.is(previous, value)) {
    setPrevious(value);
    onChange(value, previous);
  }
}

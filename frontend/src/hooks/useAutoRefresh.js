import { useEffect, useRef } from 'react';

/**
 * Memperbarui data otomatis tanpa reload halaman:
 *  - saat tab/jendela kembali aktif (dibatasi minGap agar tidak beruntun), dan
 *  - berkala setiap `interval` ms selama tab terlihat (0 = tidak berkala).
 * `refresh` sebaiknya "diam" (tidak memunculkan loading penuh).
 */
export default function useAutoRefresh(refresh, { interval = 0, minGap = 15000, enabled = true } = {}) {
  const fn = useRef(refresh);
  useEffect(() => { fn.current = refresh; });

  useEffect(() => {
    if (!enabled) return undefined;
    let last = Date.now();
    const run = () => {
      if (document.visibilityState !== 'visible') return;
      if (Date.now() - last < minGap) return;
      last = Date.now();
      Promise.resolve(fn.current()).catch(() => {});
    };
    const onVisible = () => run();
    document.addEventListener('visibilitychange', onVisible);
    window.addEventListener('focus', onVisible);
    const timer = interval > 0 ? setInterval(() => { last = 0; run(); }, interval) : null;
    return () => {
      document.removeEventListener('visibilitychange', onVisible);
      window.removeEventListener('focus', onVisible);
      if (timer) clearInterval(timer);
    };
  }, [interval, minGap, enabled]);
}

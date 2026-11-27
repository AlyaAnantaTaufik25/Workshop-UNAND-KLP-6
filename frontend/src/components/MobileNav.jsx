import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import useOnChange from '../hooks/useOnChange';

/**
 * Navigasi sidebar untuk layar kecil (≤ 900px): sidebar disembunyikan
 * dan dibuka lewat tombol menu di header. Tertutup otomatis saat pindah halaman.
 */
// eslint-disable-next-line react-refresh/only-export-components
export function useMobileNav() {
  const [open, setOpen] = useState(false);
  const location = useLocation();

  useOnChange(location.pathname, () => setOpen(false));
  useEffect(() => {
    if (!open) return undefined;
    const onKey = e => { if (e.key === 'Escape') setOpen(false); };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open]);

  const toggle = (
    <button type="button" className="ui-nav-toggle" aria-label={open ? 'Tutup menu' : 'Buka menu'} aria-expanded={open} onClick={() => setOpen(v => !v)}>
      {open ? <X size={20} /> : <Menu size={20} />}
    </button>
  );
  const overlay = open ? <button type="button" className="ui-nav-overlay" aria-label="Tutup menu" tabIndex={-1} onClick={() => setOpen(false)} /> : null;

  return { navOpen: open, navClass: open ? ' nav-open' : '', toggle, overlay };
}

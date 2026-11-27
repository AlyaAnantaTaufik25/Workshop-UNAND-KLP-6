import { useCallback, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { dialog } from '../components/Dialog';

const DEFAULT_MESSAGE = 'Perubahan yang Anda isi belum disimpan dan akan hilang jika keluar dari halaman ini.';

/** Tanya konfirmasi sebelum membuang perubahan yang belum disimpan */
export function confirmDiscard(message = DEFAULT_MESSAGE) {
  return dialog.confirm({
    title: 'Tinggalkan tanpa menyimpan?',
    message,
    confirmText: 'Ya, buang perubahan',
    cancelText: 'Lanjut mengisi',
    tone: 'warning',
  });
}

/**
 * Lindungi form yang belum disimpan.
 *  - Menutup/refresh tab → peringatan bawaan browser.
 *  - Klik tautan di aplikasi (menu sidebar, dll.) → dialog konfirmasi.
 * Mengembalikan `guard(fn)` untuk membungkus aksi tutup/batal:
 *   onClose={guard(onClose)}
 */
export default function useUnsavedChanges(dirty, message = DEFAULT_MESSAGE) {
  const navigate = useNavigate();
  const dirtyRef = useRef(dirty);
  useEffect(() => { dirtyRef.current = dirty; }, [dirty]);

  useEffect(() => {
    if (!dirty) return undefined;
    const onBeforeUnload = e => { e.preventDefault(); e.returnValue = ''; };
    const onClick = async e => {
      if (!dirtyRef.current || e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      const a = e.target.closest?.('a[href]');
      if (!a || a.target === '_blank' || a.hasAttribute('download')) return;
      const url = new URL(a.href, window.location.href);
      if (url.origin !== window.location.origin) return;
      if (url.pathname === window.location.pathname && url.search === window.location.search) return;
      e.preventDefault();
      e.stopPropagation();
      if (await confirmDiscard(message)) {
        dirtyRef.current = false;
        navigate(url.pathname + url.search + url.hash);
      }
    };
    window.addEventListener('beforeunload', onBeforeUnload);
    document.addEventListener('click', onClick, true);
    return () => {
      window.removeEventListener('beforeunload', onBeforeUnload);
      document.removeEventListener('click', onClick, true);
    };
  }, [dirty, message, navigate]);

  return useCallback(fn => async (...args) => {
    if (dirtyRef.current && !(await confirmDiscard(message))) return;
    dirtyRef.current = false;
    return fn?.(...args);
  }, [message]);
}

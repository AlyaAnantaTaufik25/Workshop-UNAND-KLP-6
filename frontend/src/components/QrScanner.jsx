import { useEffect, useId, useRef, useState } from 'react';
import { CameraOff, LoaderCircle, X } from 'lucide-react';
import { parsePresensiQr } from '../utils/presensiQr';
import './qr.css';

/**
 * Pemindai QR berbasis kamera (html5-qrcode dimuat saat dibutuhkan).
 * onResult menerima { code, workshop } hasil parsePresensiQr.
 */
export default function QrScanner({ onResult, onClose }) {
  const regionId = `qr-region-${useId().replace(/[^a-zA-Z0-9_-]/g, '')}`;
  const [status, setStatus] = useState('starting'); // starting | scanning | error
  const [message, setMessage] = useState('');
  const done = useRef(false);

  useEffect(() => {
    let scanner;
    let cancelled = false;
    (async () => {
      try {
        const { Html5Qrcode } = await import('html5-qrcode');
        if (cancelled) return;
        scanner = new Html5Qrcode(regionId, { verbose: false });
        await scanner.start(
          { facingMode: 'environment' },
          { fps: 10, qrbox: (w, h) => { const s = Math.floor(Math.min(w, h) * 0.7); return { width: s, height: s }; } },
          text => {
            if (done.current) return;
            const parsed = parsePresensiQr(text);
            if (!parsed.code) return;
            done.current = true;
            onResult(parsed);
          },
          () => {}
        );
        if (cancelled) { scanner.stop().catch(() => {}); return; }
        setStatus('scanning');
      } catch (err) {
        if (cancelled) return;
        setStatus('error');
        const name = err?.name || String(err);
        setMessage(/NotAllowed|Permission/i.test(name)
          ? 'Akses kamera ditolak. Izinkan kamera di pengaturan situs, atau ketik kode secara manual.'
          : /NotFound|Requested device/i.test(name)
            ? 'Kamera tidak ditemukan di perangkat ini. Ketik kode presensi secara manual.'
            : 'Kamera tidak dapat dibuka. Pastikan situs dibuka lewat HTTPS atau localhost.');
      }
    })();
    return () => {
      cancelled = true;
      if (scanner?.isScanning) scanner.stop().then(() => scanner.clear()).catch(() => {});
    };
  }, [regionId, onResult]);

  return (
    <div className="qrs">
      <div className="qrs-head">
        <strong>Pindai QR presensi</strong>
        <button type="button" className="qrp-close" onClick={onClose} aria-label="Tutup pemindai"><X size={15} /></button>
      </div>
      <div className="qrs-view">
        <div id={regionId} className="qrs-region" />
        {status === 'starting' && <div className="qrs-overlay"><LoaderCircle className="peserta-spin" size={22} />Membuka kamera…</div>}
        {status === 'error' && <div className="qrs-overlay qrs-overlay--error"><CameraOff size={24} />{message}</div>}
      </div>
      <p className="qrs-hint">Arahkan kamera ke QR yang ditampilkan panitia. Kode akan terisi otomatis.</p>
    </div>
  );
}

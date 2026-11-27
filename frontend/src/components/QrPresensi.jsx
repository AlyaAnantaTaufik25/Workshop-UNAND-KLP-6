import { useEffect, useState } from 'react';
import QRCode from 'qrcode';
import { Download, Maximize2, X } from 'lucide-react';
import './qr.css';
import { presensiLink } from '../utils/presensiQr';


function useCountdown(expiresAt) {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, []);
  const left = Math.max(0, new Date(expiresAt).getTime() - now);
  const m = Math.floor(left / 60000);
  const s = Math.floor((left % 60000) / 1000);
  return { expired: left === 0, label: `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}` };
}

/** Kartu QR presensi untuk panitia: gambar QR, kode cadangan, hitung mundur, layar penuh, unduh */
export default function QrPresensi({ qr, slug, title, onClose, onRenew }) {
  const [src, setSrc] = useState('');
  const [full, setFull] = useState(false);
  const { expired, label } = useCountdown(qr.expiresAt);

  useEffect(() => {
    let alive = true;
    QRCode.toDataURL(presensiLink(slug, qr.token), { width: 640, margin: 1, errorCorrectionLevel: 'M', color: { dark: '#0f3d24', light: '#ffffff' } })
      .then(url => { if (alive) setSrc(url); });
    return () => { alive = false; };
  }, [slug, qr.token]);

  useEffect(() => {
    if (!full) return undefined;
    const onKey = e => { if (e.key === 'Escape') setFull(false); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [full]);

  const download = () => {
    const a = document.createElement('a');
    a.href = src;
    a.download = `qr-presensi-${slug}-${qr.token}.png`;
    a.click();
  };

  const body = (
    <>
      <div className={`qrp-image${expired ? ' is-expired' : ''}`}>
        {src ? <img src={src} alt={`QR presensi kode ${qr.token}`} /> : <span className="qrp-loading" />}
        {expired && <span className="qrp-expired-tag">Kedaluwarsa</span>}
      </div>
      <div className="qrp-info">
        <span className="qrp-eyebrow">Kode cadangan</span>
        <strong className="qrp-code">{qr.token}</strong>
        <span className={`qrp-timer${expired ? ' is-expired' : ''}`}>
          {expired ? 'Kode sudah tidak berlaku' : <>Berlaku <b>{label}</b> lagi</>}
        </span>
        <p className="qrp-hint">Peserta memindai QR dengan kamera ponsel atau tombol <em>Pindai QR</em> di halaman Workshop Saya, lalu menyertakan lokasi.</p>
      </div>
    </>
  );

  return (
    <>
      <div className="qrp-card">
        {body}
        <div className="qrp-actions">
          <button type="button" className="qrp-btn" onClick={() => setFull(true)} disabled={!src}><Maximize2 size={15} />Layar penuh</button>
          <button type="button" className="qrp-btn" onClick={download} disabled={!src}><Download size={15} />Unduh PNG</button>
          {expired && onRenew && <button type="button" className="qrp-btn qrp-btn--primary" onClick={onRenew}>Buat kode baru</button>}
          <button type="button" className="qrp-close" onClick={onClose} aria-label="Tutup kode"><X size={15} /></button>
        </div>
      </div>
      {full && (
        <div className="qrp-full" role="dialog" aria-modal="true" aria-label="QR presensi layar penuh" onClick={() => setFull(false)}>
          <div className="qrp-full-inner" onClick={e => e.stopPropagation()}>
            <p className="qrp-full-title">{title}</p>
            {body}
            <button type="button" className="qrp-btn" onClick={() => setFull(false)}><X size={15} />Tutup (Esc)</button>
          </div>
        </div>
      )}
    </>
  );
}

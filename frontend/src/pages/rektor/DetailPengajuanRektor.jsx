import { useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Eye,
  Check,
  PenTool,
  Eraser,
  Upload,
  ShieldCheck,
  X,
  FileText,
  Clock,
  CheckCircle2,
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { sertifikatData } from '../../data/mockData';
import { currentRektor } from './data';
import BackButton from '../../components/BackButton';
import UnandLogo from '../../components/UnandLogo';
import SignatureCanvas from '../../components/SignatureCanvas';

const statusClass = {
  'menunggu-rektor': 'badge badge-orange',
  'menunggu-mitra':  'badge badge-amber',
  'diterbitkan':     'badge badge-green',
};
const statusLabel = {
  'menunggu-rektor': 'Menunggu Rektor',
  'menunggu-mitra':  'Menunggu Mitra',
  'diterbitkan':     'Diterbitkan',
};

export default function DetailPengajuanRektor() {
  const { id }   = useParams();
  const navigate = useNavigate();

  const sert = sertifikatData.find(s => String(s.id) === id);

  // View mode: 'detail' | 'sign'
  const [viewMode, setViewMode] = useState('detail');

  // Status TTD Rektor
  const [signed, setSigned] = useState(sert?.statusTandaTangan === 'diterbitkan');
  const [signatureImg, setSignatureImg] = useState(null);
  const [waktuTtdRektor, setWaktuTtdRektor] = useState(
    sert?.statusTandaTangan === 'diterbitkan' ? '18 Mei 2026, 14.30 WIB' : null
  );

  // State untuk penandatanganan (Canvas, Tools, PIN)
  const [tool, setTool] = useState('pen'); // 'pen' | 'eraser'
  const [lineWidth, setLineWidth] = useState(3);
  const [color, setColor] = useState('#000000');
  const [stampImg, setStampImg] = useState(null);
  const [signPin, setSignPin] = useState('');
  const [signPinError, setSignPinError] = useState('');
  const [signPage, setSignPage] = useState(1);
  const [toastMsg, setToastMsg] = useState('');
  const canvasRef = useRef(null);

  const showToast = (msg) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(''), 3500);
  };

  if (!sert) {
    return (
      <div style={{ padding: '40px', textAlign: 'center', color: 'var(--gray-400)' }}>
        <p>Data tidak ditemukan.</p>
        <button
          onClick={() => navigate('/rektor/pengajuan')}
          style={{
            marginTop: '16px',
            color: 'var(--green-700)',
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            fontWeight: 600,
          }}
        >
          ← Kembali ke daftar
        </button>
      </div>
    );
  }

  const isMenungguRektor = !signed;

  const steps = [
    { label: 'Template oleh Humas', done: true },
    {
      label: 'Rektor UNAND',
      done: signed,
      statusText: signed ? 'Selesai ditandatangani' : 'Menunggu tanda tangan',
    },
    {
      label: 'Pimpinan Mitra',
      done: sert.statusTandaTangan === 'diterbitkan' || signed,
      statusText: signed ? 'Selesai' : 'Menunggu',
    },
    {
      label: 'Penerbitan oleh Sekretariat',
      done: signed,
      note: 'Setelah tanda tangan lengkap',
    },
  ];

  // Simpan / Proses Tanda Tangan Elektronik
  const handleProsesTTE = () => {
    const validPin = localStorage.getItem('rektor_pin') || '123456';
    if (!signPin || signPin.length !== 6) {
      setSignPinError('PIN harus 6 digit angka');
      return;
    }
    if (signPin !== validPin) {
      setSignPinError('PIN salah. Silakan coba lagi atau ubah PIN di menu Profil.');
      return;
    }
    if (canvasRef.current?.isEmpty()) {
      setSignPinError('Harap gambar tanda tangan terlebih dahulu pada canvas');
      return;
    }

    const waktuSekarang =
      new Date().toLocaleDateString('id-ID', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      }) + ' WIB';

    const dataUrl = canvasRef.current?.getDataURL();
    setSignatureImg(dataUrl);
    setWaktuTtdRektor(waktuSekarang);
    setSigned(true);

    // Reset state canvas
    canvasRef.current?.clear();
    setSignPin('');
    setSignPinError('');
    setStampImg(null);
    setSignPage(1);
    setViewMode('detail');

    showToast('Tanda tangan berhasil dibubuhkan. Sertifikat batch kegiatan telah ditandatangani secara resmi oleh Rektor UNAND.');
  };

  // Pratinjau PDF Sertifikat Resmi (Popup Window yang bisa dicetak/disimpan)
  const handlePratinjauPDF = () => {
    const printWindow = window.open('', '_blank', 'width=950,height=750');
    if (!printWindow) {
      alert('Harap izinkan pop-up browser untuk melihat atau mencetak pratinjau sertifikat PDF.');
      return;
    }

    const html = `<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="utf-8" />
  <title>Sertifikat_${sert.namaKegiatan.replace(/\\s+/g, '_')}</title>
  <style>
    * { box-sizing: border-box; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Arial, sans-serif;
      margin: 0; padding: 24px; background: #f8fafc; color: #111827;
    }
    .action-bar {
      position: sticky; top: 0; background: #ffffff; border-bottom: 2px solid #14532d;
      padding: 12px 24px; display: flex; justify-content: space-between; align-items: center;
      margin-bottom: 24px; border-radius: 8px; box-shadow: 0 4px 12px rgba(0,0,0,0.06);
    }
    .btn {
      padding: 8px 16px; border-radius: 6px; font-size: 13.5px; font-weight: 600; cursor: pointer; border: none;
    }
    .btn-print { background: #14532d; color: #ffffff; }
    .btn-close { background: #f1f5f9; color: #334155; border: 1px solid #cbd5e1; }
    .cert-frame {
      max-width: 900px; margin: 0 auto; background: #ffffff; border: 8px double #14532d;
      padding: 44px 50px; text-align: center; border-radius: 4px; box-shadow: 0 8px 30px rgba(0,0,0,0.08);
    }
    .univ-name { font-size: 16px; font-weight: 800; color: #14532d; letter-spacing: 0.5px; }
    .mitra-name { font-size: 13px; font-weight: 700; color: #4b5563; }
    .cert-title { font-size: 26px; font-weight: 900; color: #14532d; letter-spacing: 2px; margin: 16px 0 6px; }
    .cert-no { font-family: monospace; font-size: 13px; color: #64748b; margin-bottom: 20px; }
    .cert-giver { font-size: 14px; color: #475569; font-style: italic; margin-bottom: 8px; }
    .cert-name { font-size: 24px; font-weight: 800; color: #14532d; margin-bottom: 12px; }
    .cert-desc { font-size: 14px; color: #334155; max-width: 700px; margin: 0 auto 20px; line-height: 1.6; }
    .sig-row { display: flex; justify-content: space-around; margin-top: 36px; padding-top: 16px; border-top: 1px dashed #cbd5e1; }
    .sig-block { min-width: 220px; text-align: center; }
    .sig-role { font-weight: 700; font-size: 13px; color: #1e293b; margin-bottom: 6px; }
    .sig-space { min-height: 55px; display: flex; align-items: center; justify-content: center; }
    .sig-img { max-height: 50px; max-width: 160px; object-fit: contain; }
    .sig-name { font-weight: 700; font-size: 13.5px; color: #14532d; border-top: 1px solid #94a3b8; display: inline-block; padding-top: 4px; min-width: 170px; }
    .sig-status { font-size: 11px; color: #15803d; font-weight: 600; margin-top: 4px; }
    @media print {
      body { padding: 0; background: #fff; }
      .action-bar { display: none; }
      .cert-frame { box-shadow: none; border-width: 6px; }
    }
  </style>
</head>
<body>
  <div class="action-bar">
    <div style="font-weight: 700; color: #14532d;">Pratinjau Resmi Sertifikat UNAND</div>
    <div style="display: flex; gap: 10px;">
      <button class="btn btn-print" onclick="window.print()">Cetak / Simpan PDF</button>
      <button class="btn btn-close" onclick="window.close()">Tutup</button>
    </div>
  </div>
  <div class="cert-frame">
    <div class="univ-name">UNIVERSITAS ANDALAS</div>
    <div class="mitra-name">Mitra Kerja Sama: ${sert.penyelenggara}</div>
    <div class="cert-title">SERTIFIKAT PENGHARGAAN</div>
    <div class="cert-no">Nomor: ${sert.nomorSK || 'UNAND/CERT/2026/042'}</div>
    <div class="cert-giver">Diberikan Kepada:</div>
    <div class="cert-name">NADIA AMELIA</div>
    <div class="cert-desc">
      Atas partisipasi dan kontribusinya secara aktif sebagai peserta dalam kegiatan
      <strong>${sert.namaKegiatan}</strong> yang diselenggarakan oleh <strong>${sert.penyelenggara}</strong>
      bekerja sama dengan Universitas Andalas pada tanggal ${sert.tanggalPengajuan}.
    </div>
    <div class="sig-row">
      <div class="sig-block">
        <div class="sig-role">Rektor Universitas Andalas</div>
        <div class="sig-space">
          ${
            signed && signatureImg
              ? `<img src="${signatureImg}" class="sig-img" alt="TTD Rektor" />`
              : `<span style="font-family: cursive; font-size: 17px; color: #14532d; font-weight: bold;">${currentRektor.nama}</span>`
          }
        </div>
        <div class="sig-name">${currentRektor.nama}</div>
        <div class="sig-status">${signed ? '✓ Ditandatangani Elektronik' : 'Menunggu TTE'}</div>
      </div>
      <div class="sig-block">
        <div class="sig-role">Pimpinan Mitra Kerja Sama</div>
        <div class="sig-space">
          <span style="font-family: cursive; font-size: 15px; color: #14532d; font-weight: bold;">Pimpinan Mitra</span>
        </div>
        <div class="sig-name">${sert.penyelenggara}</div>
        <div class="sig-status">✓ Ditandatangani Elektronik</div>
      </div>
    </div>
  </div>
</body>
</html>`;

    printWindow.document.open();
    printWindow.document.write(html);
    printWindow.document.close();
  };

  // =========================================================================
  // VIEW MODE: SIGN (Canvas Tanda Tangan + Tools + PIN 6-Digit)
  // =========================================================================
  if (viewMode === 'sign') {
    return (
      <div>
        {/* Toast Notifikasi */}
        {toastMsg && (
          <div
            style={{
              position: 'fixed',
              bottom: 24,
              right: 24,
              zIndex: 1000,
              background: '#14532d',
              color: '#fff',
              padding: '12px 20px',
              borderRadius: 8,
              boxShadow: '0 8px 24px rgba(0,0,0,0.18)',
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              fontSize: 13,
              fontWeight: 600,
            }}
          >
            <Check size={16} /> {toastMsg}
          </div>
        )}

        {/* Header Tanda Tangan Template */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
          <div>
            <h2 style={{ margin: 0, fontSize: 22, fontWeight: 800, color: '#111827' }}>
              Tanda Tangan Template
            </h2>
            <p style={{ margin: '4px 0 0', fontSize: 13, color: '#6B7280' }}>
              Tandatangani dokumen sertifikat kegiatan: <strong>{sert.namaKegiatan}</strong>
            </p>
          </div>
          <span
            style={{
              fontSize: 12,
              fontWeight: 700,
              padding: '4px 10px',
              borderRadius: 20,
              background: signed ? '#DCFCE7' : '#FEF3C7',
              color: signed ? '#15803d' : '#B45309',
            }}
          >
            {signed ? 'Sudah Ditandatangani' : 'Belum Ditandatangani'}
          </span>
        </div>

        {/* Layout 2 Kolom (Canvas + Tools di kiri, Info di kanan) */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: 20, alignItems: 'start', marginTop: 12 }}>
          {/* SISI KIRI: Template Preview & Canvas */}
          <div style={{ border: '1px solid #E5E7EB', borderRadius: 10, background: '#fff', overflow: 'hidden' }}>
            {/* Panel title */}
            <div style={{ padding: '12px 16px', borderBottom: '1px solid #E5E7EB', fontWeight: 700, fontSize: 14, color: '#111827' }}>
              Template Preview & Canvas TTE
            </div>

            {/* Canvas area */}
            <div style={{ padding: '20px', background: '#f9fafb' }}>
              <div style={{ background: '#fff', border: '1px solid #d1d5db', borderRadius: 6, padding: 18, minHeight: 380, position: 'relative' }}>
                {/* Dokumen Teks Latar Belakang */}
                <div style={{ fontSize: 12, color: '#374151', lineHeight: 1.7 }}>
                  <div style={{ textAlign: 'center', borderBottom: '2px double #14532d', paddingBottom: 10, marginBottom: 14 }}>
                    <div style={{ fontWeight: 800, color: '#14532d', fontSize: 15 }}>UNIVERSITAS ANDALAS</div>
                    <div style={{ fontSize: 11, color: '#6B7280' }}>Mitra Kerja Sama: {sert.penyelenggara}</div>
                    <div style={{ fontWeight: 700, fontSize: 13, color: '#111827', marginTop: 6 }}>SERTIFIKAT PENGHARGAAN</div>
                  </div>
                  <p><strong>Ketentuan dan Pengesahan Digital:</strong></p>
                  <ol style={{ paddingLeft: 18, margin: '6px 0 12px' }}>
                    <li>Sertifikat ini diterbitkan secara sah dan berurutan oleh Universitas Andalas.</li>
                    <li>Tanda tangan digital Rektor mengesahkan partisipasi seluruh peserta dengan presensi valid.</li>
                    <li>Gunakan panel di bawah untuk menggambar tanda tangan fisik atau membubuhkan stempel resmi.</li>
                  </ol>
                  <div style={{ marginTop: 24, padding: 12, border: '1px dashed #cbd5e1', borderRadius: 6, background: '#f8fafc', textAlign: 'center', fontSize: 11, color: '#64748b' }}>
                    Area tanda tangan digital Rektor UNAND ({currentRektor.nama})
                  </div>
                </div>

                {/* Canvas Overlay tempat menggambar */}
                <div style={{ position: 'absolute', inset: 0, padding: 16 }}>
                  <SignatureCanvas ref={canvasRef} tool={tool} lineWidth={lineWidth} color={color} height="350px" />
                </div>

                {/* Stempel Overlay jika diupload */}
                {stampImg && (
                  <img
                    src={stampImg}
                    alt="Stempel UNAND"
                    style={{ position: 'absolute', right: 40, bottom: 40, width: 85, opacity: 0.88, pointerEvents: 'none' }}
                  />
                )}
              </div>
            </div>

            {/* Tools Bar */}
            <div style={{ padding: '10px 16px', borderTop: '1px solid #E5E7EB', display: 'flex', flexWrap: 'wrap', gap: 8, alignItems: 'center', background: '#fff' }}>
              {/* Pen */}
              <button
                type="button"
                onClick={() => setTool('pen')}
                style={{
                  padding: '5px 12px',
                  borderRadius: 6,
                  border: '1px solid #d1d5db',
                  background: tool === 'pen' ? '#14532d' : '#fff',
                  color: tool === 'pen' ? '#fff' : '#374151',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 5,
                  fontSize: 13,
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                <PenTool size={14} /> Pen
              </button>

              {/* Eraser */}
              <button
                type="button"
                onClick={() => setTool('eraser')}
                style={{
                  padding: '5px 12px',
                  borderRadius: 6,
                  border: '1px solid #d1d5db',
                  background: tool === 'eraser' ? '#14532d' : '#fff',
                  color: tool === 'eraser' ? '#fff' : '#374151',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 5,
                  fontSize: 13,
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                <Eraser size={14} /> Eraser
              </button>

              {/* Stempel Resmi */}
              <label
                style={{
                  padding: '5px 12px',
                  borderRadius: 6,
                  border: '1px solid #d1d5db',
                  background: '#fff',
                  color: '#374151',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 5,
                  fontSize: 13,
                  cursor: 'pointer',
                }}
              >
                <ShieldCheck size={14} /> Stempel
                <input
                  type="file"
                  accept="image/*"
                  style={{ display: 'none' }}
                  onChange={(e) => {
                    const file = e.target.files[0];
                    if (!file) return;
                    const reader = new FileReader();
                    reader.onload = (ev) => setStampImg(ev.target.result);
                    reader.readAsDataURL(file);
                  }}
                />
              </label>

              {/* Upload Gambar */}
              <label
                style={{
                  padding: '5px 12px',
                  borderRadius: 6,
                  border: '1px solid #d1d5db',
                  background: '#fff',
                  color: '#374151',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 5,
                  fontSize: 13,
                  cursor: 'pointer',
                }}
              >
                <Upload size={14} /> Upload Gambar
                <input
                  type="file"
                  accept="image/*"
                  style={{ display: 'none' }}
                  onChange={(e) => {
                    const file = e.target.files[0];
                    if (!file) return;
                    const reader = new FileReader();
                    reader.onload = (ev) => setStampImg(ev.target.result);
                    reader.readAsDataURL(file);
                  }}
                />
              </label>

              {/* Size Slider */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: '#374151', marginLeft: 6 }}>
                Size:
                <input
                  type="range"
                  min={1}
                  max={10}
                  value={lineWidth}
                  onChange={(e) => setLineWidth(Number(e.target.value))}
                  style={{ width: 70, accentColor: '#14532d' }}
                />
                {lineWidth}
              </div>

              {/* Color Picker */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: '#374151' }}>
                Color:
                <input
                  type="color"
                  value={color}
                  onChange={(e) => setColor(e.target.value)}
                  style={{ width: 30, height: 24, border: 'none', cursor: 'pointer', padding: 0 }}
                />
              </div>

              {/* Clear */}
              <button
                type="button"
                onClick={() => {
                  canvasRef.current?.clear();
                  setStampImg(null);
                }}
                style={{
                  marginLeft: 'auto',
                  color: '#dc2626',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  fontSize: 13,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 4,
                  fontWeight: 600,
                }}
              >
                <X size={14} /> Clear
              </button>
            </div>

            {/* PIN Digital Signature & Simpan TTD */}
            <div style={{ padding: '14px 18px', borderTop: '1px solid #E5E7EB', background: '#fff' }}>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 700, color: '#111827', marginBottom: 6 }}>
                PIN Digital Signature <span style={{ color: '#dc2626' }}>*</span>
              </label>
              <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                <div style={{ flex: 1 }}>
                  <input
                    type="password"
                    value={signPin}
                    maxLength={6}
                    placeholder="Masukkan 6-digit PIN (default: 123456)"
                    onChange={(e) => setSignPin(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '9px 12px',
                      border: '1px solid #d1d5db',
                      borderRadius: 6,
                      fontSize: 13,
                      boxSizing: 'border-box',
                    }}
                  />
                  {signPinError && (
                    <span style={{ fontSize: 12, color: '#dc2626', display: 'block', marginTop: 4 }}>
                      {signPinError}
                    </span>
                  )}
                </div>
                <button
                  type="button"
                  onClick={handleProsesTTE}
                  style={{
                    padding: '9px 20px',
                    background: '#16a34a',
                    color: '#fff',
                    border: 'none',
                    borderRadius: 6,
                    fontSize: 13,
                    fontWeight: 700,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6,
                    whiteSpace: 'nowrap',
                    boxShadow: '0 2px 6px rgba(22, 163, 74, 0.3)',
                  }}
                >
                  <Check size={15} /> Simpan TTD
                </button>
              </div>
            </div>

            {/* Pagination Preview */}
            <div style={{ padding: '10px 16px', borderTop: '1px solid #E5E7EB', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 13, color: '#374151' }}>
              <span>Halaman {signPage} dari 3</span>
              <div style={{ display: 'flex', gap: 8 }}>
                <button
                  type="button"
                  onClick={() => setSignPage((p) => Math.max(1, p - 1))}
                  disabled={signPage === 1}
                  style={{
                    padding: '5px 12px',
                    borderRadius: 6,
                    border: '1px solid #d1d5db',
                    background: signPage === 1 ? '#f3f4f6' : '#fff',
                    color: signPage === 1 ? '#9CA3AF' : '#374151',
                    cursor: signPage === 1 ? 'default' : 'pointer',
                    fontSize: 13,
                  }}
                >
                  <ChevronLeft size={14} style={{ verticalAlign: 'middle' }} /> Previous
                </button>
                <button
                  type="button"
                  onClick={() => setSignPage((p) => Math.min(3, p + 1))}
                  disabled={signPage === 3}
                  style={{
                    padding: '5px 12px',
                    borderRadius: 6,
                    border: '1px solid #d1d5db',
                    background: signPage === 3 ? '#f3f4f6' : '#fff',
                    color: signPage === 3 ? '#9CA3AF' : '#374151',
                    cursor: signPage === 3 ? 'default' : 'pointer',
                    fontSize: 13,
                  }}
                >
                  Next <ChevronRight size={14} style={{ verticalAlign: 'middle' }} />
                </button>
              </div>
            </div>
          </div>

          {/* SISI KANAN: Template Info & Petunjuk */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {/* Info card */}
            <div style={{ border: '1px solid #E5E7EB', borderRadius: 10, background: '#fff', padding: '18px' }}>
              <h3 style={{ margin: '0 0 14px', fontSize: 15, fontWeight: 700, color: '#111827' }}>Template Info</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10, fontSize: 13 }}>
                <div>
                  <span style={{ color: '#6B7280', fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.4px', fontWeight: 600 }}>Kegiatan</span>
                  <div style={{ fontWeight: 700, color: '#14532d', marginTop: 2 }}>{sert.namaKegiatan}</div>
                </div>
                <div>
                  <span style={{ color: '#6B7280', fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.4px', fontWeight: 600 }}>Status</span>
                  <div style={{ fontWeight: 700, color: signed ? '#15803d' : '#B45309', marginTop: 2 }}>
                    {signed ? 'Sudah Ditandatangani' : 'Belum Ditandatangani'}
                  </div>
                </div>
                <div>
                  <span style={{ color: '#6B7280', fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.4px', fontWeight: 600 }}>Jumlah Dokumen</span>
                  <div style={{ color: '#334155', marginTop: 2 }}>{sert.jumlahSertifikat} Sertifikat Peserta</div>
                </div>
                <div>
                  <span style={{ color: '#6B7280', fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.4px', fontWeight: 600 }}>Penyelenggara</span>
                  <div style={{ color: '#334155', marginTop: 2 }}>{sert.penyelenggara}</div>
                </div>
              </div>
            </div>

            {/* Petunjuk Penggunaan */}
            <div style={{ border: '1px solid #E5E7EB', borderRadius: 10, background: '#f8fafc', padding: '16px', fontSize: 12.5, color: '#4b5563', lineHeight: 1.6 }}>
              <div style={{ fontWeight: 700, color: '#1f2937', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 6 }}>
                <ShieldCheck size={16} color="#14532d" /> Petunjuk Penandatanganan
              </div>
              <ul style={{ paddingLeft: 18, margin: 0 }}>
                <li>Goreskan tanda tangan Anda pada canvas gambar menggunakan pen atau mouse/stylus.</li>
                <li>Upload stempel resmi UNAND bila diperlukan.</li>
                <li>Masukkan PIN 6-digit keamanan tanda tangan digital (default: <code>123456</code>).</li>
                <li>Klik tombol <strong>Simpan TTD</strong> untuk mengesahkan sertifikat batch ini.</li>
              </ul>
            </div>

            {/* Back button */}
            <button
              type="button"
              onClick={() => setViewMode('detail')}
              style={{
                padding: '9px 16px',
                border: '1px solid #d1d5db',
                borderRadius: 6,
                background: '#fff',
                color: '#374151',
                fontSize: 13,
                fontWeight: 600,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 6,
              }}
            >
              <ArrowLeft size={15} /> Kembali ke Detail
            </button>
          </div>
        </div>
      </div>
    );
  }

  // =========================================================================
  // VIEW MODE: DETAIL (Default View)
  // =========================================================================
  return (
    <div>
      {/* Toast Notifikasi */}
      {toastMsg && (
        <div
          style={{
            position: 'fixed',
            bottom: 24,
            right: 24,
            zIndex: 1000,
            background: '#14532d',
            color: '#fff',
            padding: '12px 20px',
            borderRadius: 8,
            boxShadow: '0 8px 24px rgba(0,0,0,0.18)',
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            fontSize: 13,
            fontWeight: 600,
          }}
        >
          <Check size={16} /> {toastMsg}
        </div>
      )}

      {/* Back button */}
      <BackButton to="/rektor/pengajuan" label="Kembali ke Daftar Pengajuan" />

      {/* Header Info */}
      <div className="detail-header" style={{ marginBottom: '20px' }}>
        <p className="detail-source-tag">Sumber {sert.sumber}</p>
        <div className="detail-title">
          {sert.namaKegiatan}
          <span className={signed ? 'badge badge-green' : statusClass[sert.statusTandaTangan]}>
            {signed ? 'Sudah Ditandatangani' : statusLabel[sert.statusTandaTangan]}
          </span>
        </div>
        <p className="detail-subtitle">
          {sert.jenis} · {sert.penyelenggara} · {sert.tanggalPengajuan}
        </p>
      </div>

      {/* Two Columns Layout */}
      <div className="detail-layout">
        {/* LEFT: Certificate Preview */}
        <div className="detail-preview-panel">
          <div className="detail-preview-header">
            <span className="detail-preview-label">Pratinjau Ilustrasi Sertifikat</span>
            <button className="btn-perbesar" type="button" onClick={handlePratinjauPDF}>
              <Eye size={14} /> Pratinjau PDF
            </button>
          </div>

          <div className="certificate-preview">
            <div className="certificate-doc">
              <div className="cert-header-row">
                <UnandLogo className="cert-logo" />
                <div className="cert-univ-name">
                  UNIVERSITAS<br />ANDALAS
                  <span style={{ display: 'block', fontSize: '10px', color: 'var(--gray-400)', fontWeight: 400, marginTop: '2px' }}>
                    Mitra Kerja Sama: {sert.penyelenggara}
                  </span>
                </div>
              </div>
              <p style={{ fontSize: '10px', color: 'var(--gray-400)', marginBottom: '18px' }}>
                Pratinjau ilustrasi sertifikat baku · Contoh peserta: Nadia Amelia
              </p>
              <p className="cert-title">SERTIFIKAT</p>
              <p className="cert-given">Diberikan kepada</p>
              <p className="cert-recipient">NADIA AMELIA</p>
              <p className="cert-participation">atas partisipasinya sebagai peserta dalam</p>
              <p className="cert-event-name">{sert.namaKegiatan}</p>
              <p className="cert-date-place">
                {sert.tanggalPengajuan} · Universitas Andalas
              </p>

              <div className="cert-signatures">
                {/* TTD Rektor UNAND */}
                <div className="cert-sig-item">
                  <p className="cert-sig-line">Rektor UNAND</p>
                  <div
                    style={{
                      minHeight: 40,
                      margin: '6px 16px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      borderBottom: '1px solid var(--gray-300)',
                    }}
                  >
                    {signed ? (
                      signatureImg ? (
                        <img
                          src={signatureImg}
                          alt="TTD Rektor"
                          style={{ maxHeight: 38, maxWidth: 140, objectFit: 'contain' }}
                        />
                      ) : (
                        <span style={{ fontFamily: 'cursive', fontSize: '15px', color: 'var(--green-900)', fontWeight: 700 }}>
                          {currentRektor.nama}
                        </span>
                      )
                    ) : (
                      <span
                        style={{
                          fontSize: '10px',
                          fontWeight: 700,
                          color: '#B45309',
                          background: '#FEF3C7',
                          border: '1px dashed #F59E0B',
                          borderRadius: 4,
                          padding: '3px 8px',
                        }}
                      >
                        AREA TANDA TANGAN REKTOR
                      </span>
                    )}
                  </div>
                  <p className="cert-sig-role" style={{ color: signed ? '#15803d' : 'var(--gray-500)', fontWeight: signed ? 700 : 500 }}>
                    {signed ? (waktuTtdRektor ? `✓ TTD Terverifikasi (${waktuTtdRektor})` : '✓ TTD Terverifikasi Digital') : 'Menunggu TTE Rektor'}
                  </p>
                </div>

                {/* TTD Pimpinan Mitra */}
                <div className="cert-sig-item">
                  <p className="cert-sig-line">Pimpinan Mitra</p>
                  <div
                    style={{
                      minHeight: 40,
                      margin: '6px 16px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      borderBottom: '1px solid var(--gray-300)',
                    }}
                  >
                    <span style={{ fontFamily: 'cursive', fontSize: '14px', color: 'var(--green-900)', fontWeight: 700 }}>
                      Pimpinan Mitra
                    </span>
                  </div>
                  <p className="cert-sig-role" style={{ color: '#15803d', fontWeight: 600 }}>
                    ✓ TTD Mitra Terverifikasi
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT: Document Info + Process + Signature Action */}
        <div className="detail-right-panel">
          {/* Card Info Dokumen */}
          <div className="info-card">
            <p className="info-card-title">Informasi dokumen</p>
            <div className="info-row">
              <span className="info-row-label">Template</span>
              <span className="info-row-value" style={{ fontSize: '12px' }}>{sert.template}</span>
            </div>
            <div className="info-row">
              <span className="info-row-label">Dokumen</span>
              <span className="info-row-value" style={{ color: 'var(--green-700)', fontWeight: 700 }}>
                {sert.jumlahSertifikat} sertifikat peserta hadir
              </span>
            </div>
            <div className="info-row">
              <span className="info-row-label">Penyelenggara</span>
              <span className="info-row-value">{sert.penyelenggara}</span>
            </div>
            <div className="info-row">
              <span className="info-row-label">Sumber</span>
              <span className="info-row-value">{sert.sumber}</span>
            </div>
          </div>

          {/* Card Urutan Proses */}
          <div className="process-card">
            <p className="process-card-title">Urutan proses - Sumber {sert.sumber}</p>
            {steps.map((step, i) => (
              <div className="process-step" key={i}>
                <div className={`process-step-num ${step.done ? 'step-done' : 'step-waiting'}`}>
                  {step.done ? <Check size={12} /> : i + 1}
                </div>
                <div className="process-step-info">
                  <p className="process-step-label">{step.label}</p>
                  <p className={`process-step-status${step.done ? ' done' : ''}`}>
                    {step.statusText ?? (step.done ? 'Selesai' : step.note ?? 'Menunggu')}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Action Card Rektor (Identik dengan Mitra) */}
          <div className="info-card" style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <p className="info-card-title" style={{ margin: 0 }}>Tindakan Pengesahan</p>
            <p style={{ fontSize: '12px', color: 'var(--gray-500)', margin: '0 0 4px' }}>
              Periksa isi dokumen sebelum membubuhkan tanda tangan elektronik dan PIN resmi.
            </p>

            {/* Tombol Pratinjau PDF Resmi */}
            <button
              type="button"
              className="btn-perbesar"
              onClick={handlePratinjauPDF}
              style={{
                width: '100%',
                justifyContent: 'center',
                padding: '9px 14px',
                border: '1px solid #cbd5e1',
                borderRadius: '6px',
                background: '#ffffff',
                color: '#334155',
                fontWeight: 600,
                fontSize: '13px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: 6,
              }}
            >
              <FileText size={15} /> Pratinjau PDF Resmi
            </button>

            {/* Tombol Tanda Tangan jika belum ditandatangani */}
            {!signed ? (
              <button
                type="button"
                className="btn-upload"
                onClick={() => {
                  setSignPin('');
                  setSignPinError('');
                  setStampImg(null);
                  setSignPage(1);
                  setTool('pen');
                  setViewMode('sign');
                }}
                style={{
                  width: '100%',
                  background: 'var(--green-900)',
                  color: 'white',
                  cursor: 'pointer',
                  border: 'none',
                  borderRadius: '6px',
                  padding: '11px 16px',
                  fontWeight: 700,
                  fontSize: '13.5px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 8,
                  boxShadow: '0 3px 10px rgba(20, 83, 45, 0.25)',
                }}
              >
                <ShieldCheck size={16} /> Konfirmasi dan Tanda Tangani
              </button>
            ) : (
              <div
                style={{
                  background: '#DCFCE7',
                  border: '1px solid #86EFAC',
                  borderRadius: 6,
                  padding: '12px 14px',
                  fontSize: '12.5px',
                  color: '#15803d',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  fontWeight: 600,
                }}
              >
                <CheckCircle2 size={18} />
                <span>Sertifikat batch kegiatan telah ditandatangani secara resmi oleh Rektor UNAND.</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

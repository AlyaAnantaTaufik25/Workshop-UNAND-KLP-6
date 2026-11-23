import React, { useState, useRef, useEffect, forwardRef, useImperativeHandle } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Check, PenTool, Eraser, Stamp, Upload, X, ArrowLeft, ChevronLeft, ChevronRight } from 'lucide-react';
import { usePortalData } from '../../context/PortalData';
import { certificatesApi } from '../../api';

/**
 * Canvas component that supports pen and eraser tools.
 * Exposes `getDataURL()` and `clear()` via ref.
 */
const SignatureCanvas = forwardRef(({ tool }, ref) => {
  const canvasRef = useRef(null);
  const isDrawing = useRef(false);
  const lastPos = useRef({ x: 0, y: 0 });

  const getPos = (e) => {
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    if (e.touches && e.touches[0]) {
      return {
        x: e.touches[0].clientX - rect.left,
        y: e.touches[0].clientY - rect.top,
      };
    }
    return {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    };
  };

  const start = (e) => {
    e.preventDefault();
    isDrawing.current = true;
    lastPos.current = getPos(e);
  };

  const draw = (e) => {
    if (!isDrawing.current) return;
    e.preventDefault();
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const pos = getPos(e);
    ctx.beginPath();
    ctx.moveTo(lastPos.current.x, lastPos.current.y);
    ctx.lineTo(pos.x, pos.y);
    ctx.strokeStyle = tool === 'eraser' ? '#fff' : '#000';
    ctx.lineWidth = tool === 'eraser' ? 20 : 2;
    ctx.lineCap = 'round';
    ctx.stroke();
    lastPos.current = pos;
  };

  const end = (e) => {
    if (!isDrawing.current) return;
    e.preventDefault();
    isDrawing.current = false;
  };

  // expose helper methods
  useImperativeHandle(ref, () => ({
    getDataURL: () => canvasRef.current?.toDataURL('image/png'),
    clear: () => {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    },
  }));

  // set canvas size once
  useEffect(() => {
    const canvas = canvasRef.current;
    if (canvas) {
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
    }
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="sig-canvas"
      style={{
        width: '100%',
        height: '200px',
        border: '1px solid #d1d5db',
        borderRadius: '4px',
        background: '#fff',
        touchAction: 'none',
      }}
      onMouseDown={start}
      onMouseMove={draw}
      onMouseUp={end}
      onMouseLeave={end}
      onTouchStart={start}
      onTouchMove={draw}
      onTouchEnd={end}
    />
  );
});

export default function DetailTandaTanganMitra() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { mitraTandaTangan, reload } = usePortalData();
  const pengajuan = mitraTandaTangan.find(item => String(item.id) === id);

  // ------ Dummy data (replace with real API if needed) ------
  const template = {
    title: pengajuan?.namaKegiatan || 'Pengajuan tidak ditemukan',
    status: pengajuan?.statusTandaTangan === 'menunggu-ttd' ? 'Belum Ditandatangani' : 'Sudah Ditandatangani',
    description: pengajuan ? `${pengajuan.jumlahSertifikat} sertifikat · No. SK ${pengajuan.nomorSK}` : '-',
    instructions: [
      'Langsung gambar tanda tangan di PDF',
      'Gunakan tools di bawah untuk menggambar',
      'Upload stempel/gambar untuk menambah stempel resmi',
      "Klik tombol 'Stempel' lalu klik di PDF untuk menempatkan stempel",
      'Perbesar/perkecil stempel dengan scroll mouse atau slider',
      'PIN wajib diisi untuk keamanan digital signature',
      'PDF yang dihasilkan akan memiliki: Tanda tangan fisik (gambar) + QR Code verifikasi digital',
      'TTD dan stempel akan langsung digambar di PDF dengan koordinat yang tepat',
    ],
  };

  const [tool, setTool] = useState('pen'); // 'pen' | 'eraser'
  const [stampImg, setStampImg] = useState(null);
  const [stampPos, setStampPos] = useState({ x: 100, y: 100 });
  const [stampScale, setStampScale] = useState(1);
  const [pin, setPin] = useState('');
  const [pinError, setPinError] = useState('');
  const [saved, setSaved] = useState(false);
  const [page, setPage] = useState(1);
  const canvasRef = useRef(null);

  const handleToolChange = (t) => setTool(t);

  const handleUploadStamp = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => setStampImg(ev.target.result);
    reader.readAsDataURL(file);
  };

  const handleClear = () => {
    canvasRef.current?.clear();
    setStampImg(null);
    setSaved(false);
  };

  const handleSave = async () => {
    if (!pin || pin.length !== 6) {
      setPinError('PIN 6 digit wajib diisi');
      return;
    }
    if (!pengajuan) {
      setPinError('Pengajuan tidak ditemukan');
      return;
    }
    const dataUrl = canvasRef.current?.getDataURL();
    if (!dataUrl) {
      setPinError('Gambar tanda tangan terlebih dahulu');
      return;
    }
    try {
      await certificatesApi.sign(pengajuan.id, pin, dataUrl);
    } catch (err) {
      setPinError(err.message);
      return;
    }
    reload();
    setSaved(true);
    setPinError('');
  };

  const handlePrevPage = () => setPage((p) => Math.max(1, p - 1));
  const handleNextPage = () => setPage((p) => Math.min(3, p + 1));

  // -----------------------------------------------------------------
  // UI Layout – two‑column: left (canvas & tools) | right (template info)
  // -----------------------------------------------------------------
  return (
    <div className="container" style={{ padding: '24px', fontFamily: 'system-ui, sans-serif' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <button type="button" onClick={() => navigate('/mitra/tanda-tangan')} style={{ background: 'none', border: 'none', color: '#14532d', fontSize: '14px', cursor: 'pointer' }}>
          <ArrowLeft size={16} /> Kembali
        </button>
        <h2 style={{ margin: 0 }}>Tanda Tangan Template</h2>
      </div>

      <div style={{ display: 'flex', gap: '24px' }}>
        {/* ---------- LEFT PANEL (Canvas + Tools) ---------- */}
        <div style={{ flex: 2 }}>
          <h3>{template.title}</h3>
          <p>Status: <strong>{template.status}</strong></p>

          {/* Tool bar */}
          <div style={{ display: 'flex', gap: '8px', marginBottom: '12px' }}>
            <button
              type="button"
              onClick={() => handleToolChange('pen')}
              style={{
                padding: '6px 10px',
                background: tool === 'pen' ? '#14532d' : '#f1f5f9',
                color: tool === 'pen' ? '#fff' : '#111',
                border: '1px solid #d1d5db',
                borderRadius: '4px',
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                cursor: 'pointer',
              }}
            >
              <PenTool size={16} /> Pen
            </button>
            <button
              type="button"
              onClick={() => handleToolChange('eraser')}
              style={{
                padding: '6px 10px',
                background: tool === 'eraser' ? '#14532d' : '#f1f5f9',
                color: tool === 'eraser' ? '#fff' : '#111',
                border: '1px solid #d1d5db',
                borderRadius: '4px',
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                cursor: 'pointer',
              }}
            >
              <Eraser size={16} /> Eraser
            </button>
            <label style={{
              padding: '6px 10px',
              background: '#f1f5f9',
              border: '1px solid #d1d5db',
              borderRadius: '4px',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              cursor: 'pointer',
            }}>
              <Upload size={16} /> Upload Gambar
              <input type="file" accept="image/*" style={{ display: 'none' }} onChange={handleUploadStamp} />
            </label>
            <button
              type="button"
              onClick={handleClear}
              style={{
                padding: '6px 10px',
                background: '#f1f5f9',
                border: '1px solid #d1d5db',
                borderRadius: '4px',
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                cursor: 'pointer',
              }}
            >
              <X size={16} /> Clear
            </button>
          </div>

          {/* Canvas area */}
          <div style={{ position: 'relative' }}>
            <SignatureCanvas ref={canvasRef} tool={tool} />
            {stampImg && (
              <img
                src={stampImg}
                alt="Stamp"
                style={{
                  position: 'absolute',
                  left: stampPos.x,
                  top: stampPos.y,
                  transform: `scale(${stampScale})`,
                  pointerEvents: 'none',
                }}
              />
            )}
          </div>

          {/* PIN & Save */}
          <div style={{ marginTop: '16px' }}>
            <label style={{ display: 'block', fontWeight: 600, marginBottom: '4px' }}>Masukkan 6‑digit PIN</label>
            <input
              type="password"
              value={pin}
              maxLength={6}
              placeholder="Masukkan 6-digit PIN"
              onChange={(e) => setPin(e.target.value)}
              style={{ width: '100%', padding: '8px', border: '1px solid #d1d5db', borderRadius: '4px' }}
            />
            {pinError && <p style={{ color: '#dc2626', marginTop: '4px' }}>{pinError}</p>}
            <button
              type="button"
              onClick={handleSave}
              style={{
                marginTop: '12px',
                padding: '8px 16px',
                background: '#14532d',
                color: '#fff',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
              }}
            >
              <Check size={16} /> Simpan TTD
            </button>
            {saved && <p style={{ color: '#15803d', marginTop: '8px' }}>TTD Tersimpan</p>}
          </div>

          {/* Pagination */}
          <div style={{ marginTop: '24px', display: 'flex', alignItems: 'center', gap: '12px' }}>
            <button
              type="button"
              onClick={handlePrevPage}
              disabled={page === 1}
              style={{
                padding: '6px 10px',
                background: page === 1 ? '#e5e7eb' : '#14532d',
                color: page === 1 ? '#6b7280' : '#fff',
                border: 'none',
                borderRadius: '4px',
                cursor: page === 1 ? 'default' : 'pointer',
              }}
            >
              <ChevronLeft size={14} /> Previous
            </button>
            <span>Halaman {page} dari 3</span>
            <button
              type="button"
              onClick={handleNextPage}
              disabled={page === 3}
              style={{
                padding: '6px 10px',
                background: page === 3 ? '#e5e7eb' : '#14532d',
                color: page === 3 ? '#6b7280' : '#fff',
                border: 'none',
                borderRadius: '4px',
                cursor: page === 3 ? 'default' : 'pointer',
              }}
            >
              Next <ChevronRight size={14} />
            </button>
          </div>
        </div>

        {/* ---------- RIGHT PANEL (Template Info) ---------- */}
        <div style={{ flex: 1, border: '1px solid #d1d5db', borderRadius: '8px', padding: '16px', background: '#f9fafb' }}>
          <h3>Template Info</h3>
          <p><strong>Title</strong><br />{template.title}</p>
          <p><strong>Status</strong><br />{template.status}</p>
          <p><strong>Description</strong><br />{template.description}</p>
        </div>
      </div>
    </div>
  );
}

import { useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  PenTool,
  AlertTriangle,
  CheckCircle,
  Check,
  X,
  Eraser,
  ShieldCheck,
  CheckCircle2,
} from 'lucide-react';
import { dokumenPengganti } from '../../data/mockData';
import { currentRektor } from './data';
import BackButton from '../../components/BackButton';
import UnandLogo from '../../components/UnandLogo';
import SignatureCanvas from '../../components/SignatureCanvas';

const dpStatusLabel = { 'sedang-diproses': 'Sedang Diproses' };
const dpStatusClass = { 'sedang-diproses': 'badge badge-blue' };

export default function DetailDokumenPenggantiRektor() {
  const { id }   = useParams();
  const navigate = useNavigate();
  const [reSigned, setReSigned]       = useState(false);
  const [reSignedImg, setReSignedImg] = useState(null);
  const [activeView, setActiveView]   = useState('baru');

  // Modal Sign TTE
  const [showSignModal, setShowSignModal] = useState(false);
  const [signPin, setSignPin]             = useState('');
  const [signPinError, setSignPinError]   = useState('');
  const [tool, setTool]                   = useState('pen');
  const [toastMsg, setToastMsg]           = useState('');
  const canvasRef = useRef(null);

  const dp = dokumenPengganti.find(d => String(d.id) === id) || dokumenPengganti[0];

  const showToast = (msg) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(''), 3500);
  };

  const handleProsesTTEUlang = () => {
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

    const dataUrl = canvasRef.current?.getDataURL();
    setReSignedImg(dataUrl);
    setReSigned(true);
    setShowSignModal(false);
    setSignPin('');
    setSignPinError('');
    showToast('Tanda tangan ulang berhasil dibubuhkan oleh Rektor UNAND.');
  };

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

      <BackButton to="/rektor/sertifikat-perbaikan" label="Kembali ke Sertifikat Perbaikan" />

      {/* ── Header Section ── */}
      <div className="section-divider" style={{ marginTop: '0', paddingTop: '0', borderTop: 'none' }}>
        <p className="section-divider-label">DOKUMEN PENGGANTI</p>

        <div className="dp-detail-header-row">
          <div>
            <h3 className="section-divider-heading">Pemrosesan Sertifikat Hasil Perbaikan</h3>
            <p className="section-divider-sub">
              Periksa pengajuan dan verifikasi sertifikat yang akan diperbaiki sesuai alur penerbitan.
            </p>
          </div>
          <button
            className="dp-btn-kembali-box"
            onClick={() => navigate('/rektor/sertifikat-perbaikan')}
          >
            Kembali ke Daftar
          </button>
        </div>

        {/* ── Kartu Ringkasan Informasi Pengajuan ── */}
        <div className="dp-info-table-container">
          <table className="dp-info-table">
            <tbody>
              <tr>
                <td className="dp-info-table-label">Nama peserta</td>
                <td className="dp-info-table-val">
                  <strong>{dp.namaPeserta}</strong>
                  {dp.namaPesertaLama && (
                    <span style={{ fontSize: '12px', color: 'var(--gray-500)', marginLeft: '8px' }}>
                      (Sebelumnya: <span style={{ textDecoration: 'line-through', color: '#dc2626' }}>{dp.namaPesertaLama}</span>)
                    </span>
                  )}
                </td>
              </tr>
              <tr>
                <td className="dp-info-table-label">Nama kegiatan</td>
                <td className="dp-info-table-val">{dp.namaKegiatan}</td>
              </tr>
              <tr>
                <td className="dp-info-table-label">Jenis kegiatan</td>
                <td className="dp-info-table-val">{dp.jenisKegiatan || 'Workshop'}</td>
              </tr>
              <tr>
                <td className="dp-info-table-label">Nomor sertifikat</td>
                <td className="dp-info-table-val" style={{ fontFamily: 'monospace' }}>
                  {dp.nomorSertifikat}
                </td>
              </tr>
              <tr>
                <td className="dp-info-table-label">Tanggal kegiatan</td>
                <td className="dp-info-table-val">{dp.tanggalKegiatan || '15/4/2026'}</td>
              </tr>
              <tr>
                <td className="dp-info-table-label">Penerbit sertifikat</td>
                <td className="dp-info-table-val">{dp.penyelenggara}</td>
              </tr>
            </tbody>
          </table>

          {/* Status & Keterangan Perbaikan */}
          <div style={{ padding: '20px 24px', borderTop: '1px solid var(--gray-100)' }}>
            <div style={{ marginBottom: '14px' }}>
              <span className={dpStatusClass[dp.status]}>
                {dpStatusLabel[dp.status]}
              </span>
            </div>
            <div className="dp-reason-title">Perbaikan {dp.jenisPerbaikan}</div>
            <div className="dp-reason-text">
              {dp.jenisPerbaikanDetail ||
                `Kesalahan ejaan nama peserta: tertulis "${dp.namaPesertaLama || 'Nadia Amelya'}", seharusnya "${dp.namaPeserta}".`}
            </div>
          </div>
        </div>

        {/* ── TOMBOL KHUSUS: Beralih Melihat Sertifikat yang Akan Diperbaiki vs Hasil Perbaikan ── */}
        <div style={{
          background: 'white',
          border: '1.5px solid var(--gray-200)',
          borderRadius: '12px',
          padding: '16px 20px',
          marginBottom: '24px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '12px',
        }}>
          <div>
            <div style={{ fontSize: '13.5px', fontWeight: 700, color: 'var(--gray-900)', marginBottom: '2px' }}>
              Pratinjau Dokumen Sertifikat
            </div>
            <div style={{ fontSize: '12px', color: 'var(--gray-500)' }}>
              Verifikasi dokumen sertifikat yang keliru atau draf sertifikat pengganti sebelum menandatangani ulang.
            </div>
          </div>

          <div style={{ display: 'inline-flex', gap: '8px', background: 'var(--gray-100)', padding: '4px', borderRadius: '8px' }}>
            {/* Tombol Khusus Sertifikat yang Akan Diperbaiki */}
            <button
              type="button"
              onClick={() => setActiveView('lama')}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '8px 16px',
                borderRadius: '6px',
                border: 'none',
                fontSize: '12.5px',
                fontWeight: 600,
                cursor: 'pointer',
                background: activeView === 'lama' ? '#fee2e2' : 'transparent',
                color: activeView === 'lama' ? '#b91c1c' : 'var(--gray-600)',
                boxShadow: activeView === 'lama' ? '0 1px 3px rgba(0,0,0,0.08)' : 'none',
                transition: 'all 0.15s ease',
              }}
            >
              <AlertTriangle size={14} color={activeView === 'lama' ? '#b91c1c' : 'var(--gray-500)'} />
              <span>Sertifikat yang Akan Diperbaiki</span>
            </button>

            {/* Tombol Sertifikat Hasil Perbaikan */}
            <button
              type="button"
              onClick={() => setActiveView('baru')}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '8px 16px',
                borderRadius: '6px',
                border: 'none',
                fontSize: '12.5px',
                fontWeight: 600,
                cursor: 'pointer',
                background: activeView === 'baru' ? 'white' : 'transparent',
                color: activeView === 'baru' ? 'var(--green-900)' : 'var(--gray-600)',
                boxShadow: activeView === 'baru' ? '0 1px 3px rgba(0,0,0,0.08)' : 'none',
                transition: 'all 0.15s ease',
              }}
            >
              <CheckCircle size={14} color={activeView === 'baru' ? 'var(--green-700)' : 'var(--gray-500)'} />
              <span>Sertifikat Hasil Perbaikan</span>
            </button>
          </div>
        </div>

        {/* ── Kartu Pratinjau Sertifikat ── */}
        <div className="dp-section-card">
          {/* Banner Indikator Tampilan Dokumen yang Aktif */}
          {activeView === 'lama' ? (
            <div style={{
              background: '#fef2f2',
              border: '1px solid #fecaca',
              borderRadius: '8px',
              padding: '12px 18px',
              marginBottom: '18px',
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              fontSize: '13px',
              color: '#991b1b',
              fontWeight: 500,
            }}>
              <AlertTriangle size={18} color="#dc2626" />
              <span>
                <strong>Kesalahan Ejaan Nama:</strong> Tertulis <em>"{dp.namaPesertaLama || 'Nadia Amelya'}"</em>, seharusnya <em>"{dp.namaPeserta}"</em>.
              </span>
            </div>
          ) : (
            <div style={{
              background: '#f0fdf4',
              border: '1px solid #bbf7d0',
              borderRadius: '8px',
              padding: '12px 18px',
              marginBottom: '18px',
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              fontSize: '13px',
              color: 'var(--green-900)',
              fontWeight: 500,
            }}>
              <CheckCircle size={18} color="var(--green-700)" />
              <span>
                <strong>Hasil Perbaikan:</strong> Ejaan nama peserta telah diperbaiki menjadi <em>"{dp.namaPeserta}"</em>.
              </span>
            </div>
          )}

          {/* Box Pratinjau Sertifikat */}
          <div className="dp-cert-preview-box">
            <div className="dp-cert-preview-tag">
              Pratinjau
            </div>

            <div className="dp-cert-paper" style={{
              borderColor: activeView === 'lama' ? '#dc2626' : 'var(--green-900)',
            }}>
              <div className="dp-cert-header">
                <UnandLogo className="dp-cert-logo-box" />
                <div className="dp-cert-partner-name">{dp.penyelenggara.toUpperCase()}</div>
              </div>
              <div style={{ fontSize: '10px', color: 'var(--gray-400)', marginBottom: '14px' }}>
                {activeView === 'lama' ? 'Dokumen Awal (Ejaan Salah)' : 'Dokumen Pengganti (Ejaan Benar)'}
              </div>

              <div className="dp-cert-title">SERTIFIKAT</div>
              <div style={{ fontSize: '11px', color: 'var(--gray-500)', fontFamily: 'monospace', marginBottom: '10px' }}>
                No: {dp.nomorSertifikat}
              </div>
              <div className="dp-cert-given">Diberikan kepada</div>

              {/* TAMPILAN NAMA PESERTA SESUAI VERSI DOKUMEN */}
              {activeView === 'lama' ? (
                <div style={{ margin: '8px 0 10px' }}>
                  <div style={{
                    fontSize: '18px',
                    fontWeight: 800,
                    color: '#dc2626',
                    textDecoration: 'line-through',
                    background: '#fee2e2',
                    padding: '4px 14px',
                    borderRadius: '4px',
                    display: 'inline-block',
                    letterSpacing: '0.5px',
                  }}>
                    {(dp.namaPesertaLama || 'Nadia Amelya').toUpperCase()}
                  </div>
                  <div style={{ fontSize: '10.5px', color: '#b91c1c', marginTop: '4px', fontWeight: 600 }}>
                    ⚠️ Kesalahan ejaan nama (akan diganti)
                  </div>
                </div>
              ) : (
                <div style={{ margin: '8px 0 10px' }}>
                  <div className="dp-cert-name" style={{
                    background: '#f0fdf4',
                    padding: '4px 14px',
                    borderRadius: '4px',
                    display: 'inline-block',
                  }}>
                    {dp.namaPeserta.toUpperCase()}
                  </div>
                  <div style={{ fontSize: '10.5px', color: 'var(--green-700)', marginTop: '4px', fontWeight: 600 }}>
                    ✓ Ejaan nama peserta telah benar
                  </div>
                </div>
              )}

              <div className="dp-cert-desc">atas partisipasinya sebagai peserta dalam</div>

              {/* TAMPILAN NAMA KEGIATAN */}
              <div style={{ margin: '8px 0 10px' }}>
                <div className="dp-cert-workshop-title">
                  {dp.namaKegiatan}
                </div>
              </div>

              <div className="dp-cert-date">
                {dp.tanggalKegiatan || '15 April 2026'} · Universitas Andalas
              </div>

              <div className="dp-cert-sigs">
                <div className="dp-cert-sig-block">
                  <div className="dp-cert-sig-title">Pimpinan Mitra</div>
                  <div style={{ height: 26, borderBottom: '1px solid var(--gray-300)', margin: '4px 16px', opacity: 0.5 }} />
                  <div className="dp-cert-sig-status">Menunggu TTE Mitra</div>
                </div>
                <div className="dp-cert-sig-block">
                  <div className="dp-cert-sig-title">Rektor UNAND</div>
                  <div style={{
                    minHeight: 28,
                    margin: '4px 16px',
                    borderBottom: '1px solid var(--gray-300)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}>
                    {reSigned ? (
                      reSignedImg ? (
                        <img src={reSignedImg} alt="TTD Rektor" style={{ maxHeight: 26, maxWidth: 120, objectFit: 'contain' }} />
                      ) : (
                        <span style={{ fontFamily: 'cursive', fontSize: '13px', color: 'var(--green-900)', fontWeight: 700 }}>
                          {currentRektor.nama}
                        </span>
                      )
                    ) : (
                      <span style={{ fontSize: '10px', color: '#B45309', background: '#FEF3C7', padding: '2px 6px', borderRadius: 3 }}>
                        Menunggu TTD
                      </span>
                    )}
                  </div>
                  <div className="dp-cert-sig-status" style={{ color: reSigned ? '#15803d' : 'inherit', fontWeight: reSigned ? 700 : 500 }}>
                    {reSigned ? '✓ Telah ditandatangani ulang' : 'Menunggu TTE Rektor'}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons & Status Footer */}
          <div className="dp-action-footer">
            <div className="dp-action-status-text">
              PDF: Belum diproses · Rektor: {reSigned ? 'Selesai' : 'Belum'} · Mitra: Belum
            </div>
            <div className="dp-action-btn-row">
              <button
                className="dp-btn-tandatangan-ulang"
                onClick={() => {
                  setSignPin('');
                  setSignPinError('');
                  setShowSignModal(true);
                }}
                disabled={reSigned}
                style={{
                  background: reSigned ? '#dcfce7' : 'var(--green-900)',
                  color: reSigned ? '#15803d' : '#fff',
                  border: reSigned ? '1px solid #86efac' : 'none',
                  cursor: reSigned ? 'default' : 'pointer',
                }}
              >
                <PenTool size={14} style={{ marginRight: '6px', display: 'inline-block', verticalAlign: 'middle' }} />
                {reSigned ? 'Telah Ditandatangani Ulang' : 'Tandatangani Ulang (TTE & PIN)'}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ── MODAL CANVAS TTE & PIN DIGITAL SIGNATURE REKTOR ── */}
      {showSignModal && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 1100,
            background: 'rgba(0,0,0,0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 20,
          }}
          onClick={() => setShowSignModal(false)}
        >
          <div
            style={{
              background: '#fff',
              borderRadius: 12,
              width: '100%',
              maxWidth: 620,
              boxShadow: '0 20px 60px rgba(0,0,0,0.2)',
              overflow: 'hidden',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div style={{ padding: '16px 20px', borderBottom: '1px solid #e5e7eb', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <span style={{ fontSize: 11, fontWeight: 700, color: '#14532d', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  PENGESAHAN DOKUMEN PENGGANTI
                </span>
                <h3 style={{ margin: '2px 0 0', fontSize: 16, fontWeight: 700, color: '#111827' }}>
                  Tanda Tangan Ulang Dokumen Pengganti
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowSignModal(false)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#6b7280' }}
              >
                <X size={20} />
              </button>
            </div>

            {/* Modal Body */}
            <div style={{ padding: '20px' }}>
              <p style={{ fontSize: 13, color: '#4b5563', margin: '0 0 12px' }}>
                Goreskan tanda tangan digital Anda untuk mengesahkan perbaikan sertifikat atas nama <strong>{dp.namaPeserta}</strong>:
              </p>

              {/* Canvas Box */}
              <div style={{ position: 'relative', marginBottom: 12 }}>
                <SignatureCanvas ref={canvasRef} tool={tool} height="180px" />
              </div>

              {/* Tools row */}
              <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 16 }}>
                <button
                  type="button"
                  onClick={() => setTool('pen')}
                  style={{
                    padding: '4px 10px',
                    borderRadius: 6,
                    border: '1px solid #d1d5db',
                    background: tool === 'pen' ? '#14532d' : '#fff',
                    color: tool === 'pen' ? '#fff' : '#374151',
                    fontSize: 12,
                    fontWeight: 600,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 4,
                  }}
                >
                  <PenTool size={13} /> Pen
                </button>
                <button
                  type="button"
                  onClick={() => setTool('eraser')}
                  style={{
                    padding: '4px 10px',
                    borderRadius: 6,
                    border: '1px solid #d1d5db',
                    background: tool === 'eraser' ? '#14532d' : '#fff',
                    color: tool === 'eraser' ? '#fff' : '#374151',
                    fontSize: 12,
                    fontWeight: 600,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 4,
                  }}
                >
                  <Eraser size={13} /> Eraser
                </button>
                <button
                  type="button"
                  onClick={() => canvasRef.current?.clear()}
                  style={{
                    marginLeft: 'auto',
                    color: '#dc2626',
                    background: 'none',
                    border: 'none',
                    fontSize: 12,
                    fontWeight: 600,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 4,
                  }}
                >
                  <X size={13} /> Bersihkan Canvas
                </button>
              </div>

              {/* PIN Input */}
              <div style={{ borderTop: '1px solid #e5e7eb', paddingTop: 14 }}>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 700, color: '#111827', marginBottom: 6 }}>
                  PIN Digital Signature Rektor <span style={{ color: '#dc2626' }}>*</span>
                </label>
                <input
                  type="password"
                  maxLength={6}
                  placeholder="Masukkan 6-digit PIN (default: 123456)"
                  value={signPin}
                  onChange={(e) => setSignPin(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '9px 12px',
                    border: '1px solid #d1d5db',
                    borderRadius: 6,
                    fontSize: 13.5,
                    boxSizing: 'border-box',
                  }}
                />
                {signPinError && (
                  <span style={{ fontSize: 12, color: '#dc2626', display: 'block', marginTop: 4 }}>
                    {signPinError}
                  </span>
                )}
              </div>
            </div>

            {/* Modal Footer */}
            <div style={{ padding: '14px 20px', borderTop: '1px solid #e5e7eb', display: 'flex', justifyContent: 'flex-end', gap: 10, background: '#f9fafb' }}>
              <button
                type="button"
                onClick={() => setShowSignModal(false)}
                style={{ padding: '8px 16px', borderRadius: 6, border: '1px solid #d1d5db', background: '#fff', color: '#374151', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleProsesTTEUlang}
                style={{ padding: '8px 18px', borderRadius: 6, border: 'none', background: '#16a34a', color: '#fff', fontSize: 13, fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}
              >
                <Check size={15} /> Simpan TTD Ulang
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

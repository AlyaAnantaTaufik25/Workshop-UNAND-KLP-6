import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { AlertTriangle, CheckCircle, FileText, ArrowRight } from 'lucide-react';
import { dokumenPengganti } from '../../data/mockData';
import BackButton from '../../components/BackButton';
import UnandLogo from '../../components/UnandLogo';

const dpStatusLabel = { 'sedang-diproses': 'Sedang Diproses' };
const dpStatusClass = { 'sedang-diproses': 'badge badge-blue' };

export default function DetailDokumenPengganti() {
  const { id }    = useParams();
  const navigate  = useNavigate();
  const [processed, setProcessed]   = useState(false);
  // State view: 'lama' (yang akan diperbaiki) atau 'baru' (hasil perbaikan)
  const [activeView, setActiveView] = useState('baru');

  const dp = dokumenPengganti.find(d => String(d.id) === id) || dokumenPengganti[0];

  return (
    <div>
      <BackButton to="/sekretariat/sertifikat-perbaikan" label="Kembali ke Sertifikat Perbaikan" />

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
            onClick={() => navigate('/sekretariat/sertifikat-perbaikan')}
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
          gap: '12px'
        }}>
          <div>
            <div style={{ fontSize: '13.5px', fontWeight: 700, color: 'var(--gray-900)', marginBottom: '2px' }}>
              Pratinjau Dokumen Sertifikat
            </div>
            <div style={{ fontSize: '12px', color: 'var(--gray-500)' }}>
              Pilih dokumen di bawah untuk memverifikasi sertifikat asli yang keliru atau draf sertifikat hasil perbaikan.
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
                transition: 'all 0.15s ease'
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
                transition: 'all 0.15s ease'
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
              borderColor: activeView === 'lama' ? '#dc2626' : 'var(--green-900)'
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
                    letterSpacing: '0.5px'
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
                    display: 'inline-block'
                  }}>
                    {dp.namaPeserta.toUpperCase()}
                  </div>
                  <div style={{ fontSize: '10.5px', color: 'var(--green-700)', marginTop: '4px', fontWeight: 600 }}>
                    ✓ Ejaan nama peserta telah benar
                  </div>
                </div>
              )}

              <div className="dp-cert-desc">atas partisipasinya sebagai peserta dalam</div>

              {/* TAMPILAN NAMA KEGIATAN (VALID & TETAP) */}
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
                  <div style={{ height: 26, borderBottom: '1px solid var(--gray-300)', margin: '4px 16px', opacity: 0.5 }} />
                  <div className="dp-cert-sig-status">Menunggu TTE Rektor</div>
                </div>
              </div>
            </div>
          </div>

          <div className="dp-action-footer">
            <div className="dp-action-status-text">
              PDF: {processed ? 'Selesai diproses' : 'Belum diproses'} · Rektor: Belum · Mitra: Belum
            </div>
            <div className="dp-action-btn-row">
              <button
                className="dp-btn-proses"
                onClick={() => setProcessed(true)}
              >
                {processed ? 'PDF Telah Diproses' : 'Proses PDF Pengganti'}
              </button>
              <button className="dp-btn-terbitkan-disabled" disabled>
                Terbitkan Sertifikat Pengganti
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

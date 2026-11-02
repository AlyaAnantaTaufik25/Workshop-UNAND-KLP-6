import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { PenTool, AlertTriangle, CheckCircle } from 'lucide-react';
import { dokumenPengganti } from '../../data/mockData';
import BackButton from '../../components/BackButton';

const dpStatusLabel = { 'sedang-diproses': 'Sedang Diproses' };
const dpStatusClass = { 'sedang-diproses': 'badge badge-blue' };

export default function DetailDokumenPenggantiRektor() {
  const { id }    = useParams();
  const navigate  = useNavigate();
  const [reSigned, setReSigned]     = useState(false);
  const [activeView, setActiveView] = useState('baru');

  const dp = dokumenPengganti.find(d => String(d.id) === id) || dokumenPengganti[0];

  return (
    <div>
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
                <td className="dp-info-table-val">{dp.namaPeserta}</td>
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
            <div className="dp-reason-title">{dp.jenisPerbaikan}</div>
            <div className="dp-reason-text">
              {dp.jenisPerbaikanDetail ||
                `Judul pada sertifikat tertulis "${dp.namaKegiatan}", seharusnya "${dp.namaKegiatanBaru || dp.namaKegiatan}".`}
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

        {/* ── Kartu Alur Penerbitan Ulang & Pratinjau Sertifikat ── */}
        <div className="dp-section-card">
          <div className="dp-alur-simulasi-title">Alur Penerbitan Ulang · Simulasi</div>
          <div className="dp-alur-simulasi-sub">
            {dp.alurPenerbitan ||
              'Mitra -> Mitra -> Rektor -> Sekretariat menerbitkan. Sekretariat dan Rektor tidak dapat mengedit isi sertifikat.'}
          </div>

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
                <strong>Sertifikat Asli yang Keliru:</strong> Bagian judul kegiatan tertulis <em>"Manajemen Proyek Kolaboratif"</em> (tanpa kata Workshop).
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
                <strong>Draf Sertifikat Hasil Perbaikan:</strong> Judul kegiatan telah diperbarui menjadi <em>"Workshop Manajemen Proyek Kolaboratif"</em>.
              </span>
            </div>
          )}

          {/* Box Pratinjau Sertifikat */}
          <div className="dp-cert-preview-box">
            <div className="dp-cert-preview-tag">
              {activeView === 'lama'
                ? 'Pratinjau sertifikat lama yang akan diperbaiki — HTML simulasi'
                : 'Pratinjau sertifikat hasil perbaikan — HTML simulasi, bukan PDF resmi'}
            </div>

            <div className="dp-cert-paper" style={{
              borderColor: activeView === 'lama' ? '#dc2626' : 'var(--green-900)'
            }}>
              <div className="dp-cert-header">
                <div className="dp-cert-logo-box" style={{ background: activeView === 'lama' ? '#7f1d1d' : 'var(--green-900)' }}>
                  U
                </div>
                <div className="dp-cert-partner-name">{dp.penyelenggara.toUpperCase()}</div>
              </div>
              <div style={{ fontSize: '10px', color: 'var(--gray-400)', marginBottom: '14px' }}>
                {activeView === 'lama' ? 'Dokumen Lama (Mengandung Kesalahan)' : 'Pratinjau contoh - bukan PDF resmi'}
              </div>

              <div className="dp-cert-title">SERTIFIKAT</div>
              <div className="dp-cert-given">Diberikan kepada</div>
              <div className="dp-cert-name">{dp.namaPeserta.toUpperCase()}</div>
              <div className="dp-cert-desc">atas partisipasinya sebagai peserta dalam</div>

              {/* TAMPILAN NAMA KEGIATAN SESUAI VERSI DOKUMEN */}
              {activeView === 'lama' ? (
                <div style={{ margin: '8px 0 10px' }}>
                  <div style={{
                    fontSize: '14px',
                    fontWeight: 700,
                    color: '#dc2626',
                    textDecoration: 'line-through',
                    background: '#fee2e2',
                    padding: '4px 12px',
                    borderRadius: '4px',
                    display: 'inline-block'
                  }}>
                    {dp.namaKegiatan}
                  </div>
                  <div style={{ fontSize: '10.5px', color: '#b91c1c', marginTop: '4px' }}>
                    ⚠️ Bagian yang keliru (perlu diperbaiki)
                  </div>
                </div>
              ) : (
                <div style={{ margin: '8px 0 10px' }}>
                  <div className="dp-cert-workshop-title" style={{
                    background: '#f0fdf4',
                    padding: '4px 12px',
                    borderRadius: '4px',
                    display: 'inline-block'
                  }}>
                    {dp.namaKegiatanBaru || `Workshop ${dp.namaKegiatan}`}
                  </div>
                  <div style={{ fontSize: '10.5px', color: 'var(--green-700)', marginTop: '4px' }}>
                    ✓ Judul telah diperbaiki
                  </div>
                </div>
              )}

              <div className="dp-cert-date">
                {dp.tanggalKegiatan || '15 April 2026'} · Universitas Andalas
              </div>

              <div className="dp-cert-sigs">
                <div className="dp-cert-sig-block">
                  <div className="dp-cert-sig-title">Pimpinan Mitra</div>
                  <div style={{ height: 26, borderBottom: '1px solid var(--gray-300)', margin: '4px 16px', opacity: 0.5 }} />
                  <div className="dp-cert-sig-status">Tahap kedua simulasi</div>
                </div>
                <div className="dp-cert-sig-block">
                  <div className="dp-cert-sig-title">Rektor UNAND</div>
                  <div style={{
                    height: 26,
                    margin: '4px 16px',
                    borderBottom: '1px solid var(--gray-300)',
                    fontFamily: 'cursive',
                    fontSize: '13px',
                    color: reSigned ? 'var(--green-900)' : 'transparent',
                    fontWeight: 700
                  }}>
                    {reSigned ? 'Andani Eka Putra' : ''}
                  </div>
                  <div className="dp-cert-sig-status">
                    {reSigned ? 'Telah ditandatangani ulang' : 'Tahap ketiga simulasi'}
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
                onClick={() => setReSigned(true)}
              >
                <PenTool size={14} style={{ marginRight: '6px', display: 'inline-block', verticalAlign: 'middle' }} />
                {reSigned ? 'Telah Ditandatangani Ulang' : 'Tandatangani Ulang (Simulasi)'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

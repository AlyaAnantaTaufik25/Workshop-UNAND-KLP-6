import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { PenTool, CheckCircle, ArrowLeft, AlertCircle, FileText, Check } from 'lucide-react';
import { dokumenPengganti } from '../../data/mockData';
import UnandLogo from '../../components/UnandLogo';

export default function DetailDokumenPenggantiMitra() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [activeView, setActiveView] = useState('baru');
  const [approved, setApproved] = useState(false);
  const [showModal, setShowModal] = useState(false);

  const dp = dokumenPengganti.find(d => String(d.id) === id) || dokumenPengganti[0];

  const handleApprove = () => {
    setApproved(true);
    setShowModal(false);
  };

  return (
    <div className="mitra-stack">
      {/* Tombol kembali */}
      <div>
        <button
          className="mitra-back-btn"
          onClick={() => navigate('/mitra/perbaikan-sertifikat')}
        >
          <ArrowLeft size={16} /> Kembali ke Sertifikat Perbaikan
        </button>
      </div>

      {/* Header Halaman */}
      <div className="mitra-intro">
        <span className="mitra-eyebrow">DOKUMEN PENGGANTI</span>
        <h2>Pemrosesan Sertifikat Hasil Perbaikan</h2>
        <p>Periksa pengajuan perbaikan sertifikat kegiatan instansi Anda sebelum diteruskan ke alur TTE Rektor.</p>
      </div>

      {/* Info Banner Alur */}
      <div className="mitra-prototype-banner">
        <div className="mitra-prototype-left">
          <AlertCircle size={16} color="var(--mitra-green)" />
          <span className="mitra-prototype-text">
            <strong>Alur Penerbitan Khusus Mitra:</strong> {dp.alurPenerbitan || 'Mitra menyetujui koreksi → Rektor membubuhkan TTE ulang → Sekretariat menerbitkan dokumen pengganti.'}
          </span>
        </div>
      </div>

      {/* Kartu Ringkasan Informasi Pengajuan */}
      <div className="mitra-card">
        <h3 className="mitra-section-title" style={{ marginBottom: 16 }}>Rincian Pengajuan</h3>
        <div className="mitra-table-card" style={{ boxShadow: 'none' }}>
          <table className="mitra-table">
            <tbody>
              <tr>
                <td style={{ width: 220, color: 'var(--mitra-muted)', fontWeight: 600 }}>Nama peserta</td>
                <td style={{ fontWeight: 700, color: '#111827' }}>{dp.namaPeserta}</td>
              </tr>
              <tr>
                <td style={{ color: 'var(--mitra-muted)', fontWeight: 600 }}>Nama kegiatan</td>
                <td>{dp.namaKegiatan}</td>
              </tr>
              <tr>
                <td style={{ color: 'var(--mitra-muted)', fontWeight: 600 }}>Jenis kegiatan</td>
                <td>{dp.jenisKegiatan || 'Workshop'}</td>
              </tr>
              <tr>
                <td style={{ color: 'var(--mitra-muted)', fontWeight: 600 }}>Nomor sertifikat lama</td>
                <td style={{ fontFamily: 'monospace', fontWeight: 600 }}>{dp.nomorSertifikat}</td>
              </tr>
              <tr>
                <td style={{ color: 'var(--mitra-muted)', fontWeight: 600 }}>Tanggal kegiatan</td>
                <td>{dp.tanggalKegiatan || '15 April 2026'}</td>
              </tr>
              <tr>
                <td style={{ color: 'var(--mitra-muted)', fontWeight: 600 }}>Penyelenggara / Mitra</td>
                <td>{dp.penyelenggara}</td>
              </tr>
              <tr>
                <td style={{ color: 'var(--mitra-muted)', fontWeight: 600 }}>Jenis perbaikan</td>
                <td>
                  <span className="mitra-badge-status mitra-badge-status--amber">
                    <i></i> {dp.jenisPerbaikan}
                  </span>
                </td>
              </tr>
              <tr>
                <td style={{ color: 'var(--mitra-muted)', fontWeight: 600 }}>Rincian koreksi</td>
                <td style={{ color: '#111827', fontWeight: 500, lineHeight: 1.6 }}>
                  {dp.jenisPerbaikanDetail || `Judul pada sertifikat lama tertulis "${dp.namaKegiatan}", disesuaikan menjadi "${dp.namaKegiatanBaru || dp.namaKegiatan}".`}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Tab Beralih Melihat Sertifikat Lama vs Hasil Perbaikan */}
      <div className="mitra-card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12, marginBottom: 20 }}>
          <div>
            <h3 className="mitra-section-title">Pratinjau Komparasi Dokumen</h3>
            <p className="mitra-section-sub">Bandingkan tampilan sertifikat asli dengan draf dokumen pengganti.</p>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button
              className={`mitra-btn ${activeView === 'lama' ? '' : 'mitra-btn--secondary'}`}
              onClick={() => setActiveView('lama')}
            >
              Sertifikat Asli
            </button>
            <button
              className={`mitra-btn ${activeView === 'baru' ? '' : 'mitra-btn--secondary'}`}
              onClick={() => setActiveView('baru')}
            >
              Dokumen Pengganti (Koreksi)
            </button>
          </div>
        </div>

        {/* Certificate Preview Box */}
        <div className="cert-preview-wrapper">
          <div className="cert-preview-box">
            <div className="cert-logo-row">
              <UnandLogo style={{ width: 38, height: 38 }} />
              <div>
                <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--mitra-green)' }}>UNIVERSITAS ANDALAS</div>
                <div style={{ fontSize: 11, color: 'var(--mitra-muted)' }}>Bekerja sama dengan {dp.penyelenggara}</div>
              </div>
            </div>
            <div className="cert-divider" />
            <div className="cert-label-sertifikat">
              {activeView === 'baru' ? 'SERTIFIKAT PENGGANTI' : 'SERTIFIKAT'}
            </div>
            <div style={{ fontSize: 11, color: 'var(--mitra-muted)', marginBottom: 8 }}>
              No: {activeView === 'baru' ? `${dp.nomorSertifikat}-REV1` : dp.nomorSertifikat}
            </div>
            <div className="cert-diberikan">Diberikan kepada</div>
            <div className="cert-nama">{dp.namaPeserta}</div>
            <div className="cert-atas">atas partisipasinya sebagai peserta dalam kegiatan</div>
            <div className="cert-kegiatan" style={{ color: activeView === 'baru' ? 'var(--mitra-green)' : '#111827' }}>
              {activeView === 'baru' ? (dp.namaKegiatanBaru || dp.namaKegiatan) : dp.namaKegiatan}
            </div>
            <div className="cert-tanggal">{dp.tanggalKegiatan || '15 April 2026'} · {dp.penyelenggara}</div>

            <div className="cert-ttd-row">
              <div className="cert-ttd">
                <div className="cert-ttd-title">Rektor Universitas Andalas</div>
                <div className="cert-ttd-sub">Tanda Tangan Elektronik</div>
              </div>
              <div className="cert-ttd">
                <div className="cert-ttd-title">Pimpinan {dp.penyelenggara}</div>
                <div className="cert-ttd-sub">Tanda Tangan Elektronik</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Aksi Persetujuan Mitra */}
      <div className="mitra-card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16 }}>
        <div>
          <h4 style={{ fontSize: 15, fontWeight: 700, color: '#111827', margin: 0 }}>Persetujuan Dokumen Hasil Perbaikan</h4>
          <p style={{ fontSize: 13, color: 'var(--mitra-muted)', marginTop: 4 }}>
            {approved ? 'Dokumen perbaikan telah disetujui oleh Mitra dan diteruskan ke Rektor.' : 'Pastikan rincian data koreksi sudah sesuai dengan kesepakatan kegiatan kerja sama.'}
          </p>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          {approved ? (
            <span className="mitra-badge-status mitra-badge-status--berlangsung" style={{ padding: '8px 16px', fontSize: 13 }}>
              <Check size={16} /> Telah Disetujui Mitra
            </span>
          ) : (
            <>
              <button
                className="mitra-btn mitra-btn--secondary"
                onClick={() => navigate('/mitra/perbaikan-sertifikat')}
              >
                Batal
              </button>
              <button
                className="mitra-btn"
                onClick={() => setShowModal(true)}
              >
                <CheckCircle size={16} /> Setujui Dokumen Pengganti
              </button>
            </>
          )}
        </div>
      </div>

      {/* Modal Konfirmasi Persetujuan */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-box" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <div>
                <span className="modal-header-crumb">WORKSHOP UNAND</span>
                <h3 className="modal-header-title">Konfirmasi Persetujuan Mitra</h3>
              </div>
            </div>
            <div className="modal-body">
              <p style={{ fontSize: 13.5, color: '#374151', lineHeight: 1.6 }}>
                Apakah Anda yakin menyetujui koreksi data untuk kegiatan <strong>"{dp.namaKegiatan}"</strong> atas nama peserta <strong>{dp.namaPeserta}</strong>?
              </p>
              <p style={{ fontSize: 12.5, color: 'var(--mitra-muted)' }}>
                Setelah disetujui, draf dokumen pengganti akan dikirimkan ke Rektor UNAND untuk proses TTE ulang.
              </p>
            </div>
            <div className="modal-footer">
              <button className="modal-btn modal-btn-batal" onClick={() => setShowModal(false)}>
                Batal
              </button>
              <button className="modal-btn modal-btn-publish" onClick={handleApprove}>
                Ya, Setujui & Lanjutkan
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}


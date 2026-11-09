import { useParams, useNavigate } from 'react-router-dom';
import { Eye, Check, PenTool } from 'lucide-react';
import { sertifikatData } from '../../data/mockData';
import BackButton from '../../components/BackButton';
import UnandLogo from '../../components/UnandLogo';

export default function DetailRiwayatRektor() {
  const { id }    = useParams();
  const navigate  = useNavigate();

  const sert = sertifikatData.find(s => String(s.id) === id) || sertifikatData.find(s => s.id === 3);

  const steps = [
    { label: 'Template oleh Mitra', done: true, text: 'Tersedia' },
    { label: 'Pimpinan Mitra',      done: true, text: 'Selesai' },
    { label: 'Rektor UNAND',        done: true, text: 'Selesai' },
    { label: 'Penerbitan oleh Sekretariat', done: true, text: 'Diterbitkan' },
  ];

  return (
    <div>
      {/* Back button */}
      <BackButton to="/rektor/riwayat" label="Kembali ke Riwayat" />

      {/* Header Info */}
      <div className="detail-header" style={{ marginBottom: '20px' }}>
        <p className="detail-source-tag">Sumber {sert?.sumber || 'Mitra'}</p>
        <div className="detail-title">
          {sert?.namaKegiatan || 'Manajemen Proyek Kolaboratif'}
          <span className="badge badge-green">
            Diterbitkan
          </span>
        </div>
        <p className="detail-subtitle">
          {sert?.jenis || 'Workshop'} · {sert?.penyelenggara || 'PT Semen Padang'} · {sert?.tanggalPengajuan || '15 April 2026'}
        </p>
      </div>

      {/* Two Columns Layout */}
      <div className="detail-layout">
        {/* LEFT: Certificate Preview */}
        <div className="detail-preview-panel">
          <div className="detail-preview-header">
            <span className="detail-preview-label">Pratinjau dokumen contoh</span>
            <button className="btn-perbesar">
              <Eye size={14} /> Perbesar
            </button>
          </div>

          <div className="certificate-preview">
            <div className="certificate-doc">
              <div className="cert-header-row">
                <UnandLogo className="cert-logo" />
                <div className="cert-univ-name">PT SEMEN PADANG<br /><span style={{ fontSize: '10px', color: 'var(--gray-400)', fontWeight: 400 }}>Pratinjau contoh - bukan PDF resmi</span></div>
              </div>
              
              <p className="cert-title">SERTIFIKAT</p>
              <p className="cert-given">Diberikan kepada</p>
              <p className="cert-recipient">NADIA AMELIA</p>
              <p className="cert-participation">atas partisipasinya sebagai peserta dalam</p>
              <p className="cert-event-name">{sert?.namaKegiatan || 'Manajemen Proyek Kolaboratif'}</p>
              <p className="cert-date-place">
                {sert?.tanggalPengajuan || '15 April 2026'} · Universitas Andalas
              </p>

              <div className="cert-signatures">
                <div className="cert-sig-item">
                  <p className="cert-sig-line">Pimpinan Mitra</p>
                  <div style={{
                    height: 28,
                    margin: '6px 20px',
                    borderBottom: '1px solid var(--gray-300)',
                    fontFamily: 'cursive',
                    fontSize: '13px',
                    color: 'var(--green-900)',
                    fontWeight: 700
                  }}>
                    Mitra Terverifikasi
                  </div>
                  <p className="cert-sig-role">Telah Ditandatangani</p>
                </div>
                <div className="cert-sig-item">
                  <p className="cert-sig-line">Rektor UNAND</p>
                  <div style={{
                    height: 28,
                    margin: '6px 20px',
                    borderBottom: '1px solid var(--gray-300)',
                    fontFamily: 'cursive',
                    fontSize: '13px',
                    color: 'var(--green-900)',
                    fontWeight: 700
                  }}>
                    Andani Eka Putra
                  </div>
                  <p className="cert-sig-role">Telah Ditandatangani</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT: Document Info + Process + Disabled Signature Button */}
        <div className="detail-right-panel">
          {/* Card Info Dokumen */}
          <div className="info-card">
            <p className="info-card-title">Informasi dokumen</p>
            <div className="info-row">
              <span className="info-row-label">Template</span>
              <span className="info-row-value" style={{ fontSize: '12px' }}>Template Semen Padang — Kolaborasi</span>
            </div>
            <div className="info-row">
              <span className="info-row-label">Dokumen</span>
              <span className="info-row-value" style={{ color: 'var(--green-700)' }}>
                {sert?.jumlahSertifikat || 84} sertifikat peserta hadir
              </span>
            </div>
            <div className="info-row">
              <span className="info-row-label">Penyelenggara</span>
              <span className="info-row-value">{sert?.penyelenggara || 'PT Semen Padang'}</span>
            </div>
            <button className="btn-daftar-dok">Daftar Dokumen</button>
          </div>

          {/* Card Urutan Proses */}
          <div className="process-card">
            <p className="process-card-title">Urutan proses - Sumber {sert?.sumber || 'Mitra'}</p>
            {steps.map((step, i) => (
              <div className="process-step" key={i}>
                <div className="process-step-num step-done">
                  <Check size={12} />
                </div>
                <div className="process-step-info">
                  <p className="process-step-label">{step.label}</p>
                  <p className="process-step-status done">
                    {step.text}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Action Button Disabled for Already Signed Document */}
          <div className="action-buttons">
            <button
              className="btn-tandatangan-disabled"
              disabled
            >
              <PenTool size={15} />
              Tandatangani Sertifikat
            </button>
            <p className="btn-terbitkan-note" style={{ textAlign: 'left', lineHeight: 1.5 }}>
              Menunggu pengajuan penerbitan/koreksi, atau setiap nomor sertifikat sudah ditandatangani.
              Dokumen yang sudah ditandatangani tidak dapat ditandatangani ulang. Penerbitan hanya oleh Sekretariat.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}


import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Upload, Check, CheckCircle } from 'lucide-react';
import { sertifikatData, humasTemplates } from '../../data/mockData';
import BackButton from '../../components/BackButton';
import CertificateTemplateRenderer from '../../components/CertificateTemplateRenderer';

/* ─── Status maps ─────────────────────────────────────── */
const sertStatusClass = {
  'menunggu-rektor': 'badge badge-orange',
  'menunggu-mitra': 'badge badge-amber',
  'diterbitkan': 'badge badge-green',
};
const sertStatusLabel = {
  'menunggu-rektor': 'Menunggu Rektor',
  'menunggu-mitra': 'Menunggu Mitra',
  'diterbitkan': 'Diterbitkan',
};

/* ─── Process steps ───────────────────────────────────── */
function getSteps(status) {
  return [
    { label: 'Template Sertifikat', done: true },
    { label: 'Rektor UNAND', done: status === 'diterbitkan' },
    { label: 'Pimpinan Mitra', done: status === 'diterbitkan' },
    {
      label: 'Penerbitan oleh Sekretariat', done: status === 'diterbitkan',
      note: 'Setelah semua tanda tangan lengkap.'
    },
  ];
}

/* ─── Main Component ──────────────────────────────────── */
export default function DetailKegiatan() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [toastMessage, setToastMessage] = useState('');

  const sert = sertifikatData.find(s => String(s.id) === id);

  const [selectedTemplate, setSelectedTemplate] = useState(() => {
    if (!sert) return humasTemplates[0];
    return humasTemplates.find(t => t.nama === sert.template) || humasTemplates[0];
  });

  if (!sert) {
    return (
      <div style={{ padding: '40px', textAlign: 'center', color: 'var(--gray-400)' }}>
        <p>Data tidak ditemukan.</p>
        <button
          onClick={() => navigate('/sekretariat/sertifikat')}
          style={{
            marginTop: '16px', color: 'var(--green-700)', background: 'none',
            border: 'none', cursor: 'pointer', fontWeight: 600
          }}
        >
          ← Kembali ke Sertifikat
        </button>
      </div>
    );
  }

  const steps = getSteps(sert.statusTandaTangan);

  return (
    <div>
      {/* ── TOAST NOTIFIKASI TEMPLATE ── */}
      {toastMessage && (
        <div style={{
          position: 'fixed',
          top: '24px',
          right: '24px',
          background: '#14532d',
          color: 'white',
          padding: '12px 20px',
          borderRadius: '8px',
          boxShadow: '0 8px 24px rgba(0,0,0,0.18)',
          zIndex: 9999,
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          fontSize: '13px',
          fontWeight: 600,
        }}>
          <CheckCircle size={18} color="#86efac" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* ── Back button ── */}
      <BackButton to="/sekretariat/sertifikat" label="Kembali ke Daftar Sertifikat" />

      {/* ── Detail header ── */}
      <div className="detail-header">
        <p className="detail-source-tag">Sumber {sert.sumber}</p>
        <div className="detail-title">
          {sert.namaKegiatan}
          <span className={sertStatusClass[sert.statusTandaTangan]}>
            {sertStatusLabel[sert.statusTandaTangan]}
          </span>
        </div>
        <p className="detail-subtitle">
          {sert.jenis} · {sert.penyelenggara} · {sert.tanggalPengajuan}
        </p>
      </div>

      {/* ── Two-column: Preview + Info panel ── */}
      <div className="detail-layout">

        {/* LEFT: Certificate preview (Dinamis Sesuai Desain Template Terpilih) */}
        <div className="detail-preview-panel">
          <div className="detail-preview-header">
            <span className="detail-preview-label">Pratinjau Sertifikat</span>
          </div>

          {/* RENDER DESAIN SERTIFIKAT DINAMIS */}
          <div style={{ padding: '4px' }}>
            <CertificateTemplateRenderer
              desainKey={selectedTemplate.desainKey || 'klasik'}
              namaKegiatan={sert.namaKegiatan}
              namaPeserta="Nadia Amelia"
              tanggal={sert.tanggalPengajuan}
              penyelenggara={sert.penyelenggara}
            />
          </div>
        </div>

        {/* RIGHT: Info + Process + Actions */}
        <div className="detail-right-panel">

          {/* Info dokumen & Pemilihan Desain Template */}
          <div className="info-card">
            <p className="info-card-title">Informasi Dokumen</p>

            <div className="info-row" style={{ flexDirection: 'column', alignItems: 'flex-start', gap: '6px' }}>
              <span className="info-row-label">Template Sertifikat</span>
              <select
                className="filter-select"
                style={{
                  width: '100%',
                  height: '38px',
                  fontSize: '13px',
                  background: '#ffffff',
                  borderColor: 'var(--gray-300)',
                  color: 'var(--gray-900)',
                }}
                value={selectedTemplate.id}
                onChange={(e) => {
                  const chosen = humasTemplates.find(t => t.id === Number(e.target.value));
                  if (chosen) {
                    setSelectedTemplate(chosen);
                    setToastMessage(`Template "${chosen.nama}" berhasil diterapkan!`);
                    setTimeout(() => setToastMessage(''), 3500);
                  }
                }}
              >
                {humasTemplates.map(t => (
                  <option key={t.id} value={t.id}>
                    {t.nama}
                  </option>
                ))}
              </select>
            </div>

            <div className="info-row">
              <span className="info-row-label">Dokumen</span>
              <span className="info-row-value" style={{ color: 'var(--green-700)', fontWeight: 600 }}>
                {sert.jumlahSertifikat} peserta hadir
              </span>
            </div>
            <div className="info-row">
              <span className="info-row-label">Penyelenggara</span>
              <span className="info-row-value">{sert.penyelenggara}</span>
            </div>
            <div className="info-row">
              <span className="info-row-label">Format Dokumen</span>
              <span className="info-row-value" style={{ fontWeight: 600, color: 'var(--gray-900)' }}>
                PDF
              </span>
            </div>
          </div>

          {/* Process flow */}
          <div className="process-card">
            <p className="process-card-title">Urutan proses · Sumber {sert.sumber}</p>
            {steps.map((step, i) => (
              <div className="process-step" key={i}>
                <div className={`process-step-num ${step.done ? 'step-done' : 'step-waiting'}`}>
                  {step.done ? <Check size={12} /> : i + 1}
                </div>
                <div className="process-step-info">
                  <p className="process-step-label">{step.label}</p>
                  <p className={`process-step-status${step.done ? ' done' : ''}`}>
                    {step.done ? 'Selesai' : (step.note ?? 'Menunggu')}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Action buttons */}
          <div className="action-buttons">
            <button className="btn-upload">
              <Upload size={15} />
              Unggah Sertifikat PDF
            </button>
            <button
              className="btn-terbitkan"
              disabled={sert.statusTandaTangan !== 'diterbitkan'}
              style={{ opacity: sert.statusTandaTangan !== 'diterbitkan' ? 0.5 : 1 }}
            >
              Terbitkan Sertifikat
            </button>
            <p className="btn-terbitkan-note">
              Penerbitan hanya setelah semua tanda tangan lengkap dan PDF diunggah.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

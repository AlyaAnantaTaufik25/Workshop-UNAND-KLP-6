import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Upload, Check, CheckCircle } from 'lucide-react';
import BackButton from '../../components/BackButton';
import CertificateTemplateRenderer from '../../components/CertificateTemplateRenderer';
import { usePortalData } from '../../context/PortalData';
import { dialog, toast } from '../../components/Dialog';
import { certificatesApi } from '../../api';
import Select from '../../components/Select';

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
  const { sertifikatData, humasTemplates, reload } = usePortalData();
  const [saving, setSaving] = useState(false);
  const { id } = useParams();
  const navigate = useNavigate();

  const sert = sertifikatData.find(s => String(s.id) === id);

  // Daftar template: template UNAND + template yang sedang dipakai pengajuan (mis. template mitra)
  const templateOptions = sert && sert.templateId && !humasTemplates.some(t => t.id === sert.templateId)
    ? [{ id: sert.templateId, nama: sert.template, desainKey: sert.desainKey }, ...humasTemplates]
    : humasTemplates;
  const [selectedTemplate, setSelectedTemplate] = useState(() => {
    if (!sert) return templateOptions[0];
    return templateOptions.find(t => t.id === sert.templateId) || { id: '', nama: 'Belum dipilih', desainKey: sert.desainKey || 'klasik' };
  });

  // Simpan verifikasi draft (template & catatan) ke server
  const simpanVerifikasi = async (data, pesan) => {
    setSaving(true);
    try {
      await certificatesApi.verifySubmission(sert.id, data);
      await reload();
      toast(pesan);
      return true;
    } catch (err) {
      toast(err.message, { tone: 'error' });
      return false;
    } finally {
      setSaving(false);
    }
  };
  const tandaiTerverifikasi = async () => {
    const catatan = await dialog.prompt({
      title: 'Verifikasi draft sertifikat',
      message: 'Draft dinyatakan sudah diperiksa Sekretariat Rektor. Tambahkan catatan untuk Humas/Rektor bila perlu.',
      label: 'Catatan verifikasi', placeholder: 'Contoh: Nama kegiatan & nomor SK sudah sesuai.',
      required: false, confirmText: 'Tandai Terverifikasi', defaultValue: sert.catatan || '',
    });
    if (catatan === null) return;
    await simpanVerifikasi({ catatan }, 'Draft sertifikat ditandai terverifikasi.');
  };

  if (!sert) {
    return (
      <div style={{ padding: '40px', textAlign: 'center', color: 'var(--gray-400)' }}>
        <p>Data tidak ditemukan.</p>
        <BackButton onClick={() => navigate('/sekretariat/sertifikat')} label="Kembali ke Sertifikat" />
      </div>
    );
  }

  const steps = getSteps(sert.statusTandaTangan);

  return (
    <div>

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
              namaPeserta={sert.penerimaContoh && sert.penerimaContoh !== '-' ? sert.penerimaContoh : 'Nama Peserta'}
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
              <Select
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
                disabled={saving || sert.statusTandaTangan === 'diterbitkan'}
                onChange={async (e) => {
                  const chosen = templateOptions.find(t => t.id === Number(e.target.value));
                  if (!chosen || chosen.id === selectedTemplate.id) return;
                  const prev = selectedTemplate;
                  setSelectedTemplate(chosen);
                  const ok = await simpanVerifikasi({ templateId: chosen.id }, `Template "${chosen.nama}" diterapkan dan disimpan.`);
                  if (!ok) setSelectedTemplate(prev);
                }}
              >
                {!selectedTemplate.id && <option value="">Belum dipilih</option>}
                {templateOptions.map(t => (
                  <option key={t.id} value={t.id}>
                    {t.nama}
                  </option>
                ))}
              </Select>
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
              <span className="info-row-label">Verifikasi Sekretariat</span>
              <span className="info-row-value" style={{ fontWeight: 600, color: sert.terverifikasi ? 'var(--green-700)' : '#b45309' }}>
                {sert.terverifikasi ? `Terverifikasi · ${sert.waktuVerifikasi}` : 'Belum diverifikasi'}
              </span>
            </div>
            {sert.catatan && (
              <div className="info-row" style={{ flexDirection: 'column', alignItems: 'flex-start', gap: 4 }}>
                <span className="info-row-label">Catatan</span>
                <span className="info-row-value" style={{ textAlign: 'left', fontWeight: 500 }}>{sert.catatan}</span>
              </div>
            )}
            <div className="info-row">
              <span className="info-row-label">Format Dokumen</span>
              <span className="info-row-value" style={{ fontWeight: 600, color: 'var(--gray-900)' }}>
                PDF
              </span>
            </div>
            {sert.statusTandaTangan !== 'diterbitkan' && (
              <button type="button" className="btn-primary" style={{ width: '100%', marginTop: 12 }} disabled={saving} onClick={tandaiTerverifikasi}>
                {sert.terverifikasi ? 'Perbarui Catatan Verifikasi' : 'Tandai Draft Terverifikasi'}
              </button>
            )}
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

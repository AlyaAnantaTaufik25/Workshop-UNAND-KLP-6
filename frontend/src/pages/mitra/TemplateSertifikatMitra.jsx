import { useState } from 'react';
import {
  Search,
  Plus,
  Eye,
  Pencil,
  Trash2,
  Upload,
  X,
  SearchX,
  ArrowLeft,
  FileText,
  AlertTriangle,
  Check,
  CheckCircle2,
  Building2,
  HelpCircle,
} from 'lucide-react';
import { mitraTemplates } from './data';
import UnandLogo from '../../components/UnandLogo';

const kegiatanOptions = [
  'Workshop Data Science untuk Riset Akademik',
  'Manajemen Proyek Kolaboratif',
  'Inovasi Industri Berkelanjutan',
  'Seminar Transformasi Digital',
  'Seminar Kolaborasi Riset Lintas Disiplin',
];

const statusConfig = {
  'dapat-dipakai': { label: 'Dapat dipakai', className: 'mitra-badge-status mitra-badge-status--berlangsung' },
  'dipakai':       { label: 'Dipakai',       className: 'mitra-badge-status mitra-badge-status--berlangsung' },
  'diterbitkan':   { label: 'Diterbitkan',   className: 'mitra-badge-status mitra-badge-status--gray' },
};

const defaultForm = { id: null, nama: '', kegiatanTerkait: '', berkas: null, berkasNama: '' };

export default function TemplateSertifikatMitra() {
  const [templates, setTemplates]       = useState(mitraTemplates);
  const [search, setSearch]             = useState('');
  const [filterStatus, setFilterStatus] = useState('');

  // View mode: 'list' atau 'form' (halaman form baru)
  const [viewMode, setViewMode]         = useState('list');
  const [isEdit, setIsEdit]             = useState(false);
  const [form, setForm]                 = useState(defaultForm);

  // Modal pratinjau & modal hapus kustom formal
  const [previewItem, setPreviewItem]   = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [toastMsg, setToastMsg]         = useState('');

  const set = (k, v) => setForm(prev => ({ ...prev, [k]: v }));

  const showToast = (msg) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(''), 3500);
  };

  const filtered = templates.filter(t => {
    const q = search.toLowerCase();
    const matchSearch = t.nama.toLowerCase().includes(q) || t.kegiatanTerkait?.toLowerCase().includes(q);
    const matchStatus = filterStatus ? t.status === filterStatus : true;
    return matchSearch && matchStatus;
  });

  const handleBukaTambah = () => {
    setForm(defaultForm);
    setIsEdit(false);
    setViewMode('form');
  };

  const handleBukaEdit = (item) => {
    setForm({
      id: item.id,
      nama: item.nama,
      kegiatanTerkait: item.kegiatanTerkait || '',
      berkas: null,
      berkasNama: `${item.nama}.pdf`,
    });
    setIsEdit(true);
    setViewMode('form');
  };

  const handleBerkas = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      set('berkas', file);
      set('berkasNama', file.name);
    }
  };

  const handleSimpanForm = (e) => {
    e.preventDefault();
    if (!form.nama.trim()) return;

    if (isEdit && form.id) {
      setTemplates(prev =>
        prev.map(t =>
          t.id === form.id
            ? { ...t, nama: form.nama, kegiatanTerkait: form.kegiatanTerkait || '—' }
            : t
        )
      );
      showToast('Perubahan template berhasil disimpan.');
    } else {
      setTemplates(prev => [
        {
          id: Date.now(),
          nama: form.nama,
          kegiatanTerkait: form.kegiatanTerkait || '—',
          penerbit: 'PT Semen Padang',
          status: 'dapat-dipakai',
        },
        ...prev,
      ]);
      showToast('Template sertifikat berhasil diunggah.');
    }

    setViewMode('list');
    setForm(defaultForm);
  };

  const handleConfirmHapus = () => {
    if (deleteTarget) {
      setTemplates(prev => prev.filter(t => t.id !== deleteTarget.id));
      showToast(`Template "${deleteTarget.nama}" berhasil dihapus.`);
      setDeleteTarget(null);
    }
  };

  // ── RENDER 1: HALAMAN FORM BARU (UNTUK UPLOAD / EDIT DENGAN TAMPILAN SAMA PERSIS) ──
  if (viewMode === 'form') {
    return (
      <div className="mitra-stack">
        <div>
          <button
            type="button"
            className="mitra-back-btn"
            onClick={() => setViewMode('list')}
          >
            <ArrowLeft size={16} /> Kembali ke Daftar Template
          </button>
        </div>

        <div className="mitra-intro">
          <h2>{isEdit ? 'Edit Template Sertifikat' : 'Upload Template Sertifikat Baru'}</h2>
          <p>
            {isEdit
              ? 'Perbarui konfigurasi data atau ganti berkas desain template sertifikat mitra.'
              : 'Unggah berkas desain sertifikat resmi dalam format PDF beresolusi tinggi untuk kegiatan kerja sama.'}
          </p>
        </div>

        <form onSubmit={handleSimpanForm}>
          <div className="mitra-profil-container">
            {/* Bagian 1: Informasi Template */}
            <div style={{ marginBottom: 24 }}>
              <h3 style={{ fontSize: 16, fontWeight: 700, color: '#111827', margin: '0 0 4px 0' }}>
                Informasi Umum Template
              </h3>
              <p style={{ fontSize: 13, color: '#6B7280', margin: 0 }}>
                Konfigurasi identitas template sertifikat dan pengaitannya ke kegiatan resmi mitra.
              </p>
            </div>

            <div className="mitra-profil-grid">
              {/* Kolom 1: Nama Template */}
              <div className="mitra-profil-field">
                <label>
                  Nama Template Sertifikat <span className="req">*</span>
                </label>
                <input
                  type="text"
                  placeholder="Contoh: Template Resmi Workshop Data Science 2026"
                  value={form.nama}
                  onChange={e => set('nama', e.target.value)}
                  required
                  className="mitra-profil-input"
                />
              </div>

              {/* Kolom 2: Instansi Penerbit */}
              <div className="mitra-profil-field">
                <label>Instansi Penerbit</label>
                <input
                  type="text"
                  value="PT Semen Padang"
                  readOnly
                  className="mitra-profil-input mitra-profil-input--readonly"
                />
              </div>

              {/* Kolom 3: Kegiatan Kerja Sama Terkait */}
              <div className="mitra-profil-field">
                <label>Pilih Kegiatan Kerja Sama Terkait</label>
                <select
                  value={form.kegiatanTerkait}
                  onChange={e => set('kegiatanTerkait', e.target.value)}
                  className="mitra-profil-input"
                  style={{ cursor: 'pointer' }}
                >
                  <option value="">-- Belum dikaitkan ke kegiatan khusus --</option>
                  {kegiatanOptions.map(k => (
                    <option key={k} value={k}>{k}</option>
                  ))}
                </select>
                <span style={{ fontSize: 11.5, color: '#6B7280', marginTop: 4 }}>
                  Template akan otomatis digunakan saat sertifikat kegiatan diterbitkan.
                </span>
              </div>
            </div>

            <div className="mitra-profil-divider" style={{ margin: '28px 0 24px 0' }} />

            {/* Bagian 2: Unggah Berkas PDF */}
            <div style={{ marginBottom: 14 }}>
              <h3 style={{ fontSize: 15, fontWeight: 700, color: '#111827', margin: '0 0 4px 0' }}>
                Berkas Desain Sertifikat {!isEdit && <span style={{ color: '#111827' }}>*</span>}
              </h3>
              <p style={{ fontSize: 12.5, color: '#6B7280', margin: 0 }}>
                Pilih file PDF template beresolusi tinggi dengan orientasi lanskap (rekomendasi rasio A4).
              </p>
            </div>

            <label
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '32px 24px',
                border: form.berkasNama ? '1.5px solid #14532d' : '1.5px dashed #D1D5DB',
                borderRadius: '10px',
                background: form.berkasNama ? '#F0FDF4' : '#F9FAFB',
                cursor: 'pointer',
                textAlign: 'center',
                transition: 'all 0.15s',
              }}
            >
              <div
                style={{
                  width: 50,
                  height: 50,
                  borderRadius: '50%',
                  background: form.berkasNama ? '#DCFCE7' : '#EBF5EE',
                  color: '#14532d',
                  display: 'grid',
                  placeItems: 'center',
                  marginBottom: 12,
                }}
              >
                {form.berkasNama ? <CheckCircle2 size={26} /> : <Upload size={24} />}
              </div>

              <div>
                <strong style={{ fontSize: 14, color: '#111827', display: 'block', marginBottom: 4 }}>
                  {form.berkasNama ? form.berkasNama : 'Klik untuk memilih berkas template sertifikat (.pdf)'}
                </strong>
                <p style={{ fontSize: 12, color: form.berkasNama ? '#15803d' : '#6B7280', margin: 0 }}>
                  {form.berkasNama
                    ? 'Berkas PDF telah siap · Klik di sini jika ingin mengganti dengan berkas lain'
                    : 'Format berkas: PDF resolusi tinggi · Ukuran maksimal 10 MB'}
                </p>
              </div>

              <input
                type="file"
                accept=".pdf"
                style={{ display: 'none' }}
                onChange={handleBerkas}
                required={!isEdit && !form.berkasNama}
              />
            </label>

            <div className="mitra-profil-divider" style={{ marginTop: 32 }} />

            {/* Tombol Aksi Kanan Bawah */}
            <div className="mitra-profil-actions">
              <button
                type="button"
                className="mitra-profil-btn-batal"
                onClick={() => setViewMode('list')}
              >
                Batal
              </button>
              <button
                type="submit"
                className="mitra-profil-btn-simpan"
                style={{ display: 'inline-flex', alignItems: 'center', gap: 7 }}
              >
                {isEdit ? (
                  <>
                    <Check size={16} /> Simpan Perubahan
                  </>
                ) : (
                  <>
                    <Upload size={16} /> Upload Template
                  </>
                )}
              </button>
            </div>
          </div>
        </form>
      </div>
    );
  }

  // ── RENDER 2: HALAMAN DAFTAR UTAMA (TABEL TEMPLATE) ──
  return (
    <div className="mitra-stack">
      {/* Toast Notification */}
      {toastMsg && (
        <div style={{ position: 'fixed', bottom: 24, right: 24, zIndex: 1000, background: '#14532d', color: '#fff', padding: '12px 20px', borderRadius: 8, boxShadow: '0 8px 24px rgba(0,0,0,0.18)', display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, fontWeight: 600 }}>
          <Check size={16} /> {toastMsg}
        </div>
      )}

      {/* Header */}
      <div className="mitra-list-header">
        <div className="mitra-intro">
          <h2>Template Sertifikat</h2>
          <p>Kelola berkas template sertifikat resmi sumber mitra PT Semen Padang.</p>
        </div>
        <button className="mitra-btn" onClick={handleBukaTambah}>
          <Plus size={16} /> Upload Template
        </button>
      </div>

      {/* Filter Bar */}
      <div className="mitra-filterbar">
        <label className="mitra-searchbox">
          <Search size={18} />
          <input
            type="search"
            placeholder="Cari nama template atau kegiatan..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </label>
        <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)}>
          <option value="">Semua status</option>
          <option value="dapat-dipakai">Dapat dipakai</option>
          <option value="dipakai">Dipakai</option>
          <option value="diterbitkan">Diterbitkan</option>
        </select>
      </div>

      {/* Table */}
      <div className="mitra-table-card">
        <table className="mitra-table">
          <thead>
            <tr>
              <th>Nama Template</th>
              <th>Kegiatan Terkait</th>
              <th>Penerbit</th>
              <th>Status Penggunaan</th>
              <th style={{ textAlign: 'center', width: 140 }}>Tindakan</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={5}>
                  <div className="mitra-empty">
                    <SearchX size={36} />
                    <p>Belum ada template sertifikat yang cocok.</p>
                  </div>
                </td>
              </tr>
            ) : (
              filtered.map(t => {
                const cfg = statusConfig[t.status] ?? statusConfig['dapat-dipakai'];
                return (
                  <tr key={t.id}>
                    <td>
                      <span
                        className="mitra-activity-title"
                        onClick={() => setPreviewItem(t)}
                      >
                        {t.nama}
                      </span>
                    </td>
                    <td>{t.kegiatanTerkait}</td>
                    <td>{t.penerbit}</td>
                    <td>
                      <span className={cfg.className}>
                        <i></i> {cfg.label}
                      </span>
                    </td>
                    <td style={{ textAlign: 'center' }}>
                      <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                        {/* 1. Ikon Mata (Pratinjau) */}
                        <button
                          className="mitra-tindakan-btn mitra-tindakan-view"
                          title="Pratinjau Template"
                          aria-label="Pratinjau Template"
                          onClick={() => setPreviewItem(t)}
                          style={{ padding: '6px 8px' }}
                        >
                          <Eye size={15} />
                        </button>

                        {/* 2. Ikon Edit (Membuka Halaman Form Edit) */}
                        <button
                          className="mitra-tindakan-btn mitra-tindakan-sign"
                          title="Edit Template"
                          aria-label="Edit Template"
                          onClick={() => handleBukaEdit(t)}
                          style={{ padding: '6px 8px' }}
                        >
                          <Pencil size={15} />
                        </button>

                        {/* 3. Ikon Hapus (Membuka Modal Hapus Web Formal) */}
                        <button
                          className="mitra-tindakan-btn mitra-tindakan-reject"
                          title="Hapus Template"
                          aria-label="Hapus Template"
                          onClick={() => setDeleteTarget(t)}
                          style={{ padding: '6px 8px' }}
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* ── MODAL KONFIRMASI HAPUS FORMAL & ELEGAN ── */}
      {deleteTarget && (
        <div
          className="modal-overlay"
          onClick={() => setDeleteTarget(null)}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(15, 23, 42, 0.55)',
            backdropFilter: 'blur(3px)',
            display: 'grid',
            placeItems: 'center',
            zIndex: 1050,
            padding: 16,
          }}
        >
          <div
            className="modal-box"
            style={{
              maxWidth: 480,
              width: '100%',
              background: '#FFFFFF',
              borderRadius: 12,
              border: '1px solid #E2E8F0',
              boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.15), 0 8px 10px -6px rgba(0, 0, 0, 0.1)',
              overflow: 'hidden',
            }}
            onClick={e => e.stopPropagation()}
          >
            {/* Header Modal */}
            <div
              style={{
                padding: '20px 24px',
                display: 'flex',
                alignItems: 'flex-start',
                justifyContent: 'space-between',
                borderBottom: '1px solid #F1F5F9',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                <div
                  style={{
                    width: 44,
                    height: 44,
                    borderRadius: '50%',
                    background: '#FEE2E2',
                    border: '1px solid #FECACA',
                    color: '#DC2626',
                    display: 'grid',
                    placeItems: 'center',
                    flexShrink: 0,
                  }}
                >
                  <AlertTriangle size={22} />
                </div>
                <div>
                  <h3 style={{ fontSize: 16.5, fontWeight: 700, color: '#111827', margin: 0 }}>
                    Hapus Template Sertifikat
                  </h3>
                  <p style={{ fontSize: 12.5, color: '#6B7280', margin: '3px 0 0 0' }}>
                    Konfirmasi penghapusan data berkas template resmi
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setDeleteTarget(null)}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: '#9CA3AF',
                  cursor: 'pointer',
                  padding: 4,
                  borderRadius: 6,
                }}
              >
                <X size={18} />
              </button>
            </div>

            {/* Body Modal */}
            <div style={{ padding: '20px 24px' }}>
              <p style={{ fontSize: 13.5, color: '#374151', lineHeight: 1.6, margin: '0 0 16px 0' }}>
                Apakah Anda yakin ingin menghapus template sertifikat ini? Berkas desain dan konfigurasi yang telah dihapus tidak dapat dipulihkan kembali.
              </p>

              {/* Rincian Berkas yang akan dihapus */}
              <div
                style={{
                  background: '#F8FAFC',
                  border: '1px solid #E2E8F0',
                  borderRadius: 8,
                  padding: '12px 16px',
                  fontSize: 13,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 8,
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', gap: 10 }}>
                  <span style={{ color: '#64748B', fontSize: 12 }}>Nama Template:</span>
                  <strong style={{ color: '#0F172A', textAlign: 'right' }}>{deleteTarget.nama}</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', gap: 10 }}>
                  <span style={{ color: '#64748B', fontSize: 12 }}>Kegiatan Terkait:</span>
                  <span style={{ color: '#334155', textAlign: 'right' }}>{deleteTarget.kegiatanTerkait || '—'}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', gap: 10 }}>
                  <span style={{ color: '#64748B', fontSize: 12 }}>Instansi Penerbit:</span>
                  <span style={{ color: '#334155' }}>{deleteTarget.penerbit || 'PT Semen Padang'}</span>
                </div>
              </div>

              <div
                style={{
                  marginTop: 14,
                  padding: '9px 12px',
                  background: '#FFFBEB',
                  border: '1px solid #FDE68A',
                  borderRadius: 6,
                  fontSize: 12,
                  color: '#92400E',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 7,
                }}
              >
                <span>⚠️</span>
                <span>Pastikan template tidak sedang terhubung pada kegiatan yang sertifikatnya sedang menunggu TTE.</span>
              </div>
            </div>

            {/* Footer Modal */}
            <div
              style={{
                padding: '16px 24px',
                background: '#F8FAFC',
                borderTop: '1px solid #E2E8F0',
                display: 'flex',
                justifyContent: 'flex-end',
                alignItems: 'center',
                gap: 10,
              }}
            >
              <button
                type="button"
                onClick={() => setDeleteTarget(null)}
                style={{
                  height: 38,
                  padding: '0 18px',
                  borderRadius: 8,
                  border: '1px solid #CBD5E1',
                  background: '#FFFFFF',
                  color: '#334155',
                  fontSize: 13.5,
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleConfirmHapus}
                style={{
                  height: 38,
                  padding: '0 18px',
                  borderRadius: 8,
                  border: 'none',
                  background: '#DC2626',
                  color: '#FFFFFF',
                  fontSize: 13.5,
                  fontWeight: 600,
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 6,
                  boxShadow: '0 1px 3px rgba(220, 38, 38, 0.3)',
                }}
              >
                <Trash2 size={15} /> Ya, Hapus Template
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── MODAL PRATINJAU TEMPLATE ── */}
      {previewItem && (
        <div className="modal-overlay" onClick={() => setPreviewItem(null)}>
          <div className="modal-box" style={{ maxWidth: 640 }} onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <div>
                <span className="modal-header-crumb">PRATINJAU TEMPLATE</span>
                <h3 className="modal-header-title">{previewItem.nama}</h3>
              </div>
              <button className="modal-close-btn" onClick={() => setPreviewItem(null)}>
                <X size={16} />
              </button>
            </div>

            <div className="modal-body">
              <div className="cert-preview-wrapper" style={{ margin: 0 }}>
                <div className="cert-preview-box">
                  <div className="cert-logo-row">
                    <UnandLogo style={{ width: 36, height: 36 }} />
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--green-800)' }}>
                        {previewItem.penerbit || 'PT SEMEN PADANG'}
                      </div>
                      <div style={{ fontSize: 11, color: 'var(--gray-400)' }}>
                        Pratinjau Desain Template Sertifikat
                      </div>
                    </div>
                  </div>
                  <div className="cert-divider" />
                  <div className="cert-label-sertifikat">SERTIFIKAT</div>
                  <div className="cert-diberikan">Diberikan kepada</div>
                  <div className="cert-nama">[Nama Peserta Terdaftar]</div>
                  <div className="cert-atas">atas partisipasinya sebagai peserta dalam</div>
                  <div className="cert-kegiatan">
                    {previewItem.kegiatanTerkait && previewItem.kegiatanTerkait !== '—'
                      ? previewItem.kegiatanTerkait
                      : 'Kegiatan Kemitraan UNAND'}
                  </div>
                  <div className="cert-tanggal">Padang, Sumatera Barat</div>
                  <div className="cert-ttd-row">
                    <div className="cert-ttd">
                      <div className="cert-ttd-line" />
                      <div className="cert-ttd-title">Rektor UNAND</div>
                      <div className="cert-ttd-sub">Tanda tangan elektronik</div>
                    </div>
                    <div className="cert-ttd">
                      <div className="cert-ttd-line" />
                      <div className="cert-ttd-title">Pimpinan Mitra</div>
                      <div className="cert-ttd-sub">Tanda tangan elektronik</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="modal-footer">
              <button
                type="button"
                className="mitra-btn mitra-btn--secondary"
                onClick={() => setPreviewItem(null)}
              >
                Tutup
              </button>
              <button
                type="button"
                className="mitra-btn"
                onClick={() => {
                  const itm = previewItem;
                  setPreviewItem(null);
                  handleBukaEdit(itm);
                }}
              >
                <Pencil size={14} /> Edit Template Ini
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

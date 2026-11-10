import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Bell, Plus, Eye, Pencil, Trash2, X } from 'lucide-react';

const initialTemplates = [
  {
    id: 1,
    nama: 'Template UNAND — Data Science',
    kegiatanTerkait: 'Workshop Data Science untuk Riset Akademik',
    penerbit: 'UNAND',
    status: 'dapat-dipakai',
    berkasNama: 'Template UNAND — Data Science.pdf',
  },
];

const kegiatanOptions = [
  'Workshop Data Science untuk Riset Akademik',
  'Strategi Hilirisasi Riset dan Inovasi',
  'Kepemimpinan Muda Berdampak',
  'Manajemen Proyek Kolaboratif',
  'Inovasi Industri Berkelanjutan',
];

const defaultForm = {
  nama: '',
  penerbit: 'UNAND',
  kegiatanTerkait: '',
  berkas: null,
  berkasNama: '',
};

const statusConfig = {
  'dapat-dipakai': { label: 'Dapat dikelola', className: 'humas-badge humas-badge-publik' },
  'dipakai':       { label: 'Dipakai',       className: 'humas-badge humas-badge-berlangsung' },
  'diterbitkan':   { label: 'Diterbitkan',   className: 'humas-badge humas-badge-selesai' },
};

export default function TemplateSertifikat() {
  const navigate = useNavigate();
  const [templates, setTemplates] = useState(initialTemplates);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('');

  // Modal Tambah
  const [showTambahModal, setShowTambahModal] = useState(false);
  const [form, setForm] = useState(defaultForm);

  // Modal Edit
  const [showEditModal, setShowEditModal] = useState(false);
  const [editForm, setEditForm] = useState({
    id: null,
    nama: '',
    penerbit: 'UNAND',
    kegiatanTerkait: '',
    berkasNama: '',
    berkasSaatIni: '',
    berkas: null,
  });

  // Modal Pratinjau
  const [previewTemplate, setPreviewTemplate] = useState(null);

  const setTambahField = (k, v) => setForm(prev => ({ ...prev, [k]: v }));

  const filtered = templates.filter(t => {
    const q = search.toLowerCase();
    const matchSearch =
      t.nama.toLowerCase().includes(q) ||
      (t.kegiatanTerkait && t.kegiatanTerkait.toLowerCase().includes(q));
    const matchStatus = filterStatus ? t.status === filterStatus : true;
    return matchSearch && matchStatus;
  });

  const handleBerkasTambah = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setTambahField('berkas', file);
      setTambahField('berkasNama', file.name);
    }
  };

  const handleSimpanTambah = () => {
    if (!form.nama) return;
    setTemplates(prev => [
      ...prev,
      {
        id: Date.now(),
        nama: form.nama,
        kegiatanTerkait: form.kegiatanTerkait || '—',
        penerbit: form.penerbit,
        status: 'dapat-dipakai',
        berkasNama: form.berkasNama || `${form.nama}.pdf`,
      },
    ]);
    setForm(defaultForm);
    setShowTambahModal(false);
  };

  const handleOpenEdit = (t) => {
    setEditForm({
      id: t.id,
      nama: t.nama,
      penerbit: t.penerbit || 'UNAND',
      kegiatanTerkait: t.kegiatanTerkait !== '—' ? t.kegiatanTerkait : '',
      berkasNama: '',
      berkasSaatIni: t.berkasNama || `${t.nama}.pdf`,
      berkas: null,
    });
    setShowEditModal(true);
  };

  const handleBerkasEdit = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setEditForm(prev => ({
        ...prev,
        berkas: file,
        berkasNama: file.name,
      }));
    }
  };

  const handleSimpanEdit = () => {
    if (!editForm.nama) return;
    setTemplates(prev =>
      prev.map(t => {
        if (t.id === editForm.id) {
          return {
            ...t,
            nama: editForm.nama,
            kegiatanTerkait: editForm.kegiatanTerkait || '—',
            berkasNama: editForm.berkasNama || t.berkasNama,
          };
        }
        return t;
      })
    );
    setShowEditModal(false);
  };

  const handleHapus = (id) => {
    setTemplates(prev => prev.filter(t => t.id !== id));
  };

  return (
    <>
      <div className="humas-list-page">
        {/* Header bar dengan notifikasi dan tombol aksi kanan atas */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 }}>
          <div>
            <h2 className="humas-section-title">Template sertifikat</h2>
            <p className="humas-section-sub">Kelola template sertifikat sumber UNAND.</p>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 10 }}>
            <button
              className="humas-notif-btn"
              onClick={() => navigate('/humas/perbaikan-sertifikat')}
            >
              <Bell size={15} /> Notifikasi perbaikan (1)
            </button>
            <button className="humas-tambah-btn" onClick={() => setShowTambahModal(true)}>
              <Plus size={15} /> Tambah Template
            </button>
          </div>
        </div>

        {/* Filter bar */}
        <div className="filter-bar" style={{ marginBottom: 16 }}>
          <div className="search-wrap" style={{ flex: 1 }}>
            <Search size={15} className="search-icon" />
            <input
              className="search-input"
              placeholder="Cari nama template atau k..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
          <select
            className="filter-select"
            value={filterStatus}
            onChange={e => setFilterStatus(e.target.value)}
          >
            <option value="">Semua status</option>
            <option value="dapat-dipakai">Dapat dikelola</option>
            <option value="dipakai">Dipakai</option>
            <option value="diterbitkan">Diterbitkan</option>
          </select>
        </div>

        {/* Table */}
        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>NAMA TEMPLATE</th>
                <th>KEGIATAN TERKAIT</th>
                <th>PENERBIT</th>
                <th>STATUS PENGGUNAAN</th>
                <th>TINDAKAN</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={5} style={{ textAlign: 'center', color: '#9ca3af', padding: '32px' }}>
                    Belum ada template sertifikat.
                  </td>
                </tr>
              ) : (
                filtered.map(t => {
                  const cfg = statusConfig[t.status] ?? statusConfig['dapat-dipakai'];
                  const locked = t.status === 'dipakai' || t.status === 'diterbitkan';
                  return (
                    <tr key={t.id}>
                      <td>
                        <span
                          className="table-name-bold humas-link"
                          style={{ cursor: 'pointer' }}
                          onClick={() => setPreviewTemplate(t)}
                        >
                          {t.nama}
                        </span>
                      </td>
                      <td>
                        <span className="humas-link" style={{ fontSize: '13px' }}>
                          {t.kegiatanTerkait}
                        </span>
                      </td>
                      <td>{t.penerbit}</td>
                      <td>
                        <span className={cfg.className}>● {cfg.label}</span>
                      </td>
                      <td>
                        <div className="humas-tindakan-group">
                          <button
                            type="button"
                            className="humas-tindakan-btn humas-tindakan-view"
                            onClick={() => setPreviewTemplate(t)}
                          >
                            <Eye size={12} /> Detail
                          </button>
                          {!locked && (
                            <button
                              type="button"
                              className="humas-tindakan-btn humas-tindakan-edit"
                              onClick={() => handleOpenEdit(t)}
                            >
                              <Pencil size={12} /> Edit
                            </button>
                          )}
                          {!locked && (
                            <button
                              type="button"
                              className="humas-tindakan-btn humas-tindakan-delete"
                              onClick={() => handleHapus(t.id)}
                            >
                              <Trash2 size={12} /> Hapus
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Footer note */}
        <p className="humas-table-footnote" style={{ marginTop: '14px' }}>
          Template yang sudah dipakai pada sertifikat bertanda tangan atau{' '}
          <a href="#" className="humas-link">
            diterbitkan
          </a>{' '}
          tidak dapat{' '}
          <a href="#" className="humas-link">
            diedit
          </a>{' '}
          maupun dihapus. Buat template baru untuk kebutuhan berikutnya.
        </p>
      </div>

      {/* ─── MODAL TAMBAH TEMPLATE SERTIFIKAT ─── */}
      {showTambahModal && (
        <div className="modal-overlay" onClick={() => setShowTambahModal(false)}>
          <div
            className="modal-box"
            style={{ maxWidth: 500, width: '100%' }}
            onClick={e => e.stopPropagation()}
          >
            <div className="modal-header">
              <div>
                <p className="modal-header-crumb">WORKSHOP UNAND</p>
                <h2 className="modal-header-title">Tambah Template Sertifikat</h2>
              </div>
              <button
                className="modal-close-btn"
                onClick={() => setShowTambahModal(false)}
              >
                <X size={16} />
              </button>
            </div>

            <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div className="form-group">
                <label className="form-label">
                  Nama template <span className="req">*</span>
                </label>
                <input
                  className="form-input"
                  placeholder="Contoh: Template UNAND..."
                  value={form.nama}
                  onChange={e => setTambahField('nama', e.target.value)}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Penerbit</label>
                <input
                  className="form-input"
                  value={form.penerbit}
                  readOnly
                  style={{ background: '#f3f4f6', color: '#6b7280' }}
                />
              </div>

              <div className="form-group">
                <label className="form-label">
                  Kegiatan terkait <span className="form-label-opt">(opsional)</span>
                </label>
                <select
                  className="form-input"
                  value={form.kegiatanTerkait}
                  onChange={e => setTambahField('kegiatanTerkait', e.target.value)}
                >
                  <option value="">Belum dikaitkan ke kegiatan</option>
                  {kegiatanOptions.map(k => (
                    <option key={k} value={k}>
                      {k}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">
                  Berkas PDF <span className="req">*</span>
                </label>
                <label className="custom-file-input-box">
                  <span className="file-box-text">
                    {form.berkasNama ? form.berkasNama : 'Pilih File Tidak ada file yang dipilih'}
                  </span>
                  <input
                    type="file"
                    accept=".pdf"
                    style={{ display: 'none' }}
                    onChange={handleBerkasTambah}
                  />
                </label>
                <p
                  className="form-hint"
                  style={{
                    marginTop: '8px',
                    color: '#6b7280',
                    fontSize: '12px',
                    lineHeight: '1.45',
                  }}
                >
                  Format PDF, maksimal 10 MB. Hanya kegiatan sesuai penerbit yang belum memiliki
                  template dan belum ditandatangani yang dapat dipilih.
                </p>
              </div>
            </div>

            <div
              className="modal-footer"
              style={{
                borderTop: '1px solid #e5e7eb',
                paddingTop: '14px',
                display: 'flex',
                justifyContent: 'flex-end',
                gap: '10px',
              }}
            >
              <button
                className="modal-btn modal-btn-batal"
                onClick={() => setShowTambahModal(false)}
              >
                Batal
              </button>
              <button
                className="modal-btn modal-btn-publish"
                style={{ background: '#14532d', color: '#ffffff' }}
                onClick={handleSimpanTambah}
              >
                Simpan Template
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ─── MODAL EDIT TEMPLATE SERTIFIKAT ─── */}
      {showEditModal && (
        <div className="modal-overlay" onClick={() => setShowEditModal(false)}>
          <div
            className="modal-box"
            style={{ maxWidth: 500, width: '100%' }}
            onClick={e => e.stopPropagation()}
          >
            <div className="modal-header">
              <div>
                <p className="modal-header-crumb">WORKSHOP UNAND</p>
                <h2 className="modal-header-title">Edit Template Sertifikat</h2>
              </div>
              <button
                className="modal-close-btn"
                onClick={() => setShowEditModal(false)}
              >
                <X size={16} />
              </button>
            </div>

            <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div className="form-group">
                <label className="form-label">
                  Nama template <span className="req">*</span>
                </label>
                <input
                  className="form-input"
                  value={editForm.nama}
                  onChange={e =>
                    setEditForm(prev => ({ ...prev, nama: e.target.value }))
                  }
                />
              </div>

              <div className="form-group">
                <label className="form-label">Penerbit</label>
                <input
                  className="form-input"
                  value={editForm.penerbit}
                  readOnly
                  style={{ background: '#f3f4f6', color: '#6b7280' }}
                />
              </div>

              <div className="form-group">
                <label className="form-label">
                  Kegiatan terkait <span className="form-label-opt">(opsional)</span>
                </label>
                <select
                  className="form-input"
                  value={editForm.kegiatanTerkait}
                  onChange={e =>
                    setEditForm(prev => ({ ...prev, kegiatanTerkait: e.target.value }))
                  }
                >
                  <option value="">Belum dikaitkan ke kegiatan</option>
                  {kegiatanOptions.map(k => (
                    <option key={k} value={k}>
                      {k}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">
                  Ganti berkas PDF <span className="form-label-opt">(opsional)</span>
                </label>
                <label className="custom-file-input-box">
                  <span className="file-box-text">
                    {editForm.berkasNama
                      ? editForm.berkasNama
                      : 'Pilih File Tidak ada file yang dipilih'}
                  </span>
                  <input
                    type="file"
                    accept=".pdf"
                    style={{ display: 'none' }}
                    onChange={handleBerkasEdit}
                  />
                </label>
                <p
                  style={{
                    marginTop: '8px',
                    color: '#4b5563',
                    fontSize: '12px',
                    lineHeight: '1.4',
                  }}
                >
                  Berkas saat ini: {editForm.berkasSaatIni}
                </p>
                <p
                  className="form-hint"
                  style={{
                    marginTop: '10px',
                    color: '#6b7280',
                    fontSize: '12px',
                    lineHeight: '1.45',
                  }}
                >
                  Format PDF, maksimal 10 MB. Hanya kegiatan sesuai penerbit yang belum memiliki
                  template dan belum ditandatangani yang dapat dipilih.
                </p>
              </div>
            </div>

            <div
              className="modal-footer"
              style={{
                borderTop: '1px solid #e5e7eb',
                paddingTop: '14px',
                display: 'flex',
                justifyContent: 'flex-end',
                gap: '10px',
              }}
            >
              <button
                className="modal-btn modal-btn-batal"
                onClick={() => setShowEditModal(false)}
              >
                Batal
              </button>
              <button
                className="modal-btn modal-btn-publish"
                style={{ background: '#14532d', color: '#ffffff' }}
                onClick={handleSimpanEdit}
              >
                Simpan Template
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ─── MODAL DETAIL / PRATINJAU ─── */}
      {previewTemplate && (
        <div className="modal-overlay" onClick={() => setPreviewTemplate(null)}>
          <div
            className="modal-box"
            style={{
              maxWidth: 720,
              width: '100%',
              maxHeight: '92vh',
              overflowY: 'auto',
              borderRadius: '12px',
            }}
            onClick={e => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="modal-header">
              <div>
                <p className="modal-header-crumb">WORKSHOP UNAND</p>
                <h2 className="modal-header-title">Detail Template Sertifikat</h2>
              </div>
              <button
                className="modal-close-btn"
                onClick={() => setPreviewTemplate(null)}
              >
                <X size={16} />
              </button>
            </div>

            {/* Modal Body */}
            <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {/* Info Rows */}
              <div style={{ display: 'flex', flexDirection: 'column', fontSize: '13px' }}>
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '10px 0',
                    borderBottom: '1px solid #f1f5f9',
                  }}
                >
                  <span style={{ color: '#4b5563' }}>Nama template</span>
                  <span style={{ color: '#111827', fontWeight: '500' }}>{previewTemplate.nama}</span>
                </div>

                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '10px 0',
                    borderBottom: '1px solid #f1f5f9',
                  }}
                >
                  <span style={{ color: '#4b5563' }}>Penerbit</span>
                  <span style={{ color: '#111827', fontWeight: '500' }}>{previewTemplate.penerbit}</span>
                </div>

                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '10px 0',
                    borderBottom: '1px solid #f1f5f9',
                  }}
                >
                  <span style={{ color: '#4b5563' }}>Berkas PDF</span>
                  <span style={{ color: '#111827', fontWeight: '500' }}>
                    {previewTemplate.berkasNama || `${previewTemplate.nama}.pdf`}
                  </span>
                </div>

                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '10px 0',
                  }}
                >
                  <span style={{ color: '#4b5563' }}>Kegiatan terkait</span>
                  <span style={{ color: '#111827', fontWeight: '500' }}>
                    {previewTemplate.kegiatanTerkait && previewTemplate.kegiatanTerkait !== '—'
                      ? previewTemplate.kegiatanTerkait
                      : '—'}
                  </span>
                </div>
              </div>

              {/* Certificate Canvas / Card */}
              <div
                style={{
                  border: '1.5px solid #14532d',
                  padding: '4px',
                  borderRadius: '2px',
                  background: '#ffffff',
                  marginTop: '4px',
                }}
              >
                <div
                  style={{
                    border: '1.5px solid #14532d',
                    padding: '40px 32px 32px',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    textAlign: 'center',
                    background: '#ffffff',
                  }}
                >
                  {/* Logo Row */}
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '10px',
                      marginBottom: '28px',
                    }}
                  >
                    <div
                      style={{
                        width: 32,
                        height: 32,
                        borderRadius: 6,
                        background: '#14532d',
                        color: '#ffffff',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontWeight: 'bold',
                        fontSize: '18px',
                        fontFamily: 'serif',
                      }}
                    >
                      U
                    </div>
                    <div style={{ textAlign: 'left' }}>
                      <div
                        style={{
                          fontSize: '13px',
                          fontWeight: '800',
                          color: '#14532d',
                          letterSpacing: '0.04em',
                          lineHeight: '1.2',
                        }}
                      >
                        UNIVERSITAS ANDALAS
                      </div>
                      <div style={{ fontSize: '10px', color: '#6b7280', marginTop: '2px' }}>
                        Dokumen resmi
                      </div>
                    </div>
                  </div>

                  {/* Judul Sertifikat */}
                  <div
                    style={{
                      fontSize: '13px',
                      fontWeight: '800',
                      color: '#14532d',
                      letterSpacing: '0.24em',
                      marginBottom: '14px',
                    }}
                  >
                    SERTIFIKAT
                  </div>

                  {/* Diberikan kepada */}
                  <div
                    style={{
                      fontSize: '11.5px',
                      color: '#6b7280',
                      marginBottom: '10px',
                    }}
                  >
                    Diberikan kepada
                  </div>

                  {/* Nama Peserta */}
                  <div
                    style={{
                      fontFamily: 'serif',
                      fontSize: '26px',
                      fontWeight: '600',
                      color: '#14532d',
                      letterSpacing: '0.04em',
                      borderBottom: '2px solid #14532d',
                      paddingBottom: '6px',
                      minWidth: '260px',
                      marginBottom: '16px',
                    }}
                  >
                    NAMA PESERTA
                  </div>

                  {/* Atas partisipasinya */}
                  <div
                    style={{
                      fontSize: '11px',
                      color: '#6b7280',
                      marginBottom: '8px',
                    }}
                  >
                    atas partisipasinya sebagai peserta dalam
                  </div>

                  {/* Nama Kegiatan */}
                  <div
                    style={{
                      fontFamily: 'serif',
                      fontSize: '17px',
                      fontWeight: '700',
                      color: '#14532d',
                      marginBottom: '6px',
                    }}
                  >
                    {previewTemplate.kegiatanTerkait && previewTemplate.kegiatanTerkait !== '—'
                      ? previewTemplate.kegiatanTerkait
                      : 'Workshop Data Science untuk Riset Akademik'}
                  </div>

                  {/* Tanggal & Lokasi */}
                  <div
                    style={{
                      fontSize: '10.5px',
                      color: '#4b5563',
                      marginBottom: '44px',
                    }}
                  >
                    18 Mei 2026 · Universitas Andalas
                  </div>

                  {/* Tanda Tangan */}
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      width: '100%',
                      maxWidth: '440px',
                      padding: '0 20px',
                    }}
                  >
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '130px' }}>
                      <div style={{ width: '100%', height: '1px', background: '#374151', marginBottom: '8px' }} />
                      <div style={{ fontSize: '11px', fontWeight: '700', color: '#111827' }}>Rektor UNAND</div>
                      <div style={{ fontSize: '10px', color: '#9ca3af', marginTop: '2px' }}>Menunggu</div>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '130px' }}>
                      <div style={{ width: '100%', height: '1px', background: '#374151', marginBottom: '8px' }} />
                      <div style={{ fontSize: '11px', fontWeight: '700', color: '#111827' }}>Pimpinan Mitra</div>
                      <div style={{ fontSize: '10px', color: '#9ca3af', marginTop: '2px' }}>Menunggu</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div
              className="modal-footer"
              style={{
                borderTop: '1px solid #e5e7eb',
                paddingTop: '14px',
                display: 'flex',
                justifyContent: 'flex-end',
                gap: '10px',
              }}
            >
              <button
                className="modal-btn modal-btn-batal"
                style={{
                  padding: '8px 20px',
                  borderRadius: '6px',
                  border: '1px solid #d1d5db',
                  background: '#ffffff',
                  color: '#374151',
                  fontSize: '13px',
                  fontWeight: '600',
                  cursor: 'pointer',
                }}
                onClick={() => setPreviewTemplate(null)}
              >
                Tutup
              </button>
              <button
                className="modal-btn modal-btn-publish"
                style={{
                  background: '#14532d',
                  color: '#ffffff',
                  padding: '8px 20px',
                  borderRadius: '6px',
                  border: 'none',
                  fontSize: '13px',
                  fontWeight: '600',
                  cursor: 'pointer',
                }}
                onClick={() => {
                  const t = previewTemplate;
                  setPreviewTemplate(null);
                  handleOpenEdit(t);
                }}
              >
                Edit Template
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

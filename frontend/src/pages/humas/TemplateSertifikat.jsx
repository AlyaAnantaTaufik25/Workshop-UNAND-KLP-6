import { useState } from 'react';
import { Search, Bell, Plus, Eye, Pencil, Trash2, X, AlertCircle, Upload } from 'lucide-react';
import { humasTemplates } from '../../data/mockData';

const initialTemplates = humasTemplates;

const kegiatanOptions = [
  'Workshop Data Science untuk Riset Akademik',
  'Strategi Hilirisasi Riset dan Inovasi',
  'Kepemimpinan Muda Berdampak',
  'Manajemen Proyek Kolaboratif',
  'Inovasi Industri Berkelanjutan',
];

const defaultForm = { nama: '', penerbit: 'UNAND', kegiatanTerkait: '', berkas: null, berkasNama: '' };

const statusConfig = {
  'dapat-dipakai': { label: 'Dapat dipakai', className: 'humas-badge humas-badge-publik' },
  'dipakai':       { label: 'Dipakai',       className: 'humas-badge humas-badge-berlangsung' },
  'diterbitkan':   { label: 'Diterbitkan',   className: 'humas-badge humas-badge-selesai' },
};

export default function TemplateSertifikat() {
  const [templates, setTemplates] = useState(initialTemplates);
  const [search, setSearch]       = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [form, setForm]           = useState(defaultForm);

  const set = (k, v) => setForm(prev => ({ ...prev, [k]: v }));

  const filtered = templates.filter(t => {
    const q = search.toLowerCase();
    const matchSearch = t.nama.toLowerCase().includes(q) || t.kegiatanTerkait?.toLowerCase().includes(q);
    const matchStatus = filterStatus ? t.status === filterStatus : true;
    return matchSearch && matchStatus;
  });

  const handleBerkas = (e) => {
    const file = e.target.files?.[0];
    if (file) { set('berkas', file); set('berkasNama', file.name); }
  };

  const handleSimpan = () => {
    if (!form.nama || !form.berkas) return;
    setTemplates(prev => [...prev, {
      id: Date.now(),
      nama: form.nama,
      kegiatanTerkait: form.kegiatanTerkait || '—',
      penerbit: form.penerbit,
      status: 'dapat-dipakai',
    }]);
    setForm(defaultForm);
    setShowModal(false);
  };

  const handleHapus = (id) => {
    setTemplates(prev => prev.filter(t => t.id !== id));
  };

  return (
    <>
      <div className="humas-list-page">

        {/* Prototype Banner */}
        <div className="humas-prototype-banner">
          <span className="humas-prototype-tag">Mode Prototipe</span>
          <span className="humas-prototype-text">
            Data contoh, perubahan hanya selama sesi. OFS, OTF, tanda tangan electronic dan PDF resmi belum terintegrasi.
          </span>
          <span className="humas-prototype-date">Referensi demo: 10 Mei 2026</span>
        </div>

        {/* Notif */}
        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
          <button className="humas-notif-btn"><Bell size={15} /> Notifikasi perbaikan (1)</button>
        </div>

        {/* Header */}
        <div className="humas-list-header">
          <div>
            <h2 className="humas-section-title">Template sertifikat</h2>
            <p className="humas-section-sub">Kelola template sertifikat sumber UNAND.</p>
          </div>
          <button className="humas-tambah-btn" onClick={() => setShowModal(true)}>
            <Plus size={15} /> Tambah Template
          </button>
        </div>

        {/* Simulasi banner */}
        <div className="humas-info-banner">
          <AlertCircle size={15} style={{ flexShrink: 0 }} />
          <span>
            <strong>Simulasi sesi:</strong> Template PDF hanya disimpan sementara di memori browser, bukan di server.
            Perubahan hilang saat halaman dimuat ulang.
          </span>
        </div>

        {/* Filter */}
        <div className="filter-bar">
          <div className="search-wrap" style={{ flex: 1 }}>
            <Search size={15} className="search-icon" />
            <input
              className="search-input"
              placeholder="Cari nama template atau ke..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
          <select className="filter-select" value={filterStatus} onChange={e => setFilterStatus(e.target.value)}>
            <option value="">Semua status</option>
            <option value="dapat-dipakai">Dapat dipakai</option>
            <option value="dipakai">Dipakai</option>
            <option value="diterbitkan">Diterbitkan</option>
          </select>
        </div>

        {/* Table */}
        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Nama Template</th>
                <th>Kegiatan Terkait</th>
                <th>Penerbit</th>
                <th>Status Penggunaan</th>
                <th>Tindakan</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={5} style={{ textAlign: 'center', color: 'var(--gray-400)', padding: '32px' }}>
                    Belum ada template sertifikat.
                  </td>
                </tr>
              )}
              {filtered.map(t => {
                const cfg = statusConfig[t.status] ?? statusConfig['dapat-dipakai'];
                const locked = t.status === 'dipakai' || t.status === 'diterbitkan';
                return (
                  <tr key={t.id}>
                    <td>
                      <span className="table-name-bold humas-link" style={{ cursor: 'pointer' }}>{t.nama}</span>
                    </td>
                    <td>
                      <span className="humas-link" style={{ fontSize: '13px' }}>{t.kegiatanTerkait}</span>
                    </td>
                    <td>{t.penerbit}</td>
                    <td><span className={cfg.className}>● {cfg.label}</span></td>
                    <td>
                      <div className="humas-tindakan-group">
                        <button className="humas-tindakan-btn humas-tindakan-view">
                          <Eye size={12} /> Detail / Pratinjau
                        </button>
                        {!locked && (
                          <button className="humas-tindakan-btn humas-tindakan-edit">
                            <Pencil size={12} /> Edit
                          </button>
                        )}
                        {!locked && (
                          <button className="humas-tindakan-btn humas-tindakan-delete" onClick={() => handleHapus(t.id)}>
                            <Trash2 size={12} /> Hapus
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Footer note */}
        <p className="humas-table-footnote">
          Template yang sudah dipakai pada sertifikat bertanda tangan atau{' '}
          <a href="#" className="humas-link">diterbitkan</a> tidak dapat{' '}
          <a href="#" className="humas-link">diedit</a> maupun dihapus.
          Buat template baru untuk kebutuhan berikutnya.
        </p>
      </div>

      {/* Tambah Template Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-box" style={{ maxWidth: 540 }} onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <div>
                <p className="modal-header-crumb">WORKSHOP UNAND</p>
                <h2 className="modal-header-title">Tambah Template Sertifikat</h2>
              </div>
              <button className="modal-close-btn" onClick={() => setShowModal(false)}><X size={16} /></button>
            </div>
            <div className="modal-body" style={{ gap: 16 }}>
              <div className="form-group">
                <label className="form-label">Nama template <span className="req">*</span></label>
                <input
                  className="form-input"
                  placeholder="Contoh: Template UNAND..."
                  value={form.nama}
                  onChange={e => set('nama', e.target.value)}
                />
              </div>
              <div className="form-group">
                <label className="form-label">Penerbit</label>
                <input className="form-input" value={form.penerbit} readOnly style={{ background: 'var(--gray-50)', color: 'var(--gray-500)' }} />
              </div>
              <div className="form-group">
                <label className="form-label">Kegiatan terkait <span className="form-label-opt">(opsional)</span></label>
                <select className="form-input" value={form.kegiatanTerkait} onChange={e => set('kegiatanTerkait', e.target.value)}>
                  <option value="">Belum dikaitkan ke kegiatan</option>
                  {kegiatanOptions.map(k => <option key={k}>{k}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Berkas PDF <span className="req">*</span></label>
                <label className="file-upload-label">
                  <Upload size={14} />
                  <span>{form.berkasNama || 'Pilih File · Tidak ada file yang dipilih'}</span>
                  <input type="file" accept=".pdf" style={{ display: 'none' }} onChange={handleBerkas} />
                </label>
                <p className="form-hint">
                  Format PDF, maksimal 10 MB. Hanya kegiatan sesuai penerbit yang belum memiliki template
                  dan belum ditandatangani yang dapat dipilih.
                </p>
              </div>
            </div>
            <div className="modal-footer">
              <button className="modal-btn modal-btn-batal" onClick={() => setShowModal(false)}>Batal</button>
              <button className="modal-btn modal-btn-publish" onClick={handleSimpan}>Simpan Template</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

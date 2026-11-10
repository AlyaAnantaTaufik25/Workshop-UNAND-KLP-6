import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Bell, Plus, Eye, Pencil, Trash2, X } from 'lucide-react';

const initialMitra = [
  {
    id: 1,
    nama: 'PT Semen Padang',
    jenis: 'Eksternal',
    penanggungJawab: 'Ahmad Rizal',
    email: 'mitra@semenpadang.co.id',
    kontak: '0751 815250',
    kegiatanTerkait: [
      'Workshop Data Science untuk Riset Akademik',
      'Manajemen Proyek Kolaboratif',
      'Inovasi Industri Berkelanjutan',
      'Seminar Transformasi Digital',
      'Seminar Kolaborasi Riset Lintas Disiplin'
    ],
  },
  {
    id: 2,
    nama: 'Bank Nagari',
    jenis: 'Eksternal',
    penanggungJawab: 'Dewi Anggraini',
    email: 'kc.ekonomi@banknagari.co.id',
    kontak: '0751 31377',
    kegiatanTerkait: ['Strategi Hilirisasi Riset dan Inovasi'],
  },
  {
    id: 3,
    nama: 'Fakultas Ekonomi dan Bisnis UNAND',
    jenis: 'Internal',
    penanggungJawab: 'Sari Dewi',
    email: 'feb@unand.ac.id',
    kontak: '0751 71000',
    kegiatanTerkait: ['Kepemimpinan Muda Berdampak'],
  },
  {
    id: 4,
    nama: 'Fakultas Teknologi Informasi UNAND',
    jenis: 'Internal',
    penanggungJawab: 'Rahmat Hidayat',
    email: 'fti@unand.ac.id',
    kontak: '0751 77889',
    kegiatanTerkait: ['Seminar Kolaborasi Riset Lintas Disiplin'],
  },
];

const defaultForm = { nama: '', jenis: 'Eksternal', penanggungJawab: '', email: '', kontak: '' };

export default function KelolaMitra() {
  const navigate = useNavigate();
  const [mitra, setMitra]           = useState(initialMitra);
  const [search, setSearch]         = useState('');
  const [showModal, setShowModal]   = useState(false);
  const [detailMitra, setDetailMitra] = useState(null);
  const [editMitra, setEditMitra]   = useState(null);
  const [form, setForm]             = useState(defaultForm);

  const set = (k, v) => setForm(prev => ({ ...prev, [k]: v }));

  const filtered = mitra.filter(m =>
    m.nama.toLowerCase().includes(search.toLowerCase()) ||
    m.penanggungJawab.toLowerCase().includes(search.toLowerCase())
  );

  const handleBukaTambah = () => {
    setForm(defaultForm);
    setShowModal(true);
  };

  const handleBukaEdit = (item) => {
    setEditMitra(item);
    setForm({
      nama: item.nama,
      jenis: item.jenis,
      penanggungJawab: item.penanggungJawab,
      email: item.email,
      kontak: item.kontak,
    });
  };

  const handleSimpanTambah = () => {
    if (!form.nama || !form.jenis) return;
    setMitra(prev => [...prev, { ...form, id: Date.now(), kegiatanTerkait: [] }]);
    setForm(defaultForm);
    setShowModal(false);
  };

  const handleSimpanEdit = () => {
    if (!editMitra) return;
    setMitra(prev => prev.map(m => m.id === editMitra.id ? { ...m, ...form } : m));
    setEditMitra(null);
    setForm(defaultForm);
  };

  const handleHapus = (id) => {
    if (window.confirm('Yakin ingin menghapus mitra ini?')) {
      setMitra(prev => prev.filter(m => m.id !== id));
    }
  };

  return (
    <>
      <div className="humas-list-page">

        {/* Header + actions */}
        <div className="humas-list-header">
          <div>
            <h2 className="humas-section-title">Kelola Mitra</h2>
            <p className="humas-section-sub">
              Mitra Internal dan Eksternal menggunakan portal yang sama.
            </p>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 10 }}>
            <button className="humas-notif-btn">
              <Bell size={15} /> Notifikasi perbaikan (1)
            </button>
            <button className="humas-tambah-btn" onClick={handleBukaTambah}>
              <Plus size={15} /> Tambah Mitra
            </button>
          </div>
        </div>

        {/* Search */}
        <div className="filter-bar">
          <div className="search-wrap" style={{ flex: 1 }}>
            <Search size={15} className="search-icon" />
            <input
              className="search-input"
              placeholder="Cari data..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
        </div>

        {/* Table */}
        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Nama Instansi</th>
                <th>Jenis Mitra</th>
                <th>Penanggung Jawab</th>
                <th>Email Akun Mitra</th>
                <th>Kontak</th>
                <th>Kegiatan Terkait</th>
                <th>Tindakan</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={7} style={{ textAlign: 'center', color: 'var(--gray-400)', padding: '32px' }}>
                    Tidak ada mitra ditemukan.
                  </td>
                </tr>
              )}
              {filtered.map(m => (
                <tr key={m.id}>
                  <td>
                    <span
                      className="table-name-bold humas-link"
                      style={{ cursor: 'pointer' }}
                      onClick={() => setDetailMitra(m)}
                    >
                      {m.nama}
                    </span>
                  </td>
                  <td>{m.jenis}</td>
                  <td>{m.penanggungJawab}</td>
                  <td style={{ fontSize: '12.5px' }}>{m.email}</td>
                  <td style={{ whiteSpace: 'nowrap' }}>{m.kontak}</td>
                  <td>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                      {m.kegiatanTerkait.map((kg, i) => (
                        <span key={i} className="humas-link" style={{ fontSize: '12.5px' }}>{kg}</span>
                      ))}
                    </div>
                  </td>
                  <td>
                    <div className="humas-tindakan-group">
                      <button
                        className="humas-tindakan-btn humas-tindakan-view"
                        onClick={() => setDetailMitra(m)}
                      >
                        <Eye size={12} /> Detail
                      </button>
                      <button
                        className="humas-tindakan-btn humas-tindakan-edit"
                        onClick={() => handleBukaEdit(m)}
                      >
                        <Pencil size={12} /> Edit
                      </button>
                      <button
                        className="humas-tindakan-btn humas-tindakan-delete"
                        onClick={() => handleHapus(m.id)}
                      >
                        <Trash2 size={12} /> Hapus
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── Modal Detail Data Mitra (Sesuai Gambar 1) ── */}
      {detailMitra && (
        <div className="modal-overlay" onClick={() => setDetailMitra(null)}>
          <div className="modal-box" style={{ maxWidth: 540 }} onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <div>
                <p className="modal-header-crumb">WORKSHOP UNAND</p>
                <h2 className="modal-header-title">Detail Data</h2>
              </div>
              <button className="modal-close-btn" onClick={() => setDetailMitra(null)}>
                <X size={16} />
              </button>
            </div>

            <div className="modal-body" style={{ gap: 0, padding: '16px 24px' }}>
              <div className="mitra-detail-row">
                <span className="mitra-detail-label">Nama Instansi</span>
                <span className="mitra-detail-value">{detailMitra.nama}</span>
              </div>
              <div className="mitra-detail-row">
                <span className="mitra-detail-label">Jenis Mitra</span>
                <span className="mitra-detail-value">{detailMitra.jenis}</span>
              </div>
              <div className="mitra-detail-row">
                <span className="mitra-detail-label">Penanggung Jawab</span>
                <span className="mitra-detail-value">{detailMitra.penanggungJawab}</span>
              </div>
              <div className="mitra-detail-row">
                <span className="mitra-detail-label">Email Akun Mitra</span>
                <span className="mitra-detail-value">{detailMitra.email}</span>
              </div>
              <div className="mitra-detail-row" style={{ borderBottom: 'none' }}>
                <span className="mitra-detail-label">Kontak</span>
                <span className="mitra-detail-value">{detailMitra.kontak}</span>
              </div>

              <p className="mitra-detail-note">
                Akun: {detailMitra.email}. Hanya kegiatan yang ditautkan Humas kepada {detailMitra.nama} dapat diakses oleh akun ini.
              </p>
            </div>

            <div className="modal-footer" style={{ justifyContent: 'flex-end', gap: 10 }}>
              <button
                type="button"
                className="modal-btn modal-btn-batal"
                onClick={() => setDetailMitra(null)}
              >
                Kembali ke Daftar
              </button>
              <button
                type="button"
                className="modal-btn modal-btn-publish"
                onClick={() => {
                  const target = detailMitra;
                  setDetailMitra(null);
                  handleBukaEdit(target);
                }}
              >
                Edit Data
              </button>
              <button
                type="button"
                className="modal-btn modal-btn-outline"
                onClick={() => {
                  navigate(`/humas/kelola-kegiatan?mitra=${encodeURIComponent(detailMitra.nama)}`);
                }}
              >
                Lihat Kegiatan Terkait
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Modal Edit Mitra (Sesuai Gambar 3) ── */}
      {editMitra && (
        <div className="modal-overlay" onClick={() => setEditMitra(null)}>
          <div className="modal-box" style={{ maxWidth: 560 }} onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <div>
                <p className="modal-header-crumb">WORKSHOP UNAND</p>
                <h2 className="modal-header-title">Edit Mitra</h2>
              </div>
              <button className="modal-close-btn" onClick={() => setEditMitra(null)}>
                <X size={16} />
              </button>
            </div>

            <div className="modal-body" style={{ gap: 16 }}>
              {/* Row 1: Nama Instansi & Jenis Mitra */}
              <div className="modal-grid-2">
                <div className="form-group">
                  <label className="form-label">Nama Instansi <span className="req">*</span></label>
                  <input
                    className="form-input"
                    value={form.nama}
                    onChange={e => set('nama', e.target.value)}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Jenis Mitra <span className="req">*</span></label>
                  <select
                    className="form-input form-select"
                    value={form.jenis}
                    onChange={e => set('jenis', e.target.value)}
                  >
                    <option value="Eksternal">Eksternal</option>
                    <option value="Internal">Internal</option>
                  </select>
                </div>
              </div>

              {/* Row 2: Penanggung Jawab & Email Akun Mitra */}
              <div className="modal-grid-2">
                <div className="form-group">
                  <label className="form-label">Penanggung Jawab <span className="req">*</span></label>
                  <input
                    className="form-input"
                    value={form.penanggungJawab}
                    onChange={e => set('penanggungJawab', e.target.value)}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Email Akun Mitra <span className="req">*</span></label>
                  <input
                    className="form-input"
                    type="email"
                    value={form.email}
                    onChange={e => set('email', e.target.value)}
                  />
                </div>
              </div>

              {/* Row 3: Kontak */}
              <div className="form-group" style={{ maxWidth: '48%' }}>
                <label className="form-label">Kontak <span className="req">*</span></label>
                <input
                  className="form-input"
                  value={form.kontak}
                  onChange={e => set('kontak', e.target.value)}
                />
              </div>
            </div>

            <div className="modal-footer" style={{ justifyContent: 'flex-end', gap: 10 }}>
              <button
                type="button"
                className="modal-btn modal-btn-batal"
                onClick={() => setEditMitra(null)}
              >
                Batal
              </button>
              <button
                type="button"
                className="modal-btn modal-btn-publish"
                onClick={handleSimpanEdit}
              >
                Simpan Perubahan
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Modal Tambah Mitra ── */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-box" style={{ maxWidth: 560 }} onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <div>
                <p className="modal-header-crumb">WORKSHOP UNAND</p>
                <h2 className="modal-header-title">Tambah Mitra</h2>
              </div>
              <button className="modal-close-btn" onClick={() => setShowModal(false)}>
                <X size={16} />
              </button>
            </div>

            <div className="modal-body" style={{ gap: 16 }}>
              <div className="modal-grid-2">
                <div className="form-group">
                  <label className="form-label">Nama Instansi <span className="req">*</span></label>
                  <input
                    className="form-input"
                    value={form.nama}
                    onChange={e => set('nama', e.target.value)}
                    placeholder="Nama instansi..."
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Jenis Mitra <span className="req">*</span></label>
                  <select
                    className="form-input form-select"
                    value={form.jenis}
                    onChange={e => set('jenis', e.target.value)}
                  >
                    <option value="Eksternal">Eksternal</option>
                    <option value="Internal">Internal</option>
                  </select>
                </div>
              </div>

              <div className="modal-grid-2">
                <div className="form-group">
                  <label className="form-label">Penanggung Jawab <span className="req">*</span></label>
                  <input
                    className="form-input"
                    value={form.penanggungJawab}
                    onChange={e => set('penanggungJawab', e.target.value)}
                    placeholder="Nama PJ..."
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Email Akun Mitra <span className="req">*</span></label>
                  <input
                    className="form-input"
                    type="email"
                    value={form.email}
                    onChange={e => set('email', e.target.value)}
                    placeholder="email@instansi.com"
                  />
                </div>
              </div>

              <div className="form-group" style={{ maxWidth: '48%' }}>
                <label className="form-label">Kontak <span className="req">*</span></label>
                <input
                  className="form-input"
                  value={form.kontak}
                  onChange={e => set('kontak', e.target.value)}
                  placeholder="Nomor telepon..."
                />
              </div>
            </div>

            <div className="modal-footer" style={{ justifyContent: 'flex-end', gap: 10 }}>
              <button
                type="button"
                className="modal-btn modal-btn-batal"
                onClick={() => setShowModal(false)}
              >
                Batal
              </button>
              <button
                type="button"
                className="modal-btn modal-btn-publish"
                onClick={handleSimpanTambah}
              >
                Simpan Perubahan
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

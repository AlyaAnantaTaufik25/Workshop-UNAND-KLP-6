import { useState } from 'react';
import { Search, Bell, Plus, Eye, Pencil, Trash2, X } from 'lucide-react';

const initialMitra = [
  {
    id: 1,
    nama: 'PT Semen Padang',
    jenis: 'Eksternal',
    penanggungJawab: 'Ahmad Riad',
    email: 'mitra@semenpadang.co.id',
    kontak: '0751 816210',
    kegiatanTerkait: ['Workshop Data Science untuk Riset Akademik', 'Manajemen Proyek Kolaboratif', 'Inovasi Industri Berkelanjutan'],
  },
  {
    id: 2,
    nama: 'Bank Nagari',
    jenis: 'Eksternal',
    penanggungJawab: 'Dewi Anggraini',
    email: 'kc.ekonori@banknagari.co.id',
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
];

const defaultForm = { nama: '', jenis: '', penanggungJawab: '', email: '', kontak: '' };

export default function KelolaMitra() {
  const [mitra, setMitra]       = useState(initialMitra);
  const [search, setSearch]     = useState('');
  const [showModal, setShowModal] = useState(false);
  const [form, setForm]         = useState(defaultForm);

  const set = (k, v) => setForm(prev => ({ ...prev, [k]: v }));

  const filtered = mitra.filter(m =>
    m.nama.toLowerCase().includes(search.toLowerCase()) ||
    m.penanggungJawab.toLowerCase().includes(search.toLowerCase())
  );

  const handleSimpan = () => {
    if (!form.nama || !form.jenis) return;
    setMitra(prev => [...prev, { ...form, id: Date.now(), kegiatanTerkait: [] }]);
    setForm(defaultForm);
    setShowModal(false);
  };

  const handleHapus = (id) => {
    if (window.confirm('Yakin ingin menghapus mitra ini?')) {
      setMitra(prev => prev.filter(m => m.id !== id));
    }
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
          <button className="humas-notif-btn">
            <Bell size={15} /> Notifikasi perbaikan (1)
          </button>
        </div>

        {/* Header */}
        <div className="humas-list-header">
          <div>
            <h2 className="humas-section-title">Kelola Mitra</h2>
            <p className="humas-section-sub">
              Mitra <a href="#" className="humas-link">Internal</a> dan <a href="#" className="humas-link">Eksternal</a> menggunakan portal <a href="#" className="humas-link">yang sama</a>.
            </p>
          </div>
          <button className="humas-tambah-btn" onClick={() => setShowModal(true)}>
            <Plus size={15} /> Tambah Mitra
          </button>
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
                  <td><span className="table-name-bold humas-link" style={{ cursor: 'pointer' }}>{m.nama}</span></td>
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
                      <button className="humas-tindakan-btn humas-tindakan-view">
                        <Eye size={12} /> Lihat Detail
                      </button>
                      <button className="humas-tindakan-btn humas-tindakan-edit">
                        <Pencil size={12} /> Edit
                      </button>
                      <button className="humas-tindakan-btn humas-tindakan-delete" onClick={() => handleHapus(m.id)}>
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

      {/* Tambah Mitra Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-box" style={{ maxWidth: 560 }} onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <div>
                <p className="modal-header-crumb">WORKSHOP UNAND</p>
                <h2 className="modal-header-title">Tambah Mitra</h2>
              </div>
              <button className="modal-close-btn" onClick={() => setShowModal(false)}><X size={16} /></button>
            </div>
            <div className="modal-body" style={{ gap: 14 }}>
              <div className="modal-grid-2">
                <div className="form-group">
                  <label className="form-label">Nama instansi <span className="req">*</span></label>
                  <input className="form-input" value={form.nama} onChange={e => set('nama', e.target.value)} placeholder="Nama instansi..." />
                </div>
                <div className="form-group">
                  <label className="form-label">Jenis Mitra <span className="req">*</span></label>
                  <select className="form-input" value={form.jenis} onChange={e => set('jenis', e.target.value)}>
                    <option value="">Pilih jenis mitra</option>
                    <option value="Internal">Internal</option>
                    <option value="Eksternal">Eksternal</option>
                  </select>
                </div>
              </div>
              <div className="modal-grid-2">
                <div className="form-group">
                  <label className="form-label">Penanggung Jawab <span className="req">*</span></label>
                  <input className="form-input" value={form.penanggungJawab} onChange={e => set('penanggungJawab', e.target.value)} placeholder="Nama PJ..." />
                </div>
                <div className="form-group">
                  <label className="form-label">Email Akun Mitra <span className="req">*</span></label>
                  <input className="form-input" type="email" value={form.email} onChange={e => set('email', e.target.value)} placeholder="email@instansi.com" />
                </div>
              </div>
              <div className="form-group" style={{ maxWidth: '48%' }}>
                <label className="form-label">Kontak <span className="req">*</span></label>
                <input className="form-input" value={form.kontak} onChange={e => set('kontak', e.target.value)} placeholder="Nomor telepon..." />
              </div>
            </div>
            <div className="modal-footer">
              <button className="modal-btn modal-btn-batal" onClick={() => setShowModal(false)}>Batal</button>
              <button className="modal-btn modal-btn-publish" onClick={handleSimpan}>Simpan Perubahan</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

import { useState } from 'react';
import { Search, Bell, Plus, Eye, Pencil, X } from 'lucide-react';

const initialPengguna = [
  { id: 1, nama: 'Nadia Amelia',          email: 'peserta@unand.ac.id',     role: 'Peserta',             status: 'Aktif' },
  { id: 2, nama: 'Nadia Amelia',          email: 'humas@unand.ac.id',       role: 'Humas',               status: 'Aktif' },
  { id: 3, nama: 'Yeti Marlina',          email: 'sekretariat@unand.ac.id', role: 'Sekretariat Rektor',  status: 'Aktif' },
  { id: 4, nama: 'Ahmad Riad',            email: 'mitra@unand.ac.id',       role: 'Mitra',               status: 'Aktif' },
  { id: 5, nama: 'Prof. Andani Eka Putra',email: 'rektor@unand.ac.id',      role: 'Rektor',              status: 'Aktif' },
];

const roleOptions = ['Peserta', 'Humas', 'Sekretariat Rektor', 'Mitra', 'Rektor'];
const defaultForm = { nama: '', email: '', role: '', status: '' };

export default function KelolaPengguna() {
  const [pengguna, setPengguna]   = useState(initialPengguna);
  const [search, setSearch]       = useState('');
  const [filterRole, setFilterRole] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [form, setForm]           = useState(defaultForm);

  const set = (k, v) => setForm(prev => ({ ...prev, [k]: v }));

  const filtered = pengguna.filter(p => {
    const q = search.toLowerCase();
    const matchSearch = p.nama.toLowerCase().includes(q) || p.email.toLowerCase().includes(q);
    const matchRole   = filterRole ? p.role === filterRole : true;
    return matchSearch && matchRole;
  });

  const handleSimpan = () => {
    if (!form.nama || !form.email || !form.role || !form.status) return;
    setPengguna(prev => [...prev, { ...form, id: Date.now() }]);
    setForm(defaultForm);
    setShowModal(false);
  };

  const handleToggleStatus = (id) => {
    setPengguna(prev => prev.map(p =>
      p.id === id ? { ...p, status: p.status === 'Aktif' ? 'Nonaktif' : 'Aktif' } : p
    ));
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
            <h2 className="humas-section-title">Kelola Pengguna</h2>
            <p className="humas-section-sub">
              Pengelolaan akun oleh Humas, terpisah dari{' '}
              <a href="#" className="humas-link">profil pribadi</a>.
            </p>
          </div>
          <button className="humas-tambah-btn" onClick={() => setShowModal(true)}>
            <Plus size={15} /> Tambah Akun
          </button>
        </div>

        {/* Filter bar */}
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
          <select className="filter-select" value={filterRole} onChange={e => setFilterRole(e.target.value)}>
            <option value="">Semua role</option>
            {roleOptions.map(r => <option key={r}>{r}</option>)}
          </select>
        </div>

        {/* Table */}
        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Nama Pengguna</th>
                <th>Email</th>
                <th>Role</th>
                <th>Status Akun</th>
                <th>Tindakan</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={5} style={{ textAlign: 'center', color: 'var(--gray-400)', padding: '32px' }}>
                    Tidak ada pengguna ditemukan.
                  </td>
                </tr>
              )}
              {filtered.map(p => (
                <tr key={p.id}>
                  <td><span className="table-name-bold">{p.nama}</span></td>
                  <td style={{ color: 'var(--gray-500)', fontSize: '13px' }}>{p.email}</td>
                  <td>{p.role}</td>
                  <td>
                    <span className={p.status === 'Aktif'
                      ? 'humas-badge humas-badge-publik'
                      : 'humas-badge humas-badge-selesai'
                    }>
                      {p.status}
                    </span>
                  </td>
                  <td>
                    <div className="humas-tindakan-group">
                      <button className="humas-tindakan-btn humas-tindakan-view">
                        <Eye size={12} /> Lihat Detail
                      </button>
                      <button className="humas-tindakan-btn humas-tindakan-edit">
                        <Pencil size={12} /> Edit
                      </button>
                      <button
                        className="humas-tindakan-btn"
                        style={{ color: '#dc2626', background: '#fee2e2' }}
                        onClick={() => handleToggleStatus(p.id)}
                      >
                        {p.status === 'Aktif' ? 'Nonaktifkan' : 'Aktifkan'}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Tambah Akun Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-box" style={{ maxWidth: 540 }} onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <div>
                <p className="modal-header-crumb">WORKSHOP UNAND</p>
                <h2 className="modal-header-title">Tambah Akun</h2>
              </div>
              <button className="modal-close-btn" onClick={() => setShowModal(false)}><X size={16} /></button>
            </div>
            <div className="modal-body" style={{ gap: 14 }}>
              <div className="modal-grid-2">
                <div className="form-group">
                  <label className="form-label">Nama pengguna <span className="req">*</span></label>
                  <input className="form-input" value={form.nama} onChange={e => set('nama', e.target.value)} placeholder="Nama lengkap..." />
                </div>
                <div className="form-group">
                  <label className="form-label">Email <span className="req">*</span></label>
                  <input className="form-input" type="email" value={form.email} onChange={e => set('email', e.target.value)} placeholder="email@unand.ac.id" />
                </div>
              </div>
              <div className="modal-grid-2">
                <div className="form-group">
                  <label className="form-label">Role <span className="req">*</span></label>
                  <select className="form-input" value={form.role} onChange={e => set('role', e.target.value)}>
                    <option value="">Pilih role</option>
                    {roleOptions.map(r => <option key={r}>{r}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Status akun <span className="req">*</span></label>
                  <select className="form-input" value={form.status} onChange={e => set('status', e.target.value)}>
                    <option value="">Pilih status akun</option>
                    <option value="Aktif">Aktif</option>
                    <option value="Nonaktif">Nonaktif</option>
                  </select>
                </div>
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

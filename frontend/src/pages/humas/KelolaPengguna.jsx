import { useState } from 'react';
import { Search, Bell, Plus, Eye, Pencil, Trash2, X } from 'lucide-react';

const initialPengguna = [
  { id: 1, nama: 'Nadia Amelia',          email: 'peserta@unand.ac.id',     role: 'Peserta',             status: 'Aktif' },
  { id: 2, nama: 'Nadia Amelia',          email: 'humas@unand.ac.id',       role: 'Humas',               status: 'Aktif' },
  { id: 3, nama: 'Rini Marlina',          email: 'sekretariat@unand.ac.id', role: 'Sekretariat Rektor',  status: 'Aktif' },
  { id: 4, nama: 'Ahmad Rizal',           email: 'mitra@unand.ac.id',       role: 'Mitra',               status: 'Aktif' },
  { id: 5, nama: 'Prof. Andani Eka Putra',email: 'rektor@unand.ac.id',      role: 'Rektor',              status: 'Aktif' },
];

const roleOptions = ['Peserta', 'Humas', 'Sekretariat Rektor', 'Mitra', 'Rektor'];
const defaultForm = { nama: '', email: '', role: 'Peserta', status: 'Aktif' };

export default function KelolaPengguna() {
  const [pengguna, setPengguna]         = useState(initialPengguna);
  const [search, setSearch]             = useState('');
  const [filterRole, setFilterRole]     = useState('');
  const [showModal, setShowModal]       = useState(false);
  const [detailPengguna, setDetailPengguna] = useState(null);
  const [editPengguna, setEditPengguna] = useState(null);
  const [form, setForm]                 = useState(defaultForm);

  const set = (k, v) => setForm(prev => ({ ...prev, [k]: v }));

  const filtered = pengguna.filter(p => {
    const q = search.toLowerCase();
    const matchSearch = p.nama.toLowerCase().includes(q) || p.email.toLowerCase().includes(q);
    const matchRole   = filterRole ? p.role === filterRole : true;
    return matchSearch && matchRole;
  });

  const handleBukaTambah = () => {
    setForm(defaultForm);
    setShowModal(true);
  };

  const handleBukaEdit = (item) => {
    setEditPengguna(item);
    setForm({
      nama: item.nama,
      email: item.email,
      role: item.role,
      status: item.status,
    });
  };

  const handleSimpanTambah = () => {
    if (!form.nama || !form.email || !form.role || !form.status) return;
    setPengguna(prev => [...prev, { ...form, id: Date.now() }]);
    setForm(defaultForm);
    setShowModal(false);
  };

  const handleSimpanEdit = () => {
    if (!editPengguna) return;
    setPengguna(prev => prev.map(p => p.id === editPengguna.id ? { ...p, ...form } : p));
    setEditPengguna(null);
    setForm(defaultForm);
  };

  const handleToggleStatus = (id) => {
    setPengguna(prev => prev.map(p =>
      p.id === id ? { ...p, status: p.status === 'Aktif' ? 'Nonaktif' : 'Aktif' } : p
    ));
  };

  return (
    <>
      <div className="humas-list-page">

        {/* Header + actions */}
        <div className="humas-list-header">
          <div>
            <h2 className="humas-section-title">Kelola Pengguna</h2>
            <p className="humas-section-sub">
              Pengelolaan akun oleh Humas, terpisah dari profil pribadi.
            </p>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 10 }}>
            <button className="humas-notif-btn">
              <Bell size={15} /> Notifikasi perbaikan (1)
            </button>
            <button className="humas-tambah-btn" onClick={handleBukaTambah}>
              <Plus size={15} /> Tambah Akun
            </button>
          </div>
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
                  <td>
                    <span
                      className="table-name-bold humas-link"
                      style={{ cursor: 'pointer' }}
                      onClick={() => setDetailPengguna(p)}
                    >
                      {p.nama}
                    </span>
                  </td>
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
                      <button
                        type="button"
                        className="humas-tindakan-btn humas-tindakan-view"
                        onClick={() => setDetailPengguna(p)}
                      >
                        <Eye size={12} /> Detail
                      </button>
                      <button
                        type="button"
                        className="humas-tindakan-btn humas-tindakan-edit"
                        onClick={() => handleBukaEdit(p)}
                      >
                        <Pencil size={12} /> Edit
                      </button>
                      <button
                        type="button"
                        className="humas-tindakan-btn humas-tindakan-delete"
                        onClick={() => handleToggleStatus(p.id)}
                      >
                        <Trash2 size={12} /> {p.status === 'Aktif' ? 'Nonaktifkan' : 'Aktifkan'}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── Modal Detail Data Pengguna ── */}
      {detailPengguna && (
        <div className="modal-overlay" onClick={() => setDetailPengguna(null)}>
          <div className="modal-box" style={{ maxWidth: 540 }} onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <div>
                <p className="modal-header-crumb">WORKSHOP UNAND</p>
                <h2 className="modal-header-title">Detail Data</h2>
              </div>
              <button className="modal-close-btn" onClick={() => setDetailPengguna(null)}>
                <X size={16} />
              </button>
            </div>

            <div className="modal-body" style={{ gap: 0, padding: '16px 24px' }}>
              <div className="pengguna-detail-row">
                <span className="pengguna-detail-label">Nama pengguna</span>
                <span className="pengguna-detail-value">{detailPengguna.nama}</span>
              </div>
              <div className="pengguna-detail-row">
                <span className="pengguna-detail-label">Email</span>
                <span className="pengguna-detail-value">{detailPengguna.email}</span>
              </div>
              <div className="pengguna-detail-row">
                <span className="pengguna-detail-label">Role</span>
                <span className="pengguna-detail-value">{detailPengguna.role}</span>
              </div>
              <div className="pengguna-detail-row" style={{ borderBottom: 'none' }}>
                <span className="pengguna-detail-label">Status akun</span>
                <span className="pengguna-detail-value">{detailPengguna.status}</span>
              </div>
            </div>

            <div className="modal-footer" style={{ justifyContent: 'flex-end', gap: 10 }}>
              <button
                type="button"
                className="modal-btn modal-btn-batal"
                onClick={() => setDetailPengguna(null)}
              >
                Kembali ke Daftar
              </button>
              <button
                type="button"
                className="modal-btn modal-btn-publish"
                onClick={() => {
                  const target = detailPengguna;
                  setDetailPengguna(null);
                  handleBukaEdit(target);
                }}
              >
                Edit Data
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Modal Edit Akun (Sesuai Gambar 2) ── */}
      {editPengguna && (
        <div className="modal-overlay" onClick={() => setEditPengguna(null)}>
          <div className="modal-box" style={{ maxWidth: 540 }} onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <div>
                <p className="modal-header-crumb">WORKSHOP UNAND</p>
                <h2 className="modal-header-title">Edit Akun</h2>
              </div>
              <button className="modal-close-btn" onClick={() => setEditPengguna(null)}>
                <X size={16} />
              </button>
            </div>

            <div className="modal-body" style={{ gap: 14 }}>
              <div className="modal-grid-2">
                <div className="form-group">
                  <label className="form-label">Nama pengguna <span className="req">*</span></label>
                  <input
                    className="form-input"
                    value={form.nama}
                    onChange={e => set('nama', e.target.value)}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Email <span className="req">*</span></label>
                  <input
                    className="form-input"
                    type="email"
                    value={form.email}
                    onChange={e => set('email', e.target.value)}
                  />
                </div>
              </div>
              <div className="modal-grid-2">
                <div className="form-group">
                  <label className="form-label">Role <span className="req">*</span></label>
                  <select
                    className="form-input form-select"
                    value={form.role}
                    onChange={e => set('role', e.target.value)}
                  >
                    <option value="">Pilih role</option>
                    {roleOptions.map(r => <option key={r} value={r}>{r}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Status akun <span className="req">*</span></label>
                  <select
                    className="form-input form-select"
                    value={form.status}
                    onChange={e => set('status', e.target.value)}
                  >
                    <option value="Aktif">Aktif</option>
                    <option value="Nonaktif">Nonaktif</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="modal-footer" style={{ justifyContent: 'flex-end', gap: 10 }}>
              <button
                type="button"
                className="modal-btn modal-btn-batal"
                onClick={() => setEditPengguna(null)}
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

      {/* ── Modal Tambah Akun ── */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-box" style={{ maxWidth: 540 }} onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <div>
                <p className="modal-header-crumb">WORKSHOP UNAND</p>
                <h2 className="modal-header-title">Tambah Akun</h2>
              </div>
              <button className="modal-close-btn" onClick={() => setShowModal(false)}>
                <X size={16} />
              </button>
            </div>

            <div className="modal-body" style={{ gap: 14 }}>
              <div className="modal-grid-2">
                <div className="form-group">
                  <label className="form-label">Nama pengguna <span className="req">*</span></label>
                  <input
                    className="form-input"
                    value={form.nama}
                    onChange={e => set('nama', e.target.value)}
                    placeholder="Nama lengkap..."
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Email <span className="req">*</span></label>
                  <input
                    className="form-input"
                    type="email"
                    value={form.email}
                    onChange={e => set('email', e.target.value)}
                    placeholder="email@unand.ac.id"
                  />
                </div>
              </div>
              <div className="modal-grid-2">
                <div className="form-group">
                  <label className="form-label">Role <span className="req">*</span></label>
                  <select
                    className="form-input form-select"
                    value={form.role}
                    onChange={e => set('role', e.target.value)}
                  >
                    {roleOptions.map(r => <option key={r} value={r}>{r}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Status akun <span className="req">*</span></label>
                  <select
                    className="form-input form-select"
                    value={form.status}
                    onChange={e => set('status', e.target.value)}
                  >
                    <option value="Aktif">Aktif</option>
                    <option value="Nonaktif">Nonaktif</option>
                  </select>
                </div>
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

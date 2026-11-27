import { useState } from 'react';
import { Search, Plus, Eye, Pencil, X, UserX, UserCheck, Inbox } from 'lucide-react';
import useCrud from '../../hooks/useCrud';
import { usersApi } from '../../api';
import { PageLoader, ErrorNotice } from '../../components/RequireRole';
import Pagination, { IconAction } from '../../components/Pagination';
import Select from '../../components/Select';
import BackButton from '../../components/BackButton';
import useUrlState from '../../hooks/useUrlState';
import useDebouncedValue from '../../hooks/useDebouncedValue';

const roleOptions = ['Peserta', 'Humas', 'Sekretariat Rektor', 'Mitra', 'Rektor'];
const defaultForm = { nama: '', email: '', role: 'Peserta', status: 'Aktif' };

export default function KelolaPengguna() {
  const [search, setSearchRaw]          = useUrlState('q');
  const [filterRole, setFilterRoleRaw]  = useUrlState('role');
  const [pageParam, setPage]            = useUrlState('page', '1');
  const page = Math.max(1, parseInt(pageParam, 10) || 1);
  const setSearch = v => { setSearchRaw(v); setPage('1'); };
  const setFilterRole = v => { setFilterRoleRaw(v); setPage('1'); };
  const q = useDebouncedValue(search, 300);
  // Pencarian, filter, dan pagination dilakukan di server
  const { data, loading, error, reload, actionError, create, update, run } = useCrud(
    usersApi, () => usersApi.list({ q: q || undefined, role: filterRole || undefined, page, limit: 10 }), [q, filterRole, page],
  );
  const pengguna = data?.items || [];
  const meta = data?.meta || { page: 1, pages: 1, total: 0, limit: 10 };
  const [showModal, setShowModal]       = useState(false);
  const [detailPengguna, setDetailPengguna] = useState(null);
  const [editPengguna, setEditPengguna] = useState(null);
  const [form, setForm]                 = useState(defaultForm);

  const set = (k, v) => setForm(prev => ({ ...prev, [k]: v }));

  const filtered = pengguna;
  const pg_filtered = pengguna;
  const pager_filtered = <Pagination page={meta.page} pages={meta.pages} total={meta.total} pageSize={meta.limit} onChange={n => setPage(String(n))} />;

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

  // Akun baru memakai kata sandi awal "password123"
  const handleSimpanTambah = async () => {
    if (!form.nama || !form.email || !form.role || !form.status) return;
    if (await create(form)) {
      setForm(defaultForm);
      setShowModal(false);
    }
  };

  const handleSimpanEdit = async () => {
    if (!editPengguna) return;
    if (await update(editPengguna.id, form)) {
      setEditPengguna(null);
      setForm(defaultForm);
    }
  };

  const handleToggleStatus = async (id) => {
    const p = pengguna.find(item => item.id === id);
    if (p) await run(() => usersApi.setStatus(id, p.status === 'Aktif' ? 'Nonaktif' : 'Aktif'));
  };

  return (
    <>
      <div className="humas-list-page">
        <ErrorNotice error={error} onRetry={reload} />
        {actionError && <ErrorNotice error={{ message: actionError }} />}
        {loading && !data && <PageLoader />}

        {/* Header + actions */}
        <div className="humas-list-header">
          <div>
            <h2 className="humas-section-title">Kelola Pengguna</h2>
            <p className="humas-section-sub">
              Pengelolaan akun oleh Humas, terpisah dari profil pribadi.
            </p>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 10 }}>
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
          <Select className="filter-select" value={filterRole} onChange={e => setFilterRole(e.target.value)}>
            <option value="">Semua role</option>
            {roleOptions.map(r => <option key={r}>{r}</option>)}
          </Select>
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
                  <td colSpan={5} className="ui-empty-cell"><div className="ui-empty"><Inbox size={30} aria-hidden="true" /><div className="ui-empty-text">Tidak ada pengguna ditemukan.</div></div></td>
                </tr>
              )}
              {pg_filtered.map(p => (
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
                    <div className="ui-row-actions">
                      <IconAction icon={Eye} label="Lihat detail" onClick={() => setDetailPengguna(p)} />
                      <IconAction icon={Pencil} label="Edit" onClick={() => handleBukaEdit(p)} />
                      <IconAction icon={p.status === 'Aktif' ? UserX : UserCheck} label={p.status === 'Aktif' ? 'Nonaktifkan akun' : 'Aktifkan akun'} tone={p.status === 'Aktif' ? 'danger' : 'default'} onClick={() => handleToggleStatus(p.id)} />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {pager_filtered}
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
              <button className="modal-close-btn" onClick={() => setDetailPengguna(null)} aria-label="Tutup">
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
              <BackButton onClick={() => setDetailPengguna(null)} label="Kembali ke Daftar" />
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
              <button className="modal-close-btn" onClick={() => setEditPengguna(null)} aria-label="Tutup">
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
                  <Select
                    className="form-input form-select"
                    value={form.role}
                    onChange={e => set('role', e.target.value)}
                  >
                    <option value="">Pilih role</option>
                    {roleOptions.map(r => <option key={r} value={r}>{r}</option>)}
                  </Select>
                </div>
                <div className="form-group">
                  <label className="form-label">Status akun <span className="req">*</span></label>
                  <Select
                    className="form-input form-select"
                    value={form.status}
                    onChange={e => set('status', e.target.value)}
                  >
                    <option value="Aktif">Aktif</option>
                    <option value="Nonaktif">Nonaktif</option>
                  </Select>
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
              <button className="modal-close-btn" onClick={() => setShowModal(false)} aria-label="Tutup">
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
                  <Select
                    className="form-input form-select"
                    value={form.role}
                    onChange={e => set('role', e.target.value)}
                  >
                    {roleOptions.map(r => <option key={r} value={r}>{r}</option>)}
                  </Select>
                </div>
                <div className="form-group">
                  <label className="form-label">Status akun <span className="req">*</span></label>
                  <Select
                    className="form-input form-select"
                    value={form.status}
                    onChange={e => set('status', e.target.value)}
                  >
                    <option value="Aktif">Aktif</option>
                    <option value="Nonaktif">Nonaktif</option>
                  </Select>
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

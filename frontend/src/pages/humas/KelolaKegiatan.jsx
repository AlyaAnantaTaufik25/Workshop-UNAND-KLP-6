import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Bell, Plus, Eye, Pencil, Trash2, X } from 'lucide-react';
import { humasKegiatan } from '../../data/mockData';
import TambahKegiatanModal from '../../components/TambahKegiatanModal';

const statusConfig = {
  berlangsung: { label: 'Berlangsung', className: 'humas-badge humas-badge-berlangsung' },
  publik:      { label: 'Publik',      className: 'humas-badge humas-badge-publik'      },
  selesai:     { label: 'Selesai',     className: 'humas-badge humas-badge-selesai'     },
  draft:       { label: 'Draft',       className: 'humas-badge humas-badge-draft'       },
};

export default function KelolaKegiatan() {
  const navigate = useNavigate();
  const [kegiatan, setKegiatan]         = useState(humasKegiatan);
  const [search, setSearch]             = useState('');
  const [filterJenis, setFilterJenis]   = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [showTambah, setShowTambah]     = useState(false);
  const [editTarget, setEditTarget]     = useState(null);
  const [draftTarget, setDraftTarget]   = useState(null);

  const filtered = kegiatan.filter(k => {
    const q = search.toLowerCase();
    const matchSearch = k.nama.toLowerCase().includes(q) || k.penyelenggara.toLowerCase().includes(q);
    const matchJenis  = filterJenis  ? k.jenis === filterJenis  : true;
    const matchStatus = filterStatus ? k.status === filterStatus : true;
    return matchSearch && matchJenis && matchStatus;
  });

  const handleSave = (payload) => {
    if (payload.id) {
      setKegiatan(prev => prev.map(k =>
        k.id === payload.id
          ? { ...k, nama: payload.judul || k.nama, jenis: payload.jenis, penyelenggara: payload.penyelenggara, status: payload.status }
          : k
      ));
    } else {
      setKegiatan(prev => [{
        id: Date.now(),
        nama: payload.judul || 'Kegiatan Baru',
        jenis: payload.jenis,
        tanggal: payload.tanggal || '-',
        penyelenggara: payload.penyelenggara,
        lokasi: `${payload.gedung} - ${payload.ruangan}`,
        pendaftar: 0,
        kuota: payload.kuotaJenis === 'Terbatas' ? Number(payload.kuota) : null,
        status: payload.status,
      }, ...prev]);
    }
  };

  const handleJadikanDraft = (id) => {
    setKegiatan(prev => prev.map(k => k.id === id ? { ...k, status: 'draft' } : k));
    setDraftTarget(null);
  };

  const handleHapus = (id) => {
    setKegiatan(prev => prev.filter(k => k.id !== id));
  };

  const jenisOptions = [...new Set(kegiatan.map(k => k.jenis))];

  return (
    <>
      <div className="humas-list-page">

        {/* Notif row */}
        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
          <button className="humas-notif-btn">
            <Bell size={15} /> Notifikasi perbaikan (1)
          </button>
        </div>

        {/* Page heading */}
        <div className="humas-list-header">
          <div>
            <h2 className="humas-section-title">Kelola Kegiatan</h2>
            <p className="humas-section-sub">
              Kelola informasi, pendaftaran, dan publikasi seluruh jenis kegiatan.
            </p>
          </div>
          <button className="humas-tambah-btn" onClick={() => { setEditTarget(null); setShowTambah(true); }}>
            <Plus size={15} /> Tambah Kegiatan
          </button>
        </div>

        {/* Filter bar */}
        <div className="filter-bar">
          <div className="search-wrap" style={{ flex: 1 }}>
            <Search size={15} className="search-icon" />
            <input
              className="search-input"
              placeholder="Cari nama kegiatan atau mitra..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
          <select className="filter-select" value={filterJenis} onChange={e => setFilterJenis(e.target.value)}>
            <option value="">Semua jenis</option>
            {jenisOptions.map(j => <option key={j}>{j}</option>)}
          </select>
          <select className="filter-select" value={filterStatus} onChange={e => setFilterStatus(e.target.value)}>
            <option value="">Semua status</option>
            <option value="berlangsung">Berlangsung</option>
            <option value="publik">Publik</option>
            <option value="selesai">Selesai</option>
            <option value="draft">Draft</option>
          </select>
        </div>

        {/* Table */}
        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Nama Kegiatan</th>
                <th>Jenis</th>
                <th>Tanggal</th>
                <th>Penyelenggara / Mitra</th>
                <th>Lokasi</th>
                <th>Pendaftar</th>
                <th>Kuota</th>
                <th>Status</th>
                <th>Tindakan</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={9} style={{ textAlign: 'center', color: 'var(--gray-400)', padding: '32px' }}>
                    Tidak ada kegiatan ditemukan.
                  </td>
                </tr>
              )}
              {filtered.map(k => {
                const cfg = statusConfig[k.status] ?? statusConfig.draft;
                return (
                  <tr key={k.id}>
                    <td>
                      <span
                        className="table-name-bold humas-link"
                        style={{ cursor: 'pointer' }}
                        onClick={() => navigate(`/humas/kelola-kegiatan/${k.id}`)}
                      >
                        {k.nama}
                      </span>
                    </td>
                    <td>{k.jenis}</td>
                    <td style={{ whiteSpace: 'nowrap' }}>{k.tanggal}</td>
                    <td>{k.penyelenggara}</td>
                    <td>{k.lokasi}</td>
                    <td style={{ textAlign: 'center', color: k.pendaftar > 0 ? 'var(--green-700)' : 'inherit', fontWeight: k.pendaftar > 0 ? 600 : 400 }}>
                      {k.pendaftar}
                    </td>
                    <td style={{ textAlign: 'center' }}>
                      {k.kuota === null
                        ? <span style={{ color: 'var(--gray-400)', fontSize: '12px' }}>Tanpa batas</span>
                        : k.kuota}
                    </td>
                    <td>
                      <span className={cfg.className}>● {cfg.label}</span>
                    </td>
                    <td>
                      <div className="humas-tindakan-group">
                        <button className="humas-tindakan-btn humas-tindakan-view" onClick={() => navigate(`/humas/kelola-kegiatan/${k.id}`)}>
                          <Eye size={12} /> Lihat Detail
                        </button>
                        <button className="humas-tindakan-btn humas-tindakan-edit" onClick={() => { setEditTarget(k); setShowTambah(true); }}>
                          <Pencil size={12} /> Edit
                        </button>
                        <button className="humas-tindakan-btn humas-tindakan-delete" onClick={() => handleHapus(k.id)}>
                          <Trash2 size={12} /> Hapus
                        </button>
                        <button className="humas-tindakan-btn humas-tindakan-draft" onClick={() => setDraftTarget(k.id)}>
                          Jadikan Draft
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Tambah / Edit Kegiatan Modal */}
      {showTambah && (
        <TambahKegiatanModal
          onClose={() => { setShowTambah(false); setEditTarget(null); }}
          onSave={handleSave}
          editData={editTarget}
        />
      )}

      {/* Jadikan Draft Confirm Modal */}
      {draftTarget !== null && (
        <div className="modal-overlay" onClick={() => setDraftTarget(null)}>
          <div className="confirm-modal" onClick={e => e.stopPropagation()}>
            <div className="confirm-modal-header">
              <div>
                <p className="modal-header-crumb">WORKSHOP UNAND</p>
                <h2 className="confirm-modal-title">Jadikan Draft</h2>
              </div>
              <button className="modal-close-btn" onClick={() => setDraftTarget(null)}>
                <X size={16} />
              </button>
            </div>
            <div className="confirm-modal-body">
              <p>Ubah visibilitas kegiatan pada pencarian peserta?</p>
            </div>
            <div className="confirm-modal-footer">
              <button className="modal-btn modal-btn-batal" onClick={() => setDraftTarget(null)}>Batal</button>
              <button className="modal-btn modal-btn-publish" onClick={() => handleJadikanDraft(draftTarget)}>
                Jadikan Draft
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Search, Bell, Plus, Eye, Pencil, Trash2, X, Check, ClipboardCheck, EyeOff } from 'lucide-react';
import { usePagination, IconAction } from '../../components/Pagination';
import TambahKegiatanModal from './components/TambahKegiatanModal';
import useKegiatan from './useKegiatan';
import { PageLoader, ErrorNotice } from '../../components/RequireRole';
import { dialog } from '../../components/Dialog';
import Select from '../../components/Select';

const statusConfig = {
  berlangsung: { label: 'Berlangsung', className: 'humas-badge humas-badge-berlangsung' },
  publik:      { label: 'Publik',      className: 'humas-badge humas-badge-publik'      },
  selesai:     { label: 'Selesai',     className: 'humas-badge humas-badge-selesai'     },
  draft:       { label: 'Draft',       className: 'humas-badge humas-badge-draft'       },
  dibatalkan:  { label: 'Dibatalkan',  className: 'humas-badge humas-badge-selesai'     },
};

export default function KelolaKegiatan() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const initialMitra = searchParams.get('mitra') || searchParams.get('q') || '';

  const { kegiatan, loading, error, reload, save, remove, setStatus } = useKegiatan();
  const [actionError, setActionError]   = useState('');
  const [search, setSearch]             = useState(initialMitra);
  const [filterJenis, setFilterJenis]   = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [showTambah, setShowTambah]     = useState(false);
  const [editTarget, setEditTarget]     = useState(null);

  useEffect(() => {
    const m = searchParams.get('mitra') || searchParams.get('q') || '';
    if (m) setSearch(m);
  }, [searchParams]);

  const filtered = kegiatan.filter(k => {
    const q = search.toLowerCase();
    const matchSearch = k.nama.toLowerCase().includes(q) || k.penyelenggara.toLowerCase().includes(q);
    const matchJenis  = filterJenis  ? k.jenis === filterJenis  : true;
    const matchStatus = filterStatus ? k.status === filterStatus : true;
    return matchSearch && matchJenis && matchStatus;
  });

  // Simpan ke database; error ditampilkan di dalam modal
  const handleSave = (payload) => save(payload);

  const handleJadikanDraft = async (id) => {
    const ok = await dialog.confirm({
      title: 'Jadikan kegiatan draft?',
      message: 'Kegiatan disembunyikan dari pencarian peserta. Data pendaftaran tetap tersimpan dan dapat dipublikasikan kembali.',
      confirmText: 'Jadikan Draft',
      tone: 'warning',
    });
    if (!ok) return;
    try { await setStatus(id, 'draft'); setActionError(''); }
    catch (err) { setActionError(err.message); }
  };

  const handleHapus = async (id) => {
    if (!(await dialog.confirm({ title: 'Hapus kegiatan?', message: 'Kegiatan beserta seluruh data pendaftaran, presensi, dan sertifikatnya akan dihapus permanen.', confirmText: 'Hapus Kegiatan', tone: 'danger' }))) return;
    try { await remove(id); setActionError(''); }
    catch (err) { setActionError(err.message); }
  };

  const { pageItems, pager } = usePagination(filtered, 10);

  const jenisOptions = [...new Set(kegiatan.map(k => k.jenis))];

  return (
    <>
      <div className="humas-list-page">
        <ErrorNotice error={error} onRetry={reload} />
        {actionError && <ErrorNotice error={{ message: actionError }} />}
        {loading && !kegiatan.length && <PageLoader />}

        {/* Page heading + actions */}
        <div className="humas-list-header">
          <div>
            <h2 className="humas-section-title">Kelola Kegiatan</h2>
            <p className="humas-section-sub">
              Kelola informasi, pendaftaran, dan publikasi seluruh jenis kegiatan.
            </p>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 10 }}>
            <button className="humas-tambah-btn" onClick={() => { setEditTarget(null); setShowTambah(true); }}>
              <Plus size={15} /> Tambah Kegiatan
            </button>
          </div>
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
          <Select className="filter-select" value={filterJenis} onChange={e => setFilterJenis(e.target.value)}>
            <option value="">Semua jenis</option>
            {jenisOptions.map(j => <option key={j}>{j}</option>)}
          </Select>
          <Select className="filter-select" value={filterStatus} onChange={e => setFilterStatus(e.target.value)}>
            <option value="">Semua status</option>
            <option value="berlangsung">Berlangsung</option>
            <option value="publik">Publik</option>
            <option value="selesai">Selesai</option>
            <option value="draft">Draft</option>
            <option value="dibatalkan">Dibatalkan</option>
          </Select>
        </div>

        {/* Table */}
        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Kegiatan</th>
                <th>Tanggal</th>
                <th>Penyelenggara</th>
                <th style={{ textAlign: 'center' }}>Pendaftar / Kuota</th>
                <th>Status</th>
                <th>Tindakan</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={6} style={{ textAlign: 'center', color: 'var(--gray-400)', padding: '32px' }}>
                    Tidak ada kegiatan ditemukan.
                  </td>
                </tr>
              )}
              {pageItems.map(k => {
                const cfg = statusConfig[k.status] ?? statusConfig.draft;
                return (
                  <tr key={k.id}>
                    <td className="ui-cell-name">
                      <span
                        className="table-name-bold humas-link"
                        style={{ cursor: 'pointer' }}
                        onClick={() => navigate(`/humas/kelola-kegiatan/${k.id}`)}
                      >
                        {k.nama}
                      </span>
                      <div className="ui-cell-muted" style={{ marginTop: 3 }}>
                        {k.jenis} · {k.jenisPelaksanaan} · {k.lokasi}
                      </div>
                    </td>
                    <td className="ui-nowrap">{k.tanggal}</td>
                    <td className="ui-cell-muted" style={{ minWidth: 140 }}>{k.penyelenggara}</td>
                    <td className="ui-nowrap" style={{ textAlign: 'center' }}>
                      <strong style={{ color: k.pendaftar > 0 ? 'var(--green-700)' : 'inherit' }}>{k.pendaftar}</strong>
                      <span className="ui-cell-muted"> / {k.kuota ?? '∞'}</span>
                    </td>
                    <td className="ui-nowrap"><span className={cfg.className}>● {cfg.label}</span></td>
                    <td>
                      <div className="ui-row-actions">
                        <IconAction icon={Eye} label="Lihat detail" onClick={() => navigate(`/humas/kelola-kegiatan/${k.id}`)} />
                        <IconAction icon={Pencil} label="Edit kegiatan" onClick={() => { setEditTarget(k); setShowTambah(true); }} />
                        <IconAction icon={ClipboardCheck} label="Kelola absensi" onClick={() => navigate(`/humas/kelola-kegiatan/${k.id}?tab=presensi`)} />
                        {k.status !== 'draft' && <IconAction icon={EyeOff} label="Jadikan draft" tone="warning" onClick={() => handleJadikanDraft(k.id)} />}
                        <IconAction icon={Trash2} label="Hapus kegiatan" tone="danger" onClick={() => handleHapus(k.id)} />
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {pager}
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

    </>
  );
}

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Briefcase, Users, Check, Plus, Eye, Pencil,
  Trash2, X, CalendarDays
} from 'lucide-react';
import TambahKegiatanModal from './components/TambahKegiatanModal';
import { IconAction } from '../../components/Pagination';
import useKegiatan from './useKegiatan';
import useApi from '../../hooks/useApi';
import { reportsApi } from '../../api';
import { PageLoader, ErrorNotice } from '../../components/RequireRole';

// ─── helpers ────────────────────────────────────────────
const statusConfig = {
  berlangsung: { label: 'Berlangsung', className: 'humas-badge humas-badge-berlangsung' },
  publik:      { label: 'Publik',      className: 'humas-badge humas-badge-publik'      },
  selesai:     { label: 'Selesai',     className: 'humas-badge humas-badge-selesai'     },
  draft:       { label: 'Draft',       className: 'humas-badge humas-badge-draft'       },
  dibatalkan:  { label: 'Dibatalkan',  className: 'humas-badge humas-badge-selesai'     },
};

// ─── Main Component ──────────────────────────────────────
export default function RingkasanHumas() {
  const navigate = useNavigate();
  const { kegiatan, loading, error, reload, save, remove } = useKegiatan();
  const { data: summary } = useApi(() => reportsApi.summary(), [kegiatan.length]);
  const [showTambah, setShowTambah] = useState(false);
  const [editTarget, setEditTarget] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [actionError, setActionError] = useState('');

  // Tambah / Edit kegiatan (disimpan ke database)
  const handleSaveKegiatan = (payload) => save(payload);

  // Statistik
  const totalPendaftar = summary?.totalPendaftar ?? kegiatan.reduce((s, k) => s + (k.pendaftar || 0), 0);
  const totalKegiatan  = summary?.totalKegiatan ?? kegiatan.length;
  const pesertaHadir   = summary?.pesertaHadir ?? kegiatan.reduce((s, k) => s + (k.hadir || 0), 0);

  // Kegiatan terdekat: publik/berlangsung, urut tanggal terdekat
  const kegiatanTerdekat = kegiatan
    .filter(k => ['publik', 'berlangsung'].includes(k.status))
    .sort((x, y) => x.tanggalMulai.localeCompare(y.tanggalMulai))
    .slice(0, 3);
  const kegiatanTerbaru  = kegiatan.slice(0, 5);

  const getDayLabel = (tanggal) => {
    const parts = tanggal?.split(' ');
    return parts?.[0] || '-';
  };

  if (loading && !kegiatan.length) return <PageLoader />;

  return (
    <>
      <div className="humas-ringkasan-page">
        <ErrorNotice error={error} onRetry={reload} />
        {actionError && <ErrorNotice error={{ message: actionError }} />}

        {/* Page Heading area */}
        <div className="ringkasan-header-area">
          <div className="ringkasan-header-left">
            <h2 className="ringkasan-title">Dashboard</h2>
            <p className="ringkasan-sub">
              Sistem Informasi Manajemen Workshop Universitas Andalas
            </p>
          </div>
        </div>

        {/* ── Stats Cards ── */}
        <div className="ringkasan-stats-row">
          <div
            className="ringkasan-stat-card ringkasan-stat-clickable"
            onClick={() => navigate('/humas/kelola-kegiatan')}
            title="Lihat semua kegiatan"
          >
            <div className="ringkasan-stat-icon">
              <Briefcase size={22} />
            </div>
            <div className="ringkasan-stat-body">
              <p className="ringkasan-stat-label">Total kegiatan</p>
              <p className="ringkasan-stat-value">{totalKegiatan}</p>
            </div>
          </div>

          <div
            className="ringkasan-stat-card ringkasan-stat-clickable"
            onClick={() => navigate('/humas/kelola-kegiatan')}
            title="Lihat data pendaftar"
          >
            <div className="ringkasan-stat-icon">
              <Users size={22} />
            </div>
            <div className="ringkasan-stat-body">
              <p className="ringkasan-stat-label">Total pendaftar</p>
              <p className="ringkasan-stat-value">{totalPendaftar}</p>
            </div>
          </div>

          <div
            className="ringkasan-stat-card ringkasan-stat-clickable"
            onClick={() => navigate('/humas/laporan')}
            title="Lihat laporan kehadiran"
          >
            <div className="ringkasan-stat-icon">
              <Check size={22} strokeWidth={2.5} />
            </div>
            <div className="ringkasan-stat-body">
              <p className="ringkasan-stat-label">Peserta hadir</p>
              <p className="ringkasan-stat-value">{pesertaHadir}</p>
            </div>
          </div>
        </div>

        {/* ── Kegiatan Terdekat ── */}
        <div className="ringkasan-card-container">
          <h3 className="ringkasan-card-title">Kegiatan terdekat</h3>
          <div className="ringkasan-terdekat-list">
            {kegiatanTerdekat.length === 0 && (
              <p style={{ color: 'var(--gray-400)', fontSize: 13, padding: '16px 0' }}>
                Tidak ada kegiatan terdekat.
              </p>
            )}
            {kegiatanTerdekat.map(k => (
              <div key={k.id} className="ringkasan-terdekat-item">
                {/* Date Badge */}
                <div className="ringkasan-date-badge">
                  <span className="ringkasan-date-day">
                    {getDayLabel(k.tanggal)}
                  </span>
                  <span className="ringkasan-date-jenis">
                    {k.jenis}
                  </span>
                </div>

                {/* Info */}
                <div className="ringkasan-terdekat-info">
                  <h4
                    className="ringkasan-terdekat-nama"
                    onClick={() => navigate(`/humas/kelola-kegiatan/${k.id}`)}
                  >
                    {k.nama}
                  </h4>
                  <p className="ringkasan-terdekat-meta">
                    {k.tanggal} · {k.lokasi}
                  </p>
                </div>

                {/* Action */}
                <button
                  className="ringkasan-lihat-btn"
                  onClick={() => navigate(`/humas/kelola-kegiatan/${k.id}`)}
                >
                  Lihat Detail
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* ── Kegiatan Terbaru ── */}
        <div className="ringkasan-card-container" style={{ marginTop: 24 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
            <h3 className="ringkasan-card-title" style={{ margin: 0 }}>Kegiatan terbaru</h3>
            <button className="ringkasan-lihat-btn" onClick={() => navigate('/humas/kelola-kegiatan')}>Lihat semua</button>
          </div>
          <div className="table-container" style={{ margin: 0, boxShadow: 'none' }}>
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
                {kegiatanTerbaru.map(k => {
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
                        <IconAction icon={Trash2} label="Hapus kegiatan" tone="danger" onClick={() => setDeleteTarget(k.id)} />
                      </div>
                    </td>
                  </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

      </div>

      {/* ── Tambah / Edit Modal ── */}
      {showTambah && (
        <TambahKegiatanModal
          onClose={() => { setShowTambah(false); setEditTarget(null); }}
          onSave={handleSaveKegiatan}
          editData={editTarget}
        />
      )}

      {/* ── Konfirmasi Hapus ── */}
      {deleteTarget !== null && (
        <div className="modal-overlay" onClick={() => setDeleteTarget(null)}>
          <div className="confirm-modal" onClick={e => e.stopPropagation()}>
            <div className="confirm-modal-header">
              <div>
                <p className="modal-header-crumb">WORKSHOP UNAND</p>
                <h2 className="confirm-modal-title">Hapus Kegiatan</h2>
              </div>
              <button className="modal-close-btn" onClick={() => setDeleteTarget(null)}>
                <X size={16} />
              </button>
            </div>
            <div className="confirm-modal-body">
              <p>Yakin ingin menghapus kegiatan ini? Tindakan tidak bisa dibatalkan.</p>
            </div>
            <div className="confirm-modal-footer">
              <button className="modal-btn modal-btn-batal" onClick={() => setDeleteTarget(null)}>Batal</button>
              <button
                className="modal-btn"
                style={{ background: '#dc2626', color: 'white', border: 'none' }}
                onClick={async () => {
                  try { await remove(deleteTarget); setActionError(''); }
                  catch (err) { setActionError(err.message); }
                  setDeleteTarget(null);
                }}
              >
                Hapus
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

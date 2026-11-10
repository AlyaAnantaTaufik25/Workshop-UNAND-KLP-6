import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Briefcase, Users, Check, Bell, Plus, Eye, Pencil,
  Trash2, X, MapPin, CalendarDays
} from 'lucide-react';
import { humasStats, humasKegiatan, humasKegiatanTerdekat } from './data';
import TambahKegiatanModal from './components/TambahKegiatanModal';

// ─── helpers ────────────────────────────────────────────
const statusConfig = {
  berlangsung: { label: 'Berlangsung', className: 'humas-badge humas-badge-berlangsung' },
  publik:      { label: 'Publik',      className: 'humas-badge humas-badge-publik'      },
  selesai:     { label: 'Selesai',     className: 'humas-badge humas-badge-selesai'     },
  draft:       { label: 'Draft',       className: 'humas-badge humas-badge-draft'       },
};

// Notifikasi mock data
const notifikasiData = [
  {
    id: 1,
    judul: 'Pengajuan Perbaikan Sertifikat Baru',
    deskripsi: 'Nadia Amelia · Workshop Penulisan Artikel Ilmiah',
    waktu: '17 Mei 2026, 10:15 · belum dibaca',
    belumDibaca: true,
    link: '/humas/perbaikan-sertifikat',
  },
];

// ─── Notifikasi Modal ────────────────────────────────────
function NotifikasiModal({ onClose, onNavigate }) {
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-box" style={{ maxWidth: 480, marginTop: 80 }} onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <div>
            <p className="modal-header-crumb">WORKSHOP UNAND</p>
            <h2 className="modal-header-title">Notifikasi Perbaikan Sertifikat</h2>
          </div>
          <button className="modal-close-btn" onClick={onClose}><X size={16} /></button>
        </div>

        <div className="modal-body" style={{ gap: 12 }}>
          {notifikasiData.map(n => (
            <div key={n.id} className="notif-item">
              <div className="notif-item-icon">
                <Bell size={16} />
              </div>
              <div className="notif-item-content">
                <p className="notif-item-title">{n.judul}</p>
                <p className="notif-item-desc">{n.deskripsi}</p>
                <p className="notif-item-time">{n.waktu}</p>
                <button
                  className="notif-item-link"
                  onClick={() => { onClose(); onNavigate(n.link); }}
                >
                  Lihat Detail
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Main Component ──────────────────────────────────────
export default function RingkasanHumas() {
  const navigate = useNavigate();
  const [kegiatan, setKegiatan]     = useState(humasKegiatan);
  const [showTambah, setShowTambah] = useState(false);
  const [editTarget, setEditTarget] = useState(null);
  const [showNotif, setShowNotif]   = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);

  // Tambah / Edit kegiatan
  const handleSaveKegiatan = (payload) => {
    if (payload.id) {
      setKegiatan(prev => prev.map(k =>
        k.id === payload.id
          ? {
              ...k,
              nama: payload.judul || k.nama,
              jenis: payload.jenis,
              tanggal: payload.tanggal || k.tanggal,
              penyelenggara: payload.penyelenggara,
              status: payload.status,
            }
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

  // Stats computed
  const totalPendaftar = kegiatan.reduce((s, k) => s + (k.pendaftar || 0), 0);
  const totalKegiatan  = kegiatan.length;
  const pesertaHadir   = 173; // sesuai dengan data sampel desain

  // Kegiatan terdekat (3 pertama yg belum selesai)
  const kegiatanTerdekat = kegiatan.filter(k => k.status !== 'selesai').slice(0, 3);
  const kegiatanTerbaru  = kegiatan;

  const getDayLabel = (tanggal) => {
    const parts = tanggal?.split(' ');
    return parts?.[0] || '18';
  };

  return (
    <>
      <div className="humas-ringkasan-page">

        {/* Page Heading & Actions area */}
        <div className="ringkasan-header-area">
          <div className="ringkasan-header-left">
            <h2 className="ringkasan-title">Ringkasan kegiatan</h2>
            <p className="ringkasan-sub">
              Sistem Informasi Manajemen Workshop Universitas Andalas
            </p>
          </div>
          <div className="ringkasan-header-right">
            <button className="humas-notif-btn" onClick={() => setShowNotif(true)}>
              <Bell size={16} />
              <span>Notifikasi perbaikan ({notifikasiData.length})</span>
            </button>
            <button className="humas-tambah-btn" onClick={() => { setEditTarget(null); setShowTambah(true); }}>
              <Plus size={16} />
              <span>Tambah Kegiatan</span>
            </button>
          </div>
        </div>

        {/* ── Stats Cards ── */}
        <div className="ringkasan-stats-row">
          <div className="ringkasan-stat-card">
            <div className="ringkasan-stat-icon">
              <Briefcase size={22} />
            </div>
            <div className="ringkasan-stat-body">
              <p className="ringkasan-stat-label">Total kegiatan</p>
              <p className="ringkasan-stat-value">{totalKegiatan}</p>
            </div>
          </div>

          <div className="ringkasan-stat-card">
            <div className="ringkasan-stat-icon">
              <Users size={22} />
            </div>
            <div className="ringkasan-stat-body">
              <p className="ringkasan-stat-label">Total pendaftar</p>
              <p className="ringkasan-stat-value">{totalPendaftar}</p>
            </div>
          </div>

          <div className="ringkasan-stat-card">
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
          <h3 className="ringkasan-card-title">Kegiatan terbaru</h3>
          <div className="table-container" style={{ margin: 0, boxShadow: 'none' }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Nama Kegiatan</th>
                  <th>Jenis</th>
                  <th>Tanggal</th>
                  <th>Penyelenggara</th>
                  <th>Pendaftar</th>
                  <th>Status</th>
                  <th>Tindakan</th>
                </tr>
              </thead>
              <tbody>
                {kegiatanTerbaru.map(k => {
                  const cfg = statusConfig[k.status] ?? statusConfig.draft;
                  return (
                    <tr key={k.id}>
                      <td>
                        <span
                          className="table-name-bold humas-link"
                          style={{ cursor: 'pointer', fontWeight: 600 }}
                          onClick={() => navigate(`/humas/kelola-kegiatan/${k.id}`)}
                        >
                          {k.nama}
                        </span>
                      </td>
                      <td>{k.jenis}</td>
                      <td style={{ whiteSpace: 'nowrap' }}>{k.tanggal}</td>
                      <td>{k.penyelenggara}</td>
                      <td style={{ textAlign: 'center' }}>{k.pendaftar}</td>
                      <td><span className={cfg.className}>● {cfg.label}</span></td>
                      <td>
                        <div className="humas-tindakan-group">
                          <button
                            className="btn-table-action"
                            onClick={() => navigate(`/humas/kelola-kegiatan/${k.id}`)}
                          >
                            <Eye size={13} /> Detail
                          </button>
                          <button
                            className="btn-table-action"
                            onClick={() => { setEditTarget(k); setShowTambah(true); }}
                          >
                            <Pencil size={13} /> Edit
                          </button>
                          <button
                            className="btn-table-action"
                            style={{ color: '#dc2626' }}
                            onClick={() => setDeleteTarget(k.id)}
                          >
                            <Trash2 size={13} /> Hapus
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

      </div>

      {/* ── Tambah / Edit Modal ── */}
      {showTambah && (
        <TambahKegiatanModal
          onClose={() => { setShowTambah(false); setEditTarget(null); }}
          onSave={handleSaveKegiatan}
          editData={editTarget}
        />
      )}

      {/* ── Notifikasi Modal ── */}
      {showNotif && (
        <NotifikasiModal
          onClose={() => setShowNotif(false)}
          onNavigate={(path) => navigate(path)}
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
                onClick={() => {
                  setKegiatan(prev => prev.filter(k => k.id !== deleteTarget));
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

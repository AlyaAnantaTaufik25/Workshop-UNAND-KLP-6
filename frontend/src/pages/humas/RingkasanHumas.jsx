import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  CalendarDays, Users, CheckCircle, Bell, Plus, Eye, Pencil,
  Trash2, X, MapPin, Clock
} from 'lucide-react';
import { humasStats, humasKegiatan, humasKegiatanTerdekat } from '../../data/mockData';
import TambahKegiatanModal from '../../components/TambahKegiatanModal';

// ─── helpers ────────────────────────────────────────────
const statusConfig = {
  berlangsung: { label: 'Berlangsung', className: 'humas-badge humas-badge-berlangsung' },
  publik:      { label: 'Publik',      className: 'humas-badge humas-badge-publik'      },
  selesai:     { label: 'Selesai',     className: 'humas-badge humas-badge-selesai'     },
  draft:       { label: 'Draft',       className: 'humas-badge humas-badge-draft'       },
};

const jenisColorMap = {
  'Workshop':     { bg: '#e8f5e9', color: '#2e7d32', borderColor: '#a5d6a7' },
  'Seminar':      { bg: '#e3f2fd', color: '#1565c0', borderColor: '#90caf9' },
  'Kuliah Umum':  { bg: '#fff3e0', color: '#e65100', borderColor: '#ffcc80' },
  'Pelatihan':    { bg: '#f3e5f5', color: '#6a1b9a', borderColor: '#ce93d8' },
  'Konferensi':   { bg: '#e8eaf6', color: '#283593', borderColor: '#9fa8da' },
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
          <p style={{ fontSize: 13, color: 'var(--gray-400)', fontStyle: 'italic' }}>
            Notifikasi dalam aplikasi – simulasi sesi, tanpa pengiriman eksternal
          </p>

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
  const [editTarget, setEditTarget] = useState(null);   // kegiatan obj saat edit
  const [showNotif, setShowNotif]   = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);

  // Tambah
  const handleSaveKegiatan = (payload) => {
    if (payload.id) {
      // Edit mode
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
      // Tambah baru
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
  const pesertaHadir   = Math.round(totalPendaftar * 0.58); // simulasi

  // Kegiatan terdekat (3 pertama yg belum selesai)
  const kegiatanTerdekat = kegiatan.filter(k => k.status !== 'selesai').slice(0, 3);
  // Kegiatan terbaru (semua)
  const kegiatanTerbaru  = kegiatan;

  const getDayLabel = (tanggal) => {
    const parts = tanggal?.split(' ');
    return parts?.[0] || '?';
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

        {/* Notif row */}
        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
          <button className="humas-notif-btn" onClick={() => setShowNotif(true)}>
            <Bell size={15} />
            <span>Notifikasi perbaikan ({notifikasiData.length})</span>
          </button>
        </div>

        {/* Page heading + Tambah button */}
        <div className="humas-list-header">
          <div>
            <h2 className="ringkasan-title">Ringkasan kegiatan</h2>
            <p className="ringkasan-sub">
              Sistem{' '}
              <a href="#" className="humas-link">Informasi Manajemen Workshop</a>{' '}
              <a href="#" className="humas-link">Universitas Andalas</a>.
            </p>
          </div>
          <button className="humas-tambah-btn" onClick={() => { setEditTarget(null); setShowTambah(true); }}>
            <Plus size={15} /> Tambah Kegiatan
          </button>
        </div>

        {/* ── Stats Cards ── */}
        <div className="ringkasan-stats-row">
          <div className="ringkasan-stat-card">
            <div className="ringkasan-stat-icon ringkasan-stat-icon--green">
              <CalendarDays size={22} />
            </div>
            <div className="ringkasan-stat-body">
              <p className="ringkasan-stat-label">Total kegiatan</p>
              <p className="ringkasan-stat-value">{totalKegiatan}</p>
              <p className="ringkasan-stat-note">Data contoh dalam sesi demo</p>
            </div>
          </div>

          <div className="ringkasan-stat-card">
            <div className="ringkasan-stat-icon ringkasan-stat-icon--blue">
              <Users size={22} />
            </div>
            <div className="ringkasan-stat-body">
              <p className="ringkasan-stat-label">Total pendaftar</p>
              <p className="ringkasan-stat-value">{totalPendaftar}</p>
              <p className="ringkasan-stat-note">Data contoh dalam sesi demo</p>
            </div>
          </div>

          <div className="ringkasan-stat-card">
            <div className="ringkasan-stat-icon ringkasan-stat-icon--teal">
              <CheckCircle size={22} />
            </div>
            <div className="ringkasan-stat-body">
              <p className="ringkasan-stat-label">Peserta hadir</p>
              <p className="ringkasan-stat-value">{pesertaHadir}</p>
              <p className="ringkasan-stat-note">Data contoh dalam sesi demo</p>
            </div>
          </div>
        </div>

        {/* ── Kegiatan Terdekat ── */}
        <div className="ringkasan-section">
          <h3 className="ringkasan-section-title">Kegiatan terdekat</h3>
          <div className="ringkasan-terdekat-list">
            {kegiatanTerdekat.length === 0 && (
              <p style={{ color: 'var(--gray-400)', fontSize: 13, padding: '16px 0' }}>
                Tidak ada kegiatan terdekat.
              </p>
            )}
            {kegiatanTerdekat.map(k => {
              const col = jenisColorMap[k.jenis] || jenisColorMap['Workshop'];
              return (
                <div key={k.id} className="ringkasan-terdekat-card">
                  {/* Date Badge */}
                  <div
                    className="ringkasan-date-badge"
                    style={{ background: col.bg, borderColor: col.borderColor }}
                  >
                    <span className="ringkasan-date-day" style={{ color: col.color }}>
                      {getDayLabel(k.tanggal)}
                    </span>
                    <span className="ringkasan-date-jenis" style={{ color: col.color }}>
                      {k.jenis}
                    </span>
                  </div>

                  {/* Info */}
                  <div className="ringkasan-terdekat-info">
                    <p className="ringkasan-terdekat-nama humas-link">{k.nama}</p>
                    <div className="ringkasan-terdekat-meta">
                      <span><CalendarDays size={12} /> {k.tanggal}</span>
                      {k.lokasi && <span><MapPin size={12} /> {k.lokasi}</span>}
                    </div>
                  </div>

                  {/* Action */}
                  <button
                    className="ringkasan-lihat-btn"
                    onClick={() => navigate(`/humas/kelola-kegiatan/${k.id}`)}
                  >
                    Lihat Detail
                  </button>
                </div>
              );
            })}
          </div>
        </div>

        {/* ── Kegiatan Terbaru ── */}
        <div className="ringkasan-section">
          <h3 className="ringkasan-section-title">Kegiatan terbaru</h3>
          <div className="table-container">
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
                          style={{ cursor: 'pointer' }}
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
                            className="humas-tindakan-btn humas-tindakan-view"
                            onClick={() => navigate(`/humas/kelola-kegiatan/${k.id}`)}
                          >
                            <Eye size={12} /> Detail
                          </button>
                          <button
                            className="humas-tindakan-btn humas-tindakan-edit"
                            onClick={() => { setEditTarget(k); setShowTambah(true); }}
                          >
                            <Pencil size={12} /> Edit
                          </button>
                          <button
                            className="humas-tindakan-btn humas-tindakan-delete"
                            onClick={() => setDeleteTarget(k.id)}
                          >
                            <Trash2 size={12} /> Hapus
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

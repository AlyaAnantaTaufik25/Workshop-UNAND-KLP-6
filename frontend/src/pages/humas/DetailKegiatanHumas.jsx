import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Pencil, Bell, CalendarDays, Clock, MapPin, QrCode, AlertTriangle } from 'lucide-react';
import { humasKegiatan } from './data';

const TABS = ['Informasi', 'Peserta', 'Presensi', 'Rekap'];

const statusConfig = {
  berlangsung: { label: 'Berlangsung', className: 'humas-badge humas-badge-berlangsung' },
  publik:      { label: 'Publik',      className: 'humas-badge humas-badge-publik'      },
  selesai:     { label: 'Selesai',     className: 'humas-badge humas-badge-selesai'     },
  draft:       { label: 'Draft',       className: 'humas-badge humas-badge-draft'       },
};

const detailData = {
  1: {
    tema: 'Teknologi & Riset',
    waktu: '09:00–15:30 WIB',
    periodePendaftaran: '1 Mei 2026 – 18 Mei 2026',
    statusSertifikat: 'Menunggu Rektor',
    tentang: 'Pelajari pengolahan dan interpretasi data untuk menghasilkan riset yang bermakna, bersama akademisi dan praktisi industri.',
    manfaat: 'Diskusi bersama ahli, kunjungan, dan sertifikat bagi peserta dengan presensi valid.',
    targetPeserta: 'Mahasiswa dan umum',
    narasumber: ['Dr. Rina Alfiyan, M.Kps.'],
    imageUrl: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=640&q=80',
    peserta: [
      { id: 1, nama: 'Nadia Amelia', jenis: 'Mahasiswa', kegiatan: 'Workshop Data Science untuk Riset Akademik', statusDaftar: 'Terdaftar', statusHadir: 'belum-hadir' },
      { id: 2, nama: 'Rafi Pratama', jenis: 'Umum',      kegiatan: 'Workshop Data Science untuk Riset Akademik', statusDaftar: 'Terdaftar', statusHadir: 'hadir-valid' },
      { id: 3, nama: 'Siti Rahmah',  jenis: 'Mahasiswa', kegiatan: 'Workshop Data Science untuk Riset Akademik', statusDaftar: 'Terdaftar', statusHadir: 'belum-hadir' },
    ],
    presensi: [
      { id: 1, nama: 'Nadia Amelia', kegiatan: 'Workshop Data Science untuk Riset Akademik', waktu: null,                      status: 'belum-hadir' },
      { id: 2, nama: 'Rafi Pratama', kegiatan: 'Workshop Data Science untuk Riset Akademik', waktu: '18 Mei 2026 - 06.17 WIB',  status: 'hadir-valid' },
      { id: 3, nama: 'Siti Rahmah',  kegiatan: 'Workshop Data Science untuk Riset Akademik', waktu: null,                      status: 'belum-hadir' },
    ],
    rekap: { totalKegiatan: 1, totalPendaftar: 108, pesertaHadir: 88 },
  },
  2: {
    tema: 'Inovasi & Kebijakan',
    waktu: '08:00–17:00 WIB',
    periodePendaftaran: '5 Mei 2026 – 24 Mei 2026',
    statusSertifikat: 'Menunggu Mitra',
    tentang: 'Seminar nasional membahas strategi hilirisasi hasil riset perguruan tinggi menuju ekosistem inovasi berkelanjutan.',
    manfaat: 'Networking dengan pemangku kebijakan, insight industri, dan sertifikat kehadiran.',
    targetPeserta: 'Dosen, peneliti, dan mahasiswa pascasarjana',
    narasumber: ['Prof. Dr. Budi Santoso', 'Ir. Dewi Kusuma, M.T.'],
    imageUrl: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=640&q=80',
    peserta: [
      { id: 1, nama: 'Ahmad Yusuf',    jenis: 'Dosen', kegiatan: 'Strategi Hilirisasi Riset dan Inovasi', statusDaftar: 'Terdaftar', statusHadir: 'belum-hadir' },
      { id: 2, nama: 'Rina Wulandari', jenis: 'Umum',  kegiatan: 'Strategi Hilirisasi Riset dan Inovasi', statusDaftar: 'Terdaftar', statusHadir: 'belum-hadir' },
    ],
    presensi: [
      { id: 1, nama: 'Ahmad Yusuf',    kegiatan: 'Strategi Hilirisasi Riset dan Inovasi', waktu: null, status: 'belum-hadir' },
      { id: 2, nama: 'Rina Wulandari', kegiatan: 'Strategi Hilirisasi Riset dan Inovasi', waktu: null, status: 'belum-hadir' },
    ],
    rekap: { totalKegiatan: 1, totalPendaftar: 90, pesertaHadir: 0 },
  },
  3: {
    tema: 'Kepemimpinan & SDM',
    waktu: '08:30–14:00 WIB',
    periodePendaftaran: '10 Mei 2026 – 2 Jun 2026',
    statusSertifikat: 'Belum Diterbitkan',
    tentang: 'Kuliah umum tentang kepemimpinan muda yang berdampak nyata bagi masyarakat dan lingkungan kampus.',
    manfaat: 'Inspirasi dari tokoh nasional, insight karir, dan sertifikat kehadiran.',
    targetPeserta: 'Mahasiswa aktif semua jurusan',
    narasumber: ['Dr. Hj. Fatimah Zahra, M.Si.'],
    imageUrl: 'https://images.unsplash.com/photo-1517048676732-d65bc937f952?w=640&q=80',
    peserta: [
      { id: 1, nama: 'Budi Santoso', jenis: 'Mahasiswa', kegiatan: 'Kepemimpinan Muda Berdampak', statusDaftar: 'Terdaftar', statusHadir: 'belum-hadir' },
    ],
    presensi: [
      { id: 1, nama: 'Budi Santoso', kegiatan: 'Kepemimpinan Muda Berdampak', waktu: null, status: 'belum-hadir' },
    ],
    rekap: { totalKegiatan: 1, totalPendaftar: 62, pesertaHadir: 0 },
  },
  4: {
    tema: 'Manajemen & Kolaborasi',
    waktu: '07:30–16:00 WIB',
    periodePendaftaran: '1 April 2026 – 15 April 2026',
    statusSertifikat: 'Diterbitkan',
    tentang: 'Workshop intensif pengelolaan proyek lintas tim menggunakan metodologi agile dan kolaborasi digital.',
    manfaat: 'Praktik langsung menggunakan tools manajemen proyek, studi kasus nyata, dan sertifikat.',
    targetPeserta: 'Profesional muda dan mahasiswa tingkat akhir',
    narasumber: ['Ahmad Fauzi, P.M.P.'],
    imageUrl: 'https://images.unsplash.com/photo-1552664730-d307ca884978?w=640&q=80',
    peserta: [
      { id: 1, nama: 'Dewi Putri',   jenis: 'Profesional', kegiatan: 'Manajemen Proyek Kolaboratif', statusDaftar: 'Terdaftar', statusHadir: 'hadir-valid' },
      { id: 2, nama: 'Eko Prasetyo', jenis: 'Mahasiswa',   kegiatan: 'Manajemen Proyek Kolaboratif', statusDaftar: 'Terdaftar', statusHadir: 'hadir-valid' },
    ],
    presensi: [
      { id: 1, nama: 'Dewi Putri',   kegiatan: 'Manajemen Proyek Kolaboratif', waktu: '15 Apr 2026 - 08.02 WIB', status: 'hadir-valid' },
      { id: 2, nama: 'Eko Prasetyo', kegiatan: 'Manajemen Proyek Kolaboratif', waktu: '15 Apr 2026 - 08.11 WIB', status: 'hadir-valid' },
    ],
    rekap: { totalKegiatan: 1, totalPendaftar: 82, pesertaHadir: 75 },
  },
  5: {
    tema: 'Industri & Keberlanjutan',
    waktu: '08:00–15:00 WIB',
    periodePendaftaran: '25 April 2026 – 12 Mei 2026',
    statusSertifikat: 'Diterbitkan',
    tentang: 'Seminar tentang transformasi industri menuju praktik berkelanjutan yang ramah lingkungan dan efisien.',
    manfaat: 'Studi kasus industri, diskusi panel, dan sertifikat kehadiran.',
    targetPeserta: 'Profesional industri dan akademisi',
    narasumber: ['Dr. Hendra Wijaya, M.Eng.'],
    imageUrl: 'https://images.unsplash.com/photo-1581092795360-fd1ca04f0952?w=640&q=80',
    peserta: [
      { id: 1, nama: 'Sari Indah',    jenis: 'Profesional', kegiatan: 'Inovasi Industri Berkelanjutan', statusDaftar: 'Terdaftar', statusHadir: 'hadir-valid' },
      { id: 2, nama: 'Wahyu Hidayat', jenis: 'Umum',        kegiatan: 'Inovasi Industri Berkelanjutan', statusDaftar: 'Terdaftar', statusHadir: 'hadir-valid' },
    ],
    presensi: [
      { id: 1, nama: 'Sari Indah',    kegiatan: 'Inovasi Industri Berkelanjutan', waktu: '12 Mei 2026 - 08.05 WIB', status: 'hadir-valid' },
      { id: 2, nama: 'Wahyu Hidayat', kegiatan: 'Inovasi Industri Berkelanjutan', waktu: '12 Mei 2026 - 08.18 WIB', status: 'hadir-valid' },
    ],
    rekap: { totalKegiatan: 1, totalPendaftar: 76, pesertaHadir: 70 },
  },
};

function StatusHadirBadge({ status }) {
  if (status === 'hadir-valid') return <span className="humas-badge humas-badge-publik">● Hadir valid</span>;
  return <span className="humas-badge humas-badge-selesai">● Belum hadir</span>;
}

export default function DetailKegiatanHumas() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('Informasi');

  const kegiatan = humasKegiatan.find(k => k.id === Number(id));
  const detail   = detailData[Number(id)] ?? {
    tema: '-', waktu: '-', periodePendaftaran: '-', statusSertifikat: '-',
    tentang: '-', manfaat: '-', targetPeserta: '-', narasumber: [],
    imageUrl: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=640&q=80',
    peserta: [], presensi: [],
    rekap: { totalKegiatan: 1, totalPendaftar: kegiatan?.pendaftar || 0, pesertaHadir: 0 },
  };

  if (!kegiatan) {
    return (
      <div style={{ textAlign: 'center', padding: '60px', color: 'var(--gray-400)' }}>
        <p>Kegiatan tidak ditemukan.</p>
        <button className="humas-lihat-btn" style={{ marginTop: 16 }} onClick={() => navigate('/humas/ringkasan')}>
          Kembali
        </button>
      </div>
    );
  }

  const cfg = statusConfig[kegiatan.status] ?? statusConfig.draft;

  return (
    <div className="humas-detail-page">

      {/* ── Prototype Banner ── */}
      <div className="humas-prototype-banner">
        <span className="humas-prototype-tag">Mode Prototipe</span>
        <span className="humas-prototype-text">
          Data contoh, perubahan hanya selama sesi. OFS, OTF, tanda tangan electronic dan PDF resmi belum terintegrasi.
        </span>
        <span className="humas-prototype-date">Referensi demo: 10 Mei 2026</span>
      </div>

      {/* ── Notif + Back link row ── */}
      <div className="humas-detail-toprow">
        <button
          className="humas-detail-back-link"
          onClick={() => navigate('/humas/ringkasan')}
        >
          Kembali ke daftar kegiatan
        </button>
        <button className="humas-notif-btn">
          <Bell size={15} />
          <span>Notifikasi perbaikan (1)</span>
        </button>
      </div>

      {/* ── White card wrapper ── */}
      <div className="humas-detail-card">

        {/* Event Header */}
        <div className="humas-detail-header">
          <div className="humas-detail-header-left">
            <span className="humas-jenis-badge">{kegiatan.jenis.toUpperCase()}</span>
            <h2 className="humas-detail-title">{kegiatan.nama}</h2>
            <div className="humas-detail-meta">
              <span><CalendarDays size={13} /> {kegiatan.tanggal}</span>
              {detail?.waktu && <span><Clock size={13} /> {detail.waktu}</span>}
              <span><MapPin size={13} /> {kegiatan.lokasi}</span>
            </div>
          </div>
          <button
            className="humas-edit-btn"
            onClick={() => navigate(`/humas/kelola-kegiatan/${kegiatan.id}/edit`)}
          >
            <Pencil size={14} />
            Edit Kegiatan
          </button>
        </div>

        {/* Tabs */}
        <div className="humas-tabs">
          {TABS.map(tab => (
            <button
              key={tab}
              className={'humas-tab-btn' + (activeTab === tab ? ' active' : '')}
              onClick={() => setActiveTab(tab)}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* ── Tab: Informasi ── */}
        {activeTab === 'Informasi' && (
          <div className="humas-detail-body">
            <div className="humas-detail-main">
              {detail?.imageUrl && (
                <img src={detail.imageUrl} alt={kegiatan.nama} className="humas-detail-img" />
              )}
              <div className="humas-detail-section">
                <h3 className="humas-detail-section-title">Tentang kegiatan</h3>
                <p className="humas-detail-text">{detail?.tentang || '-'}</p>
              </div>
              <div className="humas-detail-section">
                <h3 className="humas-detail-section-title">Manfaat / benefit</h3>
                <p className="humas-detail-text">{detail?.manfaat || '-'}</p>
              </div>
              <div className="humas-detail-section">
                <h3 className="humas-detail-section-title">Target peserta</h3>
                <p className="humas-detail-text humas-link">{detail?.targetPeserta || '-'}</p>
              </div>
              <div className="humas-detail-section">
                <h3 className="humas-detail-section-title">Narasumber</h3>
                {detail?.narasumber?.map((n, i) => (
                  <p key={i} className="humas-detail-text humas-link">{n}</p>
                ))}
              </div>
            </div>

            {/* Info Card sidebar */}
            <div className="humas-detail-sidebar">
              <div className="humas-info-card">
                <h3 className="humas-info-card-title">Informasi kegiatan</h3>
                <div className="humas-info-rows">
                  <div className="humas-info-row">
                    <span className="humas-info-label">Penyelenggara / Mitra</span>
                    <span className="humas-info-value humas-link">{kegiatan.penyelenggara}</span>
                  </div>
                  <div className="humas-info-row">
                    <span className="humas-info-label">Tema</span>
                    <span className="humas-info-value">{detail?.tema || '-'}</span>
                  </div>
                  <div className="humas-info-row">
                    <span className="humas-info-label">Lokasi</span>
                    <span className="humas-info-value">{kegiatan.lokasi}</span>
                  </div>
                  <div className="humas-info-row">
                    <span className="humas-info-label">Periode pendaftaran</span>
                    <span className="humas-info-value">{detail?.periodePendaftaran || '-'}</span>
                  </div>
                  <div className="humas-info-row">
                    <span className="humas-info-label">Kuota</span>
                    <span className="humas-info-value">
                      {kegiatan.pendaftar} / {kegiatan.kuota ?? '∞'}{' '}
                      <span style={{ color: 'var(--gray-400)', fontSize: '12px' }}>terisi</span>
                    </span>
                  </div>
                  <div className="humas-info-row">
                    <span className="humas-info-label">Status sertifikat</span>
                    <span className="humas-info-value">{detail?.statusSertifikat || '-'}</span>
                  </div>
                  <div className="humas-info-row">
                    <span className="humas-info-label">Status</span>
                    <span className={cfg.className}>● {cfg.label}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ── Tab: Peserta ── */}
        {activeTab === 'Peserta' && (
          <div className="humas-tab-content">
            <div className="table-container">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Nama Peserta</th>
                    <th>Jenis Peserta</th>
                    <th>Kegiatan</th>
                    <th>Status Pendaftaran</th>
                    <th>Status Kehadiran</th>
                  </tr>
                </thead>
                <tbody>
                  {(detail?.peserta ?? []).length === 0 ? (
                    <tr>
                      <td colSpan={5} style={{ textAlign: 'center', color: 'var(--gray-400)', padding: '32px' }}>
                        Belum ada data peserta.
                      </td>
                    </tr>
                  ) : (
                    detail.peserta.map(p => (
                      <tr key={p.id}>
                        <td><span className="table-name-bold">{p.nama}</span></td>
                        <td>{p.jenis}</td>
                        <td>
                          <span className="humas-link" style={{ fontSize: '13px' }}>{p.kegiatan}</span>
                        </td>
                        <td>
                          <span className="humas-badge humas-badge-publik">● {p.statusDaftar}</span>
                        </td>
                        <td>
                          <StatusHadirBadge status={p.statusHadir} />
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ── Tab: Presensi ── */}
        {activeTab === 'Presensi' && (
          <div className="humas-tab-content">
            {/* QR Info box */}
            <div className="humas-qr-info-box">
              <div className="humas-qr-info-header">
                <QrCode size={16} />
                <span className="humas-qr-info-title">Informasi presensi QR dinamis</span>
              </div>
              <p className="humas-qr-info-text">
                {kegiatan.tanggal}, {detail?.waktu} · Radius 150 meter · QR diperbarui berkala dan divalidasi bersama waktu serta lokasi.
              </p>
              <div className="humas-qr-warning">
                <AlertTriangle size={14} />
                <span>
                  Penanggung jawab aktivasi dan penayangan QR belum ditetapkan. Tidak ada tindakan membuka presensi atau menampilkan QR untuk role ini.
                </span>
              </div>
            </div>

            {/* Presensi Table */}
            <div className="table-container">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Nama Peserta</th>
                    <th>Kegiatan</th>
                    <th>Waktu Presensi</th>
                    <th>Status Kehadiran</th>
                  </tr>
                </thead>
                <tbody>
                  {(detail?.presensi ?? []).length === 0 ? (
                    <tr>
                      <td colSpan={4} style={{ textAlign: 'center', color: 'var(--gray-400)', padding: '32px' }}>
                        Belum ada data presensi.
                      </td>
                    </tr>
                  ) : (
                    detail.presensi.map(p => (
                      <tr key={p.id}>
                        <td><span className="table-name-bold">{p.nama}</span></td>
                        <td>
                          <span className="humas-link" style={{ fontSize: '13px' }}>{p.kegiatan}</span>
                        </td>
                        <td style={{ color: p.waktu ? 'var(--gray-700)' : 'var(--gray-300)' }}>
                          {p.waktu || '—'}
                        </td>
                        <td>
                          <StatusHadirBadge status={p.status} />
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ── Tab: Rekap ── */}
        {activeTab === 'Rekap' && (
          <div className="humas-tab-content">
            <div className="humas-stats-grid">
              <div className="humas-stat-card">
                <div className="humas-stat-icon humas-stat-icon--green">
                  <CalendarDays size={22} />
                </div>
                <div className="humas-stat-body">
                  <span className="humas-stat-label">Total kegiatan</span>
                  <span className="humas-stat-value">{detail?.rekap?.totalKegiatan ?? 1}</span>
                  <span className="humas-stat-note">Data contoh dalam sesi demo</span>
                </div>
              </div>
              <div className="humas-stat-card">
                <div className="humas-stat-icon humas-stat-icon--blue">
                  <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
                </div>
                <div className="humas-stat-body">
                  <span className="humas-stat-label">Total pendaftar</span>
                  <span className="humas-stat-value">{detail?.rekap?.totalPendaftar ?? kegiatan.pendaftar}</span>
                  <span className="humas-stat-note">Data contoh dalam sesi demo</span>
                </div>
              </div>
              <div className="humas-stat-card">
                <div className="humas-stat-icon humas-stat-icon--teal">
                  <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                </div>
                <div className="humas-stat-body">
                  <span className="humas-stat-label">Peserta hadir</span>
                  <span className="humas-stat-value">{detail?.rekap?.pesertaHadir ?? 0}</span>
                  <span className="humas-stat-note">Data contoh dalam sesi demo</span>
                </div>
              </div>
            </div>
          </div>
        )}

      </div>{/* end white card */}
    </div>
  );
}

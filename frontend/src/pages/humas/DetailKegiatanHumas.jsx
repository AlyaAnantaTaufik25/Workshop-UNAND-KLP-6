import { useState } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { Pencil, Bell, CalendarDays, Clock, MapPin, Check, Download } from 'lucide-react';
import { humasKegiatan } from './data';
import TambahKegiatanModal from './components/TambahKegiatanModal';

const TABS = ['Informasi', 'Peserta', 'Presensi', 'Rekap'];

const statusConfig = {
  berlangsung: { label: 'Berlangsung', className: 'humas-badge humas-badge-berlangsung' },
  publik:      { label: 'Publik',      className: 'humas-badge humas-badge-publik'      },
  selesai:     { label: 'Selesai',     className: 'humas-badge humas-badge-selesai'     },
  draft:       { label: 'Draft',       className: 'humas-badge humas-badge-draft'       },
};

// Detail tambahan per kegiatan (peserta, presensi, rekap, foto)
const extraDetail = {
  1: {
    periodePendaftaran: '1 Mei 2026 – 18 Mei 2026',
    statusSertifikat: 'Menunggu Rektor',
    imageUrl: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=800&q=80',
    peserta: [
      { id: 1, nama: 'Nadia Amelia', jenis: 'Mahasiswa', kegiatan: 'Workshop Data Science untuk Riset Akademik', statusDaftar: 'Terdaftar', statusHadir: 'belum-hadir' },
      { id: 2, nama: 'Rafi Pratama', jenis: 'Umum',      kegiatan: 'Workshop Data Science untuk Riset Akademik', statusDaftar: 'Terdaftar', statusHadir: 'hadir-valid' },
      { id: 3, nama: 'Siti Rahmah',  jenis: 'Mahasiswa', kegiatan: 'Workshop Data Science untuk Riset Akademik', statusDaftar: 'Terdaftar', statusHadir: 'belum-hadir' },
    ],
    presensi: [
      { id: 1, nama: 'Nadia Amelia', kegiatan: 'Workshop Data Science untuk Riset Akademik', waktu: null,                     status: 'belum-hadir' },
      { id: 2, nama: 'Rafi Pratama', kegiatan: 'Workshop Data Science untuk Riset Akademik', waktu: '18 Mei 2026 - 06.17 WIB', status: 'hadir-valid' },
      { id: 3, nama: 'Siti Rahmah',  kegiatan: 'Workshop Data Science untuk Riset Akademik', waktu: null,                     status: 'belum-hadir' },
    ],
    rekap: { totalKegiatan: 1, totalPendaftar: 108, pesertaHadir: 88 },
  },
  2: {
    periodePendaftaran: '5 Mei 2026 – 24 Mei 2026',
    statusSertifikat: 'Menunggu Mitra',
    imageUrl: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800&q=80',
    peserta: [
      { id: 1, nama: 'Ahmad Yusuf',    jenis: 'Dosen', kegiatan: 'Seminar Transformasi Digital', statusDaftar: 'Terdaftar', statusHadir: 'belum-hadir' },
      { id: 2, nama: 'Rina Wulandari', jenis: 'Umum',  kegiatan: 'Seminar Transformasi Digital', statusDaftar: 'Terdaftar', statusHadir: 'belum-hadir' },
    ],
    presensi: [
      { id: 1, nama: 'Ahmad Yusuf',    kegiatan: 'Seminar Transformasi Digital', waktu: null, status: 'belum-hadir' },
      { id: 2, nama: 'Rina Wulandari', kegiatan: 'Seminar Transformasi Digital', waktu: null, status: 'belum-hadir' },
    ],
    rekap: { totalKegiatan: 1, totalPendaftar: 90, pesertaHadir: 0 },
  },
  3: {
    periodePendaftaran: '10 Mei 2026 – 2 Jun 2026',
    statusSertifikat: 'Belum Diterbitkan',
    imageUrl: 'https://images.unsplash.com/photo-1517048676732-d65bc937f952?w=800&q=80',
    peserta: [
      { id: 1, nama: 'Budi Santoso', jenis: 'Mahasiswa', kegiatan: 'Seminar Kolaborasi Riset Lintas Disiplin', statusDaftar: 'Terdaftar', statusHadir: 'belum-hadir' },
    ],
    presensi: [
      { id: 1, nama: 'Budi Santoso', kegiatan: 'Seminar Kolaborasi Riset Lintas Disiplin', waktu: null, status: 'belum-hadir' },
    ],
    rekap: { totalKegiatan: 1, totalPendaftar: 62, pesertaHadir: 0 },
  },
  4: {
    periodePendaftaran: '1 Mei 2026 – 22 Mei 2026',
    statusSertifikat: 'Menunggu Mitra',
    imageUrl: 'https://images.unsplash.com/photo-1475721027785-f74eccf877e2?w=800&q=80',
    peserta: [
      { id: 1, nama: 'Rafi Pratama', jenis: 'Umum',      kegiatan: 'Strategi Hilirisasi Riset dan Inovasi', statusDaftar: 'Terdaftar', statusHadir: 'belum-hadir' },
      { id: 2, nama: 'Nadia Amelia', jenis: 'Mahasiswa', kegiatan: 'Strategi Hilirisasi Riset dan Inovasi', statusDaftar: 'Terdaftar', statusHadir: 'belum-hadir' },
    ],
    presensi: [
      { id: 1, nama: 'Rafi Pratama', kegiatan: 'Strategi Hilirisasi Riset dan Inovasi', waktu: null, status: 'belum-hadir' },
      { id: 2, nama: 'Nadia Amelia', kegiatan: 'Strategi Hilirisasi Riset dan Inovasi', waktu: null, status: 'belum-hadir' },
    ],
    rekap: { totalKegiatan: 1, totalPendaftar: 80, pesertaHadir: 0 },
  },
  5: {
    periodePendaftaran: '25 April 2026 – 12 Mei 2026',
    statusSertifikat: 'Diterbitkan',
    imageUrl: 'https://images.unsplash.com/photo-1581092795360-fd1ca04f0952?w=800&q=80',
    peserta: [
      { id: 1, nama: 'Sari Indah',    jenis: 'Profesional', kegiatan: 'Kepemimpinan Muda Berdampak', statusDaftar: 'Terdaftar', statusHadir: 'hadir-valid' },
      { id: 2, nama: 'Wahyu Hidayat', jenis: 'Umum',        kegiatan: 'Kepemimpinan Muda Berdampak', statusDaftar: 'Terdaftar', statusHadir: 'hadir-valid' },
    ],
    presensi: [
      { id: 1, nama: 'Sari Indah',    kegiatan: 'Kepemimpinan Muda Berdampak', waktu: '12 Mei 2026 - 08.05 WIB', status: 'hadir-valid' },
      { id: 2, nama: 'Wahyu Hidayat', kegiatan: 'Kepemimpinan Muda Berdampak', waktu: '12 Mei 2026 - 08.18 WIB', status: 'hadir-valid' },
    ],
    rekap: { totalKegiatan: 1, totalPendaftar: 76, pesertaHadir: 70 },
  },
};

function StatusHadirBadge({ status }) {
  if (status === 'hadir-valid') return <span className="humas-badge humas-badge-publik">● Hadir</span>;
  return <span className="humas-badge humas-badge-selesai">● Belum hadir</span>;
}

export default function DetailKegiatanHumas() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const initialTab = searchParams.get('tab') === 'presensi' ? 'Presensi' : 'Informasi';
  const [activeTab, setActiveTab] = useState(initialTab);
  const [showEdit, setShowEdit] = useState(false);
  const [absensiOpen, setAbsensiOpen] = useState(false);
  const [showKehadiran, setShowKehadiran] = useState(true);

  const kegiatan = humasKegiatan.find(k => k.id === Number(id));
  const extra = extraDetail[Number(id)] ?? {
    periodePendaftaran: '-',
    statusSertifikat: '-',
    imageUrl: 'https://images.unsplash.com/photo-1475721027785-f74eccf877e2?w=800&q=80',
    peserta: [
      { id: 1, nama: 'Rafi Pratama', jenis: 'Umum', kegiatan: kegiatan?.nama || '', statusDaftar: 'Terdaftar', statusHadir: 'belum-hadir' },
      { id: 2, nama: 'Nadia Amelia', jenis: 'Mahasiswa', kegiatan: kegiatan?.nama || '', statusDaftar: 'Terdaftar', statusHadir: 'belum-hadir' },
    ],
    presensi: [],
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
  const waktuDisplay = kegiatan.waktuMulai && kegiatan.waktuSelesai
    ? `${kegiatan.waktuMulai}–${kegiatan.waktuSelesai} WIB`
    : '08:30–12:00 WIB';

  // Sample data kehadiran untuk tab Kelola Absensi
  const daftarKehadiranSeminar = [
    {
      id: 1,
      nama: 'Rafi Pratama',
      hariTanggal: `Hari 1 — ${kegiatan.tanggal}`,
      bukti: 'QR dinamis, waktu, dan GPS',
      status: 'Belum Absen',
      aksi: 'Tidak ada tindakan'
    },
    {
      id: 2,
      nama: 'Nadia Amelia',
      hariTanggal: `Hari 1 — ${kegiatan.tanggal}`,
      bukti: 'QR dinamis, waktu, dan GPS',
      status: 'Belum Absen',
      aksi: 'Tidak ada tindakan'
    }
  ];

  return (
    <>
    <div className="humas-detail-page">

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
            <div className="humas-detail-header-badges">
              <span className="humas-jenis-badge">{kegiatan.jenis.toUpperCase()}</span>
              <span className="humas-pelaksanaan-badge">{kegiatan.jenisPelaksanaan || 'Offline'}</span>
            </div>
            <h2 className="humas-detail-title">{kegiatan.nama}</h2>
            <div className="humas-detail-meta">
              <span><CalendarDays size={13} /> {kegiatan.tanggal}</span>
              <span><Clock size={13} /> {waktuDisplay}</span>
              <span><MapPin size={13} /> {kegiatan.lokasi}</span>
            </div>
          </div>
          <button className="humas-edit-btn" onClick={() => setShowEdit(true)}>
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
              {extra?.imageUrl && (
                <img src={extra.imageUrl} alt={kegiatan.nama} className="humas-detail-img" />
              )}
              <div className="humas-detail-section">
                <h3 className="humas-detail-section-title">Tentang kegiatan</h3>
                <p className="humas-detail-text">{kegiatan.deskripsi || '-'}</p>
              </div>
              <div className="humas-detail-section">
                <h3 className="humas-detail-section-title">Manfaat / benefit</h3>
                <p className="humas-detail-text">{kegiatan.manfaat || '-'}</p>
              </div>
              <div className="humas-detail-section">
                <h3 className="humas-detail-section-title">Target peserta</h3>
                <p className="humas-detail-text humas-link">{kegiatan.targetPeserta || '-'}</p>
              </div>
              <div className="humas-detail-section">
                <h3 className="humas-detail-section-title">Narasumber</h3>
                <p className="humas-detail-text humas-link">{kegiatan.pemateri || '-'}</p>
              </div>

              {/* Jadwal Seminar */}
              <div className="humas-detail-section jadwal-seminar-section">
                <h3 className="humas-detail-section-title">
                  Jadwal {kegiatan.jenis || 'Seminar'} · 1 hari
                </h3>
                <p className="jadwal-seminar-note">
                  Pendaftaran satu kali berlaku untuk seluruh hari kegiatan.
                </p>
                <div className="jadwal-seminar-item">
                  <span className="jadwal-seminar-day">Hari 1</span>
                  <span className="jadwal-seminar-time">{kegiatan.tanggal} · {waktuDisplay}</span>
                </div>
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
                    <span className="humas-info-value">{kegiatan.tema || '-'}</span>
                  </div>
                  <div className="humas-info-row">
                    <span className="humas-info-label">Jenis Pelaksanaan</span>
                    <span className="humas-info-value">{kegiatan.jenisPelaksanaan || 'Offline'}</span>
                  </div>
                  <div className="humas-info-row">
                    <span className="humas-info-label">Lokasi</span>
                    <span className="humas-info-value">{kegiatan.lokasi}</span>
                  </div>
                  <div className="humas-info-row">
                    <span className="humas-info-label">Periode pendaftaran</span>
                    <span className="humas-info-value">{extra?.periodePendaftaran || '-'}</span>
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
                    <span className="humas-info-value">{extra?.statusSertifikat || '-'}</span>
                  </div>
                  <div className="humas-info-row">
                    <span className="humas-info-label">Status</span>
                    <span className={cfg.className}>● {cfg.label}</span>
                  </div>
                </div>

                {/* Tombol Kelola Absensi Seminar */}
                <button
                  type="button"
                  className="btn-kelola-absensi"
                  onClick={() => setActiveTab('Presensi')}
                >
                  <Check size={16} /> Kelola Absensi {kegiatan.jenis || 'Seminar'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ── Tab: Peserta ── */}
        {activeTab === 'Peserta' && (
          <div className="humas-tab-content">
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '14px' }}>
              <button
                type="button"
                className="btn-outline-green"
                onClick={() => {
                  const list = extra?.peserta ?? [];
                  const headers = ['No', 'Nama Peserta', 'Jenis Peserta', 'Kegiatan', 'Status Pendaftaran', 'Status Kehadiran'];
                  const rows = list.map((p, i) => [
                    i + 1,
                    `"${p.nama}"`,
                    `"${p.jenis || 'Mahasiswa'}"`,
                    `"${p.kegiatan || kegiatan.nama}"`,
                    `"${p.statusDaftar || 'Terdaftar'}"`,
                    `"${p.statusHadir === 'hadir-valid' ? 'Hadir' : 'Belum hadir'}"`
                  ]);
                  const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
                  const encodedUri = encodeURI(csvContent);
                  const link = document.createElement('a');
                  link.setAttribute('href', encodedUri);
                  link.setAttribute('download', `Daftar_Peserta_${kegiatan.nama.replace(/[^a-zA-Z0-9]/g, '_')}.csv`);
                  document.body.appendChild(link);
                  link.click();
                  document.body.removeChild(link);
                }}
                style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '7px 14px', fontSize: '12.5px' }}
              >
                <Download size={14} />
                Unduh Data Peserta (CSV)
              </button>
            </div>
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
                  {(extra?.peserta ?? []).length === 0 ? (
                    <tr>
                      <td colSpan={5} style={{ textAlign: 'center', color: 'var(--gray-400)', padding: '32px' }}>
                        Belum ada data peserta.
                      </td>
                    </tr>
                  ) : (
                    extra.peserta.map(p => (
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

        {/* ── Tab: Presensi (Kelola Absensi Seminar) ── */}
        {activeTab === 'Presensi' && (
          <div className="kelola-absensi-container">
            {/* Header */}
            <div className="kelola-absensi-header">
              <h2 className="kelola-absensi-title">
                Kelola Absensi {kegiatan.jenis || 'Seminar'}
              </h2>
              <p className="kelola-absensi-sub">{kegiatan.nama}</p>
            </div>

            {/* Card Daftar Hari */}
            <div className="kelola-absensi-card">
              <div className="kelola-absensi-card-top">
                <span className="humas-pelaksanaan-badge">● {kegiatan.jenisPelaksanaan || 'Offline'}</span>
                <span className="kelola-absensi-card-meta">{kegiatan.tanggal} · 1 hari</span>
              </div>
              <p className="kelola-absensi-card-desc">
                Pendaftaran hanya satu kali untuk seluruh kegiatan. Setiap hari memiliki absensi terpisah dan secara awal ditutup.
              </p>

              {/* Box Hari 1 */}
              <div className="kelola-absensi-day-row">
                <div className="kelola-absensi-day-left">
                  <h4 className="kelola-absensi-day-title">Hari 1</h4>
                  <p className="kelola-absensi-day-date">{kegiatan.tanggal}</p>
                  {absensiOpen ? (
                    <span className="badge-absensi-dibuka">● Absensi Dibuka</span>
                  ) : (
                    <span className="badge-absensi-ditutup">● Absensi Ditutup</span>
                  )}
                </div>
                <div className="kelola-absensi-day-actions">
                  <button
                    type="button"
                    className={absensiOpen ? 'btn-tutup-absensi' : 'btn-buka-absensi'}
                    onClick={() => setAbsensiOpen(!absensiOpen)}
                  >
                    {absensiOpen ? 'Tutup Absensi' : 'Buka Absensi'}
                  </button>
                  <button
                    type="button"
                    className="btn-lihat-kehadiran"
                    onClick={() => setShowKehadiran(true)}
                  >
                    Lihat Kehadiran
                  </button>
                </div>
              </div>
            </div>

            {/* Section Detail Kehadiran Hari */}
            {showKehadiran && (
              <div className="kelola-absensi-kehadiran-section">
                <div className="kelola-absensi-kehadiran-header">
                  <h3 className="kelola-absensi-kehadiran-title">
                    Hari 1 — {kegiatan.tanggal}
                  </h3>
                  {absensiOpen ? (
                    <span className="badge-absensi-dibuka">● Absensi Dibuka</span>
                  ) : (
                    <span className="badge-absensi-ditutup">● Absensi Ditutup</span>
                  )}
                </div>

                {/* 4 Stat Cards */}
                <div className="kelola-absensi-stats-grid">
                  <div className="kelola-absensi-stat-card">
                    <span className="kelola-absensi-stat-num">2</span>
                    <span className="kelola-absensi-stat-label">Belum Absen</span>
                  </div>
                  <div className="kelola-absensi-stat-card">
                    <span className="kelola-absensi-stat-num">0</span>
                    <span className="kelola-absensi-stat-label">Menunggu Verifikasi</span>
                  </div>
                  <div className="kelola-absensi-stat-card">
                    <span className="kelola-absensi-stat-num">0</span>
                    <span className="kelola-absensi-stat-label">Hadir</span>
                  </div>
                  <div className="kelola-absensi-stat-card">
                    <span className="kelola-absensi-stat-num">0</span>
                    <span className="kelola-absensi-stat-label">Ditolak</span>
                  </div>
                </div>

                {/* Tabel Kehadiran */}
                <div className="table-container" style={{ margin: 0, boxShadow: 'none' }}>
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>NAMA PESERTA</th>
                        <th>HARI / TANGGAL</th>
                        <th>BUKTI KEHADIRAN</th>
                        <th>STATUS VERIFIKASI</th>
                        <th>AKSI</th>
                      </tr>
                    </thead>
                    <tbody>
                      {daftarKehadiranSeminar.map(p => (
                        <tr key={p.id}>
                          <td><span className="table-name-bold">{p.nama}</span></td>
                          <td>{p.hariTanggal}</td>
                          <td>{p.bukti}</td>
                          <td>
                            <span className="badge-absensi-ditutup">● {p.status}</span>
                          </td>
                          <td style={{ color: '#64748b', fontSize: '13px' }}>
                            {p.aksi}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ── Tab: Rekap ── */}
        {activeTab === 'Rekap' && (
          <div className="rekap-kehadiran-container">
            <h3 className="rekap-kehadiran-title">
              Rekap Kehadiran {kegiatan.jenis || 'Seminar'} Per Hari
            </h3>

            <div className="table-container" style={{ margin: 0, boxShadow: 'none' }}>
              <table className="data-table">
                <thead>
                  <tr>
                    <th>KEGIATAN</th>
                    <th>PELAKSANAAN</th>
                    <th>HARI</th>
                    <th>TANGGAL</th>
                    <th>ABSENSI</th>
                    <th style={{ textAlign: 'center' }}>BELUM ABSEN</th>
                    <th style={{ textAlign: 'center' }}>MENUNGGU VERIFIKASI</th>
                    <th style={{ textAlign: 'center' }}>HADIR</th>
                    <th style={{ textAlign: 'center' }}>DITOLAK</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>
                      <span className="table-name-bold">{kegiatan.nama}</span>
                    </td>
                    <td>{kegiatan.jenisPelaksanaan || 'Offline'}</td>
                    <td>Hari 1</td>
                    <td style={{ whiteSpace: 'nowrap' }}>{kegiatan.tanggal}</td>
                    <td>{absensiOpen ? 'Dibuka' : 'Ditutup'}</td>
                    <td style={{ textAlign: 'center' }}>2</td>
                    <td style={{ textAlign: 'center' }}>0</td>
                    <td style={{ textAlign: 'center' }}>0</td>
                    <td style={{ textAlign: 'center' }}>0</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        )}

      </div>{/* end white card */}
    </div>

    {/* ── Modal Edit Kegiatan ── */}
    {showEdit && (
      <TambahKegiatanModal
        onClose={() => setShowEdit(false)}
        onSave={() => setShowEdit(false)}
        editData={kegiatan}
      />
    )}
    </>
  );
}

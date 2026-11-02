import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { MapPin, Clock, Briefcase, Users, Check, Download } from 'lucide-react';
import { workshops } from '../../data/mockData';
import BackButton from '../../components/BackButton';
import { downloadPresensiCSV } from '../../utils/exportHelper';

const statusLabel = {
  'menunggu-rektor': 'Menunggu Rektor',
  'menunggu-mitra':  'Menunggu Mitra',
  'diterbitkan':     'Diterbitkan',
};
const statusClass = {
  'menunggu-rektor': 'badge badge-orange',
  'menunggu-mitra':  'badge badge-amber',
  'diterbitkan':     'badge badge-green',
};

const tabs = ['Informasi', 'Peserta', 'Presensi', 'Rekap'];

// ── Tab: Informasi ───────────────────────────────────────────
function TabInformasi({ w }) {
  return (
    <div className="dk-two-col">
      {/* LEFT */}
      <div className="dk-left">
        {/* Banner image */}
        <div className="dk-img-wrap">
          <img
            src={w.imageUrl}
            alt={w.nama}
            className="dk-img"
            onError={e => { e.target.style.display = 'none'; }}
          />
        </div>

        <div className="dk-content-section">
          <h4 className="dk-content-heading">Tentang kegiatan</h4>
          <p className="dk-content-text">{w.tentang}</p>
        </div>

        <div className="dk-content-section">
          <h4 className="dk-content-heading">Manfaat / benefit</h4>
          <p className="dk-content-text">{w.manfaat}</p>
        </div>

        <div className="dk-content-section">
          <h4 className="dk-content-heading">Target peserta</h4>
          <p className="dk-content-text">{w.targetPeserta}</p>
        </div>

        <div className="dk-content-section">
          <h4 className="dk-content-heading">Narasumber</h4>
          {w.narasumber?.map((n, i) => (
            <p key={i} className={n.link ? 'dk-narasumber-link' : 'dk-content-text'}>
              {n.nama}
            </p>
          ))}
        </div>
      </div>

      {/* RIGHT: Info panel */}
      <div className="dk-right">
        <div className="dk-info-panel">
          <p className="dk-info-panel-title">Informasi kegiatan</p>

          <div className="dk-info-row">
            <span className="dk-info-label">Penyelenggara / Mitra</span>
            <span className="dk-info-value">{w.penyelenggara}</span>
          </div>
          <div className="dk-info-row">
            <span className="dk-info-label">Tema</span>
            <span className="dk-info-value">{w.tema}</span>
          </div>
          <div className="dk-info-row">
            <span className="dk-info-label">Lokasi</span>
            <span className="dk-info-value">{w.lokasi}</span>
          </div>
          <div className="dk-info-row">
            <span className="dk-info-label">Periode pendaftaran</span>
            <span className="dk-info-value">{w.periodePendaftaran}</span>
          </div>
          <div className="dk-info-row">
            <span className="dk-info-label">Kuota</span>
            <span className="dk-info-value">
              <span style={{ color: 'var(--green-700)', fontWeight: 700 }}>{w.pendaftar}</span>
              {' / '}{w.kuota} terisi
            </span>
          </div>
          <div className="dk-info-row">
            <span className="dk-info-label">Status sertifikat</span>
            <span className={statusClass[w.statusSertifikat]}>
              {statusLabel[w.statusSertifikat]}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Tab: Peserta ─────────────────────────────────────────────
function TabPeserta({ w }) {
  const pesertaList = [
    {
      id: 1,
      nama: 'Nadia Amelia',
      jenis: 'Mahasiswa',
      kegiatan: w.nama,
      statusPendaftaran: 'Terdaftar',
      statusKehadiran: 'Belum hadir',
    },
    {
      id: 2,
      nama: 'Rafi Pratama',
      jenis: 'Umum',
      kegiatan: w.nama,
      statusPendaftaran: 'Terdaftar',
      statusKehadiran: 'Hadir valid',
    },
    {
      id: 3,
      nama: 'Siti Rahmah',
      jenis: 'Mahasiswa',
      kegiatan: w.nama,
      statusPendaftaran: 'Terdaftar',
      statusKehadiran: 'Belum hadir',
    },
  ];

  return (
    <div className="table-container">
      <table className="data-table">
        <thead>
          <tr>
            <th>NAMA PESERTA</th>
            <th>JENIS PESERTA</th>
            <th>KEGIATAN</th>
            <th>STATUS PENDAFTARAN</th>
            <th>STATUS KEHADIRAN</th>
          </tr>
        </thead>
        <tbody>
          {pesertaList.map(p => (
            <tr key={p.id}>
              <td><span className="table-name-bold">{p.nama}</span></td>
              <td>{p.jenis}</td>
              <td>{p.kegiatan}</td>
              <td>
                <span className="badge badge-green">
                  {p.statusPendaftaran}
                </span>
              </td>
              <td>
                <span className={p.statusKehadiran === 'Hadir valid' ? 'badge badge-green' : 'badge badge-amber'}>
                  {p.statusKehadiran}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ── Tab: Presensi ────────────────────────────────────────────
function TabPresensi({ w }) {
  const presensiSample = [
    {
      id: 1,
      nama: 'Nadia Amelia',
      waktu: null,
      status: 'Belum hadir',
    },
    {
      id: 2,
      nama: 'Rafi Pratama',
      waktu: '18 Mei 2026 - 08.47 WIB',
      status: 'Hadir valid',
    },
    {
      id: 3,
      nama: 'Siti Rahmah',
      waktu: null,
      status: 'Belum hadir',
    },
  ];

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px', flexWrap: 'wrap', gap: '10px' }}>
        <p style={{ margin: 0, fontSize: '13px', color: 'var(--gray-600)' }}>
          Daftar presensi kehadiran peserta kegiatan <strong>{w.nama}</strong>
        </p>
        <button
          onClick={() => downloadPresensiCSV(w.nama, presensiSample)}
          className="btn-outline-green"
          style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '7px 14px', fontSize: '12.5px' }}
        >
          <Download size={14} />
          Unduh Rekap Presensi (CSV)
        </button>
      </div>

      <div className="table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th>NAMA PESERTA</th>
              <th>WAKTU PRESENSI</th>
              <th>STATUS KEHADIRAN</th>
            </tr>
          </thead>
          <tbody>
            {presensiSample.map(p => (
              <tr key={p.id}>
                <td><span className="table-name-bold">{p.nama}</span></td>
                <td style={{ color: p.waktu ? 'var(--gray-700)' : 'var(--gray-400)' }}>
                  {p.waktu ?? '—'}
                </td>
                <td>
                  <span className={p.status === 'Hadir valid' ? 'badge badge-green' : 'badge badge-amber'}>
                    {p.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ── Tab: Rekap ───────────────────────────────────────────────
function TabRekap({ w }) {
  const cards = [
    {
      label: 'Total kegiatan',
      value: '1',
      sub: 'Data contoh dalam sesi demo',
      icon: Briefcase,
    },
    {
      label: 'Total pendaftar',
      value: String(w.pendaftar || 108),
      sub: 'Data contoh dalam sesi demo',
      icon: Users,
    },
    {
      label: 'Peserta hadir',
      value: String(w.hadir || 88),
      sub: 'Data contoh dalam sesi demo',
      icon: Check,
    },
  ];

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '16px' }}>
        <button
          onClick={() => downloadPresensiCSV(w.nama, [
            { nama: 'Nadia Amelia', status: 'Belum hadir' },
            { nama: 'Rafi Pratama', waktu: '18 Mei 2026 - 08.47 WIB', status: 'Hadir valid' },
            { nama: 'Siti Rahmah', status: 'Belum hadir' },
          ])}
          className="btn-primary"
          style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '8px 16px', fontSize: '13px' }}
        >
          <Download size={14} />
          Unduh Data Kegiatan & Rekap (CSV)
        </button>
      </div>
      <div className="rekap-cards-grid">
        {cards.map((c, i) => {
          const IconComponent = c.icon;
          return (
            <div className="rekap-stat-card" key={i}>
              <div className="rekap-stat-top">
                <div className="rekap-stat-icon-box">
                  <IconComponent size={18} color="var(--green-700)" />
                </div>
                <span className="rekap-stat-label">{c.label}</span>
              </div>
              <div className="rekap-stat-value">{c.value}</div>
              <div className="rekap-stat-sub">{c.sub}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── Main Component ───────────────────────────────────────────
export default function DetailKegiatanKegiatan() {
  const { id }      = useParams();
  const navigate    = useNavigate();
  const [activeTab, setActiveTab] = useState('Informasi');

  const w = workshops.find(w => String(w.id) === id);

  if (!w) {
    return (
      <div style={{ textAlign: 'center', padding: '48px', color: 'var(--gray-400)' }}>
        <p>Kegiatan tidak ditemukan.</p>
        <button className="dk-back-link" style={{ marginTop: '16px' }}
          onClick={() => navigate('/sekretariat/kegiatan')}>
          ← Kembali ke daftar kegiatan
        </button>
      </div>
    );
  }

  return (
    <div>
      {/* Back button */}
      <BackButton to="/sekretariat/kegiatan" label="Kembali ke Daftar Kegiatan" />

      {/* Main card */}
      <div className="dk-card">
        {/* Card header */}
        <div className="dk-card-header">
          <p className="dk-jenis-label">{w.jenis.toUpperCase()}</p>
          <h2 className="dk-title">{w.nama}</h2>
          <div className="dk-subtitle-row">
            <span className="dk-subtitle-item">
              <Clock size={13} /> {w.tanggal} · {w.waktu}
            </span>
            <span className="dk-subtitle-dot">·</span>
            <span className="dk-subtitle-item">
              <MapPin size={13} /> {w.lokasi}
            </span>
          </div>
        </div>

        {/* Tabs */}
        <div className="dk-tabs">
          {tabs.map(tab => (
            <button
              key={tab}
              className={`dk-tab${activeTab === tab ? ' dk-tab-active' : ''}`}
              onClick={() => setActiveTab(tab)}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Tab content */}
        <div className="dk-tab-content">
          {activeTab === 'Informasi' && <TabInformasi w={w} />}
          {activeTab === 'Peserta'   && <TabPeserta   w={w} />}
          {activeTab === 'Presensi'  && <TabPresensi  w={w} />}
          {activeTab === 'Rekap'     && <TabRekap     w={w} />}
        </div>
      </div>
    </div>
  );
}

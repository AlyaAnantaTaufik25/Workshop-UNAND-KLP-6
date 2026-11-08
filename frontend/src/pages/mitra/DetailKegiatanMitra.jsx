import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { CalendarDays, Clock, MapPin, ArrowLeft, Users, CheckCircle2, UserCheck, Calendar } from 'lucide-react';
import { mitraKegiatan, mitraDetailData } from './data';

const TABS = ['Informasi', 'Peserta', 'Presensi', 'Rekap'];

const statusConfig = {
  berlangsung: { label: 'Berlangsung', className: 'mitra-badge mitra-badge-berlangsung' },
  selesai:     { label: 'Selesai',     className: 'mitra-badge mitra-badge-selesai'     },
};

function StatusHadirBadge({ status }) {
  if (status === 'hadir-valid') return <span className="mitra-badge mitra-badge-hadir">● Hadir valid</span>;
  return <span className="mitra-badge mitra-badge-belum-hadir">● Belum hadir</span>;
}

export default function DetailKegiatanMitra() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('Informasi');

  const kegiatan = mitraKegiatan.find(k => k.id === Number(id));
  const detail   = mitraDetailData[Number(id)] ?? {
    tema: '-', waktu: '-', periodePendaftaran: '-', statusSertifikat: '-',
    tentang: '-', manfaat: '-', targetPeserta: '-', narasumber: [],
    peserta: [], rekap: { totalPendaftar: kegiatan?.pendaftar || 0, pesertaHadir: 0 },
  };

  if (!kegiatan) {
    return (
      <div style={{ textAlign: 'center', padding: '60px', color: 'var(--mitra-muted)' }}>
        <p>Kegiatan tidak ditemukan.</p>
        <button
          className="mitra-btn mitra-btn--secondary"
          style={{ marginTop: 16 }}
          onClick={() => navigate('/mitra/kegiatan-kerja-sama')}
        >
          Kembali
        </button>
      </div>
    );
  }

  const cfg = statusConfig[kegiatan.status] ?? statusConfig.selesai;

  return (
    <div className="mitra-stack">
      {/* Tombol Kembali */}
      <div>
        <button
          className="mitra-back-btn"
          onClick={() => navigate('/mitra/kegiatan-kerja-sama')}
        >
          <ArrowLeft size={16} /> Kembali ke daftar kegiatan
        </button>
      </div>

      {/* Kartu Utama Detail Kegiatan */}
      <div className="mitra-card">
        {/* Header Kegiatan */}
        <div className="mitra-detail-header">
          <div className="mitra-detail-header-left">
            <span className="mitra-jenis-badge">{kegiatan.jenis.toUpperCase()}</span>
            <h2 className="mitra-detail-title">{kegiatan.nama}</h2>
            <div className="mitra-detail-meta">
              <span><CalendarDays size={14} color="var(--mitra-accent)" /> {kegiatan.tanggal}</span>
              {detail?.waktu && <span><Clock size={14} color="var(--mitra-accent)" /> {detail.waktu}</span>}
              <span><MapPin size={14} color="var(--mitra-accent)" /> {kegiatan.lokasi}</span>
            </div>
          </div>
          <span className={`mitra-badge-status mitra-badge-status--${kegiatan.status}`}>
            <i></i> {cfg.label}
          </span>
        </div>

        {/* Tab Navigasi */}
        <div className="mitra-tabs">
          {TABS.map(tab => (
            <button
              key={tab}
              className={'mitra-tab-btn' + (activeTab === tab ? ' is-active' : '')}
              onClick={() => setActiveTab(tab)}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Tab: Informasi */}
        {activeTab === 'Informasi' && (
          <div className="mitra-detail-body">
            <div className="mitra-detail-main">
              <div className="mitra-detail-section">
                <h3 className="mitra-detail-section-title">Tentang kegiatan</h3>
                <p className="mitra-detail-text">{detail?.tentang || '-'}</p>
              </div>
              <div className="mitra-detail-section">
                <h3 className="mitra-detail-section-title">Manfaat / benefit</h3>
                <p className="mitra-detail-text">{detail?.manfaat || '-'}</p>
              </div>
              <div className="mitra-detail-section">
                <h3 className="mitra-detail-section-title">Target peserta</h3>
                <p className="mitra-detail-text">{detail?.targetPeserta || '-'}</p>
              </div>
              <div className="mitra-detail-section">
                <h3 className="mitra-detail-section-title">Narasumber</h3>
                {detail?.narasumber?.map((n, i) => (
                  <p key={i} className="mitra-detail-text mitra-link">{n}</p>
                ))}
              </div>
            </div>

            {/* Sidebar Ringkasan */}
            <div className="mitra-detail-sidebar">
              <div className="mitra-info-card">
                <h3 className="mitra-info-card-title">Informasi kegiatan</h3>
                <div className="mitra-info-rows">
                  <div className="mitra-info-row">
                    <span className="mitra-info-label">Penyelenggara / Mitra</span>
                    <span className="mitra-info-value mitra-link">{kegiatan.penyelenggara}</span>
                  </div>
                  <div className="mitra-info-row">
                    <span className="mitra-info-label">Tema</span>
                    <span className="mitra-info-value">{detail?.tema || '-'}</span>
                  </div>
                  <div className="mitra-info-row">
                    <span className="mitra-info-label">Lokasi</span>
                    <span className="mitra-info-value">{kegiatan.lokasi}</span>
                  </div>
                  <div className="mitra-info-row">
                    <span className="mitra-info-label">Periode pendaftaran</span>
                    <span className="mitra-info-value">{detail?.periodePendaftaran || '-'}</span>
                  </div>
                  <div className="mitra-info-row">
                    <span className="mitra-info-label">Kuota</span>
                    <span className="mitra-info-value">
                      {kegiatan.pendaftar} / {kegiatan.kuota ?? 'Tanpa batas'}{' '}
                      <span style={{ color: 'var(--mitra-muted)', fontSize: '12px' }}>terisi</span>
                    </span>
                  </div>
                  <div className="mitra-info-row">
                    <span className="mitra-info-label">Status sertifikat</span>
                    <span className="mitra-info-value">{detail?.statusSertifikat || '-'}</span>
                  </div>
                  <div className="mitra-info-row">
                    <span className="mitra-info-label">Status Pelaksanaan</span>
                    <span className={`mitra-badge-status mitra-badge-status--${kegiatan.status}`}>
                      <i></i> {cfg.label}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab: Peserta */}
        {activeTab === 'Peserta' && (
          <div className="mitra-tab-content">
            <div className="mitra-table-card">
              <table className="mitra-table">
                <thead>
                  <tr>
                    <th>Nama Peserta</th>
                    <th>Jenis Peserta</th>
                    <th>Kegiatan</th>
                    <th>Status Pendaftaran</th>
                  </tr>
                </thead>
                <tbody>
                  {(detail?.peserta ?? []).length === 0 ? (
                    <tr>
                      <td colSpan={4} style={{ textAlign: 'center', color: 'var(--mitra-muted)', padding: '32px' }}>
                        Belum ada data peserta.
                      </td>
                    </tr>
                  ) : (
                    detail.peserta.map(p => (
                      <tr key={p.id}>
                        <td><span className="mitra-activity-title">{p.nama}</span></td>
                        <td>{p.jenis || 'Mahasiswa'}</td>
                        <td>{p.kegiatan || kegiatan.nama}</td>
                        <td>
                          <span className="mitra-badge-status mitra-badge-status--berlangsung">
                            <i></i> {p.statusPendaftaran || 'Terdaftar'}
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Tab: Presensi */}
        {activeTab === 'Presensi' && (
          <div className="mitra-tab-content">
            <div className="mitra-table-card">
              <table className="mitra-table">
                <thead>
                  <tr>
                    <th>Nama Peserta</th>
                    <th>Kegiatan</th>
                    <th>Waktu Presensi</th>
                    <th>Status Kehadiran</th>
                  </tr>
                </thead>
                <tbody>
                  {(detail?.peserta ?? []).length === 0 ? (
                    <tr>
                      <td colSpan={4} style={{ textAlign: 'center', color: 'var(--mitra-muted)', padding: '32px' }}>
                        Belum ada data presensi.
                      </td>
                    </tr>
                  ) : (
                    detail.peserta.map(p => (
                      <tr key={p.id}>
                        <td><span className="mitra-activity-title">{p.nama}</span></td>
                        <td>{p.kegiatan || kegiatan.nama}</td>
                        <td style={{ color: p.waktuPresensi ? '#111827' : 'var(--mitra-muted)', fontSize: '13px' }}>
                          {p.waktuPresensi || '—'}
                        </td>
                        <td><StatusHadirBadge status={p.statusHadir} /></td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Tab: Rekap */}
        {activeTab === 'Rekap' && (
          <div className="mitra-tab-content">
            <div className="mitra-stats-grid">
              <div className="mitra-stat-box">
                <div className="mitra-stat-top">
                  <p className="mitra-stat-title">Total Kegiatan</p>
                  <div className="mitra-stat-icon" style={{ background: '#EBF5EE', color: '#14532d' }}>
                    <Calendar size={18} />
                  </div>
                </div>
                <p className="mitra-stat-val">1</p>
              </div>

              <div className="mitra-stat-box">
                <div className="mitra-stat-top">
                  <p className="mitra-stat-title">Total Pendaftar</p>
                  <div className="mitra-stat-icon" style={{ background: '#EBF5EE', color: '#14532d' }}>
                    <Users size={18} />
                  </div>
                </div>
                <p className="mitra-stat-val">{detail?.rekap?.totalPendaftar ?? kegiatan.pendaftar}</p>
              </div>

              <div className="mitra-stat-box">
                <div className="mitra-stat-top">
                  <p className="mitra-stat-title">Peserta Hadir</p>
                  <div className="mitra-stat-icon" style={{ background: '#DCFCE7', color: '#15803d' }}>
                    <UserCheck size={18} />
                  </div>
                </div>
                <p className="mitra-stat-val" style={{ color: '#15803d' }}>{detail?.rekap?.pesertaHadir ?? 0}</p>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}

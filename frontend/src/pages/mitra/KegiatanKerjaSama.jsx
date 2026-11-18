import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, SearchX, CalendarDays, Clock, CheckCircle2 } from 'lucide-react';
import { mitraKegiatan } from './data';

export default function KegiatanKerjaSama() {
  const navigate = useNavigate();
  const [search, setSearch]             = useState('');
  const [filterJenis, setFilterJenis]   = useState('');
  const [filterStatus, setFilterStatus] = useState('');

  // Ringkasan Statistik
  const totalKegiatan    = mitraKegiatan.length;
  const countBerlangsung = mitraKegiatan.filter(k => k.status === 'berlangsung').length;
  const countSelesai     = mitraKegiatan.filter(k => k.status === 'selesai').length;

  const filtered = mitraKegiatan.filter(k => {
    const q = search.toLowerCase();
    const matchSearch =
      k.nama.toLowerCase().includes(q) ||
      k.penyelenggara.toLowerCase().includes(q) ||
      k.lokasi.toLowerCase().includes(q);
    const matchJenis  = filterJenis  ? k.jenis === filterJenis   : true;
    const matchStatus = filterStatus ? k.status === filterStatus  : true;
    return matchSearch && matchJenis && matchStatus;
  });

  const jenisOptions = [...new Set(mitraKegiatan.map(k => k.jenis))];

  return (
    <div className="mitra-stack">
      {/* ── PAGE TITLE / HEADER ── */}
      <div className="mitra-list-header">
        <div className="mitra-intro">
          <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--mitra-green)', letterSpacing: '0.6px', textTransform: 'uppercase' }}>
            Dashboard Mitra
          </span>
          <h2 style={{ margin: '2px 0 4px 0' }}>Kegiatan Kerja Sama</h2>
          <p>Hanya kegiatan yang ditautkan Humas kepada instansi Anda.</p>
        </div>
      </div>

      {/* ── RINGKASAN STATISTIK (CARDS) ── */}
      <div className="mitra-stats-grid">
        <div
          className="mitra-stat-box"
          onClick={() => setFilterStatus('')}
          style={{
            cursor: 'pointer',
            transition: 'all 0.15s ease',
            outline: filterStatus === '' ? '2px solid #14532d' : 'none',
          }}
          title="Klik untuk tampilkan semua kegiatan"
        >
          <div className="mitra-stat-top">
            <p className="mitra-stat-title">Total Kegiatan</p>
            <div className="mitra-stat-icon" style={{ background: '#EBF5EE', color: '#14532d' }}>
              <CalendarDays size={18} />
            </div>
          </div>
          <p className="mitra-stat-val">{totalKegiatan}</p>
        </div>

        <div
          className="mitra-stat-box"
          onClick={() => setFilterStatus(filterStatus === 'berlangsung' ? '' : 'berlangsung')}
          style={{
            cursor: 'pointer',
            transition: 'all 0.15s ease',
            outline: filterStatus === 'berlangsung' ? '2px solid #B45309' : 'none',
          }}
          title="Klik untuk filter kegiatan berlangsung"
        >
          <div className="mitra-stat-top">
            <p className="mitra-stat-title">Berlangsung</p>
            <div className="mitra-stat-icon" style={{ background: '#FEF3C7', color: '#B45309' }}>
              <Clock size={18} />
            </div>
          </div>
          <p className="mitra-stat-val" style={{ color: '#b45309' }}>{countBerlangsung}</p>
        </div>

        <div
          className="mitra-stat-box"
          onClick={() => setFilterStatus(filterStatus === 'selesai' ? '' : 'selesai')}
          style={{
            cursor: 'pointer',
            transition: 'all 0.15s ease',
            outline: filterStatus === 'selesai' ? '2px solid #15803d' : 'none',
          }}
          title="Klik untuk filter kegiatan selesai"
        >
          <div className="mitra-stat-top">
            <p className="mitra-stat-title">Selesai</p>
            <div className="mitra-stat-icon" style={{ background: '#DCFCE7', color: '#15803d' }}>
              <CheckCircle2 size={18} />
            </div>
          </div>
          <p className="mitra-stat-val" style={{ color: '#15803d' }}>{countSelesai}</p>
        </div>
      </div>

      {/* ── FILTER BAR ── */}
      <div className="mitra-filterbar">
        <label className="mitra-searchbox">
          <Search size={18} />
          <input
            type="search"
            placeholder="Cari nama kegiatan atau mitra..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </label>
        <select
          value={filterJenis}
          onChange={e => setFilterJenis(e.target.value)}
        >
          <option value="">Semua jenis</option>
          {jenisOptions.map(j => (
            <option key={j} value={j}>{j}</option>
          ))}
        </select>
        <select
          value={filterStatus}
          onChange={e => setFilterStatus(e.target.value)}
        >
          <option value="">Semua status</option>
          <option value="berlangsung">Berlangsung</option>
          <option value="selesai">Selesai</option>
        </select>
      </div>

      {/* ── DATA TABLE ── */}
      <div className="mitra-table-card">
        <table className="mitra-table">
          <thead>
            <tr>
              <th>Nama Kegiatan</th>
              <th>Jenis</th>
              <th>Tanggal</th>
              <th>Penyelenggara / Mitra</th>
              <th>Lokasi</th>
              <th style={{ textAlign: 'center' }}>Pendaftar</th>
              <th style={{ textAlign: 'center' }}>Kuota</th>
              <th>Status</th>
              <th>Tindakan</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={9}>
                  <div className="mitra-empty">
                    <SearchX size={36} />
                    <p>Tidak ada kegiatan kerja sama yang cocok.</p>
                  </div>
                </td>
              </tr>
            ) : (
              filtered.map(k => (
                <tr key={k.id}>
                  <td>
                    <span
                      className="mitra-activity-title"
                      onClick={() => navigate(`/mitra/kegiatan-kerja-sama/${k.id}`)}
                    >
                      {k.nama}
                    </span>
                  </td>
                  <td>
                    <div>
                      <span>{k.jenis}</span>
                      <div>
                        <span className={`mitra-mode-badge mitra-mode-badge--${k.mode || 'offline'}`}>
                          <i></i> {k.mode === 'online' ? 'Online' : 'Offline'}
                        </span>
                      </div>
                    </div>
                  </td>
                  <td style={{ whiteSpace: 'nowrap' }}>{k.tanggal}</td>
                  <td>{k.penyelenggara}</td>
                  <td>{k.lokasi}</td>
                  <td style={{ textAlign: 'center', fontWeight: k.pendaftar > 0 ? 600 : 400 }}>
                    {k.pendaftar}
                  </td>
                  <td style={{ textAlign: 'center' }}>
                    {k.kuota === null ? (
                      <span style={{ color: '#66736c', fontSize: '12px' }}>Tanpa batas</span>
                    ) : (
                      k.kuota
                    )}
                  </td>
                  <td>
                    <span className={`mitra-badge-status mitra-badge-status--${k.status}`}>
                      <i></i> {k.status === 'berlangsung' ? 'Berlangsung' : 'Selesai'}
                    </span>
                  </td>
                  <td>
                    <button
                      className="mitra-action-link"
                      onClick={() => navigate(`/mitra/kegiatan-kerja-sama/${k.id}`)}
                    >
                      Lihat Detail
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, SearchX } from 'lucide-react';
import { mitraKegiatan } from './data';

export default function KegiatanKerjaSama() {
  const navigate = useNavigate();
  const [search, setSearch]             = useState('');
  const [filterJenis, setFilterJenis]   = useState('');
  const [filterStatus, setFilterStatus] = useState('');

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
      {/* ── PAGE TITLE ── */}
      <div className="mitra-intro">
        <h2>Kegiatan Kerja Sama</h2>
        <p>Hanya kegiatan yang ditautkan Humas kepada instansi Anda.</p>
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

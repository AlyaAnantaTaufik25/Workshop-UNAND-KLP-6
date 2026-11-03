import { useState } from 'react';
import { Search, Bell, Download, FileSpreadsheet, FileText } from 'lucide-react';

const laporanData = [
  { id: 1, kegiatan: 'Workshop Data Science untuk Riset Akademik', jenis: 'Workshop',    tanggal: '5 Mei 2026',    pendaftar: 108, hadir: 69,  tidakHadir: 39 },
  { id: 2, kegiatan: 'Strategi Hilirisasi Riset dan Inovasi',       jenis: 'Seminar',     tanggal: '24 Mar 2026',   pendaftar: 80,  hadir: 0,   tidakHadir: 80 },
  { id: 3, kegiatan: 'Kepemimpinan Muda Berdampak',                  jenis: 'Kuliah Umum', tanggal: '7 Juni 2026',   pendaftar: 62,  hadir: 0,   tidakHadir: 62 },
  { id: 4, kegiatan: 'Manajemen Proyek Kolaboratif',                 jenis: 'Workshop',    tanggal: '15 April 2026', pendaftar: 92,  hadir: 84,  tidakHadir: 8  },
  { id: 5, kegiatan: 'Inovasi Industri Berkelanjutan',               jenis: 'Seminar',     tanggal: '12 Mei 2026',   pendaftar: 76,  hadir: 70,  tidakHadir: 6  },
];

export default function Laporan() {
  const [search, setSearch]         = useState('');
  const [filterJenis, setFilterJenis] = useState('');

  const filtered = laporanData.filter(l => {
    const matchSearch = l.kegiatan.toLowerCase().includes(search.toLowerCase());
    const matchJenis  = filterJenis ? l.jenis === filterJenis : true;
    return matchSearch && matchJenis;
  });

  const totalPendaftar = filtered.reduce((s, l) => s + l.pendaftar, 0);
  const totalHadir     = filtered.reduce((s, l) => s + l.hadir, 0);
  const totalTidak     = filtered.reduce((s, l) => s + l.tidakHadir, 0);

  const jenisOptions = [...new Set(laporanData.map(l => l.jenis))];

  return (
    <div className="humas-list-page">

      {/* Notif */}
      <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
        <button className="humas-notif-btn"><Bell size={15} /> Notifikasi perbaikan (1)</button>
      </div>

      {/* Header */}
      <div>
        <h2 className="humas-section-title">Laporan kegiatan</h2>
        <p className="humas-section-sub">
          Rekap <a href="#" className="humas-link">pendaftaran</a> dan{' '}
          <a href="#" className="humas-link">kehadiran</a> kegiatan.
        </p>
      </div>

      {/* Filter + export */}
      <div className="filter-bar" style={{ flexWrap: 'wrap', gap: 8 }}>
        <div className="search-wrap" style={{ flex: 1, minWidth: 200 }}>
          <Search size={15} className="search-icon" />
          <input
            className="search-input"
            placeholder="Cari nama kegiatan atau mitra..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        <select className="filter-select" value={filterJenis} onChange={e => setFilterJenis(e.target.value)}>
          <option value="">Semua jenis</option>
          {jenisOptions.map(j => <option key={j}>{j}</option>)}
        </select>
        <select className="filter-select" style={{ minWidth: 160 }}>
          <option value="">Semua kegiatan</option>
          {laporanData.map(l => <option key={l.id}>{l.kegiatan}</option>)}
        </select>
        <input className="form-input" type="date" style={{ width: 140 }} />
        <button className="laporan-export-btn laporan-export-excel">
          <FileSpreadsheet size={15} /> Ekspor Excel
        </button>
        <button className="laporan-export-btn laporan-export-pdf">
          <FileText size={15} /> Ekspor PDF
        </button>
      </div>

      {/* Summary cards */}
      <div className="laporan-summary-row">
        <div className="laporan-summary-card">
          <span className="laporan-summary-label">Pendaftar</span>
          <span className="laporan-summary-value">{totalPendaftar}</span>
        </div>
        <div className="laporan-summary-card">
          <span className="laporan-summary-label">Hadir</span>
          <span className="laporan-summary-value">{totalHadir}</span>
        </div>
        <div className="laporan-summary-card">
          <span className="laporan-summary-label">Tidak hadir</span>
          <span className="laporan-summary-value">{totalTidak}</span>
        </div>
      </div>

      {/* Table */}
      <div className="table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th>Kegiatan</th>
              <th>Jenis</th>
              <th>Tanggal</th>
              <th style={{ textAlign: 'center' }}>Pendaftar</th>
              <th style={{ textAlign: 'center' }}>Hadir</th>
              <th style={{ textAlign: 'center' }}>Tidak Hadir</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(l => (
              <tr key={l.id}>
                <td><span className="table-name-bold humas-link" style={{ cursor: 'pointer' }}>{l.kegiatan}</span></td>
                <td><span className="humas-link">{l.jenis}</span></td>
                <td style={{ whiteSpace: 'nowrap' }}>{l.tanggal}</td>
                <td style={{ textAlign: 'center' }}>{l.pendaftar}</td>
                <td style={{ textAlign: 'center', color: l.hadir > 0 ? 'var(--green-700)' : 'var(--gray-400)', fontWeight: l.hadir > 0 ? 600 : 400 }}>
                  {l.hadir}
                </td>
                <td style={{ textAlign: 'center', color: l.tidakHadir > 0 ? '#dc2626' : 'var(--gray-400)', fontWeight: l.tidakHadir > 0 ? 600 : 400 }}>
                  {l.tidakHadir}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

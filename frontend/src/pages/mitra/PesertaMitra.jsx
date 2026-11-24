import { useState } from 'react';
import { Search, SearchX } from 'lucide-react';
import { usePortalData } from '../../context/PortalData';
import { usePagination } from '../../components/Pagination';
import Select from '../../components/Select';


const jenisOptions = ['Workshop', 'Seminar', 'Kuliah Umum'];

function StatusHadirBadge({ status }) {
  if (status === 'hadir-valid') return <span className="mitra-badge-status mitra-badge-status--berlangsung"><i></i> Hadir</span>;
  return <span className="mitra-badge-status mitra-badge-status--gray"><i></i> Belum hadir</span>;
}

export default function PesertaMitra() {
  const { mitraPeserta } = usePortalData();
  const kegiatanOptions = [...new Set(mitraPeserta.map(p => p.kegiatan))];
  const [search, setSearch]                 = useState('');
  const [filterJenis, setFilterJenis]       = useState('');
  const [filterKegiatan, setFilterKegiatan] = useState('');
  const [filterStatus, setFilterStatus]     = useState('');

  const filtered = mitraPeserta.filter(p => {
    const q = search.toLowerCase();
    const matchSearch   = p.nama.toLowerCase().includes(q) || p.kegiatan.toLowerCase().includes(q);
    const matchJenis    = filterJenis ? p.jenisKegiatan === filterJenis : true;
    const matchKegiatan = filterKegiatan ? p.kegiatan === filterKegiatan : true;
    const matchStatus   = filterStatus ? p.statusHadir === filterStatus : true;
    return matchSearch && matchJenis && matchKegiatan && matchStatus;
  });
  // Paginasi tabel
  const { pageItems: pg_filtered, pager: pager_filtered } = usePagination(filtered, 10);

  return (
    <div className="mitra-stack">
      {/* Header */}
      <div className="mitra-intro">
        <h2>Peserta</h2>
        <p>Daftar peserta dari seluruh kegiatan kerja sama mitra Anda.</p>
      </div>

      {/* Filter Bar */}
      <div className="mitra-filterbar">
        <label className="mitra-searchbox">
          <Search size={18} />
          <input
            type="search"
            placeholder="Cari nama peserta atau kegiatan..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </label>
        <Select value={filterJenis} onChange={e => setFilterJenis(e.target.value)}>
          <option value="">Semua jenis</option>
          {jenisOptions.map(j => (
            <option key={j} value={j}>{j}</option>
          ))}
        </Select>
        <Select value={filterKegiatan} onChange={e => setFilterKegiatan(e.target.value)}>
          <option value="">Semua kegiatan</option>
          {kegiatanOptions.map(k => (
            <option key={k} value={k}>{k}</option>
          ))}
        </Select>
        <Select value={filterStatus} onChange={e => setFilterStatus(e.target.value)}>
          <option value="">Semua status</option>
          <option value="hadir-valid">Hadir</option>
          <option value="belum-hadir">Belum hadir</option>
        </Select>
      </div>

      {/* Table */}
      <div className="mitra-table-card">
        <table className="mitra-table">
          <thead>
            <tr>
              <th>Nama Peserta</th>
              <th>Jenis Kegiatan</th>
              <th>Kegiatan</th>
              <th>Waktu Presensi</th>
              <th>Status Kehadiran</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={5}>
                  <div className="mitra-empty">
                    <SearchX size={36} />
                    <p>Tidak ada data peserta ditemukan.</p>
                  </div>
                </td>
              </tr>
            ) : (
              pg_filtered.map(p => (
                <tr key={p.id}>
                  <td><span className="mitra-activity-title">{p.nama}</span></td>
                  <td>
                    <span className="mitra-mode-badge mitra-mode-badge--offline">
                      {p.jenisKegiatan || 'Workshop'}
                    </span>
                  </td>
                  <td>{p.kegiatan}</td>
                  <td style={{ color: p.waktuPresensi ? '#111827' : 'var(--mitra-muted)', fontSize: '13px' }}>
                    {p.waktuPresensi || '—'}
                  </td>
                  <td><StatusHadirBadge status={p.statusHadir} /></td>
                </tr>
              ))
            )}
          </tbody>
        </table>
          {pager_filtered}
      </div>
    </div>
  );
}

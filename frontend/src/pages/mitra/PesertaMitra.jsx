
import { Search, SearchX } from 'lucide-react';
import Pagination from '../../components/Pagination';
import useApi from '../../hooks/useApi';
import useDebouncedValue from '../../hooks/useDebouncedValue';
import { registrationsApi } from '../../api';
import { ErrorNotice, PageLoader } from '../../components/RequireRole';
import Select from '../../components/Select';
import useUrlState from '../../hooks/useUrlState';


const jenisOptions = ['Workshop', 'Seminar', 'Kuliah Umum'];

function StatusHadirBadge({ status }) {
  if (status === 'hadir-valid') return <span className="mitra-badge-status mitra-badge-status--berlangsung"><i></i> Hadir</span>;
  return <span className="mitra-badge-status mitra-badge-status--gray"><i></i> Belum hadir</span>;
}

export default function PesertaMitra() {
  const [search, setSearchRaw]                 = useUrlState('q');
  const [filterJenis, setFilterJenisRaw]       = useUrlState('jenis');
  const [filterKegiatan, setFilterKegiatanRaw] = useUrlState('kegiatan');
  const [filterStatus, setFilterStatusRaw]     = useUrlState('status');
  const [pageParam, setPage]                   = useUrlState('page', '1');
  const page = Math.max(1, parseInt(pageParam, 10) || 1);
  // Ubah filter → kembali ke halaman 1
  const withReset = fn => v => { fn(v); setPage('1'); };
  const setSearch = withReset(setSearchRaw);
  const setFilterJenis = withReset(setFilterJenisRaw);
  const setFilterKegiatan = withReset(setFilterKegiatanRaw);
  const setFilterStatus = withReset(setFilterStatusRaw);
  const q = useDebouncedValue(search, 300);

  // Pencarian, filter, dan pagination dilakukan di server — browser hanya menerima satu halaman
  const { data, loading, error, reload } = useApi(
    () => registrationsApi.list({ q: q || undefined, jenis: filterJenis || undefined, kegiatan: filterKegiatan || undefined, status: filterStatus || undefined, page, limit: 10 }),
    [q, filterJenis, filterKegiatan, filterStatus, page],
  );
  const filtered = data?.items || [];
  const pg_filtered = filtered;
  const meta = data?.meta || { page: 1, pages: 1, total: 0, limit: 10 };
  const kegiatanOptions = data?.facets?.kegiatan || [];
  const pager_filtered = <Pagination page={meta.page} pages={meta.pages} total={meta.total} pageSize={meta.limit} onChange={n => setPage(String(n))} />;

  return (
    <div className="mitra-stack">
      <ErrorNotice error={error} onRetry={reload} />
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
            {loading && !data ? (
              <tr><td colSpan={5}><PageLoader rows={4} /></td></tr>
            ) : filtered.length === 0 ? (
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

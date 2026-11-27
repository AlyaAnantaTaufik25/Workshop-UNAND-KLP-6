
import { useNavigate } from 'react-router-dom';
import { Search, AlertTriangle, Inbox } from 'lucide-react';
import { usePortalData } from '../../context/PortalData';
import { usePagination } from '../../components/Pagination';
import Select from '../../components/Select';
import PageHeader from '../../components/PageHeader';
import useUrlState from '../../hooks/useUrlState';

const ttdLabel = {
  'menunggu-rektor': 'Menunggu Rektor',
  'menunggu-mitra':  'Menunggu Mitra',
  'diterbitkan':     'Diterbitkan',
};
const ttdClass = {
  'menunggu-rektor': 'badge badge-orange',
  'menunggu-mitra':  'badge badge-amber',
  'diterbitkan':     'badge badge-green',
};

export default function Sertifikat() {
  const { sertifikatData, dokumenPengganti } = usePortalData();
  const navigate = useNavigate();
  const [search, setSearch]                 = useUrlState('q');
  const [filterJenis, setFilterJenis]       = useUrlState('jenis');
  const [filterKegiatan, setFilterKegiatan] = useUrlState('kegiatan');
  const [filterStatus, setFilterStatus]     = useUrlState('status');

  const filteredSert = sertifikatData.filter(s => {
    const matchSearch = s.namaKegiatan.toLowerCase().includes(search.toLowerCase());
    const matchJenis  = filterJenis  ? s.jenis === filterJenis : true;
    const matchStatus = filterStatus ? s.statusTandaTangan === filterStatus : true;
    return matchSearch && matchJenis && matchStatus;
  });
  // Paginasi tabel
  const { pageItems: pg_filteredSert, pager: pager_filteredSert } = usePagination(filteredSert, 10);

  return (
    <div>
      <PageHeader
        title="Sertifikat"
        description="Periksa dokumen dan urutan tanda tangan sebelum sertifikat diterbitkan."
        actions={
          <button type="button" className="ui-btn ui-btn--warning" onClick={() => navigate('/sekretariat/sertifikat-perbaikan')}>
            <AlertTriangle size={16} /> Sertifikat perlu diperbaiki <span className="ui-btn-count">{dokumenPengganti.length}</span>
          </button>
        }
      />

      {/* ── Filter Bar ── */}
      <div className="filter-bar">
        <div className="search-wrap">
          <Search size={15} className="search-icon" />
          <input
            className="search-input"
            placeholder="Cari nama kegiatan atau mitra..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        <Select className="filter-select" value={filterJenis} onChange={e => setFilterJenis(e.target.value)}>
          <option value="">Semua jenis</option>
          <option value="Workshop">Workshop</option>
          <option value="Seminar">Seminar</option>
        </Select>
        <Select className="filter-select" value={filterKegiatan} onChange={e => setFilterKegiatan(e.target.value)}>
          <option value="">Semua kegiatan</option>
          {sertifikatData.map(s => (
            <option key={s.id} value={s.id}>{s.namaKegiatan}</option>
          ))}
        </Select>
        <Select className="filter-select" value={filterStatus} onChange={e => setFilterStatus(e.target.value)}>
          <option value="">Semua status</option>
          <option value="menunggu-rektor">Menunggu Rektor</option>
          <option value="menunggu-mitra">Menunggu Mitra</option>
          <option value="diterbitkan">Diterbitkan</option>
        </Select>
      </div>

      {/* ── Tabel Pengajuan Sertifikat Utama ── */}
      <div className="table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th>Nama Kegiatan</th>
              <th>Jenis</th>
              <th>Mitra</th>
              <th>Sumber</th>
              <th>Jumlah Sertifikat</th>
              <th>Status Tanda Tangan</th>
              <th>Tanggal Pengajuan</th>
              <th>Tindakan</th>
            </tr>
          </thead>
          <tbody>
            {filteredSert.length === 0 && (
              <tr>
                <td colSpan={8} className="ui-empty-cell"><div className="ui-empty"><Inbox size={30} aria-hidden="true" /><div className="ui-empty-text">Tidak ada data yang ditemukan.</div></div></td>
              </tr>
            )}
            {pg_filteredSert.map(s => (
              <tr key={s.id}>
                <td><span className="table-name-bold">{s.namaKegiatan}</span></td>
                <td>{s.jenis}</td>
                <td>{s.mitra}</td>
                <td>
                  <span className={`source-tag ${s.sumber === 'UNAND' ? 'source-unand' : 'source-mitra'}`}>
                    {s.sumber}
                  </span>
                </td>
                <td style={{ textAlign: 'center', fontWeight: 600, color: 'var(--green-700)' }}>
                  {s.jumlahSertifikat}
                </td>
                <td>
                  <span className={ttdClass[s.statusTandaTangan]}>
                    {ttdLabel[s.statusTandaTangan]}
                  </span>
                </td>
                <td style={{ whiteSpace: 'nowrap' }}>{s.tanggalPengajuan}</td>
                <td>
                  <span
                    className="table-action-link"
                    onClick={() => navigate(`/sekretariat/sertifikat/${s.id}`)}
                  >
                    Lihat Detail
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
          {pager_filteredSert}
      </div>
    </div>
  );
}

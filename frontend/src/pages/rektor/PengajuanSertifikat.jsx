import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, AlertTriangle } from 'lucide-react';
import { usePortalData } from '../../context/PortalData';
import { usePagination } from '../../components/Pagination';
import Select from '../../components/Select';
import PageHeader from '../../components/PageHeader';

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

export default function PengajuanSertifikat() {
  const { sertifikatData, dokumenPengganti } = usePortalData();
  const navigate = useNavigate();
  const [search, setSearch]                 = useState('');
  const [filterJenis, setFilterJenis]       = useState('');
  const [filterKegiatan, setFilterKegiatan] = useState('');
  const [filterStatus, setFilterStatus]     = useState('');
  // Ringkasan tugas Rektor
  const menungguSaya = sertifikatData.filter(s => s.statusTandaTangan === 'menunggu-rektor').length;
  const penggantiTertunda = dokumenPengganti.filter(d => d.status === 'sedang-diproses').length;

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
        title="Pengajuan Sertifikat"
        description={menungguSaya
          ? <>{menungguSaya} sertifikat menunggu tanda tangan Anda. <button type="button" className="ui-link" onClick={() => setFilterStatus(filterStatus === 'menunggu-rektor' ? '' : 'menunggu-rektor')}>{filterStatus === 'menunggu-rektor' ? 'Tampilkan semua' : 'Tampilkan yang perlu ditandatangani'}</button></>
          : 'Semua pengajuan yang sampai ke Rektor sudah ditandatangani.'}
        actions={
          <button type="button" className="ui-btn ui-btn--warning" onClick={() => navigate('/rektor/sertifikat-perbaikan')}>
            <AlertTriangle size={16} /> Dokumen pengganti perlu TTE ulang <span className="ui-btn-count">{penggantiTertunda}</span>
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
              <th>NAMA KEGIATAN</th>
              <th>JENIS</th>
              <th>MITRA</th>
              <th>SUMBER</th>
              <th>JUMLAH SERTIFIKAT</th>
              <th>STATUS TANDA TANGAN</th>
              <th>TANGGAL PENGAJUAN</th>
              <th>TINDAKAN</th>
            </tr>
          </thead>
          <tbody>
            {filteredSert.length === 0 && (
              <tr>
                <td colSpan={8} style={{ textAlign: 'center', color: 'var(--gray-400)', padding: '32px' }}>
                  Tidak ada data yang ditemukan.
                </td>
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
                    onClick={() => navigate(`/rektor/pengajuan/${s.id}`)}
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

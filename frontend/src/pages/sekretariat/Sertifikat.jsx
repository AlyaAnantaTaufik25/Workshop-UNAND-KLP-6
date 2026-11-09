import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, AlertTriangle } from 'lucide-react';
import { sertifikatData, dokumenPengganti } from '../../data/mockData';

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
  const navigate = useNavigate();
  const [search, setSearch]                 = useState('');
  const [filterJenis, setFilterJenis]       = useState('');
  const [filterKegiatan, setFilterKegiatan] = useState('');
  const [filterStatus, setFilterStatus]     = useState('');

  const filteredSert = sertifikatData.filter(s => {
    const matchSearch = s.namaKegiatan.toLowerCase().includes(search.toLowerCase());
    const matchJenis  = filterJenis  ? s.jenis === filterJenis : true;
    const matchStatus = filterStatus ? s.statusTandaTangan === filterStatus : true;
    return matchSearch && matchJenis && matchStatus;
  });

  return (
    <div>
      {/* ── CARD NO. 3: Pemrosesan dan penerbitan sertifikat ── */}
      <div className="sert-process-banner" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '14px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '18px' }}>
          <div className="sert-process-num">3</div>
          <div className="sert-process-info">
            <div className="sert-process-title">Pemrosesan dan penerbitan sertifikat</div>
            <div className="sert-process-sub">Periksa dokumen dan urutan tanda tangan sebelum melanjutkan.</div>
          </div>
        </div>

        {/* Action Button: Sertifikat Perbaikan */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
          {/* Tombol ke Laman Sertifikat Perbaikan */}
          <button
            onClick={() => navigate('/sekretariat/sertifikat-perbaikan')}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              padding: '9px 18px',
              borderRadius: '8px',
              border: '1.5px solid #fcd34d',
              background: '#fffbeb',
              color: '#b45309',
              fontWeight: 700,
              fontSize: '13px',
              cursor: 'pointer',
              boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
              transition: 'all 0.15s ease',
            }}
            onMouseEnter={e => e.currentTarget.style.background = '#fef3c7'}
            onMouseLeave={e => e.currentTarget.style.background = '#fffbeb'}
          >
            <AlertTriangle size={16} color="#d97706" />
            <span>Sertifikat yang Perlu Diperbaiki ({dokumenPengganti.length})</span>
          </button>
        </div>
      </div>

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
        <select className="filter-select" value={filterJenis} onChange={e => setFilterJenis(e.target.value)}>
          <option value="">Semua jenis</option>
          <option value="Workshop">Workshop</option>
          <option value="Seminar">Seminar</option>
        </select>
        <select className="filter-select" value={filterKegiatan} onChange={e => setFilterKegiatan(e.target.value)}>
          <option value="">Semua kegiatan</option>
          {sertifikatData.map(s => (
            <option key={s.id} value={s.id}>{s.namaKegiatan}</option>
          ))}
        </select>
        <select className="filter-select" value={filterStatus} onChange={e => setFilterStatus(e.target.value)}>
          <option value="">Semua status</option>
          <option value="menunggu-rektor">Menunggu Rektor</option>
          <option value="menunggu-mitra">Menunggu Mitra</option>
          <option value="diterbitkan">Diterbitkan</option>
        </select>
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
                <td colSpan={8} style={{ textAlign: 'center', color: 'var(--gray-400)', padding: '32px' }}>
                  Tidak ada data yang ditemukan.
                </td>
              </tr>
            )}
            {filteredSert.map(s => (
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
      </div>
    </div>
  );
}

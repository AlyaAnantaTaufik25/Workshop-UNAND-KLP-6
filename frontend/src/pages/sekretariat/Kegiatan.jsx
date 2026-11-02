import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search } from 'lucide-react';
import { workshops } from '../../data/mockData';

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

export default function Kegiatan() {
  const navigate = useNavigate();
  const [search,     setSearch]     = useState('');
  const [filterJenis, setFilterJenis] = useState('');
  const [filterStatus, setFilterStatus] = useState('');

  const filtered = workshops.filter(w => {
    const matchSearch = w.nama.toLowerCase().includes(search.toLowerCase()) ||
                        w.penyelenggara.toLowerCase().includes(search.toLowerCase());
    const matchJenis  = filterJenis  ? w.jenis === filterJenis : true;
    const matchStatus = filterStatus ? w.statusSertifikat === filterStatus : true;
    return matchSearch && matchJenis && matchStatus;
  });

  return (
    <div>
      <h2 className="section-heading">Kegiatan</h2>
      <p className="section-subheading">
        Akses kegiatan dengan data presensi atau sertifikat untuk diproses.
      </p>

      {/* Filter bar */}
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

        <select
          className="filter-select"
          value={filterJenis}
          onChange={e => setFilterJenis(e.target.value)}
        >
          <option value="">Semua jenis</option>
          <option value="Workshop">Workshop</option>
          <option value="Seminar">Seminar</option>
        </select>

        <select
          className="filter-select"
          value={filterStatus}
          onChange={e => setFilterStatus(e.target.value)}
        >
          <option value="">Semua status</option>
          <option value="menunggu-rektor">Menunggu Rektor</option>
          <option value="menunggu-mitra">Menunggu Mitra</option>
          <option value="diterbitkan">Diterbitkan</option>
        </select>
      </div>

      {/* Table */}
      <div className="table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th>Nama Kegiatan</th>
              <th>Jenis</th>
              <th>Tanggal</th>
              <th>Penyelenggara / Mitra</th>
              <th>Lokasi</th>
              <th>Pendaftar</th>
              <th>Hadir</th>
              <th>Status Sertifikat</th>
              <th>Tindakan</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 && (
              <tr>
                <td colSpan={9} style={{ textAlign: 'center', color: 'var(--gray-400)', padding: '32px' }}>
                  Tidak ada data yang ditemukan.
                </td>
              </tr>
            )}
            {filtered.map(w => (
              <tr key={w.id}>
                <td>
                  <span className="table-name-bold">{w.nama}</span>
                </td>
                <td>{w.jenis}</td>
                <td style={{ whiteSpace: 'nowrap' }}>{w.tanggal}</td>
                <td>{w.penyelenggara}</td>
                <td>
                  <span className="table-link">{w.lokasi}</span>
                </td>
                <td style={{ textAlign: 'center' }}>{w.pendaftar}</td>
                <td style={{ textAlign: 'center' }}>{w.hadir}</td>
                <td>
                  <span className={statusClass[w.statusSertifikat]}>
                    {statusLabel[w.statusSertifikat]}
                  </span>
                </td>
                <td>
                  <span
                    className="table-action-link"
                    onClick={() => navigate(`/sekretariat/kegiatan/${w.id}`)}
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


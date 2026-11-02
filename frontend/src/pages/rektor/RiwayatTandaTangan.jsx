import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search } from 'lucide-react';
import { sertifikatData } from '../../data/mockData';

export default function RiwayatTandaTangan() {
  const navigate = useNavigate();
  const [search, setSearch]             = useState('');
  const [filterJenis, setFilterJenis]   = useState('');
  const [filterKegiatan, setFilterKegiatan] = useState('');
  const [filterStatus, setFilterStatus] = useState('');

  // Dokumen yang sudah melalui tahap tanda tangan Rektor (Diterbitkan)
  const riwayatList = sertifikatData.filter(s => s.statusTandaTangan === 'diterbitkan');

  const filtered = riwayatList.filter(s => {
    const matchSearch = s.namaKegiatan.toLowerCase().includes(search.toLowerCase());
    const matchJenis  = filterJenis  ? s.jenis === filterJenis : true;
    const matchStatus = filterStatus ? s.statusTandaTangan === filterStatus : true;
    return matchSearch && matchJenis && matchStatus;
  });

  return (
    <div>
      {/* ── CARD NO. 1: Riwayat tanda tangan Rektor ── */}
      <div className="sert-process-banner">
        <div className="sert-process-num" style={{ color: '#166534', fontSize: '28px' }}>1</div>
        <div className="sert-process-info">
          <div className="sert-process-title" style={{ fontSize: '14.5px' }}>Riwayat tanda tangan Rektor</div>
          <div className="sert-process-sub" style={{ fontSize: '12.5px' }}>Dokumen yang sudah melalui tahap tanda tangan Rektor.</div>
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
          {riwayatList.map(s => (
            <option key={s.id} value={s.id}>{s.namaKegiatan}</option>
          ))}
        </select>
        <select className="filter-select" value={filterStatus} onChange={e => setFilterStatus(e.target.value)}>
          <option value="">Semua status</option>
          <option value="diterbitkan">Diterbitkan</option>
        </select>
      </div>

      {/* ── Tabel Riwayat Tanda Tangan ── */}
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
            {filtered.length === 0 && (
              <tr>
                <td colSpan={8} style={{ textAlign: 'center', color: 'var(--gray-400)', padding: '32px' }}>
                  Tidak ada dokumen riwayat.
                </td>
              </tr>
            )}
            {filtered.map(s => (
              <tr key={s.id}>
                <td><span className="table-name-bold">{s.namaKegiatan}</span></td>
                <td>{s.jenis}</td>
                <td>{s.mitra}</td>
                <td>
                  <span className="badge-sumber-outline">
                    {s.sumber}
                  </span>
                </td>
                <td style={{ textAlign: 'center', color: 'var(--gray-700)' }}>
                  {s.jumlahSertifikat}
                </td>
                <td>
                  <span className="badge badge-green">
                    Diterbitkan
                  </span>
                </td>
                <td style={{ whiteSpace: 'nowrap' }}>{s.tanggalPengajuan}</td>
                <td>
                  <button
                    className="btn-lihat-dokumen-figma"
                    onClick={() => navigate(`/rektor/riwayat/${s.id}`)}
                  >
                    Lihat Dokumen
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

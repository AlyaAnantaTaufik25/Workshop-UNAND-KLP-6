import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search } from 'lucide-react';
import { dokumenPengganti } from '../../data/mockData';
import BackButton from '../../components/BackButton';

const dpStatusLabel = { 'sedang-diproses': 'Sedang Diproses' };
const dpStatusClass = { 'sedang-diproses': 'badge badge-blue' };

export default function SertifikatPerbaikanRektor() {
  const navigate = useNavigate();
  const [dpSearch, setDpSearch] = useState('');
  const [dpStatus, setDpStatus] = useState('');

  const filteredDp = dokumenPengganti.filter(d => {
    const matchSearch = d.namaPeserta.toLowerCase().includes(dpSearch.toLowerCase()) ||
                        d.namaKegiatan.toLowerCase().includes(dpSearch.toLowerCase()) ||
                        d.nomorSertifikat.toLowerCase().includes(dpSearch.toLowerCase());
    const matchStatus = dpStatus ? d.status === dpStatus : true;
    return matchSearch && matchStatus;
  });

  return (
    <div>
      {/* Back to main Pengajuan */}
      <BackButton to="/rektor/pengajuan" label="Kembali ke Pengajuan Sertifikat" />

      {/* Section Header */}
      <div className="section-divider" style={{ marginTop: '8px' }}>
        <p className="section-divider-label">DOKUMEN PENGGANTI</p>
        <div className="dp-detail-header-row">
          <div>
            <h3 className="section-divider-heading">Pemrosesan Sertifikat Hasil Perbaikan</h3>
            <p className="section-divider-sub">
              Periksa pengajuan dan lanjutkan dokumen pengganti sesuai alur penerbitan tanda tangan.
            </p>
          </div>
        </div>

        <div>
          {/* Filter Bar */}
          <div className="filter-bar">
            <div className="search-wrap" style={{ maxWidth: '340px' }}>
              <Search size={15} className="search-icon" />
              <input
                className="search-input"
                placeholder="Cari peserta, kegiatan, no..."
                value={dpSearch}
                onChange={e => setDpSearch(e.target.value)}
              />
            </div>
            <select className="filter-select" value={dpStatus} onChange={e => setDpStatus(e.target.value)}>
              <option value="">Semua status</option>
              <option value="sedang-diproses">Sedang Diproses</option>
            </select>
          </div>

          {/* Table */}
          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>NAMA PESERTA</th>
                  <th>NAMA KEGIATAN</th>
                  <th>NOMOR SERTIFIKAT</th>
                  <th>JENIS PERBAIKAN</th>
                  <th>TANGGAL PENGAJUAN</th>
                  <th>STATUS</th>
                  <th>AKSI</th>
                </tr>
              </thead>
              <tbody>
                {filteredDp.length === 0 && (
                  <tr>
                    <td colSpan={7} style={{ textAlign: 'center', color: 'var(--gray-400)', padding: '32px' }}>
                      Tidak ada pengajuan dokumen pengganti.
                    </td>
                  </tr>
                )}
                {filteredDp.map(d => (
                  <tr key={d.id}>
                    <td><span className="table-name-bold">{d.namaPeserta}</span></td>
                    <td>
                      <div style={{ fontWeight: 600, color: 'var(--gray-800)', fontSize: '13px' }}>
                        {d.namaKegiatan}
                      </div>
                      <div style={{ fontSize: '12px', color: 'var(--gray-400)' }}>{d.penyelenggara}</div>
                    </td>
                    <td style={{ fontFamily: 'monospace', fontSize: '12px' }}>{d.nomorSertifikat}</td>
                    <td>{d.jenisPerbaikan}</td>
                    <td style={{ whiteSpace: 'nowrap' }}>{d.tanggalPengajuan}</td>
                    <td>
                      <span className={dpStatusClass[d.status]}>
                        {dpStatusLabel[d.status]}
                      </span>
                    </td>
                    <td>
                      <span
                        className="table-action-link"
                        onClick={() => navigate(`/rektor/dokumen-pengganti/${d.id}`)}
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
      </div>
    </div>
  );
}


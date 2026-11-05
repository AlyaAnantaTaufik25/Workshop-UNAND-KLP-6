import { useState } from 'react';
import { Search, Download, ArrowLeft, Users, CheckCircle, Clock } from 'lucide-react';
import { workshops, presensiData } from '../../data/mockData';
import { downloadPresensiCSV } from './utils/exportHelper';

export default function Presensi() {
  const [search, setSearch]             = useState('');
  const [filterJenis, setFilterJenis]   = useState('');
  const [selectedWorkshopId, setSelectedWorkshopId] = useState(null);
  const [pesertaSearch, setPesertaSearch]           = useState('');
  const [pesertaStatusFilter, setPesertaStatusFilter] = useState('');
  const [downloadSuccess, setDownloadSuccess]       = useState('');

  // Filter daftar kegiatan workshop
  const filteredWorkshops = workshops.filter(w => {
    const matchSearch = w.nama.toLowerCase().includes(search.toLowerCase()) ||
                        w.penyelenggara.toLowerCase().includes(search.toLowerCase());
    const matchJenis  = filterJenis ? w.jenis === filterJenis : true;
    return matchSearch && matchJenis;
  });

  const selectedWorkshop = workshops.find(w => w.id === selectedWorkshopId);

  // Data peserta untuk workshop yang sedang dipilih
  const workshopPeserta = selectedWorkshop ? presensiData.filter(p => p.kegiatanId === selectedWorkshop.id) : [];

  const filteredPeserta = workshopPeserta.filter(p => {
    const matchSearch = p.namaPeserta.toLowerCase().includes(pesertaSearch.toLowerCase());
    const matchStatus = pesertaStatusFilter ? p.statusKehadiran === pesertaStatusFilter : true;
    return matchSearch && matchStatus;
  });

  const handleDownload = (workshop, pesertaList) => {
    const dataToExport = pesertaList && pesertaList.length > 0 
      ? pesertaList 
      : presensiData.filter(p => p.kegiatanId === workshop.id);
    
    downloadPresensiCSV(workshop.nama, dataToExport.length > 0 ? dataToExport : [
      { namaPeserta: 'Nadia Amelia', kegiatan: workshop.nama, waktuPresensi: null, statusKehadiran: 'belum-hadir' },
      { namaPeserta: 'Rafi Pratama', kegiatan: workshop.nama, waktuPresensi: `${workshop.tanggal} - 08.47 WIB`, statusKehadiran: 'hadir-valid' },
      { namaPeserta: 'Siti Rahmah', kegiatan: workshop.nama, waktuPresensi: null, statusKehadiran: 'belum-hadir' },
    ]);

    setDownloadSuccess(`Rekap presensi "${workshop.nama}" berhasil diunduh!`);
    setTimeout(() => setDownloadSuccess(''), 3000);
  };

  return (
    <div>
      {/* ── NOTIFIKASI UNDUH BERHASIL ── */}
      {downloadSuccess && (
        <div style={{
          position: 'fixed',
          top: '24px',
          right: '24px',
          background: 'var(--green-900)',
          color: 'white',
          padding: '12px 20px',
          borderRadius: '8px',
          boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
          zIndex: 9999,
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          fontSize: '13.5px',
          fontWeight: 600,
        }}>
          <CheckCircle size={18} color="#bbf7d0" />
          {downloadSuccess}
        </div>
      )}

      {/* ════════════════════════════════════════════════════════════════════
          VIEW 1: DETAIL PRESENSI PESERTA PER-KEGIATAN
          ════════════════════════════════════════════════════════════════════ */}
      {selectedWorkshop ? (
        <div>
          {/* Tombol Back */}
          <button
            type="button"
            className="dp-btn-kembali-box"
            onClick={() => setSelectedWorkshopId(null)}
            style={{ marginBottom: '20px', display: 'inline-flex', alignItems: 'center', gap: '8px' }}
          >
            <ArrowLeft size={16} />
            <span>Kembali ke Daftar Kegiatan Presensi</span>
          </button>

          {/* Header Kegiatan Presensi */}
          <div style={{
            background: 'white',
            border: '1px solid var(--gray-200)',
            borderRadius: '12px',
            padding: '24px 28px',
            marginBottom: '24px'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
              <div>
                <span className="badge badge-green" style={{ marginBottom: '8px' }}>
                  {selectedWorkshop.jenis}
                </span>
                <h2 style={{ fontSize: '22px', fontWeight: 700, color: 'var(--gray-900)', marginBottom: '6px' }}>
                  {selectedWorkshop.nama}
                </h2>
                <p style={{ fontSize: '13px', color: 'var(--gray-500)' }}>
                  {selectedWorkshop.tanggal} · {selectedWorkshop.lokasi} · {selectedWorkshop.penyelenggara}
                </p>
              </div>

              {/* Tombol Unduh Rekap Presensi Kegiatan Ini */}
              <button
                type="button"
                onClick={() => handleDownload(selectedWorkshop, workshopPeserta)}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '10px 20px',
                  background: 'var(--green-900)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '13.5px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  transition: 'background 0.15s',
                }}
                onMouseEnter={e => e.currentTarget.style.background = 'var(--green-800)'}
                onMouseLeave={e => e.currentTarget.style.background = 'var(--green-900)'}
              >
                <Download size={16} />
                <span>Unduh Rekap Presensi (CSV)</span>
              </button>
            </div>

            {/* Statistik Presensi Kegiatan */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: '16px',
              marginTop: '20px',
              paddingTop: '20px',
              borderTop: '1px solid var(--gray-100)'
            }}>
              <div>
                <div style={{ fontSize: '12px', color: 'var(--gray-500)', marginBottom: '4px' }}>Total Pendaftar</div>
                <div style={{ fontSize: '20px', fontWeight: 800, color: 'var(--gray-900)' }}>{selectedWorkshop.pendaftar}</div>
              </div>
              <div>
                <div style={{ fontSize: '12px', color: 'var(--gray-500)', marginBottom: '4px' }}>Peserta Hadir Valid</div>
                <div style={{ fontSize: '20px', fontWeight: 800, color: 'var(--green-700)' }}>{selectedWorkshop.hadir}</div>
              </div>
              <div>
                <div style={{ fontSize: '12px', color: 'var(--gray-500)', marginBottom: '4px' }}>Tingkat Kehadiran</div>
                <div style={{ fontSize: '20px', fontWeight: 800, color: 'var(--green-700)' }}>
                  {selectedWorkshop.pendaftar > 0 ? Math.round((selectedWorkshop.hadir / selectedWorkshop.pendaftar) * 100) : 0}%
                </div>
              </div>
            </div>
          </div>

          {/* Filter Bar Peserta */}
          <div className="filter-bar">
            <div className="search-wrap" style={{ maxWidth: '360px' }}>
              <Search size={15} className="search-icon" />
              <input
                className="search-input"
                placeholder="Cari nama peserta..."
                value={pesertaSearch}
                onChange={e => setPesertaSearch(e.target.value)}
              />
            </div>
            <select
              className="filter-select"
              value={pesertaStatusFilter}
              onChange={e => setPesertaStatusFilter(e.target.value)}
            >
              <option value="">Semua status kehadiran</option>
              <option value="hadir-valid">Hadir valid</option>
              <option value="belum-hadir">Belum hadir</option>
            </select>
          </div>

          {/* Tabel Presensi Peserta Kegiatan Ini */}
          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>NAMA PESERTA</th>
                  <th>KEGIATAN</th>
                  <th>WAKTU PRESENSI</th>
                  <th>STATUS KEHADIRAN</th>
                </tr>
              </thead>
              <tbody>
                {filteredPeserta.length === 0 ? (
                  <tr>
                    <td colSpan={4} style={{ textAlign: 'center', color: 'var(--gray-400)', padding: '32px' }}>
                      Tidak ada data peserta untuk filter yang dipilih.
                    </td>
                  </tr>
                ) : (
                  filteredPeserta.map(p => (
                    <tr key={p.id}>
                      <td><span className="table-name-bold">{p.namaPeserta}</span></td>
                      <td>{selectedWorkshop.nama}</td>
                      <td style={{ color: p.waktuPresensi ? 'var(--gray-800)' : 'var(--gray-400)' }}>
                        {p.waktuPresensi ?? '—'}
                      </td>
                      <td>
                        <span className={p.statusKehadiran === 'hadir-valid' ? 'badge badge-green' : 'badge badge-amber'}>
                          {p.statusKehadiran === 'hadir-valid' ? 'Hadir valid' : 'Belum hadir'}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* ════════════════════════════════════════════════════════════════════
            VIEW 2: DAFTAR PRESENSI PER-KEGIATAN WORKSHOP
            ════════════════════════════════════════════════════════════════════ */
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px', marginBottom: '20px' }}>
            <div>
              <h2 className="section-heading">Data Presensi per Kegiatan</h2>
              <p className="section-subheading">
                Kelola rekapitulasi presensi kehadiran per workshop berdasarkan validasi QR dan lokasi.
              </p>
            </div>

            {/* Tombol Unduh Seluruh Presensi */}
            <button
              type="button"
              onClick={() => {
                downloadPresensiCSV('Semua_Kegiatan_Workshop_UNAND', presensiData);
                setDownloadSuccess('Seluruh data presensi berhasil diunduh!');
                setTimeout(() => setDownloadSuccess(''), 3000);
              }}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '10px 18px',
                background: 'white',
                border: '1.5px solid var(--gray-300)',
                borderRadius: '8px',
                fontSize: '13px',
                fontWeight: 600,
                color: 'var(--gray-800)',
                cursor: 'pointer',
                transition: 'all 0.15s ease',
              }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--green-600)'; e.currentTarget.style.color = 'var(--green-700)'; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--gray-300)'; e.currentTarget.style.color = 'var(--gray-800)'; }}
            >
              <Download size={15} />
              <span>Unduh Semua Rekap Presensi (CSV)</span>
            </button>
          </div>

          {/* Filter Bar Kegiatan */}
          <div className="filter-bar">
            <div className="search-wrap">
              <Search size={15} className="search-icon" />
              <input
                className="search-input"
                placeholder="Cari nama kegiatan workshop atau mitra..."
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
            </div>

            <select
              className="filter-select"
              value={filterJenis}
              onChange={e => setFilterJenis(e.target.value)}
            >
              <option value="">Semua jenis kegiatan</option>
              <option value="Workshop">Workshop</option>
              <option value="Seminar">Seminar</option>
            </select>
          </div>

          {/* Tabel Presensi Per-Kegiatan */}
          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>NAMA KEGIATAN</th>
                  <th>JENIS</th>
                  <th>TANGGAL</th>
                  <th>PENYELENGGARA / MITRA</th>
                  <th>PENDAFTAR</th>
                  <th>HADIR VALID</th>
                  <th>RASIO KEHADIRAN</th>
                  <th>AKSI</th>
                </tr>
              </thead>
              <tbody>
                {filteredWorkshops.length === 0 ? (
                  <tr>
                    <td colSpan={8} style={{ textAlign: 'center', color: 'var(--gray-400)', padding: '32px' }}>
                      Tidak ada kegiatan ditemukan.
                    </td>
                  </tr>
                ) : (
                  filteredWorkshops.map(w => {
                    const ratio = w.pendaftar > 0 ? Math.round((w.hadir / w.pendaftar) * 100) : 0;
                    return (
                      <tr key={w.id}>
                        <td>
                          <div className="table-name-bold">{w.nama}</div>
                          <div style={{ fontSize: '12px', color: 'var(--gray-400)', marginTop: '2px' }}>
                            {w.lokasi}
                          </div>
                        </td>
                        <td>{w.jenis}</td>
                        <td style={{ whiteSpace: 'nowrap' }}>{w.tanggal}</td>
                        <td>{w.penyelenggara}</td>
                        <td style={{ textAlign: 'center', fontWeight: 600 }}>{w.pendaftar}</td>
                        <td style={{ textAlign: 'center', fontWeight: 700, color: 'var(--green-700)' }}>
                          {w.hadir}
                        </td>
                        <td style={{ textAlign: 'center' }}>
                          <span className={`badge ${ratio >= 75 ? 'badge-green' : ratio > 0 ? 'badge-orange' : 'badge-gray'}`}>
                            {ratio}%
                          </span>
                        </td>
                        <td>
                          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                            {/* Tombol Lihat Peserta Presensi Kegiatan Ini */}
                            <button
                              type="button"
                              className="btn-lihat-dokumen-figma"
                              onClick={() => setSelectedWorkshopId(w.id)}
                            >
                              Lihat Presensi
                            </button>

                            {/* Tombol Unduh CSV Kegiatan Ini */}
                            <button
                              type="button"
                              title="Unduh Rekap Presensi (CSV)"
                              onClick={() => handleDownload(w)}
                              style={{
                                padding: '7px 10px',
                                borderRadius: '6px',
                                border: '1px solid var(--gray-300)',
                                background: 'white',
                                color: 'var(--green-800)',
                                cursor: 'pointer',
                                display: 'inline-flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                transition: 'all 0.15s ease'
                              }}
                              onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--green-600)'; e.currentTarget.style.background = 'var(--green-50)'; }}
                              onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--gray-300)'; e.currentTarget.style.background = 'white'; }}
                            >
                              <Download size={14} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

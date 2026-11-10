import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Bell, Download, Calendar } from 'lucide-react';

const kegiatanList = [
  {
    id: 1,
    kegiatan: 'Workshop Data Science untuk Riset Akademik',
    jenis: 'Workshop',
    pelaksanaan: 'Offline',
    periode: '18 Mei 2026',
    pendaftar: 108,
    hadir: 88,
    belumAbsen: 20,
    menungguVerifikasi: 0,
    ditolak: 0,
  },
  {
    id: 2,
    kegiatan: 'Strategi Hilirisasi Riset dan Inovasi',
    jenis: 'Seminar',
    pelaksanaan: 'Offline',
    periode: '24 Mei 2026',
    pendaftar: 80,
    hadir: 0,
    belumAbsen: 2,
    menungguVerifikasi: 0,
    ditolak: 0,
  },
  {
    id: 3,
    kegiatan: 'Kepemimpinan Muda Berdampak',
    jenis: 'Kuliah Umum',
    pelaksanaan: 'Offline',
    periode: '2 Juni 2026',
    pendaftar: 62,
    hadir: 0,
    belumAbsen: 62,
    menungguVerifikasi: 0,
    ditolak: 0,
  },
  {
    id: 4,
    kegiatan: 'Manajemen Proyek Kolaboratif',
    jenis: 'Workshop',
    pelaksanaan: 'Offline',
    periode: '15 April 2026',
    pendaftar: 92,
    hadir: 84,
    belumAbsen: 8,
    menungguVerifikasi: 0,
    ditolak: 0,
  },
  {
    id: 5,
    kegiatan: 'Inovasi Industri Berkelanjutan',
    jenis: 'Seminar',
    pelaksanaan: 'Offline',
    periode: '12 Mei 2026',
    pendaftar: 76,
    hadir: 1,
    belumAbsen: 1,
    menungguVerifikasi: 0,
    ditolak: 0,
  },
  {
    id: 6,
    kegiatan: 'Seminar Transformasi Digital',
    jenis: 'Seminar',
    pelaksanaan: 'Online',
    periode: '18 Mei 2026 – 20 Mei 2026',
    pendaftar: 1,
    hadir: 0,
    belumAbsen: 3,
    menungguVerifikasi: 0,
    ditolak: 0,
  },
  {
    id: 7,
    kegiatan: 'Seminar Kolaborasi Riset Lintas Disiplin',
    jenis: 'Seminar',
    pelaksanaan: 'Offline',
    periode: '18 Mei 2026 – 19 Mei 2026',
    pendaftar: 1,
    hadir: 0,
    belumAbsen: 2,
    menungguVerifikasi: 0,
    ditolak: 0,
  },
];

const rekapSeminarHarian = [
  {
    id: 1,
    kegiatan: 'Strategi Hilirisasi Riset dan Inovasi',
    pelaksanaan: 'Offline',
    hari: 'Hari 1',
    tanggal: '24 Mei 2026',
    absensi: 'Ditutup',
    sampelPeserta: 2,
    belumAbsen: 2,
    menungguVerifikasi: 0,
    hadir: 0,
    ditolak: 0,
  },
  {
    id: 2,
    kegiatan: 'Inovasi Industri Berkelanjutan',
    pelaksanaan: 'Offline',
    hari: 'Hari 1',
    tanggal: '12 Mei 2026',
    absensi: 'Ditutup',
    sampelPeserta: 2,
    belumAbsen: 1,
    menungguVerifikasi: 0,
    hadir: 1,
    ditolak: 0,
  },
  {
    id: 3,
    kegiatan: 'Seminar Transformasi Digital',
    pelaksanaan: 'Online',
    hari: 'Hari 1',
    tanggal: '18 Mei 2026',
    absensi: 'Ditutup',
    sampelPeserta: 1,
    belumAbsen: 1,
    menungguVerifikasi: 0,
    hadir: 0,
    ditolak: 0,
  },
  {
    id: 4,
    kegiatan: 'Seminar Transformasi Digital',
    pelaksanaan: 'Online',
    hari: 'Hari 2',
    tanggal: '19 Mei 2026',
    absensi: 'Ditutup',
    sampelPeserta: 1,
    belumAbsen: 1,
    menungguVerifikasi: 0,
    hadir: 0,
    ditolak: 0,
  },
  {
    id: 5,
    kegiatan: 'Seminar Transformasi Digital',
    pelaksanaan: 'Online',
    hari: 'Hari 3',
    tanggal: '20 Mei 2026',
    absensi: 'Ditutup',
    sampelPeserta: 1,
    belumAbsen: 1,
    menungguVerifikasi: 0,
    hadir: 0,
    ditolak: 0,
  },
  {
    id: 6,
    kegiatan: 'Seminar Kolaborasi Riset Lintas Disiplin',
    pelaksanaan: 'Offline',
    hari: 'Hari 1',
    tanggal: '18 Mei 2026',
    absensi: 'Ditutup',
    sampelPeserta: 1,
    belumAbsen: 1,
    menungguVerifikasi: 0,
    hadir: 0,
    ditolak: 0,
  },
  {
    id: 7,
    kegiatan: 'Seminar Kolaborasi Riset Lintas Disiplin',
    pelaksanaan: 'Offline',
    hari: 'Hari 2',
    tanggal: '19 Mei 2026',
    absensi: 'Ditutup',
    sampelPeserta: 1,
    belumAbsen: 1,
    menungguVerifikasi: 0,
    hadir: 0,
    ditolak: 0,
  },
];

export default function Laporan() {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [filterJenis, setFilterJenis] = useState('');
  const [filterKegiatan, setFilterKegiatan] = useState('');
  const [filterDate, setFilterDate] = useState('');

  const filteredKegiatan = useMemo(() => {
    return kegiatanList.filter(l => {
      const q = search.toLowerCase();
      const matchSearch =
        l.kegiatan.toLowerCase().includes(q) ||
        l.jenis.toLowerCase().includes(q) ||
        l.pelaksanaan.toLowerCase().includes(q);
      const matchJenis = filterJenis ? l.jenis === filterJenis : true;
      const matchKegiatan = filterKegiatan ? l.kegiatan === filterKegiatan : true;
      return matchSearch && matchJenis && matchKegiatan;
    });
  }, [search, filterJenis, filterKegiatan]);

  const jenisOptions = useMemo(() => {
    return Array.from(new Set(kegiatanList.map(l => l.jenis)));
  }, []);

  const handleExportExcel = () => {
    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [
        'KEGIATAN,JENIS,PELAKSANAAN,PERIODE,PENDAFTAR,HADIR,BELUM ABSEN,MENUNGGU VERIFIKASI,DITOLAK',
        ...filteredKegiatan.map(
          k =>
            `"${k.kegiatan}","${k.jenis}","${k.pelaksanaan}","${k.periode}",${k.pendaftar},${k.hadir},${k.belumAbsen},${k.menungguVerifikasi},${k.ditolak}`
        ),
      ].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', 'Laporan_Kegiatan_UNAND.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleExportPDF = () => {
    window.print();
  };

  return (
    <div className="humas-list-page">
      {/* ─── Top Notif Bar ─── */}
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 12 }}>
        <button
          className="humas-notif-btn"
          onClick={() => navigate('/humas/perbaikan-sertifikat')}
        >
          <Bell size={15} /> Notifikasi perbaikan (1)
        </button>
      </div>

      {/* ─── Header ─── */}
      <div style={{ marginBottom: 16 }}>
        <h2 className="humas-section-title">Laporan kegiatan</h2>
        <p className="humas-section-sub">Rekap pendaftaran dan kehadiran kegiatan.</p>
      </div>

      {/* ─── Filter Bar ─── */}
      <div
        className="filter-bar"
        style={{
          background: '#ffffff',
          border: '1px solid #e5e7eb',
          borderRadius: 8,
          padding: '10px 14px',
          display: 'flex',
          gap: 12,
          flexWrap: 'wrap',
          alignItems: 'center',
          marginBottom: 12,
        }}
      >
        <div className="search-wrap" style={{ flex: 1, minWidth: 260 }}>
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
          style={{ minWidth: 140 }}
          value={filterJenis}
          onChange={e => setFilterJenis(e.target.value)}
        >
          <option value="">Semua jenis</option>
          {jenisOptions.map(j => (
            <option key={j} value={j}>
              {j}
            </option>
          ))}
        </select>

        <select
          className="filter-select"
          style={{ minWidth: 200 }}
          value={filterKegiatan}
          onChange={e => setFilterKegiatan(e.target.value)}
        >
          <option value="">Semua kegiatan</option>
          {kegiatanList.map(l => (
            <option key={l.id} value={l.kegiatan}>
              {l.kegiatan}
            </option>
          ))}
        </select>

        <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
          <input
            className="form-input"
            type="date"
            style={{ width: 150, paddingRight: 32 }}
            value={filterDate}
            onChange={e => setFilterDate(e.target.value)}
          />
          <Calendar
            size={14}
            style={{ position: 'absolute', right: 10, color: '#9ca3af', pointerEvents: 'none' }}
          />
        </div>
      </div>

      {/* ─── Export Buttons ─── */}
      <div style={{ display: 'flex', gap: 10, marginBottom: 16 }}>
        <button
          className="laporan-export-btn laporan-export-excel"
          onClick={handleExportExcel}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 7,
            padding: '8px 16px',
            borderRadius: 6,
            fontSize: '13px',
            fontWeight: 600,
            cursor: 'pointer',
            border: '1.5px solid #d1d5db',
            background: '#ffffff',
            color: '#14532d',
          }}
        >
          <Download size={14} /> Ekspor Excel
        </button>
        <button
          className="laporan-export-btn laporan-export-pdf"
          onClick={handleExportPDF}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 7,
            padding: '8px 16px',
            borderRadius: 6,
            fontSize: '13px',
            fontWeight: 600,
            cursor: 'pointer',
            border: 'none',
            background: '#14532d',
            color: '#ffffff',
          }}
        >
          <Download size={14} /> Ekspor PDF
        </button>
      </div>



      {/* ─── Summary Cards ─── */}
      <div className="laporan-summary-row" style={{ marginBottom: 20 }}>
        <div className="laporan-summary-card">
          <span className="laporan-summary-label">Pendaftar</span>
          <span className="laporan-summary-value">420</span>
        </div>
        <div className="laporan-summary-card">
          <span className="laporan-summary-label">Hadir (catatan)</span>
          <span className="laporan-summary-value">173</span>
        </div>
        <div className="laporan-summary-card">
          <span className="laporan-summary-label">Belum Absen / Tidak hadir</span>
          <span className="laporan-summary-value">98</span>
        </div>
      </div>

      {/* ─── Main Table: Rekap Kegiatan ─── */}
      <div className="table-container" style={{ marginBottom: 24 }}>
        <table className="data-table">
          <thead>
            <tr>
              <th>KEGIATAN</th>
              <th>JENIS</th>
              <th>PELAKSANAAN</th>
              <th>PERIODE</th>
              <th style={{ textAlign: 'center' }}>PENDAFTAR</th>
              <th style={{ textAlign: 'center' }}>HADIR (CATATAN)</th>
              <th style={{ textAlign: 'center' }}>BELUM ABSEN / TIDAK HADIR</th>
              <th style={{ textAlign: 'center' }}>MENUNGGU VERIFIKASI</th>
              <th style={{ textAlign: 'center' }}>DITOLAK</th>
            </tr>
          </thead>
          <tbody>
            {filteredKegiatan.length === 0 ? (
              <tr>
                <td colSpan={9} style={{ textAlign: 'center', color: '#9ca3af', padding: 24 }}>
                  Tidak ada data kegiatan yang sesuai filter.
                </td>
              </tr>
            ) : (
              filteredKegiatan.map(k => (
                <tr key={k.id}>
                  <td>
                    <span className="table-name-bold">{k.kegiatan}</span>
                  </td>
                  <td>{k.jenis}</td>
                  <td>{k.pelaksanaan}</td>
                  <td style={{ whiteSpace: 'nowrap' }}>{k.periode}</td>
                  <td style={{ textAlign: 'center' }}>{k.pendaftar}</td>
                  <td style={{ textAlign: 'center' }}>{k.hadir}</td>
                  <td style={{ textAlign: 'center' }}>{k.belumAbsen}</td>
                  <td style={{ textAlign: 'center' }}>{k.menungguVerifikasi}</td>
                  <td style={{ textAlign: 'center' }}>{k.ditolak}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* ─── Secondary Section: Rekap Kehadiran Seminar Per Hari ─── */}
      <div
        style={{
          background: '#ffffff',
          border: '1px solid #e5e7eb',
          borderRadius: 8,
          padding: '20px 24px',
          marginBottom: 20,
        }}
      >
        <div style={{ marginBottom: 16 }}>
          <h3 style={{ fontSize: '15px', fontWeight: 700, color: '#111827', margin: 0 }}>
            Rekap Kehadiran Seminar Per Hari
          </h3>
          <p style={{ fontSize: '12px', color: '#6b7280', marginTop: 4 }}>
            Menggunakan catatan harian yang sama dengan halaman absensi.
          </p>
        </div>

        <div className="table-container" style={{ border: '1px solid #e5e7eb', borderRadius: 6 }}>
          <table className="data-table">
            <thead>
              <tr>
                <th>KEGIATAN</th>
                <th>PELAKSANAAN</th>
                <th>HARI</th>
                <th>TANGGAL</th>
                <th>ABSENSI</th>
                <th style={{ textAlign: 'center' }}>SAMPEL PESERTA</th>
                <th style={{ textAlign: 'center' }}>BELUM ABSEN</th>
                <th style={{ textAlign: 'center' }}>MENUNGGU VERIFIKASI</th>
                <th style={{ textAlign: 'center' }}>HADIR</th>
                <th style={{ textAlign: 'center' }}>DITOLAK</th>
              </tr>
            </thead>
            <tbody>
              {rekapSeminarHarian.map(r => (
                <tr key={r.id}>
                  <td>{r.kegiatan}</td>
                  <td>{r.pelaksanaan}</td>
                  <td>{r.hari}</td>
                  <td style={{ whiteSpace: 'nowrap' }}>{r.tanggal}</td>
                  <td>{r.absensi}</td>
                  <td style={{ textAlign: 'center' }}>{r.sampelPeserta}</td>
                  <td style={{ textAlign: 'center' }}>{r.belumAbsen}</td>
                  <td style={{ textAlign: 'center' }}>{r.menungguVerifikasi}</td>
                  <td style={{ textAlign: 'center' }}>{r.hadir}</td>
                  <td style={{ textAlign: 'center' }}>{r.ditolak}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

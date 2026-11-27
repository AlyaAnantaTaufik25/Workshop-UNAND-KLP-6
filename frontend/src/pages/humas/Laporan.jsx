import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Download, Users, UserCheck, UserX, Inbox } from 'lucide-react';
import './laporan-print.css';
import useApi from '../../hooks/useApi';
import { reportsApi } from '../../api';
import { PageLoader, ErrorNotice } from '../../components/RequireRole';
import { usePagination } from '../../components/Pagination';
import { dialog, toast } from '../../components/Dialog';
import { exportExcel } from '../../utils/excel';
import Select from '../../components/Select';
import PageHeader from '../../components/PageHeader';
import useUrlState from '../../hooks/useUrlState';
import { getDateRange } from '../../utils/periode';
import { useCurrentUser } from '../../context/AuthContext';
import { StatTile } from '../../components/Dashboard';

/* ══════════════════════════════════════════
   DATA
══════════════════════════════════════════ */
// Data laporan diambil dari API /reports (lihat komponen Laporan)

/* ══════════════════════════════════════════
   HELPERS
══════════════════════════════════════════ */
/* ══════════════════════════════════════════
   BUILD HTML UNTUK WINDOW PRINT
══════════════════════════════════════════ */
function buildPrintHTML({ data, dataSeminar, filterPeriode, filterJenis, penandatangan = '' }) {
  const totalPendaftar = data.reduce((s, k) => s + k.pendaftar, 0);
  const totalHadir     = data.reduce((s, k) => s + k.hadir, 0);
  const totalBelum     = data.reduce((s, k) => s + k.belumAbsen, 0);
  const totalMenunggu  = data.reduce((s, k) => s + k.menungguVerifikasi, 0);
  const totalDitolak   = data.reduce((s, k) => s + k.ditolak, 0);

  const now = new Date();
  const tanggalCetak =
    now.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }) +
    ' pukul ' +
    now.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });

  const periodeMap = { 'hari-ini': 'Hari ini', '7-hari': '7 hari terakhir', '1-bulan': '1 bulan terakhir', '': 'Semua periode' };
  const periodeLabel = periodeMap[filterPeriode] ?? 'Semua periode';

  const thStyle = 'border:1px solid #9ca3af;padding:6px 8px;';
  const tdStyle = 'border:1px solid #d1d5db;padding:5px 8px;';

  const rowsKegiatan = data.map((k, i) => `
    <tr style="background:${i % 2 === 0 ? '#fff' : '#f9fafb'}">
      <td style="${tdStyle}text-align:center">${i + 1}</td>
      <td style="${tdStyle}">${k.kegiatan}</td>
      <td style="${tdStyle}text-align:center">${k.jenis}</td>
      <td style="${tdStyle}text-align:center">${k.pelaksanaan}</td>
      <td style="${tdStyle}white-space:nowrap">${k.periode}</td>
      <td style="${tdStyle}text-align:center">${k.pendaftar}</td>
      <td style="${tdStyle}text-align:center">${k.hadir}</td>
      <td style="${tdStyle}text-align:center">${k.belumAbsen}</td>
      <td style="${tdStyle}text-align:center">${k.menungguVerifikasi}</td>
      <td style="${tdStyle}text-align:center">${k.ditolak}</td>
    </tr>`).join('');

  const rowsSeminar = dataSeminar.map((r, i) => `
    <tr style="background:${i % 2 === 0 ? '#fff' : '#f9fafb'}">
      <td style="${tdStyle}text-align:center">${i + 1}</td>
      <td style="${tdStyle}">${r.kegiatan}</td>
      <td style="${tdStyle}text-align:center">${r.pelaksanaan}</td>
      <td style="${tdStyle}text-align:center">${r.hari}</td>
      <td style="${tdStyle}white-space:nowrap">${r.tanggal}</td>
      <td style="${tdStyle}text-align:center">${r.absensi}</td>
      <td style="${tdStyle}text-align:center">${r.sampelPeserta}</td>
      <td style="${tdStyle}text-align:center">${r.belumAbsen}</td>
      <td style="${tdStyle}text-align:center">${r.hadir}</td>
      <td style="${tdStyle}text-align:center">${r.ditolak}</td>
    </tr>`).join('');

  const seminarSection = dataSeminar.length > 0 ? `
    <p style="font-size:11pt;font-weight:bold;margin:20px 0 6px 0">Rekap Kehadiran Seminar & Online Per Hari</p>
    <table style="width:100%;border-collapse:collapse;font-size:10pt">
      <thead>
        <tr style="background:#14532d;color:white">
          <th style="${thStyle}">No</th>
          <th style="${thStyle}text-align:left">Kegiatan</th>
          <th style="${thStyle}">Pelaksanaan</th>
          <th style="${thStyle}">Hari</th>
          <th style="${thStyle}">Tanggal</th>
          <th style="${thStyle}">Absensi</th>
          <th style="${thStyle}">Sampel</th>
          <th style="${thStyle}">Belum Absen</th>
          <th style="${thStyle}">Hadir</th>
          <th style="${thStyle}">Ditolak</th>
        </tr>
      </thead>
      <tbody>${rowsSeminar}</tbody>
    </table>` : '';

  return `<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="UTF-8"/>
  <title>Laporan Rekap Kegiatan Workshop UNAND</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: 'Times New Roman', Times, serif; font-size: 11pt; color: #000; padding: 16mm 20mm; }
    @page { size: A4 landscape; margin: 12mm 18mm; }
    table { border-collapse: collapse; }
    thead { display: table-header-group; }
    tr    { page-break-inside: avoid; }
  </style>
</head>
<body>

  <!-- KOP SURAT -->
  <div style="text-align:center;border-bottom:3px double #000;padding-bottom:10px;margin-bottom:16px">
    <div style="font-size:15pt;font-weight:bold;letter-spacing:1px">UNIVERSITAS ANDALAS</div>
    <div style="font-size:12pt;font-weight:bold;margin-top:2px">UNIT PENGELOLA WORKSHOP UNIVERSITAS</div>
    <div style="font-size:10pt;color:#333;margin-top:2px">Kampus Limau Manis, Padang, Sumatera Barat 25163</div>
  </div>

  <!-- JUDUL -->
  <div style="text-align:center;margin:14px 0 12px">
    <span style="font-size:13pt;font-weight:bold;text-decoration:underline">LAPORAN REKAP KEGIATAN WORKSHOP</span>
  </div>

  <!-- META -->
  <table style="font-size:10.5pt;margin-bottom:14px">
    <tr><td style="width:120px">Periode</td><td style="width:12px">:</td><td>${periodeLabel}</td></tr>
    <tr><td>Jenis</td><td>:</td><td>${filterJenis || 'Semua jenis'}</td></tr>
    <tr><td>Tanggal cetak</td><td>:</td><td>${tanggalCetak}</td></tr>
  </table>

  <!-- STATISTIK -->
  <table style="width:100%;border-collapse:collapse;font-size:10pt;margin-bottom:16px">
    <tr>
      <td style="border:1px solid #9ca3af;padding:6px 10px;vertical-align:top"><div style="font-size:9pt;color:#555;margin-bottom:2px">Total Kegiatan</div><div style="font-size:18pt;font-weight:bold">${data.length}</div></td>
      <td style="border:1px solid #9ca3af;padding:6px 10px;vertical-align:top"><div style="font-size:9pt;color:#555;margin-bottom:2px">Pendaftar</div><div style="font-size:18pt;font-weight:bold">${totalPendaftar}</div></td>
      <td style="border:1px solid #9ca3af;padding:6px 10px;vertical-align:top"><div style="font-size:9pt;color:#555;margin-bottom:2px">Hadir</div><div style="font-size:18pt;font-weight:bold">${totalHadir}</div></td>
      <td style="border:1px solid #9ca3af;padding:6px 10px;vertical-align:top"><div style="font-size:9pt;color:#555;margin-bottom:2px">Belum Absen</div><div style="font-size:18pt;font-weight:bold">${totalBelum}</div></td>
      <td style="border:1px solid #9ca3af;padding:6px 10px;vertical-align:top"><div style="font-size:9pt;color:#555;margin-bottom:2px">Menunggu</div><div style="font-size:18pt;font-weight:bold">${totalMenunggu}</div></td>
      <td style="border:1px solid #9ca3af;padding:6px 10px;vertical-align:top"><div style="font-size:9pt;color:#555;margin-bottom:2px">Ditolak</div><div style="font-size:18pt;font-weight:bold">${totalDitolak}</div></td>
    </tr>
  </table>

  <!-- TABEL KEGIATAN -->
  <p style="font-size:11pt;font-weight:bold;margin:0 0 6px 0">Rekap Kegiatan</p>
  <table style="width:100%;border-collapse:collapse;font-size:10pt">
    <thead>
      <tr style="background:#14532d;color:white">
        <th style="${thStyle}">No</th>
        <th style="${thStyle}text-align:left">Kegiatan</th>
        <th style="${thStyle}">Jenis</th>
        <th style="${thStyle}">Pelaksanaan</th>
        <th style="${thStyle}">Periode</th>
        <th style="${thStyle}">Pendaftar</th>
        <th style="${thStyle}">Hadir</th>
        <th style="${thStyle}">Belum Absen</th>
        <th style="${thStyle}">Menunggu</th>
        <th style="${thStyle}">Ditolak</th>
      </tr>
    </thead>
    <tbody>${rowsKegiatan}</tbody>
  </table>

  ${seminarSection}

  <!-- CATATAN -->
  <p style="font-size:9.5pt;font-style:italic;color:#555;margin-top:16px">
    Catatan: Data berdasarkan rekap sistem informasi Workshop UNAND. Angka hadir mencakup catatan manual per hari untuk seminar dan kegiatan online.
  </p>

  <!-- TANDA TANGAN -->
  <div style="display:flex;justify-content:flex-end;margin-top:30px;font-size:11pt">
    <div style="text-align:center;min-width:200px">
      <div>Padang, ${now.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</div>
      <div style="margin-bottom:60px">Humas Workshop UNAND</div>
      <div style="font-weight:bold;border-top:1px solid #000;padding-top:4px">${penandatangan || '(..........................)'}</div>
    </div>
  </div>

  <!-- FOOTER -->
  <div style="border-top:1px solid #ccc;margin-top:24px;padding-top:6px;display:flex;justify-content:space-between;font-size:9pt;color:#666">
    <span>Dicetak dari Sistem Informasi Workshop UNAND · ${tanggalCetak}</span>
    <span>Workshop UNAND</span>
  </div>

  <script>
    window.onload = function() { window.print(); };
  </script>
</body>
</html>`;
}

/* ══════════════════════════════════════════
   MAIN COMPONENT
══════════════════════════════════════════ */
export default function Laporan() {
  const navigate = useNavigate();
  const currentUser = useCurrentUser();
  const [search,         setSearch]         = useUrlState('q');
  const [filterJenis,    setFilterJenis]    = useUrlState('jenis');
  const [filterKegiatan, setFilterKegiatan] = useUrlState('kegiatan');
  const [filterPeriode,  setFilterPeriode]  = useUrlState('periode');
  const { data: laporan, loading, error, reload } = useApi(() => reportsApi.workshops(), []);
  const { data: harian } = useApi(() => reportsApi.daily(), []);
  const kegiatanList = useMemo(() => laporan || [], [laporan]);
  // Rekap harian untuk kegiatan berjenis seminar
  const rekapSeminarHarian = useMemo(() => (harian || []).filter(r => r.jenis === 'Seminar'), [harian]);

  const filteredKegiatan = useMemo(() => {
    const range = getDateRange(filterPeriode);
    return kegiatanList.filter(l => {
      const q = search.toLowerCase();
      const matchSearch   = l.kegiatan.toLowerCase().includes(q) || l.jenis.toLowerCase().includes(q) || l.pelaksanaan.toLowerCase().includes(q);
      const matchJenis    = filterJenis    ? l.jenis    === filterJenis    : true;
      const matchKegiatan = filterKegiatan ? l.kegiatan === filterKegiatan : true;
      const matchPeriode  = range ? l.tanggalISO >= range.from && l.tanggalISO <= range.to : true;
      return matchSearch && matchJenis && matchKegiatan && matchPeriode;
    });
  }, [kegiatanList, search, filterJenis, filterKegiatan, filterPeriode]);
  // Paginasi tabel
  const { pageItems: pg_filteredKegiatan, pager: pager_filteredKegiatan } = usePagination(filteredKegiatan, 10);

  const filteredSeminar = useMemo(() => {
    const range = getDateRange(filterPeriode);
    return rekapSeminarHarian.filter(r =>
      range ? r.tanggalISO >= range.from && r.tanggalISO <= range.to : true
    );
  }, [rekapSeminarHarian, filterPeriode]);
  // Paginasi tabel
  const { pageItems: pg_filteredSeminar, pager: pager_filteredSeminar } = usePagination(filteredSeminar, 10, 'page2');

  const jenisOptions = useMemo(() => Array.from(new Set(kegiatanList.map(l => l.jenis))), [kegiatanList]);

  if (loading && !laporan) return <PageLoader />;
  if (error && !laporan) return <ErrorNotice error={error} onRetry={reload} />;

  const totalPendaftar = filteredKegiatan.reduce((s, k) => s + k.pendaftar, 0);
  const totalHadir     = filteredKegiatan.reduce((s, k) => s + k.hadir, 0);
  const totalBelum     = filteredKegiatan.reduce((s, k) => s + k.belumAbsen, 0);

  /* ── Export Excel ── */
  const handleExportExcel = async () => {
    const periodeMap = { 'hari-ini': 'Hari ini', '7-hari': '7 hari terakhir', '1-bulan': '1 bulan terakhir' };
    try {
      await exportExcel({
        fileName: 'Laporan_Kegiatan_UNAND',
        title: 'Laporan Rekapitulasi Kegiatan',
        subtitle: 'Hubungan Masyarakat · Sistem Informasi Workshop UNAND',
        info: [
          ['Periode', periodeMap[filterPeriode] || 'Semua periode'],
          ['Jenis', filterJenis || 'Semua jenis'],
          ...(filterKegiatan ? [['Kegiatan', filterKegiatan]] : []),
          ...(search ? [['Pencarian', `"${search}"`]] : []),
          ['Jumlah kegiatan', `${filteredKegiatan.length} kegiatan`],
        ],
        sheets: [
          {
            name: 'Rekap Kegiatan', numbered: true, totals: true,
            columns: [
              { header: 'Kegiatan', key: 'kegiatan', width: 38 },
              { header: 'Jenis', key: 'jenis' },
              { header: 'Pelaksanaan', key: 'pelaksanaan' },
              { header: 'Periode', key: 'periode', width: 26 },
              { header: 'Pendaftar', key: 'pendaftar', type: 'number' },
              { header: 'Hadir', key: 'hadir', type: 'number' },
              { header: 'Belum Absen', key: 'belumAbsen', type: 'number' },
              { header: 'Menunggu Verifikasi', key: 'menungguVerifikasi', type: 'number' },
              { header: 'Ditolak', key: 'ditolak', type: 'number' },
              { header: 'Kehadiran', key: 'persen', type: 'percent', value: k => (k.pendaftar ? (k.hadir || 0) / k.pendaftar : 0) },
            ],
            rows: filteredKegiatan,
          },
          {
            name: 'Presensi Harian Seminar', numbered: true, totals: true,
            emptyText: 'Tidak ada rekap harian seminar pada periode ini',
            columns: [
              { header: 'Kegiatan', key: 'kegiatan', width: 38 },
              { header: 'Pelaksanaan', key: 'pelaksanaan' },
              { header: 'Hari', key: 'hari' },
              { header: 'Tanggal', key: 'tanggal', width: 20 },
              { header: 'Absensi', key: 'absensi' },
              { header: 'Sampel Peserta', key: 'sampelPeserta', type: 'number' },
              { header: 'Belum Absen', key: 'belumAbsen', type: 'number' },
              { header: 'Menunggu Verifikasi', key: 'menungguVerifikasi', type: 'number' },
              { header: 'Hadir', key: 'hadir', type: 'number' },
              { header: 'Ditolak', key: 'ditolak', type: 'number' },
            ],
            rows: filteredSeminar,
          },
        ],
      });
      toast('Laporan Excel berhasil diunduh.');
    } catch (err) {
      toast(`Gagal membuat file Excel: ${err.message}`, { tone: 'error' });
    }
  };

  /* ── Export PDF – buka window baru ── */
  const handleExportPDF = () => {
    const html = buildPrintHTML({ data: filteredKegiatan, dataSeminar: filteredSeminar, filterPeriode, filterJenis, penandatangan: currentUser.nama });
    const win = window.open('', '_blank', 'width=1200,height=850');
    if (!win) { dialog.alert({ title: 'Pop-up diblokir', message: 'Izinkan pop-up browser untuk mencetak laporan.', tone: 'warning' }); return; }
    win.document.write(html);
    win.document.close();
  };

  /* ── Render ── */
  return (
    <div className="humas-list-page">

      <PageHeader
        title="Laporan Kegiatan"
        description="Rekap pendaftaran dan kehadiran kegiatan."
        actions={<>
          <button type="button" className="ui-btn" onClick={handleExportExcel}><Download size={15} /> Ekspor Excel</button>
          <button type="button" className="ui-btn ui-btn--primary" onClick={handleExportPDF}><Download size={15} /> Ekspor PDF</button>
        </>}
      />

      {/* Filter Bar */}
      <div className="filter-bar" style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 8, padding: '10px 14px', display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center', marginBottom: 12 }}>
        <div className="search-wrap" style={{ flex: 1, minWidth: 220 }}>
          <Search size={15} className="search-icon" />
          <input className="search-input" placeholder="Cari nama kegiatan atau mitra..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>

        <Select className="filter-select" style={{ minWidth: 130 }} value={filterJenis} onChange={e => setFilterJenis(e.target.value)}>
          <option value="">Semua jenis</option>
          {jenisOptions.map(j => <option key={j} value={j}>{j}</option>)}
        </Select>

        <Select className="filter-select" style={{ minWidth: 180 }} value={filterKegiatan} onChange={e => setFilterKegiatan(e.target.value)}>
          <option value="">Semua kegiatan</option>
          {kegiatanList.map(l => <option key={l.id} value={l.kegiatan}>{l.kegiatan}</option>)}
        </Select>

        <Select className="filter-select" style={{ minWidth: 160 }} value={filterPeriode} onChange={e => setFilterPeriode(e.target.value)}>
          <option value="">Semua periode</option>
          <option value="hari-ini">Hari ini</option>
          <option value="7-hari">7 hari terakhir</option>
          <option value="1-bulan">1 bulan terakhir</option>
        </Select>
      </div>


      {/* Summary Cards */}
      <div className="laporan-summary-row" style={{ marginBottom: 20 }}>
        <StatTile icon={Users} label="Pendaftar" value={totalPendaftar} />
        <StatTile icon={UserCheck} label="Hadir (tercatat)" value={totalHadir} />
        <StatTile icon={UserX} label="Belum absen / tidak hadir" value={totalBelum} />
      </div>

      {/* Tabel Kegiatan */}
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
              <tr><td colSpan={9} className="ui-empty-cell"><div className="ui-empty"><Inbox size={30} aria-hidden="true" /><div className="ui-empty-text">Tidak ada data kegiatan yang sesuai filter.</div></div></td></tr>
            ) : (
              pg_filteredKegiatan.map(k => (
                <tr key={k.id}>
                  <td>
                    <span className="table-name-bold humas-link" style={{ cursor: 'pointer' }} onClick={() => navigate(`/humas/kelola-kegiatan/${k.id}`)}>
                      {k.kegiatan}
                    </span>
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
          {pager_filteredKegiatan}
      </div>

      {/* Rekap Seminar Harian */}
      <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 8, padding: '20px 24px', marginBottom: 20 }}>
        <div style={{ marginBottom: 16 }}>
          <h3 style={{ fontSize: 15, fontWeight: 700, color: '#111827', margin: 0 }}>Rekap Kehadiran Seminar Per Hari</h3>
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
              {filteredSeminar.length === 0 ? (
                <tr><td colSpan={10} className="ui-empty-cell"><div className="ui-empty"><Inbox size={30} aria-hidden="true" /><div className="ui-empty-text">Tidak ada data seminar harian sesuai filter.</div></div></td></tr>
              ) : (
                pg_filteredSeminar.map(r => (
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
                ))
              )}
            </tbody>
          </table>
          {pager_filteredSeminar}
        </div>
      </div>

    </div>
  );
}

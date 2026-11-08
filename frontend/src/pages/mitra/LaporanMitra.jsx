import { useState } from 'react';
import {
  Search,
  FileSpreadsheet,
  FileText,
  SearchX,
  CheckCircle2,
  Users,
  UserCheck,
  UserX,
} from 'lucide-react';
import { mitraKegiatan } from './data';

const jenisOptions = ['Workshop', 'Seminar', 'Kuliah Umum'];

export default function LaporanMitra() {
  const [search, setSearch] = useState('');
  const [filterJenis, setFilterJenis] = useState('');
  const [filterKegiatan, setFilterKegiatan] = useState('');
  const [filterTanggal, setFilterTanggal] = useState('');
  const [exportToast, setExportToast] = useState('');

  const filtered = mitraKegiatan.filter(k => {
    const q = search.toLowerCase();
    const matchSearch = k.nama.toLowerCase().includes(q) || k.penyelenggara.toLowerCase().includes(q);
    const matchJenis = filterJenis ? k.jenis === filterJenis : true;
    const matchKegiatan = filterKegiatan ? k.nama === filterKegiatan : true;
    const matchTanggal = filterTanggal ? (k.isoTanggal === filterTanggal || k.tanggal.includes(filterTanggal)) : true;
    return matchSearch && matchJenis && matchKegiatan && matchTanggal;
  });

  const totalPendaftar = filtered.reduce((s, k) => s + (k.pendaftar || 0), 0);
  const totalHadir = filtered.reduce((s, k) => s + (k.hadir || 0), 0);
  const totalBelum = filtered.reduce((s, k) => s + (k.belumAbsen || 0), 0);

  const resetFilter = () => {
    setSearch('');
    setFilterJenis('');
    setFilterKegiatan('');
    setFilterTanggal('');
  };

  // ── FUNGSI EKSPOR EXCEL (CSV dengan BOM UTF-8) ──
  const handleExportExcel = () => {
    const headers = [
      'No',
      'Kegiatan',
      'Jenis Pelaksanaan',
      'Periode',
      'Pendaftar',
      'Hadir',
      'Tidak hadir',
      'Menunggu Verifikasi',
      'Ditolak'
    ];

    const rows = filtered.map((k, idx) => [
      idx + 1,
      `"${(k.nama || '').replace(/"/g, '""')}"`,
      `"${k.mode === 'online' ? 'Online' : 'Offline'}"`,
      `"${(k.tanggal || '').replace(/"/g, '""')}"`,
      k.pendaftar || 0,
      k.hadir || 0,
      k.belumAbsen || 0,
      k.menungguVerifikasi || 0,
      k.ditolak || 0
    ]);

    const csvContent = '\uFEFF' + [headers.join(','), ...rows.map(r => r.join(','))].join('\r\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    const dateStr = new Date().toISOString().slice(0, 10);
    link.setAttribute('download', `Laporan_Kegiatan_Mitra_${dateStr}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    setExportToast('Laporan Excel (.csv) berhasil diunduh.');
    setTimeout(() => setExportToast(''), 3500);
  };

  // ── FUNGSI EKSPOR PDF (Blob Printable Page Resmi UNAND) ──
  const handleExportPDF = () => {
    const printDate = new Date().toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });

    const rowsHtml = filtered.map((k, idx) => `
      <tr>
        <td style="text-align: center;">${idx + 1}</td>
        <td style="font-weight: 600;">${k.nama}</td>
        <td style="text-align: center;">${k.mode === 'online' ? 'Online' : 'Offline'}</td>
        <td style="text-align: center;">${k.tanggal}</td>
        <td style="text-align: center;">${k.pendaftar || 0}</td>
        <td style="text-align: center; color: #166534; font-weight: 600;">${k.hadir || 0}</td>
        <td style="text-align: center; color: #c2410c;">${k.belumAbsen || 0}</td>
        <td style="text-align: center; color: #b45309;">${k.menungguVerifikasi || 0}</td>
        <td style="text-align: center; color: #dc2626;">${k.ditolak || 0}</td>
      </tr>
    `).join('');

    const html = `<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Laporan_Kegiatan_Mitra_PT_Semen_Padang</title>
  <style>
    * { box-sizing: border-box; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Arial, sans-serif;
      margin: 0;
      padding: 0;
      color: #111827;
      background: #f9fafb;
    }
    .action-bar {
      position: sticky;
      top: 0;
      z-index: 999;
      background: #ffffff;
      border-bottom: 2px solid #14532d;
      padding: 14px 28px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
    }
    .action-info h2 {
      margin: 0 0 2px 0;
      font-size: 15px;
      color: #14532d;
      font-weight: 700;
    }
    .action-info p {
      margin: 0;
      font-size: 12px;
      color: #4b5563;
    }
    .btn-group {
      display: flex;
      gap: 10px;
      align-items: center;
    }
    .btn {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      padding: 9px 18px;
      border-radius: 8px;
      font-size: 13.5px;
      font-weight: 600;
      cursor: pointer;
      border: none;
      transition: all 0.15s;
    }
    .btn-save-pdf {
      background: #14532d;
      color: #ffffff;
      box-shadow: 0 2px 6px rgba(20, 83, 45, 0.25);
    }
    .btn-save-pdf:hover {
      background: #0f3d21;
    }
    .btn-close {
      background: #ffffff;
      color: #374151;
      border: 1px solid #d1d5db;
    }
    .btn-close:hover {
      background: #f3f4f6;
    }
    .page-container {
      max-width: 1000px;
      margin: 24px auto;
      background: #ffffff;
      padding: 36px 40px;
      border: 1px solid #e5e7eb;
      border-radius: 8px;
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05);
    }
    .header {
      border-bottom: 2.5px solid #14532d;
      padding-bottom: 14px;
      margin-bottom: 22px;
      display: flex;
      justify-content: space-between;
      align-items: flex-end;
    }
    .header h1 {
      font-size: 18px;
      color: #14532d;
      margin: 0 0 5px 0;
      letter-spacing: -0.3px;
    }
    .header p {
      font-size: 12.5px;
      color: #4b5563;
      margin: 0;
    }
    .meta {
      font-size: 12px;
      text-align: right;
      color: #6b7280;
    }
    .stats-row {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 14px;
      margin-bottom: 24px;
    }
    .stat-card {
      border: 1px solid #e5e7eb;
      border-radius: 8px;
      padding: 12px 16px;
      background: #f9fafb;
    }
    .stat-label {
      font-size: 10.5px;
      text-transform: uppercase;
      color: #6b7280;
      font-weight: 700;
      letter-spacing: 0.5px;
    }
    .stat-val {
      font-size: 22px;
      font-weight: 800;
      color: #111827;
      margin-top: 4px;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      font-size: 12px;
      margin-top: 10px;
    }
    th {
      background: #14532d;
      color: #ffffff;
      padding: 10px 8px;
      text-align: left;
      font-size: 11px;
      text-transform: uppercase;
      letter-spacing: 0.3px;
    }
    td {
      padding: 10px 8px;
      border-bottom: 1px solid #e5e7eb;
    }
    tr:nth-child(even) td {
      background: #f9fafb;
    }
    .footer {
      margin-top: 48px;
      display: flex;
      justify-content: space-between;
      font-size: 12px;
      page-break-inside: avoid;
    }
    .ttd-box {
      text-align: center;
      width: 220px;
    }
    .ttd-line {
      margin-top: 64px;
      border-bottom: 1px solid #111827;
    }

    @media print {
      .no-print {
        display: none !important;
      }
      body {
        background: #ffffff !important;
        padding: 0 !important;
      }
      .page-container {
        max-width: 100% !important;
        margin: 0 !important;
        padding: 0 !important;
        border: none !important;
        box-shadow: none !important;
      }
      @page {
        size: landscape;
        margin: 12mm;
      }
    }
  </style>
</head>
<body>
  <div class="action-bar no-print">
    <div class="action-info">
      <h2>Pratinjau PDF Laporan Kegiatan Mitra</h2>
      <p>Klik tombol di samping untuk menyimpan langsung sebagai PDF atau mencetak dokumen.</p>
    </div>
    <div class="btn-group">
      <button class="btn btn-save-pdf" onclick="window.print()">
        🖨️ Cetak / Simpan sebagai PDF
      </button>
      <button class="btn btn-close" onclick="window.close()">
        Tutup
      </button>
    </div>
  </div>

  <div class="page-container">
    <div class="header">
      <div>
        <h1>UNIVERSITAS ANDALAS — LAPORAN REKAPITULASI MITRA</h1>
        <p>Mitra Kerja Sama Resmi: <strong>PT Semen Padang</strong></p>
      </div>
      <div class="meta">
        Tanggal Dokumen: ${printDate}
      </div>
    </div>

    <div class="stats-row">
      <div class="stat-card">
        <div class="stat-label">Total Kegiatan</div>
        <div class="stat-val">${filtered.length}</div>
      </div>
      <div class="stat-card">
        <div class="stat-label">Total Pendaftar</div>
        <div class="stat-val">${totalPendaftar}</div>
      </div>
      <div class="stat-card">
        <div class="stat-label">Peserta Hadir</div>
        <div class="stat-val" style="color: #166534;">${totalHadir}</div>
      </div>
      <div class="stat-card">
        <div class="stat-label">Tidak Hadir</div>
        <div class="stat-val" style="color: #c2410c;">${totalBelum}</div>
      </div>
    </div>

    <table>
      <thead>
        <tr>
          <th style="width: 25px; text-align: center;">No</th>
          <th>Kegiatan</th>
          <th style="text-align: center;">Pelaksanaan</th>
          <th style="text-align: center;">Periode</th>
          <th style="text-align: center;">Pendaftar</th>
          <th style="text-align: center;">Hadir</th>
          <th style="text-align: center;">Tidak hadir</th>
          <th style="text-align: center;">Menunggu</th>
          <th style="text-align: center;">Ditolak</th>
        </tr>
      </thead>
      <tbody>
        ${rowsHtml}
      </tbody>
    </table>

    <div class="footer">
      <div class="ttd-box">
        <div>Mengetahui,</div>
        <div style="font-weight: 600; margin-top: 4px;">Pimpinan PT Semen Padang</div>
        <div class="ttd-line"></div>
        <div style="margin-top: 4px;">Ahmad Rizal</div>
      </div>
      <div class="ttd-box">
        <div>Padang, ${printDate}</div>
        <div style="font-weight: 600; margin-top: 4px;">Sekretariat Kerja Sama UNAND</div>
        <div class="ttd-line"></div>
        <div style="margin-top: 4px;">Humas & Protokoler UNAND</div>
      </div>
    </div>
  </div>

  <script>
    window.addEventListener('load', function() {
      setTimeout(function() {
        window.focus();
        window.print();
      }, 350);
    });
  </script>
</body>
</html>`;

    const blob = new Blob([html], { type: 'text/html;charset=utf-8' });
    const blobUrl = URL.createObjectURL(blob);
    const printWindow = window.open(blobUrl, '_blank');

    if (!printWindow) {
      alert('Harap izinkan pop-up browser untuk mencetak atau menyimpan PDF laporan.');
      return;
    }

    setExportToast('Membuka pratinjau cetak / simpan PDF laporan.');
    setTimeout(() => setExportToast(''), 3500);
  };

  return (
    <div className="mitra-stack">
      {/* Header Halaman */}
      <div className="mitra-list-header">
        <div className="mitra-intro">
          <h2>Laporan Kegiatan</h2>
          <p>Rekapitulasi partisipasi dan kehadiran seluruh kegiatan kerja sama mitra PT Semen Padang.</p>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <button
            type="button"
            className="mitra-export-btn mitra-export-excel"
            onClick={handleExportExcel}
            title="Unduh rekapitulasi laporan dalam format Excel (.csv)"
          >
            <FileSpreadsheet size={15} /> Ekspor Excel
          </button>
          <button
            type="button"
            className="mitra-export-btn mitra-export-pdf"
            onClick={handleExportPDF}
            title="Cetak atau simpan laporan ke PDF resmi"
          >
            <FileText size={15} /> Ekspor PDF
          </button>
        </div>
      </div>

      {exportToast && (
        <div
          style={{
            background: 'var(--mitra-tint)',
            border: '1px solid #b9cec0',
            color: 'var(--mitra-green)',
            padding: '10px 16px',
            borderRadius: 8,
            fontSize: 13,
            fontWeight: 600,
            display: 'flex',
            alignItems: 'center',
            gap: 8,
          }}
        >
          <CheckCircle2 size={16} /> {exportToast}
        </div>
      )}

      {/* Ringkasan Kartu Statistik */}
      <div className="mitra-stats-grid">
        <div className="mitra-stat-box">
          <div className="mitra-stat-top">
            <p className="mitra-stat-title">Total Pendaftar</p>
            <div className="mitra-stat-icon" style={{ background: '#EBF5EE', color: '#14532d' }}>
              <Users size={18} />
            </div>
          </div>
          <p className="mitra-stat-val">{totalPendaftar}</p>
        </div>

        <div className="mitra-stat-box">
          <div className="mitra-stat-top">
            <p className="mitra-stat-title">Peserta Hadir</p>
            <div className="mitra-stat-icon" style={{ background: '#DCFCE7', color: '#15803d' }}>
              <UserCheck size={18} />
            </div>
          </div>
          <p className="mitra-stat-val">{totalHadir}</p>
        </div>

        <div className="mitra-stat-box">
          <div className="mitra-stat-top">
            <p className="mitra-stat-title">Tidak Hadir</p>
            <div className="mitra-stat-icon" style={{ background: '#FFEDD5', color: '#C2410C' }}>
              <UserX size={18} />
            </div>
          </div>
          <p className="mitra-stat-val" style={{ color: '#c2410c' }}>{totalBelum}</p>
        </div>
      </div>

      {/* ── FILTER BAR LENGKAP: Search, Semua Jenis, Semua Kegiatan, Tanggal ── */}
      <div className="mitra-filterbar">
        {/* Tempat Mencari */}
        <label className="mitra-searchbox">
          <Search size={18} />
          <input
            type="search"
            placeholder="Cari nama kegiatan..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </label>

        {/* Filter Semua Jenis */}
        <select value={filterJenis} onChange={e => setFilterJenis(e.target.value)}>
          <option value="">Semua jenis</option>
          {jenisOptions.map(j => (
            <option key={j} value={j}>{j}</option>
          ))}
        </select>

        {/* Filter Semua Kegiatan */}
        <select
          value={filterKegiatan}
          onChange={e => setFilterKegiatan(e.target.value)}
          style={{ maxWidth: 220 }}
        >
          <option value="">Semua kegiatan</option>
          {mitraKegiatan.map(k => (
            <option key={k.id} value={k.nama}>{k.nama}</option>
          ))}
        </select>

        {/* Filter Tanggal */}
        <input
          type="date"
          className="form-input"
          value={filterTanggal}
          onChange={e => setFilterTanggal(e.target.value)}
          title="Filter Tanggal Pelaksanaan"
          style={{ height: 42, width: 150, padding: '0 10px', fontSize: 13 }}
        />

        {(search || filterJenis || filterKegiatan || filterTanggal) && (
          <button
            type="button"
            className="mitra-btn mitra-btn--secondary"
            onClick={resetFilter}
            style={{ minHeight: 42, padding: '0 14px' }}
          >
            Reset
          </button>
        )}
      </div>

      {/* ── DATA TABLE LAPORAN (URUTAN KOLOM SESUAI PERMINTAAN) ── */}
      <div className="mitra-table-card">
        <table className="mitra-table">
          <thead>
            <tr>
              <th>Kegiatan</th>
              <th>Jenis Pelaksanaan</th>
              <th>Periode</th>
              <th style={{ textAlign: 'center' }}>Pendaftar</th>
              <th style={{ textAlign: 'center' }}>Hadir</th>
              <th style={{ textAlign: 'center' }}>Tidak hadir</th>
              <th style={{ textAlign: 'center' }}>Menunggu Verifikasi</th>
              <th style={{ textAlign: 'center' }}>Ditolak</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={8}>
                  <div className="mitra-empty">
                    <SearchX size={36} />
                    <p>Tidak ada data laporan kegiatan yang cocok dengan filter.</p>
                  </div>
                </td>
              </tr>
            ) : (
              filtered.map(k => (
                <tr key={k.id}>
                  {/* 1. Kegiatan */}
                  <td>
                    <span className="mitra-activity-title">{k.nama}</span>
                  </td>

                  {/* 2. Jenis Pelaksanaan (hanya offline atau online) */}
                  <td>
                    <span className={`mitra-mode-badge mitra-mode-badge--${k.mode || 'offline'}`}>
                      <i></i> {k.mode === 'online' ? 'Online' : 'Offline'}
                    </span>
                  </td>

                  {/* 3. Periode (sama artinya dengan tanggal) */}
                  <td style={{ whiteSpace: 'nowrap', fontSize: '13px' }}>
                    {k.tanggal}
                  </td>

                  {/* 4. Pendaftar */}
                  <td style={{ textAlign: 'center', fontWeight: 600 }}>
                    {k.pendaftar}
                  </td>

                  {/* 5. Hadir */}
                  <td style={{ textAlign: 'center', fontWeight: 700, color: '#15803d' }}>
                    {k.hadir ?? 0}
                  </td>

                  {/* 6. Belum Absen / Tidak hadir */}
                  <td style={{ textAlign: 'center', fontWeight: 600, color: k.belumAbsen > 0 ? '#c2410c' : 'var(--mitra-muted)' }}>
                    {k.belumAbsen ?? 0}
                  </td>

                  {/* 7. Menunggu Verifikasi */}
                  <td style={{ textAlign: 'center', fontWeight: 600, color: k.menungguVerifikasi > 0 ? '#b45309' : 'var(--mitra-muted)' }}>
                    {k.menungguVerifikasi ?? 0}
                  </td>

                  {/* 8. Ditolak */}
                  <td style={{ textAlign: 'center', fontWeight: 600, color: k.ditolak > 0 ? '#dc2626' : 'var(--mitra-muted)' }}>
                    {k.ditolak ?? 0}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

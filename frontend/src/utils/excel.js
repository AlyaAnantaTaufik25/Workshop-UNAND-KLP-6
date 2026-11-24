/**
 * Ekspor laporan ke Excel (.xlsx) yang rapi: kop laporan, tabel bergaris, header berwarna,
 * baris zebra, total otomatis (rumus SUM), kolom selebar isinya, header dibekukan + filter,
 * dan siap cetak (landscape, muat satu lebar halaman, header berulang).
 *
 * ExcelJS dimuat saat tombol ekspor ditekan agar tidak membebani bundle awal.
 *
 * exportExcel({
 *   fileName: 'Laporan_Kegiatan',            // tanpa ekstensi; tanggal ditambahkan otomatis
 *   title: 'Laporan Kegiatan Workshop',
 *   subtitle: 'Hubungan Masyarakat',          // opsional
 *   info: [['Periode', 'Semua periode']],     // opsional, baris keterangan di bawah judul
 *   sheets: [{
 *     name: 'Rekap Kegiatan',
 *     numbered: true,                         // tambah kolom "No"
 *     columns: [{ header: 'Kegiatan', key: 'nama', width?: 40, type?: 'text'|'number'|'percent', align? }],
 *     rows: [{ nama: '...' }],
 *     totals: true,                           // baris total untuk kolom number
 *     emptyText: 'Tidak ada data',
 *   }],
 * })
 */

const C = {
  brand: 'FF14532D',
  brandSoft: 'FFE8F2EC',
  zebra: 'FFF5FAF7',
  border: 'FFD1D9D4',
  borderStrong: 'FF8FB39C',
  text: 'FF1F2937',
  muted: 'FF6B7280',
  white: 'FFFFFFFF',
};
const FONT = 'Calibri';
const thin = color => ({ style: 'thin', color: { argb: color } });

const colLetter = n => {
  let s = '';
  for (let x = n; x > 0; x = Math.floor((x - 1) / 26)) s = String.fromCharCode(65 + ((x - 1) % 26)) + s;
  return s;
};

const safeSheetName = (name, used) => {
  let base = String(name || 'Sheet').replace(/[\\/?*[\]:]/g, ' ').slice(0, 31).trim() || 'Sheet';
  let n = base, i = 2;
  while (used.has(n.toLowerCase())) n = `${base.slice(0, 28)} ${i++}`;
  used.add(n.toLowerCase());
  return n;
};

export const safeFileName = s => String(s || '').normalize('NFKD').replace(/[^\w\- ]+/g, '').trim().replace(/\s+/g, '_').slice(0, 80) || 'Laporan';

function cellValue(col, raw) {
  if (raw === null || raw === undefined || raw === '') return col.type === 'number' ? 0 : '-';
  if (col.type === 'number') { const n = Number(raw); return Number.isFinite(n) ? n : raw; }
  if (col.type === 'percent') { const n = Number(raw); return Number.isFinite(n) ? (n > 1 ? n / 100 : n) : raw; }
  return String(raw);
}

function buildSheet(wb, sheet, meta, usedNames) {
  const columns = [
    ...(sheet.numbered ? [{ header: 'No', key: '__no', type: 'index', width: 6 }] : []),
    ...sheet.columns,
  ];
  const ncol = columns.length;
  const last = colLetter(ncol);
  const ws = wb.addWorksheet(safeSheetName(sheet.name, usedNames), {
    views: [{ showGridLines: false }],
    pageSetup: {
      paperSize: 9, orientation: ncol > 6 ? 'landscape' : 'portrait',
      fitToPage: true, fitToWidth: 1, fitToHeight: 0,
      margins: { left: 0.4, right: 0.4, top: 0.6, bottom: 0.6, header: 0.3, footer: 0.3 },
      horizontalCentered: true,
    },
    headerFooter: { oddFooter: `&L&8${meta.title}&R&8Halaman &P dari &N` },
  });

  // ── Kop laporan
  let r = 1;
  const merged = (text, font, height) => {
    ws.mergeCells(`A${r}:${last}${r}`);
    const cell = ws.getCell(`A${r}`);
    cell.value = text;
    cell.font = { name: FONT, ...font };
    cell.alignment = { vertical: 'middle', horizontal: 'left' };
    if (height) ws.getRow(r).height = height;
    r += 1;
  };
  merged('UNIVERSITAS ANDALAS', { size: 10, bold: true, color: { argb: C.brand } }, 16);
  merged(meta.title, { size: 15, bold: true, color: { argb: C.text } }, 24);
  if (meta.subtitle) merged(meta.subtitle, { size: 10, color: { argb: C.muted } });
  const info = [...(meta.info || []), ['Dicetak', meta.printedAt]];
  info.forEach(([label, value]) => {
    const a = ws.getCell(`A${r}`);
    a.value = label;
    a.font = { name: FONT, size: 10, color: { argb: C.muted } };
    if (ncol > 2) ws.mergeCells(`B${r}:${last}${r}`);
    const b = ws.getCell(`B${r}`);
    b.value = `: ${value}`;
    b.font = { name: FONT, size: 10, color: { argb: C.text } };
    r += 1;
  });
  r += 1; // baris kosong

  // ── Header tabel
  const headerRow = r;
  const hr = ws.getRow(headerRow);
  columns.forEach((col, i) => {
    const cell = hr.getCell(i + 1);
    cell.value = col.header;
    cell.font = { name: FONT, size: 10.5, bold: true, color: { argb: C.white } };
    cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: C.brand } };
    cell.alignment = { vertical: 'middle', horizontal: col.type === 'number' || col.type === 'percent' || col.type === 'index' ? 'center' : 'left', wrapText: true, indent: col.type === 'text' || !col.type ? 1 : 0 };
    cell.border = { top: thin(C.brand), bottom: thin(C.brand), left: thin(C.brand), right: thin(C.brand) };
  });
  hr.height = 30;
  r += 1;

  // ── Isi
  const firstData = r;
  const rows = sheet.rows || [];
  if (!rows.length) {
    ws.mergeCells(`A${r}:${last}${r}`);
    const cell = ws.getCell(`A${r}`);
    cell.value = sheet.emptyText || 'Tidak ada data untuk filter yang dipilih';
    cell.font = { name: FONT, size: 10, italic: true, color: { argb: C.muted } };
    cell.alignment = { horizontal: 'center', vertical: 'middle' };
    cell.border = { top: thin(C.border), bottom: thin(C.border), left: thin(C.border), right: thin(C.border) };
    ws.getRow(r).height = 22;
    r += 1;
  }
  rows.forEach((row, idx) => {
    const xr = ws.getRow(r);
    columns.forEach((col, i) => {
      const cell = xr.getCell(i + 1);
      cell.value = col.type === 'index' ? idx + 1 : cellValue(col, typeof col.value === 'function' ? col.value(row) : row[col.key]);
      const numeric = col.type === 'number' || col.type === 'percent' || col.type === 'index';
      cell.font = { name: FONT, size: 10, color: { argb: C.text }, ...(col.bold ? { bold: true } : {}) };
      cell.alignment = { vertical: 'middle', horizontal: col.align || (numeric ? 'center' : 'left'), wrapText: !numeric, indent: numeric ? 0 : 1 };
      if (col.type === 'number') cell.numFmt = '#,##0';
      if (col.type === 'percent') cell.numFmt = '0.0%';
      cell.border = { top: thin(C.border), bottom: thin(C.border), left: thin(C.border), right: thin(C.border) };
      if (idx % 2 === 1) cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: C.zebra } };
    });
    xr.height = 20;
    r += 1;
  });
  const lastData = r - 1;

  // ── Total (rumus SUM agar tetap benar bila data diedit di Excel)
  if (sheet.totals && rows.length) {
    const tr = ws.getRow(r);
    const labelSpan = Math.max(1, columns.findIndex(c => c.type === 'number' || c.type === 'percent'));
    if (labelSpan > 1) ws.mergeCells(`A${r}:${colLetter(labelSpan)}${r}`);
    columns.forEach((col, i) => {
      const cell = tr.getCell(i + 1);
      if (i === 0) cell.value = 'TOTAL';
      if (col.type === 'number') {
        const L = colLetter(i + 1);
        const result = rows.reduce((s, row) => s + (Number(typeof col.value === 'function' ? col.value(row) : row[col.key]) || 0), 0);
        cell.value = { formula: `SUM(${L}${firstData}:${L}${lastData})`, result };
        cell.numFmt = '#,##0';
      }
      cell.font = { name: FONT, size: 10.5, bold: true, color: { argb: C.brand } };
      cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: C.brandSoft } };
      cell.alignment = { vertical: 'middle', horizontal: i === 0 ? 'left' : 'center', indent: i === 0 ? 1 : 0 };
      cell.border = { top: { style: 'medium', color: { argb: C.borderStrong } }, bottom: thin(C.borderStrong), left: thin(C.border), right: thin(C.border) };
    });
    tr.height = 22;
  }

  // ── Lebar kolom: pakai width eksplisit, atau sesuaikan dengan isi (dibatasi)
  columns.forEach((col, i) => {
    if (col.width) { ws.getColumn(i + 1).width = col.width; return; }
    const longest = rows.reduce((m, row) => {
      const v = col.type === 'index' ? String(rows.length) : String(typeof col.value === 'function' ? col.value(row) : row[col.key] ?? '');
      return Math.max(m, ...v.split('\n').map(x => x.length));
    }, String(col.header).length);
    const isNum = col.type === 'number' || col.type === 'percent';
    ws.getColumn(i + 1).width = Math.min(isNum ? 16 : 48, Math.max(isNum ? 11 : 12, longest + 3));
  });
  // Kolom A juga menampung label kop: jangan terlalu sempit
  if ((ws.getColumn(1).width || 0) < 12 && info.length) ws.getColumn(1).width = 12;

  ws.views = [{ state: 'frozen', ySplit: headerRow, showGridLines: false }];
  if (rows.length) ws.autoFilter = { from: { row: headerRow, column: 1 }, to: { row: lastData, column: ncol } };
  ws.pageSetup.printTitlesRow = `${headerRow}:${headerRow}`;
}

export async function exportExcel({ fileName, title, subtitle, info, sheets }) {
  const { default: ExcelJS } = await import('exceljs');
  const wb = new ExcelJS.Workbook();
  wb.creator = 'Sistem Informasi Workshop UNAND';
  wb.created = new Date();
  const now = new Date();
  const printedAt = `${now.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })} pukul ${now.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })} WIB`;
  const used = new Set();
  sheets.forEach(sheet => buildSheet(wb, sheet, { title, subtitle, info, printedAt }, used));

  const buffer = await wb.xlsx.writeBuffer();
  const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${safeFileName(fileName)}_${now.toISOString().slice(0, 10)}.xlsx`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

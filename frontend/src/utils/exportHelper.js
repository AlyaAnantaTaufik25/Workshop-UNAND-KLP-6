// Utility function untuk mengunduh rekap presensi ke format CSV/Excel

export function downloadPresensiCSV(kegiatanNama, dataPeserta) {
  const headers = ['No', 'Nama Peserta', 'Kegiatan', 'Waktu Presensi', 'Status Kehadiran'];
  const rows = dataPeserta.map((p, idx) => [
    idx + 1,
    `"${p.namaPeserta || p.nama}"`,
    `"${p.kegiatan || kegiatanNama}"`,
    `"${p.waktuPresensi || p.waktu || '-'}"`,
    `"${(p.statusKehadiran || p.status) === 'hadir-valid' || (p.statusKehadiran || p.status) === 'Hadir valid' ? 'Hadir valid' : 'Belum hadir'}"`
  ]);

  const csvContent = 'data:text/csv;charset=utf-8,' + 
    [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
  
  const encodedUri = encodeURI(csvContent);
  const link = document.createElement('a');
  link.setAttribute('href', encodedUri);
  const cleanName = kegiatanNama ? kegiatanNama.replace(/[^a-zA-Z0-9]/g, '_') : 'Semua_Kegiatan';
  link.setAttribute('download', `Rekap_Presensi_${cleanName}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}


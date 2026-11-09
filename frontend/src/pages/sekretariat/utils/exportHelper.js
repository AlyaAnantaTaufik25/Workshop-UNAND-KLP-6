// Utility function untuk mengunduh rekap peserta & presensi ke format CSV/Excel

export function downloadPesertaCSV(kegiatanNama, dataPeserta) {
  const headers = ['No', 'Nama Peserta', 'Jenis Peserta', 'Kegiatan', 'Status Pendaftaran', 'Status Kehadiran'];
  const rows = dataPeserta.map((p, idx) => {
    const isHadir = (p.statusKehadiran || p.status) === 'Hadir' || (p.statusKehadiran || p.status) === 'hadir-valid' || (p.statusKehadiran || p.status) === 'Hadir valid';
    return [
      idx + 1,
      `"${p.namaPeserta || p.nama}"`,
      `"${p.jenis || 'Mahasiswa'}"`,
      `"${p.kegiatan || kegiatanNama}"`,
      `"${p.statusPendaftaran || 'Terdaftar'}"`,
      `"${isHadir ? 'Hadir' : 'Belum hadir'}"`
    ];
  });

  const csvContent = 'data:text/csv;charset=utf-8,' + 
    [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
  
  const encodedUri = encodeURI(csvContent);
  const link = document.createElement('a');
  link.setAttribute('href', encodedUri);
  const cleanName = kegiatanNama ? kegiatanNama.replace(/[^a-zA-Z0-9]/g, '_') : 'Semua_Kegiatan';
  link.setAttribute('download', `Daftar_Peserta_${cleanName}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

export function downloadPresensiCSV(kegiatanNama, dataPeserta) {
  const headers = ['No', 'Nama Peserta', 'Kegiatan', 'Waktu Presensi', 'Status Kehadiran'];
  const rows = dataPeserta.map((p, idx) => {
    const isHadir = (p.statusKehadiran || p.status) === 'Hadir' || (p.statusKehadiran || p.status) === 'hadir-valid' || (p.statusKehadiran || p.status) === 'Hadir valid';
    return [
      idx + 1,
      `"${p.namaPeserta || p.nama}"`,
      `"${p.kegiatan || kegiatanNama}"`,
      `"${p.waktuPresensi || p.waktu || '-'}"`,
      `"${isHadir ? 'Hadir' : 'Belum hadir'}"`
    ];
  });

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

// Unduh rekap peserta & presensi Sekretariat Rektor sebagai Excel (.xlsx) yang rapi
import { exportExcel } from '../../../utils/excel';

const STATUS_LABEL = {
  'hadir-valid': 'Hadir', hadir: 'Hadir', 'Hadir valid': 'Hadir',
  'menunggu-verifikasi': 'Menunggu verifikasi',
  ditolak: 'Ditolak',
  'tidak-hadir': 'Tidak hadir',
  'belum-hadir': 'Belum hadir',
};
const statusLabel = p => {
  const s = p.statusKehadiran || p.status || '';
  return STATUS_LABEL[s] || s || 'Belum hadir';
};
const isSemua = nama => !nama || /semua/i.test(nama);

export function downloadPesertaCSV(kegiatanNama, dataPeserta) {
  const semua = isSemua(kegiatanNama);
  return exportExcel({
    fileName: `Daftar_Peserta_${semua ? 'Semua_Kegiatan' : kegiatanNama}`,
    title: 'Daftar Peserta Kegiatan',
    subtitle: 'Sekretariat Rektor · Sistem Informasi Workshop UNAND',
    info: [['Kegiatan', semua ? 'Semua kegiatan' : kegiatanNama], ['Jumlah peserta', `${dataPeserta.length} orang`]],
    sheets: [{
      name: 'Peserta',
      numbered: true,
      columns: [
        { header: 'Nama Peserta', key: 'nama', value: p => p.namaPeserta || p.nama },
        { header: 'Jenis Peserta', key: 'jenis', value: p => p.jenis || '-' },
        ...(semua ? [{ header: 'Kegiatan', key: 'kegiatan', value: p => p.kegiatan || '-' }] : []),
        { header: 'Status Pendaftaran', key: 'statusPendaftaran', value: p => p.statusPendaftaran || 'Terdaftar' },
        { header: 'Status Kehadiran', key: 'status', value: statusLabel },
      ],
      rows: dataPeserta,
    }],
  });
}

export function downloadPresensiCSV(kegiatanNama, dataPeserta) {
  const semua = isSemua(kegiatanNama);
  const hadir = dataPeserta.filter(p => statusLabel(p) === 'Hadir').length;
  return exportExcel({
    fileName: `Rekap_Presensi_${semua ? 'Semua_Kegiatan' : kegiatanNama}`,
    title: 'Rekap Presensi Kegiatan',
    subtitle: 'Sekretariat Rektor · Sistem Informasi Workshop UNAND',
    info: [
      ['Kegiatan', semua ? 'Semua kegiatan' : kegiatanNama],
      ['Kehadiran', `${hadir} dari ${dataPeserta.length} peserta hadir`],
    ],
    sheets: [{
      name: 'Presensi',
      numbered: true,
      columns: [
        { header: 'Nama Peserta', key: 'nama', value: p => p.namaPeserta || p.nama },
        ...(semua ? [{ header: 'Kegiatan', key: 'kegiatan', value: p => p.kegiatan || '-' }] : []),
        { header: 'Waktu Presensi', key: 'waktu', value: p => p.waktuPresensi || p.waktu || '-' },
        { header: 'Status Kehadiran', key: 'status', value: statusLabel },
      ],
      rows: dataPeserta,
    }],
  });
}

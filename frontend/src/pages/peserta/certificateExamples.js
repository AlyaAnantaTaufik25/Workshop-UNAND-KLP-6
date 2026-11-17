const events = [
  ['mitra-004', 'Manajemen Proyek Kolaboratif', 'PT Semen Padang', 'mitra', 'DEMO/Mitra/4/2026'],
  ['unand-1004', 'Workshop Penulisan Artikel Ilmiah UNAND', 'UNAND', 'unand', 'UNAND/SERT/1004/2026'],
  ['mitra-005', 'Workshop Desain Grafis', 'PT Semen Padang', 'mitra', 'DEMO/Mitra/5/2026'],
  ['unand-1005', 'Workshop Metodologi Penelitian', 'UNAND', 'unand', 'UNAND/SERT/1005/2026'],
  ['mitra-006', 'Seminar Teknologi Informasi', 'PT Semen Padang', 'mitra', 'DEMO/Mitra/6/2026'],
];

export const certificateWorkshops = events.map(([id, title, issuer]) => ({
  id: `sertifikat-${id}`, title, completed: true, mode: 'offline', theme: 'Pengembangan Diri',
  date: '15 April 2026', isoDate: '2026-04-15', time: '09.00 - 12.00 WIB',
  place: 'Convention Hall UNAND', shortPlace: 'Convention Hall UNAND',
  description: `Kegiatan pengembangan kompetensi bersama ${issuer}.`,
  about: 'Kegiatan telah selesai. Sertifikat peserta diterbitkan setelah kehadiran divalidasi.',
  target: 'Mahasiswa dan peserta umum.', speaker: 'Tim Pemateri', speakerRole: 'Pemateri kegiatan', partner: issuer,
}));

export const certificateRegistrations = certificateWorkshops.map(workshop => ({
  workshopId: workshop.id, status: 'completed',
  attendance: { status: 'present', method: 'qr-location', submittedAt: '2026-04-15T09:05:00+07:00' },
}));

export const certificateRecords = events.map(([id, , issuer, issuerType, number]) => ({
  id, workshopId: `sertifikat-${id}`, number, issuer, issuerType,
  issued: '18 April 2026', recipient: id === 'unand-1005' ? 'Nadia Amela' : 'Nadia Amelia',
  degree: '', additionalInfo: '', kind: id === 'mitra-006' ? 'Seminar' : 'Workshop',
}));

const request = (id, certificateId, status, field, label, oldValue, newValue, date, extra = {}) => ({
  id, certificateId, status, createdAt: `${date}T10:15:00+07:00`, updatedAt: `${date}T11:30:00+07:00`,
  changes: [{ field, label, oldValue, newValue }], reason: 'Mohon menyesuaikan data pada sertifikat dengan identitas peserta.',
  attachment: null, notificationRead: false,
  events: [{ status: 'menunggu', at: `${date}T10:15:00+07:00`, note: 'Pengajuan diterima oleh penerbit.' },
    ...(status !== 'menunggu' ? [{ status, at: `${date}T11:30:00+07:00`, note: 'Status diperbarui oleh penerbit.' }] : [])],
  ...extra,
});

// Issuer responses are example records; participants cannot approve their own requests.
export const initialCertificateCorrections = [
  request('PB-2026-1004', 'unand-1004', 'diproses', 'recipient', 'Nama peserta', 'Nadia Amelia', 'Nadia Amelia Putri', '2026-05-17', { issuerNote: 'Penerbit sedang memeriksa kesesuaian nama dengan data peserta.' }),
  request('PB-2026-1005', 'mitra-005', 'menunggu', 'activity', 'Informasi kegiatan', 'Workshop Desain Grafis', 'Workshop Desain Grafis dan Komunikasi Visual', '2026-05-17'),
  request('PB-2026-1006', 'unand-1005', 'selesai', 'recipient', 'Nama peserta', 'Nadia Amela', 'Nadia Amelia', '2026-05-16', { issuerNote: 'Ejaan nama telah diperbaiki sesuai daftar peserta. Dokumen pengganti tersedia.', replacementNumber: 'UNAND/SERT/1005/2026-R1', replacementIssued: '16 Mei 2026' }),
  request('PB-2026-1007', 'mitra-006', 'ditolak', 'degree', 'Gelar peserta', '', 'S.Kom.', '2026-05-15', { issuerNote: 'Dokumen pendukung gelar belum tersedia. Ajukan kembali dengan bukti yang sesuai.' }),
];

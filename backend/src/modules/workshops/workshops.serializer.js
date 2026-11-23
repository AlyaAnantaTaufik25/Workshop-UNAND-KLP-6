/**
 * Serializer kegiatan workshop.
 * Menghasilkan satu objek "superset" berisi nama field yang dipakai
 * seluruh portal frontend (humas, sekretariat, rektor, mitra, peserta).
 */
const {
  formatRentang, formatTanggal, formatWaktuPresensi, hhmm, initials, toISODate, toISOStringWIB,
} = require('../../utils/format.util');

const REG_STATE = { 'belum-dibuka': 'not-open', dibuka: 'open', 'segera-ditutup': 'open', ditutup: 'closed' };
const ATT_STATE = { 'belum-dibuka': 'not-open', dibuka: 'open', ditutup: 'closed' };
const SERT_LABEL = { 'menunggu-mitra': 'Menunggu Mitra', 'menunggu-rektor': 'Menunggu Rektor', diterbitkan: 'Diterbitkan' };

function locationLabel(row, sep = ' · ') {
  if (row.mode === 'online') return 'Online';
  if (row.gedung) return `${row.gedung}${sep}${row.ruangan}`;
  return row.tempat || '-';
}

function serializeWorkshop(row) {
  const n = (v) => Number(v || 0);
  const pendaftar = n(row.pendaftar);
  const hadir = n(row.hadir);
  const pending = n(row.pending);
  const ditolak = n(row.ditolak);
  const waiting = n(row.waiting);
  const kuota = row.kuota === null || row.kuota === undefined ? null : Number(row.kuota);
  const remaining = kuota === null ? 9999 : Math.max(0, kuota - pendaftar);
  const waitingListEnabled = !!row.waiting_list;
  const mulai = toISODate(row.tanggal_mulai);
  const selesai = toISODate(row.tanggal_selesai);
  const tanggal = formatRentang(mulai, selesai);
  const waktuMulai = hhmm(row.waktu_mulai);
  const waktuSelesai = hhmm(row.waktu_selesai);
  const lokasi = locationLabel(row);
  const fullPlace = row.mode === 'online'
    ? (row.tempat || 'Online melalui Zoom Meeting')
    : row.gedung ? `${row.ruangan}, ${row.gedung}${row.lokasi_alamat ? `, ${row.lokasi_alamat}` : ''}` : (row.tempat || '-');
  const penyelenggara = row.partner_nama || row.penyelenggara;
  const pemateriList = (row.pemateri || '').split(/\s*;\s*/).filter(Boolean);
  const quotaText = kuota === null
    ? 'Kuota tidak terbatas'
    : remaining > 0 ? `${remaining} kursi tersisa` : waitingListEnabled ? 'Kuota penuh · Waiting list tersedia' : 'Kuota penuh';

  return {
    id: row.id,
    slug: row.slug,
    nama: row.nama,
    title: row.nama,
    jenis: row.jenis,
    kind: row.jenis,
    mode: row.mode,
    jenisPelaksanaan: row.mode === 'online' ? 'Online' : 'Offline',
    tema: row.tema || '',
    theme: row.tema || '',

    // Jadwal
    tanggal,
    date: tanggal,
    tanggalMulai: mulai,
    tanggalSelesai: selesai,
    isoDate: mulai,
    isoTanggal: mulai,
    waktuMulai,
    waktuSelesai,
    waktu: waktuMulai ? `${waktuMulai}–${waktuSelesai} WIB` : '',
    time: waktuMulai ? `${waktuMulai.replace(':', '.')} - ${(waktuSelesai || '').replace(':', '.')} WIB` : '',
    pembukaan: toISODate(row.pembukaan),
    penutupan: toISODate(row.penutupan),
    periodePendaftaran: row.pembukaan ? `${formatTanggal(row.pembukaan)} – ${formatTanggal(row.penutupan)}` : '-',
    deadline: formatTanggal(row.penutupan),
    opens: formatTanggal(row.pembukaan),

    // Penyelenggara
    penyelenggara,
    partner: penyelenggara,
    mitra: penyelenggara,
    partnerId: row.partner_id,
    sumber: row.sumber,

    // Lokasi
    locationId: row.location_id,
    gedung: row.gedung || '',
    ruangan: row.ruangan || '',
    lokasi,
    lokasiStrip: locationLabel(row, ' - '),
    place: row.mode === 'online' ? 'Zoom Meeting' : (row.gedung || row.tempat || '-'),
    shortPlace: row.mode === 'online' ? 'Zoom Meeting' : (row.gedung || row.tempat || '-'),
    fullPlace,
    latitude: row.latitude !== null && row.latitude !== undefined ? Number(row.latitude) : null,
    longitude: row.longitude !== null && row.longitude !== undefined ? Number(row.longitude) : null,
    radius: row.radius ? Number(row.radius) : null,
    meetingUrl: row.meeting_url || null,

    // Kuota & statistik
    kuota,
    capacity: kuota,
    pendaftar,
    hadir,
    menungguVerifikasi: pending,
    ditolak,
    belumAbsen: Math.max(0, pendaftar - hadir - pending - ditolak),
    remaining,
    quota: quotaText,
    waitingListEnabled,
    waitingCount: waiting,

    // Status
    status: row.status,
    statusPublish: row.status === 'draft' ? 'draft' : 'publik',
    statusPendaftaran: row.status_pendaftaran,
    statusPresensi: row.status_presensi,
    registrationState: REG_STATE[row.status_pendaftaran] || 'open',
    attendanceState: ATT_STATE[row.status_presensi] || 'not-open',
    closing: row.status_pendaftaran === 'segera-ditutup',
    completed: row.status === 'selesai',
    cancelled: row.status === 'dibatalkan',
    statusSertifikat: row.sertifikat_status || null,
    statusSertifikatLabel: SERT_LABEL[row.sertifikat_status] || 'Belum Diajukan',
    submissionId: row.submission_id || null,

    // Konten
    ringkasan: row.ringkasan || '',
    description: row.ringkasan || row.deskripsi || '',
    deskripsi: row.deskripsi || '',
    tentang: row.deskripsi || '',
    about: row.deskripsi || '',
    manfaat: row.manfaat || '',
    targetPeserta: row.target_peserta || '',
    target: row.target_peserta || '',
    pemateri: pemateriList.join(', '),
    narasumber: pemateriList.map((nama) => ({ nama, link: true })),
    narasumberNama: pemateriList,
    speaker: pemateriList[0] || '',
    speakerInitials: initials(pemateriList[0] || ''),
    speakerRole: row.pemateri_peran || '',
    imageUrl: row.poster || row.image_url || '',
    image: row.poster || row.image_url || '',
    hasPoster: !!row.poster,
  };
}

const ATT_FRONT = { pending: 'pending', hadir: 'present', ditolak: 'rejected', 'tidak-hadir': 'absent' };
const REG_FRONT = { terdaftar: 'registered', waiting: 'waiting', dibatalkan: 'cancelled', selesai: 'completed' };

/** Pendaftaran milik peserta (format portal peserta) */
function serializeMyRegistration(reg, attendances = []) {
  const latest = attendances[attendances.length - 1];
  return {
    registrationId: reg.id,
    workshopId: reg.slug,
    workshopDbId: reg.workshop_id,
    status: REG_FRONT[reg.status],
    queue: reg.queue_no || undefined,
    registeredAt: toISOStringWIB(reg.registered_at),
    ...(latest ? {
      attendance: {
        id: latest.id,
        status: ATT_FRONT[latest.status],
        method: latest.method,
        fileName: latest.file_name || undefined,
        submittedAt: toISOStringWIB(latest.submitted_at),
        reason: latest.alasan_tolak || undefined,
      },
    } : {}),
  };
}

const STATUS_DAFTAR = { terdaftar: 'Terdaftar', waiting: 'Waiting List', dibatalkan: 'Dibatalkan', selesai: 'Terdaftar' };

/** Gabungkan status presensi beberapa hari menjadi satu status peserta */
function overallAttendance(atts) {
  if (atts.some((a) => a.status === 'hadir')) return 'hadir-valid';
  if (atts.some((a) => a.status === 'pending')) return 'menunggu-verifikasi';
  if (atts.some((a) => a.status === 'ditolak')) return 'ditolak';
  if (atts.some((a) => a.status === 'tidak-hadir')) return 'tidak-hadir';
  return 'belum-hadir';
}

/** Peserta suatu kegiatan (format portal humas/sekretariat/mitra) */
function serializeParticipant(reg, atts, workshopName, jenisKegiatan) {
  const status = overallAttendance(atts);
  const first = atts.find((a) => a.status === 'hadir') || atts.find((a) => a.status === 'pending') || atts[0];
  const waktu = first && first.status !== 'tidak-hadir' ? formatWaktuPresensi(first.submitted_at) : null;
  return {
    id: reg.id,
    registrationId: reg.id,
    userId: reg.user_id,
    nama: reg.nama,
    namaPeserta: reg.nama,
    email: reg.email,
    jenis: reg.jenis_peserta || 'Umum',
    kegiatan: workshopName,
    kegiatanId: reg.workshop_id,
    jenisKegiatan,
    statusPendaftaran: STATUS_DAFTAR[reg.status],
    statusDaftar: STATUS_DAFTAR[reg.status],
    registrationStatus: reg.status,
    queue: reg.queue_no,
    waktuPresensi: waktu,
    waktu,
    statusHadir: status,
    status,
    statusKehadiran: status,
    attendanceId: first ? first.id : null,
    metode: first ? first.method : null,
    fileName: first ? first.file_name : null,
    alasanTolak: first ? first.alasan_tolak : null,
    presensiHarian: atts.map((a) => ({
      id: a.id, tanggal: toISODate(a.tanggal), status: a.status, metode: a.method,
      waktu: formatWaktuPresensi(a.submitted_at), fileName: a.file_name, alasanTolak: a.alasan_tolak,
    })),
  };
}

module.exports = {
  serializeWorkshop,
  serializeMyRegistration,
  serializeParticipant,
  overallAttendance,
  REG_FRONT,
  ATT_FRONT,
};

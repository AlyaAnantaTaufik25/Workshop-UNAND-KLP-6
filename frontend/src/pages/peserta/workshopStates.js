export const registrationStates = {
  'not-open': { label: 'Belum dibuka', tone: 'blue', title: 'Pendaftaran segera hadir', description: 'Pendaftaran belum dimulai. Silakan kembali saat periode pendaftaran dibuka.', action: 'Belum bisa mendaftar' },
  open: { label: 'Pendaftaran dibuka', tone: 'green', title: 'Siap belajar bersama?', description: 'Kursi masih tersedia. Daftar satu kali untuk mengikuti seluruh rangkaian workshop.', action: 'Daftar Workshop', canRegister: true },
  closing: { label: 'Segera ditutup', tone: 'amber', title: 'Jangan lewatkan kesempatan ini', description: 'Periode pendaftaran akan segera berakhir. Pastikan data peserta Anda sudah benar.', action: 'Daftar Sekarang', canRegister: true },
  full: { label: 'Kuota penuh', tone: 'red', title: 'Semua kursi sudah terisi', description: 'Waiting list tidak tersedia untuk kegiatan ini. Anda dapat mencari workshop lainnya.', action: 'Kuota Penuh' },
  'waiting-list': { label: 'Waiting list tersedia', tone: 'amber', title: 'Masih ada kesempatan bergabung', description: 'Kuota utama sudah penuh. Bergabung ke antrean untuk mendapat kursi jika ada peserta yang membatalkan.', action: 'Gabung Waiting List', canRegister: true, isWaiting: true },
  closed: { label: 'Pendaftaran ditutup', tone: 'gray', title: 'Periode pendaftaran berakhir', description: 'Pendaftaran baru sudah ditutup. Peserta yang terdaftar tetap dapat melihat informasi kegiatan.', action: 'Pendaftaran Ditutup' },
  registered: { label: 'Terdaftar', tone: 'green', title: 'Kursi Anda sudah dikonfirmasi', description: 'Anda terdaftar sebagai peserta. Pantau jadwal dan isi presensi saat panitia membuka sesi.', action: 'Lihat Workshop Saya', canCancel: true },
  waiting: { label: 'Dalam waiting list', tone: 'amber', title: 'Anda masuk daftar tunggu', description: 'Kursi belum dikonfirmasi. Nomor antrean dan informasi selanjutnya dapat dipantau di Workshop Saya.', action: 'Pantau Antrean', canCancel: true },
  cancelled: { label: 'Pendaftaran dibatalkan', tone: 'gray', title: 'Pendaftaran Anda telah dibatalkan', description: 'Kursi atau antrean sudah dilepas. Anda dapat mendaftar kembali selama pendaftaran masih tersedia.', action: 'Daftar Kembali', canRegister: true },
  'event-cancelled': { label: 'Workshop dibatalkan', tone: 'red', title: 'Kegiatan tidak jadi dilaksanakan', description: 'Panitia membatalkan kegiatan ini. Pendaftaran dan presensi tidak tersedia.', action: 'Workshop Dibatalkan' },
  completed: { label: 'Workshop selesai', tone: 'gray', title: 'Terima kasih sudah berpartisipasi', description: 'Kegiatan telah berakhir. Periksa hasil presensi dan sertifikat Anda melalui Workshop Saya.', action: 'Lihat Workshop Saya' },
};

export const attendanceStates = {
  'not-registered': { label: 'Belum terdaftar', tone: 'gray', title: 'Daftar workshop terlebih dahulu', description: 'Presensi hanya tersedia untuk peserta dengan pendaftaran terkonfirmasi.' },
  'waiting-list': { label: 'Masih dalam antrean', tone: 'amber', title: 'Menunggu konfirmasi kursi', description: 'Peserta waiting list belum dapat mengisi presensi. Tunggu sampai status Anda menjadi Terdaftar.' },
  'not-open': { label: 'Belum dibuka', tone: 'blue', title: 'Presensi belum dimulai', description: 'Panitia belum membuka sesi presensi. Anda dapat kembali saat kegiatan dimulai.' },
  open: { label: 'Presensi dibuka', tone: 'green', title: 'Catat kehadiran Anda', description: 'Lengkapi presensi untuk sesi ini. Kehadiran akan diperiksa oleh panitia.', canSubmit: true },
  closed: { label: 'Presensi ditutup', tone: 'gray', title: 'Sesi presensi sudah ditutup', description: 'Bukti baru tidak dapat dikirim. Hubungi panitia jika Anda hadir tetapi belum sempat mengisi presensi.' },
  pending: { label: 'Menunggu verifikasi', tone: 'amber', title: 'Presensi berhasil dikirim', description: 'Bukti kehadiran sedang diperiksa oleh panitia. Anda tidak perlu mengirim presensi lagi.' },
  present: { label: 'Hadir · Tervalidasi', tone: 'green', title: 'Kehadiran Anda sudah valid', description: 'Panitia telah menyetujui presensi sesi ini. Sertifikat mengikuti ketentuan kehadiran seluruh sesi.' },
  rejected: { label: 'Presensi ditolak', tone: 'red', title: 'Bukti kehadiran perlu diperbaiki', description: 'Periksa alasan penolakan dan kirim ulang bukti yang benar selama sesi presensi masih dibuka.', canSubmit: true },
  absent: { label: 'Tidak hadir', tone: 'red', title: 'Tidak ada kehadiran yang tercatat', description: 'Kegiatan telah berakhir tanpa presensi yang valid. Hubungi panitia jika terdapat kekeliruan.' },
  cancelled: { label: 'Presensi tidak tersedia', tone: 'gray', title: 'Pendaftaran atau kegiatan dibatalkan', description: 'Anda tidak dapat mengisi presensi untuk pendaftaran atau kegiatan yang dibatalkan.' },
  'location-denied': { label: 'Izin lokasi diperlukan', tone: 'amber', title: 'Lokasi belum dapat diakses', description: 'Izinkan akses lokasi melalui pengaturan browser, lalu periksa lokasi kembali.', canSubmit: true },
  'outside-radius': { label: 'Di luar radius', tone: 'red', title: 'Anda belum berada di lokasi kegiatan', description: 'Datang ke area kegiatan yang ditentukan panitia, aktifkan GPS, lalu periksa kembali lokasi Anda.', canSubmit: true },
  'invalid-code': { label: 'Kode tidak valid', tone: 'red', title: 'Kode presensi tidak dapat digunakan', description: 'Kode mungkin sudah kedaluwarsa atau berasal dari sesi lain. Minta kode terbaru kepada panitia.', canSubmit: true },
  error: { label: 'Gagal mengirim', tone: 'red', title: 'Presensi belum tersimpan', description: 'Periksa koneksi dan coba kirim kembali. Data yang belum tersimpan tidak dihitung sebagai kehadiran.', canSubmit: true },
};

export function getRegistrationAvailability(workshop) {
  if (workshop.cancelled) return 'event-cancelled';
  if (workshop.completed) return 'completed';
  if (['not-open', 'closed'].includes(workshop.registrationState)) return workshop.registrationState;
  if (workshop.remaining <= 0) return workshop.waitingListEnabled === false ? 'full' : 'waiting-list';
  return workshop.closing ? 'closing' : 'open';
}

export function getRegistrationState(workshop, registration) {
  const availability = getRegistrationAvailability(workshop);
  if (['event-cancelled', 'completed'].includes(availability)) return availability;
  if (registration?.status === 'completed') return 'completed';
  if (registration?.status === 'registered') return 'registered';
  if (registration?.status === 'waiting') return 'waiting';
  if (registration?.status === 'cancelled') return 'cancelled';
  return availability;
}

export function getAttendanceState(workshop, registration) {
  if (workshop.cancelled || registration?.status === 'cancelled') return 'cancelled';
  if (!registration) return 'not-registered';
  if (registration.status === 'waiting') return 'waiting-list';
  const status = registration.attendance?.status;
  if (['pending', 'present', 'rejected', 'absent'].includes(status)) return status;
  if (workshop.completed || registration.status === 'completed') return 'absent';
  return ['open', 'closed'].includes(workshop.attendanceState) ? workshop.attendanceState : 'not-open';
}

export function canSubmitAttendance(workshop, registration) {
  return registration?.status === 'registered' && !workshop.completed && !workshop.cancelled
    && workshop.attendanceState === 'open' && ['open', 'rejected'].includes(getAttendanceState(workshop, registration));
}

export function createRegistration(workshop, previous, now = new Date().toISOString()) {
  const availability = getRegistrationAvailability(workshop);
  if (!registrationStates[availability].canRegister || (previous && previous.status !== 'cancelled')) return null;
  const waiting = availability === 'waiting-list';
  return { workshopId: workshop.id, status: waiting ? 'waiting' : 'registered', registeredAt: now,
    ...(waiting ? { queue: Math.max((workshop.waitingCount || 0) + 1, (previous?.queue || 0) + 1) } : {}) };
}

export function getRemainingSeats(workshop, registrations, baseline) {
  if (!Number.isFinite(workshop.capacity)) return 0;
  const holdsSeat = item => item?.status === 'registered';
  const original = baseline.find(item => item.workshopId === workshop.id);
  const current = registrations.find(item => item.workshopId === workshop.id);
  return Math.max(0, Math.min(workshop.capacity, workshop.remaining + Number(holdsSeat(original)) - Number(holdsSeat(current))));
}

/**
 * Pengisian kursi dari waiting list.
 *
 * Dipakai saat ada kursi yang kosong (pembatalan peserta) atau kuota kegiatan
 * dinaikkan/dibuat tak terbatas. Peserta antrean dipromosikan sesuai urutan,
 * nomor antrean sisanya dirapikan (1, 2, 3, ...), dan peserta yang naik
 * diberi tahu (lonceng + email).
 *
 * Modul terpisah agar dapat dipakai registrations.service maupun
 * workshops.service tanpa ketergantungan melingkar.
 */
const repository = require('./registrations.repository');
const { notify } = require('../../services/notifier.service');

/**
 * Isi kursi kosong. WAJIB dipanggil di dalam transaksi ([conn]); baris kegiatan
 * dikunci (FOR UPDATE) agar tidak bentrok dengan pendaftaran bersamaan.
 * @returns {{ workshop: object|null, promoted: number[] }} user_id yang naik
 */
async function fillSeats(workshopId, conn) {
  const [[workshop]] = await conn.query('SELECT id, nama, kuota FROM workshops WHERE id = ? FOR UPDATE', [workshopId]);
  if (!workshop) return { workshop: null, promoted: [] };

  const promoted = [];
  let active = await repository.countActive(workshopId, conn);
  while (workshop.kuota === null || active < Number(workshop.kuota)) {
    const next = await repository.firstWaiting(workshopId, conn);
    if (!next) break;
    await repository.update(next.id, { status: 'terdaftar', queue_no: null }, conn);
    promoted.push(next.user_id);
    active += 1;
  }

  // Rapikan nomor antrean yang tersisa agar sesuai posisi sebenarnya
  const [waiting] = await conn.query(
    "SELECT id, queue_no FROM registrations WHERE workshop_id = ? AND status = 'waiting' ORDER BY queue_no, registered_at",
    [workshopId]
  );
  for (let i = 0; i < waiting.length; i += 1) {
    if (Number(waiting[i].queue_no) !== i + 1) {
      await conn.query('UPDATE registrations SET queue_no = ? WHERE id = ?', [i + 1, waiting[i].id]);
    }
  }
  return { workshop, promoted };
}

/** Beri tahu peserta yang naik dari waiting list. Panggil SETELAH transaksi selesai. */
async function notifyPromoted({ workshop, promoted }) {
  for (const userId of promoted) {
    await notify({ userId }, {
      judul: `Kursi tersedia: ${workshop.nama}`,
      deskripsi: 'Anda naik dari waiting list dan kini terdaftar sebagai peserta. Sampai jumpa di kegiatan!',
      link: '/peserta/workshop-saya',
    });
  }
}

module.exports = { fillSeats, notifyPromoted };

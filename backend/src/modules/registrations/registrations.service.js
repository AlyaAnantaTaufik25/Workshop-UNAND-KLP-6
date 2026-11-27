const registrationsRepository = require('./registrations.repository');
const { parsePage, pageResult } = require('../../utils/pagination.util');
const { notify } = require('../../services/notifier.service');
const workshopsService = require('../workshops/workshops.service');
const { serializeParticipant } = require('../workshops/workshops.serializer');
const { notFound, forbidden, conflict, unprocessable } = require('../../utils/http.util');
const { fillSeats, notifyPromoted } = require('./seats');

/**
 * Business Logic Layer untuk modul registrations
 * Aturan: kuota, waiting list otomatis, dan promosi antrean saat ada pembatalan.
 */
class RegistrationsService {
  constructor() {
    this.repository = registrationsRepository;
  }

  async register(user, workshopIdOrSlug) {
    const w = await workshopsService.getRow(workshopIdOrSlug, user);
    if (w.status === 'dibatalkan') throw unprocessable('Kegiatan ini dibatalkan oleh panitia');
    if (w.status === 'selesai') throw unprocessable('Kegiatan sudah selesai');
    if (!['dibuka', 'segera-ditutup'].includes(w.status_pendaftaran)) {
      throw unprocessable(w.status_pendaftaran === 'belum-dibuka' ? 'Pendaftaran belum dibuka' : 'Pendaftaran sudah ditutup');
    }

    let finalStatus = null;
    await this.repository.transaction(async (conn) => {
      // Kunci baris kegiatan agar perhitungan kuota aman dari pendaftaran bersamaan
      await conn.query('SELECT id FROM workshops WHERE id = ? FOR UPDATE', [w.id]);
      const existing = await this.repository.findByUserWorkshop(user.id, w.id, conn);
      if (existing && existing.status !== 'dibatalkan') throw conflict('Anda sudah terdaftar pada kegiatan ini');

      const active = await this.repository.countActive(w.id, conn);
      const full = w.kuota !== null && active >= w.kuota;
      if (full && !w.waiting_list) throw unprocessable('Kuota penuh dan waiting list tidak tersedia');

      const data = full
        ? { status: 'waiting', queue_no: await this.repository.nextQueue(w.id, conn), registered_at: new Date(), cancelled_at: null }
        : { status: 'terdaftar', queue_no: null, registered_at: new Date(), cancelled_at: null };
      if (existing) await this.repository.update(existing.id, data, conn);
      else await this.repository.create({ ...data, workshop_id: w.id, user_id: user.id }, conn);
      finalStatus = data;
    }).catch((err) => {
      // Dua permintaan bersamaan dari peserta yang sama → kunci unik (workshop, user)
      if (err.code === 'ER_DUP_ENTRY') throw conflict('Anda sudah terdaftar pada kegiatan ini');
      throw err;
    });

    // Konfirmasi ke peserta (lonceng + email)
    await notify({ userId: user.id }, finalStatus.status === 'waiting'
      ? { judul: `Masuk waiting list: ${w.nama}`, deskripsi: `Kuota penuh. Anda berada di antrean nomor ${finalStatus.queue_no}; kursi diberikan sesuai urutan.`, link: '/peserta/workshop-saya' }
      : { judul: `Pendaftaran dikonfirmasi: ${w.nama}`, deskripsi: 'Kursi Anda sudah tercatat. Tambahkan ke kalender dari halaman Workshop Saya agar tidak terlewat.', link: '/peserta/workshop-saya' });

    return workshopsService.detail(w.id, user);
  }

  async cancel(user, registrationId) {
    const reg = await this.repository.findById(registrationId);
    if (!reg) throw notFound('Pendaftaran tidak ditemukan');
    if (user.role === 'peserta' && reg.user_id !== user.id) throw forbidden('Pendaftaran ini bukan milik Anda');
    if (!['terdaftar', 'waiting'].includes(reg.status)) throw unprocessable('Pendaftaran tidak dapat dibatalkan');

    const seats = await this.repository.transaction(async (conn) => {
      // Kunci kegiatan dulu, lalu pastikan status belum berubah oleh permintaan lain
      await conn.query('SELECT id FROM workshops WHERE id = ? FOR UPDATE', [reg.workshop_id]);
      const [[current]] = await conn.query('SELECT status FROM registrations WHERE id = ? FOR UPDATE', [reg.id]);
      if (!current || !['terdaftar', 'waiting'].includes(current.status)) throw unprocessable('Pendaftaran tidak dapat dibatalkan');
      await this.repository.update(reg.id, { status: 'dibatalkan', cancelled_at: new Date(), queue_no: null }, conn);
      // Kursi kosong → naikkan antrean waiting list (berurutan) dan rapikan nomor antrean
      return fillSeats(reg.workshop_id, conn);
    });
    await notifyPromoted(seats);
    return workshopsService.detail(reg.workshop_id, user);
  }

  async my(user) {
    return workshopsService.myRegistrations(user.id);
  }

  /** Daftar peserta lintas kegiatan (humas: semua, mitra: kegiatan instansinya) */
  async list(user, query = {}) {
    const { workshopId } = query;
    const partnerId = user.role === 'mitra' ? user.partnerId || -1 : null;
    let wid = null;
    if (workshopId) wid = (await workshopsService.getRow(workshopId, user)).id;
    const { regs, atts } = await this.repository.listAll({ partnerId, workshopId: wid });
    const byReg = {};
    atts.forEach((a) => { (byReg[a.registration_id] = byReg[a.registration_id] || []).push(a); });
    const all = regs.map((r) => serializeParticipant(r, byReg[r.id] || [], r.workshop_nama, r.workshop_jenis));

    // Pagination & filter di server (bila ?page dikirim): hanya satu halaman yang dikirim ke browser
    const paging = parsePage(query, { defaultLimit: 10 });
    if (!paging) return all;
    const active = all.filter((p) => p.registrationStatus !== 'dibatalkan');
    const q = String(query.q || '').toLowerCase();
    const filtered = active.filter((p) =>
      (!q || p.nama.toLowerCase().includes(q) || String(p.kegiatan).toLowerCase().includes(q))
      && (!query.jenis || p.jenisKegiatan === query.jenis)
      && (!query.kegiatan || p.kegiatan === query.kegiatan)
      && (!query.status || p.statusHadir === query.status));
    const result = pageResult(filtered.slice(paging.offset, paging.offset + paging.limit), filtered.length, paging);
    result.facets = { kegiatan: [...new Set(active.map((p) => p.kegiatan))] };
    return result;
  }
}

module.exports = new RegistrationsService();

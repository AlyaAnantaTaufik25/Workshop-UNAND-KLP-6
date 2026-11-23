const registrationsRepository = require('./registrations.repository');
const workshopsService = require('../workshops/workshops.service');
const { serializeParticipant } = require('../workshops/workshops.serializer');
const { notFound, forbidden, conflict, unprocessable } = require('../../utils/http.util');

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

    await this.repository.transaction(async (conn) => {
      // Kunci baris kegiatan agar perhitungan kuota aman dari pendaftaran bersamaan
      await conn.query('SELECT id FROM workshops WHERE id = ? FOR UPDATE', [w.id]);
      const existing = await this.repository.findByUserWorkshop(user.id, w.id);
      if (existing && existing.status !== 'dibatalkan') throw conflict('Anda sudah terdaftar pada kegiatan ini');

      const active = await this.repository.countActive(w.id, conn);
      const full = w.kuota !== null && active >= w.kuota;
      if (full && !w.waiting_list) throw unprocessable('Kuota penuh dan waiting list tidak tersedia');

      const data = full
        ? { status: 'waiting', queue_no: await this.repository.nextQueue(w.id, conn), registered_at: new Date(), cancelled_at: null }
        : { status: 'terdaftar', queue_no: null, registered_at: new Date(), cancelled_at: null };
      if (existing) await this.repository.update(existing.id, data, conn);
      else await this.repository.create({ ...data, workshop_id: w.id, user_id: user.id }, conn);
    });

    return workshopsService.detail(w.id, user);
  }

  async cancel(user, registrationId) {
    const reg = await this.repository.findById(registrationId);
    if (!reg) throw notFound('Pendaftaran tidak ditemukan');
    if (user.role === 'peserta' && reg.user_id !== user.id) throw forbidden('Pendaftaran ini bukan milik Anda');
    if (!['terdaftar', 'waiting'].includes(reg.status)) throw unprocessable('Pendaftaran tidak dapat dibatalkan');

    await this.repository.transaction(async (conn) => {
      await this.repository.update(reg.id, { status: 'dibatalkan', cancelled_at: new Date(), queue_no: null }, conn);
      // Kursi kosong -> naikkan antrean waiting list pertama
      if (reg.status === 'terdaftar') {
        const next = await this.repository.firstWaiting(reg.workshop_id, conn);
        if (next) await this.repository.update(next.id, { status: 'terdaftar', queue_no: null }, conn);
      }
    });
    return workshopsService.detail(reg.workshop_id, user);
  }

  async my(user) {
    return workshopsService.myRegistrations(user.id);
  }

  /** Daftar peserta lintas kegiatan (humas: semua, mitra: kegiatan instansinya) */
  async list(user, { workshopId } = {}) {
    const partnerId = user.role === 'mitra' ? user.partnerId || -1 : null;
    let wid = null;
    if (workshopId) wid = (await workshopsService.getRow(workshopId, user)).id;
    const { regs, atts } = await this.repository.listAll({ partnerId, workshopId: wid });
    const byReg = {};
    atts.forEach((a) => { (byReg[a.registration_id] = byReg[a.registration_id] || []).push(a); });
    return regs.map((r) => serializeParticipant(r, byReg[r.id] || [], r.workshop_nama, r.workshop_jenis));
  }
}

module.exports = new RegistrationsService();

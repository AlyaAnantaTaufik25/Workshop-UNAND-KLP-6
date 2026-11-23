const crypto = require('crypto');
const attendanceRepository = require('./attendance.repository');
const workshopsService = require('../workshops/workshops.service');
const { notFound, forbidden, unprocessable, badRequest, HttpError } = require('../../utils/http.util');
const { toISODate, distanceMeters } = require('../../utils/format.util');

const MAX_UPLOAD = 2 * 1024 * 1024;

/** Error presensi dengan kode state yang dikenali portal peserta */
function attendanceError(state, message, status = 422) {
  const err = new HttpError(status, message, [{ state }]);
  err.state = state;
  return err;
}

/**
 * Business Logic Layer untuk modul attendance
 * Presensi offline: token QR dinamis + geofence GPS. Presensi online: unggah bukti -> verifikasi panitia.
 */
class AttendanceService {
  constructor() {
    this.repository = attendanceRepository;
  }

  /** Tanggal presensi = hari ini bila dalam rentang kegiatan, selain itu tanggal mulai */
  sessionDate(w) {
    const today = toISODate(new Date());
    const start = toISODate(w.tanggal_mulai);
    const end = toISODate(w.tanggal_selesai);
    return today >= start && today <= end ? today : start;
  }

  async ensureCanSubmit(user, workshopIdOrSlug) {
    const w = await workshopsService.getRow(workshopIdOrSlug, user);
    const reg = await this.repository.findRegistration(user.id, w.id);
    if (!reg || reg.status === 'dibatalkan') throw attendanceError('not-registered', 'Anda belum terdaftar pada kegiatan ini');
    if (reg.status === 'waiting') throw attendanceError('waiting-list', 'Peserta waiting list belum dapat mengisi presensi');
    if (w.status === 'dibatalkan') throw attendanceError('cancelled', 'Kegiatan dibatalkan');
    if (w.status_presensi !== 'dibuka') throw attendanceError(w.status_presensi === 'ditutup' ? 'closed' : 'not-open', 'Sesi presensi tidak sedang dibuka');
    const tanggal = this.sessionDate(w);
    const existing = await this.repository.findForDay(reg.id, tanggal);
    if (existing && ['hadir', 'pending'].includes(existing.status)) {
      throw attendanceError(existing.status === 'hadir' ? 'present' : 'pending', 'Presensi Anda untuk sesi ini sudah tercatat');
    }
    return { w, reg, tanggal };
  }

  /** Presensi offline dengan kode QR dan validasi radius lokasi */
  async checkIn(user, body) {
    const { w, reg, tanggal } = await this.ensureCanSubmit(user, body.workshopId);
    const lat = Number(body.latitude);
    const lng = Number(body.longitude);

    if (w.mode === 'offline') {
      if (body.code) {
        if (!(await this.repository.validToken(w.id, body.code))) throw attendanceError('invalid-code', 'Kode presensi tidak valid atau kedaluwarsa');
      } else if (await this.repository.hasActiveTokens(w.id)) {
        throw attendanceError('invalid-code', 'Masukkan kode presensi dari panitia');
      }
      if (w.latitude !== null && w.longitude !== null) {
        if (!Number.isFinite(lat) || !Number.isFinite(lng)) throw attendanceError('location-denied', 'Lokasi perangkat belum tersedia');
        const dist = distanceMeters(lat, lng, Number(w.latitude), Number(w.longitude));
        if (dist > Number(w.radius || 100)) {
          throw attendanceError('outside-radius', `Anda berada ${Math.round(dist)} m dari lokasi kegiatan (maksimal ${w.radius} m)`);
        }
      }
    }

    await this.repository.upsert(reg.id, tanggal, {
      status: 'hadir', method: 'qr-location', latitude: Number.isFinite(lat) ? lat : null, longitude: Number.isFinite(lng) ? lng : null,
      submitted_at: new Date(), verified_at: new Date(), alasan_tolak: null, file_name: null, file_data: null,
    });
    return workshopsService.detail(w.id, user);
  }

  /** Presensi online dengan unggah bukti (menunggu verifikasi panitia) */
  async upload(user, body) {
    const { w, reg, tanggal } = await this.ensureCanSubmit(user, body.workshopId);
    const dataUrl = String(body.fileData || '');
    if (!body.fileName) throw badRequest('Nama berkas bukti wajib diisi');
    if (dataUrl && !/^data:(image\/(png|jpeg)|application\/pdf);base64,/.test(dataUrl)) throw badRequest('Bukti harus berupa PNG, JPG, atau PDF');
    if (dataUrl.length > MAX_UPLOAD * 1.4) throw badRequest('Ukuran bukti maksimal 2 MB');
    await this.repository.upsert(reg.id, tanggal, {
      status: 'pending', method: 'upload', file_name: String(body.fileName).slice(0, 255), file_data: dataUrl || null,
      submitted_at: new Date(), verified_at: null, verified_by: null, alasan_tolak: null,
    });
    return workshopsService.detail(w.id, user);
  }

  /** Humas membuat kode QR dinamis (berlaku N menit) */
  async generateQr(user, body) {
    const w = await workshopsService.getRow(body.workshopId, user);
    const minutes = Math.min(Math.max(parseInt(body.minutes, 10) || 5, 1), 120);
    const token = crypto.randomBytes(4).toString('hex').slice(0, 6).toUpperCase();
    const expiresAt = new Date(Date.now() + minutes * 60000);
    await this.repository.createToken(w.id, token, expiresAt, user.id);
    return { workshopId: w.id, token, expiresAt: expiresAt.toISOString(), minutes };
  }

  /** Verifikasi bukti presensi (hadir / ditolak) oleh humas atau mitra pemilik kegiatan */
  async verify(user, id, body) {
    const att = await this.repository.findById(id);
    if (!att) throw notFound('Data presensi tidak ditemukan');
    if (user.role === 'mitra' && att.partner_id !== user.partnerId) throw forbidden();
    if (!['hadir', 'ditolak'].includes(body.status)) throw badRequest("Status harus 'hadir' atau 'ditolak'");
    if (body.status === 'ditolak' && !body.reason) throw unprocessable('Alasan penolakan wajib diisi');
    await this.repository.update(id, {
      status: body.status, alasan_tolak: body.status === 'ditolak' ? body.reason : null, verified_at: new Date(), verified_by: user.id,
    });
    return workshopsService.detail(att.workshop_id, user);
  }

  /** Rekap presensi kegiatan */
  async byWorkshop(user, workshopId) {
    const detail = await workshopsService.detail(workshopId, user);
    return { workshop: { id: detail.id, nama: detail.nama }, presensi: detail.presensi, rekap: detail.rekap };
  }
}

module.exports = new AttendanceService();

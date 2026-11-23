const workshopsRepository = require('./workshops.repository');
const { serializeWorkshop, serializeParticipant, serializeMyRegistration } = require('./workshops.serializer');
const { notFound, forbidden, badRequest } = require('../../utils/http.util');
const { slugify, formatWaktuPresensi, toISODate } = require('../../utils/format.util');

const STATUSES = ['draft', 'publik', 'berlangsung', 'selesai', 'dibatalkan'];
const REG_STATUSES = ['belum-dibuka', 'dibuka', 'segera-ditutup', 'ditutup'];
const ATT_STATUSES = ['belum-dibuka', 'dibuka', 'ditutup'];

/**
 * Business Logic Layer untuk modul workshops
 */
class WorkshopsService {
  constructor() {
    this.repository = workshopsRepository;
  }

  /** Batasan data per role */
  scopeFor(user) {
    if (!user) return { publicOnly: true };
    if (user.role === 'mitra') return { partnerId: user.partnerId || -1 };
    if (user.role === 'peserta') return { publicOnly: true };
    return {};
  }

  async list(user, query = {}) {
    const rows = await this.repository.findAll({ ...this.scopeFor(user), status: query.status, search: query.search });
    const items = rows.map(serializeWorkshop);
    if (user && user.role === 'peserta') {
      const mine = await this.myRegistrations(user.id);
      const bySlug = Object.fromEntries(mine.map((r) => [r.workshopId, r]));
      items.forEach((w) => { w.myRegistration = bySlug[w.slug] || null; });
    }
    return items;
  }

  async getRow(idOrSlug, user) {
    const row = await this.repository.findOne(idOrSlug);
    if (!row) throw notFound('Kegiatan tidak ditemukan');
    const scope = this.scopeFor(user);
    if (scope.partnerId && row.partner_id !== scope.partnerId) throw forbidden('Kegiatan ini bukan milik instansi Anda');
    if (scope.publicOnly && row.status === 'draft') throw notFound('Kegiatan tidak ditemukan');
    return row;
  }

  /** Detail kegiatan + daftar peserta, presensi harian, dan rekap */
  async detail(idOrSlug, user) {
    const row = await this.getRow(idOrSlug, user);
    const workshop = serializeWorkshop(row);
    if (user && user.role === 'peserta') {
      const mine = await this.myRegistrations(user.id);
      workshop.myRegistration = mine.find((r) => r.workshopId === row.slug) || null;
      return workshop;
    }
    if (!user) return workshop;

    const { regs, atts } = await this.repository.participants(row.id);
    const attsByReg = {};
    atts.forEach((a) => { (attsByReg[a.registration_id] = attsByReg[a.registration_id] || []).push(a); });
    const peserta = regs.map((r) => serializeParticipant(r, attsByReg[r.id] || [], row.nama, row.jenis));

    // Presensi: satu baris per peserta terdaftar per hari kegiatan
    const presensi = [];
    regs.filter((r) => ['terdaftar', 'selesai'].includes(r.status)).forEach((r) => {
      const list = attsByReg[r.id] || [];
      if (!list.length) {
        presensi.push({ id: `r${r.id}`, registrationId: r.id, attendanceId: null, nama: r.nama, namaPeserta: r.nama, kegiatan: row.nama, kegiatanId: row.id, tanggal: null, waktu: null, waktuPresensi: null, status: 'belum-hadir', statusKehadiran: 'belum-hadir' });
      }
      list.forEach((a) => {
        const st = { hadir: 'hadir-valid', pending: 'menunggu-verifikasi', ditolak: 'ditolak', 'tidak-hadir': 'tidak-hadir' }[a.status];
        const waktu = a.status === 'tidak-hadir' ? null : formatWaktuPresensi(a.submitted_at);
        presensi.push({ id: a.id, registrationId: r.id, attendanceId: a.id, nama: r.nama, namaPeserta: r.nama, kegiatan: row.nama, kegiatanId: row.id, tanggal: toISODate(a.tanggal), waktu, waktuPresensi: waktu, status: st, statusKehadiran: st, metode: a.method, fileName: a.file_name, alasanTolak: a.alasan_tolak });
      });
    });

    workshop.peserta = peserta;
    workshop.presensi = presensi;
    workshop.rekap = {
      totalPendaftar: workshop.pendaftar,
      pesertaHadir: workshop.hadir,
      belumAbsen: workshop.belumAbsen,
      menungguVerifikasi: workshop.menungguVerifikasi,
      ditolak: workshop.ditolak,
      waitingList: workshop.waitingCount,
      persentaseHadir: workshop.pendaftar ? Math.round((workshop.hadir / workshop.pendaftar) * 100) : 0,
    };
    return workshop;
  }

  async myRegistrations(userId) {
    const { regs, atts } = await this.repository.registrationsOfUser(userId);
    const byReg = {};
    atts.forEach((a) => { (byReg[a.registration_id] = byReg[a.registration_id] || []).push(a); });
    return regs.map((r) => serializeMyRegistration(r, byReg[r.id] || []));
  }

  /** Ubah body form (TambahKegiatanModal) menjadi kolom tabel */
  async toColumns(body, existing = null) {
    const data = {};
    const nama = body.nama ?? body.judul ?? body.title;
    if (nama !== undefined) data.nama = String(nama).trim();
    const map = {
      jenis: 'jenis', tema: 'tema', deskripsi: 'deskripsi', manfaat: 'manfaat', targetPeserta: 'target_peserta',
      ringkasan: 'ringkasan', pemateriPeran: 'pemateri_peran', meetingUrl: 'meeting_url', imageUrl: 'image_url',
      tanggalMulai: 'tanggal_mulai', tanggalSelesai: 'tanggal_selesai', waktuMulai: 'waktu_mulai', waktuSelesai: 'waktu_selesai',
      pembukaan: 'pembukaan', penutupan: 'penutupan',
    };
    for (const [key, col] of Object.entries(map)) {
      if (body[key] !== undefined) data[col] = body[key] === '' ? null : body[key];
    }
    // Beberapa pemateri dipisahkan dengan titik koma (;) karena gelar memakai koma
    if (body.pemateri !== undefined) data.pemateri = String(body.pemateri).trim() || null;
    if (body.jenisPelaksanaan !== undefined || body.mode !== undefined) {
      data.mode = String(body.mode || body.jenisPelaksanaan).toLowerCase() === 'online' ? 'online' : 'offline';
    }
    if (body.poster !== undefined) data.poster = typeof body.poster === 'string' && body.poster.startsWith('data:') ? body.poster : null;
    if (body.kuotaJenis !== undefined || body.kuota !== undefined) {
      // kuotaJenis: 'Terbatas' | 'Tanpa Batas'
      const unlimited = body.kuotaJenis !== undefined && body.kuotaJenis !== 'Terbatas';
      data.kuota = unlimited || body.kuota === null || body.kuota === '' ? null : Math.max(1, parseInt(body.kuota, 10) || 0);
    }
    if (body.waitingListEnabled !== undefined) data.waiting_list = body.waitingListEnabled ? 1 : 0;
    if (body.status !== undefined) {
      if (!STATUSES.includes(body.status)) throw badRequest(`Status tidak valid. Pilihan: ${STATUSES.join(', ')}`);
      data.status = body.status;
    }
    if (body.statusPendaftaran !== undefined) {
      if (!REG_STATUSES.includes(body.statusPendaftaran)) throw badRequest('Status pendaftaran tidak valid');
      data.status_pendaftaran = body.statusPendaftaran;
    }
    if (body.statusPresensi !== undefined) {
      if (!ATT_STATUSES.includes(body.statusPresensi)) throw badRequest('Status presensi tidak valid');
      data.status_presensi = body.statusPresensi;
    }

    // Penyelenggara -> mitra
    if (body.penyelenggara !== undefined || body.partnerId !== undefined) {
      const partner = body.partnerId ? { id: body.partnerId } : await this.repository.findPartnerByName(body.penyelenggara);
      data.partner_id = partner ? partner.id : null;
      data.penyelenggara = body.penyelenggara || 'Universitas Andalas';
    }

    // Lokasi
    const mode = data.mode || (existing && existing.mode);
    if (mode === 'online') {
      data.location_id = null;
      if (body.tempat !== undefined || !existing) data.tempat = body.tempat || 'Online (Zoom Meeting)';
    } else if (body.locationId !== undefined) {
      data.location_id = body.locationId || null;
    } else if (body.gedung !== undefined) {
      const loc = body.gedung ? await this.repository.findLocation(body.gedung, body.ruangan) : null;
      data.location_id = loc ? loc.id : null;
      data.tempat = loc ? null : [body.gedung, body.ruangan].filter(Boolean).join(' · ') || null;
    }

    if (data.tanggal_mulai && !data.tanggal_selesai && !existing) data.tanggal_selesai = data.tanggal_mulai;
    return data;
  }

  async create(body, user) {
    const data = await this.toColumns(body);
    if (!data.nama) throw badRequest('Judul kegiatan wajib diisi');
    if (!data.tanggal_mulai) throw badRequest('Tanggal mulai wajib diisi');
    let slug = slugify(data.nama);
    let i = 2;
    while (await this.repository.slugExists(slug)) slug = `${slugify(data.nama)}-${i++}`;
    data.slug = slug;
    data.status = data.status || 'publik';
    data.created_by = user.id;
    if (!data.penyelenggara) data.penyelenggara = 'Universitas Andalas';
    const id = await this.repository.create(data);
    return this.detail(id, user);
  }

  async update(id, body, user) {
    const row = await this.getRow(id, user);
    const data = await this.toColumns(body, row);
    if (data.nama === '') throw badRequest('Judul kegiatan wajib diisi');
    await this.repository.update(row.id, data);
    if (data.status === 'selesai') await this.repository.completeRegistrations(row.id);
    return this.detail(row.id, user);
  }

  async remove(id, user) {
    const row = await this.getRow(id, user);
    await this.repository.remove(row.id);
  }
}

module.exports = new WorkshopsService();

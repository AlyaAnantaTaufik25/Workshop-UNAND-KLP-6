const reportsRepository = require('./reports.repository');
const workshopsService = require('../workshops/workshops.service');
const { formatTanggal, toISODate } = require('../../utils/format.util');

/**
 * Business Logic Layer untuk modul reports (dashboard & laporan)
 */
class ReportsService {
  constructor() {
    this.repository = reportsRepository;
  }

  partnerOf(user) {
    return user.role === 'mitra' ? user.partnerId || -1 : null;
  }

  async summary(user) {
    const workshops = (await workshopsService.list(user)).filter((w) => w.status !== 'draft');
    const counts = await this.repository.counts(this.partnerOf(user));
    const sum = (k) => workshops.reduce((a, w) => a + (w[k] || 0), 0);
    const totalPendaftar = sum('pendaftar');
    const pesertaHadir = sum('hadir');
    const byJenis = {};
    workshops.forEach((w) => { byJenis[w.jenis] = (byJenis[w.jenis] || 0) + 1; });
    return {
      totalKegiatan: workshops.length,
      kegiatanBerlangsung: workshops.filter((w) => w.status === 'berlangsung').length,
      kegiatanAkanDatang: workshops.filter((w) => w.status === 'publik').length,
      kegiatanSelesai: workshops.filter((w) => w.status === 'selesai').length,
      totalPendaftar,
      pesertaHadir,
      menungguVerifikasi: sum('menungguVerifikasi'),
      persentaseHadir: totalPendaftar ? Math.round((pesertaHadir / totalPendaftar) * 100) : 0,
      sertifikatTerbit: Number(counts.sertifikat_terbit),
      menungguTtd: Number(counts.menunggu_ttd),
      perbaikanAktif: Number(counts.perbaikan_aktif),
      perJenis: Object.entries(byJenis).map(([jenis, jumlah]) => ({ jenis, jumlah })),
      kegiatanTerdekat: workshops
        .filter((w) => ['publik', 'berlangsung'].includes(w.status))
        .sort((a, b) => a.tanggalMulai.localeCompare(b.tanggalMulai))
        .slice(0, 5)
        .map((w) => ({ id: w.id, tanggal: w.tanggalMulai.slice(8), jenis: w.jenis, nama: w.nama, info: `${w.tanggal} · ${w.lokasi}` })),
    };
  }

  /** Baris laporan per kegiatan */
  async workshops(user) {
    const workshops = (await workshopsService.list(user)).filter((w) => w.status !== 'draft');
    return workshops.map((w) => ({
      id: w.id,
      kegiatan: w.nama,
      jenis: w.jenis,
      pelaksanaan: w.jenisPelaksanaan,
      periode: w.tanggal,
      tanggalISO: w.tanggalMulai,
      status: w.status,
      penyelenggara: w.penyelenggara,
      kuota: w.kuota,
      pendaftar: w.pendaftar,
      hadir: w.hadir,
      belumAbsen: w.belumAbsen,
      menungguVerifikasi: w.menungguVerifikasi,
      ditolak: w.ditolak,
    }));
  }

  /** Rekap presensi harian (kegiatan multi-hari dipecah per hari) */
  async daily(user) {
    const workshops = Object.fromEntries((await workshopsService.list(user)).map((w) => [w.id, w]));
    const rows = await this.repository.dailyAttendance(this.partnerOf(user));
    const out = [];
    const byWorkshop = {};
    rows.forEach((r) => { (byWorkshop[r.workshop_id] = byWorkshop[r.workshop_id] || []).push(r); });
    Object.values(byWorkshop).forEach((list) => {
      const r = list[0];
      const w = workshops[r.workshop_id];
      if (!w) return;
      const start = toISODate(r.tanggal_mulai);
      const end = toISODate(r.tanggal_selesai);
      // Setiap hari kegiatan tampil walau belum ada presensi
      for (let d = new Date(`${start}T00:00:00Z`), i = 1; d <= new Date(`${end}T00:00:00Z`); d.setUTCDate(d.getUTCDate() + 1), i += 1) {
        const iso = d.toISOString().slice(0, 10);
        const match = list.find((x) => x.tanggal && toISODate(x.tanggal) === iso);
        const hadir = Number(match ? match.hadir : 0);
        const pending = Number(match ? match.pending : 0);
        const ditolak = Number(match ? match.ditolak : 0);
        out.push({
          id: out.length + 1,
          workshopId: r.workshop_id,
          kegiatan: r.nama,
          jenis: w.jenis,
          pelaksanaan: r.mode === 'online' ? 'Online' : 'Offline',
          hari: `Hari ${i}`,
          tanggal: formatTanggal(iso),
          tanggalISO: iso,
          absensi: r.status_presensi === 'dibuka' ? 'Dibuka' : r.status_presensi === 'ditutup' ? 'Ditutup' : 'Belum Dibuka',
          sampelPeserta: w.pendaftar,
          hadir,
          menungguVerifikasi: pending,
          ditolak,
          belumAbsen: Math.max(0, w.pendaftar - hadir - pending - ditolak),
        });
      }
    });
    return out;
  }
}

module.exports = new ReportsService();

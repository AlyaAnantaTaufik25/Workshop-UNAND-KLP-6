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

  /**
   * Data dashboard per role: antrean tugas ("apa yang perlu dikerjakan sekarang"),
   * alur sertifikat, tren bulanan pendaftar vs hadir, dan tingkat kehadiran per kegiatan.
   */
  async dashboard(user) {
    // Dimuat saat dipakai agar tidak terjadi dependensi melingkar antar-modul
    const certificatesService = require('../certificates/certificates.service');
    const role = user.role;
    const workshops = (await workshopsService.list(user)).filter((w) => w.status !== 'draft');
    const [summary, submissions, corrections, replacements] = await Promise.all([
      this.summary(user),
      certificatesService.listSubmissions(user),
      ['humas', 'mitra'].includes(role) ? certificatesService.listCorrections(user) : [],
      certificatesService.listReplacements(user),
    ]);

    const count = (list, fn) => list.filter(fn).length;
    const top = (list, n = 5) => list.slice(0, n);
    const BULAN = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];

    // Alur penandatanganan sertifikat
    const pipeline = {
      menungguMitra: count(submissions, (s) => s.status === 'menunggu-mitra'),
      menungguRektor: count(submissions, (s) => s.status === 'menunggu-rektor'),
      diterbitkan: count(submissions, (s) => s.status === 'diterbitkan'),
    };

    // Antrean tugas
    const presensiMenunggu = workshops
      .filter((w) => w.menungguVerifikasi > 0)
      .sort((a, b) => b.menungguVerifikasi - a.menungguVerifikasi)
      .map((w) => ({ id: w.id, nama: w.nama, jumlah: w.menungguVerifikasi, tanggal: w.tanggal }));
    const perbaikanAktif = corrections
      .filter((c) => ['menunggu', 'diproses'].includes(c.status))
      .map((c) => ({ id: c.dbId, nama: c.namaPeserta, kegiatan: c.namaKegiatan, status: c.status, tanggal: c.tanggalPengajuan }));
    const belumDiajukan = workshops
      .filter((w) => w.status === 'selesai' && !w.statusSertifikat && w.hadir > 0)
      .map((w) => ({ id: w.id, nama: w.nama, hadir: w.hadir, tanggal: w.tanggal }));
    const menungguTtdSaya = submissions
      .filter((s) => (role === 'mitra' && s.status === 'menunggu-mitra') || (role === 'rektor' && s.status === 'menunggu-rektor'))
      .map((s) => ({ id: s.id, nama: s.namaKegiatan, jumlah: s.jumlahSertifikat, tanggal: s.tanggalPengajuan }));
    const penggantiTertunda = replacements
      .filter((r) => r.status === 'sedang-diproses')
      .map((r) => ({ id: r.id, nama: r.namaPeserta, kegiatan: r.namaKegiatan, tanggal: r.tanggalPengajuan }));

    // Tren bulanan berdasarkan tanggal kegiatan (6 bulan terakhir yang memiliki kegiatan)
    const perBulan = {};
    workshops.forEach((w) => {
      const key = (w.tanggalMulai || '').slice(0, 7);
      if (!key) return;
      perBulan[key] = perBulan[key] || { bulan: key, pendaftar: 0, hadir: 0, kegiatan: 0 };
      perBulan[key].pendaftar += w.pendaftar;
      perBulan[key].hadir += w.hadir;
      perBulan[key].kegiatan += 1;
    });
    const trend = Object.values(perBulan)
      .sort((a, b) => a.bulan.localeCompare(b.bulan))
      .slice(-6)
      .map((m) => ({ ...m, label: `${BULAN[Number(m.bulan.slice(5, 7)) - 1]} ${m.bulan.slice(0, 4)}` }));

    // Tingkat kehadiran kegiatan yang sudah/ sedang berjalan
    const kehadiran = workshops
      .filter((w) => ['berlangsung', 'selesai'].includes(w.status) && w.pendaftar > 0)
      .map((w) => ({ id: w.id, nama: w.nama, hadir: w.hadir, pendaftar: w.pendaftar, persen: Math.round((w.hadir / w.pendaftar) * 100), status: w.status }))
      .sort((a, b) => b.persen - a.persen);

    return {
      role,
      summary,
      pipeline,
      tasks: {
        presensiMenunggu: { total: presensiMenunggu.reduce((a, x) => a + x.jumlah, 0), items: top(presensiMenunggu) },
        perbaikanAktif: { total: perbaikanAktif.length, items: top(perbaikanAktif) },
        belumDiajukan: { total: belumDiajukan.length, items: top(belumDiajukan) },
        menungguTtdSaya: { total: menungguTtdSaya.length, items: top(menungguTtdSaya) },
        penggantiTertunda: { total: penggantiTertunda.length, items: top(penggantiTertunda) },
      },
      trend,
      kehadiran,
      pengajuanTerbaru: top(submissions).map((s) => ({ id: s.id, nama: s.namaKegiatan, status: s.status, jumlah: s.jumlahSertifikat, tanggal: s.tanggalPengajuan, sumber: s.sumber })),
      kegiatanTerdekat: summary.kegiatanTerdekat,
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

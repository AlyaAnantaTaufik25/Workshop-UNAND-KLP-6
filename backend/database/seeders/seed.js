/**
 * Seeder data pengembangan SIM Workshop UNAND.
 * Menyatukan data contoh dari seluruh portal (peserta, humas, sekretariat,
 * rektor, mitra) menjadi satu dataset relasional yang konsisten.
 *
 *   npm run db:seed      (mengisi ulang seluruh tabel)
 *   npm run db:reset     (migrate + seed)
 *
 * Akun demo (kata sandi semua: password123, PIN TTE: 123456):
 *   peserta@unand.ac.id · humas@unand.ac.id · sekretariat@unand.ac.id
 *   mitra@unand.ac.id · rektor@unand.ac.id
 */
const bcrypt = require('bcryptjs');
const mysql = require('mysql2/promise');
const config = require('../../src/config/app.config');

const DEMO_PASSWORD = 'password123';
const DEMO_PIN = '123456';

// PRNG deterministik agar data seed selalu sama setiap dijalankan
let seedState = 20260518;
function rand() {
  seedState = (seedState * 1664525 + 1013904223) % 4294967296;
  return seedState / 4294967296;
}
const pick = (arr) => arr[Math.floor(rand() * arr.length)];

const ROLES = [
  ['peserta', 'Peserta', 'Peserta kegiatan workshop UNAND'],
  ['humas', 'Humas', 'Humas Universitas Andalas (Administrator Workshop)'],
  ['sekretariat', 'Sekretariat Rektor', 'Sekretariat Rektor (Verifikator Sertifikat)'],
  ['rektor', 'Rektor', 'Rektor Universitas Andalas (Penandatangan Sertifikat)'],
  ['mitra', 'Mitra', 'Mitra Kerja Sama Penyelenggaraan Workshop'],
];

const PARTNERS = [
  { key: 'semen', nama: 'PT Semen Padang', jenis: 'Eksternal', pj: 'Ahmad Rizal', email: 'mitra@semenpadang.co.id', kontak: '0751 815250', bidang: 'Industri Semen & Bahan Bangunan', alamat: 'Jl. Indarung No.1, Padang, Sumatera Barat' },
  { key: 'nagari', nama: 'Bank Nagari', jenis: 'Eksternal', pj: 'Dewi Anggraini', email: 'kc.ekonomi@banknagari.co.id', kontak: '0751 31377', bidang: 'Perbankan', alamat: 'Jl. Pemuda No.21, Padang' },
  { key: 'feb', nama: 'Fakultas Ekonomi dan Bisnis UNAND', jenis: 'Internal', pj: 'Sari Dewi', email: 'feb@unand.ac.id', kontak: '0751 71000', bidang: 'Pendidikan Tinggi', alamat: 'Kampus Limau Manis, Padang' },
  { key: 'fti', nama: 'Fakultas Teknologi Informasi UNAND', jenis: 'Internal', pj: 'Rahmat Hidayat', email: 'fti@unand.ac.id', kontak: '0751 77889', bidang: 'Pendidikan Tinggi', alamat: 'Kampus Limau Manis, Padang' },
  { key: 'telkom', nama: 'Telkom Indonesia', jenis: 'Eksternal', pj: 'Yoga Pratama', email: 'kemitraan@telkom.co.id', kontak: '0751 147', bidang: 'Telekomunikasi', alamat: 'Jl. Khatib Sulaiman, Padang' },
];

const LOCATIONS = [
  { key: 'ch', gedung: 'Convention Hall', ruangan: 'Ruang Utama', lokasi: 'Kampus Limau Manis, Padang', lat: -0.9142, lng: 100.458, radius: 150 },
  { key: 'ch-a', gedung: 'Convention Hall', ruangan: 'Ruang A', lokasi: 'Kampus Limau Manis, Padang', lat: -0.9143, lng: 100.4582, radius: 100 },
  { key: 'rektorat', gedung: 'Gedung Rektorat', ruangan: 'Ruang Sidang Lantai 4', lokasi: 'Kampus Limau Manis, Padang', lat: -0.9147, lng: 100.4592, radius: 100 },
  { key: 'rektorat-aula', gedung: 'Gedung Rektorat', ruangan: 'Aula Rektorat', lokasi: 'Kampus Limau Manis, Padang', lat: -0.9148, lng: 100.4594, radius: 120 },
  { key: 'auditorium', gedung: 'Auditorium UNAND', ruangan: 'Ruang Utama', lokasi: 'Kampus Limau Manis, Padang', lat: -0.9135, lng: 100.4601, radius: 150 },
  { key: 'fisip', gedung: 'Gedung FISIP', ruangan: 'Ruang Seminar', lokasi: 'Kampus Limau Manis, Padang', lat: -0.9128, lng: 100.4569, radius: 80 },
];

const IMG = {
  data: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=800&q=80',
  seminar: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800&q=80',
  team: 'https://images.unsplash.com/photo-1552664730-d307ca884978?w=800&q=80',
  industri: 'https://images.unsplash.com/photo-1581092795360-fd1ca04f0952?w=800&q=80',
  ai: 'https://images.unsplash.com/photo-1531482615713-2afd69097998?w=800&q=80',
  riset: 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=800&q=80',
  lead: 'https://images.unsplash.com/photo-1544531586-fde5298cdd40?w=800&q=80',
  write: 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=800&q=80',
};

/**
 * target: { daftar, hadir, pending, ditolak } jumlah peserta dummy yang dibuat
 * submission: status pengajuan sertifikat (null = belum diajukan)
 */
const WORKSHOPS = [
  { slug: 'data-science', nama: 'Workshop Data Science untuk Riset Akademik', jenis: 'Workshop', mode: 'offline', tema: 'Teknologi & Riset', partner: 'semen', sumber: 'UNAND', loc: 'ch', mulai: '2026-05-18', selesai: '2026-05-18', jam: ['09:00', '15:30'], buka: '2026-05-01', tutup: '2026-05-18', kuota: 120, status: 'berlangsung', daftarStatus: 'dibuka', presensi: 'dibuka', img: IMG.data,
    ringkasan: 'Pelajari cara mengolah dan menerjemahkan data menjadi temuan riset yang bermakna bersama praktisi berpengalaman.',
    deskripsi: 'Pelajari pengolahan dan interpretasi data untuk menghasilkan riset yang bermakna, bersama akademisi dan praktisi industri.',
    manfaat: 'Diskusi bersama ahli, kunjungan, dan sertifikat bagi peserta dengan presensi valid.', target: 'Mahasiswa dan umum',
    pemateri: 'Dr. Rina Afriani, M.Kom.', peran: 'Data Scientist & Dosen UNAND',
    target_: { daftar: 108, hadir: 88, pending: 2, ditolak: 0 }, submission: 'menunggu-rektor', nomorSk: 'WDS/UNAND/001/2026' },
  { slug: 'seminar-transformasi-digital', nama: 'Seminar Transformasi Digital', jenis: 'Seminar', mode: 'online', tema: 'Teknologi Digital', partner: 'semen', sumber: 'Mitra', loc: null, mulai: '2026-05-18', selesai: '2026-05-20', jam: ['08:00', '17:00'], buka: '2026-05-05', tutup: '2026-05-17', kuota: null, status: 'berlangsung', daftarStatus: 'ditutup', presensi: 'dibuka', img: IMG.seminar, meeting: 'https://zoom.us/j/1234567890',
    ringkasan: 'Transformasi digital untuk meningkatkan efisiensi dan daya saing di era industri 4.0.',
    deskripsi: 'Seminar tentang transformasi digital untuk meningkatkan efisiensi dan daya saing di era industri 4.0.',
    manfaat: 'Insight dari pakar teknologi, networking, dan sertifikat kehadiran.', target: 'Profesional dan mahasiswa',
    pemateri: 'Ir. Budi Santosa, M.T.', peran: 'Praktisi Transformasi Digital',
    target_: { daftar: 45, hadir: 40, pending: 1, ditolak: 0 }, submission: 'menunggu-rektor', nomorSk: 'STD/UNAND/001/2026' },
  { slug: 'kolaborasi-riset', nama: 'Seminar Kolaborasi Riset Lintas Disiplin', jenis: 'Seminar', mode: 'offline', tema: 'Riset & Kolaborasi', partner: 'semen', sumber: 'UNAND', loc: 'ch', mulai: '2026-05-18', selesai: '2026-05-19', jam: ['08:30', '14:00'], buka: '2026-05-05', tutup: '2026-05-16', kuota: null, status: 'berlangsung', daftarStatus: 'ditutup', presensi: 'dibuka', img: IMG.riset,
    ringkasan: 'Mempertemukan akademisi dan praktisi industri untuk riset kolaboratif lintas disiplin.',
    deskripsi: 'Seminar yang mempertemukan akademisi dan praktisi industri untuk menjajaki peluang riset kolaboratif lintas disiplin ilmu.',
    manfaat: 'Peluang kolaborasi riset, networking lintas disiplin, dan sertifikat kehadiran.', target: 'Dosen, peneliti, dan profesional',
    pemateri: 'Prof. Dr. Rudi Hamzah, M.Si.', peran: 'Guru Besar & Peneliti',
    target_: { daftar: 60, hadir: 55, pending: 1, ditolak: 0 }, submission: null },
  { slug: 'hilirisasi-riset', nama: 'Strategi Hilirisasi Riset dan Inovasi', jenis: 'Seminar', mode: 'offline', tema: 'Riset & Inovasi', partner: 'nagari', sumber: 'UNAND', loc: 'rektorat', mulai: '2026-05-24', selesai: '2026-05-24', jam: ['08:30', '12:00'], buka: '2026-05-01', tutup: '2026-05-22', kuota: 80, status: 'publik', daftarStatus: 'dibuka', presensi: 'belum-dibuka', img: IMG.riset,
    ringkasan: 'Temukan strategi membawa hasil riset dan inovasi akademik menjadi solusi bagi masyarakat.',
    deskripsi: 'Mendekatkan hasil riset perguruan tinggi dengan kebutuhan masyarakat dan industri melalui diskusi bersama akademisi dan praktisi.',
    manfaat: 'Jejaring riset, insight industri, dan sertifikat kehadiran.', target: 'Dosen, peneliti, mahasiswa, dan peserta umum',
    pemateri: 'Prof. Dr. Budi Santoso', peran: 'Akademisi & Praktisi Riset',
    target_: { daftar: 80, hadir: 0, pending: 0, ditolak: 0, waiting: 3 }, submission: null },
  { slug: 'kepemimpinan-muda', nama: 'Kepemimpinan Muda Berdampak', jenis: 'Kuliah Umum', mode: 'offline', tema: 'Pengembangan Diri', partner: 'feb', sumber: 'UNAND', loc: 'rektorat', mulai: '2026-06-02', selesai: '2026-06-02', jam: ['13:00', '16:00'], buka: '2026-05-10', tutup: '2026-05-31', kuota: 100, status: 'publik', daftarStatus: 'segera-ditutup', presensi: 'belum-dibuka', img: IMG.lead,
    ringkasan: 'Kembangkan kemampuan memimpin, berkomunikasi, dan berkolaborasi untuk perubahan yang berdampak.',
    deskripsi: 'Kuliah umum tentang kepemimpinan muda yang berdampak nyata bagi masyarakat dan lingkungan kampus.',
    manfaat: 'Inspirasi dari tokoh nasional, insight karier, dan sertifikat kehadiran.', target: 'Mahasiswa, profesional muda, dan peserta umum',
    pemateri: 'Dr. Hj. Fatimah Zahra, M.Si.', peran: 'Praktisi Pengembangan Kepemimpinan',
    target_: { daftar: 61, hadir: 0, pending: 0, ditolak: 0 }, submission: null },
  { slug: 'manajemen-proyek', nama: 'Manajemen Proyek Kolaboratif', jenis: 'Workshop', mode: 'offline', tema: 'Manajemen & Kolaborasi', partner: 'semen', sumber: 'Mitra', loc: 'ch', mulai: '2026-04-15', selesai: '2026-04-15', jam: ['07:30', '16:00'], buka: '2026-03-25', tutup: '2026-04-14', kuota: 100, status: 'selesai', daftarStatus: 'ditutup', presensi: 'ditutup', img: IMG.team,
    ringkasan: 'Pelatihan intensif praktik manajemen proyek agile dan kolaborasi lintas tim.',
    deskripsi: 'Workshop intensif pengelolaan proyek lintas tim menggunakan metodologi agile dan kolaborasi digital.',
    manfaat: 'Praktik langsung menggunakan tools manajemen proyek, studi kasus nyata, dan sertifikat.', target: 'Profesional muda dan mahasiswa tingkat akhir',
    pemateri: 'Ahmad Fauzi, P.M.P.', peran: 'Senior Project Manager & Praktisi Industri',
    target_: { daftar: 91, hadir: 83, pending: 0, ditolak: 0 }, submission: 'diterbitkan', nomorSk: 'WMP/UNAND/001/2026' },
  { slug: 'inovasi-industri', nama: 'Inovasi Industri Berkelanjutan', jenis: 'Seminar', mode: 'offline', tema: 'Industri & Keberlanjutan', partner: 'semen', sumber: 'Mitra', loc: 'ch', mulai: '2026-05-12', selesai: '2026-05-12', jam: ['08:00', '15:00'], buka: '2026-04-25', tutup: '2026-05-11', kuota: 80, status: 'selesai', daftarStatus: 'ditutup', presensi: 'ditutup', img: IMG.industri,
    ringkasan: 'Transformasi industri menuju praktik berkelanjutan yang ramah lingkungan dan efisien.',
    deskripsi: 'Seminar tentang transformasi industri menuju praktik berkelanjutan yang ramah lingkungan dan efisien.',
    manfaat: 'Studi kasus industri, diskusi panel, dan sertifikat kehadiran.', target: 'Profesional industri dan akademisi',
    pemateri: 'Dr. Hendra Wijaya, M.Eng.', peran: 'Peneliti Industri Berkelanjutan',
    target_: { daftar: 76, hadir: 70, pending: 0, ditolak: 1 }, submission: 'menunggu-mitra', nomorSk: 'WII/UNAND/001/2026' },
  { slug: 'ai-transformasi-digital', nama: 'Seminar Nasional AI & Transformasi Digital', jenis: 'Seminar', mode: 'online', tema: 'Teknologi', partner: 'telkom', sumber: 'UNAND', loc: null, mulai: '2026-05-28', selesai: '2026-05-28', jam: ['09:00', '12:30'], buka: '2026-05-20', tutup: '2026-05-27', kuota: 150, status: 'publik', daftarStatus: 'belum-dibuka', presensi: 'belum-dibuka', img: IMG.ai, meeting: 'https://zoom.us/j/9876543210',
    ringkasan: 'Mendalami implementasi kecerdasan buatan terapan dan peluang karier teknologi masa depan.',
    deskripsi: 'Seminar daring nasional mengenai akselerasi implementasi AI dan transformasi digital industri.',
    manfaat: 'Wawasan implementasi AI, sertifikat kehadiran, dan jejaring praktisi industri.', target: 'Mahasiswa, akademisi, dan praktisi IT',
    pemateri: 'Dr. Eng. Ir. Taufik Hidayat, M.T.', peran: 'AI Research Lead & Dosen Tamu',
    target_: { daftar: 0, hadir: 0, pending: 0, ditolak: 0 }, submission: null },
  { slug: 'publikasi-jurnal-scopus', nama: 'Webinar Publikasi Artikel Ilmiah Bereputasi', jenis: 'Seminar', mode: 'online', tema: 'Riset & Inovasi', partner: null, sumber: 'UNAND', loc: null, mulai: '2026-06-20', selesai: '2026-06-20', jam: ['13:30', '16:00'], buka: '2026-05-15', tutup: '2026-06-18', kuota: 40, waitingList: false, status: 'publik', daftarStatus: 'dibuka', presensi: 'belum-dibuka', img: IMG.write,
    ringkasan: 'Panduan praktis penulisan manuskrip jurnal internasional terindeks Scopus.',
    deskripsi: 'Sesi webinar pendampingan penulisan karya ilmiah, kiat memilih jurnal yang tepat, dan strategi menanggapi reviewer.',
    manfaat: 'Kiat publikasi dari reviewer berpengalaman dan sertifikat kehadiran.', target: 'Dosen, peneliti, mahasiswa pascasarjana, dan mahasiswa tingkat akhir',
    pemateri: 'Prof. Dr. Hendra Gunawan', peran: 'Reviewer Senior & Peneliti UNAND',
    target_: { daftar: 40, hadir: 0, pending: 0, ditolak: 0 }, submission: null },
  { slug: 'public-speaking', nama: 'Public Speaking untuk Profesional Muda', jenis: 'Workshop', mode: 'offline', tema: 'Pengembangan Diri', partner: null, sumber: 'UNAND', loc: 'auditorium', mulai: '2026-04-12', selesai: '2026-04-12', jam: ['09:00', '12:00'], buka: '2026-03-20', tutup: '2026-04-10', kuota: 60, status: 'selesai', daftarStatus: 'ditutup', presensi: 'ditutup', img: IMG.lead,
    ringkasan: 'Membangun kepercayaan diri dan kemampuan berbicara di depan publik.',
    deskripsi: 'Pelatihan komunikasi publik dengan praktik presentasi dan umpan balik dari pemateri.',
    manfaat: 'Praktik presentasi, umpan balik personal, dan sertifikat.', target: 'Mahasiswa dan profesional muda',
    pemateri: 'Tim Pengembangan Karier UNAND', peran: 'Praktisi Komunikasi',
    target_: { daftar: 39, hadir: 35, pending: 0, ditolak: 0 }, submission: 'diterbitkan', nomorSk: 'WPS/UNAND/001/2026' },
  { slug: 'penulisan-artikel-ilmiah', nama: 'Workshop Penulisan Artikel Ilmiah UNAND', jenis: 'Workshop', mode: 'offline', tema: 'Riset & Inovasi', partner: null, sumber: 'UNAND', loc: 'ch-a', mulai: '2026-04-15', selesai: '2026-04-15', jam: ['09:00', '12:00'], buka: '2026-03-25', tutup: '2026-04-13', kuota: 50, status: 'selesai', daftarStatus: 'ditutup', presensi: 'ditutup', img: IMG.write,
    ringkasan: 'Teknik menulis artikel ilmiah yang runtut dan siap dipublikasikan.',
    deskripsi: 'Kegiatan pengembangan kompetensi penulisan artikel ilmiah bersama tim dosen UNAND.',
    manfaat: 'Pendampingan penulisan dan sertifikat.', target: 'Mahasiswa dan peserta umum',
    pemateri: 'Tim Pemateri UNAND', peran: 'Pemateri kegiatan',
    target_: { daftar: 29, hadir: 25, pending: 0, ditolak: 0 }, submission: 'diterbitkan', nomorSk: 'WPA/UNAND/001/2026' },
  { slug: 'desain-grafis', nama: 'Workshop Desain Grafis', jenis: 'Workshop', mode: 'offline', tema: 'Kreatif & Desain', partner: 'semen', sumber: 'Mitra', loc: 'ch-a', mulai: '2026-04-15', selesai: '2026-04-15', jam: ['09:00', '12:00'], buka: '2026-03-25', tutup: '2026-04-13', kuota: 40, status: 'selesai', daftarStatus: 'ditutup', presensi: 'ditutup', img: IMG.team,
    ringkasan: 'Dasar-dasar desain grafis untuk komunikasi visual yang efektif.',
    deskripsi: 'Kegiatan pengembangan kompetensi desain grafis bersama PT Semen Padang.',
    manfaat: 'Praktik desain dan sertifikat.', target: 'Mahasiswa dan peserta umum',
    pemateri: 'Tim Pemateri', peran: 'Pemateri kegiatan',
    target_: { daftar: 29, hadir: 26, pending: 0, ditolak: 0 }, submission: 'diterbitkan', nomorSk: 'WDG/UNAND/001/2026' },
  { slug: 'metodologi-penelitian', nama: 'Workshop Metodologi Penelitian', jenis: 'Workshop', mode: 'offline', tema: 'Riset & Inovasi', partner: null, sumber: 'UNAND', loc: 'ch-a', mulai: '2026-04-15', selesai: '2026-04-15', jam: ['13:00', '16:00'], buka: '2026-03-25', tutup: '2026-04-13', kuota: 50, status: 'selesai', daftarStatus: 'ditutup', presensi: 'ditutup', img: IMG.riset,
    ringkasan: 'Menyusun rancangan penelitian yang kuat dan terukur.',
    deskripsi: 'Kegiatan pengembangan kompetensi metodologi penelitian bersama tim dosen UNAND.',
    manfaat: 'Konsultasi rancangan penelitian dan sertifikat.', target: 'Mahasiswa dan peserta umum',
    pemateri: 'Tim Pemateri UNAND', peran: 'Pemateri kegiatan',
    target_: { daftar: 24, hadir: 21, pending: 0, ditolak: 0 }, submission: 'diterbitkan', nomorSk: 'WMT/UNAND/001/2026' },
  { slug: 'seminar-teknologi-informasi', nama: 'Seminar Teknologi Informasi', jenis: 'Seminar', mode: 'offline', tema: 'Teknologi', partner: 'semen', sumber: 'Mitra', loc: 'ch', mulai: '2026-04-15', selesai: '2026-04-15', jam: ['09:00', '12:00'], buka: '2026-03-25', tutup: '2026-04-13', kuota: 80, status: 'selesai', daftarStatus: 'ditutup', presensi: 'ditutup', img: IMG.ai,
    ringkasan: 'Perkembangan teknologi informasi terkini dan penerapannya di industri.',
    deskripsi: 'Kegiatan pengembangan kompetensi teknologi informasi bersama PT Semen Padang.',
    manfaat: 'Wawasan teknologi dan sertifikat.', target: 'Mahasiswa dan peserta umum',
    pemateri: 'Tim Pemateri', peran: 'Pemateri kegiatan',
    target_: { daftar: 34, hadir: 30, pending: 0, ditolak: 0 }, submission: 'diterbitkan', nomorSk: 'STI/UNAND/001/2026' },
  { slug: 'digital-marketing', nama: 'Workshop Digital Marketing', jenis: 'Workshop', mode: 'offline', tema: 'Bisnis & Pemasaran', partner: 'semen', sumber: 'Mitra', loc: 'ch-a', mulai: '2026-11-05', selesai: '2026-11-05', jam: ['09:00', '15:00'], buka: '2026-10-15', tutup: '2026-11-03', kuota: 40, status: 'selesai', daftarStatus: 'ditutup', presensi: 'ditutup', img: IMG.seminar,
    ringkasan: 'Strategi pemasaran digital untuk bisnis dan organisasi.',
    deskripsi: 'Workshop strategi pemasaran digital, pengelolaan media sosial, dan analitik kampanye.',
    manfaat: 'Praktik kampanye digital dan sertifikat.', target: 'Mahasiswa dan pelaku usaha',
    pemateri: 'Rina Kartika, M.M.', peran: 'Digital Marketing Strategist',
    target_: { daftar: 38, hadir: 35, pending: 0, ditolak: 0 }, submission: 'menunggu-mitra', nomorSk: 'WDM/UNAND/001/2026' },
  { slug: 'kewirausahaan', nama: 'Seminar Kewirausahaan', jenis: 'Seminar', mode: 'offline', tema: 'Bisnis & Pemasaran', partner: 'semen', sumber: 'Mitra', loc: 'auditorium', mulai: '2026-11-03', selesai: '2026-11-03', jam: ['08:30', '12:00'], buka: '2026-10-10', tutup: '2026-11-01', kuota: 60, status: 'selesai', daftarStatus: 'ditutup', presensi: 'ditutup', img: IMG.lead,
    ringkasan: 'Membangun pola pikir wirausaha dan peluang usaha baru.',
    deskripsi: 'Seminar kewirausahaan bersama praktisi industri untuk membangun pola pikir dan peluang usaha.',
    manfaat: 'Inspirasi usaha, jejaring, dan sertifikat.', target: 'Mahasiswa dan umum',
    pemateri: 'Hendra Saputra, S.E.', peran: 'Wirausahawan & Mentor Bisnis',
    target_: { daftar: 55, hadir: 50, pending: 0, ditolak: 0 }, submission: 'menunggu-mitra', perluRektor: false, nomorSk: 'SK/UNAND/001/2026' },
  { slug: 'ui-ux-design-system', nama: 'Workshop UI/UX Design System', jenis: 'Workshop', mode: 'offline', tema: 'Kreatif & Desain', partner: 'semen', sumber: 'Mitra', loc: 'ch-a', mulai: '2026-04-08', selesai: '2026-04-08', jam: ['09:00', '15:00'], buka: '2026-03-15', tutup: '2026-04-06', kuota: 50, status: 'selesai', daftarStatus: 'ditutup', presensi: 'ditutup', img: IMG.team,
    ringkasan: 'Membangun design system yang konsisten untuk produk digital.',
    deskripsi: 'Workshop perancangan design system, komponen UI, dan dokumentasi desain.',
    manfaat: 'Praktik membangun komponen dan sertifikat.', target: 'Mahasiswa dan desainer',
    pemateri: 'Dimas Prakoso', peran: 'Lead Product Designer',
    target_: { daftar: 48, hadir: 45, pending: 0, ditolak: 0 }, submission: 'diterbitkan', perluRektor: false, nomorSk: 'WUI/UNAND/001/2026' },
  { slug: 'keamanan-digital', nama: 'Literasi dan Keamanan Digital', jenis: 'Workshop', mode: 'online', tema: 'Teknologi', partner: 'fti', sumber: 'UNAND', loc: null, mulai: '2026-05-18', selesai: '2026-05-18', jam: ['09:00', '12:00'], buka: '2026-05-01', tutup: '2026-05-16', kuota: 80, status: 'berlangsung', daftarStatus: 'ditutup', presensi: 'dibuka', img: IMG.ai, meeting: 'https://zoom.us/j/5550001111',
    ringkasan: 'Perlindungan data pribadi dan kebiasaan aman di layanan digital.',
    deskripsi: 'Pelajari perlindungan data pribadi dan kebiasaan aman saat menggunakan layanan digital.',
    manfaat: 'Panduan keamanan digital dan sertifikat.', target: 'Mahasiswa dan umum',
    pemateri: 'Rahmat Hidayat, M.Kom.', peran: 'Dosen Keamanan Siber',
    target_: { daftar: 30, hadir: 20, pending: 4, ditolak: 1 }, submission: null },
  { slug: 'klinik-publikasi-ilmiah', nama: 'Klinik Penulisan Publikasi Ilmiah', jenis: 'Pelatihan', mode: 'online', tema: 'Riset & Inovasi', partner: null, sumber: 'UNAND', loc: null, mulai: '2026-05-18', selesai: '2026-05-18', jam: ['13:00', '16:00'], buka: '2026-05-01', tutup: '2026-05-16', kuota: 60, status: 'berlangsung', daftarStatus: 'ditutup', presensi: 'dibuka', img: IMG.write, meeting: 'https://zoom.us/j/5550002222',
    ringkasan: 'Latihan penulisan dan penyuntingan artikel ilmiah bersama pembimbing.',
    deskripsi: 'Latihan penulisan dan penyuntingan artikel ilmiah bersama pembimbing.',
    manfaat: 'Pendampingan naskah dan sertifikat.', target: 'Mahasiswa dan dosen',
    pemateri: 'Dr. Lestari Handayani', peran: 'Editor Jurnal',
    target_: { daftar: 25, hadir: 15, pending: 3, ditolak: 1 }, submission: null },
  { slug: 'inovasi-kampus', nama: 'Pengembangan Inovasi Kampus', jenis: 'Workshop', mode: 'offline', tema: 'Riset & Inovasi', partner: null, sumber: 'UNAND', loc: 'fisip', mulai: '2026-05-30', selesai: '2026-05-30', jam: ['09:00', '12:00'], buka: '2026-05-01', tutup: '2026-05-28', kuota: 50, status: 'dibatalkan', daftarStatus: 'ditutup', presensi: 'belum-dibuka', img: IMG.riset,
    ringkasan: 'Kegiatan dibatalkan oleh panitia.',
    deskripsi: 'Kegiatan dibatalkan oleh panitia. Pendaftaran dan presensi tidak tersedia.',
    manfaat: '-', target: 'Mahasiswa',
    pemateri: 'Tim Inovasi UNAND', peran: 'Pemateri kegiatan',
    target_: { daftar: 10, hadir: 0, pending: 0, ditolak: 0 }, submission: null },
  { slug: 'proposal-hibah', nama: 'Pelatihan Penulisan Proposal Hibah', jenis: 'Pelatihan', mode: 'offline', tema: 'Riset & Inovasi', partner: null, sumber: 'UNAND', loc: 'rektorat-aula', mulai: '2026-07-10', selesai: '2026-07-10', jam: ['08:30', '15:00'], buka: '2026-06-15', tutup: '2026-07-08', kuota: 70, status: 'draft', daftarStatus: 'belum-dibuka', presensi: 'belum-dibuka', img: IMG.write,
    ringkasan: 'Menyusun proposal hibah penelitian yang kompetitif.',
    deskripsi: 'Pelatihan penyusunan proposal hibah penelitian dan pengabdian yang kompetitif.',
    manfaat: 'Review proposal dan sertifikat.', target: 'Dosen dan peneliti',
    pemateri: 'Prof. Dr. Yuliandri', peran: 'Reviewer Hibah Nasional',
    target_: { daftar: 0, hadir: 0, pending: 0, ditolak: 0 }, submission: null },
];

const FIRST = ['Rafi', 'Siti', 'Dewi', 'Eko', 'Sari', 'Wahyu', 'Fajar', 'Andi', 'Rizky', 'Dinda', 'Budi', 'Maya', 'Citra', 'Rendra', 'Putri', 'Arif', 'Intan', 'Yusuf', 'Laila', 'Bagas', 'Nurul', 'Hendra', 'Tika', 'Fikri', 'Annisa', 'Dimas', 'Rani', 'Ilham', 'Wulan', 'Gilang', 'Fitri', 'Rehan', 'Aulia', 'Zaki', 'Salsabila', 'Reza', 'Mutiara', 'Farhan', 'Indah', 'Galih'];
const LAST = ['Pratama', 'Rahmah', 'Putri', 'Prasetyo', 'Indah', 'Hidayat', 'Nugroho', 'Saputra', 'Permata', 'Santoso', 'Anggraini', 'Kirana', 'Kurnia', 'Lestari', 'Syahputra', 'Maharani', 'Ramadhan', 'Fadilah', 'Wijaya', 'Kusuma', 'Firmansyah', 'Utami', 'Setiawan', 'Aprilia', 'Harahap'];
const JENIS = ['Mahasiswa', 'Mahasiswa', 'Mahasiswa', 'Umum', 'Dosen', 'Profesional'];
const ROMAN = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X', 'XI', 'XII'];

const dt = (date, time = '09:00') => `${date} ${time}:00`;
function addDays(iso, n) {
  const d = new Date(`${iso}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + n);
  return d.toISOString().slice(0, 10);
}
function daysBetween(a, b) {
  return Math.round((Date.parse(`${b}T00:00:00Z`) - Date.parse(`${a}T00:00:00Z`)) / 86400000);
}

async function insert(conn, table, row) {
  const keys = Object.keys(row);
  const [res] = await conn.query(
    `INSERT INTO \`${table}\` (${keys.map((k) => `\`${k}\``).join(',')}) VALUES (${keys.map(() => '?').join(',')})`,
    keys.map((k) => row[k])
  );
  return res.insertId;
}

async function seed() {
  const conn = await mysql.createConnection({ ...config.db, multipleStatements: true });
  console.log('[Seed] Mengosongkan tabel...');
  await conn.query('SET FOREIGN_KEY_CHECKS = 0');
  for (const t of ['notifications', 'certificate_corrections', 'certificates', 'certificate_submissions', 'certificate_templates', 'attendance_tokens', 'attendances', 'registrations', 'workshops', 'locations', 'users', 'partners', 'roles']) {
    await conn.query(`TRUNCATE TABLE \`${t}\``);
  }
  await conn.query('SET FOREIGN_KEY_CHECKS = 1');

  const passwordHash = await bcrypt.hash(DEMO_PASSWORD, 10);
  const pinHash = await bcrypt.hash(DEMO_PIN, 10);

  // ── Roles
  const roleId = {};
  for (const [code, name, description] of ROLES) {
    roleId[code] = await insert(conn, 'roles', { code, name, description });
  }

  // ── Partners
  const partnerId = {};
  for (const p of PARTNERS) {
    partnerId[p.key] = await insert(conn, 'partners', {
      nama: p.nama, jenis: p.jenis, penanggung_jawab: p.pj, email: p.email, kontak: p.kontak, bidang_usaha: p.bidang, alamat: p.alamat,
    });
  }

  // ── Locations
  const locationId = {};
  for (const l of LOCATIONS) {
    locationId[l.key] = await insert(conn, 'locations', {
      gedung: l.gedung, ruangan: l.ruangan, lokasi: l.lokasi, latitude: l.lat, longitude: l.lng, radius: l.radius,
    });
  }

  // ── Akun demo per role
  const user = (o) => insert(conn, 'users', { password_hash: passwordHash, status: 'Aktif', ...o });
  const pesertaDemo = await user({ role_id: roleId.peserta, nama: 'Nadia Amelia', email: 'peserta@unand.ac.id', telepon: '0812 6789 4321', jenis_peserta: 'Mahasiswa', nim: '2111522017', prodi: 'Sistem Informasi' });
  const humasDemo = await user({ role_id: roleId.humas, nama: 'Nadia Amelia', email: 'humas@unand.ac.id', telepon: '0812 3456 7890', jabatan: 'Staff Humas Universitas Andalas', unit_kerja: 'Humas Universitas Andalas', nip: '19900512 201503 2 004' });
  await user({ role_id: roleId.sekretariat, nama: 'Rini Marlina', email: 'sekretariat@unand.ac.id', telepon: '0812 5789 4321', jabatan: 'Staf Sekretariat Rektor', unit_kerja: 'Sekretariat Pimpinan UNAND', nip: '19840315 200812 2 001' });
  const mitraDemo = await user({ role_id: roleId.mitra, partner_id: partnerId.semen, nama: 'Ahmad Rizal', email: 'mitra@unand.ac.id', telepon: '0812 6789 4321', jabatan: 'Penanggung jawab instansi', pin_hash: pinHash });
  const rektorDemo = await user({ role_id: roleId.rektor, nama: 'Prof. Andani Eka Putra', email: 'rektor@unand.ac.id', telepon: '0812 6789 4321', jabatan: 'Rektor Universitas Andalas', unit_kerja: 'Pimpinan Universitas Andalas', nip: '19720406 199903 1 002', pin_hash: pinHash });
  await user({ role_id: roleId.mitra, partner_id: partnerId.nagari, nama: 'Dewi Anggraini', email: 'mitra.banknagari@unand.ac.id', jabatan: 'Penanggung jawab instansi', pin_hash: pinHash });
  await user({ role_id: roleId.mitra, partner_id: partnerId.telkom, nama: 'Yoga Pratama', email: 'mitra.telkom@unand.ac.id', jabatan: 'Penanggung jawab instansi', pin_hash: pinHash });

  // ── Peserta dummy
  console.log('[Seed] Membuat peserta...');
  const peserta = [];
  const usedNames = new Set(['Nadia Amelia']);
  while (peserta.length < 130) {
    const nama = `${pick(FIRST)} ${pick(LAST)}`;
    if (usedNames.has(nama)) continue;
    usedNames.add(nama);
    const jenis = pick(JENIS);
    const slug = nama.toLowerCase().replace(/[^a-z]+/g, '.');
    const id = await user({
      role_id: roleId.peserta, nama, jenis_peserta: jenis,
      email: `${slug}@${jenis === 'Mahasiswa' ? 'student.unand.ac.id' : 'email.com'}`,
      telepon: `08${Math.floor(1e9 + rand() * 9e9)}`,
      nim: jenis === 'Mahasiswa' ? `21${Math.floor(10000000 + rand() * 89999999)}` : null,
      prodi: jenis === 'Mahasiswa' ? pick(['Sistem Informasi', 'Teknik Komputer', 'Informatika', 'Manajemen', 'Akuntansi', 'Ilmu Komunikasi']) : null,
    });
    peserta.push({ id, nama });
  }

  // ── Workshops + pendaftaran + presensi
  console.log('[Seed] Membuat kegiatan, pendaftaran, dan presensi...');
  const ws = {};
  for (const w of WORKSHOPS) {
    const partner = w.partner ? PARTNERS.find((p) => p.key === w.partner) : null;
    const loc = w.loc ? LOCATIONS.find((l) => l.key === w.loc) : null;
    const id = await insert(conn, 'workshops', {
      slug: w.slug, nama: w.nama, jenis: w.jenis, mode: w.mode, tema: w.tema,
      ringkasan: w.ringkasan, deskripsi: w.deskripsi, manfaat: w.manfaat, target_peserta: w.target,
      pemateri: w.pemateri, pemateri_peran: w.peran,
      partner_id: w.partner ? partnerId[w.partner] : null,
      penyelenggara: partner ? partner.nama : 'Universitas Andalas',
      sumber: w.sumber, location_id: loc ? locationId[loc.key] : null,
      tempat: w.mode === 'online' ? 'Online (Zoom Meeting)' : null,
      meeting_url: w.meeting || null,
      tanggal_mulai: w.mulai, tanggal_selesai: w.selesai, waktu_mulai: w.jam[0], waktu_selesai: w.jam[1],
      pembukaan: w.buka, penutupan: w.tutup, kuota: w.kuota, waiting_list: w.waitingList === false ? 0 : 1,
      status: w.status, status_pendaftaran: w.daftarStatus, status_presensi: w.presensi,
      image_url: w.img, created_by: humasDemo,
    });
    ws[w.slug] = { ...w, id };

    // Pilih peserta dummy secara acak untuk kegiatan ini
    const pool = [...peserta].sort(() => rand() - 0.5);
    const days = daysBetween(w.mulai, w.selesai) + 1;
    const t = w.target_;
    const finished = w.status === 'selesai';
    let cursor = 0;
    const regTime = dt(addDays(w.buka, Math.floor(rand() * Math.max(1, daysBetween(w.buka, w.tutup)))), '10:00');

    const addReg = async (u, status, queue = null) => insert(conn, 'registrations', {
      workshop_id: id, user_id: u.id, status, queue_no: queue,
      registered_at: dt(addDays(w.buka, Math.floor(rand() * Math.max(1, daysBetween(w.buka, w.tutup)))), `${String(8 + Math.floor(rand() * 10)).padStart(2, '0')}:${String(Math.floor(rand() * 60)).padStart(2, '0')}`),
    });
    const addAtt = async (regId, day, status, method = 'qr-location', extra = {}) => insert(conn, 'attendances', {
      registration_id: regId, tanggal: addDays(w.mulai, day), status, method,
      submitted_at: dt(addDays(w.mulai, day), `${String(8 + Math.floor(rand() * 2)).padStart(2, '0')}:${String(Math.floor(rand() * 60)).padStart(2, '0')}`),
      verified_at: status === 'hadir' || status === 'ditolak' ? dt(addDays(w.mulai, day), '12:00') : null,
      verified_by: status === 'hadir' || status === 'ditolak' ? humasDemo : null,
      ...extra,
    });

    for (let i = 0; i < t.daftar; i += 1) {
      const u = pool[cursor++];
      const regId = await addReg(u, finished ? 'selesai' : 'terdaftar');
      for (let d = 0; d < days; d += 1) {
        if (i < t.hadir) await addAtt(regId, d, 'hadir');
        else if (i < t.hadir + t.pending) await addAtt(regId, d, 'pending', w.mode === 'online' ? 'upload' : 'qr-location', w.mode === 'online' ? { file_name: `bukti-${u.nama.split(' ')[0].toLowerCase()}.png` } : {});
        else if (i < t.hadir + t.pending + t.ditolak) await addAtt(regId, d, 'ditolak', 'upload', { file_name: 'bukti.png', alasan_tolak: 'Nama peserta tidak terlihat pada bukti kehadiran.' });
        else if (finished) await addAtt(regId, d, 'tidak-hadir', 'manual');
      }
    }
    for (let q = 1; q <= (t.waiting || 0); q += 1) await addReg(pool[cursor++], 'waiting', q);
    void regTime;
  }

  // ── Pendaftaran peserta demo (Nadia Amelia) dengan beragam status
  const demoReg = async (slug, status, opts = {}) => {
    const w = ws[slug];
    const regId = await insert(conn, 'registrations', {
      workshop_id: w.id, user_id: pesertaDemo, status, queue_no: opts.queue || null, registered_at: dt(w.buka, '09:30'),
      cancelled_at: status === 'dibatalkan' ? dt(addDays(w.buka, 2), '10:00') : null,
    });
    if (opts.att) {
      await insert(conn, 'attendances', {
        registration_id: regId, tanggal: w.mulai, status: opts.att, method: opts.method || 'qr-location',
        file_name: opts.file || null, alasan_tolak: opts.reason || null, submitted_at: dt(w.mulai, '09:05'),
        verified_at: ['hadir', 'ditolak'].includes(opts.att) ? dt(w.mulai, '11:00') : null,
        verified_by: ['hadir', 'ditolak'].includes(opts.att) ? humasDemo : null,
      });
    }
    return regId;
  };
  await demoReg('data-science', 'terdaftar');
  await demoReg('hilirisasi-riset', 'waiting', { queue: 4 });
  await demoReg('kepemimpinan-muda', 'terdaftar');
  await demoReg('keamanan-digital', 'terdaftar', { att: 'pending', method: 'upload', file: 'bukti-keamanan-digital.png' });
  await demoReg('klinik-publikasi-ilmiah', 'terdaftar', { att: 'ditolak', method: 'upload', file: 'bukti-publikasi.png', reason: 'Nama peserta belum terlihat pada tangkapan layar. Unggah ulang bukti yang menampilkan nama dan sesi kegiatan.' });
  await demoReg('inovasi-kampus', 'terdaftar');
  for (const slug of ['public-speaking', 'manajemen-proyek', 'penulisan-artikel-ilmiah', 'desain-grafis', 'metodologi-penelitian', 'seminar-teknologi-informasi']) {
    await demoReg(slug, 'selesai', { att: 'hadir' });
  }

  // ── Template sertifikat
  console.log('[Seed] Membuat template & pengajuan sertifikat...');
  const libraryTemplates = [
    ['Desain Klasik Hijau & Garis Emas', 'klasik', 'Klasik & Formal', '#14532d', '1.8 MB (PDF)', 'Desain formal berbingkai ganda hijau tua UNAND dengan ornamen sudut emas klasik dan font serif elegan.', '2026-05-10'],
    ['Desain Modern Minimalis Teal', 'modern', 'Modern & Bersih', '#0d9488', '2.1 MB (PDF)', 'Tata letak modern kontemporer dengan pita warna teal di sisi samping, tipografi bersih, dan aksen geometris.', '2026-05-08'],
    ['Desain Emas Mewah & Royal', 'royal-gold', 'Eksklusif & Prestasi', '#b45309', '2.4 MB (PDF)', 'Bingkai gradien emas berkilau dengan medali lencana digital dan latar belakang krem lembut mewah.', '2026-05-05'],
    ['Desain Biru Navy Formal Akademik', 'navy-formal', 'Institusional & Kemitraan', '#1e3a8a', '1.9 MB (PDF)', 'Gaya institusional resmi berbingkai biru dongker dengan aksen garis baja ganda dan stempel sertifikasi.', '2026-05-02'],
  ];
  for (const [nama, key, kategori, warna, ukuran, deskripsi, tgl] of libraryTemplates) {
    await insert(conn, 'certificate_templates', {
      nama, desain_key: key, kategori, penerbit: 'Universitas Andalas', status: 'dapat-dipakai', warna_utama: warna, ukuran, deskripsi, is_library: 1, berkas_nama: `${nama}.pdf`, created_at: dt(tgl),
    });
  }
  const tplId = {};
  for (const w of WORKSHOPS.filter((x) => x.submission || x.slug === 'data-science')) {
    const isMitra = w.sumber === 'Mitra';
    const nama = `Template ${isMitra ? 'Mitra' : 'UNAND'} — ${w.nama.replace(/^(Workshop|Seminar) /, '')}`;
    tplId[w.slug] = await insert(conn, 'certificate_templates', {
      nama, desain_key: isMitra ? 'navy-formal' : 'klasik', kategori: isMitra ? 'Institusional & Kemitraan' : 'Klasik & Formal',
      penerbit: isMitra ? ws[w.slug].penyelenggara || 'PT Semen Padang' : 'UNAND',
      partner_id: isMitra && w.partner ? partnerId[w.partner] : null,
      workshop_id: ws[w.slug].id,
      status: w.submission === 'diterbitkan' ? 'diterbitkan' : w.submission ? 'dipakai' : 'dapat-dipakai',
      warna_utama: isMitra ? '#1e3a8a' : '#14532d', berkas_nama: `${nama}.pdf`, ukuran: '1.6 MB (PDF)',
    });
  }
  // Template mitra tambahan yang belum dipakai
  await insert(conn, 'certificate_templates', { nama: 'Template Mitra — Data Science', desain_key: 'navy-formal', kategori: 'Institusional & Kemitraan', penerbit: 'PT Semen Padang', partner_id: partnerId.semen, workshop_id: ws['data-science'].id, status: 'dipakai', warna_utama: '#1e3a8a', berkas_nama: 'Template Mitra — Data Science.pdf' });

  // ── Pengajuan sertifikat & sertifikat individual
  const certSeq = { UNAND: 1000, Mitra: 0 };
  const certIds = {};
  for (const w of WORKSHOPS.filter((x) => x.submission)) {
    const id = ws[w.slug].id;
    const perluMitra = !!w.partner;
    const perluRektor = w.perluRektor !== false;
    const pengajuan = dt(addDays(w.selesai, w.status === 'selesai' ? 3 : 0), '09:00');
    const mitraSigned = w.submission !== 'menunggu-mitra' && perluMitra;
    const rektorSigned = w.submission === 'diterbitkan' && perluRektor;
    await insert(conn, 'certificate_submissions', {
      workshop_id: id, template_id: tplId[w.slug] || null, nomor_sk: w.nomorSk,
      perlu_mitra: perluMitra ? 1 : 0, perlu_rektor: perluRektor ? 1 : 0, status: w.submission,
      tanggal_pengajuan: pengajuan, diajukan_oleh: humasDemo,
      mitra_signed_at: mitraSigned ? dt(addDays(w.selesai, 3), '10:15') : null, mitra_signed_by: mitraSigned ? mitraDemo : null,
      rektor_signed_at: rektorSigned ? dt(addDays(w.selesai, 5), '14:00') : null, rektor_signed_by: rektorSigned ? rektorDemo : null,
    });

    if (w.submission !== 'diterbitkan') continue;
    // Terbitkan sertifikat untuk setiap peserta yang hadir valid
    const [rows] = await conn.query(
      `SELECT r.user_id, u.nama FROM registrations r JOIN users u ON u.id = r.user_id
       WHERE r.workshop_id = ? AND EXISTS (SELECT 1 FROM attendances a WHERE a.registration_id = r.id AND a.status = 'hadir')
       ORDER BY r.id`, [id]
    );
    const month = ROMAN[Number(w.selesai.slice(5, 7)) - 1];
    const year = w.selesai.slice(0, 4);
    for (const r of rows) {
      const isDemo = r.user_id === pesertaDemo;
      let nomor;
      let code;
      if (w.sumber === 'Mitra') {
        certSeq.Mitra += 1;
        nomor = `SRT-SP-${year}-${String(certSeq.Mitra).padStart(3, '0')}`;
        code = `mitra-${String(certSeq.Mitra).padStart(3, '0')}`;
      } else {
        certSeq.UNAND += 1;
        nomor = `${certSeq.UNAND}/UN16/WS/${month}/${year}`;
        code = `unand-${certSeq.UNAND}`;
      }
      // Nomor sertifikat demo mengikuti contoh di portal peserta
      const demoNumbers = {
        'public-speaking': ['042/UN16/WS/IV/2026', 'unand-042'],
        'manajemen-proyek': ['DEMO/Mitra/4/2026', 'mitra-demo-004'],
        'penulisan-artikel-ilmiah': ['UNAND/SERT/1004/2026', 'unand-demo-1004'],
        'desain-grafis': ['DEMO/Mitra/5/2026', 'mitra-demo-005'],
        'metodologi-penelitian': ['UNAND/SERT/1005/2026', 'unand-demo-1005'],
        'seminar-teknologi-informasi': ['DEMO/Mitra/6/2026', 'mitra-demo-006'],
      };
      if (isDemo && demoNumbers[w.slug]) [nomor, code] = demoNumbers[w.slug];
      const certId = await insert(conn, 'certificates', {
        code, workshop_id: id, user_id: r.user_id, nomor,
        nama_penerima: isDemo && w.slug === 'metodologi-penelitian' ? 'Nadia Amela' : r.nama,
        jenis: w.jenis, issued_at: addDays(w.selesai, 3),
      });
      certIds[`${w.slug}:${r.user_id}`] = certId;
    }
  }

  // ── Perbaikan sertifikat
  console.log('[Seed] Membuat pengajuan perbaikan sertifikat...');
  const corr = async (code, slug, uid, status, change, date, extra = {}) => {
    const certificateId = certIds[`${slug}:${uid}`];
    if (!certificateId) return;
    const at = (h) => `${date}T${h}:00+07:00`;
    const events = [{ status: 'menunggu', at: at('10:15'), note: 'Pengajuan diterima oleh penerbit.' }];
    if (status !== 'menunggu') events.push({ status, at: at('11:30'), note: extra.issuer_note || 'Status diperbarui oleh penerbit.' });
    await insert(conn, 'certificate_corrections', {
      code, certificate_id: certificateId, user_id: uid, status,
      changes: JSON.stringify([change]),
      reason: extra.reason || 'Mohon menyesuaikan data pada sertifikat dengan identitas peserta.',
      events: JSON.stringify(events),
      notification_read: ['selesai', 'ditolak'].includes(status) ? 0 : 1,
      created_at: `${date} 10:15:00`, updated_at: `${date} ${status === 'menunggu' ? '10:15' : '11:30'}:00`,
      issuer_note: extra.issuer_note || null, replacement_number: extra.replacement_number || null,
      replacement_issued: extra.replacement_issued || null, tte_status: extra.tte_status || 'tidak-perlu',
    });
  };
  await corr('PB-2026-1004', 'penulisan-artikel-ilmiah', pesertaDemo, 'diproses', { field: 'recipient', label: 'Nama peserta', oldValue: 'Nadia Amelia', newValue: 'Nadia Amelia Putri' }, '2026-05-17', { issuer_note: 'Penerbit sedang memeriksa kesesuaian nama dengan data peserta.' });
  await corr('PB-2026-1005', 'desain-grafis', pesertaDemo, 'menunggu', { field: 'activity', label: 'Informasi kegiatan', oldValue: 'Workshop Desain Grafis', newValue: 'Workshop Desain Grafis dan Komunikasi Visual' }, '2026-05-17');
  await corr('PB-2026-1006', 'metodologi-penelitian', pesertaDemo, 'selesai', { field: 'recipient', label: 'Nama peserta', oldValue: 'Nadia Amela', newValue: 'Nadia Amelia' }, '2026-05-16', { issuer_note: 'Ejaan nama telah diperbaiki sesuai daftar peserta. Dokumen pengganti tersedia.', replacement_number: 'UNAND/SERT/1005/2026-R1', replacement_issued: '2026-05-16', tte_status: 'sedang-diproses' });
  await corr('PB-2026-1007', 'seminar-teknologi-informasi', pesertaDemo, 'ditolak', { field: 'degree', label: 'Gelar peserta', oldValue: '', newValue: 'S.Kom.' }, '2026-05-15', { issuer_note: 'Dokumen pendukung gelar belum tersedia. Ajukan kembali dengan bukti yang sesuai.' });

  // Perbaikan dari peserta lain (untuk portal mitra & humas)
  const [others] = await conn.query(
    `SELECT c.user_id, w.slug, c.nama_penerima FROM certificates c JOIN workshops w ON w.id = c.workshop_id
     WHERE c.user_id <> ? ORDER BY c.id`, [pesertaDemo]
  );
  const variants = [
    ['menunggu', 'recipient', 'Nama peserta', (n) => `${n} Putra`],
    ['diproses', 'degree', 'Gelar peserta', () => 'S.Kom'],
    ['selesai', 'recipient', 'Nama peserta', (n) => n.toUpperCase()],
    ['menunggu', 'degree', 'Gelar peserta', () => 'M.Kom'],
    ['selesai', 'recipient', 'Nama peserta', (n) => `${n}wati`],
    ['menunggu', 'recipient', 'Nama peserta', (n) => n.split(' ')[0]],
    ['ditolak', 'degree', 'Gelar peserta', () => 'S.T.'],
    ['diproses', 'recipient', 'Nama peserta', (n) => `${n} Sari`],
  ];
  const chosen = [];
  for (const slug of ['ui-ux-design-system', 'manajemen-proyek', 'desain-grafis', 'seminar-teknologi-informasi', 'public-speaking', 'penulisan-artikel-ilmiah']) {
    chosen.push(...others.filter((o) => o.slug === slug).slice(0, 2));
  }
  for (let i = 0; i < Math.min(variants.length, chosen.length); i += 1) {
    const [status, field, label, fn] = variants[i];
    const o = chosen[i];
    const day = String(8 - (i % 7)).padStart(2, '0');
    await corr(`PB-2026-${2001 + i}`, o.slug, o.user_id, status,
      { field, label, oldValue: field === 'recipient' ? o.nama_penerima : '', newValue: fn(o.nama_penerima) },
      `2026-11-${day}`,
      status === 'selesai' ? { issuer_note: 'Perbaikan disetujui. Dokumen pengganti diterbitkan.', replacement_number: `SRT-PB-2026-${2001 + i}`, replacement_issued: `2026-11-${day}`, tte_status: 'selesai' }
        : status === 'ditolak' ? { issuer_note: 'Dokumen pendukung belum sesuai.' } : {});
  }

  // ── Notifikasi
  await insert(conn, 'notifications', { role_code: 'humas', judul: 'Pengajuan Perbaikan Sertifikat Baru', deskripsi: 'Nadia Amelia · Workshop Penulisan Artikel Ilmiah', link: '/humas/perbaikan-sertifikat', created_at: '2026-05-17 10:15:00' });
  await insert(conn, 'notifications', { role_code: 'mitra', judul: 'Pengajuan Tanda Tangan Sertifikat', deskripsi: 'Workshop Digital Marketing menunggu TTE Anda', link: '/mitra/tanda-tangan', created_at: '2026-11-08 09:00:00' });
  await insert(conn, 'notifications', { role_code: 'rektor', judul: 'Sertifikat Menunggu Persetujuan', deskripsi: 'Workshop Data Science untuk Riset Akademik', link: '/rektor/pengajuan', created_at: '2026-05-18 10:15:00' });

  const [[counts]] = await conn.query(`SELECT
    (SELECT COUNT(*) FROM users) users, (SELECT COUNT(*) FROM workshops) workshops,
    (SELECT COUNT(*) FROM registrations) registrations, (SELECT COUNT(*) FROM attendances) attendances,
    (SELECT COUNT(*) FROM certificates) certificates, (SELECT COUNT(*) FROM certificate_corrections) corrections`);
  console.log('[Seed] Selesai:', counts);
  console.log(`[Seed] Akun demo: peserta|humas|sekretariat|mitra|rektor @unand.ac.id · kata sandi "${DEMO_PASSWORD}" · PIN TTE ${DEMO_PIN}`);
  await conn.end();
}

if (require.main === module) {
  seed().catch((err) => {
    console.error('[Seed] Gagal:', err);
    process.exit(1);
  });
}

module.exports = seed;

# Database Seeders - SIM Workshop UNAND

Folder ini berisi berkas data awal (seed data) untuk kebutuhan development dan testing.

## Data Awal Sistem (5 Aktor Utama)

Sistem Informasi Manajemen Workshop UNAND memiliki 5 aktor utama:
1. `peserta` (Mahasiswa, Dosen, atau Umum yang mendaftar dan mengikuti workshop)
2. `humas` (Humas UNAND - Mengelola kegiatan workshop, pendaftaran, dan laporan)
3. `sekretariat_rektor` (Sekretariat Rektor - Memverifikasi dan meneruskan permohonan sertifikat)
4. `rektor` (Rektor UNAND - Persetujuan akhir dan penandatanganan elektronik sertifikat)
5. `mitra` (Pihak mitra eksternal/internal penyelenggara workshop)

## Panduan Pengisian Seeder
- Gunakan data dummy yang realistis.
- Password awal wajib di-hash menggunakan bcrypt jika dimasukkan ke database pengguna.


# Frontend Workspace - SIM Workshop Universitas Andalas (UNAND)

Selamat datang di direktori frontend **Sistem Informasi Manajemen Workshop Universitas Andalas**. 

Direktori ini dirancang khusus untuk tim frontend developer. Repository ini menganut pola monorepo terpisah di mana backend dan frontend memiliki dependency, environment variable, dan proses development masing-masing.

---

## 1. Panduan Inisialisasi Framework Frontend

Karena framework frontend belum diputuskan secara final, folder ini sengaja dibiarkan fleksibel tanpa dependency awal.

Frontend developer dapat memilih salah satu framework berikut:

### Opsi A: React.js + Vite (Sangat Direkomendasikan)
Jalankan perintah ini di dalam direktori `frontend/`:
```bash
cd frontend
npm create vite@latest . -- --template react
npm install
npm install axios react-router-dom lucide-react tailwindcss
```

### Opsi B: Next.js
```bash
cd frontend
npx create-next-app@latest .
```

> **Penting**: Pastikan inisialisasi dilakukan langsung di dalam folder `frontend/` (bukan membuat subfolder baru di dalamnya).

---

## 2. Koneksi ke Backend API

- **Base URL Backend**: `http://localhost:5000/api/v1`
- **Health Check URL**: `http://localhost:5000/api/v1/health`
- **CORS**: Backend telah dikonfigurasi untuk mengizinkan request dari `http://localhost:5173` (Vite) dan `http://localhost:3000` (Create React App / Next.js).

### Konfigurasi Environment Variable
Salin file `.env.example` menjadi `.env`:
```bash
cp .env.example .env
```
Isi file `.env`:
```env
VITE_API_BASE_URL=http://localhost:5000/api/v1
```

---

## 3. Format Kontrak API Standar (JSON)

Semua endpoint backend mengembalikan payload dengan struktur JSON yang konsisten.

### Respon Berhasil (`HTTP 200 / 201`)
```json
{
  "success": true,
  "message": "Pesan deskriptif keberhasilan",
  "data": { ... }
}
```

### Respon Gagal (`HTTP 400 / 401 / 403 / 404 / 422 / 500`)
```json
{
  "success": false,
  "message": "Pesan deskriptif kesalahan",
  "errors": [
    "Detail pesan error atau validasi input"
  ]
}
```

---

## 4. Aktor dan Role Pengguna Sistem

Sistem memiliki 5 aktor utama dengan batasan hak akses:

1. **Peserta**
   - Melihat katalog workshop yang tersedia.
   - Mendaftar workshop (termasuk fitur *waiting list* jika kuota penuh).
   - Melakukan presensi kehadiran (scan QR code / validasi lokasi).
   - Melihat riwayat kegiatan dan mengunduh sertifikat yang telah diterbitkan.
2. **Humas UNAND**
   - Mengelola data workshop (jadwal, kuota, pembicara, materi).
   - Mengelola pendaftaran peserta & daftar hadir.
   - Mengajukan permohonan penerbitan sertifikat ke pimpinan.
   - Mengakses dashboard dan laporan kegiatan workshop.
3. **Sekretariat Rektor**
   - Memverifikasi pengajuan sertifikat dari Humas UNAND.
   - Melakukan koreksi draft sertifikat sebelum diajukan ke Rektor.
   - Meneruskan draft sertifikat yang telah valid kepada Rektor.
4. **Rektor**
   - Meninjau pengajuan sertifikat.
   - Memberikan persetujuan akhir (*approval*).
   - Membubuhkan Tanda Tangan Elektronik (TTE) pada sertifikat.
5. **Mitra**
   - Melihat workshop yang diselenggarakan bersama mitra terkait.
   - Mengakses data dan laporan peserta workshop terkait.

---

## 5. Modul Sistem yang Perlu Disiapkan di Frontend

1. **Autentikasi & Akun**: Halaman Login, Register (Peserta), Profil, Ganti Password.
2. **Manajemen Pengguna & Role**: Manajemen user & hak akses (Humas/Admin).
3. **Katalog & Kegiatan Workshop**: Daftar workshop publik, detail kegiatan, filter kategori/tanggal.
4. **Manajemen Mitra**: Data profil instansi mitra kerja sama.
5. **Manajemen Gedung & Ruangan**: Data lokasi penyelenggaraan workshop UNAND.
6. **Pendaftaran Peserta**: Form registrasi, status tiket/pendaftaran, status waiting list.
7. **Presensi Kehadiran**: Scanner QR Code dinamis dan deteksi koordinat GPS (geolocation).
8. **Template & Penerbitan Sertifikat**: Desain template sertifikat, nomor seri otomatis.
9. **Koreksi & Persetujuan Sertifikat**: Alur review sertifikat oleh Sekretariat Rektor.
10. **Tanda Tangan Elektronik (TTE)**: Approval dan validasi tanda tangan Rektor.
11. **Dashboard & Laporan**: Grafik statistik peserta, cetak laporan kegiatan PDF/Excel.
12. **Verifikasi Sertifikat (Publik)**: Halaman publik pengecekan keaslian nomor sertifikat.

---

## 6. Fitur Lanjutan yang Perlu Diperhatikan
- **QR Code Dinamis**: Kode QR presensi yang berubah secara periodik (refresh token) untuk mencegah kecurangan.
- **Validasi Lokasi (Geofencing)**: Browser Geolocation API untuk memverifikasi peserta berada di radius ruangan workshop.
- **Waiting List**: Antrean otomatis jika kuota workshop penuh; jika ada peserta yang batal, peserta waiting list mendapat kuota.
- **Verifikasi Sertifikat**: QR code di sertifikat yang jika di-scan mengarah ke halaman verifikasi publik.

Untuk referensi kontrak endpoint lengkap, silakan baca dokumentasi di file `../docs/api-contract.md`.


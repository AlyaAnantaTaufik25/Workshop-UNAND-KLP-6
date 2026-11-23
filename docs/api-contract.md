# Kontrak REST API - SIM Workshop Universitas Andalas (UNAND)

Dokumen ini mendefinisikan kontrak antarmuka API antara backend dan frontend.

- **Base URL**: `http://localhost:5000/api/v1`
- **Format Data**: JSON (`Content-Type: application/json`)
- **Autentikasi**: Bearer Token (JWT) pada header `Authorization: Bearer <token>`

---

## 1. Standar Format Respons JSON

### A. Respons Berhasil (HTTP 200 / 201)
```json
{
  "success": true,
  "message": "Operasi berhasil dilakukan",
  "data": {}
}
```

### B. Respons Gagal (HTTP 400 / 401 / 403 / 404 / 422 / 500)
```json
{
  "success": false,
  "message": "Deskripsi kesalahan yang terjadi",
  "errors": [
    "Detail pesan error atau validasi field"
  ]
}
```

---

## 2. Status Endpoint

- `[ACTIVE]`: Endpoint telah diimplementasikan dan dapat diuji langsung saat ini.
- `[PLANNED]`: Endpoint dalam rencana pengembangan sesuai roadmap fitur.

---

## 3. Daftar Endpoint API

### 3.1. Sistem & Health Check

| Method | Endpoint | Status | Deskripsi | Akses |
|---|---|---|---|---|
| `GET` | `/api/v1/health` | **[ACTIVE]** | Memeriksa status kesehatan server dan koneksi MySQL | Publik |
| `GET` | `/` | **[ACTIVE]** | Informasi umum server API | Publik |

#### Contoh Respon `GET /api/v1/health`:
```json
{
  "success": true,
  "message": "Sistem Informasi Manajemen Workshop UNAND API siap beroperasi",
  "data": {
    "app": "SIM Workshop UNAND API",
    "version": "1.0.0",
    "status": "healthy",
    "environment": "development",
    "timestamp": "2026-10-29T10:30:00.000Z",
    "uptimeSeconds": 45,
    "database": {
      "status": "connected",
      "message": "Koneksi ke MySQL aktif",
      "host": "127.0.0.1",
      "port": 3306,
      "database": "sim_workshop_unand"
    }
  }
}
```

---

### 3.2. Modul Autentikasi (`/auth`)

| Method | Endpoint | Status | Deskripsi | Akses |
|---|---|---|---|---|
| `GET` | `/api/v1/auth` | **[ACTIVE]** | Cek status modul auth | Publik |
| `POST` | `/api/v1/auth/register` | **[ACTIVE]** | Registrasi akun peserta baru | Publik |
| `POST` | `/api/v1/auth/login` | **[ACTIVE]** | Login pengguna (semua role) & perolehan JWT | Publik |
| `GET` | `/api/v1/auth/me` | **[ACTIVE]** | Mengambil profil user yang sedang login | Authenticated |
| `POST` | `/api/v1/auth/logout` | **[ACTIVE]** | Logout & invalidasi token/sesi | Authenticated |

---

### 3.3. Modul Pengguna & Role (`/users` & `/roles`)

| Method | Endpoint | Status | Deskripsi | Akses |
|---|---|---|---|---|
| `GET` | `/api/v1/roles` | **[ACTIVE]** | Daftar 5 role sistem | Humas |
| `GET` | `/api/v1/users` | **[ACTIVE]** | Daftar pengguna sistem dengan filter role | Humas |
| `POST` | `/api/v1/users` | **[ACTIVE]** | Tambah pengguna internal/mitra baru | Humas |
| `GET` | `/api/v1/users/:id` | **[ACTIVE]** | Detail pengguna | Humas, Owner |
| `PUT` | `/api/v1/users/:id` | **[ACTIVE]** | Update data pengguna | Humas, Owner |
| `DELETE` | `/api/v1/users/:id` | **[ACTIVE]** | Nonaktifkan akun pengguna | Humas |

---

### 3.4. Modul Kegiatan Workshop (`/workshops`)

| Method | Endpoint | Status | Deskripsi | Akses |
|---|---|---|---|---|
| `GET` | `/api/v1/workshops` | **[ACTIVE]** | Katalog daftar workshop publik (pagination, filter) | Publik |
| `GET` | `/api/v1/workshops/:id` | **[ACTIVE]** | Detail workshop, jadwal, pembicara, kuota | Publik |
| `POST` | `/api/v1/workshops` | **[ACTIVE]** | Membuat kegiatan workshop baru | Humas |
| `PUT` | `/api/v1/workshops/:id` | **[ACTIVE]** | Memperbarui informasi workshop | Humas |
| `DELETE` | `/api/v1/workshops/:id` | **[ACTIVE]** | Membatalkan/menghapus workshop | Humas |

---

### 3.5. Modul Gedung & Ruangan (`/locations`)

| Method | Endpoint | Status | Deskripsi | Akses |
|---|---|---|---|---|
| `GET` | `/api/v1/locations` | **[ACTIVE]** | Daftar gedung dan ruangan workshop UNAND | Publik / Humas |
| `POST` | `/api/v1/locations` | **[ACTIVE]** | Tambah lokasi (termasuk koordinat GPS radius) | Humas |
| `PUT` | `/api/v1/locations/:id` | **[ACTIVE]** | Update data ruangan/gedung | Humas |

---

### 3.6. Modul Mitra (`/partners`)

| Method | Endpoint | Status | Deskripsi | Akses |
|---|---|---|---|---|
| `GET` | `/api/v1/partners` | **[ACTIVE]** | Daftar instansi mitra workshop | Humas / Mitra |
| `POST` | `/api/v1/partners` | **[ACTIVE]** | Mendaftarkan profil mitra kerja sama baru | Humas |
| `GET` | `/api/v1/partners/:id/workshops` | **[ACTIVE]** | Daftar kegiatan workshop yang melibatkan mitra | Mitra / Humas |

---

### 3.7. Modul Pendaftaran Workshop & Waiting List (`/registrations`)

| Method | Endpoint | Status | Deskripsi | Akses |
|---|---|---|---|---|
| `POST` | `/api/v1/registrations` | **[ACTIVE]** | Mendaftar workshop (tiket atau waiting list) | Peserta |
| `GET` | `/api/v1/registrations/my` | **[ACTIVE]** | Riwayat workshop yang didaftarkan oleh peserta | Peserta |
| `GET` | `/api/v1/registrations/workshop/:workshopId` | **[ACTIVE]** | Daftar seluruh peserta pendaftar kegiatan | Humas |
| `PATCH` | `/api/v1/registrations/:id/cancel` | **[ACTIVE]** | Pembatalan pendaftaran (alokasi ke waiting list) | Peserta / Humas |

---

### 3.8. Modul Presensi Kehadiran (`/attendance`)

| Method | Endpoint | Status | Deskripsi | Akses |
|---|---|---|---|---|
| `POST` | `/api/v1/attendance/generate-qr` | **[ACTIVE]** | Membuat token QR Code dinamis per sesi | Humas |
| `POST` | `/api/v1/attendance/check-in` | **[ACTIVE]** | Submit presensi (validasi token QR & GPS Geofence) | Peserta |
| `GET` | `/api/v1/attendance/workshop/:workshopId` | **[ACTIVE]** | Rekap kehadiran peserta per workshop | Humas |

---

### 3.9. Modul Sertifikat & Tanda Tangan Elektronik (`/certificates`)

| Method | Endpoint | Status | Deskripsi | Akses |
|---|---|---|---|---|
| `POST` | `/api/v1/certificates/templates` | **[ACTIVE]** | Mengunggah template desain sertifikat | Humas |
| `POST` | `/api/v1/certificates/submissions` | **[ACTIVE]** | Pengajuan draft sertifikat kegiatan | Humas |
| `PATCH` | `/api/v1/certificates/submissions/:id/verify` | **[PLANNED]** | Koreksi & verifikasi draft sertifikat | Sekretariat Rektor |
| `POST` | `/api/v1/certificates/submissions/:id/sign` | **[ACTIVE]** | Approval akhir & pembubuhan TTE sertifikat | Rektor |
| `GET` | `/api/v1/certificates/my` | **[ACTIVE]** | Mengunduh sertifikat milik peserta | Peserta |
| `GET` | `/api/v1/certificates/verify/:serialNumber` | **[ACTIVE]** | Verifikasi keabsahan nomor sertifikat | Publik |

---

### 3.10. Modul Dashboard & Laporan (`/reports`)

| Method | Endpoint | Status | Deskripsi | Akses |
|---|---|---|---|---|
| `GET` | `/api/v1/reports/summary` | **[ACTIVE]** | Statistik ringkasan (workshop, peserta, rasio hadir) | Humas, Rektor |
| `GET` | `/api/v1/reports/workshops/:id/export` | **[ACTIVE]** | Export laporan kegiatan (PDF / Excel) | Humas, Sekretariat |


---

### 3.11. Endpoint Tambahan (sudah aktif)

| Method | Endpoint | Deskripsi | Akses |
|---|---|---|---|
| `PUT` | `/api/v1/auth/me` | Ubah profil sendiri | Authenticated |
| `PUT` | `/api/v1/auth/me/password` | Ubah kata sandi | Authenticated |
| `POST` | `/api/v1/auth/me/pin/verify` · `PUT /auth/me/pin` · `POST /auth/me/pin/reset` | PIN tanda tangan elektronik | Rektor, Mitra |
| `PATCH` | `/api/v1/workshops/:id/status` | Ubah status kegiatan / pendaftaran / presensi | Humas |
| `GET` | `/api/v1/registrations` | Peserta lintas kegiatan (mitra: kegiatan instansinya) | Humas, Mitra, Sekretariat, Rektor |
| `POST` | `/api/v1/attendance/upload` | Presensi online dengan unggah bukti | Peserta |
| `PATCH` | `/api/v1/attendance/:id/verify` | Terima / tolak bukti presensi | Humas, Mitra |
| `GET/PUT/DELETE` | `/api/v1/certificates/templates[/:id]` | Kelola template (mitra: miliknya) | Humas, Mitra |
| `GET` | `/api/v1/certificates/submissions[/:id]` | Daftar & detail pengajuan sertifikat | Humas, Mitra, Sekretariat, Rektor |
| `GET/POST` | `/api/v1/certificates/corrections` | Perbaikan sertifikat (peserta mengajukan) | Peserta, Humas, Mitra |
| `PATCH` | `/api/v1/certificates/corrections/:id/process` | `{action: proses|tolak|selesai}` | Humas, Mitra |
| `PATCH` | `/api/v1/certificates/corrections/:id/cancel` · `/corrections/read` | Batal / tandai dibaca | Peserta |
| `GET` | `/api/v1/certificates/replacements` | Dokumen pengganti hasil perbaikan | Sekretariat, Rektor, Humas, Mitra |
| `POST` | `/api/v1/certificates/replacements/:id/sign` | TTE ulang dokumen pengganti | Rektor |
| `GET` | `/api/v1/reports/workshops` · `/reports/daily` | Laporan per kegiatan & rekap presensi harian | Humas, Mitra, Sekretariat, Rektor |
| `GET` · `PATCH` | `/api/v1/notifications` · `/notifications/read` | Notifikasi user & role | Authenticated |

Alur status pengajuan sertifikat: `menunggu-mitra` → (TTE Mitra) → `menunggu-rektor` → (TTE Rektor) → `diterbitkan`. Saat terbit, sertifikat individual otomatis dibuat untuk setiap peserta dengan presensi `hadir`.

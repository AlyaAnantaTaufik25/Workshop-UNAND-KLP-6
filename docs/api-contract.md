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
| `GET` | `/api/v1/auth` | **[PLANNED]** | Cek status modul auth | Publik |
| `POST` | `/api/v1/auth/register` | **[PLANNED]** | Registrasi akun peserta baru | Publik |
| `POST` | `/api/v1/auth/login` | **[PLANNED]** | Login pengguna (semua role) & perolehan JWT | Publik |
| `GET` | `/api/v1/auth/me` | **[PLANNED]** | Mengambil profil user yang sedang login | Authenticated |
| `POST` | `/api/v1/auth/logout` | **[PLANNED]** | Logout & invalidasi token/sesi | Authenticated |

---

### 3.3. Modul Pengguna & Role (`/users` & `/roles`)

| Method | Endpoint | Status | Deskripsi | Akses |
|---|---|---|---|---|
| `GET` | `/api/v1/roles` | **[PLANNED]** | Daftar 5 role sistem | Humas |
| `GET` | `/api/v1/users` | **[PLANNED]** | Daftar pengguna sistem dengan filter role | Humas |
| `POST` | `/api/v1/users` | **[PLANNED]** | Tambah pengguna internal/mitra baru | Humas |
| `GET` | `/api/v1/users/:id` | **[PLANNED]** | Detail pengguna | Humas, Owner |
| `PUT` | `/api/v1/users/:id` | **[PLANNED]** | Update data pengguna | Humas, Owner |
| `DELETE` | `/api/v1/users/:id` | **[PLANNED]** | Nonaktifkan akun pengguna | Humas |

---

### 3.4. Modul Kegiatan Workshop (`/workshops`)

| Method | Endpoint | Status | Deskripsi | Akses |
|---|---|---|---|---|
| `GET` | `/api/v1/workshops` | **[PLANNED]** | Katalog daftar workshop publik (pagination, filter) | Publik |
| `GET` | `/api/v1/workshops/:id` | **[PLANNED]** | Detail workshop, jadwal, pembicara, kuota | Publik |
| `POST` | `/api/v1/workshops` | **[PLANNED]** | Membuat kegiatan workshop baru | Humas |
| `PUT` | `/api/v1/workshops/:id` | **[PLANNED]** | Memperbarui informasi workshop | Humas |
| `DELETE` | `/api/v1/workshops/:id` | **[PLANNED]** | Membatalkan/menghapus workshop | Humas |

---

### 3.5. Modul Gedung & Ruangan (`/locations`)

| Method | Endpoint | Status | Deskripsi | Akses |
|---|---|---|---|---|
| `GET` | `/api/v1/locations` | **[PLANNED]** | Daftar gedung dan ruangan workshop UNAND | Publik / Humas |
| `POST` | `/api/v1/locations` | **[PLANNED]** | Tambah lokasi (termasuk koordinat GPS radius) | Humas |
| `PUT` | `/api/v1/locations/:id` | **[PLANNED]** | Update data ruangan/gedung | Humas |

---

### 3.6. Modul Mitra (`/partners`)

| Method | Endpoint | Status | Deskripsi | Akses |
|---|---|---|---|---|
| `GET` | `/api/v1/partners` | **[PLANNED]** | Daftar instansi mitra workshop | Humas / Mitra |
| `POST` | `/api/v1/partners` | **[PLANNED]** | Mendaftarkan profil mitra kerja sama baru | Humas |
| `GET` | `/api/v1/partners/:id/workshops` | **[PLANNED]** | Daftar kegiatan workshop yang melibatkan mitra | Mitra / Humas |

---

### 3.7. Modul Pendaftaran Workshop & Waiting List (`/registrations`)

| Method | Endpoint | Status | Deskripsi | Akses |
|---|---|---|---|---|
| `POST` | `/api/v1/registrations` | **[PLANNED]** | Mendaftar workshop (tiket atau waiting list) | Peserta |
| `GET` | `/api/v1/registrations/my` | **[PLANNED]** | Riwayat workshop yang didaftarkan oleh peserta | Peserta |
| `GET` | `/api/v1/registrations/workshop/:workshopId` | **[PLANNED]** | Daftar seluruh peserta pendaftar kegiatan | Humas |
| `PATCH` | `/api/v1/registrations/:id/cancel` | **[PLANNED]** | Pembatalan pendaftaran (alokasi ke waiting list) | Peserta / Humas |

---

### 3.8. Modul Presensi Kehadiran (`/attendance`)

| Method | Endpoint | Status | Deskripsi | Akses |
|---|---|---|---|---|
| `POST` | `/api/v1/attendance/generate-qr` | **[PLANNED]** | Membuat token QR Code dinamis per sesi | Humas |
| `POST` | `/api/v1/attendance/check-in` | **[PLANNED]** | Submit presensi (validasi token QR & GPS Geofence) | Peserta |
| `GET` | `/api/v1/attendance/workshop/:workshopId` | **[PLANNED]** | Rekap kehadiran peserta per workshop | Humas |

---

### 3.9. Modul Sertifikat & Tanda Tangan Elektronik (`/certificates`)

| Method | Endpoint | Status | Deskripsi | Akses |
|---|---|---|---|---|
| `POST` | `/api/v1/certificates/templates` | **[PLANNED]** | Mengunggah template desain sertifikat | Humas |
| `POST` | `/api/v1/certificates/submissions` | **[PLANNED]** | Pengajuan draft sertifikat kegiatan | Humas |
| `PATCH` | `/api/v1/certificates/submissions/:id/verify` | **[PLANNED]** | Koreksi & verifikasi draft sertifikat | Sekretariat Rektor |
| `POST` | `/api/v1/certificates/submissions/:id/sign` | **[PLANNED]** | Approval akhir & pembubuhan TTE sertifikat | Rektor |
| `GET` | `/api/v1/certificates/my` | **[PLANNED]** | Mengunduh sertifikat milik peserta | Peserta |
| `GET` | `/api/v1/certificates/verify/:serialNumber` | **[PLANNED]** | Verifikasi keabsahan nomor sertifikat | Publik |

---

### 3.10. Modul Dashboard & Laporan (`/reports`)

| Method | Endpoint | Status | Deskripsi | Akses |
|---|---|---|---|---|
| `GET` | `/api/v1/reports/summary` | **[PLANNED]** | Statistik ringkasan (workshop, peserta, rasio hadir) | Humas, Rektor |
| `GET` | `/api/v1/reports/workshops/:id/export` | **[PLANNED]** | Export laporan kegiatan (PDF / Excel) | Humas, Sekretariat |


# Sistem Informasi Manajemen Workshop Universitas Andalas (UNAND)

Repositori ini berisi kode sumber aplikasi **Sistem Informasi Manajemen Workshop UNAND**, sebuah platform fullstack yang dirancang untuk mengelola seluruh siklus kegiatan workshop di lingkungan Universitas Andalas, mulai dari katalog acara, pendaftaran peserta, presensi berbasis QR dinamis & geofencing, hingga alur verifikasi dan tanda tangan elektronik (TTE) sertifikat oleh pimpinan.

Proyek ini menggunakan arsitektur **Monorepo** yang memisahkan folder `backend/` dan `frontend/` secara independen agar masing-masing pengembang dapat bekerja secara paralel dan efisien.

---

## 👥 Aktor Utama Sistem

Sistem mendukung 5 aktor dengan peran dan wewenang yang berbeda:

1. **Peserta**: Mahasiswa, dosen, atau masyarakat umum yang mendaftar, mengikuti kegiatan, melakukan presensi, dan mengunduh sertifikat.
2. **Humas UNAND**: Penyelenggara workshop, administrator kegiatan, verifikator pendaftar, dan pengaju sertifikat.
3. **Sekretariat Rektor**: Verifikator internal yang memeriksa, mengoreksi, dan menyetujui draf sertifikat sebelum diajukan ke pimpinan tertinggi.
4. **Rektor**: Pimpinan universitas yang memberikan persetujuan akhir (*final approval*) dan pembubuhan Tanda Tangan Elektronik (TTE) pada sertifikat.
5. **Mitra**: Pihak eksternal/internal kerja sama yang berkolaborasi dalam pelaksanaan workshop dan dapat memantau data kegiatan terkait.

---

## 📁 Struktur Direktori Repositori

```text
workshop-unand/
├── backend/                             # Ruang kerja Backend Developer (Node.js & Express)
│   ├── database/
│   │   ├── migrations/                  # Berkas skema migrasi database MySQL
│   │   └── seeders/                     # Berkas data awal (seed) pengembangan
│   ├── src/
│   │   ├── config/                      # Konfigurasi aplikasi dan koneksi MySQL (mysql2/promise)
│   │   │   ├── app.config.js
│   │   │   └── database.js
│   │   ├── middlewares/                 # Middleware auth, role, validasi, 404, dan errorHandler
│   │   │   ├── auth.middleware.js
│   │   │   ├── role.middleware.js
│   │   │   ├── validation.middleware.js
│   │   │   ├── notFound.middleware.js
│   │   │   └── errorHandler.middleware.js
│   │   ├── modules/                     # Arsitektur modular berbasis fitur
│   │   │   ├── attendance/              # Presensi QR & Geofencing
│   │   │   ├── auth/                    # Autentikasi & JWT
│   │   │   ├── certificates/            # Template, Pengajuan, TTE Sertifikat
│   │   │   ├── locations/               # Gedung & Ruangan
│   │   │   ├── partners/                # Manajemen Mitra
│   │   │   ├── registrations/           # Pendaftaran & Waiting List
│   │   │   ├── reports/                 # Laporan & Dashboard
│   │   │   ├── roles/                   # Role & Hak Akses
│   │   │   ├── users/                   # Manajemen Pengguna
│   │   │   └── workshops/               # Manajemen Kegiatan Workshop
│   │   ├── routes/                      # Aggregator rute API (/api/v1)
│   │   │   └── api.routes.js
│   │   ├── utils/                       # Response formatter & logger
│   │   │   ├── logger.util.js
│   │   │   └── response.util.js
│   │   ├── app.js                       # Konfigurasi Express, CORS, middleware, rute
│   │   └── server.js                    # Entry point listener & graceful shutdown
│   ├── tests/                           # Pengujian otomatis backend
│   │   └── health.test.js               # Smoke test health-check API
│   ├── .env.example                     # Contoh environment variable backend
│   └── package.json                     # Dependency & scripts npm backend
│
├── frontend/                            # Ruang kerja Frontend Developer
│   ├── .env.example                     # Contoh environment variable frontend
│   └── README.md                        # Panduan inisialisasi framework, role, modul & kontrak API
│
├── docs/                                # Dokumentasi Proyek
│   └── api-contract.md                  # Spesifikasi kontrak RESTful API lengkap
│
├── .gitignore                           # Git ignore terpusat untuk backend & frontend
└── README.md                            # Panduan utama proyek & kolaborasi
```

---

## 🛠️ Pembagian Tanggung Jawab Tim

| Pengembang | Folder Tanggung Jawab | Deskripsi Tanggung Jawab |
|---|---|---|
| **Backend Developer** | `backend/`, `docs/api-contract.md` | Membangun RESTful API, skema MySQL, enkripsi/TTE, validasi input, middleware, dan mengupdate dokumen kontrak API. |
| **Frontend Developer** | `frontend/` | Menginisialisasi framework UI (React/Vite), membangun komponen antarmuka, manajemen state, integrasi API, dan UX responsif. |

---

## 🚀 Panduan Menjalankan Backend

### Prasyarat
- **Node.js** (versi 18.x atau yang lebih baru)
- **npm** (versi 9.x atau yang lebih baru)
- **MySQL** (melalui XAMPP, MySQL Server, atau Docker)

### Langkah Instalasi & Menjalankan

1. **Buka terminal dan masuk ke folder `backend`:**
   ```bash
   cd backend
   ```

2. **Instal dependensi:**
   ```bash
   npm install
   ```

3. **Siapkan Environment Variable:**
   Salin file `.env.example` menjadi `.env`:
   ```bash
   # Di Windows PowerShell:
   Copy-Item .env.example .env

   # Atau di Linux / macOS / Git Bash:
   cp .env.example .env
   ```

4. **Setup Database MySQL Lokal:**
   - Jalankan MySQL (misalnya nyalakan service MySQL di kontrol panel XAMPP).
   - Buat database baru bernama `sim_workshop_unand` melalui phpMyAdmin atau MySQL CLI:
     ```sql
     CREATE DATABASE sim_workshop_unand CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
     ```
   - Pastikan konfigurasi di `backend/.env` telah sesuai:
     ```env
     DB_HOST=127.0.0.1
     DB_PORT=3306
     DB_USER=root
     DB_PASSWORD=
     DB_NAME=sim_workshop_unand
     ```

5. **Jalankan Backend Server:**
   - Mode Development (dengan hot reload menggunakan nodemon):
     ```bash
     npm run dev
     ```
   - Mode Production:
     ```bash
     npm start
     ```

6. **Output Terminal yang Diharapkan:**
   ```text
   ========================================================
      SISTEM INFORMASI MANAJEMEN WORKSHOP UNIVERSITAS ANDALAS
      Backend REST API Service
   ========================================================
   [Database] Terhubung ke MySQL: 127.0.0.1:3306 (sim_workshop_unand)
   [Server] Berjalan di port : http://localhost:5000
   [Health] Cek kesehatan API : http://localhost:5000/api/v1/health
   [Env]    Environment     : development
   --------------------------------------------------------
   ```

---

## 🔍 Cara Menguji Endpoint Health

1. **Melalui Browser:**
   Buka URL berikut:
   ```text
   http://localhost:5000/api/v1/health
   ```

2. **Melalui cURL / Terminal:**
   ```bash
   curl -X GET http://localhost:5000/api/v1/health
   ```

3. **Melalui Pengujian Otomatis Bawaan:**
   Di terminal folder `backend`:
   ```bash
   npm test
   ```

---

## 🎨 Panduan Memulai untuk Frontend Developer

1. Buka folder `frontend/` dan baca file [`frontend/README.md`](file:///frontend/README.md).
2. Tentukan framework yang disepakati (disarankan **React.js + Vite**).
3. Jalankan inisialisasi di dalam folder `frontend/`:
   ```bash
   cd frontend
   npm create vite@latest . -- --template react
   npm install
   ```
4. Salin `.env.example` menjadi `.env` dan gunakan variabel:
   ```env
   VITE_API_BASE_URL=http://localhost:5000/api/v1
   ```
5. Mulai proses *slicing UI* dan integrasi ke backend API.

---

## 🌿 Aturan Branch & Kolaborasi Git

Untuk menjaga kebersihan riwayat Git dan mencegah konflik kode:

### 1. Struktur Branch
- `main`: Branch produksi yang stabil dan hanya berisi kode yang sudah diuji & ditinjau.
- `develop`: Branch integrasi utama seluruh fitur baru.
- `feature/be-<nama-fitur>`: Branch untuk pengembangan fitur backend (misal: `feature/be-auth`, `feature/be-workshops`).
- `feature/fe-<nama-fitur>`: Branch untuk pengembangan fitur frontend (misal: `feature/fe-login-ui`, `feature/fe-catalog`).
- `bugfix/<nama-bug>`: Branch untuk perbaikan kendala tertentu.

### 2. Standar Commit Message
Gunakan konvensi *Conventional Commits*:
- `feat: tambah modul registrasi peserta`
- `fix: perbaiki validasi token jwt pada middleware`
- `docs: perbarui spesifikasi endpoint di api-contract`
- `chore: update dependencies backend`

### 3. Alur Kerja Pull Request (PR)
1. Selalu buat branch baru dari `develop`.
2. Lakukan commit teratur dan jelas.
3. Push branch ke GitHub dan ajukan Pull Request ke branch `develop`.
4. Review oleh rekan tim sebelum di-merge.

